<template>
  <div class="robin">
    <h1>This is a Robin page</h1>
    <br>
    <button id="adddb" @click="addRandomDocument()">Ajouter document</button>
    <br>
    <div>
      <h2>Database Documents</h2>
      <button @click="syncfrom()">Synchroniser depuis la base de données</button>
      <br>
      <button @click="syncto()">Synchroniser vers la base de données</button>
      <br>
      <ul>
        <li v-for="doc in data" :key="doc.id" :id="doc.id">

          <pre>{{ JSON.stringify(filterDoc(doc.doc), null, 2) }}</pre>
          <input type="text" :name="'article-' + doc.id"></input>
          <br>
          <button @click="modify(doc.id)">Modifier</button>
          <br>
          <h3>Pièce jointe</h3>
          <input type="file" :name="'file-' + doc.id" :id="'file-' + doc.id">
          <br>
          <button @click="addFile(doc.id)">Ajouter une pièce jointe</button>
          <br>

          <br>
          <button @click="removeDocument(doc.id)">Supprimer</button>
          <br>
          <div v-if="doc.doc._attachments">
            <div v-for="(attachment, name) in doc.doc._attachments" :key="name">
              <img :src="attachment.dataUrl" :alt="name.toString()" style="max-width: 200px; max-height: 200px;">
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, resolveTransitionHooks } from 'vue'
import PouchDB from 'pouchdb'; // Importe PouchDB
import findPlugin from 'pouchdb-find'; // Importe le plugin PouchDB Find
PouchDB.plugin(findPlugin); // Utilise le plugin PouchDB Find
export default {
  name: 'Robin',
  data() {
    return {
      count: 1, // Initialise le compteur
      number: 1,
      localdb: null as PouchDB.Database<{}> | null, // Stocke l'instance de la base de données
      findPlugin: null as PouchDB.Plugin | null, // Stocke l'instance du plugin PouchDB Find
      data: [] as any[]
    };
  },
  methods: {
    // Fonction pour incrémenter le compteur
    fetchData() {
      console.log('fetchData')
      if (this.localdb) {
        this.localdb.allDocs({
          include_docs: true,
          attachments: true
        }).then((result: any) => {
          this.data = result.rows.map((row: any) => {
            if (row.doc._attachments) {
              for (const key in row.doc._attachments) {
                const attachment = row.doc._attachments[key];
                row.doc._attachments[key].dataUrl = `data:${attachment.content_type};base64,${attachment.data}`;
              }
            }
            return row;
          });
          console.log('Data fetched:', this.data); // Added console log for debugging
        }).catch((error: any) => {
          console.log('fetchData error', error);
        });
      }
    },
    // Initialise la base de données PouchDB
    initDB() {
      try {
        const dbName = 'motorbikedb';
        const db = new PouchDB(dbName);
        this.localdb = db;
        console.log('Base de données initialisée :' + dbName);
        this.createIndex();
        this.fetchData();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error);
      }
    },
    // Fonction pour ajouter un document à la base de données PouchDB
    addFile(id: any) {
      const fileInput = document.querySelector<HTMLInputElement>(`#file-${id}`);
      const file = fileInput?.files?.[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result?.toString().split(',')[1]; // Extraire la partie base64
          this.localdb?.get(id).then((doc: any) => {
            const attachment = {
              _attachments: {
                ...doc._attachments,
                [file.name]: {
                  content_type: file.type,
                  data: base64Data
                }
              }
            };
            Object.assign(doc, attachment);
            return this.localdb?.put(doc);
          }).then((response) => {
            console.log('Document mis à jour avec succès', response);
            this.fetchData();
          }).catch((error) => {
            console.error('Erreur lors de la mise à jour du document :', error);
          });
        };
        reader.readAsDataURL(file);
      }
    },
    addRandomDocument: function () {
      this.localdb?.post(this.getFakeDoc())
        // Gère la promesse de succès
        .then((Response) => {
          // Affiche un message de confirmation dans la console
          console.log('Document ajouté avec plaisir', Response);
          // Appelle la fonction fetchData pour actualiser la liste des documents
          this.fetchData();
        })
        // Gère la promesse d'erreur
        .catch((error) => {
          // Affiche un message d'erreur dans la console
          console.error('Erreur lors de l\'ajout du document :', error);
        });
    },
    // Fonction pour supprimer un document dans la base de données PouchDB
    removeDocument(id: string) {
      this.localdb?.get(id)
        .then((doc) => {
          return this.localdb?.remove(doc);
        })
        .then((response) => {
          console.log('Document supprimé avec succès', response);
          // Rafraîchir la liste des documents après la suppression
          this.fetchData();
        })
        .catch((error) => {
          if (error.name === 'not_found') {
            console.log('Le document a déjà été supprimé ou n\'existe pas');
            // Rafraîchir la liste des documents pour s'assurer qu'elle est à jour
            this.fetchData();
          }
        });
    },
    getFakeDoc() {
      return {
        "idCommande": this.count++,
        "produits": [
          {
            "nomProduit": "Veste de moto",
            "marque": "Alpinestar",
            "taille": "XL",
            "couleur": "Blanc",
            "quantite": this.number++,
            "prix": 450.00
          }
        ],
        "dateCommande": "2024-09-28"
      }
    },
    modify(docId: string) {
      // Trouve l'élément correspondant à cet ID
      const input = document.querySelector<HTMLInputElement>(`li[id="${docId}"] input`);

      if (!input || !this.localdb) {
        console.error("Input ou base de données introuvable");
        return;
      }

      const newArticleName = input.value;

      // Récupère le document dans la base de données
      this.localdb.get(docId)
        .then((doc: any) => {
          // Modifie le nom du produit
          if (doc.produits && doc.produits.length > 0) {
            doc.produits[0].nomProduit = newArticleName; // Change le nom du premier produit
          }
          // Sauvegarde les modifications
          return this.localdb?.put(doc);
        })
        .then(() => {
          console.log("Document modifié avec succès !");
          this.fetchData(); // Actualise la liste des documents
        })
        .catch((error: any) => {
          console.error("Erreur lors de la modification du document :", error);
        });
    },
    syncto() {
      console.log("sync to remote database")
      try {
        const remoteDb = 'http://admin:admin@localhost:5984/motorbikedb'
        this.localdb?.replicate.to(remoteDb, {
          live: true,
          retry: true
        }).on('complete', function () {
          console.log('Remote to local replication complete');
        }).on('error', function (err) {
          console.error('Remote to local replication error:', err);
        });
        this.fetchData()
      }
      catch (error) {
        console.error('Erreur lors de la synchronisation vers la base de données :', error);
      }
    },
    syncfrom() {
      console.log("sync from remote database")
      try {
        const remoteDb = 'http://admin:admin@localhost:5984/motorbikedb'
        this.localdb?.replicate.from(remoteDb, {
          live: true,
          retry: true
        }).on('error', function (err) {
          console.log('sync error', err)
        });

        this.fetchData()

      }
      catch (error) {
        console.error('Erreur lors de la synchronisation de la base de données :', error);
      }
    },
    createIndex() {
      this.localdb?.createIndex({
        index: { fields: ['idCommande'] }
      }).then(function (result) {
        console.log('Index créé avec succès', result);
      }).catch(function (error) {
        console.error('Erreur lors de la création de l\'index :', error);
      });
    },
    queryIndex() {
      this.localdb?.find({
        selector: { idCommande: { $eq: 1 } }
      }).then(function (result) {
        console.log('Résultat de la requête :', result);
      }).catch(function (error) {
        console.error('Erreur lors de la requête :', error);
      });
    },
    filterDoc(doc: any) {
      const { _attachments, ...filteredDoc } = doc;
      return filteredDoc;
    }

  },
  mounted() {
    // Appelle initDB lors du montage du composant
    this.initDB();
  }
};
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}

#count {
  cursor: pointer;
  padding: 10px;
  background-color: lightblue;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

#count:hover {
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #ff4136;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #ff7266;
}

.document {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.document h3 {
  margin-top: 0;
}

.document p {
  margin-top: 10px;
}

.document button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #ff4136;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.document button:hover {
  background-color: #ff7266;
}

#count {
  cursor: pointer;
  padding: 10px;
  background-color: lightblue;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

#count:hover {
  background-color: hsla(160, 100%, 37%, 1);
  color: white;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

pre {
  background-color: #f0f0f0;
  /* Light gray background for contrast */
  border: 1px solid #ccc;
  /* Subtle border */
  border-radius: 8px;
  /* Rounded corners */
  padding: 15px;
  /* More padding for better spacing */
  font-family: 'Courier New', Courier, monospace;
  /* Monospaced font */
  font-size: 14px;
  /* Consistent font size */
  line-height: 1.6;
  /* Increased line height for readability */
  overflow-x: auto;
  /* Horizontal scroll for long lines */
  color: #333;
  /* Dark text color for contrast */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Subtle shadow for depth */
}

button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #ff4136;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #ff7266;
}
</style>

<template>
  <div class="robin">
    <h1>This is a Robin page</h1>
    <br>
    <button id="adddb" @click="addDocument()">Ajouter document</button>
    <br>
    <div>
      <h2>Database Documents</h2>
      <button @click="syncfrom()">Synchroniser depuis la base de données</button>
      <br>
      <button @click="syncto()">Synchroniser vers la base de données</button>
      <button @click="queryIndex()">bouton Index</button>
      <ul>
        <li v-for="doc in data" :key="doc.id" :id="doc.id">
          <pre>{{ JSON.stringify(doc.doc, null, 2) }}</pre>
          <input type="text" name="article ${}"></input>
          <br>
          <button @click="modify(doc.id)">Modifier</button>
          <br>
          <button @click="removeDocument(doc.id)">Delete</button>
          <br>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, resolveTransitionHooks } from 'vue'
import PouchDB from 'pouchdb'; // Importe PouchDB
import findPlugin from 'pouchdb-find'; // Importe le plugin PouchDB Find

export default {
  name: 'Robin',
  data() {
    return {
      count: 1, // Initialise le compteur
      localdb: null as PouchDB.Database<{}> | null, // Stocke l'instance de la base de données
      findPlugin: null as PouchDB.Plugin | null, // Stocke l'instance du plugin PouchDB Find
      data: [] as any[]
    };
  },
  methods: {
    // Fonction pour incrémenter le compteur
    incrementCount() {
      this.count++;
    },
    fetchData() {
      console.log('fetchData')
      if (this.localdb) {
        this.localdb.allDocs({
          include_docs: true,
          attachments: true
        }).then((result: any) => {
          this.data = result.rows;
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
        this.fetchData();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error);
      }
    },
    // Fonction pour ajouter un document à la base de données PouchDB
    addDocument() {
      // Utilise la méthode post de PouchDB pour ajouter un document
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
            "quantite": 2,
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
      console.log("syncto")
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
      console.log("syncfrom")
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
    }
  },
  mounted() {
    // Appelle initDB lors du montage du composant
    this.initDB();
    this.addDocument();
    // this.createIndex();
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

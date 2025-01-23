<template>
  <div class="robin">
    <h1>This is a Robin page</h1>
    <br>
    <button id="adddb" @click="addRandomDocument()">Ajouter document</button>
    <br>
    <button id="adddb" @click="add100Randomdocuments()">Ajouter 100 documents</button>
    <br>
    <button id="adddb" @click="deleteAllDocuments()">Supprimer tous les documents</button>
    <div>
      <input type="text" v-model="searchQuery" placeholder="Rechercher par ID" />
      <input type="submit" @click=searchIndex() value="Rechercher" />
      <ul>
        <li v-for="doc in filteredDocuments" :key="doc._id">
          {{ doc.id }} - {{ doc.title }}
        </li>
      </ul>
      fin du résultat
    </div>


    <br>
    <div>
      <h2>Database Documents</h2>
      <button @click="syncfrom()">Synchroniser depuis la base de données</button>
      <br>
      <button @click="syncto()">Synchroniser vers la base de données</button>
      <br>
      <div v-if="selectedDoc" class="selected-document">
        <h2>Détails du Document {{ selectedDoc.id }}</h2>
        <div>
          <pre>{{ JSON.stringify(filterDoc(editDoc.doc), null, 2) }}</pre>
          <h3>Ajouts</h3>
          <input type="file" :name="'file-' + selectedDoc.id" :id="'file-' + selectedDoc.id" />
          <br />
          <button @click="addFile(selectedDoc.id)">Ajouter une pièce jointe</button>
          <br />
          <h3>Modifications</h3>
          <input type="text" v-model="editDoc.doc.produits[0].nomProduit" />
          <br />
          <button @click="modify(selectedDoc.id)">Modifier</button>
          <br />

          <button @click="removeDocument(selectedDoc.id)">Supprimer</button>
          <br />

          <div v-if="selectedDoc.doc._attachments">
            <div v-for="(attachment, name) in selectedDoc.doc._attachments" :key="name">
              <img :src="attachment.dataUrl" :alt="name.toString()" style="max-width: 200px; max-height: 200px;" />
              <button @click="removeImage(selectedDoc.id, name)">Supprimer l'image</button>
            </div>
          </div>
        </div>
      </div>
      <ul class="document-list">
        <li v-for="doc in data" :key="doc.id" :id="doc.id" class="document-item" @click="selectDocument(doc)">
          <div class="document-summary">
            <h3>Document {{ doc.id }}</h3>
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
      selectedDoc: null as any, // Stocke le document sélectionné
      editDoc: null as any, // Stocke le document sélectionné
      localdb: null as PouchDB.Database<{}> | null, // Stocke l'instance de la base de données
      data: [] as any[],
      searchQuery: '',
      filteredDocuments: [] as any,
    };
  },

  methods: {
    checkIndexes() {
      this.localdb?.getIndexes().then((indexes) => {
        console.log('Indexes existants :', indexes);
      }).catch((error) => {
        console.error('Erreur lors de la récupération des index :', error);
      });
    },
    async searchIndex() {
      if ((this.searchQuery.trim() !== '')) {
        try {
          // Simplified index finding
          const indexes = await this.localdb?.getIndexes();
          console.log('Indexes disponibles :', indexes);
          // Look for an index on 'id_commande'
          const idCommandeIndex = indexes?.indexes.find(
            (index: { def: { fields: any[]
              ; }; }) => index.def.fields.some((field) => field.id_commande)
          );
          console.log('Index trouvé :', idCommandeIndex);

          if (idCommandeIndex) {
            // Use the index for your search
            const results = await this.localdb?.find({
              selector: { id_commande: this.searchQuery },
              use_index: idCommandeIndex.name
            });
          } else {
            console.warn('No index found for id_commande');
            // Fallback to a full scan if no index exists
            const results = await this.localdb?.find({
              selector: { id_commande: this.searchQuery }
            });
          }
        } catch (error) {
          console.error('Error searching indexes:', error);
        }
      } else {
        console.warn('Invalid search query:', this.searchQuery);
      }
    },
    // async searchDocuments() {
    //   try {
    //     if (this.searchQuery.trim() !== '') {
    //       console.log('Recherche en cours pour :', this.searchQuery);

    //       // Récupérer les index disponibles
    //       const indexes = await this.localdb?.getIndexes();
    //       console.log('Indexes disponibles :', indexes);

    //       // Trouver l'index approprié pour le champ "id"
    //       const index = indexes?.indexes.find((idx: { def: { fields: any[]; }; }) => idx.def.fields.some(field => field.id));

    //       if (!index) {
    //         throw new Error('Aucun index approprié trouvé pour le champ "id"');
    //       }

    //       console.log('Utilisation de l\'index :', index.name);

    //       // Recherche avec un filtre sur l'attribut indexé "id"
    //       const result = await this.localdb?.find({
    //         selector: {
    //           id_commande: { $regex: new RegExp(this.searchQuery, 'i') }, // Recherche partielle
    //         },
    //         use_index: index.name // Utiliser l'index trouvé
    //       });

    //       console.log('Résultat brut de la recherche :', result);
    //       this.filteredDocuments = result?.docs; // Mettez à jour les documents filtrés
    //       console.log('Documents filtrés :', this.filteredDocuments);

    //       this.checkIndexes();
    //     }
    //   } catch (error) {
    //     console.error('Erreur lors de la recherche :', error);
    //   }
    // },

    // searchIndex(event: Event) {
    //   event.preventDefault()
    //   console.log("cocoutine")
    //   this.localdb
    //     ?.find({
    //       selector: { id_commande: { $regex: new RegExp(this.searchQuery, 'i') } }
    //     })
    //     .then((res: any) => {
    //       this.filteredDocuments = res.docs.map((doc: any) => ({
    //         ...doc, // Conserver tous les champs existants
    //         _id: doc._id // Ajouter le champ 'id' égal à '_id'
    //       }))
    //       console.log('Résultat de la recherche :', this.filteredDocuments);
    //     })
    //     .catch((err: any) => {
    //       console.log(err)
    //     })

    // },
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
    addFile(id: string) {
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
            this.selectedDoc.doc._attachments = {
              ...this.selectedDoc.doc._attachments,
              [file.name]: {
                content_type: file.type,
                dataUrl: `data:${file.type};base64,${base64Data}`
              }
            };
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
    removeDocument(id: any) {
      this.localdb
        ?.get(id)
        .then((doc) => {
          return this.localdb?.remove(doc);
        })
        .then(() => {
          console.log('Document supprimé avec succès');
          if (this.selectedDoc?.id === id) {
            this.selectedDoc = null; // Efface la section si c'était le document sélectionné
          }
          this.fetchData(); // Rafraîchir la liste des documents
        })
        .catch((error) => {
          console.error('Erreur lors de la suppression du document :', error);
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
    modify(docId: any) {
      if (!this.localdb || !this.editDoc) return;

      this.localdb
        .get(docId)
        .then((doc) => {
          // Applique les modifications en incluant le champ _rev pour éviter les conflits
          Object.assign(doc, this.editDoc.doc); // Applique les modifications à partir de l'objet intermédiaire
          return this.localdb?.put(doc); // Sauvegarde avec la bonne révision
        })
        .then(() => {
          console.log('Document modifié avec succès');
          this.selectedDoc = JSON.parse(JSON.stringify(this.editDoc)); // Met à jour l'objet sélectionné
          this.fetchData(); // Actualise la liste des documents
        })
        .catch((error) => {
          if (error.status === 409) {
            console.error('Conflit détecté. Tentative de résolution...');
            // Relire la dernière version et réessayer
            this.resolveConflict(docId);
          } else {
            console.error('Erreur lors de la modification du document :', error);
          }
        });
    },
    resolveConflict(docId: any) {
      this.localdb?.get(docId)
        .then((latestDoc) => {
          // Appliquer les modifications sur la dernière version du document
          Object.assign(latestDoc, this.editDoc.doc);
          return this.localdb?.put(latestDoc); // Réessaie de sauvegarder
        })
        .then(() => {
          console.log('Conflit résolu et document modifié avec succès');
          this.selectedDoc = JSON.parse(JSON.stringify(this.editDoc));
          this.fetchData();
        })
        .catch((error) => {
          console.error('Impossible de résoudre le conflit :', error);
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
      console.log("sync from remote database");
      try {
        const remoteDb = 'http://admin:admin@localhost:5984/motorbikedb';
        this.localdb?.replicate.from(remoteDb, {
          live: true,
          retry: true,
        })
          .on('change', (info) => {
            // Appelé à chaque fois qu'un lot de documents est synchronisé
            console.log('Des changements ont été synchronisés depuis la base distante :', info);
            this.fetchData(); // Actualise les données après chaque changement
          })
          .on('complete', (info) => {
            // La réplication s'est terminée avec succès
            console.log('Réplication terminée :', info);
          })
          .on('paused', (err) => {
            // La réplication est en pause (par exemple, aucune connexion)
            console.log('Réplication mise en pause :', err);
          })
          .on('active', () => {
            // La réplication reprend
            console.log('Réplication active');
          })
          .on('error', (err) => {
            // Une erreur s'est produite
            console.error('Erreur de synchronisation :', err);
          });

        console.log("Réplication configurée avec succès");
      } catch (error) {
        console.error('Erreur lors de la synchronisation de la base de données :', error);
      }
    }
    ,
    createIndex() {
      return this.localdb?.createIndex({
        index: {
          name: "idCommande",
          fields: ['idCommande']
        },
      })
        .then((result) => {
          console.log('Index créé avec succès', result);
        })
        .catch((error) => {
          console.error('Erreur lors de la création de l\'index :', error);
          throw error; // Relance l'erreur pour une gestion dans l'appelant
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
    selectDocument(doc: any) {

      this.selectedDoc = doc;
      this.editDoc = JSON.parse(JSON.stringify(doc)); // Copie profonde pour éditer sans impact immédiat

      window.scrollTo({ top: 0, behavior: 'smooth' }); // Défile vers le haut de la page
    },
    filterDoc(doc: any) {
      const { _attachments, ...filteredDoc } = doc;
      return filteredDoc;
    },
    removeImage(docId: string, imgName: any) {
      console.log('remove image', imgName);
      if (!this.localdb || !docId || !imgName) return;
      this.localdb.get(docId).then((doc) => {
        if (doc._attachments && doc._attachments[imgName]) {
          delete doc._attachments[imgName];
          return this.localdb?.put(doc);
        } else {
          throw new Error('Image not found');
        }
      }).then(() => {
        delete this.selectedDoc.doc._attachments[imgName];
        console.log('Image supprimée avec succès');
        //this.selectedDoc.doc._attachments = { ...this.selectedDoc.doc._attachments };
      }).catch((error) => {
        console.error('Erreur lors de la suppression de l\'image :', error);
      });
    },
    add100Randomdocuments() {
      const NUMBER = 100;
      for (let i = 0; i < NUMBER; i++) {
        this.addRandomDocument();
      }
      console.log(`${NUMBER} nouveaux documents ont été ajoutés avec succès.`);
      this.fetchData(); // Actualise la liste des documents

    },
    deleteAllDocuments() {
      if (!this.localdb) {
        console.error("La base de données n'est pas définie.");
        return;
      }

      this.localdb
        .allDocs({ include_docs: true })
        .then((result) => {
          const docsToDelete = result.rows.map((row) => {
            return {
              _id: row.doc?._id,
              _rev: row.doc?._rev,
              _deleted: true, // Marque le document pour suppression
            };
          });

          return this.localdb?.bulkDocs(docsToDelete); // Supprime tous les documents
        })
        .then(() => {
          this.fetchData(); // Actualise la liste des documents
          console.log("Tous les documents ont été supprimés avec succès !");
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression des documents :", error);
        });
    }
  },
  mounted() {
    // Appelle initDB lors du montage du composant
    this.initDB();
    // this.searchIndex();
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

.robin {
  width: 85vw
}

.document-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  list-style-type: none;
  padding: 0;
}

.document-item {
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, z-index 0.s ease 0.3s;
}




.document-summary {
  padding: 10px;
  background-color: #f9f9f9;
  color: black;
  cursor: pointer;
}

.document-details {
  display: none;
  padding: 10px;
  background-color: #2c61e6;
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

header {
  display: none !important
}

.selected-document {
  padding: 20px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 20px;
}

img::after {
  content: "📎";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 5px;
  border-radius: 50%;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 2px;
}
</style>
removeImage(docId: string, imgName: string) {
console.log('remove image', imgName);
if (!this.localdb || !docId || !imgName) return;
this.localdb.get(docId).then((doc) => {
if (doc._attachments && doc._attachments[imgName]) {
delete doc._attachments[imgName];
return this.localdb?.put(doc);
} else {
throw new Error('Image not found');
}
}).then(() => {
console.log('Image supprimée avec succès');
this.selectedDoc.doc._attachments = { ...this.selectedDoc.doc._attachments };
}).catch((error) => {
console.error('Erreur lors de la suppression de l\'image :', error);
});
}
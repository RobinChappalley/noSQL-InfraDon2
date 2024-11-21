<template>
  <div class="robin">
    <h1>This is a Robin page</h1>
    <!-- Affiche la valeur du compteur sur le bouton -->
    <!--  <button id="count" @click="incrementCount">{{ count }}</button> -->
    <br>
    <button id="adddb" @click="addDocument">Ajouter document</button>
    <br>
    <!-- <button id="removedb" @click="removeDocument('18b3412d84a8fb81f0529353df007354')">Enlever document</button> -->
    <div>
      <h2>Database Documents</h2>
      <ul>
        <li v-for="doc in data" :key="doc.id">
          <pre>{{ JSON.stringify(doc.doc, null, 2) }}</pre>
          <button @click="removeDocument(doc.id)">Delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import PouchDB from 'pouchdb'; // Importe PouchDB

export default {
  name: 'Robin',
  data() {
    return {
      count: 10, // Initialise le compteur
      db: null as PouchDB.Database<{}> | null, // Stocke l'instance de la base de données
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
      if (this.db) {
        this.db.allDocs({
          include_docs: true,
          attachments: true
        }).then((result: any) => {
          console.log('fetchData success', result);
          this.data = result.rows;
        }).catch((error: any) => {
          console.log('fetchData error', error);
        });
      }
    },
    // Initialise la base de données PouchDB
    initDB() {
      try {
        const dbName = 'motorbikedb';
        const db = new PouchDB('http://admin:admin@127.0.0.1:5984/' + dbName);
        this.db = db;
        console.log('Base de données initialisée :' + dbName);
        this.fetchData();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error);
      }
    },
    // Fonction pour ajouter un document à la base de données PouchDB
    addDocument() {
      // Utilise la méthode post de PouchDB pour ajouter un document
      this.db?.post(this.getFakeDoc())
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
    }
    // addDocument() {
    //   this.db?.post(this.getFakeDoc())
    //     .then((Response) => {
    //       console.log('Document ajouté avec plaisir', Response);
    //     }).catch((error) => {
    //       console.error('Erreur lors de l\'ajout du document :', error);
    //     })
    //     ;
    //   this.fetchData;
    // },
    ,
    removeDocument(id: string) {
      this.db?.get(id)
        .then((doc) => {
          return this.db?.remove(doc);
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
        "idCommande": 3,
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
    }
  },
  mounted() {
    // Appelle initDB lors du montage du composant
    this.initDB();
    this.addDocument();
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
</style>

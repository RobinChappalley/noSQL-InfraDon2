<template>
  <div class="robin">
    <h1>This is a Robin page</h1>
    <!-- Affiche la valeur du compteur sur le bouton -->
    <button id="count" @click="incrementCount">{{ count }}</button>
    <br>
    <button id="adddb" @click="addDocument">Ajouter document</button>
    <br>
    <button id="adddb" @click="removeDocument">Enlever document</button>
    <div>
      <pre>{{ data }}</pre>
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
      const storage = ref(this.db);
      const self = this;
      if (storage.value) {
        (storage.value).allDocs({
          include_docs: true,
          attachments: true
        }).then(function (result: any) {
          console.log('fetchData success', result);
          self.data = result.rows;
        }.bind(this)).catch(function (error: any) {
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
    addDocument() {
      this.db?.post(this.getFakeDoc())
        .then((Response) => {
          console.log('Document ajouté avec plaisir', Response);
        }).catch((error) => {
          console.error('Erreur lors de l\'ajout du document :', error);
        })
        ;
    },
    removeDocument() {
console.log("coucou")
    //this.db?.remove(18b3412d84a8fb81f0529353df007354,1-45fde0d08d26ec9468332a4f7440441d)
      // this.db?.get('mydoc').then(function (doc) {
      //   return db.remove(doc);  
      // }
      // ).catch(function (error) {
      //   console.error('Erreur lors de la suppression du document :', error);
      // })
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
</style>

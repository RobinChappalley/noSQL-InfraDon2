<template>
  <div class="robin">
    <h1>This is a Robin page 3</h1>
    <!-- Affiche la valeur du compteur sur le bouton -->
    <button id="count" @click="incrementCount">{{ count }}</button>
  </div>
</template>

<script lang="ts">
import PouchDB from 'pouchdb'; // Importe PouchDB

export default {
  name: 'Robin',
  data() {
    return {
      count: 10, // Initialise le compteur
      db: null as PouchDB.Database<{}> | null, // Stocke l'instance de la base de données
    };
  },
  methods: {
    // Fonction pour incrémenter le compteur
    incrementCount() {
      this.count++;
    },
    // Initialise la base de données PouchDB
    initDB() {
      try {
        new PouchDB('http://127.0.0.1:5984/motorbikedb');
        console.log('Base de données initialisée :');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error);
      }
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
</style>

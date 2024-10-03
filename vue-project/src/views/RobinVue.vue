<template>
  <div class="robin">
    <h1>This is a Robin page</h1>
    <!-- Affiche la valeur du compteur sur le bouton -->
    <button id="count" @click="incrementCount">{{ count }}</button>
  </div>
</template>

<script lang="ts">
import { onMounted } from 'vue'; // Importe le hook onMounted de Vue
import PouchDB from 'pouchdb'; // Importe PouchDB

export default {
  name: 'Robin',
  data() {
    return {
      count: 10 // Initialise le compteur
    };
  },
  methods: {
    // Fonction pour incrémenter le compteur
    incrementCount() {
      this.count++;
    },
    // Initialise la base de données PouchDB
    innitDB() {
      const db = new PouchDB('http://localhost:5986/motorbikedb');
      console.log('Base de données initialisée :', db);
    }
  },
  // Utilisation du hook de cycle de vie onMounted
  mounted() {
    this.innitDB(); // Appelle innitDB lors du montage du composant
  }
};
</script>

<style scoped>
/* Ton style ici, si nécessaire */
</style>

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

<template>
  <div class="robin">
    <h1>This is a Robin page</h1>
    <!-- Affiche la valeur du compteur sur le bouton -->
    <button id="count" @click="incrementCount">{{ count }}</button>
  </div>
</template>


<script lang="ts">
export default {
  name: 'Robin',
  // Ajoute la donnée pour le compteur
  data() {
    return {
      count: 10 // Initialise le compteur à 0
    }
  },
  methods: {
    // Fonction pour incrémenter le compteur
    incrementCount() {
      this.count++
    },
    innitDB() {
      const db = new PouchDB('http://localhost:5986/motorbikedb');

      console.log(db);
    },
    fetchData() {

    },
    onMounted() {
      this.innitDB();

    }

  }
}

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
  /* Le curseur doit changer lorsque vous passez sur le bouton */
  padding: 10px;
  background-color: lightblue;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  /* Ajoute une transition pour un effet plus fluide */
}

#count:hover {
  background-color: hsla(160, 100%, 37%, 1);
  /* Change la couleur du bouton au survol */
  color: white;
  /* Change la couleur du texte au survol */
}
</style>

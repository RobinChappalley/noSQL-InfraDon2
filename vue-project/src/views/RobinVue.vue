

<template>
  <div class="robin">
    <h1>This is a Robin page</h1>
    <!-- Affiche la valeur du compteur sur le bouton -->
    <p id="count" @click="incrementCount">{{ count }}</p>
  </div>
</template>

<script>
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
</style>

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
// db.ts
import PouchDB from 'pouchdb';

export default class Database {
  localDB: any;
  remoteDB: any;

  constructor() {
    // Initialiser une base de données locale
    this.localDB = new PouchDB('local_database');

    // Initialiser la base de données CouchDB distante
    this.remoteDB = new PouchDB('http://localhost:5986/motorbikedb');

    // Synchronisation entre la base de données locale et la base de données distante
    this.syncDatabases();
  }

  syncDatabases() {
    // Synchronise les données locales avec la base de données distante
    this.localDB.sync(this.remoteDB, {
      live: true, // Synchronisation en temps réel
      retry: true // Réessayer en cas de déconnexion
    }).on('change', (info: any) => {
      console.log('Changement détecté', info);
    }).on('paused', (err: any) => {
      console.log('Synchronisation en pause, peut-être à cause d\'une perte de connexion', err);
    }).on('active', () => {
      console.log('Synchronisation reprise');
    }).on('denied', (err: any) => {
      console.error('Accès refusé à la base de données distante', err);
    }).on('complete', (info: any) => {
      console.log('Synchronisation terminée', info);
    }).on('error', (err: any) => {
      console.error('Erreur lors de la synchronisation', err);
    });
  }
}


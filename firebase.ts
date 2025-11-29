import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvFXWZV7JZserIBCf2PfBpPvTirVA3-NE",
  authDomain: "el-sabor-de-la-cachapa.firebaseapp.com",
  databaseURL: "https://el-sabor-de-la-cachapa-default-rtdb.firebaseio.com",
  projectId: "el-sabor-de-la-cachapa",
  storageBucket: "el-sabor-de-la-cachapa.firebasestorage.app",
  messagingSenderId: "637159432638",
  appId: "1:637159432638:web:55e53c4a5de9b6bd0b99ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const db = getDatabase(app);

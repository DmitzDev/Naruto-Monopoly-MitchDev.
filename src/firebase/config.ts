/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAt6mhCQ1SEzzbWEadCfRsEBMGiLlVK0wo",
  authDomain: "naruto-monopoly-mitchdev.firebaseapp.com",
  projectId: "naruto-monopoly-mitchdev",
  storageBucket: "naruto-monopoly-mitchdev.firebasestorage.app",
  messagingSenderId: "145416601980",
  appId: "1:145416601980:web:d1c526142fbcb33e0d24f9",
  measurementId: "G-H9TV4KCYGQ",
  databaseURL: "https://naruto-monopoly-mitchdev-default-rtdb.asia-southeast1.firebasedatabase.app" // Inferred from common regional pattern
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

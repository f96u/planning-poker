// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABsKPq5nJEfmBOZsXDUxojSDCRv_IxLBI",
  authDomain: "planning-poker-de9bd.firebaseapp.com",
  databaseURL: "https://planning-poker-de9bd-default-rtdb.firebaseio.com",
  projectId: "planning-poker-de9bd",
  storageBucket: "planning-poker-de9bd.firebasestorage.app",
  messagingSenderId: "668964102108",
  appId: "1:668964102108:web:05724f2445a8a3bd693919",
  measurementId: "G-01P3EN9C4T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db }
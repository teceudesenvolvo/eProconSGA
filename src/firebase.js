// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword  } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJ4vo0OSw5Ewx9PITOzeuLcMqSXItIKg4",
  authDomain: "procon-cmsga.firebaseapp.com",
  projectId: "procon-cmsga",
  storageBucket: "procon-cmsga.firebasestorage.app",
  messagingSenderId: "1039808313384",
  appId: "1:1039808313384:web:f6cd1b997361ca2515dd1d",
  measurementId: "G-7H275ND9YK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword };
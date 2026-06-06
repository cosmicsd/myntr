// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Your verified live Firebase config keys
const firebaseConfig = {
    apiKey: "AIzaSyAiuHpPWB2eERS4JWEfkknNL9ZyG6AKSCo",
    authDomain: "myntr-4e6fd.firebaseapp.com",
    projectId: "myntr-4e6fd",
    storageBucket: "myntr-4e6fd.firebasestorage.app",
    messagingSenderId: "77678836030",
    appId: "1:77678836030:web:8f1ffd2cac05eba309146f",
    measurementId: "G-HDGYJDHWQ2"
};

// Initialize Core Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export instances and essential SDK methods for app.js
export { 
    auth, db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    doc, setDoc, getDoc
};

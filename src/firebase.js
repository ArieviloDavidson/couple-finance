// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNChJIZrsEvAsrRrSkZOvMr0suzM-uX10",
  authDomain: "couple-finance-v1.firebaseapp.com",
  projectId: "couple-finance-v1",
  storageBucket: "couple-finance-v1.firebasestorage.app",
  messagingSenderId: "444268151386",
  appId: "1:444268151386:web:d440d1b86325a8448a4e63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Export
export { db, auth, googleProvider };
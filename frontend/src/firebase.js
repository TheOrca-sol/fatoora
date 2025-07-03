import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBRw2d86zIXU2CEsrqovNbhGavOeXSN0CI",
  authDomain: "fatoora-b2d0b.firebaseapp.com",
  projectId: "fatoora-b2d0b",
  storageBucket: "fatoora-b2d0b.firebasestorage.app",
  messagingSenderId: "418611689260",
  appId: "1:418611689260:web:95016df90178872a9e9e89",
  measurementId: "G-TDG64GDMDE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { auth, googleProvider, appleProvider }; 

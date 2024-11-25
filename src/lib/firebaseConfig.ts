// lib/firebaseConfig.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "polleria-f456e.firebaseapp.com",
  projectId: "polleria-f456e",
  storageBucket: "polleria-f456e.firebasestorage.app",
  messagingSenderId: "329885264284",
  appId: "1:329885264284:web:423c0b119d105bdc950059"
};

// Inicializar Firebase si no se ha inicializado previamente
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Configurar la autenticación con persistencia de sesión en el navegador
const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Error setting persistence: ", error);
  });

// Obtener la instancia de Firestore
const db = getFirestore(app);

// Exportar la instancia de autenticación y Firestore
export { auth, db };
export default firebaseConfig;

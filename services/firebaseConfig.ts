import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// --- INSTRUCTIONS ---
// 1. Go to console.firebase.google.com
// 2. Create a project & add a Web App
// 3. Copy the config values and paste them into MANUAL_CONFIG below
//    OR set them in your environment variables (.env file)
const MANUAL_CONFIG = {
  apiKey: "", 
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Safe environment variable access supporting multiple prefixes (Vite, CRA, etc)
const getEnv = (key: string): string => {
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env[`REACT_APP_${key}`] || process.env[`VITE_${key}`] || process.env[key] || '';
        }
    } catch (e) {
        // Ignore error
    }
    return '';
};

const envConfig = {
  apiKey: getEnv("FIREBASE_API_KEY"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("FIREBASE_APP_ID"),
  measurementId: getEnv("FIREBASE_MEASUREMENT_ID")
};

// Determine which config to use
const firebaseConfig = envConfig.apiKey ? envConfig : MANUAL_CONFIG;

// Default mocks to prevent white screen if config is missing
let app: any = {};
let auth: any = { 
    currentUser: null, 
    onAuthStateChanged: () => () => {}, 
    signOut: async () => {},
    signInWithEmailAndPassword: async () => {},
    createUserWithEmailAndPassword: async () => {}
};
let db: any = {};
let storage: any = {};
let analytics: any = null;

export const isConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0);

try {
    if (isConfigured) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        
        if (firebaseConfig.measurementId) {
             try {
                analytics = getAnalytics(app);
             } catch(e) {
                 console.warn("Analytics failed to init");
             }
        }
        console.log("Firebase initialized successfully");
    } else {
        console.log("Firebase keys missing. Running in DEMO MODE (Mock Data).");
    }
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

export { app, auth, db, storage, analytics };
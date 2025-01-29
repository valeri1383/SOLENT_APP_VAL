import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration object containing Firebase project details from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Firebase API key
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, // Firebase Auth domain
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Firebase project ID
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Firebase storage bucket URL
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Firebase messaging sender ID
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, // Firebase app ID
};

// Initialize Firebase app only if no instance is already initialized
let app;
if (!getApps().length) {
    try {
        // Initialize the app with the configuration settings
        app = initializeApp(firebaseConfig);
    } catch (error) {
        console.error('Firebase initialization error:', error); // Log an error if initialization fails
    }
} else {
    // If the app has already been initialized, get the existing instance
    app = getApps()[0];
}

// Initialize Firebase services: Firestore and Auth
const db = getFirestore(app); // Initialize Firestore database
const auth = getAuth(app); // Initialize Firebase Authentication service

// Export the initialized services and app instance for use in other parts of the app
export { db, auth, app };
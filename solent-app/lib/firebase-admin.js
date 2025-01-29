import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Define the Firebase service account credentials using environment variables
const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Check if Firebase app has already been initialized to prevent re-initialization
if (!getApps().length) {
    try {
        // Initialize Firebase Admin SDK with credentials and database URL
        initializeApp({
            credential: cert(serviceAccount),
            databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
        });
    } catch (error) {
        // Log any errors that occur during initialization
        console.error('Firebase admin initialization error:', error);
    }
}

// Initialize Firestore and Authentication services
const adminDb = getFirestore(); // Get Firestore instance for interacting with the database
const adminAuth = getAuth(); // Get Auth instance for Firebase authentication operations

// Export the Firestore and Auth instances for use in other parts of the app
export { adminDb, adminAuth };
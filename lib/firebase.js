import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2B-DGru6NCR6NrQmEnjqWKdzkQ8c4C8Y",
    authDomain: "seproject-e3119.firebaseapp.com",
    projectId: "seproject-e3119",
    storageBucket: "seproject-e3119.firebasestorage.app",
    messagingSenderId: "2346102253",
    appId: "1:2346102253:web:1e70ee5dc225b393694be4"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export the Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
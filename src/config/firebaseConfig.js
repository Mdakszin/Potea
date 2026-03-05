import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// import { FIREBASE_API_KEY, ... } from '@env'; // If using react-native-dotenv

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "MOCK_KEY",
    authDomain: "potea-app.firebaseapp.com",
    databaseURL: "https://potea-app-default-rtdb.firebaseio.com",
    projectId: "potea-app",
    storageBucket: "potea-app.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

export default app;

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    initializeAuth, 
    getReactNativePersistence,
    Auth
} from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    if (Platform.OS === 'web') {
        auth = getAuth(app);
    } else {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
    }
} else {
    app = getApp();
    auth = getAuth(app);
}

let db: Firestore;
try {
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true
    });
} catch (e) {
    db = getFirestore(app);
}

const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };

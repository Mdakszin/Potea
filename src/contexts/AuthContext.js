import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const defaultAuthValue = {
    currentUser: null,
    userData: null,
    loading: true,
    register: () => Promise.resolve(),
    login: () => Promise.resolve(),
    loginWithGoogle: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    setUserData: () => {}
};

const AuthContext = createContext(defaultAuthValue);

export function useAuth() {
    const context = useContext(AuthContext);
    return context || defaultAuthValue;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Google Auth Request for Native
    // Note: webClientId is required by the hook on Web platform even if we use signInWithPopup
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || 'web-client-id-placeholder',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential)
                .then((result) => {
                    handleUserDocument(result.user);
                })
                .catch((error) => {
                    console.error('Firebase Google Sign-In error:', error);
                });
        }
    }, [response]);

    async function handleUserDocument(user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || '',
                avatar: user.photoURL || null,
                phone: user.phoneNumber || '',
                dob: '',
                createdAt: new Date().toISOString(),
            });
        }
    }

    async function register(email, password, name) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: email,
                name: name,
                createdAt: new Date().toISOString(),
                avatar: null,
                phone: '',
                dob: ''
            });
            return user;
        } catch (error) {
            throw error;
        }
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function loginWithGoogle() {
        if (Platform.OS === 'web') {
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                await handleUserDocument(result.user);
                return result.user;
            } catch (error) {
                console.error('Web Google Sign-In error:', error);
                throw error;
            }
        } else {
            // For Native, trigger promptAsync
            return promptAsync();
        }
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        let userUnsubscribe = null;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (userUnsubscribe) {
                userUnsubscribe();
                userUnsubscribe = null;
            }

            if (user) {
                const docRef = doc(db, 'users', user.uid);
                userUnsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }
                }, (error) => {
                    console.error("Error listening to user data:", error);
                });
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (userUnsubscribe) userUnsubscribe();
        };
    }, []);

    const value = {
        currentUser,
        userData,
        register,
        login,
        loginWithGoogle,
        logout,
        setUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    async function register(email, password, name) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Set displayName on Firebase Auth profile immediately
            await updateProfile(user, { displayName: name });

            // Create a user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: email,
                name: name,
                createdAt: new Date().toISOString(),
                // Default placeholder data
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
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Create or merge user document in Firestore
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

            return user;
        } catch (error) {
            console.error('Google Sign-In error:', error);
            throw error;
        }
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        let userUnsubscribe = null;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            // Clean up old listener
            if (userUnsubscribe) {
                userUnsubscribe();
                userUnsubscribe = null;
            }

            if (user) {
                const docRef = doc(db, 'users', user.uid);
                // Real-time listener for user details & favorites
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

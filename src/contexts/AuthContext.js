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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch additional user data from Firestore
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return unsubscribe;
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

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential,
    User,
    UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export interface UserData {
    uid: string;
    email: string | null;
    name: string;
    avatar: string | null;
    phone: string;
    dob: string;
    createdAt: string;
    [key: string]: any;
}

interface AuthContextType {
    currentUser: User | null;
    userData: UserData | null;
    loading: boolean;
    register: (email: string, password: string, name: string) => Promise<User>;
    login: (email: string, password: string) => Promise<UserCredential>;
    loginWithGoogle: () => Promise<any>;
    logout: () => Promise<void>;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Google Auth Request for Native
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

    async function handleUserDocument(user: User) {
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

    async function register(email: string, password: string, name: string): Promise<User> {
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
    }

    function login(email: string, password: string): Promise<UserCredential> {
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
            return promptAsync();
        }
    }

    function logout(): Promise<void> {
        return signOut(auth);
    }

    useEffect(() => {
        let userUnsubscribe: Unsubscribe | null = null;

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
                        setUserData(docSnap.data() as UserData);
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

    const value: AuthContextType = {
        currentUser,
        userData,
        loading,
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

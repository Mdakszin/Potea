import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { stripeService } from '../services/stripeService';

export const usePurchases = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [stripeTransactions, setStripeTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch Firestore Transactions
        const transRef = collection(db, 'users', currentUser.uid, 'transactions');
        const q = query(transRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const transData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                source: 'firestore'
            }));
            setTransactions(transData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        });

        // Fetch Stripe Purchases via our API Route
        const fetchStripeData = async () => {
            try {
                const { purchases } = await stripeService.fetchUserPurchases(currentUser.uid);
                setStripeTransactions(purchases.map(p => ({
                    ...p,
                    name: p.description || 'Stripe Purchase',
                    source: 'stripe',
                    isTopUp: false,
                    createdAt: { toDate: () => new Date(p.date) } // Mock Firestore date object
                })));
            } catch (err) {
                console.warn("Stripe fetch failed, relying on Firestore:", err);
            }
        };

        fetchStripeData();

        return () => unsubscribe();
    }, [currentUser]);

    // Merge and sort transactions
    const allTransactions = [...transactions, ...stripeTransactions].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.date);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.date);
        return dateB - dateA;
    });

    const getOrderDetails = async (orderId) => {
        if (!currentUser) return null;
        try {
            const orderRef = doc(db, 'users', currentUser.uid, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
                return { id: orderSnap.id, ...orderSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error fetching order details:", error);
            return null;
        }
    };

    const getTransactionDetails = async (transactionId) => {
        if (!currentUser) return null;
        
        // Check Firestore first
        try {
            const transRef = doc(db, 'users', currentUser.uid, 'transactions', transactionId);
            const transSnap = await getDoc(transRef);
            if (transSnap.exists()) {
                return { id: transSnap.id, ...transSnap.data() };
            }
        } catch (error) {
            console.error("Error fetching transaction details from Firestore:", error);
        }

        // Return from stripeTransactions if found
        const stripeTrans = stripeTransactions.find(t => t.id === transactionId);
        if (stripeTrans) return stripeTrans;

        return null;
    };

    return { 
        transactions: allTransactions, 
        loading, 
        getOrderDetails, 
        getTransactionDetails 
    };
};

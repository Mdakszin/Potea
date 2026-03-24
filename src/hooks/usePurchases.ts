import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { 
    collection, 
    query, 
    orderBy, 
    limit as firestoreLimit, 
    startAfter, 
    getDocs, 
    doc, 
    getDoc,
    DocumentSnapshot,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { stripeService } from '../services/stripeService';

const PAGE_SIZE = 10;

export interface CombinedTransaction {
    id: string;
    name: string;
    amount: number;
    date?: string;
    createdAt: { toDate: () => Date } | any;
    source: 'firestore' | 'stripe';
    isTopUp: boolean;
    description?: string;
    [key: string]: any;
}

export const usePurchases = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState<CombinedTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    
    // Pagination state
    const [lastFirestoreDoc, setLastFirestoreDoc] = useState<QueryDocumentSnapshot | null>(null);
    const [lastStripeId, setLastStripeId] = useState<string | null>(null);
    const [stripeHasMore, setStripeHasMore] = useState(true);

    const fetchInitialData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Fetch Firestore Initial
            const transRef = collection(db, 'users', currentUser.uid, 'transactions');
            const firestoreQ = query(transRef, orderBy('createdAt', 'desc'), firestoreLimit(PAGE_SIZE));
            const firestoreSnap = await getDocs(firestoreQ);
            
            const firestoreData: CombinedTransaction[] = firestoreSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                name: (doc.data() as any).name || 'Transaction',
                amount: (doc.data() as any).amount || 0,
                isTopUp: (doc.data() as any).isTopUp || false,
                source: 'firestore'
            }));
            
            setLastFirestoreDoc(firestoreSnap.docs[firestoreSnap.docs.length - 1] || null);

            // Fetch Stripe Initial
            let stripeData: CombinedTransaction[] = [];
            try {
                const stripeRes = await stripeService.fetchUserPurchases(currentUser.uid, PAGE_SIZE);
                stripeData = stripeRes.purchases.map(p => ({
                    ...p,
                    name: p.description || 'Stripe Purchase',
                    source: 'stripe' as const,
                    isTopUp: false,
                    createdAt: { toDate: () => new Date(p.date) }
                }));
                setLastStripeId(stripeRes.last_id);
                setStripeHasMore(stripeRes.has_more);
            } catch (err) {
                console.warn("Initial Stripe fetch failed:", err);
            }

            // Merge and sort
            const merged = [...firestoreData, ...stripeData].sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.date || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.date || 0);
                return dateB.getTime() - dateA.getTime();
            });

            setTransactions(merged);
            setHasMore(firestoreSnap.docs.length === PAGE_SIZE || stripeData.length > 0);
        } catch (error) {
            console.error("Error fetching initial purchases:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const loadMore = async () => {
        if (loadingMore || !hasMore || !currentUser) return;
        setLoadingMore(true);

        try {
            let nextFirestoreData: CombinedTransaction[] = [];
            if (lastFirestoreDoc) {
                const transRef = collection(db, 'users', currentUser.uid, 'transactions');
                const nextQ = query(
                    transRef, 
                    orderBy('createdAt', 'desc'), 
                    startAfter(lastFirestoreDoc), 
                    firestoreLimit(PAGE_SIZE)
                );
                const nextSnap = await getDocs(nextQ);
                nextFirestoreData = nextSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    name: (doc.data() as any).name || 'Transaction',
                    amount: (doc.data() as any).amount || 0,
                    isTopUp: (doc.data() as any).isTopUp || false,
                    source: 'firestore'
                }));
                setLastFirestoreDoc(nextSnap.docs[nextSnap.docs.length - 1] || null);
            }

            let nextStripeData: CombinedTransaction[] = [];
            if (stripeHasMore && lastStripeId) {
                try {
                    const stripeRes = await stripeService.fetchUserPurchases(currentUser.uid, PAGE_SIZE, lastStripeId);
                    nextStripeData = stripeRes.purchases.map(p => ({
                        ...p,
                        name: p.description || 'Stripe Purchase',
                        source: 'stripe' as const,
                        isTopUp: false,
                        createdAt: { toDate: () => new Date(p.date) }
                    }));
                    setLastStripeId(stripeRes.last_id);
                    setStripeHasMore(stripeRes.has_more);
                } catch (err) {
                    console.warn("Load more Stripe failed:", err);
                }
            }

            if (nextFirestoreData.length === 0 && nextStripeData.length === 0) {
                setHasMore(false);
            } else {
                setTransactions(prev => {
                    const merged = [...prev, ...nextFirestoreData, ...nextStripeData].sort((a, b) => {
                        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.date || 0);
                        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.date || 0);
                        return dateB.getTime() - dateA.getTime();
                    });
                    // Simple deduplication by ID
                    return merged.filter((item, index, self) => 
                        index === self.findIndex((t) => t.id === item.id)
                    );
                });
            }
        } catch (error) {
            console.error("Error loading more purchases:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const getOrderDetails = async (orderId: string) => {
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

    const getTransactionDetails = async (transactionId: string) => {
        if (!currentUser) return null;
        
        try {
            const transRef = doc(db, 'users', currentUser.uid, 'transactions', transactionId);
            const transSnap = await getDoc(transRef);
            if (transSnap.exists()) {
                return { id: transSnap.id, ...transSnap.data() };
            }
        } catch (error) {
            console.error("Error fetching transaction details from Firestore:", error);
        }

        const stripeTrans = transactions.find(t => t.id === transactionId && t.source === 'stripe');
        if (stripeTrans) return stripeTrans;

        return null;
    };

    return { 
        transactions, 
        loading, 
        loadingMore,
        hasMore,
        loadMore,
        refresh: fetchInitialData,
        getOrderDetails, 
        getTransactionDetails 
    };
};

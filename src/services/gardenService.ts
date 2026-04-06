import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { UserPlant, CareLog, GrowthUpdate } from '../types';

export const gardenService = {
    // -- User Plants --
    
    getUserPlants: async (userId: string): Promise<UserPlant[]> => {
        const q = query(
            collection(db, 'userPlants'), 
            where('userId', '==', userId),
            orderBy('dateAdded', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserPlant));
    },

    addUserPlant: async (plant: Omit<UserPlant, 'id' | 'dateAdded'>): Promise<string> => {
        const docRef = await addDoc(collection(db, 'userPlants'), {
            ...plant,
            dateAdded: serverTimestamp(),
        });
        return docRef.id;
    },

    updateUserPlant: async (plantId: string, updates: Partial<UserPlant>): Promise<void> => {
        const docRef = doc(db, 'userPlants', plantId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    },

    deleteUserPlant: async (plantId: string): Promise<void> => {
        await deleteDoc(doc(db, 'userPlants', plantId));
    },

    // -- Care Logs --

    logCareAction: async (log: Omit<CareLog, 'id' | 'date'>): Promise<string> => {
        // 1. Add the care log
        const logRef = await addDoc(collection(db, 'careLogs'), {
            ...log,
            date: serverTimestamp(),
        });

        // 2. Update the lastCare date on the plant
        const plantRef = doc(db, 'userPlants', log.userPlantId);
        const lastCareKey = `lastCare.${log.type}`;
        await updateDoc(plantRef, {
            [lastCareKey]: serverTimestamp(),
        });

        return logRef.id;
    },

    getCareLogs: async (userPlantId: string): Promise<CareLog[]> => {
        const q = query(
            collection(db, 'careLogs'), 
            where('userPlantId', '==', userPlantId),
            orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CareLog));
    },

    // -- Growth Updates --

    addGrowthUpdate: async (update: Omit<GrowthUpdate, 'id' | 'date'>): Promise<string> => {
        const docRef = await addDoc(collection(db, 'growthUpdates'), {
            ...update,
            date: serverTimestamp(),
        });
        return docRef.id;
    },

    getGrowthUpdates: async (userPlantId: string): Promise<GrowthUpdate[]> => {
        const q = query(
            collection(db, 'growthUpdates'), 
            where('userPlantId', '==', userPlantId),
            orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GrowthUpdate));
    },
};

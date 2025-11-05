'use client';

import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import type { Route, Alert, Driver } from './definitions';

// This is a client-side data service.
// It uses the useFirebase hook to get the Firestore instance.

async function readData<T>(firestore: any, collectionName: string): Promise<T[]> {
  if (!firestore) {
    console.error("Firestore not initialized");
    return [];
  }
  try {
    const dbCollection = collection(firestore, collectionName);
    const q = query(dbCollection, orderBy("lastUpdated", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log(`No documents found in ${collectionName}`);
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    // In a real app, you might want to throw the error or handle it differently.
    // For now, returning an empty array to prevent page crashes.
    return [];
  }
}


export function useData() {
    const { firestore } = useFirebase();

    const getRoutes = async (): Promise<Route[]> => {
        return readData<Route>(firestore, 'routes');
    }

    const getAlerts = async (): Promise<Alert[]> => {
        return readData<Alert>(firestore, 'alerts');
    }

    const getDrivers = async (): Promise<Driver[]> => {
        return readData<Driver>(firestore, 'drivers');
    }

    return { getRoutes, getAlerts, getDrivers };
}
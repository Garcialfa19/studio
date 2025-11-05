'use server';

import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Route, Alert, Driver } from './definitions';

// Initialize Firebase
const { firestore } = initializeFirebase();

async function readData<T>(collectionName: string): Promise<T[]> {
  try {
    const dbCollection = collection(firestore, collectionName);
    const q = query(dbCollection, orderBy("lastUpdated", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    return [];
  }
}

export async function getRoutes(): Promise<Route[]> {
  return readData<Route>('routes');
}

export async function getAlerts(): Promise<Alert[]> {
  return readData<Alert>('alerts');
}

export async function getDrivers(): Promise<Driver[]> {
    return readData<Driver>('drivers');
}


// THIS FILE IS ONLY FOR SERVER-SIDE USE
import 'server-only';
import { initializeFirebase } from '@/firebase/server';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import type { Route, Alert, Driver } from './definitions';

async function getData<T>(collectionName: string): Promise<T[]> {
    try {
        const { firestore } = initializeFirebase();
        const col = collection(firestore, collectionName);
        const snapshot = await getDocs(col);
        
        if (snapshot.empty) {
            console.log(`No documents found in ${collectionName} collection.`);
            return [];
        }

        const data: T[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as T));

        return data;

    } catch (error) {
        console.error(`Could not read from Firestore collection ${collectionName}:`, error);
        return [];
    }
}


export async function getRoutes(): Promise<Route[]> {
    return getData<Route>('routes');
}

export async function getAlerts(): Promise<Alert[]> {
    return getData<Alert>('alerts');
}

export async function getDrivers(): Promise<Driver[]> {
    return getData<Driver>('drivers');
}

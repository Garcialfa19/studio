import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

export * from './provider';

// ==================================================================
// Just `initializeFirebase()` and return the instances of the services
// ==================================================================
export const initializeFirebase = (): {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} => {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  return { app, firestore, auth };
};

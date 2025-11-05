
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// Initialize Firebase for server-side usage
let firebaseApp: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

export const initializeFirebase = (): {
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} => {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  } else {
    firebaseApp = getApp();
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  }
  return { app: firebaseApp, firestore, auth };
};

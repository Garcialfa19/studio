import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from './firebase-config';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };

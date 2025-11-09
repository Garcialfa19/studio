import admin from 'firebase-admin';

const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  }
  return admin;
};

const admin = initializeFirebaseAdmin();
const db = admin.firestore();
const storage = admin.storage();

export { db, storage, admin, initializeFirebaseAdmin };


import * as admin from 'firebase-admin';

let isInitialized = false;

export function initializeFirebaseAdmin() {
  if (isInitialized) {
    return { admin };
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (!admin.apps.length) {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      });
    } else if (process.env.NODE_ENV === 'development') {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set. Using application default credentials for Firebase Admin.");
      admin.initializeApp();
    } else {
      admin.initializeApp();
    }
  }

  isInitialized = true;
  return { admin };
}

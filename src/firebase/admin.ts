
import * as admin from 'firebase-admin';

let isInitialized = false;

export function initializeFirebaseAdmin() {
  if (isInitialized) {
    return admin;
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
    } else {
        // This path is for local development or environments where GOOGLE_APPLICATION_CREDENTIALS is set.
        admin.initializeApp({
            storageBucket: `${process.env.GCLOUD_PROJECT}.appspot.com`
        });
    }
  }

  isInitialized = true;
  return admin;
}

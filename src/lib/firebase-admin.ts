
// THIS FILE IS ONLY FOR SERVER-SIDE USE
import admin from 'firebase-admin';

const serviceAccount = require("../../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseAdmin = admin;

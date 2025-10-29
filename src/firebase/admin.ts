import * as admin from 'firebase-admin';

// This is a function that returns the admin app instance.
// It initializes the app if it's not already initialized.
export const getAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }

    const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!serviceAccountString) {
        throw new Error('The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
         throw new Error(`Failed to parse GOOGLE_APPLICATION_CREDENTIALS: ${error.message}`);
    }
};

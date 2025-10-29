'use server';
import * as admin from 'firebase-admin';

// This is a function that returns the admin app instance.
// It initializes the app if it's not already initialized.
// In a managed environment like Firebase App Hosting, the SDK
// automatically discovers the service account credentials.
export const getAdminApp = async () => {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }

    // No credentials needed, it will use Application Default Credentials
    return admin.initializeApp();
};

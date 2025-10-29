'use client';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// this provider is to make sure firebase is initialized only once on the client
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, auth, firestore } = initializeFirebase();

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}

'use client';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type FirebaseContextType = {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  firestore: null,
  auth: null,
  user: null,
  loading: true,
  logout: async () => {},
});

export const FirebaseProvider = ({
  children,
  app,
  firestore,
  auth,
}: {
  children: ReactNode;
  app: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // set cookie for middleware
      if (user) {
        document.cookie = `firebase-auth=true; path=/; max-age=1209600`;
      } else {
        document.cookie = 'firebase-auth=; path=/; max-age=0';
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const logout = async () => {
    if (auth) {
      await auth.signOut();
      setUser(null);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{ app, firestore, auth, user, loading, logout }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
export const useAuth = () => useContext(FirebaseContext);

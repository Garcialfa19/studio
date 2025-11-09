import { app } from './firebase-client';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

const auth = getAuth(app);

export const authService = {
  signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
  signOut: () => signOut(auth),
  onAuthStateChanged: (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback),
};

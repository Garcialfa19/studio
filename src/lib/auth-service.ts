
import { initializeFirebase } from '@/lib/firebase-client';
import { getAuth } from 'firebase/auth';

export async function verifySession() {
  const { auth } = initializeFirebase();
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const token = await user.getIdToken();

  try {
    const response = await fetch('/api/auth/session', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

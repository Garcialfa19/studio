
import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'No token found' }, { status: 401 });
  }

  try {
    const { auth } = initializeFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(token);
    return NextResponse.json({ user: decodedToken });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

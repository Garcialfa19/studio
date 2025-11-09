
import { db } from '@/lib/firebase-admin';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore/lite';
import { NextRequest, NextResponse } from 'next/server';

const alertsCollection = collection(db, 'alerts');

export async function GET() {
  try {
    const snapshot = await getDocs(alertsCollection);
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching alerts', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const alert = await req.json();
    const newAlertRef = doc(alertsCollection);
    await setDoc(newAlertRef, alert);
    return NextResponse.json({ id: newAlertRef.id, ...alert });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating alert', error }, { status: 500 });
  }
}

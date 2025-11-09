
import { db } from '@/lib/firebase-admin';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore/lite';
import { NextRequest, NextResponse } from 'next/server';

const driversCollection = collection(db, 'drivers');

export async function GET() {
  try {
    const snapshot = await getDocs(driversCollection);
    const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(drivers);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching drivers', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const driver = await req.json();
    const newDriverRef = doc(driversCollection);
    await setDoc(newDriverRef, driver);
    return NextResponse.json({ id: newDriverRef.id, ...driver });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating driver', error }, { status: 500 });
  }
}

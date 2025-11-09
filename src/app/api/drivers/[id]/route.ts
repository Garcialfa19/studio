
import { db } from '@/lib/firebase-admin';
import { doc, setDoc, deleteDoc } from 'firebase/firestore/lite';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driver = await req.json();
    const driverRef = doc(db, 'drivers', params.id);
    await setDoc(driverRef, driver, { merge: true });
    return NextResponse.json({ id: params.id, ...driver });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating driver', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driverRef = doc(db, 'drivers', params.id);
    await deleteDoc(driverRef);
    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting driver', error }, { status: 500 });
  }
}

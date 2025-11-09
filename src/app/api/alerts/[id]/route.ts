
import { db } from '@/lib/firebase-admin';
import { doc, deleteDoc } from 'firebase/firestore/lite';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const alertRef = doc(db, 'alerts', params.id);
    await deleteDoc(alertRef);
    return NextResponse.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting alert', error }, { status: 500 });
  }
}

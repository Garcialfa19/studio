import { NextResponse } from 'next/server';
import { getDrivers } from '@/lib/data-service';

export async function GET() {
  try {
    const drivers = await getDrivers();
    return NextResponse.json(drivers);
  } catch (error) {
    console.error('API Error fetching drivers:', error);
    return NextResponse.json({ message: 'Failed to fetch drivers' }, { status: 500 });
  }
}

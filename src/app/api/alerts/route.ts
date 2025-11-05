
import { NextResponse } from 'next/server';
import { getAlerts } from '@/lib/data-service';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  try {
    const alerts = await getAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('API Error fetching alerts:', error);
    return NextResponse.json({ message: 'Failed to fetch alerts' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getAlerts } from '@/lib/data-service';

export async function GET() {
  try {
    const alerts = await getAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('API Error fetching alerts:', error);
    return NextResponse.json({ message: 'Failed to fetch alerts' }, { status: 500 });
  }
}

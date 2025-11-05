
import { NextResponse } from 'next/server';
import { getRoutes } from '@/lib/data-service';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  try {
    const routes = await getRoutes();
    return NextResponse.json(routes);
  } catch (error) {
    console.error('API Error fetching routes:', error);
    return NextResponse.json({ message: 'Failed to fetch routes' }, { status: 500 });
  }
}

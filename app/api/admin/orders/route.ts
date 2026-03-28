import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const orders = await db.find('orders', {}, { createdAt: -1 });
    return NextResponse.json(orders || []);
  } catch { return NextResponse.json([], { status: 200 }); }
}

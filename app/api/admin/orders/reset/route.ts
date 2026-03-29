import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';



export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
    }

    const orders = await db.find('orders', {});
    for (const order of orders) {
      const id = order._id?.$oid || order._id;
      await db.deleteOne('orders', { _id: id });
    }

    return NextResponse.json({ message: 'Orders reset successfully', deleted: orders.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

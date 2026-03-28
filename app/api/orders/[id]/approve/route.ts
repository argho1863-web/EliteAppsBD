import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOrderApprovalToCustomer } from '@/lib/email';

export const runtime = 'edge';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') !== process.env.NEXTAUTH_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const order = await db.findOne('orders', { _id: id });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (order.status !== 'pending') {
      return new NextResponse(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0a0a14;color:#e2e8f0;"><h2 style="color:#f0a500;">Order already ${order.status}</h2></body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    await db.updateOne('orders', { _id: id }, { $set: { status: 'approved', updatedAt: new Date().toISOString() } });
    await sendOrderApprovalToCustomer(order.userEmail, order.userName, id);
    return new NextResponse(`<!DOCTYPE html><html><body style="font-family:'Segoe UI',sans-serif;text-align:center;padding:60px;background:#0a0a14;color:#e2e8f0;">
      <div style="max-width:400px;margin:0 auto;background:#12121e;padding:40px;border-radius:16px;border:2px solid #10b981;">
        <div style="font-size:56px;margin-bottom:12px;">✅</div>
        <h2 style="color:#10b981;margin:0 0 10px;">Order Approved!</h2>
        <p style="color:#94a3b8;">Order #${id.slice(-8).toUpperCase()} approved.</p>
        <p style="color:#94a3b8;">Customer <strong style="color:#e2e8f0;">${order.userEmail}</strong> has been notified.</p>
      </div>
    </body></html>`, { headers: { 'Content-Type': 'text/html' } });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await db.findOne('orders', { _id: id });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.updateOne('orders', { _id: id }, { $set: { status: 'approved', updatedAt: new Date().toISOString() } });
    await sendOrderApprovalToCustomer(order.userEmail, order.userName, id);
    return NextResponse.json({ message: 'Order approved and customer notified' });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

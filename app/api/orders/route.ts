export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { sendOrderNotificationToAdmin } from '@/lib/email';


export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = (session.user as any).role === 'admin';
    const filter = isAdmin ? {} : { userId: (session.user as any).id };
    const orders = await db.find('orders', filter, { createdAt: -1 });
    return NextResponse.json(orders || []);
  } catch { return NextResponse.json([], { status: 200 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 });
    const data = await req.json();
    const orderId = crypto.randomUUID();
    const order = {
      _id: orderId,
      userId: (session.user as any).id || session.user?.email,
      userName: session.user?.name,
      userEmail: session.user?.email,
      items: data.items,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      customerDetails: data.customerDetails || {},
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.insertOne('orders', order);

    try {
      if (!process.env.EMAIL_ADMIN) throw new Error('EMAIL_ADMIN not set');
      if (!process.env.BREVO_API_KEY) throw new Error('BREVO_API_KEY not set');

      const productLines = data.items.map((i: any) => {
        let line = i.productName;
        if (i.selectedPeriod) line += ` (${i.selectedPeriod})`;
        if (i.selectedAmount) line += ` (${i.selectedAmount})`;
        return line;
      });

      await sendOrderNotificationToAdmin({
        orderId,
        customerName: session.user?.name || 'Unknown',
        customerEmail: session.user?.email || '',
        productNames: productLines,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        customerDetails: data.customerDetails || {},
      });

      return NextResponse.json({ orderId, emailSent: true }, { status: 201 });
    } catch (emailError: any) {
      console.error('Admin email failed:', emailError.message);
      return NextResponse.json({ orderId, emailSent: false, emailError: emailError.message }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}

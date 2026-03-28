export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await db.findOne('products', { _id: { $oid: id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const data = await req.json();

    // Build $set and $unset operations
    const setFields: Record<string, any> = {};
    const unsetFields: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined || value === '') {
        // Unset the field if it's empty/null/undefined
        unsetFields[key] = '';
      } else {
        setFields[key] = value;
      }
    }

    const update: Record<string, any> = {};
    if (Object.keys(setFields).length > 0) update.$set = setFields;
    if (Object.keys(unsetFields).length > 0) update.$unset = unsetFields;

    await db.updateOne('products', { _id: { $oid: id } }, update);
    return NextResponse.json({ message: 'Updated' });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await db.deleteOne('products', { _id: { $oid: id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

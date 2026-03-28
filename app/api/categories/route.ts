import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const cats = await db.find('categories', {}, { createdAt: -1 });
    return NextResponse.json(Array.isArray(cats) ? cats : []);
  } catch { return NextResponse.json([], { status: 200 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await req.json();
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await db.findOne('categories', { slug });
    if (existing) return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    const id = await db.insertOne('categories', { ...data, slug, createdAt: new Date().toISOString() });
    return NextResponse.json({ _id: id, ...data, slug }, { status: 201 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await req.json();
    await db.deleteOne('categories', { _id: { $oid: id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

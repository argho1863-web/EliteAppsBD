import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export const runtime = 'edge';

// GET public approved reviews for a product
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reviews = await db.find('reviews', { productId: id, isApproved: true });
    // Sort reviews by creation date descending
    const sorted = reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(sorted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new review
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Must be logged in to review' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
    }

    const review = {
      productId: id,
      userName: session.user.name,
      userEmail: session.user.email,
      rating: Number(rating),
      comment,
      isApproved: false, // Default to false
      createdAt: new Date().toISOString(),
    };

    const id = await db.insertOne('reviews', review);
    return NextResponse.json({ id, ...review });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

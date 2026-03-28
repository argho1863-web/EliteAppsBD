export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';
import { sendVerificationEmail } from '@/lib/email';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, code } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (code) {
      const pending = await db.findOne('pending_signups', { email: normalizedEmail });
      if (!pending) return NextResponse.json({ error: 'No pending signup found. Please start over.' }, { status: 400 });

      const createdAt = new Date(pending.createdAt).getTime();
      if (Date.now() - createdAt > 10 * 60 * 1000) {
        await db.deleteOne('pending_signups', { email: normalizedEmail });
        return NextResponse.json({ error: 'Code expired. Please sign up again.' }, { status: 400 });
      }

      if (pending.code !== code.trim()) return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });

      const existing = await db.findOne('users', { email: normalizedEmail });
      if (existing) {
        await db.deleteOne('pending_signups', { email: normalizedEmail });
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(password);
      await db.insertOne('users', {
        name: pending.name, email: normalizedEmail, password: hashedPassword,
        provider: 'credentials', emailVerified: new Date().toISOString(), createdAt: new Date().toISOString(),
      });
      await db.deleteOne('pending_signups', { email: normalizedEmail });
      return NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
    }

    const existing = await db.findOne('users', { email: normalizedEmail });
    if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });

    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    await db.deleteOne('pending_signups', { email: normalizedEmail });
    await db.insertOne('pending_signups', { name, email: normalizedEmail, code: verificationCode, createdAt: new Date().toISOString() });
    await sendVerificationEmail(normalizedEmail, name, verificationCode);
    return NextResponse.json({ message: 'Verification code sent' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

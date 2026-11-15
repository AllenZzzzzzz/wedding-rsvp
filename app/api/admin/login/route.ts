import { NextRequest, NextResponse } from 'next/server';
import { createToken, safeEqual } from '@/lib/auth';

// Separate password for Allen's admin dashboard, kept apart from the
// guest password so sharing one never exposes the other.
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: 'Server is missing ADMIN_PASSWORD env var.' },
      { status: 500 }
    );
  }

  if (typeof password !== 'string' || !safeEqual(password, expected)) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_gate', await createToken('admin', expected, 60 * 60 * 24 * 30), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

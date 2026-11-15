import { NextRequest, NextResponse } from 'next/server';
import { createToken, safeEqual } from '@/lib/auth';

// Checks the shared guest password (set in Vercel env var WEDDING_PASSWORD)
// and, if correct, sets an httpOnly cookie the middleware checks for.
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.WEDDING_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: 'Server is missing WEDDING_PASSWORD env var.' },
      { status: 500 }
    );
  }

  if (typeof password !== 'string' || !safeEqual(password, expected)) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('wedding_gate', await createToken('guest', expected, 60 * 60 * 24 * 180), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
  return res;
}

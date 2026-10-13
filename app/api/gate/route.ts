import { NextRequest, NextResponse } from 'next/server';

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

  if (password !== expected) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('wedding_gate', 'ok', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 180, // 180 days
  });
  return res;
}

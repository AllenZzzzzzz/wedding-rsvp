// Signed session tokens for the two password gates.
//
// The cookie value is `<expiry>.<signature>`. The signature is an HMAC keyed
// with the gate's own password, so a cookie can't be forged without knowing
// the password, and changing the password invalidates every existing cookie.
// Uses Web Crypto so it works in both the Edge middleware and API routes.

export type GateKind = 'guest' | 'admin';

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sign(kind: GateKind, secret: string, exp: number) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(`${kind}:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(`${kind}.${exp}`)));
}

export function safeEqual(a: string, b: string) {
  const ea = enc.encode(a);
  const eb = enc.encode(b);
  let diff = ea.length ^ eb.length;
  const len = Math.max(ea.length, eb.length);
  for (let i = 0; i < len; i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

export async function createToken(kind: GateKind, secret: string, maxAgeSeconds: number) {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  return `${exp}.${await sign(kind, secret, exp)}`;
}

export async function verifyToken(
  kind: GateKind,
  secret: string | undefined,
  token: string | undefined
) {
  if (!secret || !token) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!sig || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, await sign(kind, secret, exp));
}

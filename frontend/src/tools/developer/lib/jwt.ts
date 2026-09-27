import { base64ToBytes, bytesToBase64, utf8Decode, utf8Encode } from './encoding';
import { hmac } from './hash';

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: unknown;
  signature: string;
  signingInput: string;
}

function b64urlJson(part: string, label: string): unknown {
  try {
    return JSON.parse(utf8Decode(base64ToBytes(part)));
  } catch {
    throw new Error(`The ${label} is not valid Base64URL-encoded JSON.`);
  }
}

export function decodeJwt(token: string): DecodedJwt {
  const t = token.trim().replace(/^Bearer\s+/i, '');
  const parts = t.split('.');
  if (parts.length !== 3)
    throw new Error('A JWT must have three parts separated by dots (header.payload.signature).');
  const header = b64urlJson(parts[0], 'header');
  if (!header || typeof header !== 'object' || Array.isArray(header))
    throw new Error('The JWT header must be a JSON object.');
  return {
    header: header as Record<string, unknown>,
    payload: b64urlJson(parts[1], 'payload'),
    signature: parts[2],
    signingInput: `${parts[0]}.${parts[1]}`,
  };
}

export const b64url = (bytes: Uint8Array) =>
  bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const ALGS = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' } as const;
export type HsAlg = keyof typeof ALGS;

export async function signJwt(
  header: Record<string, unknown>,
  payload: unknown,
  secret: string,
): Promise<string> {
  const alg = header.alg as HsAlg;
  if (!(alg in ALGS)) throw new Error('Only HS256, HS384 and HS512 can be signed in the browser.');
  const input = `${b64url(utf8Encode(JSON.stringify(header)))}.${b64url(utf8Encode(JSON.stringify(payload)))}`;
  const sig = await hmac(ALGS[alg], utf8Encode(secret), utf8Encode(input));
  return `${input}.${b64url(sig)}`;
}

export async function verifyJwt(token: string, secret: string): Promise<boolean> {
  const d = decodeJwt(token);
  const alg = d.header.alg as HsAlg;
  if (!(alg in ALGS))
    throw new Error(
      `Signature verification supports HS256/384/512; this token uses ${String(d.header.alg)}.`,
    );
  const sig = await hmac(ALGS[alg], utf8Encode(secret), utf8Encode(d.signingInput));
  return b64url(sig) === d.signature;
}

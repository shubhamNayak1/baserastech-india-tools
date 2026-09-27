import { md5 } from './md5';
import { bytesToBase64, toHex, utf8Encode } from './encoding';

export type HashAlgo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
export const HASH_ALGOS: HashAlgo[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new Error('Your browser does not support the Web Crypto API.');
  return s;
}

export async function digest(algo: HashAlgo, data: Uint8Array): Promise<Uint8Array> {
  if (algo === 'MD5') {
    const hex = md5(data);
    return new Uint8Array(hex.match(/../g)!.map((h) => parseInt(h, 16)));
  }
  return new Uint8Array(await subtle().digest(algo, data));
}

export async function hmac(
  algo: Exclude<HashAlgo, 'MD5'>,
  key: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array> {
  const k = await subtle().importKey('raw', key, { name: 'HMAC', hash: algo }, false, ['sign']);
  return new Uint8Array(await subtle().sign('HMAC', k, data));
}

export async function hashText(
  algo: HashAlgo,
  text: string,
  output: 'hex' | 'base64' = 'hex',
  hmacKey?: string,
): Promise<string> {
  const data = utf8Encode(text);
  const bytes =
    hmacKey !== undefined && algo !== 'MD5'
      ? await hmac(algo, utf8Encode(hmacKey), data)
      : await digest(algo, data);
  return output === 'hex' ? toHex(bytes) : bytesToBase64(bytes);
}

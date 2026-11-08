let webCrypto = globalThis.crypto;
if (!webCrypto || !webCrypto.subtle || !webCrypto.randomUUID) {
  try {
    const nodeCrypto = await import('node:crypto');
    webCrypto = nodeCrypto.webcrypto || nodeCrypto.default?.webcrypto || nodeCrypto.default;
  } catch {}
}

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers
  }
});

export const slugOk = s => typeof s === 'string' && /^[a-z0-9-]{2,60}$/.test(s);

export async function body(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function cookie(req, name) {
  const raw = req.headers.get('Cookie') || '';
  const item = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

const enc = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dec = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

async function key(secret) {
  return webCrypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function makeSession(secret) {
  const payload = enc(new TextEncoder().encode(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000, nonce: webCrypto.randomUUID() })));
  const sig = await webCrypto.subtle.sign('HMAC', await key(secret), new TextEncoder().encode(payload));
  return payload + '.' + enc(sig);
}

export async function validSession(req, env) {
  const token = cookie(req, 'egw_session');
  if (!token || !env.SESSION_SECRET) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  try {
    const ok = await webCrypto.subtle.verify('HMAC', await key(env.SESSION_SECRET), dec(sig), new TextEncoder().encode(payload));
    if (!ok) return false;
    const data = JSON.parse(new TextDecoder().decode(dec(payload)));
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin(req, env) {
  return await validSession(req, env);
}

export const sessionCookie = token => `egw_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`;
export const clearCookie = 'egw_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

export function safeJson(str, fallback = null) {
  if (typeof str !== 'string' || !str.trim()) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function sanitize(str, max = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, max);
}

export function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  const output = { ...(target || {}) };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      output[key] = source[key];
    }
  }
  return output;
}

import nodeCrypto from "node:crypto";
if (!globalThis.crypto) { globalThis.crypto = nodeCrypto.webcrypto; }
/**
 * UNDANGAN V2 - Local Development & Test Server
 * Simulates Cloudflare Pages Functions & Cloudflare D1 Database locally
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8787;
const DB_FILE = process.env.DB_FILE || 'wedding.db';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'emerald-gold-super-secret-session-key-2027';

// 1. Initialize Python SQLite bridge for D1 simulation
const py = spawn('python3', [path.join(__dirname, 'tools', 'db_bridge.py'), DB_FILE]);
const rl = readline.createInterface({ input: py.stdout });

let queue = [];
rl.on('line', line => {
  try {
    const data = JSON.parse(line);
    if (queue.length > 0) {
      const { resolve } = queue.shift();
      resolve(data);
    }
  } catch (err) {
    if (queue.length > 0) {
      const { reject } = queue.shift();
      reject(err);
    }
  }
});

function runDbQuery(sql, params, mode) {
  return new Promise((resolve, reject) => {
    queue.push({ resolve, reject });
    py.stdin.write(JSON.stringify({ sql, params, mode }) + '\n');
  });
}

const DB = {
  prepare(sql) {
    let boundParams = [];
    return {
      bind(...params) {
        boundParams = params;
        return this;
      },
      async first() {
        const res = await runDbQuery(sql, boundParams, 'first');
        if (!res.ok) throw new Error(res.error);
        return res.result;
      },
      async all() {
        const res = await runDbQuery(sql, boundParams, 'all');
        if (!res.ok) throw new Error(res.error);
        return { results: res.results || [] };
      },
      async run() {
        const res = await runDbQuery(sql, boundParams, 'run');
        if (!res.ok) throw new Error(res.error);
        return { meta: res.meta || { last_row_id: 0, changes: 0 } };
      }
    };
  }
};

const env = {
  DB,
  ADMIN_PASSWORD,
  SESSION_SECRET
};

// 2. Map of API Route Handlers
async function handleApiRequest(req, res, url) {
  const method = req.method.toUpperCase();
  const pathname = url.pathname;

  let bodyBuffer = [];
  for await (const chunk of req) bodyBuffer.push(chunk);
  const rawBody = Buffer.concat(bodyBuffer).toString();

  // Create Web standard Request object
  const fullUrl = url.href;
  const webRequest = new Request(fullUrl, {
    method,
    headers: req.headers,
    body: ['POST', 'PUT', 'PATCH'].includes(method) ? rawBody : undefined
  });

  try {
    let handlerResponse = null;

    // Route matching
    if (pathname === '/api/admin/login' && method === 'POST') {
      const mod = await import('./functions/api/admin/login.js');
      handlerResponse = await mod.onRequestPost({ request: webRequest, env });
    } else if (pathname === '/api/admin/logout' && method === 'POST') {
      const mod = await import('./functions/api/admin/logout.js');
      handlerResponse = await mod.onRequestPost({ request: webRequest, env });
    } else if (pathname === '/api/admin/me' && method === 'GET') {
      const mod = await import('./functions/api/admin/me.js');
      handlerResponse = await mod.onRequestGet({ request: webRequest, env });
    } else if (pathname === '/api/admin/invitations' && method === 'GET') {
      const mod = await import('./functions/api/admin/invitations.js');
      handlerResponse = await mod.onRequestGet({ request: webRequest, env });
    } else if (pathname === '/api/admin/invitations' && method === 'POST') {
      const mod = await import('./functions/api/admin/invitations.js');
      handlerResponse = await mod.onRequestPost({ request: webRequest, env });
    } else if (pathname === '/api/admin/categories' && method === 'GET') {
      const mod = await import('./functions/api/admin/categories.js');
      handlerResponse = await mod.onRequestGet({ request: webRequest, env });
    } else if (pathname === '/api/admin/categories' && method === 'POST') {
      const mod = await import('./functions/api/admin/categories.js');
      handlerResponse = await mod.onRequestPost({ request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/categories\/(\d+)\/duplicate$/) && method === 'POST') {
      const id = pathname.match(/^\/api\/admin\/categories\/(\d+)\/duplicate$/)[1];
      const mod = await import('./functions/api/admin/categories/[id]/duplicate.js');
      handlerResponse = await mod.onRequestPost({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/categories\/(\d+)$/)) {
      const id = pathname.match(/^\/api\/admin\/categories\/(\d+)$/)[1];
      const mod = await import('./functions/api/admin/categories/[id].js');
      if (method === 'GET') handlerResponse = await mod.onRequestGet({ params: { id }, request: webRequest, env });
      else if (method === 'PUT') handlerResponse = await mod.onRequestPut({ params: { id }, request: webRequest, env });
      else if (method === 'DELETE') handlerResponse = await mod.onRequestDelete({ params: { id }, request: webRequest, env });
    } else if (pathname === '/api/admin/themes' && method === 'GET') {
      const mod = await import('./functions/api/admin/themes.js');
      handlerResponse = await mod.onRequestGet({ request: webRequest, env });
    } else if (pathname === '/api/admin/themes' && method === 'POST') {
      const mod = await import('./functions/api/admin/themes.js');
      handlerResponse = await mod.onRequestPost({ request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/themes\/(\d+)$/)) {
      const id = pathname.match(/^\/api\/admin\/themes\/(\d+)$/)[1];
      const mod = await import('./functions/api/admin/themes/[id].js');
      if (method === 'PUT') handlerResponse = await mod.onRequestPut({ params: { id }, request: webRequest, env });
      else if (method === 'DELETE') handlerResponse = await mod.onRequestDelete({ params: { id }, request: webRequest, env });
    } else if (pathname === '/api/admin/templates' && method === 'GET') {
      const mod = await import('./functions/api/admin/templates.js');
      handlerResponse = await mod.onRequestGet({ request: webRequest, env });
    } else if (pathname === '/api/admin/templates' && method === 'POST') {
      const mod = await import('./functions/api/admin/templates.js');
      handlerResponse = await mod.onRequestPost({ request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/templates\/(\d+)\/apply$/) && method === 'POST') {
      const id = pathname.match(/^\/api\/admin\/templates\/(\d+)\/apply$/)[1];
      const mod = await import('./functions/api/admin/templates/[id]/apply.js');
      handlerResponse = await mod.onRequestPost({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/templates\/(\d+)$/)) {
      const id = pathname.match(/^\/api\/admin\/templates\/(\d+)$/)[1];
      const mod = await import('./functions/api/admin/templates/[id].js');
      if (method === 'GET') handlerResponse = await mod.onRequestGet({ params: { id }, request: webRequest, env });
      else if (method === 'PUT') handlerResponse = await mod.onRequestPut({ params: { id }, request: webRequest, env });
      else if (method === 'DELETE') handlerResponse = await mod.onRequestDelete({ params: { id }, request: webRequest, env });
    } else if (pathname === '/api/admin/assets' && method === 'GET') {
      const mod = await import('./functions/api/admin/assets.js');
      handlerResponse = await mod.onRequestGet({ request: webRequest, env });
    } else if (pathname === '/api/admin/assets' && method === 'POST') {
      const mod = await import('./functions/api/admin/assets.js');
      handlerResponse = await mod.onRequestPost({ request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/assets\/(\d+)$/) && method === 'DELETE') {
      const id = pathname.match(/^\/api\/admin\/assets\/(\d+)$/)[1];
      const mod = await import('./functions/api/admin/assets/[id].js');
      handlerResponse = await mod.onRequestDelete({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)\/duplicate$/) && method === 'POST') {
      const id = pathname.match(/^\/api\/admin\/invitations\/(\d+)\/duplicate$/)[1];
      const mod = await import('./functions/api/admin/invitations/[id]/duplicate.js');
      handlerResponse = await mod.onRequestPost({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)\/sections$/)) {
      const id = pathname.match(/^\/api\/admin\/invitations\/(\d+)\/sections$/)[1];
      const mod = await import('./functions/api/admin/invitations/[id]/sections.js');
      if (method === 'GET') handlerResponse = await mod.onRequestGet({ params: { id }, request: webRequest, env });
      else if (method === 'PUT') handlerResponse = await mod.onRequestPut({ params: { id }, request: webRequest, env });
      else if (method === 'POST') handlerResponse = await mod.onRequestPost({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)\/sections\/(\d+)$/)) {
      const m = pathname.match(/^\/api\/admin\/invitations\/(\d+)\/sections\/(\d+)$/);
      const mod = await import('./functions/api/admin/invitations/[id]/sections/[sectionId].js');
      if (method === 'PUT') handlerResponse = await mod.onRequestPut({ params: { id: m[1], sectionId: m[2] }, request: webRequest, env });
      else if (method === 'DELETE') handlerResponse = await mod.onRequestDelete({ params: { id: m[1], sectionId: m[2] }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)\/guests$/)) {
      const id = pathname.match(/^\/api\/admin\/invitations\/(\d+)\/guests$/)[1];
      const mod = await import('./functions/api/admin/invitations/[id]/guests.js');
      if (method === 'GET') handlerResponse = await mod.onRequestGet({ params: { id }, request: webRequest, env });
      else if (method === 'POST') handlerResponse = await mod.onRequestPost({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/guests\/(\d+)$/) && method === 'DELETE') {
      const id = pathname.match(/^\/api\/admin\/guests\/(\d+)$/)[1];
      const mod = await import('./functions/api/admin/guests/[id].js');
      handlerResponse = await mod.onRequestDelete({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)\/rsvps$/) && method === 'GET') {
      const id = pathname.match(/^\/api\/admin\/invitations\/(\d+)\/rsvps$/)[1];
      const mod = await import('./functions/api/admin/invitations/[id]/rsvps.js');
      handlerResponse = await mod.onRequestGet({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)\/stats$/) && method === 'GET') {
      const id = pathname.match(/^\/api\/admin\/invitations\/(\d+)\/stats$/)[1];
      const mod = await import('./functions/api/admin/invitations/[id]/stats.js');
      handlerResponse = await mod.onRequestGet({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)\/versions\/(\d+)\/restore$/) && method === 'POST') {
      const m = pathname.match(/^\/api\/admin\/invitations\/(\d+)\/versions\/(\d+)\/restore$/);
      const mod = await import('./functions/api/admin/invitations/[id]/versions/[versionId]/restore.js');
      handlerResponse = await mod.onRequestPost({ params: { id: m[1], versionId: m[2] }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)\/versions$/)) {
      const id = pathname.match(/^\/api\/admin\/invitations\/(\d+)\/versions$/)[1];
      const mod = await import('./functions/api/admin/invitations/[id]/versions.js');
      if (method === 'GET') handlerResponse = await mod.onRequestGet({ params: { id }, request: webRequest, env });
      else if (method === 'POST') handlerResponse = await mod.onRequestPost({ params: { id }, request: webRequest, env });
    } else if (pathname.match(/^\/api\/admin\/invitations\/(\d+)$/)) {
      const id = pathname.match(/^\/api\/admin\/invitations\/(\d+)$/)[1];
      const mod = await import('./functions/api/admin/invitations/[id].js');
      if (method === 'GET') handlerResponse = await mod.onRequestGet({ params: { id }, request: webRequest, env });
      else if (method === 'PUT') handlerResponse = await mod.onRequestPut({ params: { id }, request: webRequest, env });
      else if (method === 'DELETE') handlerResponse = await mod.onRequestDelete({ params: { id }, request: webRequest, env });
    } else if (pathname === '/api/rsvp' && method === 'POST') {
      const mod = await import('./functions/api/rsvp.js');
      handlerResponse = await mod.onRequestPost({ request: webRequest, env });
    } else if (pathname.match(/^\/api\/guestbook\/([a-z0-9-]+)$/) && method === 'GET') {
      const slug = pathname.match(/^\/api\/guestbook\/([a-z0-9-]+)$/)[1];
      const mod = await import('./functions/api/guestbook/[slug].js');
      handlerResponse = await mod.onRequestGet({ params: { slug }, env });
    } else if (pathname.match(/^\/api\/invitation\/([a-z0-9-]+)$/) && method === 'GET') {
      const slug = pathname.match(/^\/api\/invitation\/([a-z0-9-]+)$/)[1];
      const mod = await import('./functions/api/invitation/[slug].js');
      handlerResponse = await mod.onRequestGet({ params: { slug }, request: webRequest, env });
    }

    if (handlerResponse) {
      res.statusCode = handlerResponse.status;
      for (const [key, value] of handlerResponse.headers.entries()) {
        res.setHeader(key, value);
      }
      const respText = await handlerResponse.text();
      res.end(respText);
      return;
    }

    res.statusCode = 404;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint API tidak ditemukan.' }));
  } catch (err) {
    console.error("DEV-SERVER ERROR TRACE:", err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: err.message }));
  }
}

// 3. Static File Server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg'
};

function serveStatic(req, res, url) {
  let pathname = url.pathname;

  // Cloudflare _redirects emulation
  if (pathname === '/admin' || pathname === '/admin/') {
    pathname = '/admin.html';
  } else if (pathname === '/' || pathname.startsWith('/i/')) {
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, 'public', pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.statusCode = 200;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('content-type', contentType);
  fs.createReadStream(filePath).pipe(res);
}

// 4. Server Lifecycle Export
let serverInstance = null;

export function startServer(port = PORT) {
  return new Promise(resolve => {
    serverInstance = http.createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      if (url.pathname.startsWith('/api/')) {
        handleApiRequest(req, res, url);
      } else {
        serveStatic(req, res, url);
      }
    });

    serverInstance.listen(port, () => {
      console.log(`\n======================================================`);
      console.log(`✨ UNDANGAN V2 - PLATFORM UNDANGAN MULTI-ACARA - DEV SERVER BERJALAN`);
      console.log(`🌐 URL Undangan: http://127.0.0.1:${port}/i/demo`);
      console.log(`🔑 Dashboard Admin: http://127.0.0.1:${port}/admin`);
      console.log(`🔒 Password Admin: ${ADMIN_PASSWORD}`);
      console.log(`💾 Database SQLite: ${DB_FILE}`);
      console.log(`======================================================\n`);
      resolve(serverInstance);
    });
  });
}

export function stopServer() {
  return new Promise(resolve => {
    py.kill();
    if (serverInstance) {
      serverInstance.close(() => resolve());
    } else {
      resolve();
    }
  });
}

// Auto-run when executed directly via `node dev-server.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
  process.on('SIGINT', () => stopServer().then(() => process.exit()));
  process.on('SIGTERM', () => stopServer().then(() => process.exit()));
}

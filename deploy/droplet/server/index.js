// Runs the Netlify Functions in netlify/functions on a plain Node server, so the
// frontend's existing "/.netlify/functions/<name>" calls keep working on a
// droplet. Caddy proxies that path here; this server is never exposed directly.
//
// No npm dependencies: Node 18 built-ins only. "@netlify/blobs" is redirected
// to ./blobs-shim.js, which stores data on disk under BLOBS_DIR.

const http = require('http');
const path = require('path');
const fs = require('fs');
const Module = require('module');

const PORT = Number(process.env.PORT || 8888);
const FUNCTIONS_DIR = path.resolve(process.env.FUNCTIONS_DIR || path.join(__dirname, '..', 'netlify', 'functions'));
const MAX_BODY_BYTES = 1024 * 1024;
const ROUTE = /^\/\.netlify\/functions\/([a-z0-9_-]+)\/?$/i;

// Point require('@netlify/blobs') at the filesystem shim.
const shimPath = path.join(__dirname, 'blobs-shim.js');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolve(request, ...rest) {
    if (request === '@netlify/blobs') return shimPath;
    return originalResolve.call(this, request, ...rest);
};

// Load every top-level function file once at startup.
const handlers = {};
fs.readdirSync(FUNCTIONS_DIR)
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const name = path.basename(file, '.js');
        const mod = require(path.join(FUNCTIONS_DIR, file));
        if (typeof mod.handler === 'function') handlers[name] = mod.handler;
    });

const readBody = req =>
    new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        req.on('data', chunk => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });

const send = (res, statusCode, headers, body) => {
    res.writeHead(statusCode, headers);
    res.end(body);
};

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/healthz') return send(res, 200, { 'content-type': 'text/plain' }, 'ok');

    const match = url.pathname.match(ROUTE);
    const handler = match && handlers[match[1]];
    if (!handler) return send(res, 404, { 'content-type': 'text/plain' }, 'Not Found');

    try {
        const body = await readBody(req);
        const headers = { ...req.headers };
        // Netlify's client-IP header; Caddy sets X-Real-IP / X-Forwarded-For.
        const clientIp = headers['x-real-ip'] || String(headers['x-forwarded-for'] || '').split(',')[0].trim();
        if (clientIp) headers['x-nf-client-connection-ip'] = clientIp;

        const event = {
            httpMethod: req.method,
            path: url.pathname,
            rawUrl: url.toString(),
            headers,
            queryStringParameters: Object.fromEntries(url.searchParams),
            body,
            isBase64Encoded: false,
        };

        const result = (await handler(event, {})) || {};
        const responseHeaders = { ...(result.headers || {}) };
        Object.entries(result.multiValueHeaders || {}).forEach(([key, values]) => {
            responseHeaders[key] = values;
        });
        const responseBody = result.isBase64Encoded
            ? Buffer.from(result.body || '', 'base64')
            : result.body == null
            ? ''
            : String(result.body);
        return send(res, result.statusCode || 200, responseHeaders, responseBody);
    } catch (err) {
        console.error(`[functions] ${match[1]} failed`, err);
        return send(res, err.statusCode || 500, { 'content-type': 'text/plain' }, err.statusCode ? err.message : 'error');
    }
});

server.listen(PORT, () => {
    console.log(`[functions] listening on :${PORT} — ${Object.keys(handlers).sort().join(', ')}`);
});

// Filesystem stand-in for @netlify/blobs so the functions in netlify/functions
// run unchanged on a plain server. Covers the subset of the Store API those
// functions use: get / set / setJSON / append / delete / list.
//
// Layout: <BLOBS_DIR>/<store name>/<key>. Keys may contain "/" (e.g.
// "ent/acct/CR123.json"), which become sub-directories. Back this directory up.

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const BLOBS_DIR = path.resolve(process.env.BLOBS_DIR || path.join(__dirname, '..', 'data', 'blobs'));

const safeName = value => {
    const name = String(value || '').trim();
    if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
        throw new Error(`Invalid blob store name: ${value}`);
    }
    return name;
};

class FileStore {
    constructor(name) {
        this.root = path.join(BLOBS_DIR, safeName(name));
        fs.mkdirSync(this.root, { recursive: true });
    }

    // Resolve a key to a file path, refusing anything that escapes the store.
    resolve(key) {
        const file = path.resolve(this.root, String(key));
        if (file !== this.root && !file.startsWith(this.root + path.sep)) {
            throw new Error(`Invalid blob key: ${key}`);
        }
        return file;
    }

    async get(key, options = {}) {
        let raw;
        try {
            raw = await fsp.readFile(this.resolve(key));
        } catch (err) {
            if (err.code === 'ENOENT') return null;
            throw err;
        }
        switch (options.type) {
            case 'json':
                return JSON.parse(raw.toString('utf8'));
            case 'arrayBuffer':
                return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
            case 'blob':
                return new Blob([raw]);
            default:
                return raw.toString('utf8');
        }
    }

    // Write to a temp file then rename, so readers never see a half-written blob.
    async set(key, value) {
        const file = this.resolve(key);
        await fsp.mkdir(path.dirname(file), { recursive: true });
        const tmp = `${file}.${crypto.randomBytes(6).toString('hex')}.tmp`;
        const data = typeof value === 'string' || Buffer.isBuffer(value) ? value : Buffer.from(await value.arrayBuffer());
        await fsp.writeFile(tmp, data);
        await fsp.rename(tmp, file);
    }

    async setJSON(key, value) {
        await this.set(key, JSON.stringify(value));
    }

    async append(key, value) {
        const file = this.resolve(key);
        await fsp.mkdir(path.dirname(file), { recursive: true });
        await fsp.appendFile(file, value);
    }

    async delete(key) {
        await fsp.rm(this.resolve(key), { force: true });
    }

    async list(options = {}) {
        const prefix = options.prefix || '';
        const blobs = [];
        const walk = async dir => {
            let entries;
            try {
                entries = await fsp.readdir(dir, { withFileTypes: true });
            } catch (err) {
                if (err.code === 'ENOENT') return;
                throw err;
            }
            for (const entry of entries) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) await walk(full);
                else if (!entry.name.endsWith('.tmp')) {
                    const key = path.relative(this.root, full).split(path.sep).join('/');
                    if (key.startsWith(prefix)) blobs.push({ key, etag: '' });
                }
            }
        };
        await walk(this.root);
        return { blobs, directories: [] };
    }
}

const stores = new Map();

const getStore = input => {
    const name = typeof input === 'string' ? input : input && input.name;
    if (!stores.has(name)) stores.set(name, new FileStore(name));
    return stores.get(name);
};

module.exports = { getStore, BLOBS_DIR };

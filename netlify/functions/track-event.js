// Netlify Function: track-event
// Purpose: receive client-side analytics events and persist them server-side

// eslint-disable-next-line import/no-unresolved
const { getStore } = require('@netlify/blobs');

exports.handler = async event => {
    try {
        if (event.httpMethod !== 'POST') {
            return { statusCode: 405, body: 'Method Not Allowed' };
        }

        const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || '';
        const ua = event.headers['user-agent'] || '';
        const contentType = (event.headers['content-type'] || '').toLowerCase();

        let payloadStr = event.body || '';
        // Lightweight validation to avoid logging huge bodies
        if (payloadStr.length > 20 * 1024) {
            payloadStr = payloadStr.slice(0, 20 * 1024);
        }

        let data;
        try {
            data = contentType.includes('application/json')
                ? JSON.parse(payloadStr || '{}')
                : JSON.parse(payloadStr || '{}');
        } catch (_) {
            data = { raw: payloadStr };
        }

        const now = new Date();
        const dayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const ts = now.toISOString();

        const record = {
            ts,
            ip,
            ua,
            type: data.type || 'unknown',
            meta: data.meta || {},
        };

        // Persist as JSONL in a per-day blob store (be defensive if Blobs unavailable)
        try {
            const store = getStore({ name: 'events' });
            const blobKey = `${dayKey}.jsonl`;
            await store.append(blobKey, `${JSON.stringify(record)}\n`, {
                addRandomSuffix: false,
                contentType: 'application/jsonl',
            });
            // eslint-disable-next-line no-console
            console.log('[track-event][ok]', record.type);
            return { statusCode: 204, body: '' };
        } catch (persistErr) {
            // eslint-disable-next-line no-console
            console.error('[track-event] blobs persist error', persistErr);
            // Accept the event but drop storage to avoid breaking user flow
            return { statusCode: 202, body: '' };
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[track-event] error', e);
        return { statusCode: 500, body: 'error' };
    }
};

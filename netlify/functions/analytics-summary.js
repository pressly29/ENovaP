// Netlify Function: analytics-summary
// Purpose: Aggregate recent analytics events from blobs and return KPIs
// Security: Requires x-admin-token header matching process.env.ADMIN_ANALYTICS_TOKEN

// eslint-disable-next-line import/no-unresolved
const { getStore } = require('@netlify/blobs');

const DAYS = 7;

exports.handler = async event => {
    try {
        if (event.httpMethod !== 'GET') {
            return { statusCode: 405, body: 'Method Not Allowed' };
        }
        const admin_token = process.env.ADMIN_ANALYTICS_TOKEN || '';
        const provided = (event.headers && (event.headers['x-admin-token'] || event.headers['X-Admin-Token'])) || '';
        if (!admin_token || provided !== admin_token) {
            return { statusCode: 403, body: 'Forbidden' };
        }
        // Be defensive: if Blobs is unavailable or throws, return an empty summary instead of 500
        let store;
        try {
            store = getStore({ name: 'events' });
        } catch (storeErr) {
            // eslint-disable-next-line no-console
            console.error('[analytics-summary] blobs store init error', storeErr);
            return {
                statusCode: 200,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ totals: { login: 0, signup: 0, other: 0 }, daily: [] }),
            };
        }
        const today = new Date();
        const days = Array.from({ length: DAYS }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d.toISOString().slice(0, 10);
        });
        const totals = { login: 0, signup: 0, other: 0 };

        const daily = await Promise.all(
            days.map(async day => {
                try {
                    const key = `${day}.jsonl`;
                    const blob = await store.get(key);
                    if (!blob) return { day, login: 0, signup: 0, other: 0 };
                    const text = await blob.text();
                    let login = 0;
                    let signup = 0;
                    let other = 0;
                    text.split('\n')
                        .filter(Boolean)
                        .forEach(line => {
                            try {
                                const evt = JSON.parse(line);
                                if (evt.type === 'login') login++;
                                else if (evt.type === 'signup') signup++;
                                else other++;
                            } catch (_) {
                                /* ignore parse error */
                            }
                        });
                    totals.login += login;
                    totals.signup += signup;
                    totals.other += other;
                    return { day, login, signup, other };
                } catch (readErr) {
                    // eslint-disable-next-line no-console
                    console.error(`[analytics-summary] read error for day ${day}`, readErr);
                    return { day, login: 0, signup: 0, other: 0 };
                }
            })
        );

        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ totals, daily }),
        };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[analytics-summary] error', e);
        // Return an empty summary to avoid breaking the dashboard UI on transient errors
        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ totals: { login: 0, signup: 0, other: 0 }, daily: [] }),
        };
    }
};

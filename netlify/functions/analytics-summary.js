// Netlify Function: analytics-summary
// Purpose: Aggregate recent analytics events from blobs and return KPIs
// Security: Requires x-admin-token header matching process.env.ADMIN_ANALYTICS_TOKEN

// eslint-disable-next-line import/no-unresolved
const { getStore } = require('@netlify/blobs');

const DEFAULT_DAYS = 7;
const MAX_DAYS = 30;

exports.handler = async event => {
    try {
        if (event.httpMethod !== 'GET') {
            return { statusCode: 405, body: 'Method Not Allowed' };
        }
        const admin_token = process.env.ADMIN_ANALYTICS_TOKEN || '';
        const provided = (event.headers && (event.headers['x-admin-token'] || event.headers['X-Admin-Token'])) || '';

        if (!admin_token || !provided) {
            return { statusCode: 401, body: 'Unauthorized' };
        }

        if (provided !== admin_token) {
            console.warn('[analytics-summary] failed auth attempt from IP:', event.requestContext?.identity?.sourceIp);
            return { statusCode: 403, body: 'Forbidden' };
        }
        // Query params
        const qs = (event && event.queryStringParameters) || {};
        let daysRequested = parseInt(qs.days);
        if (!Number.isFinite(daysRequested) || daysRequested <= 0) daysRequested = DEFAULT_DAYS;
        if (daysRequested > MAX_DAYS) daysRequested = MAX_DAYS;
        const filterType = typeof qs.type === 'string' && qs.type ? String(qs.type) : null;

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
        const days = Array.from({ length: daysRequested }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d.toISOString().slice(0, 10);
        });
        const totals = { login: 0, signup: 0, other: 0 };
        const top_types = new Map();
        const unique_ips = new Set();
        const recent = [];

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
                                if (filterType && evt.type !== filterType) return;
                                if (evt.type === 'login') login++;
                                else if (evt.type === 'signup') signup++;
                                else other++;
                                // aggregate top types
                                const prev = top_types.get(evt.type) || 0;
                                top_types.set(evt.type, prev + 1);
                                if (evt.ip) unique_ips.add(evt.ip);
                                // collect recent (keep up to 50 overall; we'll trim later)
                                if (evt.ts) {
                                    recent.push({ ts: evt.ts, type: evt.type, meta: evt.meta || {} });
                                }
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

        // Sort and trim recents (latest first, max 50)
        recent.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));
        if (recent.length > 50) recent.length = 50;

        // Convert top_types to array and sort desc
        const topTypesArr = Array.from(top_types.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const signup_rate = totals.login > 0 ? Number((totals.signup / totals.login).toFixed(3)) : 0;

        return {
            statusCode: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                totals,
                daily,
                meta: {
                    days: daysRequested,
                    filterType: filterType || null,
                },
                derived: {
                    signup_rate,
                    unique_ips: unique_ips.size,
                    top_types: topTypesArr,
                },
                recent,
            }),
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

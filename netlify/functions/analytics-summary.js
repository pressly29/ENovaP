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
        const provided = event.headers['x-admin-token'] || '';
        if (!admin_token || provided !== admin_token) {
            return { statusCode: 403, body: 'Forbidden' };
        }
        const store = getStore({ name: 'events' });
        const today = new Date();
        const days = Array.from({ length: DAYS }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d.toISOString().slice(0, 10);
        });
        const totals = { login: 0, signup: 0, other: 0 };

        const daily = await Promise.all(
            days.map(async day => {
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
        return { statusCode: 500, body: 'error' };
    }
};

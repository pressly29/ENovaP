// Netlify Function: sales-report
// Admin-only sales ledger, aggregated from the monthly JSONL blobs written on
// every confirmed Paystack charge. Same auth pattern as analytics-summary:
// requires the x-admin-token header to match ADMIN_ANALYTICS_TOKEN.
//
// GET ?months=3  (1–12, default 3)
// → { totals: { count, by_currency, by_bot }, sales: [...] }

const { readMonthlySales } = require('./lib/payments-store');

const MAX_MONTHS = 12;

exports.handler = async event => {
    const respond = (statusCode, body) => ({
        statusCode,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    });

    try {
        if (event.httpMethod !== 'GET') return respond(405, 'Method Not Allowed');

        const adminToken = process.env.ADMIN_ANALYTICS_TOKEN || '';
        const provided = (event.headers && (event.headers['x-admin-token'] || event.headers['X-Admin-Token'])) || '';
        if (!adminToken || !provided) return respond(401, 'Unauthorized');
        if (provided !== adminToken) {
            console.warn('[sales-report] failed auth attempt');
            return respond(403, 'Forbidden');
        }

        let months = parseInt((event.queryStringParameters || {}).months, 10);
        if (!Number.isFinite(months) || months <= 0) months = 3;
        if (months > MAX_MONTHS) months = MAX_MONTHS;

        const now = new Date();
        const monthKeys = Array.from({ length: months }, (_, i) => {
            const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
            return d.toISOString().slice(0, 7); // YYYY-MM
        });

        const sales = await readMonthlySales(monthKeys);
        sales.sort((a, b) => String(b.paid_at).localeCompare(String(a.paid_at)));

        const byCurrency = {};
        const byBot = {};
        sales.forEach(sale => {
            const cur = sale.currency || 'UNKNOWN';
            byCurrency[cur] = (byCurrency[cur] || 0) + (Number(sale.amount) || 0);
            const bot = sale.bot_name || `bot ${sale.bot_id}`;
            byBot[bot] = (byBot[bot] || 0) + 1;
        });

        return respond(200, {
            months: monthKeys,
            totals: { count: sales.length, by_currency: byCurrency, by_bot: byBot },
            sales,
        });
    } catch (err) {
        console.error('[sales-report] error', err);
        return respond(500, 'error');
    }
};

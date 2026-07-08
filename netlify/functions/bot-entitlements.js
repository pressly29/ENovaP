// Netlify Function: bot-entitlements
// Tells the client which premium bots the current trader has unlocked, plus
// the public price catalog (so cards always display the price the server
// would actually charge).
//
// GET ?loginid=CR123&email=trader@example.com
// → { unlocked: [8, 11], catalog: { '8': { name, amount, currency, display }, ... } }

const { getEntitlements, normalizeLoginid, normalizeEmail } = require('./lib/payments-store');
const { getPublicCatalog } = require('./lib/premium-catalog');

exports.handler = async event => {
    const respond = (statusCode, body) => ({
        statusCode,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        body: JSON.stringify(body),
    });

    try {
        if (event.httpMethod !== 'GET') return respond(405, { error: 'Method Not Allowed' });

        const qs = event.queryStringParameters || {};
        const loginid = normalizeLoginid(qs.loginid);
        const email = normalizeEmail(qs.email);

        const catalog = getPublicCatalog();

        if (!loginid && !email) return respond(200, { unlocked: [], catalog });

        const bots = await getEntitlements({ loginid, email });
        const unlocked = Object.keys(bots)
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b);

        return respond(200, { unlocked, catalog });
    } catch (err) {
        console.error('[bot-entitlements] error', err);
        return respond(500, { error: 'Could not load entitlements' });
    }
};

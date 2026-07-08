// Netlify Function: paystack-initiate
// Starts a Paystack checkout for a premium bot. The client sends only WHICH
// bot it wants — the price always comes from the server-side catalog.
//
// POST { bot_id: number, email: string, loginid?: string, return_path?: string }
// →    { authorization_url, reference }

const { getPrice, getPremiumBot } = require('./lib/premium-catalog');
const { initializeTransaction } = require('./lib/paystack');
const { normalizeLoginid, normalizeEmail } = require('./lib/payments-store');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Paystack references: alphanumeric plus -.,= only.
const buildReference = (botId, loginid) => {
    const rand = Math.random().toString(36).slice(2, 8);
    const acct = (loginid || 'guest').replace(/[^a-zA-Z0-9]/g, '');
    return `enova-bot${botId}-${acct}-${Date.now()}-${rand}`;
};

// Only allow same-site callback paths so the payment flow can never be
// redirected to a third-party origin.
const buildCallbackUrl = returnPath => {
    const site = process.env.URL || 'https://evpnova.com';
    const path = typeof returnPath === 'string' && returnPath.startsWith('/') && !returnPath.startsWith('//')
        ? returnPath
        : '/';
    return `${site}${path}`;
};

exports.handler = async event => {
    const respond = (statusCode, body) => ({
        statusCode,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        body: JSON.stringify(body),
    });

    try {
        if (event.httpMethod !== 'POST') return respond(405, { error: 'Method Not Allowed' });

        let payload;
        try {
            payload = JSON.parse(event.body || '{}');
        } catch (_) {
            return respond(400, { error: 'Invalid JSON body' });
        }

        const botId = Number(payload.bot_id);
        const email = normalizeEmail(payload.email);
        const loginid = normalizeLoginid(payload.loginid);

        const bot = getPremiumBot(botId);
        const price = getPrice(botId);
        if (!bot || !price) return respond(400, { error: 'This bot is not available for purchase' });
        if (!EMAIL_RE.test(email)) return respond(400, { error: 'A valid email is required' });

        const reference = buildReference(botId, loginid);
        const data = await initializeTransaction({
            email,
            amount: price.amount_subunit,
            currency: price.currency,
            reference,
            callback_url: buildCallbackUrl(payload.return_path),
            metadata: {
                bot_id: botId,
                bot_name: bot.name,
                loginid,
                email,
                custom_fields: [
                    { display_name: 'Bot', variable_name: 'bot', value: bot.name },
                    { display_name: 'Deriv account', variable_name: 'deriv_account', value: loginid || 'n/a' },
                ],
            },
        });

        return respond(200, { authorization_url: data.authorization_url, reference: data.reference });
    } catch (err) {
        console.error('[paystack-initiate] error', err);
        return respond(502, { error: 'Could not start checkout. Please try again.' });
    }
};

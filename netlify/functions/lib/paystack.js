// Thin Paystack API client + the shared "record a verified charge" routine
// used by both the webhook and the client-side verify callback.
//
// PAYSTACK_SECRET_KEY (sk_test_... / sk_live_...) lives ONLY in Netlify env
// vars — it must never appear in this public repo or in client code.

const crypto = require('crypto');
const { getPrice, getPremiumBot } = require('./premium-catalog');
const { recordSale } = require('./payments-store');
const { sendCompanyReceipt } = require('./receipts');

const PAYSTACK_BASE = 'https://api.paystack.co';

const getSecretKey = () => process.env.PAYSTACK_SECRET_KEY || '';

const paystackRequest = async (path, options = {}) => {
    const secret = getSecretKey();
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not configured');

    const res = await fetch(`${PAYSTACK_BASE}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.status === false) {
        const message = (body && body.message) || `Paystack request failed (${res.status})`;
        const err = new Error(message);
        err.statusCode = res.status;
        throw err;
    }
    return body.data;
};

const initializeTransaction = payload =>
    paystackRequest('/transaction/initialize', { method: 'POST', body: JSON.stringify(payload) });

const verifyTransaction = reference =>
    paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);

// Webhook authenticity: HMAC-SHA512 of the raw body with the secret key must
// equal the x-paystack-signature header.
const isValidWebhookSignature = (rawBody, signature) => {
    const secret = getSecretKey();
    if (!secret || !signature) return false;
    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(String(signature), 'hex'));
    } catch (_) {
        return false;
    }
};

// Takes a Paystack transaction object (from webhook event.data or the verify
// endpoint), validates it against our catalog, and persists it idempotently.
// Returns { ok, bot_id, recorded } — recorded=false means it was a duplicate.
const processVerifiedTransaction = async tx => {
    if (!tx || tx.status !== 'success') return { ok: false, reason: 'not_successful' };

    const metadata = tx.metadata || {};
    const botId = Number(metadata.bot_id);
    const catalogEntry = getPremiumBot(botId);
    const price = getPrice(botId);
    if (!catalogEntry || !price) return { ok: false, reason: 'unknown_bot' };

    // The charge must cover the catalog price in the expected currency —
    // rejects tampered/underpaid transactions replayed at our endpoints.
    if (String(tx.currency).toUpperCase() !== price.currency || Number(tx.amount) < price.amount_subunit) {
        console.warn('[paystack] amount/currency mismatch', tx.reference, tx.amount, tx.currency);
        return { ok: false, reason: 'amount_mismatch' };
    }

    const sale = {
        reference: tx.reference,
        bot_id: botId,
        bot_name: catalogEntry.name,
        email: (tx.customer && tx.customer.email) || metadata.email || '',
        loginid: metadata.loginid || '',
        amount: Number(tx.amount) / 100,
        currency: String(tx.currency).toUpperCase(),
        channel: tx.channel || '',
        paid_at: tx.paid_at || tx.paidAt || new Date().toISOString(),
        gateway_response: tx.gateway_response || '',
        recorded_at: new Date().toISOString(),
    };

    const outcome = await recordSale(sale);
    if (outcome === 'recorded') {
        await sendCompanyReceipt(sale); // best-effort, never throws
    }
    return { ok: true, bot_id: botId, recorded: outcome === 'recorded' };
};

module.exports = {
    initializeTransaction,
    verifyTransaction,
    isValidWebhookSignature,
    processVerifiedTransaction,
};

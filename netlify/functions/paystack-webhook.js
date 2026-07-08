// Netlify Function: paystack-webhook
// Paystack calls this for every event on the account. Configure the URL in
// Paystack Dashboard → Settings → API Keys & Webhooks:
//   https://evpnova.com/.netlify/functions/paystack-webhook
//
// Security: the request is only trusted if its x-paystack-signature header is
// a valid HMAC-SHA512 of the raw body with our secret key. On charge.success
// the sale is recorded (idempotently) and the company receipt email is sent.

const { isValidWebhookSignature, processVerifiedTransaction } = require('./lib/paystack');

exports.handler = async event => {
    try {
        if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

        const signature =
            (event.headers && (event.headers['x-paystack-signature'] || event.headers['X-Paystack-Signature'])) || '';
        const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';

        if (!isValidWebhookSignature(rawBody, signature)) {
            console.warn('[paystack-webhook] invalid signature');
            return { statusCode: 401, body: 'Invalid signature' };
        }

        let webhookEvent;
        try {
            webhookEvent = JSON.parse(rawBody);
        } catch (_) {
            return { statusCode: 400, body: 'Invalid payload' };
        }

        if (webhookEvent.event === 'charge.success') {
            const result = await processVerifiedTransaction(webhookEvent.data);
            console.log('[paystack-webhook] charge.success', webhookEvent.data && webhookEvent.data.reference, result);
        } else {
            console.log('[paystack-webhook] ignored event', webhookEvent.event);
        }

        // Always 200 for authenticated events so Paystack stops retrying.
        return { statusCode: 200, body: 'ok' };
    } catch (err) {
        console.error('[paystack-webhook] error', err);
        // Non-200 → Paystack retries later, which is what we want on our failure.
        return { statusCode: 500, body: 'error' };
    }
};

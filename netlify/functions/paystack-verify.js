// Netlify Function: paystack-verify
// Called by the client when Paystack redirects back with ?reference=...
// Verifies the charge directly against the Paystack API (never trusts the
// query string alone) and records it if the webhook hasn't already.
//
// GET ?reference=<ref> → { status: 'success' | 'pending' | 'failed', bot_id? }

const { verifyTransaction, processVerifiedTransaction } = require('./lib/paystack');

exports.handler = async event => {
    const respond = (statusCode, body) => ({
        statusCode,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        body: JSON.stringify(body),
    });

    try {
        if (event.httpMethod !== 'GET') return respond(405, { error: 'Method Not Allowed' });

        const reference = ((event.queryStringParameters || {}).reference || '').trim();
        if (!reference || reference.length > 128) return respond(400, { error: 'Missing reference' });

        const tx = await verifyTransaction(reference);

        if (tx.status === 'success') {
            const result = await processVerifiedTransaction(tx);
            if (result.ok) return respond(200, { status: 'success', bot_id: result.bot_id });
            // Paid but failed our catalog checks — surface as failed, ops can
            // inspect the reference in the Paystack dashboard.
            console.warn('[paystack-verify] success tx rejected', reference, result.reason);
            return respond(200, { status: 'failed' });
        }

        if (tx.status === 'abandoned' || tx.status === 'failed') return respond(200, { status: 'failed' });
        return respond(200, { status: 'pending' });
    } catch (err) {
        console.error('[paystack-verify] error', err);
        return respond(502, { error: 'Verification failed. Please try again.' });
    }
};

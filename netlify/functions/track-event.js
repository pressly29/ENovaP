// Netlify Function: track-event
// Purpose: receive client-side analytics events and log them server-side

exports.handler = async event => {
    try {
        if (event.httpMethod !== 'POST') {
            return { statusCode: 405, body: 'Method Not Allowed' };
        }

        const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || '';
        const ua = event.headers['user-agent'] || '';
        const contentType = event.headers['content-type'] || '';

        let payloadStr = '';
        if (contentType.startsWith('application/json')) {
            payloadStr = event.body || '';
        } else {
            // support sendBeacon with text/plain
            payloadStr = event.body || '';
        }

        // Lightweight validation to avoid logging huge bodies
        if (payloadStr.length > 20 * 1024) {
            payloadStr = payloadStr.slice(0, 20 * 1024);
        }

        // Write to logs; can be replaced with persistent storage later
        // eslint-disable-next-line no-console
        console.log('[track-event]', { ip, ua, payload: payloadStr });

        return { statusCode: 204, body: '' };
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[track-event] error', e);
        return { statusCode: 500, body: 'error' };
    }
};

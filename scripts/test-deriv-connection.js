/* eslint-disable no-console */
// Quick Deriv WebSocket connectivity test
// Uses app_id from env (no defaults embedded to avoid exposing IDs in code)
const WebSocket = require('ws');

const APP_ID = process.env.REACT_APP_DERIV_APP_ID;
if (!APP_ID) {
    console.error('[DerivTest] Missing REACT_APP_DERIV_APP_ID');
    process.exit(1);
}
const WS_URL = `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`;

console.log('[DerivTest] Connecting to', WS_URL);
const ws = new WebSocket(WS_URL);

const timeout = setTimeout(() => {
    console.error('[DerivTest] Timeout: No response within 10s');
    process.exit(1);
}, 10000);

ws.on('open', () => {
    console.log('[DerivTest] Connected. Requesting active_symbols...');
    ws.send(JSON.stringify({ active_symbols: 'brief', product_type: 'basic' }));
});

ws.on('message', raw => {
    try {
        const msg = JSON.parse(raw.toString());
        if (msg.msg_type === 'active_symbols') {
            const count = (msg.active_symbols || []).length;
            console.log(`[DerivTest] Received active_symbols: ${count} symbols`);
            clearTimeout(timeout);
            ws.close();
            process.exit(0);
        } else if (msg.msg_type === 'error') {
            console.error('[DerivTest] Error:', msg.error?.message || msg.error);
            clearTimeout(timeout);
            process.exit(2);
        }
    } catch (e) {
        console.error('[DerivTest] Parse error:', e.message);
    }
});

ws.on('error', err => {
    console.error('[DerivTest] WebSocket error:', err.message);
});

ws.on('close', () => {
    console.log('[DerivTest] Connection closed');
});

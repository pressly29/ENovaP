import { getApiV4BaseUrl, getAppId } from '@deriv/shared';

import { getRemovedMethod, removedMethodResponse, transformRequest, transformResponse } from './compat';

// Same storage the core's OAuth service (packages/core/src/Services/oauth.ts) writes.
const AUTH_INFO_KEY = 'auth_info';

export const getAccessToken = () => {
    try {
        const info = JSON.parse(sessionStorage.getItem(AUTH_INFO_KEY) ?? 'null');
        if (!info?.access_token) return null;
        if (info.expires_at && Date.now() >= info.expires_at) return null;
        return info.access_token;
    } catch {
        return null;
    }
};

export const getActiveAccountId = () => {
    if (!getAccessToken()) return null;
    const id = sessionStorage.getItem('active_loginid') || localStorage.getItem('active_loginid');
    return id && id !== 'null' ? id : null;
};

const restHeaders = () => ({
    Authorization: `Bearer ${getAccessToken()}`,
    'Deriv-App-ID': String(getAppId()),
});

/** GET /trading/v1/options/accounts — all Options accounts of the logged-in user. */
export const fetchAccounts = async () => {
    const res = await fetch(`${getApiV4BaseUrl()}/trading/v1/options/accounts`, { headers: restHeaders() });
    if (!res.ok) throw new Error(`fetchAccounts failed: ${res.status}`);
    return (await res.json()).data ?? [];
};

/** Account details in the shape the engine used to get from `authorize`. */
export const fetchAccountInfo = async account_id => {
    const accounts = await fetchAccounts();
    const account = accounts.find(a => a.account_id === account_id) ?? accounts[0];
    if (!account) return {};
    return {
        loginid: account.account_id,
        currency: account.currency,
        balance: account.balance,
        email: account.email,
        fullname: account.name,
        is_virtual: account.account_type === 'demo' ? 1 : 0,
        account_type: account.account_type,
        landing_company_name: account.group,
    };
};

export const getPublicSocketUrl = () =>
    `${getApiV4BaseUrl().replace(/^https?:\/\//, 'wss://')}/trading/v1/options/ws/public`;

/**
 * Logged in: a fresh single-use OTP URL for the active account (valid 120 s,
 * so it must be fetched right before connecting). Logged out, or when
 * `authenticated` is false: the public market-data endpoint.
 */
export const getSocketUrl = async ({ authenticated = true } = {}) => {
    const account_id = authenticated ? getActiveAccountId() : null;
    if (!account_id) return getPublicSocketUrl();

    const res = await fetch(`${getApiV4BaseUrl()}/trading/v1/options/accounts/${account_id}/otp`, {
        method: 'POST',
        headers: restHeaders(),
    });
    if (!res.ok) throw new Error(`OTP request failed: ${res.status}`);
    const url = (await res.json())?.data?.url;
    if (!url) throw new Error('OTP response did not include a WebSocket URL');
    return url;
};

const HANDLERS = ['onopen', 'onclose', 'onerror'];

/**
 * WebSocket stand-in handed to DerivAPIBasic.
 *
 * - Accepts a URL or a promise of one, so a connection object exists
 *   synchronously while the OTP URL is still being fetched (callers read
 *   `api_base.api` right after init). It reports CONNECTING until then and
 *   buffers anything sent early.
 * - DerivAPIBasic assigns `connection.onmessage` and calls `connection.send()`,
 *   so translating here lets the engine keep speaking the legacy format.
 */
export class CompatSocket {
    constructor(url_or_promise) {
        this.socket = null;
        this.pending = [];
        this.handlers = {};
        this.onmessage = null;

        Promise.resolve(url_or_promise)
            .catch(error => {
                // eslint-disable-next-line no-console
                console.error('[bot] Falling back to public market data:', error);
                return getPublicSocketUrl();
            })
            .then(url => this.open(url));
    }

    open(url) {
        this.socket = new WebSocket(url);
        HANDLERS.forEach(name => {
            if (this.handlers[name]) this.socket[name] = this.handlers[name];
        });
        this.socket.addEventListener('open', () => {
            this.pending.forEach(raw => this.socket.send(raw));
            this.pending = [];
        });
        this.socket.onmessage = event => {
            if (!this.onmessage) return;
            let data = event.data;
            try {
                data = JSON.stringify(transformResponse(JSON.parse(event.data)));
            } catch {
                // pass non-JSON frames through untouched
            }
            this.onmessage({ data });
        };
    }

    send(raw) {
        let request;
        try {
            request = JSON.parse(raw);
        } catch {
            this.rawSend(raw);
            return;
        }
        const removed = getRemovedMethod(request);
        if (removed) {
            const reply = JSON.stringify(removedMethodResponse(request, removed));
            setTimeout(() => this.onmessage?.({ data: reply }), 0);
            return;
        }
        this.rawSend(JSON.stringify(transformRequest(request)));
    }

    rawSend(raw) {
        if (this.socket?.readyState === 1) this.socket.send(raw);
        else this.pending.push(raw);
    }

    close(...args) {
        this.socket?.close(...args);
    }

    get readyState() {
        return this.socket ? this.socket.readyState : 0;
    }

    get url() {
        return this.socket?.url;
    }
}

HANDLERS.forEach(name => {
    Object.defineProperty(CompatSocket.prototype, name, {
        get() {
            return this.handlers[name];
        },
        set(fn) {
            this.handlers[name] = fn;
            if (this.socket) this.socket[name] = fn;
        },
    });
});

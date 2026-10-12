import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';

import APIMiddleware from './api-middleware';
import { CompatSocket, getAccessToken, getActiveAccountId, getSocketUrl } from './v4/connection';

/**
 * Opens a bot API connection on the new Deriv API: an OTP-authenticated socket
 * for the active account when logged in (and `authenticated`), otherwise the
 * public market-data socket. Returns immediately; the socket connects once the
 * OTP URL has been fetched.
 */
export const generateDerivApiInstance = ({ authenticated = true } = {}) => {
    const deriv_socket = new CompatSocket(getSocketUrl({ authenticated }));
    return new DerivAPIBasic({
        connection: deriv_socket,
        middleware: new APIMiddleware({}),
    });
};

export const getLoginId = () => getActiveAccountId();

// `token` is the OAuth access token of the logged-in user (one token covers all
// of their accounts on the new API).
export const getToken = () => ({
    token: getAccessToken() || undefined,
    account_id: getActiveAccountId() || undefined,
});

export const getLiveAccToken = account_id => ({
    token: getAccessToken() || undefined,
    account_id: account_id || undefined,
});

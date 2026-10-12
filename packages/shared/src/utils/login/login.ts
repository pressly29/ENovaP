import { getAuthBaseUrl, getOAuthAppId, getOAuthClientId, getOAuthRedirectUri, getSignupUrl } from '../brand';

// ---------------------------------------------------------------------------
// PKCE helpers (duplicated here to avoid circular dependency with core)
// ---------------------------------------------------------------------------

const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

const PKCE_VERIFIER_KEY = 'oauth_code_verifier';
const PKCE_EXPIRY_KEY = 'oauth_code_verifier_timestamp';

const storePKCEVerifier = (verifier: string): void => {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(PKCE_EXPIRY_KEY, String(Date.now()));
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Redirects to the OAuth2 authorize endpoint using PKCE.
 * Uses window.location.replace() so the authorize URL does not appear
 * in browser history (prevents back-button returning to a broken state).
 */
const buildAuthUrl = async (extra_params: Record<string, string> = {}): Promise<string> => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    storePKCEVerifier(verifier);

    const csrf_token = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    sessionStorage.setItem('oauth_csrf_token', csrf_token);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: getOAuthClientId(),
        redirect_uri: getOAuthRedirectUri(),
        scope: 'trade',
        state: csrf_token,
        code_challenge: challenge,
        code_challenge_method: 'S256',
    });
    const oauth_app_id = getOAuthAppId();
    if (oauth_app_id) params.set('app_id', oauth_app_id);
    Object.entries(extra_params).forEach(([key, value]) => value && params.set(key, value));

    return `${getAuthBaseUrl()}/oauth2/auth?${params}`;
};

export const redirectToLogin = async (_language?: string): Promise<void> => {
    window.location.replace(await buildAuthUrl());
};

/**
 * EvPNova: sign-up runs through the same OAuth flow (`prompt=registration`), so
 * new users come back logged in, and carries the affiliate token so sign-ups
 * are attributed to EvPNova's Deriv partner account.
 */
export const redirectToSignUp = async (_language?: string): Promise<void> => {
    try {
        const affiliate_token = process.env.REACT_APP_AFFILIATE_TOKEN || '';
        window.location.replace(
            await buildAuthUrl({
                prompt: 'registration',
                t: affiliate_token,
                utm_medium: affiliate_token ? 'affiliate' : '',
                utm_campaign: process.env.REACT_APP_AFFILIATE_CAMPAIGN || '',
                utm_source: process.env.REACT_APP_AFFILIATE_SOURCE || '',
            })
        );
    } catch {
        // OAuth client not configured: fall back to Deriv's own sign-up page.
        const signup_url = getSignupUrl();
        if (signup_url) window.open(signup_url, '_blank', 'noopener,noreferrer');
    }
};

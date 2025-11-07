// Netlify Function: enova-auth
// Purpose: Build Deriv OAuth or Signup URL with server-side env, then 302 redirect

const buildLoginUrl = (lang, extras = {}) => {
    const baseUrl = 'https://oauth.deriv.com/oauth2/authorize';
    const params = new URLSearchParams();
    const appId = process.env.REACT_APP_DERIV_APP_ID || '';
    const affiliateToken = process.env.REACT_APP_AFFILIATE_TOKEN || '';
    const utmCampaign = process.env.REACT_APP_AFFILIATE_CAMPAIGN || '';
    const utmMedium = process.env.REACT_APP_AFFILIATE_MEDIUM || '';
    const utmSource = process.env.REACT_APP_AFFILIATE_SOURCE || '';

    if (appId) params.set('app_id', appId);
    if (lang) params.set('l', String(lang));
    if (extras.brand) params.set('brand', String(extras.brand).toLowerCase());
    if (extras.signup_device) params.set('signup_device', String(extras.signup_device));
    if (extras.date_first_contact) params.set('date_first_contact', String(extras.date_first_contact));
    if (affiliateToken) {
        params.set('affiliate_token', affiliateToken);
        if (utmCampaign) params.set('utm_campaign', utmCampaign);
        if (utmMedium) params.set('utm_medium', utmMedium);
        if (utmSource) params.set('utm_source', utmSource);
    }

    const url = `${baseUrl}?${params.toString()}`;
    return url;
};

const buildSignupUrl = (extras = {}) => {
    const baseUrl = 'https://hub.deriv.com/tradershub/signup';
    const params = new URLSearchParams();
    const affiliateToken = process.env.REACT_APP_AFFILIATE_TOKEN || '';
    const utmCampaign = process.env.REACT_APP_AFFILIATE_CAMPAIGN || '';
    const utmMedium = process.env.REACT_APP_AFFILIATE_MEDIUM || '';
    const utmSource = process.env.REACT_APP_AFFILIATE_SOURCE || '';

    if (affiliateToken) {
        params.set('t', affiliateToken);
        if (utmCampaign) params.set('utm_campaign', utmCampaign);
        if (utmMedium) params.set('utm_medium', utmMedium);
        if (utmSource) params.set('utm_source', utmSource);
    }
    if (extras.brand) params.set('brand', String(extras.brand).toLowerCase());
    if (extras.signup_device) params.set('signup_device', String(extras.signup_device));
    if (extras.date_first_contact) params.set('date_first_contact', String(extras.date_first_contact));

    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    return url;
};

exports.handler = async event => {
    try {
        const qs = event.queryStringParameters || {};
        const type = qs.type || 'login';
        const lang = qs.lang || '';
        const extras = {
            brand: qs.brand,
            signup_device: qs.signup_device,
            date_first_contact: qs.date_first_contact,
        };

        const target = type === 'signup' ? buildSignupUrl(extras) : buildLoginUrl(lang, extras);

        return {
            statusCode: 302,
            headers: {
                Location: target,
                'Cache-Control': 'no-store',
            },
            body: '',
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to build redirect URL' }),
        };
    }
};

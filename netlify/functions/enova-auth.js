// Netlify Function: enova-auth
// Purpose: Build Deriv OAuth or Signup URL with server-side env, then 302 redirect

const buildLoginUrl = lang => {
    const baseUrl = 'https://oauth.deriv.com/oauth2/authorize';
    const params = new URLSearchParams();
    const appId = process.env.REACT_APP_DERIV_APP_ID || '';
    const affiliateToken = process.env.REACT_APP_AFFILIATE_TOKEN || '';
    const utmCampaign = process.env.REACT_APP_AFFILIATE_CAMPAIGN || '';
    const utmMedium = process.env.REACT_APP_AFFILIATE_MEDIUM || '';
    const utmSource = process.env.REACT_APP_AFFILIATE_SOURCE || '';

    if (appId) params.set('app_id', appId);
    if (lang) params.set('l', String(lang));
    if (affiliateToken) {
        params.set('affiliate_token', affiliateToken);
        if (utmCampaign) params.set('utm_campaign', utmCampaign);
        if (utmMedium) params.set('utm_medium', utmMedium);
        if (utmSource) params.set('utm_source', utmSource);
    }

    const url = `${baseUrl}?${params.toString()}`;
    return url;
};

const buildSignupUrl = () => {
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

    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    return url;
};

exports.handler = async event => {
    try {
        const type = (event.queryStringParameters && event.queryStringParameters.type) || 'login';
        const lang = (event.queryStringParameters && event.queryStringParameters.lang) || '';

        const target = type === 'signup' ? buildSignupUrl() : buildLoginUrl(lang);

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

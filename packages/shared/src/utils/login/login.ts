import { website_name } from '../config/app-config';
import { getAppId } from '../config/config';
import { CookieStorage, isStorageSupported, LocalStore } from '../storage/storage';
import { getStaticUrl } from '../url';
import { deriv_urls } from '../url/constants';

export const redirectToLogin = (is_logged_in: boolean, language: string, has_params = true, redirect_delay = 0) => {
    if (!is_logged_in && isStorageSupported(sessionStorage)) {
        const l = window.location;
        const redirect_url = has_params ? window.location.href : `${l.protocol}//${l.host}${l.pathname}`;
        sessionStorage.setItem('redirect_url', redirect_url);
        setTimeout(() => {
            const new_href = loginUrl({ language });
            window.location.href = new_href;
        }, redirect_delay);
    }
};

type TRedirectToSignUp = {
    is_appstore?: boolean;
    is_deriv_crypto?: boolean;
};

export const redirectToSignUp = ({ is_appstore }: TRedirectToSignUp = {}) => {
    window.open(getStaticUrl('/signup/', { is_appstore }));
};

type TLoginUrl = {
    language: string;
};

type CookieStorageCtor = new (cookie_name: string, cookie_domain?: string) => { get: (key: string) => string | null };

export const loginUrl = ({ language }: TLoginUrl) => {
    const server_url = LocalStore.get('config.server_url');
    const CookieStorageClass = CookieStorage as unknown as CookieStorageCtor;
    const signup_device_cookie = new CookieStorageClass('signup_device');
    const signup_device = signup_device_cookie.get('signup_device');
    const date_first_contact_cookie = new CookieStorageClass('date_first_contact');
    const date_first_contact = date_first_contact_cookie.get('date_first_contact');
    const marketing_queries = `${signup_device ? `&signup_device=${encodeURIComponent(signup_device)}` : ''}${
        date_first_contact ? `&date_first_contact=${encodeURIComponent(date_first_contact)}` : ''
    }`;
    if (server_url && /qa/.test(server_url)) {
        return `https://${server_url}/oauth2/authorize?app_id=${getAppId()}&l=${language}${marketing_queries}&brand=${website_name.toLowerCase()}`;
    }

    // Route through Netlify Function to append affiliate params server-side (no client secrets)
    const fn_params = new URLSearchParams();
    fn_params.set('type', 'login');
    fn_params.set('lang', language);
    fn_params.set('brand', website_name.toLowerCase());
    if (signup_device) fn_params.set('signup_device', signup_device);
    if (date_first_contact) fn_params.set('date_first_contact', date_first_contact);
    return `/.netlify/functions/enova-auth?${fn_params.toString()}`;
};

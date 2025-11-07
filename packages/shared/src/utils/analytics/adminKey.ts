export const ADMIN_KEY_QUERY_PARAM = 'k';
const STORAGE_KEY = 'enova_admin_key';

export function getAdminKeyFromUrlOrStorage(): string | null {
    if (typeof window === 'undefined') return null;
    const url = new URL(window.location.href);
    const k = url.searchParams.get(ADMIN_KEY_QUERY_PARAM);
    if (k) {
        try {
            sessionStorage.setItem(STORAGE_KEY, k);
        } catch (e) {
            /* ignore storage error */
        }
        return k;
    }
    try {
        return sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
        return null;
    }
}

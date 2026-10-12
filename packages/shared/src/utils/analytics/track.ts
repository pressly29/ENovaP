export type TEventPayload = Record<string, unknown>;

/**
 * Sends a first-party analytics event to the track-event function (served by
 * the droplet's functions server). Best effort: never throws, never blocks.
 * The function stores `type` (e.g. "login", "signup") and `meta`, which the
 * clients-analysis dashboard aggregates.
 */
export const trackEvent = (type: string, meta: TEventPayload = {}) => {
    try {
        const body = JSON.stringify({ type, meta: { ...meta, path: window.location.pathname } });
        const url = '/.netlify/functions/track-event';
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            // text/plain keeps sendBeacon a "simple" request; the function parses JSON either way.
            navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
            return;
        }
        fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(
            () => undefined
        );
    } catch {
        // best effort only
    }
};

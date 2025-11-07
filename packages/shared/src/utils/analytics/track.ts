export type TEventPayload = Record<string, unknown>;

export const trackEvent = (name: string, payload: TEventPayload = {}, useBeacon = true) => {
    try {
        const body = JSON.stringify({ name, payload, ts: Date.now(), path: location.pathname });
        const url = '/.netlify/functions/track-event';
        if (useBeacon && 'navigator' in window && typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([body], { type: 'text/plain' });
            navigator.sendBeacon(url, blob);
            return Promise.resolve(true);
        }
        return fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body,
            keepalive: true,
        }).then(() => true);
    } catch (e) {
        // best effort only
        return Promise.resolve(false);
    }
};

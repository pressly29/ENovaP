/**
 * usePremiumAccess
 *
 * Client-side glue for the Paystack premium-bot flow:
 *  - loads the trader's unlocked bots + live price catalog from
 *    /.netlify/functions/bot-entitlements
 *  - starts a checkout via /.netlify/functions/paystack-initiate and
 *    redirects to Paystack's hosted payment page
 *  - on return (?reference=... in the URL) verifies the charge via
 *    /.netlify/functions/paystack-verify and unlocks the bot
 */

import React from 'react';
import { isPremiumBotId } from '../data/premium-bots';

const FUNCTIONS_BASE = '/.netlify/functions';

export type TPremiumCatalogEntry = {
    name: string;
    amount: number;
    currency: string;
    display: string;
};

export type TPaymentResult = {
    status: 'success' | 'failed' | 'pending';
    bot_id?: number;
} | null;

type TIdentity = {
    loginid?: string;
    email?: string;
    is_logged_in: boolean;
};

export const usePremiumAccess = ({ loginid, email, is_logged_in }: TIdentity) => {
    const [unlocked_ids, setUnlockedIds] = React.useState<number[]>([]);
    const [catalog, setCatalog] = React.useState<Record<string, TPremiumCatalogEntry>>({});
    const [is_loading_entitlements, setIsLoadingEntitlements] = React.useState(false);
    const [is_starting_checkout, setIsStartingCheckout] = React.useState(false);
    const [checkout_error, setCheckoutError] = React.useState('');
    const [payment_result, setPaymentResult] = React.useState<TPaymentResult>(null);

    // --- entitlements + price catalog -----------------------------------
    const refreshEntitlements = React.useCallback(async () => {
        setIsLoadingEntitlements(true);
        try {
            const params = new URLSearchParams();
            if (loginid) params.set('loginid', loginid);
            if (email) params.set('email', email);
            const res = await fetch(`${FUNCTIONS_BASE}/bot-entitlements?${params.toString()}`);
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data.unlocked)) setUnlockedIds(data.unlocked);
            if (data.catalog) setCatalog(data.catalog);
        } catch (_) {
            // Network failure: keep bots locked; user can retry by reloading.
        } finally {
            setIsLoadingEntitlements(false);
        }
    }, [loginid, email]);

    React.useEffect(() => {
        refreshEntitlements();
    }, [refreshEntitlements]);

    // --- payment callback (?reference= / ?trxref= from Paystack) --------
    React.useEffect(() => {
        const url = new URL(window.location.href);
        const reference = url.searchParams.get('reference') || url.searchParams.get('trxref');
        if (!reference) return;

        // Remove the params immediately so refreshes don't re-verify.
        url.searchParams.delete('reference');
        url.searchParams.delete('trxref');
        window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

        (async () => {
            try {
                const res = await fetch(
                    `${FUNCTIONS_BASE}/paystack-verify?reference=${encodeURIComponent(reference)}`
                );
                const data = res.ok ? await res.json() : { status: 'pending' };
                setPaymentResult(data);
                if (data.status === 'success' && Number.isFinite(data.bot_id)) {
                    setUnlockedIds(prev => (prev.includes(data.bot_id) ? prev : [...prev, data.bot_id]));
                }
            } catch (_) {
                setPaymentResult({ status: 'pending' });
            }
        })();
    }, []);

    // --- checkout --------------------------------------------------------
    const startCheckout = React.useCallback(
        async (bot_id: number) => {
            if (!is_logged_in || !email) {
                setCheckoutError('Please log in to your Deriv account first.');
                return;
            }
            setIsStartingCheckout(true);
            setCheckoutError('');
            try {
                const res = await fetch(`${FUNCTIONS_BASE}/paystack-initiate`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        bot_id,
                        email,
                        loginid,
                        return_path: `${window.location.pathname}${window.location.search}`,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.authorization_url) {
                    setCheckoutError(data.error || 'Could not start checkout. Please try again.');
                    return;
                }
                window.location.assign(data.authorization_url);
            } catch (_) {
                setCheckoutError('Network error — please check your connection and try again.');
            } finally {
                setIsStartingCheckout(false);
            }
        },
        [is_logged_in, email, loginid]
    );

    const isUnlocked = React.useCallback(
        (bot_id: number) => !isPremiumBotId(bot_id) || unlocked_ids.includes(bot_id),
        [unlocked_ids]
    );

    const getPriceLabel = React.useCallback(
        (bot_id: number) => catalog[String(bot_id)]?.display ?? '',
        [catalog]
    );

    return {
        isUnlocked,
        getPriceLabel,
        startCheckout,
        refreshEntitlements,
        is_loading_entitlements,
        is_starting_checkout,
        checkout_error,
        setCheckoutError,
        payment_result,
        clearPaymentResult: () => setPaymentResult(null),
    };
};

export default usePremiumAccess;

// Premium bot catalog — the single source of truth for WHICH bots are paid
// and WHAT they cost. The client never sends a price; every charge amount is
// resolved server-side from this file so it cannot be tampered with.
//
// Bot IDs must match packages/bot-web-ui/src/pages/apollo_bots/data/premium-bots.ts
// (the client-side list that decides which cards render as locked).
//
// Prices are in MAJOR units (US dollars). Paystack is charged in subunits
// (cents, amount * 100). USD must be enabled on the Paystack business account;
// PAYSTACK_CURRENCY can override the charge currency only if a price for it is
// added below.
//
// Pricing (USD, one-time): $25 | $27 | $29 | $30.
const PREMIUM_BOTS = {
    8: { name: 'Lightning Scalper', prices: { USD: 27 } },
    9: { name: 'Fibonacci Recovery', prices: { USD: 27 } },
    10: { name: 'Neural Network Predictor', prices: { USD: 30 } },
    11: { name: 'Grid Master', prices: { USD: 29 } },
    12: { name: 'Algo Sniper', prices: { USD: 27 } },
    13: { name: 'Signal Sniper Auto Bot', prices: { USD: 27 } },
    14: { name: 'BRAM Even/Odd Printer', prices: { USD: 25 } },
    15: { name: 'Dollar Print AI', prices: { USD: 30 } },
};

const CURRENCY_SYMBOLS = { USD: '$' };

// An env currency without prices in the catalog (e.g. a leftover
// PAYSTACK_CURRENCY=KES) falls back to USD instead of making every bot
// unpurchasable.
const getCurrency = () => {
    const configured = (process.env.PAYSTACK_CURRENCY || 'USD').toUpperCase();
    const has_prices = Object.values(PREMIUM_BOTS).some(bot => Number.isFinite(bot.prices[configured]));
    return has_prices ? configured : 'USD';
};

const getPremiumBot = botId => PREMIUM_BOTS[Number(botId)] || null;

// Returns { amount_subunit, amount_major, currency, display } or null if the
// bot is not premium / has no price for the active currency.
const getPrice = botId => {
    const bot = getPremiumBot(botId);
    if (!bot) return null;
    const currency = getCurrency();
    const major = bot.prices[currency];
    if (!Number.isFinite(major)) return null;
    return {
        amount_subunit: Math.round(major * 100),
        amount_major: major,
        currency,
        display: CURRENCY_SYMBOLS[currency]
            ? `${CURRENCY_SYMBOLS[currency]}${major.toLocaleString('en-US')}`
            : `${currency} ${major.toLocaleString('en-US')}`,
    };
};

// Catalog sent to the client so cards can show real prices.
const getPublicCatalog = () => {
    const catalog = {};
    Object.keys(PREMIUM_BOTS).forEach(id => {
        const price = getPrice(id);
        if (price) {
            catalog[id] = {
                name: PREMIUM_BOTS[id].name,
                amount: price.amount_major,
                currency: price.currency,
                display: price.display,
            };
        }
    });
    return catalog;
};

module.exports = { PREMIUM_BOTS, getCurrency, getPremiumBot, getPrice, getPublicCatalog };

// Premium bot catalog — the single source of truth for WHICH bots are paid
// and WHAT they cost. The client never sends a price; every charge amount is
// resolved server-side from this file so it cannot be tampered with.
//
// Bot IDs must match packages/bot-web-ui/src/pages/apollo_bots/data/premium-bots.ts
// (the client-side list that decides which cards render as locked).
//
// Prices are in MAJOR units (e.g. 2000 = KES 2,000). Paystack is charged in
// subunits (amount * 100). The active currency is picked with the
// PAYSTACK_CURRENCY env var (default KES) — it must be a currency enabled on
// your Paystack business account.

// Pricing is anchored in GBP (£20–£30 per bot). Local-currency amounts use a
// buffered rate (£30 ≈ KES 5,500, i.e. ~183 KES/£) so conversion fees and FX
// drift are covered; all currencies for a bot are equivalent in value.
// Tiers: £20 | £24 | £27 | £30.
const PREMIUM_BOTS = {
    8: {
        name: 'Lightning Scalper',
        prices: { GBP: 24, KES: 4400, NGN: 52800, GHS: 530, ZAR: 635, USD: 35 },
    },
    9: {
        name: 'Fibonacci Recovery',
        prices: { GBP: 24, KES: 4400, NGN: 52800, GHS: 530, ZAR: 635, USD: 35 },
    },
    10: {
        name: 'Neural Network Predictor',
        prices: { GBP: 30, KES: 5500, NGN: 66000, GHS: 660, ZAR: 790, USD: 44 },
    },
    11: {
        name: 'Grid Master',
        prices: { GBP: 27, KES: 4950, NGN: 59400, GHS: 595, ZAR: 715, USD: 40 },
    },
    12: {
        name: 'Algo Sniper',
        prices: { GBP: 24, KES: 4400, NGN: 52800, GHS: 530, ZAR: 635, USD: 35 },
    },
    13: {
        name: 'Signal Sniper Auto Bot',
        prices: { GBP: 24, KES: 4400, NGN: 52800, GHS: 530, ZAR: 635, USD: 35 },
    },
    14: {
        name: 'BRAM Even/Odd Printer',
        prices: { GBP: 20, KES: 3700, NGN: 44400, GHS: 445, ZAR: 535, USD: 30 },
    },
    15: {
        name: 'Dollar Print AI',
        prices: { GBP: 30, KES: 5500, NGN: 66000, GHS: 660, ZAR: 790, USD: 44 },
    },
};

const getCurrency = () => (process.env.PAYSTACK_CURRENCY || 'KES').toUpperCase();

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
        display: `${currency} ${major.toLocaleString('en-US')}`,
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

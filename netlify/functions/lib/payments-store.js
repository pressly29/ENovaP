// Payment persistence on Netlify Blobs (same storage the analytics functions
// use). One store, three key families:
//
//   receipts/<reference>.json   — one record per successful Paystack charge.
//                                 Doubles as the idempotency marker so a
//                                 webhook + a client verify for the same
//                                 charge only ever record one sale.
//   ent/acct/<LOGINID>.json     — entitlements keyed by Deriv account id.
//   ent/email/<email>.json      — entitlements keyed by payment email, so a
//                                 trader who logs into a different Deriv
//                                 account (e.g. demo vs real) keeps access.
//   sales/<YYYY-MM>.jsonl       — append-only monthly sales ledger for the
//                                 admin sales report.

// eslint-disable-next-line import/no-unresolved
const { getStore } = require('@netlify/blobs');

const getPaymentsStore = () => getStore({ name: 'payments', consistency: 'strong' });

const normalizeLoginid = loginid => String(loginid || '').trim().toUpperCase();
const normalizeEmail = email => String(email || '').trim().toLowerCase();

const acctKey = loginid => `ent/acct/${encodeURIComponent(normalizeLoginid(loginid))}.json`;
const emailKey = email => `ent/email/${encodeURIComponent(normalizeEmail(email))}.json`;

const readJson = async (store, key) => {
    try {
        const raw = await store.get(key);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
};

// Union of entitlements found under the account id and the email.
const getEntitlements = async ({ loginid, email }) => {
    const store = getPaymentsStore();
    const keys = [];
    if (normalizeLoginid(loginid)) keys.push(acctKey(loginid));
    if (normalizeEmail(email)) keys.push(emailKey(email));

    const bots = {};
    for (const key of keys) {
        const record = await readJson(store, key);
        if (record && record.bots) Object.assign(bots, record.bots);
    }
    return bots; // { '<botId>': { reference, paid_at, amount, currency } }
};

const mergeEntitlement = async (store, key, sale) => {
    const existing = (await readJson(store, key)) || { bots: {} };
    existing.bots = existing.bots || {};
    existing.bots[String(sale.bot_id)] = {
        reference: sale.reference,
        paid_at: sale.paid_at,
        amount: sale.amount,
        currency: sale.currency,
    };
    existing.updated_at = new Date().toISOString();
    await store.setJSON(key, existing);
};

// Records a verified successful charge exactly once. Returns:
//   'recorded'  — first time we see this reference (caller should send receipt)
//   'duplicate' — already recorded (webhook/verify race), nothing written
const recordSale = async sale => {
    const store = getPaymentsStore();
    const receiptKey = `receipts/${encodeURIComponent(sale.reference)}.json`;

    const already = await readJson(store, receiptKey);
    if (already) return 'duplicate';

    await store.setJSON(receiptKey, sale);

    if (normalizeLoginid(sale.loginid)) await mergeEntitlement(store, acctKey(sale.loginid), sale);
    if (normalizeEmail(sale.email)) await mergeEntitlement(store, emailKey(sale.email), sale);

    const monthKey = `sales/${sale.paid_at.slice(0, 7)}.jsonl`;
    try {
        await store.append(monthKey, `${JSON.stringify(sale)}\n`, {
            addRandomSuffix: false,
            contentType: 'application/jsonl',
        });
    } catch (_) {
        // Older blobs runtimes lack append: fall back to read-modify-write.
        const current = (await store.get(monthKey)) || '';
        await store.set(monthKey, `${current}${JSON.stringify(sale)}\n`);
    }

    return 'recorded';
};

const readMonthlySales = async monthKeys => {
    const store = getPaymentsStore();
    const sales = [];
    for (const month of monthKeys) {
        const raw = await store.get(`sales/${month}.jsonl`);
        if (!raw) continue;
        raw.split('\n')
            .filter(Boolean)
            .forEach(line => {
                try {
                    sales.push(JSON.parse(line));
                } catch (_) {
                    /* skip corrupt line */
                }
            });
    }
    return sales;
};

module.exports = { getEntitlements, recordSale, readMonthlySales, normalizeLoginid, normalizeEmail };

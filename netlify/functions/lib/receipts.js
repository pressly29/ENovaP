// Company sales-receipt email. Two layers keep the record complete at no cost:
//
//   1. Paystack itself: Dashboard → Settings → Preferences → Email
//      Notifications → enable "transaction emails" for your company address.
//      Zero code, zero cost — Paystack emails you for every charge.
//   2. This module: sends our own itemised receipt (bot name, buyer's Deriv
//      loginid, reference) via the Resend API when RESEND_API_KEY is set.
//      Resend's free tier (100 emails/day) is more than enough for receipts.
//
// Env vars (set in Netlify UI, never in the repo):
//   RESEND_API_KEY        — optional; if absent this module is a no-op.
//   COMPANY_RECEIPT_EMAIL — where receipts go, e.g. sales@evpnova.com
//   RECEIPT_FROM_EMAIL    — verified sender, e.g. receipts@evpnova.com
//                           (falls back to onboarding@resend.dev for testing)

const escapeHtml = value =>
    String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const buildReceiptHtml = sale => {
    const rows = [
        ['Bot', sale.bot_name],
        ['Amount', `${sale.currency} ${Number(sale.amount).toLocaleString('en-US')}`],
        ['Reference', sale.reference],
        ['Buyer email', sale.email],
        ['Deriv account', sale.loginid || '—'],
        ['Channel', sale.channel || '—'],
        ['Paid at', sale.paid_at],
    ]
        .map(
            ([label, value]) =>
                `<tr><td style="padding:8px 16px 8px 0;color:#6b7280;white-space:nowrap;">${escapeHtml(label)}</td>` +
                `<td style="padding:8px 0;color:#111827;font-weight:600;">${escapeHtml(value)}</td></tr>`
        )
        .join('');

    return (
        `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;">` +
        `<h2 style="color:#111827;margin:0 0 4px;">New bot sale 🎉</h2>` +
        `<p style="color:#6b7280;margin:0 0 20px;">A premium bot purchase was confirmed by Paystack.</p>` +
        `<table style="border-collapse:collapse;font-size:14px;">${rows}</table>` +
        `<p style="color:#9ca3af;font-size:12px;margin-top:24px;">Automated receipt from evpnova.com — full ledger available via the sales-report endpoint.</p>` +
        `</div>`
    );
};

// Best-effort: never throws, so a mail hiccup can never break payment recording.
const sendCompanyReceipt = async sale => {
    const apiKey = process.env.RESEND_API_KEY || '';
    const to = process.env.COMPANY_RECEIPT_EMAIL || '';
    if (!apiKey || !to) {
        console.log('[receipts] RESEND_API_KEY/COMPANY_RECEIPT_EMAIL not set — relying on Paystack dashboard notifications');
        return false;
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: process.env.RECEIPT_FROM_EMAIL || 'EvPNova Receipts <onboarding@resend.dev>',
                to: [to],
                subject: `Sale: ${sale.bot_name} — ${sale.currency} ${sale.amount} (${sale.reference})`,
                html: buildReceiptHtml(sale),
            }),
        });
        if (!res.ok) {
            console.error('[receipts] resend error', res.status, await res.text());
            return false;
        }
        console.log('[receipts] company receipt sent for', sale.reference);
        return true;
    } catch (err) {
        console.error('[receipts] send failed', err);
        return false;
    }
};

module.exports = { sendCompanyReceipt };

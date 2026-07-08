/**
 * Premium Bot Configuration (client side)
 *
 * Lists which bots require a one-time Paystack purchase before they can be
 * loaded. This list only controls the UI (locked cards, checkout prompt);
 * prices and payment validation live server-side in
 * netlify/functions/lib/premium-catalog.js — keep the two ID lists in sync.
 */

export const PREMIUM_BOT_IDS: number[] = [8, 9, 10, 11, 12, 13, 14, 15];

export const isPremiumBotId = (botId: number): boolean => PREMIUM_BOT_IDS.includes(botId);

import { localize } from '@deriv-com/translations';

// The new Deriv API returns market/submarket codes only. These display names
// follow packages/trader/src/AppV2/Utils/symbol-categories-utils.ts, keeping the
// legacy submarket names the bot's market dropdowns were designed around.

export const getMarketDisplayName = market => {
    const names = {
        forex: localize('Forex'),
        synthetic_index: localize('Derived'),
        cryptocurrency: localize('Cryptocurrencies'),
        commodities: localize('Commodities'),
        stock_index: localize('Stock indices'),
        indices: localize('Stock indices'),
        basket_index: localize('Basket indices'),
    };
    return names[market] || market;
};

export const getSubgroupDisplayName = (subgroup, market) => {
    if (!subgroup || subgroup === 'none') return getMarketDisplayName(market);
    const names = {
        synthetics: localize('Synthetics'),
        baskets: localize('Baskets'),
        major_pairs: localize('Major pairs'),
        minor_pairs: localize('Minor pairs'),
        smart_fx: localize('Smart FX'),
        metals: localize('Metals'),
        energy: localize('Energy'),
        americas: localize('Americas'),
        asia_oceania: localize('Asia/Oceania'),
        europe_africa: localize('Europe/Africa'),
    };
    return names[subgroup] || subgroup;
};

export const getSubmarketDisplayName = submarket => {
    const names = {
        major_pairs: localize('Major pairs'),
        minor_pairs: localize('Minor pairs'),
        smart_fx: localize('Smart FX'),
        random_index: localize('Continuous Indices'),
        random_daily: localize('Daily Reset Indices'),
        crash_boom: localize('Crash/Boom'),
        crash_index: localize('Crash/Boom'),
        step_indices: localize('Step Indices'),
        step_index: localize('Step Indices'),
        range_break: localize('Range Break Indices'),
        jump_indices: localize('Jump Indices'),
        jump_index: localize('Jump Indices'),
        cryptocurrency: localize('Cryptocurrencies'),
        non_stable_coin: localize('Cryptocurrencies'),
        metals: localize('Metals'),
        energy: localize('Energy'),
        americas: localize('Americas'),
        americas_OTC: localize('American indices'),
        asia_oceania: localize('Asia/Oceania'),
        asia_oceania_OTC: localize('Asian indices'),
        europe_africa: localize('Europe/Africa'),
        europe_OTC: localize('European indices'),
        otc_index: localize('OTC indices'),
        basket_forex: localize('Forex Basket'),
        forex_basket: localize('Forex Basket'),
        basket_commodities: localize('Commodities Basket'),
        commodity_basket: localize('Commodities Basket'),
        basket_cryptocurrency: localize('Cryptocurrency Basket'),
    };
    return names[submarket] || submarket;
};

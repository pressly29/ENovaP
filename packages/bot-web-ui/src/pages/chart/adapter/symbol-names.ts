import { localize } from '@deriv-com/translations';

// Subset of packages/trader/src/AppV2/Utils/symbol-categories-utils.ts used by the adapter.
export const getMarketDisplayName = (market: string) => {
    const names: Record<string, string> = {
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

export const getSubmarketDisplayName = (submarket: string) => {
    const names: Record<string, string> = {
        major_pairs: localize('Major pairs'),
        minor_pairs: localize('Minor pairs'),
        smart_fx: localize('Smart FX'),
        random_index: localize('Volatility indices'),
        random_daily: localize('Daily reset indices'),
        crash_boom: localize('Crash/Boom'),
        crash_index: localize('Crash/Boom'),
        step_indices: localize('Step indices'),
        step_index: localize('Step indices'),
        range_break: localize('Range break indices'),
        jump_indices: localize('Jump indices'),
        jump_index: localize('Jump indices'),
        cryptocurrency: localize('Cryptocurrencies'),
        non_stable_coin: localize('Cryptocurrencies'),
        metals: localize('Metals'),
        energy: localize('Energy'),
        americas_OTC: localize('American indices'),
        asia_oceania_OTC: localize('Asian indices'),
        europe_OTC: localize('European indices'),
        otc_index: localize('OTC indices'),
        forex_basket: localize('Forex basket'),
        commodity_basket: localize('Commodities basket'),
    };
    return names[submarket] || submarket;
};

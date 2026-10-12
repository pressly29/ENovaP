import { getMarketDisplayName, getSubgroupDisplayName, getSubmarketDisplayName } from './symbol-names';

/**
 * Translates between the legacy (v3) message shapes the bot engine was written
 * for and the new Deriv API (api.derivws.com). Verified against the live public
 * endpoint:
 *   - requests use `underlying_symbol` instead of `symbol` (proposal, buy parameters)
 *   - contracts_for rejects `currency`, `landing_company`, `product_type`
 *   - active_symbols / trading_times return `underlying_symbol(_name)` and no display names
 *   - authorize, website_status, landing_company, get_settings, ... no longer exist
 *     (auth is part of the OTP WebSocket URL)
 */

// Calls the new API no longer offers. They are answered locally with an error
// so callers fail fast instead of waiting on a request that never resolves.
export const REMOVED_METHODS = [
    'authorize',
    'website_status',
    'landing_company',
    'landing_company_details',
    'get_settings',
    'get_account_status',
    'get_limits',
    'get_self_exclusion',
    'payout_currencies',
    'residence_list',
    'account_list',
    'logout',
];

const renameSymbol = obj => {
    if (obj && typeof obj === 'object' && 'symbol' in obj && !('underlying_symbol' in obj)) {
        const { symbol, ...rest } = obj;
        return { ...rest, underlying_symbol: symbol };
    }
    return obj;
};

export const getRemovedMethod = request => REMOVED_METHODS.find(method => method in request);

export const transformRequest = request => {
    if (!request || typeof request !== 'object') return request;

    if ('proposal' in request) return renameSymbol(request);

    if ('buy' in request && request.parameters) {
        return { ...request, parameters: renameSymbol(request.parameters) };
    }

    if ('contracts_for' in request) {
        // eslint-disable-next-line no-unused-vars, camelcase
        const { currency, landing_company, landing_company_short, product_type, ...rest } = request;
        return rest;
    }

    if ('active_symbols' in request) {
        // eslint-disable-next-line no-unused-vars, camelcase
        const { landing_company, landing_company_short, product_type, ...rest } = request;
        return rest;
    }

    return request;
};

const enrichActiveSymbol = (item, index) => {
    const symbol = item.symbol ?? item.underlying_symbol;
    return {
        ...item,
        symbol,
        display_name: item.display_name ?? item.underlying_symbol_name ?? symbol,
        symbol_type: item.symbol_type ?? item.underlying_symbol_type,
        market_display_name: item.market_display_name ?? getMarketDisplayName(item.market),
        submarket_display_name: item.submarket_display_name ?? getSubmarketDisplayName(item.submarket),
        subgroup_display_name: item.subgroup_display_name ?? getSubgroupDisplayName(item.subgroup, item.market),
        pip: item.pip ?? item.pip_size,
        display_order: item.display_order ?? index,
    };
};

// The legacy API grouped Rise/Fall and Higher/Lower under contract_category
// "callput" and told them apart by barrier_category (euro_atm / euro_non_atm),
// which the engine filters on (constants/config.js BARRIER_CATEGORIES). The new
// API has a separate "higherlower" category and no barrier_category.
const LEGACY_CONTRACT_CATEGORY = { higherlower: 'callput' };
const BARRIER_CATEGORY = {
    callput: 'euro_atm',
    callputequal: 'euro_atm',
    higherlower: 'euro_non_atm',
    endsinout: 'euro_non_atm',
    callputspread: 'euro_non_atm',
    staysinout: 'american',
    touchnotouch: 'american',
    highlowticks: 'american',
    runs: 'american',
    multiplier: 'american',
    digits: 'non_financial',
    asian: 'asian',
    reset: 'reset',
    lookback: 'lookback',
};

const toLegacyContract = contract => ({
    ...contract,
    contract_category: LEGACY_CONTRACT_CATEGORY[contract.contract_category] ?? contract.contract_category,
    barrier_category: contract.barrier_category ?? BARRIER_CATEGORY[contract.contract_category] ?? 'american',
});

export const transformResponse = response => {
    if (!response || typeof response !== 'object') return response;

    if (Array.isArray(response.contracts_for?.available)) {
        return {
            ...response,
            contracts_for: {
                ...response.contracts_for,
                available: response.contracts_for.available.map(toLegacyContract),
            },
        };
    }

    if (Array.isArray(response.active_symbols)) {
        return { ...response, active_symbols: response.active_symbols.map(enrichActiveSymbol) };
    }

    if (response.trading_times?.markets) {
        const markets = response.trading_times.markets.map(market => ({
            ...market,
            submarkets: (market.submarkets || []).map(submarket => ({
                ...submarket,
                symbols: (submarket.symbols || []).map(s => ({ ...s, symbol: s.symbol ?? s.underlying_symbol })),
            })),
        }));
        return { ...response, trading_times: { ...response.trading_times, markets } };
    }

    if (response.proposal_open_contract && response.proposal_open_contract.underlying_symbol) {
        const poc = response.proposal_open_contract;
        return {
            ...response,
            proposal_open_contract: { ...poc, underlying: poc.underlying ?? poc.underlying_symbol },
        };
    }

    if (response.transaction && response.transaction.underlying_symbol) {
        const tx = response.transaction;
        return { ...response, transaction: { ...tx, symbol: tx.symbol ?? tx.underlying_symbol } };
    }

    return response;
};

export const removedMethodResponse = (request, method) => ({
    echo_req: request,
    req_id: request.req_id,
    msg_type: method,
    error: {
        code: 'UnsupportedMethod',
        message: `"${method}" is not available on the new Deriv API.`,
    },
});

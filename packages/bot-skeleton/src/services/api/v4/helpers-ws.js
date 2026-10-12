import { api_base } from '../api-base';

const api = () => {
    if (!api_base.api) api_base.init();
    return api_base.api;
};

/**
 * Socket facade for ApiHelpers (active symbols, contracts_for, trading times).
 * It used to receive the core's WebSocket, which now speaks the new API format
 * natively; this routes those calls through the bot's own connection, where the
 * legacy <-> new API translation happens. Resolved per call, so account switches
 * (which replace api_base.api) are picked up automatically.
 */
const helpers_ws = {
    send: request => api().send(request),
    tradingTimes: date => api().send({ trading_times: date }),
    activeSymbols: (mode = 'brief') => api().send({ active_symbols: mode }),
    authorized: {
        activeSymbols: (mode = 'brief') => api().send({ active_symbols: mode }),
        send: request => api().send(request),
    },
};

export default helpers_ws;

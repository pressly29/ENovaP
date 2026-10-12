export const routes = {
    // Essential routes
    index: '/',
    callback_page: '/callback',
    error404: '/404',
    endpoint: '/endpoint',

    // EvPNova: the bot builder is the home page; DTrader lives at /trader
    bot: '/',
    trader: '/trader',

    // Trading routes
    menu: '/menu',
    trader_positions: '/positions',
    contract: '/contract/:contract_id',

    // Unlinked admin dashboard; data is protected server-side by x-admin-token.
    clients_analysis: `/clients-analysis-${process.env.REACT_APP_ADMIN_DASH_PATH || 'local'}`,

    // Reports routes
    reports: '/reports',
    positions: '/reports/positions',
    profit: '/reports/profit',
    statement: '/reports/statement',
};

export const DISABLE_LANDSCAPE_BLOCKER_ROUTES = [
    routes.index,
    routes.trader,
    routes.reports,
    routes.endpoint,
    /** because contract route has dynamic id */
    '/contract',
];

export const isDisabledLandscapeBlockerRoute = (path: string) => {
    // Root path is now the trade page
    if (path === '/') return true;
    return DISABLE_LANDSCAPE_BLOCKER_ROUTES.some(route => path.startsWith(route));
};

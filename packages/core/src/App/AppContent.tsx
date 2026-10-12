import React from 'react';
import { useLocation } from 'react-router-dom';

import { useMobileBridge } from '@deriv/api';
import { observer, useStore } from '@deriv/stores';
import { ThemeProvider } from '@deriv-com/quill-ui';
import { getInitialLanguage, useTranslations } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';

import ErrorBoundary from './Components/Elements/Errors/error-boundary.jsx';
import LandscapeBlocker from './Components/Elements/LandscapeBlocker';
import AppToastMessages from './Containers/app-toast-messages.jsx';
import AppContents from './Containers/Layout/app-contents.jsx';
import BottomNav from './Containers/Layout/bottom-nav';
import EvpAppBar from './Containers/Layout/evpnova/app-bar';
import EvpAppFooter from './Containers/Layout/evpnova/app-footer';
import Header from './Containers/Layout/header';
import AppModals from './Containers/Modals';
import Routes from './Containers/Routes/routes.jsx';
import Devtools from './Devtools';

const AppContent: React.FC<{ passthrough: any }> = observer(({ passthrough }) => {
    const store = useStore();
    const { current_language } = store.common;
    const { is_dark_mode_on } = store.ui;

    const { isMobile } = useDevice();
    const { pathname } = useLocation();
    // DTrader (/trader, /positions, /contract/:id) renders its own shell.
    const is_dtrader_route = /^\/(trader|positions|contract)(\/|$)/.test(pathname);
    const show_evp_shell = !isMobile && !is_dtrader_route;

    const { switchLanguage } = useTranslations();
    const { isBridgeAvailable, sendBridgeEvent } = useMobileBridge();

    const html = document.documentElement;

    React.useEffect(() => {
        switchLanguage(current_language);
        html?.setAttribute('lang', current_language.toLowerCase());
        html?.setAttribute('dir', current_language.toLowerCase() === 'ar' ? 'rtl' : 'ltr');
    }, [current_language, switchLanguage, html]);

    // Send trading:config event when language or theme changes
    React.useEffect(() => {
        if (isBridgeAvailable) {
            const language = current_language || getInitialLanguage();
            sendBridgeEvent('trading:config', {
                lang: language,
                theme: is_dark_mode_on ? 'dark' : 'light',
            });
        }
    }, [isBridgeAvailable, sendBridgeEvent, current_language, is_dark_mode_on]);

    return (
        <ThemeProvider theme={is_dark_mode_on ? 'dark' : 'light'}>
            <LandscapeBlocker />
            {isMobile && <Header />}
            {show_evp_shell ? (
                <div className='evp-shell'>
                    <EvpAppBar />
                    <ErrorBoundary root_store={store}>
                        <AppContents>
                            <Routes {...({ passthrough } as any)} />
                        </AppContents>
                    </ErrorBoundary>
                    <EvpAppFooter />
                </div>
            ) : (
                <React.Fragment>
                    <ErrorBoundary root_store={store}>
                        <AppContents>
                            <Routes {...({ passthrough } as any)} />
                        </AppContents>
                    </ErrorBoundary>
                </React.Fragment>
            )}
            {isMobile && <BottomNav />}
            <ErrorBoundary root_store={store}>
                <AppModals />
            </ErrorBoundary>
            <AppToastMessages />
            <Devtools />
        </ThemeProvider>
    );
});

export default AppContent;

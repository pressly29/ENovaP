import React from 'react';

import { StandaloneMoonRegularIcon, StandaloneSunBrightRegularIcon } from '@deriv/quill-icons';
import { observer, useStore } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';

import NetworkStatus from 'App/Components/Layout/Footer';
import ServerTime from 'App/Containers/server-time.jsx';

/** Slim status footer for EvPNova pages outside DTrader. */
const AppFooter = observer(() => {
    const { localize } = useTranslations();
    const { ui } = useStore();
    const { is_dark_mode_on, setDarkMode } = ui;

    return (
        <footer className='evp-app-footer'>
            <div className='evp-app-footer__start'>
                <NetworkStatus />
                <ServerTime />
            </div>
            <div className='evp-app-footer__end'>
                <span className='evp-app-footer__risk'>
                    {localize('Trading involves risk. Only trade with money you can afford to lose.')}
                </span>
                <button
                    type='button'
                    className='evp-app-footer__theme'
                    onClick={() => setDarkMode(!is_dark_mode_on)}
                    aria-label={is_dark_mode_on ? localize('Switch to light theme') : localize('Switch to dark theme')}
                    title={is_dark_mode_on ? localize('Light theme') : localize('Dark theme')}
                >
                    {is_dark_mode_on ? (
                        <StandaloneSunBrightRegularIcon iconSize='sm' fill='currentColor' />
                    ) : (
                        <StandaloneMoonRegularIcon iconSize='sm' fill='currentColor' />
                    )}
                </button>
            </div>
        </footer>
    );
});

AppFooter.displayName = 'AppFooter';

export default AppFooter;

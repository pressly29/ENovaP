import React from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import {
    StandaloneChartCandlestickRegularIcon,
    StandaloneChartMixedRegularIcon,
    StandaloneFileLinesRegularIcon,
} from '@deriv/quill-icons';
import { routes } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';

import BrandLogo from 'App/Components/Elements/BrandLogo';
import { AccountActions } from 'App/Components/Layout/Header';
import { AccountsInfoLoader } from 'App/Components/Layout/Header/Components/Preloader';

/**
 * EvPNova desktop app bar for pages outside DTrader (the bot builder home,
 * reports, admin). DTrader keeps the template's own shell at /trader.
 */
const AppBar = observer(() => {
    const { localize } = useTranslations();
    const { client, ui } = useStore();
    const { is_logged_in, is_logging_in } = client;

    const links = [
        {
            to: routes.bot,
            exact: true,
            label: localize('Bots'),
            icon: <StandaloneChartMixedRegularIcon iconSize='sm' fill='currentColor' />,
        },
        {
            to: routes.trader,
            label: localize('Trade'),
            icon: <StandaloneChartCandlestickRegularIcon iconSize='sm' fill='currentColor' />,
        },
        ...(is_logged_in
            ? [
                  {
                      to: routes.reports,
                      label: localize('Reports'),
                      icon: <StandaloneFileLinesRegularIcon iconSize='sm' fill='currentColor' />,
                  },
              ]
            : []),
    ];

    return (
        <header
            className={classNames('evp-app-bar', {
                'evp-app-bar--is-disabled': ui.is_app_disabled || ui.is_route_modal_on,
            })}
        >
            <div className='evp-app-bar__start'>
                <NavLink to={routes.bot} className='evp-app-bar__logo' aria-label='EvPNova home'>
                    <BrandLogo height={32} />
                </NavLink>
                <nav className='evp-app-bar__nav' aria-label={localize('Main')}>
                    {links.map(({ to, exact, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            exact={exact}
                            className='evp-app-bar__link'
                            activeClassName='evp-app-bar__link--active'
                        >
                            {icon}
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className='evp-app-bar__end'>
                {is_logging_in ? (
                    <div className='acc-info__preloader'>
                        <AccountsInfoLoader is_logged_in={is_logged_in} />
                    </div>
                ) : (
                    <AccountActions />
                )}
            </div>
        </header>
    );
});

AppBar.displayName = 'AppBar';

export default AppBar;

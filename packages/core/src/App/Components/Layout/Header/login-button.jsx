import PropTypes from 'prop-types';
import React from 'react';
import { Button } from '@deriv/components';
import { localize, getLanguage } from '@deriv/translations';
import { loginUrl } from '@deriv/shared';

const LoginButton = ({ className }) => {
    const onLogin = () => {
        try {
            // Build the standard Deriv login URL (preserves registered redirect handling)
            const base_url = loginUrl({ language: getLanguage() });

            // Append affiliate tracking params if provided
            const url = new URL(base_url);
            const params = url.searchParams;

            const affiliate_token = process.env.REACT_APP_AFFILIATE_TOKEN;
            const utm_campaign = process.env.REACT_APP_AFFILIATE_CAMPAIGN || '';
            const utm_medium = process.env.REACT_APP_AFFILIATE_MEDIUM || '';
            const utm_source = process.env.REACT_APP_AFFILIATE_SOURCE || '';

            if (affiliate_token) {
                params.set('affiliate_token', affiliate_token);
                params.set('utm_campaign', utm_campaign);
                params.set('utm_medium', utm_medium);
                params.set('utm_source', utm_source);
            }

            window.location.href = url.toString();
        } catch (e) {
            // Fallback: stay on page if something goes wrong
            // eslint-disable-next-line no-console
            console.error('[LoginButton] Failed to build OAuth URL', e);
        }
    };

    return (
        <Button
            id='dt_login_button'
            className={className}
            has_effect
            text={localize('Log in')}
            onClick={onLogin}
            tertiary
        />
    );
};

LoginButton.propTypes = {
    className: PropTypes.string,
};

export { LoginButton };

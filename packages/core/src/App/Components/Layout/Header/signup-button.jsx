import PropTypes from 'prop-types';
import React from 'react';
import { Button } from '@deriv/components';
import { localize } from '@deriv/translations';

const SignupButton = ({ className }) => {
    const onSignup = () => {
        try {
            const baseUrl = 'https://hub.deriv.com/tradershub/signup';
            const url = new URL(baseUrl);
            const params = url.searchParams;

            const affiliate_token = process.env.REACT_APP_AFFILIATE_TOKEN;
            const utm_campaign = process.env.REACT_APP_AFFILIATE_CAMPAIGN || '';
            const utm_medium = process.env.REACT_APP_AFFILIATE_MEDIUM || '';
            const utm_source = process.env.REACT_APP_AFFILIATE_SOURCE || '';

            if (affiliate_token) {
                params.set('t', affiliate_token);
                params.set('utm_campaign', utm_campaign);
                params.set('utm_medium', utm_medium);
                params.set('utm_source', utm_source);
            }

            // Open Deriv signup with affiliate tracking params in a new tab
            window.open(url.toString(), '_blank');
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('[SignupButton] Failed to build signup URL', e);
        }
    };

    return (
        <Button
            id='dt_signup_button'
            className={className}
            has_effect
            text={localize('Sign up')}
            onClick={onSignup}
            primary
        />
    );
};

SignupButton.propTypes = {
    className: PropTypes.string,
};

export { SignupButton };

import PropTypes from 'prop-types';
import React from 'react';
import { Button } from '@deriv/components';
import { localize } from '@deriv/translations';
import { trackEvent } from '@deriv/shared/src/utils/analytics/track';

const SignupButton = ({ className }) => {
    const onSignup = () => {
        try {
            // Redirect via Netlify Function to keep secrets server-side
            const fn = '/.netlify/functions/enova-auth?type=signup';
            trackEvent('auth_redirect', { type: 'signup' });
            window.open(fn, '_blank');
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

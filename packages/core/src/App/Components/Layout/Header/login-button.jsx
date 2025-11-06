import PropTypes from 'prop-types';
import React from 'react';
import { Button } from '@deriv/components';
import { localize, getLanguage } from '@deriv/translations';

const LoginButton = ({ className }) => {
    const onLogin = () => {
        try {
            // Redirect via Netlify Function to keep secrets server-side
            const lang = getLanguage();
            const fn = `/.netlify/functions/enova-auth?type=login&lang=${encodeURIComponent(lang || 'EN')}`;
            window.location.href = fn;
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

/**
 * Premium Checkout Modal
 *
 * Shown when a trader tries to load a locked premium bot. Summarises the bot
 * and its one-time price, then hands off to Paystack's hosted checkout.
 * Also renders the post-payment result state (success / pending / failed).
 */

import React from 'react';
import { Button, Text } from '@deriv/components';
import { observer } from '@deriv/stores';
import { localize } from '@deriv/translations';
import { BotMetadata } from '../data/types';
import { TPaymentResult } from './use-premium-access';
import './premium-checkout-modal.scss';

const LockIcon = () => (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <rect x='4' y='10' width='16' height='11' rx='2.5' stroke='currentColor' strokeWidth='2' />
        <path d='M8 10V7a4 4 0 1 1 8 0v3' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        <circle cx='12' cy='15.5' r='1.6' fill='currentColor' />
    </svg>
);

const ShieldIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <path
            d='M12 2.5 4.5 5.5v6c0 4.7 3.2 8.3 7.5 9.9 4.3-1.6 7.5-5.2 7.5-9.9v-6L12 2.5Z'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinejoin='round'
        />
        <path d='m8.8 12 2.2 2.2 4.2-4.4' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    </svg>
);

const SuccessIcon = () => (
    <svg width='48' height='48' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
        <path d='m7.5 12.5 3 3 6-6.5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
);

type TPremiumCheckoutModalProps = {
    bot: BotMetadata | null;
    price_label: string;
    is_open: boolean;
    is_processing: boolean;
    error_message: string;
    payment_result: TPaymentResult;
    onConfirm: (bot_id: number) => void;
    onClose: () => void;
    onLoadUnlockedBot?: (bot_id: number) => void;
};

const PremiumCheckoutModal: React.FC<TPremiumCheckoutModalProps> = observer(
    ({ bot, price_label, is_open, is_processing, error_message, payment_result, onConfirm, onClose, onLoadUnlockedBot }) => {
        // Escape key closes the modal (a11y escape route).
        React.useEffect(() => {
            if (!is_open) return undefined;
            const onKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', onKeyDown);
            return () => window.removeEventListener('keydown', onKeyDown);
        }, [is_open, onClose]);

        if (!is_open) return null;

        const renderPaymentResult = () => {
            if (!payment_result) return null;
            if (payment_result.status === 'success') {
                return (
                    <div className='premium-checkout__result premium-checkout__result--success'>
                        <SuccessIcon />
                        <Text size='s' weight='bold' align='center'>
                            {localize('Payment confirmed — bot unlocked!')}
                        </Text>
                        <Text size='xxs' align='center' className='premium-checkout__result-subtext'>
                            {localize('You now have lifetime access to this strategy on this account.')}
                        </Text>
                        <Button
                            primary
                            large
                            text={localize('Load bot now')}
                            onClick={() => {
                                if (Number.isFinite(payment_result.bot_id) && onLoadUnlockedBot) {
                                    onLoadUnlockedBot(payment_result.bot_id as number);
                                }
                                onClose();
                            }}
                        />
                    </div>
                );
            }
            const is_pending = payment_result.status === 'pending';
            return (
                <div className='premium-checkout__result'>
                    <Text size='s' weight='bold' align='center'>
                        {is_pending
                            ? localize('Payment is still processing')
                            : localize('Payment was not completed')}
                    </Text>
                    <Text size='xxs' align='center' className='premium-checkout__result-subtext'>
                        {is_pending
                            ? localize('If you completed the payment, your bot will unlock automatically in a few minutes. You can refresh this page to check again.')
                            : localize('You were not charged. You can try again whenever you are ready.')}
                    </Text>
                    <Button secondary large text={localize('Close')} onClick={onClose} />
                </div>
            );
        };

        return (
            <div className='premium-checkout' role='dialog' aria-modal='true' aria-label={localize('Unlock premium bot')}>
                <div className='premium-checkout__overlay' onClick={onClose} />
                <div className='premium-checkout__panel'>
                    <button
                        type='button'
                        className='premium-checkout__close'
                        aria-label={localize('Close')}
                        onClick={onClose}
                    >
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                            <path d='M6 6l12 12M18 6 6 18' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' />
                        </svg>
                    </button>

                    {payment_result ? (
                        renderPaymentResult()
                    ) : (
                        bot && (
                            <React.Fragment>
                                <div className='premium-checkout__header'>
                                    <div className='premium-checkout__lock' style={{ color: bot.color }}>
                                        <LockIcon />
                                    </div>
                                    <Text size='s' weight='bold'>
                                        {localize('Unlock {{bot_name}}', { bot_name: bot.displayName })}
                                    </Text>
                                    <Text size='xxs' className='premium-checkout__tagline'>
                                        {bot.tagline}
                                    </Text>
                                </div>

                                <div className='premium-checkout__price-box'>
                                    <Text size='xxs' className='premium-checkout__price-caption'>
                                        {localize('One-time payment · lifetime access')}
                                    </Text>
                                    <span className='premium-checkout__price'>{price_label || '…'}</span>
                                </div>

                                <ul className='premium-checkout__benefits'>
                                    <li>{localize('Instant activation after payment')}</li>
                                    <li>{localize('Free access to all future updates of this bot')}</li>
                                    <li>{localize('Works on every device you log in from')}</li>
                                </ul>

                                {error_message && (
                                    <Text size='xxs' color='loss-danger' className='premium-checkout__error' role='alert'>
                                        {error_message}
                                    </Text>
                                )}

                                <Button
                                    primary
                                    large
                                    is_disabled={is_processing}
                                    is_loading={is_processing}
                                    text={is_processing ? localize('Redirecting…') : localize('Pay securely with Paystack')}
                                    onClick={() => onConfirm(bot.id)}
                                    className='premium-checkout__pay-btn'
                                />

                                <div className='premium-checkout__secure-note'>
                                    <ShieldIcon />
                                    <Text size='xxxs'>
                                        {localize('Payments are processed by Paystack. Card, M-Pesa, bank transfer and mobile money are supported depending on your region.')}
                                    </Text>
                                </div>
                            </React.Fragment>
                        )
                    )}
                </div>
            </div>
        );
    }
);

export default PremiumCheckoutModal;

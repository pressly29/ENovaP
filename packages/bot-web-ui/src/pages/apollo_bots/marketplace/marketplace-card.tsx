/**
 * Marketplace Card Component
 *
 * Displays individual bot with rich metadata (NO win rate - varies per user)
 */

import React from 'react';
import { Text, Button } from '@deriv/components';
import { observer } from '@deriv/stores';
import { BotMetadata } from '../data/types';
import { getCategoryColor, getRiskLevelColor, getRiskLevelIcon } from '../data/bot-categories';
import './marketplace-card.scss';

const CardLockIcon = () => (
    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <rect x='4' y='10' width='16' height='11' rx='2.5' stroke='currentColor' strokeWidth='2.5' />
        <path d='M8 10V7a4 4 0 1 1 8 0v3' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' />
    </svg>
);

const CardUnlockedIcon = () => (
    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
        <path d='m20 6-11 11-5-5' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
);

interface MarketplaceCardProps {
    bot: BotMetadata;
    onLoadBot: (botId: number) => void;
    /** True when the bot is paid and the trader has NOT purchased it yet */
    is_locked?: boolean;
    /** True when the bot is paid and already purchased (shows "Owned" chip) */
    is_owned?: boolean;
    /** Server-resolved price label, e.g. "KES 1,500" */
    price_label?: string;
    /** Opens the Paystack checkout modal for this bot */
    onUnlock?: (bot: BotMetadata) => void;
    /** Reserved for the details modal (passed by the grid) */
    onViewDetails?: (bot: BotMetadata) => void;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = observer(({ bot, onLoadBot, is_locked, is_owned, price_label, onUnlock }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const categoryColor = getCategoryColor(bot.category);
    const riskColor = getRiskLevelColor(bot.riskLevel);
    const riskIcon = getRiskLevelIcon(bot.riskLevel);

    // Format risk level for display
    const formatRiskLevel = (level: string): string => {
        return level
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Render star rating
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className='marketplace-card__rating-stars'>
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className='star'>
                        ★
                    </span>
                ))}
                {hasHalfStar && <span className='star half'>★</span>}
            </div>
        );
    };

    return (
        <div
            className={`marketplace-card ${isHovered ? 'marketplace-card--hovered' : ''} ${
                is_locked ? 'marketplace-card--locked' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Top Section - Icon & Badge */}
            <div className='marketplace-card__top'>
                <div
                    className='marketplace-card__icon-wrapper'
                    style={{ background: `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor})` }}
                >
                    <span className='marketplace-card__icon'>{bot.thumbnail}</span>
                </div>
                <div className='marketplace-card__badges'>
                    {is_locked && (
                        <span className='marketplace-card__premium-chip'>
                            <CardLockIcon />
                            PREMIUM
                        </span>
                    )}
                    {is_owned && (
                        <span className='marketplace-card__premium-chip marketplace-card__premium-chip--owned'>
                            <CardUnlockedIcon />
                            OWNED
                        </span>
                    )}
                    {bot.badge && (
                        <span
                            className={`marketplace-card__badge marketplace-card__badge--${bot.badge.toLowerCase()}`}
                        >
                            {bot.badge}
                        </span>
                    )}
                </div>
            </div>

            {/* Name & Category */}
            <div className='marketplace-card__header'>
                <Text size='s' weight='bold' className='marketplace-card__name'>
                    {bot.displayName}
                </Text>
                <span
                    className='marketplace-card__category'
                    style={{ backgroundColor: `${categoryColor}22`, color: categoryColor }}
                >
                    {bot.category.replace('_', ' ').toUpperCase()}
                </span>
            </div>

            {/* Tagline */}
            <Text size='xxs' className='marketplace-card__tagline'>
                {bot.tagline}
            </Text>

            {/* Risk & Rating */}
            <div className='marketplace-card__info-row'>
                <div
                    className='marketplace-card__risk-badge'
                    style={{ backgroundColor: `${riskColor}22`, color: riskColor, borderColor: riskColor }}
                >
                    <span>{riskIcon}</span>
                    <span className='marketplace-card__risk-text'>{formatRiskLevel(bot.riskLevel)}</span>
                </div>
                <div className='marketplace-card__rating'>
                    {renderStars(bot.metrics.rating)}
                    <span className='marketplace-card__rating-value'>{bot.metrics.rating.toFixed(1)}</span>
                </div>
            </div>

            {/* Features Pills */}
            <div className='marketplace-card__features'>
                {bot.variables.virtualHook && <span className='marketplace-card__feature-pill'>🧪 Virtual Test</span>}
                {bot.variables.martingale && <span className='marketplace-card__feature-pill'>📊 Martingale</span>}
                {bot.variables.patternAnalysis && <span className='marketplace-card__feature-pill'>🔮 AI Pattern</span>}
            </div>

            {/* Downloads */}
            {/* <div className="marketplace-card__footer">
                <Text size="xxxs" className="marketplace-card__downloads">
                    ⬇️ {bot.metrics.downloads.toLocaleString()} • 👥 {bot.metrics.activeUsers}
                </Text>
            </div> */}

            {/* Action Button */}
            <div className='marketplace-card__action'>
                {is_locked ? (
                    <Button
                        text={price_label ? `Unlock · ${price_label}` : 'Unlock Bot'}
                        onClick={() => onUnlock?.(bot)}
                        primary
                        className='marketplace-card__btn-load marketplace-card__btn-unlock'
                    />
                ) : (
                    <Button
                        text='Load Bot'
                        onClick={() => onLoadBot(bot.id)}
                        primary
                        className='marketplace-card__btn-load'
                    />
                )}
            </div>
        </div>
    );
});

export default MarketplaceCard;

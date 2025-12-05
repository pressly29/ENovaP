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

interface MarketplaceCardProps {
    bot: BotMetadata;
    onLoadBot: (botId: number) => void;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = observer(({ bot, onLoadBot }) => {
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
            className={`marketplace-card ${isHovered ? 'marketplace-card--hovered' : ''}`}
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
                {bot.badge && (
                    <span className={`marketplace-card__badge marketplace-card__badge--${bot.badge.toLowerCase()}`}>
                        {bot.badge}
                    </span>
                )}
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
                <Button
                    text='Load Bot'
                    onClick={() => onLoadBot(bot.id)}
                    primary
                    className='marketplace-card__btn-load'
                />
            </div>
        </div>
    );
});

export default MarketplaceCard;

/**
 * Bot Filter Configurations
 * 
 * Defines all available filters for the bot marketplace with their options and logic.
 */

import { BotCategory, RiskLevel, TradeType, MarketType, MarketplaceFilters, BotMetadata } from './types';

// ============================================================================
// FILTER DEFINITIONS
// ============================================================================

/**
 * Available filter types
 */
export type FilterType = 'category' | 'risk' | 'tradeType' | 'market' | 'rating' | 'freeOnly';

/**
 * Filter option interface
 */
export interface FilterOption {
    value: string;
    label: string;
    count?: number;
    icon?: string;
    color?: string;
}

// ============================================================================
// CATEGORY FILTERS
// ============================================================================

export const CATEGORY_FILTERS: FilterOption[] = [
    { value: 'all', label: 'All Categories', icon: '🤖' },
    { value: 'martingale', label: 'Martingale', icon: '🎲', color: '#FF6B6B' },
    { value: 'pattern', label: 'Pattern Analysis', icon: '🔮', color: '#4ECDC4' },
    { value: 'scalping', label: 'Scalping', icon: '⚡', color: '#FFE66D' },
    { value: 'hybrid', label: 'Hybrid', icon: '🔄', color: '#A8E6CF' },
    { value: 'aggressive', label: 'Aggressive', icon: '🔥', color: '#FF5252' },
    { value: 'conservative', label: 'Conservative', icon: '🛡️', color: '#81C784' },
    { value: 'trend_following', label: 'Trend Following', icon: '📈', color: '#64B5F6' },
    { value: 'digits', label: 'Digits', icon: '🔢', color: '#BA68C8' },
    { value: 'breakout', label: 'Breakout', icon: '💥', color: '#FF7043' },
    { value: 'grid', label: 'Grid', icon: '⚡', color: '#FFD54F' },
    { value: 'mean_reversion', label: 'Mean Reversion', icon: '📉', color: '#90CAF9' }
];

// ============================================================================
// RISK FILTERS
// ============================================================================

export const RISK_FILTERS: FilterOption[] = [
    { value: 'all', label: 'All Risk Levels', icon: '📊' },
    { value: 'very_low', label: 'Very Low Risk', icon: '🛡️', color: '#4CAF50' },
    { value: 'low', label: 'Low Risk', icon: '✅', color: '#8BC34A' },
    { value: 'medium', label: 'Medium Risk', icon: '⚠️', color: '#FFC107' },
    { value: 'high', label: 'High Risk', icon: '🔥', color: '#FF9800' },
    { value: 'very_high', label: 'Very High Risk', icon: '⚡', color: '#F44336' }
];

// ============================================================================
// TRADE TYPE FILTERS
// ============================================================================

export const TRADE_TYPE_FILTERS: FilterOption[] = [
    { value: 'all', label: 'All Trade Types', icon: '🎯' },
    { value: 'digits', label: 'Digits', icon: '🔢' },
    { value: 'rise_fall', label: 'Rise/Fall', icon: '📈' },
    { value: 'matches_differs', label: 'Matches/Differs', icon: '🎲' },
    { value: 'even_odd', label: 'Even/Odd', icon: '⚖️' },
    { value: 'over_under', label: 'Over/Under', icon: '📊' },
    { value: 'touch_no_touch', label: 'Touch/No Touch', icon: '👆' },
    { value: 'ends_between', label: 'Ends Between', icon: '↔️' },
    { value: 'stays_between', label: 'Stays Between', icon: '🎯' },
    { value: 'higher_lower', label: 'Higher/Lower', icon: '⬆️' }
];

// ============================================================================
// MARKET FILTERS
// ============================================================================

export const MARKET_FILTERS: FilterOption[] = [
    { value: 'all', label: 'All Markets', icon: '🌐' },
    { value: 'synthetic_indices', label: 'Synthetic Indices', icon: '🎲' },
    { value: 'forex', label: 'Forex', icon: '💱' },
    { value: 'commodities', label: 'Commodities', icon: '🛢️' },
    { value: 'stock_indices', label: 'Stock Indices', icon: '📊' },
    { value: 'cryptocurrencies', label: 'Cryptocurrencies', icon: '₿' }
];

// ============================================================================
// RATING FILTERS
// ============================================================================

export const RATING_FILTERS: FilterOption[] = [
    { value: '0', label: 'All Ratings', icon: '⭐' },
    { value: '4', label: '4+ Stars', icon: '⭐⭐⭐⭐' },
    { value: '4.5', label: '4.5+ Stars', icon: '⭐⭐⭐⭐⭐' }
];

// ============================================================================
// DEFAULT FILTERS
// ============================================================================

export const DEFAULT_FILTERS: MarketplaceFilters = {
    categories: [],
    riskLevels: [],
    tradeTypes: [],
    markets: [],
    showFreeOnly: false,
    minRating: 0
};

// ============================================================================
// FILTER LOGIC FUNCTIONS
// ============================================================================

/**
 * Apply all filters to bot list
 */
export const applyFilters = (bots: BotMetadata[], filters: MarketplaceFilters): BotMetadata[] => {
    return bots.filter(bot => {
        // Category filter
        if (filters.categories.length > 0) {
            const matchesCategory = filters.categories.includes(bot.category as BotCategory) ||
                                  (bot.secondaryCategory && filters.categories.includes(bot.secondaryCategory as BotCategory));
            if (!matchesCategory) return false;
        }
        
        // Risk level filter
        if (filters.riskLevels.length > 0) {
            if (!filters.riskLevels.includes(bot.riskLevel as RiskLevel)) return false;
        }
        
        // Trade type filter
        if (filters.tradeTypes.length > 0) {
            const matchesTradeType = bot.tradeTypes.some(type => 
                filters.tradeTypes.includes(type as TradeType)
            );
            if (!matchesTradeType) return false;
        }
        
        // Market filter
        if (filters.markets.length > 0) {
            const matchesMarket = bot.markets.some(market => 
                filters.markets.includes(market as MarketType)
            );
            if (!matchesMarket) return false;
        }
        
        // Rating filter
        if (filters.minRating && filters.minRating > 0) {
            if (bot.metrics.rating < filters.minRating) return false;
        }
        
        // Free only filter (all bots are free for now)
        if (filters.showFreeOnly) {
            // Implementation for future paid bots
            return true;
        }
        
        return true;
    });
};

/**
 * Check if filters are active (not default)
 */
export const hasActiveFilters = (filters: MarketplaceFilters): boolean => {
    return filters.categories.length > 0 ||
           filters.riskLevels.length > 0 ||
           filters.tradeTypes.length > 0 ||
           filters.markets.length > 0 ||
           filters.showFreeOnly ||
           (filters.minRating !== undefined && filters.minRating > 0);
};

/**
 * Reset filters to default
 */
export const resetFilters = (): MarketplaceFilters => {
    return { ...DEFAULT_FILTERS };
};

/**
 * Count bots matching each filter option
 */
export const countBotsPerFilter = (bots: BotMetadata[], filterType: FilterType): Record<string, number> => {
    const counts: Record<string, number> = {};
    
    bots.forEach(bot => {
        switch (filterType) {
            case 'category':
                counts[bot.category] = (counts[bot.category] || 0) + 1;
                if (bot.secondaryCategory) {
                    counts[bot.secondaryCategory] = (counts[bot.secondaryCategory] || 0) + 1;
                }
                break;
            
            case 'risk':
                counts[bot.riskLevel] = (counts[bot.riskLevel] || 0) + 1;
                break;
            
            case 'tradeType':
                bot.tradeTypes.forEach(type => {
                    counts[type] = (counts[type] || 0) + 1;
                });
                break;
            
            case 'market':
                bot.markets.forEach(market => {
                    counts[market] = (counts[market] || 0) + 1;
                });
                break;
            
            case 'rating':
                if (bot.metrics.rating >= 4) counts['4'] = (counts['4'] || 0) + 1;
                if (bot.metrics.rating >= 4.5) counts['4.5'] = (counts['4.5'] || 0) + 1;
                break;
            default:
                break;
        }
    });
    
    return counts;
};

/**
 * Get filter options with counts
 */
export const getFilterOptionsWithCounts = (
    filterType: FilterType,
    bots: BotMetadata[]
): FilterOption[] => {
    const counts = countBotsPerFilter(bots, filterType);
    
    let options: FilterOption[] = [];
    
    switch (filterType) {
        case 'category':
            options = CATEGORY_FILTERS;
            break;
        case 'risk':
            options = RISK_FILTERS;
            break;
        case 'tradeType':
            options = TRADE_TYPE_FILTERS;
            break;
        case 'market':
            options = MARKET_FILTERS;
            break;
        case 'rating':
            options = RATING_FILTERS;
            break;
        default:
            break;
    }
    
    return options.map(option => ({
        ...option,
        count: counts[option.value] || 0
    }));
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    CATEGORY_FILTERS,
    RISK_FILTERS,
    TRADE_TYPE_FILTERS,
    MARKET_FILTERS,
    RATING_FILTERS,
    DEFAULT_FILTERS,
    applyFilters,
    hasActiveFilters,
    resetFilters,
    countBotsPerFilter,
    getFilterOptionsWithCounts
};

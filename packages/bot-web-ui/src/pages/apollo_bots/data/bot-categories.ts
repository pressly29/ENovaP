/**
 * Bot Category Definitions
 * 
 * This file defines all bot categories, their properties, and helper functions.
 */

import { BotCategory } from './types';

// ============================================================================
// CATEGORY METADATA
// ============================================================================

export interface CategoryInfo {
    id: BotCategory;
    name: string;
    displayName: string;
    description: string;
    icon: string;               // Emoji or icon identifier
    color: string;              // Hex color for the category
    riskRange: [number, number]; // Min and max risk scores
    keywords: string[];         // Keywords for search
}

export const CATEGORY_DEFINITIONS: Record<BotCategory, CategoryInfo> = {
    martingale: {
        id: 'martingale',
        name: 'Martingale',
        displayName: 'Martingale Strategy',
        description: 'Progressive betting systems that increase stakes after losses to recover. High risk, high reward.',
        icon: '🎲',
        color: '#FF6B6B',
        riskRange: [7, 10],
        keywords: ['martingale', 'progression', 'doubling', 'recovery', 'aggressive']
    },
    
    pattern: {
        id: 'pattern',
        name: 'Pattern Analysis',
        displayName: 'Pattern Recognition',
        description: 'Bots that analyze market patterns and historical data to predict future movements.',
        icon: '🔮',
        color: '#4ECDC4',
        riskRange: [3, 6],
        keywords: ['pattern', 'analysis', 'prediction', 'AI', 'recognition', 'data']
    },
    
    scalping: {
        id: 'scalping',
        name: 'Scalping',
        displayName: 'Scalping Strategy',
        description: 'Quick in-and-out trades for small profits. Multiple trades per day.',
        icon: '⚡',
        color: '#FFE66D',
        riskRange: [2, 5],
        keywords: ['scalping', 'quick', 'fast', 'short-term', 'rapid']
    },
    
    hybrid: {
        id: 'hybrid',
        name: 'Hybrid',
        displayName: 'Hybrid Strategy',
        description: 'Combines multiple strategies for balanced risk-reward. Adapts to market conditions.',
        icon: '🔄',
        color: '#A8E6CF',
        riskRange: [5, 8],
        keywords: ['hybrid', 'combined', 'multi-strategy', 'adaptive', 'balanced']
    },
    
    aggressive: {
        id: 'aggressive',
        name: 'Aggressive',
        displayName: 'Aggressive Trading',
        description: 'High-risk strategies for experienced traders seeking maximum returns.',
        icon: '🔥',
        color: '#FF5252',
        riskRange: [8, 10],
        keywords: ['aggressive', 'high-risk', 'extreme', 'maximum', 'advanced']
    },
    
    conservative: {
        id: 'conservative',
        name: 'Conservative',
        displayName: 'Conservative Trading',
        description: 'Low-risk strategies focused on capital preservation and steady growth.',
        icon: '🛡️',
        color: '#81C784',
        riskRange: [1, 4],
        keywords: ['conservative', 'safe', 'low-risk', 'steady', 'protection']
    },
    
    trend_following: {
        id: 'trend_following',
        name: 'Trend Following',
        displayName: 'Trend Following',
        description: 'Identifies and follows market trends for consistent directional trades.',
        icon: '📈',
        color: '#64B5F6',
        riskRange: [4, 7],
        keywords: ['trend', 'momentum', 'direction', 'following', 'directional']
    },
    
    digits: {
        id: 'digits',
        name: 'Digits',
        displayName: 'Digit Trading',
        description: 'Specialized bots for digit contracts (matches, differs, over/under, even/odd).',
        icon: '🔢',
        color: '#BA68C8',
        riskRange: [3, 6],
        keywords: ['digits', 'numbers', 'matches', 'differs', 'even', 'odd']
    },
    
    breakout: {
        id: 'breakout',
        name: 'Breakout',
        displayName: 'Breakout Trading',
        description: 'Catches explosive price movements when market breaks support/resistance.',
        icon: '💥',
        color: '#FF7043',
        riskRange: [5, 7],
        keywords: ['breakout', 'explosive', 'momentum', 'support', 'resistance']
    },
    
    grid: {
        id: 'grid',
        name: 'Grid',
        displayName: 'Grid Trading',
        description: 'Places multiple orders at predetermined intervals to profit from volatility.',
        icon: '⚡',
        color: '#FFD54F',
        riskRange: [4, 6],
        keywords: ['grid', 'systematic', 'intervals', 'volatility', 'levels']
    },
    
    mean_reversion: {
        id: 'mean_reversion',
        name: 'Mean Reversion',
        displayName: 'Mean Reversion',
        description: 'Trades oversold/overbought conditions expecting price to return to average.',
        icon: '📉',
        color: '#90CAF9',
        riskRange: [3, 5],
        keywords: ['mean', 'reversion', 'oversold', 'overbought', 'RSI', 'indicators']
    }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category info by ID
 */
export const getCategoryInfo = (category: BotCategory): CategoryInfo => {
    return CATEGORY_DEFINITIONS[category];
};

/**
 * Get all categories
 */
export const getAllCategories = (): CategoryInfo[] => {
    return Object.values(CATEGORY_DEFINITIONS);
};

/**
 * Get categories by risk level
 */
export const getCategoriesByRisk = (riskLevel: 'low' | 'medium' | 'high'): CategoryInfo[] => {
    const riskRanges: Record<string, [number, number]> = {
        low: [1, 4],
        medium: [4, 7],
        high: [7, 10]
    };
    
    const [minRisk, maxRisk] = riskRanges[riskLevel];
    
    return getAllCategories().filter(cat => {
        const [catMin, catMax] = cat.riskRange;
        return (catMin >= minRisk && catMin <= maxRisk) || 
               (catMax >= minRisk && catMax <= maxRisk);
    });
};

/**
 * Search categories by keyword
 */
export const searchCategories = (query: string): CategoryInfo[] => {
    const lowercaseQuery = query.toLowerCase();
    return getAllCategories().filter(cat => 
        cat.name.toLowerCase().includes(lowercaseQuery) ||
        cat.displayName.toLowerCase().includes(lowercaseQuery) ||
        cat.description.toLowerCase().includes(lowercaseQuery) ||
        cat.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    );
};

/**
 * Get category color
 */
export const getCategoryColor = (category: BotCategory): string => {
    return CATEGORY_DEFINITIONS[category]?.color || '#9E9E9E';
};

/**
 * Get category icon
 */
export const getCategoryIcon = (category: BotCategory): string => {
    return CATEGORY_DEFINITIONS[category]?.icon || '🤖';
};

// ============================================================================
// RISK LEVEL DEFINITIONS
// ============================================================================

export interface RiskLevelInfo {
    id: string;
    name: string;
    color: string;
    icon: string;
    description: string;
    scoreRange: [number, number];
}

export const RISK_LEVELS: Record<string, RiskLevelInfo> = {
    very_low: {
        id: 'very_low',
        name: 'Very Low Risk',
        color: '#4CAF50',
        icon: '🛡️',
        description: 'Safest strategies with capital protection focus',
        scoreRange: [1, 2]
    },
    low: {
        id: 'low',
        name: 'Low Risk',
        color: '#8BC34A',
        icon: '✅',
        description: 'Conservative strategies with minimal risk',
        scoreRange: [3, 4]
    },
    medium: {
        id: 'medium',
        name: 'Medium Risk',
        color: '#FFC107',
        icon: '⚠️',
        description: 'Balanced risk-reward strategies',
        scoreRange: [5, 6]
    },
    high: {
        id: 'high',
        name: 'High Risk',
        color: '#FF9800',
        icon: '🔥',
        description: 'Aggressive strategies requiring experience',
        scoreRange: [7, 8]
    },
    very_high: {
        id: 'very_high',
        name: 'Very High Risk',
        color: '#F44336',
        icon: '⚡',
        description: 'Extreme risk strategies for experts only',
        scoreRange: [9, 10]
    }
};

/**
 * Get risk level info from score
 */
export const getRiskLevelFromScore = (score: number): RiskLevelInfo => {
    const levels = Object.values(RISK_LEVELS);
    const foundLevel = levels.find(level => {
        const [min, max] = level.scoreRange;
        return score >= min && score <= max;
    });
    return foundLevel || RISK_LEVELS.medium; // Default to medium if out of range
};

/**
 * Get risk level color from string
 */
export const getRiskLevelColor = (riskLevel: string): string => {
    return RISK_LEVELS[riskLevel]?.color || '#FFC107';
};

/**
 * Get risk level icon from string
 */
export const getRiskLevelIcon = (riskLevel: string): string => {
    return RISK_LEVELS[riskLevel]?.icon || '⚠️';
};

/**
 * Bot Tabs Configuration
 * 
 * Defines tab structure for bot marketplace
 */

export enum BotTabs {
    DEFAULT = 'default',
    ADVANCED = 'advanced',
}

export interface BotTab {
    id: BotTabs;
    label: string;
    description: string;
    icon: string;
}

export const BOT_TABS: BotTab[] = [
    {
        id: BotTabs.DEFAULT,
        label: 'Default Bots',
        description: 'Pre-built trading strategies ready to use',
        icon: '🤖'
    },
    {
        id: BotTabs.ADVANCED,
        label: 'Advanced Strategies',
        description: 'Specialized bots for experienced traders',
        icon: '🚀'
    }
];

/**
 * Category Filters for Advanced Bots
 */
export enum BotCategoryFilter {
    ALL = 'all',
    MARTINGALE = 'martingale_variants',
    SCALPING = 'scalping',
    TECHNICAL = 'technical_analysis',
    AI_ML = 'ai_ml',
    GRID = 'grid_trading',
    CONSERVATIVE = 'conservative'
}

export interface CategoryFilter {
    id: BotCategoryFilter;
    label: string;
    description: string;
    icon: string;
    color: string;
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
    {
        id: BotCategoryFilter.ALL,
        label: 'All Strategies',
        description: 'Show all advanced bots',
        icon: '⚡',
        color: '#6366f1'
    },
    {
        id: BotCategoryFilter.MARTINGALE,
        label: 'Martingale Variants',
        description: 'Progressive stake recovery systems',
        icon: '🔄',
        color: '#ef4444'
    },
    {
        id: BotCategoryFilter.SCALPING,
        label: 'Scalping & High Frequency',
        description: 'Fast, frequent, small profit trades',
        icon: '⚡',
        color: '#10b981'
    },
    {
        id: BotCategoryFilter.TECHNICAL,
        label: 'Technical Analysis',
        description: 'Indicator-based trading systems',
        icon: '📊',
        color: '#3b82f6'
    },
    {
        id: BotCategoryFilter.AI_ML,
        label: 'AI & Machine Learning',
        description: 'Artificial intelligence powered bots',
        icon: '🧠',
        color: '#8b5cf6'
    },
    {
        id: BotCategoryFilter.GRID,
        label: 'Grid & Range Trading',
        description: 'Profit from sideways markets',
        icon: '🔲',
        color: '#f59e0b'
    },
    {
        id: BotCategoryFilter.CONSERVATIVE,
        label: 'Conservative & Safe',
        description: 'Low-risk capital preservation',
        icon: '🛡️',
        color: '#06b6d4'
    }
];

/**
 * Get category filter by ID
 */
export const getCategoryFilter = (id: BotCategoryFilter): CategoryFilter | undefined => {
    return CATEGORY_FILTERS.find(filter => filter.id === id);
};

/**
 * Get category color
 */
export const getCategoryFilterColor = (id: BotCategoryFilter): string => {
    const filter = getCategoryFilter(id);
    return filter?.color || '#6366f1';
};

/**
 * Enhanced Bot Marketplace Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the bot marketplace.
 * These types transform simple bot listings into rich, professional marketplace data.
 */

import { BotTabs, BotCategoryFilter } from './bot-tabs';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type BotCategory = 
    | 'martingale' 
    | 'pattern' 
    | 'scalping' 
    | 'hybrid' 
    | 'aggressive' 
    | 'conservative'
    | 'trend_following'
    | 'digits'
    | 'breakout'
    | 'grid'
    | 'mean_reversion';

export type TradeType = 
    | 'digits'
    | 'rise_fall' 
    | 'matches_differs' 
    | 'even_odd' 
    | 'over_under'
    | 'touch_no_touch'
    | 'ends_between'
    | 'stays_between'
    | 'higher_lower';

export type MarketType = 
    | 'synthetic_indices' 
    | 'forex' 
    | 'commodities'
    | 'stock_indices'
    | 'cryptocurrencies';

export type RiskLevel = 
    | 'very_low'
    | 'low' 
    | 'medium' 
    | 'high' 
    | 'very_high';

export type CapitalRequirement = 
    | 'low'      // $20-$50
    | 'medium'   // $50-$100
    | 'high';    // $100+

export type BotBadge =
    | 'NEW'
    | 'PRO'
    | 'POPULAR'
    | 'VERIFIED'
    | 'RECOMMENDED'
    | 'HOT';

export type BotAccessTier = 'free' | 'premium';

/**
 * Access/pricing info for a bot. Which bots are premium is configured in
 * premium-bots.ts; live prices are fetched from the bot-entitlements
 * Netlify function so the UI always shows what Paystack will charge.
 */
export interface BotAccess {
    tier: BotAccessTier;
    /** Price label resolved from the server catalog, e.g. "KES 1,500" */
    priceLabel?: string;
}

// ============================================================================
// TAB & FILTER TYPES
// ============================================================================

export { BotTabs, BotCategoryFilter };

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Performance statistics for a bot
 * These can be simulated or real historical data
 */
export interface BotStats {
    avgWinRate: number;           // Average win rate (0-100)
    avgProfit: string;            // e.g., "$15-25 per day"
    tradesPerDay: number;         // Average number of trades
    maxDrawdown: string;          // Maximum drawdown percentage
    bestTimeframe: string;        // Optimal trading timeframe
    avgTradeDuration: string;     // e.g., "5 ticks", "1 minute"
    profitFactor?: number;        // Gross profit / Gross loss
    sharpeRatio?: number;         // Risk-adjusted return
}

/**
 * Bot feature flags indicating what capabilities it has
 */
export interface BotVariables {
    martingale: boolean;          // Uses martingale progression
    virtualHook: boolean;         // Has virtual testing mode
    stopLoss: boolean;            // Has stop loss protection
    takeProfit: boolean;          // Has take profit targets
    patternAnalysis: boolean;     // Analyzes market patterns
    multiStrategy: boolean;       // Can switch between strategies
    adaptiveStaking: boolean;     // Dynamic stake management
    trailingStop: boolean;        // Trailing stop loss
}

/**
 * Bot configuration settings
 */
export interface BotSettings {
    minStake: number;             // Minimum stake amount
    maxStake: number;             // Maximum stake amount
    recommendedStake: number;     // Recommended starting stake
    minBalance: number;           // Minimum account balance required
    maxConcurrentTrades?: number; // Max simultaneous trades
    cooldownPeriod?: number;      // Seconds between trades
}

/**
 * Bot usage and engagement metrics
 */
export interface BotMetrics {
    downloads: number;            // Total downloads/loads
    activeUsers: number;          // Current active users
    rating: number;               // Average rating (0-5)
    reviews: number;              // Total number of reviews
    favorites?: number;           // Times added to favorites
    successRate?: number;         // Reported success rate
}

/**
 * Bot author/creator information
 */
export interface BotAuthor {
    name: string;                 // Author name
    verified: boolean;            // Verified creator badge
    website?: string;             // Author website
    contact?: string;             // Contact email
}

/**
 * Individual user review
 */
export interface BotReview {
    id: string;
    userName: string;
    rating: number;               // 1-5 stars
    comment: string;
    date: string;
    verified: boolean;            // Verified purchaser/user
    helpful: number;              // Helpfulness votes
}

// ============================================================================
// MAIN BOT METADATA INTERFACE
// ============================================================================

/**
 * Complete bot metadata structure
 * This is the enhanced version of the simple { id, name, xml } structure
 */
export interface BotMetadata {
    // ========== Core Identity ==========
    id: number;
    name: string;                 // Internal name (keep original)
    displayName: string;          // User-facing display name
    tagline: string;              // Short catchy description (1 line)
    description: string;          // Full description (2-3 paragraphs)
    xml: string;                  // Bot XML content
    version: string;              // Version number (e.g., "2.2", "3.0")
    
    // ========== Visual Assets ==========
    thumbnail: string;            // Icon/image path or emoji
    badge?: BotBadge;            // Optional badge (NEW, PRO, etc.)
    color: string;                // Brand color (hex code)
    icon?: string;                // Icon emoji or path
    
    // ========== Categorization ==========
    category: BotCategory;        // Primary category
    secondaryCategory?: BotCategory; // Optional secondary category
    tradeTypes: TradeType[];      // Supported trade types
    markets: MarketType[];        // Supported markets
    tags: string[];               // Searchable tags
    
    // ========== Navigation & Filtering ==========
    tab: BotTabs;                 // Which tab this bot appears in (DEFAULT or ADVANCED)
    categoryFilter?: BotCategoryFilter; // Category filter for advanced bots (optional)
    
    // ========== Risk Assessment ==========
    riskLevel: RiskLevel;         // Overall risk level
    riskScore: number;            // Numeric risk score (1-10)
    requiredCapital: CapitalRequirement;
    volatilityTolerance: 'low' | 'medium' | 'high';
    
    // ========== Strategy Details ==========
    howItWorks: string[];         // Step-by-step explanation
    keyFeatures: string[];        // Bullet point features
    tradingStyle: string;         // e.g., "Aggressive Martingale"
    strategy: string;             // Strategy type description
    algorithm: string;            // Algorithm description
    
    // ========== Technical Specifications ==========
    variables: BotVariables;      // Feature flags
    settings: BotSettings;        // Configuration values
    
    // ========== Performance ==========
    stats: BotStats;              // Performance statistics
    backtestResults?: {           // Optional backtest data
        period: string;
        trades: number;
        winRate: number;
        profit: string;
    };
    
    // ========== User Engagement ==========
    metrics: BotMetrics;          // Usage metrics
    reviews?: BotReview[];        // User reviews (optional)
    
    // ========== Metadata ==========
    author: BotAuthor;            // Creator info
    createdAt: string;            // ISO date string
    updatedAt: string;            // ISO date string
    
    // ========== Additional Info ==========
    prerequisites?: string[];     // Requirements before using
    warnings?: string[];          // Important warnings
    bestFor?: string[];           // Best use cases
    notRecommendedFor?: string[]; // Not suitable for...
    relatedBots?: number[];       // IDs of related bots
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Filter options for marketplace
 */
export interface MarketplaceFilters {
    categories: BotCategory[];
    riskLevels: RiskLevel[];
    tradeTypes: TradeType[];
    markets: MarketType[];
    showFreeOnly: boolean;
    minRating?: number;
}

/**
 * Sort options for marketplace
 */
export type SortOption = 
    | 'popular'          // Most downloads
    | 'rating'           // Highest rated
    | 'newest'           // Recently added
    | 'risk_low'         // Lowest risk first
    | 'risk_high'        // Highest risk first
    | 'win_rate'         // Highest win rate
    | 'alphabetical';    // A-Z

/**
 * Marketplace view state
 */
export interface MarketplaceState {
    bots: BotMetadata[];
    filteredBots: BotMetadata[];
    selectedBot: BotMetadata | null;
    filters: MarketplaceFilters;
    sortBy: SortOption;
    searchQuery: string;
    viewMode: 'grid' | 'list';
    loading: boolean;
    error: string | null;
}

// ============================================================================
// LEGACY SUPPORT
// ============================================================================

/**
 * Legacy bot structure (for backward compatibility)
 */
export interface LegacyBot {
    id: number;
    name: string;
    xml: string;
}

/**
 * Converts legacy bot to enhanced metadata
 */
export type BotMigrationFunction = (legacy: LegacyBot) => BotMetadata;

// ============================================================================
// EXPORTS
// ============================================================================

export default BotMetadata;

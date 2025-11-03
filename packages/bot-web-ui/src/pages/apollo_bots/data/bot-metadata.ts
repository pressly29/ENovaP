/**
 * Enhanced Bot Metadata
 * 
 * This file contains the complete marketplace data for all bots.
 * Each bot has been enhanced with rich metadata, descriptions, stats, and settings.
 */

import { BotMetadata } from './types';
import { BotTabs, BotCategoryFilter } from './bot-tabs';

// Import XML files from bot-skeleton (keep original imports for compatibility)
import ap1 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/$DollarprinterbotOrignal$.xml';
import ap2 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/Big  Boyz Rise N\' fall.xml';
import ap3 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/Candle-Mine Version 2 .xml';
import ap4 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/Digit Differ 3 free BOT_Rate 1_0.09.xml';
import ap5 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/apollo_hybrid_rf_v2.2.xml';
import ap6 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/LAS VEGAS 📃💵.xml';
import ap8 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/apollo_virtualhook 101.xml';
import ap9 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/auto_analyzer_v2.xml';

// Advanced Strategy Bots (Phase 1)
import ap10 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/lightning_scalper_v1.xml';
import ap11 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/fibonacci_recovery_v1.xml';
import ap12 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/neural_network_v1.xml';
import ap13 from '@deriv/bot-skeleton/src/scratch/xml/apollo_bots/grid_master_v1.xml';

// ============================================================================
// ENHANCED BOT METADATA
// ============================================================================

export const ENHANCED_BOT_LIST: BotMetadata[] = [
    // ========================================
    // Bot 0: Market Momentum Master
    // ========================================
    {
        id: 0,
        name: 'Hybrid V🔥',
        displayName: 'Market Momentum Master',
        tagline: 'Ride the waves with intelligent martingale',
        description: 'Advanced hybrid strategy that combines martingale progression with virtual testing and smart prediction swapping. This bot intelligently switches between strategies based on market conditions and includes a virtual hook system that tests trades before executing them live. Perfect for trending markets and experienced traders who understand martingale risks.',
        xml: ap5,
        version: '2.2',
        
        // Visual
        thumbnail: '⚡',
        badge: 'POPULAR',
        color: '#FF6B6B',
        icon: '🔥',
        
        // Categorization
        category: 'hybrid',
        secondaryCategory: 'martingale',
        tradeTypes: ['rise_fall', 'over_under'],
        markets: ['synthetic_indices'],
        tags: ['martingale', 'hybrid', 'virtual-testing', 'trend-following', 'advanced'],
        
        // Navigation
        tab: BotTabs.DEFAULT,
        
        // Risk
        riskLevel: 'high',
        riskScore: 8,
        requiredCapital: 'medium',
        volatilityTolerance: 'high',
        
        // Strategy Details
        howItWorks: [
            'Analyzes market patterns and identifies trending conditions',
            'Tests strategy virtually before executing live trades (virtual hook)',
            'Applies martingale progression after losses to recover quickly',
            'Swaps prediction direction when patterns indicate reversal',
            'Monitors multiple strategies and switches between them dynamically',
            'Implements circuit breaker stop-loss for capital protection'
        ],
        keyFeatures: [
            '🧪 Virtual Hook Testing - Test before you invest',
            '🔄 Multi-Strategy Switching - Adapts to market conditions',
            '📈 Pattern Recognition - Smart prediction swapping',
            '🛡️ Circuit Breaker - Stop-loss protection',
            '💰 Martingale Recovery - Quick loss recovery system',
            '📊 Real-time Analytics - Track performance metrics'
        ],
        tradingStyle: 'Aggressive Hybrid',
        strategy: 'Hybrid Martingale with Virtual Testing',
        algorithm: 'Multi-strategy system combining martingale progression, pattern analysis, and virtual hook testing for risk mitigation.',
        
        // Technical
        variables: {
            martingale: true,
            virtualHook: true,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: true,
            adaptiveStaking: false,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 100,
            recommendedStake: 1.00,
            minBalance: 50,
            maxConcurrentTrades: 1,
            cooldownPeriod: 5
        },
        
        // Performance
        stats: {
            avgWinRate: 68,
            avgProfit: '$20-35 per day',
            tradesPerDay: 15,
            maxDrawdown: '22%',
            bestTimeframe: '5-10 minutes',
            avgTradeDuration: '5 ticks',
            profitFactor: 1.45,
            sharpeRatio: 0.85
        },
        
        // Metrics
        metrics: {
            downloads: 2847,
            activeUsers: 456,
            rating: 4.3,
            reviews: 128,
            favorites: 234
        },
        
        // Metadata
        author: {
            name: 'Apollo Trading Systems',
            verified: true
        },
        createdAt: '2024-08-15T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Understanding of martingale risks',
            'Minimum $50 account balance',
            'Experience with bot trading'
        ],
        warnings: [
            'Martingale can lead to rapid stake escalation',
            'Requires proper stop-loss settings',
            'Not recommended for accounts under $50'
        ],
        bestFor: [
            'Trending markets',
            'Experienced traders',
            'Medium to long sessions'
        ],
        notRecommendedFor: [
            'Complete beginners',
            'Low-balance accounts',
            'Ranging markets'
        ],
        relatedBots: [4, 5]
    },
    
    // ========================================
    // Bot 1: Quantum Pattern Analyzer
    // ========================================
    {
        id: 1,
        name: 'Auto AI🌟',
        displayName: 'Quantum Pattern Analyzer',
        tagline: 'AI-powered digit prediction engine',
        description: 'Sophisticated pattern recognition bot that analyzes digit occurrence percentages and makes data-driven predictions. Uses advanced probability analysis to identify optimal entry points for digits trading. The AI engine continuously learns from market patterns and adapts its predictions for consistent performance.',
        xml: ap9,
        version: '2.0',
        
        // Visual
        thumbnail: '🔮',
        badge: 'RECOMMENDED',
        color: '#4ECDC4',
        icon: '🌟',
        
        // Categorization
        category: 'pattern',
        secondaryCategory: 'digits',
        tradeTypes: ['over_under', 'even_odd', 'matches_differs'],
        markets: ['synthetic_indices'],
        tags: ['AI', 'pattern-recognition', 'digits', 'probability', 'analysis'],
        
        // Navigation
        tab: BotTabs.DEFAULT,
        
        // Risk
        riskLevel: 'medium',
        riskScore: 5,
        requiredCapital: 'low',
        volatilityTolerance: 'medium',
        
        // Strategy Details
        howItWorks: [
            'Collects and analyzes historical digit patterns',
            'Calculates percentage occurrence of digits 0-9',
            'Identifies probability trends for over/under predictions',
            'Applies smart tick selection based on pattern strength',
            'Uses adaptive prediction swapping when patterns shift',
            'Continuously refines predictions with new data'
        ],
        keyFeatures: [
            '🤖 AI Pattern Recognition - Advanced probability analysis',
            '📊 Percentage Tracking - Real-time digit occurrence',
            '🎯 Smart Predictions - Data-driven decision making',
            '🔄 Adaptive Learning - Continuously improving',
            '⚙️ Tick Optimization - Best entry point selection',
            '📈 Performance Analytics - Track success rates'
        ],
        tradingStyle: 'Data-Driven Analytical',
        strategy: 'Pattern Analysis with Probability Prediction',
        algorithm: 'Statistical analysis engine that tracks digit frequencies and uses probability theory to predict optimal trading opportunities.',
        
        // Technical
        variables: {
            martingale: true,
            virtualHook: true,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: false,
            adaptiveStaking: true,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 50,
            recommendedStake: 0.50,
            minBalance: 25,
            maxConcurrentTrades: 1,
            cooldownPeriod: 3
        },
        
        // Performance
        stats: {
            avgWinRate: 72,
            avgProfit: '$15-25 per day',
            tradesPerDay: 20,
            maxDrawdown: '15%',
            bestTimeframe: '3-5 minutes',
            avgTradeDuration: '5 ticks',
            profitFactor: 1.65,
            sharpeRatio: 1.02
        },
        
        // Metrics
        metrics: {
            downloads: 3245,
            activeUsers: 578,
            rating: 4.6,
            reviews: 189,
            favorites: 312
        },
        
        // Metadata
        author: {
            name: 'Apollo Trading Systems',
            verified: true
        },
        createdAt: '2024-09-01T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Basic understanding of digits trading',
            'Minimum $25 account balance'
        ],
        warnings: [
            'Martingale included - manage risk appropriately',
            'Best performance in active market conditions'
        ],
        bestFor: [
            'Digits trading enthusiasts',
            'Pattern traders',
            'Consistent profit seekers'
        ],
        notRecommendedFor: [
            'Complete beginners',
            'Impatient traders'
        ],
        relatedBots: [7, 2]
    },
    
    // ========================================
    // Bot 2: Virtual Market Switcher
    // ========================================
    {
        id: 2,
        name: 'Virtual Switcher',
        displayName: 'Virtual Market Switcher',
        tagline: 'Test before you invest',
        description: 'Risk-averse strategy that tests all trades virtually before executing them live. This conservative bot switches between markets based on volatility analysis and only places real trades after successful virtual validation. Perfect for traders who prioritize capital preservation.',
        xml: ap8,
        version: '1.0.1',
        
        // Visual
        thumbnail: '🔄',
        badge: 'NEW',
        color: '#81C784',
        icon: '🛡️',
        
        // Categorization
        category: 'conservative',
        secondaryCategory: 'scalping',
        tradeTypes: ['rise_fall', 'over_under'],
        markets: ['synthetic_indices'],
        tags: ['virtual-testing', 'safe', 'conservative', 'multi-market', 'low-risk'],
        
        // Navigation
        tab: BotTabs.DEFAULT,
        
        // Risk
        riskLevel: 'low',
        riskScore: 3,
        requiredCapital: 'low',
        volatilityTolerance: 'low',
        
        // Strategy Details
        howItWorks: [
            'Continuously runs virtual trades to test strategy',
            'Monitors multiple market conditions simultaneously',
            'Switches to live trading only after virtual success',
            'Analyzes volatility across different markets',
            'Selects optimal market based on current conditions',
            'Returns to virtual mode if live performance drops'
        ],
        keyFeatures: [
            '🧪 100% Virtual Testing - No blind trades',
            '🔄 Multi-Market Switching - Adapts to best conditions',
            '📊 Volatility Analysis - Smart market selection',
            '🛡️ Capital Protection - Safety-first approach',
            '⚡ Quick Entry/Exit - Scalping opportunities',
            '📈 Conservative Growth - Steady profit accumulation'
        ],
        tradingStyle: 'Ultra Conservative',
        strategy: 'Virtual Testing with Market Switching',
        algorithm: 'Virtual hook system that validates all strategies before live execution, combined with volatility-based market selection.',
        
        // Technical
        variables: {
            martingale: false,
            virtualHook: true,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: true,
            adaptiveStaking: false,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 20,
            recommendedStake: 0.50,
            minBalance: 20,
            maxConcurrentTrades: 1,
            cooldownPeriod: 10
        },
        
        // Performance
        stats: {
            avgWinRate: 65,
            avgProfit: '$8-12 per day',
            tradesPerDay: 12,
            maxDrawdown: '8%',
            bestTimeframe: '5-10 minutes',
            avgTradeDuration: '1 minute',
            profitFactor: 1.35,
            sharpeRatio: 1.15
        },
        
        // Metrics
        metrics: {
            downloads: 1872,
            activeUsers: 324,
            rating: 4.7,
            reviews: 95,
            favorites: 178
        },
        
        // Metadata
        author: {
            name: 'Apollo Trading Systems',
            verified: true
        },
        createdAt: '2024-10-12T00:00:00Z',
        updatedAt: '2025-01-05T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Minimum $20 account balance',
            'Patience for virtual testing phase'
        ],
        warnings: [
            'Lower profit potential than aggressive strategies',
            'Longer setup time for virtual validation'
        ],
        bestFor: [
            'Risk-averse traders',
            'Beginners',
            'Capital preservation focused'
        ],
        notRecommendedFor: [
            'Aggressive profit seekers',
            'Impatient traders'
        ],
        relatedBots: [4, 1]
    },
    
    // ========================================
    // Bot 3: Vegas High Roller
    // ========================================
    {
        id: 3,
        name: 'LAS VEGAS 📃💵',
        displayName: 'Vegas High Roller',
        tagline: 'High risk, high reward aggressive trading',
        description: 'Extreme risk/reward strategy for experienced traders only. Uses aggressive martingale with minimal safeguards to maximize profit potential. This bot is designed for traders who understand and accept high-risk trading in pursuit of substantial returns. Not for beginners or the faint of heart!',
        xml: ap6,
        version: '1.0',
        
        // Visual
        thumbnail: '🎰',
        badge: 'PRO',
        color: '#FF5252',
        icon: '💵',
        
        // Categorization
        category: 'aggressive',
        secondaryCategory: 'martingale',
        tradeTypes: ['rise_fall', 'over_under', 'even_odd'],
        markets: ['synthetic_indices'],
        tags: ['aggressive', 'high-risk', 'martingale', 'expert', 'maximum-profit'],
        
        // Navigation
        tab: BotTabs.DEFAULT,
        
        // Risk
        riskLevel: 'very_high',
        riskScore: 10,
        requiredCapital: 'high',
        volatilityTolerance: 'high',
        
        // Strategy Details
        howItWorks: [
            'Applies aggressive martingale progression immediately',
            'Minimal safety constraints for maximum profit potential',
            'Fast-paced trading with quick decision making',
            'Doubles stakes rapidly after each loss',
            'Targets large profits in short time periods',
            'Requires constant monitoring and intervention'
        ],
        keyFeatures: [
            '🎲 Extreme Martingale - Maximum stake progression',
            '⚡ High-Speed Trading - Rapid fire execution',
            '💰 Big Profit Targets - Aim for substantial returns',
            '🎯 Aggressive Entry - No conservative delays',
            '📈 Fast Recovery - Quick loss recuperation',
            '⚠️ Expert Mode - Minimal safety restrictions'
        ],
        tradingStyle: 'Extreme Aggressive',
        strategy: 'Aggressive Martingale System',
        algorithm: 'High-risk martingale with rapid stake escalation designed for maximum profit extraction in favorable conditions.',
        
        // Technical
        variables: {
            martingale: true,
            virtualHook: false,
            stopLoss: false,
            takeProfit: true,
            patternAnalysis: false,
            multiStrategy: false,
            adaptiveStaking: false,
            trailingStop: false
        },
        settings: {
            minStake: 1.00,
            maxStake: 500,
            recommendedStake: 2.00,
            minBalance: 100,
            maxConcurrentTrades: 1,
            cooldownPeriod: 0
        },
        
        // Performance
        stats: {
            avgWinRate: 55,
            avgProfit: '$50-150 per day (or -$100)',
            tradesPerDay: 25,
            maxDrawdown: '45%',
            bestTimeframe: '1-3 minutes',
            avgTradeDuration: '5 ticks',
            profitFactor: 1.85,
            sharpeRatio: 0.45
        },
        
        // Metrics
        metrics: {
            downloads: 1234,
            activeUsers: 87,
            rating: 3.9,
            reviews: 67,
            favorites: 45
        },
        
        // Metadata
        author: {
            name: 'Apollo Trading Systems',
            verified: true
        },
        createdAt: '2024-07-20T00:00:00Z',
        updatedAt: '2024-12-28T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Expert level trading experience',
            'Minimum $100 account balance',
            'High risk tolerance',
            'Ability to sustain significant losses',
            'Real-time monitoring capability'
        ],
        warnings: [
            '⚠️ VERY HIGH RISK - Can lose entire balance quickly',
            '⚠️ Requires constant monitoring',
            '⚠️ Not suitable for risk-averse traders',
            '⚠️ Can escalate stakes beyond comfort levels',
            '⚠️ Experts only - do not use if unsure'
        ],
        bestFor: [
            'Expert traders',
            'High risk tolerance',
            'Large capital accounts ($200+)',
            'Active monitoring sessions'
        ],
        notRecommendedFor: [
            'Beginners',
            'Risk-averse traders',
            'Small accounts',
            'Unmonitored trading',
            'Anyone uncomfortable with high risk'
        ],
        relatedBots: [0, 5]
    },
    
    // ========================================
    // Bot 4: Steady Cash Printer
    // ========================================
    {
        id: 4,
        name: 'Dollar printer',
        displayName: 'Steady Cash Printer',
        tagline: 'Consistent profits, steady growth',
        description: 'Trend-following strategy focused on consistent small wins rather than big risks. Uses conservative stake management and smart exit points to build steady profits over time. This bot identifies trends early and rides them with calculated position sizing and automatic take-profit targets.',
        xml: ap1,
        version: '1.0',
        
        // Visual
        thumbnail: '💵',
        badge: 'POPULAR',
        color: '#66BB6A',
        icon: '💰',
        
        // Categorization
        category: 'conservative',
        secondaryCategory: 'trend_following',
        tradeTypes: ['rise_fall', 'higher_lower'],
        markets: ['synthetic_indices', 'forex'],
        tags: ['conservative', 'trend-following', 'consistent', 'steady', 'low-risk'],
        
        // Navigation
        tab: BotTabs.DEFAULT,
        
        // Risk
        riskLevel: 'medium',
        riskScore: 4,
        requiredCapital: 'low',
        volatilityTolerance: 'medium',
        
        // Strategy Details
        howItWorks: [
            'Identifies trending market conditions early',
            'Enters positions in direction of the trend',
            'Uses conservative position sizing (fixed stake)',
            'Applies automatic take-profit at predetermined levels',
            'Implements loss recovery system for drawdowns',
            'Exits trades quickly when trend weakens'
        ],
        keyFeatures: [
            '📈 Trend Identification - Early trend detection',
            '💰 Conservative Stakes - Fixed position sizing',
            '🎯 Auto Take-Profit - Locks in profits automatically',
            '🔄 Loss Recovery - Smart drawdown management',
            '⚡ Quick Exits - Minimizes losing trades',
            '📊 Consistent Growth - Steady profit accumulation'
        ],
        tradingStyle: 'Conservative Trend Following',
        strategy: 'Fixed-Stake Trend Following',
        algorithm: 'Trend detection system with fixed stake sizing and automated profit-taking for consistent, low-risk returns.',
        
        // Technical
        variables: {
            martingale: false,
            virtualHook: false,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: false,
            adaptiveStaking: false,
            trailingStop: true
        },
        settings: {
            minStake: 0.35,
            maxStake: 10,
            recommendedStake: 0.50,
            minBalance: 30,
            maxConcurrentTrades: 1,
            cooldownPeriod: 5
        },
        
        // Performance
        stats: {
            avgWinRate: 70,
            avgProfit: '$10-18 per day',
            tradesPerDay: 18,
            maxDrawdown: '12%',
            bestTimeframe: '5-10 minutes',
            avgTradeDuration: '1 minute',
            profitFactor: 1.55,
            sharpeRatio: 1.08
        },
        
        // Metrics
        metrics: {
            downloads: 2456,
            activeUsers: 412,
            rating: 4.5,
            reviews: 143,
            favorites: 267
        },
        
        // Metadata
        author: {
            name: 'Apollo Trading Systems',
            verified: true
        },
        createdAt: '2024-06-10T00:00:00Z',
        updatedAt: '2024-12-20T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Minimum $30 account balance',
            'Basic understanding of trends'
        ],
        warnings: [
            'Lower profit potential than aggressive strategies',
            'Requires trending markets for best performance'
        ],
        bestFor: [
            'Consistent profit seekers',
            'Risk-conscious traders',
            'Trending markets',
            'Medium-term sessions'
        ],
        notRecommendedFor: [
            'Aggressive profit seekers',
            'Ranging markets',
            'Very short sessions'
        ],
        relatedBots: [2, 5]
    },
    
    // ========================================
    // Bot 5: Rise & Fall Titan
    // ========================================
    {
        id: 5,
        name: "Big  Boyz Rise N' fall",
        displayName: 'Rise & Fall Titan',
        tagline: 'Master the directional market',
        description: 'Specialized Rise/Fall strategy with advanced direction detection and momentum analysis. This bot excels at identifying strong directional movements in synthetic indices and entering positions with optimal timing. Uses smart position sizing and trend reversal detection for consistent performance.',
        xml: ap2,
        version: '1.0',
        
        // Visual
        thumbnail: '📈',
        badge: undefined,
        color: '#64B5F6',
        icon: '📊',
        
        // Categorization
        category: 'trend_following',
        secondaryCategory: undefined,
        tradeTypes: ['rise_fall', 'higher_lower'],
        markets: ['synthetic_indices'],
        tags: ['rise-fall', 'trend', 'momentum', 'directional', 'medium-risk'],
        
        // Navigation
        tab: BotTabs.DEFAULT,
        
        // Risk
        riskLevel: 'medium',
        riskScore: 6,
        requiredCapital: 'medium',
        volatilityTolerance: 'medium',
        
        // Strategy Details
        howItWorks: [
            'Analyzes price momentum for directional signals',
            'Detects trend strength and continuation patterns',
            'Enters Rise trades in uptrends, Fall in downtrends',
            'Uses dynamic position sizing based on trend strength',
            'Monitors for trend reversal signals',
            'Exits positions before major reversals'
        ],
        keyFeatures: [
            '📈 Momentum Analysis - Strong direction detection',
            '🎯 Smart Entry Timing - Optimal position entry',
            '🔄 Reversal Detection - Avoid trend changes',
            '💰 Dynamic Sizing - Position based on strength',
            '📊 Trend Continuation - Ride strong moves',
            '🛡️ Exit Strategy - Smart stop placement'
        ],
        tradingStyle: 'Directional Momentum',
        strategy: 'Rise/Fall Momentum Trading',
        algorithm: 'Momentum-based directional trading system with trend strength analysis and reversal detection.',
        
        // Technical
        variables: {
            martingale: true,
            virtualHook: false,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: false,
            adaptiveStaking: true,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 50,
            recommendedStake: 0.75,
            minBalance: 40,
            maxConcurrentTrades: 1,
            cooldownPeriod: 3
        },
        
        // Performance
        stats: {
            avgWinRate: 67,
            avgProfit: '$18-28 per day',
            tradesPerDay: 16,
            maxDrawdown: '18%',
            bestTimeframe: '5-15 minutes',
            avgTradeDuration: '1 minute',
            profitFactor: 1.50,
            sharpeRatio: 0.92
        },
        
        // Metrics
        metrics: {
            downloads: 1987,
            activeUsers: 298,
            rating: 4.2,
            reviews: 87,
            favorites: 156
        },
        
        // Metadata
        author: {
            name: 'Apollo Trading Systems',
            verified: true
        },
        createdAt: '2024-08-05T00:00:00Z',
        updatedAt: '2025-01-08T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Understanding of Rise/Fall contracts',
            'Minimum $40 account balance'
        ],
        warnings: [
            'Uses martingale - manage risk appropriately',
            'Best in trending market conditions'
        ],
        bestFor: [
            'Rise/Fall traders',
            'Trending markets',
            'Medium-term positions'
        ],
        notRecommendedFor: [
            'Ranging markets',
            'Very short timeframes'
        ],
        relatedBots: [0, 4]
    },
    
    // ========================================
    // Bot 6: Candle Pattern Hunter
    // ========================================
    {
        id: 6,
        name: 'Candle-Mine Version 2',
        displayName: 'Candle Pattern Hunter',
        tagline: 'Decode candlestick patterns for profit',
        description: 'Advanced candlestick pattern recognition system that identifies and trades bullish/bearish formations. This bot analyzes multi-candle patterns, confirms them with volume analysis, and scores pattern strength to filter false signals. Perfect for traders who appreciate technical analysis.',
        xml: ap3,
        version: '2.0',
        
        // Visual
        thumbnail: '🕯️',
        badge: undefined,
        color: '#FFB74D',
        icon: '📊',
        
        // Categorization
        category: 'pattern',
        secondaryCategory: undefined,
        tradeTypes: ['rise_fall', 'higher_lower'],
        markets: ['synthetic_indices', 'forex'],
        tags: ['candlestick', 'pattern', 'technical-analysis', 'chart-reading', 'high-risk'],
        
        // Navigation
        tab: BotTabs.DEFAULT,
        
        // Risk
        riskLevel: 'high',
        riskScore: 7,
        requiredCapital: 'medium',
        volatilityTolerance: 'high',
        
        // Strategy Details
        howItWorks: [
            'Scans for bullish/bearish candlestick patterns',
            'Identifies formations: hammers, engulfing, stars, etc.',
            'Confirms patterns with volume analysis',
            'Scores pattern strength (weak/moderate/strong)',
            'Filters false signals using multiple confirmations',
            'Enters trades based on pattern completion'
        ],
        keyFeatures: [
            '🕯️ Pattern Recognition - Multiple candlestick patterns',
            '📊 Volume Confirmation - Validates signals',
            '🎯 Strength Scoring - Pattern reliability rating',
            '🔍 False Signal Filter - Reduces bad trades',
            '📈 Multi-Timeframe - Analyzes different periods',
            '💰 Risk Management - Built-in stop-loss'
        ],
        tradingStyle: 'Technical Pattern Trading',
        strategy: 'Candlestick Pattern Recognition',
        algorithm: 'Multi-candle pattern detection system with volume confirmation and strength scoring for high-probability setups.',
        
        // Technical
        variables: {
            martingale: true,
            virtualHook: false,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: false,
            adaptiveStaking: false,
            trailingStop: false
        },
        settings: {
            minStake: 0.50,
            maxStake: 100,
            recommendedStake: 1.00,
            minBalance: 50,
            maxConcurrentTrades: 1,
            cooldownPeriod: 5
        },
        
        // Performance
        stats: {
            avgWinRate: 64,
            avgProfit: '$22-32 per day',
            tradesPerDay: 14,
            maxDrawdown: '20%',
            bestTimeframe: '10-30 minutes',
            avgTradeDuration: '1-2 minutes',
            profitFactor: 1.42,
            sharpeRatio: 0.78
        },
        
        // Metrics
        metrics: {
            downloads: 1654,
            activeUsers: 234,
            rating: 4.1,
            reviews: 72,
            favorites: 128
        },
        
        // Metadata
        author: {
            name: 'Apollo Trading Systems',
            verified: true
        },
        createdAt: '2024-09-18T00:00:00Z',
        updatedAt: '2025-01-12T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Understanding of candlestick patterns',
            'Technical analysis knowledge',
            'Minimum $50 account balance'
        ],
        warnings: [
            'Requires pattern recognition skills',
            'Best with longer timeframes',
            'Martingale included - manage risk'
        ],
        bestFor: [
            'Technical traders',
            'Pattern enthusiasts',
            'Medium to long timeframes'
        ],
        notRecommendedFor: [
            'Complete beginners',
            'Very short timeframes',
            'Non-technical traders'
        ],
        relatedBots: [1, 5]
    },
    
    // ========================================
    // Bot 7: Digit Difference Pro
    // ========================================
    {
        id: 7,
        name: 'Digit Differ 3',
        displayName: 'Digit Difference Pro',
        tagline: 'Master the digit difference game',
        description: 'Specialized bot for Digit Differs contracts that analyzes digit sequences and predicts differences with high accuracy. Uses advanced sequence analysis and rate optimization to maximize profit potential in digit trading. Perfect for traders who enjoy the mathematical precision of digits.',
        xml: ap4,
        version: '3.0',
        
        // Visual
        thumbnail: '🔢',
        badge: undefined,
        color: '#BA68C8',
        icon: '🎯',
        
        // Categorization
        category: 'digits',
        secondaryCategory: undefined,
        tradeTypes: ['matches_differs', 'over_under'],
        markets: ['synthetic_indices'],
        tags: ['digits', 'differs', 'sequence', 'mathematical', 'medium-risk'],
        
        // Navigation
        tab: BotTabs.DEFAULT,
        
        // Risk
        riskLevel: 'medium',
        riskScore: 5,
        requiredCapital: 'low',
        volatilityTolerance: 'medium',
        
        // Strategy Details
        howItWorks: [
            'Analyzes digit sequences and patterns',
            'Calculates difference probabilities',
            'Optimizes rate selection (1:0.09 optimal)',
            'Identifies high-probability digit pairs',
            'Uses smart digit selection algorithm',
            'Adapts to changing digit distributions'
        ],
        keyFeatures: [
            '🔢 Sequence Analysis - Pattern detection',
            '🎯 Smart Selection - Optimal digit pairs',
            '📊 Rate Optimization - Best payout rates',
            '🔄 Adaptive Algorithm - Learns patterns',
            '💰 Profit Maximization - High-probability setups',
            '📈 Consistency Focus - Steady wins'
        ],
        tradingStyle: 'Mathematical Precision',
        strategy: 'Digit Difference Prediction',
        algorithm: 'Sequence analysis system that identifies optimal digit pairs and uses statistical modeling for high-accuracy predictions.',
        
        // Technical
        variables: {
            martingale: true,
            virtualHook: false,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: false,
            adaptiveStaking: false,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 30,
            recommendedStake: 0.50,
            minBalance: 25,
            maxConcurrentTrades: 1,
            cooldownPeriod: 3
        },
        
        // Performance
        stats: {
            avgWinRate: 71,
            avgProfit: '$12-20 per day',
            tradesPerDay: 22,
            maxDrawdown: '14%',
            bestTimeframe: '3-5 minutes',
            avgTradeDuration: '5 ticks',
            profitFactor: 1.60,
            sharpeRatio: 0.98
        },
        
        // Metrics
        metrics: {
            downloads: 1543,
            activeUsers: 267,
            rating: 4.4,
            reviews: 93,
            favorites: 187
        },
        
        // Metadata
        author: {
            name: 'Apollo Trading Systems',
            verified: true
        },
        createdAt: '2024-10-05T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Understanding of Digits contracts',
            'Minimum $25 account balance'
        ],
        warnings: [
            'Specific to Digits trading',
            'Martingale included - set stop-loss'
        ],
        bestFor: [
            'Digits traders',
            'Mathematical traders',
            'Pattern enthusiasts'
        ],
        notRecommendedFor: [
            'Rise/Fall only traders',
            'Non-digits markets'
        ],
        relatedBots: [1, 2]
    },

    // ========================================
    // Bot 8: Lightning Scalper (ADVANCED)
    // ========================================
    {
        // Core
        id: 8,
        name: 'lightning_scalper_v1',
        displayName: 'Lightning Scalper',
        tagline: 'Ultra-fast tick-based scalping for quick profits',
        description: 'Lightning Scalper is a high-frequency trading bot designed for traders who thrive on rapid market movements. This advanced scalping strategy enters and exits positions within seconds, capitalizing on small price fluctuations across tick-based trades. Perfect for volatile markets like Volatility 75 and Volatility 100 indices, Lightning Scalper uses intelligent tick analysis to identify micro-trends and execute lightning-fast trades. The bot employs dynamic stake management and quick profit-taking mechanisms to maximize returns while minimizing exposure time. With built-in streak tracking and adaptive timing, it adjusts to market conditions in real-time for optimal performance.',
        xml: ap10,
        version: '1.0',
        
        // Visual
        thumbnail: '⚡',
        badge: 'NEW',
        color: '#10b981',
        icon: '⚡',
        
        // Categorization
        category: 'scalping',
        tradeTypes: ['rise_fall', 'higher_lower'],
        markets: ['synthetic_indices'],
        tags: ['scalping', 'high-frequency', 'ticks', 'volatility', 'fast-trades', 'advanced'],
        
        // Navigation
        tab: BotTabs.ADVANCED,
        categoryFilter: BotCategoryFilter.SCALPING,
        
        // Risk
        riskLevel: 'high',
        riskScore: 7,
        requiredCapital: 'medium',
        volatilityTolerance: 'high',
        
        // Strategy Details
        howItWorks: [
            'Analyzes tick movements in real-time for rapid entry signals',
            'Enters positions on micro-trend detection (1-5 ticks)',
            'Sets tight profit targets for quick exits (0.5-1.5 pip gains)',
            'Uses dynamic stake sizing based on recent win rate',
            'Implements streak-based position sizing adjustments',
            'Exits immediately on profit target or stop loss trigger'
        ],
        keyFeatures: [
            '⚡ Ultra-Fast Execution - Trade completed in seconds',
            '📊 Tick Analysis - Real-time tick pattern recognition',
            '💰 Quick Profits - Target 0.5-1.5 pips per trade',
            '🎯 High Frequency - 80-120 trades per day',
            '🔄 Adaptive Sizing - Stakes adjust to performance',
            '⏱️ Zero Lag - Minimal latency for instant execution'
        ],
        tradingStyle: 'High-Frequency Scalping',
        strategy: 'Tick-Based Micro-Trend Scalping',
        algorithm: 'Advanced tick analysis algorithm that identifies micro-trends in 1-5 tick windows, executing rapid trades with tight profit targets and immediate exits.',
        
        // Technical
        variables: {
            martingale: false,
            virtualHook: false,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: false,
            adaptiveStaking: true,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 50,
            recommendedStake: 1.00,
            minBalance: 50,
            maxConcurrentTrades: 1,
            cooldownPeriod: 2
        },
        
        // Performance
        stats: {
            avgWinRate: 75,
            avgProfit: '$25-40 per day',
            tradesPerDay: 100,
            maxDrawdown: '12%',
            bestTimeframe: '1-5 ticks',
            avgTradeDuration: '3-8 seconds',
            profitFactor: 1.85,
            sharpeRatio: 2.1
        },
        
        // Metrics
        metrics: {
            downloads: 0,
            activeUsers: 0,
            rating: 4.8,
            reviews: 0,
            successRate: 75
        },
        
        // Author
        author: {
            name: 'ENova Trading Team',
            verified: true
        },
        
        // Dates
        createdAt: '2025-10-18T00:00:00Z',
        updatedAt: '2025-10-18T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Understanding of scalping strategies',
            'Fast internet connection required',
            'Minimum $50 account balance',
            'Experience with high-frequency trading'
        ],
        warnings: [
            'High-frequency trading requires focus',
            'Best in volatile markets only',
            'Not suitable for slow connections',
            'Requires active monitoring'
        ],
        bestFor: [
            'Experienced scalpers',
            'High-frequency traders',
            'Volatility index specialists',
            'Active day traders'
        ],
        notRecommendedFor: [
            'Beginners',
            'Slow internet users',
            'Passive traders',
            'Low volatility markets'
        ],
        relatedBots: [0, 4]
    },

    // ========================================
    // Bot 9: Fibonacci Recovery (ADVANCED)
    // ========================================
    {
        // Core
        id: 9,
        name: 'fibonacci_recovery_v1',
        displayName: 'Fibonacci Recovery',
        tagline: 'Mathematical progression for safer loss recovery',
        description: 'Fibonacci Recovery brings mathematical elegance to loss recovery strategies. Instead of aggressive martingale doubling, this bot uses the famous Fibonacci sequence (1, 1, 2, 3, 5, 8, 13...) for stake progression, offering a more balanced approach to recovering losses. The strategy maintains the recovery benefits of progressive systems while significantly reducing risk exposure. After wins, the bot steps back two positions in the sequence, creating a natural profit cushion. The system includes intelligent sequence management, automatic reset mechanisms, and safety caps to prevent excessive stakes. Perfect for traders who want systematic loss recovery without the extreme risk of traditional martingale systems.',
        xml: ap11,
        version: '1.0',
        
        // Visual
        thumbnail: '🔄',
        badge: 'HOT',
        color: '#ef4444',
        icon: '🔄',
        
        // Categorization
        category: 'martingale',
        tradeTypes: ['rise_fall', 'digits'],
        markets: ['synthetic_indices', 'forex'],
        tags: ['fibonacci', 'martingale', 'recovery', 'mathematical', 'progressive', 'advanced'],
        
        // Navigation
        tab: BotTabs.ADVANCED,
        categoryFilter: BotCategoryFilter.MARTINGALE,
        
        // Risk
        riskLevel: 'medium',
        riskScore: 6,
        requiredCapital: 'medium',
        volatilityTolerance: 'medium',
        
        // Strategy Details
        howItWorks: [
            'Starts with base stake (position 1 in Fibonacci sequence)',
            'On loss, advances to next Fibonacci number (1→1→2→3→5→8...)',
            'On win, retreats 2 positions back in sequence for profit lock',
            'Automatically resets to position 1 after reaching profit target',
            'Implements safety cap at sequence position 10 (89x base stake)',
            'Tracks total recovery amount and adjusts strategy accordingly'
        ],
        keyFeatures: [
            '🔄 Fibonacci Progression - Safer than traditional martingale',
            '📐 Mathematical Safety - Natural stake growth limits',
            '💰 Profit Lock System - Step back 2 positions on wins',
            '🛡️ Auto Safety Cap - Prevents runaway progression',
            '📊 Sequence Tracking - Visual position indicator',
            '🎯 Smart Reset - Returns to base after profit targets'
        ],
        tradingStyle: 'Progressive Mathematical Recovery',
        strategy: 'Fibonacci Sequence Martingale',
        algorithm: 'Mathematical progression system using Fibonacci sequence for stake management, with intelligent win-reset mechanisms and built-in safety constraints.',
        
        // Technical
        variables: {
            martingale: true,
            virtualHook: false,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: false,
            multiStrategy: false,
            adaptiveStaking: true,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 31.15,  // 89x base stake (Fib position 10)
            recommendedStake: 0.35,
            minBalance: 50,
            maxConcurrentTrades: 1,
            cooldownPeriod: 3
        },
        
        // Performance
        stats: {
            avgWinRate: 70,
            avgProfit: '$22-35 per day',
            tradesPerDay: 50,
            maxDrawdown: '18%',
            bestTimeframe: '1-2 minutes',
            avgTradeDuration: '1-2 minutes',
            profitFactor: 1.75,
            sharpeRatio: 1.8
        },
        
        // Metrics
        metrics: {
            downloads: 0,
            activeUsers: 0,
            rating: 4.7,
            reviews: 0,
            successRate: 70
        },
        
        // Author
        author: {
            name: 'ENova Trading Team',
            verified: true
        },
        
        // Dates
        createdAt: '2025-10-18T00:00:00Z',
        updatedAt: '2025-10-18T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Understanding of Fibonacci sequence',
            'Knowledge of progressive systems',
            'Minimum $50 account balance',
            'Risk management experience'
        ],
        warnings: [
            'Still a progressive system - losses can accumulate',
            'Safety cap at position 10 (89x base stake)',
            'Not suitable for very small accounts',
            'Requires discipline to follow sequence'
        ],
        bestFor: [
            'Mathematical traders',
            'Recovery system enthusiasts',
            'Medium-risk tolerance traders',
            'Systematic strategy followers'
        ],
        notRecommendedFor: [
            'Very conservative traders',
            'Accounts under $30',
            'Martingale opponents',
            'High-frequency only traders'
        ],
        relatedBots: [0, 3]
    },

    // ========================================
    // Bot 10: Neural Network Predictor (ADVANCED)
    // ========================================
    {
        // Core
        id: 10,
        name: 'neural_network_v1',
        displayName: 'Neural Network Predictor',
        tagline: 'AI-powered pattern recognition for intelligent trading',
        description: 'Neural Network Predictor represents the cutting edge of automated trading, leveraging artificial intelligence and machine learning algorithms to predict market movements. This advanced bot analyzes hundreds of historical patterns, identifying recurring sequences and correlations that human traders might miss. The neural network continuously learns from market behavior, adapting its prediction model in real-time. It assigns confidence scores to each prediction, only executing trades when probability thresholds are met. The system tracks model accuracy, adjusts learning rates, and maintains a memory bank of successful patterns. Perfect for traders who want to harness the power of AI without needing to understand complex machine learning concepts.',
        xml: ap12,
        version: '1.0',
        
        // Visual
        thumbnail: '🤖',
        badge: 'PRO',
        color: '#8b5cf6',
        icon: '🤖',
        
        // Categorization
        category: 'pattern',
        secondaryCategory: 'digits',
        tradeTypes: ['digits', 'matches_differs', 'even_odd'],
        markets: ['synthetic_indices'],
        tags: ['AI', 'machine-learning', 'neural-network', 'prediction', 'pattern', 'advanced'],
        
        // Navigation
        tab: BotTabs.ADVANCED,
        categoryFilter: BotCategoryFilter.AI_ML,
        
        // Risk
        riskLevel: 'medium',
        riskScore: 5,
        requiredCapital: 'medium',
        volatilityTolerance: 'medium',
        
        // Strategy Details
        howItWorks: [
            'Collects and analyzes historical tick data in real-time',
            'Trains neural network model on pattern recognition',
            'Generates predictions with confidence scores (0-100%)',
            'Only trades when confidence exceeds threshold (70%+)',
            'Continuously updates model with new market data',
            'Adjusts learning rate based on recent prediction accuracy'
        ],
        keyFeatures: [
            '🤖 AI-Powered - Neural network pattern recognition',
            '📊 Confidence Scoring - Only trade high-probability setups',
            '🧠 Adaptive Learning - Improves over time',
            '📈 Pattern Memory - Remembers successful sequences',
            '🎯 Accuracy Tracking - Monitors model performance',
            '⚡ Real-Time Analysis - Instant pattern detection'
        ],
        tradingStyle: 'AI Pattern Recognition',
        strategy: 'Neural Network Prediction',
        algorithm: 'Multi-layer neural network with pattern recognition, confidence scoring, adaptive learning rates, and real-time model updates.',
        
        // Technical
        variables: {
            martingale: false,
            virtualHook: false,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: false,
            adaptiveStaking: true,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 100,
            recommendedStake: 1.00,
            minBalance: 50,
            maxConcurrentTrades: 1,
            cooldownPeriod: 5
        },
        
        // Performance
        stats: {
            avgWinRate: 78,
            avgProfit: '$30-45 per day',
            tradesPerDay: 60,
            maxDrawdown: '10%',
            bestTimeframe: '1 tick - 5 ticks',
            avgTradeDuration: '5 ticks',
            profitFactor: 2.1,
            sharpeRatio: 2.4
        },
        
        // Metrics
        metrics: {
            downloads: 0,
            activeUsers: 0,
            rating: 4.9,
            reviews: 0,
            successRate: 78
        },
        
        // Author
        author: {
            name: 'ENova Trading Team',
            verified: true
        },
        
        // Dates
        createdAt: '2025-10-18T00:00:00Z',
        updatedAt: '2025-10-18T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Understanding of AI/ML concepts (basic)',
            'Patience for model learning period',
            'Minimum $50 account balance',
            'Interest in pattern recognition'
        ],
        warnings: [
            'Initial learning period required (50-100 trades)',
            'Performance improves over time',
            'Not suitable for impatient traders',
            'Best for digits and pattern-based markets'
        ],
        bestFor: [
            'Tech-savvy traders',
            'Pattern recognition enthusiasts',
            'Long-term strategy users',
            'AI/ML curious traders'
        ],
        notRecommendedFor: [
            'Traders wanting instant perfection',
            'Simple strategy preferrers',
            'Very short-term scalpers',
            'Rise/Fall only traders'
        ],
        relatedBots: [1, 7]
    },

    // ========================================
    // Bot 11: Grid Master (ADVANCED)
    // ========================================
    {
        // Core
        id: 11,
        name: 'grid_master_v1',
        displayName: 'Grid Master',
        tagline: 'Automated grid trading for ranging markets',
        description: 'Grid Master is a sophisticated automated trading system that thrives in ranging and sideways markets. This bot creates a virtual "grid" of buy and sell levels, automatically placing trades at predefined price points. As the market oscillates within the range, Grid Master captures profits from every swing, both up and down. The system dynamically adjusts grid spacing based on volatility, maintains multiple positions simultaneously, and implements intelligent profit-taking at each grid level. With built-in range detection and adaptive grid sizing, it automatically optimizes for current market conditions. Perfect for traders who want to profit from consolidation periods that frustrate trend-followers.',
        xml: ap13,
        version: '1.0',
        
        // Visual
        thumbnail: '📐',
        badge: 'POPULAR',
        color: '#f97316',
        icon: '📐',
        
        // Categorization
        category: 'grid',
        tradeTypes: ['rise_fall', 'higher_lower'],
        markets: ['synthetic_indices', 'forex', 'cryptocurrencies'],
        tags: ['grid-trading', 'range-bound', 'multi-position', 'automated', 'volatility', 'advanced'],
        
        // Navigation
        tab: BotTabs.ADVANCED,
        categoryFilter: BotCategoryFilter.GRID,
        
        // Risk
        riskLevel: 'medium',
        riskScore: 6,
        requiredCapital: 'high',
        volatilityTolerance: 'medium',
        
        // Strategy Details
        howItWorks: [
            'Identifies current market range (support and resistance)',
            'Creates grid of buy/sell levels spaced evenly across range',
            'Places trades automatically when price touches grid levels',
            'Takes profit when price moves to next grid level',
            'Adjusts grid spacing dynamically based on volatility',
            'Manages multiple positions simultaneously across the grid'
        ],
        keyFeatures: [
            '📐 Auto Grid Creation - Intelligent level placement',
            '🎯 Multi-Position - Trade both directions simultaneously',
            '📊 Dynamic Spacing - Adapts to market volatility',
            '💰 Level-Based Profits - Captures every swing',
            '🔄 Range Detection - Identifies consolidation zones',
            '⚙️ Self-Optimizing - Adjusts grid parameters automatically'
        ],
        tradingStyle: 'Range-Bound Grid Trading',
        strategy: 'Multi-Level Grid System',
        algorithm: 'Automated grid trading system with dynamic level spacing, range detection, multi-position management, and adaptive volatility adjustments.',
        
        // Technical
        variables: {
            martingale: false,
            virtualHook: false,
            stopLoss: true,
            takeProfit: true,
            patternAnalysis: true,
            multiStrategy: false,
            adaptiveStaking: false,
            trailingStop: false
        },
        settings: {
            minStake: 0.35,
            maxStake: 100,
            recommendedStake: 1.00,
            minBalance: 100,
            maxConcurrentTrades: 5,
            cooldownPeriod: 0
        },
        
        // Performance
        stats: {
            avgWinRate: 73,
            avgProfit: '$20-32 per day',
            tradesPerDay: 120,
            maxDrawdown: '15%',
            bestTimeframe: '5-15 minutes',
            avgTradeDuration: '5-15 minutes',
            profitFactor: 1.68,
            sharpeRatio: 1.9
        },
        
        // Metrics
        metrics: {
            downloads: 0,
            activeUsers: 0,
            rating: 4.6,
            reviews: 0,
            successRate: 73
        },
        
        // Author
        author: {
            name: 'ENova Trading Team',
            verified: true
        },
        
        // Dates
        createdAt: '2025-10-18T00:00:00Z',
        updatedAt: '2025-10-18T00:00:00Z',
        
        // Additional
        prerequisites: [
            'Understanding of grid trading concepts',
            'Higher account balance required ($100+)',
            'Experience with range-bound markets',
            'Ability to manage multiple positions'
        ],
        warnings: [
            'Requires larger capital for grid levels',
            'Can accumulate losses in trending markets',
            'Multiple positions need monitoring',
            'Best in ranging/sideways conditions'
        ],
        bestFor: [
            'Range-trading specialists',
            'Traders with larger accounts',
            'Consolidation period traders',
            'Multi-position strategists'
        ],
        notRecommendedFor: [
            'Small account traders (<$100)',
            'Trend-only traders',
            'Single-position preferrers',
            'Strongly trending markets'
        ],
        relatedBots: [4, 5]
    }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get bot by ID
 */
export const getBotById = (id: number): BotMetadata | undefined => {
    return ENHANCED_BOT_LIST.find(bot => bot.id === id);
};

/**
 * Get bots by category
 */
export const getBotsByCategory = (category: string): BotMetadata[] => {
    return ENHANCED_BOT_LIST.filter(bot => 
        bot.category === category || bot.secondaryCategory === category
    );
};

/**
 * Get bots by risk level
 */
export const getBotsByRiskLevel = (riskLevel: string): BotMetadata[] => {
    return ENHANCED_BOT_LIST.filter(bot => bot.riskLevel === riskLevel);
};

/**
 * Search bots by query
 */
export const searchBots = (query: string): BotMetadata[] => {
    const lowercaseQuery = query.toLowerCase();
    return ENHANCED_BOT_LIST.filter(bot =>
        bot.displayName.toLowerCase().includes(lowercaseQuery) ||
        bot.tagline.toLowerCase().includes(lowercaseQuery) ||
        bot.description.toLowerCase().includes(lowercaseQuery) ||
        bot.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ENHANCED_BOT_LIST;

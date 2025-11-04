/**
 * Advanced Pattern Analyzer for Deriv Trading Signals
 * Based on proven trading algorithms from Megadbot analysis
 */

export interface PatternResult {
    type: string;
    confidence: number;
    strength: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
    reasoning: string;
    signals: string[];
}

export interface TickAnalysis {
    lastDigits: number[];
    prices: number[];
    volatility: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    momentum: number;
}

export class PatternAnalyzer {
    /**
     * Analyze last digit patterns with advanced streak detection
     */
    static analyzeDigitPatterns(lastDigits: number[], windowSize = 40): PatternResult {
        const recentDigits = lastDigits.slice(-windowSize);
        const signals: string[] = [];

        // Frequency analysis
        const frequency: Record<number, number> = {};
        recentDigits.forEach(digit => {
            frequency[digit] = (frequency[digit] || 0) + 1;
        });

        // Find dominant patterns
        const sortedFreq = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        // Streak detection
        const streaks = this.detectStreaks(recentDigits);
        const maxStreak = Math.max(...Object.values(streaks));

        // Pattern strength calculation
        let confidence = 50;
        let strength: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';

        if (maxStreak >= 5) {
            confidence += 25;
            strength = 'VERY_HIGH';
            signals.push(`🔥 Exceptional ${maxStreak}-digit streak detected`);
        } else if (maxStreak >= 3) {
            confidence += 15;
            strength = 'HIGH';
            signals.push(`⚡ Strong ${maxStreak}-digit pattern found`);
        }

        // Dominant digit analysis
        const dominantDigit = parseInt(sortedFreq[0][0]);
        const dominanceRatio = sortedFreq[0][1] / recentDigits.length;

        if (dominanceRatio > 0.3) {
            confidence += 10;
            signals.push(`📊 Digit ${dominantDigit} appears ${(dominanceRatio * 100).toFixed(1)}% of time`);
        }

        const reasoning = signals.join(' | ');

        return {
            type: 'DIGIT_PATTERN',
            confidence: Math.min(confidence, 95),
            strength,
            reasoning,
            signals,
        };
    }

    /**
     * Detect consecutive digit streaks
     */
    private static detectStreaks(digits: number[]): Record<string, number> {
        const streaks: Record<string, number> = {
            even: 0,
            odd: 0,
            over5: 0,
            under5: 0,
        };

        let currentEvenStreak = 0;
        let currentOddStreak = 0;
        let currentOverStreak = 0;
        let currentUnderStreak = 0;

        digits.forEach(digit => {
            // Even/Odd streaks
            if (digit % 2 === 0) {
                currentEvenStreak++;
                streaks.even = Math.max(streaks.even, currentEvenStreak);
                currentOddStreak = 0;
            } else {
                currentOddStreak++;
                streaks.odd = Math.max(streaks.odd, currentOddStreak);
                currentEvenStreak = 0;
            }

            // Over/Under 5 streaks
            if (digit > 5) {
                currentOverStreak++;
                streaks.over5 = Math.max(streaks.over5, currentOverStreak);
                currentUnderStreak = 0;
            } else if (digit < 5) {
                currentUnderStreak++;
                streaks.under5 = Math.max(streaks.under5, currentUnderStreak);
                currentOverStreak = 0;
            } else {
                currentOverStreak = 0;
                currentUnderStreak = 0;
            }
        });

        return streaks;
    }

    /**
     * Analyze price momentum and trend strength
     */
    static analyzeMomentum(prices: number[], period = 20): PatternResult {
        const recentPrices = prices.slice(-period);
        const signals: string[] = [];

        // Calculate price changes
        const changes: number[] = [];
        for (let i = 1; i < recentPrices.length; i++) {
            changes.push(recentPrices[i] - recentPrices[i - 1]);
        }

        const positiveChanges = changes.filter(c => c > 0).length;
        const negativeChanges = changes.filter(c => c < 0).length;

        // Momentum score
        const momentumScore = (positiveChanges - negativeChanges) / changes.length;

        let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL',
            confidence: number,
            strength: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';

        if (Math.abs(momentumScore) > 0.6) {
            confidence = 75;
            strength = 'VERY_HIGH';
            trend = momentumScore > 0 ? 'BULLISH' : 'BEARISH';
            signals.push(`🔥 Strong ${trend} momentum (${(Math.abs(momentumScore) * 100).toFixed(1)}%)`);
        } else if (Math.abs(momentumScore) > 0.3) {
            confidence = 65;
            strength = 'HIGH';
            trend = momentumScore > 0 ? 'BULLISH' : 'BEARISH';
            signals.push(`⚡ Moderate ${trend} trend detected`);
        } else {
            confidence = 50;
            strength = 'MODERATE';
            trend = 'NEUTRAL';
            signals.push(`📊 Consolidation phase - no clear direction`);
        }

        // Price range analysis
        const high = Math.max(...recentPrices);
        const low = Math.min(...recentPrices);
        const currentPrice = recentPrices[recentPrices.length - 1];
        const pricePosition = ((currentPrice - low) / (high - low)) * 100;

        if (pricePosition > 75) {
            signals.push(`⬆️ Price near highs (${pricePosition.toFixed(1)}% of range)`);
        } else if (pricePosition < 25) {
            signals.push(`⬇️ Price near lows (${pricePosition.toFixed(1)}% of range)`);
        }

        return {
            type: 'MOMENTUM',
            confidence,
            strength,
            reasoning: signals.join(' | '),
            signals,
        };
    }

    /**
     * Calculate volatility using standard deviation
     */
    static calculateVolatility(prices: number[], period = 20): number {
        const recentPrices = prices.slice(-period);

        // Calculate returns
        const returns: number[] = [];
        for (let i = 1; i < recentPrices.length; i++) {
            const returnVal = (recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1];
            returns.push(returnVal);
        }

        // Calculate mean
        const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;

        // Calculate standard deviation
        const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);

        return stdDev * 100; // Convert to percentage
    }

    /**
     * Detect reversal patterns
     */
    static detectReversalPattern(prices: number[], lastDigits: number[]): PatternResult {
        const signals: string[] = [];
        let confidence = 50;
        let strength: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';

        const recentPrices = prices.slice(-10);
        const recentDigits = lastDigits.slice(-10);

        // Price direction changes
        let directionChanges = 0;
        for (let i = 2; i < recentPrices.length; i++) {
            const prev = recentPrices[i - 1] - recentPrices[i - 2];
            const curr = recentPrices[i] - recentPrices[i - 1];

            if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) {
                directionChanges++;
            }
        }

        // High direction changes indicate reversal zone
        if (directionChanges >= 5) {
            confidence += 20;
            strength = 'VERY_HIGH';
            signals.push(`🔄 High reversal activity (${directionChanges} direction changes)`);
        } else if (directionChanges >= 3) {
            confidence += 10;
            strength = 'HIGH';
            signals.push(`↩️ Moderate reversal signals detected`);
        }

        // Digit pattern changes
        const last5Digits = recentDigits.slice(-5);
        const prev5Digits = recentDigits.slice(-10, -5);

        const last5Even = last5Digits.filter(d => d % 2 === 0).length;
        const prev5Even = prev5Digits.filter(d => d % 2 === 0).length;

        if (Math.abs(last5Even - prev5Even) >= 4) {
            confidence += 15;
            signals.push(`🎲 Strong even/odd pattern shift detected`);
        }

        return {
            type: 'REVERSAL',
            confidence: Math.min(confidence, 90),
            strength,
            reasoning: signals.join(' | '),
            signals,
        };
    }

    /**
     * Analyze support and resistance levels
     */
    static findSupportResistance(
        prices: number[],
        pipSize: number
    ): { support: number; resistance: number; strength: number } {
        const priceMap: Record<string, number> = {};

        // Count occurrences of price levels (rounded to pip size)
        prices.forEach(price => {
            const level = price.toFixed(pipSize);
            priceMap[level] = (priceMap[level] || 0) + 1;
        });

        // Find most touched levels
        const sortedLevels = Object.entries(priceMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const currentPrice = prices[prices.length - 1];

        // Find nearest support (below current price)
        const supports = sortedLevels
            .filter(([level]) => parseFloat(level) < currentPrice)
            .map(([level, count]) => ({ level: parseFloat(level), count }));

        // Find nearest resistance (above current price)
        const resistances = sortedLevels
            .filter(([level]) => parseFloat(level) > currentPrice)
            .map(([level, count]) => ({ level: parseFloat(level), count }));

        const support = supports.length > 0 ? supports[0].level : currentPrice * 0.995;
        const resistance = resistances.length > 0 ? resistances[0].level : currentPrice * 1.005;
        const strength = Math.max(
            supports.length > 0 ? supports[0].count : 0,
            resistances.length > 0 ? resistances[0].count : 0
        );

        return { support, resistance, strength };
    }

    /**
     * Comprehensive tick analysis
     */
    static analyzeComprehensive(prices: number[], pipSize: number): TickAnalysis {
        const lastDigits = prices.map(price => {
            const priceStr = price.toFixed(pipSize);
            return parseInt(priceStr[priceStr.length - 1]);
        });

        const volatility = this.calculateVolatility(prices);
        const momentum = this.analyzeMomentum(prices);

        let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        if (momentum.reasoning.includes('BULLISH')) {
            trend = 'BULLISH';
        } else if (momentum.reasoning.includes('BEARISH')) {
            trend = 'BEARISH';
        }

        return {
            lastDigits,
            prices: prices.slice(-100),
            volatility,
            trend,
            momentum: momentum.confidence,
        };
    }
}

import React, { useState, useEffect } from 'react';
import { observer, useStore } from '@deriv/stores';
import { api_base4 } from '@deriv/bot-skeleton';
import './deriv-signal-generator.css';

interface SignalPrediction {
    type: 'OVER' | 'UNDER' | 'EVEN' | 'ODD' | 'RISE' | 'FALL';
    digit?: number;
    confidence: number;
    entryPoint: number; // -1 means wait 1 tick, 0 means enter now
    recommendedTicks: number;
    validityWindow: number; // in seconds (how long signal remains valid)
    expiryTime: Date; // when this signal expires
    reasoning: string; // Explanation of why this signal was generated
    patternStrength: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
    tradeSetup: {
        contract: string; // "Digits" or "Rise/Fall"
        barrier?: number; // For Over/Under
        duration: number; // in ticks
        contractType: string; // "DIGITOVER", "DIGITUNDER", "DIGITEVEN", "DIGITODD", "CALL", "PUT"
    };
}

interface SignalHistory {
    signal: SignalPrediction;
    timestamp: Date;
    tradeType: 'OVER_UNDER' | 'EVEN_ODD' | 'RISE_FALL';
}

interface DerivSignalGeneratorProps {
    prices: number[];
    pipSize: number;
    symbol: string;
}

export const DerivSignalGenerator = observer(({ prices, pipSize, symbol }: DerivSignalGeneratorProps) => {
    const { ui } = useStore();
    const { is_mobile } = ui;
    // is_mobile used for mobile responsive logic (reserved for future use)

    // Signal State
    const [currentSignal, setCurrentSignal] = useState<SignalPrediction | null>(null);
    const [signalTimeRemaining, setSignalTimeRemaining] = useState(0);
    const [selectedTradeType, setSelectedTradeType] = useState<'OVER_UNDER' | 'EVEN_ODD' | 'RISE_FALL'>('OVER_UNDER');
    const [signalHistory, setSignalHistory] = useState<SignalHistory[]>([]);
    const [allSignalPreviews, setAllSignalPreviews] = useState<{
        overUnder: SignalPrediction | null;
        evenOdd: SignalPrediction | null;
        riseFall: SignalPrediction | null;
    }>({
        overUnder: null,
        evenOdd: null,
        riseFall: null
    });
    const [showMultiSignal, setShowMultiSignal] = useState(false);
    const [previousSymbol, setPreviousSymbol] = useState(symbol);

    // Reset state when market changes
    useEffect(() => {
        if (previousSymbol !== symbol) {
            // Clear all signals and history when switching markets
            setCurrentSignal(null);
            setSignalTimeRemaining(0);
            setSignalHistory([]);
            setAllSignalPreviews({
                overUnder: null,
                evenOdd: null,
                riseFall: null
            });
            setPreviousSymbol(symbol);
        }
    }, [symbol, previousSymbol]);

    // Generate new signal when prices are available or when current signal expires
    useEffect(() => {
        if (prices.length >= 100 && !currentSignal) {
            generateNewSignal();
        }
    }, [prices]);

    // Regenerate signal when trade type changes
    useEffect(() => {
        if (prices.length >= 100 && currentSignal) {
            generateNewSignal();
        }
    }, [selectedTradeType]);

    // Track signal expiry countdown
    useEffect(() => {
        if (currentSignal) {
            const updateTimer = setInterval(() => {
                const now = new Date();
                const remaining = Math.max(0, Math.floor((currentSignal.expiryTime.getTime() - now.getTime()) / 1000));
                setSignalTimeRemaining(remaining);
                
                // Generate new signal when current expires
                if (remaining === 0) {
                    generateNewSignal();
                }
            }, 1000);
            
            return () => clearInterval(updateTimer);
        }
    }, [currentSignal, prices]);



    const generateNewSignal = () => {
        const signal = analyzePatternAndGenerateSignal();
        setCurrentSignal(signal);
        
        // Generate all signal types for multi-signal view
        generateAllSignalPreviews();
        
        // Add to history (keep last 10 signals)
        const historyEntry: SignalHistory = {
            signal,
            timestamp: new Date(),
            tradeType: selectedTradeType
        };
        setSignalHistory(prev => [historyEntry, ...prev].slice(0, 10));
    };

    const generateAllSignalPreviews = () => {
        if (prices.length < 100) return;
        
        const recentTicks = prices.slice(-100);
        const lastDigits = recentTicks.map((tick: number) => {
            const tickStr = tick.toFixed(pipSize);
            return parseInt(tickStr[tickStr.length - 1]);
        });
        
        setAllSignalPreviews({
            overUnder: generateOverUnderSignal(lastDigits),
            evenOdd: generateEvenOddSignal(lastDigits),
            riseFall: generateRiseFallSignal(recentTicks)
        });
    };

    const analyzePatternAndGenerateSignal = (): SignalPrediction => {
        const recentTicks = prices.slice(-100);
        const lastDigits = recentTicks.map((tick: number) => {
            const tickStr = tick.toFixed(pipSize);
            return parseInt(tickStr[tickStr.length - 1]);
        });

        switch (selectedTradeType) {
            case 'OVER_UNDER':
                return generateOverUnderSignal(lastDigits);
            case 'EVEN_ODD':
                return generateEvenOddSignal(lastDigits);
            case 'RISE_FALL':
                return generateRiseFallSignal(recentTicks);
            default:
                return generateOverUnderSignal(lastDigits);
        }
    };

    const generateOverUnderSignal = (lastDigits: number[]): SignalPrediction => {
        // Analyze frequency of digits 0-9
        const digitFrequency: Record<number, number> = {};
        lastDigits.forEach(digit => {
            digitFrequency[digit] = (digitFrequency[digit] || 0) + 1;
        });

        // Find most frequent digit
        const mostFrequentDigit = Object.entries(digitFrequency)
            .sort((a, b) => b[1] - a[1])[0][0];
        
        const targetDigit = parseInt(mostFrequentDigit);
        
        // Count Over/Under patterns
        const last40 = lastDigits.slice(-40);
        const overCount = last40.filter(d => d > 5).length;
        const underCount = last40.filter(d => d < 5).length;
        
        // Detect streak
        const last5 = lastDigits.slice(-5);
        const allOver = last5.every(d => d > 5);
        const allUnder = last5.every(d => d < 5);

        let type: 'OVER' | 'UNDER';
        let confidence: number;
        let entryPoint: number;
        let reasoning: string;
        let patternStrength: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
        let validityWindow: number; // in seconds

        if (allOver) {
            // Strong Over streak detected - reverse to Under
            type = 'UNDER';
            confidence = 78;
            entryPoint = -1; // Wait 1 tick
            reasoning = `Strong OVER streak detected (${last5.length} consecutive). Pattern reversal imminent. Last 5 digits: ${last5.join(', ')}`;
            patternStrength = 'VERY_HIGH';
            validityWindow = 300; // 5 minutes for very high strength
        } else if (allUnder) {
            // Strong Under streak detected - reverse to Over
            type = 'OVER';
            confidence = 78;
            entryPoint = -1;
            reasoning = `Strong UNDER streak detected (${last5.length} consecutive). Pattern reversal imminent. Last 5 digits: ${last5.join(', ')}`;
            patternStrength = 'VERY_HIGH';
            validityWindow = 300; // 5 minutes
        } else if (overCount > underCount * 1.5) {
            // Over dominance - predict Under
            type = 'UNDER';
            confidence = 68;
            entryPoint = 0; // Enter immediately
            reasoning = `OVER dominance in last 40 ticks (${overCount} vs ${underCount}). Counter-trend prediction. Ratio: ${(overCount/underCount).toFixed(2)}x`;
            patternStrength = 'HIGH';
            validityWindow = 240; // 4 minutes for high strength
        } else if (underCount > overCount * 1.5) {
            // Under dominance - predict Over
            type = 'OVER';
            confidence = 68;
            entryPoint = 0;
            reasoning = `UNDER dominance in last 40 ticks (${underCount} vs ${overCount}). Counter-trend prediction. Ratio: ${(underCount/overCount).toFixed(2)}x`;
            patternStrength = 'HIGH';
            validityWindow = 240; // 4 minutes
        } else {
            // No clear pattern - use digit frequency
            type = targetDigit > 5 ? 'OVER' : 'UNDER';
            confidence = 55;
            entryPoint = 0;
            reasoning = `Balanced pattern. Most frequent digit: ${targetDigit}. OVER: ${overCount}, UNDER: ${underCount}`;
            patternStrength = 'MODERATE';
            validityWindow = 180; // 3 minutes for moderate strength
        }

        const recommendedTicks = confidence > 70 ? 5 : 3;
        const expiryTime = new Date(Date.now() + validityWindow * 1000);

        return {
            type,
            digit: targetDigit,
            confidence,
            entryPoint,
            recommendedTicks,
            validityWindow,
            expiryTime,
            reasoning,
            patternStrength,
            tradeSetup: {
                contract: 'Digits',
                barrier: 5,
                duration: recommendedTicks,
                contractType: type === 'OVER' ? 'DIGITOVER' : 'DIGITUNDER'
            }
        };
    };

    const generateEvenOddSignal = (lastDigits: number[]): SignalPrediction => {
        const last40 = lastDigits.slice(-40);
        const evenCount = last40.filter(d => d % 2 === 0).length;
        const oddCount = last40.length - evenCount;

        const last5 = lastDigits.slice(-5);
        const allEven = last5.every(d => d % 2 === 0);
        const allOdd = last5.every(d => d % 2 !== 0);

        let type: 'EVEN' | 'ODD';
        let confidence: number;
        let entryPoint: number;
        let reasoning: string;
        let patternStrength: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
        let validityWindow: number;

        if (allEven) {
            // Strong Even streak - reverse to Odd
            type = 'ODD';
            confidence = 75;
            entryPoint = -1;
            reasoning = `Strong EVEN streak (${last5.length} consecutive). Reversal to ODD predicted. Last digits: ${last5.join(', ')}`;
            patternStrength = 'VERY_HIGH';
            validityWindow = 300;
        } else if (allOdd) {
            // Strong Odd streak - reverse to Even
            type = 'EVEN';
            confidence = 75;
            entryPoint = -1;
            reasoning = `Strong ODD streak (${last5.length} consecutive). Reversal to EVEN predicted. Last digits: ${last5.join(', ')}`;
            patternStrength = 'VERY_HIGH';
            validityWindow = 300;
        } else if (evenCount > oddCount * 1.4) {
            // Even dominance - predict Odd
            type = 'ODD';
            confidence = 65;
            entryPoint = 0;
            reasoning = `EVEN dominance detected (${evenCount} vs ${oddCount}). Counter-prediction: ODD. Ratio: ${(evenCount/oddCount).toFixed(2)}x`;
            patternStrength = 'HIGH';
            validityWindow = 240;
        } else if (oddCount > evenCount * 1.4) {
            // Odd dominance - predict Even
            type = 'EVEN';
            confidence = 65;
            entryPoint = 0;
            reasoning = `ODD dominance detected (${oddCount} vs ${evenCount}). Counter-prediction: EVEN. Ratio: ${(oddCount/evenCount).toFixed(2)}x`;
            patternStrength = 'HIGH';
            validityWindow = 240;
        } else {
            // Balanced - use last pattern
            const lastDigit = lastDigits[lastDigits.length - 1];
            type = lastDigit % 2 === 0 ? 'ODD' : 'EVEN';
            confidence = 52;
            entryPoint = 0;
            reasoning = `Balanced pattern. EVEN: ${evenCount}, ODD: ${oddCount}. Last digit: ${lastDigit}. Alternating prediction.`;
            patternStrength = 'MODERATE';
            validityWindow = 180;
        }

        const recommendedTicks = confidence > 70 ? 5 : 3;
        const expiryTime = new Date(Date.now() + validityWindow * 1000);

        return {
            type,
            confidence,
            entryPoint,
            recommendedTicks,
            validityWindow,
            expiryTime,
            reasoning,
            patternStrength,
            tradeSetup: {
                contract: 'Digits',
                duration: recommendedTicks,
                contractType: type === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD'
            }
        };
    };

    const generateRiseFallSignal = (recentTicks: number[]): SignalPrediction => {
        const last20 = recentTicks.slice(-20);
        
        // Count rise/fall patterns
        let riseCount = 0;
        let fallCount = 0;
        
        for (let i = 1; i < last20.length; i++) {
            if (last20[i] > last20[i - 1]) riseCount++;
            else if (last20[i] < last20[i - 1]) fallCount++;
        }

        // Check for consecutive pattern
        const last5 = last20.slice(-5);
        let consecutiveRise = 0;
        let consecutiveFall = 0;
        
        for (let i = 1; i < last5.length; i++) {
            if (last5[i] > last5[i - 1]) {
                consecutiveRise++;
                consecutiveFall = 0;
            } else if (last5[i] < last5[i - 1]) {
                consecutiveFall++;
                consecutiveRise = 0;
            }
        }

        let type: 'RISE' | 'FALL';
        let confidence: number;
        let entryPoint: number;
        let reasoning: string;
        let patternStrength: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';

        const lastPrice = last20[last20.length - 1].toFixed(pipSize);
        const priceChange = ((last20[last20.length - 1] - last20[0]) / last20[0] * 100).toFixed(2);

        if (consecutiveRise >= 3) {
            // Strong Rise streak - reverse to Fall
            type = 'FALL';
            confidence = 72;
            entryPoint = -1;
            reasoning = `Strong RISE momentum (${consecutiveRise} consecutive). Price: ${lastPrice}. Change: +${priceChange}%. Reversal expected.`;
            patternStrength = 'HIGH';
        } else if (consecutiveFall >= 3) {
            // Strong Fall streak - reverse to Rise
            type = 'RISE';
            confidence = 72;
            entryPoint = -1;
            reasoning = `Strong FALL momentum (${consecutiveFall} consecutive). Price: ${lastPrice}. Change: ${priceChange}%. Reversal expected.`;
            patternStrength = 'HIGH';
        } else if (riseCount > fallCount * 1.5) {
            // Rise dominance - predict Fall
            type = 'FALL';
            confidence = 62;
            entryPoint = 0;
            reasoning = `RISE dominance in last 20 ticks (${riseCount} vs ${fallCount}). Price: ${lastPrice}. Counter-trend: FALL`;
            patternStrength = 'MODERATE';
        } else if (fallCount > riseCount * 1.5) {
            // Fall dominance - predict Rise
            type = 'RISE';
            confidence = 62;
            entryPoint = 0;
            reasoning = `FALL dominance in last 20 ticks (${fallCount} vs ${riseCount}). Price: ${lastPrice}. Counter-trend: RISE`;
            patternStrength = 'MODERATE';
        } else {
            // No clear pattern - use last movement
            const lastMovement = last20[last20.length - 1] > last20[last20.length - 2] ? 'up' : 'down';
            type = lastMovement === 'up' ? 'FALL' : 'RISE';
            confidence = 54;
            entryPoint = 0;
            reasoning = `Balanced. RISE: ${riseCount}, FALL: ${fallCount}. Last: ${lastMovement}. Alternating prediction.`;
            patternStrength = 'MODERATE';
        }

        const recommendedTicks = confidence > 70 ? 5 : 3;
        const validityWindow = patternStrength === 'HIGH' ? 240 : 180;
        const expiryTime = new Date(Date.now() + validityWindow * 1000);

        return {
            type,
            confidence,
            entryPoint,
            recommendedTicks,
            validityWindow,
            expiryTime,
            reasoning,
            patternStrength,
            tradeSetup: {
                contract: 'Rise/Fall',
                duration: recommendedTicks,
                contractType: type === 'RISE' ? 'CALL' : 'PUT'
            }
        };
    };

    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="deriv-signal-generator">
            {/* Header */}
            <div className="dsg-header">
                <h2>🎯 Deriv Signal Trader</h2>
                <div className="dsg-header-controls">
                    <div className="dsg-market-info">
                        <span className="dsg-market-label">Market:</span>
                        <span className="dsg-market-value">{symbol}</span>
                    </div>
                    <button
                        className={`dsg-multi-signal-toggle ${showMultiSignal ? 'active' : ''}`}
                        onClick={() => setShowMultiSignal(!showMultiSignal)}
                        title="View all signal types at once"
                    >
                        {showMultiSignal ? '📊 Single View' : '🔄 Compare All'}
                    </button>
                </div>
            </div>

            {/* Trade Type Tabs */}
            <div className="dsg-trade-tabs">
                <button
                    className={`dsg-tab ${selectedTradeType === 'OVER_UNDER' ? 'active' : ''}`}
                    onClick={() => setSelectedTradeType('OVER_UNDER')}
                >
                    Over/Under {currentSignal?.digit !== undefined && `(${currentSignal.digit})`}
                </button>
                <button
                    className={`dsg-tab ${selectedTradeType === 'EVEN_ODD' ? 'active' : ''}`}
                    onClick={() => setSelectedTradeType('EVEN_ODD')}
                >
                    Even/Odd
                </button>
                <button
                    className={`dsg-tab ${selectedTradeType === 'RISE_FALL' ? 'active' : ''}`}
                    onClick={() => setSelectedTradeType('RISE_FALL')}
                >
                    Rise & Fall
                </button>
            </div>

            {/* Signal Validity Timer */}
            {currentSignal && (
                <div className="dsg-validity-card">
                    <div className="dsg-validity-header">
                        <span className="dsg-validity-icon">⏱️</span>
                        <span className="dsg-validity-label">Signal Valid For</span>
                    </div>
                    <div className="dsg-validity-time">
                        {formatCountdown(signalTimeRemaining)}
                    </div>
                    <div className="dsg-validity-bar">
                        <div 
                            className="dsg-validity-fill"
                            style={{ 
                                width: `${(signalTimeRemaining / currentSignal.validityWindow) * 100}%`,
                                background: signalTimeRemaining < 30 ? '#ff4444' : 
                                           signalTimeRemaining < 60 ? '#ffaa00' : 
                                           'linear-gradient(90deg, #00d4ff, #00ff88)'
                            }}
                        />
                    </div>
                    <div className="dsg-validity-subtext">
                        Expires at {currentSignal.expiryTime.toLocaleTimeString()}
                    </div>
                </div>
            )}

            {/* Current Signal */}
            {currentSignal && (
                <div className="dsg-signal-card">
                    <div className="dsg-signal-grid">
                        <div className="dsg-signal-item">
                            <div className="dsg-label">Market</div>
                            <div className="dsg-value">{symbol}</div>
                        </div>
                        <div className="dsg-signal-item">
                            <div className="dsg-label">Entry Point</div>
                            <div className="dsg-value entry-point">{currentSignal.entryPoint}</div>
                        </div>
                        <div className="dsg-signal-item">
                            <div className="dsg-label">Recommended Ticks</div>
                            <div className="dsg-value">{currentSignal.recommendedTicks}</div>
                        </div>
                        <div className="dsg-signal-item">
                            <div className="dsg-label">Prediction</div>
                            <div className={`dsg-value prediction ${currentSignal.type.toLowerCase()}`}>
                                {currentSignal.type}
                                {currentSignal.digit !== undefined && ` (${currentSignal.digit})`}
                            </div>
                        </div>
                        <div className="dsg-signal-item">
                            <div className="dsg-label">Validity Window</div>
                            <div className="dsg-value">{Math.floor(currentSignal.validityWindow / 60)} min</div>
                        </div>
                        <div className="dsg-signal-item confidence">
                            <div className="dsg-label">Confidence</div>
                            <div className="dsg-confidence-bar">
                                <div 
                                    className="dsg-confidence-fill"
                                    style={{ width: `${currentSignal.confidence}%` }}
                                />
                                <div className="dsg-confidence-text">{currentSignal.confidence}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Pattern Strength Indicator */}
                    <div className="dsg-pattern-strength">
                        <div className="dsg-strength-label">Pattern Strength:</div>
                        <div className={`dsg-strength-badge ${currentSignal.patternStrength.toLowerCase()}`}>
                            {currentSignal.patternStrength === 'VERY_HIGH' && '🔥 VERY HIGH'}
                            {currentSignal.patternStrength === 'HIGH' && '⚡ HIGH'}
                            {currentSignal.patternStrength === 'MODERATE' && '📊 MODERATE'}
                            {currentSignal.patternStrength === 'LOW' && '📉 LOW'}
                        </div>
                    </div>

                    {/* Signal Reasoning */}
                    <div className="dsg-reasoning">
                        <div className="dsg-reasoning-label">📋 Analysis:</div>
                        <div className="dsg-reasoning-text">{currentSignal.reasoning}</div>
                    </div>
                </div>
            )}

            {/* Multi-Signal Comparison View */}
            {showMultiSignal && allSignalPreviews.overUnder && (
                <div className="dsg-multi-signal-view">
                    <h3>📊 All Signals Comparison</h3>
                    <div className="dsg-multi-grid">
                        {/* Over/Under */}
                        <div className="dsg-mini-signal-card">
                            <div className="dsg-mini-header">
                                <span className="dsg-mini-title">Over/Under</span>
                                <span className={`dsg-mini-type ${allSignalPreviews.overUnder.type.toLowerCase()}`}>
                                    {allSignalPreviews.overUnder.type}
                                </span>
                            </div>
                            <div className="dsg-mini-stats">
                                <div className="dsg-mini-stat">
                                    <span>Confidence:</span>
                                    <strong>{allSignalPreviews.overUnder.confidence}%</strong>
                                </div>
                                <div className="dsg-mini-stat">
                                    <span>Entry:</span>
                                    <strong>{allSignalPreviews.overUnder.entryPoint}</strong>
                                </div>
                                <div className="dsg-mini-stat">
                                    <span>Ticks:</span>
                                    <strong>{allSignalPreviews.overUnder.recommendedTicks}</strong>
                                </div>
                            </div>
                            <div className={`dsg-mini-strength ${allSignalPreviews.overUnder.patternStrength.toLowerCase()}`}>
                                {allSignalPreviews.overUnder.patternStrength.replace('_', ' ')}
                            </div>
                        </div>

                        {/* Even/Odd */}
                        <div className="dsg-mini-signal-card">
                            <div className="dsg-mini-header">
                                <span className="dsg-mini-title">Even/Odd</span>
                                <span className={`dsg-mini-type ${allSignalPreviews.evenOdd!.type.toLowerCase()}`}>
                                    {allSignalPreviews.evenOdd!.type}
                                </span>
                            </div>
                            <div className="dsg-mini-stats">
                                <div className="dsg-mini-stat">
                                    <span>Confidence:</span>
                                    <strong>{allSignalPreviews.evenOdd!.confidence}%</strong>
                                </div>
                                <div className="dsg-mini-stat">
                                    <span>Entry:</span>
                                    <strong>{allSignalPreviews.evenOdd!.entryPoint}</strong>
                                </div>
                                <div className="dsg-mini-stat">
                                    <span>Ticks:</span>
                                    <strong>{allSignalPreviews.evenOdd!.recommendedTicks}</strong>
                                </div>
                            </div>
                            <div className={`dsg-mini-strength ${allSignalPreviews.evenOdd!.patternStrength.toLowerCase()}`}>
                                {allSignalPreviews.evenOdd!.patternStrength.replace('_', ' ')}
                            </div>
                        </div>

                        {/* Rise/Fall */}
                        <div className="dsg-mini-signal-card">
                            <div className="dsg-mini-header">
                                <span className="dsg-mini-title">Rise/Fall</span>
                                <span className={`dsg-mini-type ${allSignalPreviews.riseFall!.type.toLowerCase()}`}>
                                    {allSignalPreviews.riseFall!.type}
                                </span>
                            </div>
                            <div className="dsg-mini-stats">
                                <div className="dsg-mini-stat">
                                    <span>Confidence:</span>
                                    <strong>{allSignalPreviews.riseFall!.confidence}%</strong>
                                </div>
                                <div className="dsg-mini-stat">
                                    <span>Entry:</span>
                                    <strong>{allSignalPreviews.riseFall!.entryPoint}</strong>
                                </div>
                                <div className="dsg-mini-stat">
                                    <span>Ticks:</span>
                                    <strong>{allSignalPreviews.riseFall!.recommendedTicks}</strong>
                                </div>
                            </div>
                            <div className={`dsg-mini-strength ${allSignalPreviews.riseFall!.patternStrength.toLowerCase()}`}>
                                {allSignalPreviews.riseFall!.patternStrength.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Trade Execution Guide */}
            {currentSignal && (
                <div className="dsg-execution-section">
                    <div className="dsg-execution-header">
                        <h3>📊 Trade Execution Setup</h3>
                        <div className="dsg-execution-badge">
                            {currentSignal.patternStrength === 'VERY_HIGH' && '🔥 High Probability'}
                            {currentSignal.patternStrength === 'HIGH' && '⚡ Strong Signal'}
                            {currentSignal.patternStrength === 'MODERATE' && '📊 Moderate Signal'}
                            {currentSignal.patternStrength === 'LOW' && '📉 Low Confidence'}
                        </div>
                    </div>
                    
                    <div className="dsg-execution-guide">
                        <div className="dsg-guide-section">
                            <div className="dsg-guide-label">📍 Step 1: Open Deriv.com</div>
                            <div className="dsg-guide-info">
                                Navigate to <strong>Deriv.com</strong> → Select <strong>Trade Type</strong>
                            </div>
                        </div>

                        <div className="dsg-guide-section">
                            <div className="dsg-guide-label">📋 Step 2: Contract Setup</div>
                            <div className="dsg-execution-params">
                                <div className="dsg-param-item">
                                    <span className="dsg-param-label">Contract Type:</span>
                                    <span className="dsg-param-value highlight">{currentSignal.tradeSetup.contract}</span>
                                </div>
                                <div className="dsg-param-item">
                                    <span className="dsg-param-label">Market:</span>
                                    <span className="dsg-param-value">{symbol}</span>
                                </div>
                                {currentSignal.tradeSetup.barrier && (
                                    <div className="dsg-param-item">
                                        <span className="dsg-param-label">Barrier:</span>
                                        <span className="dsg-param-value">{currentSignal.tradeSetup.barrier}</span>
                                    </div>
                                )}
                                <div className="dsg-param-item">
                                    <span className="dsg-param-label">Prediction:</span>
                                    <span className={`dsg-param-value prediction ${currentSignal.type.toLowerCase()}`}>
                                        {currentSignal.type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="dsg-guide-section">
                            <div className="dsg-guide-label">⏱️ Step 3: Duration & Entry</div>
                            <div className="dsg-execution-params">
                                <div className="dsg-param-item">
                                    <span className="dsg-param-label">Duration:</span>
                                    <span className="dsg-param-value highlight">{currentSignal.recommendedTicks} Ticks</span>
                                </div>
                                <div className="dsg-param-item">
                                    <span className="dsg-param-label">Entry Timing:</span>
                                    <span className="dsg-param-value">
                                        {currentSignal.entryPoint === 0 ? 'Enter Immediately' : 'Wait 1 Tick'}
                                    </span>
                                </div>
                                <div className="dsg-param-item">
                                    <span className="dsg-param-label">Valid Until:</span>
                                    <span className="dsg-param-value timer">
                                        {currentSignal.expiryTime.toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="dsg-guide-section">
                            <div className="dsg-guide-label">💰 Step 4: Risk Management</div>
                            <div className="dsg-execution-params">
                                <div className="dsg-param-item">
                                    <span className="dsg-param-label">Suggested Stake:</span>
                                    <span className="dsg-param-value">
                                        {currentSignal.confidence > 70 ? '$10-15' : '$5-10'}
                                    </span>
                                </div>
                                <div className="dsg-param-item full-width">
                                    <span className="dsg-param-label">⚠️ Risk Note:</span>
                                    <span className="dsg-param-value warning">
                                        Only risk 1-2% of account balance per trade
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dsg-execution-action">
                        <button 
                            className="dsg-copy-params-btn"
                            onClick={() => {
                                const params = `Contract: ${currentSignal.tradeSetup.contract}\nMarket: ${symbol}\nPrediction: ${currentSignal.type}\nDuration: ${currentSignal.recommendedTicks} Ticks\nEntry: ${currentSignal.entryPoint === 0 ? 'Immediate' : 'Wait 1 Tick'}`;
                                navigator.clipboard.writeText(params);
                            }}
                        >
                            📋 Copy Trade Parameters
                        </button>
                        <div className="dsg-quick-note">
                            Quick copy trade setup to paste in your trading notes
                        </div>
                    </div>
                </div>
            )}

            {/* Signal History */}
            {signalHistory.length > 0 && (
                <div className="dsg-history-section">
                    <h3>📜 Recent Signals ({signalHistory.length}/10)</h3>
                    <div className="dsg-history-list">
                        {signalHistory.slice(0, 5).map((entry, idx) => (
                            <div key={idx} className="dsg-history-item">
                                <div className="dsg-history-time">
                                    {entry.timestamp.toLocaleTimeString()}
                                </div>
                                <div className="dsg-history-type">
                                    {entry.tradeType.replace('_', '/')}
                                </div>
                                <div className={`dsg-history-prediction ${entry.signal.type.toLowerCase()}`}>
                                    {entry.signal.type}
                                </div>
                                <div className="dsg-history-confidence">
                                    {entry.signal.confidence}%
                                </div>
                                <div className={`dsg-history-strength ${entry.signal.patternStrength.toLowerCase()}`}>
                                    {entry.signal.patternStrength === 'VERY_HIGH' && '🔥'}
                                    {entry.signal.patternStrength === 'HIGH' && '⚡'}
                                    {entry.signal.patternStrength === 'MODERATE' && '📊'}
                                    {entry.signal.patternStrength === 'LOW' && '📉'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Collecting Data Notice */}
            {prices.length < 100 && (
                <div className="dsg-loading-notice">
                    <div className="dsg-loading-spinner" />
                    <p>Collecting market data... {prices.length} / 100 ticks</p>
                </div>
            )}
        </div>
    );
});

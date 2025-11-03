import React, { useState, useEffect } from 'react';
import { observer, useStore } from '@deriv/stores';
import { api_base4 } from '@deriv/bot-skeleton';
import './CirclesAnalyzer.css';

interface SymbolData {
    allow_forward_starting: number;
    display_name: string;
    display_order: number;
    exchange_is_open: number;
    is_trading_suspended: number;
    market: string;
    market_display_name: string;
    pip: number;
    subgroup: string;
    subgroup_display_name: string;
    submarket: string;
    submarket_display_name: string;
    symbol: string;
    symbol_type: string;
}

interface ActiveSymbolTypes {
    active_symbols: SymbolData[];
}

interface DigitFrequency {
    digit: number;
    count: number;
    percentage: number;
}

const CirclesAnalyzer = observer(() => {
    const { ui } = useStore();
    const { is_mobile } = ui;

    // State Management
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [currentTick, setCurrentTick] = useState<number | string>('Loading...');
    const [allLastDigitList, setAllLastDigitList] = useState<number[]>([]);
    const [lastDigit, setLastDigit] = useState(0);
    const [numberOfTicks, setNumberOfTicks] = useState<string | number>(1000);
    const [optionsList, setOptions] = useState<SymbolData[]>([]);
    const [active_symbol, setActiveSymbol] = useState('R_100');
    const [prev_symbol, setPrevSymbol] = useState('R_100');
    const [pip_size, setPipSize] = useState(2);
    const [currentPrice, setCurrentPrice] = useState<string>('--');
    
    // Digit Frequency state
    const [digitFrequencies, setDigitFrequencies] = useState<DigitFrequency[]>([]);
    const [highestFreqDigit, setHighestFreqDigit] = useState<number | null>(null);
    const [lowestFreqDigit, setLowestFreqDigit] = useState<number | null>(null);
    
    // Even/Odd state
    const [evenCount, setEvenCount] = useState(0);
    const [oddCount, setOddCount] = useState(0);
    const [evenOddPattern, setEvenOddPattern] = useState<('E' | 'O')[]>([]);
    const [evenStreak, setEvenStreak] = useState(0);
    const [oddStreak, setOddStreak] = useState(0);
    const [currentStreakType, setCurrentStreakType] = useState<'even' | 'odd'>('even');
    
    // Rise/Fall state
    const [riseCount, setRiseCount] = useState(0);
    const [fallCount, setFallCount] = useState(0);
    const [riseFallPattern, setRiseFallPattern] = useState<('R' | 'F')[]>([]);
    const [riseStreak, setRiseStreak] = useState(0);
    const [fallStreak, setFallStreak] = useState(0);
    const [currentRFStreakType, setCurrentRFStreakType] = useState<'rise' | 'fall'>('rise');
    
    // Over/Under state
    const [overCount, setOverCount] = useState(0);
    const [underCount, setUnderCount] = useState(0);
    const [overUnderPattern, setOverUnderPattern] = useState<('Ov' | 'U')[]>([]);
    const [overStreak, setOverStreak] = useState(0);
    const [underStreak, setUnderStreak] = useState(0);
    const [currentOUStreakType, setCurrentOUStreakType] = useState<'over' | 'under'>('over');
    const [overUnderThreshold, setOverUnderThreshold] = useState(5); // User-selected threshold
    
    // Matches/Differs state
    const [matchesCount, setMatchesCount] = useState(0);
    const [differsCount, setDiffersCount] = useState(0);
    const [matchesDiffersPattern, setMatchesDiffersPattern] = useState<('M' | 'D')[]>([]);
    const [matchesStreak, setMatchesStreak] = useState(0);
    const [differsStreak, setDiffersStreak] = useState(0);
    const [currentMDStreakType, setCurrentMDStreakType] = useState<'matches' | 'differs'>('matches');
    const [targetDigit, setTargetDigit] = useState(5); // User-selected target digit
    const [selectedTargetDigit, setSelectedTargetDigit] = useState<number | null>(null); // Manual selection

    // Utility Functions
    const sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    const getLastDigits = (tick: number, pip_size: number) => {
        let lastDigit = tick.toFixed(pip_size);
        lastDigit = String(lastDigit).slice(-1);
        return Number(lastDigit);
    };

    // Initialize API
    useEffect(() => {
        startApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle symbol change
    useEffect(() => {
        if (prev_symbol !== active_symbol) {
            api_base4.api.send({
                ticks_history: active_symbol,
                adjust_start_time: 1,
                count: 5000,
                end: 'latest',
                start: 1,
                style: 'ticks',
            });
        }
        setPrevSymbol(active_symbol);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_symbol]);

    const startApi = async () => {
        await sleep(5000);
        if (!isSubscribed) {
            api_base4.api.send({
                active_symbols: 'brief',
                product_type: 'basic',
            });
            setIsSubscribed(true);
        }

        if (api_base4.api) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const subscription = api_base4.api.onMessage().subscribe(({ data }: { data: any }) => {
                if (data.msg_type === 'tick') {
                    const { tick } = data;
                    const { ask, pip_size } = tick;
                    const last_digit = getLastDigits(ask, pip_size);

                    setLastDigit(last_digit);
                    setCurrentTick(ask);
                    setCurrentPrice(ask.toFixed(pip_size));
                    removeFirstElement();
                    setAllLastDigitList(prevList => [...prevList, ask]);
                }

                if (data.msg_type === 'history') {
                    const { history, pip_size } = data;
                    setPipSize(pip_size);
                    const { prices } = history;
                    const { ticks_history } = data.echo_req;
                    setAllLastDigitList(prices);
                    setActiveSymbol(ticks_history);
                    api_base4.api.send({
                        ticks: ticks_history,
                        subscribe: 1,
                    });
                }

                if (data.msg_type === 'active_symbols') {
                    const { active_symbols }: ActiveSymbolTypes = data;
                    const filteredSymbols = active_symbols.filter(symbol => symbol.subgroup === 'synthetics');
                    filteredSymbols.sort((a, b) => a.display_order - b.display_order);
                    api_base4.api.send({
                        ticks_history: filteredSymbols[0].symbol,
                        adjust_start_time: 1,
                        count: 5000,
                        end: 'latest',
                        start: 1,
                        style: 'ticks',
                    });
                    setOptions(filteredSymbols);
                }
            });

            api_base4.pushSubscription(subscription);
        }
    };

    const removeFirstElement = () => {
        setAllLastDigitList(prevList => prevList.slice(1));
    };

    const getLastDigitList = () => {
        const requiredItems = allLastDigitList.slice(-numberOfTicks);
        const returnedList: number[] = [];
        requiredItems.forEach((tick: number) => {
            const last_digit = getLastDigits(tick, pip_size);
            returnedList.push(last_digit);
        });
        return returnedList;
    };

    // Calculate streaks
    const calculateStreaks = (pattern: string[], type1: string, type2: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (pattern.length === 0) return { streak1: 0, streak2: 0, currentType: type1 as any };
        
        let streak1 = 0;
        let streak2 = 0;
        let currentType = pattern[pattern.length - 1] === type1.charAt(0).toUpperCase() ? type1 : type2;
        
        // Count current streak from the end
        for (let i = pattern.length - 1; i >= 0; i--) {
            if (pattern[i] === pattern[pattern.length - 1]) {
                if (currentType === type1) {
                    streak1++;
                } else {
                    streak2++;
                }
            } else {
                break;
            }
        }
        
        return { streak1, streak2, currentType };
    };

    // Process tick data for all analyses
    const processTickData = () => {
        const lastDigitList = getLastDigitList();
        const tickList = allLastDigitList.slice(-numberOfTicks);
        
        if (lastDigitList.length === 0) return;

        // Digit Frequency Analysis
        const digitCounts = new Array(10).fill(0);
        lastDigitList.forEach(digit => {
            digitCounts[digit]++;
        });

        const total = lastDigitList.length;
        const freqs: DigitFrequency[] = digitCounts.map((count, digit) => ({
            digit,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
        }));

        setDigitFrequencies(freqs);

        // Find highest and lowest frequency digits
        if (freqs.length > 0) {
            let maxFreq = -Infinity;
            let minFreq = Infinity;
            let maxDigit: number | null = null;
            let minDigit: number | null = null;

            freqs.forEach(({ digit, percentage }) => {
                if (percentage > maxFreq) {
                    maxFreq = percentage;
                    maxDigit = digit;
                }
                if (percentage < minFreq && percentage > 0) {
                    minFreq = percentage;
                    minDigit = digit;
                }
            });

            setHighestFreqDigit(maxDigit);
            setLowestFreqDigit(minDigit);
        }

        // Even/Odd Analysis
        const evenOddPat: ('E' | 'O')[] = [];
        let evenCnt = 0;
        let oddCnt = 0;

        lastDigitList.forEach(digit => {
            if (digit % 2 === 0) {
                evenOddPat.push('E');
                evenCnt++;
            } else {
                evenOddPat.push('O');
                oddCnt++;
            }
        });

        setEvenOddPattern(evenOddPat);
        setEvenCount(evenCnt);
        setOddCount(oddCnt);
        
        const eoStreaks = calculateStreaks(evenOddPat, 'even', 'odd');
        setEvenStreak(eoStreaks.streak1);
        setOddStreak(eoStreaks.streak2);
        setCurrentStreakType(eoStreaks.currentType);

        // Rise/Fall Analysis
        const riseFallPat: ('R' | 'F')[] = [];
        let riseCnt = 0;
        let fallCnt = 0;
        
        if (tickList.length > 1) {
            for (let i = 1; i < tickList.length; i++) {
                if (tickList[i] > tickList[i - 1]) {
                    riseFallPat.push('R');
                    riseCnt++;
                } else {
                    riseFallPat.push('F');
                    fallCnt++;
                }
            }
        }
        
        setRiseFallPattern(riseFallPat);
        setRiseCount(riseCnt);
        setFallCount(fallCnt);
        
        const rfStreaks = calculateStreaks(riseFallPat, 'rise', 'fall');
        setRiseStreak(rfStreaks.streak1);
        setFallStreak(rfStreaks.streak2);
        setCurrentRFStreakType(rfStreaks.currentType);

        // Over/Under Analysis (using user-selected threshold)
        const overUnderPat: ('Ov' | 'U')[] = [];
        let overCnt = 0;
        let underCnt = 0;

        lastDigitList.forEach(digit => {
            if (digit > (overUnderThreshold - 1)) {
                overUnderPat.push('Ov');
                overCnt++;
            } else {
                overUnderPat.push('U');
                underCnt++;
            }
        });

        setOverUnderPattern(overUnderPat);
        setOverCount(overCnt);
        setUnderCount(underCnt);
        
        const ouStreaks = calculateStreaks(overUnderPat, 'over', 'under');
        setOverStreak(ouStreaks.streak1);
        setUnderStreak(ouStreaks.streak2);
        setCurrentOUStreakType(ouStreaks.currentType);

        // Matches/Differs Analysis (using user-selected digit or most frequent)
        const mostFrequentDigit = digitCounts.indexOf(Math.max(...digitCounts));
        const activeTargetDigit = selectedTargetDigit !== null ? selectedTargetDigit : mostFrequentDigit;
        setTargetDigit(activeTargetDigit);
        
        const mdPat: ('M' | 'D')[] = [];
        let matchesCnt = 0;
        let differsCnt = 0;

        lastDigitList.forEach(digit => {
            if (digit === activeTargetDigit) {
                mdPat.push('M');
                matchesCnt++;
            } else {
                mdPat.push('D');
                differsCnt++;
            }
        });

        setMatchesDiffersPattern(mdPat);
        setMatchesCount(matchesCnt);
        setDiffersCount(differsCnt);
        
        const mdStreaks = calculateStreaks(mdPat, 'matches', 'differs');
        setMatchesStreak(mdStreaks.streak1);
        setDiffersStreak(mdStreaks.streak2);
        setCurrentMDStreakType(mdStreaks.currentType);
    };

    // Update UI when ticks change
    useEffect(() => {
        processTickData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allLastDigitList, numberOfTicks, pip_size, overUnderThreshold, selectedTargetDigit]);

    // Event Handlers
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        api_base4.api.forgetAll('ticks').then(() => {
            setCurrentTick('Loading...');
            setCurrentPrice('--');
            setActiveSymbol(selectedValue);
        });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNumberOfTicks(newValue === '' ? '' : Number(newValue));
    };

    // Handle Over/Under threshold change
    const handleOverUnderThresholdChange = (digit: number) => {
        setOverUnderThreshold(digit);
    };

    // Handle Matches/Differs target digit change
    const handleTargetDigitChange = (digit: number) => {
        setSelectedTargetDigit(digit);
    };

    return (
        <div className={`circles-analyzer ${is_mobile ? 'mobile' : 'desktop'}`}>
            {/* Header Configuration */}
            <div className="ca-config-card">
                <div className="ca-config-row">
                    <div className="ca-form-group">
                        <label>Synthetic Market</label>
                        <select 
                            value={active_symbol} 
                            onChange={handleSelectChange}
                            className="ca-select"
                        >
                            {optionsList.map((symbol: SymbolData) => (
                                <option key={symbol.symbol} value={symbol.symbol}>
                                    {symbol.display_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="ca-form-group">
                        <label>Ticks</label>
                        <input
                            type="number"
                            value={numberOfTicks}
                            onChange={handleInputChange}
                            min={10}
                            max={5000}
                            className="ca-input"
                        />
                    </div>
                </div>
            </div>

            {/* Price Display with Digit Circles */}
            <div className="ca-price-card">
                <div className="ca-price-label">PRICE</div>
                <div className="ca-price-value">{currentPrice}</div>
                
                {/* Digit Frequency Circles */}
                <div className="ca-circles-container">
                    {digitFrequencies.map(({ digit, percentage }) => {
                        const isActive = digit === lastDigit;
                        const isHighest = digit === highestFreqDigit;
                        const isLowest = digit === lowestFreqDigit;
                        
                        let circleClass = `ca-circle ca-circle-${digit}`;
                        if (isActive) circleClass += ' ca-circle-active';
                        if (isHighest) circleClass += ' ca-circle-top';
                        if (isLowest) circleClass += ' ca-circle-less';
                        
                        return (
                            <div 
                                key={digit} 
                                className={circleClass}
                            >
                                <div className="ca-circle-digit">{digit}</div>
                                <div className="ca-circle-percentage">{percentage.toFixed(2)}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Over/Under Analysis */}
            <div className="ca-analysis-card">
                <div className="ca-analysis-header">
                    <h3>Over/Under Analysis</h3>
                    <div className="ca-streak-badge">
                        Current Streak: {currentOUStreakType === 'over' ? overStreak : underStreak}x{' '}
                        {currentOUStreakType === 'over' ? 'Over' : 'Under'}
                    </div>
                </div>
                
                <div className="ca-helper-text">
                    💡 Click a number to set the threshold for Over/Under analysis
                </div>
                
                {/* Threshold Selector */}
                <div className="ca-threshold-selector">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                        <button 
                            key={digit}
                            className={`ca-digit-btn ${digit === overUnderThreshold ? 'ca-digit-btn-highlight' : ''}`}
                            onClick={() => handleOverUnderThresholdChange(digit)}
                        >
                            {digit}
                        </button>
                    ))}
                </div>

                <div className="ca-probability-display">
                    <div className="ca-prob-section ca-prob-over">
                        <div className="ca-prob-label">Over (≥ {overUnderThreshold})</div>
                        <div className="ca-prob-percentage">{((overCount / (overCount + underCount || 1)) * 100).toFixed(1)}%</div>
                    </div>
                    <div className="ca-prob-section ca-prob-under">
                        <div className="ca-prob-label">Under (&lt; {overUnderThreshold})</div>
                        <div className="ca-prob-percentage">{((underCount / (overCount + underCount || 1)) * 100).toFixed(1)}%</div>
                    </div>
                </div>

                <div className="ca-prob-bars">
                    <div className="ca-prob-bar-bg">
                        <div 
                            className="ca-prob-bar ca-bar-over" 
                            style={{ width: `${(overCount / (overCount + underCount || 1)) * 100}%` }}
                        />
                    </div>
                    <div className="ca-prob-bar-bg">
                        <div 
                            className="ca-prob-bar ca-bar-under" 
                            style={{ width: `${(underCount / (overCount + underCount || 1)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="ca-pattern-list">
                    {overUnderPattern.slice(-8).map((item, index) => (
                        <span key={index} className={`ca-pattern-badge ca-badge-${item === 'Ov' ? 'over' : 'under'}`}>
                            {item}
                        </span>
                    ))}
                    {overUnderPattern.length > 8 && <span className="ca-more-btn">MORE</span>}
                </div>
            </div>

            {/* Matches/Differs Analysis */}
            <div className="ca-analysis-card">
                <div className="ca-analysis-header">
                    <h3>Matches/Differs Analysis</h3>
                    <div className="ca-streak-badge">
                        Current Streak: {currentMDStreakType === 'matches' ? matchesStreak : differsStreak}x{' '}
                        {currentMDStreakType === 'matches' ? 'Matches' : 'Differs'}
                    </div>
                </div>
                
                <div className="ca-helper-text">
                    💡 Click a digit to track Matches/Differs for that specific number
                </div>
                
                {/* Threshold Selector */}
                <div className="ca-threshold-selector">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                        <button 
                            key={digit} 
                            className={`ca-digit-btn ${digit === targetDigit ? 'ca-digit-btn-highlight' : ''}`}
                            onClick={() => handleTargetDigitChange(digit)}
                        >
                            {digit}
                        </button>
                    ))}
                </div>

                <div className="ca-probability-display">
                    <div className="ca-prob-section ca-prob-matches">
                        <div className="ca-prob-label">Matches ({targetDigit})</div>
                        <div className="ca-prob-percentage">{((matchesCount / (matchesCount + differsCount || 1)) * 100).toFixed(1)}%</div>
                    </div>
                    <div className="ca-prob-section ca-prob-differs">
                        <div className="ca-prob-label">Differs (≠ {targetDigit})</div>
                        <div className="ca-prob-percentage">{((differsCount / (matchesCount + differsCount || 1)) * 100).toFixed(1)}%</div>
                    </div>
                </div>

                <div className="ca-prob-bars">
                    <div className="ca-prob-bar-bg">
                        <div 
                            className="ca-prob-bar ca-bar-matches" 
                            style={{ width: `${(matchesCount / (matchesCount + differsCount || 1)) * 100}%` }}
                        />
                    </div>
                    <div className="ca-prob-bar-bg">
                        <div 
                            className="ca-prob-bar ca-bar-differs" 
                            style={{ width: `${(differsCount / (matchesCount + differsCount || 1)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="ca-pattern-list">
                    {matchesDiffersPattern.slice(-8).map((item, index) => (
                        <span key={index} className={`ca-pattern-badge ca-badge-${item === 'M' ? 'matches' : 'differs'}`}>
                            {item}
                        </span>
                    ))}
                    {matchesDiffersPattern.length > 8 && <span className="ca-more-btn">MORE</span>}
                </div>
            </div>

            {/* Even/Odd Analysis */}
            <div className="ca-analysis-card">
                <div className="ca-analysis-header">
                    <h3>Even/Odd Analysis</h3>
                    <div className="ca-streak-badge">
                        Current Streak: {currentStreakType === 'even' ? evenStreak : oddStreak}x{' '}
                        {currentStreakType === 'even' ? 'Even' : 'Odd'}
                    </div>
                </div>

                <div className="ca-probability-display">
                    <div className="ca-prob-section ca-prob-even">
                        <div className="ca-prob-label">Even</div>
                        <div className="ca-prob-percentage">{((evenCount / (evenCount + oddCount || 1)) * 100).toFixed(1)}%</div>
                    </div>
                    <div className="ca-prob-section ca-prob-odd">
                        <div className="ca-prob-label">Odd</div>
                        <div className="ca-prob-percentage">{((oddCount / (evenCount + oddCount || 1)) * 100).toFixed(1)}%</div>
                    </div>
                </div>

                <div className="ca-prob-bars">
                    <div className="ca-prob-bar-bg">
                        <div 
                            className="ca-prob-bar ca-bar-even" 
                            style={{ width: `${(evenCount / (evenCount + oddCount || 1)) * 100}%` }}
                        />
                    </div>
                    <div className="ca-prob-bar-bg">
                        <div 
                            className="ca-prob-bar ca-bar-odd" 
                            style={{ width: `${(oddCount / (evenCount + oddCount || 1)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="ca-pattern-list">
                    {evenOddPattern.slice(-8).map((item, index) => (
                        <span key={index} className={`ca-pattern-badge ca-badge-${item === 'E' ? 'even' : 'odd'}`}>
                            {item}
                        </span>
                    ))}
                    {evenOddPattern.length > 8 && <span className="ca-more-btn">MORE</span>}
                </div>
            </div>

            {/* Rise/Fall Analysis */}
            <div className="ca-analysis-card">
                <div className="ca-analysis-header">
                    <h3>Rise/Fall Analysis</h3>
                    <div className="ca-streak-badge">
                        Current Streak: {currentRFStreakType === 'rise' ? riseStreak : fallStreak}x{' '}
                        {currentRFStreakType === 'rise' ? 'Rise' : 'Fall'}
                    </div>
                </div>

                <div className="ca-probability-display">
                    <div className="ca-prob-section ca-prob-rise">
                        <div className="ca-prob-label">Rise</div>
                        <div className="ca-prob-percentage">{((riseCount / (riseCount + fallCount || 1)) * 100).toFixed(1)}%</div>
                    </div>
                    <div className="ca-prob-section ca-prob-fall">
                        <div className="ca-prob-label">Fall</div>
                        <div className="ca-prob-percentage">{((fallCount / (riseCount + fallCount || 1)) * 100).toFixed(1)}%</div>
                    </div>
                </div>

                <div className="ca-prob-bars">
                    <div className="ca-prob-bar-bg">
                        <div 
                            className="ca-prob-bar ca-bar-rise" 
                            style={{ width: `${(riseCount / (riseCount + fallCount || 1)) * 100}%` }}
                        />
                    </div>
                    <div className="ca-prob-bar-bg">
                        <div 
                            className="ca-prob-bar ca-bar-fall" 
                            style={{ width: `${(fallCount / (riseCount + fallCount || 1)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="ca-pattern-list">
                    {riseFallPattern.slice(-8).map((item, index) => (
                        <span key={index} className={`ca-pattern-badge ca-badge-${item === 'R' ? 'rise' : 'fall'}`}>
                            {item}
                        </span>
                    ))}
                    {riseFallPattern.length > 8 && <span className="ca-more-btn">MORE</span>}
                </div>
            </div>
        </div>
    );
});

export default CirclesAnalyzer;

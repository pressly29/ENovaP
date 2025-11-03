import React, { useState, useEffect } from 'react';
import { observer, useStore } from '@deriv/stores';
import { api_base4 } from '@deriv/bot-skeleton';
import './DerivMarketAnalyzer.css';

// Match the exact types from analysis.tsx
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

type TradeType = 'Even/Odd' | 'Rise/Fall' | 'Over/Under' | 'Digit Frequency';

interface DigitFrequency {
    digit: number;
    count: number;
    percentage: number;
}

const DerivMarketAnalyzer = observer(() => {
    const { ui } = useStore();
    const { is_mobile } = ui;

    // State Management - Match analysis.tsx structure
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [allLastDigitList, setAllLastDigitList] = useState<number[]>([]);
    const [numberOfTicks, setNumberOfTicks] = useState<string | number>(120);
    const [optionsList, setOptions] = useState<SymbolData[]>([]);
    const [active_symbol, setActiveSymbol] = useState('R_100');
    const [prev_symbol, setPrevSymbol] = useState('R_100');
    const [pip_size, setPipSize] = useState(2);
    
    // UI State
    const [tradeType, setTradeType] = useState<TradeType>('Even/Odd');
    const [currentPrice, setCurrentPrice] = useState<string>('--');
    
    // Even/Odd state
    const [evenCount, setEvenCount] = useState(0);
    const [oddCount, setOddCount] = useState(0);
    const [evenOddPattern, setEvenOddPattern] = useState<('E' | 'O')[]>([]);
    
    // Rise/Fall state
    const [riseCount, setRiseCount] = useState(0);
    const [fallCount, setFallCount] = useState(0);
    const [riseFallPattern, setRiseFallPattern] = useState<('R' | 'F')[]>([]);
    
    // Over/Under state
    const [overValue, setOverValue] = useState<string | number>(4);
    const [underValue, setUnderValue] = useState<string | number>(5);
    const [overCount, setOverCount] = useState(0);
    const [underCount, setUnderCount] = useState(0);
    const [overUnderPattern, setOverUnderPattern] = useState<('Ov' | 'U')[]>([]);
    
    // Digit Frequency state
    const [digitFrequencies, setDigitFrequencies] = useState<DigitFrequency[]>([]);
    const [digitPattern, setDigitPattern] = useState<number[]>([]);

    // Utility function - EXACT copy from analysis.tsx
    const sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    const getLastDigits = (tick: number, pip_size: number) => {
        let lastDigit = tick.toFixed(pip_size);
        lastDigit = String(lastDigit).slice(-1);
        return Number(lastDigit);
    };

    // Initialize API - EXACT copy from analysis.tsx startApi()
    useEffect(() => {
        startApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle symbol change - EXACT copy from analysis.tsx
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

    // Process tick data for all trade types
    const processTickData = () => {
        const lastDigitList = getLastDigitList();
        const tickList = allLastDigitList.slice(-numberOfTicks);
        
        if (lastDigitList.length === 0) return;

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

        setEvenOddPattern(evenOddPat.slice(-40));
        setEvenCount(evenCnt);
        setOddCount(oddCnt);

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
                    // Fall or Equal (treat equal as fall)
                    riseFallPat.push('F');
                    fallCnt++;
                }
            }
        }
        
        // Ensure we always have a complete pattern array
        const finalRiseFallPat = riseFallPat.slice(-40);
        
        // Debug: Log to verify F items exist
        // console.log('Rise/Fall Pattern:', finalRiseFallPat);
        // console.log('Rise Count:', riseCnt, 'Fall Count:', fallCnt);
        // console.log('F items in pattern:', finalRiseFallPat.filter(item => item === 'F').length);
        
        setRiseFallPattern(finalRiseFallPat);
        setRiseCount(riseCnt);
        setFallCount(fallCnt);

        // Over/Under Analysis
        const overUnderPat: ('Ov' | 'U')[] = [];
        let overCnt = 0;
        let underCnt = 0;
        const overThreshold = Number(overValue);
        const underThreshold = Number(underValue);

        lastDigitList.forEach(digit => {
            if (digit > overThreshold) {
                overUnderPat.push('Ov');
                overCnt++;
            } else if (digit < underThreshold) {
                overUnderPat.push('U');
                underCnt++;
            } else {
                // Between thresholds - still count for display
                overUnderPat.push('U');
            }
        });

        setOverUnderPattern(overUnderPat.slice(-40));
        setOverCount(overCnt);
        setUnderCount(underCnt);

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
        setDigitPattern(lastDigitList.slice(-40));
    };

    // Update UI when ticks change
    useEffect(() => {
        processTickData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allLastDigitList, numberOfTicks, overValue, underValue, pip_size]);

    // Event Handlers - Match analysis.tsx structure
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        api_base4.api.forgetAll('ticks').then(() => {
            setCurrentPrice('--');
            setActiveSymbol(selectedValue);
        });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setNumberOfTicks(newValue === '' ? '' : Number(newValue));
    };

    const handleTradeTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value as TradeType;
        setTradeType(selectedValue);
    };

    // Calculate probabilities
    const totalCount = evenCount + oddCount;

    // Over/Under Probability Tables
    const overProbabilities = [
        [90, 85, 70, 60],
        [55, 40, 30, 25]
    ];
    const underProbabilities = [
        [25, 30, 40, 55],
        [60, 70, 85, 90]
    ];

    return (
        <div className={`deriv-market-analyzer ${is_mobile ? 'mobile' : 'desktop'}`}>
            {/* Header Section */}
            <div className="dma-header">
                <h1 className="dma-title">
                    <span className="dma-title-main">Deriv Market Analyzer</span>
                    <span className="dma-badge">Pro</span>
                </h1>
            </div>

            {/* Analysis Configuration Card */}
            <div className="dma-card dma-config-card">
                <div className="dma-card-header">
                    <div className="dma-card-icon">⚙️</div>
                    <h2>Analysis Configuration</h2>
                </div>
                <div className="dma-config-grid">
                    <div className="dma-form-group">
                        <label>Synthetic Market</label>
                        <select 
                            value={active_symbol} 
                            onChange={handleSelectChange}
                            className="dma-select"
                        >
                            {optionsList.map((symbol: SymbolData) => (
                                <option key={symbol.symbol} value={symbol.symbol}>
                                    {symbol.display_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="dma-form-group">
                        <label>Trade Type</label>
                        <select 
                            value={tradeType}
                            onChange={handleTradeTypeChange}
                            className="dma-select"
                        >
                            <option value="Even/Odd">Even/Odd</option>
                            <option value="Rise/Fall">Rise/Fall</option>
                            <option value="Over/Under">Over/Under</option>
                            <option value="Digit Frequency">Digit Frequency</option>
                        </select>
                    </div>
                    
                    {/* Show Over/Under inputs when that trade type is selected */}
                    {tradeType === 'Over/Under' && (
                        <>
                            <div className="dma-form-group">
                                <label>Over Value</label>
                                <input
                                    type="number"
                                    value={overValue}
                                    onChange={(e) => setOverValue(Number(e.target.value))}
                                    min={0}
                                    max={9}
                                    className="dma-input"
                                />
                            </div>
                            <div className="dma-form-group">
                                <label>Under Value</label>
                                <input
                                    type="number"
                                    value={underValue}
                                    onChange={(e) => setUnderValue(Number(e.target.value))}
                                    min={0}
                                    max={9}
                                    className="dma-input"
                                />
                            </div>
                        </>
                    )}
                    
                    <div className="dma-form-group">
                        <label>Number of Ticks to Analyze</label>
                        <input
                            type="number"
                            value={numberOfTicks}
                            onChange={handleInputChange}
                            min={10}
                            max={5000}
                            className="dma-input"
                        />
                        <small className="dma-helper-text">Max 5000 ticks</small>
                    </div>
                </div>
            </div>

            {/* Current Price Card with Dynamic Stats */}
            <div className="dma-card dma-price-card">
                <div className="dma-price-header">
                    <span className="dma-price-label">CURRENT PRICE</span>
                </div>
                <div className="dma-price-main">{currentPrice}</div>
                <div className="dma-price-stats">
                    {tradeType === 'Even/Odd' && (
                        <>
                            <div className="dma-stat dma-stat-even">
                                <span className="dma-stat-label">Even</span>
                                <span className="dma-stat-value">{evenCount}</span>
                            </div>
                            <div className="dma-stat dma-stat-odd">
                                <span className="dma-stat-label">Odd</span>
                                <span className="dma-stat-value">{oddCount}</span>
                            </div>
                        </>
                    )}
                    {tradeType === 'Rise/Fall' && (
                        <>
                            <div className="dma-stat dma-stat-rise">
                                <span className="dma-stat-label">Rise</span>
                                <span className="dma-stat-value">{riseCount}</span>
                            </div>
                            <div className="dma-stat dma-stat-fall">
                                <span className="dma-stat-label">Fall</span>
                                <span className="dma-stat-value">{fallCount}</span>
                            </div>
                        </>
                    )}
                    {tradeType === 'Over/Under' && (
                        <>
                            <div className="dma-stat dma-stat-over">
                                <span className="dma-stat-label">Over</span>
                                <span className="dma-stat-value">{overCount}</span>
                            </div>
                            <div className="dma-stat dma-stat-under">
                                <span className="dma-stat-label">Under</span>
                                <span className="dma-stat-value">{underCount}</span>
                            </div>
                        </>
                    )}
                    {tradeType === 'Digit Frequency' && digitFrequencies.length > 0 && (
                        <>
                            <div className="dma-stat dma-stat-highest">
                                <span className="dma-stat-label">Highest Digit</span>
                                <span className="dma-stat-value">
                                    {digitFrequencies.reduce((max, curr) => curr.count > max.count ? curr : max).digit}
                                </span>
                            </div>
                            <div className="dma-stat dma-stat-lowest">
                                <span className="dma-stat-label">Lowest Digit</span>
                                <span className="dma-stat-value">
                                    {digitFrequencies.filter(d => d.count > 0).reduce((min, curr) => curr.count < min.count ? curr : min, digitFrequencies[0]).digit}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Recent Pattern Card - Dynamic based on trade type */}
            <div className="dma-card dma-pattern-card">
                <div className="dma-card-header">
                    <div className="dma-card-icon">🔢</div>
                    <h2>Recent Pattern</h2>
                </div>
                <div className="dma-pattern-grid">
                    {tradeType === 'Even/Odd' && evenOddPattern.map((item, index) => (
                        <div 
                            key={`eo-${index}-${item}`}
                            className={`dma-pattern-item ${item === 'E' ? 'even' : 'odd'}`}
                        >
                            {item}
                        </div>
                    ))}
                    {tradeType === 'Rise/Fall' && riseFallPattern.map((item, index) => {
                        // Ensure item is valid
                        const displayItem = item || 'F';
                        const itemClass = displayItem === 'R' ? 'rise' : 'fall';
                        return (
                            <div 
                                key={`rf-${index}-${displayItem}`}
                                className={`dma-pattern-item ${itemClass}`}
                                title={`${displayItem} at position ${index}`}
                            >
                                {displayItem}
                            </div>
                        );
                    })}
                    {tradeType === 'Over/Under' && overUnderPattern.map((item, index) => (
                        <div 
                            key={`ou-${index}-${item}`}
                            className={`dma-pattern-item ${item === 'Ov' ? 'over' : 'under'}`}
                        >
                            {item}
                        </div>
                    ))}
                    {tradeType === 'Digit Frequency' && digitPattern.map((digit, index) => (
                        <div 
                            key={`digit-${index}-${digit}`}
                            className={`dma-digit-circle dma-digit-${digit}`}
                        >
                            {digit}
                        </div>
                    ))}
                    {(
                        (tradeType === 'Even/Odd' && evenOddPattern.length === 0) ||
                        (tradeType === 'Rise/Fall' && riseFallPattern.length === 0) ||
                        (tradeType === 'Over/Under' && overUnderPattern.length === 0) ||
                        (tradeType === 'Digit Frequency' && digitPattern.length === 0)
                    ) && (
                        <div className="dma-pattern-loading">Loading pattern data...</div>
                    )}
                </div>
            </div>

            {/* Probability Analysis Card - Dynamic based on trade type */}
            <div className="dma-card dma-probability-card">
                <div className="dma-card-header">
                    <div className="dma-card-icon">📊</div>
                    <h2>Probability Analysis</h2>
                </div>
                
                {tradeType === 'Even/Odd' && (
                    <div className="dma-probability-bars">
                        <div className="dma-prob-bar-container">
                            <div className="dma-prob-label">
                                <span>Even</span>
                                <span className="dma-prob-percentage">
                                    {((evenCount / (evenCount + oddCount || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="dma-prob-bar-bg">
                                <div 
                                    className="dma-prob-bar dma-prob-even" 
                                    style={{ width: `${(evenCount / (evenCount + oddCount || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="dma-prob-bar-container">
                            <div className="dma-prob-label">
                                <span>Odd</span>
                                <span className="dma-prob-percentage">
                                    {((oddCount / (evenCount + oddCount || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="dma-prob-bar-bg">
                                <div 
                                    className="dma-prob-bar dma-prob-odd" 
                                    style={{ width: `${(oddCount / (evenCount + oddCount || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {tradeType === 'Rise/Fall' && (
                    <div className="dma-probability-bars">
                        <div className="dma-prob-bar-container">
                            <div className="dma-prob-label">
                                <span>Rise</span>
                                <span className="dma-prob-percentage">
                                    {((riseCount / (riseCount + fallCount || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="dma-prob-bar-bg">
                                <div 
                                    className="dma-prob-bar dma-prob-rise" 
                                    style={{ width: `${(riseCount / (riseCount + fallCount || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="dma-prob-bar-container">
                            <div className="dma-prob-label">
                                <span>Fall</span>
                                <span className="dma-prob-percentage">
                                    {((fallCount / (riseCount + fallCount || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="dma-prob-bar-bg">
                                <div 
                                    className="dma-prob-bar dma-prob-fall" 
                                    style={{ width: `${(fallCount / (riseCount + fallCount || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {tradeType === 'Over/Under' && (
                    <div className="dma-probability-bars">
                        <div className="dma-prob-bar-container">
                            <div className="dma-prob-label">
                                <span>Over</span>
                                <span className="dma-prob-percentage">
                                    {((overCount / (overCount + underCount || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="dma-prob-bar-bg">
                                <div 
                                    className="dma-prob-bar dma-prob-over" 
                                    style={{ width: `${(overCount / (overCount + underCount || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="dma-prob-bar-container">
                            <div className="dma-prob-label">
                                <span>Under</span>
                                <span className="dma-prob-percentage">
                                    {((underCount / (overCount + underCount || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="dma-prob-bar-bg">
                                <div 
                                    className="dma-prob-bar dma-prob-under" 
                                    style={{ width: `${(underCount / (overCount + underCount || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {tradeType === 'Digit Frequency' && digitFrequencies.length > 0 && (
                    <div className="dma-digit-frequency-chart">
                        {digitFrequencies.map(({ digit, percentage }) => (
                            <div key={digit} className="dma-digit-freq-bar">
                                <div className="dma-digit-freq-bar-container">
                                    <div 
                                        className={`dma-digit-freq-fill dma-digit-freq-${digit}`}
                                        style={{ height: `${Math.max(percentage, 2)}%` }}
                                    >
                                        <span className="dma-digit-freq-percentage">
                                            {percentage >= 5 ? `${percentage.toFixed(1)}%` : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="dma-digit-freq-label">{digit}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trading Probability Guide Card */}
            <div className="dma-card dma-guide-card">
                <div className="dma-card-header">
                    <div className="dma-card-icon">📖</div>
                    <h2>Trading Probability Guide</h2>
                </div>
                <div className="dma-guide-grid">
                    <div className="dma-guide-section">
                        <h3>Over Probabilities</h3>
                        <div className="dma-prob-table">
                            {overProbabilities.map((row, rowIndex) => (
                                <div key={rowIndex} className="dma-prob-row">
                                    {row.map((prob, colIndex) => (
                                        <div key={colIndex} className="dma-prob-cell">
                                            <div className="dma-prob-digit">{rowIndex * 4 + colIndex + 1}</div>
                                            <div className="dma-prob-value">{prob}%</div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="dma-guide-section">
                        <h3>Under Probabilities</h3>
                        <div className="dma-prob-table">
                            {underProbabilities.map((row, rowIndex) => (
                                <div key={rowIndex} className="dma-prob-row">
                                    {row.map((prob, colIndex) => (
                                        <div key={colIndex} className="dma-prob-cell">
                                            <div className="dma-prob-digit">{rowIndex * 4 + colIndex + 1}</div>
                                            <div className="dma-prob-value">{prob}%</div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Signal Strength Guide Card */}
            <div className="dma-card dma-signal-card">
                <div className="dma-card-header">
                    <div className="dma-card-icon">📡</div>
                    <h2>Signal Strength Guide</h2>
                </div>
                <div className="dma-signal-table">
                    <div className="dma-signal-header">
                        <div className="dma-signal-col">Pattern</div>
                        <div className="dma-signal-col">Even/Odd</div>
                        <div className="dma-signal-col">Rise/Fall</div>
                    </div>
                    <div className="dma-signal-row">
                        <div className="dma-signal-col dma-signal-label">Strong Signal</div>
                        <div className="dma-signal-col">Above 65%</div>
                        <div className="dma-signal-col">Above 65%</div>
                    </div>
                    <div className="dma-signal-row">
                        <div className="dma-signal-col dma-signal-label">Moderate Signal</div>
                        <div className="dma-signal-col">55-65%</div>
                        <div className="dma-signal-col">55-65%</div>
                    </div>
                    <div className="dma-signal-row">
                        <div className="dma-signal-col dma-signal-label">Weak Signal</div>
                        <div className="dma-signal-col">Below 55%</div>
                        <div className="dma-signal-col">Below 55%</div>
                    </div>
                </div>
                <div className="dma-tip">
                    <span className="dma-tip-icon">💡</span>
                    <span className="dma-tip-text">
                        Tip: Combine pattern analysis with probability indicators for better trade decisions.
                    </span>
                </div>
            </div>
        </div>
    );
});

export default DerivMarketAnalyzer;

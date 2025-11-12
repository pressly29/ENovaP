import React, { useEffect, useState } from 'react';
import { api_base4 } from '@deriv/bot-skeleton';
import { observer, useStore } from '@deriv/stores';
import { DerivSignalGenerator, TechnicalIndicators } from './components';
import './signals-hub.css';

// Types
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

const SignalsHub = observer(() => {
    const { ui } = useStore();
    const { is_mobile } = ui;

    // API State
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [optionsList, setOptions] = useState<SymbolData[]>([]);
    const [active_symbol, setActiveSymbol] = useState('R_100');
    const [prev_symbol, setPrevSymbol] = useState('R_100');
    const [pip_size, setPipSize] = useState(2);

    // Market Data
    const [allTicksList, setAllTicksList] = useState<number[]>([]);
    const [currentPrice, setCurrentPrice] = useState<string>('--');
    const [currentTick, setCurrentTick] = useState<number | string>('--');
    const [lastDigit, setLastDigit] = useState<number>(0);

    // Pattern Analysis State
    const [evenCount, setEvenCount] = useState(0);
    const [oddCount, setOddCount] = useState(0);
    const [riseCount, setRiseCount] = useState(0);
    const [fallCount, setFallCount] = useState(0);

    // UI State
    const [selectedView, setSelectedView] = useState<
        'overview' | 'patterns' | 'deriv-signals' | 'indicators' | 'history'
    >('deriv-signals');
    const [consoleMessages, setConsoleMessages] = useState<string[]>([]);

    // Utility Functions
    const sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    const getLastDigits = (tick: number, pip_size: number) => {
        let lastDigit = tick.toFixed(pip_size);
        lastDigit = String(lastDigit).slice(-1);
        return Number(lastDigit);
    };

    const addConsoleMessage = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setConsoleMessages(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
    };

    const removeFirstElement = () => {
        setAllTicksList(prevList => {
            if (prevList.length > 120) {
                return prevList.slice(1);
            }
            return prevList;
        });
    };

    // Initialize API
    useEffect(() => {
        startApi();
        return () => {
            if (api_base4.api) {
                api_base4.api.send({ forget_all: 'ticks' });
            }
        };
    }, []);

    // Handle symbol change
    useEffect(() => {
        if (prev_symbol !== active_symbol && isConnected) {
            addConsoleMessage(`Switching to ${active_symbol}...`);

            // Clear all market data when switching symbols
            setAllTicksList([]);
            setCurrentTick('--');
            setLastDigit(0);
            setCurrentPrice('--');
            setEvenCount(0);
            setOddCount(0);
            setRiseCount(0);
            setFallCount(0);

            api_base4.api.send({
                forget_all: 'ticks',
            });
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
    }, [active_symbol, isConnected]);

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
            const subscription = api_base4.api.onMessage().subscribe(({ data }: { data: any }) => {
                if (data.msg_type === 'tick') {
                    const { tick } = data;
                    const { ask, id, pip_size } = tick;
                    const last_digit = getLastDigits(ask, pip_size);

                    setLastDigit(last_digit);
                    setCurrentTick(ask);
                    setCurrentPrice(ask.toFixed(pip_size));
                    removeFirstElement();
                    setAllTicksList(prevList => [...prevList, ask]);

                    // Update pattern counts
                    if (last_digit % 2 === 0) {
                        setEvenCount(prev => prev + 1);
                    } else {
                        setOddCount(prev => prev + 1);
                    }
                }

                if (data.msg_type === 'history') {
                    const { history, pip_size } = data;
                    setPipSize(pip_size);
                    const { prices } = history;
                    const { ticks_history } = data.echo_req;
                    setAllTicksList(prices);
                    setActiveSymbol(ticks_history);
                    setIsConnected(true);
                    addConsoleMessage(`Connected to ${ticks_history} - Loaded ${prices.length} ticks`);
                    api_base4.api.send({
                        ticks: ticks_history,
                        subscribe: 1,
                    });
                }

                if (data.msg_type === 'active_symbols') {
                    const { active_symbols }: ActiveSymbolTypes = data;
                    const filteredSymbols = active_symbols.filter(symbol => symbol.subgroup === 'synthetics');
                    filteredSymbols.sort((a, b) => a.display_order - b.display_order);
                    setOptions(filteredSymbols);
                    addConsoleMessage(`Loaded ${filteredSymbols.length} synthetic markets`);

                    if (filteredSymbols.length > 0) {
                        api_base4.api.send({
                            ticks_history: filteredSymbols[0].symbol,
                            adjust_start_time: 1,
                            count: 5000,
                            end: 'latest',
                            start: 1,
                            style: 'ticks',
                        });
                    }
                }
            });
        }
    };

    // Calculate percentages
    const totalPatterns = evenCount + oddCount;
    const evenPercentage = totalPatterns > 0 ? ((evenCount / totalPatterns) * 100).toFixed(1) : '0.0';
    const oddPercentage = totalPatterns > 0 ? ((oddCount / totalPatterns) * 100).toFixed(1) : '0.0';

    return (
        <div className='signals-hub-container'>
            {/* Header Section */}
            <div className='signals-hub-header'>
                <div className='hub-title'>
                    <h1>🎯 Signals Hub</h1>
                    <p className='hub-subtitle'>Real-time market signals powered by advanced analytics</p>
                </div>
                <div className={`connection-status ${isConnected ? 'connected' : 'connecting'}`}>
                    <span className='status-dot' />
                    {isConnected ? '🟢 Live' : '🟡 Connecting...'}
                </div>
            </div>

            {/* Symbol Selector */}
            <div className='symbol-selector-section'>
                <label htmlFor='symbol-select'>Select Market:</label>
                <select
                    id='symbol-select'
                    value={active_symbol}
                    onChange={e => setActiveSymbol(e.target.value)}
                    className='symbol-dropdown'
                >
                    {optionsList.map(symbol => (
                        <option key={symbol.symbol} value={symbol.symbol}>
                            {symbol.display_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Market Data Overview */}
            <div className='market-data-overview'>
                <div className='data-card'>
                    <span className='data-label'>Symbol</span>
                    <span className='data-value'>{active_symbol}</span>
                </div>
                <div className='data-card'>
                    <span className='data-label'>Current Price</span>
                    <span className='data-value price'>{currentPrice}</span>
                </div>
                <div className='data-card'>
                    <span className='data-label'>Last Digit</span>
                    <span className='data-value digit'>{lastDigit}</span>
                </div>
                <div className='data-card'>
                    <span className='data-label'>Ticks Loaded</span>
                    <span className='data-value'>{allTicksList.length}</span>
                </div>
            </div>

            {/* View Toggle */}
            <div className='signals-view-toggle'>
                <button
                    className={`view-btn ${selectedView === 'overview' ? 'active' : ''}`}
                    onClick={() => setSelectedView('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`view-btn ${selectedView === 'deriv-signals' ? 'active' : ''}`}
                    onClick={() => setSelectedView('deriv-signals')}
                >
                    🎲 Deriv Signals
                </button>
                <button
                    className={`view-btn ${selectedView === 'indicators' ? 'active' : ''}`}
                    onClick={() => setSelectedView('indicators')}
                >
                    📈 Indicators
                </button>
                <button
                    className={`view-btn ${selectedView === 'patterns' ? 'active' : ''}`}
                    onClick={() => setSelectedView('patterns')}
                >
                    📊 Analytics
                </button>
                <button
                    className={`view-btn ${selectedView === 'history' ? 'active' : ''}`}
                    onClick={() => setSelectedView('history')}
                    disabled
                    title='Coming in Phase 2'
                >
                    📜 History
                </button>
            </div>

            {/* Content Area */}
            <div className='signals-content'>
                {selectedView === 'overview' && (
                    <div className='overview-section'>
                        <div className='welcome-card'>
                            <h2>🎲 Deriv Signal Trading Hub</h2>
                            <p>
                                Advanced pattern-based signal generation for Deriv synthetic indices. Get real-time
                                Over/Under, Even/Odd, and Rise/Fall predictions with confidence scoring.
                            </p>

                            <div className='quick-stats'>
                                <h3>📊 Current Status</h3>
                                <div className='stats-grid'>
                                    <div className='stat-item'>
                                        <span className='stat-value'>{allTicksList.length}</span>
                                        <span className='stat-label'>Ticks Processed</span>
                                    </div>
                                    <div className='stat-item'>
                                        <span className='stat-value'>{optionsList.length}</span>
                                        <span className='stat-label'>Markets Available</span>
                                    </div>
                                    <div className='stat-item'>
                                        <span className='stat-value'>{isConnected ? '100%' : '0%'}</span>
                                        <span className='stat-label'>Connection</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedView === 'patterns' && (
                    <div className='patterns-section'>
                        <h2>🎯 Pattern Analysis</h2>
                        <div className='pattern-cards'>
                            <div className='pattern-card'>
                                <h3>Even/Odd Analysis</h3>
                                <div className='pattern-bars'>
                                    <div className='bar-group'>
                                        <div className='bar-label'>Even: {evenPercentage}%</div>
                                        <div className='bar-container'>
                                            <div className='bar even-bar' style={{ width: `${evenPercentage}%` }} />
                                        </div>
                                    </div>
                                    <div className='bar-group'>
                                        <div className='bar-label'>Odd: {oddPercentage}%</div>
                                        <div className='bar-container'>
                                            <div className='bar odd-bar' style={{ width: `${oddPercentage}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className='pattern-stats'>
                                    <p>Even count: {evenCount}</p>
                                    <p>Odd count: {oddCount}</p>
                                    <p>Total: {totalPatterns}</p>
                                </div>
                            </div>

                            <div className='pattern-card'>
                                <h3>🔮 More Patterns Coming Soon</h3>
                                <p className='coming-soon-text'>
                                    Rise/Fall, Over/Under, and Digit Frequency patterns will be added in the next
                                    update.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {selectedView === 'deriv-signals' && (
                    <div className='deriv-signals-section'>
                        <DerivSignalGenerator prices={allTicksList} pipSize={pip_size} symbol={active_symbol} />
                    </div>
                )}

                {selectedView === 'indicators' && (
                    <div className='indicators-section'>
                        <TechnicalIndicators prices={allTicksList} pipSize={pip_size} symbol={active_symbol} />
                    </div>
                )}
            </div>

            {/* Console Log */}
            <div className='console-section'>
                <div className='console-header'>
                    <h3>📟 Console Log</h3>
                    <button className='clear-console-btn' onClick={() => setConsoleMessages([])}>
                        Clear
                    </button>
                </div>
                <div className='console-messages'>
                    {consoleMessages.length === 0 ? (
                        <p className='no-messages'>No messages yet...</p>
                    ) : (
                        consoleMessages.map((msg, idx) => (
                            <div key={idx} className='console-message'>
                                {msg}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
});

export default SignalsHub;

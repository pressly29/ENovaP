import React, { useEffect, useState } from 'react';
import { 
    relativeStrengthIndex,
    macdArray,
    bollingerBands,
    exponentialMovingAverageArray,
    simpleMovingAverage
} from '@deriv/indicators';

interface IndicatorData {
    rsi: number | null;
    macd: {
        histogram: number;
        macd: number;
        signal: number;
    } | null;
    bb: {
        middle: number;
        upper: number;
        lower: number;
    } | null;
    ema: number | null;
    sma: number | null;
}

interface IndicatorProps {
    prices: number[];
    pipSize: number;
}

export const TechnicalIndicators: React.FC<IndicatorProps> = ({ prices, pipSize }) => {
    const [indicators, setIndicators] = useState<IndicatorData>({
        rsi: null,
        macd: null,
        bb: null,
        ema: null,
        sma: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (prices.length < 26) {
            setLoading(true);
            setError('Collecting data... Need at least 26 price points');
            return;
        }

        try {
            setLoading(false);
            setError(null);

            // Prepare data in the format indicators expect
            const ohlcData = prices.map(price => ({
                open: price,
                high: price,
                low: price,
                close: price,
            }));

            // Calculate RSI (14 periods)
            let rsiValue = null;
            try {
                if (ohlcData.length >= 15) {
                    rsiValue = relativeStrengthIndex(ohlcData, { 
                        periods: 14, 
                        field: 'close',
                        pipSize 
                    }, {});
                }
            } catch (e) {
                // RSI calculation pending - not enough data
            }

            // Calculate MACD (12, 26, 9)
            let macdValue = null;
            try {
                // MACD needs: slowEmaPeriod (26) + signalEmaPeriod (9) - 1 = 34 minimum
                if (prices.length >= 35) {
                    const macdResult = macdArray(prices, {
                        fastEmaPeriod: 12,
                        slowEmaPeriod: 26,
                        signalEmaPeriod: 9,
                        pipSize
                    });
                    
                    if (macdResult && macdResult.length > 0) {
                        const lastMacd = macdResult[macdResult.length - 1];
                        // macdArray returns [histogram, macd, signal]
                        macdValue = {
                            histogram: lastMacd[0],
                            macd: lastMacd[1],
                            signal: lastMacd[2]
                        };
                    }
                }
            } catch (e) {
                // console.log('MACD calculation pending...', e);
            }

            // Calculate Bollinger Bands (20 periods, 2 std dev)
            let bbValue = null;
            try {
                if (ohlcData.length >= 20) {
                    const bbResult = bollingerBands(ohlcData, {
                        periods: 20,
                        stdDevUp: 2,
                        stdDevDown: 2,
                        field: 'close',
                        pipSize
                    });
                    
                    // bollingerBands returns [middle, upper, lower]
                    if (bbResult && bbResult.length === 3) {
                        bbValue = {
                            middle: bbResult[0],
                            upper: bbResult[1],
                            lower: bbResult[2]
                        };
                    }
                }
            } catch (e) {
                // console.log('BB calculation pending...');
            }

            // Calculate EMA (20 periods)
            let emaValue = null;
            try {
                if (ohlcData.length >= 20) {
                    const emaArray = exponentialMovingAverageArray(ohlcData, {
                        periods: 20,
                        field: 'close',
                        pipSize
                    });
                    if (emaArray && emaArray.length > 0) {
                        emaValue = emaArray[emaArray.length - 1];
                    }
                }
            } catch (e) {
                // console.log('EMA calculation pending...');
            }

            // Calculate SMA (20 periods)
            let smaValue = null;
            try {
                if (ohlcData.length >= 20) {
                    smaValue = simpleMovingAverage(ohlcData, {
                        periods: 20,
                        field: 'close',
                        pipSize
                    });
                }
            } catch (e) {
                // console.log('SMA calculation pending...');
            }

            setIndicators({
                rsi: rsiValue,
                macd: macdValue,
                bb: bbValue,
                ema: emaValue,
                sma: smaValue,
            });
        } catch (err) {
            setError('Error calculating indicators');
            // console.error('Indicator calculation error:', err);
        }
    }, [prices, pipSize]);

    if (loading || error) {
        return (
            <div className="indicators-loading">
                <div className="loading-message">
                    {error || 'Loading indicators...'}
                </div>
                <div className="loading-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${(prices.length / 26) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        {prices.length} / 26 ticks collected
                    </span>
                </div>
            </div>
        );
    }

    const getRSIStatus = (rsi: number | null) => {
        if (rsi === null) return { label: 'N/A', class: 'neutral' };
        if (rsi >= 70) return { label: 'Overbought', class: 'danger' };
        if (rsi <= 30) return { label: 'Oversold', class: 'success' };
        return { label: 'Neutral', class: 'neutral' };
    };

    const getMACDStatus = (macd: any) => {
        if (!macd) return { label: 'N/A', class: 'neutral' };
        if (macd.histogram > 0) return { label: 'Bullish', class: 'success' };
        if (macd.histogram < 0) return { label: 'Bearish', class: 'danger' };
        return { label: 'Neutral', class: 'neutral' };
    };

    const getBBStatus = (bb: any, currentPrice: number) => {
        if (!bb) return { label: 'N/A', class: 'neutral' };
        if (currentPrice >= bb.upper) return { label: 'Upper Band', class: 'danger' };
        if (currentPrice <= bb.lower) return { label: 'Lower Band', class: 'success' };
        return { label: 'Middle Range', class: 'neutral' };
    };

    const rsiStatus = getRSIStatus(indicators.rsi);
    const macdStatus = getMACDStatus(indicators.macd);
    const bbStatus = getBBStatus(indicators.bb, prices[prices.length - 1]);

    return (
        <div className="technical-indicators">
            <div className="indicators-header">
                <h3>📊 Technical Indicators</h3>
                <p className="indicators-subtitle">Real-time market analysis</p>
            </div>

            <div className="indicators-grid">
                {/* RSI Card */}
                <div className="indicator-card">
                    <div className="indicator-header">
                        <span className="indicator-name">RSI (14)</span>
                        <span className={`indicator-status ${rsiStatus.class}`}>
                            {rsiStatus.label}
                        </span>
                    </div>
                    <div className="indicator-value">
                        {indicators.rsi !== null ? indicators.rsi.toFixed(2) : '--'}
                    </div>
                    <div className="indicator-bar">
                        <div className="rsi-zones">
                            <div className="zone oversold">0</div>
                            <div className="zone neutral">50</div>
                            <div className="zone overbought">100</div>
                        </div>
                        <div className="rsi-marker" style={{ 
                            left: `${indicators.rsi || 50}%` 
                        }} />
                    </div>
                    <div className="indicator-info">
                        Relative Strength Index measures momentum
                    </div>
                </div>

                {/* MACD Card */}
                <div className="indicator-card">
                    <div className="indicator-header">
                        <span className="indicator-name">MACD</span>
                        <span className={`indicator-status ${macdStatus.class}`}>
                            {macdStatus.label}
                        </span>
                    </div>
                    {indicators.macd ? (
                        <div className="macd-values">
                            <div className="macd-row">
                                <span>MACD:</span>
                                <span className="value">{indicators.macd.macd.toFixed(pipSize)}</span>
                            </div>
                            <div className="macd-row">
                                <span>Signal:</span>
                                <span className="value">{indicators.macd.signal.toFixed(pipSize)}</span>
                            </div>
                            <div className="macd-row">
                                <span>Histogram:</span>
                                <span className={`value ${indicators.macd.histogram >= 0 ? 'positive' : 'negative'}`}>
                                    {indicators.macd.histogram.toFixed(pipSize)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="indicator-value">--</div>
                    )}
                    <div className="indicator-info">
                        Moving Average Convergence Divergence
                    </div>
                </div>

                {/* Bollinger Bands Card */}
                <div className="indicator-card">
                    <div className="indicator-header">
                        <span className="indicator-name">Bollinger Bands</span>
                        <span className={`indicator-status ${bbStatus.class}`}>
                            {bbStatus.label}
                        </span>
                    </div>
                    {indicators.bb ? (
                        <div className="bb-values">
                            <div className="bb-row upper">
                                <span>Upper:</span>
                                <span className="value">{indicators.bb.upper.toFixed(pipSize)}</span>
                            </div>
                            <div className="bb-row middle">
                                <span>Middle:</span>
                                <span className="value">{indicators.bb.middle.toFixed(pipSize)}</span>
                            </div>
                            <div className="bb-row lower">
                                <span>Lower:</span>
                                <span className="value">{indicators.bb.lower.toFixed(pipSize)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="indicator-value">--</div>
                    )}
                    <div className="indicator-info">
                        Volatility bands (20 periods, 2σ)
                    </div>
                </div>

                {/* EMA Card */}
                <div className="indicator-card">
                    <div className="indicator-header">
                        <span className="indicator-name">EMA (20)</span>
                        <span className={`indicator-status ${
                            indicators.ema && prices[prices.length - 1] > indicators.ema 
                                ? 'success' 
                                : 'danger'
                        }`}>
                            {indicators.ema && prices[prices.length - 1] > indicators.ema 
                                ? 'Above' 
                                : 'Below'}
                        </span>
                    </div>
                    <div className="indicator-value">
                        {indicators.ema !== null ? indicators.ema.toFixed(pipSize) : '--'}
                    </div>
                    <div className="indicator-comparison">
                        <span>Current: {prices[prices.length - 1]?.toFixed(pipSize) || '--'}</span>
                    </div>
                    <div className="indicator-info">
                        Exponential Moving Average
                    </div>
                </div>

                {/* SMA Card */}
                <div className="indicator-card">
                    <div className="indicator-header">
                        <span className="indicator-name">SMA (20)</span>
                        <span className={`indicator-status ${
                            indicators.sma && prices[prices.length - 1] > indicators.sma 
                                ? 'success' 
                                : 'danger'
                        }`}>
                            {indicators.sma && prices[prices.length - 1] > indicators.sma 
                                ? 'Above' 
                                : 'Below'}
                        </span>
                    </div>
                    <div className="indicator-value">
                        {indicators.sma !== null ? indicators.sma.toFixed(pipSize) : '--'}
                    </div>
                    <div className="indicator-comparison">
                        <span>Current: {prices[prices.length - 1]?.toFixed(pipSize) || '--'}</span>
                    </div>
                    <div className="indicator-info">
                        Simple Moving Average
                    </div>
                </div>

                {/* Trading Signals Summary */}
                <div className="indicator-card signals-summary">
                    <div className="indicator-header">
                        <span className="indicator-name">📈 Trading Signals</span>
                    </div>
                    <div className="signals-list">
                        <div className={`signal-item ${rsiStatus.class}`}>
                            <span className="signal-icon">●</span>
                            <span>RSI: {rsiStatus.label}</span>
                        </div>
                        <div className={`signal-item ${macdStatus.class}`}>
                            <span className="signal-icon">●</span>
                            <span>MACD: {macdStatus.label}</span>
                        </div>
                        <div className={`signal-item ${bbStatus.class}`}>
                            <span className="signal-icon">●</span>
                            <span>BB: {bbStatus.label}</span>
                        </div>
                    </div>
                    <div className="overall-sentiment">
                        <span>Overall Sentiment:</span>
                        <span className={`sentiment-badge ${
                            [rsiStatus, macdStatus, bbStatus].filter(s => s.class === 'success').length >= 2
                                ? 'bullish'
                                : [rsiStatus, macdStatus, bbStatus].filter(s => s.class === 'danger').length >= 2
                                ? 'bearish'
                                : 'neutral'
                        }`}>
                            {[rsiStatus, macdStatus, bbStatus].filter(s => s.class === 'success').length >= 2
                                ? '🟢 Bullish'
                                : [rsiStatus, macdStatus, bbStatus].filter(s => s.class === 'danger').length >= 2
                                ? '🔴 Bearish'
                                : '⚪ Neutral'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

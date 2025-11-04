import React, { useEffect, useState } from 'react';
import { observer } from '@deriv/stores';
import './technical-indicators.css';

interface TechnicalIndicatorsProps {
    prices: number[];
    pipSize: number;
    symbol: string;
}

interface IndicatorValues {
    rsi: number;
    macd: { macd: number; signal: number; histogram: number };
    bb: { upper: number; middle: number; lower: number };
    sma: number;
    ema: number;
}

export const TechnicalIndicators = observer(({ prices, pipSize, symbol }: TechnicalIndicatorsProps) => {
    const [indicators, setIndicators] = useState<IndicatorValues | null>(null);
    const [signalStrength, setSignalStrength] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL'>('NEUTRAL');

    useEffect(() => {
        if (prices.length >= 50) {
            calculateIndicators();
        }
    }, [prices]);

    const calculateIndicators = () => {
        const rsi = calculateRSI(prices, 14);
        const macd = calculateMACD(prices);
        const bb = calculateBollingerBands(prices, 20, 2);
        const sma = calculateSMA(prices, 20);
        const ema = calculateEMA(prices, 20);

        setIndicators({ rsi, macd, bb, sma, ema });

        // Determine overall signal strength
        const signals = [];

        // RSI signals
        if (rsi < 30) signals.push('BULLISH');
        else if (rsi > 70) signals.push('BEARISH');

        // MACD signals
        if (macd.macd > macd.signal) signals.push('BULLISH');
        else signals.push('BEARISH');

        // BB signals
        const currentPrice = prices[prices.length - 1];
        if (currentPrice < bb.lower) signals.push('BULLISH');
        else if (currentPrice > bb.upper) signals.push('BEARISH');

        // Count signals
        const bullishCount = signals.filter(s => s === 'BULLISH').length;
        const bearishCount = signals.filter(s => s === 'BEARISH').length;

        if (bullishCount > bearishCount) setSignalStrength('BULLISH');
        else if (bearishCount > bullishCount) setSignalStrength('BEARISH');
        else setSignalStrength('NEUTRAL');
    };

    // RSI Calculation
    const calculateRSI = (data: number[], period = 14): number => {
        if (data.length < period + 1) return 50;

        const changes: number[] = [];
        for (let i = 1; i < data.length; i++) {
            changes.push(data[i] - data[i - 1]);
        }

        const recentChanges = changes.slice(-period);
        const gains = recentChanges.filter(c => c > 0);
        const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));

        const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
        const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;

        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        const rsi = 100 - 100 / (1 + rs);

        return Math.round(rsi * 10) / 10;
    };

    // MACD Calculation
    const calculateMACD = (data: number[]): { macd: number; signal: number; histogram: number } => {
        const ema12 = calculateEMA(data, 12);
        const ema26 = calculateEMA(data, 26);
        const macd = ema12 - ema26;

        // Signal line (9-period EMA of MACD)
        const macdLine = [macd]; // Simplified - in production, calculate over time
        const signal = calculateEMA(macdLine, 9);
        const histogram = macd - signal;

        return {
            macd: Math.round(macd * 100000) / 100000,
            signal: Math.round(signal * 100000) / 100000,
            histogram: Math.round(histogram * 100000) / 100000,
        };
    };

    // Bollinger Bands Calculation
    const calculateBollingerBands = (data: number[], period = 20, stdDev = 2) => {
        const recentData = data.slice(-period);
        const sma = recentData.reduce((sum, val) => sum + val, 0) / period;

        // Calculate standard deviation
        const squaredDiffs = recentData.map(val => Math.pow(val - sma, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
        const sd = Math.sqrt(variance);

        return {
            upper: sma + sd * stdDev,
            middle: sma,
            lower: sma - sd * stdDev,
        };
    };

    // SMA Calculation
    const calculateSMA = (data: number[], period = 20): number => {
        const recentData = data.slice(-period);
        return recentData.reduce((sum, val) => sum + val, 0) / period;
    };

    // EMA Calculation
    const calculateEMA = (data: number[], period = 20): number => {
        if (data.length === 0) return 0;

        const multiplier = 2 / (period + 1);
        let ema = data[0];

        for (let i = 1; i < data.length; i++) {
            ema = data[i] * multiplier + ema * (1 - multiplier);
        }

        return ema;
    };

    if (!indicators) {
        return (
            <div className='indicators-loading'>
                <div className='loading-message'>📊 Calculating Technical Indicators...</div>
                <div className='loading-progress'>
                    <div className='progress-bar'>
                        <div className='progress-fill' style={{ width: `${(prices.length / 50) * 100}%` }} />
                    </div>
                    <div className='progress-text'>{prices.length} / 50 ticks</div>
                </div>
            </div>
        );
    }

    const currentPrice = prices[prices.length - 1].toFixed(pipSize);

    return (
        <div className='technical-indicators'>
            <div className='indicators-header'>
                <h3>📈 Technical Indicators</h3>
                <p className='indicators-subtitle'>Real-time market analysis for {symbol}</p>
            </div>

            <div className='indicators-grid'>
                {/* RSI Indicator */}
                <div className='indicator-card'>
                    <div className='indicator-header'>
                        <span className='indicator-name'>RSI (14)</span>
                        <span
                            className={`indicator-status ${
                                indicators.rsi < 30 ? 'success' : indicators.rsi > 70 ? 'danger' : 'neutral'
                            }`}
                        >
                            {indicators.rsi < 30 ? 'OVERSOLD' : indicators.rsi > 70 ? 'OVERBOUGHT' : 'NEUTRAL'}
                        </span>
                    </div>
                    <div className='indicator-value'>{indicators.rsi.toFixed(1)}</div>
                    <div className='indicator-bar'>
                        <div className='rsi-zones'>
                            <span className='zone oversold'>30</span>
                            <span className='zone'>50</span>
                            <span className='zone overbought'>70</span>
                        </div>
                        <div
                            style={{
                                position: 'relative',
                                height: '8px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                            }}
                        >
                            <div className='rsi-marker' style={{ left: `${indicators.rsi}%` }} />
                        </div>
                    </div>
                    <div className='indicator-info'>
                        {indicators.rsi < 30 && '⬆️ Strong buy signal - Market oversold'}
                        {indicators.rsi > 70 && '⬇️ Strong sell signal - Market overbought'}
                        {indicators.rsi >= 30 && indicators.rsi <= 70 && '➡️ Market in neutral zone'}
                    </div>
                </div>

                {/* MACD Indicator */}
                <div className='indicator-card'>
                    <div className='indicator-header'>
                        <span className='indicator-name'>MACD (12,26,9)</span>
                        <span
                            className={`indicator-status ${
                                indicators.macd.histogram > 0
                                    ? 'success'
                                    : indicators.macd.histogram < 0
                                    ? 'danger'
                                    : 'neutral'
                            }`}
                        >
                            {indicators.macd.histogram > 0
                                ? 'BULLISH'
                                : indicators.macd.histogram < 0
                                ? 'BEARISH'
                                : 'NEUTRAL'}
                        </span>
                    </div>
                    <div className='macd-values'>
                        <div className='macd-row'>
                            <span>MACD Line:</span>
                            <span className={`value ${indicators.macd.macd > 0 ? 'positive' : 'negative'}`}>
                                {indicators.macd.macd.toFixed(5)}
                            </span>
                        </div>
                        <div className='macd-row'>
                            <span>Signal Line:</span>
                            <span className='value'>{indicators.macd.signal.toFixed(5)}</span>
                        </div>
                        <div className='macd-row'>
                            <span>Histogram:</span>
                            <span className={`value ${indicators.macd.histogram > 0 ? 'positive' : 'negative'}`}>
                                {indicators.macd.histogram.toFixed(5)}
                            </span>
                        </div>
                    </div>
                    <div className='indicator-info'>
                        {indicators.macd.macd > indicators.macd.signal
                            ? '⬆️ MACD above signal - Bullish momentum'
                            : '⬇️ MACD below signal - Bearish momentum'}
                    </div>
                </div>

                {/* Bollinger Bands */}
                <div className='indicator-card'>
                    <div className='indicator-header'>
                        <span className='indicator-name'>Bollinger Bands (20,2)</span>
                        <span
                            className={`indicator-status ${
                                parseFloat(currentPrice) < indicators.bb.lower
                                    ? 'success'
                                    : parseFloat(currentPrice) > indicators.bb.upper
                                    ? 'danger'
                                    : 'neutral'
                            }`}
                        >
                            {parseFloat(currentPrice) < indicators.bb.lower
                                ? 'BELOW LOWER'
                                : parseFloat(currentPrice) > indicators.bb.upper
                                ? 'ABOVE UPPER'
                                : 'IN RANGE'}
                        </span>
                    </div>
                    <div className='bb-values'>
                        <div className='bb-row upper'>
                            <span>Upper Band:</span>
                            <span className='value'>{indicators.bb.upper.toFixed(pipSize)}</span>
                        </div>
                        <div className='bb-row middle'>
                            <span>Middle (SMA):</span>
                            <span className='value'>{indicators.bb.middle.toFixed(pipSize)}</span>
                        </div>
                        <div className='bb-row lower'>
                            <span>Lower Band:</span>
                            <span className='value'>{indicators.bb.lower.toFixed(pipSize)}</span>
                        </div>
                    </div>
                    <div className='indicator-info'>Current Price: {currentPrice}</div>
                </div>

                {/* Moving Averages */}
                <div className='indicator-card'>
                    <div className='indicator-header'>
                        <span className='indicator-name'>Moving Averages</span>
                        <span
                            className={`indicator-status ${
                                indicators.ema > indicators.sma
                                    ? 'success'
                                    : indicators.ema < indicators.sma
                                    ? 'danger'
                                    : 'neutral'
                            }`}
                        >
                            {indicators.ema > indicators.sma
                                ? 'BULLISH CROSS'
                                : indicators.ema < indicators.sma
                                ? 'BEARISH CROSS'
                                : 'NEUTRAL'}
                        </span>
                    </div>
                    <div className='macd-values'>
                        <div className='macd-row'>
                            <span>SMA (20):</span>
                            <span className='value'>{indicators.sma.toFixed(pipSize)}</span>
                        </div>
                        <div className='macd-row'>
                            <span>EMA (20):</span>
                            <span className='value'>{indicators.ema.toFixed(pipSize)}</span>
                        </div>
                        <div className='macd-row'>
                            <span>Current Price:</span>
                            <span
                                className={`value ${
                                    parseFloat(currentPrice) > indicators.sma ? 'positive' : 'negative'
                                }`}
                            >
                                {currentPrice}
                            </span>
                        </div>
                    </div>
                    <div className='indicator-comparison'>
                        {parseFloat(currentPrice) > indicators.sma
                            ? '⬆️ Price above SMA - Uptrend'
                            : '⬇️ Price below SMA - Downtrend'}
                    </div>
                </div>

                {/* Overall Signal Summary */}
                <div className='indicator-card signals-summary'>
                    <div className='indicator-header'>
                        <span className='indicator-name'>📊 Signals Summary</span>
                    </div>
                    <div className='signals-list'>
                        <div
                            className={`signal-item ${
                                indicators.rsi < 30 || indicators.rsi > 70 ? 'success' : 'neutral'
                            }`}
                        >
                            <span className='signal-icon'>
                                {indicators.rsi < 30 ? '🟢' : indicators.rsi > 70 ? '🔴' : '⚪'}
                            </span>
                            <span>
                                RSI:{' '}
                                {indicators.rsi < 30 ? 'Buy Signal' : indicators.rsi > 70 ? 'Sell Signal' : 'Neutral'}
                            </span>
                        </div>
                        <div className={`signal-item ${indicators.macd.histogram > 0 ? 'success' : 'danger'}`}>
                            <span className='signal-icon'>{indicators.macd.histogram > 0 ? '🟢' : '🔴'}</span>
                            <span>MACD: {indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'}</span>
                        </div>
                        <div
                            className={`signal-item ${
                                parseFloat(currentPrice) < indicators.bb.lower
                                    ? 'success'
                                    : parseFloat(currentPrice) > indicators.bb.upper
                                    ? 'danger'
                                    : 'neutral'
                            }`}
                        >
                            <span className='signal-icon'>
                                {parseFloat(currentPrice) < indicators.bb.lower
                                    ? '🟢'
                                    : parseFloat(currentPrice) > indicators.bb.upper
                                    ? '🔴'
                                    : '⚪'}
                            </span>
                            <span>
                                BB:{' '}
                                {parseFloat(currentPrice) < indicators.bb.lower
                                    ? 'Oversold'
                                    : parseFloat(currentPrice) > indicators.bb.upper
                                    ? 'Overbought'
                                    : 'Normal Range'}
                            </span>
                        </div>
                        <div
                            className={`signal-item ${
                                parseFloat(currentPrice) > indicators.sma ? 'success' : 'danger'
                            }`}
                        >
                            <span className='signal-icon'>
                                {parseFloat(currentPrice) > indicators.sma ? '🟢' : '🔴'}
                            </span>
                            <span>Trend: {parseFloat(currentPrice) > indicators.sma ? 'Uptrend' : 'Downtrend'}</span>
                        </div>
                    </div>
                    <div className='overall-sentiment'>
                        <span>Overall Market Sentiment:</span>
                        <span className={`sentiment-badge ${signalStrength.toLowerCase()}`}>
                            {signalStrength === 'BULLISH' && '🐂 BULLISH'}
                            {signalStrength === 'BEARISH' && '🐻 BEARISH'}
                            {signalStrength === 'NEUTRAL' && '⚖️ NEUTRAL'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default TechnicalIndicators;

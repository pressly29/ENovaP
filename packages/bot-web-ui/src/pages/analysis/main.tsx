import React, { useState } from 'react';
import ApolloAnalysisPage from './apollo_analysis/analysis';
import DerivMarketAnalyzer from './components/DerivMarketAnalyzer';
import QuantumSignalAnalyzer from './components/QuantumSignalAnalyzer';
import CirclesAnalyzer from './components/CirclesAnalyzer';
import TradingGuide from './components/TradingGuide';
import SignalsHub from './signals_hub';
import './style.css';

const AnalysisPage = () => {
    const [viewMode, setViewMode] = useState<'signals-hub' | 'market-analyzer' | 'quantum' | 'circles' | 'guide' | 'legacy'>('signals-hub');

    return (
        <div className='main_analysis'>
            {/* View Toggle Buttons */}
            <div className='analysis-view-toggle'>
                <button
                    className={`toggle-btn ${viewMode === 'signals-hub' ? 'active' : ''}`}
                    onClick={() => setViewMode('signals-hub')}
                >
                    🎯 Signals Hub
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'guide' ? 'active' : ''}`}
                    onClick={() => setViewMode('guide')}
                >
                    📚 Trading Guide
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'market-analyzer' ? 'active' : ''}`}
                    onClick={() => setViewMode('market-analyzer')}
                >
                    📊 Market Analyzer
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'quantum' ? 'active' : ''}`}
                    onClick={() => setViewMode('quantum')}
                >
                    ⚛️ Quantum Signals
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'circles' ? 'active' : ''}`}
                    onClick={() => setViewMode('circles')}
                >
                    🎯 Circles
                </button>
                <button
                    className={`toggle-btn ${viewMode === 'legacy' ? 'active' : ''}`}
                    onClick={() => setViewMode('legacy')}
                >
                    🔧 Advanced Tools
                </button>
            </div>

            {/* Conditional Rendering */}
            {(() => {
                if (viewMode === 'signals-hub') return <SignalsHub />;
                if (viewMode === 'guide') return <TradingGuide />;
                if (viewMode === 'market-analyzer') return <DerivMarketAnalyzer />;
                if (viewMode === 'quantum') return <QuantumSignalAnalyzer />;
                if (viewMode === 'circles') return <CirclesAnalyzer />;
                return <ApolloAnalysisPage />;
            })()}
        </div>
    );
};

export default AnalysisPage;

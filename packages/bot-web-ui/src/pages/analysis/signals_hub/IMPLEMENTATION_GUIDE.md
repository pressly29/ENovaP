# 📋 Signals Hub Implementation Guide

## 🎯 What We Just Created

You now have a properly organized **Signals Hub** folder following your project's structure:

```
packages/bot-web-ui/src/pages/analysis/
├── signals_hub/                    ⬅️ NEW FOLDER
│   ├── signals-hub.tsx             ⬅️ Main component
│   ├── signals-hub.css             ⬅️ Styling
│   ├── index.ts                    ⬅️ Export file
│   ├── README.md                   ⬅️ Documentation
│   ├── IMPLEMENTATION_GUIDE.md     ⬅️ This file
│   └── components/                 ⬅️ Future sub-components
│       └── (empty - will add in phases)
│
├── components/                     (Other existing components)
├── apollo_analysis/                (Existing folder)
└── main.tsx                        (Updated to use signals_hub)
```

---

## ✅ Current Status

### What's Working Now:
- ✅ Signals Hub tab appears in Analysis page
- ✅ Real-time Deriv API connection
- ✅ Symbol switching (all synthetic markets)
- ✅ Live price updates
- ✅ Even/Odd pattern analysis
- ✅ Console logging system
- ✅ Connection status indicator
- ✅ Responsive design

### Test It:
1. Navigate to the Analysis page in your app
2. Click the "🎯 Signals Hub" tab (first tab)
3. You should see:
   - Welcome screen with roadmap
   - Symbol selector (dropdown)
   - Market data cards (Symbol, Price, Last Digit, Ticks)
   - Overview and Patterns views
   - Console log at bottom

---

## 🚀 Next Implementation Steps

### Phase 1: Technical Indicators (Days 1-3)

#### Step 1: Install Dependencies
```powershell
cd packages\bot-web-ui
npm install --save @deriv/indicators
```

#### Step 2: Create Technical Indicators Component

Create: `signals_hub/components/TechnicalIndicators.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { RSI, MACD, BollingerBands, EMA, SMA } from '@deriv/indicators';

interface IndicatorProps {
    prices: number[];
    pipSize: number;
}

export const TechnicalIndicators: React.FC<IndicatorProps> = ({ prices, pipSize }) => {
    const [indicators, setIndicators] = useState<any>(null);

    useEffect(() => {
        if (prices.length >= 26) {
            // Calculate indicators
            const rsiCalc = new RSI({ periods: 14 });
            const macdCalc = new MACD({ fast_period: 12, slow_period: 26, signal_period: 9 });
            const bbCalc = new BollingerBands({ periods: 20, stdDev: 2 });
            const emaCalc = new EMA({ periods: 14 });
            const smaCalc = new SMA({ periods: 14 });

            const rsi = rsiCalc.calculate(prices);
            const macd = macdCalc.calculate(prices);
            const bb = bbCalc.calculate(prices);
            const ema = emaCalc.calculate(prices);
            const sma = smaCalc.calculate(prices);

            setIndicators({
                rsi: rsi[rsi.length - 1],
                macd: macd[macd.length - 1],
                bb: bb[bb.length - 1],
                ema: ema[ema.length - 1],
                sma: sma[sma.length - 1],
            });
        }
    }, [prices]);

    if (!indicators) {
        return <div>Loading indicators... (need at least 26 ticks)</div>;
    }

    return (
        <div className="technical-indicators">
            <div className="indicator-card">
                <h4>RSI (14)</h4>
                <div className="indicator-value">{indicators.rsi?.toFixed(2)}</div>
                <div className={`indicator-status ${
                    indicators.rsi < 30 ? 'oversold' : 
                    indicators.rsi > 70 ? 'overbought' : 'neutral'
                }`}>
                    {indicators.rsi < 30 ? '🔥 OVERSOLD' : 
                     indicators.rsi > 70 ? '❄️ OVERBOUGHT' : '➖ NEUTRAL'}
                </div>
            </div>

            <div className="indicator-card">
                <h4>MACD</h4>
                <div className="indicator-value">{indicators.macd?.macd.toFixed(4)}</div>
                <div className="indicator-status">
                    {indicators.macd?.macd > indicators.macd?.signal ? 
                        '📈 BULLISH' : '📉 BEARISH'}
                </div>
            </div>

            {/* Add more indicators */}
        </div>
    );
};
```

#### Step 3: Integrate into signals-hub.tsx

In `signals-hub.tsx`, add:

```tsx
// Import the component
import { TechnicalIndicators } from './components/TechnicalIndicators';

// In the render, update the indicators view:
{selectedView === 'indicators' && (
    <div className="indicators-section">
        <h2>📈 Technical Indicators</h2>
        <TechnicalIndicators prices={allTicksList} pipSize={pip_size} />
    </div>
)}

// Remove the 'disabled' prop from the Indicators button
<button
    className={`view-btn ${selectedView === 'indicators' ? 'active' : ''}`}
    onClick={() => setSelectedView('indicators')}
>
    📈 Indicators
</button>
```

---

### Phase 2: Notifications (Days 4-6)

#### Step 1: Create Notification Service

Create: `signals_hub/components/NotificationService.tsx`

```tsx
export class NotificationService {
    private permission: NotificationPermission = 'default';

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    show(title: string, body: string): void {
        if (this.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/icons/signal-icon.png',
            });
            
            // Play sound
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(() => console.log('Sound blocked'));
        }
    }

    showSignalAlert(signal: string, confidence: number, symbol: string): void {
        this.show(
            `🔔 New ${signal} Signal!`,
            `${symbol}: ${confidence}% confidence - Check now!`
        );
    }
}
```

---

### Phase 3: Signal History (Days 7-10)

#### Step 1: Create Signals Store

Create: `packages/bot-web-ui/src/stores/signals-store.ts`

```tsx
import { action, makeObservable, observable } from 'mobx';

export interface StoredSignal {
    id: string;
    timestamp: Date;
    symbol: string;
    signal: 'BUY' | 'SELL' | 'NEUTRAL';
    confidence: number;
    price: number;
}

export default class SignalsStore {
    @observable signals: StoredSignal[] = [];

    constructor() {
        makeObservable(this);
        this.loadFromLocalStorage();
    }

    @action.bound
    addSignal(signal: Omit<StoredSignal, 'id' | 'timestamp'>): void {
        const newSignal: StoredSignal = {
            ...signal,
            id: `signal-${Date.now()}`,
            timestamp: new Date(),
        };
        this.signals.unshift(newSignal);
        if (this.signals.length > 100) {
            this.signals = this.signals.slice(0, 100);
        }
        this.saveToLocalStorage();
    }

    private saveToLocalStorage(): void {
        localStorage.setItem('signals_history', JSON.stringify(this.signals));
    }

    private loadFromLocalStorage(): void {
        const stored = localStorage.getItem('signals_history');
        if (stored) this.signals = JSON.parse(stored);
    }
}
```

---

## 📂 Component Organization Plan

As you implement each phase, create components in the `components/` subfolder:

```
signals_hub/components/
├── TechnicalIndicators.tsx      (Phase 1)
├── IndicatorCard.tsx            (Phase 1 - reusable card)
├── SignalGenerator.tsx          (Phase 1 - signal logic)
├── NotificationService.tsx      (Phase 2)
├── NotificationPanel.tsx        (Phase 2 - settings UI)
├── SignalHistory.tsx            (Phase 3)
├── HistoryTable.tsx             (Phase 3)
├── ExportButton.tsx             (Phase 3)
└── PatternAnalysis.tsx          (Extract from main file)
```

---

## 🎨 Styling Guidelines

All styles should go in `signals-hub.css`. Follow the existing pattern:

```css
/* Component-specific styles */
.technical-indicators {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.indicator-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    /* ... */
}
```

---

## ✅ Testing Checklist

### After Each Phase:

**Phase 1 - Technical Indicators:**
- [ ] RSI calculates correctly (0-100 range)
- [ ] MACD shows bullish/bearish signals
- [ ] Bollinger Bands display properly
- [ ] Indicators update in real-time
- [ ] UI shows oversold/overbought states

**Phase 2 - Notifications:**
- [ ] Permission request works
- [ ] Notifications appear on strong signals
- [ ] Sound plays (if enabled)
- [ ] User can toggle notifications on/off
- [ ] Works in different browsers

**Phase 3 - Signal History:**
- [ ] Signals save to localStorage
- [ ] History displays correctly
- [ ] Export to CSV works
- [ ] Filter by symbol works
- [ ] Limited to 100 most recent signals

---

## 🔧 Development Workflow

1. **Create new component** in `components/` folder
2. **Import in signals-hub.tsx**
3. **Add styles** to `signals-hub.css`
4. **Test functionality**
5. **Update README.md** with new features
6. **Commit changes**

---

## 📚 Documentation to Reference

- `WHERE_TO_START.md` - Complete implementation guide with code
- `CODEBASE_GAP_ANALYSIS.md` - Feature analysis
- `QUICK_START_CHECKLIST.md` - Step-by-step tasks
- `signals_hub/README.md` - This folder's overview

---

## 🎯 Current Focus: Phase 1 - Technical Indicators

**Next immediate steps:**
1. Install `@deriv/indicators` package
2. Create `TechnicalIndicators.tsx` component
3. Test indicator calculations with live data
4. Add indicator display UI
5. Enable the Indicators tab

**Start here:** See `WHERE_TO_START.md` Phase 1 for detailed code! 🚀

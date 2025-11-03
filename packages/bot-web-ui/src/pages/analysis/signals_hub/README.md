# 🎯 Signals Hub

## Overview
The Signals Hub is a centralized platform for real-time trading signals and market analysis. It combines pattern analysis, technical indicators, and intelligent signal generation to help traders make informed decisions.

## Structure

```
signals_hub/
├── signals-hub.tsx          # Main component
├── signals-hub.css          # Styling
├── index.ts                 # Export file
├── README.md                # This file
└── components/              # Sub-components (to be added)
    ├── TechnicalIndicators.tsx    (Phase 1)
    ├── SignalHistory.tsx          (Phase 3)
    └── NotificationPanel.tsx      (Phase 2)
```

## Features

### ✅ Current (Phase 0)
- Real-time market data streaming via Deriv API
- Symbol switching (all synthetic markets)
- Even/Odd pattern analysis
- Console logging system
- Connection status monitoring
- Responsive design (mobile/desktop)

### ⏳ Coming Soon

#### Phase 1: Technical Indicators (Days 1-3)
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- EMA (Exponential Moving Average)
- SMA (Simple Moving Average)
- Intelligent signal generation based on indicators

#### Phase 2: Notifications (Days 4-6)
- Browser push notifications
- Sound alerts
- Customizable notification triggers
- Alert settings panel

#### Phase 3: Signal History (Days 7-10)
- Signal history tracking (last 100 signals)
- Export to CSV
- Performance analytics
- Filter by symbol/strength/confidence

## Implementation Roadmap

| Phase | Duration | Features | Status |
|-------|----------|----------|--------|
| Phase 0 | Complete | Hub setup, real-time data | ✅ Done |
| Phase 1 | Days 1-3 | Technical indicators | ⏳ Pending |
| Phase 2 | Days 4-6 | Notifications | ⏳ Pending |
| Phase 3 | Days 7-10 | Signal history | ⏳ Pending |

## Usage

```tsx
import SignalsHub from './signals_hub';

// In parent component
<SignalsHub />
```

## API Integration

Uses `@deriv/bot-skeleton` API for:
- WebSocket connections
- Real-time tick streaming
- Active symbols fetching
- Market data subscriptions

## State Management

Local state (useState) for:
- Market data (ticks, prices, symbols)
- Pattern analysis (even/odd counts)
- UI state (selected view, console messages)
- Connection status

Future: Will integrate with MobX store for:
- Signal history persistence
- Notification preferences
- User settings

## Views

1. **Overview** - Welcome screen with roadmap and stats
2. **Patterns** - Pattern analysis (Even/Odd, Rise/Fall, etc.)
3. **Indicators** - Technical indicators (Phase 1)
4. **History** - Signal history and analytics (Phase 3)

## Dependencies

- `@deriv/stores` - MobX store access
- `@deriv/bot-skeleton` - API integration
- `@deriv/indicators` - Technical indicators (Phase 1)

## Next Steps

1. Install `@deriv/indicators` package
2. Create `components/TechnicalIndicators.tsx`
3. Implement indicator calculations
4. Add indicator display UI
5. Create notification service
6. Build signal history store

## Documentation

See root documentation:
- `WHERE_TO_START.md` - Implementation guide
- `CODEBASE_GAP_ANALYSIS.md` - Feature analysis
- `QUICK_START_CHECKLIST.md` - Step-by-step checklist

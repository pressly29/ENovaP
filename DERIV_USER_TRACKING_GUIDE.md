# 🔍 How Deriv Tracks User Engagement with Your Integration

## Executive Summary

**Yes!** Deriv provides **multiple ways** to track users who engage with your integration, and you can access this data **directly** from Deriv's systems without building custom analytics.

---

## 📊 3 Main Ways Deriv Tracks Your Integration's Users

### **1. Deriv API Dashboard (Official Platform)**

#### **What You Get:**

-   ✅ **Total number of users** using your app
-   ✅ **Active users** (daily/weekly/monthly)
-   ✅ **API call statistics** (volume, frequency)
-   ✅ **Token usage metrics** (per scope: Read, Trade, Payments, etc.)
-   ✅ **Error rates and API health**

#### **How to Access:**

1. Login to **https://api.deriv.com/**
2. Navigate to **Dashboard**
3. Select your registered application (App ID: 63233)
4. View **"Statistics"** tab

#### **Metrics Available:**

```javascript
{
  app_id: "63233",
  app_name: "DBTraders Bot",
  total_users: 1250,           // Total users who authorized your app
  active_users_30d: 450,       // Active in last 30 days
  active_users_7d: 180,        // Active in last 7 days
  active_users_today: 45,      // Active today

  // API Usage
  total_api_calls: 125000,     // Total API requests
  api_calls_today: 2500,       // Requests today
  api_calls_by_method: {       // Breakdown by API method
    "authorize": 12500,
    "buy": 8900,
    "proposal": 45000,
    "ticks": 35000,
    // ... etc
  },

  // Error tracking
  error_rate: 0.02,            // 2% error rate
  errors_by_type: {
    "InvalidToken": 45,
    "InsufficientBalance": 120,
    // ... etc
  }
}
```

---

### **2. Affiliate Dashboard (For Revenue Tracking)**

If you join the **Deriv Affiliate Program**, you get a dedicated dashboard to track:

#### **What You Get:**

-   ✅ **Referred users count** (lifetime)
-   ✅ **Active traders** (users actively trading)
-   ✅ **Trading volume** (per user, total)
-   ✅ **Commission earned** (breakdown by user)
-   ✅ **Conversion rates** (signups → active traders)
-   ✅ **User retention** (30/60/90 day)
-   ✅ **Geographic distribution**

#### **How to Access:**

1. Apply at **https://deriv.com/partners**
2. Get approved (1-3 days)
3. Login to **Affiliate Portal**
4. View **Analytics & Reports**

#### **Dashboard Features:**

```javascript
// Sample Affiliate Dashboard Data
{
  total_referrals: 850,          // Users who signed up via your link
  active_traders: 320,           // Currently active
  total_volume_usd: 1250000,     // Total trading volume

  // Commission breakdown
  commission_earned: {
    today: 125.50,
    week: 980.25,
    month: 4250.75,
    lifetime: 28500.00
  },

  // User performance
  top_traders: [
    { user_id: "CR123***", volume: 50000, commission: 500 },
    { user_id: "CR456***", volume: 45000, commission: 450 },
    // ... (anonymized for privacy)
  ],

  // Conversion funnel
  funnel: {
    clicks: 5000,              // Link clicks
    signups: 850,              // Registrations (17% conversion)
    first_deposit: 450,        // Made deposit (53% of signups)
    active_traders: 320        // Active traders (71% of depositors)
  },

  // Geography
  by_country: {
    "Nigeria": 250,
    "South Africa": 180,
    "Kenya": 120,
    // ... etc
  }
}
```

---

### **3. Deriv API - Programmatic Access**

You can **query user data programmatically** using Deriv's WebSocket API:

#### **Available API Calls for Analytics:**

##### **a) `profit_table` - Track Your Commissions**

```javascript
// Request
{
  "profit_table": 1,
  "description": 1,
  "limit": 100,
  "offset": 0,
  "date_from": "2025-01-01",
  "date_to": "2025-12-31"
}

// Response
{
  "profit_table": {
    "count": 1250,
    "transactions": [
      {
        "app_id": 63233,           // Your app!
        "buy_price": 10,
        "sell_price": 17.20,
        "payout": 17.20,
        "contract_id": 12345678,
        "purchase_time": 1733270400,
        "sell_time": 1733270500,
        "contract_type": "CALL",
        "profit": 7.20,

        // Your markup commission
        "markup_percentage": 2.5,  // If you set 2.5% markup
        "markup_amount": 0.43      // Your earnings from this trade
      },
      // ... more trades
    ]
  }
}
```

##### **b) `statement` - Detailed Transaction History**

```javascript
// Request
{
  "statement": 1,
  "description": 1,
  "limit": 100,
  "date_from": "2025-01-01"
}

// Response shows all user transactions including:
- Deposits
- Withdrawals
- Trades (with your app_id)
- Commissions earned
```

##### **c) `authorize` - User Authentication Data**

```javascript
// When user logs in through your app
{
  "authorize": "user_token_here"
}

// Response includes:
{
  "authorize": {
    "loginid": "CR1234567",
    "balance": 1000.50,
    "currency": "USD",
    "email": "user@example.com",
    "country": "NG",
    "is_virtual": 0,

    // Your app tracking
    "account_list": [
      {
        "loginid": "CR1234567",
        "linked_to": [
          {
            "loginid": "VRTC1234",
            "platform": "dtrade"
          }
        ]
      }
    ]
  }
}
```

##### **d) Custom Tracking via `@deriv-com/analytics`**

Your codebase **already uses** `@deriv-com/analytics` package:

```typescript
// From your packages/core/src/App/AppContent.tsx
import { Analytics } from '@deriv-com/analytics';

// This sends events to Deriv's analytics backend
Analytics.trackEvent('ce_reports_form', {
    action: 'choose_report_type',
    form_name: 'default',
    subform_name: 'trade_table_form',
    start_date_filter: '01/01/2025',
    end_date_filter: '31/12/2025',
});

// Deriv can see these events tagged with YOUR app_id
```

**What Deriv Tracks from `@deriv-com/analytics`:**

-   ✅ **Event name** (e.g., `ce_reports_form`, `ce_virtual_signup_form`)
-   ✅ **Event properties** (action, form_name, etc.)
-   ✅ **User ID** (loginid)
-   ✅ **App ID** (63233 - your integration)
-   ✅ **Timestamp**
-   ✅ **Session ID**
-   ✅ **Device type** (mobile/desktop)
-   ✅ **User location**

---

## 🎯 How to Access Analytics from Deriv

### **Method 1: API Dashboard (Easiest)**

**Steps:**

1. Go to https://api.deriv.com/
2. Login with your Deriv account
3. Click **"Manage Applications"**
4. Select your app (DBTraders Bot - App ID 63233)
5. Click **"View Statistics"**

**What You'll See:**

-   Total authorized users
-   Active users (daily/weekly/monthly)
-   API call volume
-   Error rates
-   Geographic distribution

---

### **Method 2: Affiliate Portal (For Revenue)**

**Steps:**

1. Apply at https://deriv.com/partners/affiliate-ib/
2. Wait for approval (1-3 business days)
3. Add your affiliate token to your integration:

```javascript
// In netlify/functions/enova-auth.js (already implemented!)
const affiliateToken = process.env.REACT_APP_AFFILIATE_TOKEN;
const utmCampaign = process.env.REACT_APP_AFFILIATE_CAMPAIGN;

const buildLoginUrl = () => {
    return `https://oauth.deriv.com/oauth2/authorize?app_id=${appId}&affiliate_token=${affiliateToken}&utm_campaign=${utmCampaign}`;
};
```

4. Login to Affiliate Portal
5. View real-time analytics

---

### **Method 3: Build Your Own Dashboard (API)**

Use your existing **CommissionDashboard** component (already built!):

```typescript
// From packages/partner-core/src/components/CommissionDashboard.tsx
// This already exists in your codebase!

const CommissionDashboard: React.FC = () => {
    const [stats, setStats] = useState<CommissionStats>({
        totalCommission: 0,
        totalTrades: 0,
        totalStake: 0,
        totalPayout: 0,
        averageCommission: 0,
        winRate: 0,
        todayCommission: 0,
        weekCommission: 0,
        monthCommission: 0,
    });

    // Fetch from Deriv API
    const loadStats = async () => {
        const response = await WS.profitTable(100, 0, dateBoundaries);
        // Process and display
    };

    // ... renders beautiful dashboard
};
```

**This connects to Deriv's `profit_table` API and shows:**

-   Total earnings
-   Total trades
-   Win rate
-   Average commission
-   Period breakdowns (today/week/month)

---

## 📍 Where Deriv Stores Your Integration's Analytics

### **Deriv's Backend Systems:**

```
Deriv Analytics Infrastructure:
├── RudderStack (Event Tracking)
│   ├── Collects: @deriv-com/analytics events
│   ├── Stores: User sessions, actions, conversions
│   └── Tags each event with: app_id, user_id, timestamp
│
├── Internal Analytics DB
│   ├── Stores: API call logs
│   ├── Tracks: User authorizations per app
│   └── Metrics: Error rates, performance
│
├── Affiliate Platform
│   ├── Tracks: Referred users (via affiliate_token)
│   ├── Calculates: Commission per user
│   └── Reports: Real-time revenue dashboard
│
└── Profit/Statement Tables
    ├── Every trade stores: app_id
    ├── Markup tracked: Per transaction
    └── Queryable via: profit_table & statement APIs
```

---

## 🔐 What Data You Can Access vs. Cannot

### **✅ YOU CAN ACCESS:**

1. **Via API Dashboard:**

    - Total users authorized
    - Active users count
    - API usage statistics
    - Error rates

2. **Via Affiliate Portal:**

    - Referred users count
    - Active traders
    - Trading volume
    - Commission earnings
    - Conversion funnels

3. **Via API (`profit_table`):**

    - Your commission per trade
    - Total trades through your app
    - Win/loss statistics
    - Volume metrics

4. **Via Your Own Tracking:**
    - Events you send via `@deriv-com/analytics`
    - Custom metrics you track locally
    - Session data from your Netlify analytics

### **❌ YOU CANNOT ACCESS:**

1. **Personal User Data:**

    - Full names (unless provided to you)
    - Email addresses (unless shared)
    - Phone numbers
    - Addresses

2. **Other Apps' Data:**

    - Can't see other integrations' metrics
    - Can't see users using other apps

3. **Deriv's Internal Metrics:**
    - Company-wide statistics
    - Platform-level analytics
    - Other affiliates' performance

---

## 💡 Practical Implementation Guide

### **Step 1: Set Up API Dashboard Access**

```bash
# Already done! You have App ID: 63233
# Just login to https://api.deriv.com/
# Navigate to: Manage Applications → DBTraders Bot → Statistics
```

### **Step 2: Apply for Affiliate Program**

```bash
# 1. Visit https://deriv.com/partners/affiliate-ib/
# 2. Fill application form
# 3. Wait for approval (1-3 days)
# 4. Get your affiliate token
```

### **Step 3: Add Affiliate Token to Your App**

```bash
# In Netlify environment variables:
REACT_APP_AFFILIATE_TOKEN=your_affiliate_token_here
REACT_APP_AFFILIATE_CAMPAIGN=dbtraders_bot
REACT_APP_AFFILIATE_MEDIUM=web_app
REACT_APP_AFFILIATE_SOURCE=dbtraders
```

Already implemented in `netlify/functions/enova-auth.js`:

```javascript
const affiliateToken = process.env.REACT_APP_AFFILIATE_TOKEN || '';
const utmCampaign = process.env.REACT_APP_AFFILIATE_CAMPAIGN || '';
const utmMedium = process.env.REACT_APP_AFFILIATE_MEDIUM || '';
const utmSource = process.env.REACT_APP_AFFILIATE_SOURCE || '';

if (affiliateToken) {
    params.set('affiliate_token', affiliateToken);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmSource) params.set('utm_source', utmSource);
}
```

### **Step 4: Use Your Commission Dashboard**

```typescript
// Already built! Just route to it:
// packages/partner-core/src/components/CommissionDashboard.tsx

// Add to your routing:
import CommissionDashboard from '../partner-core/components/CommissionDashboard';

<Route path='/analytics/commission' component={CommissionDashboard} />;
```

### **Step 5: Query Deriv API for Custom Analytics**

```javascript
// Example: Get your earnings this month
const getMonthlyEarnings = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const response = await WS.profitTable(
        1000, // limit
        0, // offset
        {
            date_from: Math.floor(startOfMonth.getTime() / 1000),
            date_to: Math.floor(Date.now() / 1000),
        }
    );

    let totalCommission = 0;
    response.profit_table.transactions.forEach(trade => {
        if (trade.app_id === 63233) {
            // Your app!
            totalCommission += trade.markup_amount || 0;
        }
    });

    return totalCommission;
};
```

---

## 📊 Sample Analytics You Can Track

### **1. User Acquisition Metrics**

```javascript
// Via Affiliate Dashboard or API
{
  new_users_today: 15,
  new_users_week: 95,
  new_users_month: 380,

  // Conversion funnel
  signup_clicks: 2500,
  completed_signups: 380,    // 15.2% conversion
  first_deposit: 180,        // 47.4% of signups
  first_trade: 150,          // 83.3% of depositors

  // Traffic sources
  by_source: {
    "organic": 120,
    "social_media": 180,
    "paid_ads": 80
  }
}
```

### **2. User Engagement Metrics**

```javascript
// Via @deriv-com/analytics events
{
  active_users: {
    daily: 45,
    weekly: 180,
    monthly: 450
  },

  sessions_per_user: 3.2,
  avg_session_duration: "12m 30s",

  // Feature usage
  features_used: {
    "bot_trading": 320,
    "manual_trading": 180,
    "analysis_tools": 250,
    "reports": 150
  },

  // Retention
  retention: {
    day_1: 0.85,   // 85% come back next day
    day_7: 0.62,   // 62% still active after week
    day_30: 0.41   // 41% still active after month
  }
}
```

### **3. Revenue Metrics**

```javascript
// Via profit_table API + affiliate dashboard
{
  total_revenue: 28500.00,

  // Breakdown
  revenue_by_source: {
    markup_commission: 12500.00,  // 2.5% on payouts
    affiliate_commission: 16000.00 // 45% on client trades
  },

  // Per user
  average_revenue_per_user: 63.33,
  lifetime_value_per_user: 89.47,

  // Trends
  revenue_trend: {
    today: 125.50,
    yesterday: 118.75,
    growth: +5.7%
  }
}
```

### **4. Trading Performance**

```javascript
// Via profit_table API
{
  total_trades: 12500,
  winning_trades: 6800,
  losing_trades: 5700,
  win_rate: 54.4%,

  // Volume
  total_stake: 125000,
  total_payout: 218750,
  avg_stake: 10.00,
  avg_payout: 17.50,

  // By contract type
  by_contract: {
    "CALL/PUT": 7500,
    "DIGITODD/EVEN": 3200,
    "OVER/UNDER": 1800
  }
}
```

---

## 🚀 Quick Start Checklist

### **To See User Analytics RIGHT NOW:**

-   [ ] **Login to https://api.deriv.com/**
-   [ ] **Go to "Manage Applications"**
-   [ ] **Select "DBTraders Bot" (App ID: 63233)**
-   [ ] **Click "View Statistics"**
-   [ ] **See your user count and API usage!**

### **To Get More Detailed Analytics:**

-   [ ] **Apply for Affiliate Program** (https://deriv.com/partners)
-   [ ] **Get approval** (1-3 days)
-   [ ] **Add affiliate token** to Netlify env vars
-   [ ] **Redeploy your app**
-   [ ] **Login to Affiliate Portal**
-   [ ] **View comprehensive analytics!**

### **To Build Custom Dashboard:**

-   [ ] **Use your existing CommissionDashboard component**
-   [ ] **Query `profit_table` API** for earnings
-   [ ] **Query `statement` API** for transactions
-   [ ] **Add custom charts/graphs**
-   [ ] **Export data as CSV**

---

## 📈 Expected Data Flow

```
User Journey → What Deriv Tracks
═══════════════════════════════════════════════════════

1. User clicks login on your site
   ↓
   @deriv-com/analytics tracks: "auth_redirect"
   Event data: { type: 'login', app_id: 63233 }

2. User redirects to OAuth (via enova-auth.js)
   ↓
   Deriv records: Authorization attempt
   With: app_id, affiliate_token, utm_campaign

3. User authorizes your app
   ↓
   Deriv creates: User-App link
   Dashboard shows: +1 authorized user

4. User returns to your site
   ↓
   @deriv-com/analytics tracks: Various events
   All tagged with: app_id 63233

5. User makes a trade
   ↓
   Deriv records in profit_table:
   {
     app_id: 63233,
     contract_id: 12345,
     stake: 10,
     payout: 17.20,
     markup_percentage: 2.5,
     markup_amount: 0.43  ← YOUR EARNINGS
   }

6. You query analytics
   ↓
   API Dashboard: Shows user count, API calls
   Affiliate Portal: Shows revenue, conversions
   profit_table API: Shows commission breakdown
```

---

## 🎯 Summary

### **YES - You Can Track Users via Deriv!**

**3 Official Ways:**

1. **API Dashboard** (https://api.deriv.com/)

    - Total users
    - Active users
    - API statistics

2. **Affiliate Portal** (Apply at https://deriv.com/partners)

    - Revenue tracking
    - Conversion funnels
    - User performance

3. **Deriv WebSocket API**
    - `profit_table` - Your commissions
    - `statement` - Transaction history
    - Custom queries for analytics

**Plus Your Own Analytics:**

-   Netlify Functions (track-event.js)
-   Dashboard.tsx (clients-analysis)
-   @deriv-com/analytics events

### **Action Items:**

1. ✅ **Login to https://api.deriv.com/ NOW** to see current users
2. ✅ **Apply for Affiliate Program** to get revenue analytics
3. ✅ **Use your CommissionDashboard component** (already built!)
4. ✅ **Keep your Netlify analytics** for pre-auth tracking

You have **TWO parallel systems**:

-   **Deriv's analytics** → Post-authentication user tracking
-   **Your analytics** → Pre-authentication and custom events

**Both are valuable and should be used together!** 🚀

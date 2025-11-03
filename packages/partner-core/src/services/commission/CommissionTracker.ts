/**
 * Commission Tracker Service
 * Tracks markup commissions and affiliate earnings
 */

export interface Trade {
  id: string;
  accountId: string;
  contractId: number;
  symbol: string;
  stake: number;
  payout: number;
  markup: number;
  commission: number;
  timestamp: Date;
  status: 'won' | 'lost';
}

export interface CommissionStats {
  totalCommission: number;
  totalTrades: number;
  totalStake: number;
  totalPayout: number;
  averageCommission: number;
  winRate: number;
  todayCommission: number;
  weekCommission: number;
  monthCommission: number;
}

export class CommissionTracker {
  private static MARKUP_PERCENTAGE = parseFloat(process.env.REACT_APP_MARKUP_PERCENTAGE || '2.5');
  
  /**
   * Calculate commission for a single trade
   */
  static calculateCommission(payout: number, markupPercentage?: number): number {
    const markup = markupPercentage || this.MARKUP_PERCENTAGE;
    return (payout * markup) / 100;
  }

  /**
   * Calculate adjusted payout after markup
   */
  static calculateAdjustedPayout(originalPayout: number, markupPercentage?: number): number {
    const commission = this.calculateCommission(originalPayout, markupPercentage);
    return originalPayout - commission;
  }

  /**
   * Track a new trade
   */
  static trackTrade(trade: Omit<Trade, 'commission' | 'markup'>): Trade {
    const markup = this.MARKUP_PERCENTAGE;
    const commission = this.calculateCommission(trade.payout);

    const completeTrade: Trade = {
      ...trade,
      markup,
      commission,
    };

    // Save to localStorage
    this.saveTrade(completeTrade);

    // Log for analytics
    console.log('[Commission] Trade tracked:', {
      tradeId: trade.id,
      stake: trade.stake,
      payout: trade.payout,
      commission,
      markupPercentage: markup,
    });

    return completeTrade;
  }

  /**
   * Save trade to localStorage
   */
  private static saveTrade(trade: Trade): void {
    const trades = this.getTrades();
    trades.push(trade);
    localStorage.setItem('enova_trades', JSON.stringify(trades));
  }

  /**
   * Get all trades from localStorage
   */
  static getTrades(): Trade[] {
    const saved = localStorage.getItem('enova_trades');
    if (!saved) return [];

    const trades = JSON.parse(saved);
    // Convert timestamp strings back to Date objects
    return trades.map((trade: any) => ({
      ...trade,
      timestamp: new Date(trade.timestamp),
    }));
  }

  /**
   * Get trades for a specific time period
   */
  static getTradesByPeriod(startDate: Date, endDate: Date): Trade[] {
    const allTrades = this.getTrades();
    return allTrades.filter(
      (trade) => trade.timestamp >= startDate && trade.timestamp <= endDate
    );
  }

  /**
   * Get today's trades
   */
  static getTodayTrades(): Trade[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getTradesByPeriod(today, tomorrow);
  }

  /**
   * Get this week's trades
   */
  static getWeekTrades(): Trade[] {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.getTradesByPeriod(weekAgo, today);
  }

  /**
   * Get this month's trades
   */
  static getMonthTrades(): Trade[] {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return this.getTradesByPeriod(monthAgo, today);
  }

  /**
   * Calculate commission statistics
   */
  static getCommissionStats(): CommissionStats {
    const allTrades = this.getTrades();
    const todayTrades = this.getTodayTrades();
    const weekTrades = this.getWeekTrades();
    const monthTrades = this.getMonthTrades();

    const wonTrades = allTrades.filter((t) => t.status === 'won');

    return {
      totalCommission: allTrades.reduce((sum, t) => sum + t.commission, 0),
      totalTrades: allTrades.length,
      totalStake: allTrades.reduce((sum, t) => sum + t.stake, 0),
      totalPayout: allTrades.reduce((sum, t) => sum + t.payout, 0),
      averageCommission: allTrades.length > 0 
        ? allTrades.reduce((sum, t) => sum + t.commission, 0) / allTrades.length 
        : 0,
      winRate: allTrades.length > 0 ? (wonTrades.length / allTrades.length) * 100 : 0,
      todayCommission: todayTrades.reduce((sum, t) => sum + t.commission, 0),
      weekCommission: weekTrades.reduce((sum, t) => sum + t.commission, 0),
      monthCommission: monthTrades.reduce((sum, t) => sum + t.commission, 0),
    };
  }

  /**
   * Get markup percentage
   */
  static getMarkupPercentage(): number {
    return this.MARKUP_PERCENTAGE;
  }

  /**
   * Export trades to CSV
   */
  static exportToCSV(): string {
    const trades = this.getTrades();
    const headers = ['ID', 'Account', 'Symbol', 'Stake', 'Payout', 'Markup%', 'Commission', 'Status', 'Timestamp'];
    const rows = trades.map((trade) => [
      trade.id,
      trade.accountId,
      trade.symbol,
      trade.stake.toFixed(2),
      trade.payout.toFixed(2),
      trade.markup.toFixed(2),
      trade.commission.toFixed(2),
      trade.status,
      trade.timestamp.toISOString(),
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');
  }

  /**
   * Clear all trades (use with caution!)
   */
  static clearTrades(): void {
    localStorage.removeItem('enova_trades');
    console.log('[Commission] All trades cleared');
  }

  /**
   * Get commission projection
   */
  static projectMonthlyCommission(dailyTradesPerUser: number, averageStake: number, activeUsers: number): number {
    const averagePayout = averageStake * 1.8; // Typical payout multiplier
    const commissionPerTrade = this.calculateCommission(averagePayout);
    const monthlyTrades = dailyTradesPerUser * 30 * activeUsers;
    return monthlyTrades * commissionPerTrade;
  }
}

export default CommissionTracker;

/**
 * Commission Dashboard Component
 * Displays real-time commission earnings and statistics
 */

import React, { useEffect, useState } from 'react';
import { CommissionTracker, CommissionStats } from '../services/commission/CommissionTracker';

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
  const [markupPercentage] = useState(CommissionTracker.getMarkupPercentage());

  useEffect(() => {
    // Load stats on mount
    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    const newStats = CommissionTracker.getCommissionStats();
    setStats(newStats);
  };

  const handleExportCSV = () => {
    const csv = CommissionTracker.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enova-commissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="commission-dashboard">
      <div className="dashboard-header">
        <h2>💰 Commission Dashboard</h2>
        <div className="markup-badge">Markup: {markupPercentage}%</div>
      </div>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <div className="stat-label">Total Earnings</div>
            <div className="stat-value">{formatCurrency(stats.totalCommission)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Trades</div>
            <div className="stat-value">{stats.totalTrades}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{stats.winRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-content">
            <div className="stat-label">Avg Commission</div>
            <div className="stat-value">{formatCurrency(stats.averageCommission)}</div>
          </div>
        </div>
      </div>

      {/* Period Stats */}
      <div className="period-stats">
        <div className="period-card">
          <div className="period-label">Today</div>
          <div className="period-value">{formatCurrency(stats.todayCommission)}</div>
        </div>
        <div className="period-card">
          <div className="period-label">This Week</div>
          <div className="period-value">{formatCurrency(stats.weekCommission)}</div>
        </div>
        <div className="period-card">
          <div className="period-label">This Month</div>
          <div className="period-value">{formatCurrency(stats.monthCommission)}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="dashboard-actions">
        <button className="btn-primary" onClick={handleExportCSV}>
          📥 Export CSV
        </button>
        <button className="btn-secondary" onClick={loadStats}>
          🔄 Refresh
        </button>
      </div>

      <style jsx>{`
        .commission-dashboard {
          padding: 24px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .dashboard-header h2 {
          margin: 0;
          color: #333;
          font-size: 28px;
        }

        .markup-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-card.highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-icon {
          font-size: 40px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        .period-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .period-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .period-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .period-value {
          font-size: 20px;
          font-weight: 700;
          color: #667eea;
        }

        .dashboard-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          background: #f8f9ff;
        }
      `}</style>
    </div>
  );
};

export default CommissionDashboard;

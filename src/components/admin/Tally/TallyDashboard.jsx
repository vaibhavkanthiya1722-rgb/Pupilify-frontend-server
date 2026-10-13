// src/components/admin/Tally/TallyDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import TallyService from '../../../services/TallyService';
import { useTranslation } from "react-i18next";

const TallyDashboard = ({ schoolId, academicYearId, token, onToast, academicYear }) => {
  const { t } = useTranslation(); 
  const [summary, setSummary] = useState({
    totalFeesCollected: 0,
    totalExpenses: 0,
    netProfit: 0,
    year: academicYear
  });
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TallyService.getTallySummary(schoolId, academicYearId, token);
      setSummary(data);
    } catch (error) {
      console.error('Error loading tally summary:', error);
      onToast?.(t('errorLoadingSummary'), 'error');
    } finally {
      setLoading(false);
    }
  }, [schoolId, academicYearId, token, onToast, t]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="tally-loading">
        <div className="spinner"></div>
        <p>{t('loadingTallyData')}</p>
      </div>
    );
  }

  const isProfit = summary.netProfit >= 0;

  return (
    <div className="tally-dashboard">
      <div className="tally-header">
        <h3>📊 {t('financialSummary')}</h3>
      </div>

      <div className="tally-cards">
        <div className="tally-card fees-card">
          <div className="tally-card-icon">💰</div>
          <div className="tally-card-content">
            <div className="tally-card-label">{t('totalFeesCollected')}</div>
            <div className="tally-card-value">{formatCurrency(summary.totalFeesCollected)}</div>
            <div className="tally-card-sub">{t('incomeCredit')}</div>
          </div>
        </div>

        <div className="tally-card expenses-card">
          <div className="tally-card-icon">💸</div>
          <div className="tally-card-content">
            <div className="tally-card-label">{t('totalExpenses')}</div>
            <div className="tally-card-value">{formatCurrency(summary.totalExpenses)}</div>
            <div className="tally-card-sub">{t('expensesDebit')}</div>
          </div>
        </div>

        <div className={`tally-card profit-card ${isProfit ? 'profit-positive' : 'profit-negative'}`}>
          <div className="tally-card-icon">{isProfit ? '📈' : '📉'}</div>
          <div className="tally-card-content">
            <div className="tally-card-label">{isProfit ? t('netProfit') : t('netLoss')}</div>
            <div className="tally-card-value">{formatCurrency(Math.abs(summary.netProfit))}</div>
            <div className="tally-card-sub">
              {isProfit ? t('revenueMinusExpenses') : t('expensesMinusRevenue')}
            </div>
          </div>
        </div>
      </div>

      <div className="tally-progress-section">
        <div className="tally-progress-bar-container">
          <div className="tally-progress-label">
            <span>{t('expenseRatio')}</span>
            <span>
              {summary.totalFeesCollected > 0 
                ? ((summary.totalExpenses / summary.totalFeesCollected) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
          <div className="tally-progress-bar">
            <div 
              className="tally-progress-fill" 
              style={{ 
                width: `${summary.totalFeesCollected > 0 
                  ? Math.min((summary.totalExpenses / summary.totalFeesCollected) * 100, 100)
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TallyDashboard;
// src/components/admin/Tally/ExpenseList.js

import React, { useState, useEffect, useCallback } from 'react';
import TallyService from '../../../services/TallyService';
import DeleteButton from '../../common/DeleteButton';
import TableSkeleton from '../../loaders/TableSkeleton'; // Import TableSkeleton
import { useTranslation } from "react-i18next";

const ExpenseList = ({ schoolId, academicYearId, token, onToast, refreshTrigger }) => {
  const { t } = useTranslation(); 
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TallyService.getExpenses(schoolId, academicYearId, token);
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      onToast?.(t('errorLoadingExpenses'), 'error');
    } finally {
      setLoading(false);
    }
  }, [schoolId, academicYearId, token, onToast, t]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses, refreshTrigger]);

  const handleDelete = async (id) => {
    try {
      await TallyService.deleteExpense(id, token);
      onToast?.(t('expenseDeletedSuccess'), 'success');
      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      onToast?.(t('errorDeletingExpense'), 'error');
      throw error;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter !== 'all') {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      const thisMonth = now.getMonth() === expenseDate.getMonth() && 
                        now.getFullYear() === expenseDate.getFullYear();
      if (filter === 'this-month' && !thisMonth) return false;
    }
    
    if (searchTerm) {
      return expense.expenseHead?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return true;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="tally-expense-list">
      <div className="tally-list-header">
        <h4>📋 {t('expenseHistory')}</h4>
        <div className="tally-list-total">
          {t('total')}: {formatCurrency(totalExpenses)}
        </div>
      </div>

      <div className="tally-list-filters">
        <div className="tally-filter-buttons">
          <button 
            className={`tally-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            disabled={loading}
          >
            {t('all')}
          </button>
          <button 
            className={`tally-filter-btn ${filter === 'this-month' ? 'active' : ''}`}
            onClick={() => setFilter('this-month')}
            disabled={loading}
          >
            {t('thisMonth')}
          </button>
        </div>
        
        <div className="tally-search">
          <input
            type="text"
            placeholder={`🔍 ${t('searchExpenses')}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {loading ? (
        // Show skeleton loader while loading
        <div className="tally-table-container">
          <TableSkeleton rows={5} columns={4} />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="tally-empty-state">
          <div className="tally-empty-icon">💰</div>
          <p>{t('noExpensesFound')}</p>
        </div>
      ) : (
        <div className="tally-table-container">
          <table className="tally-table">
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('expenseHead')}</th>
                <th>{t('amount')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id}>
                  <td className="tally-date">{formatDate(expense.date)}</td>
                  <td className="tally-head">{expense.expenseName || expense.expenseHead}</td>
                  <td className="tally-amount">{formatCurrency(expense.amount)}</td>
                  <td>
                    <DeleteButton
                      objectId={expense.id}
                      objectName={expense.expenseName || expense.expenseHead}
                      onDelete={handleDelete}
                      itemType={t('expense')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
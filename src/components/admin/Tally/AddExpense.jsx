// src/components/admin/Tally/AddExpense.js

import React, { useState } from 'react';
import TallyService from '../../../services/TallyService';
import PriAutocompleteSelect from '../../common/PriAutocompleteSelect';
import { useTranslation } from "react-i18next";

const AddExpense = ({ schoolId, academicYearId, token, onExpenseAdded, onToast }) => {
  const { t } = useTranslation(); 
  const [expense, setExpense] = useState({
    expenseHead: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const expenseHeads = [
    t('salaryTeachingStaff'),
    t('salaryNonTeachingStaff'),
    t('electricityBill'),
    t('waterBill'),
    t('maintenance'),
    t('stationerySupplies'),
    t('infrastructureDevelopment'),
    t('transportation'),
    t('examExpenses'),
    t('sportsActivities'),
    t('marketingAdvertising'),
    t('otherExpenses')
  ];

  // 🔥 Convert expense heads to options format
  const expenseHeadOptions = expenseHeads.map(head => ({ 
    id: head, 
    name: head 
  }));

  // 🔥 Get selected expense head
  const selectedExpenseHead = expenseHeadOptions.find(
    e => e.id === expense.expenseHead
  ) || null;

  // 🔥 Handler for expense head change
  const handleExpenseHeadChange = (option) => {
    setExpense({
      ...expense,
      expenseHead: option?.id || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!expense.expenseHead || !expense.amount || !expense.date) {
      onToast?.(t('fillRequiredFields'), 'error');
      return;
    }

    try {
      setLoading(true);
     
      const expenseData = {
        expenseName: expense.expenseHead,
        category: expense.expenseHead,
        amount: Math.round(Number(expense.amount)),
        description: expense.description || '',
        date: expense.date
      };
      
      await TallyService.addExpense(schoolId, academicYearId, expenseData, token);
      onToast?.(t('expenseAddedSuccess'), 'success');
      
      setExpense({
        expenseHead: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      onExpenseAdded?.();
    } catch (error) {
      console.error('Error adding expense:', error);
      onToast?.(t('errorAddingExpense'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setExpense({
      ...expense,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form className="tally-add-expense" onSubmit={handleSubmit}>
      <div className="tally-form-group">
        <label>{t('expenseHead')} *</label>
        {/* 🔥 Expense Head Dropdown */}
        <PriAutocompleteSelect
          value={selectedExpenseHead}
          data={expenseHeadOptions}
          onChange={handleExpenseHeadChange}
          placeholder={t('selectExpenseHead')}
          optionLabel="name"
          optionValue="id"
          disabled={loading}
          size="medium"
          clearable
          required
        />
      </div>

      <div className="tally-form-group">
        <label>{t('amount')} (₹) *</label>
        <input
          type="number"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
          placeholder={t('enterAmount')}
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className="tally-form-group">
        <label>{t('date')} *</label>
        <input
          type="date"
          name="date"
          value={expense.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="tally-form-group">
        <label>{t('descriptionOptional')}</label>
        <textarea
          name="description"
          value={expense.description}
          onChange={handleChange}
          placeholder={t('enterDescription')}
          rows="3"
        />
      </div>

      <button 
        type="submit" 
        className="tally-submit-btn"
        disabled={loading}
      >
        {loading ? t('adding') : `➕ ${t('addExpense')}`}
      </button>
    </form>
  );
};

export default AddExpense;
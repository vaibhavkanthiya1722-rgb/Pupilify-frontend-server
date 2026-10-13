// src/components/admin/Tally/index.js

import React, { useState } from 'react';
import TallyDashboard from './TallyDashboard';
import AddExpense from './AddExpense';
import ExpenseList from './ExpenseList';
import { useTranslation } from "react-i18next";

const Tally = ({ schoolId, academicYearId, token, onToast, academicYear }) => {
  const { t } = useTranslation(); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('expenses');
  };

  return (
    <div className="tally-module">
      <div className="tally-tabs">
        <button 
          className={`tally-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 {t('dashboard')}
        </button>
        <button 
          className={`tally-tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ {t('addExpense')}
        </button>
        <button 
          className={`tally-tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          📋 {t('viewExpenses')}
        </button>
      </div>

      <div className="tally-content">
        {activeTab === 'dashboard' && (
          <TallyDashboard
            schoolId={schoolId}
            academicYearId={academicYearId}
            token={token}
            onToast={onToast}
            academicYear={academicYear}
          />
        )}

        {activeTab === 'add' && (
          <AddExpense
            schoolId={schoolId}
            academicYearId={academicYearId}
            token={token}
            onExpenseAdded={handleExpenseAdded}
            onToast={onToast}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            schoolId={schoolId}
            academicYearId={academicYearId}
            token={token}
            onToast={onToast}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>
    </div>
  );
};

export default Tally;
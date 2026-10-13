import { useState, useEffect, useCallback } from 'react';
import TallyService from '../../../services/TallyService';

export default function TallyController(schoolId, yearId, onToast, t) {  // ✅ t parameter added
  const [summary, setSummary] = useState({
    totalFeesCollected: 0,
    totalExpenses: 0,
    netProfit: 0,
    year: ''
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load summary data
  const loadSummary = useCallback(async () => {
    if (!schoolId || !yearId) return;
    try {
      const response = await TallyService.getSummary(schoolId, yearId);
      setSummary(response);
      setError(null);
    } catch (error) {
      console.error('Failed to load summary:', error);
      setError(error?.response?.data?.message || t('failedToLoadSummary'));
    }
  }, [schoolId, yearId, t]);

  // Load expenses data
  const loadExpenses = useCallback(async () => {
    if (!schoolId || !yearId) return;
    try {
      const response = await TallyService.getExpenses(schoolId, yearId);
      setExpenses(response || []);
      setError(null);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      setError(error?.response?.data?.message || t('failedToLoadExpenses'));
    }
  }, [schoolId, yearId, t]);

  // Load all data
  const loadAllData = useCallback(async () => {
    if (!schoolId || !yearId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadSummary(), loadExpenses()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadSummary, loadExpenses, schoolId, yearId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Add expense
  const handleAddExpense = async () => {
    if (!formData.title || !formData.amount) {
      onToast(t('fillRequiredFields'), 'error');
      return false;
    }

    try {
      await TallyService.addExpense(schoolId, yearId, {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        description: formData.description?.trim() || '',
        date: formData.date
      });
      onToast(t('expenseAddedSuccess'), 'success');
      setShowAddModal(false);
      setFormData({
        title: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      await loadExpenses();
      await loadSummary();
      return true;
    } catch (error) {
      onToast(error?.response?.data?.message || t('failedToAddExpense'), 'error');
      return false;
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    try {
      await TallyService.deleteExpense(id);
      onToast(t('expenseDeletedSuccess'), 'success');
      setDeleteDialog(null);
      await loadExpenses();
      await loadSummary();
      return true;
    } catch (error) {
      onToast(t('failedToDeleteExpense'), 'error');
      return false;
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return {
    summary,
    expenses,
    loading,
    error,
    showAddModal,
    deleteDialog,
    formData,
    setShowAddModal,
    setDeleteDialog,
    handleAddExpense,
    handleDeleteExpense,
    updateFormData,
    resetForm,
    loadAllData
  };
}
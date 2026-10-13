// src/components/common/FeeCollectionModal/index.jsx

import React, { useState, useEffect, useCallback } from 'react';
import PriModal from '../../../admin/PriModal';
import { useTranslation } from 'react-i18next';
import FeesService from '../../../../services/FeesService';

function FeeCollectionModal({
  isOpen,
  onClose,
  student,
  schoolId,
  academicYearId,
  onToast,
  onSuccess,
  loading: externalLoading,
  setLoading: externalSetLoading,
  title,
  customFooter,
}) {
  const { t } = useTranslation();
  
  const [feeDetails, setFeeDetails] = useState(null);
  const [feeForm, setFeeForm] = useState({
    amountPaid: '',
    paymentMode: 'CASH'
  });
  const [validation, setValidation] = useState({});
  const [internalLoading, setInternalLoading] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [previousDues, setPreviousDues] = useState([]);
  
  // ✅ NEW: Error state for fee structure not found
  const [feeStructureError, setFeeStructureError] = useState(null);
  
  // ✅ New states for previous due payment
  const [showPreviousDueModal, setShowPreviousDueModal] = useState(false);
  const [selectedPreviousDue, setSelectedPreviousDue] = useState(null);
  const [previousDueForm, setPreviousDueForm] = useState({
    amountPaying: '',
    paymentMode: 'CASH'
  });

  // ✅ Track if fee details have been fetched
  const [hasFetchedFeeDetails, setHasFetchedFeeDetails] = useState(false);
  // ✅ Track if previous dues have been fetched
  const [hasFetchedPreviousDues, setHasFetchedPreviousDues] = useState(false);

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const setLoading = externalSetLoading || setInternalLoading;

  // ✅ FIXED: fetchFeeDetails with proper dependencies
  const fetchFeeDetails = useCallback(async () => {
    if (!student?.enrollmentId || !schoolId) return;
    
    setLoading(true);
    setFeeStructureError(null);
    try {
      const data = await FeesService.fetchStudentDetails(student.enrollmentId, schoolId);
      console.log('📊 Fee Details Response:', data);

      // ✅ Check if fee structure exists
      if (data.feeStructureExists === false || data.totalFees === 0) {
        setFeeStructureError({
          message: t('noFeeStructureForStudent'),
          details: t('pleaseSetFeeStructureFirst'),
          class: data.className || student?.schoolClass?.className || 'N/A',
          section: data.sectionName || student?.section?.sectionName || 'Section A'
        });
        setFeeDetails(null);
        setLoading(false);
        setHasFetchedFeeDetails(true);
        return;
      }

      const totalFees = data.totalFees || 0;
      const totalClassFees = data.totalClassFees || 0;
      const penalty = data.penalty || 0;
      const extraFee = data.extraFee || 0;
      const discount = data.discount || 0;
      const admissionFee = data.admissionFee || 0;
      const previousYearDue = data.previousYearDue || 0;
      const totalPaidThisYear = data.totalPaidThisYear || 0;
      const remainingBalance = data.remainingBalance || 0;
      const grandTotalDue = data.grandTotalDue || 0;
      
      const calculatedCurrentDue = totalFees - totalPaidThisYear;
      const finalCurrentDue = Math.max(0, calculatedCurrentDue);

      const studentName = data.studentName || student?.name || 'N/A';
      const className = data.className || student?.schoolClass?.className || 'N/A';
      const sectionName = data.sectionName || student?.section?.sectionName || 'Section A';
      const rollNumber = data.rollNumber || student?.rollNumber || 'N/A';
      const enrollmentId = data.enrollmentId || student?.enrollmentId || 'N/A';

      const schoolName = student?.school?.schoolName || student?.schoolClass?.school?.schoolName || 'SMART SCHOOL';
      const schoolAddress = student?.school?.address || student?.schoolClass?.school?.address || 'School Address';
      const schoolPhone = student?.school?.phoneNumber || student?.schoolClass?.school?.phoneNumber || '________________';
      const schoolEmail = student?.school?.mailId || student?.schoolClass?.school?.mailId || '________________';

      setFeeDetails({
        studentId: data.studentId || student?.id,
        studentName: studentName,
        enrollmentId: enrollmentId,
        rollNumber: rollNumber,
        className: className,
        sectionName: sectionName,
        classId: data.classId || student?.schoolClass?.id,
        sectionId: data.sectionId || student?.section?.id,
        
        totalFees: totalFees,
        totalClassFees: totalClassFees,
        penalty: penalty,
        extraFee: extraFee,
        discount: discount,
        admissionFee: admissionFee,
        previousYearDue: previousYearDue,
        totalPaidThisYear: totalPaidThisYear,
        remainingBalance: remainingBalance,
        grandTotalDue: grandTotalDue,
        
        currentDue: finalCurrentDue,
        currentYearDue: finalCurrentDue,
        hasAdvance: calculatedCurrentDue < 0,
        advanceAmount: calculatedCurrentDue < 0 ? Math.abs(calculatedCurrentDue) : 0,
        
        paymentHistory: data.paymentHistory || [],
        feeAdjustments: data.feeAdjustments || [],
        
        schoolName: schoolName,
        schoolAddress: schoolAddress,
        schoolPhone: schoolPhone,
        schoolEmail: schoolEmail,
        
        feeStructureExists: true,
        ...data
      });
      
      setHasFetchedFeeDetails(true);
      
    } catch (error) {
      console.error('❌ Error fetching fee details:', error);
      
      // ✅ Check if error is due to no fee structure
      if (error.response?.status === 500 || 
          error.message?.toLowerCase().includes('fee structure') ||
          error.message?.toLowerCase().includes('no fee')) {
        setFeeStructureError({
          message: t('noFeeStructureForStudent'),
          details: t('pleaseSetFeeStructureFirst'),
          class: student?.schoolClass?.className || 'N/A',
          section: student?.section?.sectionName || 'Section A'
        });
        setHasFetchedFeeDetails(true);
      } else {
        onToast?.(t('fetchStudentError', { error: error.message }), 'error');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }, [student, schoolId, t, onToast, onClose, setLoading]);

  // ✅ FIXED: fetchPreviousDues - Independent fetch
  const fetchPreviousDues = useCallback(async (studentId) => {
    if (!studentId) return;
    
    // ✅ Don't fetch if already fetched
    if (hasFetchedPreviousDues) return;
    
    try {
      console.log('📤 Fetching previous dues for studentId:', studentId);
      const response = await FeesService.getPreviousDues(studentId);
      console.log('📊 Previous Dues Full Response:', response);
      
      let dues = [];
      
      if (response?.pendingDues) {
        dues = response.pendingDues;
      } else if (response?.data?.pendingDues) {
        dues = response.data.pendingDues;
      } else if (Array.isArray(response)) {
        dues = response;
      } else if (response?.data && Array.isArray(response.data)) {
        dues = response.data;
      }
      
      dues = Array.isArray(dues) ? dues.filter(d => d != null) : [];
      
      console.log('📊 Final dues array:', dues);
      console.log('📊 Number of dues:', dues.length);
      
      setPreviousDues(dues);
      setHasFetchedPreviousDues(true);
      
    } catch (error) {
      console.error('❌ Error fetching previous dues:', error);
      setPreviousDues([]);
      setHasFetchedPreviousDues(true);
    }
  }, [hasFetchedPreviousDues]);

  // ✅ FIXED: Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFeeDetails(null);
      setFeeForm({ amountPaid: '', paymentMode: 'CASH' });
      setValidation({});
      setShowPaymentHistory(false);
      setShowAdjustments(false);
      setPreviousDues([]);
      setShowPreviousDueModal(false);
      setSelectedPreviousDue(null);
      setPreviousDueForm({ amountPaying: '', paymentMode: 'CASH' });
      setFeeStructureError(null);
      setHasFetchedFeeDetails(false);
      setHasFetchedPreviousDues(false); // ✅ Reset previous dues flag
    }
  }, [isOpen]);

  // ✅ FIXED: Fetch fee details when modal opens - ONLY ONCE
  useEffect(() => {
    if (isOpen && student && !hasFetchedFeeDetails) {
      fetchFeeDetails();
    }
  }, [isOpen, student, hasFetchedFeeDetails, fetchFeeDetails]);

  // ✅ FIXED: Fetch previous dues SEPARATELY when modal opens
  useEffect(() => {
    if (isOpen && student?.id && !hasFetchedPreviousDues) {
      fetchPreviousDues(student.id);
    }
  }, [isOpen, student?.id, hasFetchedPreviousDues, fetchPreviousDues]);

  // ✅ NEW: Handle previous due payment
  const handlePayPreviousDue = (due) => {
    console.log('💰 Opening pay modal for due:', due);
    setSelectedPreviousDue(due);
    setPreviousDueForm({ amountPaying: '', paymentMode: 'CASH' });
    setShowPreviousDueModal(true);
  };

  // ✅ NEW: Pay previous due
  const payPreviousDue = async () => {
    if (!selectedPreviousDue || !previousDueForm.amountPaying) {
      onToast?.(t('amountRequired'), 'error');
      return;
    }

    const amountToPay = parseFloat(previousDueForm.amountPaying);
    const remainingDue = selectedPreviousDue.remainingDue || selectedPreviousDue.remainingAmount || selectedPreviousDue.dueAmount || 0;
    
    if (amountToPay > remainingDue) {
      onToast?.(t('cannotPayExtra', { totalDue: formatCurrency(remainingDue) }), 'error');
      return;
    }

    if (amountToPay <= 0) {
      onToast?.(t('validAmountRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await FeesService.payPreviousDue(
        selectedPreviousDue.id,
        schoolId,
        academicYearId?.id || academicYearId,
        amountToPay,
        previousDueForm.paymentMode
      );

      console.log('📥 Previous due payment response:', response);

      const receiptData = {
        receiptNumber: response.receiptNumber || `PRCP-${Date.now().toString(36).toUpperCase()}`,
        paymentDate: response.paymentDate || new Date().toISOString().split('T')[0],
        amountPaid: amountToPay,
        paymentMode: previousDueForm.paymentMode,
        remainingDue: response.remainingDue || Math.max(0, remainingDue - amountToPay),
        studentName: feeDetails?.studentName || student?.name || 'N/A',
        rollNumber: feeDetails?.rollNumber || student?.rollNumber || 'N/A',
        className: feeDetails?.className || student?.schoolClass?.className || 'N/A',
        sectionName: feeDetails?.sectionName || student?.section?.sectionName || 'Section A',
        schoolName: feeDetails?.schoolName || student?.school?.schoolName || 'SMART SCHOOL',
        schoolAddress: feeDetails?.schoolAddress || student?.school?.address || 'School Address',
        schoolPhone: feeDetails?.schoolPhone || student?.school?.phoneNumber || '________________',
        schoolEmail: feeDetails?.schoolEmail || student?.school?.mailId || '________________',
        academicYear: academicYearId?.currentYear || '2025-26',
        type: 'previous',
        previousDueYear: selectedPreviousDue.fromYear || selectedPreviousDue.academicYear || 'Previous Year'
      };

      if (onSuccess) {
        onSuccess(receiptData);
      }

      onToast?.(t('previousDuePaidSuccess'), 'success');
      
      // ✅ Refresh data after payment
      setHasFetchedPreviousDues(false); // Reset to refetch previous dues
      setHasFetchedFeeDetails(false); // Reset to refetch fee details
      
      // Refetch both
      if (student?.id) {
        await fetchPreviousDues(student.id);
      }
      await fetchFeeDetails();
      
      setShowPreviousDueModal(false);
      setSelectedPreviousDue(null);
      
    } catch (error) {
      console.error('❌ Previous due payment error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMsg = error.message || t('unknownError');
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      
      onToast?.(t('previousDuePaymentError', { error: errorMsg }), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field) => (e) => {
    setFeeForm(prev => ({ ...prev, [field]: e.target.value }));
    if (validation[field]) {
      setValidation(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePreviousDueFormChange = (field) => (e) => {
    setPreviousDueForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const collectFees = async () => {
    if (!feeDetails || !feeForm.amountPaid) {
      onToast?.(t('amountRequired'), 'error');
      return;
    }

    const amountToPay = parseFloat(feeForm.amountPaid);
    const totalDue = feeDetails.currentDue || 0;

    if (totalDue <= 0) {
      onToast?.(t('noDueAmount'), 'error');
      return;
    }

    if (amountToPay > totalDue) {
      onToast?.(t('cannotPayExtra', { totalDue: formatCurrency(totalDue) }), 'error');
      return;
    }

    if (amountToPay <= 0) {
      onToast?.(t('validAmountRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amountPaid: amountToPay,
        totalClassFees: feeDetails.totalClassFees || feeDetails.totalFees || 0,
        remainingBalance: Math.max(0, totalDue - amountToPay),
        paymentMode: feeForm.paymentMode,
        rollNumber: feeDetails.rollNumber || feeDetails.enrollmentId || 'N/A',
        student: { id: feeDetails.studentId },
        schoolClass: { id: feeDetails.classId },
        ...(feeDetails.sectionId ? { section: { id: parseInt(feeDetails.sectionId) } } : {})
      };

      console.log('📤 Sending payload:', payload);

      const response = await FeesService.collectFees(schoolId, academicYearId?.id || academicYearId, payload);
      console.log('📥 Collection response:', response);

      const receiptData = {
        receiptNumber: response.receiptNumber || `RCP-${Date.now().toString(36).toUpperCase()}`,
        paymentDate: response.paymentDate || new Date().toISOString().split('T')[0],
        amountPaid: amountToPay,
        paymentMode: feeForm.paymentMode,
        remainingDue: response.remainingBalance || Math.max(0, totalDue - amountToPay),
        studentName: feeDetails.studentName,
        rollNumber: feeDetails.rollNumber,
        className: feeDetails.className,
        sectionName: feeDetails.sectionName || 'Section A',
        totalFees: feeDetails.totalFees || feeDetails.totalClassFees,
        totalPaid: (feeDetails.totalPaidThisYear || 0) + amountToPay,
        schoolName: feeDetails.schoolName || 'SMART SCHOOL',
        schoolAddress: feeDetails.schoolAddress || 'School Address',
        schoolPhone: feeDetails.schoolPhone || '________________',
        schoolEmail: feeDetails.schoolEmail || '________________',
        academicYear: academicYearId?.currentYear || '2025-26',
        type: 'current',
        penalty: feeDetails.penalty,
        discount: feeDetails.discount,
        extraFee: feeDetails.extraFee,
        admissionFee: feeDetails.admissionFee,
        previousYearDue: feeDetails.previousYearDue,
        grandTotalDue: feeDetails.grandTotalDue
      };

      if (onSuccess) {
        onSuccess(receiptData);
      }

      onToast?.(t('feesCollectedSuccess'), 'success');
      onClose();

    } catch (error) {
      console.error('❌ Collection error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMsg = error.message || t('unknownError');
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      
      onToast?.(t('feeCollectionError', { error: errorMsg }), 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // Toggle payment history visibility
  const togglePaymentHistory = () => {
    setShowPaymentHistory(!showPaymentHistory);
    if (showAdjustments) setShowAdjustments(false);
  };

  // Toggle adjustments visibility
  const toggleAdjustments = () => {
    setShowAdjustments(!showAdjustments);
    if (showPaymentHistory) setShowPaymentHistory(false);
  };

  const defaultFooter = (
    <div className="pri-modal-footer" style={{ padding: '14px 0 0', margin: 0 }}>
      <button className="pri-btn pri-btn-ghost" onClick={onClose} disabled={loading}>
        {t('cancel')}
      </button>
      <button className="pri-btn pri-btn-primary" onClick={collectFees} disabled={loading}>
        {loading ? t('processing') : `💳 ${t('collect')}`}
      </button>
    </div>
  );

  if (!isOpen) return null;

  // ✅ Check if there are previous dues
  const hasPreviousDues = previousDues.length > 0;

  // ✅ RENDER ERROR STATE - No Fee Structure
  if (feeStructureError) {
    return (
      <PriModal
        title={title || `💰 ${t('collectFees')} — ${student?.name || ''}`}
        onClose={onClose}
        footer={
          <div className="pri-modal-footer" style={{ padding: '14px 0 0', margin: 0 }}>
            <button 
              className="pri-btn pri-btn-primary" 
              onClick={onClose}
              style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              {t('close')}
            </button>
          </div>
        }
      >
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          background: '#fef3c7',
          borderRadius: 12,
          border: '1px solid #f59e0b'
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ color: '#92400e', marginBottom: 8, fontSize: 20 }}>
            {feeStructureError.message}
          </h3>
          <p style={{ color: '#92400e', marginBottom: 16, fontSize: 14 }}>
            {feeStructureError.details}
          </p>
          <div style={{ 
            background: '#fffbeb', 
            padding: 16, 
            borderRadius: 10,
            fontSize: 14,
            color: '#92400e',
            textAlign: 'left',
            border: '1px solid #fde68a'
          }}>
            <div style={{ marginBottom: 4 }}>
              📋 <strong>{t('student')}:</strong> {student?.name} ({student?.enrollmentId})
            </div>
            <div style={{ marginBottom: 4 }}>
              📚 <strong>{t('class')}:</strong> {feeStructureError.class}
              {feeStructureError.section && ` / ${feeStructureError.section}`}
            </div>
            <div>
              📅 <strong>{t('academicYear')}:</strong> {academicYearId?.currentYear || '2025-26'}
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <button 
              className="pri-btn"
              onClick={() => {
                onClose();
                window.location.href = '/admin/fees?tab=structure';
              }}
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🏗️ {t('goToFeeStructure')}
            </button>
          </div>
        </div>
      </PriModal>
    );
  }

  return (
    <>
      <PriModal
        title={title || `💰 ${t('collectFees')} — ${student?.name || ''}`}
        onClose={onClose}
        footer={customFooter || defaultFooter}
      >
        {loading && !feeDetails ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div className="pri-loading-spinner">⏳</div>
            <p>{t('fetchingFeeDetails')}</p>
          </div>
        ) : feeDetails ? (
          <>
            {/* Student Info Card */}
            <div style={{
              background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#1e3a5f', marginBottom: 4 }}>
                {feeDetails.studentName}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                {feeDetails.className} / {feeDetails.sectionName}
              </div>

              {/* Fee Summary Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>
                    {t('totalFees')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1e3a5f' }}>
                    {formatCurrency(feeDetails.totalFees || 0)}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>
                    {t('paidThisYear')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>
                    {formatCurrency(feeDetails.totalPaidThisYear || 0)}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>
                    {t('currentDue')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: feeDetails.currentDue > 0 ? '#ef4444' : '#16a34a' }}>
                    {formatCurrency(feeDetails.currentDue || 0)}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>
                    {t('grandTotalDue')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: feeDetails.grandTotalDue > 0 ? '#ef4444' : '#16a34a' }}>
                    {formatCurrency(feeDetails.grandTotalDue || 0)}
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: '1px solid #bbf7d0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 6,
                fontSize: 12
              }}>
                {feeDetails.totalClassFees > 0 && (
                  <span style={{ color: '#64748b' }}>
                    {t('classFees')}: <strong>{formatCurrency(feeDetails.totalClassFees)}</strong>
                  </span>
                )}
                {feeDetails.penalty > 0 && (
                  <span style={{ color: '#ef4444' }}>
                    {t('penalty')}: <strong>{formatCurrency(feeDetails.penalty)}</strong>
                  </span>
                )}
                {feeDetails.extraFee > 0 && (
                  <span style={{ color: '#f59e0b' }}>
                    {t('extraFee')}: <strong>{formatCurrency(feeDetails.extraFee)}</strong>
                  </span>
                )}
                {feeDetails.discount > 0 && (
                  <span style={{ color: '#16a34a' }}>
                    {t('discount')}: <strong>-{formatCurrency(feeDetails.discount)}</strong>
                  </span>
                )}
                {feeDetails.admissionFee > 0 && (
                  <span style={{ color: '#64748b' }}>
                    {t('admissionFee')}: <strong>{formatCurrency(feeDetails.admissionFee)}</strong>
                  </span>
                )}
              </div>

              {feeDetails.hasAdvance && (
                <div style={{
                  marginTop: 10,
                  padding: '6px 12px',
                  background: '#dbeafe',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#1e40af',
                  textAlign: 'center'
                }}>
                  ⭐ {t('advancePayment')}: {formatCurrency(feeDetails.advanceAmount)}
                </div>
              )}
            </div>

            {/* ✅ PREVIOUS YEAR DUE SECTION WITH PAY BUTTON */}
            {hasPreviousDues && (
              <div style={{
                background: '#fef3c7',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                border: '1px solid #f59e0b'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>
                      📅 {t('previousYearDues')}
                    </span>
                    <span style={{ marginLeft: 10, fontSize: 12, color: '#92400e' }}>
                      {t('total')}: {formatCurrency(previousDues.reduce((sum, d) => sum + (d.remainingDue || d.remainingAmount || d.dueAmount || 0), 0))}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#92400e' }}>
                    {previousDues.length} pending due(s)
                  </span>
                </div>
                <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                  {previousDues.map((due, idx) => {
                    const remaining = due.remainingDue || due.remainingAmount || due.dueAmount || 0;
                    const isPaid = remaining <= 0;
                    return (
                      <div key={due.id || idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: idx < previousDues.length - 1 ? '1px solid #fde68a' : 'none'
                      }}>
                        <div>
                          <span style={{ color: '#92400e', fontSize: 13, fontWeight: 600 }}>
                            {due.fromYear || due.academicYear || 'Previous Year'}
                          </span>
                          <div style={{ fontSize: 11, color: '#92400e' }}>
                            {t('remaining')}: {formatCurrency(remaining)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, color: isPaid ? '#16a34a' : '#dc2626' }}>
                            {formatCurrency(remaining)}
                          </span>
                          {!isPaid && (
                            <button
                              onClick={() => handlePayPreviousDue(due)}
                              disabled={loading}
                              style={{
                                padding: '4px 16px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#f59e0b',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600
                              }}
                            >
                              💳 {t('pay')}
                            </button>
                          )}
                          {isPaid && (
                            <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
                              ✅ {t('paid')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons for History and Adjustments */}
            <div style={{
              display: 'flex',
              gap: 10,
              marginBottom: 16,
              flexWrap: 'wrap'
            }}>
              {feeDetails.paymentHistory?.length > 0 && (
                <button
                  onClick={togglePaymentHistory}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '1px solid #94a3b8',
                    background: showPaymentHistory ? '#1e3a5f' : 'white',
                    color: showPaymentHistory ? 'white' : '#1e3a5f',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  📜 {t('paymentHistory')} ({feeDetails.paymentHistory.length})
                </button>
              )}

              {feeDetails.feeAdjustments?.length > 0 && (
                <button
                  onClick={toggleAdjustments}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '1px solid #f59e0b',
                    background: showAdjustments ? '#f59e0b' : 'white',
                    color: showAdjustments ? 'white' : '#92400e',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  🔧 {t('adjustments')} ({feeDetails.feeAdjustments.length})
                </button>
              )}
            </div>

            {/* Payment History - Toggle */}
            {showPaymentHistory && feeDetails.paymentHistory?.length > 0 && (
              <div style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10 
                }}>
                  <span style={{ fontWeight: 700, color: '#1e3a5f' }}>
                    📜 {t('paymentHistory')}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {t('total')}: {formatCurrency(feeDetails.totalPaidThisYear || 0)}
                  </span>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {feeDetails.paymentHistory.map((payment, idx) => (
                    <div key={payment.id || idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: idx < feeDetails.paymentHistory.length - 1 ? '1px solid #e2e8f0' : 'none',
                      fontSize: 13
                    }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>#{payment.receiptNumber}</span>
                        <span style={{ color: '#94a3b8', marginLeft: 10, fontSize: 12 }}>
                          {payment.paymentDate}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>
                          {formatCurrency(payment.amountPaid)}
                        </span>
                        <span style={{ 
                          marginLeft: 10, 
                          background: '#e2e8f0', 
                          padding: '2px 10px', 
                          borderRadius: 12, 
                          fontSize: 11 
                        }}>
                          {payment.paymentMode}
                        </span>
                        {payment.remainingBalance !== undefined && (
                          <span style={{ marginLeft: 10, fontSize: 11, color: '#64748b' }}>
                            {t('balance')}: {formatCurrency(payment.remainingBalance)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fee Adjustments - Toggle */}
            {showAdjustments && feeDetails.feeAdjustments?.length > 0 && (
              <div style={{
                background: '#fffbeb',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                border: '1px solid #fde68a'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10 
                }}>
                  <span style={{ fontWeight: 700, color: '#92400e' }}>
                    🔧 {t('feeAdjustments')}
                  </span>
                  <span style={{ fontSize: 11, color: '#92400e' }}>
                    {t('total')}: {formatCurrency(
                      feeDetails.feeAdjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0)
                    )}
                  </span>
                </div>
                {feeDetails.feeAdjustments.map((adjustment, idx) => (
                  <div key={adjustment.id || idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    fontSize: 13,
                    borderBottom: idx < feeDetails.feeAdjustments.length - 1 ? '1px solid #fde68a' : 'none'
                  }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{adjustment.feeType}</span>
                      {adjustment.description && (
                        <span style={{ color: '#94a3b8', marginLeft: 8, fontSize: 12 }}>
                          - {adjustment.description}
                        </span>
                      )}
                    </div>
                    <span style={{ 
                      fontWeight: 700, 
                      color: adjustment.amount > 0 ? '#ef4444' : '#16a34a' 
                    }}>
                      {adjustment.amount > 0 ? '+' : ''}{formatCurrency(adjustment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Collection Form */}
            <div className="pri-form-row">
              <div className="pri-form-field">
                <label>{t('amountPaid')} (₹) *</label>
                <input
                  value={feeForm.amountPaid}
                  onChange={handleFormChange('amountPaid')}
                  type="number"
                  placeholder={feeDetails.currentDue > 0 ? `₹${feeDetails.currentDue}` : t('noDue')}
                  autoFocus
                  min="1"
                  max={feeDetails.currentDue || 0}
                  disabled={loading || feeDetails.currentDue <= 0}
                />
                {feeDetails.currentDue > 0 && (
                  <small style={{ color: '#64748b' }}>
                    {t('maxAmount')}: {formatCurrency(feeDetails.currentDue)}
                  </small>
                )}
                {feeDetails.currentDue <= 0 && (
                  <small style={{ color: '#16a34a', fontWeight: 600 }}>
                    ✅ {t('noDueAmount')}
                  </small>
                )}
              </div>
              <div className="pri-form-field">
                <label>{t('paymentMode')}</label>
                <select value={feeForm.paymentMode} onChange={handleFormChange('paymentMode')} disabled={loading}>
                  {['CASH', 'ONLINE', 'CHEQUE', 'DD'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              background: '#f0f9ff',
              borderRadius: 8,
              padding: 10,
              marginTop: 8,
              fontSize: 12,
              color: '#0369a1'
            }}>
              📋 {t('enrollmentNo')}: <strong>{feeDetails.enrollmentId}</strong> |
              {t('rollNo')}: <strong>{feeDetails.rollNumber || t('notAssigned')}</strong>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#ef4444' }}>
            <p>{t('failedToFetchFeeDetails')}</p>
          </div>
        )}
      </PriModal>

      {/* ✅ PREVIOUS DUE PAYMENT MODAL */}
      {showPreviousDueModal && selectedPreviousDue && (
        <PriModal
          title={`📅 ${t('payPreviousYearDue')} - ${feeDetails?.studentName || student?.name || ''}`}
          onClose={() => {
            setShowPreviousDueModal(false);
            setSelectedPreviousDue(null);
            setPreviousDueForm({ amountPaying: '', paymentMode: 'CASH' });
          }}
          footer={
            <div className="pri-modal-footer" style={{ padding: '14px 0 0', margin: 0 }}>
              <button 
                className="pri-btn pri-btn-ghost" 
                onClick={() => {
                  setShowPreviousDueModal(false);
                  setSelectedPreviousDue(null);
                  setPreviousDueForm({ amountPaying: '', paymentMode: 'CASH' });
                }} 
                disabled={loading}
              >
                {t('cancel')}
              </button>
              <button 
                className="pri-btn pri-btn-primary" 
                onClick={payPreviousDue} 
                disabled={loading || !previousDueForm.amountPaying}
              >
                {loading ? t('processing') : `💳 ${t('pay')}`}
              </button>
            </div>
          }
        >
          <div style={{ padding: '10px 0' }}>
            <div style={{
              background: '#fef3c7',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              border: '1px solid #f59e0b'
            }}>
              <div style={{ fontSize: 14, color: '#92400e' }}>
                <div><strong>{t('dueFrom')}:</strong> {selectedPreviousDue.fromYear || selectedPreviousDue.academicYear || 'Previous Year'}</div>
                <div><strong>{t('originalAmount')}:</strong> {formatCurrency(selectedPreviousDue.dueAmount || selectedPreviousDue.totalFees || 0)}</div>
                {selectedPreviousDue.paidFromDue > 0 && (
                  <div><strong>{t('alreadyPaid')}:</strong> {formatCurrency(selectedPreviousDue.paidFromDue)}</div>
                )}
                <div><strong>{t('remainingAmount')}:</strong> {formatCurrency(selectedPreviousDue.remainingDue || selectedPreviousDue.remainingAmount || selectedPreviousDue.dueAmount || 0)}</div>
              </div>
            </div>

            <div className="pri-form-row">
              <div className="pri-form-field">
                <label>{t('amountPaying')} (₹) *</label>
                <input
                  value={previousDueForm.amountPaying}
                  onChange={handlePreviousDueFormChange('amountPaying')}
                  type="number"
                  placeholder={`${t('max')}: ${formatCurrency(selectedPreviousDue.remainingDue || selectedPreviousDue.remainingAmount || selectedPreviousDue.dueAmount || 0)}`}
                  min="1"
                  max={selectedPreviousDue.remainingDue || selectedPreviousDue.remainingAmount || selectedPreviousDue.dueAmount || 0}
                  disabled={loading}
                  autoFocus
                />
                <small style={{ color: '#64748b' }}>
                  {t('maxAmount')}: {formatCurrency(selectedPreviousDue.remainingDue || selectedPreviousDue.remainingAmount || selectedPreviousDue.dueAmount || 0)}
                </small>
              </div>
              <div className="pri-form-field">
                <label>{t('paymentMode')}</label>
                <select 
                  value={previousDueForm.paymentMode} 
                  onChange={handlePreviousDueFormChange('paymentMode')} 
                  disabled={loading}
                >
                  {['CASH', 'ONLINE', 'CHEQUE', 'DD'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </PriModal>
      )}
    </>
  );
}

export default FeeCollectionModal;
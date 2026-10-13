// src/components/admin/PriFees/FeeAdjustmentModal.jsx

import React, { useState } from 'react';
import PriModal from '../PriModal';
import { useTranslation } from 'react-i18next';

function FeeAdjustmentModal({ 
  isOpen, 
  onClose, 
  student, 
  onSave,
  loading,
  academicYearId
}) {
  const { t } = useTranslation();
  
  const [adjustment, setAdjustment] = useState({
    feeType: 'DISCOUNT',
    amount: '',
    reason: '',        // ✅ UI me reason show hoga
    createdDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setAdjustment(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!adjustment.feeType) {
      newErrors.feeType = t('feeTypeRequired');
    }
    
    if (!adjustment.amount || parseFloat(adjustment.amount) <= 0) {
      newErrors.amount = t('validAmountRequired');
    }
    
    if (!adjustment.reason?.trim()) {
      newErrors.reason = t('reasonRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    if (!academicYearId) {
      alert(t('academicYearRequired'));
      return;
    }
    
    // ✅ Payload me reason ko description ke naam se bhej rahe hain
    const data = {
      feeType: adjustment.feeType,
      amount: parseFloat(adjustment.amount),
      description: adjustment.reason?.trim(),  // ✅ reason ko description me map kiya
      createdDate: adjustment.createdDate,
      academicYearId: academicYearId
    };
    
    console.log('📤 Submitting adjustment payload:', data);
    onSave(data);
  };

  const feeTypes = [
    { id: 'ADMISSION_FEE', label: t('admissionFee'), icon: '🎓', color: '#3b82f6' },
    { id: 'PENALTY', label: t('penalty'), icon: '⚠️', color: '#ef4444' },
    { id: 'EXTRA_FEE', label: t('extraFee'), icon: '➕', color: '#f59e0b' },
    { id: 'DISCOUNT', label: t('discount'), icon: '🎯', color: '#22c55e' }
  ];

  if (!isOpen) return null;

  return (
    <PriModal
      title={`📝 ${t('feeAdjustment')} — ${student?.name || ''}`}
      onClose={onClose}
      footer={
        <div className="pri-modal-footer">
          <button 
            className="pri-btn pri-btn-ghost" 
            onClick={onClose} 
            disabled={loading}
          >
            {t('cancel')}
          </button>
          <button 
            className="pri-btn pri-btn-primary" 
            onClick={handleSubmit} 
            disabled={loading}
            style={{
              background: loading ? '#94a3b8' : '#1e3a5f',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? t('saving') : `💾 ${t('saveAdjustment')}`}
          </button>
        </div>
      }
    >
      {/* Academic Year Info */}
      <div style={{
        background: '#f0f9ff',
        padding: '8px 12px',
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 13,
        color: '#0369a1',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span>📅</span>
        <span>{t('academicYear')}: <strong>{academicYearId || t('notSet')}</strong></span>
      </div>

      {/* Student Information */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 600,
          color: '#1e3a5f',
          fontSize: 14,
          borderLeft: '4px solid #1e3a5f'
        }}>
          📋 {t('studentInformation')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{t('enrollmentNo')}</div>
            <div style={{ fontWeight: 600 }}>{student?.enrollmentId || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{t('rollNo')}</div>
            <div style={{ fontWeight: 600 }}>{student?.rollNumber || t('notAssigned')}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{t('class')}</div>
            <div style={{ fontWeight: 600 }}>{student?.schoolClass?.className || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{t('section')}</div>
            <div style={{ fontWeight: 600 }}>{student?.section?.sectionName || '—'}</div>
          </div>
        </div>
      </div>

      {/* Adjustment Details */}
      <div style={{
        background: '#f8fafc',
        padding: '12px 16px',
        borderRadius: 8,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 600,
        color: '#1e3a5f',
        fontSize: 14,
        borderLeft: '4px solid #1e3a5f'
      }}>
        ⚙️ {t('adjustmentDetails')}
      </div>

      <div className="pri-form-row">
        <div className="pri-form-field">
          <label>{t('adjustmentType')} *</label>
          <select 
            value={adjustment.feeType} 
            onChange={handleChange('feeType')}
            style={errors.feeType ? { borderColor: '#ef4444' } : {}}
            disabled={loading}
          >
            <option value="">-- {t('selectAdjustmentType')} --</option>
            {feeTypes.map(ft => (
              <option key={ft.id} value={ft.id}>
                {ft.icon} {ft.label}
              </option>
            ))}
          </select>
          {errors.feeType && (
            <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.feeType}</span>
          )}
        </div>

        <div className="pri-form-field">
          <label>{t('amount')} (₹) *</label>
          <input
            type="number"
            value={adjustment.amount}
            onChange={handleChange('amount')}
            placeholder={t('enterAmount')}
            min="1"
            step="1"
            style={errors.amount ? { borderColor: '#ef4444' } : {}}
            disabled={loading}
          />
          {errors.amount && (
            <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.amount}</span>
          )}
        </div>
      </div>

      <div className="pri-form-row">
        <div className="pri-form-field" style={{ flex: 2 }}>
          <label>{t('reason')} *</label>
          <input
            type="text"
            value={adjustment.reason}
            onChange={handleChange('reason')}
            placeholder={t('reasonPlaceholder')}
            style={errors.reason ? { borderColor: '#ef4444' } : {}}
            disabled={loading}
          />
          {errors.reason && (
            <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.reason}</span>
          )}
        </div>

        <div className="pri-form-field">
          <label>{t('date')}</label>
          <input
            type="date"
            value={adjustment.createdDate}
            onChange={handleChange('createdDate')}
            disabled={loading}
          />
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: 12,
        padding: '12px 16px',
        background: '#f0f9ff',
        borderRadius: 8,
        fontSize: 13,
        color: '#0369a1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>💡</span>
          <span>{t('adjustmentInfo')}</span>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 6,
          marginTop: 8,
          fontSize: 12 
        }}>
          <div>🎓 {t('admissionFee')}: {t('oneTimeAdmission')}</div>
          <div>⚠️ {t('penalty')}: {t('latePaymentPenalty')}</div>
          <div>➕ {t('extraFee')}: {t('additionalCharges')}</div>
          <div>🎯 {t('discount')}: {t('feeReduction')}</div>
        </div>
      </div>
    </PriModal>
  );
}

export default FeeAdjustmentModal;
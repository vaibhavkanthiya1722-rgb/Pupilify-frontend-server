// src/components/admin/PriFees/FeeRecordModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import PriModal from '../PriModal';
import FeesService from '../../../services/FeesService';
import { useTranslation } from 'react-i18next';

function FeeRecordModal({ 
  isOpen, 
  onClose, 
  enrollmentId,
  onToast,
  loading,
  setLoading 
}) {
  const { t } = useTranslation();
  const [record, setRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState(null);

  // Wrap fetchRecord in useCallback to prevent unnecessary re-renders
  const fetchRecord = useCallback(async () => {
    if (!enrollmentId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await FeesService.getFeeRecord(enrollmentId);
      console.log('📊 Fee Record Data:', data);
      
      // ✅ Check if fee structure exists
      if (data.feeStructureExists === false || data.totalFees === 0) {
        setError({
          message: t('noFeeRecordFound'),
          details: t('feeStructureNotSetForThisStudent')
        });
        setRecord(null);
        return;
      }
      
      setRecord(data);
    } catch (error) {
      console.error('Error fetching fee record:', error);
      console.error('Error response:', error.response?.data);
      
      // ✅ Check if error is due to no fee structure
      if (error.response?.status === 500 || 
          error.message?.toLowerCase().includes('fee structure') ||
          error.message?.toLowerCase().includes('no fee')) {
        setError({
          message: t('noFeeRecordFound'),
          details: t('feeStructureNotSetForThisStudent')
        });
        onToast?.(t('pleaseSetFeeStructureFirst'), 'warning');
      } else {
        onToast?.(t('fetchRecordError', { error: error.message }), 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [enrollmentId, setLoading, onToast, t]);

  useEffect(() => {
    if (isOpen && enrollmentId) {
      fetchRecord();
    }
  }, [isOpen, enrollmentId, fetchRecord]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const getAdjustmentIcon = (type) => {
    const icons = {
      'ADMISSION_FEE': '🎓',
      'PENALTY': '⚠️',
      'EXTRA_FEE': '➕',
      'DISCOUNT': '🎯'
    };
    return icons[type] || '📌';
  };

  const getAdjustmentColor = (type) => {
    const colors = {
      'ADMISSION_FEE': '#3b82f6',
      'PENALTY': '#ef4444',
      'EXTRA_FEE': '#f59e0b',
      'DISCOUNT': '#22c55e'
    };
    return colors[type] || '#6b7280';
  };

  const getAdjustmentLabel = (type) => {
    const labels = {
      'ADMISSION_FEE': 'admissionFee',
      'PENALTY': 'penalty',
      'EXTRA_FEE': 'extraFee',
      'DISCOUNT': 'discount'
    };
    return labels[type] || type;
  };

  // Helper function to get date from adjustment
  const getAdjustmentDate = (adj) => {
    if (adj.createdDate) {
      return new Date(adj.createdDate).toLocaleDateString('en-IN');
    }
    if (adj.createdAt) {
      return new Date(adj.createdAt).toLocaleDateString('en-IN');
    }
    return '—';
  };

  // Helper function to get reason from adjustment
  const getAdjustmentReason = (adj) => {
    return adj.reason || adj.description || '—';
  };

  if (!isOpen) return null;

  // ✅ Render error state - No Fee Structure
  if (error) {
    return (
      <PriModal
        title={`📊 ${t('feeRecord')}`}
        onClose={onClose}
        footer={
          <button className="pri-btn pri-btn-primary" onClick={onClose}>
            {t('close')}
          </button>
        }
      >
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          background: '#fef3c7',
          borderRadius: 12,
          border: '1px solid #f59e0b'
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
          <h3 style={{ color: '#92400e', marginBottom: 8, fontSize: 20 }}>
            {error.message}
          </h3>
          <p style={{ color: '#92400e', marginBottom: 16, fontSize: 14 }}>
            {error.details}
          </p>
          <div style={{ 
            background: '#fffbeb', 
            padding: 12, 
            borderRadius: 8,
            fontSize: 14,
            color: '#92400e'
          }}>
            📋 {t('enrollmentNo')}: <strong>{enrollmentId}</strong>
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
    <PriModal
      title={`📊 ${t('feeRecord')} — ${record?.studentName || ''}`}
      onClose={onClose}
      wide
      footer={
        <button className="pri-btn pri-btn-primary" onClick={onClose}>
          {t('close')}
        </button>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="pri-loading-spinner">⏳</div>
          <p>{t('loadingFeeRecord')}</p>
        </div>
      ) : record ? (
        <>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginBottom: 20
          }}>
            <div style={{
              background: '#f0fdf4',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('totalFees')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a5f' }}>
                {formatCurrency(record.totalFees)}
              </div>
            </div>

            <div style={{
              background: '#eff6ff',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('paidThisYear')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>
                {formatCurrency(record.totalPaidThisYear)}
              </div>
            </div>

            <div style={{
              background: '#fffbeb',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #fde68a'
            }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('previousYearDue')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>
                {formatCurrency(record.previousYearDue)}
              </div>
            </div>

            <div style={{
              background: '#fef2f2',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('grandTotalDue')}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: record.grandTotalDue > 0 ? '#ef4444' : '#16a34a' }}>
                {formatCurrency(record.grandTotalDue)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            borderBottom: '2px solid #e2e8f0',
            marginBottom: 16
          }}>
            {[
              ['summary', '📋', t('summary')],
              ['adjustments', '📝', t('adjustments')],
              ['payments', '💰', t('payments')]
            ].map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: activeTab === key ? '#1e3a5f' : 'transparent',
                  color: activeTab === key ? 'white' : '#64748b',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: activeTab === key ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  transition: 'all 0.2s'
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{t('student')}</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{record.studentName}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{record.className}</div>
                
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {t('remainingBalance')}: {formatCurrency(record.remainingBalance)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{t('feeBreakdown')}</div>
                  <div style={{ fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>{t('classFees')}:</span>
                      <span>{formatCurrency(record.totalClassFees)}</span>
                    </div>
                    {record.admissionFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#3b82f6' }}>
                        <span>🎓 {t('admissionFee')}:</span>
                        <span>+{formatCurrency(record.admissionFee)}</span>
                      </div>
                    )}
                    {record.penalty > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#ef4444' }}>
                        <span>⚠️ {t('penalty')}:</span>
                        <span>+{formatCurrency(record.penalty)}</span>
                      </div>
                    )}
                    {record.extraFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#f59e0b' }}>
                        <span>➕ {t('extraFee')}:</span>
                        <span>+{formatCurrency(record.extraFee)}</span>
                      </div>
                    )}
                    {record.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#22c55e' }}>
                        <span>🎯 {t('discount')}:</span>
                        <span>-{formatCurrency(record.discount)}</span>
                      </div>
                    )}
                    <div style={{ 
                      borderTop: '2px solid #e2e8f0', 
                      marginTop: '4px', 
                      paddingTop: '6px', 
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{t('total')}:</span>
                      <span>{formatCurrency(record.totalFees)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Adjustments Tab */}
            {activeTab === 'adjustments' && (
              <div>
                {record.feeAdjustments?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    📝 {t('noAdjustments')}
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      background: '#f0f9ff', 
                      padding: '8px 12px', 
                      borderRadius: 6,
                      marginBottom: 12,
                      fontSize: 12,
                      color: '#0369a1'
                    }}>
                      💡 {t('adjustmentsInfo')}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>
                            {t('type')}
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                            {t('amount')}
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>
                            {t('reason')}
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>
                            {t('date')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.feeAdjustments.map((adj, idx) => {
                          const isDiscount = adj.feeType === 'DISCOUNT';
                          const isAdmission = adj.feeType === 'ADMISSION_FEE';
                          const isPenalty = adj.feeType === 'PENALTY';
                          const isExtra = adj.feeType === 'EXTRA_FEE';
                          
                          let prefix = '';
                          
                          if (isAdmission) { prefix = '+'; }
                          else if (isPenalty) { prefix = '+'; }
                          else if (isExtra) { prefix = '+'; }
                          else if (isDiscount) { prefix = '-'; }
                          
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '2px 10px',
                                  borderRadius: 12,
                                  background: `${getAdjustmentColor(adj.feeType)}20`,
                                  color: getAdjustmentColor(adj.feeType),
                                  fontSize: 12,
                                  fontWeight: 600
                                }}>
                                  {getAdjustmentIcon(adj.feeType)} {t(getAdjustmentLabel(adj.feeType))}
                                </span>
                              </td>
                              <td style={{ 
                                padding: '8px 12px', 
                                textAlign: 'right',
                                fontWeight: 600,
                                color: isDiscount ? '#22c55e' : '#ef4444'
                              }}>
                                {prefix}{formatCurrency(adj.amount)}
                              </td>
                              <td style={{ padding: '8px 12px', fontSize: 13 }}>
                                {getAdjustmentReason(adj)}
                              </td>
                              <td style={{ padding: '8px 12px', fontSize: 13, color: '#64748b' }}>
                                {getAdjustmentDate(adj)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                {record.paymentHistory?.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#94a3b8',
                    background: '#f8fafc',
                    borderRadius: 8
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 10 }}>💰</div>
                    <p style={{ fontSize: 16, fontWeight: 500 }}>{t('noPayments')}</p>
                    <p style={{ fontSize: 13, marginTop: 4, color: '#cbd5e1' }}>
                      {t('noPaymentsDesc')}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Payment Summary */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 10,
                      marginBottom: 16,
                      padding: '12px 16px',
                      background: '#f8fafc',
                      borderRadius: 8
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          {t('totalPayments')}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>
                          {formatCurrency(
                            record.paymentHistory?.reduce((sum, p) => sum + p.amountPaid, 0) || 0
                          )}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          {t('currentYearPayments')}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6' }}>
                          {formatCurrency(
                            record.paymentHistory
                              ?.filter(p => !p.receiptNumber?.startsWith('DUE-'))
                              ?.reduce((sum, p) => sum + p.amountPaid, 0) || 0
                          )}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          {t('previousDuePayments')}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>
                          {formatCurrency(
                            record.paymentHistory
                              ?.filter(p => p.receiptNumber?.startsWith('DUE-'))
                              ?.reduce((sum, p) => sum + p.amountPaid, 0) || 0
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>
                            {t('receiptNo')}
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>
                            {t('date')}
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                            {t('amount')}
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>
                            {t('mode')}
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>
                            {t('type')}
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: '#64748b' }}>
                            {t('remainingBalance')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.paymentHistory.map((payment, idx) => {
                          const isDuePayment = payment.receiptNumber?.startsWith('DUE-');
                          const isOnline = payment.paymentMode === 'ONLINE';
                          
                          return (
                            <tr key={idx} style={{ 
                              borderBottom: '1px solid #e2e8f0',
                              background: isDuePayment ? '#fffbeb' : 'white',
                              transition: 'background 0.2s'
                            }}>
                              <td style={{ 
                                padding: '8px 12px', 
                                fontWeight: 600, 
                                fontSize: 13,
                                color: '#1e3a5f'
                              }}>
                                {payment.receiptNumber}
                              </td>
                              <td style={{ 
                                padding: '8px 12px', 
                                fontSize: 13, 
                                color: '#64748b'
                              }}>
                                {payment.paymentDate ? 
                                  new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  }) : '—'
                                }
                              </td>
                              <td style={{ 
                                padding: '8px 12px', 
                                textAlign: 'right', 
                                fontWeight: 700, 
                                color: '#16a34a',
                                fontSize: 14
                              }}>
                                {formatCurrency(payment.amountPaid)}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{
                                  padding: '3px 12px',
                                  borderRadius: 20,
                                  background: isOnline ? '#eff6ff' : '#f0fdf4',
                                  color: isOnline ? '#1d4ed8' : '#166534',
                                  fontSize: 12,
                                  fontWeight: 500
                                }}>
                                  {isOnline ? '💳' : '💵'} {payment.paymentMode}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{
                                  padding: '3px 12px',
                                  borderRadius: 20,
                                  background: isDuePayment ? '#fef3c7' : '#dcfce7',
                                  color: isDuePayment ? '#92400e' : '#166534',
                                  fontSize: 12,
                                  fontWeight: 500
                                }}>
                                  {isDuePayment ? '📅 ' + t('previousDue') : '📚 ' + t('currentYear')}
                                </span>
                              </td>
                              <td style={{ 
                                padding: '8px 12px', 
                                textAlign: 'right', 
                                fontWeight: 600,
                                color: payment.remainingBalance > 0 ? '#ef4444' : '#16a34a',
                                fontSize: 13
                              }}>
                                {formatCurrency(payment.remainingBalance || 0)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ 
                          background: '#f1f5f9', 
                          fontWeight: 700,
                          borderTop: '2px solid #1e3a5f'
                        }}>
                          <td colSpan={2} style={{ padding: '10px 12px', textAlign: 'right' }}>
                            {t('total')}:
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: '#16a34a', fontSize: 15 }}>
                            {formatCurrency(
                              record.paymentHistory?.reduce((sum, p) => sum + p.amountPaid, 0) || 0
                            )}
                          </td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
          <p>{t('failedToLoadRecord')}</p>
        </div>
      )}
    </PriModal>
  );
}

export default FeeRecordModal;
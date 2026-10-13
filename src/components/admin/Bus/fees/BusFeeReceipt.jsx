// src/components/admin/Bus/fees/BusFeeReceipt.jsx - Complete Updated Version

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PriModal from '../../../admin/PriModal';

export default function BusFeeReceipt({ data, onClose, loading, title }) {
  const { t } = useTranslation();
  const [copy, setCopy] = useState('original');

  if (!data) return null;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  // Get student class display name
  const getStudentClassDisplay = () => {
    if (data.className) {
      return data.className;
    }
    if (data.studentClass) {
      return typeof data.studentClass === 'object' 
        ? data.studentClass.className || data.studentClass.name || 'N/A'
        : data.studentClass;
    }
    if (data.class) {
      return data.class;
    }
    return 'N/A';
  };

  // Get student section display
  const getStudentSectionDisplay = () => {
    if (data.sectionName) {
      return data.sectionName;
    }
    if (data.section) {
      return typeof data.section === 'object'
        ? data.section.sectionName || data.section.name || ''
        : data.section;
    }
    return '';
  };

  // Get full class with section
  const getFullClassDisplay = () => {
    const className = getStudentClassDisplay();
    const section = getStudentSectionDisplay();
    return section ? `${className} - ${section}` : className;
  };

  const renderReceipt = (type) => (
    <div
      style={{
        background: '#ffffff',
        padding: '24px 32px',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        maxWidth: 500,
        margin: '0 auto',
        fontSize: 13,
        fontFamily: "'Courier New', monospace",
        position: 'relative',
      }}
    >
      {type === 'duplicate' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: 48,
            color: 'rgba(239, 68, 68, 0.1)',
            fontWeight: 900,
            letterSpacing: 8,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          DUPLICATE
        </div>
      )}

      {/* School Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, color: '#1e3a5f' }}>{data.schoolName}</h2>
        <p style={{ margin: 2, fontSize: 11, color: '#64748b' }}>{data.schoolAddress}</p>
        <p style={{ margin: 2, fontSize: 11, color: '#64748b' }}>
          📞 {data.schoolPhone} | ✉️ {data.schoolEmail}
        </p>
        <p style={{ margin: 4, fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>
          🚌 {t('busFeeReceipt')} {type === 'duplicate' ? `(${t('duplicate')})` : ''}
        </p>
        <p style={{ margin: 2, fontSize: 11, color: '#64748b' }}>
          {t('receiptNo')}: <strong>{data.receiptNumber}</strong>
        </p>
      </div>

      {/* Student Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginBottom: 12 }}>
        <div>
          <span style={{ color: '#64748b' }}>{t('date')}:</span>
        </div>
        <div style={{ textAlign: 'right' }}>{formatDate(data.paymentDate)}</div>
        
        <div>
          <span style={{ color: '#64748b' }}>{t('studentName')}:</span>
        </div>
        <div style={{ textAlign: 'right', fontWeight: 600 }}>{data.studentName}</div>
        
        <div>
          <span style={{ color: '#64748b' }}>{t('enrollmentNo')}:</span>
        </div>
        <div style={{ textAlign: 'right' }}>{data.enrollmentId}</div>
        
        <div>
          <span style={{ color: '#64748b' }}>{t('class')}:</span>
        </div>
        <div style={{ textAlign: 'right', fontWeight: 600, color: '#1e3a5f' }}>
          {getFullClassDisplay()}
        </div>
        
        <div>
          <span style={{ color: '#64748b' }}>{t('stop')}:</span>
        </div>
        <div style={{ textAlign: 'right' }}>{data.stopName || '-'}</div>
        
        <div>
          <span style={{ color: '#64748b' }}>{t('bus')}:</span>
        </div>
        <div style={{ textAlign: 'right' }}>🚌 {data.busNumber}</div>
        
        <div>
          <span style={{ color: '#64748b' }}>{t('academicYear')}:</span>
        </div>
        <div style={{ textAlign: 'right' }}>{data.academicYear}</div>
      </div>

      {/* Fee Details */}
      <div
        style={{
          borderTop: '2px dashed #e2e8f0',
          borderBottom: '2px dashed #e2e8f0',
          padding: '10px 0',
          margin: '10px 0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#64748b' }}>{t('monthlyFee')}:</span>
          <span>{formatCurrency(data.monthlyFee)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#64748b' }}>{t('totalYearlyDue')}:</span>
          <span>{formatCurrency(data.totalYearlyDue)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#64748b' }}>{t('totalPaid')}:</span>
          <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(data.totalPaid || 0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>{t('remainingDue')}:</span>
          <span style={{ fontWeight: 700, color: (data.remainingDue || 0) > 0 ? '#ef4444' : '#16a34a' }}>
            {formatCurrency(data.remainingDue || 0)}
          </span>
        </div>
      </div>

      {/* Payment Details */}
      <div
        style={{
          padding: '10px 0',
          margin: '10px 0',
          textAlign: 'center',
          background: '#f0fdf4',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
          <span style={{ fontWeight: 600 }}>{t('amountPaid')}:</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>
            {formatCurrency(data.amountPaid)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '0 10px' }}>
          <span>{t('paymentMode')}:</span>
          <span style={{ fontWeight: 600 }}>
            {data.paymentMode === 'CASH' ? '💵 ' : data.paymentMode === 'ONLINE' ? '💳 ' : data.paymentMode === 'CHEQUE' ? '📝 ' : '📄 '}
            {t(data.paymentMode?.toLowerCase() || 'cash')}
          </span>
        </div>
      </div>

      {/* Paid Months */}
      {data.paidMonths && data.paidMonths.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <span style={{ color: '#64748b', fontSize: 11 }}>✅ {t('paidMonths')}:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {data.paidMonths.map((month, idx) => (
              <span
                key={idx}
                style={{
                  background: '#dcfce7',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  color: '#166534',
                  border: '1px solid #86efac',
                }}
              >
                {month}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#94a3b8' }}>
        {t('generatedBy')}: {data.collectedBy || 'System'} | {formatDate(new Date())}
      </div>

      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
        {t('thankYou')}
      </div>
    </div>
  );

  return (
    <PriModal
      title={title}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="pri-btn pri-btn-ghost" onClick={() => window.print()} disabled={loading}>
              🖨️ {t('print')}
            </button>
            <button className="pri-btn pri-btn-ghost" onClick={onClose} disabled={loading}>
              {t('close')}
            </button>
          </div>
        </>
      }
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '10px' }}>
        {renderReceipt('original')}
        <div style={{ marginTop: 20 }}>
          {renderReceipt('duplicate')}
        </div>
      </div>
    </PriModal>
  );
}
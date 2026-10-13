// src/components/common/PrintReceipt.jsx

import React from 'react';
import PriModal from '../admin/PriModal';
import { useTranslation } from 'react-i18next';

function PrintReceipt({ 
  data, 
  showOriginal = true, 
  showDuplicate = true,
  onClose,
  loading = false,
  title = null
}) {
  const { t } = useTranslation();

  // Format currency helper
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  // Number to words helper
  const numberToWords = (num) => {
    if (num === undefined || num === null) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 20) return ones[n] + ' ';
      if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' ';
      return ones[Math.floor(n / 100)] + ' Hundred ' + convertLessThanThousand(n % 100);
    };

    if (num === 0) return 'Zero';
    
    let n = Math.floor(num);
    let result = '';
    
    if (n >= 100000) {
      result += convertLessThanThousand(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      result += convertLessThanThousand(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    result += convertLessThanThousand(n);
    
    return result.trim();
  };

  // Render receipt content
  const renderReceiptContent = (receiptData, isDuplicate = false) => {
    return (
      <div style={{
        fontFamily: "'Courier New', monospace",
        padding: isDuplicate ? '15px' : '20px',
        maxWidth: '600px',
        margin: '0 auto',
        fontSize: isDuplicate ? '11px' : '12px'
      }}>
        {/* School Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: isDuplicate ? 10 : 15, 
          borderBottom: '2px solid #1e3a5f', 
          paddingBottom: isDuplicate ? 6 : 10
        }}>
          <h1 style={{ 
            margin: 0, 
            color: '#1e3a5f', 
            fontSize: isDuplicate ? 16 : 20,
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            {receiptData.schoolName || 'School Name'}
          </h1>
          <p style={{ margin: '2px 0', fontSize: isDuplicate ? 9 : 11, color: '#475569' }}>
            📍 {receiptData.schoolAddress || 'School Address'}
          </p>
          <p style={{ margin: '2px 0', fontSize: isDuplicate ? 9 : 11, color: '#475569' }}>
            📞 {receiptData.schoolPhone || 'N/A'} | ✉️ {receiptData.schoolEmail || 'N/A'}
          </p>
        </div>

        {/* Receipt Title */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: isDuplicate ? 10 : 15,
          background: receiptData.type === 'due' ? '#fffbeb' : '#f0fdf4',
          padding: isDuplicate ? 5 : 8,
          borderRadius: 6
        }}>
          <h2 style={{ margin: 0, fontSize: isDuplicate ? 13 : 16, color: '#1e3a5f' }}>
            {receiptData.type === 'due' ? '📅 PREVIOUS YEAR DUE RECEIPT' : '💰 FEE PAYMENT RECEIPT'}
          </h2>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: isDuplicate ? 9 : 11,
            marginTop: isDuplicate ? 3 : 5
          }}>
            <span><strong>Receipt No:</strong> {receiptData.receiptNumber}</span>
            <span><strong>Date:</strong> {receiptData.paymentDate}</span>
          </div>
        </div>

        {/* Student Details */}
        <div style={{ 
          marginBottom: isDuplicate ? 10 : 15, 
          border: '1px solid #e2e8f0', 
          padding: isDuplicate ? 8 : 12, 
          borderRadius: 6,
          background: '#f8fafc'
        }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: isDuplicate ? 11 : 13, color: '#1e3a5f' }}>
            👤 Student Details:
          </h3>
          <table style={{ width: '100%', fontSize: isDuplicate ? 10 : 12, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 0', width: '35%', color: '#475569' }}><strong>Name:</strong></td>
                <td style={{ padding: '2px 0', fontWeight: 600 }}>{receiptData.studentName || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#475569' }}><strong>Roll Number:</strong></td>
                <td style={{ padding: '2px 0', fontWeight: 600 }}>{receiptData.rollNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0', color: '#475569' }}><strong>Class / Section:</strong></td>
                <td style={{ padding: '2px 0', fontWeight: 600 }}>{receiptData.className || 'N/A'} / {receiptData.sectionName || 'Section A'}</td>
              </tr>
              {receiptData.type === 'due' && (
                <>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569' }}><strong>Due From Year:</strong></td>
                    <td style={{ padding: '2px 0', fontWeight: 600 }}>{receiptData.fromYear || 'Previous Year'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569' }}><strong>Original Due:</strong></td>
                    <td style={{ padding: '2px 0', fontWeight: 600, color: '#f59e0b' }}>
                      {formatCurrency(receiptData.originalDueAmount || 0)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Details */}
        <div style={{ 
          marginBottom: isDuplicate ? 10 : 15, 
          border: '1px solid #e2e8f0', 
          padding: isDuplicate ? 8 : 12, 
          borderRadius: 6,
          background: '#ffffff'
        }}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: isDuplicate ? 11 : 13, color: '#1e3a5f' }}>
            💳 Payment Details:
          </h3>
          <table style={{ width: '100%', fontSize: isDuplicate ? 10 : 12, borderCollapse: 'collapse' }}>
            <tbody>
              {receiptData.type !== 'due' && (
                <>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569' }}>Total Annual Fees:</td>
                    <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(receiptData.totalFees || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569' }}>Total Paid Till Date:</td>
                    <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                      {formatCurrency(receiptData.totalPaid || 0)}
                    </td>
                  </tr>
                  <tr style={{ borderTop: '1px dashed #ccc' }}>
                    <td style={{ padding: '4px 0', fontWeight: 700 }}>Amount Paid Now:</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: isDuplicate ? 13 : 14 }}>
                      {formatCurrency(receiptData.amountPaid || 0)}
                    </td>
                  </tr>
                </>
              )}
              
              {receiptData.type === 'due' && (
                <>
                  <tr>
                    <td style={{ padding: '4px 0', fontWeight: 700 }}>Amount Paid Now:</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: isDuplicate ? 13 : 14 }}>
                      {formatCurrency(receiptData.amountPaid || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#475569' }}>Total Paid So Far:</td>
                    <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(receiptData.totalPaidSoFar || 0)}
                    </td>
                  </tr>
                </>
              )}
              
              <tr>
                <td style={{ padding: '2px 0', color: '#475569' }}>Payment Mode:</td>
                <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 600 }}>
                  <span style={{
                    background: receiptData.paymentMode === 'CASH' ? '#f0fdf4' : '#eff6ff',
                    padding: '2px 10px',
                    borderRadius: 12,
                    fontSize: isDuplicate ? 9 : 11
                  }}>
                    {receiptData.paymentMode || 'CASH'}
                  </span>
                </td>
              </tr>
              
              <tr style={{ borderTop: '1px dashed #ccc' }}>
                <td style={{ padding: '4px 0', fontWeight: 700 }}>Remaining Balance:</td>
                <td style={{ 
                  padding: '4px 0', 
                  textAlign: 'right', 
                  fontWeight: 800, 
                  color: receiptData.remainingDue > 0 ? '#ef4444' : '#16a34a',
                  fontSize: isDuplicate ? 13 : 14
                }}>
                  {formatCurrency(receiptData.remainingDue || 0)}
                </td>
              </tr>
              
              {receiptData.type === 'due' && receiptData.isFullyCleared !== undefined && (
                <tr>
                  <td style={{ padding: '2px 0', color: '#475569' }}>Status:</td>
                  <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 600 }}>
                    <span style={{
                      background: receiptData.isFullyCleared ? '#dcfce7' : '#fef9c3',
                      color: receiptData.isFullyCleared ? '#166534' : '#854d0e',
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: isDuplicate ? 9 : 11
                    }}>
                      {receiptData.isFullyCleared ? '✅ Fully Cleared' : '⏳ Partially Paid'}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div style={{ 
          marginBottom: isDuplicate ? 10 : 15, 
          padding: isDuplicate ? 6 : 10, 
          background: '#f8fafc', 
          borderRadius: 6, 
          fontSize: isDuplicate ? 10 : 12,
          border: '1px solid #e2e8f0'
        }}>
          <strong style={{ color: '#475569' }}>📝 Amount in Words:</strong>{' '}
          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {numberToWords(receiptData.amountPaid || 0)} Rupees Only
          </span>
        </div>

        {/* Signature Lines */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: isDuplicate ? 10 : 20,
          padding: '0 10px'
        }}>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ 
              borderTop: '2px solid #000', 
              width: '100%', 
              marginBottom: 3,
              paddingTop: isDuplicate ? 4 : 8
            }}></div>
            <p style={{ margin: 2, fontSize: isDuplicate ? 9 : 11, color: '#475569' }}>Cashier Signature</p>
          </div>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ 
              borderTop: '2px solid #000', 
              width: '100%', 
              marginBottom: 3,
              paddingTop: isDuplicate ? 4 : 8
            }}></div>
            <p style={{ margin: 2, fontSize: isDuplicate ? 9 : 11, color: '#475569' }}>Principal Signature</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: isDuplicate ? 6 : 10, 
          textAlign: 'center', 
          fontSize: isDuplicate ? 8 : 10, 
          color: '#94a3b8',
          borderTop: '1px dotted #cbd5e1',
          paddingTop: isDuplicate ? 4 : 8
        }}>
          ⚡ Computer Generated Receipt
        </div>
      </div>
    );
  };

  // Handle print
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt ${data.receiptNumber}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Courier New', monospace; 
                  background: white;
                  padding: 10px;
                }
                .receipt-container {
                  max-width: 700px;
                  margin: 0 auto;
                }
                .receipt-copy {
                  border: 2px solid #1e3a5f;
                  padding: 12px;
                  border-radius: 8px;
                  page-break-inside: avoid;
                  background: white;
                  margin-bottom: 15px;
                }
                .receipt-copy.duplicate {
                  border-color: #94a3b8;
                }
                .copy-label {
                  text-align: center;
                  font-weight: 800;
                  font-size: 13px;
                  margin-bottom: 8px;
                  padding: 4px 12px;
                  border-radius: 4px;
                  background: #1e3a5f;
                  color: white;
                  width: 100%;
                }
                .copy-label.duplicate-label {
                  background: #64748b;
                }
                @media print {
                  body { padding: 0; margin: 0; }
                  .receipt-container { max-width: 100%; padding: 5px; }
                  .receipt-copy {
                    border-color: #000 !important;
                    padding: 8px 10px;
                    margin-bottom: 10px;
                    page-break-after: avoid;
                  }
                  .receipt-copy.duplicate {
                    border-color: #666 !important;
                  }
                  .copy-label {
                    font-size: 11px;
                    padding: 3px 10px;
                  }
                }
                @page {
                  margin: 0.3cm;
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${document.getElementById('receipt-print-content').innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const modalTitle = title || `🧾 ${t('paymentReceiptOriginalDuplicate')}`;

  return (
    <PriModal
      title={modalTitle}
      onClose={onClose}
      wide
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button 
            className="pri-btn pri-btn-primary"
            onClick={handlePrint}
            disabled={loading}
            style={{
              background: '#1e3a5f',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🖨️ {t('printReceiptOriginalDuplicate')}
          </button>
          <button 
            className="pri-btn pri-btn-ghost"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            {t('close')}
          </button>
        </div>
      }
    >
      {/* Hidden Print Content */}
      <div id="receipt-print-content" style={{ display: 'none' }}>
        {showOriginal && (
          <div className="receipt-copy">
            <div className="copy-label">ORIGINAL COPY</div>
            {renderReceiptContent(data, false)}
          </div>
        )}
        {showDuplicate && (
          <div className="receipt-copy duplicate">
            <div className="copy-label duplicate-label">DUPLICATE COPY</div>
            {renderReceiptContent(data, true)}
          </div>
        )}
      </div>

      {/* Visible Preview */}
      <div style={{ 
        maxHeight: '70vh', 
        overflowY: 'auto', 
        padding: '10px',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        {showOriginal && (
          <div style={{ 
            background: 'white',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #1e3a5f',
            marginBottom: showDuplicate ? '15px' : 0,
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute',
              top: 10,
              left: 10,
              background: '#1e3a5f',
              color: 'white',
              padding: '4px 12px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600
            }}>
              {t('original') || 'ORIGINAL'}
            </div>
            {renderReceiptContent(data, false)}
          </div>
        )}

        {showDuplicate && (
          <div style={{ 
            background: 'white',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #94a3b8',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute',
              top: 10,
              left: 10,
              background: '#64748b',
              color: 'white',
              padding: '4px 12px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600
            }}>
              {t('duplicate') || 'DUPLICATE'}
            </div>
            {renderReceiptContent(data, true)}
          </div>
        )}
      </div>
    </PriModal>
  );
}

export default PrintReceipt;
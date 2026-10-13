// src/components/admin/Bus/fees/index.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import BusService from '../../../../services/BusService';
import PriModal from '../../../admin/PriModal';
import TableSkeleton from '../../../loaders/TableSkeleton';
import BusFeeReceipt from './BusFeeReceipt';
import ConfirmationDialog from '../../../common/table-componets/confirmation-dialog/index';

export default function FeeManager({
  schoolId,
  selectedBus,
  academicYearId,
  onToast,
  user,
}) {
  const { t } = useTranslation();

  // =========================================================
  // STATE
  // =========================================================

  const [dueReport, setDueReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState({
    amount: '',
    paymentMode: 'CASH',
  });

  const [collecting, setCollecting] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Student Fee History
  const [historyModal, setHistoryModal] = useState(false);
  const [feeHistory, setFeeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false,
  });

  // =========================================================
  // ACADEMIC YEAR
  // =========================================================

  const academicYearValue = useMemo(() => {
    if (!academicYearId) return '';

    if (typeof academicYearId === 'object') {
      return (
        academicYearId.id ||
        academicYearId.academicYearId ||
        academicYearId.value ||
        ''
      );
    }

    return academicYearId;
  }, [academicYearId]);

  const academicYearDisplay = useMemo(() => {
    if (
      academicYearId &&
      typeof academicYearId === 'object' &&
      academicYearId.currentYear
    ) {
      return academicYearId.currentYear;
    }

    return '2025-26';
  }, [academicYearId]);

  // =========================================================
  // SCHOOL INFO
  // =========================================================

  const schoolInfo = useMemo(
    () => ({
      schoolName:
        user?.schoolName ||
        user?.school?.schoolName ||
        'SMART SCHOOL',

      schoolAddress:
        user?.schoolAddress ||
        user?.school?.address ||
        'School Address',

      schoolPhone:
        user?.phoneNumber ||
        user?.school?.phoneNumber ||
        '________________',

      schoolEmail:
        user?.email ||
        user?.school?.mailId ||
        '________________',
    }),
    [user]
  );

  // =========================================================
  // LOAD DUE REPORT
  // =========================================================

  const loadDueReport = useCallback(async () => {
    if (!schoolId || !academicYearValue) {
      setDueReport([]);
      return;
    }

    setLoading(true);

    try {
      const response = await BusService.getMonthlyFeesDueReport(
        schoolId,
        academicYearValue
      );

      const responseData = response?.data ?? response ?? [];

      const data = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData?.content)
        ? responseData.content
        : [];

      const normalizedData = data.map((item, index) => {
        const studentId = item?.studentId || `temp-${index}`;
        const studentName = item?.studentName || 'Unknown Student';
        const enrollmentId = item?.enrollmentId || `ENR-${index + 1}`;
        
        const stopName = item?.stoppage || item?.stopName || '-';
        const stoppageId = item?.stoppageId || null;
        
        const monthlyFee = item?.monthlyFeeAmount || item?.monthlyFee || 0;
        const totalFee = item?.totalFeeAmount || item?.totalYearlyDue || 0;
        
        const paidAmount = item?.paidAmount || 0;
        const dueAmount = Math.max(0, totalFee - paidAmount);
        
        const selectedMonths = item?.selectedMonths || [];
        const dueMonths = item?.dueMonths || selectedMonths || [];

        return {
          ...item,
          studentId,
          studentName,
          enrollmentId,
          stoppageId,
          stopName,
          monthlyFee,
          totalFee,
          totalYearlyDue: totalFee,
          paidAmount,
          dueAmount,
          selectedMonths: selectedMonths,
          dueMonths: dueMonths,
          paymentFrequency: item?.paymentFrequency || 'MONTHLY',
          joiningMonth: item?.joiningMonth || 'July',
          totalMonthsSelected: item?.totalMonthsSelected || selectedMonths.length || 0,
          busId: selectedBus?.id || null,
          busNumber: selectedBus?.registrationNo || '-',
        };
      });

      setDueReport(normalizedData);
    } catch (error) {
      console.error('Error loading bus fee due report:', error);
      onToast?.(
        error?.response?.data?.message || t('errorLoadingDueReport'),
        'error'
      );
      setDueReport([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId, academicYearValue, selectedBus?.id, selectedBus?.registrationNo, onToast, t]);

  useEffect(() => {
    loadDueReport();
  }, [loadDueReport]);

  // =========================================================
  // LOAD STUDENT FEE HISTORY
  // API: GET /api/bus-monthly-fees/student/{studentId}/history
  // =========================================================

  const loadStudentFeeHistory = async (studentId) => {
    if (!studentId) {
      onToast?.(t('studentNotFound'), 'error');
      return;
    }

    setHistoryLoading(true);
    setFeeHistory([]);

    try {
      const response = await BusService.getStudentFeeHistory(studentId);
      
      const responseData = response?.data ?? response ?? [];
      
      const historyData = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
        ? responseData.data
        : [];

      // Format the history data as per new API response
      const formattedHistory = historyData.map((item) => ({
        id: item?.id || `temp-${Date.now()}`,
        studentId: item?.studentId,
        studentName: item?.studentName,
        academicYearId: item?.academicYearId,
        monthYear: item?.monthYear || '-',
        amountDue: item?.amountDue || 0,
        amountPaid: item?.amountPaid || 0,
        status: item?.status || 'PENDING',
        paymentDate: item?.paymentDate || '-',
        paymentMode: item?.paymentMode || 'CASH',
      }));

      setFeeHistory(formattedHistory);
      
      // Find student info from dueReport
      const studentInfo = dueReport.find(s => s.studentId === studentId);
      
      setSelectedStudentForHistory({
        studentId: studentId,
        studentName: studentInfo?.studentName || 'Student',
        enrollmentId: studentInfo?.enrollmentId || '-',
      });
      
      setHistoryModal(true);
    } catch (error) {
      console.error('Error loading student fee history:', error);
      onToast?.(
        error?.response?.data?.message || t('errorLoadingFeeHistory'),
        'error'
      );
      setFeeHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================================================
  // COLLECT BUS FEE
  // =========================================================

  const handleCollectFee = async () => {
    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      onToast?.(t('enterValidAmount'), 'error');
      return;
    }

    if (!selectedStudent) {
      onToast?.(t('studentNotFound'), 'error');
      return;
    }

    if (!academicYearValue) {
      onToast?.(t('academicYearRequired'), 'error');
      return;
    }

    const studentIdentifier = selectedStudent.studentId || selectedStudent.enrollmentId;

    if (!studentIdentifier) {
      onToast?.(t('studentNotFound'), 'error');
      return;
    }

    const maxDue = Number(selectedStudent.dueAmount ?? 0);

    if (amount > maxDue) {
      onToast?.(`${t('maxAmount')}: ₹${maxDue.toLocaleString()}`, 'error');
      return;
    }

    // Show confirmation before collecting fee
    setConfirmDialog({
      open: true,
      title: t('confirmCollection'),
      message: t('collectFeeConfirm', { amount: amount }),
      loading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        setCollecting(true);

        try {
          const response = await BusService.collectBusFee(
            studentIdentifier,
            academicYearValue,
            amount,
            form.paymentMode
          );

          const receipt = response?.data ?? response ?? {};

          const remainingDue = receipt?.remainingDue ?? Math.max(0, maxDue - amount);

          const receiptDataObj = {
            receiptNumber: receipt?.receiptNumber || `BUS-${Date.now().toString(36).toUpperCase()}`,
            paymentDate: receipt?.paymentDate || new Date().toISOString().split('T')[0],
            amountPaid: amount,
            paymentMode: receipt?.paymentMode || form.paymentMode,
            remainingDue,
            studentName: receipt?.studentName || selectedStudent.studentName,
            enrollmentId: receipt?.enrollmentId || selectedStudent.enrollmentId,
            stopName: receipt?.stopName || selectedStudent.stopName,
            monthlyFee: receipt?.monthlyFee ?? selectedStudent.monthlyFee ?? 0,
            totalYearlyDue: receipt?.totalYearlyDue ?? selectedStudent.totalFee ?? 0,
            months: receipt?.months ?? selectedStudent.dueMonths ?? [],
            busNumber: selectedBus?.registrationNo || 'N/A',
            totalPaid: receipt?.totalPaid ?? selectedStudent.paidAmount ?? 0,
            schoolName: schoolInfo.schoolName,
            schoolAddress: schoolInfo.schoolAddress,
            schoolPhone: schoolInfo.schoolPhone,
            schoolEmail: schoolInfo.schoolEmail,
            academicYear: academicYearDisplay,
          };

          setReceiptData(receiptDataObj);
          setShowReceipt(true);

          onToast?.(t('busFeeCollectedSuccess'), 'success');

          closeCollectModal();
          await loadDueReport();
          setConfirmDialog(prev => ({ ...prev, open: false, loading: false }));
          setCollecting(false);
        } catch (error) {
          console.error('Error collecting bus fee:', error);
          onToast?.(
            error?.response?.data?.message ||
              error?.response?.data?.error ||
              t('errorCollectingFee'),
            'error'
          );
          setConfirmDialog(prev => ({ ...prev, open: false, loading: false }));
          setCollecting(false);
        }
      }
    });
  };

  // =========================================================
  // OPEN COLLECT MODAL
  // =========================================================

  const openCollectModal = (row) => {
    const dueAmount = Number(row?.dueAmount ?? 0);
    setSelectedStudent(row);
    setForm({
      amount: dueAmount > 0 ? String(dueAmount) : '',
      paymentMode: 'CASH',
    });
    setModal(true);
  };

  // =========================================================
  // CLOSE COLLECT MODAL
  // =========================================================

  const closeCollectModal = () => {
    setModal(false);
    setSelectedStudent(null);
    setForm({
      amount: '',
      paymentMode: 'CASH',
    });
  };

  // =========================================================
  // TOTALS
  // =========================================================

  const totalDue = useMemo(
    () => dueReport.reduce((sum, row) => sum + Number(row?.dueAmount || 0), 0),
    [dueReport]
  );

  const totalPaid = useMemo(
    () => dueReport.reduce((sum, row) => sum + Number(row?.paidAmount || 0), 0),
    [dueReport]
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="pri-card">
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10,
          padding: 10,
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#1e3a5f' }}>
            💰 {t('busFeeDueReport')}
          </h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              marginTop: 6,
            }}
          >
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {t('students')}: <strong>{dueReport.length}</strong>
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {t('totalPaid')}:{' '}
              <strong style={{ color: '#16a34a' }}>
                ₹{totalPaid.toLocaleString()}
              </strong>
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {t('totalDue')}:{' '}
              <strong style={{ color: '#ef4444' }}>
                ₹{totalDue.toLocaleString()}
              </strong>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="pri-btn pri-btn-ghost pri-btn-sm"
            onClick={loadDueReport}
            disabled={loading}
          >
            ↻ {t('refresh')}
          </button>
        </div>
      </div>

      {/* BUS INFO */}
      {selectedBus?.id && (
        <div
          style={{
            padding: '10px 14px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          🚌 <strong>{selectedBus.registrationNo || selectedBus.busNumber || '-'}</strong>
          {academicYearDisplay && (
            <> | 📅 <strong>{academicYearDisplay}</strong></>
          )}
          {dueReport.length > 0 && (
            <> | 👨‍🎓 <strong>{dueReport.length} {t('students')}</strong></>
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="table-wrap">
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : dueReport.length === 0 ? (
          <div className="pri-empty">
            <div className="pri-empty-icon">💰</div>
            <p>{t('noDueReportFound')}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              {selectedBus?.id ? `${t('bus')}: ${selectedBus.registrationNo}` : t('noBusSelected')}
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              {t('academicYear')}: {academicYearDisplay}
            </p>
          </div>
        ) : (
          <table className="pri-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('student')}</th>
                <th>{t('stop')}</th>
                <th>{t('monthlyFee')}</th>
                <th>{t('totalYearlyDue')}</th>
                <th>{t('due')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {dueReport.map((row, index) => {
                const dueAmount = Number(row?.dueAmount ?? 0);
                const displayMonths = row?.dueMonths || row?.selectedMonths || [];
                const studentId = row?.studentId;

                return (
                  <tr key={row?.studentId || row?.enrollmentId || index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{row.studentName || '-'}</strong>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {row.enrollmentId || '-'}
                      </div>
                    </td>
                    <td>{row.stopName || '-'}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{Number(row.monthlyFee || 0).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{Number(row.totalFee || 0).toLocaleString()}
                    </td>
                    <td>
                      <span
                        style={{
                          color: dueAmount > 0 ? '#ef4444' : '#16a34a',
                          fontWeight: 700,
                        }}
                      >
                        ₹{dueAmount.toLocaleString()}
                      </span>
                      {displayMonths.length > 0 && (
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                          {displayMonths.length} {t('monthsDue')}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <button
                          className="pri-btn pri-btn-primary pri-btn-sm"
                          onClick={() => openCollectModal(row)}
                          disabled={dueAmount <= 0}
                        >
                          💳 {t('collect')}
                        </button>
                        <button
                          className="pri-btn pri-btn-info pri-btn-sm"
                          onClick={() => loadStudentFeeHistory(studentId)}
                          disabled={!studentId || historyLoading}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          📜 {t('history')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* COLLECT FEE MODAL */}
      {modal && selectedStudent && (
        <PriModal
          title={`💳 ${t('collectBusFee')} - ${selectedStudent.studentName || t('student')}`}
          onClose={closeCollectModal}
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={closeCollectModal} disabled={collecting}>
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={handleCollectFee} disabled={collecting}>
                {collecting ? t('processing') : `💳 ${t('collectFee')}`}
              </button>
            </>
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 16,
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t('student')}</div>
              <div style={{ fontWeight: 600 }}>{selectedStudent.studentName || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t('enrollmentNo')}</div>
              <div style={{ fontWeight: 600 }}>{selectedStudent.enrollmentId || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t('totalDue')}</div>
              <div style={{ fontWeight: 700, color: '#ef4444' }}>
                ₹{Number(selectedStudent.dueAmount || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* DUE MONTHS */}
          {selectedStudent.dueMonths?.length > 0 && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                background: '#fef3c7',
                borderRadius: 8,
                border: '1px solid #fde68a',
              }}
            >
              <strong>📅 {t('dueMonths')}:</strong>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  marginTop: 4,
                }}
              >
                {selectedStudent.dueMonths.map((month, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#fde68a',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    {month}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* FORM */}
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('amount')} (₹) *</label>
              <input
                type="number"
                min="1"
                max={Number(selectedStudent.dueAmount || 0)}
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                disabled={collecting}
                autoFocus
              />
            </div>
            <div className="pri-form-field">
              <label>{t('paymentMode')}</label>
              <select
                value={form.paymentMode}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentMode: e.target.value }))}
                disabled={collecting}
              >
                <option value="CASH">💵 {t('cash')}</option>
                <option value="ONLINE">💳 {t('online')}</option>
                <option value="CHEQUE">📝 {t('cheque')}</option>
                <option value="DD">📄 {t('dd')}</option>
              </select>
            </div>
          </div>
        </PriModal>
      )}

      {/* FEE HISTORY MODAL */}
      {historyModal && (
        <PriModal
          title={`📜 ${t('feeHistory')} - ${selectedStudentForHistory?.studentName || t('student')}`}
          onClose={() => {
            setHistoryModal(false);
            setFeeHistory([]);
            setSelectedStudentForHistory(null);
          }}
          size="lg"
          footer={
            <>
              <button
                className="pri-btn pri-btn-ghost"
                onClick={() => {
                  setHistoryModal(false);
                  setFeeHistory([]);
                  setSelectedStudentForHistory(null);
                }}
                disabled={historyLoading}
              >
                {t('close')}
              </button>
            </>
          }
        >
          {/* Student Info */}
          {selectedStudentForHistory && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 12,
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{t('student')}</div>
                <div style={{ fontWeight: 600 }}>{selectedStudentForHistory.studentName || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{t('enrollmentNo')}</div>
                <div style={{ fontWeight: 600 }}>{selectedStudentForHistory.enrollmentId || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{t('totalPayments')}</div>
                <div style={{ fontWeight: 600 }}>{feeHistory.length}</div>
              </div>
            </div>
          )}

          {/* History Table */}
          {historyLoading ? (
            <TableSkeleton rows={4} columns={6} />
          ) : feeHistory.length === 0 ? (
            <div className="pri-empty" style={{ padding: 40 }}>
              <div className="pri-empty-icon">📜</div>
              <p>{t('noFeeHistoryFound')}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="pri-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('monthYear')}</th>
                    <th>{t('amountDue')}</th>
                    <th>{t('amountPaid')}</th>
                    <th>{t('paymentMode')}</th>
                    <th>{t('paymentDate')}</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {feeHistory.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{item.monthYear || '-'}</td>
                      <td style={{ fontWeight: 600, color: '#dc2626' }}>
                        ₹{Number(item.amountDue || 0).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600, color: '#16a34a' }}>
                        ₹{Number(item.amountPaid || 0).toLocaleString()}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            background: item.paymentMode === 'CASH' ? '#dbeafe' : 
                                       item.paymentMode === 'ONLINE' ? '#d1fae5' : 
                                       item.paymentMode === 'CHEQUE' ? '#fef3c7' : '#f3e8ff',
                            color: item.paymentMode === 'CASH' ? '#1e40af' : 
                                   item.paymentMode === 'ONLINE' ? '#065f46' : 
                                   item.paymentMode === 'CHEQUE' ? '#92400e' : '#6b21a8',
                          }}
                        >
                          {item.paymentMode === 'CASH' ? '💵' : 
                           item.paymentMode === 'ONLINE' ? '💳' : 
                           item.paymentMode === 'CHEQUE' ? '📝' : '📄'} {item.paymentMode || '-'}
                        </span>
                      </td>
                      <td>{item.paymentDate || '-'}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            background: item.status === 'PAID' || item.status === 'COMPLETED' || item.status === 'SUCCESS' 
                              ? '#dcfce7' : '#fef3c7',
                            color: item.status === 'PAID' || item.status === 'COMPLETED' || item.status === 'SUCCESS' 
                              ? '#16a34a' : '#92400e',
                          }}
                        >
                          {item.status === 'PAID' || item.status === 'COMPLETED' || item.status === 'SUCCESS' 
                            ? '✅' : '⏳'} {item.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PriModal>
      )}

      {/* RECEIPT */}
      {showReceipt && receiptData && (
        <BusFeeReceipt
          data={receiptData}
          showOriginal={true}
          showDuplicate={true}
          onClose={() => {
            setShowReceipt(false);
            setReceiptData(null);
          }}
          loading={collecting}
          title={`🚌 ${t('busFeeReceipt')} - ${receiptData.receiptNumber}`}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        handleClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        handleConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        loader={confirmDialog.loading}
        confirmLabel={t('yes')}
        cancelLabel={t('no')}
      />
    </div>
  );
}
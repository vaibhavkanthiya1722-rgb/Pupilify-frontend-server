// src/components/admin/PriFees/index.jsx

import React, { useState, useEffect } from "react";
import PriModal from "../PriModal";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";
import PriFeesController from "./PriFeesController";
import TableSkeleton from "../../loaders/TableSkeleton";
import FeeCollectionModal from "../common/FeeCollectionModal";
import FeeAdjustmentModal from "../PriFees/FeeAdjustmentModal";
import PrintReceipt from "../../common/PrintReceipt";
import ActionsDropdown from "../../common/ActionsDropdown";
import { useTranslation } from 'react-i18next';
import FeeRecordModal from "./FeeRecordModal";

function PriFees({ 
  schoolId, 
  token, 
  classes, 
  sections, 
  onToast,
  academicYearId,
  academicYearName,
  user
}) {
  const { t } = useTranslation(); 

  // ✅ ADD THIS: School info state
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: 'SMART SCHOOL',
    schoolAddress: 'School Address',
    schoolPhone: '________________',
    schoolEmail: '________________'
  });

  // ✅ ADD THIS: Fetch school info from user prop
  useEffect(() => {
    if (user?.school) {
      setSchoolInfo({
        schoolName: user.school.schoolName || user.schoolName || 'SMART SCHOOL',
        schoolAddress: user.school.address || user.address || 'School Address',
        schoolPhone: user.school.phoneNumber || user.phoneNumber || '________________',
        schoolEmail: user.school.mailId || user.email || '________________'
      });
    } else if (user) {
      // Fallback if school is not nested
      setSchoolInfo({
        schoolName: user.schoolName || 'SMART SCHOOL',
        schoolAddress: user.address || 'School Address',
        schoolPhone: user.phoneNumber || '________________',
        schoolEmail: user.email || '________________'
      });
    }
  }, [user]);

  const {
    // State
    tab, setTab,
    structures,
    dueReport,
    modal, setModal,
    collectModal, setCollectModal,
    duePaymentModal, setDuePaymentModal,
    rollSearch, setRollSearch,
    loading,
    filterClass, setFilterClass,
    selectedDue, setSelectedDue,
    
    // Forms
    sForm, setSForm,
    dueForm,

    // Form handlers
    handleSFormChange,
    handleDFormChange,

    // Functions
    addStructure,
    archiveStructure,
    fetchStudentFeeDetails,
    payPreviousDue,
    loadDueReport,

    // Helpers
    structSections,
    formatCurrency,

    // Fee collection state
    feeCollectionStudent,
    setFeeCollectionStudent,
    feeCollectionLoading,
    setFeeCollectionLoading,
    feeCollectionReceiptData,
    setFeeCollectionReceiptData,
    feeCollectionShowReceipt,
    setFeeCollectionShowReceipt,

    // Due Report Action Handler
    handleDueReportAction,

    // Fee Record State
    recordModal,
    recordEnrollmentId,
    recordLoading,
    setRecordLoading,
    closeRecordModal,

    // Fee Adjustment State
    adjustmentModal,
    adjustmentStudent,
    adjustmentLoading,
    closeAdjustmentModal,
    handleSaveAdjustment,

    // ✅ NEW: Previous dues state and function
    previousDues,
    loadPreviousDues,
    isLoadingPreviousDues,

  } = PriFeesController({
    schoolId,
    classes,
    sections,
    onToast,
    academicYearId,
    academicYearName,
    user,
    t
  });

  // Dropdown handlers
  const handleFilterClassChange = (option) => {
    setFilterClass(option?.id || '');
  };

  const handleStructureClassChange = (option) => {
    const value = option?.id || '';
    setSForm(p => ({ ...p, classId: value, sectionId: '' }));
  };

  const handleStructureSectionChange = (option) => {
    setSForm(p => ({ ...p, sectionId: option?.id || '' }));
  };

  // Get selected values
  const selectedFilterClass = classes?.find(c => String(c.id) === String(filterClass)) || null;
  
  const selectedStructureClass = classes?.find(c => String(c.id) === String(sForm.classId)) || null;
  const selectedStructureSection = structSections?.find(s => String(s.id) === String(sForm.sectionId)) || null;

  // Action items for Due Report dropdown
  const dueReportActionItems = [
    { key: 'record', label: t('viewFeeRecord') },
    { key: 'adjustment', label: t('addFeeAdjustment') }
  ];

  // Handle fee collection success
  const handleFeeCollectionSuccess = (receiptData) => {
    setFeeCollectionReceiptData(receiptData);
    setFeeCollectionShowReceipt(true);
    if (tab === 'report') {
      loadDueReport();
    }
  };

  // ✅ NEW: Handle previous dues fetch for FeeCollectionModal
  const handleFetchPreviousDues = async (studentId) => {
    if (studentId) {
      await loadPreviousDues(studentId);
    }
  };

  return (
    <div className="pri-content">
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">💰 {t('feeManagement')}</div>
          <div className="content-text">
            {t('feeManagementDesc')} • {academicYearName && <span>{academicYearName}</span>}
          </div>
        </div>
      </div>
      
      <div className="tally-tabs">
        {[
          ['structure', `🏗️ ${t('feeStructure')}`], 
          ['report', `📊 ${t('dueReport')}`],
          ['collect', `💳 ${t('collectFees')}`]
        
        ].map(([tKey, label]) => (
          <button 
            key={tKey} 
            className={`tally-tab ${tab === tKey ? 'active' : ''}`} 
            onClick={() => setTab(tKey)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: FEE STRUCTURE */}
      {tab === 'structure' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="pri-btn pri-btn-primary pri-btn-sm" onClick={() => setModal(true)} disabled={loading}>
              + {t('setFeeStructure')}
            </button>
          </div>
          
          <div className="pri-card">
            <div className="table-wrap">
              {loading && structures.length === 0 ? (
                <TableSkeleton rows={5} columns={6} />
              ) : (
                <table className="pri-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('class')}</th>
                      <th>{t('section')}</th>
                      <th>{t('totalFees')}</th>
                      <th>{t('year')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="pri-empty">
                            <div className="pri-empty-icon">💰</div>
                            <p>{t('noFeeStructures')}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      structures.map((fs, i) => (
                        <tr key={fs.id}>
                          <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                          <td><strong style={{ color: '#1e3a5f' }}>{fs.schoolClass?.className || '—'}</strong></td>
                          <td><span style={{ 
                            background: '#f1f5f9',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            color: '#475569'
                          }}>{fs.section?.sectionName || t('sectionA')}</span></td>
                          <td><strong style={{ color: '#16a34a' }}>{formatCurrency(fs.totalFees)}</strong></td>
                          <td>
                            <span style={{ 
                              background: '#f1f5f9',
                              padding: '4px 10px',
                              borderRadius: 12,
                              fontSize: 12
                            }}>
                              {fs.academicYear?.currentYear || fs.academicYearId || '—'}
                            </span>
                          </td>
                          <td>
                            <button className="pri-btn pri-btn-danger pri-btn-sm" onClick={() => archiveStructure(fs.id)} disabled={loading}>
                              📦 {t('archive')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: COLLECT FEES */}
      {tab === 'collect' && (
        <div className="pri-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e3a5f', marginBottom: 16 }}>
            💳 {t('collectFeesByEnrollment')}
          </div>
          
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="pri-form-field" style={{ margin: 0, flex: 1, maxWidth: 300 }}>
              <label>{t('studentEnrollmentNumber')}</label>
              <input 
                value={rollSearch} 
                onChange={e => setRollSearch(e.target.value)} 
                placeholder={t('enrollmentPlaceholder')}
                onKeyDown={e => e.key === 'Enter' && fetchStudentFeeDetails()} 
                disabled={loading}
              />
            </div>
            <button className="pri-btn pri-btn-primary" onClick={fetchStudentFeeDetails} disabled={loading}>
              {loading ? '⏳' : `🔍 ${t('fetchDetails')}`}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DUE REPORT */}
      {tab === 'report' && (
        <>
          <div className="pri-filter-bar" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div className="pri-form-field" style={{ margin: 0, flex: 1, minWidth: 140 }}>
              <label>{t('classFilter')}</label>
              <PriAutocompleteSelect
                value={selectedFilterClass}
                data={classes || []}
                onChange={handleFilterClassChange}
                placeholder={t('allClasses')}
                optionLabel="className"
                optionValue="id"
                disabled={loading}
                size="medium"
                clearable
              />
            </div>
            <button className="pri-btn pri-btn-ghost pri-btn-sm" onClick={() => setFilterClass('')} disabled={loading}>
              {t('clear')}
            </button>
          </div>
          
          <div className="pri-card">
            <div className="table-wrap">
              {loading && dueReport.length === 0 ? (
                <TableSkeleton rows={5} columns={9} />
              ) : (
                <table className="pri-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('enrollmentNo')}</th>
                      <th>{t('student')}</th>
                      <th>{t('classSec')}</th>
                      <th>{t('total')}</th>
                      <th>{t('paid')}</th>
                      <th>{t('prevDue')}</th>
                      <th>{t('totalDue')}</th>
                      <th style={{ textAlign: 'center' }}>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dueReport.length === 0 ? (
                      <tr>
                        <td colSpan={9}>
                          <div className="pri-empty">
                            <div className="pri-empty-icon">📊</div>
                            <p>{t('noData')}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      dueReport.map((row, i) => {
                        const safeGrandTotalDue = Math.max(0, row.grandTotalDue || 0);
                        const hasAdvance = (row.grandTotalDue || 0) < 0;
                        const advanceAmount = hasAdvance ? Math.abs(row.grandTotalDue) : 0;
                        
                        const studentObj = {
                          id: row.studentId || row.id,
                          enrollmentId: row.enrollmentId,
                          name: row.studentName,
                          rollNumber: row.rollNumber,
                          schoolClass: { 
                            className: row.className,
                            id: row.classId
                          },
                          section: { 
                            sectionName: row.sectionName || 'Section A',
                            id: row.sectionId
                          }
                        };
                        
                        return (
                          <tr key={i}>
                            <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                            <td>
                              <div>{row.enrollmentId}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                {t('rollNo')}: {row.rollNumber !== null && row.rollNumber !== undefined ? row.rollNumber : t('notAssigned')}
                              </div>
                            </td>
                            <td><strong style={{ color: '#1e3a5f' }}>{row.studentName}</strong></td>
                            <td>
                              {row.className} / {!row.sectionName || row.sectionName === 'N/A' ? t('sectionA') : row.sectionName}
                            </td>
                            <td>{formatCurrency(row.currentYearFees)}</td>
                            <td style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(row.paidThisYear)}</td>
                            <td>
                              {row.previousYearDue > 0 ? (
                                <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                                  {formatCurrency(row.previousYearDue)}
                                </span>
                              ) : '—'}
                            </td>
                            <td>
                              {hasAdvance ? (
                                <span style={{ 
                                  color: '#f59e0b', 
                                  fontWeight: 800,
                                  background: '#fffbeb',
                                  padding: '3px 8px',
                                  borderRadius: 12,
                                  display: 'inline-block'
                                }}>
                                  ₹0 ({t('advance')}: {formatCurrency(advanceAmount)})
                                </span>
                              ) : (
                                <span style={{ 
                                  color: safeGrandTotalDue > 0 ? '#ef4444' : '#16a34a', 
                                  fontWeight: 800,
                                  background: safeGrandTotalDue > 0 ? '#fee2e2' : '#f0fdf4',
                                  padding: '3px 8px',
                                  borderRadius: 12
                                }}>
                                  {formatCurrency(safeGrandTotalDue)}
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ActionsDropdown
                                  student={studentObj}
                                  actions={dueReportActionItems}
                                  onAction={handleDueReportAction}
                                  disabled={loading}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL: Add Fee Structure */}
      {modal && (
        <PriModal 
          title={`🏗️ ${t('setFeeStructure')}`} 
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={() => setModal(false)} disabled={loading}>
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={addStructure} disabled={loading}>
                {loading ? '...' : t('setStructure')}
              </button>
            </>
          }
        >
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('class')} *</label>
              <PriAutocompleteSelect
                value={selectedStructureClass}
                data={classes || []}
                onChange={handleStructureClassChange}
                placeholder={t('selectClass')}
                optionLabel="className"
                optionValue="id"
                disabled={loading}
                size="medium"
                clearable
                required
              />
            </div>
            <div className="pri-form-field">
              <label>{t('section')} *</label>
              <PriAutocompleteSelect
                key={sForm.classId || "no-class"}
                value={selectedStructureSection}
                data={structSections || []}
                onChange={handleStructureSectionChange}
                placeholder={t('selectSection')}
                optionLabel="sectionName"
                optionValue="id"
                disabled={!sForm.classId || loading}
                size="medium"
                clearable={false}
                required
              />
            </div>
          </div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('totalAnnualFees')} (₹) *</label>
              <input value={sForm.totalFees} onChange={handleSFormChange('totalFees')} type="number" placeholder="15000" disabled={loading} />
            </div>
            <div className="pri-form-field">
              <label>{t('academicYear')}</label>
              <input 
                value={academicYearName} 
                disabled 
                style={{ background: '#f1f5f9' }} 
              />
              <small style={{ color: '#64748b' }}>{t('usingCurrentAcademicYear')}</small>
            </div>
          </div>
        </PriModal>
      )}

      {/* ✅ MODAL: Collect Fees - with previous dues support */}
      <FeeCollectionModal
        isOpen={collectModal}
        onClose={() => {
          setCollectModal(false);
          setFeeCollectionStudent(null);
        }}
        student={feeCollectionStudent}
        schoolId={schoolId}
        academicYearId={academicYearId}
        onToast={onToast}
        onSuccess={handleFeeCollectionSuccess}
        loading={feeCollectionLoading}
        setLoading={setFeeCollectionLoading}
        // ✅ NEW: Pass previous dues and fetch function
        previousDues={previousDues}
        onFetchPreviousDues={handleFetchPreviousDues}
        isLoadingPreviousDues={isLoadingPreviousDues}
      />
      

      {/* MODAL: Pay Previous Year Due */}
      {duePaymentModal && selectedDue && (
        <PriModal
          title={`📅 ${t('payPreviousYearDue')}`}
          onClose={() => { setDuePaymentModal(false); setSelectedDue(null); }}
          footer={
            <div className="pri-modal-footer">
              <button className="pri-btn pri-btn-ghost" onClick={() => { setDuePaymentModal(false); setSelectedDue(null); }} disabled={loading}>
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={payPreviousDue} disabled={loading}>
                {loading ? t('processing') : `💳 ${t('payDue')}`}
              </button>
            </div>
          }
        >
          <div style={{ 
            background: '#fffbeb', 
            border: '1px solid #fde68a', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 16 
          }}>
            <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: 12 }}>
              {t('dueFrom')} {selectedDue.fromYear || t('previousYear')}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{t('originalAmount')}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(selectedDue.dueAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{t('alreadyPaid')}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>
                  {formatCurrency(selectedDue.paidFromDue)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{t('remainingDue')}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>
                  {formatCurrency(selectedDue.remainingDue)}
                </div>
              </div>
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('amountPaying')} (₹) *</label>
              <input 
                value={dueForm.amountPaying} 
                onChange={handleDFormChange('amountPaying')} 
                type="number" 
                max={selectedDue.remainingDue}
                min="1"
                placeholder={`${t('max')}: ${selectedDue.remainingDue}`}
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('paymentMode')}</label>
              <select value={dueForm.paymentMode} onChange={handleDFormChange('paymentMode')} disabled={loading}>
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
            ℹ️ {t('partialPaymentNote')}
          </div>
        </PriModal>
      )}

      {/* MODAL: Fee Record */}
      <FeeRecordModal
        isOpen={recordModal}
        onClose={closeRecordModal}
        enrollmentId={recordEnrollmentId}
        onToast={onToast}
        loading={recordLoading}
        setLoading={setRecordLoading}
      />

      {/* MODAL: Fee Adjustment */}
      <FeeAdjustmentModal
        isOpen={adjustmentModal}
        onClose={closeAdjustmentModal}
        student={adjustmentStudent}
        onSave={handleSaveAdjustment}
        loading={adjustmentLoading}
        academicYearId={academicYearId}
      />

      {/* ✅ RECEIPT MODAL - UPDATED with school info */}
      {feeCollectionShowReceipt && feeCollectionReceiptData && (
        <PrintReceipt
          data={{
            ...feeCollectionReceiptData,
            // ✅ Override school data with actual school info
            schoolName: schoolInfo.schoolName,
            schoolAddress: schoolInfo.schoolAddress,
            schoolPhone: schoolInfo.schoolPhone,
            schoolEmail: schoolInfo.schoolEmail
          }}
          showOriginal={true}
          showDuplicate={true}
          onClose={() => {
            setFeeCollectionShowReceipt(false);
            setFeeCollectionReceiptData(null);
          }}
          loading={false}
          title={`🧾 ${t('paymentReceipt')}`}
        />
      )}
    </div>
  );
}

export default PriFees;
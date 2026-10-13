// src/components/admin/PriStudents/index.jsx

import React, { useState } from "react";
import PriModal from "../PriModal";
import SectionBadge from "../SectionBadge";
import InfoBox from "../InfoBox/index";
import PriStudentsController from "./PriStudentsController";
import DeleteButton from "../../common/DeleteButton";
import FileUpload from "../../common/FileUpload";
import TableSkeleton from "../../loaders/TableSkeleton";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";
import ActionsDropdown from "../../common/ActionsDropdown";
import { getMaxDate, getMinDOBDate } from "../../../utils/dateValidation";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StudentDetailsPrint from "./StudentDetailsPrint";
import FeesService from "../../../services/FeesService";
import PrintReceipt from "../../common/PrintReceipt";
import FeeAdjustmentModal from "../PriFees/FeeAdjustmentModal";
import FeeRecordModal from "../PriFees/FeeRecordModal";
import FeeCollectionModal from "../common/FeeCollectionModal";

function PriStudents({
  schoolId,
  token,
  classes,
  sections,
  onRefresh,
  onToast,
  academicYearId,
  user
}) {

  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  // Fee Collection States - Simplified
  const [feeCollectModal, setFeeCollectModal] = useState(false);
  const [feeStudent, setFeeStudent] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  // Receipt States
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fee Adjustment States
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [adjustmentStudent, setAdjustmentStudent] = useState(null);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  // Fee Record States
  const [recordModal, setRecordModal] = useState(false);
  const [recordEnrollmentId, setRecordEnrollmentId] = useState('');
  const [recordLoading, setRecordLoading] = useState(false);

  const {
    search, setSearch,
    filterClass, setFilterClass,
    filterSec, setFilterSec,
    filterGender, setFilterGender,
    filterCaste, setFilterCaste,
    modal,
    editModal,
    viewStudent,
    promoteModal,
    loading,
    validationErrors,
    form,
    editForm,
    classId,
    secId, setSecId,
    sFiles,
    editFiles,
    pForm, setPForm,
    filteredStudents,
    totalStudents,
    filteredCount,
    filteredSections,
    formSections,
    pSections,
    secName,
    handleFormChange,
    handleEditFormChange,
    onFileChange,
    onEditFileChange,
    loadStudents,
    submitStudent,
    updateStudent,
    promoteStudent,
    deleteStudent,
    openEnrollModal,
    closeEnrollModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    openPromoteModal,
    closePromoteModal,
    clearFilters,
    handleClassChange,
    exportStudents // ✅ ADDED
  } = PriStudentsController({
    schoolId,
    classes,
    sections,
    onRefresh,
    onToast,
    academicYearId,
    t
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const [printStudent, setPrintStudent] = useState(null);
  const errorStyle = {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  };

  // Section styles for better organization
  const sectionStyle = {
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    color: '#1e3a5f',
    fontSize: '15px',
    borderLeft: '4px solid #1e3a5f'
  };

  // ========== DROPDOWN HANDLERS ==========
  const handleFilterClassChange = (option) => {
    setFilterClass(option?.id || '');
    setFilterSec('');
  };

  const handleFilterSectionChange = (option) => {
    setFilterSec(option?.id || '');
  };

  const handleFilterGenderChange = (option) => {
    setFilterGender(option?.id || '');
  };

  const handleFilterCasteChange = (option) => {
    setFilterCaste(option?.id || '');
  };

  const handleEnrollClassChange = (option) => {
    const value = option?.id || '';
    handleClassChange(value);
  };

  const handleEnrollSectionChange = (option) => {
    setSecId(option?.id || '');
  };

  const handlePromoteClassChange = (option) => {
    const value = option?.id || '';
    setPForm(p => ({
      ...p,
      newClassId: value,
      newSectionId: ''
    }));
  };

  const handlePromoteSectionChange = (option) => {
    setPForm(p => ({
      ...p,
      newSectionId: option?.id || ''
    }));
  };

  // Get selected values
  const selectedFilterClass = classes?.find(c => String(c.id) === String(filterClass)) || null;
  const selectedFilterSection = filteredSections?.find(s => String(s.id) === String(filterSec)) || null;

  const genderOptions = [
    { id: '', name: t('allGenders') },
    { id: 'MALE', name: t('male') },
    { id: 'FEMALE', name: t('female') },
    { id: 'OTHER', name: t('other') }
  ];
  const selectedGender = genderOptions.find(g => g.id === filterGender) || genderOptions[0];

  const casteOptions = [
    { id: '', name: t('allCastes') },
    { id: 'GENERAL', name: t('general') },
    { id: 'OBC', name: t('obc') },
    { id: 'SC', name: t('sc') },
    { id: 'ST', name: t('st') },
    { id: 'OTHER', name: t('otherCaste') }
  ];
  const selectedCaste = casteOptions.find(c => c.id === filterCaste) || casteOptions[0];

  const selectedEnrollClass = classes?.find(c => String(c.id) === String(classId)) || null;
  const selectedEnrollSection = formSections?.find(s => String(s.id) === String(secId)) || null;

  const selectedPromoteClass = classes?.find(c => String(c.id) === String(pForm.newClassId)) || null;
  const selectedPromoteSection = pSections?.find(s => String(s.id) === String(pForm.newSectionId)) || null;

  // ========== FEE COLLECTION FUNCTIONS ==========
  const openFeeCollectModal = (student) => {
    setFeeStudent(student);
    setFeeCollectModal(true);
  };

  const closeFeeCollectModal = () => {
    setFeeCollectModal(false);
    setFeeStudent(null);
  };

  const handleFeeCollectionSuccess = (receiptData) => {
    setReceiptData(receiptData);
    setShowReceipt(true);
    loadStudents();
  };

  // ========== FEE ADJUSTMENT FUNCTIONS ==========
  const openAdjustmentModal = (student) => {
    setAdjustmentStudent(student);
    setAdjustmentModal(true);
  };

  const closeAdjustmentModal = () => {
    setAdjustmentModal(false);
    setAdjustmentStudent(null);
  };

  const handleSaveAdjustment = async (adjustmentData) => {
    setAdjustmentLoading(true);
    try {
      if (!adjustmentStudent) {
        onToast?.(t('noStudentSelected'), 'error');
        return;
      }

      if (!academicYearId) {
        onToast?.(t('academicYearRequired'), 'error');
        return;
      }

      console.log('📡 Saving adjustment for student:', adjustmentStudent.enrollmentId);
      console.log('📡 Adjustment data:', adjustmentData);
      console.log('📡 Academic Year:', academicYearId);

      const response = await FeesService.addFeeAdjustment(
        adjustmentStudent.enrollmentId,
        adjustmentData,
        academicYearId
      );

      console.log('✅ Adjustment saved:', response);
      onToast?.(t('adjustmentAddedSuccess'), 'success');
      closeAdjustmentModal();
      loadStudents();
    } catch (error) {
      console.error('❌ Error adding adjustment:', error);
      console.error('❌ Error response:', error.response?.data);

      let errorMessage = t('adjustmentError');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      onToast?.(errorMessage, 'error');
    } finally {
      setAdjustmentLoading(false);
    }
  };

  // ========== FEE RECORD FUNCTIONS ==========
  const openRecordModal = (student) => {
    setRecordEnrollmentId(student.enrollmentId);
    setRecordModal(true);
  };

  const closeRecordModal = () => {
    setRecordModal(false);
    setRecordEnrollmentId('');
  };

  // ========== ACTION HANDLER ==========
  const handleAction = (actionKey, student) => {
    switch (actionKey) {
      case 'view':
        openViewModal(student);
        break;
      case 'edit':
        openEditModal(student);
        break;
      case 'promote':
        openPromoteModal(student);
        break;
      case 'print':
        setPrintStudent(student);
        break;
      case 'collect':
        openFeeCollectModal(student);
        break;
      case 'adjustment':
        openAdjustmentModal(student);
        break;
      case 'record':
        openRecordModal(student);
        break;
      case 'delete':
        deleteStudent(student.id, student.name);
        break;
      default:
        break;
    }
  };

  // Action items for dropdown
  const actionItems = [
    { key: 'view', label: t('viewDetails') },
    { key: 'edit', label: t('editStudent') },
    { key: 'print', label: t('printStudentDetails') },
    {
      key: 'fees',
      label: t('fees'),
      icon: '💰',
      subItems: [
        { key: 'collect', label: t('collectFees') },
        { key: 'record', label: t('viewFeeRecord') },
        { key: 'adjustment', label: t('addFeeAdjustment') }
      ]
    },
    { key: 'promote', label: t('promoteStudent') },
  ];

  return (
    <div className="pri-content">
      {/* Header */}
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">🎓 {t('students')}</div>
          <div className="content-text">{totalStudents} {t('activeStudents')}</div>
        </div>
        
        {/* ✅ Button Group - Enroll + Export */}
        <div style={{ display: 'flex', gap: '10px' }}>
    
          <button
            className="pri-btn pri-btn-primary"
            onClick={exportStudents}
            disabled={loading || totalStudents === 0}
            title={totalStudents === 0 ? t('noStudentsToExport') : t('exportToExcel')}
          >
            📊 {t('export')}
          </button>
          
          <button
            className="pri-btn pri-btn-primary"
            onClick={() => {
              if (!classes.length) {
                onToast?.(t('addClassFirstWarning'), 'warning');
                return;
              }
              openEnrollModal();
            }}
            disabled={loading}
          >
            + {t('enrollStudent')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="pri-filter-bar">
        <div className="pri-form-field">
          <label>{t('class')}</label>
          <PriAutocompleteSelect
            value={selectedFilterClass}
            data={classes || []}
            onChange={handleFilterClassChange}
            placeholder={t('selectClass')}
            optionLabel="className"
            optionValue="id"
            disabled={loading}
            size="medium"
            clearable
          />
        </div>

        <div className="pri-form-field">
          <label>{t('section')}</label>
          <PriAutocompleteSelect
            key={filterClass || "no-class"}
            value={selectedFilterSection}
            data={filteredSections || []}
            onChange={handleFilterSectionChange}
            placeholder={t('allSections')}
            optionLabel="sectionName"
            optionValue="id"
            disabled={!filterClass || loading}
            size="medium"
            clearable
          />
        </div>

        <div className="pri-form-field">
          <label>{t('gender')}</label>
          <PriAutocompleteSelect
            value={selectedGender}
            data={genderOptions}
            onChange={handleFilterGenderChange}
            placeholder={t('allGenders')}
            optionLabel="name"
            optionValue="id"
            disabled={loading}
            size="medium"
            clearable
          />
        </div>

        <div className="pri-form-field">
          <label>{t('caste')}</label>
          <PriAutocompleteSelect
            value={selectedCaste}
            data={casteOptions}
            onChange={handleFilterCasteChange}
            placeholder={t('allCastes')}
            optionLabel="name"
            optionValue="id"
            disabled={loading}
            size="medium"
            clearable
          />
        </div>

        <button
          className="pri-btn pri-btn-ghost pri-btn-sm pd"
          onClick={clearFilters}
          disabled={loading}
        >
          {t('clear')}
        </button>

        <div className="pri-search-wrap">
          <span>🔍</span>
          <input
            className="pri-search-input"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="pri-card">
        <div className="pri-toolbar">
          <span>{t('showing')} {filteredCount} {t('students')}</span>
          <button className="pri-btn pri-btn-ghost pri-btn-sm" onClick={loadStudents} disabled={loading}>
            ↻
          </button>
        </div>

        <div className="table-wrap">
          {loading && filteredStudents.length === 0 ? (
            <TableSkeleton rows={5} columns={8} />
          ) : (
            <table className="pri-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('enrollmentNo')}</th>
                  <th>{t('student')}</th>
                  <th>{t('classSection')}</th>
                  <th>{t('gender')}</th>
                  <th>{t('caste')}</th>
                  <th style={{ textAlign: 'center' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="pri-empty">
                        <div className="pri-empty-icon">🎓</div>
                        <p>{t('noStudentsFound')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, i) => (
                    <tr key={student.id}>
                      <td>{i + 1}</td>
                      <td>
                        <span>{student.enrollmentId}</span>
                        <div className="roll-no">
                          {t('rollNo')}: {student.rollNumber !== null && student.rollNumber !== undefined ? student.rollNumber : t('notAssigned')}
                        </div>
                      </td>
                      <td>
                        <div className="common">
                          <div className="pri-avatar">
                            {student.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <span>{student.name}</span>
                            <div className="roll-no">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pri-class-badge">{student.schoolClass?.className || '—'}</span>
                        <span style={{ margin: '0 4px', color: '#94a3b8' }}>/</span>
                        <SectionBadge section={student.section} />
                      </td>
                      <td>
                        {student.gender ? (
                          <span className={`pri-badge ${student.gender === 'MALE' ? 'pri-badge-blue' :
                            student.gender === 'FEMALE' ? 'pri-badge-pink' :
                              'pri-badge-purple'
                            }`}>
                            {t(student.gender.toLowerCase())}
                          </span>
                        ) : '—'}
                      </td>
                      <td>{student.caste || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <ActionsDropdown
                            student={student}
                            actions={actionItems}
                            onAction={handleAction}
                            disabled={loading}
                          />
                          <DeleteButton
                            objectId={student.id}
                            objectName={student.name}
                            onDelete={deleteStudent}
                            itemType="Student"
                            title={t("deleteStudent")}
                            icon="🗑️"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ============ FEE COLLECTION MODAL ============ */}
      <FeeCollectionModal
        isOpen={feeCollectModal}
        onClose={closeFeeCollectModal}
        student={feeStudent}
        schoolId={schoolId}
        academicYearId={academicYearId}
        onToast={onToast}
        onSuccess={handleFeeCollectionSuccess}
        loading={feeLoading}
        setLoading={setFeeLoading}
      />

      {/* ============ RECEIPT MODAL ============ */}
      {showReceipt && receiptData && (
        <PrintReceipt
          data={receiptData}
          showOriginal={true}
          showDuplicate={true}
          onClose={() => {
            setShowReceipt(false);
            setReceiptData(null);
          }}
          loading={false}
          title={`🧾 ${t('paymentReceipt')}`}
        />
      )}

      {/* ============ FEE ADJUSTMENT MODAL ============ */}
      <FeeAdjustmentModal
        isOpen={adjustmentModal}
        onClose={closeAdjustmentModal}
        student={adjustmentStudent}
        onSave={handleSaveAdjustment}
        loading={adjustmentLoading}
        academicYearId={academicYearId}
      />

      {/* ============ FEE RECORD MODAL ============ */}
      <FeeRecordModal
        isOpen={recordModal}
        onClose={closeRecordModal}
        enrollmentId={recordEnrollmentId}
        onToast={onToast}
        loading={recordLoading}
        setLoading={setRecordLoading}
      />

      {/* ============ ENROLL STUDENT MODAL ============ */}
      {modal && (
        <PriModal
          title={`🎓 ${t('enrollStudent')}`}
          onClose={closeEnrollModal}
          wide
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={closeEnrollModal} disabled={loading}>
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={submitStudent} disabled={loading}>
                {loading ? t('saving') : t('enroll')}
              </button>
            </>
          }
        >
          {/* Class & Section */}
          <div style={sectionStyle}>📚 {t('classAndSection')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('class')} *</label>
              <PriAutocompleteSelect
                value={selectedEnrollClass}
                data={classes || []}
                onChange={handleEnrollClassChange}
                placeholder={t('selectClass')}
                optionLabel="className"
                optionValue="id"
                disabled={loading}
                size="medium"
                clearable
                required
                error={!!validationErrors.classId}
                helperText={validationErrors.classId}
              />
            </div>

            <div className="pri-form-field">
              <label>{t('section')} *</label>
              <PriAutocompleteSelect
                key={classId || "no-class"}
                value={selectedEnrollSection}
                data={formSections || []}
                onChange={handleEnrollSectionChange}
                placeholder={t('selectSection')}
                optionLabel="sectionName"
                optionValue="id"
                disabled={!classId || loading}
                size="medium"
                clearable={false}
                required
                error={!!validationErrors.secId}
                helperText={validationErrors.secId}
              />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('rollNumber')}</label>
              <input
                value={form.rollNumber}
                onChange={handleFormChange('rollNumber')}
                type="number"
                placeholder={t('enterRollNumberOptional')}
                min="1"
                step="1"
                style={validationErrors.rollNumber ? errorStyle : {}}
                className={validationErrors.rollNumber ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.rollNumber && (
                <span className="pri-error-message">{validationErrors.rollNumber}</span>
              )}
              <span className="pri-hint-text">{t('rollNumberHint')}</span>
            </div>
            <div className="pri-form-field" />
          </div>

          {/* Personal Information */}
          <div style={sectionStyle}>👤 {t('personalInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fullName')} *</label>
              <input
                value={form.name}
                onChange={handleFormChange('name')}
                placeholder={t('fullNamePlaceholder')}
                autoFocus
                style={validationErrors.name ? errorStyle : {}}
                className={validationErrors.name ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.name && (
                <span className="pri-error-message">{validationErrors.name}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('email')} *</label>
              <input
                value={form.email}
                onChange={handleFormChange('email')}
                type="email"
                placeholder={t('emailPlaceholder')}
                style={validationErrors.email ? errorStyle : {}}
                className={validationErrors.email ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.email && (
                <span className="pri-error-message">{validationErrors.email}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('gender')} *</label>
              <select
                value={form.gender}
                onChange={handleFormChange('gender')}
                style={validationErrors.gender ? errorStyle : {}}
                className={validationErrors.gender ? 'pri-input-error' : ''}
                disabled={loading}
              >
                <option value="">-- {t('selectGender')} --</option>
                <option value="MALE">{t('male')}</option>
                <option value="FEMALE">{t('female')}</option>
                <option value="OTHER">{t('other')}</option>
              </select>
              {validationErrors.gender && (
                <span className="pri-error-message">{validationErrors.gender}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('caste')}</label>
              <select value={form.caste} onChange={handleFormChange('caste')} disabled={loading}>
                <option value="">-- {t('selectCaste')} --</option>
                <option value="GENERAL">{t('general')}</option>
                <option value="OBC">{t('obc')}</option>
                <option value="SC">{t('sc')}</option>
                <option value="ST">{t('st')}</option>
                <option value="OTHER">{t('otherCaste')}</option>
              </select>
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('password')} *</label>
              <div className="input-wrapper-pass">
                <input
                  value={form.password}
                  onChange={handleFormChange('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder={t('passwordPlaceholderStudent')}
                  className={`pri-input ${validationErrors.password ? 'pri-input-error' : ''}`}
                  disabled={loading}
                />
                <IconButton
                  onClick={handleTogglePassword}
                  className="password-toggle-btn"
                  size="small"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </div>
              {validationErrors.password && (
                <span className="pri-error-message">{validationErrors.password}</span>
              )}
              <span className="pri-hint-text">{t('passwordHint')}</span>
            </div>
            <div className="pri-form-field">
              <label>{t('phone')}</label>
              <input
                value={form.phoneNo}
                onChange={handleFormChange('phoneNo')}
                placeholder={t('phonePlaceholder')}
                style={validationErrors.phoneNo ? errorStyle : {}}
                className={validationErrors.phoneNo ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.phoneNo && (
                <span className="pri-error-message">{validationErrors.phoneNo}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('dateOfBirth')}</label>
              <input
                value={form.dob}
                onChange={handleFormChange('dob')}
                type="date"
                max={getMaxDate()}
                min={getMinDOBDate()}
                style={validationErrors.dob ? errorStyle : {}}
                className={validationErrors.dob ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.dob && (
                <span className="pri-error-message">{validationErrors.dob}</span>
              )}
              <span className="pri-hint-text">{t('dobHint')}</span>
            </div>
            <div className="pri-form-field">
              <label>{t('aadharNumber')}</label>
              <input
                value={form.aadharCardNo}
                onChange={handleFormChange('aadharCardNo')}
                placeholder={t('aadharPlaceholder')}
                style={validationErrors.aadharCardNo ? errorStyle : {}}
                className={validationErrors.aadharCardNo ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.aadharCardNo && (
                <span className="pri-error-message">{validationErrors.aadharCardNo}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('samagraId')}</label>
              <input value={form.samagraId} onChange={handleFormChange('samagraId')} placeholder={t('samagraPlaceholder')} disabled={loading} />
            </div>
            <div className="pri-form-field">
              <label>{t('apaarId')}</label>
              <input value={form.apaarId} onChange={handleFormChange('apaarId')} placeholder={t('apaarPlaceholder')} disabled={loading} />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('address')}</label>
              <input
                value={form.address}
                onChange={handleFormChange('address')}
                placeholder={t('addressPlaceholder')}
                style={validationErrors.address ? errorStyle : {}}
                className={validationErrors.address ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.address && (
                <span className="pri-error-message">{validationErrors.address}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('postalCode')}</label>
              <input
                value={form.postalCode}
                onChange={handleFormChange('postalCode')}
                placeholder={t('postalCodePlaceholder')}
                maxLength={6}
                style={validationErrors.postalCode ? errorStyle : {}}
                className={validationErrors.postalCode ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.postalCode && (
                <span className="pri-error-message">{validationErrors.postalCode}</span>
              )}
            </div>
          </div>

          {/* Family Information */}
          <div style={sectionStyle}>👨‍👩‍👧 {t('familyInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fathersName')}</label>
              <input value={form.fatherName} onChange={handleFormChange('fatherName')} placeholder={t('fatherNamePlaceholder')} disabled={loading} />
            </div>
            <div className="pri-form-field">
              <label>{t('mothersName')}</label>
              <input value={form.motherName} onChange={handleFormChange('motherName')} placeholder={t('motherNamePlaceholder')} disabled={loading} />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fathersContact')}</label>
              <input
                value={form.fatherContactNumber}
                onChange={handleFormChange('fatherContactNumber')}
                placeholder={t('fatherContactPlaceholder')}
                style={validationErrors.fatherContactNumber ? errorStyle : {}}
                className={validationErrors.fatherContactNumber ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.fatherContactNumber && (
                <span className="pri-error-message">{validationErrors.fatherContactNumber}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('fatherOccupation')}</label>
              <input
                value={form.fatherOccupation}
                onChange={handleFormChange('fatherOccupation')}
                placeholder={t('fatherOccupationPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fatherSalary')}</label>
              <input
                value={form.fatherSalary}
                onChange={handleFormChange('fatherSalary')}
                type="number"
                placeholder={t('fatherSalaryPlaceholder')}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field" />
          </div>

          {/* Additional IDs */}
          <div style={sectionStyle}>🆔 {t('additionalIds')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('familyId')}</label>
              <input
                value={form.familyId}
                onChange={handleFormChange('familyId')}
                placeholder={t('familyIdPlaceholder')}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('scholarNo')}</label>
              <input
                value={form.scholarNo}
                onChange={handleFormChange('scholarNo')}
                placeholder={t('scholarNoPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          {/* PEN NUMBER ROW */}
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('penNumber')}</label>
              <input
                value={form.penNumber}
                onChange={handleFormChange('penNumber')}
                placeholder={t('penNumberPlaceholder')}
                disabled={loading}
                maxLength={15}
              />
              <span className="pri-hint-text">{t('penNumberHint')}</span>
            </div>
            <div className="pri-form-field" />
          </div>

          {/* Bank Information */}
          <div style={sectionStyle}>🏦 {t('bankInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('bankName')}</label>
              <input
                value={form.bankName}
                onChange={handleFormChange('bankName')}
                placeholder={t('bankNamePlaceholder')}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('bankAccountNo')}</label>
              <input
                value={form.bankAccountNo}
                onChange={handleFormChange('bankAccountNo')}
                placeholder={t('bankAccountPlaceholder')}
                style={validationErrors.bankAccountNo ? errorStyle : {}}
                className={validationErrors.bankAccountNo ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.bankAccountNo && (
                <span className="pri-error-message">{validationErrors.bankAccountNo}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('ifscCode')}</label>
              <input
                value={form.ifscCode}
                onChange={handleFormChange('ifscCode')}
                placeholder={t('ifscPlaceholder')}
                style={validationErrors.ifscCode ? errorStyle : {}}
                className={validationErrors.ifscCode ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.ifscCode && (
                <span className="pri-error-message">{validationErrors.ifscCode}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('branch')}</label>
              <input
                value={form.branch}
                onChange={handleFormChange('branch')}
                placeholder={t('branchPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          {/* Document Uploads */}
          <div style={sectionStyle}>📎 {t('documentUploads')}</div>
          <div className="pri-form-row">
            <FileUpload label={t('studentPhoto')} fileKey="photo" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('aadharCardImage')} fileKey="aadharImg" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('lastClassMarksheet')} fileKey="marksheet" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('transferCertificate')} fileKey="tcImg" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('samagraIdImage')} fileKey="samagraImg" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('bankPassbookImage')} fileKey="passbookImg" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('apaarCardImage')} fileKey="apaarImg" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('birthCertificate')} fileKey="birthCertificate" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('incomeCertificate')} fileKey="incomeCertificate" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('castCertificate')} fileKey="castCertificate" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('domicileCertificate')} fileKey="domicileCertificate" files={sFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
            <div className="pri-form-field" />
          </div>
        </PriModal>
      )}

      {/* ============ EDIT STUDENT MODAL ============ */}
      {editModal && (
        <PriModal
          title={`✏️ ${t('edit')} — ${editModal.name}`}
          onClose={closeEditModal}
          wide
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={closeEditModal} disabled={loading}>
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={updateStudent} disabled={loading}>
                {loading ? t('saving') : t('update')}
              </button>
            </>
          }
        >
          {/* Personal Information */}
          <div style={sectionStyle}>👤 {t('personalInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fullName')} *</label>
              <input value={editForm.name || ''} disabled />
              <span className="pri-hint-text" style={{ color: '#ef4444', fontSize: '12px' }}>
                ⚠️ {t('nameCannotBeChanged')}
              </span>
            </div>

            <div className="pri-form-field">
              <label>{t('email')}</label>
              <input value={editForm.email || ''} disabled />
              <span className="pri-hint-text" style={{ color: '#ef4444', fontSize: '12px' }}>
                ⚠️ {t('emailCannotBeChanged')}
              </span>
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('rollNumber')}</label>
              <input
                value={editForm.rollNumber || ''}
                onChange={handleEditFormChange('rollNumber')}
                type="number"
                placeholder={t('enterRollNumber')}
                min="1"
                step="1"
                style={validationErrors.rollNumber ? errorStyle : {}}
                className={validationErrors.rollNumber ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.rollNumber && (
                <span className="pri-error-message">{validationErrors.rollNumber}</span>
              )}
            </div>

            <div className="pri-form-field">
              <label>{t('dateOfBirth')}</label>
              <input value={editForm.dob || ''} disabled type="date" />
              <span className="pri-hint-text" style={{ color: '#ef4444', fontSize: '12px' }}>
                ⚠️ {t('dobCannotBeChanged')}
              </span>
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('phone')}</label>
              <input
                value={editForm.phoneNo || ''}
                onChange={handleEditFormChange('phoneNo')}
                placeholder={t('phonePlaceholder')}
                style={validationErrors.phoneNo ? errorStyle : {}}
                className={validationErrors.phoneNo ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.phoneNo && (
                <span className="pri-error-message">{validationErrors.phoneNo}</span>
              )}
            </div>

            <div className="pri-form-field">
              <label>{t('gender')}</label>
              <select value={editForm.gender || ''} onChange={handleEditFormChange('gender')} disabled={loading}>
                <option value="">-- {t('selectGender')} --</option>
                <option value="MALE">{t('male')}</option>
                <option value="FEMALE">{t('female')}</option>
                <option value="OTHER">{t('other')}</option>
              </select>
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('caste')}</label>
              <select value={editForm.caste || ''} onChange={handleEditFormChange('caste')} disabled={loading}>
                <option value="">-- {t('selectCaste')} --</option>
                <option value="GENERAL">{t('general')}</option>
                <option value="OBC">{t('obc')}</option>
                <option value="SC">{t('sc')}</option>
                <option value="ST">{t('st')}</option>
                <option value="OTHER">{t('otherCaste')}</option>
              </select>
            </div>

            <div className="pri-form-field">
              <label>{t('aadharNumber')}</label>
              <input
                value={editForm.aadharCardNo || ''}
                onChange={handleEditFormChange('aadharCardNo')}
                placeholder={t('aadharPlaceholder')}
                style={validationErrors.aadharCardNo ? errorStyle : {}}
                className={validationErrors.aadharCardNo ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.aadharCardNo && (
                <span className="pri-error-message">{validationErrors.aadharCardNo}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('samagraId')}</label>
              <input value={editForm.samagraId || ''} onChange={handleEditFormChange('samagraId')} placeholder={t('samagraPlaceholder')} disabled={loading} />
            </div>

            <div className="pri-form-field">
              <label>{t('apaarId')}</label>
              <input value={editForm.apaarId || ''} onChange={handleEditFormChange('apaarId')} placeholder={t('apaarPlaceholder')} disabled={loading} />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('address')}</label>
              <input
                value={editForm.address || ''}
                onChange={handleEditFormChange('address')}
                placeholder={t('addressPlaceholder')}
                style={validationErrors.address ? errorStyle : {}}
                className={validationErrors.address ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.address && (
                <span className="pri-error-message">{validationErrors.address}</span>
              )}
            </div>

            <div className="pri-form-field">
              <label>{t('postalCode')}</label>
              <input
                value={editForm.postalCode || ''}
                onChange={handleEditFormChange('postalCode')}
                placeholder={t('postalCodePlaceholder')}
                maxLength={6}
                style={validationErrors.postalCode ? errorStyle : {}}
                className={validationErrors.postalCode ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.postalCode && (
                <span className="pri-error-message">{validationErrors.postalCode}</span>
              )}
            </div>
          </div>

          {/* Family Information */}
          <div style={sectionStyle}>👨‍👩‍👧 {t('familyInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fathersName')}</label>
              <input value={editForm.fatherName || ''} onChange={handleEditFormChange('fatherName')} placeholder={t('fatherNamePlaceholder')} disabled={loading} />
            </div>

            <div className="pri-form-field">
              <label>{t('mothersName')}</label>
              <input value={editForm.motherName || ''} onChange={handleEditFormChange('motherName')} placeholder={t('motherNamePlaceholder')} disabled={loading} />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fathersContact')}</label>
              <input
                value={editForm.fatherContactNumber || ''}
                onChange={handleEditFormChange('fatherContactNumber')}
                placeholder={t('fatherContactPlaceholder')}
                style={validationErrors.fatherContactNumber ? errorStyle : {}}
                className={validationErrors.fatherContactNumber ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.fatherContactNumber && (
                <span className="pri-error-message">{validationErrors.fatherContactNumber}</span>
              )}
            </div>

            <div className="pri-form-field">
              <label>{t('fatherOccupation')}</label>
              <input
                value={editForm.fatherOccupation || ''}
                onChange={handleEditFormChange('fatherOccupation')}
                placeholder={t('fatherOccupationPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fatherSalary')}</label>
              <input
                value={editForm.fatherSalary || ''}
                onChange={handleEditFormChange('fatherSalary')}
                type="number"
                placeholder={t('fatherSalaryPlaceholder')}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field" />
          </div>

          {/* Additional IDs */}
          <div style={sectionStyle}>🆔 {t('additionalIds')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('familyId')}</label>
              <input
                value={editForm.familyId || ''}
                onChange={handleEditFormChange('familyId')}
                placeholder={t('familyIdPlaceholder')}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('scholarNo')}</label>
              <input
                value={editForm.scholarNo || ''}
                onChange={handleEditFormChange('scholarNo')}
                placeholder={t('scholarNoPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          {/* PEN NUMBER ROW IN EDIT */}
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('penNumber')}</label>
              <input
                value={editForm.penNumber || ''}
                onChange={handleEditFormChange('penNumber')}
                placeholder={t('penNumberPlaceholder')}
                disabled={loading}
                maxLength={15}
              />
              <span className="pri-hint-text">{t('penNumberHint')}</span>
            </div>
            <div className="pri-form-field" />
          </div>

          {/* Bank Information */}
          <div style={sectionStyle}>🏦 {t('bankInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('bankName')}</label>
              <input
                value={editForm.bankName || ''}
                onChange={handleEditFormChange('bankName')}
                placeholder={t('bankNamePlaceholder')}
                disabled={loading}
              />
            </div>

            <div className="pri-form-field">
              <label>{t('bankAccountNo')}</label>
              <input
                value={editForm.bankAccountNo || ''}
                onChange={handleEditFormChange('bankAccountNo')}
                placeholder={t('bankAccountPlaceholder')}
                style={validationErrors.bankAccountNo ? errorStyle : {}}
                className={validationErrors.bankAccountNo ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.bankAccountNo && (
                <span className="pri-error-message">{validationErrors.bankAccountNo}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('ifscCode')}</label>
              <input
                value={editForm.ifscCode || ''}
                onChange={handleEditFormChange('ifscCode')}
                placeholder={t('ifscPlaceholder')}
                style={validationErrors.ifscCode ? errorStyle : {}}
                className={validationErrors.ifscCode ? 'pri-input-error' : ''}
                disabled={loading}
              />
              {validationErrors.ifscCode && (
                <span className="pri-error-message">{validationErrors.ifscCode}</span>
              )}
            </div>

            <div className="pri-form-field">
              <label>{t('branch')}</label>
              <input
                value={editForm.branch || ''}
                onChange={handleEditFormChange('branch')}
                placeholder={t('branchPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          {/* Document Uploads */}
          <div style={sectionStyle}>📎 {t('updateDocuments')}</div>
          <div className="pri-note" style={{ marginBottom: '16px', backgroundColor: '#fef3c7', padding: '8px 12px', borderRadius: '8px' }}>
            💡 {t('documentUploadHint')}
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('studentPhoto')} fileKey="photo" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('aadharCardImage')} fileKey="aadharImg" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('lastClassMarksheet')} fileKey="marksheet" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('transferCertificate')} fileKey="tcImg" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('samagraIdImage')} fileKey="samagraImg" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('bankPassbookImage')} fileKey="passbookImg" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('apaarCardImage')} fileKey="apaarImg" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('birthCertificate')} fileKey="birthCertificate" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('incomeCertificate')} fileKey="incomeCertificate" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('castCertificate')} fileKey="castCertificate" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
          </div>

          <div className="pri-form-row">
            <FileUpload label={t('domicileCertificate')} fileKey="domicileCertificate" files={editFiles} onChange={onEditFileChange} maxSize={2} disabled={loading} />
            <div className="pri-form-field" />
          </div>
        </PriModal>
      )}

      {/* ============ VIEW STUDENT MODAL ============ */}
      {viewStudent && (
        <PriModal
          title={`🎓 ${t('studentProfile')}`}
          onClose={closeViewModal}
          wide
          footer={
            <button className="pri-btn pri-btn-primary" onClick={closeViewModal} disabled={loading}>
              {t('close')}
            </button>
          }
        >
          <div className="view-student-header">
            <div className="student-avatar">
              {viewStudent.name?.charAt(0)}
            </div>
            <div>
              <div className="student-name">
                {viewStudent.name}
              </div>
              <div className="section-preview mb-4">
                <span className="pri-class-badge">
                  {t('rollNo')}: {viewStudent.rollNumber || t('noRoll')}
                </span>
                <span className="pri-class-badge">
                  {viewStudent.schoolClass?.className}
                </span>
                <SectionBadge section={viewStudent.section} />
              </div>
            </div>
          </div>

          {/* ID Information */}
          <div style={sectionStyle}>🆔 {t('idInformation')}</div>
          <div className="pri-form-row">
            {[
              [t('aadharNumber'), viewStudent.aadharCardNo],
              [t('samagraId'), viewStudent.samagraId],
              [t('apaarId'), viewStudent.apaarId],
              [t('familyId'), viewStudent.familyId],
              [t('scholarNo'), viewStudent.scholarNo],
              [t('penNumber'), viewStudent.penNumber],
            ].map(([l, v]) => v && <InfoBox key={l} label={l} val={v} />)}
          </div>

          {/* Family Information */}
          <div style={sectionStyle}>👨‍👩‍👧 {t('familyInformation')}</div>
          <div className="pri-form-row">
            {[
              [t('fathersName'), viewStudent.fatherName],
              [t('mothersName'), viewStudent.motherName],
              [t('fathersContact'), viewStudent.fatherContactNumber],
              [t('fatherOccupation'), viewStudent.fatherOccupation],
              [t('fatherSalary'), viewStudent.fatherSalary],
            ].map(([l, v]) => v && <InfoBox key={l} label={l} val={v} />)}
          </div>

          {/* Bank Information */}
          <div style={sectionStyle}>🏦 {t('bankInformation')}</div>
          <div className="pri-form-row">
            {[
              [t('bankName'), viewStudent.bankName],
              [t('bankAccountNo'), viewStudent.bankAccountNo],
              [t('ifscCode'), viewStudent.ifscCode],
              [t('branch'), viewStudent.branch],
            ].map(([l, v]) => v && <InfoBox key={l} label={l} val={v} />)}
          </div>

          {/* Documents */}
          <div style={sectionStyle}>📎 {t('documents')}</div>
          <div className="pri-form-row">
            <InfoBox label={t('studentPhoto')} isFile={!!viewStudent.studentPhoto} val={viewStudent.studentPhoto || '—'} folder="students" />
            <InfoBox label={t('aadharCardImage')} isFile={!!viewStudent.aadharCardImage} val={viewStudent.aadharCardImage || '—'} folder="students" />
            <InfoBox label={t('lastClassMarksheet')} isFile={!!viewStudent.lastClassMarksheet} val={viewStudent.lastClassMarksheet || '—'} folder="students" />
            <InfoBox label={t('transferCertificate')} isFile={!!viewStudent.tcImage} val={viewStudent.tcImage || '—'} folder="students" />
            <InfoBox label={t('samagraIdImage')} isFile={!!viewStudent.samagraIdImage} val={viewStudent.samagraIdImage || '—'} folder="students" />
            <InfoBox label={t('bankPassbookImage')} isFile={!!viewStudent.bankPassbookImage} val={viewStudent.bankPassbookImage || '—'} folder="students" />
            <InfoBox label={t('apaarCardImage')} isFile={!!viewStudent.apaarCardImage} val={viewStudent.apaarCardImage || '—'} folder="students" />
            <InfoBox label={t('birthCertificate')} isFile={!!viewStudent.birthCertificate} val={viewStudent.birthCertificate || '—'} folder="students" />
            <InfoBox label={t('incomeCertificate')} isFile={!!viewStudent.incomeCertificate} val={viewStudent.incomeCertificate || '—'} folder="students" />
            <InfoBox label={t('castCertificate')} isFile={!!viewStudent.castCertificate} val={viewStudent.castCertificate || '—'} folder="students" />
            <InfoBox label={t('domicileCertificate')} isFile={!!viewStudent.domicileCertificate} val={viewStudent.domicileCertificate || '—'} folder="students" />
          </div>
          {!viewStudent.studentPhoto && !viewStudent.aadharCardImage && !viewStudent.lastClassMarksheet &&
            !viewStudent.tcImage && !viewStudent.samagraIdImage && !viewStudent.bankPassbookImage &&
            !viewStudent.apaarCardImage && !viewStudent.birthCertificate && !viewStudent.incomeCertificate &&
            !viewStudent.castCertificate && !viewStudent.domicileCertificate && (
              <div className="empty-state-card">
                📁 {t('noDocumentsUploaded')}
              </div>
            )}
        </PriModal>
      )}

      {/* ============ PROMOTE MODAL ============ */}
      {promoteModal && (
        <PriModal
          title={`⬆️ ${t('promote')} — ${promoteModal.name}`}
          onClose={closePromoteModal}
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={closePromoteModal} disabled={loading}>
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={promoteStudent} disabled={loading}>
                {loading ? '...' : `⬆️ ${t('promote')}`}
              </button>
            </>
          }
        >
          <div className="view-student-header">
            {t('current')}: <strong>{promoteModal.schoolClass?.className}</strong> /{' '}
            <strong>{secName(promoteModal.section)}</strong> · {t('roll')}:{' '}
            <strong>{promoteModal.rollNumber}</strong>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('newClass')} *</label>
              <PriAutocompleteSelect
                value={selectedPromoteClass}
                data={classes || []}
                onChange={handlePromoteClassChange}
                placeholder={t('newClass')}
                optionLabel="className"
                optionValue="id"
                disabled={loading}
                size="medium"
                clearable
                required
              />
            </div>
            <div className="pri-form-field">
              <label>{t('newSection')}</label>
              <PriAutocompleteSelect
                key={pForm.newClassId || "no-class"}
                value={selectedPromoteSection}
                data={pSections || []}
                onChange={handlePromoteSectionChange}
                placeholder={t('selectSection')}
                optionLabel="sectionName"
                optionValue="id"
                disabled={!pForm.newClassId || loading}
                size="medium"
                clearable
              />
            </div>
          </div>
        </PriModal>
      )}

      {/* ============ PRINT MODAL ============ */}
      {printStudent && (
        <PriModal
          key={`print-modal-${printStudent.id}`}
          title={`🖨️ ${t('printDetails')} — ${printStudent.name}`}
          onClose={() => {
            setPrintStudent(null);
          }}
          wide
          footer={
            <button
              className="pri-btn pri-btn-primary"
              onClick={() => {
                setPrintStudent(null);
              }}
            >
              {t('close')}
            </button>
          }
        >
          <StudentDetailsPrint
            key={`print-content-${printStudent.id}`}
            schoolId={schoolId}
            user={user}
            onToast={onToast}
            student={printStudent}
            onClose={() => setPrintStudent(null)}
            academicYearId={academicYearId}
          />
        </PriModal>
      )}
    </div>
  );
}

export default PriStudents;
import React, { useState, useEffect, useCallback, useRef } from "react";
import PriModal from "../PriModal";
import InfoBox from "../InfoBox/index";
import DeleteButton from "../../common/DeleteButton";
import EditAndViewButton from "../../common/EditAndViewButton";
import FileUpload from "../../common/FileUpload";
import TableSkeleton from "../../loaders/TableSkeleton";
import PriTeachersController from "./PriTeachersController";
import { formatDateForDisplay, getMaxDate, getMinDOBDate } from "../../../utils/dateValidation";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import TeachersService from "../../../services/TeachersService";
import { useTranslation } from 'react-i18next';

function PriTeachers({ schoolId, token, teachers: propTeachers, onRefresh, onToast }) {
  const { t } = useTranslation(); 
  const [showPassword, setShowPassword] = useState(false);
  const [localTeachers, setLocalTeachers] = useState([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const hasLoadedRef = useRef(false); // Prevent infinite loading

  // Use prop teachers if available, otherwise use local loaded teachers
  const teachers = (propTeachers && propTeachers.length > 0) ? propTeachers : localTeachers;

  // Fallback: Load teachers directly if propTeachers is empty (only once)
  const loadTeachersDirectly = useCallback(async () => {
    // Skip if already loaded or currently loading or propTeachers exist
    if (hasLoadedRef.current || isLoadingLocal || (propTeachers && propTeachers.length > 0)) {
      return;
    }
    
    if (schoolId) {
      setIsLoadingLocal(true);
      try {
        const data = await TeachersService.getTeachers(schoolId);
        setLocalTeachers(data || []);
      } catch (error) {
        console.error('❌ Error loading teachers directly:', error);
        onToast?.(t('teachersLoadFailed'), 'error');
      } finally {
        setIsLoadingLocal(false);
        hasLoadedRef.current = true; // Mark as loaded
      }
    }
  }, [propTeachers, schoolId, isLoadingLocal, onToast, t]);

  useEffect(() => {
    loadTeachersDirectly();
  }, [loadTeachersDirectly]);

  const {
    // State
    search, setSearch,
    modal,
    editModal,
    viewTeacher,
    loading,
    validationErrors,

    // Form state
    form,
    editForm,
    tFiles,

    // Data
    filteredTeachers,
    totalTeachers,

    // Handlers
    handleFormChange,
    handleEditFormChange,
    onFileChange,
    submitTeacher,
    updateTeacher,
    deleteTeacher,
    openOnboardModal,
    closeOnboardModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,

    // Helpers
    formatSalary

  } = PriTeachersController({
    schoolId,
    teachers,
    onRefresh,
    onToast,
    t
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const errorStyle = {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  };

  // Show loading while fetching data
  if (isLoadingLocal || (loading && teachers.length === 0)) {
    return (
      <div className="pri-content">
        <div className="pri-classes-header">
          <div className="mb">
            <div className="content-heading">👩‍🏫 {t('teachers')}</div>
            <div className="content-text">{t('loadingTeachers')}</div>
          </div>
          <button className="pri-btn pri-btn-primary" disabled>
            + {t('onboardTeacher')}
          </button>
        </div>
        <div className="pri-card">
          <div className="table-wrap">
            <TableSkeleton rows={5} columns={7} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pri-content">
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">👩‍🏫 {t('teachers')}</div>
          <div className="content-text">{totalTeachers} {t('activeTeachers')}</div>
        </div>
        <button className="pri-btn pri-btn-primary" onClick={openOnboardModal} disabled={loading}>
          + {t('onboardTeacher')}
        </button>
      </div>

      <div className="pri-card">
        <div className="pri-card-header">
          <div className="pri-search-wrap">
            <span>🔍</span>
            <input
              className="pri-search-input"
              placeholder={t('searchTeacherPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={loading}
            />
          </div>
          <button className="pri-btn pri-btn-ghost pri-btn-sm" onClick={onRefresh} disabled={loading}>
            ↻
          </button>
        </div>

        <div className="table-wrap">
          {loading && filteredTeachers.length === 0 ? (
            <TableSkeleton rows={5} columns={7} />
          ) : (
            <table className="pri-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('teacher')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('subject')}</th>
                  <th>{t('qualification')}</th>
                  <th>{t('salary')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="pri-empty">
                        <div className="pri-empty-icon">👩‍🏫</div>
                        <p>{t('noTeachersFound')}</p>
                        {propTeachers?.length === 0 && localTeachers.length === 0 && (
                          <button 
                            onClick={() => {
                              hasLoadedRef.current = false;
                              loadTeachersDirectly();
                            }}
                            className="pri-btn pri-btn-primary"
                            style={{ marginTop: 10 }}
                          >
                            {t('retry')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher, i) => (
                    <tr key={teacher.id}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="common">
                          <div className="pri-avatar">
                            {teacher.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <span>{teacher.name}</span>
                            <div className="roll-no">{teacher.mail}</div>
                          </div>
                        </div>
                      </td>
                      <td>{teacher.phoneNumber || '—'}</td>
                      <td><span className="pri-class-badge">{teacher.subjectExpertise || '—'}</span></td>
                      <td>{teacher.qualification || '—'}</td>
                      <td className="success">{formatSalary(teacher.salary)}</td>
                      <td>
                        <div className="pri-td-actions">
                          <EditAndViewButton
                            icon="👁️"
                            toolTipTitle={t('viewDetails')}
                            onClick={() => openViewModal(teacher)}
                            className="edit-button"
                          />
                          <EditAndViewButton
                            icon="✏️"
                            toolTipTitle={t('editTeacher')}
                            onClick={() => openEditModal(teacher)}
                            className="edit-button"
                          />
                          <DeleteButton
                            objectId={teacher.id}
                            objectName={teacher.name}
                            onDelete={deleteTeacher}
                            itemType={t('teacher')}
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

      {/* Onboard Teacher Modal */}
      {modal && (
        <PriModal
          title={`👩‍🏫 ${t('onboardTeacher')}`}
          onClose={closeOnboardModal}
          wide
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={closeOnboardModal} disabled={loading}>
                {t('cancel')}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={submitTeacher} disabled={loading}>
                {loading ? t('saving') : t('onboard')}
              </button>
            </>
          }
        >
          <div className="pri-section-divider">👤 {t('personalInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fullName')} *</label>
              <input
                value={form.name}
                onChange={handleFormChange('name')}
                placeholder={t('fullNamePlaceholder')}
                autoFocus
                disabled={loading}
                style={validationErrors.name ? errorStyle : {}}
                className={validationErrors.name ? 'pri-input-error' : ''}
              />
              {validationErrors.name && (
                <span className="pri-error-message">{validationErrors.name}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('emailLoginId')} *</label>
              <input
                value={form.mail}
                onChange={handleFormChange('mail')}
                type="email"
                placeholder={t('emailPlaceholderTeacher')}
                disabled={loading}
                style={validationErrors.mail ? errorStyle : {}}
                className={validationErrors.mail ? 'pri-input-error' : ''}
              />
              {validationErrors.mail && (
                <span className="pri-error-message">{validationErrors.mail}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('password')} *</label>
              <div style={{ position: 'relative' }}>
                <input
                  value={form.password}
                  onChange={handleFormChange('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder={t('passwordPlaceholder')}
                  disabled={loading}
                  style={validationErrors.password ? errorStyle : {}}
                  className={validationErrors.password ? 'pri-input-error' : ''}
                />
                <IconButton
                  onClick={handleTogglePassword}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '4px'
                  }}
                  size="small"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </div>
              {validationErrors.password && (
                <span className="pri-error-message">{validationErrors.password}</span>
              )}
              <span className="pri-hint-text">
                {t('passwordHint')}
              </span>
            </div>
            <div className="pri-form-field">
              <label>{t('dateOfBirth')}</label>
              <input
                value={form.dob}
                onChange={handleFormChange('dob')}
                type="date"
                max={getMaxDate()}
                min={getMinDOBDate()}
                disabled={loading}
                style={validationErrors.dob ? errorStyle : {}}
                className={validationErrors.dob ? 'pri-input-error' : ''}
              />
              {validationErrors.dob && (
                <span className="pri-error-message">{validationErrors.dob}</span>
              )}
              <span className="pri-hint-text">{t('teacherDobHint')}</span>
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('phoneNumber')}</label>
              <input
                value={form.phoneNumber}
                onChange={handleFormChange('phoneNumber')}
                placeholder={t('phonePlaceholder')}
                disabled={loading}
                style={validationErrors.phoneNumber ? errorStyle : {}}
                className={validationErrors.phoneNumber ? 'pri-input-error' : ''}
              />
              {validationErrors.phoneNumber && (
                <span className="pri-error-message">{validationErrors.phoneNumber}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('alternateNumber')}</label>
              <input
                value={form.alternateNumber}
                onChange={handleFormChange('alternateNumber')}
                placeholder={t('alternatePlaceholder')}
                disabled={loading}
                style={validationErrors.alternateNumber ? errorStyle : {}}
                className={validationErrors.alternateNumber ? 'pri-input-error' : ''}
              />
              {validationErrors.alternateNumber && (
                <span className="pri-error-message">{validationErrors.alternateNumber}</span>
              )}
            </div>
          </div>

          <div className="pri-form-field">
            <label>{t('address')}</label>
            <input
              value={form.address}
              onChange={handleFormChange('address')}
              placeholder={t('addressPlaceholder')}
              disabled={loading}
              style={validationErrors.address ? errorStyle : {}}
              className={validationErrors.address ? 'pri-input-error' : ''}
            />
            {validationErrors.address && (
              <span className="pri-error-message">{validationErrors.address}</span>
            )}
          </div>

          <div className="pri-section-divider">🎓 {t('professionalInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('qualification')} *</label>
              <input
                value={form.qualification}
                onChange={handleFormChange('qualification')}
                placeholder={t('qualificationPlaceholder')}
                disabled={loading}
                style={validationErrors.qualification ? errorStyle : {}}
                className={validationErrors.qualification ? 'pri-input-error' : ''}
              />
              {validationErrors.qualification && (
                <span className="pri-error-message">{validationErrors.qualification}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('subjectExpertise')} *</label>
              <input
                value={form.subjectExpertise}
                onChange={handleFormChange('subjectExpertise')}
                placeholder={t('subjectExpertisePlaceholder')}
                disabled={loading}
                style={validationErrors.subjectExpertise ? errorStyle : {}}
                className={validationErrors.subjectExpertise ? 'pri-input-error' : ''}
              />
              {validationErrors.subjectExpertise && (
                <span className="pri-error-message">{validationErrors.subjectExpertise}</span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('salary')} (₹)</label>
              <input
                value={form.salary}
                onChange={handleFormChange('salary')}
                type="number"
                placeholder={t('salaryPlaceholder')}
                step="1000"
                disabled={loading}
                style={validationErrors.salary ? errorStyle : {}}
                className={validationErrors.salary ? 'pri-input-error' : ''}
              />
              {validationErrors.salary && (
                <span className="pri-error-message">{validationErrors.salary}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t('aadharNumber')}</label>
              <input
                value={form.aadharNo}
                onChange={handleFormChange('aadharNo')}
                placeholder={t('aadharPlaceholder')}
                disabled={loading}
                style={validationErrors.aadharNo ? errorStyle : {}}
                className={validationErrors.aadharNo ? 'pri-input-error' : ''}
              />
              {validationErrors.aadharNo && (
                <span className="pri-error-message">{validationErrors.aadharNo}</span>
              )}
            </div>
          </div>

          <div className="pri-section-divider">📎 {t('documentUploads')}</div>
          <div className="pri-form-row">
            <FileUpload label={t('teacherPhoto')} fileKey="photo" files={tFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
            <FileUpload label={t('aadharCardImage')} fileKey="aadharImg" files={tFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
          </div>
          <div className="pri-form-row">
            <FileUpload label={t('bankPassbookImage')} fileKey="passbookImg" files={tFiles} onChange={onFileChange} maxSize={2} disabled={loading} />
            <div className="pri-form-field">
              <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0369a1', marginTop: 20 }}>
                💡 {t('documentUploadHintTeacher')}
              </div>
            </div>
          </div>
        </PriModal>
      )}

      {/* Edit Modal */}
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
              <button className="pri-btn pri-btn-primary" onClick={updateTeacher} disabled={loading}>
                {loading ? t('saving') : t('saveChanges')}
              </button>
            </>
          }
        >
          <div className="pri-section-divider">👤 {t('personalInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('fullName')}</label>
              <input
                value={editForm.name || ''}
                onChange={handleEditFormChange('name')}
                placeholder={t('fullNamePlaceholderTeacher')}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('dateOfBirth')}</label>
              <input
                value={editForm.dob || ''}
                onChange={handleEditFormChange('dob')}
                type="date"
                max={getMaxDate()}
                min={getMinDOBDate()}
                disabled={loading}
              />
            </div>
          </div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('phoneNumber')}</label>
              <input
                value={editForm.phoneNumber || ''}
                onChange={handleEditFormChange('phoneNumber')}
                placeholder={t('phonePlaceholder')}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('alternateNumber')}</label>
              <input
                value={editForm.alternateNumber || ''}
                onChange={handleEditFormChange('alternateNumber')}
                placeholder={t('alternatePlaceholder')}
                disabled={loading}
              />
            </div>
          </div>
          <div className="pri-form-field">
            <label>{t('address')}</label>
            <input
              value={editForm.address || ''}
              onChange={handleEditFormChange('address')}
              placeholder={t('addressPlaceholder')}
              disabled={loading}
            />
          </div>

          <div className="pri-section-divider">🎓 {t('professionalInformation')}</div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('qualification')}</label>
              <input
                value={editForm.qualification || ''}
                onChange={handleEditFormChange('qualification')}
                placeholder={t('qualificationPlaceholder')}
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('subjectExpertise')}</label>
              <input
                value={editForm.subjectExpertise || ''}
                onChange={handleEditFormChange('subjectExpertise')}
                placeholder={t('subjectExpertisePlaceholder')}
                disabled={loading}
              />
            </div>
          </div>
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t('salary')} (₹)</label>
              <input
                value={editForm.salary || ''}
                onChange={handleEditFormChange('salary')}
                type="number"
                placeholder={t('salaryPlaceholder')}
                step="1000"
                disabled={loading}
              />
            </div>
            <div className="pri-form-field">
              <label>{t('aadharNumber')}</label>
              <input
                value={editForm.aadharNo || ''}
                onChange={handleEditFormChange('aadharNo')}
                placeholder={t('aadharPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>
        </PriModal>
      )}

      {/* View Teacher Modal */}
      {viewTeacher && (
        <PriModal
          title={`👩‍🏫 ${t('teacherProfile')}`}
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
              {viewTeacher.name?.charAt(0)}
            </div>
            <div>
              <div className="student-name">
                {viewTeacher.name}
              </div>
              <div className="pri-card-sub">{viewTeacher.mail}</div>
            </div>
          </div>

          <div className="pri-section-divider">👤 {t('personalInformation')}</div>
          <div className="pri-form-row">
            {[
              [t('phone'), viewTeacher.phoneNumber],
              [t('alternateNumber'), viewTeacher.alternateNumber],
              [t('dateOfBirth'), viewTeacher.dob ? formatDateForDisplay(viewTeacher.dob) : null],
              [t('address'), viewTeacher.address],
            ].map(([l, v]) => v && <InfoBox key={l} label={l} val={v} />)}
          </div>

          <div className="pri-section-divider">🎓 {t('professionalInformation')}</div>
          <div className="pri-form-row">
            {[
              [t('qualification'), viewTeacher.qualification],
              [t('subjectExpertise'), viewTeacher.subjectExpertise],
              [t('salary'), viewTeacher.salary ? formatSalary(viewTeacher.salary) : null],
              [t('aadharNumber'), viewTeacher.aadharNo],
            ].map(([l, v]) => v && <InfoBox key={l} label={l} val={v} />)}
          </div>

          <div className="pri-section-divider">📎 {t('documents')}</div>
          <div className="pri-form-row">
            <InfoBox
              label={t('teacherPhoto')}
              isFile={!!viewTeacher.teacherPhoto}
              val={viewTeacher.teacherPhoto || '—'}
              folder="teachers"
              teacherId={viewTeacher.id}
              docType="photo"
            />
            <InfoBox
              label={t('aadharCard')}
              isFile={!!viewTeacher.aadharImage}
              val={viewTeacher.aadharImage || '—'}
              folder="teachers"
              teacherId={viewTeacher.id}
              docType="aadharImg"
            />
            <InfoBox
              label={t('bankPassbook')}
              isFile={!!viewTeacher.bankPassbookImage}
              val={viewTeacher.bankPassbookImage || '—'}
              folder="teachers"
              teacherId={viewTeacher.id}
              docType="passbookImg"
            />
          </div>

          {!viewTeacher.teacherPhoto && !viewTeacher.aadharImage && !viewTeacher.bankPassbookImage && (
            <div className="empty-state-card">
              📁 {t('noDocumentsUploaded')}
            </div>
          )}
        </PriModal>
      )}
    </div>
  );
}

export default PriTeachers;
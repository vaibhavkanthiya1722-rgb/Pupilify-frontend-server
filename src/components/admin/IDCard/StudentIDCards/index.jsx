// src/components/admin/IDCard/StudentIDCards.js

import React from "react";
import StudentIDCardsController from "./StudentIDCardsController";
import PriModal from "../../PriModal";
import PriAutocompleteSelect from "../../../common/PriAutocompleteSelect";
import TableSkeleton from "../../../loaders/TableSkeleton";
import { useTranslation } from 'react-i18next';

function StudentIDCards({
  schoolId,
  token,
  user,
  onToast,
  academicYearId
}) {
  const { t } = useTranslation(); 

  const {
    // State
    students,
    classes,
    sections,
    loading,
    search,
    filterClass,
    filterSection,
    selectedStudent,
    previewHtml,
    showPreview,
    bulkClass,
    bulkSection,
    showBulkModal,
    filteredSections,
    filteredStudents,
    totalStudents,
    totalClasses,
    totalSections,
    bulkStudentCount,

    // Setters
    setSearch,
    setFilterClass,
    setFilterSection,
    setBulkClass,
    setBulkSection,
    setShowBulkModal,

    // Functions
    loadStudents,
    generateIDCard,
    generateBulkIDCards,
    handlePrint,
    handleDownload,
    closePreview

  } = StudentIDCardsController({
    schoolId,
    academicYearId,
    onToast,
    t
  });

  // 🔥 Dropdown handlers
  const handleFilterClassChange = (option) => {
    setFilterClass(option?.id || '');
    setFilterSection('');
  };

  const handleFilterSectionChange = (option) => {
    setFilterSection(option?.id || '');
  };

  const handleBulkClassChange = (option) => {
    setBulkClass(option?.id || '');
    setBulkSection('');
  };

  const handleBulkSectionChange = (option) => {
    setBulkSection(option?.id || '');
  };

  // 🔥 Get selected values
  const selectedFilterClass = classes?.find(c => String(c.id) === String(filterClass)) || null;
  const selectedFilterSection = filteredSections?.find(s => String(s.id) === String(filterSection)) || null;
  
  const selectedBulkClass = classes?.find(c => String(c.id) === String(bulkClass)) || null;
  const bulkSections = bulkClass ? sections?.filter(s => String(s.classId) === String(bulkClass)) || [] : [];
  const selectedBulkSection = bulkSections?.find(s => String(s.id) === String(bulkSection)) || null;

  if (!academicYearId) {
    return (
      <div className="pri-content">
        <div className="pri-card">
          <div className="pri-empty">
            <div className="pri-empty-icon">⚠️</div>
            <p>{t('academicYearNotConfigured')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pri-content">
      {/* Header */}
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">
            🎓 {t('studentIdCards')}
          </div>
          <div className="content-text">
            {t('generatePrintStudentIdCards')}
          </div>
        </div>

        <button
          className="pri-btn pri-btn-primary"
          onClick={() => setShowBulkModal(true)}
          disabled={loading}
        >
          📦 {t('generateBulkIdCards')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-title">{t('totalStudents')}</div>
          <div className="stat-value">{totalStudents}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">{t('classes')}</div>
          <div className="stat-value">{totalClasses}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">{t('sections')}</div>
          <div className="stat-value">{totalSections}</div>
        </div>
      </div>

      {/* 🔥 Filter Bar with Dropdowns */}
      <div className="pri-filter-bar">
        <div className="pri-form-field">
          <label>{t('class')}</label>
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

        <div className="pri-search-wrap">
          <span>🔍</span>
          <input
            className="pri-search-input"
            placeholder={t('searchByNameRollFather')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          onClick={loadStudents}
          disabled={loading}
          className="load-btn pri-btn"
        >
          {loading ? `⟳ ${t('loading')}...` : `↻ ${t('refresh')}`}
        </button>
      </div>

      {/* Students Table */}
      <div className="pri-card">
        <div className="table-wrap">
          {loading && students.length === 0 ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <table className="pri-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('enrollmentNo')}</th>
                  <th>{t('studentName')}</th>
                  <th>{t('classSection')}</th>
                  <th>{t('fathersName')}</th>
                  <th>{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="pri-empty">
                        <div className="pri-empty-icon">🎓</div>
                        <p>{t('noStudentsFoundForYear', { year: academicYearId })}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="font-bolder">{s.enrollmentId}</span>
                        <div className="roll-no">
                          {t('rollNo')}: {s.rollNumber !== null && s.rollNumber !== undefined ? s.rollNumber : t('notAssigned')}
                        </div>
                      </td>
                      <td>
                        <div className="common">
                          <div className="avatar-box">
                            {s.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <span className="font-bolder">{s.name}</span>
                            <div className="roll-no">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pri-class-badge">
                          {s.schoolClass?.className || '—'}
                        </span>
                        <span className="margin">/</span>
                        <span className="pri-class-badge">
                          {s.section?.sectionName || t('sectionA')}
                        </span>
                      </td>
                      <td>{s.fatherName || '—'}</td>
                      <td>
                        <button
                          onClick={() => generateIDCard(s)}
                          disabled={loading}
                          className="pri-btn pri-btn-primary"
                        >
                          <span>🪪</span> {t('generateId')}
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

      {/* Preview Modal */}
      {showPreview && previewHtml && (
        <PriModal
          title={`🪪 ${t('studentIdCardPreview')}`}
          onClose={closePreview}
          wide
          footer={
            <div className="d-flex gap-8 justify-content-end">
              <button
                onClick={handlePrint}
                className="print-btn pri-btn"
                disabled={loading}
              >
                🖨️ {t('print')}
              </button>
              <button
                onClick={handleDownload}
                className="pri-btn excel-btn"
                disabled={loading}
              >
                ⬇️ {t('download')}
              </button>
              <button
                onClick={closePreview}
                className="pri-btn pri-btn-ghost"
                disabled={loading}
              >
                {t('close')}
              </button>
            </div>
          }
        >
          <div
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />

          {selectedStudent && (
            <div className="id-card-detail">
              <span><strong>{t('name')}:</strong> {selectedStudent.name}</span>
              <span><strong>{t('roll')}:</strong> {selectedStudent.rollNumber || '—'}</span>
              <span><strong>{t('class')}:</strong> {selectedStudent.schoolClass?.className || '—'}</span>
              <span><strong>{t('section')}:</strong> {selectedStudent.section?.sectionName || t('sectionA')}</span>
            </div>
          )}
        </PriModal>
      )}

      {/* 🔥 Bulk Generate Modal */}
      {showBulkModal && (
        <PriModal
          title={`📦 ${t('generateBulkStudentIdCards')}`}
          onClose={() => setShowBulkModal(false)}
          footer={
            <div className="d-flex gap-8 justify-content-end">
              <button
                onClick={generateBulkIDCards}
                disabled={loading}
                className="print-btn pri-btn"
              >
                {loading ? `⏳ ${t('generating')}...` : `📦 ${t('generate')}`}
              </button>
              <button
                onClick={() => setShowBulkModal(false)}
                className="pri-btn pri-btn-ghost"
                disabled={loading}
              >
                {t('cancel')}
              </button>
            </div>
          }
        >
          <div className="pri-form-field mb-10">
            <label>
              {t('selectClass')} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <PriAutocompleteSelect
              value={selectedBulkClass}
              data={classes || []}
              onChange={handleBulkClassChange}
              placeholder={t('chooseClass')}
              optionLabel="className"
              optionValue="id"
              disabled={loading}
              size="medium"
              clearable
              required
            />
          </div>

          <div className="pri-form-field mb-10">
            <label>
              {t('selectSectionOptional')}
            </label>
            <PriAutocompleteSelect
              key={bulkClass || "no-class"}
              value={selectedBulkSection}
              data={bulkSections || []}
              onChange={handleBulkSectionChange}
              placeholder={t('allSections')}
              optionLabel="sectionName"
              optionValue="id"
              disabled={!bulkClass || loading}
              size="medium"
              clearable
            />
          </div>

          <div className="info-box">
            <p className="info-text">
              <span className="info-icon">ℹ️</span>
              <span>
                {t('bulkGenerateInfo')} <strong>{t('allStudents')}</strong> {t('inSelectedClassSection')}
              </span>
            </p>
          </div>

          {bulkClass && (
            <div className="font-size-10 pd">
              📊 <strong>{bulkStudentCount}</strong> {t('studentCountWillBeIncluded')}
            </div>
          )}
        </PriModal>
      )}
    </div>
  );
}

export default StudentIDCards;
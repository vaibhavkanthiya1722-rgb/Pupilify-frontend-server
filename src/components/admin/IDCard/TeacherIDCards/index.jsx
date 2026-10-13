// src/components/admin/IDCard/TeacherIDCards.js

import React from "react";
import PriModal from "../../PriModal";
import PriAutocompleteSelect from "../../../common/PriAutocompleteSelect";
import TeacherIDCardsController from "./TeacherIDCardsController";
import TableSkeleton from "../../../loaders/TableSkeleton";
import { useTranslation } from 'react-i18next';

function TeacherIDCards({
  schoolId,
  token,
  user,
  onToast
}) {
  const { t } = useTranslation();

  const {
    // State
    teachers,
    subjects,
    loading,
    search,
    filterSubject,
    selectedTeacher,
    previewHtml,
    showPreview,
    filteredTeachers,
    totalTeachers,
    totalSubjects,
    qualifiedCount,

    // Setters
    setSearch,
    setFilterSubject,

    // Functions
    loadTeachers,
    generateIDCard,
    handlePrint,
    handleDownload,
    closePreview

  } = TeacherIDCardsController({
    schoolId,
    user,
    onToast,
    t  
  });

  // 🔥 Dropdown handler
  const handleSubjectChange = (option) => {
    setFilterSubject(option?.id || '');
  };

  // 🔥 Get selected subject
  const selectedSubject = subjects?.find(s => String(s.id) === String(filterSubject)) || null;
  
  const subjectOptions = subjects?.map(s => ({ id: s.id, name: s.subjectName })) || [];

  return (
    <div className="pri-content">
      {/* Header */}
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">
            👩‍🏫 {t('teacherIdCards')}
          </div>
          <div className="content-text">
            {t('generatePrintTeacherIdCards')}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-title">{t('totalTeachers')}</div>
          <div className="stat-value">{totalTeachers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">{t('subjects')}</div>
          <div className="stat-value">{totalSubjects}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">{t('qualified')}</div>
          <div className="stat-value">{qualifiedCount}</div>
        </div>
      </div>

      {/* 🔥 Filter Bar with Dropdown */}
      <div className="pri-filter-bar">
        <div className="pri-form-field">
          <label>{t('filterBySubject')}</label>
          <PriAutocompleteSelect
            value={selectedSubject}
            data={subjectOptions}
            onChange={handleSubjectChange}
            placeholder={t('allSubjects')}
            optionLabel="name"
            optionValue="id"
            disabled={loading}
            size="medium"
            clearable
          />
        </div>

        <div className="pri-search-wrap">
          <span>🔍</span>
          <input
            className="pri-search-input"
            placeholder={t('searchByNameEmailSubject')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          onClick={loadTeachers}
          disabled={loading}
          className="load-btn pri-btn"
        >
          {loading ? `⟳ ${t('loading')}...` : `↻ ${t('refresh')}`}
        </button>
      </div>

      {/* Teachers Table */}
      <div className="pri-card">
        <div className="table-wrap">
          {loading && teachers.length === 0 ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <table className="pri-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('teacher')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('subject')}</th>
                  <th>{t('qualification')}</th>
                  <th>{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="pri-empty">
                        <div className="pri-empty-icon">👩‍🏫</div>
                        <p>{t('noTeachersFound')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacherItem, idx) => (
                    <tr key={teacherItem.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="common">
                          <div className="avatar-box">
                            {teacherItem.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <span className="font-bolder">{teacherItem.name}</span>
                            <div className="roll-no">{teacherItem.mail}</div>
                          </div>
                        </div>
                      </td>
                      <td>{teacherItem.phoneNumber || '—'}</td>
                      <td>
                        <span>{teacherItem.subjectExpertise || '—'}</span>
                      </td>
                      <td>{teacherItem.qualification || '—'}</td>
                      <td>
                        <button
                          onClick={() => generateIDCard(teacherItem)}
                          disabled={loading}
                          className="pri-btn pri-btn-primary"
                        >
                          <span>🪪</span> {t('generateIdCard')}
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
          title={`👩‍🏫 ${t('teacherIdCardPreview')}`}
          onClose={closePreview}
          wide
          footer={
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handlePrint} className="print-btn pri-btn" disabled={loading}>
                🖨️ {t('print')}
              </button>
              <button onClick={handleDownload} className="pri-btn excel-btn" disabled={loading}>
                ⬇️ {t('download')}
              </button>
              <button onClick={closePreview} className="pri-btn pri-btn-ghost" disabled={loading}>
                {t('close')}
              </button>
            </div>
          }
        >
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />

          {selectedTeacher && (
            <div className="id-card-detail">
              <div><strong>{t('name')}:</strong> {selectedTeacher.name}</div>
              <div><strong>{t('email')}:</strong> {selectedTeacher.mail || '—'}</div>
              <div><strong>{t('subject')}:</strong> {selectedTeacher.subjectExpertise || '—'}</div>
              <div><strong>{t('qualification')}:</strong> {selectedTeacher.qualification || '—'}</div>
              <div><strong>{t('phone')}:</strong> {selectedTeacher.phoneNumber || '—'}</div>
            </div>
          )}
        </PriModal>
      )}
    </div>
  );
}

export default TeacherIDCards;
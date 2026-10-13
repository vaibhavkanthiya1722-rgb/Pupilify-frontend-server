import React from "react";
import { useTranslation } from "react-i18next";
import ExamScheduleController from "./ExamScheduleController";
import ExamScheduleView from "./ExamScheduleView";
import ExamScheduleCreate from "./ExamScheduleCreate";
import ExamScheduleBulk from "./ExamScheduleBulk";

function ExamSchedule({
  schoolId, token, classes, sections, subjects, onToast, academicYearId, academicYearName, user
}) {
  const { t } = useTranslation(); 

  const controller = ExamScheduleController({
    schoolId: schoolId || '',
    token: token || '',
    classes: classes || [],
    sections: sections || [],
    subjects: subjects || [],
    onToast: onToast || (() => { }),
    academicYearId: academicYearId || '',
    academicYearName: academicYearName || '',
    user: user || {},
    t
  });

  const {
    activeTab, setActiveTab, loading,
    filterClass, setFilterClass, filterSection, setFilterSection, filterExamName, setFilterExamName,
    bulkFilterClass, setBulkFilterClass,
    filteredSections, bulkFilteredSections,
    exams, examNames,
    form, bulkForm, availableSubjects, bulkSchedules,
    bulkPreviewModal, setBulkPreviewModal,
    formFilteredSubjects,
    dateError, todayDate,
    loadExams, handleFormChange, handleBulkFormChange, handleSubjectToggle, 
    selectAllSubjects, clearAllSubjects, generateBulkPreview, updateBulkScheduleItem, 
    submitBulkSchedules, generateSchedule, deleteSchedule, clearViewFilters,
    handlePrint, handleExportExcel,
    formatTime, formatDate
  } = controller;

  // Get filtered sections for single form
  const singleFormSections = form?.classId && sections && sections.length
    ? sections.filter(s => String(s.classId) === String(form.classId))
    : [];

  return (
    <div className="pri-content">
      {/* Header */}
      <div className="mb">
        <div className="content-heading">
          📅 {t("examScheduleTitle")}
        </div>
        <div className="content-text">
          {t("examScheduleDescription")} • {academicYearName && <span>{academicYearName}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tally-tabs">
        <button
          className={`tally-tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          📋 {t("viewSchedule")}
        </button>
        <button
          className={`tally-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ✏️ {t("createSingle")}
        </button>
        <button
          className={`tally-tab ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          📦 {t("bulkCreate")}
        </button>
      </div>

      {/* TAB 1: View Schedule */}
      {activeTab === 'view' && (
        <ExamScheduleView
          exams={exams}
          loading={loading}
          filterClass={filterClass}
          setFilterClass={setFilterClass}
          filterSection={filterSection}
          setFilterSection={setFilterSection}
          filterExamName={filterExamName}
          setFilterExamName={setFilterExamName}
          examNames={examNames}
          classes={classes}
          filteredSections={filteredSections}
          loadExams={loadExams}
          clearFilters={clearViewFilters}
          handlePrint={handlePrint}
          handleExportExcel={handleExportExcel}
          deleteSchedule={deleteSchedule}
          formatDate={formatDate}
          formatTime={formatTime}
          t={t}
        />
      )}

      {/* TAB 2: Create Single Schedule */}
      {activeTab === 'create' && (
        <ExamScheduleCreate
          form={form}
          classes={classes}
          sections={sections}
          singleFormSections={singleFormSections}
          formFilteredSubjects={formFilteredSubjects}
          examNames={examNames}
          loading={loading}
          dateError={dateError}
          todayDate={todayDate}
          handleFormChange={handleFormChange}
          generateSchedule={generateSchedule}
          t={t}
        />
      )}

      {/* TAB 3: Bulk Create Schedule */}
      {activeTab === 'bulk' && (
        <ExamScheduleBulk
          bulkForm={bulkForm}
          classes={classes}
          bulkFilterClass={bulkFilterClass}
          setBulkFilterClass={setBulkFilterClass}
          bulkFilteredSections={bulkFilteredSections}
          availableSubjects={availableSubjects}
          bulkSchedules={bulkSchedules}
          bulkPreviewModal={bulkPreviewModal}
          setBulkPreviewModal={setBulkPreviewModal}
          loading={loading}
          todayDate={todayDate}
          handleBulkFormChange={handleBulkFormChange}
          handleSubjectToggle={handleSubjectToggle}
          selectAllSubjects={selectAllSubjects}
          clearAllSubjects={clearAllSubjects}
          generateBulkPreview={generateBulkPreview}
          updateBulkScheduleItem={updateBulkScheduleItem}
          submitBulkSchedules={submitBulkSchedules}
          t={t}
        />
      )}
    </div>
  );
}

export default ExamSchedule;
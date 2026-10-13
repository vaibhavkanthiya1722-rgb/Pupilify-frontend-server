import React from 'react';
import TableSkeleton from '../../loaders/TableSkeleton';
import PriAutocompleteSelect from '../../common/PriAutocompleteSelect';

function ExamScheduleView({
  exams,
  loading,
  filterClass,
  setFilterClass,
  filterSection,
  setFilterSection,
  filterExamName,
  setFilterExamName,
  examNames,
  classes,
  filteredSections,
  loadExams,
  clearFilters,
  handlePrint,
  handleExportExcel,
  deleteSchedule,
  formatDate,
  formatTime,
  t
}) {
  // Get selected values for dropdowns
  const selectedClass = classes?.find(c => String(c.id) === String(filterClass)) || null;
  const selectedSection = filteredSections?.find(s => String(s.id) === String(filterSection)) || null;
  
  const examNameOptions = examNames?.map(name => ({ id: name, name: name })) || [];
  const selectedExamName = examNameOptions.find(e => e.id === filterExamName) || null;

  // Handlers
  const handleClassChange = (option) => {
    setFilterClass(option?.id || '');
    setFilterSection('');
  };

  const handleSectionChange = (option) => {
    setFilterSection(option?.id || '');
  };

  const handleExamNameChange = (option) => {
    setFilterExamName(option?.id || '');
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="pri-filter-bar">
        <div className="pri-form-field">
          <label>{t("class")} *</label>
          <PriAutocompleteSelect
            value={selectedClass}
            data={classes || []}
            onChange={handleClassChange}
            placeholder={t("selectClass")}
            optionLabel="className"
            optionValue="id"
            disabled={loading}
            size="medium"
            clearable
          />
        </div>

        <div className="pri-form-field">
          <label>{t("section")}</label>
          <PriAutocompleteSelect
            key={filterClass || "no-class"}
            value={selectedSection}
            data={filteredSections || []}
            onChange={handleSectionChange}
            placeholder={t("allSections")}
            optionLabel="sectionName"
            optionValue="id"
            disabled={!filterClass || loading}
            size="medium"
            clearable
          />
        </div>

        <div className="pri-form-field">
          <label>{t("examName")}</label>
          <PriAutocompleteSelect
            value={selectedExamName}
            data={examNameOptions}
            onChange={handleExamNameChange}
            placeholder={t("allExams")}
            optionLabel="name"
            optionValue="id"
            disabled={loading}
            size="medium"
            clearable
          />
        </div>

        <div className="common">
          <button
            className="load-btn pri-btn" 
            onClick={loadExams}
            disabled={!filterClass || loading}
          >
            {loading ? `⏳ ${t("loading")}` : `🔍 ${t("load")}`}
          </button>

          <button
            className="print-btn pri-btn"
            onClick={handlePrint}
            disabled={!exams || exams.length === 0 || loading}
          >
            🖨️ {t("print")}
          </button>

          <button
            className="pri-btn excel-btn"
            onClick={handleExportExcel}
            disabled={!exams || exams.length === 0 || loading}
          >
            📥 {t("excel")}
          </button>

          <button
            className="pri-btn pri-btn-ghost"
            onClick={clearFilters}
            disabled={loading}
          >
            {t("clear")}
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="pri-card">
        <div className="table-wrap">
          {loading && (!exams || exams.length === 0) ? (
            <TableSkeleton rows={5} columns={7} />
          ) : (
            <table className="pri-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("examName")}</th>
                  <th>{t("subject")}</th>
                  <th>{t("date")}</th>
                  <th>{t("time")}</th>
                  <th>{t("section")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {!exams || exams.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="pri-empty">
                        <div className="pri-empty-icon">📅</div>
                        <p>{t("noExamSchedulesFound")}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  exams.map((schedule, idx) => (
                    <tr key={schedule.id}>
                      <td>{idx + 1}</td>
                      <td><span>{schedule.examName}</span></td>
                      <td><strong>{schedule.subject?.subjectName}</strong></td>
                      <td>{formatDate(schedule.examDate)}</td>
                      <td>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</td>
                      <td>{schedule.section ? schedule.section.sectionName : t("allSections")}</td>
                      <td>
                        <button
                          className="pri-btn pri-btn-danger pri-btn-sm"
                          onClick={() => deleteSchedule(schedule.id, schedule.examName)}
                          disabled={loading}
                        >
                          🗑️ {t("delete")}
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
    </div>
  );
}

export default ExamScheduleView;
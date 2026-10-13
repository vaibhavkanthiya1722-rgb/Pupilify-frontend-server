import React, { useEffect, useRef } from 'react';
import PriModal from '../PriModal';
import TableSkeleton from '../../loaders/TableSkeleton';
import PriAutocompleteSelect from '../../common/PriAutocompleteSelect';

function ExamScheduleBulk({
  bulkForm,
  classes,
  bulkFilterClass,
  setBulkFilterClass,
  bulkFilteredSections,
  availableSubjects,
  bulkSchedules,
  bulkPreviewModal,
  setBulkPreviewModal,
  loading,
  todayDate,
  handleBulkFormChange,
  handleSubjectToggle,
  selectAllSubjects,
  clearAllSubjects,
  generateBulkPreview,
  updateBulkScheduleItem,
  submitBulkSchedules,
  t
}) {
  // Get selected values
  const selectedClass = classes?.find(c => String(c.id) === String(bulkFilterClass)) || null;
  
  // Only actual sections, no "All Sections" option
  const selectedSection = bulkFilteredSections?.find(s => String(s.id) === String(bulkForm?.sectionId)) || null;

  // Create a ref to handleBulkFormChange to avoid dependency issues
  const handleBulkFormChangeRef = useRef(handleBulkFormChange);

  // Update ref when handleBulkFormChange changes
  useEffect(() => {
    handleBulkFormChangeRef.current = handleBulkFormChange;
  }, [handleBulkFormChange]);

  // Auto-select first section when class changes and no section is selected
  useEffect(() => {
    if (bulkFilterClass && bulkFilteredSections?.length > 0 && !bulkForm?.sectionId) {
      const firstSectionId = bulkFilteredSections[0]?.id;
      if (firstSectionId) {
        handleBulkFormChangeRef.current('sectionId')({ target: { value: firstSectionId } });
      }
    }
  }, [bulkFilterClass, bulkFilteredSections, bulkForm?.sectionId]);

  // Handlers
  const handleClassChange = (option) => {
    setBulkFilterClass(option?.id || '');
    handleBulkFormChange('sectionId')({ target: { value: '' } });
  };

  const handleSectionChange = (option) => {
    handleBulkFormChange('sectionId')({ target: { value: option?.id || '' } });
  };

  return (
    <>
      <div className="pri-card pd-24">
        <h3 className="mb">📦 {t("bulkCreateExamSchedule")}</h3>

        <div className="pri-form-row">
          <div className="pri-form-field">
            <label>{t("examName")} *</label>
            <input
              type="text"
              value={bulkForm?.examName || ''}
              onChange={handleBulkFormChange('examName')}
              placeholder={t("examNamePlaceholder")}
              list="examNames"
              disabled={loading}
            />
          </div>

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
              required
            />
          </div>
        </div>

        <div className="pri-form-row">
          <div className="pri-form-field">
            <label>{t("section")} *</label>
            <PriAutocompleteSelect
              key={bulkFilterClass || "no-class"}
              value={selectedSection}
              data={bulkFilteredSections || []}
              onChange={handleSectionChange}
              placeholder={t("selectSection")}
              optionLabel="sectionName"
              optionValue="id"
              disabled={!bulkFilterClass || loading}
              size="medium"
              clearable={false}
              required
            />
          </div>
          <div className="pri-form-field"></div>
        </div>

        {bulkFilterClass && (
          <div className="mt-20">
            <div className="d-flex justify-content-between align-items-center mb-10">
              <h4 style={{ margin: 0 }}>{t("selectSubjects")}</h4>
              <div>
                <button className="pri-btn pri-btn-ghost pri-btn-sm" onClick={selectAllSubjects} disabled={loading}>
                  {t("selectAll")}
                </button>
                <button className="pri-btn pri-btn-ghost pri-btn-sm ml-10" onClick={clearAllSubjects} disabled={loading}>
                  {t("clear")}
                </button>
              </div>
            </div>

            <div className="exam-container">
              {availableSubjects && availableSubjects.map(subject => (
                <label key={subject.id} className="d-flex align-items-center gap-8 cursor_pointer">
                  <input
                    type="checkbox"
                    checked={bulkForm?.subjects?.includes(subject.id) || false}
                    onChange={() => handleSubjectToggle(subject.id)}
                    disabled={loading}
                  />
                  <span>{subject.subjectName}</span>
                </label>
              ))}
            </div>

            <div className="d-flex justify-content-end mt-20">
              <button
                className="pri-btn pri-btn-primary"
                onClick={generateBulkPreview}
                disabled={loading || !bulkForm?.examName || !bulkForm?.subjects || bulkForm.subjects.length === 0}
              >
                {loading ? '⏳' : t("previewAndSetTimes")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Preview Modal */}
      {bulkPreviewModal && (
        <PriModal
          title={t("setExamTimesForSelectedSubjects")}
          onClose={() => setBulkPreviewModal(false)}
          wide
          footer={
            <div className="d-flex justify-content-end gap-8">
              <button
                className="pri-btn pri-btn-primary"
                onClick={submitBulkSchedules}
                disabled={loading}
              >
                {loading ? t("creating") : `✅ ${t("createAll")}`}
              </button>
              <button
                className="pri-btn pri-btn-ghost"
                onClick={() => setBulkPreviewModal(false)}
                disabled={loading}
              >
                {t("cancel")}
              </button>
            </div>
          }
        >
          <div className="table-wrap pri-card">
            {loading && (!bulkSchedules || bulkSchedules.length === 0) ? (
              <TableSkeleton rows={5} columns={4} />
            ) : (
              <table className="pri-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("subject")}</th>
                    <th>{t("examDate")} *</th>
                    <th>{t("startTime")} *</th>
                    <th>{t("endTime")} *</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkSchedules && bulkSchedules.map((schedule, index) => {
                    const subject = availableSubjects && availableSubjects.find(s => s.id === schedule.subject?.id);
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td><strong>{subject?.subjectName || t("unknownSubject")}</strong></td>
                        <td className="pri-form-field">
                          <input
                            type="date"
                            value={schedule.examDate || ''}
                            onChange={(e) => updateBulkScheduleItem(index, 'examDate', e.target.value)}
                            min={todayDate}
                            disabled={loading}
                          />
                        </td>
                        <td className="pri-form-field">
                          <input
                            type="time"
                            value={schedule.startTime || ''}
                            onChange={(e) => updateBulkScheduleItem(index, 'startTime', e.target.value)}
                            disabled={loading}
                          />
                        </td>
                        <td className="pri-form-field">
                          <input
                            type="time"
                            value={schedule.endTime || ''}
                            onChange={(e) => updateBulkScheduleItem(index, 'endTime', e.target.value)}
                            disabled={loading}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </PriModal>
      )}
    </>
  );
}

export default ExamScheduleBulk;
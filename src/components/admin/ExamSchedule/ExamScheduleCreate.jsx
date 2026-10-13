import React, { useEffect, useRef } from 'react';
import PriAutocompleteSelect from '../../common/PriAutocompleteSelect';

function ExamScheduleCreate({
  form,
  classes,
  sections,
  singleFormSections,
  formFilteredSubjects,
  examNames,
  loading,
  dateError,
  todayDate,
  handleFormChange,
  generateSchedule,
  t
}) {
  // Get selected values
  const selectedClass = classes?.find(c => String(c.id) === String(form?.classId)) || null;
  const selectedSection = singleFormSections?.find(s => String(s.id) === String(form?.sectionId)) || null;
  const selectedSubject = formFilteredSubjects?.find(s => String(s.id) === String(form?.subjectId)) || null;

  // Create a ref to handleFormChange to avoid dependency issues
  const handleFormChangeRef = useRef(handleFormChange);

  // Update ref when handleFormChange changes
  useEffect(() => {
    handleFormChangeRef.current = handleFormChange;
  }, [handleFormChange]);

  // Auto-select first section when class changes and no section is selected
  useEffect(() => {
    if (form?.classId && singleFormSections?.length > 0 && !form?.sectionId) {
      const firstSectionId = singleFormSections[0]?.id;
      if (firstSectionId) {
        handleFormChangeRef.current({
          target: {
            name: 'sectionId',
            value: firstSectionId
          }
        });
      }
    }
  }, [form?.classId, singleFormSections, form?.sectionId]);

  // Handlers
  const handleClassChange = (option) => {
    const classId = option?.id || '';
    handleFormChange({ target: { name: 'classId', value: classId } });
    // Reset section when class changes (will auto-select first via useEffect)
    handleFormChange({ target: { name: 'sectionId', value: '' } });
  };

  const handleSectionChange = (option) => {
    handleFormChange({ target: { name: 'sectionId', value: option?.id || '' } });
  };

  const handleSubjectChange = (option) => {
    handleFormChange({ target: { name: 'subjectId', value: option?.id || '' } });
  };

  return (
    <div className="pri-card pd-24">
      <h3 className="mb">✏️ {t("createSingleExamSchedule")}</h3>

      <div className="pri-form-row">
        <div className="pri-form-field">
          <label>{t("examName")} *</label>
          {/* Exam Name - Text Input with datalist for suggestions */}
          <input
            type="text"
            name="examName"
            value={form?.examName || ''}
            onChange={handleFormChange}
            placeholder={t("examNamePlaceholder")}
            list="examNamesList"
            disabled={loading}
          />
          <datalist id="examNamesList">
            {examNames && examNames.map(name => (
              <option key={name} value={name} />
            ))}
          </datalist>
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
            key={form?.classId || "no-class"}
            value={selectedSection}
            data={singleFormSections || []}
            onChange={handleSectionChange}
            placeholder={t("selectSection")}
            optionLabel="sectionName"
            optionValue="id"
            disabled={!form?.classId || loading}
            size="medium"
            clearable={false}
            required
          />
        </div>
        <div className="pri-form-field">
          <label>{t("subject")} *</label>
          <PriAutocompleteSelect
            key={form?.sectionId || "no-section"}
            value={selectedSubject}
            data={formFilteredSubjects || []}
            onChange={handleSubjectChange}
            placeholder={t("selectSubject")}
            optionLabel="subjectName"
            optionValue="id"
            disabled={!form?.classId || loading}
            size="medium"
            clearable
            required
          />
        </div>
      </div>

      <div className="pri-form-row">
        <div className="pri-form-field">
          <label>{t("examDate")} *</label>
          <input
            type="date"
            name="examDate"
            value={form?.examDate || ''}
            onChange={handleFormChange}
            min={todayDate}
            disabled={loading}
            style={{
              borderColor: dateError ? '#dc2626' : '#e2e8f0'
            }}
          />
          {dateError && (
            <span className="pri-error-message">⚠️ {dateError}</span>
          )}
        </div>

        <div className="pri-form-field">
          <label>{t("startTime")} *</label>
          <input
            type="time"
            name="startTime"
            value={form?.startTime || ''}
            onChange={handleFormChange}
            disabled={loading}
          />
        </div>

        <div className="pri-form-field">
          <label>{t("endTime")} *</label>
          <input
            type="time"
            name="endTime"
            value={form?.endTime || ''}
            onChange={handleFormChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button
          className="pri-btn pri-btn-primary"
          onClick={generateSchedule}
          disabled={loading || !form?.classId || !!dateError}
        >
          {loading ? t("creating") : `✅ ${t("createSchedule")}`}
        </button>
      </div>
    </div>
  );
}

export default ExamScheduleCreate;
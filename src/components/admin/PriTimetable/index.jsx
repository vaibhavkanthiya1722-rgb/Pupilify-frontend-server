import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PriModal from "../PriModal";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";
import PriTimetableController from "./PriTimetableController";
import ConfirmationDialog from "../../common/table-componets/confirmation-dialog";

function PriTimetable({
  schoolId,
  token,
  classes,
  sections,
  teachers,
  subjects,
  onToast,
  currentAcademicYearId,
  currentAcademicYearName: propAcademicYearName
}) {
  const { t } = useTranslation(); 
  
  const controllerProps = PriTimetableController({
    schoolId,
    classes: classes || [],
    sections: sections || [],
    teachers: teachers || [],
    subjects: subjects || [],
    onToast,
    currentAcademicYearId,
    currentAcademicYearName: propAcademicYearName,
    t
  });

  const {
    selClass, setSelClass,
    selSec, setSelSec,
    slots,
    loading,
    loaded,
    addModal, setAddModal,
    bulkInsertModal, setBulkInsertModal,
    bulkInsertLoading,
    form,
    bulkForm,
    confirmDialog,
    numberOfPeriods,
    periodDuration,
    breakDuration,
    lunchBreak,
    updatePeriodDuration,
    updateBreakDuration,
    updateLunchBreak,
    currentTimeSlots,
    schoolStartTime,
    updateStartTime,
    showTimeSettings,
    setShowTimeSettings,
    showAdvancedSettings,
    setShowAdvancedSettings,
    DEFAULT_TIME_SLOTS,
    DAYS,
    classSubjects,
    classSections,
    modalSubjects,
    modalSections,
    getClassSubjects,
    getClassSections,
    slotsByDay,
    hasClasses,
    hasSubjects,
    hasAcademicYear,
    activeTeachers,
    loadTimetable,
    openAddModal,
    openBulkInsertModal,
    assignSlot,
    bulkInsertTimeSlots,
    oneTimeInsertForAllClasses,
    deleteSlot,
    handleDeleteConfirmed,
    closeConfirmDialog,
    setFormField,
    setBulkFormField,
    updateNumberOfPeriods,
    toggleAllDays,
    toggleAllPeriods,
    handleDayCheckboxChange,
    handlePeriodCheckboxChange,
    currentAcademicYearName: controllerAcademicYearName
  } = controllerProps;

  const academicYearName = propAcademicYearName || controllerAcademicYearName;
  const [showPeriodSettings, setShowPeriodSettings] = useState(false);

  const advancedSettingsRef = useRef(null);
  const timeSettingsRef = useRef(null);
  const periodSettingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (advancedSettingsRef.current && !advancedSettingsRef.current.contains(event.target)) {
        setShowAdvancedSettings(false);
      }
      if (timeSettingsRef.current && !timeSettingsRef.current.contains(event.target)) {
        setShowTimeSettings(false);
      }
      if (periodSettingsRef.current && !periodSettingsRef.current.contains(event.target)) {
        setShowPeriodSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowAdvancedSettings, setShowTimeSettings, setShowPeriodSettings]);

  const getTimeSlotForPeriod = (periodNum) => {
    return (currentTimeSlots && currentTimeSlots[periodNum - 1])
      ? currentTimeSlots[periodNum - 1]
      : { startTime: '09:00', endTime: '09:45' };
  };

  const safeBulkForm = bulkForm || { selectedDays: [], selectedPeriods: [], subjectId: '', teacherId: '' };
  const selectedDays = safeBulkForm.selectedDays || [];
  const selectedPeriods = safeBulkForm.selectedPeriods || [];

  const handleDeleteClick = (slotId) => {
    if (slotId && deleteSlot) {
      deleteSlot(slotId);
    }
  };

  const safeSlots = slots || [];
  const safeSlotsByDay = slotsByDay || {};
  const safeActiveTeachers = activeTeachers || [];
  const safeClassSections = classSections || [];

  const getClassName = (classId) => {
    if (!classId) return '—';
    const found = classes?.find(c => String(c.id) === String(classId));
    return found?.className || '—';
  };

  const getSectionName = (sectionId) => {
    if (!sectionId) return '—';
    const found = sections?.find(s => String(s.id) === String(sectionId));
    return found?.sectionName || '—';
  };

  const getClassSectionsForClass = (classId) => {
    if (!getClassSections) return [];
    return getClassSections(classId) || [];
  };

  const getClassSubjectsForClassSection = (classId, sectionId) => {
    if (!getClassSubjects) return [];
    return getClassSubjects(classId, sectionId) || [];
  };

  // 🔥 Handlers for dropdown
  const handleClassChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setSelClass(value);
    setSelSec('');
  };

  const handleSectionChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setSelSec(value);
  };

  const handleFormClassChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setFormField('classId')({ target: { value } });
  };

  const handleFormSectionChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setFormField('sectionId')({ target: { value } });
  };

  // 🔥 Handler for day change
  const handleFormDayChange = (selectedOption) => {
    const value = selectedOption?.id || 'Monday';
    setFormField('dayOfWeek')({ target: { value } });
  };

  const handleBulkClassChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setBulkFormField('classId')({ target: { value } });
  };

  const handleBulkSectionChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setBulkFormField('sectionId')({ target: { value } });
  };

  // Get selected values
  const selectedClass = classes?.find(c => String(c.id) === String(selClass)) || null;
  const selectedSection = safeClassSections.find(s => String(s.id) === String(selSec)) || null;
  
  const selectedFormClass = classes?.find(c => String(c.id) === String(form?.classId)) || null;
  const selectedFormSection = (form?.classId ? getClassSectionsForClass(form.classId) : []).find(s => String(s.id) === String(form?.sectionId)) || null;
  
  // 🔥 Get selected day
  const selectedFormDay = DAYS.find(d => d === form?.dayOfWeek) || DAYS[0] || null;
  
  const selectedBulkClass = classes?.find(c => String(c.id) === String(bulkForm?.classId)) || null;
  const selectedBulkSection = (bulkForm?.classId ? getClassSectionsForClass(bulkForm.classId) : []).find(s => String(s.id) === String(bulkForm?.sectionId)) || null;

  const selectedFormSubject = modalSubjects?.find(s => String(s.id) === String(form?.subjectId)) || null;
  const selectedBulkSubject = (bulkForm?.classId && bulkForm?.sectionId ? getClassSubjectsForClassSection(bulkForm.classId, bulkForm.sectionId) : []).find(s => String(s.id) === String(bulkForm?.subjectId)) || null;
  
  const selectedFormTeacher = safeActiveTeachers.find(t => String(t.id) === String(form?.teacherId)) || null;
  const selectedBulkTeacher = safeActiveTeachers.find(t => String(t.id) === String(bulkForm?.teacherId)) || null;

  // 🔥 Days data for dropdown
  const daysData = DAYS.map(d => ({ id: d, name: t(d.toLowerCase()) }));

  return (
    <div className="pri-content">
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">🕐 {t("timeTable")}</div>
          <div className="content-text">
            {loaded ? `${safeSlots.length} ${t("periodsLoaded")}` : t("selectClassAndLoad")} • 
            <span className="success">{numberOfPeriods || 6} {t("periodsPerDay")}</span>
            <span className="info-email" style={{ marginLeft: '10px' }}>
              ⏰ {t("startTime")}: {schoolStartTime}
            </span>
            <span className="info-email" style={{ marginLeft: '10px' }}>
              📚 {periodDuration || 45} min
            </span>
            {lunchBreak.enabled && (
              <span className="info-email" style={{ marginLeft: '10px' }}>
                🍽️ {lunchBreak.startTime} - {lunchBreak.endTime}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex gap-8 mb-10">
        {/* Advanced Settings Button */}
        <div className="position-relative" ref={advancedSettingsRef}>
          <button className="pri-btn pri-btn-secondary" onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
            ⚙️ {t("advancedSettings")}
          </button>
          {showAdvancedSettings && (
            <div className="pri-periods-dropdown" style={{ right: 0, left: 'auto', minWidth: '320px', maxWidth: '400px' }}>
              <div className="pri-periods-header">{t("timetableSettings")}</div>
              
              <div className="pri-form-field" style={{ marginBottom: '10px' }}>
                <label>{t("periodDuration")} ({t("minutes")})</label>
                <input
                  type="number"
                  min="20"
                  max="90"
                  className="pri-custom-input"
                  value={periodDuration}
                  onChange={(e) => updatePeriodDuration(e.target.value)}
                />
                <div className="pri-hint-text">{t("currentDuration", { duration: periodDuration })}</div>
              </div>

              <div className="pri-form-field" style={{ marginBottom: '10px' }}>
                <label>{t("breakDuration")} ({t("minutes")})</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  className="pri-custom-input"
                  value={breakDuration}
                  onChange={(e) => updateBreakDuration(e.target.value)}
                />
                <div className="pri-hint-text">
                  {breakDuration === 0 ? t("noBreakBetweenPeriods") : t("currentBreak", { duration: breakDuration })}
                </div>
              </div>

              <div className="input-box" style={{ marginBottom: '10px' }}>
                <label className="common mb-10">
                  <input type="checkbox" checked={lunchBreak.enabled}
                    onChange={(e) => updateLunchBreak(e.target.checked, lunchBreak.startTime, lunchBreak.endTime)}
                    style={{ marginRight: '8px' }} />
                  <span className="info-email">{t("enableLunchBreak")}</span>
                </label>
                {lunchBreak.enabled && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px' }}>{t("lunchStart")}</label>
                      <input
                        type="time"
                        className="pri-custom-input"
                        value={lunchBreak.startTime}
                        onChange={(e) => updateLunchBreak(true, e.target.value, lunchBreak.endTime)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', display: 'block', marginBottom: '5px' }}>{t("lunchEnd")}</label>
                      <input
                        type="time"
                        className="pri-custom-input"
                        value={lunchBreak.endTime}
                        onChange={(e) => updateLunchBreak(true, lunchBreak.startTime, e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="warning-box" style={{ marginTop: '10px', padding: '8px', fontSize: '12px' }}>
                💡 {t("settingsWillAutoUpdate")}
              </div>
              <button className="pri-btn pri-btn-ghost" onClick={() => setShowAdvancedSettings(false)} style={{ marginTop: '10px', width: '100%' }}>
                {t("close")}
              </button>
            </div>
          )}
        </div>

        {/* Start Time Settings Button */}
        <div className="position-relative" ref={timeSettingsRef}>
          <button className="pri-btn pri-btn-secondary" onClick={() => setShowTimeSettings(!showTimeSettings)}>
            ⏰ {t("startTime")}: {schoolStartTime}
          </button>
          {showTimeSettings && (
            <div className="pri-periods-dropdown" style={{ right: 0, left: 'auto', minWidth: '200px' }}>
              <div className="pri-periods-header">{t("selectStartTime")}</div>
              <div className="pri-periods-buttons" style={{ flexWrap: 'wrap' }}>
                {['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'].map(time => (
                  <button
                    key={time}
                    className={`pri-period-num-btn ${schoolStartTime === time ? 'active' : ''}`}
                    onClick={() => {
                      updateStartTime(time);
                      setShowTimeSettings(false);
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <div className="pri-custom-period">
                <input
                  type="time"
                  className="pri-custom-input"
                  value={schoolStartTime}
                  onChange={(e) => {
                    updateStartTime(e.target.value);
                    setShowTimeSettings(false);
                  }}
                />
                <div className="pri-hint-text">{t("customStartTime")}</div>
              </div>
            </div>
          )}
        </div>

        {/* Period Settings Button */}
        <div className="position-relative" ref={periodSettingsRef}>
          <button className="pri-btn pri-btn-secondary" onClick={() => setShowPeriodSettings(!showPeriodSettings)}>
            📊 {t("periods")} ({numberOfPeriods || 6})
          </button>
          {showPeriodSettings && (
            <div className="pri-periods-dropdown">
              <div className="pri-periods-header">{t("numberOfPeriodsPerDay")}</div>
              <div className="pri-periods-buttons">
                {[5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    className={`pri-period-num-btn ${numberOfPeriods === num ? 'active' : ''}`}
                    onClick={() => {
                      updateNumberOfPeriods(num);
                      setShowPeriodSettings(false);
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="pri-custom-period">
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="pri-custom-input"
                  value={numberOfPeriods || 6}
                  onChange={(e) => updateNumberOfPeriods(e.target.value)}
                />
                <div className="pri-hint-text">{t("customPeriods")}</div>
              </div>
            </div>
          )}
        </div>

        <button className="pri-btn pri-btn-third" onClick={openBulkInsertModal} disabled={!selClass || !hasAcademicYear || !hasSubjects}>
          📋 {t("bulkAdd")}
        </button>
        <button className="pri-btn pri-btn-primary" onClick={() => openAddModal && openAddModal(null)} disabled={!selClass || !hasAcademicYear}>
          + {t("addPeriod")}
        </button>
      </div>

      {!hasClasses && <div className="pri-note">⚠️ {t("noClassesFound")}.</div>}
      {!hasAcademicYear && <div className="pri-note">⚠️ {t("academicYearNotConfigured")}</div>}
      {selClass && !hasSubjects && subjects && subjects.length > 0 && <div className="pri-note">⚠️ {t("noSubjectsFound")}</div>}

      {/* FILTER BAR WITH DROPDOWNS */}
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
            size="medium"
            clearable
          />
        </div>

        <div className="pri-form-field">
          <label>{t("section")}</label>
          <PriAutocompleteSelect
            key={selClass || "no-class"}
            value={selectedSection}
            data={safeClassSections}
            onChange={handleSectionChange}
            placeholder={t("selectSection")}
            optionLabel="sectionName"
            optionValue="id"
            disabled={!selClass}
            size="medium"
            clearable
          />
        </div>

        <div className="pri-form-field">
          <label>{t("academicYear")} *</label>
          <div style={{ width: '100%', padding: '11px 14px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#0f172a', fontSize: 13, fontWeight: 600 }}>
            {academicYearName || t('notConfigured')}
          </div>
        </div>

        <button 
          className="pri-btn pri-btn-primary" 
          onClick={() => {
            const classId = selClass || '';
            const sectionId = selSec || '';
            loadTimetable(classId, sectionId);
          }} 
          disabled={!selClass || loading || !hasAcademicYear}
        >
          {loading ? `⏳ ${t("loading")}` : `🔍 ${t("loadTimetable")}`}
        </button>
      </div>

      {!loaded && !loading && (
        <div className="pri-card">
          <div className="pri-empty">
            <div className="pri-empty-icon">🕐</div>
            <p>{t("loadTimetableMessage")}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="pri-card">
          <div className="pri-empty">
            <div className="pri-empty-icon">⏳</div>
            <p>{t("loadingTimetable")}</p>
          </div>
        </div>
      )}

      {loaded && !loading && safeSlots.length > 0 && (
        <div className="pri-card">
          <div className="table-wrap">
            <table className="tt-grid">
              <thead>
                <tr>
                  <th>{t("dayPeriod")}</th>
                  {Array.from({ length: numberOfPeriods || 6 }, (_, i) => (
                    <th key={i}>
                      {t("period")} {i + 1}
                      <br />
                      <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#64748b' }}>
                        {getTimeSlotForPeriod(i + 1).startTime} - {getTimeSlotForPeriod(i + 1).endTime}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => {
                  const daySlots = safeSlotsByDay[day] || [];
                  return (
                    <tr key={day}>
                      <td className="tt-day-label">{t(day.toLowerCase())}</td>
                      {Array.from({ length: numberOfPeriods || 6 }, (_, i) => {
                        const periodNum = i + 1;
                        const timeSlot = getTimeSlotForPeriod(periodNum);
                        const slot = daySlots.find(s => s && s.startTime === timeSlot.startTime);
                        if (slot && slot.id) {
                          return (
                            <td key={i}>
                              <div className="tt-slot position-relative">
                                <div className="tt-slot-subject">{slot.subject && slot.subject.subjectName ? slot.subject.subjectName : '—'}</div>
                                <div className="tt-slot-teacher">👩‍🏫 {slot.teacher && slot.teacher.name ? slot.teacher.name : '—'}</div>
                                <div className="tt-slot-time">⏰ {slot.startTime || '—'} – {slot.endTime || '—'}</div>
                                <button className="tt-slot-del" onClick={() => handleDeleteClick(slot.id)}>✕</button>
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td key={i}>
                            <button 
                              className="tt-add-btn" 
                              onClick={() => {
                                const classId = selClass || '';
                                const sectionId = selSec || '';
                                openAddModal(day, periodNum, classId, sectionId);
                              }}
                            >
                              + {t("add")}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loaded && !loading && safeSlots.length === 0 && (
        <div className="pri-card">
          <div className="pri-empty">
            <div className="pri-empty-icon">📭</div>
            <p>{t("noPeriodsAdded")}</p>
          </div>
        </div>
      )}

      {/* ADD PERIOD MODAL */}
      {addModal && (
        <PriModal
          title={`🕐 ${t("addPeriodToTimetable")}`}
          onClose={() => setAddModal(false)}
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={() => setAddModal(false)}>{t("cancel")}</button>
              <button className="pri-btn pri-btn-primary" onClick={assignSlot} disabled={loading}>
                {loading ? t("saving") : `✅ ${t("addPeriod")}`}
              </button>
            </>
          }
        >
          <div className="title-heading">
            <div className="content-text">{t("addingTo")}:</div>
            <div className="pri-card-title">
              <span className="purple-text">
                {getClassName(form?.classId)} 
                {form?.sectionId && ` / ${getSectionName(form?.sectionId)}`}
              </span>
            </div>
          </div>
          
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t("class")} *</label>
              <PriAutocompleteSelect
                value={selectedFormClass}
                data={classes || []}
                onChange={handleFormClassChange}
                placeholder={t("selectClass")}
                optionLabel="className"
                optionValue="id"
                disabled={loading}
                size="medium"
                clearable
                required
              />
            </div>
            <div className="pri-form-field">
              <label>{t("section")} *</label>
              <PriAutocompleteSelect
                key={form?.classId || "no-class"}
                value={selectedFormSection}
                data={form?.classId ? getClassSectionsForClass(form.classId) : []}
                onChange={handleFormSectionChange}
                placeholder={t("selectSection")}
                optionLabel="sectionName"
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
              <label>{t("day")} *</label>
              {/* 🔥 Days dropdown using PriAutocompleteSelect */}
              <PriAutocompleteSelect
                value={selectedFormDay}
                data={daysData}
                onChange={handleFormDayChange}
                placeholder={t("selectDay")}
                optionLabel="name"
                optionValue="id"
                disabled={loading}
                size="medium"
                clearable
                required
              />
            </div>
            <div className="pri-form-field">
              <label>{t("subject")} *</label>
              <PriAutocompleteSelect
                value={selectedFormSubject}
                data={modalSubjects || []}
                onChange={(option) => setFormField('subjectId')({ target: { value: option?.id || '' } })}
                placeholder={t("select")}
                optionLabel="subjectName"
                optionValue="id"
                disabled={!form?.sectionId || loading}
                size="medium"
                clearable
                required
              />
            </div>
          </div>
          
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t("startTime")}</label>
              <input type="time" value={form && form.startTime ? form.startTime : '09:00'} onChange={setFormField('startTime')} />
            </div>
            <div className="pri-form-field">
              <label>{t("endTime")}</label>
              <input type="time" value={form && form.endTime ? form.endTime : '09:45'} onChange={setFormField('endTime')} />
            </div>
          </div>
          
          <div className="pri-form-field">
            <label>{t("teacher")} *</label>
            <PriAutocompleteSelect
              value={selectedFormTeacher}
              data={safeActiveTeachers}
              onChange={(option) => setFormField('teacherId')({ target: { value: option?.id || '' } })}
              placeholder={t("selectTeacher")}
              optionLabel="name"
              optionValue="id"
              disabled={!form?.subjectId || loading}
              size="medium"
              clearable
              required
            />
          </div>
        </PriModal>
      )}

      {/* BULK INSERT MODAL */}
      {bulkInsertModal && (
        <PriModal
          title={`📋 ${t("bulkAddPeriods")}`}
          onClose={() => setBulkInsertModal(false)}
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={() => setBulkInsertModal(false)}>{t("cancel")}</button>
              <button className="pri-btn pri-btn-primary" onClick={bulkInsertTimeSlots} disabled={bulkInsertLoading || !safeBulkForm.subjectId || !safeBulkForm.teacherId}>
                ✅ {t("addSelectedPeriods")}
              </button>
              <button className="pri-btn pri-btn-secondary" onClick={oneTimeInsertForAllClasses} disabled={bulkInsertLoading || !safeBulkForm.subjectId || !safeBulkForm.teacherId}>
                🏫 {t("addToAllClasses")}
              </button>
            </>
          }
        >
          <div>
            <div className="title-heading">
              {t("addingPeriodsFor")}: 
              <strong>
                {getClassName(bulkForm?.classId)}
                {bulkForm?.sectionId && ` - ${getSectionName(bulkForm?.sectionId)}`}
              </strong>
            </div>

            <div className="pri-form-row">
              <div className="pri-form-field">
                <label>{t("class")} *</label>
                <PriAutocompleteSelect
                  value={selectedBulkClass}
                  data={classes || []}
                  onChange={handleBulkClassChange}
                  placeholder={t("selectClass")}
                  optionLabel="className"
                  optionValue="id"
                  disabled={bulkInsertLoading}
                  size="medium"
                  clearable
                  required
                />
              </div>
              <div className="pri-form-field">
                <label>{t("section")} *</label>
                <PriAutocompleteSelect
                  key={bulkForm?.classId || "no-class"}
                  value={selectedBulkSection}
                  data={bulkForm?.classId ? getClassSectionsForClass(bulkForm.classId) : []}
                  onChange={handleBulkSectionChange}
                  placeholder={t("selectSection")}
                  optionLabel="sectionName"
                  optionValue="id"
                  disabled={!bulkForm?.classId || bulkInsertLoading}
                  size="medium"
                  clearable
                  required
                />
              </div>
            </div>

            <div className="pri-form-row">
              <div>
                <label>📅 {t("days")}</label>
                <div className="input-box">
                  <label className="common mb-10">
                    <input type="checkbox" checked={selectedDays.length === DAYS.length} onChange={toggleAllDays} />
                    <span className="info-email">{t("selectAllDays")}</span>
                  </label>
                  <div>
                    {DAYS.map(day => (
                      <label key={day} className="common mb-10">
                        <input
                          type="checkbox"
                          value={day}
                          checked={selectedDays.includes(day)}
                          onChange={() => handleDayCheckboxChange(day)}
                        />
                        <span>{t(day.toLowerCase())}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label>⏰ {t("periods")}</label>
                <div className="input-box">
                  <label className="common mb-10">
                    <input type="checkbox" checked={selectedPeriods.length === (numberOfPeriods || 6)} onChange={toggleAllPeriods} />
                    <span className="info-email">{t("selectAllPeriods")}</span>
                  </label>
                  <div className="d-flex flex-direction gap-8 mb-10">
                    {Array.from({ length: numberOfPeriods || 6 }, (_, i) => i + 1).map(period => {
                      const timeSlot = currentTimeSlots && currentTimeSlots[period - 1];
                      return (
                        <label key={period} className="common mb-10">
                          <input
                            type="checkbox"
                            value={period}
                            checked={selectedPeriods.includes(period)}
                            onChange={() => handlePeriodCheckboxChange(period)}
                          />
                          <span>
                            {t("period")} {period} (
                            {timeSlot ? timeSlot.startTime : '—'} - 
                            {timeSlot ? timeSlot.endTime : '—'})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="pri-form-row">
              <div className="pri-form-field">
                <label>📖 {t("subject")} *</label>
                <PriAutocompleteSelect
                  value={selectedBulkSubject}
                  data={bulkForm?.classId && bulkForm?.sectionId ? getClassSubjectsForClassSection(bulkForm.classId, bulkForm.sectionId) : []}
                  onChange={(option) => setBulkFormField('subjectId')({ target: { value: option?.id || '' } })}
                  placeholder={t("selectSubject")}
                  optionLabel="subjectName"
                  optionValue="id"
                  disabled={!bulkForm?.sectionId || bulkInsertLoading}
                  size="medium"
                  clearable
                  required
                />
              </div>
              <div className="pri-form-field">
                <label>👩‍🏫 {t("teacher")} *</label>
                <PriAutocompleteSelect
                  value={selectedBulkTeacher}
                  data={safeActiveTeachers}
                  onChange={(option) => setBulkFormField('teacherId')({ target: { value: option?.id || '' } })}
                  placeholder={t("selectTeacher")}
                  optionLabel="name"
                  optionValue="id"
                  disabled={!safeBulkForm.subjectId || bulkInsertLoading}
                  size="medium"
                  clearable
                  required
                />
              </div>
            </div>

            {safeBulkForm.subjectId && safeBulkForm.teacherId && selectedDays.length > 0 && selectedPeriods.length > 0 && (
              <div className="tt-slot">
                <span>{t("totalPeriodsToAdd")}: {selectedDays.length * selectedPeriods.length}</span>
              </div>
            )}

            <div className="warning-box">
              💡 <strong>{t("addToAllClassesNote")}:</strong> {t("addToAllClassesMessage")}
            </div>
          </div>
        </PriModal>
      )}

      <ConfirmationDialog
        open={confirmDialog && confirmDialog.open ? confirmDialog.open : false}
        handleClose={closeConfirmDialog}
        handleConfirm={handleDeleteConfirmed}
        message={confirmDialog && confirmDialog.message ? confirmDialog.message : ''}
        loader={loading}
        confirmLabel={t("remove")}
        cancelLabel={t("cancel")}
        title={confirmDialog && confirmDialog.title ? confirmDialog.title : t('confirmDelete')}
      />
    </div>
  );
}

export default PriTimetable;
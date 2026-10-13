import React from "react";
import { Box, Typography } from "@mui/material"; // 🔥 Import for custom render
import PriModal from "../PriModal";
import SectionBadge from "../SectionBadge";
import DeleteButton from "../../common/DeleteButton";
import TableSkeleton from "../../loaders/TableSkeleton";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect"; // 🔥 Import dropdown
import PriMappingController from "./PriMappingController";
import { useTranslation } from 'react-i18next';

function PriMapping({
  schoolId,
  token,
  classes,
  sections,
  teachers,
  onToast,
  currentAcademicYearId,
  currentAcademicYearName
  
}) {
  const { t } = useTranslation();
  
  const {
    // State
    mappings,
    modal,
    loading,
    form, 
    setForm,

    // Data
    totalMappings,
    hasClasses,
    hasTeachers,

    // Functions
    assignTeacher,
    deleteMapping,
    openModal,
    closeModal,
    setField,

    // Helpers
    formSections,
    selectedTeacher,
    selectedClass,
    selectedSection,
    secName,
    getAcademicYearDisplay,
    activeTeachers

  } = PriMappingController({
    schoolId,
    classes,
    sections,
    teachers,
    onToast,
    currentAcademicYearId,
    currentAcademicYearName,
    t
  });

  // 🔥 Handle class change - reset section when class changes
  const handleClassChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setForm(prev => ({
      ...prev,
      classId: value,
      sectionId: ''  // Reset section when class changes
    }));
  };

  // 🔥 Handle section change
  const handleSectionChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setForm(prev => ({
      ...prev,
      sectionId: value
    }));
  };

  // 🔥 Handle teacher change
  const handleTeacherChange = (selectedOption) => {
    const value = selectedOption?.id || '';
    setForm(prev => ({
      ...prev,
      teacherId: value
    }));
  };

  // 🔥 Get selected values for dropdowns
  const selectedFormClass = classes.find(c => String(c.id) === String(form.classId)) || null;
  const selectedFormSection = formSections.find(s => String(s.id) === String(form.sectionId)) || null;
  const selectedFormTeacher = activeTeachers.find(t => String(t.id) === String(form.teacherId)) || null;

  // 🔥 Custom render for teacher options with subject expertise
  const renderTeacherOption = (props, option) => {
    const { key, ...restProps } = props;
    return (
      <Box
        component="li"
        key={key}
        {...restProps}
        className="pri-autocomplete-option"
      >
        <Box className="pri-autocomplete-option-content">
         
          <Box className="pri-autocomplete-option-text-wrapper">
            <Box className="pri-autocomplete-option-label-wrapper">
              <Typography className="pri-autocomplete-option-label">
                {option.name}
              </Typography>
            </Box>
            {option.subjectExpertise && (
              <Typography className="pri-autocomplete-option-subtext">
                📚 {option.subjectExpertise}
              </Typography>
            )}
         
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <div className="pri-content">
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">🔗 {t("classTeacherMapping")}</div>
          <div className="content-text">{totalMappings} {t("mappings")}</div>
        </div>
        <button
          className="pri-btn pri-btn-primary"
          onClick={openModal}
          disabled={!hasClasses || !hasTeachers || loading}
        >
          + {t("assignTeacher")}
        </button>
      </div>
      
      {(!hasClasses || !hasTeachers) && (
        <div className="pri-note">
          ⚠️ {!hasClasses ? `${t("pleaseAddClassesFirst")} ` : ''}
          {!hasTeachers ? t("pleaseOnboardTeachersFirst") : ''}
        </div>
      )}

      <div className="pri-card">
        <div className="table-wrap">
          {loading && mappings.length === 0 ? (
            <TableSkeleton rows={5} columns={7} />
          ) : (
            <table className="pri-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("class")}</th>
                  <th>{t("section")}</th>
                  <th>{t("classTeacher")}</th>
                  <th>{t("expertise")}</th>
                  <th>{t("year")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {mappings.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="pri-empty">
                        <div className="pri-empty-icon">🔗</div>
                        <p>{t("noMappingsYet")}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mappings.map((m, i) => (
                    <tr key={m.id}>
                      <td>{i + 1}</td>
                      <td><span className="pri-class-badge">{m.schoolClass?.className || '—'}</span></td>
                      <td><SectionBadge section={m.section} /></td>
                      <td>
                        <div className="common">
                          <div className="pri-avatar">
                            {m.teacher?.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <div>{m.teacher?.name || '—'}</div>
                            <div>{m.teacher?.mail || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td><span>{m.teacher?.subjectExpertise || '—'}</span></td>
                      <td>
                        <span className="pri-badge-green">
                          {getAcademicYearDisplay(m)}
                        </span>
                      </td>
                      <td>
                        <DeleteButton
                          objectId={m.id}
                          objectName={`${m.teacher?.name || 'Teacher'} - ${m.schoolClass?.className || 'Class'}`}
                          onDelete={(id) => deleteMapping(id, m.teacher?.name, m.schoolClass?.className)}
                          itemType={t("mapping")}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <PriModal
          title={`🔗 ${t("assignClassTeacher")}`}
          onClose={closeModal}
          footer={
            <>
              <button className="pri-btn pri-btn-ghost" onClick={closeModal} disabled={loading}>
                {t("cancel")}
              </button>
              <button className="pri-btn pri-btn-primary" onClick={assignTeacher} disabled={loading}>
                {loading ? t("assigning") : `✅ ${t("assign")}`}
              </button>
            </>
          }
        >
          {/* 🔥 Class Selection - Dropdown */}
          <div className="pri-form-field mb-10">
            <label>{t("class")} *</label>
            <PriAutocompleteSelect
              value={selectedFormClass}
              data={classes}
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

          {/* 🔥 Section Selection - Dropdown */}
          <div className="pri-form-field mb-10">
            <label>{t("section")} *</label>
            <PriAutocompleteSelect
              key={form.classId || "no-class"} // Force re-render when class changes
              value={selectedFormSection}
              data={formSections}
              onChange={handleSectionChange}
              placeholder={t("selectSection")}
              optionLabel="sectionName"
              optionValue="id"
              disabled={!form.classId || loading}
              size="medium"
              clearable
              required
            />
          </div>

          {/* 🔥 Teacher Selection - Dropdown with custom render */}
          <div className="pri-form-field mb-10">
            <label>{t("teacher")} *</label>
            <PriAutocompleteSelect
              value={selectedFormTeacher}
              data={activeTeachers}
              onChange={handleTeacherChange}
              placeholder={t("selectTeacher")}
              optionLabel="name"
              optionValue="id"
              disabled={loading}
              size="medium"
              clearable
              required
              renderOption={renderTeacherOption}
            />
          </div>

          {/* Academic Year Display */}
          <div className="pri-form-field mb-10">
            <label>{t("academicYear")} *</label>
            <input
              type="text"
              value={currentAcademicYearName || t("currentAcademicYear")}
              disabled
              style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
            />
            <small className="pri-hint-text">
              {t("usingCurrentAcademicYear")}
            </small>
          </div>

          {/* Preview Section */}
          {form.classId && form.sectionId && form.teacherId && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 16px', marginTop: 16 }}>
              <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 700, marginBottom: 6 }}>
                {t("assignmentPreview")}
              </div>
              <div style={{ fontSize: 13, color: '#1e293b' }}>
                <strong>{selectedTeacher?.name || '—'}</strong> → 
                <strong style={{ marginLeft: 4 }}>{selectedClass?.className || '—'}</strong> /
                <strong style={{ color: '#7c3aed', marginLeft: 4 }}>
                  {selectedSection ? secName(selectedSection) : '—'}
                </strong>
                <span style={{ color: '#16a34a', fontWeight: 600, marginLeft: 4 }}>
                  {currentAcademicYearName}
                </span>
              </div>
            </div>
          )}
        </PriModal>
      )}
    </div>
  );
}

export default PriMapping;
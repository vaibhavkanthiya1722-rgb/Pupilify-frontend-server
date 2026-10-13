import React, { useState } from "react";
import PriSubjectsController from "./PriSubjectsController";
import PriSubjectsGroupedView from "./PriSubjectsGroupedView";
import PriSubjectsFilteredView from "./PriSubjectsFilteredView";
import PriSubjectsAllView from "./PriSubjectsAllView";
import PriSubjectsAddModal from "./PriSubjectsAddModal";
import { useTranslation } from "react-i18next";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";

function PriSubjects({ schoolId, token, classes, sections, onToast, academicYearId }) {
  const { t } = useTranslation();

  const {
    // State
    subjects,
    groupedByClassSection,
    filterClass,
    setFilterClass,
    filterSec,
    setFilterSec,
    modal,
    loading,
    viewMode,
    setViewMode,
    expandedGroups,
    form,
    setForm,

    // Data
    totalSubjects,
    totalGroups,

    // Functions
    addSubject,
    deleteSubject,
    toggleGroup,
    clearFilters,
    closeModal,
    openModal,
    setField,
    handleCheckbox,

    // Helpers
    filteredSections,
    // ✅ FIXED: Remove unused variable 'formSections'
    // formSections,
    secName,
  } = PriSubjectsController({
    schoolId,
    classes,
    sections,
    onToast,
    academicYearId,
  });

  // 🔥 FIX: Filter sections based on selected class
  const filteredFormSections = form.classId 
    ? sections.filter(s => s.classId === form.classId)
    : [];

  // State for inline validation errors
  const [errors, setErrors] = useState({
    subjectName: "",
    classId: "",
    sectionId: "",
    totalTheoryMarks: "",
    passingTheoryMarks: "",
    totalPracticalMarks: "",
    passingPracticalMarks: "",
  });

  // Real-time validation functions
  const validateSubjectName = (value) => {
    if (!value.trim()) {
      return t("subjectNameRequired");
    }
    if (value.trim().length < 2) {
      return t("subjectNameMinLength");
    }
    return "";
  };

  const validateClass = (value) => {
    if (!value) {
      return t("selectClassRequired");
    }
    return "";
  };

  const validateSection = (value) => {
    if (!value) {
      return t("selectSectionRequired");
    }
    return "";
  };

  const validateTheoryMarks = (total, passing) => {
    const errors = {};

    if (!total || total <= 0) {
      errors.totalTheoryMarks = t("totalTheoryMarksGreaterThanZero");
    } else if (total > 100) {
      errors.totalTheoryMarks = t("totalTheoryMarksMax100");
    } else {
      errors.totalTheoryMarks = "";
    }

    if (!passing || passing <= 0) {
      errors.passingTheoryMarks = t("passingTheoryMarksGreaterThanZero");
    } else if (passing > total) {
      errors.passingTheoryMarks = t("passingMarksCannotExceedTotal");
    } else if (total && (passing / total) * 100 < 33) {
      errors.passingTheoryMarks = t("passingMarksAtLeast33Percent");
    } else {
      errors.passingTheoryMarks = "";
    }

    return errors;
  };

  const validatePracticalMarks = (total, passing) => {
    const errors = {};

    if (!total || total <= 0) {
      errors.totalPracticalMarks = t("totalPracticalMarksGreaterThanZero");
    } else if (total > 50) {
      errors.totalPracticalMarks = t("totalPracticalMarksMax50");
    } else {
      errors.totalPracticalMarks = "";
    }

    if (!passing || passing <= 0) {
      errors.passingPracticalMarks = t("passingPracticalMarksGreaterThanZero");
    } else if (passing > total) {
      errors.passingPracticalMarks = t("passingMarksCannotExceedTotal");
    } else if (total && (passing / total) * 100 < 33) {
      errors.passingPracticalMarks = t("passingMarksAtLeast33Percent");
    } else {
      errors.passingPracticalMarks = "";
    }

    return errors;
  };

  // Handle field change with validation
  const handleSubjectNameChange = (e) => {
    const value = e.target.value;
    setField("subjectName")(e);
    setErrors((prev) => ({
      ...prev,
      subjectName: validateSubjectName(value),
    }));
  };

  // 🔥 Handle class change for form (add modal)
  const handleFormClassChange = (selectedOption) => {
    const value = selectedOption?.id || "";
    setForm((p) => ({ 
      ...p, 
      classId: value, 
      sectionId: ""  // Clear section ID
    }));
    setErrors((prev) => ({
      ...prev,
      classId: value ? "" : t("selectClassRequired"),
      sectionId: "", // Clear section error
    }));
  };

  // 🔥 Handle section change for form (add modal)
  const handleFormSectionChange = (selectedOption) => {
    const value = selectedOption?.id || "";
    setForm((p) => ({ ...p, sectionId: value }));
    setErrors((prev) => ({
      ...prev,
      sectionId: value ? "" : t("selectSectionRequired"),
    }));
  };

  // 🔥 Handle filter class change
  const handleFilterClassChange = (selectedOption) => {
    const value = selectedOption?.id || "";
    setFilterClass(value);
    setFilterSec("");
  };

  // 🔥 Handle filter section change
  const handleFilterSectionChange = (selectedOption) => {
    const value = selectedOption?.id || "";
    setFilterSec(value);
  };

  const handleTheoryMarksChange = (type) => (e) => {
    const value = e.target.value === "" ? "" : parseInt(e.target.value);

    if (type === "total") {
      setForm((p) => ({ ...p, totalTheoryMarks: value }));
      const theoryErrors = validateTheoryMarks(value, form.passingTheoryMarks);
      setErrors((prev) => ({
        ...prev,
        ...theoryErrors,
      }));
    } else {
      setForm((p) => ({ ...p, passingTheoryMarks: value }));
      const theoryErrors = validateTheoryMarks(form.totalTheoryMarks, value);
      setErrors((prev) => ({
        ...prev,
        ...theoryErrors,
      }));
    }
  };

  const handlePracticalMarksChange = (type) => (e) => {
    const value = e.target.value === "" ? "" : parseInt(e.target.value);

    if (type === "total") {
      setForm((p) => ({ ...p, totalPracticalMarks: value }));
      const practicalErrors = validatePracticalMarks(
        value,
        form.passingPracticalMarks
      );
      setErrors((prev) => ({
        ...prev,
        ...practicalErrors,
      }));
    } else {
      setForm((p) => ({ ...p, passingPracticalMarks: value }));
      const practicalErrors = validatePracticalMarks(
        form.totalPracticalMarks,
        value
      );
      setErrors((prev) => ({
        ...prev,
        ...practicalErrors,
      }));
    }
  };

  // Check if form is valid before submitting
  const isFormValid = () => {
    const subjectNameError = validateSubjectName(form.subjectName);
    const classError = validateClass(form.classId);
    const sectionError = validateSection(form.sectionId);
    const theoryErrors = validateTheoryMarks(
      form.totalTheoryMarks,
      form.passingTheoryMarks
    );

    let isValid =
      !subjectNameError &&
      !classError &&
      !sectionError &&
      !theoryErrors.totalTheoryMarks &&
      !theoryErrors.passingTheoryMarks;

    if (form.hasPractical) {
      const practicalErrors = validatePracticalMarks(
        form.totalPracticalMarks,
        form.passingPracticalMarks
      );
      isValid =
        isValid &&
        !practicalErrors.totalPracticalMarks &&
        !practicalErrors.passingPracticalMarks;
    }

    return isValid;
  };

  const handleSubmit = () => {
    // Validate all fields
    const subjectNameError = validateSubjectName(form.subjectName);
    const classError = validateClass(form.classId);
    const sectionError = validateSection(form.sectionId);
    const theoryErrors = validateTheoryMarks(
      form.totalTheoryMarks,
      form.passingTheoryMarks
    );

    setErrors({
      subjectName: subjectNameError,
      classId: classError,
      sectionId: sectionError,
      ...theoryErrors,
    });

    if (form.hasPractical) {
      const practicalErrors = validatePracticalMarks(
        form.totalPracticalMarks,
        form.passingPracticalMarks
      );
      setErrors((prev) => ({
        ...prev,
        ...practicalErrors,
      }));
    }

    if (isFormValid()) {
      addSubject();
    }
  };

  // 🔥 Get selected class object for filter
  const selectedFilterClass = classes.find((c) => c.id === filterClass) || null;

  // 🔥 Get selected section object for filter
  const selectedFilterSection = filterClass 
    ? filteredSections.find((s) => s.id === filterSec) || null 
    : null;

  // 🔥 Get selected class object for form
  const selectedFormClass = classes.find((c) => c.id === form.classId) || null;

  // 🔥 Get selected section object for form - using filtered sections
  const selectedFormSection = form.classId 
    ? filteredFormSections.find((s) => s.id === form.sectionId) || null 
    : null;

  return (
    <div className="pri-content">
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">📖 {t("subjects")}</div>
          <div className="content-text">
            {viewMode === "grouped"
              ? t("subjectsGroupedSummary", {
                  classesLabel: `${totalGroups} ${
                    totalGroups === 1 ? t("class") : t("classes")
                  }`,
                  subjectCount: totalSubjects,
                })
              : t("subjectsAllSummary", { subjectCount: totalSubjects })}
          </div>
        </div>
        <div className="d-flex gap-8">
          <button
            className="pri-btn pri-btn-primary"
            onClick={openModal}
            disabled={loading}
          >
            + {t("addSubject")}
          </button>
        </div>
      </div>

      <div className="tally-tabs">
        <button
          className={`tally-tab ${viewMode === "filtered" ? "active" : ""}`}
          onClick={() => {
            setViewMode("filtered");
            if (!filterClass) {
              clearFilters();
            }
          }}
          disabled={loading}
        >
          🔍 {t("filterByClass")}
        </button>
        <button
          className={`tally-tab ${viewMode === "grouped" ? "active" : ""}`}
          onClick={() => {
            setViewMode("grouped");
          }}
        >
          📑 {t("groupByClasses")}
        </button>
        <button
          className={`tally-tab ${viewMode === "all" ? "active" : ""}`}
          onClick={() => {
            setViewMode("all");
          }}
        >
          📋 {t("allSubjects")}
        </button>
      </div>

      {viewMode === "filtered" && (
        <div className="pri-filter-bar">
          <div className="pri-form-field">
            <label>{t("classFilterLabel")}</label>
            <PriAutocompleteSelect
              value={selectedFilterClass}
              data={classes}
              onChange={handleFilterClassChange}
              placeholder={t("selectClass")}
              optionLabel="className"
              optionValue="id"
              disabled={loading}
              size="medium"
              clearable
            />
          </div>

          <div className="pri-form-field">
            <label>{t("sectionFilterLabel")}</label>
            <PriAutocompleteSelect
              key={filterClass || "no-filter-class"}
              value={selectedFilterSection}
              data={filteredSections}
              onChange={handleFilterSectionChange}
              placeholder={t("allSections")}
              optionLabel="sectionName"
              optionValue="id"
              disabled={!filterClass || loading}
              size="medium"
              clearable
            />
          </div>

          <button
            className="pri-btn pri-btn-ghost"
            onClick={clearFilters}
            disabled={loading}
          >
            {t("clearFilters")}
          </button>
        </div>
      )}

      <div className="pri-card">
        <div className="table-wrap">
          {viewMode === "grouped" ? (
            <PriSubjectsGroupedView
              groupedByClassSection={groupedByClassSection}
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
              deleteSubject={deleteSubject}
              loading={loading}
              t={t}
            />
          ) : viewMode === "filtered" ? (
            <PriSubjectsFilteredView
              subjects={subjects}
              loading={loading}
              deleteSubject={deleteSubject}
              t={t}
            />
          ) : (
            <PriSubjectsAllView
              subjects={subjects}
              loading={loading}
              deleteSubject={deleteSubject}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      <PriSubjectsAddModal
        modal={modal}
        loading={loading}
        form={form}
        classes={classes}
        formSections={filteredFormSections} // 🔥 Use filtered sections
        errors={errors}
        closeModal={closeModal}
        handleSubjectNameChange={handleSubjectNameChange}
        handleClassChange={() => {}}
        handleSectionChange={() => {}}
        handleTheoryMarksChange={handleTheoryMarksChange}
        handlePracticalMarksChange={handlePracticalMarksChange}
        handleCheckbox={handleCheckbox}
        handleSubmit={handleSubmit}
        secName={secName}
        setField={setField}
        t={t}
        PriAutocompleteSelect={PriAutocompleteSelect}
        selectedFormClass={selectedFormClass}
        selectedFormSection={selectedFormSection}
        handleFormClassChange={handleFormClassChange}
        handleFormSectionChange={handleFormSectionChange}
      />
    </div>
  );
}

export default PriSubjects;
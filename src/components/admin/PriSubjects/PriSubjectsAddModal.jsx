import React from "react";
import PriModal from "../PriModal";

function PriSubjectsAddModal({
  modal,
  loading,
  form,
  classes,
  formSections,
  errors,
  closeModal,
  handleSubjectNameChange,
  handleClassChange,
  handleSectionChange,
  handleTheoryMarksChange,
  handlePracticalMarksChange,
  handleCheckbox,
  handleSubmit,
  setField,
  secName,
  t,
  PriAutocompleteSelect,
  selectedFormClass,
  selectedFormSection,
  handleFormClassChange,
  handleFormSectionChange,
}) {
  return (
    <>
      {modal && (
        <PriModal
          title={`📖 ${t("addNewSubject")}`}
          onClose={closeModal}
          footer={
            <>
              <button
                className="pri-btn pri-btn-ghost"
                onClick={closeModal}
                disabled={loading}
              >
                {t("cancel")}
              </button>
              <button
                className="pri-btn pri-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? t("saving") : t("addSubject")}
              </button>
            </>
          }
        >
          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t("subjectNameLabel")}</label>
              <input
                value={form.subjectName}
                onChange={handleSubjectNameChange}
                placeholder={t("subjectNamePlaceholder")}
                autoFocus
                disabled={loading}
                style={{ borderColor: errors.subjectName ? "#dc2626" : "" }}
              />
              {errors.subjectName && (
                <span className="pri-error-message">{errors.subjectName}</span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t("subjectCodeLabel")}</label>
              <input
                value={form.subjectCode}
                onChange={(e) => setField("subjectCode")(e)}
                placeholder={t("subjectCodePlaceholder")}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t("classLabel")}</label>
              <PriAutocompleteSelect
                value={selectedFormClass}
                data={classes}
                onChange={handleFormClassChange}
                placeholder={t("selectClass")}
                optionLabel="className"
                optionValue="id"
                disabled={loading}
                error={!!errors.classId}
                helperText={errors.classId}
                size="medium"
                clearable
                required
              />
            </div>
            <div className="pri-form-field">
              <label>{t("sectionLabel")}</label>
              <PriAutocompleteSelect
                key={form.classId || "no-class"} // 🔥 Force re-render when class changes
                value={selectedFormSection}
                data={formSections}
                onChange={handleFormSectionChange}
                placeholder={t("selectSection")}
                optionLabel="sectionName"
                optionValue="id"
                disabled={!form.classId || loading}
                error={!!errors.sectionId}
                helperText={errors.sectionId}
                size="medium"
                clearable
                required
              />
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label>{t("totalTheoryMarksLabel")}</label>
              <input
                type="number"
                min="1"
                value={form.totalTheoryMarks === 0 ? "" : form.totalTheoryMarks}
                onChange={handleTheoryMarksChange("total")}
                placeholder={t("totalTheoryMarksPlaceholder")}
                disabled={loading}
                style={{
                  borderColor: errors.totalTheoryMarks ? "#dc2626" : "",
                }}
              />
              {errors.totalTheoryMarks && (
                <span className="pri-error-message">
                  {errors.totalTheoryMarks}
                </span>
              )}
            </div>
            <div className="pri-form-field">
              <label>{t("passingTheoryMarksLabel")}</label>
              <input
                type="number"
                min="1"
                value={
                  form.passingTheoryMarks === 0 ? "" : form.passingTheoryMarks
                }
                onChange={handleTheoryMarksChange("passing")}
                placeholder={t("passingTheoryMarksPlaceholder")}
                disabled={loading}
                style={{
                  borderColor: errors.passingTheoryMarks ? "#dc2626" : "",
                }}
              />
              {errors.passingTheoryMarks && (
                <span className="pri-error-message">
                  {errors.passingTheoryMarks}
                </span>
              )}
            </div>
          </div>

          <div className="pri-form-row">
            <div className="pri-form-field">
              <label className="common">
                <input
                  type="checkbox"
                  checked={form.hasPractical}
                  onChange={handleCheckbox("hasPractical")}
                  disabled={loading}
                  style={{ width: "15px" }}
                />
                {t("hasPracticalComponent")}
              </label>
            </div>
          </div>

          {form.hasPractical && (
            <div className="pri-form-row">
              <div className="pri-form-field">
                <label>{t("totalPracticalMarksLabel")}</label>
                <input
                  type="number"
                  min="1"
                  value={
                    form.totalPracticalMarks === 0
                      ? ""
                      : form.totalPracticalMarks
                  }
                  onChange={handlePracticalMarksChange("total")}
                  placeholder={t("totalPracticalMarksPlaceholder")}
                  disabled={loading}
                  style={{
                    borderColor: errors.totalPracticalMarks ? "#dc2626" : "",
                  }}
                />
                {errors.totalPracticalMarks && (
                  <span className="pri-error-message">
                    {errors.totalPracticalMarks}
                  </span>
                )}
              </div>
              <div className="pri-form-field">
                <label>{t("passingPracticalMarksLabel")}</label>
                <input
                  type="number"
                  min="1"
                  value={
                    form.passingPracticalMarks === 0
                      ? ""
                      : form.passingPracticalMarks
                  }
                  onChange={handlePracticalMarksChange("passing")}
                  placeholder={t("passingPracticalMarksPlaceholder")}
                  disabled={loading}
                  style={{
                    borderColor: errors.passingPracticalMarks ? "#dc2626" : "",
                  }}
                />
                {errors.passingPracticalMarks && (
                  <span className="pri-error-message">
                    {errors.passingPracticalMarks}
                  </span>
                )}
              </div>
            </div>
          )}
        </PriModal>
      )}
    </>
  );
}

export default PriSubjectsAddModal;
import React from "react";
import { useTranslation } from "react-i18next";
import AcademicYearController from "./AcademicYearController";
import SAModal from "../../commonFile/SAModal";

const AcademicYearFormModal = ({ school, token, onClose, onSaved }) => {
  const { t } = useTranslation(); // Removed unused i18n
  
  const {
    loading,
    error,
    academicYear,
    setAcademicYear,
    handleCreateYear,
    handleClose
  } = AcademicYearController(school, token, onClose, onSaved);

  return (
    <SAModal
      title={"📅 " + t("addAcademicYearTitle")}
      onClose={handleClose}
      footer={
        <>
          <button
            className="sa-btn sa-btn-ghost"
            onClick={handleClose}
            disabled={loading}
          >
            {t("cancel")}
          </button>
          <button
            className="sa-btn sa-btn-primary"
            onClick={handleCreateYear}
            disabled={loading}
          >
            {loading ? t("creating") : t("createAcademicYearBtn")}
          </button>
        </>
      }
    >
      <div>
        {/* SCHOOL INFO */}
        <div className="sa-school-info-box">
          <div className="sa-school-info-label mb-10">
            {t("addingYearFor")}
          </div>

          <div className="d-flex align-items-center gap-10">
            <div className="sa-school-avatar">
              {school?.schoolName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="sa-school-name">
                {school?.schoolName}
              </div>
              <div className="tc-ref-no">
                {school?.mailId}
              </div>
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="sa-error-box">
            <strong>{t("error")}:</strong> {error}
          </div>
        )}

        {/* INPUT */}
        <div className="sa-form-field">
          <label>{t("academicYearRequired")}</label>
          <input
            type="text"
            placeholder={t("academicYearPlaceholder")}
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            disabled={loading}
          />
          <div className="tally-card-sub mt-4">
            {t("academicYearPlaceholder")}
          </div>
        </div>
      </div>
    </SAModal>
  );
};

export default AcademicYearFormModal;
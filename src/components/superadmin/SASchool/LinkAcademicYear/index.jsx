import React from "react";
import { useTranslation } from "react-i18next";
import SAModal from "../../commonFile/SAModal";
import LinkAcademicYearController from "./LinkAcademicYearController";

function LinkAcademicYearModal({ school, onClose, onSaved }) {
      const { t } = useTranslation(); 

  const {
    manualYear,
    setManualYear,
    useManual,
    setUseManual,
    loading,
    error,
    existingYear,
    confirmChecked,
    setConfirmChecked,
    handleLinkYear
  } = LinkAcademicYearController(school, onClose, onSaved);

  return (
    <SAModal
      title={"📅 " + t("linkAcademicYearTitle")}
      onClose={onClose}
      footer={
        <>
          <button
            className="sa-btn sa-btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            {t("cancel")}
          </button>

          <button
            className="sa-btn sa-btn-primary"
            onClick={handleLinkYear}
            disabled={
              loading ||
              (useManual ? (!manualYear.trim() || !confirmChecked) : !existingYear?.id)
            }
          >
            {loading ? t("processing") : "🔗 " + t("linkAcademicYearBtn")}
          </button>
        </>
      }
    >
      <div>

        {/* SCHOOL INFO */}
        <div className="sa-school-info-box">
          <div className="sa-school-info-label mb-10">
            🏫 {t("school")}
          </div>

          <div className="sa-school-name">
            {school?.schoolName}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="sa-error-box">
            ⚠️ {error}
          </div>
        )}

        {/* EXISTING YEAR */}
        {existingYear && (
          <div
            style={{
              background: "#0f172a",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: useManual
                ? "1px solid #334155"
                : "2px solid #3b82f6"
            }}
          >
            <div className="sa-school-info-label mb-10">
              {t("currentAcademicYear")}
            </div>

            <div className="sa-school-name">
              {existingYear.currentYear || existingYear}
            </div>
          </div>
        )}

        {/* TOGGLE */}
        <div
          style={{
            marginBottom: "20px",
            padding: "12px",
            background: "#1e293b",
            borderRadius: "8px"
          }}
        >
          <label className="d-flex gap-10 cursor_pointer align-items-center">
            <input
              type="checkbox"
              checked={useManual}
              onChange={(e) => {
                setUseManual(e.target.checked);
                if (!e.target.checked) {
                  setConfirmChecked(false);
                }
              }}
            />
            <span>
              ➕ {t("createAndLinkNewYear")}
            </span>
          </label>
        </div>

        {/* MANUAL INPUT */}
        {useManual && (
          <>
            <div className="sa-form-field">
              <label>
                {t("enterAcademicYear")}
              </label>

              <input
                type="text"
                value={manualYear}
                onChange={(e) => setManualYear(e.target.value)}
                placeholder={t("academicYearPlaceholder")}
                disabled={loading}
              />
              <small className="tally-card-sub">
                {t("academicYearFormatHint")}
              </small>
            </div>

            {/* CONFIRMATION CHECKBOX - Required for change API */}
            <div className="sa-warning-box">
              <label className="d-flex align-items-start gap-10 cursor_pointer">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                />
                <div>
                  <span className="sa-warning-title">
                    ⚠️ {t("understandingWarning")}
                  </span>
                  <ul className="sa-warning-list">
                    <li>{t("warningDeleteAttendance")}</li>
                    <li>{t("warningDeleteFeePayments")}</li>
                    <li>{t("warningDeleteTimetables")}</li>
                    <li>{t("warningSendBackup")}</li>
                    <li>{t("warningCarryForwardDues")}</li>
                  </ul>
                </div>
              </label>
            </div>
          </>
        )}
      </div>
    </SAModal>
  );
}

export default LinkAcademicYearModal;
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SAModal from "../../commonFile/SAModal";
import DistrictManagerFormController from "./DistrictManagerFormController";
import FormSkeleton from "../../../loaders/FormSkeleton";

function DistrictManagerFormModal({
  manager,
  districts,
  onClose,
  onSaved,
  refreshDistricts
}) {
  const { t } = useTranslation();

  const {
    form,
    setField,
    handleBlur,
    errors,
    touched,
    loading,
    isEdit,
    submit
  } = DistrictManagerFormController(
    manager,
    districts,
    onSaved,
    onClose,
    refreshDistricts
  );

  const [showPassword, setShowPassword] = useState(false);

  const showError = (fieldName) => {
    return (
      touched[fieldName] &&
      errors[fieldName] && (
        <div className="sa-error-message">
          {errors[fieldName]}
        </div>
      )
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const showSkeleton = !districts || districts.length === 0;

  return (
    <SAModal
      title={
        isEdit
          ? "✏️ " + t("editDistrictManager")
          : "👤 " + t("addDistrictManager")
      }
      onClose={onClose}
      footer={
        !showSkeleton && (
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
              onClick={submit}
              disabled={loading}
            >
              {loading
                ? t("saving")
                : isEdit
                ? t("saveChanges")
                : t("createManager")}
            </button>
          </>
        )
      }
    >
      {showSkeleton ? (
        <FormSkeleton />
      ) : (
        <>
          <div className="sa-form-row">
            <div className="sa-form-field">
              <label>{t("fullNameRequired")}</label>
              <input
                data-field="name"
                value={form.name || ""}
                onChange={setField("name")}
                onBlur={handleBlur("name")}
                disabled={loading}
                autoComplete="off"
                placeholder={t("enterFullName")}
                className={
                  touched.name && errors.name
                    ? "sa-error-input"
                    : ""
                }
              />
              {showError("name")}
            </div>

            <div className="sa-form-field">
              <label>{t("emailRequired")}</label>
              <input
                data-field="email"
                type="email"
                value={form.email || ""}
                onChange={setField("email")}
                onBlur={handleBlur("email")}
                disabled={loading}
                autoComplete="off"
                placeholder={t("enterEmailAddress")}
                className={
                  touched.email && errors.email
                    ? "sa-error-input"
                    : ""
                }
              />
              {showError("email")}
            </div>
          </div>

          <div className="sa-form-row">
            <div className="sa-form-field">
              <label>{t("phoneNumberRequired")}</label>
              <input
                data-field="phoneNumber"
                type="tel"
                value={form.phoneNumber || ""}
                onChange={setField("phoneNumber")}
                onBlur={handleBlur("phoneNumber")}
                disabled={loading}
                autoComplete="off"
                placeholder={t("enterPhoneNumber")}
                className={
                  touched.phoneNumber &&
                  errors.phoneNumber
                    ? "sa-error-input"
                    : ""
                }
              />
              {showError("phoneNumber")}
            </div>

            <div className="sa-form-field">
              <label>{t("districtRequired")}</label>

              <select
                value={form.districtId || ""}
                onChange={setField("districtId")}
                onBlur={handleBlur("districtId")}
                disabled={loading}
                className={
                  touched.districtId &&
                  errors.districtId
                    ? "sa-error-input"
                    : ""
                }
              >
                <option value="">
                  {t("selectDistrict")}
                </option>

                {districts.map((district) => (
                  <option
                    key={district.id}
                    value={district.id}
                  >
                    {district.name} ({district.code}) -
                    {" "}
                    {district.state?.name || "No State"}
                  </option>
                ))}
              </select>

              {showError("districtId")}
            </div>
          </div>

          {!isEdit && (
            <div className="sa-form-field">
              <label>{t("passwordRequired")}</label>

              <div className="sa-password-wrapper">
                <input
                  data-field="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password || ""}
                  onChange={setField("password")}
                  onBlur={handleBlur("password")}
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder={t(
                    "passwordPlaceholder"
                  )}
                  className={
                    touched.password &&
                    errors.password
                      ? "sa-error-input"
                      : ""
                  }
                />

                <button
                  type="button"
                  className="sa-password-toggle"
                  onClick={
                    togglePasswordVisibility
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "👁️"
                    : "🙈"}
                </button>
              </div>

              {showError("password")}

              <small className="sa-field-hint">
                {t("passwordMinLength")}
              </small>
            </div>
          )}

          {isEdit && (
            <div className="sa-form-field">
              <label>{t("password")}</label>

              <div className="sa-password-wrapper">
                <input
                  data-field="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password || ""}
                  onChange={setField("password")}
                  onBlur={handleBlur("password")}
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder={t(
                    "passwordPlaceholder"
                  )}
                />

                <button
                  type="button"
                  className="sa-password-toggle"
                  onClick={
                    togglePasswordVisibility
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "👁️"
                    : "🙈"}
                </button>
              </div>

              <small className="sa-field-hint">
                {t("leavePasswordBlank")}
              </small>
            </div>
          )}
        </>
      )}
    </SAModal>
  );
}

export default DistrictManagerFormModal;
// src/components/superadmin/Dashboard/SASchools/SchoolFormModal.js

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SAModal from "../../commonFile/SAModal";
import SchoolFormController from "./SchoolFormController";

function SchoolFormModal({ school, onClose, onSaved }) {
      const { t } = useTranslation(); 

  const {
    form,
    setField,
    handleBlur,
    errors,
    touched,
    logoFile,
    logoPreview,
    loading,
    isEdit,
    states,
    districts,
    loadingStates,
    loadingDistricts,
    handleLogoChange,
    submit
  } = SchoolFormController(school, onSaved, onClose);

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Helper to show error message
  const showError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] && (
      <div className="sa-error-message">
        {errors[fieldName]}
      </div>
    );
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Safe check for states and districts arrays
  const statesList = Array.isArray(states) ? states : [];
  const districtsList = Array.isArray(districts) ? districts : [];

  return (
    <SAModal
      title={isEdit ? "✏️ " + t("editSchool") : "🏫 " + t("addSchoolTitle")}
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
            onClick={submit}
            disabled={loading}
          >
            {loading
              ? t("saving")
              : isEdit
                ? t("saveChanges")
                : t("createSchool")}
          </button>
        </>
      }
    >

      <div className="sa-form-row">
        <div className="sa-form-field">
          <label>{t("schoolNameRequired")}</label>
          <input
            data-field="schoolName"
            value={form.schoolName || ''}
            onChange={setField("schoolName")}
            onBlur={handleBlur("schoolName")}
            disabled={loading}
            autoComplete="off"
            placeholder={t("enterSchoolName")}
          />
          {showError("schoolName")}
        </div>

        <div className="sa-form-field">
          <label>{t("emailRequired")}</label>
          <input
            data-field="mailId"
            type="email"
            value={form.mailId || ''}
            onChange={setField("mailId")}
            onBlur={handleBlur("mailId")}
            disabled={loading}
            autoComplete="off"
            name="school_email"
            placeholder={t("enterEmailAddress")}
          />
          {showError("mailId")}
        </div>
      </div>

      <div className="sa-form-row">
        <div className="sa-form-field">
          <label>{t("phone")}</label>
          <input
            data-field="phoneNumber"
            type="tel"
            value={form.phoneNumber || ''}
            onChange={setField("phoneNumber")}
            onBlur={handleBlur("phoneNumber")}
            disabled={loading}
            autoComplete="off"
            name="school_phone"
            placeholder={t("enterPhoneNumber")}
          />
          {showError("phoneNumber")}
        </div>

        <div className="sa-form-field">
          <label>{t("subscription")}</label>
          <select
            value={form.subscriptionStatus || "TRIAL"}
            onChange={setField("subscriptionStatus")}
            disabled={loading}
            autoComplete="off"
          >
            <option value="TRIAL">{t("trial")}</option>
            <option value="ACTIVE">{t("active")}</option>
            <option value="INACTIVE">{t("inactive")}</option>
          </select>
        </div>
      </div>

      {/* State and District Row */}
      <div className="sa-form-row">
        <div className="sa-form-field">
          <label>{t("stateRequired")}</label>
          <select
            value={form.stateId || ''}
            onChange={setField("stateId")}
            onBlur={handleBlur("stateId")}
            disabled={loading || loadingStates}
          >
            <option value="">{t("selectState")}</option>
            {statesList.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name} ({state.code})
              </option>
            ))}
          </select>
          {loadingStates && <small>{t("loadingStates")}</small>}
          {showError("stateId")}
        </div>

        <div className="sa-form-field">
          <label>{t("districtRequired")}</label>
          <select
            value={form.districtId || ''}
            onChange={setField("districtId")}
            onBlur={handleBlur("districtId")}
            disabled={loading || loadingDistricts || !form.stateId}
          >
            <option value="">{t("selectDistrict")}</option>
            {districtsList.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name} ({district.code})
              </option>
            ))}
          </select>
          {loadingDistricts && <small>{t("loadingDistricts")}</small>}
          {!form.stateId && <small className="sa-field-hint">{t("selectStateFirst")}</small>}
          {showError("districtId")}
        </div>
      </div>

      {!isEdit && (
        <div className="sa-form-field">
          <label>{t("passwordRequired")}</label>
          <div className="sa-password-wrapper">
            <input
              data-field="password"
              type={showPassword ? "text" : "password"}
              value={form.password || ''}
              onChange={setField("password")}
              onBlur={handleBlur("password")}
              disabled={loading}
              autoComplete="new-password"
              name="school_password"
              placeholder={t("passwordPlaceholder")}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="sa-password-toggle"
              disabled={loading}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
          {showError("password")}
          <small className="sa-field-hint">
            {t("passwordMinLength")}
          </small>
        </div>
      )}

      <div className="sa-form-field">
        <label>{t("address")}</label>
        <textarea
          data-field="address"
          rows="3"
          value={form.address || ''}
          onChange={setField("address")}
          onBlur={handleBlur("address")}
          disabled={loading}
          autoComplete="off"
          placeholder={t("enterSchoolAddress")}
        />
        {showError("address")}
      </div>

      <div className="sa-form-field">
        <label>{t("schoolLogo")}</label>
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          {logoPreview && (
            <img
              src={logoPreview}
              alt="logo"
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                objectFit: "cover"
              }}
            />
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif"
            onChange={handleLogoChange}
            disabled={loading}
            autoComplete="off"
          />
          {logoFile && <small>{logoFile.name}</small>}
        </div>
        <small className="sa-field-hint">
          {t("logoFileHint")}
        </small>
      </div>
    </SAModal>
  );
}

export default SchoolFormModal;
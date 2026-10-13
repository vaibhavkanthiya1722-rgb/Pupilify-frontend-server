// src/components/superadmin/Dashboard/SAStateManagers/StateManagerFormModal.js
import React, { useState } from "react";
import SAModal from "../../commonFile/SAModal";
import StateManagerFormController from "./StateManagerFormController";
import { useTranslation } from 'react-i18next';

function StateManagerFormModal({ manager, states, onClose, onSaved, refreshStates }) {
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
  } = StateManagerFormController(manager, states, onSaved, onClose, refreshStates);

  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const showError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] && (
      <div className="sa-error-message">
        {errors[fieldName]}
      </div>
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    setLocalLoading(true);
    try {
      await submit();
    } finally {
      setLocalLoading(false);
    }
  };

  // Check if form is valid (for enabling button)
  const isFormValid = () => {
    if (!form.name?.trim()) return false;
    if (!form.email?.trim()) return false;
    if (!form.phoneNumber?.trim()) return false;
    if (!form.stateId) return false;
    if (!isEdit && !form.password) return false;
    return true;
  };

  const isSubmitting = loading || localLoading;

  return (
    <SAModal
      title={isEdit ? `✏️ ${t("editManager")}` : `👤 ${t("addStateManager")}`}
      onClose={onClose}
      footer={
        <>
          <button
            className="sa-btn sa-btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </button>

          <button
            className="sa-btn sa-btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
            style={{ opacity: isSubmitting || !isFormValid() ? 0.6 : 1 }}
          >   
            {isSubmitting
              ? t("saving")
              : isEdit
              ? t("saveChanges")
              : t("createManager")}
          </button>
        </>
      }
    >
      <div className="sa-form-row">
        <div className="sa-form-field">
          <label>{t("name")} *</label>
          <input
            data-field="name"
            value={form.name || ""}
            onChange={setField("name")}
            onBlur={handleBlur("name")}
            disabled={isSubmitting}
            autoComplete="off"
            placeholder={t("enterFullName")}
            className={touched.name && errors.name ? "sa-error-input" : ""}
          />
          {showError("name")}
        </div>

        <div className="sa-form-field">
          <label>{t("emailUsername")} *</label>
          <input
            data-field="email"
            type="email"
            value={form.email || ""}
            onChange={setField("email")}
            onBlur={handleBlur("email")}
            disabled={isSubmitting}
            autoComplete="off"
             placeholder={t("enterEmailAddress")}
            className={touched.email && errors.email ? "sa-error-input" : ""}
          />
          {showError("email")}
        </div>
      </div>

      <div className="sa-form-row">
        <div className="sa-form-field">
          <label>{t("phone")} *</label>
          <input
            data-field="phoneNumber"
            type="tel"
            value={form.phoneNumber || ""}
            onChange={setField("phoneNumber")}
            onBlur={handleBlur("phoneNumber")}
            disabled={isSubmitting}
            autoComplete="off"
              placeholder={t("enterPhoneNumber")}
            className={touched.phoneNumber && errors.phoneNumber ? "sa-error-input" : ""}
          />
          {showError("phoneNumber")}
        </div>

        <div className="sa-form-field">
            <label>{t("state")} *</label>    
          <select
            value={form.stateId || ""}
            onChange={setField("stateId")}
            onBlur={handleBlur("stateId")}
            disabled={isSubmitting}
            className={touched.stateId && errors.stateId ? "sa-error-input" : ""}
          >
           <option value="">
                  {t("selectState")}
            </option>

                {states && states.length > 0 ? (
  states.map((state) => (
    <option key={state.id} value={state.id}>
      {state.name} ({state.code})
    </option>
  ))
         ) : (
               <option value="" disabled>
               {t("noStatesAvailable")}
                </option>
          )}
               </select>
                {showError("stateId")}
          </div>
          </div>

      {!isEdit && (
        <div className="sa-form-field">
          <label>{t("password")} *</label>
          <div className="sa-password-wrapper" style={{ position: "relative" }}>
            <input
              data-field="password"
              type={showPassword ? "text" : "password"}
              value={form.password || ""}
              onChange={setField("password")}
              onBlur={handleBlur("password")}
              disabled={isSubmitting}
              autoComplete="new-password"
                placeholder={t("password")}
              className={touched.password && errors.password ? "sa-error-input" : ""}
              style={{ width: "100%", paddingRight: "40px" }}
            />
            <button
              type="button"
              className="sa-password-toggle"
              onClick={togglePasswordVisibility}
              disabled={isSubmitting}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
          {showError("password")}
          <small className="sa-field-hint" >
            {t("passwordMinLength")}
          </small>
        </div>
      )}
    </SAModal>
  );
}

export default StateManagerFormModal;
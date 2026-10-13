// src/components/admin/Departments/DepartmentFormModal.js

import React, { useState } from "react";
import PriModal from "../PriModal";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";
import { IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  requiredAndNonEmptyValidationRule,
  passwordValidationRule,
  confirmPasswordValidationRule
} from "../../../utils/validation";
import { useTranslation } from 'react-i18next';

export default function DepartmentFormModal({
  open,
  onClose,
  form,
  handleChange,
  onSave,
  errors,
  setErrors,
  touched,
  setTouched
}) {
  const { t } = useTranslation(); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 🔥 Department type options
  const deptTypeOptions = [
    { id: 'ADMISSION', name: t('admission') },
    { id: 'EXAM', name: t('exam') },
    { id: 'BUS', name: t('bus') }
  ];

  // 🔥 Get selected department type
  const selectedDeptType = deptTypeOptions.find(
    d => d.id === form.deptType
  ) || deptTypeOptions[0];

  // 🔥 Handler for department type change
  const handleDeptTypeChange = (option) => {
    const value = option?.id || 'ADMISSION';
    handleChange({ target: { name: 'deptType', value } });
    if (touched.deptType) {
      setTouched(prev => ({ ...prev, deptType: true }));
    }
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "deptName":
        const deptNameRule = requiredAndNonEmptyValidationRule({
          reqMessage: t('departmentNameRequired'),
          emptyMessage: t('departmentNameEmpty'),
          isHTML: false,
          isAlphabetOnly: false
        });
        const deptNameResult = deptNameRule.validate?.(value);
        if (deptNameResult !== true) error = deptNameResult;
        break;
        
      case "username":
        const usernameRule = requiredAndNonEmptyValidationRule({
          reqMessage: t('usernameRequired'),
          emptyMessage: t('usernameEmpty'),
          isHTML: false,
          minLength: 3,
          minLengthMessage: t('usernameMinLength')
        });
        const usernameResult = usernameRule.validate?.(value);
        if (usernameResult !== true) error = usernameResult;
        break;
        
      case "password":
        const passwordRule = passwordValidationRule({
          minLength: 6,
          isRequired: true,
          includePattern: true,
          patternMessage: t('passwordPatternMessage')
        });
        
        if (passwordRule.required && !value) {
          error = passwordRule.required;
        } else if (passwordRule.pattern && !passwordRule.pattern.value.test(value)) {
          error = passwordRule.pattern.message;
        }
        
        // Also validate confirm password if it exists
        if (form.confirmPassword && !error) {
          const confirmRule = confirmPasswordValidationRule({
            password: value,
            reqMessage: t('confirmPasswordRequired')
          });
          const confirmResult = confirmRule.validate?.match(form.confirmPassword);
          if (confirmResult !== true) {
            setErrors(prev => ({ ...prev, confirmPassword: confirmResult }));
          } else {
            setErrors(prev => ({ ...prev, confirmPassword: "" }));
          }
        }
        break;
        
      case "confirmPassword":
        const confirmRule = confirmPasswordValidationRule({
          password: form.password,
          reqMessage: t('confirmPasswordRequired'),
          patternMessage: t('passwordsDoNotMatch')
        });
        
        if (confirmRule.required && !value) {
          error = confirmRule.required;
        } else if (confirmRule.validate?.match(value) !== true) {
          error = confirmRule.validate?.match(value) || t('passwordsDoNotMatch');
        }
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  const handleChangeWithValidation = (e) => {
    const { name, value } = e.target;
    handleChange(e);
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleSave = () => {
    // Validate all fields
    const fieldsToValidate = ["deptName", "deptType", "username", "password", "confirmPassword"];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      const fieldIsValid = validateField(field, form[field]);
      if (!fieldIsValid) isValid = false;
    });
    
    if (isValid) {
      onSave();
    }
  };

  if (!open) return null;

  return (
    <PriModal
      title={`🏢 ${t('createNewDepartment')}`}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="pri-btn pri-btn-ghost" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="pri-btn pri-btn-primary" onClick={handleSave}>
            {t('createDepartment')}
          </button>
        </div>
      }
    >
      <div className="pri-form-field mb-10">
        <label>{t('departmentName')} *</label>
        <input
          name="deptName"
          value={form.deptName}
          onChange={handleChangeWithValidation}
          onBlur={handleBlur}
          placeholder={t('departmentNamePlaceholder')}
          className={errors.deptName && touched.deptName ? "error-input" : ""}
        />
        {errors.deptName && touched.deptName && (
          <span className="pri-error-message">{errors.deptName}</span>
        )}
      </div>

      <div className="pri-form-field mb-10">
        <label>{t('departmentType')} *</label>
        {/* 🔥 Department Type Dropdown */}
        <PriAutocompleteSelect
          value={selectedDeptType}
          data={deptTypeOptions}
          onChange={handleDeptTypeChange}
          placeholder={t('selectDepartmentType')}
          optionLabel="name"
          optionValue="id"
          size="medium"
          clearable={false}
          required
        />
      </div>

      <div className="pri-form-field mb-10">
        <label>{t('username')} *</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChangeWithValidation}
          onBlur={handleBlur}
          placeholder={t('usernamePlaceholder')}
          className={errors.username && touched.username ? "error-input" : ""}
        />
        {errors.username && touched.username && (
          <span className="pri-error-message">{errors.username}</span>
        )}
      </div>

      <div className="pri-form-field mb-10">
        <label>{t('password')} *</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChangeWithValidation}
            onBlur={handleBlur}
            placeholder={t('departmentLoginPassword')}
            className={errors.password && touched.password ? "error-input" : ""}
            style={{ paddingRight: "40px" }}
          />
          <IconButton
            onClick={handleTogglePassword}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '4px'
            }}
            size="small"
          >
            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </div>
        {errors.password && touched.password && (
          <span className="pri-error-message">{errors.password}</span>
        )}
        <div className="pri-note" style={{ fontSize: "12px", marginTop: "5px" }}>
          {t('passwordRequirements')}
        </div>
      </div>

      <div className="pri-form-field mb-10">
        <label>{t('confirmPassword')} *</label>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChangeWithValidation}
            onBlur={handleBlur}
            placeholder={t('confirmPassword')}
            className={errors.confirmPassword && touched.confirmPassword ? "error-input" : ""}
            style={{ paddingRight: "40px" }}
          />
          <IconButton
            onClick={handleToggleConfirmPassword}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '4px'
            }}
            size="small"
          >
            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </div>
        {errors.confirmPassword && touched.confirmPassword && (
          <span className="pri-error-message">{errors.confirmPassword}</span>
        )}
      </div>

      <div className="pri-note">
        ⚠️ {t('departmentCredentialsNote')}
      </div>
    </PriModal>
  );
}
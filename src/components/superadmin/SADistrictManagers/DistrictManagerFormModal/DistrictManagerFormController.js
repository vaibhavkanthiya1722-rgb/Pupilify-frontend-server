// src/components/superadmin/Dashboard/SADistrictManagers/DistrictManagerFormController.js

import { useState, useEffect } from "react";
import SuperAdminService from "../../../../services/SuperAdminService";
import { 
  validateEmail,
  validatePassword,
  validateRequired,
  validatePhoneNumber,
  validateFieldLength,
  validateSelectRequired,
  validateName
} from "../../../../utils/validation";
import { useTranslation } from "react-i18next";

export default function DistrictManagerFormController(manager, districts, onSaved, onClose, refreshDistricts) {
  const { t } = useTranslation();
  const isEdit = !!manager;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    districtId: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (manager) {
      setForm({
        name: manager.name || "",
        email: manager.email || "",
        phoneNumber: manager.phoneNumber || manager.phone || "",
        districtId: manager.districtId || manager.district?.id || "",
        password: ""
      });
    }
  }, [manager]);

  // ✅ Validation functions using validation.js with language support
  const validateNameField = (value) => {
    const error = validateName(value, {
      reqMessage: t('usernameRequired'),
      minMessage: t('nameMinLength', { minLength: 2 }),
      maxMessage: t('nameMaxLength', { maxLength: 100 }),
      minLength: 2,
      maxLength: 100,
      fieldLabel: 'name'
    });
    return error || true;
  };

  const validateEmailField = (value) => {
    const error = validateEmail(value, {
      isRequired: true,
      reqMessage: t('validEmailRequired'),
      patternMessage: t('emailInvalid')
    });
    return error || true;
  };

  const validatePhoneField = (value) => {
    const error = validatePhoneNumber(value, {
      isRequired: true,
      reqMessage: t('phoneRequired'),
      minLength: 10,
      maxLength: 15,
      minMessage: t('phoneMinLength', { minLength: 10 }),
      maxMessage: t('phoneMaxLength', { maxLength: 15 }),
      patternMessage: t('phoneInvalid')
    });
    return error || true;
  };

  const validateDistrictField = (value) => {
    const error = validateSelectRequired(value, {
      reqMessage: t('selectdistrict')
    });
    if (error) return error;
    
    // Validate district exists in list
    const districtId = typeof value === 'string' ? parseInt(value) : value;
    if (!districts || !districts.find(district => district.id === districtId)) {
      return t('districtInvalid') || "Please select a valid district";
    }
    return true;
  };

  const validatePasswordField = (value) => {
    if (isEdit && !value) return true;
    
    const error = validatePassword(value, {
      minLength: 6,
      isRequired: !isEdit,
      reqMessage: t('passwordIsRequired'),
      minLengthMessage: t('passwordMinLength', { minLength: 6 })
    });
    if (error) return error;
    
    // Additional password pattern validation
    if (value) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordRegex.test(value)) {
        return t('passwordPatternInvalid');
      }
    }
    return true;
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        return validateNameField(value);
      case 'email':
        return validateEmailField(value);
      case 'phoneNumber':
        return validatePhoneField(value);
      case 'districtId':
        return validateDistrictField(value);
      case 'password':
        return validatePasswordField(value);
      default:
        return true;
    }
  };

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field) => (e) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    if (error !== true) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const fieldsToValidate = ['name', 'email', 'phoneNumber', 'districtId'];
    
    if (!isEdit) {
      fieldsToValidate.push('password');
    } else if (form.password && form.password.length > 0) {
      const passwordError = validatePasswordField(form.password);
      if (passwordError !== true) {
        newErrors.password = passwordError;
        isValid = false;
      }
    }

    fieldsToValidate.forEach(field => {
      const error = validateField(field, form[field]);
      if (error !== true) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const submit = async () => {
    const allFields = ['name', 'email', 'phoneNumber', 'districtId'];
    if (!isEdit) allFields.push('password');
    
    const touchedState = {};
    allFields.forEach(field => {
      touchedState[field] = true;
    });
    setTouched(touchedState);

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setLoading(true);

    try {
      const districtIdValue = typeof form.districtId === 'string' ? parseInt(form.districtId) : form.districtId;
      
      const selectedDistrict = districts.find(d => d.id === districtIdValue);
      
      if (!selectedDistrict) {
        throw new Error(t('districtNotFound') || "Selected district not found");
      }
      
      const stateId = selectedDistrict.state?.id;
      const stateName = selectedDistrict.state?.name;
      
      if (!stateId || !stateName) {
        throw new Error(t('districtNoState') || "District must be associated with a state");
      }

      const managerData = {
        name: form.name.trim(),
        username: form.email.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        districtId: districtIdValue,
        districtName: selectedDistrict.name,
        stateId: stateId,
        stateName: stateName,
        role: "ROLE_DISTRICT_ADMIN",
        active: true
      };

      if (!isEdit && form.password) {
        managerData.password = form.password;
      } else if (isEdit && form.password && form.password.length > 0) {
        managerData.password = form.password;
      }

      if (isEdit && manager?.id) {
        await SuperAdminService.updateDistrictManager(manager.id, managerData);
        onSaved(t('districtManagerUpdated') || "District manager updated successfully!");
      } else {
        await SuperAdminService.createDistrictManager(managerData);
        onSaved(t('districtManagerCreated') || "District manager created successfully!");
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = error.response?.data?.message || error.message || t('somethingWentWrong') || "Something went wrong";
      
      if (error.response?.status === 409) {
        alert(t('emailAlreadyExists') || "A user with this email already exists! Please use a different email address.");
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setField,
    handleBlur,
    errors,
    touched,
    loading,
    isEdit,
    submit
  };
}
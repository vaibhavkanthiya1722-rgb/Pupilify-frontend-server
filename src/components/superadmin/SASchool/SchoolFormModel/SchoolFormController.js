// src/components/superadmin/Dashboard/SASchools/SchoolFormController.js

import { useState, useEffect } from "react";
import SuperAdminService from "../../../../services/SuperAdminService";
import { API_URL } from "../../../../libs/constants";
import { 
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateFieldLength,
  validateSelectRequired,
  validateSchoolName
} from "../../../../utils/validation";
import { useTranslation } from "react-i18next";

export default function SchoolFormController(school, onSaved, onClose) {
  const { t } = useTranslation();
  const isEdit = !!school;

  const [form, setForm] = useState({
    schoolName: "",
    mailId: "",
    phoneNumber: "",
    address: "",
    password: "",
    subscriptionStatus: "TRIAL",
    stateId: "",
    districtId: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load states on component mount
  useEffect(() => {
    loadStates();
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (form.stateId) {
      loadDistrictsByState(form.stateId);
    } else {
      setDistricts([]);
    }
  }, [form.stateId]);

  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const response = await SuperAdminService.getAllStates();
      const data = response?.data || response;
      const statesArray = Array.isArray(data) ? data : [];
      setStates(statesArray);

      if (statesArray.length === 1) {
        setForm(prev => ({
          ...prev,
          stateId: statesArray[0].id
        }));
      }
    } catch (error) {
      console.error("Failed to load states:", error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const loadDistrictsByState = async (stateId) => {
    setLoadingDistricts(true);
    try {
      const response = await SuperAdminService.getAllDistricts(stateId);
      const data = response?.data || response;
      setDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load districts:", error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Set form data when editing
  useEffect(() => {
    if (school) {
      setForm({
        schoolName: school.schoolName || "",
        mailId: school.mailId || "",
        phoneNumber: school.phoneNumber || "",
        address: school.address || "",
        password: "",
        subscriptionStatus: school.subscriptionStatus || "TRIAL",
        stateId: school.state?.id || "",
        districtId: school.district?.id || ""
      });
      
      if (school.state?.id) {
        loadDistrictsByState(school.state.id);
      }
    }
  }, [school]);

  // Set logo preview when editing
  useEffect(() => {
    if (school?.schoolLogo) {
      let logoUrl = "";
      if (school.schoolLogo.startsWith("http")) {
        logoUrl = school.schoolLogo;
      } else if (school.schoolLogo.startsWith("/uploads")) {
        logoUrl = `${API_URL}${school.schoolLogo}`;
      } else {
        logoUrl = `${API_URL}/uploads/schools/${school.schoolLogo}`;
      }
      setLogoPreview(logoUrl);
    }
  }, [school]);

  // ✅ Validation functions using validation.js with language support
  const validateSchoolNameField = (value) => {
    const error = validateSchoolName(value, {
      reqMessage: t('schoolNameRequired'),
      minMessage: t('schoolNameMinLength', { minLength: 2 }),
      maxMessage: t('schoolNameMaxLength', { maxLength: 100 }),
      minLength: 2,
      maxLength: 100
    });
    return error || true;
  };

  const validateEmailField = (value) => {
    const error = validateEmail(value, {
      isRequired: !isEdit,
      reqMessage: t('validEmailRequired'),
      patternMessage: t('emailInvalid')
    });
    return error || true;
  };

  const validatePhoneField = (value) => {
    const error = validatePhoneNumber(value, {
      isRequired: false,
      reqMessage: t('phoneRequired'),
      minLength: 10,
      maxLength: 15,
      minMessage: t('phoneMinLength', { minLength: 10 }),
      maxMessage: t('phoneMaxLength', { maxLength: 15 }),
      patternMessage: t('phoneInvalid')
    });
    return error || true;
  };

  const validateAddressField = (value) => {
    if (!value) return true;
    const error = validateFieldLength(value, {
      minLength: 5,
      maxLength: 500,
      minMessage: t('addressMinLength', { minLength: 5 }),
      maxMessage: t('addressMaxLength', { maxLength: 500 })
    });
    return error || true;
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

  const validateStateIdField = (value) => {
    const error = validateSelectRequired(value, {
      reqMessage: t('selectStateFirst')
    });
    return error || true;
  };

  const validateDistrictIdField = (value) => {
    const error = validateSelectRequired(value, {
      reqMessage: t('selectdistrict')
    });
    return error || true;
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'schoolName':
        return validateSchoolNameField(value);
      case 'mailId':
        return validateEmailField(value);
      case 'phoneNumber':
        return validatePhoneField(value);
      case 'address':
        return validateAddressField(value);
      case 'password':
        return validatePasswordField(value);
      case 'stateId':
        return validateStateIdField(value);
      case 'districtId':
        return validateDistrictIdField(value);
      default:
        return true;
    }
  };

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'stateId') {
      setForm((prev) => ({ ...prev, districtId: "" }));
    }
    
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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(t('fileSizeLimit') || "File size should be less than 2MB");
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert(t('fileTypeInvalid') || "Please upload only PNG, JPEG, or GIF images");
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const fieldsToValidate = ['schoolName', 'mailId', 'stateId', 'districtId'];
    
    if (!isEdit) {
      fieldsToValidate.push('password');
    }
    
    if (form.phoneNumber) fieldsToValidate.push('phoneNumber');
    if (form.address) fieldsToValidate.push('address');

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
    const allFields = ['schoolName', 'mailId', 'stateId', 'districtId'];
    if (!isEdit) allFields.push('password');
    if (form.phoneNumber) allFields.push('phoneNumber');
    if (form.address) allFields.push('address');
    
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
      const schoolData = {
        schoolName: form.schoolName.trim(),
        mailId: form.mailId.trim().toLowerCase(),
        phoneNumber: form.phoneNumber || null,
        address: form.address || null,
        subscriptionStatus: form.subscriptionStatus,
        state: { id: parseInt(form.stateId) },
        district: { id: parseInt(form.districtId) }
      };

      if (!isEdit) {
        schoolData.password = form.password;
      }

      if (isEdit && school?.id) {
        schoolData.id = school.id;
      }

      const formData = new FormData();
      formData.append("schoolData", JSON.stringify(schoolData));

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (isEdit) {
        await SuperAdminService.updateSchool(school.id, formData);
      } else {
        await SuperAdminService.addSchool(formData);
      }

      onSaved(
        isEdit
          ? t('schoolUpdated') || "School updated successfully!"
          : t('schoolCreated') || "School created successfully!"
      );

      onClose();

    } catch (error) {
      console.error("Submit error:", error);
      alert(error.response?.data?.message || error.message || t('somethingWentWrong') || "Something went wrong");
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
  };
}
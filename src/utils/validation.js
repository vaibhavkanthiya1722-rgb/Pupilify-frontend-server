// utils/validation.js
import { ITEM_LIMIT } from "../libs/constants";
import i18n from "../locales/i18n";

// Helper function to get translated message
const getTranslation = (key, options = {}) => {
  return i18n.t(key, options);
};

/**
 * Generates phone number validation rules for use with form validation.
 */
export const phoneValidationRule = ({
  isRequired = true,
  reqMessage = null,
  patternMessage = null,
  includePattern = true,
}) => {
  const rule = {
    required: isRequired ? (reqMessage || getTranslation('phoneRequired')) : false,
  };
  
  if (includePattern) {
    rule.pattern = {
      value: /^[0-9+\-\s()]{10,15}$/,
      message: patternMessage || getTranslation('phoneInvalid'),
    };
  }
  
  return rule;
};

/**
 * Generates a password validation rule for use with form validation.
 */
export const passwordValidationRule = ({
  minLength = ITEM_LIMIT.MAX_ITEM_8,
  isRequired = true,
  includePattern = true,
  patternMessage = null,
  reqMessage = null,
}) => {
  const rule = {
    required: isRequired ? (reqMessage || getTranslation('passwordIsRequired')) : false,
  };
  
  if (includePattern) {
    const patternMsg = patternMessage || getTranslation('passwordInvalid', { minLength });
    
    rule.pattern = {
      value: new RegExp(
        `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[a-zA-Z\\d!@#$%^&*]{${minLength},}$`
      ),
      message: patternMsg,
    };
  }
  
  return rule;
};

/**
 * Generates the confirm password validation rule which matches the password field.
 */
export const confirmPasswordValidationRule = ({
  password,
  patternMessage = null,
  reqMessage = null,
}) => ({
  required: reqMessage || getTranslation('confirmPasswordRequired'),
  validate: {
    match: (value) => value === password || (patternMessage || getTranslation('passwordMismatch')),
  },
});

/**
 * Generates email validation rules for use with form validation.
 */
export const emailValidationRule = ({
  isRequired = true,
  reqMessage = null,
  patternMessage = null,
  includePattern = true,
}) => {
  const rule = {
    required: isRequired ? (reqMessage || getTranslation('validEmailRequired')) : false,
  };
  
  if (includePattern) {
    rule.pattern = {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|gov|edu|io|co|[a-z]{2})$/i,
      message: patternMessage || getTranslation('emailInvalid'),
    };
  }
  
  return rule;
};

/**
 * Generates validation rules for a field that must meet various constraints.
 */
export const requiredAndNonEmptyValidationRule = ({
  emptyMessage = null,
  reqMessage = null,
  invalidHtmlMessage = null,
  minLengthMessage = null,
  alphabetOnlyMessage = null,
  isRequired = true,
  isHTML = true,
  minLength,
  isAlphabetOnly = false,
}) => {
  const rule = {
    required: isRequired ? (reqMessage || getTranslation('fieldRequired')) : false,
  };
  
  rule.validate = (value) => {
    if (typeof value !== "string") {
      return "Invalid input type";
    }

    const trimmedValue = value.trim();

    if (isRequired && trimmedValue === "") {
      return emptyMessage || getTranslation('fieldCannotBeEmpty');
    }

    if (!isRequired && trimmedValue === "" && value !== "") {
      return emptyMessage || getTranslation('fieldCannotBeEmpty');
    }

    if (isHTML && /<[^>]*>/g.test(value)) {
      return invalidHtmlMessage || getTranslation('htmlNotAllowed');
    }
    if (minLength && trimmedValue.length < minLength) {
      return minLengthMessage || getTranslation('minLengthMessage', { minLength });
    }
    if (isAlphabetOnly && !/^[A-Za-z]+$/.test(trimmedValue)) {
      return alphabetOnlyMessage || getTranslation('alphabetsOnly');
    }
    return true;
  };
  
  return rule;
};

/**
 * Generates OTP validation rules for use with React Hook Form.
 */
export const getOtpValidationRules = ({
  reqMessage = null,
  invalidMessage = null,
}) => ({
  required: reqMessage || getTranslation('otpRequired'),
  validate: (value) =>
    value.length === ITEM_LIMIT.MAX_ITEM_6 || (invalidMessage || getTranslation('otpInvalid')),
});

/**
 * Validation for heading character limit
 */
export const characterLimitValidationRule = (maxChars, errorMessage) => {
  return (value) => {
    if (!value) return true;
    return value.length <= maxChars || errorMessage;
  };
};

/**
 * Validate field with given rule
 */
export const validateField = (value, rule) => {
  if (!rule) return '';
  
  if (rule.required && !value) {
    return typeof rule.required === 'string' ? rule.required : getTranslation('validation.fieldRequired');
  }
  
  if (rule.pattern && value && !rule.pattern.value.test(value)) {
    return rule.pattern.message;
  }
  
  if (rule.minLength && value && value.length < rule.minLength.value) {
    return rule.minLength.message;
  }
  
  if (rule.validate && value) {
    const result = rule.validate(value);
    if (result !== true) return result;
  }
  
  return '';
};

// ============================================
// ✅ LANGUAGE-AWARE VALIDATION FUNCTIONS
// ============================================

/**
 * Validate email with language support
 */
export const validateEmail = (value, options = {}) => {
  const {
    isRequired = true,
    reqMessage = null,
    patternMessage = null,
  } = options;
  
  if (isRequired && !value) {
    return reqMessage || getTranslation('validEmailRequired');
  }
  
  if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|gov|edu|io|co|[a-z]{2})$/i.test(value)) {
    return patternMessage || getTranslation('emailInvalid');
  }
  
  return '';
};

/**
 * Validate password with language support
 */
export const validatePassword = (value, options = {}) => {
  const {
    minLength = 6,
    isRequired = true,
    reqMessage = null,
    minLengthMessage = null,
  } = options;
  
  if (isRequired && !value) {
    return reqMessage || getTranslation('passwordIsRequired');
  }
  
  if (value && value.length < minLength) {
    return minLengthMessage || getTranslation('passwordMinLength', { minLength });
  }
  
  return '';
};

/**
 * Validate confirm password with language support
 */
export const validateConfirmPassword = (value, password, options = {}) => {
  const {
    reqMessage = null,
    mismatchMessage = null,
  } = options;
  
  if (!value) {
    return reqMessage || getTranslation('confirmPasswordRequired');
  }
  
  if (value !== password) {
    return mismatchMessage || getTranslation('passwordMismatch');
  }
  
  return '';
};

/**
 * Validate OTP with language support
 */
export const validateOtp = (value, options = {}) => {
  const {
    isRequired = true,
    reqMessage = null,
    invalidMessage = null,
    length = 6,
  } = options;
  
  if (isRequired && !value) {
    return reqMessage || getTranslation('otpRequired');
  }
  
  if (value && value.length !== length) {
    return invalidMessage || getTranslation('otpInvalid');
  }
  
  return '';
};

/**
 * Generic required field validation with language support
 */
export const validateRequired = (value, options = {}) => {
  const {
    reqMessage = null,
    fieldName = 'field',
  } = options;
  
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return reqMessage || getTranslation('fieldRequired', { field: fieldName });
  }
  
  return '';
};

// ============================================
// ✅ NEW: Form Controller Validation Functions
// ============================================

/**
 * Validate phone number with language support
 */
export const validatePhoneNumber = (value, options = {}) => {
  const {
    isRequired = false,
    reqMessage = null,
    minLength = 10,
    maxLength = 15,
    minMessage = null,
    maxMessage = null,
    patternMessage = null
  } = options;
  
  if (!value && !isRequired) return '';
  
  if (isRequired && !value) {
    return reqMessage || getTranslation('phoneRequired');
  }
  
  if (!value) return '';
  
  const digitsOnly = value.replace(/[^\d]/g, '');
  
  if (digitsOnly.length < minLength) {
    return minMessage || getTranslation('phoneMinLength', { minLength });
  }
  
  if (digitsOnly.length > maxLength) {
    return maxMessage || getTranslation('phoneMaxLength', { maxLength });
  }
  
  const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
  if (!phoneRegex.test(value)) {
    return patternMessage || getTranslation('phoneInvalid');
  }
  
  return '';
};

/**
 * Validate field length (min/max) with language support
 */
export const validateFieldLength = (value, options = {}) => {
  const {
    minLength = null,
    maxLength = null,
    minMessage = null,
    maxMessage = null
  } = options;
  
  if (!value) return '';
  
  const trimmed = typeof value === 'string' ? value.trim() : String(value);
  
  if (minLength && trimmed.length < minLength) {
    return minMessage || getTranslation('fieldMinLength', { minLength });
  }
  
  if (maxLength && trimmed.length > maxLength) {
    return maxMessage || getTranslation('fieldMaxLength', { maxLength });
  }
  
  return '';
};

/**
 * Validate select field (dropdown) with language support
 */
export const validateSelectRequired = (value, options = {}) => {
  const {
    reqMessage = null
  } = options;
  
  if (!value || value === '' || value === '0' || value === '-1') {
    return reqMessage || getTranslation('selectRequired');
  }
  
  return '';
};

/**
 * Validate school name with language support
 */
export const validateSchoolName = (value, options = {}) => {
  const {
    reqMessage = null,
    minMessage = null,
    maxMessage = null,
    minLength = 2,
    maxLength = 100
  } = options;
  
  const requiredError = validateRequired(value, {
    reqMessage: reqMessage || getTranslation('schoolNameRequired')
  });
  if (requiredError) return requiredError;
  
  const lengthError = validateFieldLength(value, {
    minLength,
    maxLength,
    minMessage: minMessage || getTranslation('schoolNameMinLength', { minLength }),
    maxMessage: maxMessage || getTranslation('schoolNameMaxLength', { maxLength })
  });
  
  return lengthError || '';
};

/**
 * Validate name field with language support
 */
export const validateName = (value, options = {}) => {
  const {
    reqMessage = null,
    minMessage = null,
    maxMessage = null,
    minLength = 2,
    maxLength = 100,
    fieldLabel = 'name'
  } = options;
  
  const requiredError = validateRequired(value, {
    reqMessage: reqMessage || getTranslation('nameRequired', { field: fieldLabel })
  });
  if (requiredError) return requiredError;
  
  const lengthError = validateFieldLength(value, {
    minLength,
    maxLength,
    minMessage: minMessage || getTranslation('nameMinLength', { minLength, field: fieldLabel }),
    maxMessage: maxMessage || getTranslation('nameMaxLength', { maxLength, field: fieldLabel })
  });
  
  return lengthError || '';
};
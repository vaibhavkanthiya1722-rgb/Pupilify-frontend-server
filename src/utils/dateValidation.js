/**
 * Date Validation Utility Functions
 * Contains functions for validating dates (DOB, admission date, etc.)
 */

/**
 * Get today's date in YYYY-MM-DD format for max date attribute
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get date from X years ago in YYYY-MM-DD format
 * @param {number} years - Number of years to go back
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getYearsAgoDate = (years) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {number} Age in years
 */
export const calculateAge = (dob) => {
  if (!dob) return null;
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Validate date of birth (should be in past, and within reasonable age range)
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @param {Object} options - Validation options
 * @param {number} options.minAge - Minimum age required (default: 2 for students)
 * @param {number} options.maxAge - Maximum age allowed (default: 30 for students)
 * @param {boolean} options.required - Whether field is required (default: false)
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateDOB = (dob, options = {}) => {
  const {
    minAge = 2,    // ✅ Default: 2 years for students
    maxAge = 30,   // ✅ Default: 30 years for students
    required = false
  } = options;

  // Check if empty
  if (!dob) {
    if (required) {
      return { isValid: false, message: 'Date of birth is required' };
    }
    return { isValid: true, message: '' };
  }

  const dobDate = new Date(dob);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(dobDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }
  
  // Check if date is in future
  if (dobDate > today) {
    return { isValid: false, message: 'Date of birth cannot be in the future' };
  }
  
  // Calculate age
  const age = calculateAge(dob);
  
  // Check minimum age
  if (age < minAge) {
    return { 
      isValid: false, 
      message: `Age must be at least ${minAge} years old` 
    };
  }
  
  // Check maximum age
  if (age > maxAge) {
    return { 
      isValid: false, 
      message: `Age cannot exceed ${maxAge} years. Please verify.` 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate admission date (should not be in future)
 * @param {string} date - Admission date in YYYY-MM-DD format
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required (default: false)
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateAdmissionDate = (date, options = {}) => {
  const { required = false } = options;

  if (!date) {
    if (required) {
      return { isValid: false, message: 'Admission date is required' };
    }
    return { isValid: true, message: '' };
  }

  const inputDate = new Date(date);
  const today = new Date();
  
  // Reset time part for fair comparison
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  
  if (isNaN(inputDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }
  
  if (inputDate > today) {
    return { isValid: false, message: 'Admission date cannot be in the future' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Get max date attribute value (for input type="date")
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getMaxDate = () => {
  return getTodayDate();
};

/**
 * Get min date attribute for DOB (30 years ago for students)
 * @returns {string} Date 30 years ago in YYYY-MM-DD format
 */
export const getMinDOBDate = () => {
  return getYearsAgoDate(30); // ✅ Student max age: 30 years
};

/**
 * Format date for display
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} format - Output format ('DD/MM/YYYY' or 'MM/DD/YYYY')
 * @returns {string} Formatted date
 */
export const formatDateForDisplay = (dateStr, format = 'DD/MM/YYYY') => {
  if (!dateStr) return '';
  
  const [year, month, day] = dateStr.split('-');
  
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  
  return dateStr;
};

/**
 * Check if a date is valid
 * @param {string} dateStr - Date string to check
 * @returns {boolean} Whether date is valid
 */
export const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Get date range for a specific academic year
 * @param {string} academicYear - e.g., "2025-26"
 * @returns {Object} { startDate: string, endDate: string }
 */
export const getAcademicYearDates = (academicYear) => {
  if (!academicYear || !academicYear.includes('-')) {
    return { startDate: '', endDate: '' };
  }
  
  const [startYear, endYear] = academicYear.split('-');
  const startDate = `${startYear}-04-01`; // April 1st
  const endDate = `20${endYear}-03-31`; // March 31st of next year
  
  return { startDate, endDate };
};
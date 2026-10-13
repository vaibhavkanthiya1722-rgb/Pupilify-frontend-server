// API Endpoints and Configurations
export const API_URL = process.env.REACT_APP_API_URL;

// Item limits for validation
export const ITEM_LIMIT = {
  MAX_ITEM_8: 8,
  MAX_ITEM_6: 6,
  MAX_NAME_LENGTH: 50,
  MIN_NAME_LENGTH: 3,
  MAX_ADDRESS_LENGTH: 200,
  MIN_ADDRESS_LENGTH: 5,
  MAX_QUALIFICATION_LENGTH: 100,
  MIN_QUALIFICATION_LENGTH: 2,
  MAX_SUBJECT_LENGTH: 50,
  MIN_SUBJECT_LENGTH: 2,
  MAX_SALARY: 1000000,
  MIN_SALARY: 0,
  MAX_PHONE_LENGTH: 10,
  MIN_PHONE_LENGTH: 10,
  MAX_AADHAR_LENGTH: 12,
  MIN_AADHAR_LENGTH: 12,
  MIN_AGE: 18,
  MAX_AGE: 100,

  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB per file
  MAX_FILE_SIZE_MB: 2,
  MAX_TOTAL_SIZE: 2 * 1024 * 1024, // 2MB total for all files
  MAX_TOTAL_SIZE_MB: 2,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
};

export const ROLE_LABELS = {
  ROLE_SUPER_ADMIN: "Super Admin",
  ROLE_ADMIN: "Principal",
  ROLE_PRINCIPAL: "Principal",
  ROLE_STATE_ADMIN: "State Admin",
  ROLE_DISTRICT_ADMIN: "District Admin",
  ROLE_TEACHER: "Teacher",
  ROLE_STUDENT: "Student",
  ROLE_DEPARTMENT: "Department",
};

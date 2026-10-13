import { useState } from "react";
import TeachersService from "../../../services/TeachersService";
import { ITEM_LIMIT } from "../../../libs/constants";
import { validateDOB } from "../../../utils/dateValidation";

export default function PriTeachersController({
  schoolId,
  teachers = [],
  onRefresh,
  onToast,
  t  // ← Translation function added
}) {

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const blank = {
    name: '', 
    mail: '', 
    password: '', 
    phoneNumber: '', 
    alternateNumber: '',
    qualification: '', 
    subjectExpertise: '', 
    salary: '', 
    dob: '', 
    address: '', 
    aadharNo: '',
  };
  
  const [form, setForm] = useState(blank);
  const [editForm, setEditForm] = useState({});
  const [tFiles, setTFiles] = useState({});

  // 🔥 FILTER ONLY ACTIVE TEACHERS
  const activeTeachers = Array.isArray(teachers) ? teachers.filter(t => t && t.active === true) : [];

  // ✅ FILE VALIDATION FUNCTION
  const validateFileSize = (file, fileName) => {
    if (!file || !(file instanceof File)) return { isValid: true, message: '' };
    
    if (file.size > ITEM_LIMIT.MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        message: t('fileSizeExceeds', { fileName, size: ITEM_LIMIT.MAX_FILE_SIZE_MB })
      };
    }
    
    if (!ITEM_LIMIT.ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        message: t('invalidFileFormat', { fileName })
      };
    }
    
    return { isValid: true, message: '' };
  };

  // ✅ VALIDATE ALL FILES
  const validateAllFiles = () => {
    const fileFields = [
      { file: tFiles.photo, name: t('teacherPhoto') },
      { file: tFiles.aadharImg, name: t('aadharCard') },
      { file: tFiles.passbookImg, name: t('bankPassbook') }
    ];

    const errors = {};
    let hasError = false;

    for (const { file, name } of fileFields) {
      if (file instanceof File) {
        const validation = validateFileSize(file, name);
        if (!validation.isValid) {
          errors[name] = validation.message;
          hasError = true;
        }
      }
    }

    if (hasError) {
      setValidationErrors(prev => ({ ...prev, ...errors }));
      return false;
    }
    
    return true;
  };

  // Form field handlers with validation clear
  const handleFormChange = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (validationErrors[k]) {
      setValidationErrors(prev => ({ ...prev, [k]: null }));
    }
  };
  
  const handleEditFormChange = (k) => (e) => {
    setEditForm(p => ({ ...p, [k]: e.target.value }));
  };
  
  // File change handler
  const onFileChange = (key, file) => {
    const fileNames = {
      photo: t('teacherPhoto'),
      aadharImg: t('aadharCard'),
      passbookImg: t('bankPassbook')
    };
    
    setValidationErrors(prev => ({ ...prev, [fileNames[key]]: null }));
    setTFiles(p => ({ ...p, [key]: file }));
  };

  // Filter teachers based on search
  const filteredTeachers = activeTeachers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.mail?.toLowerCase().includes(search.toLowerCase()) ||
    t.subjectExpertise?.toLowerCase().includes(search.toLowerCase())
  );

  // Validation rules
  const validateForm = () => {
    const errors = {};
    
    if (!form.name?.trim()) {
      errors.name = t('teacherNameRequired');
    } else if (form.name.trim().length < ITEM_LIMIT.MIN_NAME_LENGTH) {
      errors.name = t('nameMinLength', { length: ITEM_LIMIT.MIN_NAME_LENGTH });
    } else if (!/^[A-Za-z\s]+$/.test(form.name.trim())) {
      errors.name = t('nameOnlyAlphabets');
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|gov|edu|io|co|[a-z]{2})$/i;
    if (!form.mail?.trim()) {
      errors.mail = t('validEmailRequired');
    } else if (!emailRegex.test(form.mail.trim())) {
      errors.mail = t('validEmailRequired');
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;
    if (!form.password) {
      errors.password = t('passwordRequired');
    } else if (!passwordRegex.test(form.password)) {
      errors.password = t('passwordValidationMessage', { length: ITEM_LIMIT.MAX_ITEM_8 });
    }
    
    if (form.phoneNumber) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(form.phoneNumber)) {
        errors.phoneNumber = t('validPhoneRequired');
      }
    }
    
    if (form.alternateNumber) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(form.alternateNumber)) {
        errors.alternateNumber = t('validAlternatePhoneRequired');
      }
    }
    
    if (form.salary) {
      const salary = parseFloat(form.salary);
      if (isNaN(salary) || salary <= ITEM_LIMIT.MIN_SALARY) {
        errors.salary = t('salaryPositiveNumber');
      } else if (salary > ITEM_LIMIT.MAX_SALARY) {
        errors.salary = t('salaryMaxExceed', { max: ITEM_LIMIT.MAX_SALARY.toLocaleString('en-IN') });
      }
    }
    
    if (form.aadharNo) {
      const aadharRegex = /^\d{12}$/;
      const cleanAadhar = form.aadharNo.replace(/\s/g, '');
      if (!aadharRegex.test(cleanAadhar)) {
        errors.aadharNo = t('aadharNumberLength', { length: ITEM_LIMIT.MAX_AADHAR_LENGTH });
      }
    }
    
    const dobValidation = validateDOB(form.dob, { 
      minAge: ITEM_LIMIT.MIN_AGE, 
      maxAge: ITEM_LIMIT.MAX_AGE,
      required: false 
    });
    
    if (!dobValidation.isValid) {
      errors.dob = dobValidation.message;
    }
    
    if (form.address && form.address.trim().length < ITEM_LIMIT.MIN_ADDRESS_LENGTH) {
      errors.address = t('addressMinLength', { length: ITEM_LIMIT.MIN_ADDRESS_LENGTH });
    }
    
    if (!form.qualification?.trim()) {
      errors.qualification = t('qualificationRequired');
    } else if (form.qualification.trim().length < ITEM_LIMIT.MIN_QUALIFICATION_LENGTH) {
      errors.qualification = t('qualificationMinLength', { length: ITEM_LIMIT.MIN_QUALIFICATION_LENGTH });
    }
    
    if (!form.subjectExpertise?.trim()) {
      errors.subjectExpertise = t('subjectExpertiseRequired');
    } else if (form.subjectExpertise.trim().length < ITEM_LIMIT.MIN_SUBJECT_LENGTH) {
      errors.subjectExpertise = t('subjectMinLength', { length: ITEM_LIMIT.MIN_SUBJECT_LENGTH });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Format salary for display
  const formatSalary = (salary) => {
    if (!salary && salary !== 0) return '—';
    const numericSalary = typeof salary === 'string' ? parseFloat(salary) : salary;
    if (isNaN(numericSalary) || numericSalary === 0) return '—';
    return `₹${Math.round(numericSalary).toLocaleString('en-IN')}`;
  };

  // ✅ UPDATED: Submit new teacher with proper error handling
  const submitTeacher = async () => {
    const filesValid = validateAllFiles();
    if (!filesValid) {
      onToast?.(t('fileSizeError'), 'error');
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      onToast?.(t('fixValidationErrors'), 'error');
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      
      let salaryValue = 0;
      if (form.salary) {
        const parsed = parseFloat(form.salary);
        salaryValue = isNaN(parsed) ? 0 : Math.round(parsed);
      }
      
      const teacherData = {
        name: form.name.trim(),
        mail: form.mail.trim().toLowerCase(),
        password: form.password,
        phoneNumber: form.phoneNumber || null,
        alternateNumber: form.alternateNumber || null,
        qualification: form.qualification.trim(),
        subjectExpertise: form.subjectExpertise.trim(),
        salary: salaryValue,
        dob: form.dob || null,
        address: form.address?.trim() || null,
        aadharNo: form.aadharNo?.replace(/\s/g, '') || null,
      };
      
      fd.append('teacherData', JSON.stringify(teacherData));
      fd.append('schoolId', schoolId);

      if (tFiles.photo instanceof File) fd.append('photo', tFiles.photo);
      if (tFiles.aadharImg instanceof File) fd.append('aadharImg', tFiles.aadharImg);
      if (tFiles.passbookImg instanceof File) fd.append('passbookImg', tFiles.passbookImg);

      await TeachersService.onboardTeacher(fd);

      setModal(false);
      setForm(blank);
      setTFiles({});
      setValidationErrors({});
      onToast?.(t('teacherOnboardedSuccess'), 'success');
      onRefresh?.();
      
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // ✅ Extract exact error message from backend
      let errorMessage = '';
      
      // Check different response formats
      if (error.response?.data) {
        // If response data is a string
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
        // If response data has message property
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        // If response data has error property
        else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        // If response data has errors object
        else if (error.response.data.errors) {
          const errors = error.response.data.errors;
          const firstKey = Object.keys(errors)[0];
          if (firstKey) {
            errorMessage = errors[firstKey];
          }
        }
        // If response data has mail or email property
        else if (error.response.data.mail) {
          errorMessage = error.response.data.mail;
        }
        else if (error.response.data.email) {
          errorMessage = error.response.data.email;
        }
        // If nothing works, stringify the data
        else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      
      // If no message found, use default
      if (!errorMessage) {
        errorMessage = error.message || t('unknownError');
      }
      
      // ✅ Handle 400 Bad Request with email error
      if (error.response?.status === 400 || error.response?.status === 409) {
        // Check if error is email related
        if (errorMessage.toLowerCase().includes('email') || 
            errorMessage.toLowerCase().includes('already active') ||
            errorMessage.toLowerCase().includes('already exists')) {
          
          // Set error on mail field
          setValidationErrors(prev => ({ 
            ...prev, 
            mail: errorMessage // Shows: "Error: This teacher email is already active!"
          }));
          
          // ✅ Show exact error in toast
          onToast?.(errorMessage, 'error');
        } else {
          // Other validation errors
          onToast?.(errorMessage, 'error');
        }
      } else {
        // Other errors
        onToast?.(t('teacherOnboardError', { error: errorMessage }), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Update teacher with proper error handling
  const updateTeacher = async () => {
    const errors = {};
    
    if (editForm.name?.trim() && editForm.name.trim().length < ITEM_LIMIT.MIN_NAME_LENGTH) {
      errors.name = t('nameMinLength', { length: ITEM_LIMIT.MIN_NAME_LENGTH });
    }
    
    if (editForm.phoneNumber) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(editForm.phoneNumber)) {
        errors.phoneNumber = t('validPhoneRequired');
      }
    }
    
    let salaryValue = null;
    if (editForm.salary) {
      const parsed = parseFloat(editForm.salary);
      if (!isNaN(parsed)) {
        salaryValue = Math.round(parsed);
        if (salaryValue <= ITEM_LIMIT.MIN_SALARY) {
          errors.salary = t('salaryPositiveNumber');
        } else if (salaryValue > ITEM_LIMIT.MAX_SALARY) {
          errors.salary = t('salaryMaxExceed', { max: ITEM_LIMIT.MAX_SALARY.toLocaleString('en-IN') });
        }
      }
    }
    
    if (editForm.aadharNo) {
      const aadharRegex = /^\d{12}$/;
      const cleanAadhar = editForm.aadharNo.replace(/\s/g, '');
      if (!aadharRegex.test(cleanAadhar)) {
        errors.aadharNo = t('aadharNumberLength', { length: ITEM_LIMIT.MAX_AADHAR_LENGTH });
      }
    }
    
    if (editForm.dob) {
      const dobValidation = validateDOB(editForm.dob, { 
        minAge: ITEM_LIMIT.MIN_AGE, 
        maxAge: ITEM_LIMIT.MAX_AGE 
      });
      if (!dobValidation.isValid) {
        errors.dob = dobValidation.message;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.values(errors)[0];
      onToast?.(errorMessage, 'error');
      return;
    }

    const updateData = {
      name: editForm.name,
      address: editForm.address,
      qualification: editForm.qualification,
      subjectExpertise: editForm.subjectExpertise,
      phoneNumber: editForm.phoneNumber,
      alternateNumber: editForm.alternateNumber,
      aadharNo: editForm.aadharNo,
      dob: editForm.dob
    };
    
    if (salaryValue !== null && !isNaN(salaryValue)) {
      updateData.salary = salaryValue;
    }

    setLoading(true);
    try {
      await TeachersService.updateTeacher(editModal.id, updateData);
      
      setEditModal(null);
      onToast?.(t('teacherUpdatedSuccess'), 'success');
      onRefresh?.();
      
    } catch (error) {
      console.error('Update error:', error);
      
      // Extract error message
      let errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         (typeof error.response?.data === 'string' ? error.response.data : '') ||
                         error.message || 
                         t('unknownError');
      
      onToast?.(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete/Inactivate teacher
  const deleteTeacher = async (id) => {
    try {
      await TeachersService.deleteTeacher(id);
      onToast?.(t('teacherInactivatedSuccess'), 'success');
      onRefresh?.();
      
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           t('unknownError');
      onToast?.(errorMessage, 'error');
    }
  };

  // Modal handlers
  const openOnboardModal = () => {
    setForm(blank);
    setTFiles({});
    setValidationErrors({});
    setModal(true);
  };

  const closeOnboardModal = () => {
    setModal(false);
    setValidationErrors({});
  };

  const openEditModal = (teacher) => {
    setEditForm({
      name: teacher.name,
      address: teacher.address,
      qualification: teacher.qualification,
      subjectExpertise: teacher.subjectExpertise,
      salary: teacher.salary ? Math.round(teacher.salary).toString() : '',
      phoneNumber: teacher.phoneNumber,
      alternateNumber: teacher.alternateNumber,
      aadharNo: teacher.aadharNo,
      dob: teacher.dob
    });
    setEditModal(teacher);
  };

  const closeEditModal = () => {
    setEditModal(null);
  };

  const openViewModal = (teacher) => {
    setViewTeacher(teacher);
  };

  const closeViewModal = () => {
    setViewTeacher(null);
  };

  return {
    search, setSearch,
    modal,
    editModal,
    viewTeacher,
    loading,
    validationErrors,
    form,
    editForm,
    tFiles,
    filteredTeachers,
    totalTeachers: activeTeachers.length,
    filteredCount: filteredTeachers.length,
    handleFormChange,
    handleEditFormChange,
    onFileChange,
    submitTeacher,
    updateTeacher,
    deleteTeacher,
    openOnboardModal,
    closeOnboardModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    formatSalary
  };
}
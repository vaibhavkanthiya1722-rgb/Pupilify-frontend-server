// src/components/admin/PriStudents/PriStudentsController.js

import { useState, useEffect, useCallback } from "react";
import StudentsService from "../../../services/StudentsService";
import { ITEM_LIMIT } from "../../../libs/constants";
import { validateDOB } from "../../../utils/dateValidation";

export default function PriStudentsController({
  schoolId,
  classes,
  sections,
  onRefresh,
  onToast,
  academicYearId,
  t
}) {

  const currentAcademicYearId = academicYearId?.id || academicYearId;

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSec, setFilterSec] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterCaste, setFilterCaste] = useState('');
  
  const [localStudents, setLocalStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [promoteModal, setPromoteModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Complete blank form with all fields
  const blank = {
    name: '', 
    email: '', 
    password: '', 
    phoneNo: '', 
    dob: '',
    fatherName: '', 
    motherName: '', 
    fatherContactNumber: '',
    aadharCardNo: '', 
    samagraId: '', 
    address: '',
    gender: '', 
    caste: '', 
    apaarId: '',
    rollNumber: '',
    familyId: '',
    scholarNo: '',
    fatherOccupation: '',
    fatherSalary: '',
    postalCode: '',
    bankName: '',
    bankAccountNo: '',
    ifscCode: '',
    branch: '',
    penNumber: ''
  };

  const [form, setForm] = useState(blank);
  const [editForm, setEditForm] = useState({});
  const [classId, setClassId] = useState('');
  const [secId, setSecId] = useState('');
  const [sFiles, setSFiles] = useState({});
  const [editFiles, setEditFiles] = useState({});
  const [pForm, setPForm] = useState({ newClassId: '', newSectionId: '0' });

  const getSectionsForClass = useCallback((classIdValue) => {
    return sections.filter(s => String(s.classId) === String(classIdValue));
  }, [sections]);

  const getFirstSectionForClass = useCallback((classIdValue) => {
    const classSections = getSectionsForClass(classIdValue);
    return classSections.length > 0 ? classSections[0].id.toString() : '';
  }, [getSectionsForClass]);

  const validateFileSize = useCallback((file, fileName) => {
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
  }, [t]);

  const validateAllFiles = useCallback(() => {
    const fileFields = [
      { file: sFiles.photo, name: t('studentPhoto') },
      { file: sFiles.marksheet, name: t('lastClassMarksheet') },
      { file: sFiles.aadharImg, name: t('aadharCard') },
      { file: sFiles.samagraImg, name: t('samagraIdImage') },
      { file: sFiles.passbookImg, name: t('bankPassbookImage') },
      { file: sFiles.tcImg, name: t('transferCertificate') },
      { file: sFiles.apaarImg, name: t('apaarCardImage') },
      { file: sFiles.birthCertificate, name: t('birthCertificate') },
      { file: sFiles.incomeCertificate, name: t('incomeCertificate') },
      { file: sFiles.castCertificate, name: t('castCertificate') },
      { file: sFiles.domicileCertificate, name: t('domicileCertificate') }
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
  }, [sFiles, validateFileSize, t]);

  const handleFormChange = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (validationErrors[k]) {
      setValidationErrors(prev => ({ ...prev, [k]: null }));
    }
  };

  const handleEditFormChange = (k) => (e) => {
    setEditForm(p => ({ ...p, [k]: e.target.value }));
    if (validationErrors[k]) {
      setValidationErrors(prev => ({ ...prev, [k]: null }));
    }
  };

  const onFileChange = (key, file) => {
    const fileNames = {
      photo: t('studentPhoto'),
      marksheet: t('lastClassMarksheet'),
      aadharImg: t('aadharCard'),
      samagraImg: t('samagraIdImage'),
      passbookImg: t('bankPassbookImage'),
      tcImg: t('transferCertificate'),
      apaarImg: t('apaarCardImage'),
      birthCertificate: t('birthCertificate'),
      incomeCertificate: t('incomeCertificate'),
      castCertificate: t('castCertificate'),
      domicileCertificate: t('domicileCertificate')
    };
    
    setValidationErrors(prev => ({ ...prev, [fileNames[key]]: null }));
    setSFiles(p => ({ ...p, [key]: file }));
  };

  const onEditFileChange = (key, file) => {
    setEditFiles(p => ({ ...p, [key]: file }));
  };

  const handleClassChange = (newClassId) => {
    setClassId(newClassId);
    const firstSection = getFirstSectionForClass(newClassId);
    setSecId(firstSection);
    if (validationErrors.classId) {
      setValidationErrors(prev => ({ ...prev, classId: null }));
    }
    if (validationErrors.secId) {
      setValidationErrors(prev => ({ ...prev, secId: null }));
    }
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      if (filterGender || filterCaste) {
        const data = await StudentsService.getFilteredReport(
          schoolId,
          filterClass,
          filterSec,
          filterGender,
          filterCaste,
          currentAcademicYearId
        );
        setLocalStudents(Array.isArray(data) ? data : []);
      } else {
        const data = await StudentsService.getStudents(
          schoolId,
          filterClass,
          filterSec,
          currentAcademicYearId
        );
        setLocalStudents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('❌ Error loading students:', error);
      setLocalStudents([]);
      onToast?.(t('failedToLoadStudents'), 'error');
    } finally {
      setLoading(false);
    }
  }, [schoolId, filterClass, filterSec, filterGender, filterCaste, currentAcademicYearId, onToast, t]);

  useEffect(() => { 
    loadStudents(); 
  }, [loadStudents]);

  // Student validation with 2-30 years age range
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!form.name?.trim()) {
      errors.name = t('studentNameRequired');
    } else if (form.name.trim().length < ITEM_LIMIT.MIN_NAME_LENGTH) {
      errors.name = t('nameMinLength', { length: ITEM_LIMIT.MIN_NAME_LENGTH });
    } else if (!/^[A-Za-z\s]+$/.test(form.name.trim())) {
      errors.name = t('nameOnlyAlphabets');
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|gov|edu|io|co|[a-z]{2})$/i;
    if (!form.email?.trim()) {
      errors.email = t('validEmailRequired');
    } else if (!emailRegex.test(form.email.trim())) {
      errors.email = t('validEmailRequired');
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;
    if (!form.password) {
      errors.password = t('passwordRequired');
    } else if (!passwordRegex.test(form.password)) {
      errors.password = t('passwordValidationMessage', { length: ITEM_LIMIT.MAX_ITEM_8 });
    }
    
    if (form.rollNumber) {
      if (!/^\d+$/.test(form.rollNumber)) {
        errors.rollNumber = t('rollNumberDigitsOnly');
      }
    }
    
    if (form.phoneNo) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(form.phoneNo)) {
        errors.phoneNo = t('validPhoneRequired');
      }
    }
    
    if (form.fatherContactNumber) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(form.fatherContactNumber)) {
        errors.fatherContactNumber = t('validPhoneRequired');
      }
    }
    
    if (form.aadharCardNo) {
      const aadharRegex = /^\d{12}$/;
      const cleanAadhar = form.aadharCardNo.replace(/\s/g, '');
      if (!aadharRegex.test(cleanAadhar)) {
        errors.aadharCardNo = t('aadharNumberLength', { length: ITEM_LIMIT.MAX_AADHAR_LENGTH });
      }
    }
    
    if (form.postalCode) {
      const postalRegex = /^\d{6}$/;
      if (!postalRegex.test(form.postalCode)) {
        errors.postalCode = t('invalidPostalCode');
      }
    }
    
    if (form.bankAccountNo) {
      const bankRegex = /^\d{9,18}$/;
      if (!bankRegex.test(form.bankAccountNo)) {
        errors.bankAccountNo = t('invalidBankAccount');
      }
    }
    
    if (form.ifscCode) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(form.ifscCode)) {
        errors.ifscCode = t('invalidIfscCode');
      }
    }
    
    // Student DOB validation - 2 to 30 years
    const dobValidation = validateDOB(form.dob, { 
      minAge: 2,
      maxAge: 30,
      required: false 
    });
    
    if (!dobValidation.isValid) {
      errors.dob = dobValidation.message;
    }
    
    if (form.address && form.address.trim().length < ITEM_LIMIT.MIN_ADDRESS_LENGTH) {
      errors.address = t('addressMinLength', { length: ITEM_LIMIT.MIN_ADDRESS_LENGTH });
    }
    
    if (!form.gender) {
      errors.gender = t('selectGender');
    }
    
    if (!classId) {
      errors.classId = t('pleaseSelectClass');
    }
    
    if (!secId || secId === '') {
      errors.secId = t('pleaseSelectSection');
    } else {
      const classSections = getSectionsForClass(classId);
      const selectedSection = classSections.find(s => String(s.id) === String(secId));
      if (!selectedSection) {
        errors.secId = t('invalidSectionSelected');
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form, classId, secId, getSectionsForClass, t]);

  // Edit form validation with 2-30 years age range
  const validateEditForm = useCallback(() => {
    const errors = {};
    
    if (editForm.phoneNo) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(editForm.phoneNo)) {
        errors.phoneNo = t('validPhoneRequired');
      }
    }
    
    if (editForm.fatherContactNumber) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(editForm.fatherContactNumber)) {
        errors.fatherContactNumber = t('validPhoneRequired');
      }
    }
    
    if (editForm.aadharCardNo) {
      const aadharRegex = /^\d{12}$/;
      const cleanAadhar = editForm.aadharCardNo.replace(/\s/g, '');
      if (!aadharRegex.test(cleanAadhar)) {
        errors.aadharCardNo = t('aadharNumberLength', { length: ITEM_LIMIT.MAX_AADHAR_LENGTH });
      }
    }
    
    if (editForm.postalCode) {
      const postalRegex = /^\d{6}$/;
      if (!postalRegex.test(editForm.postalCode)) {
        errors.postalCode = t('invalidPostalCode');
      }
    }
    
    if (editForm.bankAccountNo) {
      const bankRegex = /^\d{9,18}$/;
      if (!bankRegex.test(editForm.bankAccountNo)) {
        errors.bankAccountNo = t('invalidBankAccount');
      }
    }
    
    if (editForm.ifscCode) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(editForm.ifscCode)) {
        errors.ifscCode = t('invalidIfscCode');
      }
    }
    
    if (editForm.dob) {
      const dobValidation = validateDOB(editForm.dob, { 
        minAge: 2,
        maxAge: 30
      });
      if (!dobValidation.isValid) {
        errors.dob = dobValidation.message;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [editForm, t]);

  const submitStudent = async () => {
    if (!secId || secId === '') {
      onToast?.(t('pleaseSelectSection'), 'error');
      setValidationErrors(prev => ({ ...prev, secId: t('pleaseSelectSection') }));
      return;
    }

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
      
      const studentData = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phoneNo: form.phoneNo || null,
        dob: form.dob || null,
        fatherName: form.fatherName?.trim() || null,
        motherName: form.motherName?.trim() || null,
        fatherContactNumber: form.fatherContactNumber || null,
        aadharCardNo: form.aadharCardNo?.replace(/\s/g, '') || null,
        samagraId: form.samagraId?.trim() || null,
        address: form.address?.trim() || null,
        gender: form.gender,
        caste: form.caste || null,
        apaarId: form.apaarId?.trim() || null,
        rollNumber: form.rollNumber ? parseInt(form.rollNumber) : null,
        familyId: form.familyId?.trim() || null,
        scholarNo: form.scholarNo?.trim() || null,
        fatherOccupation: form.fatherOccupation?.trim() || null,
        fatherSalary: form.fatherSalary || null,
        postalCode: form.postalCode || null,
        bankName: form.bankName?.trim() || null,
        bankAccountNo: form.bankAccountNo?.trim() || null,
        ifscCode: form.ifscCode?.trim() || null,
        branch: form.branch?.trim() || null,
        penNumber: form.penNumber?.trim() || null
      };
      
      fd.append('studentData', JSON.stringify(studentData));

      if (sFiles.photo instanceof File) fd.append('photo', sFiles.photo);
      if (sFiles.marksheet instanceof File) fd.append('marksheet', sFiles.marksheet);
      if (sFiles.aadharImg instanceof File) fd.append('aadharImg', sFiles.aadharImg);
      if (sFiles.samagraImg instanceof File) fd.append('samagraImg', sFiles.samagraImg);
      if (sFiles.passbookImg instanceof File) fd.append('passbookImg', sFiles.passbookImg);
      if (sFiles.tcImg instanceof File) fd.append('tc', sFiles.tcImg);
      if (sFiles.apaarImg instanceof File) fd.append('apaarImg', sFiles.apaarImg);
      if (sFiles.birthCertificate instanceof File) fd.append('birthCertificate', sFiles.birthCertificate);
      if (sFiles.incomeCertificate instanceof File) fd.append('incomeCertificate', sFiles.incomeCertificate);
      if (sFiles.castCertificate instanceof File) fd.append('castCertificate', sFiles.castCertificate);
      if (sFiles.domicileCertificate instanceof File) fd.append('domicileCertificate', sFiles.domicileCertificate);

      await StudentsService.enrollStudent(
        schoolId,
        classId,
        secId,
        currentAcademicYearId,
        fd
      );

      setModal(false);
      setForm(blank);
      setClassId('');
      setSecId('');
      setSFiles({});
      setValidationErrors({});
      onToast?.(t('studentEnrolledSuccess'), 'success');
      onRefresh?.();
      loadStudents();

    } catch (error) {
      console.error('Enrollment error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = '';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        else if (error.response.data.errors) {
          const errors = error.response.data.errors;
          const firstErrorKey = Object.keys(errors)[0];
          if (firstErrorKey) {
            errorMessage = errors[firstErrorKey];
          }
        }
        else if (error.response.data.email) {
          errorMessage = error.response.data.email;
        }
        else {
          errorMessage = error.message || t('unknownError');
        }
      } else {
        errorMessage = error.message || t('unknownError');
      }
      
      if (error.response?.status === 400) {
        if (errorMessage.toLowerCase().includes('email') || 
            errorMessage.toLowerCase().includes('already active') ||
            errorMessage.toLowerCase().includes('already exists')) {
          
          setValidationErrors(prev => ({ 
            ...prev, 
            email: errorMessage
          }));
          
          onToast?.(errorMessage, 'error');
        } else {
          setValidationErrors(prev => ({ 
            ...prev, 
            form: errorMessage 
          }));
          onToast?.(errorMessage, 'error');
        }
      } else if (error.response?.status === 409) {
        setValidationErrors(prev => ({ 
          ...prev, 
          email: errorMessage 
        }));
        onToast?.(errorMessage, 'error');
      } else {
        onToast?.(t('studentEnrollError', { error: errorMessage }), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async () => {
    if (!editModal) return;
    
    const isValid = validateEditForm();
    if (!isValid) {
      onToast?.(t('fixValidationErrors'), 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const fd = new FormData();
      
      const updateData = {
        name: editForm.name,
        phoneNo: editForm.phoneNo || null,
        address: editForm.address || null,
        dob: editForm.dob || null,
        fatherName: editForm.fatherName || null,
        motherName: editForm.motherName || null,
        fatherContactNumber: editForm.fatherContactNumber || null,
        aadharCardNo: editForm.aadharCardNo?.replace(/\s/g, '') || null,
        samagraId: editForm.samagraId || null,
        gender: editForm.gender || null,
        caste: editForm.caste || null,
        apaarId: editForm.apaarId || null,
        rollNumber: editForm.rollNumber ? parseInt(editForm.rollNumber) : null,
        familyId: editForm.familyId?.trim() || null,
        scholarNo: editForm.scholarNo?.trim() || null,
        fatherOccupation: editForm.fatherOccupation?.trim() || null,
        fatherSalary: editForm.fatherSalary || null,
        postalCode: editForm.postalCode || null,
        bankName: editForm.bankName?.trim() || null,
        bankAccountNo: editForm.bankAccountNo?.trim() || null,
        ifscCode: editForm.ifscCode?.trim() || null,
        branch: editForm.branch?.trim() || null,
        penNumber: editForm.penNumber?.trim() || null
      };
      
      fd.append('studentData', JSON.stringify(updateData));
      
      if (editFiles.photo instanceof File) fd.append('photo', editFiles.photo);
      if (editFiles.marksheet instanceof File) fd.append('marksheet', editFiles.marksheet);
      if (editFiles.aadharImg instanceof File) fd.append('aadharImg', editFiles.aadharImg);
      if (editFiles.samagraImg instanceof File) fd.append('samagraImg', editFiles.samagraImg);
      if (editFiles.passbookImg instanceof File) fd.append('passbookImg', editFiles.passbookImg);
      if (editFiles.tcImg instanceof File) fd.append('tc', editFiles.tcImg);
      if (editFiles.apaarImg instanceof File) fd.append('apaarImg', editFiles.apaarImg);
      if (editFiles.birthCertificate instanceof File) fd.append('birthCertificate', editFiles.birthCertificate);
      if (editFiles.incomeCertificate instanceof File) fd.append('incomeCertificate', editFiles.incomeCertificate);
      if (editFiles.castCertificate instanceof File) fd.append('castCertificate', editFiles.castCertificate);
      if (editFiles.domicileCertificate instanceof File) fd.append('domicileCertificate', editFiles.domicileCertificate);
      
      await StudentsService.updateStudent(editModal.id, fd);
      
      onToast?.(t('studentUpdatedSuccess'), 'success');
      setEditModal(null);
      setEditForm({});
      setEditFiles({});
      setValidationErrors({});
      loadStudents();
      
    } catch (error) {
      console.error('❌ Update error:', error);
      
      if (error.response?.status === 404) {
        onToast?.(t('studentNotFound'), 'error');
      } else if (error.response?.status === 400) {
        onToast?.(t('invalidData'), 'error');
      } else {
        onToast?.(t('studentUpdateError', { error: error.message || t('unknownError') }), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const promoteStudent = async () => {
    if (!promoteModal || !pForm.newClassId) {
      onToast?.(t('selectNewClass'), 'error');
      return;
    }
    
    setLoading(true);
    try {
      await StudentsService.promoteStudent(
        promoteModal.enrollmentId,
        pForm.newClassId,
        pForm.newSectionId,
        currentAcademicYearId,
        {
          name: promoteModal.name,
          phoneNo: promoteModal.phoneNo,
          address: promoteModal.address
        }
      );

      setPromoteModal(null);
      onToast?.(t('studentPromotedSuccess', { name: promoteModal.name }), 'success');
      loadStudents();
    } catch (error) {
      console.error('Promotion error:', error);
      onToast?.(t('promotionError', { error: error.message }), 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id, name) => {
    try {
      await StudentsService.deleteStudent(id);
      onToast?.(t('studentInactivatedSuccess'), 'success');
      onRefresh?.();
      loadStudents();
    } catch (error) {
      console.error('Delete error:', error);
      onToast?.(t('studentDeleteError', { error: error.message }), 'error');
    }
  };

  const exportStudents = async () => {
    if (!currentAcademicYearId) {
      onToast?.(t('academicYearRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('📊 Exporting students with params:', {
        schoolId,
        classId: filterClass || null,
        sectionId: filterSec || null,
        academicYearId: currentAcademicYearId
      });

      // ✅ Call StudentsService.exportStudentsExcel
      const response = await StudentsService.exportStudentsExcel(
        schoolId,
        filterClass || null,
        filterSec || null,
        currentAcademicYearId
      );

      console.log('📊 Response received:', response);

      // ✅ Since API.get with blob returns full response, we need to get the data
      // API.js returns response directly (not response.data) for blob
      // The interceptor returns the full response when responseType is 'blob'
      let blob = response?.data || response;

      // If it's an Axios response, get the data
      if (response && typeof response === 'object' && response.data !== undefined) {
        blob = response.data;
      }

      // If it's still not a blob, try to get it from response
      if (!(blob instanceof Blob)) {
        console.warn('⚠️ Response is not a Blob, trying to extract:', blob);
        // If it's an array buffer or other format
        if (blob && typeof blob === 'object') {
          // Try to convert to blob
          try {
            const jsonStr = JSON.stringify(blob);
            blob = new Blob([jsonStr], { type: 'application/octet-stream' });
          } catch {
            throw new Error('Invalid response format from server');
          }
        } else {
          throw new Error('Invalid response format from server');
        }
      }

      if (!blob || blob.size === 0) {
        throw new Error('Generated file is empty');
      }

      console.log('📊 Blob size:', blob.size);
      console.log('📊 Blob type:', blob.type);

      // Create download link
      const urlObj = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObj;
      
      // Generate filename
      let fileName = `Students_Export_${new Date().toISOString().split('T')[0]}`;
      if (filterClass) {
        const classObj = classes.find(c => String(c.id) === String(filterClass));
        if (classObj) fileName += `_${classObj.className}`;
      }
      if (filterSec && filterSec !== '0') {
        const secObj = sections.find(s => String(s.id) === String(filterSec));
        if (secObj) fileName += `_${secObj.sectionName}`;
      }
      fileName += '.xlsx';
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(urlObj);
      }, 100);
      
      onToast?.(t('exportSuccess'), 'success');
      
    } catch (error) {
      console.error('❌ Export error:', error);
      
      // ✅ Better error handling
      let errorMessage = t('exportError');
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          errorMessage = t('unauthorized');
        } else if (error.response.status === 403) {
          errorMessage = t('forbidden');
        } else if (error.response.status === 404) {
          errorMessage = t('exportEndpointNotFound');
        } else if (error.response.status === 500) {
          errorMessage = t('serverError');
        } else if (error.response.data) {
          // Try to get error message from response
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onToast?.(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = filterClass
    ? sections.filter(s => String(s.classId) === String(filterClass))
    : sections;

  const formSections = classId
    ? sections.filter(s => String(s.classId) === String(classId))
    : [];

  const pSections = pForm.newClassId
    ? sections.filter(s => String(s.classId) === String(pForm.newClassId))
    : [];

  const secName = (s) => (s && s.sectionName) ? s.sectionName : 'Section A';

  const filteredStudents = localStudents.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentId?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toString().includes(search) ||
    s.fatherName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openEnrollModal = () => {
    if (classes.length > 0) {
      const firstClassId = classes[0]?.id?.toString() || '';
      setClassId(firstClassId);
      
      const firstClassSections = sections.filter(s => String(s.classId) === String(firstClassId));
      if (firstClassSections.length > 0) {
        setSecId(firstClassSections[0].id.toString());
      } else {
        setSecId('');
      }
    }
    setSFiles({});
    setForm(blank);
    setValidationErrors({});
    setModal(true);
  };

  const closeEnrollModal = () => {
    setModal(false);
    setValidationErrors({});
  };

  const openEditModal = (student) => {
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      phoneNo: student.phoneNo || '',
      dob: student.dob || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      fatherContactNumber: student.fatherContactNumber || '',
      aadharCardNo: student.aadharCardNo || '',
      samagraId: student.samagraId || '',
      address: student.address || '',
      gender: student.gender || '',
      caste: student.caste || '',
      apaarId: student.apaarId || '',
      rollNumber: student.rollNumber?.toString() || '',
      familyId: student.familyId || '',
      scholarNo: student.scholarNo || '',
      fatherOccupation: student.fatherOccupation || '',
      fatherSalary: student.fatherSalary || '',
      postalCode: student.postalCode || '',
      bankName: student.bankName || '',
      bankAccountNo: student.bankAccountNo || '',
      ifscCode: student.ifscCode || '',
      branch: student.branch || '',
      enrollmentId: student.enrollmentId || '',
      penNumber: student.penNumber || '' 
    });
    setEditFiles({});
    setEditModal(student);
    setValidationErrors({});
  };
  
  const closeEditModal = () => {
    setEditModal(null);
    setEditForm({});
    setEditFiles({});
    setValidationErrors({});
  };

  const openViewModal = (student) => {
    setViewStudent(student);
  };

  const closeViewModal = () => {
    setViewStudent(null);
  };

  const openPromoteModal = (student) => {
    setPForm({ newClassId: '', newSectionId: '0' });
    setPromoteModal(student);
  };

  const closePromoteModal = () => {
    setPromoteModal(null);
  };

  const clearFilters = () => {
    setFilterClass('');
    setFilterSec('');
    setFilterGender('');
    setFilterCaste('');
  };

  return {
    search, setSearch,
    filterClass, setFilterClass,
    filterSec, setFilterSec,
    filterGender, setFilterGender,
    filterCaste, setFilterCaste,
    localStudents,
    modal,
    editModal,
    viewStudent,
    promoteModal,
    loading,
    validationErrors,
    
    form,
    editForm,
    classId, setClassId,
    secId, setSecId,
    sFiles,
    editFiles,
    pForm, setPForm,

    filteredStudents,
    totalStudents: localStudents.length,
    filteredCount: filteredStudents.length,

    filteredSections,
    formSections,
    pSections,
    secName,

    handleFormChange,
    handleEditFormChange,
    onFileChange,
    onEditFileChange,
    loadStudents,
    submitStudent,
    updateStudent,
    promoteStudent,
    deleteStudent,
    openEnrollModal,
    closeEnrollModal,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    openPromoteModal,
    closePromoteModal,
    clearFilters,
    handleClassChange,
    getSectionsForClass,
    getFirstSectionForClass,
    validateAllFiles,
    exportStudents // ✅ ADDED
  };
}
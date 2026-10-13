import { useState, useEffect, useCallback } from "react";
import MappingService from "../../../services/MappingService";

export default function PriMappingController({
  schoolId,
  classes,
  sections,
  teachers,
  onToast,
  currentAcademicYearId,
  currentAcademicYearName,
  t
}) {

  const [mappings, setMappings] = useState([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const activeTeachers = teachers.filter(t => t.active === true);
  
  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    teacherId: '',
    academicYearId: currentAcademicYearId || ''
  });

  // Load mappings
  const loadMappings = useCallback(async () => {
    try {
      const data = await MappingService.getMappings(schoolId);
      setMappings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading mappings:', error);
      setMappings([]);
      const errorMsg = extractErrorMessage(error);
      onToast?.(errorMsg, 'error');
    }
  }, [schoolId, onToast, t]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      academicYearId: currentAcademicYearId || ''
    }));
  }, [currentAcademicYearId]);

  const setField = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // 🔥 UNIVERSAL ERROR EXTRACTOR - Works for all error types
  const extractErrorMessage = (error) => {
    // Default message
    let message = t('somethingWentWrong') || 'Something went wrong';
    
    if (!error) return message;
    
    // Case 1: Error has response from server
    if (error.response) {
      const data = error.response.data;
      
      // If data is string
      if (typeof data === 'string') {
        message = data;
      }
      // If data is object
      else if (typeof data === 'object') {
        // Check for message field
        if (data.message) {
          message = data.message;
        }
        // Check for error field
        else if (data.error) {
          message = data.error;
        }
        // Check for details field
        else if (data.details) {
          message = data.details;
        }
        // Check for validation errors (array)
        else if (data.errors && Array.isArray(data.errors)) {
          message = data.errors.join(', ');
        }
        // Check for validation errors (object)
        else if (typeof data === 'object') {
          // Try to get first error from validation object
          const firstKey = Object.keys(data)[0];
          if (firstKey) {
            const firstValue = data[firstKey];
            if (Array.isArray(firstValue)) {
              message = firstValue[0];
            } else if (typeof firstValue === 'string') {
              message = firstValue;
            } else {
              message = JSON.stringify(data);
            }
          } else {
            message = JSON.stringify(data);
          }
        }
      }
      // If status code is 400, add prefix
      if (error.response.status === 400) {
        // Message already extracted, just keep it
      }
    }
    // Case 2: Error has message directly
    else if (error.message) {
      message = error.message;
    }
    // Case 3: Error is a string
    else if (typeof error === 'string') {
      message = error;
    }
    
    return message;
  };

  // 🔥 IMPROVED assignTeacher with universal error handling
  const assignTeacher = async () => {
    if (!form.classId || !form.sectionId || !form.teacherId || !form.academicYearId) {
      onToast?.(t('allFieldsRequired') || 'All fields are required', 'error');
      return;
    }

    setLoading(true);
    try {
      await MappingService.assignTeacher(
        form.classId,
        form.sectionId,
        form.teacherId,
        schoolId,
        form.academicYearId
      );

      setModal(false);
      onToast?.(t('teacherAssignedSuccess') || 'Teacher assigned successfully! ✅', 'success');
      loadMappings();
      
    } catch (error) {
      console.error('Assignment error:', error);
      const errorMessage = extractErrorMessage(error);
      onToast?.('❌ ' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteMapping = async (id, teacherName, className) => {
    try {
      await MappingService.deleteMapping(id);
      onToast?.(t('mappingRemovedSuccess') || 'Mapping removed successfully! ✅', 'success');
      loadMappings();
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = extractErrorMessage(error);
      onToast?.('❌ ' + errorMessage, 'error');
    }
  };

  const openModal = () => {
    setForm({
      classId: '',
      sectionId: '',
      teacherId: '',
      academicYearId: currentAcademicYearId || ''
    });
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
  };

  const secName = (s) => (s && s.sectionName) ? s.sectionName : 'Section A';

  const formSections = form.classId 
    ? sections.filter(s => String(s.classId) === String(form.classId)) 
    : [];

  const selectedTeacher = activeTeachers.find(t => String(t.id) === String(form.teacherId));
  const selectedClass = classes.find(c => String(c.id) === String(form.classId));
  const selectedSection = formSections.find(s => String(s.id) === String(form.sectionId));

  const hasClasses = classes.length > 0;
  const hasTeachers = activeTeachers.length > 0;

  return {
    mappings,
    modal,
    loading,
    form, 
    setForm,
    totalMappings: mappings.length,
    hasClasses,
    hasTeachers,
    loadMappings,
    assignTeacher,
    deleteMapping,
    openModal,
    closeModal,
    setField,
    formSections,
    selectedTeacher,
    selectedClass,
    selectedSection,
    secName,
    getAcademicYearDisplay: (mapping) => {
      if (mapping.academicYear?.yearName) {
        return mapping.academicYear.yearName;
      }
      if (mapping.academicYear?.id === currentAcademicYearId) {
        return currentAcademicYearName;
      }
      return mapping.academicYearId || '—';
    },
    currentAcademicYearName,
    activeTeachers
  };
}
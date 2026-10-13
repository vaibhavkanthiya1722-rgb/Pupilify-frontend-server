// src/components/admin/PriClasses/PriClassesController.js

import { useState } from "react";
import ClassesService from "../../../services/ClassesService";

export default function PriClassesController({
  schoolId,
  classes,
  sections,
  onToast,
  onRefresh,
  t
}) {

  // All useState hooks at the top level
  const [modal, setModal] = useState(false);
  const [sectionModal, setSectionModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to normalize section name (always CAPITAL)
  const normalizeSectionName = (name) => {
    return name.trim().toUpperCase();
  };

  // Check if section exists in a class
  const isSectionExists = (classId, sectionName) => {
    const normalizedNew = normalizeSectionName(sectionName);
    const classSections = sections.filter(s => String(s.classId) === String(classId));
    return classSections.some(s => 
      s.sectionName && s.sectionName.toUpperCase() === normalizedNew
    );
  };

  // Helper function to extract error message from API response
  const getApiErrorMessage = (error, defaultMessage = 'Something went wrong') => {
    console.log('Full error object:', error);
    console.log('Error response:', error.response);
    console.log('Error response data:', error.response?.data);
    
    // Check if error response exists
    if (error.response) {
      // Try to get message from response data
      const responseData = error.response.data;
      
      // If response data is a string
      if (typeof responseData === 'string') {
        return responseData;
      }
      
      // If response data is an object
      if (typeof responseData === 'object') {
        // Check for message in different possible fields
        if (responseData.message) {
          return responseData.message;
        }
        if (responseData.error) {
          return responseData.error;
        }
        if (responseData.msg) {
          return responseData.msg;
        }
        if (responseData.detail) {
          return responseData.detail;
        }
        
        // If no specific field, stringify the whole object
        return JSON.stringify(responseData);
      }
    }
    
    // If error has a message
    if (error.message) {
      return error.message;
    }
    
    return defaultMessage;
  };

  // Create new class
  const handleCreateClass = async () => {
    if (!className.trim()) {
      onToast?.(t('classNameRequired') || 'Class name is required!', 'error');
      return;
    }

    setLoading(true);
    try {
      await ClassesService.createClassWithDefaultSection(schoolId, className);
      setModal(false);
      setClassName('');
      await onRefresh?.();
      onToast?.(t('classCreatedSuccess') || '✅ Class created with Section A!', 'success');
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, 'Failed to create class');
      onToast?.(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete class function - Show API error directly
  const handleDeleteClass = async (classId, className) => {
    setLoading(true);
    
    try {
      await ClassesService.deleteClass(classId);
      onToast?.(t('classDeleteSuccess') || '✅ Class deleted successfully!', 'success');
      await onRefresh?.();
    } catch (error) {
      console.error('Error deleting class:', error);
      
      // Get the actual API error message
      const errorMessage = getApiErrorMessage(error, 'Failed to delete class');
      
      // Show the API error message directly in toast
      onToast?.(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete section function - Show API error directly
  const handleDeleteSection = async (sectionId, sectionName, classId) => {
    setLoading(true);
    try {
      await ClassesService.deleteSection(sectionId);
      onToast?.(t('sectionDeleteSuccess') || '✅ Section deleted successfully!', 'success');
      await onRefresh?.();
    } catch (error) {
      console.error('Error deleting section:', error);
      
      // Get the actual API error message
      const errorMessage = getApiErrorMessage(error, 'Failed to delete section');
      
      // Show the API error message directly in toast
      onToast?.(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add section to existing class
  const handleAddSection = async () => {
    if (!selectedClassId) {
      onToast?.(t('pleaseSelectClass'), 'error');
      return;
    }
    if (!sectionName.trim()) {
      onToast?.(t('sectionNameRequired'), 'error');
      return;
    }

    const normalizedSection = normalizeSectionName(sectionName);
    
    if (isSectionExists(selectedClassId, normalizedSection)) {
      onToast?.(`❌ ${t('sectionAlreadyExists')} ${normalizedSection}!`, 'error');
      return;
    }

    setLoading(true);
    try {
      await ClassesService.addSection(selectedClassId, schoolId, normalizedSection);
      onToast?.(t('sectionAddedSuccess'), 'success');
      setSectionModal(false);
      setSelectedClassId('');
      setSectionName('');
      await onRefresh?.();
    } catch (error) {
      console.error('Error adding section:', error);
      
      // Get the actual API error message
      const errorMessage = getApiErrorMessage(error, 'Failed to add section');
      
      onToast?.(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get selected class name
  const getSelectedClassName = () => {
    const cls = classes.find(c => String(c.id) === String(selectedClassId));
    return cls ? cls.className : '';
  };

  // Get sections for a specific class
  const getClassSections = (classId) => {
    return sections.filter(s => String(s.classId) === String(classId));
  };

  // Toggle class expansion
  const toggleClass = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  // Close modals
  const closeClassModal = () => {
    setModal(false);
    setClassName('');
  };

  const closeSectionModal = () => {
    setSectionModal(false);
    setSelectedClassId('');
    setSectionName('');
  };

  return {
    // State
    modal, setModal,
    sectionModal, setSectionModal,
    selectedClassId, setSelectedClassId,
    expandedClass,
    className, setClassName,
    sectionName, setSectionName,
    loading,

    // Data
    totalClasses: classes.length,
    totalSections: sections.length,

    // Functions
    handleCreateClass,
    handleDeleteClass,
    handleAddSection,
    handleDeleteSection,
    getSelectedClassName,
    getClassSections,
    toggleClass,
    closeClassModal,
    closeSectionModal
  };
}
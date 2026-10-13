import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback, useRef } from "react";
import SubjectsService from "../../../services/SubjectsService";

export default function PriSubjectsController({
  schoolId,
  classes,
  sections,
  onToast,
  academicYearId
}) {
  const { t } = useTranslation(); 
  const [subjects, setSubjects] = useState([]);
  const [groupedByClassSection, setGroupedByClassSection] = useState({});
  const [filterClass, setFilterClass] = useState('');
  const [filterSec, setFilterSec] = useState('');
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('filtered');
  const [expandedGroups, setExpandedGroups] = useState({});

  const [form, setForm] = useState({
    subjectName: '',
    subjectCode: '',
    classId: '',
    sectionId: '',
    academicYearId: academicYearId || '',
    totalTheoryMarks: 80,
    passingTheoryMarks: 27,
    hasPractical: false,
    totalPracticalMarks: 20,
    passingPracticalMarks: 7
  });

  const isMounted = useRef(true);
  const loadingRef = useRef(false);

  // Group subjects by class AND section - FIXED
  const groupByClassAndSection = useCallback((subjectsList) => {
    const grouped = {};

    subjectsList.forEach(subject => {
      // Get class info - try multiple ways
      const className = subject.className || subject.schoolClass?.className || t("unassigned");
      const classId = subject.schoolClassId || subject.schoolClass?.id || 'unknown';
      
      // Get section info - DIRECT ACCESS from API response
      const sectionId = subject.sectionId || subject.section?.id || null;
      const sectionName = subject.sectionName || subject.section?.sectionName || null;
      
      // Create group key based on whether section exists
      // Only treat as "no-section" if sectionId is null, undefined, or 0
      const hasSection = sectionId && sectionId !== 0 && sectionId !== '0' && sectionId !== 'null';
      const groupKey = hasSection ? `${classId}-${sectionId}` : `${classId}-no-section`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          className: className,
          sectionName: hasSection ? sectionName : null,
          sectionId: hasSection ? sectionId : null,
          classId: classId,
          subjects: []
        };
      }

      grouped[groupKey].subjects.push(subject);
    });

    // Sort groups
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const classCompare = grouped[a].className.localeCompare(grouped[b].className);
        if (classCompare !== 0) return classCompare;
        
        const aSection = grouped[a].sectionName || '';
        const bSection = grouped[b].sectionName || '';
        return aSection.localeCompare(bSection);
      })
      .forEach(key => {
        sortedGrouped[key] = grouped[key];
      });

    return sortedGrouped;
  }, [t]);

  // Load ALL subjects
  const loadAllSubjects = useCallback(async () => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);

      const data = await SubjectsService.getAllSubjects(schoolId, academicYearId);

      if (isMounted.current) {
        const subjectsArray = Array.isArray(data) ? data : [];
        setSubjects(subjectsArray);

        const grouped = groupByClassAndSection(subjectsArray);
        setGroupedByClassSection(grouped);

        const expanded = {};
        Object.keys(grouped).forEach(key => {
          expanded[key] = true;
        });
        setExpandedGroups(expanded);
      }

    } catch (error) {
      console.error('Error loading all subjects:', error);
      if (isMounted.current) {
        setSubjects([]);
        setGroupedByClassSection({});
        onToast?.('Error loading subjects', 'error');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [schoolId, academicYearId, onToast, groupByClassAndSection]);

  // Load filtered subjects by class
  const loadFilteredSubjects = useCallback(async () => {
    if (loadingRef.current) return;

    if (!filterClass) {
      setSubjects([]);
      setGroupedByClassSection({});
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      const data = await SubjectsService.getFilteredSubjects(
        schoolId,
        filterClass,
        filterSec,
        academicYearId
      );

      if (isMounted.current) {
        const subjectsArray = Array.isArray(data) ? data : [];
        setSubjects(subjectsArray);

        const grouped = groupByClassAndSection(subjectsArray);
        setGroupedByClassSection(grouped);
      }

    } catch (error) {
      console.error('Error loading filtered subjects:', error);
      if (isMounted.current) {
        setSubjects([]);
        setGroupedByClassSection({});
        onToast?.('Error loading subjects', 'error');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [schoolId, filterClass, filterSec, academicYearId, onToast, groupByClassAndSection]);

  // Load based on view mode
  useEffect(() => {
    if (viewMode === 'all' || viewMode === 'grouped') {
      loadAllSubjects();
    }
  }, [viewMode, loadAllSubjects]);

  // Load filtered when filters change
  useEffect(() => {
    if (viewMode !== 'filtered') return;

    if (!filterClass) {
      setSubjects([]);
      setGroupedByClassSection({});
      return;
    }

    loadFilteredSubjects();
  }, [filterClass, filterSec, viewMode, loadFilteredSubjects]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setField = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCheckbox = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.checked }));

  const handleNumberInput = (k) => (e) => {
    const value = e.target.value;
    
    if (value === '') {
      setForm(p => ({ ...p, [k]: '' }));
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setForm(p => ({ ...p, [k]: numValue }));
    }
  };

  const addSubject = async () => {
    // Subject Name Validation
    if (!form.subjectName.trim()) {
      onToast?.('❌ Subject name is required!', 'error');
      return;
    }

    if (form.subjectName.trim().length < 2) {
      onToast?.('❌ Subject name must be at least 2 characters long!', 'error');
      return;
    }

    // Class Validation
    if (!form.classId) {
      onToast?.('❌ Please select a class!', 'error');
      return;
    }

    // Section Validation - MANDATORY
    if (!form.sectionId || form.sectionId === '') {
      onToast?.('❌ Please select a section! Subject must be assigned to a section.', 'error');
      return;
    }

    // Academic Year Validation
    const yearId = form.academicYearId || academicYearId;
    if (!yearId) {
      onToast?.('❌ Academic year is required!', 'error');
      return;
    }

    // Theory Marks Validation
    if (!form.totalTheoryMarks || form.totalTheoryMarks <= 0) {
      onToast?.('❌ Total theory marks must be greater than 0!', 'error');
      return;
    }

    if (form.totalTheoryMarks > 100) {
      onToast?.('⚠️ Total theory marks cannot exceed 100!', 'error');
      return;
    }

    if (!form.passingTheoryMarks || form.passingTheoryMarks <= 0) {
      onToast?.('❌ Passing theory marks must be greater than 0!', 'error');
      return;
    }

    if (form.passingTheoryMarks > form.totalTheoryMarks) {
      onToast?.('❌ Passing marks cannot exceed total marks!', 'error');
      return;
    }

    // Passing percentage validation
    const passingPercentage = (form.passingTheoryMarks / form.totalTheoryMarks) * 100;
    if (passingPercentage < 33) {
      onToast?.('⚠️ Passing marks should be at least 33% of total marks!', 'warning');
      return;
    }

    // Practical Marks Validation
    if (form.hasPractical) {
      if (!form.totalPracticalMarks || form.totalPracticalMarks <= 0) {
        onToast?.('❌ Total practical marks must be greater than 0!', 'error');
        return;
      }
      
      if (form.totalPracticalMarks > 50) {
        onToast?.('⚠️ Total practical marks cannot exceed 50!', 'error');
        return;
      }
      
      if (!form.passingPracticalMarks || form.passingPracticalMarks <= 0) {
        onToast?.('❌ Passing practical marks must be greater than 0!', 'error');
        return;
      }
      
      if (form.passingPracticalMarks > form.totalPracticalMarks) {
        onToast?.('❌ Passing practical marks cannot exceed total practical marks!', 'error');
        return;
      }

      const practicalPassingPercentage = (form.passingPracticalMarks / form.totalPracticalMarks) * 100;
      if (practicalPassingPercentage < 33) {
        onToast?.('⚠️ Passing practical marks should be at least 33% of total practical marks!', 'warning');
        return;
      }
    }

    setLoading(true);
    try {
      const subjectData = {
        subjectName: form.subjectName.trim(),
        subjectCode: form.subjectCode.trim() || null,
        totalTheoryMarks: parseInt(form.totalTheoryMarks),
        passingTheoryMarks: parseInt(form.passingTheoryMarks),
        hasPractical: form.hasPractical,
        ...(form.hasPractical && {
          totalPracticalMarks: parseInt(form.totalPracticalMarks),
          passingPracticalMarks: parseInt(form.passingPracticalMarks)
        })
      };

      await SubjectsService.createSubject(
        form.classId,
        form.sectionId,
        schoolId,
        yearId,
        subjectData
      );

      setModal(false);

      // Reset form with first class and its first section
      const firstClass = classes[0];
      const firstSection = sections.find(s => s.classId === firstClass?.id);
      
      setForm({
        subjectName: '',
        subjectCode: '',
        classId: firstClass?.id?.toString() || '',
        sectionId: firstSection?.id?.toString() || '',
        academicYearId: academicYearId || 1,
        totalTheoryMarks: 80,
        passingTheoryMarks: 27,
        hasPractical: false,
        totalPracticalMarks: 20,
        passingPracticalMarks: 7
      });

      onToast?.('✅ Subject added successfully!', 'success');

      // Reload based on current view mode
      if (viewMode === 'all' || viewMode === 'grouped') {
        loadAllSubjects();
      } else {
        loadFilteredSubjects();
      }

    } catch (error) {
      console.error('Add subject error:', error);
      
      let errorMessage = 'Failed to add subject';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.toLowerCase().includes('duplicate') || 
          errorMessage.toLowerCase().includes('already exists')) {
        onToast?.('❌ A subject with this name already exists for this class and section!', 'error');
      } else {
        onToast?.('❌ Error: ' + errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id) => {
    try {
      await SubjectsService.deleteSubject(id);
      onToast?.('✅ Subject deleted successfully!', 'success');

      if (viewMode === 'all' || viewMode === 'grouped') {
        loadAllSubjects();
      } else {
        loadFilteredSubjects();
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      onToast?.('❌ Error deleting subject: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const clearFilters = () => {
    setFilterClass('');
    setFilterSec('');
    setSubjects([]);
    setGroupedByClassSection({});
  };

  const closeModal = () => {
    setModal(false);
  };

  const openModal = () => {
    if (classes.length === 0) {
      onToast?.('⚠️ Please add classes first!', 'warning');
      return;
    }

    if (sections.length === 0) {
      onToast?.('⚠️ Please add sections first!', 'warning');
      return;
    }

    const firstClass = classes[0];
    const firstSection = sections.find(s => String(s.classId) === String(firstClass?.id));
    
    if (!firstSection) {
      onToast?.('⚠️ Please add sections for the selected class first!', 'warning');
      return;
    }

    setForm({
      subjectName: '',
      subjectCode: '',
      classId: firstClass?.id?.toString() || '',
      sectionId: firstSection?.id?.toString() || '',
      academicYearId: academicYearId || 1,
      totalTheoryMarks: 80,
      passingTheoryMarks: 27,
      hasPractical: false,
      totalPracticalMarks: 20,
      passingPracticalMarks: 7
    });

    setModal(true);
  };

  // 🔥 FIX: Helper functions - properly filter sections
  const filteredSections = filterClass
    ? sections.filter(s => String(s.classId) === String(filterClass))
    : [];

  // 🔥 FIX: formSections should only show sections for selected class
  const formSections = form.classId
    ? sections.filter(s => String(s.classId) === String(form.classId))
    : [];

  const secName = (s) => (s && s.sectionName) ? s.sectionName : 'Section A';

  const getSectionBadge = (section) => {
    if (!section) return null;

    const colors = {
      'A': '#4299e1',
      'B': '#48bb78',
      'C': '#ed8936',
      'D': '#9f7aea',
      'E': '#f56565',
      'F': '#667eea'
    };

    const sectionLetter = section.sectionName?.replace('Section ', '').replace('section ', '') || 'A';
    const color = colors[sectionLetter] || '#718096';

    return {
      backgroundColor: color + '20',
      color: color,
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    };
  };

  return {
    subjects,
    groupedByClassSection,
    filterClass, setFilterClass,
    filterSec, setFilterSec,
    modal,
    loading,
    viewMode, setViewMode,
    expandedGroups,
    form, setForm,
    totalSubjects: subjects.length,
    totalGroups: Object.keys(groupedByClassSection).length,
    loadAllSubjects,
    loadFilteredSubjects,
    addSubject,
    deleteSubject,
    toggleGroup,
    clearFilters,
    closeModal,
    openModal,
    setField,
    handleCheckbox,
    handleNumberInput,
    filteredSections,
    formSections, // 🔥 Now properly filtered
    secName,
    getSectionBadge
  };
}
import { useState, useEffect, useCallback } from "react";
import ExamScheduleService from "../../../services/ExamScheduleService";
import { getTodayDate } from "../../../utils/dateValidation";

export default function ExamScheduleController({
  schoolId,
  classes,
  sections,
  subjects,
  onToast,
  academicYearId,
  academicYearName,
  user,
  t
}) {

  // State variables
  const [activeTab, setActiveTab] = useState('view');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // View Tab Filters
  const [viewFilterClass, setViewFilterClass] = useState('');
  const [viewFilterSection, setViewFilterSection] = useState('');
  const [viewFilterExamName, setViewFilterExamName] = useState('');
  
  // Bulk Tab Filters (separate from view)
  const [bulkFilterClass, setBulkFilterClass] = useState('');
  const [bulkFilterSection, setBulkFilterSection] = useState('');
  
  const [examNames, setExamNames] = useState([]);
  
  const [form, setForm] = useState({
    examName: '',
    subjectId: '',
    classId: '',
    sectionId: '',
    examDate: '',
    startTime: '',
    endTime: ''
  });

  const [bulkForm, setBulkForm] = useState({
    examName: '',
    sectionId: '',
    subjects: []
  });

  const [bulkSchedules, setBulkSchedules] = useState([]);
  const [bulkPreviewModal, setBulkPreviewModal] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [dateError, setDateError] = useState('');

  const todayDate = getTodayDate();

  // Load exam names
  const loadExamNames = useCallback(async () => {
    try {
      const data = await ExamScheduleService.getExamNames(schoolId, academicYearId);
      setExamNames(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading exam names:', error);
    }
  }, [schoolId, academicYearId]);

  // 🔥 FIX: Load exam timetable with proper section filter
  const loadExams = useCallback(async () => {
    if (!academicYearId || !viewFilterClass) {
      if (onToast && !viewFilterClass) onToast(t('pleaseSelectClassFirst'), 'info');
      return;
    }
    
    setLoading(true);
    try {
      // 🔥 FIX: Pass sectionId properly - if viewFilterSection is empty, pass null or empty string
      const sectionId = viewFilterSection || null;
      const examName = viewFilterExamName || null;
      
      console.log('Loading exams with filters:', {
        schoolId,
        classId: viewFilterClass,
        sectionId: sectionId,
        academicYearId,
        examName: examName
      });
      
      const data = await ExamScheduleService.viewTimetable(
        schoolId,
        viewFilterClass,
        academicYearId,
        sectionId,
        examName
      );
      
      console.log('Exams loaded:', data);
      setExams(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        onToast?.(t('noExamsFoundForFilters'), 'info');
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      onToast?.(t('errorLoadingExamSchedule'), 'error');
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId, viewFilterClass, viewFilterSection, viewFilterExamName, academicYearId, onToast, t]);

  // Date validation
  const validateExamDate = (date) => {
    if (!date) {
      setDateError(t('examDateRequired'));
      return false;
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setDateError(t('examDateCannotBePast'));
      return false;
    }
    
    setDateError('');
    return true;
  };

  // Get subjects by class and section
  const getSubjectsByClassAndSection = useCallback((classId, sectionId) => {
    if (!classId) return [];
    
    return subjects?.filter(s => {
      if (!s) return false;
      
      if (String(s.schoolClassId) !== String(classId)) return false;
      
      if (sectionId && sectionId !== '') {
        if (s.sectionId) {
          return String(s.sectionId) === String(sectionId);
        }
        return true;
      }
      
      return true;
    }) || [];
  }, [subjects]);

  // Update available subjects when bulk class OR section changes
  useEffect(() => {
    if (bulkFilterClass) {
      const classSubjects = getSubjectsByClassAndSection(bulkFilterClass, bulkForm.sectionId);
      setAvailableSubjects(classSubjects);
      
      if (bulkForm.subjects && bulkForm.subjects.length > 0) {
        const validSubjects = bulkForm.subjects.filter(subjectId => 
          classSubjects.some(s => s.id === subjectId)
        );
        if (validSubjects.length !== bulkForm.subjects.length) {
          setBulkForm(prev => ({ ...prev, subjects: validSubjects }));
        }
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [bulkFilterClass, bulkForm.sectionId, bulkForm.subjects, getSubjectsByClassAndSection]);

  // Filter subjects for single form
  const getFormFilteredSubjects = useCallback(() => {
    if (!form.classId) return [];
   
    return subjects?.filter(s => {
      if (!s) return false;
      
      if (String(s.schoolClassId) !== String(form.classId)) return false;
      
      if (form.sectionId && form.sectionId !== '') {
        if (s.sectionId) {
          return String(s.sectionId) === String(form.sectionId);
        }
        return true;
      }
      
      return true;
    }) || [];
  }, [form.classId, form.sectionId, subjects]);

  // PRINT SCHEDULE
  const handlePrint = () => {
    if (exams.length === 0) return;

    const selectedClass = classes?.find(c => String(c.id) === String(viewFilterClass));
    const selectedSection = sections?.find(s => String(s.id) === String(viewFilterSection));
    
    const firstExam = exams[0];
    const schoolData = firstExam?.school || 
                       firstExam?.subject?.school || 
                       firstExam?.schoolClass?.school || 
                       firstExam?.academicYear?.school || 
                       {};
    
    const schoolName = schoolData.schoolName || 'Bright School';
    const schoolAddress = schoolData.address || 'musakhedi nagar';
    const schoolPhone = schoolData.phoneNumber || '7354052221';
    const schoolEmail = schoolData.mailId || 'kajalchouhan37@gmail.com';
    
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exam Schedule - ${selectedClass?.className || ''} ${selectedSection?.sectionName || ''}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; background: white; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3a5f; padding-bottom: 15px; }
          .header h1 { color: #1e3a5f; margin: 0 0 5px 0; font-size: 24px; }
          .school-name { font-size: 28px; font-weight: bold; color: #1e3a5f; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #1e3a5f; color: white; padding: 12px; text-align: left; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">${schoolName}</div>
          <div>📍 ${schoolAddress}</div>
          <div>📞 ${schoolPhone} | ✉️ ${schoolEmail}</div>
          <h1>📅 EXAMINATION SCHEDULE</h1>
          <h2>${selectedClass?.className || 'Class'} ${selectedSection ? `- Section ${selectedSection.sectionName}` : '- All Sections'}</h2>
          <p>${viewFilterExamName ? `Exam: ${viewFilterExamName}` : 'All Exams'} | Academic Year: ${academicYearName || '2025-26'}</p>
        </div>
        <table>
          <thead>
            <tr><th>#</th><th>Exam Name</th><th>Subject</th><th>Date</th><th>Time</th><th>Section</th></tr>
          </thead>
          <tbody>
            ${exams.map((exam, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${exam.examName || '—'}</strong></td>
                <td>${exam.subject?.subjectName || '—'}</td>
                <td>${formatDate(exam.examDate)}</td>
                <td>${formatTime(exam.startTime)} - ${formatTime(exam.endTime)}</td>
                <td>${exam.section ? exam.section.sectionName : 'All Sections'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Generated By: ${user?.name || user?.username || 'Administrator'} | Total Exams: ${exams.length}</p>
          <p>© ${new Date().getFullYear()} School Management System</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  // EXPORT TO EXCEL
  const handleExportExcel = () => {
    if (exams.length === 0) return;

    const selectedClass = classes?.find(c => String(c.id) === String(viewFilterClass));
    
    const headers = ['#', 'Exam Name', 'Subject', 'Date', 'Start Time', 'End Time', 'Section'];
    const rows = exams.map((exam, index) => [
      index + 1,
      exam.examName,
      exam.subject?.subjectName,
      formatDate(exam.examDate),
      formatTime(exam.startTime),
      formatTime(exam.endTime),
      exam.section?.sectionName || 'All Sections'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const filename = `Exam_Schedule_${selectedClass?.className || 'Class'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onToast?.(t('excelDownloadedSuccess'), 'success');
  };

  // Handle form input changes for single form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'classId' || name === 'sectionId') {
      setForm(prev => ({ ...prev, [name]: value, subjectId: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    if (name === 'examDate') {
      validateExamDate(value);
    }
  };

  // Handle bulk form changes
  const handleBulkFormChange = (field) => (e) => {
    const value = e.target.value;
    
    if (field === 'sectionId') {
      setBulkForm(prev => ({ ...prev, [field]: value, subjects: [] }));
    } else {
      setBulkForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle subject toggle in bulk form
  const handleSubjectToggle = (subjectId) => {
    setBulkForm(prev => {
      const currentSubjects = prev.subjects || [];
      const newSubjects = currentSubjects.includes(subjectId)
        ? currentSubjects.filter(id => id !== subjectId)
        : [...currentSubjects, subjectId];
      return { ...prev, subjects: newSubjects };
    });
  };

  // Select all subjects
  const selectAllSubjects = () => {
    const allSubjectIds = availableSubjects.map(s => s.id);
    setBulkForm(prev => ({ ...prev, subjects: allSubjectIds }));
  };

  // Clear all subjects
  const clearAllSubjects = () => {
    setBulkForm(prev => ({ ...prev, subjects: [] }));
  };

  // Generate preview for bulk schedule
  const generateBulkPreview = () => {
    if (!bulkForm.examName) {
      onToast?.(t('examNameRequired'), 'error');
      return;
    }

    const subjectsList = bulkForm.subjects || [];
    if (subjectsList.length === 0) {
      onToast?.(t('pleaseSelectAtLeastOneSubject'), 'error');
      return;
    }

    const selectedSubjectObjects = availableSubjects.filter(s => 
      subjectsList.includes(s.id)
    );

    const previewSchedules = selectedSubjectObjects.map(subject => ({
      examName: bulkForm.examName,
      subject: { id: subject.id },
      examDate: '',
      startTime: '',
      endTime: '',
      sectionId: bulkForm.sectionId
    }));

    setBulkSchedules(previewSchedules);
    setBulkPreviewModal(true);
  };

  // Update bulk schedule item
  const updateBulkScheduleItem = (index, field, value) => {
    setBulkSchedules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Submit bulk schedules
  const submitBulkSchedules = async () => {
    for (let i = 0; i < bulkSchedules.length; i++) {
      const schedule = bulkSchedules[i];
      
      if (!schedule.examDate) {
        onToast?.(t('pleaseSelectExamDateForSubject', { index: i + 1 }), 'error');
        return;
      }
      
      const selectedDate = new Date(schedule.examDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        onToast?.(t('examDateCannotBePastForSubject', { index: i + 1 }), 'error');
        return;
      }
      
      if (!schedule.startTime) {
        onToast?.(t('pleaseSelectStartTimeForSubject', { index: i + 1 }), 'error');
        return;
      }
      
      if (!schedule.endTime) {
        onToast?.(t('pleaseSelectEndTimeForSubject', { index: i + 1 }), 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = bulkSchedules.map(schedule => ({
        examName: schedule.examName,
        examDate: schedule.examDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        subject: { id: schedule.subject.id }
      }));

      const response = await ExamScheduleService.bulkGenerateSchedule(
        schoolId,
        bulkFilterClass,
        academicYearId,
        payload,
        bulkForm.sectionId || null
      );

      setBulkPreviewModal(false);
      setBulkForm({ examName: '', sectionId: '', subjects: [] });
      setBulkSchedules([]);
      onToast?.(response || t('examSchedulesCreatedSuccess'), 'success');
      
      if (viewFilterClass) {
        loadExams();
      }
      
      loadExamNames();

    } catch (error) {
      console.error('Error creating bulk schedules:', error);
      onToast?.(t('errorCreatingExamSchedules', { error: error.message }), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate single exam schedule
  const generateSchedule = async () => {
    if (!form.examName) {
      onToast?.(t('examNameRequired'), 'error');
      return;
    }
    
    if (!form.subjectId) {
      onToast?.(t('pleaseSelectSubject'), 'error');
      return;
    }
    
    if (!form.classId) {
      onToast?.(t('pleaseSelectClass'), 'error');
      return;
    }
    
    if (!form.examDate) {
      onToast?.(t('pleaseSelectExamDate'), 'error');
      return;
    }
    
    if (!validateExamDate(form.examDate)) {
      onToast?.(t('examDateCannotBePast'), 'error');
      return;
    }
    
    if (!form.startTime) {
      onToast?.(t('pleaseSelectStartTime'), 'error');
      return;
    }
    
    if (!form.endTime) {
      onToast?.(t('pleaseSelectEndTime'), 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        examName: form.examName,
        examDate: form.examDate,
        startTime: form.startTime,
        endTime: form.endTime
      };
      
      await ExamScheduleService.generateSchedule(
        schoolId,
        form.classId,
        form.subjectId,
        academicYearId,
        payload,
        form.sectionId || null
      );

      setForm({
        examName: '',
        subjectId: '',
        classId: '',
        sectionId: '',
        examDate: '',
        startTime: '',
        endTime: ''
      });
      setDateError('');
      
      onToast?.(t('examScheduleCreatedSuccess'), 'success');
      
      if (viewFilterClass === form.classId) {
        loadExams();
      }
      
      loadExamNames();
      
    } catch (error) {
      console.error('Error generating schedule:', error);
      onToast?.(t('errorCreatingExamSchedule', { error: error.message }), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete exam schedule
  const deleteSchedule = async (id, examName) => {
    if (!window.confirm(t('deleteScheduleConfirm', { examName }))) return;
    
    try {
      await ExamScheduleService.deleteSchedule(id);
      onToast?.(t('scheduleDeletedSuccess'), 'success');
      loadExams();
      loadExamNames();
      
    } catch (error) {
      console.error('Error deleting schedule:', error);
      onToast?.(t('errorDeletingSchedule', { error: error.message }), 'error');
    }
  };

  // Clear filters - View Tab
  const clearViewFilters = () => {
    setViewFilterClass('');
    setViewFilterSection('');
    setViewFilterExamName('');
    setExams([]);
  };

  // Clear filters - Bulk Tab
  const clearBulkFilters = () => {
    setBulkFilterClass('');
    setBulkFilterSection('');
    setBulkForm(prev => ({ ...prev, sectionId: '', subjects: [] }));
    setAvailableSubjects([]);
  };

  // Effects
  useEffect(() => {
    loadExamNames();
  }, [loadExamNames]);

  // 🔥 FIX: Filter sections based on selected class - View Tab
  const viewFilteredSections = viewFilterClass && sections 
    ? sections.filter(s => String(s.classId) === String(viewFilterClass))
    : [];

  // 🔥 FIX: Filter sections based on selected class - Bulk Tab
  const bulkFilteredSections = bulkFilterClass && sections 
    ? sections.filter(s => String(s.classId) === String(bulkFilterClass))
    : [];

  // Get the actual filtered subjects for single form
  const singleFormSubjects = getFormFilteredSubjects();

  // Helper functions for formatting
  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Return all required values
  return {
    // Tab state
    activeTab, setActiveTab,
    exams,
    loading,
    
    // View Tab Filters
    filterClass: viewFilterClass, 
    setFilterClass: setViewFilterClass,
    filterSection: viewFilterSection, 
    setFilterSection: setViewFilterSection,
    filterExamName: viewFilterExamName, 
    setFilterExamName: setViewFilterExamName,
    
    // Bulk Tab Filters (separate)
    bulkFilterClass, 
    setBulkFilterClass,
    bulkFilterSection,
    setBulkFilterSection,
    
    // Data
    examNames,
    form,
    bulkForm,
    availableSubjects,
    bulkSchedules,
    bulkPreviewModal, setBulkPreviewModal,
    
    // Helper data
    filteredSections: viewFilteredSections,
    bulkFilteredSections: bulkFilteredSections,
    formFilteredSubjects: singleFormSubjects,
    
    // Date validation
    dateError,
    todayDate,
    
    // Functions
    loadExams,
    generateSchedule,
    deleteSchedule,
    handleFormChange,
    handleBulkFormChange,
    handleSubjectToggle,
    selectAllSubjects,
    clearAllSubjects,
    generateBulkPreview,
    updateBulkScheduleItem,
    submitBulkSchedules,
    clearViewFilters,
    clearBulkFilters,
    handlePrint,
    handleExportExcel,
    validateExamDate,
    
    // Helpers
    formatTime,
    formatDate
  };
}
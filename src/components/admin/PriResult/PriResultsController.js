import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ExamScheduleService from "../../../services/ExamScheduleService";
import ExamResultService from "../../../services/ExamResultService";
import StudentsService from "../../../services/StudentsService";

export default function PriResultsController({
  schoolId,
  token,
  classes,
  sections,
  subjects,
  teachers,
  onToast,
  academicYearId,
  academicYearName,
  t
}) {

  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);

  // ========== TAB-SPECIFIC FILTERS ==========
  // Upload Tab Filters
  const [uploadFilterClass, setUploadFilterClass] = useState('');
  const [uploadFilterSection, setUploadFilterSection] = useState('');
  const [uploadFilterExamName, setUploadFilterExamName] = useState('');

  // Class Sheet Tab Filters
  const [classFilterClass, setClassFilterClass] = useState('');
  const [classFilterSection, setClassFilterSection] = useState('');
  const [classFilterExamName, setClassFilterExamName] = useState('');

  // Student Card Tab Filters
  const [studentFilterClass, setStudentFilterClass] = useState('');
  const [studentFilterSection, setStudentFilterSection] = useState('');
  const [studentFilterExamName, setStudentFilterExamName] = useState('');

  // ========== FILTERED SECTIONS FOR EACH TAB ==========
  const uploadFilteredSections = useMemo(() => {
    return uploadFilterClass && sections
      ? sections.filter(s => String(s.classId) === String(uploadFilterClass))
      : [];
  }, [uploadFilterClass, sections]);

  const classFilteredSections = useMemo(() => {
    return classFilterClass && sections
      ? sections.filter(s => String(s.classId) === String(classFilterClass))
      : [];
  }, [classFilterClass, sections]);

  const studentFilteredSections = useMemo(() => {
    return studentFilterClass && sections
      ? sections.filter(s => String(s.classId) === String(studentFilterClass))
      : [];
  }, [studentFilterClass, sections]);

  // ========== UPDATE FILTER FUNCTIONS ==========
  // Upload Tab
  const handleUploadClassChange = (value) => {
    setUploadFilterClass(value);
    setUploadFilterSection('');
  };
  const handleUploadSectionChange = (value) => setUploadFilterSection(value);
  const handleUploadExamChange = (value) => setUploadFilterExamName(value);

  // Class Sheet Tab
  const handleClassClassChange = (value) => {
    setClassFilterClass(value);
    setClassFilterSection('');
  };
  const handleClassSectionChange = (value) => setClassFilterSection(value);
  const handleClassExamChange = (value) => setClassFilterExamName(value);

  // Student Card Tab
  const handleStudentClassChange = (value) => {
    setStudentFilterClass(value);
    setStudentFilterSection('');
  };
  const handleStudentSectionChange = (value) => setStudentFilterSection(value);
  const handleStudentExamChange = (value) => setStudentFilterExamName(value);

  // ========== CLEAR FILTERS ==========
  const clearUploadFilters = () => {
    setUploadFilterClass('');
    setUploadFilterSection('');
    setUploadFilterExamName('');
    setExamSchedules([]);
    schedulesLoaded.current = false;
  };

  const clearClassFilters = () => {
    setClassFilterClass('');
    setClassFilterSection('');
    setClassFilterExamName('');
    setClassResult(null);
  };

  const clearStudentFilters = () => {
    setStudentFilterClass('');
    setStudentFilterSection('');
    setStudentFilterExamName('');
    setStudentSearch('');
    setStudentResult(null);
    setStudentCardModal(false);
  };

  // ========== TAB CHANGE HANDLER ==========
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLoading(false);
    
    if (tab !== 'upload') {
      setUploadModal(false);
    }
    if (tab !== 'student-card') {
      setStudentCardModal(false);
    }
  };

  // Data
  const [examNames, setExamNames] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);

  // Upload Tab
  const [selectedExamSchedule, setSelectedExamSchedule] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [marksForm, setMarksForm] = useState({});
  const [uploadModal, setUploadModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Class Sheet Tab
  const [classResult, setClassResult] = useState(null);

  // Student Card Tab
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResult, setStudentResult] = useState(null);
  const [studentCardModal, setStudentCardModal] = useState(false);

  // Refs
  const examNamesLoaded = useRef(false);
  const schedulesLoaded = useRef(false);

  // Helper function to calculate overall grade
  const calculateOverallGrade = (percentage) => {
    if (percentage >= 90) return 'A1';
    if (percentage >= 80) return 'A2';
    if (percentage >= 70) return 'B1';
    if (percentage >= 60) return 'B2';
    if (percentage >= 50) return 'C1';
    if (percentage >= 40) return 'C2';
    if (percentage >= 33) return 'D';
    return 'F';
  };

  // Function to map student result data from API response
  const mapStudentResultData = (data) => {
    if (!data) return null;
    
    const firstSubjectResult = data.subjectResults?.[0] || {};
    const studentInfo = firstSubjectResult.student || {};
    const schoolInfo = firstSubjectResult.school || studentInfo?.school || {};
    
    let totalObtained = 0;
    let totalMaxMarks = 0;
    let subjectsPassed = 0;
    let subjectsFailed = 0;
    let subjectsAbsent = 0;
    
    const subjectResults = (data.subjectResults || []).map(result => {
      const obtained = result.totalMarksObtained || 0;
      const maxMarks = result.totalMaxMarks || 0;
      totalObtained += obtained;
      totalMaxMarks += maxMarks;
      
      if (result.absent) {
        subjectsAbsent++;
      } else if (result.passed) {
        subjectsPassed++;
      } else {
        subjectsFailed++;
      }
      
      return {
        ...result,
        subject: result.subject || {},
        marksObtainedTheory: result.marksObtainedTheory,
        marksObtainedPractical: result.marksObtainedPractical,
        totalMarksObtained: result.totalMarksObtained,
        totalMaxMarks: result.totalMaxMarks,
        percentage: result.percentage,
        grade: result.grade,
        passed: result.passed,
        absent: result.absent
      };
    });
    
    const overallPercentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
    const overallGrade = calculateOverallGrade(overallPercentage);
    const passed = subjectsFailed === 0 && totalObtained > 0;
    
    return {
      studentName: studentInfo.name || data.studentName || 'N/A',
      rollNumber: studentInfo.rollNumber || data.rollNumber || 'N/A',
      enrollmentId: studentInfo.enrollmentId || data.enrollmentId || 'N/A',
      className: data.className || studentInfo.schoolClass?.className || 'N/A',
      sectionName: data.sectionName || studentInfo.section?.sectionName || 'N/A',
      examName: data.examName || 'N/A',
      academicYear: data.academicYear || studentInfo.academicYear?.currentYear || 'N/A',
      
      student: {
        fatherName: studentInfo.fatherName || 'N/A',
        motherName: studentInfo.motherName || 'N/A',
        dob: studentInfo.dob || null,
        phoneNo: studentInfo.phoneNo || 'N/A',
        email: studentInfo.email || 'N/A',
        address: studentInfo.address || 'N/A',
        rollNumber: studentInfo.rollNumber || data.rollNumber || 'N/A'
      },
      
      school: {
        schoolName: schoolInfo.schoolName || 'School Name',
        address: schoolInfo.address || 'School Address',
        phoneNumber: schoolInfo.phoneNumber || 'Contact Number',
        mailId: schoolInfo.mailId || '',
        schoolLogo: schoolInfo.schoolLogo || null
      },
      
      subjectResults: subjectResults,
      totalObtained: totalObtained,
      totalMaxMarks: totalMaxMarks,
      overallPercentage: overallPercentage,
      overallGrade: overallGrade,
      passed: passed,
      subjectsPassed: subjectsPassed,
      subjectsFailed: subjectsFailed,
      subjectsAbsent: subjectsAbsent
    };
  };

  // ========== VALIDATION FUNCTIONS ==========
  const validateMarks = (value, maxMarks, fieldName) => {
    if (value === '' || value === null || value === undefined) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { isValid: false, message: `${fieldName} must be a valid number` };
    }
    
    if (numValue < 0) {
      return { isValid: false, message: `${fieldName} cannot be negative` };
    }
    
    if (numValue > maxMarks) {
      return { 
        isValid: false, 
        message: `${fieldName} cannot exceed ${maxMarks} marks` 
      };
    }
    
    return { isValid: true, message: '' };
  };

  const validateAllMarks = () => {
    const errors = {};
    let hasErrors = false;
    
    const totalTheoryMarks = selectedExamSchedule?.subject?.totalTheoryMarks || 100;
    const totalPracticalMarks = selectedExamSchedule?.subject?.totalPracticalMarks || 50;
    const hasPractical = selectedExamSchedule?.subject?.hasPractical;
    
    for (const student of studentsList) {
      const form = marksForm[student.id] || {};
      const studentErrors = {};
      
      if (!form.isAbsent) {
        const theoryValidation = validateMarks(
          form.marksObtainedTheory, 
          totalTheoryMarks, 
          'Theory marks'
        );
        
        if (!theoryValidation.isValid) {
          studentErrors.theory = theoryValidation.message;
          hasErrors = true;
        }
        
        if (hasPractical) {
          const practicalValidation = validateMarks(
            form.marksObtainedPractical, 
            totalPracticalMarks, 
            'Practical marks'
          );
          
          if (!practicalValidation.isValid) {
            studentErrors.practical = practicalValidation.message;
            hasErrors = true;
          }
        }
      }
      
      if (Object.keys(studentErrors).length > 0) {
        errors[student.id] = studentErrors;
      }
    }
    
    setValidationErrors(errors);
    return !hasErrors;
  };

  // ========== LOAD EXAM NAMES ==========
  const loadExamNames = useCallback(async (forceRefresh = false) => {
    if (!schoolId || !academicYearId) {
      return;
    }

    if (examNamesLoaded.current && !forceRefresh) {
      return;
    }

    try {
      const response = await ExamScheduleService.getExamNames(schoolId, academicYearId);

      let names = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        names = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        names = response.data;
      } else if (Array.isArray(response)) {
        names = response;
      } else if (response?.data && typeof response.data === 'object') {
        names = Object.values(response.data);
      }

      setExamNames(names);
      examNamesLoaded.current = true;

    } catch (error) {
      console.error('❌ Error loading exam names:', error);
      if (onToast) onToast(t("errorLoadingExamNames"), 'error');
    }
  }, [schoolId, academicYearId, onToast, t]);

  // ========== LOAD EXAM SCHEDULES (Upload Tab) ==========
  const loadExamSchedules = useCallback(async (forceRefresh = false) => {
    if (!schoolId || !academicYearId || !uploadFilterClass) {
      return;
    }

    const cacheKey = `${uploadFilterClass}-${uploadFilterSection}-${uploadFilterExamName}`;
    if (schedulesLoaded.current === cacheKey && !forceRefresh) {
      return;
    }

    setLoading(true);
    try {
      const response = await ExamScheduleService.viewTimetable(
        schoolId,
        uploadFilterClass,
        academicYearId,
        uploadFilterSection || null,
        uploadFilterExamName || null
      );

      let schedules = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        schedules = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        schedules = response.data;
      } else if (Array.isArray(response)) {
        schedules = response;
      }

      setExamSchedules(schedules);
      schedulesLoaded.current = cacheKey;

    } catch (error) {
      console.error('❌ Error loading exam schedules:', error);
      if (onToast) onToast(t("errorLoadingExamSchedules"), 'error');
      setExamSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId, uploadFilterClass, uploadFilterSection, uploadFilterExamName, academicYearId, onToast, t]);

  // ========== LOAD STUDENTS ==========
  const loadStudents = useCallback(async (schedule) => {
    if (!schedule) return [];

    try {
      const classId = schedule.class?.id || uploadFilterClass;
      const sectionId = schedule.section?.id || uploadFilterSection;

      const response = await StudentsService.getStudents(
        schoolId,
        classId,
        sectionId,
        academicYearId
      );

      let studentsArray = [];
      
      if (response?.data && Array.isArray(response.data)) {
        studentsArray = response.data;
      } else if (Array.isArray(response)) {
        studentsArray = response;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        studentsArray = response.data.data;
      }

      const mappedStudents = studentsArray.map(student => ({
        id: student.id,
        rollNumber: student.rollNumber || '-',
        name: student.name || 'Unknown',
        fatherName: student.fatherName || '',
        className: student.schoolClass?.className || '',
        sectionName: student.section?.sectionName || ''
      }));

      return mappedStudents;

    } catch (error) {
      console.error('❌ Error loading students:', error);
      if (onToast) onToast(t("errorLoadingStudents"), 'error');
      return [];
    }
  }, [uploadFilterClass, uploadFilterSection, schoolId, academicYearId, onToast, t]);

  // ========== OPEN UPLOAD MODAL ==========
  const openUploadModal = async (schedule) => {
    setSelectedExamSchedule(schedule);
    setLoading(true);

    try {
      const students = await loadStudents(schedule);
      setStudentsList(students);

      const initialMarks = {};
      students.forEach(student => {
        initialMarks[student.id] = {
          marksObtainedTheory: '',
          marksObtainedPractical: '',
          isAbsent: false
        };
      });

      setMarksForm(initialMarks);
      setValidationErrors({});
      setUploadModal(true);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ========== CLOSE UPLOAD MODAL ==========
  const closeUploadModal = () => {
    setUploadModal(false);
    setSelectedExamSchedule(null);
    setStudentsList([]);
    setMarksForm({});
    setValidationErrors({});
  };

  // ========== HANDLE MARKS CHANGE ==========
  const handleMarksChange = (studentId, field, value) => {
    setValidationErrors(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field === 'marksObtainedTheory' ? 'theory' : 'practical']: ''
      }
    }));
    
    setMarksForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  // ========== HANDLE ABSENT TOGGLE ==========
  const handleAbsentToggle = (studentId) => {
    setMarksForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        isAbsent: !prev[studentId]?.isAbsent,
        marksObtainedTheory: !prev[studentId]?.isAbsent ? '' : prev[studentId]?.marksObtainedTheory,
        marksObtainedPractical: !prev[studentId]?.isAbsent ? '' : prev[studentId]?.marksObtainedPractical
      }
    }));
    
    setValidationErrors(prev => ({
      ...prev,
      [studentId]: {}
    }));
  };

  // ========== UPLOAD MARKS ==========
  const handleUploadMarks = async () => {
    if (!selectedExamSchedule || !selectedExamSchedule.id) {
      if (onToast) onToast(t("noExamScheduleSelected"), 'error');
      return;
    }

    const teacherId = teachers?.[0]?.id || null;

    if (!teacherId) {
      if (onToast) onToast(t("noTeacherSelected"), 'error');
      return;
    }

    if (!validateAllMarks()) {
      if (onToast) onToast(`❌ ${t("pleaseFixValidationErrorsBeforeUploading")}`, 'error');
      return;
    }

    const requests = [];
    const totalTheoryMarks = selectedExamSchedule.subject?.totalTheoryMarks || 100;
    const totalPracticalMarks = selectedExamSchedule.subject?.totalPracticalMarks || 50;
    
    for (const student of studentsList) {
      const form = marksForm[student.id] || {};

      if (!form.isAbsent) {
        const theoryMarks = parseFloat(form.marksObtainedTheory) || 0;
        
        if (theoryMarks < 0 || theoryMarks > totalTheoryMarks) {
          if (onToast) onToast(t("invalidTheoryMarksForStudent", { studentName: student.name, totalMarks: totalTheoryMarks }), 'error');
          return;
        }
        
        if (selectedExamSchedule.subject?.hasPractical) {
          const practicalMarks = parseFloat(form.marksObtainedPractical) || 0;
          if (practicalMarks < 0 || practicalMarks > totalPracticalMarks) {
            if (onToast) onToast(t("invalidPracticalMarksForStudent", { studentName: student.name, totalMarks: totalPracticalMarks }), 'error');
            return;
          }
        }
      }

      requests.push({
        studentId: student.id,
        teacherId: teacherId,
        marksObtainedTheory: form.isAbsent ? 0 : (parseFloat(form.marksObtainedTheory) || 0),
        marksObtainedPractical: form.isAbsent ? 0 : (parseFloat(form.marksObtainedPractical) || 0),
        isAbsent: form.isAbsent || false
      });
    }

    setLoading(true);
    try {
      const response = await ExamResultService.uploadBulkMarks(
        schoolId,
        selectedExamSchedule.id,
        academicYearId,
        requests
      );

      if (response?.data?.success || response?.success) {
        if (onToast) onToast(t("marksUploadedSuccessfully"), 'success');
        closeUploadModal();
        schedulesLoaded.current = false;
        loadExamSchedules(true);
      } else {
        const errorMsg = response?.data?.message || response?.message || 'Failed to upload marks';
        if (onToast) onToast('❌ ' + errorMsg, 'error');
      }

    } catch (error) {
      console.error('❌ Error uploading marks:', error);
      const errorMsg = error.response?.data?.message || error.message || t("failedToUploadMarks");
      if (onToast) onToast(`${t("error")}: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== LOAD CLASS RESULT SHEET ==========
  const loadClassResult = async () => {
    if (!classFilterClass || !classFilterExamName) {
      if (onToast) onToast(t("pleaseSelectClassAndExamName"), 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await ExamResultService.getClassResultSheet(
        schoolId,
        classFilterClass,
        classFilterExamName,
        academicYearId,
        classFilterSection || null
      );

      const result = response?.data?.data || response?.data || response;
      setClassResult(result);

    } catch (error) {
      console.error('❌ Error loading class result:', error);
      if (onToast) onToast(t("errorLoadingClassResultSheet"), 'error');
      setClassResult(null);
    } finally {
      setLoading(false);
    }
  };

  // ========== EXPORT TO EXCEL ==========
  const handleExportExcel = async () => {
    if (!classFilterClass || !classFilterExamName) {
      if (onToast) onToast(t("pleaseSelectClassAndExamName"), 'error');
      return;
    }

    if (!classResult) {
      if (onToast) onToast(t("noDataToExportPleaseLoadResultSheet"), 'error');
      return;
    }

    setLoading(true);
    try {
      const blob = await ExamResultService.exportClassResultExcel(
        schoolId,
        classFilterClass,
        classFilterExamName,
        academicYearId,
        classFilterSection || null
      );

      if (!blob || blob.size === 0) {
        throw new Error('Received empty file from server');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const className = classes?.find(c => String(c.id) === String(classFilterClass))?.className || 'Class';
      const sectionName = classFilterSection ? (sections?.find(s => String(s.id) === String(classFilterSection))?.sectionName || 'Section') : 'All';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      const fileName = `Result_Sheet_${classFilterExamName}_${className}_${sectionName}_${timestamp}.xlsx`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      if (onToast) onToast(t("excelDownloadedSuccessfully"), 'success');

    } catch (error) {
      console.error('❌ Error exporting to Excel:', error);
      let errorMessage = 'Error exporting to Excel';
      if (error.message) {
        errorMessage = error.message;
      }
      if (onToast) onToast(`❌ ${t("errorExportingExcel")}: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== LOAD STUDENT RESULT CARD ==========
  const loadStudentCard = async () => {
    if (!studentSearch.trim()) {
      if (onToast) onToast(t("pleaseEnterRollNumber"), 'error');
      return;
    }

    if (!studentFilterClass) {
      if (onToast) onToast(t("pleaseSelectClass"), 'error');
      return;
    }

    if (!studentFilterExamName) {
      if (onToast) onToast(t("pleaseSelectExamName"), 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await ExamResultService.getResultByRollNumber(
        studentSearch.trim(),
        schoolId,
        studentFilterClass,
        studentFilterSection || null,
        studentFilterExamName,
        academicYearId
      );
      
      const resultData = response.data?.data || response.data;
      
      if (!resultData) {
        if (onToast) onToast(t("noResultFoundForThisRollNumber"), 'error');
        return;
      }
      
      const mappedResult = mapStudentResultData(resultData);
      setStudentResult(mappedResult);
      setStudentCardModal(true);
      
    } catch (error) {
      console.error('❌ Error loading student card:', error);
      
      if (error.response?.status === 400) {
        if (onToast) onToast(t("invalidRequestPleaseCheckRollNumberAndFilters"), 'error');
      } else if (error.response?.status === 404) {
        if (onToast) onToast(t("noResultFoundForThisRollNumber"), 'error');
      } else {
        if (onToast) onToast(t("failedToLoadStudentResult"), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== CLOSE STUDENT CARD MODAL ==========
  const closeStudentCardModal = () => {
    setStudentCardModal(false);
    setStudentResult(null);
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    if (schoolId && academicYearId) {
      loadExamNames();
    }

    return () => {
      examNamesLoaded.current = false;
      schedulesLoaded.current = false;
    };
  }, [schoolId, academicYearId, loadExamNames]);

  // Effect for Upload tab - load schedules when filters change
  useEffect(() => {
    if (activeTab !== 'upload' || !uploadFilterClass) {
      setExamSchedules([]);
      schedulesLoaded.current = false;
      return;
    }

    const timer = setTimeout(() => {
      schedulesLoaded.current = false;
      loadExamSchedules();
    }, 300);

    return () => clearTimeout(timer);
  }, [uploadFilterClass, uploadFilterSection, uploadFilterExamName, loadExamSchedules, activeTab]);

  // Clear data when switching tabs
  useEffect(() => {
    if (activeTab !== 'class-sheet') {
      setClassResult(null);
    }
    if (activeTab !== 'student-card') {
      setStudentResult(null);
      setStudentCardModal(false);
    }
    if (activeTab !== 'upload') {
      setUploadModal(false);
    }
  }, [activeTab]);

  // Helper functions
  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return parseFloat(value).toFixed(2) + '%';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A1': '#22c55e',
      'A2': '#22c55e',
      'B1': '#eab308',
      'B2': '#eab308',
      'C1': '#f97316',
      'C2': '#f97316',
      'D': '#ef4444',
      'F': '#ef4444',
      'A+': '#22c55e',
      'A': '#22c55e',
      'B+': '#eab308',
      'B': '#eab308'
    };
    return colors[grade] || '#64748b';
  };

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

  return {
    // Tab state
    activeTab, 
    setActiveTab: handleTabChange,
    loading,

    // Upload Tab Filters
    uploadFilterClass, setUploadFilterClass: handleUploadClassChange,
    uploadFilterSection, setUploadFilterSection: handleUploadSectionChange,
    uploadFilterExamName, setUploadFilterExamName: handleUploadExamChange,
    uploadFilteredSections,

    // Class Sheet Tab Filters
    classFilterClass, setClassFilterClass: handleClassClassChange,
    classFilterSection, setClassFilterSection: handleClassSectionChange,
    classFilterExamName, setClassFilterExamName: handleClassExamChange,
    classFilteredSections,

    // Student Card Tab Filters
    studentFilterClass, setStudentFilterClass: handleStudentClassChange,
    studentFilterSection, setStudentFilterSection: handleStudentSectionChange,
    studentFilterExamName, setStudentFilterExamName: handleStudentExamChange,
    studentFilteredSections,

    // Shared data
    examNames,

    // Upload Tab
    examSchedules,
    selectedExamSchedule,
    studentsList,
    marksForm,
    uploadModal,
    validationErrors,

    // Class Sheet Tab
    classResult,

    // Student Card Tab
    studentSearch, setStudentSearch,
    studentResult,
    studentCardModal,

    // Functions
    loadClassResult,
    handleExportExcel,
    loadStudentCard,
    openUploadModal,
    closeUploadModal,
    handleMarksChange,
    handleAbsentToggle,
    handleUploadMarks,
    closeStudentCardModal,
    clearUploadFilters,
    clearClassFilters,
    clearStudentFilters,

    // Helpers
    formatPercentage,
    getGradeColor,
    formatDate,
    formatTime
  };
}
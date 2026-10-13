import { useState } from "react";
import AttendanceService from "../../../services/AttendanceService";

export default function PriAttendanceController({
  schoolId,
  classes,
  sections,
  onToast,
  academicYearId,
  academicYearName,
  t  // Translation function added
}) {

  const today = new Date().toISOString().split('T')[0];
  
  // View Tab State
  const [classId, setClassId] = useState(classes[0]?.id?.toString() || '');
  const [secId, setSecId] = useState('');
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editRoll, setEditRoll] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Student Tab State
  const [studentRoll, setStudentRoll] = useState('');
  const [history, setHistory] = useState([]);
  const [percentage, setPercentage] = useState(null);

  // Export Tab State
  const [expClassId, setExpClassId] = useState(classes[0]?.id?.toString() || '');
  const [expSecId, setExpSecId] = useState('');
  const [previewRecords, setPreviewRecords] = useState([]);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [purgeModal, setPurgeModal] = useState(false);
  const [purgeConfirmVal, setPurgeConfirmVal] = useState('');
  const [exportStatus, setExportStatus] = useState(null);

  const PURGE_KEYWORD = 'PURGE';

  // ========== VIEW ATTENDANCE ==========
  const viewAttendance = async () => {
    if (!classId || !date) {
      onToast?.(t('pleaseSelectClassAndDate'), 'error');
      return;
    }

    try {
      const data = await AttendanceService.viewAttendance(schoolId, classId, date, secId);
      setRecords(Array.isArray(data) ? data : []);
      setLoaded(true);
    } catch (error) {
      console.error('Error loading attendance:', error);
      onToast?.(t('errorLoadingAttendance', { error: error.message }), 'error');
      setRecords([]);
      setLoaded(true);
    }
  };

  const updateStatus = async (rollNo, newStatus) => {
    setUpdating(true);
    try {
      const record = records.find(r => r.rollNumber === rollNo);
      if (!record?.id) {
        onToast?.(t('recordIdNotFound'), 'error');
        return;
      }

      await AttendanceService.updateAttendance(record.id, newStatus);

      const updatedRecords = records.map(r =>
        r.rollNumber === rollNo ? { ...r, status: newStatus } : r
      );
      setRecords(updatedRecords);
      setEditRoll(null);
      onToast?.(t('statusUpdatedSuccess'), 'success');

    } catch (error) {
      console.error('Update failed:', error);
      onToast?.(t('updateFailed'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const downloadExcel = async () => {
    if (!classId) {
      onToast?.(t('pleaseSelectClass'), 'error');
      return;
    }

    try {
      setUpdating(true);
      
      const blob = await AttendanceService.downloadExcel(schoolId, classId, secId);
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Attendance_Class_${classId}_${date || 'report'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(downloadUrl);
      
      onToast?.(t('excelDownloadedSuccess'), 'success');
    } catch (error) {
      console.error('Download failed:', error);
      onToast?.(t('excelDownloadFailed'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  // ========== STUDENT HISTORY ==========
  const filterStudentRecords = () => {
    if (!studentRoll) {
      onToast?.(t('enterRollNumber'), 'error');
      return;
    }

    const filtered = records.filter(r => r.rollNumber === studentRoll);
    setHistory(filtered);

    if (filtered.length > 0) {
      const present = filtered.filter(r => r.status === 'Present').length;
      const perc = (present / filtered.length) * 100;
      setPercentage(perc);
    } else {
      setPercentage(null);
    }
  };

  const getStudentAttendance = async () => {
    if (!studentRoll) {
      onToast?.(t('enterRollNumber'), 'error');
      return;
    }

    setHistory([]);
    setPercentage(null);

    try {
      if (records.length > 0) {
        const studentRecords = records.filter(r => r.rollNumber === studentRoll);
        if (studentRecords.length > 0) {
          const studentId = studentRecords[0]?.student?.id;
          if (studentId) {
            const percentData = await AttendanceService.getStudentPercentage(studentId);
            setPercentage(percentData);
            onToast?.(t('percentageLoadedSuccess'), 'success');
          }
        } else {
          onToast?.(t('noRecordsForRollNumber'), 'warning');
        }
      } else {
        onToast?.(t('loadClassAttendanceFirst'), 'info');
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      onToast?.(t('errorLoadingStudentData'), 'error');
    }
  };

  // ========== EXPORT & ARCHIVE ==========
  const generatePreview = async () => {
    if (!expClassId || !academicYearId) {
      onToast?.(t('pleaseSelectClassAndYear'), 'error');
      return;
    }

    setPreviewLoading(true);
    setPreviewLoaded(false);
    setPreviewRecords([]);
    setExportStatus(null);

    try {
      const data = await AttendanceService.previewAttendance(
        schoolId,
        expClassId,
        academicYearId,
        expSecId
      );
      setPreviewRecords(Array.isArray(data) ? data : []);
      setPreviewLoaded(true);

      if (data.length === 0) {
        onToast?.(t('noAttendanceRecordsFound'), 'info');
      }
    } catch (e) {
      console.error('Preview error:', e);
      setPreviewRecords([]);
      setPreviewLoaded(true);
      onToast?.(t('previewError', { error: e.message }), 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const openPurgeConfirm = () => {
    if (!previewLoaded) {
      onToast?.(t('generatePreviewFirst'), 'error');
      return;
    }
    if (previewRecords.length === 0) {
      onToast?.(t('noDataToExport'), 'error');
      return;
    }

    setPurgeConfirmVal('');
    setExportStatus(null);
    setPurgeModal(true);
  };

  const handleExportAndPurge = async () => {
    if (purgeConfirmVal !== PURGE_KEYWORD) {
      onToast?.(t('typePurgeToConfirm', { keyword: PURGE_KEYWORD }), 'error');
      return;
    }

    setExportStatus('downloading');

    try {
      const blob = await AttendanceService.exportAndPurge(
        schoolId,
        expClassId,
        academicYearId,
        expSecId
      );

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Attendance_Class_${expClassId}_Year_${academicYearId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setExportStatus('done');
      setPreviewRecords([]);
      setPreviewLoaded(false);
      onToast?.(t('exportAndPurgeSuccess'), 'success');

    } catch (e) {
      console.error('Export error:', e);
      setExportStatus(null);
      onToast?.(t('exportAndPurgeError', { error: e.message }), 'error');
    }
  };

  const clearFilters = () => {
    setClassId(classes[0]?.id?.toString() || '');
    setSecId('');
    setLoaded(false);
    setRecords([]);
  };

  const closePurgeModal = () => {
    if (exportStatus !== 'downloading') {
      setPurgeModal(false);
      setExportStatus(null);
    }
  };

  // Calculate statistics
  const totalPresent = previewRecords.filter(r => r.status === 'Present').length;
  const totalAbsent = previewRecords.filter(r => r.status === 'Absent').length;
  const totalLeave = previewRecords.filter(r => r.status === 'Leave').length;
  const uniqueStudents = [...new Set(previewRecords.map(r => r.rollNumber))].length;
  const uniqueDates = [...new Set(previewRecords.map(r => r.attendanceDate))].length;

  // Filter sections for main view
  const filteredSections = classId
    ? sections.filter(s => String(s.classId) === String(classId))
    : [];

  // Filter sections for export view
  const expFilteredSections = expClassId
    ? sections.filter(s => String(s.classId) === String(expClassId))
    : [];

  const expClassName = classes.find(c => String(c.id) === String(expClassId))?.className || '—';
  const expSecName = expSecId
    ? sections.find(s => String(s.id) === String(expSecId))?.sectionName || 'Section A'
    : 'All Sections';

  return {

    // State
    classId, setClassId,
    secId, setSecId,
    date, setDate,
    records,
    loaded,
    editRoll, setEditRoll,
    updating,

    studentRoll, setStudentRoll,
    history,
    percentage,

    expClassId, setExpClassId,
    expSecId, setExpSecId,
    previewRecords,
    previewLoaded,
    previewLoading,
    purgeModal,
    purgeConfirmVal, setPurgeConfirmVal,
    exportStatus,

    filteredSections,
    expFilteredSections,
    expClassName,
    expSecName,

    // Statistics
    totalPresent,
    totalAbsent,
    totalLeave,
    uniqueStudents,
    uniqueDates,

    // Functions
    viewAttendance,
    updateStatus,
    downloadExcel,
    filterStudentRecords,
    getStudentAttendance,
    generatePreview,
    openPurgeConfirm,
    handleExportAndPurge,
    clearFilters,
    closePurgeModal,

    // Constants
    PURGE_KEYWORD

  };
}
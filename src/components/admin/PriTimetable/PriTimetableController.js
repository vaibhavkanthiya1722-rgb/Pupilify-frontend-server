import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import TimetableService from "../../../services/TimetableService";

export default function PriTimetableController({
  schoolId,
  classes,
  sections,
  teachers,
  subjects,
  onToast,
  currentAcademicYearId,
  currentAcademicYearName,
  t  
}) {

  const DAYS = useMemo(() => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], []);
  
  // ============= TIMETABLE CONFIGURATION =============
  const [numberOfPeriods, setNumberOfPeriods] = useState(() => {
    const saved = localStorage.getItem('timetable_periods_count');
    return saved ? parseInt(saved) : 6;
  });

  const [schoolStartTime, setSchoolStartTime] = useState(() => {
    const saved = localStorage.getItem('timetable_start_time');
    return saved || '09:00';
  });

  const [periodDuration, setPeriodDuration] = useState(() => {
    const saved = localStorage.getItem('timetable_period_duration');
    return saved ? parseInt(saved) : 45;
  });

  // 🔥 FIX: Allow break duration to be 0
  const [breakDuration, setBreakDuration] = useState(() => {
    const saved = localStorage.getItem('timetable_break_duration');
    return saved ? parseInt(saved) : 5;
  });

  const [lunchBreak, setLunchBreak] = useState(() => {
    const saved = localStorage.getItem('timetable_lunch_break');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      enabled: true,
      startTime: '13:00',
      endTime: '14:00',
      duration: 60
    };
  });

  // ============= GENERATE TIME SLOTS WITH LUNCH BREAK =============
  const generateTimeSlots = useCallback((startTime, numPeriods, periodLen, breakLen, lunch) => {
    const slots = [];
    const [hours, minutes] = startTime.split(':').map(Number);
    let currentMinutes = hours * 60 + minutes;
    let lunchApplied = false;
    
    for (let i = 0; i < numPeriods; i++) {
      // Check if we need to apply lunch break before this period
      if (lunch.enabled && !lunchApplied) {
        const lunchStartMinutes = lunch.startTime.split(':').map(Number);
        const lunchStartTotal = lunchStartMinutes[0] * 60 + lunchStartMinutes[1];
        
        if (currentMinutes >= lunchStartTotal) {
          currentMinutes += lunch.duration;
          lunchApplied = true;
          
          if (currentMinutes >= 24 * 60) {
            currentMinutes = currentMinutes - (24 * 60);
          }
        }
      }
      
      const startHour = Math.floor(currentMinutes / 60);
      const startMin = currentMinutes % 60;
      const endMinutes = currentMinutes + periodLen;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      
      slots.push({
        period: i + 1,
        startTime: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
        endTime: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
        isAfterLunch: lunchApplied
      });
      
      // Add break after this period (except last period)
      if (i < numPeriods - 1) {
        if (breakLen > 0) {
          let nextTime = currentMinutes + periodLen + breakLen;
          
          if (lunch.enabled && !lunchApplied) {
            const lunchStartMinutes = lunch.startTime.split(':').map(Number);
            const lunchStartTotal = lunchStartMinutes[0] * 60 + lunchStartMinutes[1];
            
            if (currentMinutes + periodLen <= lunchStartTotal && nextTime > lunchStartTotal) {
              // Don't add break, lunch break will handle it
            } else {
              currentMinutes = nextTime;
            }
          } else {
            currentMinutes = nextTime;
          }
        } else {
          // 🔥 FIX: If break is 0, just add period duration
          currentMinutes = currentMinutes + periodLen;
        }
      }
    }
    return slots;
  }, []);

  const currentTimeSlots = useMemo(() => 
    generateTimeSlots(
      schoolStartTime, 
      numberOfPeriods, 
      periodDuration, 
      breakDuration, 
      lunchBreak
    ),
    [schoolStartTime, numberOfPeriods, periodDuration, breakDuration, lunchBreak, generateTimeSlots]
  );

  const DEFAULT_TIME_SLOTS = useMemo(() => [
    { period: 1, startTime: '09:00', endTime: '09:45' },
    { period: 2, startTime: '09:50', endTime: '10:35' },
    { period: 3, startTime: '10:40', endTime: '11:25' },
    { period: 4, startTime: '11:30', endTime: '12:15' },
    { period: 5, startTime: '12:20', endTime: '13:05' },
    { period: 6, startTime: '13:10', endTime: '13:55' },
    { period: 7, startTime: '14:00', endTime: '14:45' },
    { period: 8, startTime: '14:50', endTime: '15:35' },
  ], []);

  const activeTeachers = (teachers || []).filter(t => t && t.active === true);
  
  const [selClass, setSelClass] = useState('');
  const [selSec, setSelSec] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [bulkInsertModal, setBulkInsertModal] = useState(false);
  const [bulkInsertLoading, setBulkInsertLoading] = useState(false);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    slotId: null,
    message: '',
    title: 'Confirm Delete'
  });
  
  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '09:45',
    subjectId: '',
    teacherId: '',
    periodNumber: 1
  });

  const [bulkForm, setBulkForm] = useState({
    classId: '',
    sectionId: '',
    selectedDays: [...DAYS],
    selectedPeriods: [1, 2, 3, 4, 5, 6],
    subjectId: '',
    teacherId: '',
    autoGenerateTimes: true
  });

  const initialLoadDoneRef = useRef(false);
  const prevSelClassRef = useRef(selClass);
  const prevSelSecRef = useRef(selSec);
  const prevAcademicYearRef = useRef(currentAcademicYearId);

  // ============= CLOSE CONFIRM DIALOG FUNCTION =============
  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog({
      open: false,
      slotId: null,
      message: '',
      title: t('confirmDelete')
    });
  }, [t]);

  // ============= VALIDATION HELPER =============
  const validateSection = useCallback((classId, sectionId) => {
    if (!classId) {
      if (onToast) onToast(t('pleaseSelectClassFirst'), 'error');
      return false;
    }
    if (!sectionId || sectionId === '' || sectionId === '0') {
      if (onToast) onToast(t('pleaseSelectSection'), 'error');
      return false;
    }
    if (!currentAcademicYearId) {
      if (onToast) onToast(t('academicYearNotConfigured'), 'error');
      return false;
    }
    return true;
  }, [currentAcademicYearId, onToast, t]);

  // ============= EXTRACT ERROR MESSAGE HELPER =============
  const extractErrorMessage = useCallback((error, defaultMsg = 'Operation failed') => {
    console.error('Error details:', error);
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (typeof data === 'string') {
        return data;
      }
      if (data && data.message) {
        return data.message;
      }
      if (data && data.error) {
        return data.error;
      }
      if (data && data.msg) {
        return data.msg;
      }
      
      switch (status) {
        case 400:
          return t('teacherAlreadyAssigned');
        case 409:
          return t('teacherConflict');
        case 403:
          return t('noPermission');
        case 404:
          return t('resourceNotFound');
        case 500:
          return t('serverError');
        default:
          return `${t('errorOccurred')} ${status}: ${defaultMsg}`;
      }
    }
    
    if (error.message) {
      return error.message;
    }
    
    return defaultMsg;
  }, [t]);

  // ============= LOAD TIMETABLE =============
  const loadTimetable = useCallback(async (classId, sectionId) => {
    const classToUse = classId || selClass;
    const sectionToUse = sectionId || selSec;
    
    const finalSectionId = typeof sectionToUse === 'object' 
      ? (sectionToUse?.id?.toString() || sectionToUse?.toString() || '') 
      : String(sectionToUse || '');
    
    const finalClassId = typeof classToUse === 'object'
      ? (classToUse?.id?.toString() || classToUse?.toString() || '')
      : String(classToUse || '');
    
    if (!validateSection(finalClassId, finalSectionId)) return;

    setLoading(true);
    try {
      const response = await TimetableService.viewTimetable(
        schoolId,
        finalClassId,
        finalSectionId,
        currentAcademicYearId
      );
      
      const data = response?.data || response;
      setSlots(Array.isArray(data) ? data : []);
      setLoaded(true);
      
    } catch (error) {
      console.error('Error loading timetable:', error);
      setSlots([]);
      setLoaded(true);
      const errorMsg = extractErrorMessage(error, t('errorLoadingTimetable'));
      if (onToast) onToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [schoolId, selClass, selSec, currentAcademicYearId, validateSection, extractErrorMessage, onToast, t]);

  // ============= AUTO LOAD EFFECTS =============
  useEffect(() => {
    if (!selClass || !currentAcademicYearId) {
      return;
    }

    const classChanged = prevSelClassRef.current !== selClass;
    const sectionChanged = prevSelSecRef.current !== selSec;
    const academicYearChanged = prevAcademicYearRef.current !== currentAcademicYearId;
    
    prevSelClassRef.current = selClass;
    prevSelSecRef.current = selSec;
    prevAcademicYearRef.current = currentAcademicYearId;

    if ((!initialLoadDoneRef.current || classChanged || sectionChanged || academicYearChanged) && 
        selSec && selSec !== '' && selSec !== '0') {
      initialLoadDoneRef.current = true;
      loadTimetable(selClass, selSec);
    }
  }, [selClass, selSec, currentAcademicYearId, loadTimetable]);

  useEffect(() => {
    if (!selClass) {
      setSelSec('');
    }
  }, [selClass]);

  useEffect(() => {
    setBulkForm(prev => {
      const prevPeriods = prev && prev.selectedPeriods ? prev.selectedPeriods : [];
      const newSelectedPeriods = prevPeriods.filter(p => p <= numberOfPeriods);
      return {
        ...prev,
        selectedPeriods: newSelectedPeriods.length > 0 ? newSelectedPeriods : [1]
      };
    });
  }, [numberOfPeriods]);

  // ============= FILTERS =============
  const getClassSubjects = useCallback((classId, sectionId) => {
    return (subjects || []).filter(s => {
      if (!s) return false;
      if (!classId) return false;
      if (String(s.schoolClassId) !== String(classId)) return false;
      if (sectionId && sectionId !== '0') {
        if (s.sectionId) {
          return String(s.sectionId) === String(sectionId);
        }
        return true;
      }
      return true;
    });
  }, [subjects]);

  const getClassSections = useCallback((classId) => {
    return classId ? ((sections || []).filter(s => s && String(s.classId) === String(classId))) : [];
  }, [sections]);

  const classSubjects = getClassSubjects(selClass, selSec);
  const classSections = getClassSections(selClass);
  
  const modalSubjects = getClassSubjects(form.classId, form.sectionId);
  const modalSections = getClassSections(form.classId);
  
  const selectedClass = (classes || []).find(c => c && String(c.id) === String(selClass));
  const selectedSection = (sections || []).find(s => s && String(s.id) === String(selSec));
  
  const sectionLabel = !selSec ? '' : (selectedSection && selectedSection.sectionName ? selectedSection.sectionName : 'Section A');
  
  const slotsByDay = {};
  DAYS.forEach(day => {
    slotsByDay[day] = (slots || []).filter(s => s && s.dayOfWeek === day).sort((a, b) => {
      const aTime = a && a.startTime ? a.startTime : '';
      const bTime = b && b.startTime ? b.startTime : '';
      return aTime.localeCompare(bTime);
    });
  });

  const hasClasses = classes && classes.length > 0;
  const hasTeachers = activeTeachers && activeTeachers.length > 0;
  const hasSubjects = classSubjects && classSubjects.length > 0;
  const hasAcademicYear = !!currentAcademicYearId;

  // ============= BULK FORM HANDLERS =============
  const handleDayCheckboxChange = (day) => {
    setBulkForm(prev => {
      const currentDays = prev.selectedDays || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      return { ...prev, selectedDays: newDays };
    });
  };

  const handlePeriodCheckboxChange = (period) => {
    setBulkForm(prev => {
      const currentPeriods = prev.selectedPeriods || [];
      const newPeriods = currentPeriods.includes(period)
        ? currentPeriods.filter(p => p !== period)
        : [...currentPeriods, period];
      return { ...prev, selectedPeriods: newPeriods };
    });
  };

  // ============= UPDATE CONFIGURATION FUNCTIONS =============
  const updatePeriodDuration = (duration) => {
    const newDuration = Math.min(Math.max(parseInt(duration) || 30, 20), 90);
    setPeriodDuration(newDuration);
    localStorage.setItem('timetable_period_duration', newDuration);
    if (onToast) onToast(t('periodDurationSet', { duration: newDuration }), 'success');
  };

  // 🔥 FIX: Allow break duration to be 0
  const updateBreakDuration = (duration) => {
    const newDuration = Math.min(Math.max(parseInt(duration) || 0, 0), 30);
    setBreakDuration(newDuration);
    localStorage.setItem('timetable_break_duration', newDuration);
    if (onToast) onToast(t('breakDurationSet', { duration: newDuration }), 'success');
  };

  const updateLunchBreak = (enabled, startTime, endTime) => {
    const newLunch = {
      enabled: enabled,
      startTime: startTime || lunchBreak.startTime,
      endTime: endTime || lunchBreak.endTime,
      duration: calculateDuration(startTime || lunchBreak.startTime, endTime || lunchBreak.endTime)
    };
    setLunchBreak(newLunch);
    localStorage.setItem('timetable_lunch_break', JSON.stringify(newLunch));
    if (onToast) onToast(t('lunchBreakUpdated'), 'success');
  };

  const calculateDuration = (start, end) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  // ============= BULK INSERT =============
  const bulkInsertTimeSlots = useCallback(async () => {
    const classId = bulkForm.classId || selClass;
    const sectionId = bulkForm.sectionId || selSec;
    
    if (!validateSection(classId, sectionId)) return;
    
    if (!bulkForm || !bulkForm.subjectId) {
      if (onToast) onToast(t('pleaseSelectSubject'), 'error');
      return;
    }
    if (!bulkForm || !bulkForm.teacherId) {
      if (onToast) onToast(t('pleaseSelectTeacher'), 'error');
      return;
    }
    if (!activeTeachers || !activeTeachers.length) {
      if (onToast) onToast(t('noActiveTeachersFound'), 'error');
      return;
    }

    setBulkInsertLoading(true);
    let successCount = 0;
    let errorCount = 0;
    let conflictErrors = [];

    try {
      const parsedSecId = parseInt(sectionId);
      const selectedDays = bulkForm.selectedDays || [];
      const selectedPeriods = bulkForm.selectedPeriods || [];
      
      const existingResponse = await TimetableService.viewTimetable(
        schoolId,
        classId,
        sectionId,
        currentAcademicYearId
      );
      const existingSlots = existingResponse?.data || existingResponse || [];
      
      for (const day of selectedDays) {
        for (const periodNum of selectedPeriods) {
          const timeSlot = currentTimeSlots[periodNum - 1];
          
          if (!timeSlot) continue;
          
          const existingSlot = existingSlots.find(s => 
            s && s.dayOfWeek === day && 
            s.startTime === timeSlot.startTime &&
            s.endTime === timeSlot.endTime
          );
          
          if (existingSlot) continue;
          
          const payload = {
            dayOfWeek: day,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            academicYear: { id: parseInt(currentAcademicYearId) },
            subject: { id: parseInt(bulkForm.subjectId) },
            teacher: { id: parseInt(bulkForm.teacherId) },
            school: { id: parseInt(schoolId) },
            schoolClass: { id: parseInt(classId) },
            section: { id: parsedSecId }
          };

          try {
            await TimetableService.assignSlot(schoolId, classId, sectionId, payload);
            successCount++;
          } catch (error) {
            errorCount++;
            const errorMsg = extractErrorMessage(error, '');
            if (errorMsg.includes('Teacher already assigned') || errorMsg.includes('already assigned')) {
              conflictErrors.push(`${day} ${t('period')} ${periodNum}: ${errorMsg}`);
            }
          }
        }
      }
      
      setBulkInsertModal(false);
      
      if (conflictErrors.length > 0) {
        const conflictMsg = conflictErrors.slice(0, 3).join('\n');
        if (onToast) onToast(`⚠️ ${successCount} ${t('added')}, ${errorCount} ${t('failed')}.\n${conflictMsg}`, 'warning');
      } else if (successCount > 0 && errorCount > 0) {
        if (onToast) onToast(`✅ ${successCount} ${t('periodsAdded')}! ⚠️ ${errorCount} ${t('failed')}`, 'warning');
      } else if (successCount > 0) {
        if (onToast) onToast(`✅ ${successCount} ${t('periodsAddedSuccess')}!`, 'success');
      } else if (errorCount > 0 && conflictErrors.length > 0) {
        if (onToast) onToast(`❌ ${t('teacherAlreadyAssignedTime')}`, 'error');
      } else {
        if (onToast) onToast(`❌ ${t('failedToAddPeriods')}`, 'error');
      }
      
      loadTimetable(classId, sectionId);
      
      setBulkForm({
        classId: '',
        sectionId: '',
        selectedDays: [...DAYS],
        selectedPeriods: [1, 2, 3, 4, 5, 6],
        subjectId: '',
        teacherId: '',
        autoGenerateTimes: true
      });
      
    } catch (error) {
      console.error('Error in bulk insert:', error);
      const errorMsg = extractErrorMessage(error, t('failedToAddPeriods'));
      if (onToast) onToast(`❌ ${errorMsg}`, 'error');
    } finally {
      setBulkInsertLoading(false);
    }
  }, [bulkForm, selClass, selSec, validateSection, activeTeachers, currentAcademicYearId, schoolId, currentTimeSlots, extractErrorMessage, onToast, loadTimetable, t, DAYS]);

  // ============= ONE TIME INSERT FOR ALL CLASSES =============
  const oneTimeInsertForAllClasses = useCallback(async () => {
    const classId = bulkForm.classId || selClass;
    const sectionId = bulkForm.sectionId || selSec;
    
    if (!validateSection(classId, sectionId)) return;
    
    if (!currentAcademicYearId) {
      if (onToast) onToast(t('academicYearNotConfigured'), 'error');
      return;
    }
    if (!activeTeachers || !activeTeachers.length) {
      if (onToast) onToast(t('noActiveTeachersFound'), 'error');
      return;
    }
    if (!bulkForm || !bulkForm.subjectId) {
      if (onToast) onToast(t('pleaseSelectSubject'), 'error');
      return;
    }
    if (!bulkForm || !bulkForm.teacherId) {
      if (onToast) onToast(t('pleaseSelectTeacher'), 'error');
      return;
    }

    setBulkInsertLoading(true);
    let totalSuccess = 0;
    let totalError = 0;
    let conflictErrors = [];
    
    try {
      const classList = classes || [];
      const selectedDays = bulkForm.selectedDays || [];
      const selectedPeriods = bulkForm.selectedPeriods || [];
      
      for (const classItem of classList) {
        if (!classItem) continue;
        
        const classSectionsList = getClassSections(classItem.id);
        const sectionsToProcess = classSectionsList.length > 0 ? classSectionsList : [];
        
        for (const section of sectionsToProcess) {
          if (!section) continue;
          
          const sectionIdStr = section.id.toString();
          
          try {
            const response = await TimetableService.viewTimetable(
              schoolId,
              classItem.id.toString(),
              sectionIdStr,
              currentAcademicYearId
            );
            const existingSlots = response?.data || response || [];
            
            for (const day of selectedDays) {
              for (const periodNum of selectedPeriods) {
                const timeSlot = currentTimeSlots[periodNum - 1];
                
                if (!timeSlot) continue;
                
                const exists = (existingSlots || []).some(s => 
                  s && s.dayOfWeek === day && 
                  s.startTime === timeSlot.startTime
                );
                
                if (exists) continue;
                
                const payload = {
                  dayOfWeek: day,
                  startTime: timeSlot.startTime,
                  endTime: timeSlot.endTime,
                  academicYear: { id: parseInt(currentAcademicYearId) },
                  subject: { id: parseInt(bulkForm.subjectId) },
                  teacher: { id: parseInt(bulkForm.teacherId) },
                  school: { id: parseInt(schoolId) },
                  schoolClass: { id: parseInt(classItem.id) },
                  section: { id: parseInt(section.id) }
                };
                
                try {
                  await TimetableService.assignSlot(schoolId, classItem.id.toString(), sectionIdStr, payload);
                  totalSuccess++;
                } catch (error) {
                  totalError++;
                  const errorMsg = extractErrorMessage(error, '');
                  if (errorMsg.includes('Teacher already assigned')) {
                    conflictErrors.push(`${classItem.className} - ${section.sectionName}: ${day} ${t('period')} ${periodNum}`);
                  }
                }
              }
            }
          } catch (error) {
            totalError++;
          }
        }
      }
      
      if (conflictErrors.length > 0) {
        const conflictSummary = conflictErrors.slice(0, 3).join(', ');
        if (onToast) onToast(`⚠️ ${totalSuccess} ${t('added')}, ${totalError} ${t('failed')}.\n${t('conflicts')}: ${conflictSummary}`, 'warning');
      } else if (totalSuccess > 0 && totalError > 0) {
        if (onToast) onToast(`✅ ${totalSuccess} ${t('periodsAdded')}! ⚠️ ${totalError} ${t('failed')}`, 'warning');
      } else if (totalSuccess > 0) {
        if (onToast) onToast(`✅ ${totalSuccess} ${t('periodsAddedAllClasses')}!`, 'success');
      } else if (totalError > 0 && conflictErrors.length > 0) {
        if (onToast) onToast(`❌ ${t('teacherAlreadyAssignedSomeClasses')}`, 'error');
      } else {
        if (onToast) onToast(`❌ ${t('failedToAddPeriods')}`, 'error');
      }
      
      loadTimetable(classId, sectionId);
      setBulkInsertModal(false);
      
    } catch (error) {
      console.error('Error in one-time insert:', error);
      const errorMsg = extractErrorMessage(error, t('failedToAddPeriodsAllClasses'));
      if (onToast) onToast(`❌ ${errorMsg}`, 'error');
    } finally {
      setBulkInsertLoading(false);
    }
  }, [bulkForm, selClass, selSec, validateSection, currentAcademicYearId, activeTeachers, classes, schoolId, currentTimeSlots, getClassSections, extractErrorMessage, onToast, loadTimetable, t]);

  // ============= OPEN MODALS =============
  const openAddModal = (dayOverride, periodNumber = null, classId = null, sectionId = null) => {
    const selectedClassId = classId || selClass;
    const selectedSectionId = sectionId || selSec;
    
    if (!selectedClassId) {
      if (onToast) onToast(t('pleaseSelectClassFirst'), 'error');
      return;
    }
    if (!selectedSectionId || selectedSectionId === '' || selectedSectionId === '0') {
      if (onToast) onToast(t('pleaseSelectSection'), 'error');
      return;
    }
    
    const modalSubjectsList = getClassSubjects(selectedClassId, selectedSectionId);
    if (!modalSubjectsList || !modalSubjectsList.length) {
      if (onToast) onToast(t('noSubjectsFoundForClass'), 'error');
      return;
    }
    if (!activeTeachers || !activeTeachers.length) {
      if (onToast) onToast(t('noActiveTeachersFound'), 'error');
      return;
    }
    if (!currentAcademicYearId) {
      if (onToast) onToast(t('academicYearNotConfigured'), 'error');
      return;
    }

    const periodNum = periodNumber || 1;
    const timeSlot = currentTimeSlots[periodNum - 1] || { startTime: '09:00', endTime: '09:45' };
    
    setForm({
      classId: selectedClassId,
      sectionId: selectedSectionId,
      dayOfWeek: dayOverride || 'Monday',
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      subjectId: modalSubjectsList[0] && modalSubjectsList[0].id ? modalSubjectsList[0].id.toString() : '',
      teacherId: activeTeachers[0] && activeTeachers[0].id ? activeTeachers[0].id.toString() : '',
      periodNumber: periodNum
    });
    setAddModal(true);
  };

  const openBulkInsertModal = () => {
    if (!selClass) {
      if (onToast) onToast(t('pleaseSelectClassFirst'), 'error');
      return;
    }
    if (!selSec || selSec === '' || selSec === '0') {
      if (onToast) onToast(t('pleaseSelectSection'), 'error');
      return;
    }
    if (!classSubjects || !classSubjects.length) {
      if (onToast) onToast(t('noSubjectsFoundForClass'), 'error');
      return;
    }
    if (!activeTeachers || !activeTeachers.length) {
      if (onToast) onToast(t('noActiveTeachersFound'), 'error');
      return;
    }
    
    setBulkForm(prev => ({
      ...prev,
      classId: selClass,
      sectionId: selSec,
      selectedDays: [...DAYS],
      selectedPeriods: Array.from({ length: numberOfPeriods }, (_, i) => i + 1)
    }));
    setBulkInsertModal(true);
  };

  // ============= DELETE SLOT =============
  const openDeleteConfirm = (slotId) => {
    setConfirmDialog({
      open: true,
      slotId: slotId,
      message: t('removePeriodConfirm'),
      title: t('removePeriod')
    });
  };

  const handleDeleteConfirmed = useCallback(async () => {
    const slotId = confirmDialog ? confirmDialog.slotId : null;
    if (!slotId) return;
    
    closeConfirmDialog();
    setLoading(true);
    
    try {
      await TimetableService.deleteSlot(slotId);
      if (onToast) onToast(t('periodRemovedSuccess'), 'success');
      loadTimetable(selClass, selSec);
    } catch (error) {
      console.error('Error deleting slot:', error);
      const errorMsg = extractErrorMessage(error, t('failedToDeletePeriod'));
      if (onToast) onToast(`❌ ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [confirmDialog, closeConfirmDialog, onToast, extractErrorMessage, loadTimetable, selClass, selSec, t]);

  // ============= ASSIGN SLOT =============
  const assignSlot = useCallback(async () => {
    if (!validateSection(form.classId, form.sectionId)) return;
    
    if (!form || !form.subjectId || !form.teacherId || !form.startTime || !form.endTime) {
      if (onToast) onToast(t('allFieldsRequired'), 'error');
      return;
    }

    const selectedTeacher = (activeTeachers || []).find(t => t && String(t.id) === String(form.teacherId));
    if (!selectedTeacher) {
      if (onToast) onToast(t('teacherNotActive'), 'error');
      return;
    }

    setLoading(true);
    try {
      const parsedSecId = parseInt(form.sectionId);
      
      const payload = {
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        academicYear: { id: parseInt(currentAcademicYearId) },
        subject: { id: parseInt(form.subjectId) },
        teacher: { id: parseInt(form.teacherId) },
        school: { id: parseInt(schoolId) },
        schoolClass: { id: parseInt(form.classId) },
        section: { id: parsedSecId }
      };

      await TimetableService.assignSlot(schoolId, form.classId, form.sectionId, payload);

      setAddModal(false);
      setForm({
        classId: '',
        sectionId: '',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '09:45',
        subjectId: '',
        teacherId: '',
        periodNumber: 1
      });
      if (onToast) onToast(t('periodAddedSuccess'), 'success');
      loadTimetable(form.classId, form.sectionId);
      
    } catch (error) {
      console.error('Error assigning slot:', error);
      const errorMsg = extractErrorMessage(error, t('failedToAddPeriod'));
      if (onToast) onToast(`❌ ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [form, validateSection, activeTeachers, currentAcademicYearId, schoolId, onToast, extractErrorMessage, loadTimetable, t]);

  // ============= UTILITY FUNCTIONS =============
  const updateNumberOfPeriods = (count) => {
    const newCount = Math.min(Math.max(parseInt(count) || 1, 1), 12);
    setNumberOfPeriods(newCount);
    localStorage.setItem('timetable_periods_count', newCount);
    if (onToast) onToast(t('periodsSetTo', { count: newCount }), 'success');
  };

  const updateStartTime = (time) => {
    setSchoolStartTime(time);
    localStorage.setItem('timetable_start_time', time);
    if (onToast) onToast(t('startTimeSet', { time }), 'success');
  };

  const setFormField = (k) => (e) => {
    if (!e || !e.target) return;
    const value = e.target.value;
    setForm(p => {
      const updated = { ...p, [k]: value };
      if (k === 'classId') {
        updated.sectionId = '';
        updated.subjectId = '';
      }
      if (k === 'sectionId') {
        updated.subjectId = '';
      }
      return updated;
    });
  };
  
  const setBulkFormField = (k) => (e) => {
    if (!e || !e.target) return;
    const value = e.target.value;
    setBulkForm(prev => {
      const updated = { ...prev, [k]: value };
      if (k === 'classId') {
        updated.sectionId = '';
      }
      return updated;
    });
  };

  const toggleAllDays = () => {
    setBulkForm(prev => {
      const allSelected = (prev.selectedDays || []).length === DAYS.length;
      return {
        ...prev,
        selectedDays: allSelected ? [] : [...DAYS]
      };
    });
  };

  const toggleAllPeriods = () => {
    const allPeriods = Array.from({ length: numberOfPeriods }, (_, i) => i + 1);
    setBulkForm(prev => {
      const allSelected = (prev.selectedPeriods || []).length === numberOfPeriods;
      return {
        ...prev,
        selectedPeriods: allSelected ? [] : [...allPeriods]
      };
    });
  };

  return {
   selClass, setSelClass,
  selSec, setSelSec,
  slots,
  loading,
  loaded,
  addModal, setAddModal,
  bulkInsertModal, setBulkInsertModal,
  bulkInsertLoading,
  form,
  bulkForm,
  confirmDialog,
  numberOfPeriods,
  periodDuration,
  breakDuration,
  lunchBreak,
  updatePeriodDuration,
  updateBreakDuration,
  updateLunchBreak,
  DEFAULT_TIME_SLOTS,
  currentTimeSlots,
  schoolStartTime,
  updateStartTime,
  showTimeSettings,
  setShowTimeSettings,
  showAdvancedSettings,
  setShowAdvancedSettings,
  DAYS,
  classSubjects,
  classSections,
  modalSubjects,
  modalSections,
  getClassSubjects,  // ✅ Make sure this is included
  getClassSections,  // ✅ Make sure this is included
  selectedClass,
  selectedSection,
  sectionLabel,
  slotsByDay,
  hasClasses,
  hasTeachers,
  hasSubjects,
  hasAcademicYear,
  activeTeachers,
  loadTimetable,
  openAddModal,
  openBulkInsertModal,
  assignSlot,
  bulkInsertTimeSlots,
  oneTimeInsertForAllClasses,
  deleteSlot: openDeleteConfirm,
  handleDeleteConfirmed,
  closeConfirmDialog,
  setFormField,
  setBulkFormField,
  updateNumberOfPeriods,
  toggleAllDays,
  toggleAllPeriods,
  handleDayCheckboxChange,
  handlePeriodCheckboxChange,
  currentAcademicYearName
  };
}
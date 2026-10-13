import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import DashboardService from "../../../services/DashboardService";
import { useTranslation } from "react-i18next";

export default function PrincipalDashboardController({ user, onLogout, onToast }) {
  const { t } = useTranslation(); 
  const [section, setSection] = useState('overview');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showIDCard, setShowIDCard] = useState(false);
  const [showTC, setShowTC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [counts, setCounts] = useState({
    teachers: 0, students: 0, classes: 0, sections: 0,
    subjects: 0, mappings: 0, fees: 0, bus: 0, results: 0, attendance: 0
  });
  
  const initialLoadDone = useRef(false);

  // Get data from user or localStorage
  const schoolId = user?.schoolId || localStorage.getItem('ss_school_id');
  const token = user?.token || localStorage.getItem('ss_token');
  const isDepartmentUser = user?.role === "ROLE_DEPARTMENT";
  
  // Get academicYear properly
  let academicYear = user?.academicYear || localStorage.getItem('ss_academic_year') || 'N/A';
  let academicYearId = user?.academicYearId || localStorage.getItem('ss_academic_year_id');
  
  if (!academicYearId && user?.academicYear && typeof user.academicYear === 'object') {
    academicYearId = user.academicYear.id;
    academicYear = user.academicYear.year;
  }
  
  // ✅ FIXED: Wrap userPermissions in useMemo to prevent recreation on every render
  const userPermissions = useMemo(() => {
    if (!isDepartmentUser) return [];
    const perms = user?.permissions || JSON.parse(localStorage.getItem('ss_dept_permissions') || '[]');
    return perms.map(p => p.toLowerCase());
  }, [isDepartmentUser, user?.permissions]);

  const titles = {
    overview: t("dashboard"),
    classes: t("classesAndSections"),
    subjects: t("subjects"),
    mapping: t("classTeacherMapping"),
    timetable: t("timetable"),
    exams: t("examSchedule"),
    results: t("examResults"),
    teachers: t("teachers"),
    students: t("students"),
    attendance: t("attendance"),
    fees: t("feeManagement"),
    idcards: t("idCards"),
    tc: t("transferCertificate"),
    letterPad: t("letterPad"),
    'admit-card': t("admitCard"),
    'student-idcards': t("studentIdCards"),
    'teacher-idcards': t("teacherIdCards"),
    tally: t("tallyAccounts"),
    bus: t("bus"),
    department: t("department"),
     tutorials: t("videoTutorial") || "Video Tutorial"
  };

  const hasPermission = useCallback((permissionName) => {
    if (!isDepartmentUser) return true;
    if (permissionName === 'overview') return true;
    return userPermissions.includes(permissionName.toLowerCase());
  }, [isDepartmentUser, userPermissions]);

  const loadDashboardData = useCallback(async () => {
    if (!schoolId || !token) {
      console.warn('Missing schoolId or token');
      return;
    }

    setLoading(true);

    try {
      if (isDepartmentUser) {
        // DEPARTMENT USER
        const departmentCounts = await DashboardService.getDepartmentCounts(schoolId, academicYearId, userPermissions);
        setCounts(departmentCounts);
        
        if (userPermissions.includes('teachers')) {
          setTeachers(await DashboardService.getTeachers(schoolId));
        }
        if (userPermissions.includes('students')) {
          setStudents(await DashboardService.getStudents(schoolId, academicYearId));
        }
        if (userPermissions.includes('classes')) {
          setClasses(await DashboardService.getClasses(schoolId));
          setSections(await DashboardService.getSections(schoolId));
        }
        if (userPermissions.includes('subjects')) {
          setSubjects(await DashboardService.getSubjects(schoolId, academicYearId));
        }
        if (userPermissions.includes('mapping')) {
          setMappings(await DashboardService.getMappings(schoolId));
        }
      } else {
        // ADMIN USER
        const [teachersData, studentsData, classesData, sectionsData, subjectsData, mappingsData] = await Promise.all([
          DashboardService.getTeachers(schoolId),
          DashboardService.getStudents(schoolId, academicYearId),
          DashboardService.getClasses(schoolId),
          DashboardService.getSections(schoolId),
          DashboardService.getSubjects(schoolId, academicYearId),
          DashboardService.getMappings(schoolId),
        ]);

        setTeachers(teachersData || []);
        setStudents(studentsData || []);
        setClasses(classesData || []);
        setSections(sectionsData || []);
        setSubjects(subjectsData || []);
        setMappings(mappingsData || []);
        
        const activeTeachers = (teachersData || []).filter(t => t && t.active === true);
        setCounts({
          teachers: activeTeachers.length, students: studentsData?.length || 0,
          classes: classesData?.length || 0, sections: sectionsData?.length || 0,
          subjects: subjectsData?.length || 0, mappings: mappingsData?.length || 0,
          fees: 0, bus: 0, results: 0, attendance: 0
        });
      }
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        onToast?.('Session expired. Please login again.', 'error');
        setTimeout(() => onLogout?.(), 2000);
      } else {
        onToast?.('Error loading dashboard data', 'error');
      }
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  }, [schoolId, token, academicYearId, isDepartmentUser, userPermissions, onToast, onLogout]);

  useEffect(() => {
    if (schoolId && token && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadDashboardData();
    }
  }, [schoolId, token, loadDashboardData]);

  const showToast = (msg, type) => onToast?.({ msg, type });
  const navigateToSection = (sectionName) => setSection(sectionName);
  const refreshData = () => { setDataLoaded(false); loadDashboardData(); };

  return {
    section, setSection: navigateToSection, teachers, students, classes, sections,
    subjects, mappings, selectedStudent, showIDCard, showTC, loading, dataLoaded,
    counts, titles, schoolId, academicYearId, token, academicYear, user,
    isDepartmentUser, userPermissions, hasPermission, refreshData, showToast,
    handleGenerateIDCard: (student) => { setSelectedStudent(student); setShowIDCard(true); },
    closeIDCardModal: () => { setShowIDCard(false); setSelectedStudent(null); },
    handleGenerateTC: (student) => { setSelectedStudent(student); setShowTC(true); },
    closeTCModal: () => { setShowTC(false); setSelectedStudent(null); },
    onLogout
  };
}
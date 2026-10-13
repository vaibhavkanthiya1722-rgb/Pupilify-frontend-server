import { useTranslation } from "react-i18next";
import PriOverviewService from "../../../services/PriOverviewService";

function PriOverviewController(user, counts) {
        const { t } = useTranslation(); 

  const isDepartment = user?.role === "ROLE_DEPARTMENT";
  
  let departmentPermissions = [];
  if (isDepartment) {
    departmentPermissions = user?.permissions || 
                           JSON.parse(localStorage.getItem('ss_dept_permissions') || '[]');
    if (Array.isArray(departmentPermissions)) {
      departmentPermissions = departmentPermissions.map(p => p.toLowerCase());
    }
  }
  
  const hasPermission = (permissionKey) => {
    if (!isDepartment) return true;
    if (!permissionKey) return true;
    return departmentPermissions.includes(permissionKey.toLowerCase());
  };

  // Main cards (Teachers, Students, Classes, Sections, Subjects, CT Mappings)
  const mainCards = [
  { cls: 'blue', icon: '👩‍🏫', val: counts.teachers, label: t("teachers"), key: 'teachers', permission: 'teachers' },
  { cls: 'green', icon: '🎓', val: counts.students, label: t("students"), key: 'students', permission: 'students' },
  { cls: 'purple', icon: '📚', val: counts.classes, label: t("classes"), key: 'classes', permission: 'classes' },
  { cls: 'gold', icon: '🗂️', val: counts.sections, label: t("sections"), key: 'classes', permission: 'classes' },
  { cls: 'red', icon: '📖', val: counts.subjects, label: t("subjects"), key: 'subjects', permission: 'subjects' },
  { cls: 'blue', icon: '🔗', val: counts.mappings, label: t("ctMappings"), key: 'mapping', permission: 'mapping' }
];
  // Quick access cards (Fees, Bus, Results, Attendance)
  const quickAccessCards = [
  { cls: 'orange', icon: '💰', label: t("fees"), key: 'fees', permission: 'fees' },
  // { cls: 'teal', icon: '🚌', label: t("bus"), key: 'bus', permission: 'bus' },
  { cls: 'indigo', icon: '📋', label: t("results"), key: 'results', permission: 'results' },
  { cls: 'pink', icon: '🗓️', label: t("attendance"), key: 'attendance', permission: 'attendance' }
];
  // Filter cards for department
  let cards = mainCards;
  let filteredQuickAccess = quickAccessCards;
  
  if (isDepartment) {
    cards = mainCards.filter(card => {
      if (!card.permission) return true;
      return departmentPermissions.includes(card.permission.toLowerCase());
    });
    filteredQuickAccess = quickAccessCards.filter(card => {
      if (!card.permission) return true;
      return departmentPermissions.includes(card.permission.toLowerCase());
    });
  }

  // ✅ FIX: Get logo URL - prioritize user?.school?.logo for department
  let logoFile = null;
  
  if (isDepartment) {
    // For department: check multiple sources
    logoFile = user?.school?.logo ||           // From school object
               user?.schoolLogo ||              // Direct property
               user?.department?.schoolLogo ||  // From department object
               localStorage.getItem('ss_school_logo');
  } else {
    // For admin
    logoFile = user?.schoolLogo || user?.school?.logo;
  }
  
  const logoUrl = PriOverviewService.getLogoUrl(logoFile);

  return {
    cards,
    quickAccessCards: filteredQuickAccess,
    logoUrl,
    isDepartment,
    hasPermission
  };
}

export default PriOverviewController;
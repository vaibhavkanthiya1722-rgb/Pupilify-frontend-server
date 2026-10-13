import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PriSidebar from "../PriSidebar";
import PriSubjects from "../PriSubjects/index";
import PriMapping from "../PriMapping/index";
import PriTeachers from "../PriTeachers/index";
import PriStudents from "../PriStudents/index";
import PriFees from "../PriFees/index";
import PriTimetable from "../PriTimetable/index";
import TCFormat from "../TCFormat/index";
import PriToast from "../PriToast";
import ExamSchedule from "../ExamSchedule/index";
import PriResults from "../PriResult";
import PriOverview from "../PriOverview/index";
import IDCards from "../IDCard/IDCards";
import PriAttendance from "../PriAttendence";
import PriClasses from "../PriClasses/index";
import Tally from "../Tally/index";
import PrincipalDashboardController from "./PrincipalDashboardController";
import Bus from "../Bus/index";
import Department from "../Department/index";
import PriTutorials from "../PriTutorials/index";
import LanguageSwitcher from "../../../components/common/LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import LetterPad from "../LetterPad";
import AdmitCard from "../AdmitCard";

export default function PrincipalDashboard({ user, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getSectionFromPath = () => {
    const path = location.pathname.substring(1);
    return path || "overview";
  };

  const {
    teachers,
    classes,
    sections,
    subjects,
    loading,
    counts,
    titles,
    schoolId,
    academicYearId,
    token,
    academicYear,
    refreshData,
    showToast,
    // ✅ FIXED: Remove unused variables
    // handleGenerateIDCard,
    handleGenerateTC
  } = PrincipalDashboardController({
    user,
    onLogout,
    onToast: (toast) => setToast(toast)
  });

  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // ✅ FIXED: Remove unused state or comment it out
  // const [activeTab, setActiveTab] = useState('overview');

  const currentSection = getSectionFromPath();

  // ================= ROLE =================
  const isDepartment = user?.role === "ROLE_DEPARTMENT";

  // Get allowed sections (convert to lowercase for consistency)
  const allowedSections = isDepartment
    ? (user?.permissions || []).map(p => p.toLowerCase())
    : [];

  // ✅ Define handleRefresh
  const handleRefresh = () => {
    refreshData();
  };

  // ✅ Define onToast
  const onToast = (message, type) => {
    showToast(message, type);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings && !event.target.closest('.settings-dropdown')) {
        setShowSettings(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettings]);

  // ================= NAVIGATION =================
  const handleNavigation = (key) => {
    // Check permission for department users
    if (isDepartment && key !== "overview" && key !== "tutorials") {
      const hasAccess = allowedSections.includes(key.toLowerCase());
      if (!hasAccess) {
        showToast(t("noPermissionAccess") + " " + key, 'error');
        return;
      }
    }

    navigate(`/${key}`);
    setSidebarOpen(false);
  };

  // ================= LOGIN CHECK =================
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>{t("pleaseLoginDashboard") || "Please log in to access the dashboard"}</h2>
        <button onClick={onLogout}>{t("goToLogin") || "Go to Login"}</button>
      </div>
    );
  }

  // ================= RENDER PAGE =================
  const renderContent = () => {
    // BLOCK DIRECT URL ACCESS - Case insensitive check
    if (isDepartment && currentSection !== "overview" && currentSection !== "tutorials") {
      const hasAccess = allowedSections.includes(currentSection.toLowerCase());
      if (!hasAccess) {
        return (
          <div className="pri-content">
            <div className="pri-card">
              <h3>{t("accessDenied") || "Access Denied"}</h3>
              <p>{t("noModulePermission") || "You don't have permission to access this module."}</p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                {t("required") || "Required"}: {currentSection} | {t("yourPermissions") || "Your permissions"}: {allowedSections.join(', ')}
              </p>
            </div>
          </div>
        );
      }
    }

    if (loading && currentSection !== "overview") {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <div className="pri-loading-spinner">⏳</div>
          <p>{t("loading") || "Loading..."}</p>
        </div>
      );
    }

    let content;

    switch (currentSection) {
      case "overview":
        content = <PriOverview user={user} counts={counts} onNav={handleNavigation} />;
        break;

      case "tutorials":
        content = <PriTutorials user={user} onClose={() => navigate('/overview')} />;
        break;

      case "department":
        content = <Department schoolId={schoolId} token={token} onToast={showToast} />;
        break;

      case 'student-idcards':
        content = <IDCards schoolId={schoolId} token={token} user={user} onToast={showToast} mode="idcards" entityType="student" onGenerateTC={handleGenerateTC} academicYearId={academicYearId} />;
        break;

      case 'teacher-idcards':
        content = <IDCards schoolId={schoolId} token={token} user={user} onToast={showToast} mode="idcards" entityType="teacher" academicYearId={academicYearId} />;
        break;

      case "tc":
        content = <TCFormat
          schoolId={schoolId}
          token={token}
          onToast={showToast}
          academicYearId={academicYearId}
          classes={classes || []}
          sections={sections || []}
          user={user}
          onClose={() => navigate('/overview')}
        />;
        break;

       case "letterPad":
        content = <LetterPad
          schoolId={schoolId} 
          token={token} 
          onToast={showToast} 
          academicYearId={academicYearId}       
          user={user}
          onClose={() => navigate('/overview')}
        />;
        break;

      case "admit-card":
        content = <AdmitCard
         schoolId={schoolId}
         classes={classes || []}
         sections={sections || []}
         academicYearId={academicYearId}
         academicYearName={academicYear}
         user={user}
        />;
        break;

      case "bus":
        content = <Bus schoolId={schoolId} onToast={showToast}
          academicYearId={academicYearId}
          user={user} />;
        break;

      case "classes":
        content = <PriClasses schoolId={schoolId} token={token} classes={classes || []} sections={sections || []} onRefresh={refreshData} onToast={showToast} />;
        break;

      case "subjects":
        content = <PriSubjects schoolId={schoolId} token={token} classes={classes || []} sections={sections || []} onToast={showToast} academicYearId={academicYearId} />;
        break;

      case "mapping":
        content = <PriMapping schoolId={schoolId} token={token} classes={classes || []} sections={sections || []} teachers={teachers || []} onToast={showToast} currentAcademicYearId={academicYearId} currentAcademicYearName={academicYear} />;
        break;

      case "teachers":
        content = <PriTeachers schoolId={schoolId} token={token} teachers={teachers || []} onRefresh={refreshData} onToast={showToast} />;
        break;

      case "students":
        content = <PriStudents
          schoolId={schoolId}
          token={token}
          classes={classes}
          sections={sections}
          onRefresh={handleRefresh}
          onToast={onToast}
          academicYearId={academicYearId}
          user={user}
          onCollectFees={(enrollmentId) => {
            navigate('/fees');
            setTimeout(() => {
              window.collectFeesEnrollment = enrollmentId;
            }, 100);
          }}
        />;
        break;

      case "timetable":
        content = <PriTimetable schoolId={schoolId} token={token} classes={classes || []} sections={sections || []} teachers={teachers || []} subjects={subjects || []} onToast={showToast} currentAcademicYearId={academicYearId} currentAcademicYearName={academicYear} />;
        break;

      case "exams":
        content = <ExamSchedule schoolId={schoolId} token={token} classes={classes || []} sections={sections || []} subjects={subjects || []} onToast={showToast} academicYearId={academicYearId} academicYearName={academicYear} />;
        break;

      case "results":
        content = <PriResults schoolId={schoolId} token={token} user={user} onToast={showToast} academicYearId={academicYearId} academicYearName={academicYear} classes={classes} sections={sections} subjects={subjects} teachers={teachers} />;
        break;

      case "attendance":
        content = <PriAttendance schoolId={schoolId} token={token} classes={classes || []} sections={sections || []} onToast={showToast} academicYearId={academicYearId} academicYearName={academicYear} />;
        break;

      case "fees":
        content = <PriFees
          schoolId={schoolId}
          token={token}
          classes={classes || []}
          sections={sections || []}
          onToast={showToast}
          academicYearId={academicYearId}
          academicYearName={academicYear}
          user={user}
          initialEnrollment={window.collectFeesEnrollment}
        />;
        window.collectFeesEnrollment = null;
        break;

      case "tally":
        content = <Tally schoolId={schoolId} academicYearId={academicYearId} token={token} onToast={showToast} academicYear={academicYear} />;
        break;

      default:
        navigate("/overview", { replace: true });
        return null;
    }

    return content;
  };

  // ================= RETURN =================
  return (
    <>
      <div className="pri-root">
        <PriSidebar
          user={user}
          active={currentSection}
          onNav={handleNavigation}
          onLogout={onLogout}
          open={sidebarOpen}
        />
        <div className="pri-main">
          <div className="pri-topbar">
            <button className="pri-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="pri-topbar-title">{titles[currentSection] || t("dashboard") || "Dashboard"}</div>
            <div className="pri-topbar-right">
              <span className="pri-badge">
                📅 {academicYear}
              </span>
              <span className="pri-badge">
                {isDepartment ? `🏢 ${t("department") || "Department"}` : `🏫 ${t("principal") || "Principal"}`}
              </span>

              {/* Settings Dropdown with Language Options */}
              <div className="settings-dropdown">
                <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
                  ⚙️
                </button>
                {showSettings && (
                  <div className="settings-menu">
                    <div className="settings-divider"></div>
                    <div className="settings-section">
                      <LanguageSwitcher variant="button" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {renderContent()}
        </div>
        {toast && <PriToast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </div>
    </>
  );
}
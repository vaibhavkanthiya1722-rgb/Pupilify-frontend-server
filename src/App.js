import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import './styles/App.css';
import './styles/PriAutocompleteSelect.css';
import './locales/i18n';
import './styles/OverviewPage.css';
import './styles/AdmitCard.css';
import SuperAdminDashboard from './components/superadmin/Dashboard';
import Login from './components/auth/Login';
import PrincipalDashboard from './components/admin/PrincipalDashboard';
import OverviewPage from './components/OverviewPage';
import TermsAndConditions from './components/TermsAndConditions'; 
import PrivacyPolicy from './components/PrivacyPolicy';
import { DepartmentProvider } from './contexts/DepartmentContext';

function AppContent() { 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD USER FROM LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("ss_user");
      const token = localStorage.getItem("ss_token");

      if (savedUser && token) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser?.role) {
          // Load school info from localStorage if not in user
          if (!parsedUser.schoolName) {
            parsedUser.schoolName = localStorage.getItem('ss_school_name');
            parsedUser.schoolLogo = localStorage.getItem('ss_school_logo');
          }
          
          // Load academic year
          if (!parsedUser.academicYear) {
            parsedUser.academicYear = localStorage.getItem('ss_academic_year');
            parsedUser.academicYearId = localStorage.getItem('ss_academic_year_id');
          }
          
          // Load permissions for department
          if (parsedUser.role === "ROLE_DEPARTMENT") {
            const permissions = localStorage.getItem("ss_dept_permissions");
            if (permissions) {
              let perms = JSON.parse(permissions);
              if (Array.isArray(perms) && perms.length > 0 && typeof perms[0] === 'string' && perms[0] !== perms[0].toLowerCase()) {
                perms = perms.map(p => p.toLowerCase());
                localStorage.setItem("ss_dept_permissions", JSON.stringify(perms));
              }
              parsedUser.permissions = perms;
            }
          }
          
          setUser(parsedUser);
        } else {
          clearStorage();
        }
      } else {
        clearStorage();
      }
    } catch (error) {
      console.error("Session restore failed:", error);
      clearStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // CLEAR STORAGE
  // =========================================================

  const clearStorage = () => {
    localStorage.removeItem("ss_user");
    localStorage.removeItem("ss_token");
    localStorage.removeItem("ss_role");
    localStorage.removeItem("ss_school_id");
    localStorage.removeItem("ss_school_name");
    localStorage.removeItem("ss_school_logo");
    localStorage.removeItem("ss_permissions");
    localStorage.removeItem("ss_user_type");
    localStorage.removeItem("ss_dept_id");
    localStorage.removeItem("ss_dept_type");
    localStorage.removeItem("ss_dept_name");
    localStorage.removeItem("ss_dept_permissions");
    localStorage.removeItem("ss_academic_year");
    localStorage.removeItem("ss_academic_year_id");
  };

  // =========================================================
  // LOGIN HANDLER
  // =========================================================

  const handleLogin = (userData) => {
    const loginType = userData.loginType || "admin";

    let finalUser = {
      ...userData
    };

    // =====================================================
    // DEPARTMENT LOGIN
    // =====================================================
    if (loginType === "department") {
      finalUser.role = "ROLE_DEPARTMENT";
      finalUser.departmentId = userData.department?.id || userData.departmentId;
      finalUser.departmentType = userData.department?.type;
      finalUser.departmentName = userData.department?.name;
      finalUser.schoolId = userData.department?.schoolId;
      finalUser.username = userData.user?.username;
      finalUser.name = userData.department?.name || "Department User";
      
      // School info
      if (userData.school) {
        finalUser.schoolName = userData.school?.name;
        finalUser.schoolLogo = userData.school?.logo;
      } else if (userData.department) {
        finalUser.schoolName = userData.department?.schoolName;
        finalUser.schoolLogo = userData.department?.schoolLogo;
      }
      
      // Academic Year
      if (userData.academicYear) {
        finalUser.academicYear = userData.academicYear?.year;
        finalUser.academicYearId = userData.academicYear?.id;
      }
      
      // Permissions - lowercase
      finalUser.permissions = userData.permissions ? userData.permissions.map(p => p.toLowerCase()) : [];
      
      // Store in localStorage
      localStorage.setItem("ss_dept_permissions", JSON.stringify(finalUser.permissions));
      localStorage.setItem("ss_permissions", JSON.stringify(finalUser.permissions));
      localStorage.setItem("ss_dept_id", finalUser.departmentId);
      localStorage.setItem("ss_dept_type", finalUser.departmentType);
      localStorage.setItem("ss_dept_name", finalUser.departmentName);
      localStorage.setItem("ss_school_id", finalUser.schoolId);
      localStorage.setItem("ss_school_name", finalUser.schoolName || '');
      localStorage.setItem("ss_school_logo", finalUser.schoolLogo || '');
      localStorage.setItem("ss_academic_year", finalUser.academicYear || '');
      localStorage.setItem("ss_academic_year_id", finalUser.academicYearId || '');
      localStorage.setItem("ss_user_type", "department");
    }
    
    // =====================================================
    // ADMIN LOGIN (PRINCIPAL)
    // =====================================================
    else {
      finalUser.role = userData.role || userData.user?.role || "ROLE_ADMIN";
      finalUser.schoolId = userData.schoolId || userData.school?.id;
      finalUser.schoolName = userData.school?.name || userData.schoolName;
      finalUser.schoolLogo = userData.school?.logo || userData.schoolLogo;
      finalUser.username = userData.user?.username || userData.username;
      finalUser.name = userData.user?.name || "Admin";
      
      // Academic Year
      if (userData.academicYear) {
        if (typeof userData.academicYear === 'object') {
          finalUser.academicYear = userData.academicYear.year;
          finalUser.academicYearId = userData.academicYear.id;
        } else {
          finalUser.academicYear = userData.academicYear;
        }
      }
      
      // Try to get from school's current year
      if (!finalUser.academicYearId && userData.school?.currentYear) {
        finalUser.academicYear = userData.school.currentYear.year;
        finalUser.academicYearId = userData.school.currentYear.id;
      }
      
      localStorage.setItem("ss_user_type", "admin");
      localStorage.setItem("ss_school_name", finalUser.schoolName || '');
      localStorage.setItem("ss_school_logo", finalUser.schoolLogo || '');
      localStorage.setItem("ss_academic_year", finalUser.academicYear || '');
      localStorage.setItem("ss_academic_year_id", finalUser.academicYearId || '');
      localStorage.setItem("ss_school_id", finalUser.schoolId || '');
    }

    // Save common session data
    localStorage.setItem("ss_user", JSON.stringify(finalUser));
    localStorage.setItem("ss_token", finalUser.token);
    localStorage.setItem("ss_role", finalUser.role);

    // Save language from user profile if available
    if (userData.language) {
      localStorage.setItem("language", userData.language);
    }

    setUser(finalUser);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    clearStorage();
    setUser(null);
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        fontSize: '18px',
        color: '#1e3a5f',
        fontWeight: 500,
        background: '#f8fafc'
      }}>
        Loading...
      </div>
    );
  }

  // =========================================================
  // ROLE CHECKS
  // =========================================================

  const isSuperLike = [
    "ROLE_SUPER_ADMIN",
    "ROLE_STATE_ADMIN",
    "ROLE_DISTRICT_ADMIN"
  ].includes(user?.role);

  const isAdmin = user?.role === "ROLE_ADMIN";
  const isDepartment = user?.role === "ROLE_DEPARTMENT";

  // =========================================================
  // ROUTES
  // =========================================================

  return (
    <DepartmentProvider>
      <BrowserRouter>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<OverviewPage />} />
          <Route path="/termsandconditions" element={<TermsAndConditions />} /> 
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Login Page */}
          <Route path="/login" element={
            user ? (
              <Navigate to={isSuperLike ? "/dashboard" : "/overview"} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } />

          {/* ==================== SUPER ADMIN ROUTES ==================== */}
          {user && isSuperLike && (
            <>
              <Route path="/dashboard" element={<SuperAdminDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/schools" element={<SuperAdminDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/state-managers" element={<SuperAdminDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/district-managers" element={<SuperAdminDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/superadmin/*" element={<SuperAdminDashboard user={user} onLogout={handleLogout} />} />
            </>
          )}

          {/* ==================== ADMIN (PRINCIPAL) ROUTES ==================== */}
          {user && isAdmin && (
            <>
              <Route path="/overview" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/dashboard" element={<Navigate to="/principal-overview" replace />} />
              <Route path="/classes" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/subjects" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/mapping" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/timetable" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/exams" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/results" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/teachers" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/students" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/attendance" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/fees" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/tally" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/bus" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/tc" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/admit-card" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
               <Route path="/letterPad" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/student-idcards" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/teacher-idcards" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/department" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/tutorials" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
            </>
          )}

          {/* ==================== DEPARTMENT ROUTES ==================== */}
          {user && isDepartment && (
            <>
              <Route path="/overview" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/dashboard" element={<Navigate to="/dept-overview" replace />} />
              <Route path="/students" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/attendance" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/exams" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/results" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/timetable" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/fees" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/teachers" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/tc" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/admit-card" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/letterPad" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/student-idcards" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/teacher-idcards" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/tally" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/bus" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/classes" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/subjects" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/mapping" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
              <Route path="/tutorials" element={<PrincipalDashboard user={user} onLogout={handleLogout} />} />
            </>
          )}

          {/* ==================== FALLBACK ROUTE ==================== */}
          <Route path="*" element={
            <Navigate to={
              user ? (
                isSuperLike ? "/dashboard" : 
                isAdmin ? "/overview" : 
                isDepartment ? "/overview" : 
                "/"
              ) : "/"
            } replace />
          } />

        </Routes>
      </BrowserRouter>
    </DepartmentProvider>
  );
}

// Main App Component
function App() {
  return <AppContent />;
}

export default App;
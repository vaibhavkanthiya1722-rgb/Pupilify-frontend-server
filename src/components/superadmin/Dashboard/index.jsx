// src/components/superadmin/Dashboard/index.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "../../../components/common/LanguageSwitcher";
import SASidebar from "../SASidebar";
import SAOverview from "../SAOverview";
import SASchools from "../SASchool/SchoolTable";
import SAStateManagers from "../SAStateManagers";
import SADistrictManagers from "../SADistrictManagers";
import SAToast from "../commonFile/SAToast";
import SuperAdminDashboardController from "./SuperAdminDashboardController";
import SAOverviewSkeleton from "../../loaders/SAOverviewSkeleton";

export default function SuperAdminDashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
       const { t } = useTranslation();  

  const {
  section,
  setSection,
  schools,
  loading,
  toast,
  setToast,
  loadSchools,
  showToast
} = SuperAdminDashboardController();

  // ✅ ROLE LABEL with translation
  const roleLabel = {
    ROLE_SUPER_ADMIN: `🛡️ ${t('superAdmin') || 'Super Admin'}`,
    ROLE_STATE_ADMIN: `🏛️ ${t('stateManager') || 'State Manager'}`,
    ROLE_DISTRICT_ADMIN: `🗺️ ${t('districtManager') || 'District Manager'}`
  };

  // ✅ TITLE CONTROL with translation
  const titles = {
    overview: t('dashboardOverview') || "Dashboard Overview",
    schools: t('manageSchools') || "Manage Schools",
    stateManagers: t('manageStateManagers') || "Manage State Managers",
    districtManagers: t('manageDistrictManagers') || "Manage District Managers"
  };

  const handleNavigation = (path, sectionKey) => {
    setSection(sectionKey);
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      <div className="sa-root">

        <SASidebar
          user={user}
          active={section}
          onNav={(key) => {
            if (key === "overview") {
              handleNavigation("/dashboard", "overview");
            } else if (key === "schools") {
              handleNavigation("/schools", "schools");
            } else if (key === "stateManagers") {
              handleNavigation("/state-managers", "stateManagers");
            } else if (key === "districtManagers") {
              handleNavigation("/district-managers", "districtManagers");
            }
          }}
          onLogout={onLogout}
          open={sidebarOpen}
        />

        <div className="pri-main">

          <div className="sa-topbar">
            <button
              className="sa-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            <div className="sa-topbar-title">
              {titles[section]}
            </div>

            {/* ✅ Language Switcher - Add this */}
            <div className="common">
              <span>
                  <LanguageSwitcher variant="button" />
              </span>
            
              <span className="sa-badge display-block-mobil">
                {roleLabel[user?.role] || "User"}
              </span>
            </div>
          </div>

          {/* ================= SECTIONS ================= */}

        

          {section === "overview" && (
  loading ? (
    <SAOverviewSkeleton />
  ) : (
    <SAOverview schools={schools} />
  )
)}

          {section === "schools" && (
            <SASchools
              schools={schools}
              user={user}
              onRefresh={loadSchools}
              onToast={showToast}
              loading={loading}
            />
          )}

          {/* ✅ ONLY SUPER ADMIN */}
          {user?.role === "ROLE_SUPER_ADMIN" && section === "stateManagers" && (
            <SAStateManagers onToast={showToast} />
          )}

          {(user?.role === "ROLE_SUPER_ADMIN" || user?.role === "ROLE_STATE_ADMIN")
            && section === "districtManagers" && (
              <SADistrictManagers onToast={showToast} />
            )}

        </div>

        {toast && (
          <SAToast
            msg={toast.msg}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}

      </div>
    </>
  );
}
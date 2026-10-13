// src/components/superadmin/SASidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../../libs/constants";
import { useTranslation } from 'react-i18next';

function SASidebar({ user, active, onNav, onLogout, open }) {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Removed unused i18n

  const nav = [
    { label: t('overview') || "Overview", icon: "📊", key: "overview", path: "/dashboard" },
    
    // Super Admin
    ...(user?.role === "ROLE_SUPER_ADMIN"
      ? [
          { label: t('stateManagers') || "State Managers", icon: "🏛️", key: "stateManagers", path: "/state-managers" }
        ]
      : []),
    
    // District Managers → Super Admin + State Admin
    ...((user?.role === "ROLE_SUPER_ADMIN" || user?.role === "ROLE_STATE_ADMIN")
      ? [
          { label: t('districtManagers') || "District Managers", icon: "🗺️", key: "districtManagers", path: "/district-managers" }
        ]
      : []),
    
    { label: t('manageSchools') || "Manage Schools", icon: "🏫", key: "schools", path: "/schools" }
  ];

  return (
    <aside className={`sa-sidebar ${open ? "sa-sidebar-open" : ""}`}>
      <div className="sa-brand">
        <div className="sa-brand-icon">🏛️</div>
        <div>
          <div className="sa-brand-name">{t('smartSchool') || "SmartSchool"}</div>
          <div className="sa-brand-role">
            {ROLE_LABELS[user?.role] || user?.role}
          </div>
        </div>
      </div>

      <nav className="sa-nav">
        {nav.map(item => (
          <button
            key={item.key}
            className={`sa-nav-item ${active === item.key ? "sa-active" : ""}`}
            onClick={() => {
              onNav(item.key);
              navigate(item.path);
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <button
        className="sa-logout-btn"
        onClick={() => {
          onLogout();
          navigate("/login");
        }}
      >
        🚪 {t('logout') || "Logout"}
      </button>
    </aside>
  );
}

export default SASidebar;
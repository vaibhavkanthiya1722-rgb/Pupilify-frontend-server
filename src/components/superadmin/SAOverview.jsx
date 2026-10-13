// src/components/superadmin/SAOverview.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function SAOverview({ schools }) {
  const { t } = useTranslation(); // ✅ Removed unused i18n
  
  const active = schools.filter(s => s.subscriptionStatus === 'ACTIVE').length;
  const trial = schools.filter(s => s.subscriptionStatus === 'TRIAL').length;
  const inactive = schools.filter(s => s.subscriptionStatus === 'INACTIVE').length;

  return (
    <div className="sa-content">
      <div className="sa-welcome-banner">
        <div>
          <div className="sa-welcome-subtitle">
            {t('welcomeBack') || "Welcome Back"}
          </div>
          <div className="sa-welcome-title">
            {t('superAdminDashboard') || "Super Admin Dashboard"}
          </div>
          <div className="sa-welcome-text">
            {t('dashboardSubtitle') || "Complete control over all registered schools"}
          </div>
        </div>
        <div className="sa-welcome-icon display-block-mobil">🛡️</div>
      </div>

      <div className="sa-stats">
        {[
          { cls: 'gold', icon: '🏫', val: schools.length, label: t('totalSchools') || 'Total Schools' },
          { cls: 'green', icon: '✅', val: active, label: t('activeSchools') || 'Active Schools' },
          { cls: 'blue', icon: '🕐', val: trial, label: t('trialSchools') || 'Trial Schools' },
          { cls: 'red', icon: '⛔', val: inactive, label: t('inactiveSchools') || 'Inactive Schools' },
        ].map(s => (
          <div key={s.label} className={`sa-stat ${s.cls}`}>
            <div className="sa-stat-icon">{s.icon}</div>
            <div className="sa-stat-val">{s.val}</div>
            <div className="sa-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="sa-widget-row">
        <div className="sa-widget">
          <div className="sa-widget-title">📋 {t('systemActivity') || "System Activity"}</div>
          {[
            ['#f59e0b', t('superAdminLoggedIn') || "Super Admin logged in", t('justNow') || "Just now"],
            ['#10b981', t('systemLive') || "System live on localhost:8080", t('active') || "Active"],
            ['#3b82f6', `${schools.length} ${t('schoolsManaged') || "schools managed"}`, t('total') || "Total"],
          ].map(([color, text, time]) => (
            <div key={text} className="sa-activity-item">
              <div className="sa-activity-dot" style={{ background: color }} />
              <div className="sa-activity-text">{text}</div>
              <div className="sa-activity-time">{time}</div>
            </div>
          ))}
        </div>
        
        <div className="sa-widget">
          <div className="sa-widget-title">👥 {t('systemRoles') || "System Roles"}</div>
          {[
            { icon: '🛡️', bg: 'linear-gradient(135deg,#f59e0b,#ef4444)', count: 1, label: t('superAdministrator') || "Super Administrator" },
            { icon: '🏫', bg: 'linear-gradient(135deg,#3b82f6,#6366f1)', count: schools.length, label: t('principals') || "Principals (Admins)" },
          ].map(r => (
            <div key={r.label} className="sa-role-item">
              <div className="sa-role-icon" style={{ background: r.bg }}>{r.icon}</div>
              <div>
                <div className="sa-role-count">{r.count}</div>
                <div className="sa-role-label">{r.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SAOverview;
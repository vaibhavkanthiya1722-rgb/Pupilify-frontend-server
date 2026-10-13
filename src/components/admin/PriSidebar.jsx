import React, { useState, useEffect } from 'react';
import PriOverviewService from '../../services/PriOverviewService';
import { useTranslation } from "react-i18next";

function PriSidebar({ user, active, onNav, onLogout, open }) {
   const { t } = useTranslation(); 
  const [expandedIdCards, setExpandedIdCards] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [permissions, setPermissions] = useState([]);

  // Get school info from multiple sources
  const schoolName = user?.schoolName || 
                     localStorage.getItem('ss_school_name') || 
                     user?.school?.name || 
                     t('schoolName');
  
  const schoolLogo = user?.schoolLogo || 
                     localStorage.getItem('ss_school_logo') || 
                     user?.school?.logo;
  
  const logoUrl = schoolLogo ? PriOverviewService.getLogoUrl(schoolLogo) : null;

  // DEPARTMENT LOGIN CHECK
  const isDepartmentUser = user?.role === "ROLE_DEPARTMENT";

  useEffect(() => {
    if (active === 'student-idcards' || active === 'teacher-idcards') {
      setExpandedIdCards(true);
    }
  }, [active]);

  useEffect(() => {
    // Load permissions for department user
    if (isDepartmentUser) {
      let perms = user?.permissions || 
                  JSON.parse(localStorage.getItem('ss_dept_permissions') || '[]');
      
      // Convert all permissions to lowercase for case-insensitive comparison
      if (Array.isArray(perms)) {
        perms = perms.map(p => p.toLowerCase());
      }
      
      setPermissions(perms);
    }
  }, [isDepartmentUser, user]);

  // Permission check function (case-insensitive)
  const hasPermission = (permissionKey) => {
    if (!isDepartmentUser) return true;
    if (permissionKey === 'overview') return true;
    const permissionLower = permissionKey.toLowerCase();
    return permissions.includes(permissionLower);
  };

  // ================= ADMIN / PRINCIPAL SIDEBAR =================
  const adminGroups = [
    {
      label: t('dashboard'),
      items: [{ label: t('overview'), icon: '📊', key: 'overview' }]
    },
    {
      label: t('academics'),
      items: [
        { label: t('classesAndSections'), icon: '📚', key: 'classes' },
        { label: t('subjects'), icon: '📖', key: 'subjects' },
        { label: t('classTeacherMapping'), icon: '🔗', key: 'mapping' },
        { label: t('timeTable'), icon: '🕐', key: 'timetable' },
        { label: t('examSchedule'), icon: '📝', key: 'exams' },
        { label: t('examResults'), icon: '📊', key: 'results' }
      ]
    },
    {
      label: t('people'),
      items: [
        { label: t('teachers'), icon: '👩‍🏫', key: 'teachers' },
        { label: t('students'), icon: '🎓', key: 'students' }
      ]
    },
    {
      label: t('documents'),
      items: [
        {
          label: t('idCards'), icon: '🪪', key: 'idcards',
          subItems: [
            { label: t('studentIdCards'), icon: '🎓', key: 'student-idcards' },
            { label: t('teacherIdCards'), icon: '👩‍🏫', key: 'teacher-idcards' }
          ]
        },
        { label: t('transferCertificate'), icon: '📜', key: 'tc' },
        { label: t('admitCard'), icon: '🎫', key: 'admit-card' },
         { label: t('letterPad'), icon: '📄', key: 'letterPad', permission: 'letterPad' }
      ]
    },
    {
      label: t('finance'),
      items: [
        { label: t('feeManagement'), icon: '💰', key: 'fees' },
        { label: t('tallyAccounts'), icon: '💰', key: 'tally' }
      ]
    },
    {
      label: t('departments'),
      items: [{ label: t('createDepartment'), icon: '➕', key: 'department' }]
    },
    {
      label: t('transport'),
      items: [{ label: t('bus'), icon: '🚌', key: 'bus' }]
    },
    {
      label: t('reports'),
      items: [{ label: t('attendance'), icon: '🗓️', key: 'attendance' }]
    },
    // 👇 YAHAN TUTORIALS ADD KAREN - BAS EK OPTION
    {
      label: t('help'),
      items: [
        { label: t('tutorials'), icon: '🎬', key: 'tutorials' }
      ]
    }
  ];

  // ================= DEPARTMENT SIDEBAR =================
  const departmentGroups = [
    {
      label: t('dashboard'),
      items: [
        { label: t('overview'), icon: '📊', key: 'overview', permission: 'overview' }
      ]
    },
    {
      label: t('academics'),
      items: [
        { label: t('classesAndSections'), icon: '📚', key: 'classes', permission: 'classes' },
        { label: t('subjects'), icon: '📖', key: 'subjects', permission: 'subjects' },
        { label: t('classTeacherMapping'), icon: '🔗', key: 'mapping', permission: 'mapping' },
        { label: t('timeTable'), icon: '🕐', key: 'timetable', permission: 'timetable' },
        { label: t('examSchedule'), icon: '📝', key: 'exams', permission: 'exams' },
        { label: t('examResults'), icon: '📊', key: 'results', permission: 'results' }
      ]
    },
    {
      label: t('people'),
      items: [
        { label: t('teachers'), icon: '👩‍🏫', key: 'teachers', permission: 'teachers' },
        { label: t('students'), icon: '🎓', key: 'students', permission: 'students' }
      ]
    },
    {
      label: t('documents'),
      items: [
        {
          label: t('idCards'), icon: '🪪', key: 'idcards', permission: 'idcards',
          subItems: [
            { label: t('studentIdCards'), icon: '🎓', key: 'student-idcards', permission: 'student-idcards' },
            { label: t('teacherIdCards'), icon: '👩‍🏫', key: 'teacher-idcards', permission: 'teacher-idcards' }
          ]
        },
        { label: t('transferCertificate'), icon: '📜', key: 'tc', permission: 'tc' },
        { label: t('admitCard'), icon: '🎫', key: 'admit-card', permission: 'admit-card' },
        { label: t('letterPad'), icon: '📄', key: 'letterPad', permission: 'letterPad' }
      ]
    },
    {
      label: t('finance'),
      items: [
        { label: t('feeManagement'), icon: '💰', key: 'fees', permission: 'fees' },
        { label: t('tallyAccounts'), icon: '💰', key: 'tally', permission: 'tally' }
      ]
    },
    {
      label: t('departments'),
      items: [
        { label: t('createDepartment'), icon: '➕', key: 'department', permission: 'department' }
      ]
    },
    {
      label: t('transport'),
      items: [
        { label: t('bus'), icon: '🚌', key: 'bus', permission: 'bus' }
      ]
    },
    {
      label: t('reports'),
      items: [
        { label: t('attendance'), icon: '🗓️', key: 'attendance', permission: 'attendance' }
      ]
    },
    // 👇 DEPARTMENT KE LIYE BHI TUTORIALS
    {
      label: t('help'),
      items: [
        { label: t('tutorials'), icon: '🎬', key: 'tutorials', permission: 'tutorials' }
      ]
    }
  ];

  // Filter department items based on permissions
  const filterItems = (items) => {
    return items.filter(item => {
      if (item.key === 'overview') return true;
      if (item.subItems) {
        const hasAccessibleSubItem = item.subItems.some(subItem => 
          subItem.key === 'overview' || hasPermission(subItem.permission)
        );
        return hasAccessibleSubItem;
      }
      return hasPermission(item.permission);
    }).map(item => {
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(subItem => 
            subItem.key === 'overview' || hasPermission(subItem.permission)
          )
        };
      }
      return item;
    });
  };

  // Apply filtering for department groups
  const filteredDepartmentGroups = departmentGroups.map(group => ({
    ...group,
    items: filterItems(group.items)
  })).filter(group => group.items.length > 0);

  // ================= MENU SWITCH =================
  const groups = isDepartmentUser ? filteredDepartmentGroups : adminGroups;

  const handleNav = (key) => {
    onNav(key);
  };

  const handleSubNav = (key) => {
    onNav(key);
  };

  const isIdCardActive = active === 'student-idcards' || active === 'teacher-idcards';

  return (
    <aside className={`pri-sidebar ${open ? "pri-sidebar-open" : ""}`}>
    
      {/* BRAND - Fixed for Department */}
      <div className="pri-brand">
        <div className="pri-school-logo">
          {logoUrl && !logoError ? (
            <img 
              src={logoUrl} 
              alt={t('schoolLogo')} 
              onError={() => setLogoError(true)} 
            />
          ) : (
            '🏫'
          )}
        </div>
        <div>
          <div className="pri-brand-name">{schoolName}</div>
          <div className="pri-brand-role">
            {isDepartmentUser ? t('departmentPortal', { departmentType: user?.departmentType || 'Department' }) : t('principalPortal')}
          </div>
        </div>
      </div>

      {/* USER INFO */}
      <div className="pri-user-info">
        <div className="pri-avatar">{(user?.name || user?.departmentName || 'P').charAt(0).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <div className="pri-user-name">
            {isDepartmentUser ? (user?.departmentName || t('departmentUser')) : (user?.name || t('principal'))}
          </div>
          <div className="pri-user-email">{user?.username || ''}</div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="pri-nav">
        {groups.map(g => (
          <div key={g.label}>
            <div className="pri-nav-group-label">{g.label}</div>
            {g.items.map(item => {
              // ID CARD SUBMENU
              if (item.key === 'idcards') {
                return (
                  <div key={item.key}>
                    <button
                      className={`pri-nav-item ${isIdCardActive ? 'parent-active' : ''}`}
                      onClick={() => setExpandedIdCards(!expandedIdCards)}
                    >
                      <span className="pri-nav-icon">{item.icon}</span>
                      <span className="pri-nav-item-with-sub">
                        {item.label}
                        <span className={`pri-expand-icon ${expandedIdCards ? 'expanded' : ''}`}>▶</span>
                      </span>
                    </button>
                    {expandedIdCards && item.subItems && item.subItems.length > 0 && (
                      <div className="pri-submenu">
                        {item.subItems.map(subItem => (
                          <button
                            key={subItem.key}
                            className={`pri-submenu-item${active === subItem.key ? ' pri-active' : ''}`}
                            onClick={() => handleSubNav(subItem.key)}
                          >
                            <span>{subItem.icon}</span>
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // 👇 TUTORIALS - SIMPLE OPTION (KOI SUBMENU NAHI)
              if (item.key === 'tutorials') {
                return (
                  <button
                    key={item.key}
                    className={`pri-nav-item${active === item.key ? ' pri-active' : ''}`}
                    onClick={() => handleNav(item.key)}
                  >
                    <span className="pri-nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              }

              // NORMAL MENU ITEM
              return (
                <button
                  key={item.key}
                  className={`pri-nav-item${active === item.key ? ' pri-active' : ''}`}
                  onClick={() => handleNav(item.key)}
                >
                  <span className="pri-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="pri-sidebar-footer">
        <button className="pri-logout-btn" onClick={onLogout}>
          <span>🚪</span>
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}

export default PriSidebar;
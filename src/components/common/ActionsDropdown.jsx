import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';

function ActionsDropdown({ 
  student, 
  actions, 
  onAction, 
  disabled
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
        setExpandedMenu(null);
      }
    };
    
    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      let top = rect.bottom + 4;
      let left = rect.right - 200;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const dropdownHeight = actions.length * 42 + 12;

      if (top + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 4;
      }

      if (left < 10) {
        left = 10;
      }

      if (left + 200 > viewportWidth) {
        left = viewportWidth - 210;
      }

      setDropdownPosition({ top, left });
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      updateDropdownPosition();
      setTimeout(() => {
        if (buttonRef.current) {
          updateDropdownPosition();
        }
      }, 10);
    }
    setIsOpen(!isOpen);
    setExpandedMenu(null);
  };

  const handleAction = (actionKey, studentData) => {
    setIsOpen(false);
    setExpandedMenu(null);
    if (onAction) {
      onAction(actionKey, studentData);
    }
  };

  const toggleSubMenu = (menuKey) => {
    setExpandedMenu(expandedMenu === menuKey ? null : menuKey);
  };

  // Action icons
  const actionIcons = {
    view: '👁️',
    edit: '✏️',
    print: '🖨️',
    promote: '⬆️',
    delete: '🗑️',
    fees: '💰'
  };

  // Sub-action icons
  const subActionIcons = {
    collect: '💳',
    record: '📊',
    adjustment: '📝'
  };

  // Sub-action colors
  const subActionColors = {
    collect: '#16a34a',
    record: '#3b82f6',
    adjustment: '#f59e0b'
  };
  if (!actions || actions.length === 0) {
    return null;
  }

  // Separate main actions and fees sub-actions
  const mainActions = actions.filter(a => a.key !== 'fees');
  const feesAction = actions.find(a => a.key === 'fees');

  const renderDropdown = () => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          minWidth: '200px',
          maxWidth: '220px',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          border: '1px solid #e5e7eb',
          padding: '6px',
          zIndex: 999999,
          overflow: 'hidden',
          animation: 'dropdownFadeIn 0.15s ease'
        }}
      >
        <style>
          {`
            @keyframes dropdownFadeIn {
              from {
                opacity: 0;
                transform: translateY(-8px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            .submenu-item {
              padding-left: 32px !important;
              font-size: 12px !important;
            }
          `}
        </style>
        
        {/* Main Actions */}
        {mainActions.map((action) => (
          <div
            key={action.key}
            onClick={() => handleAction(action.key, student)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              color: '#1e293b',
              borderRadius: '6px',
              transition: 'all 0.15s',
              opacity: disabled ? 0.5 : 1,
              background: 'transparent',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!disabled) e.target.style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '15px', width: '22px', textAlign: 'center' }}>
              {actionIcons[action.key] || '📌'}
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: '13px' }}>
              {action.label}
            </span>
            {action.badge && (
              <span style={{
                background: '#94a3b8',
                color: 'white',
                fontSize: '9px',
                padding: '1px 8px',
                borderRadius: '10px',
                fontWeight: 600,
                marginLeft: '4px'
              }}>
                {action.badge}
              </span>
            )}
          </div>
        ))}

        {/* Fees Menu with Sub-options */}
        {feesAction && (
          <div>
            <div
              onClick={() => toggleSubMenu('fees')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                color: '#1e293b',
                borderRadius: '6px',
                transition: 'all 0.15s',
                opacity: disabled ? 0.5 : 1,
                background: expandedMenu === 'fees' ? '#f1f5f9' : 'transparent',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!disabled && expandedMenu !== 'fees') e.target.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                if (expandedMenu !== 'fees') e.target.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '15px', width: '22px', textAlign: 'center' }}>
                {actionIcons.fees}
              </span>
              <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', fontWeight: 600 }}>
                {feesAction.label}
              </span>
              <span style={{
                fontSize: '10px',
                transition: 'transform 0.2s',
                transform: expandedMenu === 'fees' ? 'rotate(90deg)' : 'rotate(0deg)'
              }}>▶</span>
            </div>

            {/* Sub-options */}
            {expandedMenu === 'fees' && feesAction.subItems && (
              <div style={{
                background: '#f8fafc',
                borderRadius: '6px',
                margin: '2px 6px 4px 6px',
                padding: '2px 0',
                border: '1px solid #e2e8f0'
              }}>
                {feesAction.subItems.map((subItem) => (
                  <div
                    key={subItem.key}
                    onClick={() => handleAction(subItem.key, student)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '6px 14px 6px 32px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      color: '#1e293b',
                      borderRadius: '4px',
                      transition: 'all 0.15s',
                      opacity: disabled ? 0.5 : 1,
                      background: 'transparent',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled) e.target.style.background = '#e2e8f0';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '13px', width: '18px', textAlign: 'center' }}>
                      {subActionIcons[subItem.key] || '📌'}
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', fontSize: '12px' }}>
                      {subItem.label}
                    </span>
                    <span style={{
                      fontSize: '8px',
                      color: subActionColors[subItem.key] || '#94a3b8',
                      fontWeight: 600
                    }}>
                      {subItem.key === 'collect' ? '₹' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        disabled={disabled}
        style={{
          padding: '7px 12px',
          background: isOpen ? '#e5e7eb' : '#f1f5f9',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s',
          opacity: disabled ? 0.5 : 1,
          outline: 'none',
          minWidth: '65px',
          justifyContent: 'center',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen) e.target.style.background = '#e5e7eb';
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) e.target.style.background = '#f1f5f9';
        }}
      >
        <span>⚡</span>
        <span>{t('actions')}</span>
        <span style={{
          fontSize: '8px',
          marginLeft: '2px',
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>▼</span>
      </button>

      {renderDropdown()}
    </div>
  );
}

export default ActionsDropdown;
// src/components/admin/Departments/DepartmentPermissionModal.js

import React from "react";
import PriModal from "../PriModal";
import { useTranslation } from 'react-i18next';

export default function DepartmentPermissionModal({
  open,
  onClose,
  selectedPermissions = [],
  allPermissions = [],
  togglePermission,
  onSave,
  department,
  loading = false
}) {
       const { t } = useTranslation(); 
  
  if (!open) return null;

  return (
    <PriModal
      title={`🔐 ${department?.deptName || t('department')} ${t('permissions')}`}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="pri-btn pri-btn-ghost" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="pri-btn pri-btn-primary" onClick={onSave}>
            {t('savePermissions')}
          </button>
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          {t('loadingPermissions')}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14
        }}>
          {allPermissions.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 14 }}>
              {t('noPermissionsAvailable')}
            </div>
          ) : (
            allPermissions.map(permission => {
              const isChecked = selectedPermissions.includes(permission);
              
              return (
                <label
                  key={permission}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    border: isChecked ? "1px solid #3b82f6" : "1px solid #e2e8f0",
                    borderRadius: 10,
                    background: isChecked ? "#eff6ff" : "#fff",
                    cursor: "pointer",
                    transition: "0.2s"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePermission(permission)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: 500, color: "#0f172a" }}>
                    {t(permission.toLowerCase()) || permission}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </PriModal>
  );
}
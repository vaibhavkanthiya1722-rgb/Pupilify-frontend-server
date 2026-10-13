// src/components/admin/Departments/index.js

import React, { useState } from "react";
import DepartmentFormModal from "./DepartmentFormModal";
import DepartmentPermissionModal from "./DepartmentPermissionModal";
import DepartmentController from "./DepartmentController";
import DeleteButton from "../../common/DeleteButton";
import TableSkeleton from "../../loaders/TableSkeleton"; 
import { useTranslation } from 'react-i18next';

export default function Departments({ schoolId, onToast }) {
  const { t } = useTranslation(); 

  const {
    departments,
    loading,
    loadingPermissions,
    selectedDepartment,
    setSelectedDepartment,
    selectedPermissions,
    allPermissions,
    departmentForm,
    handleDepartmentChange,
    createDepartment,
    deleteDepartment,
    togglePermission,
    savePermissions
  } = DepartmentController({
    schoolId,
    onToast
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const handleDelete = async (id) => {
    await deleteDepartment(id);
  };

  return (
    <div className="pri-content">
      {/* TOP ACTIONS */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        gap: 12
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            🏢 {t('departments')}
          </h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
            {t('manageDepartments')}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {selectedDepartment && (
            <button
              className="pri-btn pri-btn-primary"
              onClick={() => setShowPermModal(true)}
              disabled={loading}
            >
              🔐 {t('permissions')}
            </button>
          )}
          <button
            className="pri-btn pri-btn-primary"
            onClick={() => {
              setFormErrors({});
              setTouchedFields({});
              setShowCreateModal(true);
            }}
            disabled={loading}
          >
            ➕ {t('newDepartment')}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="pri-card">
        <div className="table-wrap">
          {loading && departments.length === 0 ? (
            // Show skeleton loader in place of table
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <table className="pri-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('department')}</th>
                  <th>{t('type')}</th>
                  <th>{t('username')}</th>
                  <th>{t('status')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="pri-empty">
                        <div className="pri-empty-icon">🏢</div>
                        <p>{t('noDepartmentsFound')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  departments.map((dept, idx) => (
                    <tr
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept)}
                      style={{
                        cursor: "pointer",
                        background: selectedDepartment?.id === dept.id ? "#eff6ff" : "transparent"
                      }}
                    >
                      <td>{idx + 1}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <strong>{dept.deptName}</strong>
                          <span style={{ fontSize: 12, color: "#64748b" }}>{t('id')}: {dept.id}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          background: "#f1f5f9",
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {dept.deptType}
                        </span>
                      </td>
                      <td>{dept.username || "—"}</td>
                      <td>
                        <span style={{
                          color: dept.active === false ? "#dc2626" : "#16a34a",
                          fontWeight: 600
                        }}>
                          {dept.active === false ? t('inactive') : t('active')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="pri-btn pri-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDepartment(dept);
                              setShowPermModal(true);
                            }}
                            title={t('permissions')}
                            disabled={loading}
                          >
                            🔐
                          </button>
                          <DeleteButton
                            objectId={dept.id}
                            objectName={dept.deptName}
                            onDelete={handleDelete}
                            itemType={t('department')}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <DepartmentFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        form={departmentForm}
        handleChange={handleDepartmentChange}
        onSave={async () => {
          const success = await createDepartment();
          if (success) {
            setShowCreateModal(false);
          }
        }}
        errors={formErrors}
        setErrors={setFormErrors}
        touched={touchedFields}
        setTouched={setTouchedFields}
      />

      {/* PERMISSION MODAL */}
      <DepartmentPermissionModal
        open={showPermModal}
        onClose={() => setShowPermModal(false)}
        selectedPermissions={selectedPermissions}
        allPermissions={allPermissions}
        togglePermission={togglePermission}
        department={selectedDepartment}
        loading={loadingPermissions}
        onSave={() => {
          savePermissions();
          setShowPermModal(false);
        }}
      />
    </div>
  );
}
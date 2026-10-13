// src/components/superadmin/Dashboard/SAStateManagers/index.js

import React, { useState } from "react";
import SAStateManagersController from "./SAStateManagersController";
import StateManagerFormModal from "./StateManagerFormModal";
import StateManagementModal from "./StateManagerFormModal/StateManagementModal";
import EditAndViewButton from "../../common/EditAndViewButton";
import DeleteButton from "../../common/DeleteButton";
import TableSkeleton from "../../loaders/TableSkeleton"; // Import TableSkeleton
import { useTranslation } from 'react-i18next';

export default function SAStateManagers({ onToast }) {
  const { t } = useTranslation();      
  const {
    stateManagers,
    states,
    loading,
    deleteStateManager,
    reload,
    loadStates
  } = SAStateManagersController(onToast);

  const [showModal, setShowModal] = useState(false);
  const [showStateManagement, setShowStateManagement] = useState(false);
  const [editingManager, setEditingManager] = useState(null);

  const handleAdd = () => {
    setEditingManager(null);
    setShowModal(true);
  };

  const handleManageStates = () => {
    setShowStateManagement(true);
  };

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setShowModal(true);
  };

  const handleDelete = async (managerId) => {
    try {
      await deleteStateManager(managerId);
      onToast(t("stateManagerDeleted"), "success");
      reload();
    } catch (error) {
      console.error("Delete failed:", error);
      onToast(error.message || t("deleteFailed"), "error");
      throw error;
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingManager(null);
  };

  const handleSaved = (message) => {
    onToast(message, "success");
    handleModalClose();
    reload();
  };

  const handleStatesUpdated = () => {
    loadStates();
    onToast(t("statesUpdated"), "success");
  };

  return (
    <div className="sa-content">
      <div className="sa-table-header">
        <div className="sa-table-name">👥 {t("stateManagers")}</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="sa-btn sa-btn-secondary" onClick={handleManageStates}>
            🏛️ {t("manageStates")}
          </button>
          <button className="sa-btn sa-btn-primary" onClick={handleAdd}>
            + {t("addStateManager")}
          </button>
        </div>
      </div>

      <div className="table-wrap sa-card">
        {loading && stateManagers.length === 0 ? (
          // Show skeleton loader in place of table
          <TableSkeleton rows={6} columns={6} />
        ) : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("name")}</th>
                <th>{t("emailUsername")}</th>
                <th>{t("phone")}</th>
                <th>{t("state")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {stateManagers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    {t("noStateManagers")}
                  </td>
                </tr>
              ) : (
                stateManagers.map((manager, index) => (
                  <tr key={manager.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{manager.name}</strong>
                    </td>
                    <td>{manager.email || manager.username || "-"}</td>
                    <td>{manager.phoneNumber || manager.phone || "-"}</td>
                    <td>
                      <span className="sa-badge sa-badge-primary">
                        {manager.stateName || manager.state?.name || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`sa-status ${
                          manager.active ? "active" : "inactive"
                        }`}
                      >
                        {manager.active ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td>
                      <div className="sa-td-actions">
                        <EditAndViewButton
                          icon="✏️"
                          toolTipTitle={t("editManager")}
                          onClick={() => handleEdit(manager)}
                        />
                        <DeleteButton
                          objectId={manager.id}
                          objectName={manager.name}
                          onDelete={handleDelete}
                          title="Delete"
                          itemType="State Manager"
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

      {showModal && (
        <StateManagerFormModal
          manager={editingManager}
          states={states}
          onClose={handleModalClose}
          onSaved={handleSaved}
          refreshStates={loadStates}
        />
      )}

      {showStateManagement && (
        <StateManagementModal
          onClose={() => setShowStateManagement(false)}
          onStatesUpdated={handleStatesUpdated}
        />
      )}
    </div>
  );
}
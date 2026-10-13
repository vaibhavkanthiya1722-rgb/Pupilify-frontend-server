// src/components/superadmin/Dashboard/SADistrictManagers/index.js

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SADistrictManagersController from "./SADistrictManagersController";
import DistrictManagerFormModal from "./DistrictManagerFormModal";
import DistrictManagementModal from "./DistrictManagerFormModal/DistrictManagementModal";
import EditAndViewButton from "../../common/EditAndViewButton";
import DeleteButton from "../../common/DeleteButton";
import TableSkeleton from "../../loaders/TableSkeleton";

export default function SADistrictManagers({ onToast }) {
  const { t } = useTranslation(); 
  const {
    districtManagers,
    districts,
    states,
    loading,
    deleteDistrictManager,
    reload,
    loadDistricts,
  } = SADistrictManagersController(onToast);

  const [showModal, setShowModal] = useState(false);
  const [showDistrictManagement, setShowDistrictManagement] = useState(false);
  const [editingManager, setEditingManager] = useState(null);

  const handleAdd = () => {
    setEditingManager(null);
    setShowModal(true);
  };

  const handleManageDistricts = () => {
    setShowDistrictManagement(true);
  };

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setShowModal(true);
  };

  const handleDelete = async (managerId) => {
    try {
      await deleteDistrictManager(managerId);
      onToast(t("districtManagerDeleted"), "success");
      reload();
    } catch (error) {
      console.error(t("deleteFailed"), error);
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

  const handleDistrictsUpdated = () => {
    loadDistricts();
    onToast(t("districtsUpdated"), "success");
  };

  const transformedManagers = districtManagers.map(manager => ({
    ...manager,
    email: manager.email || manager.username,
    phone: manager.phoneNumber || manager.phone,
    districtName: manager.districtName || manager.district?.name,
    stateName: manager.stateName || manager.district?.state?.name
  }));

  return (
    <div className="sa-content">
      <div className="sa-table-header">
        <div className="sa-table-name">👥 {t("districtManagersTitle")}</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="sa-btn sa-btn-secondary" onClick={handleManageDistricts}>
            📍 {t("manageDistricts")}
          </button>
          <button className="sa-btn sa-btn-primary" onClick={handleAdd}>
            + {t("addDistrictManager")}
          </button>
        </div>
      </div>

      <div className="table-wrap sa-card">
        {loading ? (
          // Show skeleton loader inside table-wrap, below header
          <TableSkeleton rows={6} columns={8} />
        ) : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("name")}</th>
                <th>{t("emailUsername")}</th>
                <th>{t("phone")}</th>
                <th>{t("district")}</th>
                <th>{t("state")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {transformedManagers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">{t("noDistrictManagersFound")}</td>
                </tr>
              ) : (
                transformedManagers.map((manager, index) => (
                  <tr key={manager.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{manager.name}</strong>
                    </td>
                    <td>
                      {manager.email || manager.username || "-"}
                    </td>
                    <td>
                      {manager.phoneNumber || manager.phone || "-"}
                    </td>
                    <td>
                      <span className="sa-badge sa-badge-info">
                        {manager.districtName || manager.district?.name || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="sa-badge sa-badge-primary">
                        {manager.stateName || manager.state?.name || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`sa-status ${manager.active ? 'active' : 'inactive'}`}>
                        {manager.active ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td>
                      <div className="sa-td-actions">
                        <EditAndViewButton
                          icon="✏️"
                          toolTipTitle={t("editDistrictManager")}
                          onClick={() => handleEdit(manager)}
                        />
                        <DeleteButton
                          objectId={manager.id}
                          objectName={manager.name}
                          onDelete={handleDelete}
                          title="Delete"
                          itemType="District Manager"
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
        <DistrictManagerFormModal
          manager={editingManager}
          districts={districts}
          onClose={handleModalClose}
          onSaved={handleSaved}
          refreshDistricts={loadDistricts}
        />
      )}

      {showDistrictManagement && (
        <DistrictManagementModal
          onClose={() => setShowDistrictManagement(false)}
          onDistrictsUpdated={handleDistrictsUpdated}
          states={states}
        />
      )}
    </div>
  );
}
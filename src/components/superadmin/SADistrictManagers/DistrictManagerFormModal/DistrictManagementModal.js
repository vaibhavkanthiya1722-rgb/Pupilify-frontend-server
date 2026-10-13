// src/components/superadmin/Dashboard/SADistrictManagers/DistrictManagementModal.js

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SAModal from "../../commonFile/SAModal";
import SuperAdminService from "../../../../services/SuperAdminService";
import EditAndViewButton from "../../../common/EditAndViewButton";
import DeleteButton from "../../../common/DeleteButton";
import TableSkeleton from "../../../loaders/TableSkeleton";

export default function DistrictManagementModal({ onClose, onDistrictsUpdated, states }) {
  const { t } = useTranslation(); 
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "", stateId: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDistricts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await SuperAdminService.getAllDistricts();
      const data = response?.data || response;
      setDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load districts:", error);
      setError(t("failedToLoadDistricts"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDistricts();
  }, [loadDistricts]);

  const handleAddDistrict = async () => {
    if (!formData.name.trim()) {
      setError(t("districtNameRequired"));
      return;
    }
    if (!formData.code.trim()) {
      setError(t("districtCodeRequired"));
      return;
    }
    if (!formData.stateId) {
      setError(t("selectStateRequired"));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await SuperAdminService.createDistrict({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        state: { id: parseInt(formData.stateId) }
      });

      await loadDistricts();
      setShowAddForm(false);
      setFormData({ name: "", code: "", stateId: "" });
      setSuccess(t("districtAddedSuccess"));

      if (onDistrictsUpdated) onDistrictsUpdated();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t("failedToCreateDistrict");
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDistrict = async () => {
    if (!formData.name.trim()) {
      setError(t("districtNameRequired"));
      return;
    }
    if (!formData.code.trim()) {
      setError(t("districtCodeRequired"));
      return;
    }
    if (!formData.stateId) {
      setError(t("selectStateRequired"));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await SuperAdminService.updateDistrict(editingDistrict.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        state: { id: parseInt(formData.stateId) }
      });

      await loadDistricts();
      setEditingDistrict(null);
      setShowAddForm(false);
      setFormData({ name: "", code: "", stateId: "" });
      setSuccess(t("districtUpdatedSuccess"));

      if (onDistrictsUpdated) onDistrictsUpdated();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t("failedToUpdateDistrict");
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDistrict = async (districtId) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const deletedDistrict = districts.find(d => d.id === districtId);
      await SuperAdminService.deleteDistrict(districtId);
      await loadDistricts();
      setSuccess(t("districtDeleteSuccess", { districtName: deletedDistrict?.name }));

      if (onDistrictsUpdated) onDistrictsUpdated();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t("failedToDeleteDistrict");
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (district) => {
    setEditingDistrict(district);
    setFormData({
      name: district.name,
      code: district.code,
      stateId: district.state?.id || ""
    });
    setShowAddForm(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingDistrict(null);
    setFormData({ name: "", code: "", stateId: "" });
    setError("");
    setSuccess("");
  };

  return (
    <SAModal
      title={`📍 ${t("manageDistricts")}`}
      onClose={onClose}
      width="800px"
    >
      {success && (
        <div style={{
          color: "#28a745",
          padding: "10px",
          backgroundColor: "#d4edda",
          borderRadius: "4px",
          marginBottom: "15px",
          fontSize: "14px"
        }}>
          ✅ {success}
        </div>
      )}

      {error && (
        <div style={{
          color: "#dc3545",
          padding: "10px",
          backgroundColor: "#f8d7da",
          borderRadius: "4px",
          marginBottom: "15px",
          fontSize: "14px"
        }}>
          ❌ {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-10">
          <h4 style={{ margin: "0 0 15px 0" }}>
            {editingDistrict ? `✏️ ${t("editDistrict")}` : `➕ ${t("addDistrictTitle")}`}
          </h4>
          <div className="sa-form-row">
            <div className="sa-form-field">
              <label>{t("districtName")} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bhopal"
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="sa-form-field">
              <label>{t("districtCode")} *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., BPL"
                disabled={loading}
                maxLength="10"
              />
            </div>
          </div>
          <div className="sa-form-field">
            <label>{t("state")} *</label>
            <select
              value={formData.stateId}
              onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
              disabled={loading}
            >
              <option value="">{t("selectState")}</option>
              {states && states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "15px" }}>
            <button className="sa-btn sa-btn-ghost" onClick={handleCancel} disabled={loading}>
              {t("cancel")}
            </button>
            <button
              className="sa-btn sa-btn-primary"
              onClick={editingDistrict ? handleUpdateDistrict : handleAddDistrict}
              disabled={loading}
            >
              {loading ? t("saving") : (editingDistrict ? t("updateDistrict") : t("addDistrict"))}
            </button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <div style={{ marginBottom: "15px", textAlign: "right" }}>
          <button
            className="sa-btn sa-btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            + {t("addNewDistrict")}
          </button>
        </div>
      )}

      <div className="table-wrap sa-card">
        {loading && districts.length === 0 ? (
          // Show skeleton loader in place of table, header remains visible
          <TableSkeleton rows={5} columns={5} />
        ) : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>{t("serialNumber")}</th>
                <th>{t("districtName")}</th>
                <th>{t("districtCode")}</th>
                <th>{t("state")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {districts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">{t("noDistrictsFound")}</td>
                </tr>
              ) : (
                districts.map((district, index) => (
                  <tr key={district.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{district.name}</strong>
                    </td>
                    <td>
                      <span className="sa-badge">{district.code || "-"}</span>
                    </td>
                    <td>{district.state?.name || "-"}</td>
                    <td className="sa-td-actions">
                      <EditAndViewButton
                        icon="✏️"
                        toolTipTitle={t("editDistrict")}
                        onClick={() => handleEditClick(district)}
                      />
                      <DeleteButton
                        objectId={district.id}
                        objectName={district.name}
                        onDelete={handleDeleteDistrict}
                        title="Delete"
                        itemType="District"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </SAModal>
  );
}
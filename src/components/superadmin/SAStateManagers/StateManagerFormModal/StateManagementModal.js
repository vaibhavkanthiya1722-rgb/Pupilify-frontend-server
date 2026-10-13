// src/components/superadmin/Dashboard/SAStateManagers/StateManagementModal.js

import React, { useState, useEffect, useCallback } from "react";
import SAModal from "../../commonFile/SAModal";
import SuperAdminService from "../../../../services/SuperAdminService";
import EditAndViewButton from "../../../common/EditAndViewButton";
import DeleteButton from "../../../common/DeleteButton";
import TableSkeleton from "../../../loaders/TableSkeleton"; // Import TableSkeleton
import { useTranslation } from 'react-i18next';

export default function StateManagementModal({ onClose, onStatesUpdated }) {
  const [states, setStates] = useState([]);
  const { t } = useTranslation(); 
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await SuperAdminService.getAllStates();
      const data = response?.data || response;
      setStates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load states:", error);
      setError(t('failedToLoadStates') || "Failed to load states");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  const handleAddState = async () => {
    if (!formData.name.trim()) {
      setError(t('stateNameRequired') || "State name is required");
      return;
    }
    if (!formData.code.trim()) {
      setError(t('stateCodeRequired') || "State code is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await SuperAdminService.createState({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase()
      });
      
      await loadStates();
      setShowAddForm(false);
      setFormData({ name: "", code: "" });
      setSuccess(t('stateAddedSuccess') || "State added successfully!");
      
      if (onStatesUpdated) onStatesUpdated();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create state";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateState = async () => {
    if (!formData.name.trim()) {
      setError("State name is required");
      return;
    }
    if (!formData.code.trim()) {
      setError("State code is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await SuperAdminService.updateState(editingState.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase()
      });
      
      await loadStates();
      setEditingState(null);
      setShowAddForm(false);
      setFormData({ name: "", code: "" });
      setSuccess(t('stateUpdatedSuccess') || "State updated successfully!");
      
      if (onStatesUpdated) onStatesUpdated();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update state";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteState = async (stateId) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const deletedState = states.find(s => s.id === stateId);
      await SuperAdminService.deleteState(stateId);
      await loadStates();
      setSuccess(t('stateDeletedSuccess', { stateName: deletedState?.name }) || `State "${deletedState?.name}" deleted successfully!`);
      
      if (onStatesUpdated) onStatesUpdated();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete state";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (state) => {
    setEditingState(state);
    setFormData({ name: state.name, code: state.code });
    setShowAddForm(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingState(null);
    setFormData({ name: "", code: "" });
    setError("");
    setSuccess("");
  };

  return (
    <SAModal
      title={`🏛️ ${t('manageStates') || 'Manage States'}`}
      onClose={onClose}
      width="800px"
    >
      {success && (
        <div className="state-toast state-toast-success">
          ✅ {success}
        </div>
      )}
      
      {error && (
        <div className="state-toast state-toast-error">
          ❌ {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-10">
          <h4 style={{ margin: "0 0 15px 0" }}>
            {editingState
              ? `✏️ ${t('editState') || 'Edit State'}`
              : `➕ ${t('addNewState') || 'Add New State'}`
            }
          </h4>
          <div className="sa-form-row">
            <div className="sa-form-field">
              <label>{t('stateName') || 'State Name'} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('stateNamePlaceholder') || 'e.g., Madhya Pradesh'}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="sa-form-field">
              <label>{t('stateCode') || 'State Code'} *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder={t('stateCodePlaceholder') || 'e.g., MP'}
                disabled={loading}
                maxLength="10"
              />
              <small>{t('stateCodeHelp') || 'Short code (e.g., MH, UP, MP)'}</small>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="sa-btn sa-btn-ghost" onClick={handleCancel} disabled={loading}>
              {t('cancel') || 'Cancel'}
            </button>
            <button 
              className="sa-btn sa-btn-primary" 
              onClick={editingState ? handleUpdateState : handleAddState}
              disabled={loading}
            >
              {loading
                ? (t('saving') || 'Saving...')
                : (editingState
                  ? (t('updateState') || 'Update State')
                  : (t('addState') || 'Add State'))
              }
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
            + {t('addNewState') || 'Add New State'}
          </button>
        </div>
      )}

      <div className="table-wrap sa-card">
        {loading && states.length === 0 ? (
          
          <TableSkeleton rows={5} columns={4} />
        ) : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>{t('serialNumber') || 'S.No.'}</th>
                <th>{t('stateName') || 'State Name'}</th>
                <th>{t('stateCode') || 'State Code'}</th>
                <th>{t('actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {states.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    {t('noStatesFoundStates') || 'No states found. Click "Add New State" to create one.'}
                  </td>
                </tr>
              ) : (
                states.map((state, index) => (
                  <tr key={state.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{state.name}</strong>
                    </td>
                    <td>
                      <span className="sa-badge">{state.code || "-"}</span>
                    </td>
                    <td>
                      <div className="sa-td-actions">
                        <EditAndViewButton
                          icon="✏️"
                          toolTipTitle={t('editState') || 'Edit State'}
                          onClick={() => handleEditClick(state)}
                        />
                        <DeleteButton
                          objectId={state.id}
                          objectName={state.name}
                          onDelete={handleDeleteState}
                          title="Delete"
                          itemType="State"
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
    </SAModal>
  );
}
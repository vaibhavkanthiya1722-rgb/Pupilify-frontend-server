// src/components/superadmin/Dashboard/SAStateManagers/SAStateManagersController.js

import { useState, useEffect, useCallback } from "react";
import SuperAdminService from "../../../services/SuperAdminService";

export default function SAStateManagersController(onToast) {
  const [stateManagers, setStateManagers] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadStateManagers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await SuperAdminService.getAllStateManagers();
      let data = response?.data || response;
      
      // Transform data to include email field if needed
      if (Array.isArray(data)) {
        data = data.map(manager => ({
          ...manager,
          // If email doesn't exist, use username as email
          email: manager.email || manager.username,
          // Ensure phone field exists
          phone: manager.phoneNumber || manager.phone,
          // Ensure state object for display
          state: manager.state || { name: manager.stateName }
        }));
      }

      setStateManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load state managers:", error);
      if (onToast) onToast("Failed to load state managers", "error");
      setStateManagers([]);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  const loadStates = useCallback(async () => {
    try {
      const response = await SuperAdminService.getAllStates();
      const data = response?.data || response;
      setStates(Array.isArray(data) ? data : []);
      return data;
    } catch (error) {
      console.error("Failed to load states", error);
      setStates([]);
      return [];
    }
  }, []);

  const createStateManager = async (data) => {
    setLoading(true);
    try {
      const response = await SuperAdminService.createStateManager(data);
      if (onToast) onToast("State manager created successfully", "success");
      await loadStateManagers();
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to create state manager";
      if (onToast) onToast(message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStateManager = async (id, data) => {
    setLoading(true);
    try {
      const response = await SuperAdminService.updateStateManager(id, data);
      if (onToast) onToast("State manager updated successfully", "success");
      await loadStateManagers();
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to update state manager";
      if (onToast) onToast(message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteStateManager = async (id) => {
    setLoading(true);
    try {
      await SuperAdminService.deleteStateManager(id);
      if (onToast) onToast("State manager deleted successfully", "success");
      await loadStateManagers();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to delete state manager";
      if (onToast) onToast(message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStateManagers();
    loadStates();
  }, [loadStateManagers, loadStates]);

  return {
    stateManagers,
    states,
    loading,
    createStateManager,
    updateStateManager,
    deleteStateManager,
    loadStateManagers,
    loadStates,
    reload: loadStateManagers
  };
}
// src/components/superadmin/Dashboard/SADistrictManagers/SADistrictManagersController.js

import { useState, useEffect, useCallback } from "react";
import SuperAdminService from "../../../services/SuperAdminService";

export default function SADistrictManagersController(onToast) {
  const [districtManagers, setDistrictManagers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDistrictManagers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await SuperAdminService.getAllDistrictManagers();
      let data = response?.data || response;
      
      // Transform data to include email and phone fields
      if (Array.isArray(data)) {
        data = data.map(manager => ({
          ...manager,
          email: manager.email || manager.username,
          phone: manager.phoneNumber || manager.phone,
          districtName: manager.districtName || manager.district?.name,
          stateName: manager.stateName || manager.district?.state?.name,
          // For backward compatibility
          district: manager.district || { 
            id: manager.districtId, 
            name: manager.districtName,
            state: { name: manager.stateName, id: manager.stateId }
          },
          state: manager.state || { 
            id: manager.stateId, 
            name: manager.stateName 
          }
        }));
      }
      
      setDistrictManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load district managers:", error);
      if (onToast) onToast("Failed to load district managers", "error");
      setDistrictManagers([]);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  const loadDistricts = useCallback(async () => {
    try {
   
      const response = await SuperAdminService.getAllDistricts();
      const data = response?.data || response;
      setDistricts(Array.isArray(data) ? data : []);
      return data;
    } catch (error) {
      console.error("Failed to load districts", error);
      setDistricts([]);
      return [];
    }
  }, []);

  const loadStates = useCallback(async () => {
    try {
      const response = await SuperAdminService.getAllStates();
      const data = response?.data || response;
      setStates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load states", error);
      setStates([]);
    }
  }, []);

  const createDistrictManager = async (data) => {
    setLoading(true);
    try {
      const response = await SuperAdminService.createDistrictManager(data);
      if (onToast) onToast("District manager created successfully", "success");
      await loadDistrictManagers();
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to create district manager";
      if (onToast) onToast(message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDistrictManager = async (id, data) => {
    setLoading(true);
    try {
      const response = await SuperAdminService.updateDistrictManager(id, data);
      if (onToast) onToast("District manager updated successfully", "success");
      await loadDistrictManagers();
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to update district manager";
      if (onToast) onToast(message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDistrictManager = async (id) => {
    setLoading(true);
    try {
      await SuperAdminService.deleteDistrictManager(id);
      if (onToast) onToast("District manager deleted successfully", "success");
      await loadDistrictManagers();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to delete district manager";
      if (onToast) onToast(message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createDistrict = async (districtData) => {
    try {
      const response = await SuperAdminService.createDistrict(districtData);
      const newDistrict = response?.data || response;
      if (onToast) onToast("District created successfully", "success");
      await loadDistricts();
      return newDistrict;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to create district";
      if (onToast) onToast(message, "error");
      throw error;
    }
  };

  useEffect(() => {
    loadDistrictManagers();
    loadDistricts();
    loadStates();
  }, [loadDistrictManagers, loadDistricts, loadStates]);

  return {
    districtManagers,
    districts,
    states,
    loading,
    createDistrictManager,
    updateDistrictManager,
    deleteDistrictManager,
    loadDistrictManagers,
    loadDistricts,
    createDistrict,
    reload: loadDistrictManagers
  };
}
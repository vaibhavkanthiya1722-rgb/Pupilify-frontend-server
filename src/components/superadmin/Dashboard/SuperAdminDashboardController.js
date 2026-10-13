import { useState, useEffect, useCallback } from "react";
import SuperAdminService from "../../../services/SuperAdminService";

export default function SuperAdminDashboardController() {

  const [section, setSection] = useState("overview");
  const [schools, setSchools] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const loadSchools = useCallback(async () => {
    try {
      setLoading(true);

      const data = await SuperAdminService.getAllSchools();

      setSchools(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("School load error:", error);
      showToast("Failed to load schools", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  return {
    section,
    setSection,
    schools,
    loading,
    toast,
    setToast,
    loadSchools,
    showToast
  };
}
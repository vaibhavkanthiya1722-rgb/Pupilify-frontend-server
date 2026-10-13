import { useState } from "react";
import SuperAdminService from "../../../../services/SuperAdminService";

export default function AcademicYearController(school, token, onClose, onSaved) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const handleClose = () => {
    onClose();   // modal close karega
  };

  const handleCreateYear = async () => {

    if (!academicYear.trim()) {
      alert("Please enter academic year (e.g., 2025-26)");
      return;
    }

    setLoading(true);
    setError("");

    try {

      // Removed unused 'data' variable
      await SuperAdminService.initializeAcademicYear(
        school.id,
        academicYear
      );

      onSaved(`Academic year ${academicYear} added to ${school.schoolName}`);

    } catch (err) {

      console.error("API ERROR:", err);
      setError(err?.response?.data?.message || err.message);

    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    academicYear,
    setAcademicYear,
    handleCreateYear,
    handleClose   
  };
}
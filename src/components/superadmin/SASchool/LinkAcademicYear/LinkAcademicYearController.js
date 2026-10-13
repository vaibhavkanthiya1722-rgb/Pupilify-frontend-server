import { useState } from "react";
import SuperAdminService from "../../../../services/SuperAdminService";

export default function LinkAcademicYearController(
  school,
  onClose,
  onSaved
) {

  const [manualYear, setManualYear] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);

  const existingYear = school?.currentYear;

  const handleLinkYear = async () => {

    setLoading(true);
    setError("");

    try {

      if (useManual) {

        if (!manualYear.trim()) {
          setError("Please enter academic year");
          setLoading(false);
          return;
        }

        // Validate year format (e.g., 2025-26)
        const yearPattern = /^\d{4}-\d{2,4}$/;
        if (!yearPattern.test(manualYear.trim())) {
          setError("Please enter year in format: YYYY-YY (e.g., 2025-26)");
          setLoading(false);
          return;
        }

        // Check if user confirmed the change
        if (!confirmChecked) {
          setError("Please confirm that you understand this action will delete all data for the current academic year");
          setLoading(false);
          return;
        }

        // ✅ FIX: Use changeAcademicYear method for manual year
        const response = await SuperAdminService.changeAcademicYear(
          school.id,
          manualYear.trim(),
          1 // adminUserId - you can change this if needed
        );

        // ✅ Handle response properly
        const message = response?.data?.message || 
                       response?.message || 
                       `📅 Academic year changed to "${manualYear}" successfully!`;
        
        onSaved(message);

      } else {

        if (!existingYear?.id) {
          setError("No existing academic year found");
          setLoading(false);
          return;
        }

        // ✅ Use linkAcademicYear for existing year
        const response = await SuperAdminService.linkAcademicYear(
          school.id,
          existingYear.id
        );

        const message = response?.data?.message || 
                       response?.message || 
                       "📅 Academic year linked successfully!";
        
        onSaved(message);
      }

      onClose();

    } catch (err) {

      console.error("API Error:", err);

      let errorMessage = "Something went wrong";
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return {
    manualYear,
    setManualYear,
    useManual,
    setUseManual,
    loading,
    error,
    existingYear,
    confirmChecked,
    setConfirmChecked,
    handleLinkYear
  };
}
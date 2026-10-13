import { useState } from "react";
import SuperAdminService from "../../../../services/SuperAdminService";

export default function SASchoolsController(onRefresh, onToast) {

  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [academicYearModal, setAcademicYearModal] = useState(null);
  const [linkYearModal, setLinkYearModal] = useState(null);
  const [selectedSchoolForYear, setSelectedSchoolForYear] = useState(null);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  const deleteSchool = async (id) => {
    try {

      await SuperAdminService.deleteSchool(id);

      onToast("🗑️ School deleted successfully!", "success");
      onRefresh();

    } catch (error) {

      onToast(
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
        "error"
      );
    }
  };

  const handleSaved = (msg) => {

    setEditModal(null);
    setAcademicYearModal(null);
    setLinkYearModal(null);
    setSelectedSchoolForYear(null);
    setShowSchoolDropdown(false);

    onToast(msg, "success");
    onRefresh();
  };

  const handleAddAcademicYearClick = () => {
    setShowSchoolDropdown(!showSchoolDropdown);
  };

  const handleSelectSchoolForYear = (school) => {
    setSelectedSchoolForYear(school);
    setAcademicYearModal(school);
    setShowSchoolDropdown(false);
  };

  const handleLinkAcademicYear = (school) => {
    setSelectedSchoolForYear(school);
    setLinkYearModal(school);
  };

  return {
    search,
    setSearch,
    editModal,
    setEditModal,
    detailModal,
    setDetailModal,
    academicYearModal,
    setAcademicYearModal,
    linkYearModal,
    setLinkYearModal,
    selectedSchoolForYear,
    setSelectedSchoolForYear,
    showSchoolDropdown,
    setShowSchoolDropdown,
    deleteSchool,
    handleSaved,
    handleAddAcademicYearClick,
    handleSelectSchoolForYear,
    handleLinkAcademicYear
  };
}
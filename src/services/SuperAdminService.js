// src/services/SuperAdminService.js

import API from "../libs/api";

const SuperAdminService = {

  // ==================== ACADEMIC YEAR METHODS ====================
  initializeAcademicYear(schoolId, academicYear, adminUserId = 1) {
    return API.post(
      `/api/superadmin/academic-year/initialize/${schoolId}?currentYear=${academicYear}&adminUserId=${adminUserId}`
    );
  },

  createAcademicYear: async (manualYear) => {
    return await API.post("/api/superadmin/academic-years/create", {
      currentYear: manualYear,
      status: "ACTIVE"
    });
  },

  changeAcademicYear: async (schoolId, newYear, adminUserId = 1) => {
    return await API.post(`/api/superadmin/academic-year/change/${schoolId}`, {
      newYear: newYear,
      confirmDelete: "CONFIRM",
      adminUserId: adminUserId
    });
  },

  linkAcademicYear: async (schoolId, academicYearId) => {
    return await API.put(`/api/superadmin/schools/update-academic-year/${schoolId}?academicYearId=${academicYearId}`);
  },
  
  // ==================== SCHOOL METHODS ====================
  deleteSchool: async (schoolId) => {
    return await API.delete(`/api/superadmin/schools/delete/${schoolId}`);
  },

  getStudents: async (schoolId, academicYearId) => {
    return API.get(`/api/admin/students/school/${schoolId}?academicYearId=${academicYearId}`);
  },

  getTeachers: (schoolId) => {
    return API.get(`/api/admin/teachers/school/${schoolId}`);
  },

  getClasses: (schoolId) => {
    return API.get(`/api/admin/classes/school/${schoolId}`);
  },

  getSections: (schoolId) => {
    return API.get(`/api/admin/classes/sections/school/${schoolId}`);
  },

  deleteStudent: (id) => {
    return API.delete(`/api/admin/students/delete/${id}`);
  },

  deleteTeacher: (id) => {
    return API.delete(`/api/admin/teachers/delete/${id}`);
  },

  addSchool: async (formData) => {
    return API.postFormData("/api/superadmin/schools/add", formData);
  },

  updateSchool: async (id, formData) => {
    return API.putFormData(`/api/superadmin/schools/update/${id}`, formData);
  },
  
  getAllSchools: async () => {
    return API.get("/api/superadmin/schools/all");
  },

  // ==================== STATE METHODS ====================
  getAllStates: async () => {
    return API.get("/api/superadmin/state/all");
  },

  getStateById: async (id) => {
    return API.get(`/api/superadmin/state/${id}`);
  },

  createState: async (data) => {
    return API.post("/api/superadmin/state/create", data);
  },

  updateState: async (id, data) => {
    return API.put(`/api/superadmin/state/update/${id}`, data);
  },

  deleteState: async (id) => {
    return API.delete(`/api/superadmin/state/delete/${id}`);
  },

  // ==================== DISTRICT METHODS ====================
  getAllDistricts: async (stateId = null) => {
    const url = stateId ? `/api/district/all?stateId=${stateId}` : "/api/district/all";
    return API.get(url);
  },

  getDistrictById: async (id) => {
    return API.get(`/api/district/${id}`);
  },

  createDistrict: async (data) => {
    return API.post("/api/district/create", data);
  },

  updateDistrict: async (id, data) => {
    return API.put(`/api/district/update/${id}`, data);
  },

  deleteDistrict: async (id) => {
    return API.delete(`/api/district/delete/${id}`);
  },

  // ==================== SCHOOL ASSIGNMENT METHODS ====================
  assignStateToSchool: async (schoolId, stateId) => {
    return API.put(`/api/superadmin/schools/${schoolId}/assign-state/${stateId}`);
  },

  assignDistrictToSchool: async (schoolId, districtId) => {
    return API.put(`/api/superadmin/schools/${schoolId}/assign-district/${districtId}`);
  },

  getSchoolsByState: async (stateId) => {
    return API.get(`/api/superadmin/schools/by-state/${stateId}`);
  },

  getSchoolsByDistrict: async (districtId) => {
    return API.get(`/api/superadmin/schools/by-district/${districtId}`);
  },

  // ==================== STATE MANAGER METHODS ====================
  getAllStateManagers: async () => {
    return API.get("/api/superadmin/state-managers/all");
  },

  getStateManagerById: async (id) => {
    return API.get(`/api/superadmin/state-managers/${id}`);
  },

  createStateManager: async (data) => {
    return API.post("/api/superadmin/state-managers/create", data);
  },

  updateStateManager: async (id, data) => {
    return API.put(`/api/superadmin/state-managers/update/${id}`, data);
  },

  deleteStateManager: async (id) => {
    return API.delete(`/api/superadmin/state-managers/delete/${id}`);
  },

  // ==================== DISTRICT MANAGER METHODS ====================
  getAllDistrictManagers: async () => {
    return API.get("/api/superadmin/district-managers/all");
  },

  getDistrictManagerById: async (id) => {
    return API.get(`/api/superadmin/district-managers/${id}`);
  },

  createDistrictManager: async (data) => {
    return API.post("/api/superadmin/district-managers/create", data);
  },

  updateDistrictManager: async (id, data) => {
    return API.put(`/api/superadmin/district-managers/update/${id}`, data);
  },

  deleteDistrictManager: async (id) => {
    return API.delete(`/api/superadmin/district-managers/delete/${id}`);
  },
};

export default SuperAdminService;
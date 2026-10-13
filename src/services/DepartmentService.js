import API from "../libs/api";

const DepartmentService = {
  // ========== DEPARTMENT CRUD ==========
  async getDepartments(schoolId) {
    try {
      const res = await API.get(`/api/departments/school/${schoolId}`);
      return Array.isArray(res) ? res : res.data;
    } catch (err) {
      console.error("getDepartments error:", err);
      throw err;
    }
  },

  async createDepartment(data) {
    try {
      const res = await API.post(`/api/departments/create`, data);
      return res.data;
    } catch (err) {
      console.error("createDepartment error:", err.response?.data || err.message);
      throw err;
    }
  },

  async deleteDepartment(id) {
    try {
      const res = await API.delete(`/api/departments/${id}`);
      return res.data;
    } catch (err) {
      console.error("deleteDepartment error:", err);
      throw err;
    }
  },

  // ========== DEPARTMENT HEAD ==========
  async assignHead(deptId, userId) {
    try {
      const payload = { user: { id: userId } };
      const res = await API.post(`/api/departments/${deptId}/assign-head`, payload);
      return res.data;
    } catch (err) {
      console.error("assignHead error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to assign head";
      throw new Error(errorMsg);
    }
  },

  async getHead(deptId) {
    try {
      const res = await API.get(`/api/departments/${deptId}/head`);
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      console.error("getHead error:", err);
      throw err;
    }
  },

  async removeHead(deptId) {
    try {
      const res = await API.delete(`/api/departments/${deptId}/head`);
      return res.data;
    } catch (err) {
      console.error("removeHead error:", err);
      throw err;
    }
  },

  // ========== PERMISSIONS ==========
  async getPermissions(deptId) {
    try {
      // ✅ Use /permissions (not /permissions/active) to get all permissions
      const res = await API.get(`/api/departments/${deptId}/permissions`);
      
      // Handle different response structures
      if (res && Array.isArray(res)) {
        return res;
      }
      if (res && res.data && Array.isArray(res.data)) {
        return res.data;
      }
      if (res && res.permissions && Array.isArray(res.permissions)) {
        return res.permissions;
      }
      return [];
    } catch (err) {
      console.error("getPermissions error:", err);
      throw err;
    }
  },

  async addPermission(deptId, permissionData) {
    try {
      const res = await API.post(`/api/departments/${deptId}/permissions`, permissionData);
      return res.data;
    } catch (err) {
      console.error("addPermission error:", err);
      throw err;
    }
  },

  async updatePermission(permId, permissionData) {
    try {
      const res = await API.put(`/api/departments/permissions/${permId}`, permissionData);
      return res.data;
    } catch (err) {
      console.error("updatePermission error:", err);
      throw err;
    }
  },

  async deletePermission(permId) {
    try {
      const res = await API.delete(`/api/departments/permissions/${permId}`);
      return res.data;
    } catch (err) {
      console.error("deletePermission error:", err);
      throw err;
    }
  }
};

export default DepartmentService;
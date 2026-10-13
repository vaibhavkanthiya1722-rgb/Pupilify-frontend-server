import API from "../libs/api";

const AuthService = {

  // =========================
  // ADMIN LOGIN
  // =========================
  async login(data) {

    const res = await API.post(`/api/auth/login`, data);

    const response = res.data || res;

    if (response.token) {

      localStorage.setItem("ss_token", response.token);

      localStorage.setItem(
        "ss_role",
        response.role || "ROLE_ADMIN"
      );

      localStorage.setItem(
        "ss_user",
        JSON.stringify(response)
      );
      
      // ✅ IMPORTANT: Store tenant_id from response or token
      if (response.tenantId) {
        localStorage.setItem("ss_tenant_id", response.tenantId);
      } else {
        // Extract from token
        try {
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          if (payload.tenantId) {
            localStorage.setItem("ss_tenant_id", payload.tenantId);
          }
        } catch(e) {}
      }
    }

    return response;
  },

  // =========================
  // MANAGER LOGIN
  // =========================
  async managerLogin(data) {

    const res = await API.post(
      `/api/auth/manager-login`,
      data
    );

    const response = res.data || res;

    if (response.token) {

      localStorage.setItem("ss_token", response.token);

      localStorage.setItem(
        "ss_role",
        response.role
      );

      localStorage.setItem(
        "ss_user",
        JSON.stringify(response)
      );
      
      // ✅ Store tenant_id
      if (response.tenantId) {
        localStorage.setItem("ss_tenant_id", response.tenantId);
      } else {
        try {
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          if (payload.tenantId) {
            localStorage.setItem("ss_tenant_id", payload.tenantId);
          }
        } catch(e) {}
      }
    }

    return response;
  },

  // =========================
  // DEPARTMENT LOGIN
  // =========================
  async departmentLogin(data) {
    try {
      const res = await API.post(`/api/department-login/login`, data);
      const response = res.data || res;

      if (response.token) {
        // Store token first
        localStorage.setItem("ss_token", response.token);
        localStorage.setItem("ss_role", "ROLE_DEPARTMENT");
        localStorage.setItem("ss_user_type", "department");

        // Store department info
        if (response.department) {
          localStorage.setItem("ss_dept_id", response.department.id);
          localStorage.setItem("ss_dept_type", response.department.type || "ACCOUNTS");
          localStorage.setItem("ss_dept_name", response.department.name);
          localStorage.setItem("ss_school_id", response.department.schoolId);
        }

        // Store permissions
        if (response.permissions && Array.isArray(response.permissions)) {
          localStorage.setItem("ss_dept_permissions", JSON.stringify(response.permissions));
          localStorage.setItem("ss_permissions", JSON.stringify(response.permissions));
        }

        // Store academic year
        if (response.academicYear) {
          const yearValue = response.academicYear.year || response.academicYear;
          const yearId = response.academicYear.id;
          localStorage.setItem("ss_academic_year", yearValue);
          localStorage.setItem("ss_academic_year_id", yearId);
        }
        
        // ✅ Store tenant_id
        if (response.tenantId) {
          localStorage.setItem("ss_tenant_id", response.tenantId);
        } else {
          try {
            const payload = JSON.parse(atob(response.token.split('.')[1]));
            if (payload.tenantId) {
              localStorage.setItem("ss_tenant_id", payload.tenantId);
            }
          } catch(e) {}
        }

        // Create user object for state
        const departmentUser = {
          token: response.token,
          role: "ROLE_DEPARTMENT",
          loginType: "department",
          id: response.user?.id,
          username: response.user?.username,
          departmentId: response.department?.id,
          departmentType: response.department?.type || "ACCOUNTS",
          departmentName: response.department?.name,
          schoolId: response.department?.schoolId,
          academicYear: localStorage.getItem("ss_academic_year"),
          academicYearId: localStorage.getItem("ss_academic_year_id"),
          permissions: response.permissions || []
        };

        localStorage.setItem("ss_user", JSON.stringify(departmentUser));
      }

      return response;
    } catch (error) {
      console.error('❌ Department login error:', error);
      throw error;
    }
  },

  // =========================
  // AUTO LOGIN
  // =========================
  async autoLogin(credentials) {
    try {
      const deptRes = await this.departmentLogin(credentials);
      return {
        ...deptRes,
        role: "ROLE_DEPARTMENT",
        loginType: "department"
      };
    } catch (deptErr) {
      try {
        const adminRes = await this.login(credentials);
        return {
          ...adminRes,
          loginType: "admin"
        };
      } catch (adminErr) {
        try {
          const managerRes = await this.managerLogin(credentials);
          return {
            ...managerRes,
            loginType: "manager"
          };
        } catch (managerErr) {
          throw new Error("Invalid username or password");
        }
      }
    }
  },

  // =========================
  // FORGOT PASSWORD
  // =========================
  forgotPassword(email) {
    return API.post(
      `/api/auth/forgot-password?email=${encodeURIComponent(email)}`
    );
  },

  // =========================
  // RESET PASSWORD
  // =========================
  resetPassword(data) {
    return API.put(
      `/api/auth/reset-password`,
      data
    );
  },

  // =========================
  // LOGOUT
  // =========================
  logout() {
    localStorage.removeItem("ss_token");
    localStorage.removeItem("ss_role");
    localStorage.removeItem("ss_user");
    localStorage.removeItem("ss_user_type");
    localStorage.removeItem("ss_dept_id");
    localStorage.removeItem("ss_dept_type");
    localStorage.removeItem("ss_school_id");
    localStorage.removeItem("ss_tenant_id"); // ✅ Remove tenant_id on logout
  }
};

export default AuthService;
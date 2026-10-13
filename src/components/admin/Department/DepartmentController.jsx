import { useEffect, useState, useCallback } from "react";
import DepartmentService from "../../../services/DepartmentService";

export default function DepartmentController({
  schoolId,
  onToast
}) {

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // All available permissions - COMPLETE LIST
  const [allPermissions] = useState([
 
    
    // Academics
    "CLASSES",
    "SUBJECTS",
    "MAPPING",
    "TIMETABLE",
    "EXAMS",
    "RESULTS",
    
    // People
    "TEACHERS",
    "STUDENTS",
    
    // Documents
    "IDCARDS",
    "STUDENT-IDCARDS",
    "TEACHER-IDCARDS",
    "TC",
    
    // Finance
    "FEES",
    "TALLY",
    
    
    // Transport
    "BUS",
    
    // Reports
    "ATTENDANCE"
  ]);

  const [departmentForm, setDepartmentForm] = useState({
    deptName: "",
    deptType: "ADMISSION",
    username: "",
    password: "",
    confirmPassword: ""  // Added confirm password
  });

  // ✅ FIXED: Wrap showToast in useCallback to prevent recreation on every render
  const showToast = useCallback((msg, type = "success") => {
    if (!onToast) return;
    onToast(msg, type);
  }, [onToast]);

  const loadDepartments = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await DepartmentService.getDepartments(schoolId);
      setDepartments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("loadDepartments error:", err);
      showToast("Error loading departments", "error");
    } finally {
      setLoading(false);
    }
  }, [schoolId, showToast]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const loadPermissions = useCallback(async (deptId) => {
    if (!deptId) return;
    
    try {
      setLoadingPermissions(true);
      const res = await DepartmentService.getPermissions(deptId);
      
      let perms = Array.isArray(res) ? res : [];
    
      setOriginalPermissions(perms);
      
      const permNames = perms.map(p => p.permissionName);
 
      setSelectedPermissions(permNames);
      
    } catch (err) {
      console.error("loadPermissions error:", err);
      setOriginalPermissions([]);
      setSelectedPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  }, []); // No dependencies needed as it doesn't use any external variables

  useEffect(() => {
    if (selectedDepartment?.id) {
      loadPermissions(selectedDepartment.id);
    } else {
      setOriginalPermissions([]);
      setSelectedPermissions([]);
    }
  }, [selectedDepartment, loadPermissions]);

  const handleDepartmentChange = (e) => {
    const { name, value } = e.target;
    setDepartmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createDepartment = async () => {
    // Validate required fields
    if (!departmentForm.deptName || !departmentForm.username || !departmentForm.password || !departmentForm.confirmPassword) {
      showToast("All fields are required", "error");
      return false;
    }
    
    // Check if passwords match
    if (departmentForm.password !== departmentForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return false;
    }

    try {
      const payload = {
        deptName: departmentForm.deptName,
        deptType: departmentForm.deptType,
        school: { id: schoolId },
        username: departmentForm.username,
        password: departmentForm.password
      };

      const response = await DepartmentService.createDepartment(payload);
      showToast(`Department created (${response?.login?.username})`, "success");

      setDepartmentForm({
        deptName: "",
        deptType: "ADMISSION",
        username: "",
        password: "",
        confirmPassword: ""
      });

      await loadDepartments();
      return true;
    } catch (err) {
      console.error("createDepartment error:", err);
      showToast(err?.response?.data?.error || "Create failed", "error");
      return false;
    }
  };

  const deleteDepartment = async (id) => {
    const confirmed = window.confirm("Delete this department?");
    if (!confirmed) return;

    try {
      await DepartmentService.deleteDepartment(id);
      showToast("Department deleted", "success");
      await loadDepartments();
      if (selectedDepartment?.id === id) {
        setSelectedDepartment(null);
      }
    } catch (err) {
      console.error("deleteDepartment error:", err);
      showToast(err?.response?.data?.error || "Delete failed", "error");
    }
  };

  const togglePermission = (permissionName) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionName)) {
        return prev.filter(p => p !== permissionName);
      } else {
        return [...prev, permissionName];
      }
    });
  };

  const savePermissions = async () => {
    if (!selectedDepartment?.id) {
      showToast("No department selected", "error");
      return;
    }
    
    try {
     
      const currentPermNames = originalPermissions.map(p => p.permissionName);
      
      const toAdd = selectedPermissions.filter(p => !currentPermNames.includes(p));
      
      const toRemove = originalPermissions.filter(p => {
        return !selectedPermissions.includes(p.permissionName);
      });
      
      for (const permName of toAdd) {
        await DepartmentService.addPermission(selectedDepartment.id, {
          permissionName: permName,
          isActive: true
        });
      }
      
      for (const perm of toRemove) {
        await DepartmentService.deletePermission(perm.id);
      }
      
      await loadPermissions(selectedDepartment.id);
      
      showToast("Permissions saved successfully", "success");
      
    } catch (err) {
      console.error("savePermissions error:", err);
      showToast(err?.response?.data?.error || "Save failed", "error");
    }
  };

  // Helper function to get permission category
  const getPermissionCategory = (permission) => {
    const categories = {
    
      'CLASSES': 'academics',
      'SUBJECTS': 'academics',
      'MAPPING': 'academics',
      'TIMETABLE': 'academics',
      'EXAMS': 'academics',
      'RESULTS': 'academics',
      'TEACHERS': 'people',
      'STUDENTS': 'people',
      'IDCARDS': 'documents',
      'STUDENT-IDCARDS': 'documents',
      'TEACHER-IDCARDS': 'documents',
      'TC': 'documents',
      'FEES': 'finance',
      'TALLY': 'finance',
      'BUS': 'transport',
      'ATTENDANCE': 'reports'
    };
    return categories[permission] || 'other';
  };

  return {
    departments,
    loading,
    loadingPermissions,
    selectedDepartment,
    setSelectedDepartment,
    selectedPermissions,
    allPermissions,
    departmentForm,
    handleDepartmentChange,
    createDepartment,
    deleteDepartment,
    togglePermission,
    savePermissions,
    getPermissionCategory // Export for use in UI
  };
}
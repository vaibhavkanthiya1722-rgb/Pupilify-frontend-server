// SchoolDetailController.js
import { useState, useEffect, useCallback } from "react";
import SuperAdminService from "../../../../services/SuperAdminService";

export default function SchoolDetailController(school, onToast) {
  // All hooks at the top
  const [tab, setTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ Added this line
  
  // State for confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    id: null,
    name: null
  });

  // SchoolDetailController.js me load function mein
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // ✅ Now setError is defined
      const academicYearId = school?.currentYear?.id;

      let stu = [], tea = [], cls = [], sec = [];

      // Students - with error handling
      try {
        stu = await SuperAdminService.getStudents(school.id, academicYearId);
        stu = Array.isArray(stu) ? stu : [];
      } catch (err) {
        console.error("Students load error:", err);
        // Agar 401 ignore ho gaya hai to warning show karo
        if (err.ignored) {
          console.warn("Auth error ignored for students");
        }
        stu = [];
      }

      // Teachers - with error handling  
      try {
        tea = await SuperAdminService.getTeachers(school.id);
        tea = Array.isArray(tea) ? tea : [];
        tea = tea.filter(teacher => teacher.active === true);
      } catch (err) {
        console.error("Teachers load error:", err);
        tea = [];
      }

      // Classes - with error handling
      try {
        cls = await SuperAdminService.getClasses(school.id);
        cls = Array.isArray(cls) ? cls : [];
      } catch (err) {
        console.error("Classes load error:", err);
        cls = [];
      }

      // Sections - with error handling
      try {
        sec = await SuperAdminService.getSections(school.id);
        sec = Array.isArray(sec) ? sec : [];
      } catch (err) {
        console.error("Sections load error:", err);
        // Agar 401 ignore ho gaya hai to warning show karo
        if (err.ignored) {
          console.warn("Auth error ignored for sections");
        }
        sec = [];
      }
      
      setStudents(stu);
      setTeachers(tea);
      setClasses(cls);
      setSections(sec);

    } catch (error) {
      console.error("Load error:", error);
      setError(error.message); // ✅ Now setError is defined
    } finally {
      setLoading(false);
    }
  }, [school?.id, school?.currentYear?.id]); // Removed unnecessary 'onToast' dependency

  useEffect(() => {
    load();
  }, [load]);

  // Show confirmation dialog for delete
  const showDeleteConfirmation = (type, id, name) => {
    setConfirmDialog({
      open: true,
      type: type,
      id: id,
      name: name
    });
  };

  // Handle actual delete after confirmation
  const handleConfirmDelete = async () => {
    const { type, id, name } = confirmDialog;
    
    try {
      if (type === 'student') {
        await SuperAdminService.deleteStudent(id);
        if (onToast) onToast(`Student "${name}" deleted successfully!`, "success");
        // Remove student from list immediately
        setStudents(prev => prev.filter(student => student.id !== id));
      } else if (type === 'teacher') {
        await SuperAdminService.deleteTeacher(id);
        if (onToast) onToast(`Teacher "${name}" deleted successfully!`, "success");
        // Remove teacher from list immediately (from active teachers list)
        setTeachers(prev => prev.filter(teacher => teacher.id !== id));
      }
    } catch (error) {
      console.error("Delete error:", error);
      if (onToast) onToast(error.message || `Failed to delete ${type}`, "error");
    } finally {
      // Close dialog
      setConfirmDialog({
        open: false,
        type: null,
        id: null,
        name: null
      });
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      type: null,
      id: null,
      name: null
    });
  };

  return {
    tab,
    setTab,
    students,
    teachers,
    classes,
    sections,
    loading,
    error, // ✅ Added error in return
    load,
    confirmDialog,
    showDeleteConfirmation,
    handleConfirmDelete,
    closeConfirmDialog
  };
}
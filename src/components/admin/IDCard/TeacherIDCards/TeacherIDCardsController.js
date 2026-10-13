import { useState, useEffect, useCallback } from "react";
import IDCardsService from "../../../../services/IDCardsService";

export default function TeacherIDCardsController({
  schoolId,
  user,
  onToast,
  t  // Translation function added
}) {

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [filterSubject, setFilterSubject] = useState("");

  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const loadSubjects = useCallback(async () => {
    try {
      const academicYearId = user?.academicYearId;
      
      if (!academicYearId) {
        console.warn('No academicYearId found');
        return;
      }
      
      const data = await IDCardsService.getSubjects(schoolId, academicYearId);
      setSubjects(data || []);
      
    } catch (err) {
      console.error("Error loading subjects:", err);
    }
  }, [schoolId, user?.academicYearId]);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await IDCardsService.getTeachers(schoolId, filterSubject);
      
      // 🔥 FILTER ONLY ACTIVE TEACHERS
      const activeTeachers = (data || []).filter(t => t.active === true);
      
      setTeachers(activeTeachers);
      
    } catch (err) {
      console.error("Error loading teachers:", err);
      onToast?.(t('failedToLoadTeachers'), "error");
    } finally {
      setLoading(false);
    }
  }, [schoolId, filterSubject, onToast, t]);

  useEffect(() => {
    loadSubjects();
    loadTeachers();
  }, [loadSubjects, loadTeachers]);

  const generateIDCard = async (teacher) => {
    try {
      setLoading(true);
      
      const blob = await IDCardsService.generateTeacherIDCard(
        teacher.id,
        schoolId
      );
      
      const text = await blob.text();
      
      setPreviewHtml(text);
      setSelectedTeacher(teacher);
      setShowPreview(true);
      
    } catch (err) {
      console.error("Error generating teacher ID card:", err);
      onToast?.(t('failedToGenerateIdCard'), "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(previewHtml);
      w.document.close();
      w.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Teacher_ID_Card_${selectedTeacher?.id}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilter = () => {
    setFilterSubject("");
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewHtml("");
    setSelectedTeacher(null);
  };

  // 🔥 FILTER TEACHERS BASED ON SEARCH (ONLY FROM ACTIVE TEACHERS)
  const filteredTeachers = teachers.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.mail?.toLowerCase().includes(search.toLowerCase()) ||
    t.subjectExpertise?.toLowerCase().includes(search.toLowerCase())
  );

  // 🔥 COUNT ONLY ACTIVE TEACHERS WITH QUALIFICATION
  const qualifiedCount = teachers.filter(t => t.qualification).length;

  return {
    teachers,
    subjects,
    loading,
    search,
    filterSubject,
    selectedTeacher,
    previewHtml,
    showPreview,
    filteredTeachers,
    totalTeachers: teachers.length,        // 🔥 Active teachers count
    totalSubjects: subjects.length,
    qualifiedCount,
    setSearch,
    setFilterSubject,
    loadTeachers,
    generateIDCard,
    handlePrint,
    handleDownload,
    clearFilter,
    closePreview
  };
}
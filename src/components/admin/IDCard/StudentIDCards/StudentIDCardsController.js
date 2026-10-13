import { useState, useEffect, useCallback } from "react";
import IDCardsService from "../../../../services/IDCardsService";

export default function StudentIDCardsController({
  schoolId,
  academicYearId,
  onToast,
  t  // Translation function added
}) {

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [bulkClass, setBulkClass] = useState("");
  const [bulkSection, setBulkSection] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);

  const loadClasses = useCallback(async () => {
    try {
      const data = await IDCardsService.getClasses(schoolId);
      setClasses(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [schoolId]);

  const loadSections = useCallback(async () => {
    try {
      const data = await IDCardsService.getSections(schoolId);
      setSections(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [schoolId]);

  const loadStudents = useCallback(async () => {
    if (!academicYearId) return;
    setLoading(true);
    try {
      const data = await IDCardsService.getStudents(
        schoolId,
        filterClass,
        filterSection,
        academicYearId
      );
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      onToast?.(t('failedToLoadStudents'), "error");
    } finally {
      setLoading(false);
    }
  }, [schoolId, filterClass, filterSection, academicYearId, onToast, t]);

  useEffect(() => {
    loadClasses();
    loadSections();
    loadStudents();
  }, [loadClasses, loadSections, loadStudents]);

  const generateIDCard = async (student) => {
    try {
      setLoading(true);
      const enrollmentId = student.enrollmentId || student.enrollmentNumber || student.id;     
      const blob = await IDCardsService.generateIDCard(enrollmentId, schoolId);
      const text = await blob.text();
      
      setPreviewHtml(text);
      setSelectedStudent(student);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      onToast?.(t('failedToGenerateIdCard'), "error");
    } finally {
      setLoading(false);
    }
  };

  const generateBulkIDCards = async () => {
    if (!bulkClass) {
      onToast?.(t('pleaseSelectClass'), "error");
      return;
    }
    try {
      setLoading(true);
      const blob = await IDCardsService.generateBulkIDCards(
        schoolId,
        bulkClass,
        bulkSection
      );
      const text = await blob.text();
      
      // Create wrapper with color printing CSS
      const htmlWithStyles = `
        <html>
          <head>
            <style>
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            </style>
          </head>
          <body>
            ${text}
          </body>
        </html>
      `;
      
      const newBlob = new Blob([htmlWithStyles], { type: "text/html" });
      const url = window.URL.createObjectURL(newBlob);
      window.open(url, "_blank");
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      setShowBulkModal(false);
      onToast?.(t('bulkIdCardsGenerated'), "success");
    } catch (err) {
      console.error(err);
      onToast?.(t('bulkGenerationFailed'), "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");

    if (w) {
      w.document.write(`
        <html>
          <head>
            <style>
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            </style>
          </head>
          <body>
            ${previewHtml}
          </body>
        </html>
      `);

      w.document.close();

      setTimeout(() => {
        w.print();
      }, 500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ID_Card_${selectedStudent?.rollNumber || 'student'}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewHtml("");
    setSelectedStudent(null);
  };

  const filteredSections = filterClass
    ? sections.filter((s) => String(s.classId) === String(filterClass))
    : [];

  const filteredStudents = students.filter((s) => {
    const searchLower = search.toLowerCase();
    return (
      (s.name?.toLowerCase() || '').includes(searchLower) ||
      (s.rollNumber?.toString().toLowerCase() || '').includes(searchLower) ||
      (s.fatherName?.toLowerCase() || '').includes(searchLower)
    );
  });

  const bulkStudentCount = students.filter(
    (s) =>
      String(s.schoolClass?.id) === String(bulkClass) &&
      (!bulkSection || String(s.section?.id) === String(bulkSection))
  ).length;

  return {
    students,
    classes,
    sections,
    loading,
    search,
    filterClass,
    filterSection,
    selectedStudent,
    previewHtml,
    showPreview,
    bulkClass,
    bulkSection,
    showBulkModal,
    filteredSections,
    filteredStudents,
    totalStudents: students.length,
    totalClasses: classes.length,
    totalSections: sections.length,
    bulkStudentCount,
    setSearch,
    setFilterClass,
    setFilterSection,
    setBulkClass,
    setBulkSection,
    setShowBulkModal,
    loadStudents,
    generateIDCard,
    generateBulkIDCards,
    handlePrint,
    handleDownload,
    closePreview
  };
}
// src/components/admin/TCFormat/TCFormatController.js

import { useState, useEffect, useCallback, useRef } from "react";
import StudentsService from "../../../services/StudentsService";

export default function TCFormatController({
  schoolId,
  user,
  onToast,
  mode = 'single',
  onClose,
  student: propStudent,
  academicYearId,
  classes = [],
  sections = []
}) {

  const tcRef = useRef();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(propStudent || null);
  const [showTCForm, setShowTCForm] = useState(!!propStudent);
  
  const [reasonForLeaving, setReasonForLeaving] = useState('');
  const [showReasonPopup, setShowReasonPopup] = useState(false);

  const currentAcademicYearId = academicYearId?.id || academicYearId;

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await StudentsService.getStudents(
        schoolId,
        filterClass,
        filterSection,
        currentAcademicYearId
      );
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading students:', error);
      setStudents([]);
      onToast?.('Error loading students: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [schoolId, filterClass, filterSection, currentAcademicYearId, onToast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredSections = filterClass && sections && Array.isArray(sections)
    ? sections.filter(s => String(s.classId) === String(filterClass))
    : [];

  const filteredStudents = Array.isArray(students) 
    ? students.filter(s => 
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        (s.rollNumber && String(s.rollNumber).toLowerCase().includes(search.toLowerCase())) ||
        (s.fatherName && s.fatherName.toLowerCase().includes(search.toLowerCase())) ||
        (s.enrollmentId && s.enrollmentId.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setShowReasonPopup(true);
  };

  const handleReasonSubmit = () => {
    if (!reasonForLeaving.trim()) {
      onToast?.('Please enter reason for leaving', 'error');
      return;
    }
    setShowReasonPopup(false);
    setShowTCForm(true);
  };

  const handleCancelReason = () => {
    setShowReasonPopup(false);
    setSelectedStudent(null);
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setShowTCForm(false);
    setReasonForLeaving('');
  };

  const handleClearFilters = () => {
    setFilterClass('');
    setFilterSection('');
    loadStudents();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '________________';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handlePrint = () => {
    if (!tcRef.current) return;
    
    const printContent = tcRef.current.innerHTML;
    const studentName = selectedStudent?.name || 'Student';
    const documentTitle = `${studentName}_TC_${new Date().getFullYear()}`;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${documentTitle}</title>
            <style>
              body { 
                font-family: 'Times New Roman', Times, serif; 
                margin: 40px;
                background: white;
              }
              .tc-container { 
                max-width: 900px; 
                margin: 0 auto; 
                padding: 40px;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                position: relative;
                overflow: hidden;
              }
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-30deg);
                font-size: 100px;
                font-weight: bold;
                color: rgba(200, 200, 200, 0.08);
                white-space: nowrap;
                pointer-events: none;
                z-index: 0;
                font-family: Arial, sans-serif;
                text-transform: uppercase;
              }
              h1 { color: #1e3a5f; font-size: 32px; margin-bottom: 5px; }
              h2 { color: #1e3a5f; font-size: 26px; text-decoration: underline; margin: 15px 0; }
              hr { margin: 20px 0; border: 2px solid #1e3a5f; }
              table { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 15px; }
              td { padding: 12px; border-bottom: 1px solid #ccc; }
              td:first-child { width: 40%; color: #555; font-weight: 500; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .signature { display: flex; justify-content: space-between; margin-top: 50px; }
              .footer-note { margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px dashed #ccc; padding-top: 15px; }
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="tc-container">
              <div class="watermark">TC DOCUMENT</div>
              ${printContent}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const getTCData = () => {
    if (!selectedStudent) return null;

    return {
      studentName: selectedStudent?.name || '________________',
      fatherName: selectedStudent?.fatherName || '________________',
      motherName: selectedStudent?.motherName || '________________',
      rollNumber: selectedStudent?.rollNumber || '________________',
      className: selectedStudent?.schoolClass?.className || '________________',
      sectionName: selectedStudent?.section?.sectionName || '________________',
      studentId: selectedStudent?.id || '________________',
      enrollmentId: selectedStudent?.enrollmentId || '________________',
      scholarNo: selectedStudent?.scholarNo || '____________',
      familyId: selectedStudent?.familyId || '____________',
      penNumber: selectedStudent?.penNumber || '____________',
      diseCode: selectedStudent?.school?.diseCode || '____________',
      admissionDate: formatDate(selectedStudent?.createdAt),
      dob: formatDate(selectedStudent?.dob),
      aadharCardNo: selectedStudent?.aadharCardNo || '________________',
      samagraId: selectedStudent?.samagraId || '________________',
      apaarId: selectedStudent?.apaarId || '________________',
      email: selectedStudent?.email || '________________',
      gender: selectedStudent?.gender || '________________',
      caste: selectedStudent?.caste || '________________',
      schoolName: selectedStudent?.school?.schoolName || 
                 selectedStudent?.schoolClass?.school?.schoolName || 
                 user?.schoolName || 
                 'SMART SCHOOL',
      schoolAddress: selectedStudent?.school?.address || 
                    selectedStudent?.schoolClass?.school?.address || 
                    'School Address',
      schoolPhone: selectedStudent?.school?.phoneNumber || 
                  selectedStudent?.schoolClass?.school?.phoneNumber || 
                  '________________',
      schoolEmail: selectedStudent?.school?.mailId || 
                  selectedStudent?.schoolClass?.school?.mailId || 
                  '________________',
      currentYear: selectedStudent?.academicYear?.currentYear || 
                  selectedStudent?.school?.currentYear?.currentYear || 
                  '2025-26',
      currentDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      reasonForLeaving
    };
  };

  return {
    tcRef,
    students,
    loading,
    search, setSearch,
    filterClass, setFilterClass,
    filterSection, setFilterSection,
    classes,
    sections,
    selectedStudent,
    showTCForm,
    reasonForLeaving, setReasonForLeaving,
    showReasonPopup,
    filteredSections,
    filteredStudents,
    totalStudents: students.length,
    hasAcademicYear: !!currentAcademicYearId,
    loadStudents,
    handleSelectStudent,
    handleReasonSubmit,
    handleCancelReason,
    handleBackToList,
    handleClearFilters,
    handlePrint,
    formatDate,
    getTCData,
    onClose
  };
}
// src/components/admin/PriFees/PriFeesController.js

import { useState, useEffect, useCallback } from "react";
import FeesService from "../../../services/FeesService";

export default function PriFeesController({
  schoolId,
  classes,
  sections,
  onToast,
  academicYearId,
  academicYearName,
  user,
  t
}) {

  const [tab, setTab] = useState('structure');
  const [structures, setStructures] = useState([]);
  const [dueReport, setDueReport] = useState([]);
  const [modal, setModal] = useState(false);
  const [collectModal, setCollectModal] = useState(false);
  const [duePaymentModal, setDuePaymentModal] = useState(false);
  const [feeDetails, setFeeDetails] = useState(null);
  const [rollSearch, setRollSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [selectedDue, setSelectedDue] = useState(null);
  
  // Fee Collection - New states for common modal
  const [feeCollectionStudent, setFeeCollectionStudent] = useState(null);
  const [feeCollectionLoading, setFeeCollectionLoading] = useState(false);
  const [feeCollectionReceiptData, setFeeCollectionReceiptData] = useState(null);
  const [feeCollectionShowReceipt, setFeeCollectionShowReceipt] = useState(false);
  
  // Receipt States (for direct collection from this component)
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fee Record States
  const [recordModal, setRecordModal] = useState(false);
  const [recordEnrollmentId, setRecordEnrollmentId] = useState('');
  const [recordLoading, setRecordLoading] = useState(false);

  // Fee Adjustment States
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [adjustmentStudent, setAdjustmentStudent] = useState(null);
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  // ✅ NEW: Previous Dues States
  const [previousDues, setPreviousDues] = useState([]);
  const [isLoadingPreviousDues, setIsLoadingPreviousDues] = useState(false);

  // Fee Structure Form
  const [sForm, setSForm] = useState({ 
    classId: '', 
    sectionId: '', 
    totalFees: '', 
    academicYearId: academicYearId || '' 
  });
  
  // Fee Collection Form
  const [cForm, setCForm] = useState({ 
    amountPaid: '', 
    paymentMode: 'CASH', 
    academicYearId: academicYearId || '' 
  });
  
  // Previous Year Due Payment Form
  const [dueForm, setDueForm] = useState({
    amountPaying: '',
    paymentMode: 'CASH'
  });

  // Form field handlers
  const handleSFormChange = (k) => (e) => setSForm(p => ({ ...p, [k]: e.target.value }));
  const handleCFormChange = (k) => (e) => setCForm(p => ({ ...p, [k]: e.target.value }));
  const handleDFormChange = (k) => (e) => setDueForm(p => ({ ...p, [k]: e.target.value }));

  // ========== LOAD FUNCTIONS ==========

  const loadStructures = useCallback(async () => {
    try { 
      const data = await FeesService.getStructures(schoolId);
      setStructures(Array.isArray(data) ? data : []);
    } catch { 
      setStructures([]); 
    }
  }, [schoolId]);

  const loadDueReport = useCallback(async () => {
    if (!academicYearId) return;
    
    try {
      let data;
      if (filterClass) {
        data = await FeesService.getDueReportByClass(schoolId, filterClass, academicYearId);
      } else {
        data = await FeesService.getDueReport(schoolId, academicYearId);
      }
      
      // Ensure grand total due is not negative in report
      const processedData = Array.isArray(data) ? data.map(row => ({
        ...row,
        grandTotalDue: Math.max(0, row.grandTotalDue || 0),
        currentYearDue: Math.max(0, row.currentYearDue || 0)
      })) : [];
      
      setDueReport(processedData);
    } catch { 
      setDueReport([]); 
    }
  }, [schoolId, filterClass, academicYearId]);

  useEffect(() => { 
    if (tab === 'structure') loadStructures(); 
    if (tab === 'report') loadDueReport(); 
  }, [tab, loadStructures, loadDueReport]);

  // ========== FEE STRUCTURE FUNCTIONS ==========

  const addStructure = async () => {
    if (!sForm.classId || !sForm.totalFees || !sForm.academicYearId) { 
      onToast?.(t('classFeesYearRequired'), 'error'); 
      return; 
    }
    
    setLoading(true);
    try {
      const payload = { 
        totalFees: parseFloat(sForm.totalFees), 
        schoolClass: { id: parseInt(sForm.classId) },
        ...(sForm.sectionId ? { section: { id: parseInt(sForm.sectionId) } } : {}) 
      };
      
      await FeesService.setStructure(schoolId, sForm.academicYearId, payload);
      
      setModal(false); 
      setSForm({ classId: '', sectionId: '', totalFees: '', academicYearId: academicYearId || '' });
      onToast?.(t('feeStructureSetSuccess'), 'success'); 
      loadStructures();
    } catch (e) { 
      onToast?.(t('feeStructureError', { error: e.message }), 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const archiveStructure = async (id) => {
    if (!window.confirm(t('archiveFeeStructureConfirm'))) return;
    try { 
      await FeesService.archiveStructure(id); 
      onToast?.(t('feeStructureArchived'), 'success'); 
      loadStructures(); 
    } catch { 
      onToast?.(t('feeStructureArchiveError'), 'error'); 
    }
  };

  // ========== FEE COLLECTION FUNCTIONS ==========

  /**
 * Fetch student fee details - Handles ALL response structures
 */
const fetchStudentFeeDetails = async () => {
  if (!rollSearch.trim()) { 
    onToast?.(t('enterEnrollmentNumber'), 'error'); 
    return; 
  }
  
  setLoading(true);
  try {
    const searchValue = rollSearch.trim();
    console.log('🔄 Fetching student details for:', searchValue);
    
    const response = await FeesService.fetchStudentDetails(searchValue, schoolId);
    console.log('📦 Full API Response:', response);
    
    if (!response) {
      console.error('❌ Response is null or undefined');
      onToast?.(t('studentNotFound'), 'error');
      setLoading(false);
      return;
    }
    
    // ✅ Extract basic info from response
    let studentId = null;
    let studentName = response.studentName || response.name || 'N/A';
    let enrollmentId = response.enrollmentId || searchValue;
    let className = response.className || 'N/A';
    let sectionName = response.sectionName || 'Section A';
    let rollNumber = response.rollNumber || 'N/A';
    let classId = response.classId || null;
    let sectionId = response.sectionId || null;
    
    // ============================================================
    // METHOD 1: Try to get student ID from paymentHistory
    // ============================================================
    if (response.paymentHistory && response.paymentHistory.length > 0) {
      for (const payment of response.paymentHistory) {
        if (payment.student && payment.student.id) {
          studentId = payment.student.id;
          // Also update other details from payment if available
          if (payment.student.name) studentName = payment.student.name;
          if (payment.student.enrollmentId) enrollmentId = payment.student.enrollmentId;
          if (payment.student.rollNumber) rollNumber = payment.student.rollNumber;
          console.log('✅ Found student ID in paymentHistory:', studentId);
          break;
        }
      }
    }
    
    // ============================================================
    // METHOD 2: Try to get student ID from feeAdjustments
    // ============================================================
    if (!studentId && response.feeAdjustments && response.feeAdjustments.length > 0) {
      for (const adjustment of response.feeAdjustments) {
        if (adjustment.student && adjustment.student.id) {
          studentId = adjustment.student.id;
          // Extract all student details from adjustment
          const student = adjustment.student;
          studentName = student.name || studentName;
          enrollmentId = student.enrollmentId || enrollmentId;
          rollNumber = student.rollNumber || rollNumber;
          classId = student.schoolClass?.id || classId;
          className = student.schoolClass?.className || className;
          sectionId = student.section?.id || sectionId;
          sectionName = student.section?.sectionName || sectionName;
          console.log('✅ Found student ID in feeAdjustments:', studentId);
          console.log('✅ Student details from adjustment:', student);
          break;
        }
      }
    }
    
    // ============================================================
    // METHOD 3: Try from root level
    // ============================================================
    if (!studentId) {
      if (response.studentId) {
        studentId = response.studentId;
        console.log('✅ Found student ID at root studentId:', studentId);
      } else if (response.id) {
        studentId = response.id;
        console.log('✅ Found student ID at root id:', studentId);
      } else if (response.student?.id) {
        studentId = response.student.id;
        console.log('✅ Found student ID in response.student:', studentId);
      }
    }
    
    // ============================================================
    // METHOD 4: If still no studentId, try to fetch it using enrollmentId
    // ============================================================
    if (!studentId) {
      console.log('⚠️ No studentId found in response, attempting to find student by enrollmentId:', searchValue);
      
      try {
        // Use the existing students list to find the student
        const StudentsService = (await import('../../../services/StudentsService')).default;
        
        // First try to get student by enrollment ID directly
        try {
          const studentData = await StudentsService.getStudentByEnrollmentId(searchValue, schoolId);
          console.log('📦 Student data from StudentsService:', studentData);
          
          if (studentData && studentData.id) {
            studentId = studentData.id;
            studentName = studentData.name || studentName;
            enrollmentId = studentData.enrollmentId || enrollmentId;
            className = studentData.schoolClass?.className || className;
            sectionName = studentData.section?.sectionName || sectionName;
            rollNumber = studentData.rollNumber || rollNumber;
            classId = studentData.schoolClass?.id || classId;
            sectionId = studentData.section?.id || sectionId;
            console.log('✅ Found student via getStudentByEnrollmentId:', studentId);
          }
        } catch (err) {
          console.warn('⚠️ getStudentByEnrollmentId failed:', err.message);
          
          // Fallback: Get all students and filter
          const allStudents = await StudentsService.getStudents(schoolId, '', '', academicYearId);
          console.log('📦 All students count:', allStudents?.length);
          
          if (allStudents && Array.isArray(allStudents)) {
            const foundStudent = allStudents.find(s => 
              s.enrollmentId?.toLowerCase() === searchValue.toLowerCase()
            );
            
            if (foundStudent) {
              studentId = foundStudent.id;
              studentName = foundStudent.name || studentName;
              enrollmentId = foundStudent.enrollmentId || enrollmentId;
              className = foundStudent.schoolClass?.className || className;
              sectionName = foundStudent.section?.sectionName || sectionName;
              rollNumber = foundStudent.rollNumber || rollNumber;
              classId = foundStudent.schoolClass?.id || classId;
              sectionId = foundStudent.section?.id || sectionId;
              console.log('✅ Found student in allStudents list:', studentId);
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch student:', err.message);
      }
    }
    
    console.log('🎯 Final extracted studentId:', studentId);
    console.log('🎯 Final studentName:', studentName);
    
    // ============================================================
    // If still no studentId, show error
    // ============================================================
    if (!studentId) {
      console.error('❌ No student ID found in response or from fallback');
      onToast?.(t('studentNotFound'), 'error');
      setLoading(false);
      return;
    }
    
    // ✅ Build student object
    const studentObj = {
      id: studentId,
      enrollmentId: enrollmentId,
      name: studentName,
      rollNumber: rollNumber,
      schoolClass: { 
        className: className,
        id: classId
      },
      section: { 
        sectionName: sectionName,
        id: sectionId
      },
      school: user?.school || {}
    };
    
    console.log('✅ Final student object:', studentObj);
    
    // ✅ Build fee details
    const feeDetailsObj = {
      studentId: studentId,
      studentName: studentName,
      enrollmentId: enrollmentId,
      rollNumber: rollNumber,
      className: className,
      sectionName: sectionName,
      totalFees: response.totalFees || 0,
      totalClassFees: response.totalClassFees || 0,
      previousYearDue: response.previousYearDue || 0,
      totalPaidThisYear: response.totalPaidThisYear || 0,
      grandTotalDue: response.grandTotalDue || 0,
      remainingBalance: response.remainingBalance || 0,
      paymentHistory: response.paymentHistory || [],
      feeAdjustments: response.feeAdjustments || [],
      schoolName: user?.school?.schoolName || 'SMART SCHOOL',
      schoolAddress: user?.school?.address || 'School Address',
      schoolPhone: user?.school?.phoneNumber || '________________',
      schoolEmail: user?.school?.mailId || '________________',
    };
    
    setFeeDetails(feeDetailsObj);
    setFeeCollectionStudent(studentObj);
    setCollectModal(true);
    
    // ✅ Load previous dues with extracted studentId
    console.log('📤 Calling loadPreviousDues with studentId:', studentId);
    await loadPreviousDues(studentId);
    
  } catch (e) { 
    console.error('❌ Error fetching student:', e);
    console.error('❌ Error details:', e.response?.data || e.message);
    
    let errorMsg = e.message || t('unknownError');
    if (e.response?.data?.message) {
      errorMsg = e.response.data.message;
    } else if (e.response?.data?.error) {
      errorMsg = e.response.data.error;
    }
    
    if (e.response?.status === 404 || errorMsg.toLowerCase().includes('not found')) {
      onToast?.(t('studentNotFoundPleaseCheck'), 'error');
    } else {
      onToast?.(t('fetchStudentError', { error: errorMsg }), 'error');
    }
  } finally {
    setLoading(false);
  }
};

  const collectFees = async () => {
    // This function is kept for backward compatibility
  };

  const handleFeeCollectionSuccess = (receiptData) => {
    setFeeCollectionReceiptData(receiptData);
    setFeeCollectionShowReceipt(true);
    
    if (tab === 'report') loadDueReport();
    
    setRollSearch('');
    setFeeDetails(null);
    
    onToast?.(t('feesCollectedSuccess'), 'success');
  };

  // ========== PREVIOUS YEAR DUE FUNCTIONS ==========

  // ✅ UPDATED: loadPreviousDues with state management
 // src/components/admin/PriFees/PriFeesController.js

// ✅ UPDATED: loadPreviousDues with better logging
const loadPreviousDues = async (studentId) => {
  console.log('🔍 loadPreviousDues called with studentId:', studentId);
  
  if (!studentId) {
    console.warn('⚠️ studentId is falsy, setting empty dues');
    setPreviousDues([]);
    return [];
  }
  
  setIsLoadingPreviousDues(true);
  try {
    console.log('📤 Calling API: getPreviousDues for studentId:', studentId);
    const data = await FeesService.getPreviousDues(studentId);
    console.log('📊 Previous Dues API Response:', data);
    
    let dues = [];
    
    if (data?.pendingDues) {
      dues = data.pendingDues;
      console.log('✅ Extracted from data.pendingDues:', dues);
    } else if (data?.data?.pendingDues) {
      dues = data.data.pendingDues;
      console.log('✅ Extracted from data.data.pendingDues:', dues);
    } else if (Array.isArray(data)) {
      dues = data;
      console.log('✅ Response is array:', dues);
    } else if (data?.data && Array.isArray(data.data)) {
      dues = data.data;
      console.log('✅ Extracted from data.data:', dues);
    }
    
    dues = Array.isArray(dues) ? dues.filter(d => d != null) : [];
    
    console.log('📊 Final dues array:', dues);
    console.log('📊 Number of dues:', dues.length);
    
    setPreviousDues(dues);
    return dues;
    
  } catch (e) {
    console.error('❌ Error loading previous dues:', e);
    console.error('❌ Error details:', e.response?.data || e.message);
    setPreviousDues([]);
    return [];
  } finally {
    setIsLoadingPreviousDues(false);
  }
};
  const handlePayPreviousDue = (due) => {
    setSelectedDue(due);
    setDueForm({ amountPaying: '', paymentMode: 'CASH' });
    setDuePaymentModal(true);
  };

  const payPreviousDue = async () => {
    if (!selectedDue || !dueForm.amountPaying) {
      onToast?.(t('amountRequired'), 'error');
      return;
    }

    const amountToPay = parseFloat(dueForm.amountPaying);
    
    if (amountToPay > selectedDue.remainingDue) {
      onToast?.(t('amountExceedsRemainingDue', { remainingDue: formatCurrency(selectedDue.remainingDue) }), 'error');
      return;
    }

    if (amountToPay <= 0) {
      onToast?.(t('validAmountRequired'), 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await FeesService.payPreviousDue(
        selectedDue.id,
        schoolId,
        academicYearId,
        amountToPay,
        dueForm.paymentMode
      );
      
      const schoolData = response.school || response.academicYear?.school || {};
      
      setReceiptData({
        receiptNumber: response.receiptNumber,
        studentName: response.studentName || selectedDue.studentName,
        rollNumber: response.rollNumber || selectedDue.rollNumber,
        className: response.className || selectedDue.className,
        sectionName: response.sectionName || feeDetails?.sectionName || 'Section A',
        fromYear: response.fromYear || selectedDue.fromYear,
        currentYear: response.currentYear || academicYearName,
        originalDueAmount: response.originalDueAmount || selectedDue.dueAmount,
        amountPaid: amountToPay,
        totalPaidSoFar: response.totalPaidSoFar || (selectedDue.paidFromDue + amountToPay),
        remainingDue: response.remainingDue || (selectedDue.remainingDue - amountToPay),
        paymentMode: dueForm.paymentMode,
        paymentDate: response.paymentDate || formatDate(new Date()),
        isFullyCleared: response.isFullyCleared || (selectedDue.remainingDue - amountToPay <= 0),
        
        schoolName: schoolData.schoolName || user?.schoolName || t('defaultSchoolName'),
        schoolAddress: schoolData.address || user?.address || t('defaultSchoolAddress'),
        schoolPhone: schoolData.phoneNumber || user?.phoneNumber || '1234567890',
        schoolEmail: schoolData.mailId || user?.email || 'school@email.com',
        
        type: 'due'
      });
      
      setDuePaymentModal(false);
      setSelectedDue(null);
      setShowReceipt(true);
      
      // ✅ Refresh previous dues after payment
      if (feeDetails?.studentId) {
        await loadPreviousDues(feeDetails.studentId);
      }
      
      if (feeDetails && rollSearch) {
        fetchStudentFeeDetails();
      }
      if (tab === 'report') loadDueReport();
      
      onToast?.(t('previousDuePaidSuccess'), 'success');
      
    } catch (e) {
      console.error('Due payment error:', e);
      onToast?.(t('duePaymentError', { error: e.message }), 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== DUE REPORT ACTION HANDLER ==========

  /**
   * Handle actions from Due Report dropdown
   * Actions: collect, record, adjustment
   */
  const handleDueReportAction = (actionKey, student) => {
    console.log('📌 Due Report Action:', actionKey, student);
    
    switch (actionKey) {
      case 'collect':
        openFeeCollectionFromDue(student);
        break;
        
      case 'record':
        openFeeRecordFromDue(student);
        break;
        
      case 'adjustment':
        openFeeAdjustmentFromDue(student);
        break;
        
      default:
        console.warn('⚠️ Unknown action:', actionKey);
        break;
    }
  };

  /**
   * Open Fee Collection Modal from Due Report
   */
  const openFeeCollectionFromDue = (student) => {
    const studentObj = {
      id: student.id,
      enrollmentId: student.enrollmentId,
      name: student.name,
      rollNumber: student.rollNumber,
      schoolClass: student.schoolClass || { 
        className: student.className || 'N/A',
        id: student.classId
      },
      section: student.section || { 
        sectionName: student.sectionName || 'Section A',
        id: student.sectionId
      },
      school: user?.school || {}
    };
    
    setFeeCollectionStudent(studentObj);
    setCollectModal(true);
    
    // ✅ Load previous dues when opening from due report
    if (student.id) {
      loadPreviousDues(student.id);
    }
  };

  /**
   * Open Fee Record Modal from Due Report
   */
  const openFeeRecordFromDue = (student) => {
    if (student.enrollmentId) {
      setRecordEnrollmentId(student.enrollmentId);
      setRecordModal(true);
      console.log('🔍 Open fee record for enrollment:', student.enrollmentId);
    } else {
      onToast?.(t('enrollmentIdNotFound'), 'error');
    }
  };

  /**
   * Open Fee Adjustment Modal from Due Report
   */
  const openFeeAdjustmentFromDue = (student) => {
    const studentObj = {
      id: student.id,
      enrollmentId: student.enrollmentId,
      name: student.name,
      rollNumber: student.rollNumber,
      schoolClass: student.schoolClass || { 
        className: student.className || 'N/A',
        id: student.classId
      },
      section: student.section || { 
        sectionName: student.sectionName || 'Section A',
        id: student.sectionId
      }
    };
    
    setAdjustmentStudent(studentObj);
    setAdjustmentModal(true);
  };

  // ========== FEE RECORD FUNCTIONS ==========

  const openRecordModal = (enrollmentId) => {
    setRecordEnrollmentId(enrollmentId);
    setRecordModal(true);
  };

  const closeRecordModal = () => {
    setRecordModal(false);
    setRecordEnrollmentId('');
  };

  // ========== FEE ADJUSTMENT FUNCTIONS ==========

  const openAdjustmentModal = (student) => {
    setAdjustmentStudent(student);
    setAdjustmentModal(true);
  };

  const closeAdjustmentModal = () => {
    setAdjustmentModal(false);
    setAdjustmentStudent(null);
  };

  const handleSaveAdjustment = async (adjustmentData) => {
    setAdjustmentLoading(true);
    try {
      const response = await FeesService.addFeeAdjustment(
        adjustmentStudent.enrollmentId,
        adjustmentData,
        academicYearId
      );
      
      onToast?.(t('adjustmentAddedSuccess'), 'success');
      closeAdjustmentModal();
      
      if (tab === 'report') loadDueReport();
      
    } catch (error) {
      console.error('❌ Error adding adjustment:', error);
      onToast?.(t('adjustmentError', { error: error.message }), 'error');
    } finally {
      setAdjustmentLoading(false);
    }
  };

  // ========== HELPER FUNCTIONS ==========

  const structSections = sForm.classId ? sections.filter(s => String(s.classId) === String(sForm.classId)) : [];
  
  const secName = (s) => (s && s.sectionName) ? s.sectionName : 'Section A';

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    if (amount < 0) return `-₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  const numberToWords = (num) => {
    if (num === undefined || num === null) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 20) return ones[n] + ' ';
      if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' ';
      return ones[Math.floor(n / 100)] + ' Hundred ' + convertLessThanThousand(n % 100);
    };

    if (num === 0) return 'Zero';
    
    let n = Math.floor(num);
    let result = '';
    
    if (n >= 100000) {
      result += convertLessThanThousand(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      result += convertLessThanThousand(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    result += convertLessThanThousand(n);
    
    return result.trim();
  };

  const renderReceiptContent = (data) => {
    const schoolName = data.schoolName || user?.schoolName || t('defaultSchoolName');
    const schoolAddress = data.schoolAddress || user?.address || t('defaultSchoolAddress');
    const schoolPhone = data.schoolPhone || user?.phoneNumber || '1234567890';
    const schoolEmail = data.schoolEmail || user?.email || 'school@email.com';
    
    return (
      <div style={{
        fontFamily: "'Courier New', monospace",
        padding: '20px 20px 10px 20px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 20, 
          borderBottom: '2px solid #1e3a5f', 
          paddingBottom: 12,
          background: '#f8fafc',
          borderRadius: '8px 8px 0 0'
        }}>
          <h1 style={{ 
            margin: '0 0 5px 0', 
            color: '#1e3a5f', 
            fontSize: 24,
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            {schoolName}
          </h1>
          <p style={{ margin: '3px 0', fontSize: 12, color: '#475569' }}>
            📍 {schoolAddress}
          </p>
          <p style={{ margin: '3px 0', fontSize: 12, color: '#475569' }}>
            📞 {schoolPhone} | ✉️ {schoolEmail}
          </p>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginBottom: 20,
          background: data.type === 'due' ? '#fffbeb' : '#f0fdf4',
          padding: '10px',
          borderRadius: '8px'
        }}>
          <h2 style={{ 
            margin: '0 0 8px 0', 
            fontSize: 18, 
            textDecoration: 'underline',
            color: '#1e3a5f'
          }}>
            {data.type === 'due' ? t('previousYearDuesReceipt') : t('feePaymentReceipt')}
          </h2>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: 13,
            fontWeight: 500
          }}>
            <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: 20 }}>
              {t('receiptNo')}: <strong style={{ color: '#1e3a5f' }}>{data.receiptNumber || 'FEE-' + Date.now()}</strong>
            </span>
            <span style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: 20 }}>
              {t('date')}: <strong style={{ color: '#1e3a5f' }}>{data.paymentDate || formatDate(new Date())}</strong>
            </span>
          </div>
        </div>

        <div style={{ 
          marginBottom: 20, 
          border: '2px solid #e2e8f0', 
          padding: 16, 
          borderRadius: 10,
          background: '#ffffff'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: 15, 
            color: '#1e3a5f',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: 6
          }}>
            👤 {t('studentDetails')}:
          </h3>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '5px 0', width: '40%', color: '#475569' }}><strong>{t('name')}:</strong></td>
                <td style={{ padding: '5px 0', fontWeight: 600 }}>{data.studentName || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0', color: '#475569' }}><strong>{t('rollNumber')}:</strong></td>
                <td style={{ padding: '5px 0', fontWeight: 600 }}>{data.rollNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0', color: '#475569' }}><strong>{t('classSection')}:</strong></td>
                <td style={{ padding: '5px 0', fontWeight: 600 }}>{data.className || 'N/A'} / {data.sectionName || 'Section A'}</td>
              </tr>
              {data.type === 'due' && (
                <>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#475569' }}><strong>{t('dueFromYear')}:</strong></td>
                    <td style={{ padding: '5px 0', fontWeight: 600 }}>{data.fromYear || t('previousYear')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#475569' }}><strong>{t('originalDue')}:</strong></td>
                    <td style={{ padding: '5px 0', fontWeight: 600, color: '#f59e0b' }}>
                      {formatCurrency(data.originalDueAmount || 0)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ 
          marginBottom: 20, 
          border: '2px solid #e2e8f0', 
          padding: 16, 
          borderRadius: 10,
          background: '#ffffff'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: 15, 
            color: '#1e3a5f',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: 6
          }}>
            💳 {t('paymentDetails')}:
          </h3>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              {data.type !== 'due' && (
                <>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#475569' }}>{t('totalAnnualFees')}:</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(data.totalFees || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#475569' }}>{t('totalPaidTillDate')}:</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                      {formatCurrency(data.totalPaid || 0)}
                    </td>
                  </tr>
                  <tr style={{ borderTop: '1px dashed #ccc' }}>
                    <td style={{ padding: '8px 0', fontWeight: 700 }}>{t('amountPaidNow')}:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: 16 }}>
                      {formatCurrency(data.amountPaid || 0)}
                    </td>
                  </tr>
                </>
              )}
              
              {data.type === 'due' && (
                <>
                  <tr>
                    <td style={{ padding: '5px 0', fontWeight: 700 }}>{t('amountPaidNow')}:</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: 16 }}>
                      {formatCurrency(data.amountPaid || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#475569' }}>{t('totalPaidSoFar')}:</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(data.totalPaidSoFar || 0)}
                    </td>
                  </tr>
                </>
              )}
              
              <tr>
                <td style={{ padding: '5px 0', color: '#475569' }}>{t('paymentMode')}:</td>
                <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>
                  <span style={{
                    background: data.paymentMode === 'CASH' ? '#f0fdf4' : '#eff6ff',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12
                  }}>
                    {data.paymentMode || 'CASH'}
                  </span>
                </td>
              </tr>
              
              <tr style={{ borderTop: '1px dashed #ccc' }}>
                <td style={{ padding: '8px 0', fontWeight: 700 }}>{t('remainingBalance')}:</td>
                <td style={{ 
                  padding: '8px 0', 
                  textAlign: 'right', 
                  fontWeight: 800, 
                  color: data.remainingDue > 0 ? '#ef4444' : '#16a34a',
                  fontSize: 16
                }}>
                  {formatCurrency(data.remainingDue || 0)}
                </td>
              </tr>
              
              {data.type === 'due' && data.isFullyCleared !== undefined && (
                <tr>
                  <td style={{ padding: '5px 0', color: '#475569' }}>{t('status')}:</td>
                  <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>
                    <span style={{
                      background: data.isFullyCleared ? '#dcfce7' : '#fef9c3',
                      color: data.isFullyCleared ? '#166534' : '#854d0e',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 12
                    }}>
                      {data.isFullyCleared ? t('fullyCleared') : t('partiallyPaid')}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ 
          marginBottom: 20, 
          padding: '12px', 
          background: '#f8fafc', 
          borderRadius: 8, 
          fontSize: 13,
          border: '1px solid #e2e8f0'
        }}>
          <strong style={{ color: '#475569' }}>📝 {t('amountInWords')}:</strong>{' '}
          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {numberToWords(data.amountPaid || 0)} {t('rupeesOnly')}
          </span>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: 25,
          padding: '0 10px'
        }}>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ 
              borderTop: '2px solid #000', 
              width: '100%', 
              marginBottom: 5,
              paddingTop: 8
            }}></div>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
              {t('cashierSignature')}
            </p>
          </div>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ 
              borderTop: '2px solid #000', 
              width: '100%', 
              marginBottom: 5,
              paddingTop: 8
            }}></div>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
              {t('principalSignature')}
            </p>
          </div>
        </div>

        <div style={{ 
          marginTop: 15, 
          textAlign: 'center', 
          fontSize: 11, 
          color: '#94a3b8',
          borderTop: '1px dotted #cbd5e1',
          paddingTop: 10
        }}>
          ⚡ {t('computerGeneratedReceipt')}
        </div>
      </div>
    );
  };

  // ========== RETURN STATEMENT ==========
  return {

    // State
    tab, setTab,
    structures,
    dueReport,
    modal, setModal,
    collectModal, setCollectModal,
    duePaymentModal, setDuePaymentModal,
    feeDetails, setFeeDetails,           
    rollSearch, setRollSearch,
    loading,
    filterClass, setFilterClass,
    selectedDue, setSelectedDue,         
    receiptData,
    showReceipt, setShowReceipt,
    
    // Fee Collection - New states for common modal
    feeCollectionStudent, 
    setFeeCollectionStudent,
    feeCollectionLoading, 
    setFeeCollectionLoading,
    feeCollectionReceiptData, 
    setFeeCollectionReceiptData,
    feeCollectionShowReceipt, 
    setFeeCollectionShowReceipt,

    // Fee Record States
    recordModal,
    recordEnrollmentId,
    recordLoading,
    setRecordLoading,
    openRecordModal,
    closeRecordModal,

    // Fee Adjustment States
    adjustmentModal,
    adjustmentStudent,
    adjustmentLoading,
    setAdjustmentLoading,
    openAdjustmentModal,
    closeAdjustmentModal,
    handleSaveAdjustment,

    // ✅ NEW: Previous Dues States
    previousDues,
    isLoadingPreviousDues,
    loadPreviousDues,
    
    // Forms
    sForm, setSForm,
    cForm, setCForm,
    dueForm, setDueForm,

    // Form handlers
    handleSFormChange,
    handleCFormChange,
    handleDFormChange,

    // Functions
    loadStructures,
    loadDueReport,
    addStructure,
    archiveStructure,
    fetchStudentFeeDetails,
    collectFees,
    handlePayPreviousDue,
    payPreviousDue,
    handleFeeCollectionSuccess,

    // Due Report Action Handler
    handleDueReportAction,

    // Helpers
    structSections,
    secName,
    formatCurrency,
    formatDate,
    numberToWords,
    renderReceiptContent,

    // Data
    totalStructures: structures.length,
    totalDueReports: dueReport.length,

    // Constants
    academicYearName

  };
}
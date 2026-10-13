import API from "../libs/api";

const ExamResultService = {

  // ========== EXAM NAMES ==========
  getExamNames: (schoolId, academicYearId) => {
    return API.get(`/api/admin/results/exam-names?schoolId=${schoolId}&academicYearId=${academicYearId}`);
  },

  // ========== BULK MARKS UPLOAD ==========
  uploadBulkMarks: (schoolId, examScheduleId, academicYearId, requests) => {
    const url = `/api/admin/results/upload-bulk?schoolId=${schoolId}&examScheduleId=${examScheduleId}&academicYearId=${academicYearId}`;
    return API.post(url, requests);
  },

  // ========== CLASS RESULT SHEET ==========
  getClassResultSheet: (schoolId, classId, examName, academicYearId, sectionId = null) => {
    let url = `/api/admin/results/class-sheet/${schoolId}/${classId}?examName=${encodeURIComponent(examName)}&academicYearId=${academicYearId}`;
    if (sectionId) {
      url += `&sectionId=${sectionId}`;
    }
    return API.get(url);
  },

  // ========== STUDENT RESULT CARD ==========
  getStudentResultCard: (studentId, schoolId, examName, academicYearId) => {
    return API.get(`/api/admin/results/student-card/${studentId}?schoolId=${schoolId}&examName=${encodeURIComponent(examName)}&academicYearId=${academicYearId}`);
  },

  // ========== GET RESULT BY ROLL NUMBER ==========
  getResultByRollNumber: async (rollNumber, schoolId, classId, sectionId, examName, academicYearId) => {
    const enrollmentId = rollNumber;
    let url = `/api/admin/results/by-enrollment/${enrollmentId}/${schoolId}?classId=${classId}&examName=${encodeURIComponent(examName)}&academicYearId=${academicYearId}`;
    if (sectionId) {
      url += `&sectionId=${sectionId}`;
    }
    return API.get(url);
  },

  // ========== EXPORT CLASS RESULT TO EXCEL (UPDATED) ==========
  exportClassResultExcel: async (schoolId, classId, examName, academicYearId, sectionId = null) => {
    let url = `/api/admin/results/export-excel/${schoolId}/${classId}?examName=${encodeURIComponent(examName)}&academicYearId=${academicYearId}`;
    if (sectionId) {
      url += `&sectionId=${sectionId}`;
    }
    
    console.log('🟡 Export Excel URL:', url);
    
    try {
      // Use direct fetch for better blob handling
      const token = localStorage.getItem('ss_token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${baseURL}${url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream'
        }
      });
      
      console.log('🟢 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const blob = await response.blob();
      console.log('🟢 Blob received, size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Empty file received from server');
      }
      
      return blob;
      
    } catch (error) {
      console.error('🔴 Export error:', error);
      throw error;
    }
  }
};

export default ExamResultService;
// src/services/StudentsService.js

import API from "../libs/api";

const StudentsService = {

  // Get students by class (and optional section)
  getStudents: (schoolId, classId, sectionId, academicYearId) => {
    const yearId = academicYearId?.id || academicYearId;
    
    let url;
    
    if (classId && sectionId && sectionId !== '0' && sectionId !== 0) {
      url = `/api/admin/students/school/${schoolId}/class/${classId}/section/${sectionId}`;
    } else if (classId) {
      url = `/api/admin/students/school/${schoolId}/class/${classId}`;
    } else {
      url = `/api/admin/students/school/${schoolId}`;
    }

    const finalUrl = yearId ? `${url}?academicYearId=${yearId}` : url;
    
    return API.get(finalUrl);
  },

  // Advanced filter report
  getFilteredReport: (schoolId, classId, sectionId, gender, caste, academicYearId) => {
    const yearId = academicYearId?.id || academicYearId;
    
    let url = `/api/admin/students/report/filter/${schoolId}`;
    
    const params = new URLSearchParams();
    if (yearId) params.append('academicYearId', yearId);
    if (classId) params.append('classId', classId);
    if (sectionId && sectionId !== '0') params.append('sectionId', sectionId);
    if (gender) params.append('gender', gender);
    if (caste) params.append('caste', caste);
    
    const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;
    return API.get(finalUrl);
  },

  // Enroll new student
  enrollStudent: (schoolId, classId, sectionId, academicYearId, formData) => {
    const yearId = academicYearId?.id || academicYearId;
    const sId = sectionId && sectionId !== '0' ? sectionId : 0;
    
    const url = `/api/admin/students/onboard/${schoolId}/${classId}/${sId}?academicYearId=${yearId}`;
    
    return API.postFormData(url, formData);
  },

  // UPDATE existing student
  updateStudent: (studentId, formData) => {
    return API.putFormData(`/api/admin/students/update/${studentId}`, formData);
  },

  // Promote student using enrollmentId
  promoteStudent: (enrollmentId, newClassId, newSectionId, academicYearId, studentData = {}) => {
    const yearId = academicYearId?.id || academicYearId;
    const newSId = newSectionId && newSectionId !== '0' ? newSectionId : 0;
    
    const url = `/api/admin/students/update/enrollment/${enrollmentId}/${newClassId}/${newSId}?academicYearId=${yearId}`;
    
    return API.put(url, studentData);
  },

  // Get student by ID
  getStudentById: (studentId) => {
    return API.get(`/api/admin/students/${studentId}`);
  },

  // Delete/Inactivate student
  deleteStudent: (studentId) => {
    return API.delete(`/api/admin/students/delete/${studentId}`);
  },

  // Get caste statistics
  getCasteStats: (schoolId, academicYearId) => {
    const yearId = academicYearId?.id || academicYearId;
    return API.get(`/api/admin/students/stats/caste/${schoolId}?academicYearId=${yearId}`);
  },

  // Get gender statistics
  getGenderStats: (schoolId, academicYearId) => {
    const yearId = academicYearId?.id || academicYearId;
    return API.get(`/api/admin/students/stats/gender/${schoolId}?academicYearId=${yearId}`);
  },

  // ✅ EXPORT STUDENTS - Works with existing API.js
  exportStudentsExcel: (schoolId, classId, sectionId, academicYearId) => {
    const yearId = academicYearId?.id || academicYearId;
    
    const params = new URLSearchParams();
    if (yearId) params.append('academicYearId', yearId);
    if (classId) params.append('classId', classId);
    if (sectionId && sectionId !== '0' && sectionId !== 0) params.append('sectionId', sectionId);
    
    const queryString = params.toString();
    const url = `/api/admin/students/export-excel/${schoolId}${queryString ? '?' + queryString : ''}`;
    
    console.log('📊 Export URL:', url);
    
    // ✅ Using API.get with responseType: 'blob'
    // API.js returns the full response object when responseType is 'blob'
    return API.get(url, { responseType: 'blob' });
  }
};

export default StudentsService;
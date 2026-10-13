import API from "../libs/api";

const IDCardsService = {
  // ========== student ID CARDS ==========
  // Classes
  getClasses: (schoolId) => {
    return API.get(`/api/admin/classes/school/${schoolId}`);
  },

  // Sections
  getSections: (schoolId) => {
    return API.get(`/api/admin/classes/sections/school/${schoolId}`);
  },

  // Students
  getStudents: (schoolId, filterClass, filterSection, academicYearId) => {
    let url;

    if (filterClass && filterSection) {
      url = `/api/admin/students/school/${schoolId}/class/${filterClass}/section/${filterSection}`;
    } 
    else if (filterClass) {
      url = `/api/admin/students/school/${schoolId}/class/${filterClass}`;
    } 
    else {
      url = `/api/admin/students/school/${schoolId}`;
    }

    url = `${url}?academicYearId=${academicYearId}`;
    return API.get(url);
  },

  // Single ID card - FIXED
  generateIDCard: async (studentId, schoolId) => {
    const blob = await API.fetchFile(`/api/idcard/student/${studentId}/${schoolId}`);
    return blob; // This is now a Blob object
  },

  // Bulk ID cards - FIXED
  generateBulkIDCards: async (schoolId, classId, sectionId) => {
    const sec = sectionId || 0;
    const blob = await API.fetchFile(`/api/idcard/student/bulk/${schoolId}/${classId}/${sec}`);
    return blob; // This is now a Blob object
  },

  // ========== TEACHER ID CARDS ==========
  
  // Subjects
  getSubjects: (schoolId, academicYearId) => {
    return API.get(`/api/admin/subjects/all/${schoolId}?academicYearId=${academicYearId}`);
  },

  // Teachers
  getTeachers: (schoolId, filterSubject) => {
    let url = `/api/admin/teachers/school/${schoolId}`;
    if (filterSubject) {
      url += `?subjectId=${filterSubject}`;
    }
    return API.get(url);
  },

  // Single Teacher ID card - FIXED
  generateTeacherIDCard: async (teacherId, schoolId) => {
    const blob = await API.fetchFile(`/api/idcard/teacher/${teacherId}/${schoolId}`);
    return blob; // This is now a Blob object
  }
};

export default IDCardsService;
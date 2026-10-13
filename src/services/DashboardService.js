import API from "../libs/api";

const DashboardService = {

  // ==================== SHARED METHODS ====================
  
  getTeachers: (schoolId) => {
    return API.get(`/api/admin/teachers/school/${schoolId}`)
      .then(response => Array.isArray(response) ? response : [])
      .catch(error => {
        console.error('Error fetching teachers:', error);
        return [];
      });
  },

  getStudents: (schoolId, academicYearId) => {
    const url = academicYearId 
      ? `/api/admin/students/school/${schoolId}?academicYearId=${academicYearId}`
      : `/api/admin/students/school/${schoolId}`;
    return API.get(url)
      .then(response => Array.isArray(response) ? response : [])
      .catch(error => {
        console.error('Error fetching students:', error);
        return [];
      });
  },

  getClasses: (schoolId) => {
    return API.get(`/api/admin/classes/school/${schoolId}`)
      .then(response => Array.isArray(response) ? response : [])
      .catch(error => {
        console.error('Error fetching classes:', error);
        return [];
      });
  },

  getSections: (schoolId) => {
    return API.get(`/api/admin/classes/sections/school/${schoolId}`)
      .then(response => Array.isArray(response) ? response : [])
      .catch(error => {
        console.error('Error fetching sections:', error);
        return [];
      });
  },

  getSubjects: (schoolId, academicYearId) => {
    const url = academicYearId 
      ? `/api/admin/subjects/all/${schoolId}?academicYearId=${academicYearId}`
      : `/api/admin/subjects/all/${schoolId}`;
    return API.get(url)
      .then(response => Array.isArray(response) ? response : [])
      .catch(error => {
        console.error('Error fetching subjects:', error);
        return [];
      });
  },

  getMappings: (schoolId) => {
    return API.get(`/api/admin/mappings/school/${schoolId}`)
      .then(response => Array.isArray(response) ? response : [])
      .catch(error => {
        console.error('Error fetching mappings:', error);
        return [];
      });
  },

  // ==================== DEPARTMENT SPECIFIC ====================
  
  getDepartmentCounts: async (schoolId, academicYearId, permissions) => {
    const counts = {
      teachers: 0, students: 0, classes: 0, sections: 0,
      subjects: 0, mappings: 0, fees: 0, bus: 0, results: 0, attendance: 0
    };
    
    const promises = [];
    const permLower = permissions.map(p => p.toLowerCase());
    
    if (permLower.includes('teachers')) {
      promises.push(DashboardService.getTeachers(schoolId).then(data => { counts.teachers = data.length; }));
    }
    if (permLower.includes('students')) {
      promises.push(DashboardService.getStudents(schoolId, academicYearId).then(data => { counts.students = data.length; }));
    }
    if (permLower.includes('classes')) {
      promises.push(DashboardService.getClasses(schoolId).then(data => { counts.classes = data.length; }));
      promises.push(DashboardService.getSections(schoolId).then(data => { counts.sections = data.length; }));
    }
    if (permLower.includes('subjects')) {
      promises.push(DashboardService.getSubjects(schoolId, academicYearId).then(data => { counts.subjects = data.length; }));
    }
    if (permLower.includes('mapping')) {
      promises.push(DashboardService.getMappings(schoolId).then(data => { counts.mappings = data.length; }));
    }
    
    await Promise.all(promises);
    return counts;
  }
};

export default DashboardService;
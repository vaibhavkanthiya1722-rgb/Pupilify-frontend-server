import API from "../libs/api";

const TeachersService = {

  // Get all teachers for a school
  getTeachers: (schoolId) => {
    return API.get(`/api/admin/teachers/school/${schoolId}`);
  },

  // Onboard new teacher (with FormData)
  onboardTeacher: (formData) => {
    // Don't set Content-Type header - browser will set it automatically
    return API.postFormData(`/api/admin/teachers/onboard`, formData);
  },

  // Update teacher
  updateTeacher: (teacherId, teacherData) => {
    return API.put(`/api/admin/teachers/update/${teacherId}`, teacherData);
  },

  // Delete/Inactivate teacher
  deleteTeacher: (teacherId) => {
    return API.delete(`/api/admin/teachers/delete/${teacherId}`);
  }

};

export default TeachersService;
import API from "../libs/api";

const MappingService = {

  // Get all mappings for a school
  getMappings: (schoolId) => {
    return API.get(`/api/admin/mappings/school/${schoolId}`);
  },

  // Assign teacher to class/section
  assignTeacher: (classId, sectionId, teacherId, schoolId, academicYearId) => {
    const sId = sectionId && sectionId !== '0' ? sectionId : 0;
    const url = `/api/admin/mappings/assign/${classId}/${sId}/${teacherId}/${schoolId}?academicYearId=${academicYearId}`;
    return API.post(url);
  },

  // Delete mapping
  deleteMapping: (mappingId) => {
    return API.delete(`/api/admin/mappings/delete/${mappingId}`);
  }

};

export default MappingService;
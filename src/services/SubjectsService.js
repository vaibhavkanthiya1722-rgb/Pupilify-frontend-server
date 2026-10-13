import API from "../libs/api";

const SubjectsService = {

  getAllSubjects: (schoolId, academicYearId) => {
    return API.get(`/api/admin/subjects/all/${schoolId}?academicYearId=${academicYearId}`);
  },

  getFilteredSubjects: (schoolId, classId, sectionId, academicYearId) => {
    let url;
    if (sectionId && sectionId !== 'null' && sectionId !== '0') {
      url = `/api/admin/subjects/school/${schoolId}/class/${classId}/section/${sectionId}?academicYearId=${academicYearId}`;
    } else if (sectionId === 'null') {
      url = `/api/admin/subjects/school/${schoolId}/class/${classId}/section/0?academicYearId=${academicYearId}`;
    } else {
      url = `/api/admin/subjects/school/${schoolId}/class/${classId}?academicYearId=${academicYearId}`;
    }
    return API.get(url);
  },

  createSubject: (classId, sectionId, schoolId, academicYearId, subjectData) => {
    // sectionId will always have a valid value now
    const url = `/api/admin/subjects/create/${classId}/${sectionId}/${schoolId}?academicYearId=${academicYearId}`;
    return API.post(url, subjectData);
  },

  deleteSubject: (subjectId) => {
    return API.delete(`/api/admin/subjects/delete/${subjectId}`);
  }

};

export default SubjectsService;
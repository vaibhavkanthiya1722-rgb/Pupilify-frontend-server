import API from "../libs/api";

const TimetableService = {

  // View timetable for class/section
  viewTimetable: (schoolId, classId, sectionId, academicYearId) => {
    const secParam = sectionId && sectionId !== '0' ? sectionId : 0;
    return API.get(`/api/admin/timetable/view/${schoolId}/${classId}/${secParam}?academicYearId=${academicYearId}`);
  },

  // Assign slot to timetable
  assignSlot: (schoolId, classId, sectionId, slotData) => {
    const parsedSecId = sectionId && sectionId !== '0' ? parseInt(sectionId) : 0;
    const url = `/api/admin/timetable/assign/${schoolId}/${parseInt(classId)}/${parsedSecId}`;
    return API.post(url, slotData);
  },

  // Delete slot from timetable
  deleteSlot: (slotId) => {
    return API.put(`/api/admin/timetable/delete-slot/${slotId}`);
  }

};

export default TimetableService;
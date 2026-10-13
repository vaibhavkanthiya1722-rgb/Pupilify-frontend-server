import API from "../libs/api";

const ExamScheduleService = {

  // Get unique exam names for dropdown
  getExamNames: (schoolId, academicYearId) => {
    return API.get(`/api/admin/exams/exam-list/${schoolId}?academicYearId=${academicYearId}`);
  },

  // View exam timetable with filters
  viewTimetable: (schoolId, classId, academicYearId, sectionId = null, examName = null) => {
    let url = `/api/admin/exams/view-timetable/${schoolId}?classId=${classId}&academicYearId=${academicYearId}`;
    if (sectionId) {
      url += `&sectionId=${sectionId}`;
    }
    if (examName) {
      url += `&examName=${encodeURIComponent(examName)}`;
    }
    return API.get(url);
  },

  // Generate single exam schedule
  generateSchedule: (schoolId, classId, subjectId, academicYearId, scheduleData, sectionId = null) => {
    let url = `/api/admin/exams/generate/${schoolId}/${classId}?subjectId=${subjectId}&academicYearId=${academicYearId}`;
    if (sectionId) {
      url += `&sectionId=${sectionId}`;
    }
    return API.post(url, scheduleData);
  },

  // Bulk generate exam timetable for multiple subjects
  bulkGenerateSchedule: (schoolId, classId, academicYearId, schedules, sectionId = null) => {
    let url = `/api/admin/exams/bulk-generate/${schoolId}/${classId}?academicYearId=${academicYearId}`;
    if (sectionId) {
      url += `&sectionId=${sectionId}`;
    }
    return API.post(url, schedules);
  },

  // Delete/Deactivate exam schedule
  deleteSchedule: (scheduleId) => {
    return API.delete(`/api/admin/exams/delete/${scheduleId}`);
  }

};

export default ExamScheduleService;
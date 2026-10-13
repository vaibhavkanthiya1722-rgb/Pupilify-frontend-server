import API from "../libs/api";

const AttendanceService = {

  // View attendance for a class/date
  viewAttendance: (schoolId, classId, date, sectionId = null) => {
    let url = `/api/admin/attendance/view/${schoolId}/${classId}?date=${date}`;
    if (sectionId) url += `&sectionId=${sectionId}`;
    return API.get(url);
  },

  // Update attendance status
  updateAttendance: (attendanceId, status) => {
    return API.put(`/api/admin/attendance/update/${attendanceId}`, { status });
  },

  // Get student attendance percentage by student ID
  getStudentPercentage: (studentId) => {
    return API.get(`/api/admin/attendance/percentage/${studentId}`);
  },

  // Download Excel report using fetchFile (for blob)
  downloadExcel: (schoolId, classId, sectionId = null) => {
    let url = `/api/admin/attendance/download-excel/${schoolId}/${classId}`;
    if (sectionId) url += `?sectionId=${sectionId}`;
    return API.fetchFile(url);
  },

  // Preview attendance for export
  previewAttendance: (schoolId, classId, academicYearId, sectionId = null) => {
    let url = `/api/admin/attendance/preview/${schoolId}/${classId}?academicYearId=${academicYearId}`;
    if (sectionId) url += `&sectionId=${sectionId}`;
    return API.get(url);
  },

  // Export and purge attendance data (returns blob)
  exportAndPurge: (schoolId, classId, academicYearId, sectionId = null) => {
    let url = `/api/admin/attendance/export-and-purge/${schoolId}/${classId}?academicYearId=${academicYearId}`;
    if (sectionId) url += `&sectionId=${sectionId}`;
    return API.fetchFile(url);
  }

};

export default AttendanceService;
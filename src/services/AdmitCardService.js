import StudentsService from "./StudentsService";
import ExamScheduleService from "./ExamScheduleService";

const AdmitCardService = {
  getExamNames: (schoolId, academicYearId) =>
    ExamScheduleService.getExamNames(schoolId, academicYearId),

  getStudents: (schoolId, classId, sectionId, academicYearId) =>
    StudentsService.getStudents(schoolId, classId, sectionId, academicYearId),

  getTimetable: (schoolId, classId, academicYearId, sectionId, examName) =>
    ExamScheduleService.viewTimetable(
      schoolId,
      classId,
      academicYearId,
      sectionId || null,
      examName || null
    ),
};

export default AdmitCardService;

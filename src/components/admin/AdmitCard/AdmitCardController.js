import { useCallback, useEffect, useMemo, useState } from "react";
import AdmitCardService from "../../../services/AdmitCardService";

export default function AdmitCardController({
  schoolId,
  classes = [],
  sections = [],
  academicYearId,
  academicYearName,
  onToast,
  t = (key) => key,
}) {
  const getStudentKey = (student, index = 0) =>
    student.id || student.enrollmentId || student.enrollmentNumber || `student-${index}`;

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [examNames, setExamNames] = useState([]);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [generatedStudents, setGeneratedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [printStudentId, setPrintStudentId] = useState(null);

  const availableSections = useMemo(
    () =>
      selectedClass
        ? sections.filter((section) => String(section.classId) === String(selectedClass))
        : [],
    [selectedClass, sections]
  );

  const loadExamNames = useCallback(async () => {
    if (!schoolId || !academicYearId) return;
    try {
      const data = await AdmitCardService.getExamNames(schoolId, academicYearId);
      setExamNames(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Unable to load examination names:", requestError);
      onToast?.(t("admitUnableToLoadExaminations"), "error");
    }
  }, [academicYearId, onToast, schoolId, t]);

  useEffect(() => {
    loadExamNames();
  }, [loadExamNames]);

  const loadStudentsAndTimetable = async () => {
    if (!selectedClass || !selectedExam) {
      setError(t("admitSelectClassExam"));
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedStudents([]);
    try {
      const [studentData, scheduleData] = await Promise.all([
        AdmitCardService.getStudents(
          schoolId,
          selectedClass,
          selectedSection,
          academicYearId
        ),
        AdmitCardService.getTimetable(
          schoolId,
          selectedClass,
          academicYearId,
          selectedSection,
          selectedExam
        ),
      ]);

      setStudents(Array.isArray(studentData) ? studentData : []);
      setTimetable(Array.isArray(scheduleData) ? scheduleData : []);
      setSelectedStudentIds([]);
      if ((!studentData || studentData.length === 0) && onToast) {
        onToast(t("admitNoStudents"), "info");
      }
      if ((!scheduleData || scheduleData.length === 0) && onToast) {
        onToast(t("admitNoTimetable"), "info");
      }
    } catch (requestError) {
      console.error("Unable to load Admit Card data:", requestError);
      setStudents([]);
      setTimetable([]);
      setError(t("admitUnableToLoadData"));
      onToast?.(t("admitUnableToLoadData"), "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const toggleAllStudents = () => {
    setSelectedStudentIds((current) =>
      current.length === students.length
        ? []
        : students.map((student, index) => getStudentKey(student, index))
    );
  };

  const generateCards = () => {
    const cards = students.filter((student, index) =>
      selectedStudentIds.includes(getStudentKey(student, index))
    );
    if (cards.length === 0) {
      setError(t("admitSelectStudent"));
      return;
    }
    setGeneratedStudents(cards);
    setPrintStudentId(null);
    setError("");
  };

  const printCard = (studentId) => {
    setPrintStudentId(studentId);
    window.setTimeout(() => window.print(), 0);
  };

  const printAll = () => {
    if (generatedStudents.length === 0) {
      setError(t("admitGenerateFirst"));
      return;
    }
    setPrintStudentId(null);
    window.setTimeout(() => window.print(), 0);
  };

  return {
    academicYearName,
    academicYearId,
    classes,
    availableSections,
    selectedClass,
    setSelectedClass: (value) => {
      setSelectedClass(value);
      setSelectedSection("");
      setStudents([]);
      setTimetable([]);
      setGeneratedStudents([]);
      setSelectedStudentIds([]);
    },
    selectedSection,
    setSelectedSection,
    examNames,
    selectedExam,
    setSelectedExam,
    students,
    timetable,
    selectedStudentIds,
    getStudentKey,
    generatedStudents,
    loading,
    error,
    toggleStudent,
    toggleAllStudents,
    generateCards,
    printCard,
    printAll,
    printStudentId,
    loadStudentsAndTimetable,
  };
}

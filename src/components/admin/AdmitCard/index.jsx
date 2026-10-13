import React from "react";
import { useTranslation } from "react-i18next";
import AdmitCardController from "./AdmitCardController";
import AdmitCardPrint from "./AdmitCardPrint";

const groupStudents = (students, groupSize) =>
  students.reduce((groups, student, index) => {
    const groupIndex = Math.floor(index / groupSize);
    if (!groups[groupIndex]) groups[groupIndex] = [];
    groups[groupIndex].push(student);
    return groups;
  }, []);

function AdmitCard({ schoolId, classes, sections, academicYearId, academicYearName, user }) {
  const { t } = useTranslation();
  const controller = AdmitCardController({
    schoolId,
    classes,
    sections,
    academicYearId,
    academicYearName,
    t,
  });
  const selectedClass = classes.find((item) => String(item.id) === String(controller.selectedClass));
  const studentGroups = groupStudents(controller.generatedStudents, 2);
  const labels = {
    examination: t("admitExamination"),
    academicYear: t("academicYear"),
    admitCard: t("admitCard"),
    studentName: t("name"),
    fatherName: t("fatherName"),
    enrollmentId: t("enrollmentId"),
    rollNumber: t("rollNumber"),
    className: t("class"),
    section: t("section"),
    timetable: t("examTimetable"),
    subject: t("subject"),
    examDate: t("examDate"),
    startTime: t("startTime"),
    endTime: t("endTime"),
    teacherSignature: t("teacherSignature"),
    principalSignature: t("principalSignature"),
    noTimetable: t("noExamSchedulesFound"),
    photo: t("studentPhoto"),
    schoolName: t("schoolName"),
  };

  return (
    <div className={`admit-card-module admit-card-print-root ${controller.printStudentId ? "admit-card-single-print" : ""}`}>
      <div className="admit-card-screen">
        <h2>
  <span style={{ marginRight: "10px" }}>🎫</span>
  Admit Card Print
</h2>
        <div className="admit-card-toolbar">
          <div className="admit-card-field"><label>{t("academicYear")}</label><select value={academicYearId || ""} disabled><option value={academicYearId}>{academicYearName || t("academicYear")}</option></select></div>
          <div className="admit-card-field"><label>{t("class")}</label><select value={controller.selectedClass} onChange={(event) => controller.setSelectedClass(event.target.value)}><option value="">{t("selectClass")}</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.className}</option>)}</select></div>
          <div className="admit-card-field"><label>{t("section")}</label><select value={controller.selectedSection} onChange={(event) => controller.setSelectedSection(event.target.value)} disabled={!controller.selectedClass}><option value="">{t("allSections")}</option>{controller.availableSections.map((item) => <option key={item.id} value={item.id}>{item.sectionName}</option>)}</select></div>
          <div className="admit-card-field"><label>{t("examName")}</label><select value={controller.selectedExam} onChange={(event) => controller.setSelectedExam(event.target.value)}><option value="">{t("selectExam")}</option>{controller.examNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></div>
          <button className="admit-card-btn" onClick={controller.loadStudentsAndTimetable} disabled={controller.loading}>{controller.loading ? t("loading") : t("loadStudents")}</button>
        </div>
        {controller.error && <div className="admit-card-message">{controller.error}</div>}
        {controller.students.length > 0 && <div className="admit-card-panel">
          <strong>{selectedClass?.className || t("class")} {t("students")}</strong>
          <label className="admit-card-student-item"><input type="checkbox" checked={controller.selectedStudentIds.length === controller.students.length} onChange={controller.toggleAllStudents} /> {t("selectAll")}</label>
          <div className="admit-card-student-list">{controller.students.map((student, index) => {
            const studentKey = controller.getStudentKey(student, index);
            return <label className="admit-card-student-item" key={studentKey}><input type="checkbox" checked={controller.selectedStudentIds.includes(studentKey)} onChange={() => controller.toggleStudent(studentKey)} /> <span>{student.name || t("unnamedStudent")}<br /><small>{student.rollNumber || student.enrollmentId || ""}</small></span></label>;
          })}</div>
          <div className="admit-card-actions"><button className="admit-card-btn" onClick={controller.generateCards}>{t("generatePreview")}</button><button className="admit-card-btn secondary" onClick={controller.printAll} disabled={controller.generatedStudents.length === 0}>{t("printAll")}</button></div>
        </div>}
      </div>
      <div className="admit-card-preview">
        {studentGroups.map((group, groupIndex) => (
          <div className="admit-card-print-sheet" key={`admit-card-sheet-${groupIndex}`}>
            {group.map((student, index) => (
              <AdmitCardPrint
                key={controller.getStudentKey(student, groupIndex * 2 + index)}
                student={student}
                timetable={controller.timetable}
                examName={controller.selectedExam}
                academicYearName={academicYearName}
                user={user}
                printStudentId={controller.printStudentId}
                labels={labels}
              />
            ))}
          </div>
        ))}
        {controller.generatedStudents.length > 0 && <div className="admit-card-screen admit-card-actions"><button className="admit-card-btn" onClick={() => controller.printCard(controller.getStudentKey(controller.generatedStudents[0]))}>{t("print")}</button></div>}
      </div>
    </div>
  );
}

export default AdmitCard;

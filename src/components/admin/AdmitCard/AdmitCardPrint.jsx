import React, { useEffect, useState } from "react";
import PriOverviewService from "../../../services/PriOverviewService";
import { API_URL } from "../../../libs/constants";

const valueOrDash = (value) => value || "—";

function AdmitCardPrint({
  student,
  timetable,
  examName,
  academicYearName,
  user,
  printStudentId,
  labels,
}) {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    if (!student?.studentPhoto) {
      setPhotoUrl(null);
      return undefined;
    }

    const filename = student.studentPhoto.split(/[\\/]/).pop();
    const token = localStorage.getItem("ss_token");

    fetch(`${API_URL}/api/admin/students/files/${encodeURIComponent(filename)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Photo request failed with status ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        if (!cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setPhotoUrl(objectUrl);
        }
      })
      .catch((error) => {
        console.error("Unable to load student photo:", error);
        if (!cancelled) setPhotoUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [student?.studentPhoto]);

  if (!student) return null;

  const className = student.schoolClass?.className || student.className;
  const sectionName = student.section?.sectionName || student.sectionName;
  const studentKey =
    student.id || student.enrollmentId || student.enrollmentNumber;
  const schoolName =
    student.school?.schoolName ||
    student.schoolClass?.school?.schoolName ||
    user?.schoolName ||
    "School";
  const schoolLogo =
    student.school?.logo ||
    student.schoolClass?.school?.logo ||
    user?.schoolLogo ||
    localStorage.getItem("ss_school_logo");
  const logoUrl = schoolLogo ? PriOverviewService.getLogoUrl(schoolLogo) : null;
  return (
    
    
         <article
  className={`admit-card-page admit-card-subjects-${timetable.length} ${
    printStudentId && String(printStudentId) !== String(studentKey)
      ? "admit-card-not-print-target"
      : ""
  }`}
>
      <div className="admit-card-border">
        <header className="admit-card-header">
          {logoUrl ? <img className="admit-card-logo" src={logoUrl} alt={labels.schoolName || "School"} /> : <div className="admit-card-logo-placeholder">{labels.schoolName || "School"}</div>}
          {/* <div>
            <h1>{schoolName}</h1>
            <p>{labels.admitCard}</p>
          </div> */}
          <div>
  <h1>{schoolName}</h1>
  <p className="school-address">
    {student?.school?.address ||
      student?.schoolClass?.school?.address ||
      user?.address ||
      "School Address"}
  </p>
</div>
        </header>

        <div className="admit-card-exam">
          <span>{labels.examination}</span>
          <strong>{valueOrDash(examName)}</strong>
          <span>{labels.academicYear}</span>
          <strong>{valueOrDash(academicYearName)}</strong>
        </div>

        <section className="admit-card-student">
          <div className="admit-card-details">
            <div><b>{labels.studentName}</b><span>{valueOrDash(student.name)}</span></div>
            <div><b>{labels.fatherName}</b><span>{valueOrDash(student.fatherName)}</span></div>           
            <div><b>{labels.rollNumber}</b><span>{valueOrDash(student.rollNumber)}</span></div>
            <div><b>{labels.className}</b><span>{valueOrDash(className)}</span></div>
            <div><b>{labels.section}</b><span>{valueOrDash(sectionName)}</span></div>
          </div>
          <div className="admit-card-photo">
            {photoUrl ? <img src={photoUrl} alt={labels.photo} onError={() => setPhotoUrl(null)} /> : <span>{labels.photo}</span>}
          </div>
        </section>

        <h2>{labels.timetable}</h2>
        {timetable.length > 0 ? (
          <table className="admit-card-table">
            <thead><tr><th>{labels.subject}</th><th>{labels.examDate}</th><th>{labels.startTime}</th><th>{labels.endTime}</th></tr></thead>
            <tbody>
              {timetable.map((item) => (
                <tr key={item.id || `${item.subject?.subjectName}-${item.examDate}`}>
                  <td>{valueOrDash(item.subject?.subjectName || item.subject)}</td>
                  {/* <td>{valueOrDash(item.examDate)}</td> */}
                  <td>
  {item.examDate
    ? (() => {
        const [year, month, day] = item.examDate.split("-");
        return `${day}-${month}-${year}`;
      })()
    : "-"}
</td>
                  <td>{valueOrDash(item.startTime)}</td>
                  <td>{valueOrDash(item.endTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="admit-card-empty">{labels.noTimetable}</p>}

        <footer className="admit-card-footer">
          <span>{labels.teacherSignature}</span>
          <span>{labels.principalSignature}</span>
        </footer>
      </div>
    </article>
  );
}

export default AdmitCardPrint;

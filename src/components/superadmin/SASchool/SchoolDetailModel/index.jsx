import React from "react";
import { useTranslation } from "react-i18next";
import SAModal from "../../commonFile/SAModal";
import SchoolDetailController from "./SchoolDetailController";
import ConfirmationDialog from "../../../common/table-componets/confirmation-dialog";

function SchoolDetailModal({ school, onClose, onToast }) {
      const { t } = useTranslation(); 

  const {
    tab,
    setTab,
    students,
    teachers,
    classes,
    sections,
    loading,
    load,
    confirmDialog,
    showDeleteConfirmation,
    handleConfirmDelete,
    closeConfirmDialog
  } = SchoolDetailController(school, onToast);

  const TABS = [
    { key: "students", label: t("students"), count: students.length, icon: "👥" },
    { key: "teachers", label: t("teachers"), count: teachers.length, icon: "👨‍🏫" },
    { key: "classes", label: t("classes"), count: classes.length, icon: "🏛️" },
    { key: "sections", label: t("sections"), count: sections.length, icon: "📑" }
  ];

  const statusColor = (s) => {
    const colors = {
      ACTIVE: { bg: "#10b981", text: "#fff" },
      TRIAL: { bg: "#f59e0b", text: "#fff" },
      EXPIRED: { bg: "#ef4444", text: "#fff" },
      INACTIVE: { bg: "#6b7280", text: "#fff" }
    };
    return colors[s] || colors.TRIAL;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("notAvailable");
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStudents = () => (
    <div className="table-wrap">
      <table className="sa-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t("rollNo")}</th>
            <th>{t("studentName")}</th>
            <th>{t("classAndSection")}</th>
            <th>{t("fathersName")}</th>
            <th>{t("contact")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">{t("noStudentsFound")}</td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>
                  <span className="roll-number">{student.rollNumber || '—'}</span>
                </td>
                <td>
                  <div className="user-info">
                    <span className="user-name">{student.name}</span>
                    {student.email && <small>{student.email}</small>}
                  </div>
                </td>
                <td>
                  {student.schoolClass?.className || '—'}
                  {student.section && ` / ${student.section.sectionName}`}
                </td>
                <td>{student.fatherName || '—'}</td>
                <td>
                  {student.phoneNo && (
                    <div className="contact-info">
                      <span>📞 {student.phoneNo}</span>
                    </div>
                  )}
                </td>
                <td>
                  <button
                    className="action-btn delete"
                    onClick={() => showDeleteConfirmation('student', student.id, student.name)}
                    title={t("deleteStudent")}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTeachers = () => (
    <div className="table-wrap">
      <table className="sa-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t("teacherName")}</th>
            <th>{t("qualification")}</th>
            <th>{t("expertise")}</th>
            <th>{t("contact")}</th>
            <th>{t("salary")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">{t("noTeachersFound")}</td>
            </tr>
          ) : (
            teachers.map((teacher, index) => (
              <tr key={teacher.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="user-info">
                    <span className="user-name">{teacher.name}</span>
                    {teacher.mail && <small>{teacher.mail}</small>}
                  </div>
                </td>
                <td>{teacher.qualification || '—'}</td>
                <td>{teacher.subjectExpertise || '—'}</td>
                <td>
                  {teacher.phoneNumber && (
                    <div className="contact-info">
                      <span>📞 {teacher.phoneNumber}</span>
                      {teacher.alternateNumber && (
                        <small>Alt: {teacher.alternateNumber}</small>
                      )}
                    </div>
                  )}
                </td>
                <td>₹{teacher.salary?.toLocaleString() || '—'}</td>
                <td>
                  <button
                    className="action-btn delete"
                    onClick={() => showDeleteConfirmation('teacher', teacher.id, teacher.name)}
                    title={t("deleteTeacher")}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderClasses = () => (
    <div className="grid-container">
      {classes.length === 0 ? (
        <div className="text-center">{t("noClassesFound")}</div>
      ) : (
        <div className="class-grid">
          {classes.map((cls, index) => (
            <div key={cls.id} className="class-card">
              <div className="class-header">
                <span className="class-icon">📖</span>
                <h3>{cls.className}</h3>
                <span className="class-id">#{cls.id}</span>
              </div>
              <div className="class-details">
                <p>
                  <strong>{t("totalSections")}:</strong>{' '}
                  {sections.filter(s => s.classId === cls.id).length}
                </p>
                <p>
                  <strong>{t("totalStudents")}:</strong>{' '}
                  {students.filter(s => s.schoolClass?.id === cls.id).length}
                </p>
                <p>
                  <strong>{t("status")}:</strong>{' '}
                  <span className={`status-badge ${cls.active ? 'active' : 'inactive'}`}>
                    {cls.active ? t("active") : t("inactive")}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSections = () => (
    <div className="table-wrap">
      <table className="sa-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t("sectionName")}</th>
            <th>{t("class")}</th>
            <th>{t("studentsCount")}</th>
          </tr>
        </thead>
        <tbody>
          {sections.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">{t("noSectionsFound")}</td>
            </tr>
          ) : (
            sections.map((section, index) => (
              <tr key={section.id}>
                <td>{index + 1}</td>
                <td>
                  <span className="section-name">{section.sectionName}</span>
                </td>
                <td>{section.className || '—'}</td>
                <td>
                  {students.filter(s => s.section?.id === section.id).length}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (tab) {
      case 'students': return renderStudents();
      case 'teachers': return renderTeachers();
      case 'classes': return renderClasses();
      case 'sections': return renderSections();
      default: return null;
    }
  };

  return (
    <>
      <SAModal title={`🏫 ${school.schoolName}`} onClose={onClose} wide>
        {/* School Info Banner */}
        <div className="school-info-banner">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">{t("email")}</span>
              <span className="info-value">{school.mailId || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t("phone")}</span>
              <span className="info-value">{school.phoneNumber || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t("address")}</span>
              <span className="info-value">{school.address || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t("academicYear")}</span>
              <span className="info-value">
                {school.currentYear?.currentYear || '—'}
              </span>
            </div>
            {/* New State and District fields */}
            <div className="info-item">
              <span className="info-label">{t("state")}</span>
              <span className="info-value">{school.state?.name || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t("district")}</span>
              <span className="info-value">{school.district?.name || '—'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t("createdOn")}</span>
              <span className="info-value">{formatDate(school.createdAt)}</span>
            </div>
          </div>

          <div className="banner-actions">
            <span
              className="status-badge-large"
              style={{
                backgroundColor: statusColor(school.subscriptionStatus).bg,
                color: statusColor(school.subscriptionStatus).text
              }}
            >
              {t(school.subscriptionStatus?.toLowerCase() || 'trial')}
            </span>

            <button
              className="refresh-btn"
              onClick={load}
              title={t("refreshData")}
            >
              ↻ {t("refresh")}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
              <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t("loadingMessage", { tab: t(tab) })}</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </SAModal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        handleClose={closeConfirmDialog}
        handleConfirm={handleConfirmDelete}
        title={t("deleteTitle", { type: confirmDialog.type === 'student' ? t('student') : t('teacher') })}
        message={t("deleteConfirmationMessage", { name: confirmDialog.name })}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
      />
    </>
  );
}

export default SchoolDetailModal;
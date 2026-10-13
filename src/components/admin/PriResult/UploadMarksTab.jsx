import React from 'react';
import { useTranslation } from 'react-i18next';
import TableSkeleton from "../../loaders/TableSkeleton";

const UploadMarksTab = ({ 
  filterClass, 
  examSchedules, 
  loading, 
  onOpenUploadModal,
  formatDate,
  formatTime 
}) => {
  const { t } = useTranslation(); 
  
  return (
    <div className="pri-card">
      <div className="pri-topbar">
        <h3>📤 {t("uploadMarksSelectExamSchedule")}</h3>
      </div>
      
      {!filterClass ? (
        <div className="pri-empty" style={{ padding: 40 }}>
          <div className="pri-empty-icon">📚</div>
          <p>{t("pleaseSelectAClassFirst")}</p>
        </div>
      ) : loading ? (
        // Show skeleton loader while loading
        <div className="table-wrap">
          <TableSkeleton rows={5} columns={9} />
        </div>
      ) : examSchedules.length === 0 ? (
        <div className="pri-empty" style={{ padding: 40 }}>
          <div className="pri-empty-icon">📝</div>
          <p>{t("noExamSchedulesFoundForThisClass")}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="pri-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("examName")}</th>
                <th>{t("subject")}</th>
                <th>{t("maxTheoryMarks")}</th>
                <th>{t("maxPracticalMarks")}</th>
                <th>{t("date")}</th>
                <th>{t("time")}</th>
                <th>{t("section")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {examSchedules.map((schedule, idx) => (
                <tr key={schedule.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{schedule.examName}</strong></td>
                  <td>{schedule.subject?.subjectName}</td>
                  <td>{schedule.subject?.totalTheoryMarks || 100}</td>
                  <td>{schedule.subject?.hasPractical ? (schedule.subject?.totalPracticalMarks || 50) : '-'}</td>
                  <td>{formatDate(schedule.examDate)}</td>
                  <td>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</td>
                  <td>{schedule.section?.sectionName || t("allSections")}</td>
                  <td>
                    <button
                      className="pri-btn pri-btn-primary pri-btn-sm"
                      onClick={() => onOpenUploadModal(schedule)}
                      disabled={loading}
                    >
                      📤 {t("uploadMarks")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UploadMarksTab;
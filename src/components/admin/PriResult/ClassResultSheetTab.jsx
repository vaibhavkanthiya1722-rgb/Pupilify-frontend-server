import React from 'react';
import { useTranslation } from 'react-i18next';
import TableSkeleton from "../../loaders/TableSkeleton"; 

const ClassResultSheetTab = ({ classResult, loading, formatPercentage, getGradeColor }) => {
  const { t } = useTranslation(); 

  if (loading) {
    return (
      <div className="pri-card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
        <p style={{ fontWeight: 600, color: '#64748b' }}>{t("loadingClassResult")}</p>
        {/* Show skeleton loader while loading */}
        <div style={{ marginTop: 20 }}>
          <TableSkeleton rows={5} columns={8} />
        </div>
      </div>
    );
  }

  if (!classResult) {
    return (
      <div className="pri-card" style={{ padding: 40, textAlign: 'center' }}>
        <div className="pri-empty-icon" style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <p style={{ fontWeight: 600, color: '#64748b' }}>{t("selectClassAndExamNameToLoadResultSheet")}</p>
      </div>
    );
  }

  // Extract data from response
  const {
    schoolName,
    className,
    sectionName,
    examName,
    academicYear,
    subjectNames = [],
    studentRows = [],
    totalStudents = 0,
    totalPassed = 0,
    totalFailed = 0
  } = classResult;

  // Calculate pass percentage
  const passPercentage = totalStudents > 0 ? (totalPassed / totalStudents) * 100 : 0;


  return (
    <div className="pri-card">
      {/* Header */}
      <div className="pri-topbar">
        <div>
          <h3 style={{ margin: 0 }}>
            📋 {t("resultSheet")} - {className} {sectionName && `- ${sectionName}`}
          </h3>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            {schoolName} | {examName} | {t("academicYear")}: {academicYear}
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, textAlign: 'right' }}>
          {t("totalStudents")}: {totalStudents} | {t("passed")}: {totalPassed} | {t("failed")}: {totalFailed}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        padding: 16,
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ background: '#e0f2fe', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#0369a1' }}>{t("totalStudents")}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0369a1' }}>{totalStudents}</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#16a34a' }}>{t("passed")}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{totalPassed}</div>
        </div>
        <div style={{ background: '#fef2f2', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#dc2626' }}>{t("failed")}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>{totalFailed}</div>
        </div>
        <div style={{ background: '#fef9c3', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#854d0e' }}>{t("passPercentage")}</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#854d0e' }}>
            {passPercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="table-wrap">
        {loading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : (
          <table className="pri-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("rollNo")}</th>
                <th>{t("enrollmentId")}</th>
                <th>{t("studentName")}</th>
                {subjectNames.map((subject, index) => (
                  <th key={index} colSpan={3} style={{ textAlign: 'center' }}>
                    {subject}
                    <div style={{ fontSize: 10, fontWeight: 'normal', color: '#64748b' }}>
                      {t("theoryPracticalTotal")}
                    </div>
                  </th>
                ))}
                <th>{t("total")}</th>
                <th>{t("percentage")}</th>
                <th>{t("grade")}</th>
                <th>{t("rank")}</th>
                <th>{t("result")}</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map((student, idx) => (
                <tr key={idx} style={{
                  background: student.passed ? 'transparent' : '#fff5f5'
                }}>
                  <td>{idx + 1}</td>
                  <td><strong>{student.rollNumber}</strong></td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{student.enrollmentId}</td>
                  <td><strong>{student.studentName}</strong></td>
                  
                  {student.subjectMarks?.map((mark, subIdx) => (
                    <React.Fragment key={subIdx}>
                      <td style={{ textAlign: 'center' }}>
                        {mark.absent ? 'AB' : (mark.theoryObtained ?? '—')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {mark.absent ? 'AB' : (mark.practicalObtained ?? '—')}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {mark.absent ? 'AB' : (mark.totalObtained ?? '—')}
                      </td>
                    </React.Fragment>
                  ))}
                  
                  <td style={{ fontWeight: 700, textAlign: 'center' }}>
                    {student.totalObtained}/{student.totalMax}
                  </td>
                  <td style={{ fontWeight: 700, textAlign: 'center' }}>
                    {formatPercentage(student.percentage)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      background: getGradeColor(student.grade),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {student.grade || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    #{student.rank}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      color: student.passed ? '#16a34a' : '#dc2626',
                      fontWeight: 700,
                      background: student.passed ? '#f0fdf4' : '#fef2f2',
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12
                    }}>
                      {student.absent ? 'ABSENT' : (student.passed ? 'PASS' : 'FAIL')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Empty State */}
      {(!loading && (!studentRows || studentRows.length === 0)) && (
        <div className="pri-empty" style={{ padding: 40 }}>
          <div className="pri-empty-icon" style={{ fontSize: 48 }}>📭</div>
          <p style={{ fontWeight: 600, color: '#64748b' }}>{t("noStudentRecordsFound")}</p>
        </div>
      )}
    </div>
  );
};

export default ClassResultSheetTab;
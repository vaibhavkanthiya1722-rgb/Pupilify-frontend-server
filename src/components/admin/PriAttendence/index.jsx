import { useState } from "react";
import PriModal from "../PriModal";
import SectionBadge from "../SectionBadge";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";
import PriAttendanceController from "./PriAttendanceController";
import TableSkeleton from "../../loaders/TableSkeleton";
import { useTranslation } from 'react-i18next';

function PriAttendance({
  schoolId,
  token,
  classes,
  sections,
  onToast,
  academicYearId,
  academicYearName
}) {
  const { t } = useTranslation(); 

  const {
    // State
    classId, setClassId,
    secId, setSecId,
    date, setDate,
    records,
    loaded,
    editRoll, setEditRoll,
    updating,

    studentRoll, setStudentRoll,
    history,
    percentage,

    expClassId, setExpClassId,
    expSecId, setExpSecId,
    previewRecords,
    previewLoaded,
    previewLoading,
    purgeModal,
    purgeConfirmVal, setPurgeConfirmVal,
    exportStatus,

    filteredSections,
    expFilteredSections,
    expClassName,
    expSecName,

    // Statistics
    totalPresent,
    totalAbsent,
    totalLeave,
    uniqueStudents,
    uniqueDates,

    // Functions
    viewAttendance,
    updateStatus,
    downloadExcel,
    filterStudentRecords,
    getStudentAttendance,
    generatePreview,
    openPurgeConfirm,
    handleExportAndPurge,
    closePurgeModal,

    // Constants
    PURGE_KEYWORD

  } = PriAttendanceController({
    schoolId,
    classes,
    sections,
    onToast,
    academicYearId,
    academicYearName,
    t
  });

  const [tab, setTab] = useState('view');

  // 🔥 Dropdown handlers for View Tab
  const handleClassChange = (option) => {
    setClassId(option?.id || '');
    setSecId('');
  };

  const handleSectionChange = (option) => {
    setSecId(option?.id || '');
  };

  // 🔥 Dropdown handlers for Export Tab
  const handleExpClassChange = (option) => {
    setExpClassId(option?.id || '');
    setExpSecId('');
  };

  const handleExpSectionChange = (option) => {
    setExpSecId(option?.id || '');
  };

  // 🔥 Get selected values for View Tab
  const selectedClass = classes?.find(c => String(c.id) === String(classId)) || null;
  const selectedSection = filteredSections?.find(s => String(s.id) === String(secId)) || null;

  // 🔥 Get selected values for Export Tab
  const selectedExpClass = classes?.find(c => String(c.id) === String(expClassId)) || null;
  const selectedExpSection = expFilteredSections?.find(s => String(s.id) === String(expSecId)) || null;

  return (
    <div className="pri-content">
      {/* Header */}
      <div className="mb">
        <div className="content-heading">
          📋 {t('attendanceManagement')}
        </div>
        <div className="content-text">
          {t('attendanceDescription')} • {academicYearName && <span>{academicYearName}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tally-tabs">
        {[
          ['view', `📋 ${t('classAttendance')}`],
          ['student', `👤 ${t('studentHistory')}`],
          ['export', `📦 ${t('exportAndArchive')}`],
        ].map(([tKey, label]) => (
          <button
            key={tKey}
            className={`tally-tab ${tab === tKey ? ' active' : ''}`}
            onClick={() => setTab(tKey)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: VIEW ATTENDANCE */}
      {tab === 'view' && (
        <>
          <div className="pri-filter-bar">
            <div className="pri-form-field">
              <label>{t('class')} *</label>
              {/* 🔥 Class Dropdown */}
              <PriAutocompleteSelect
                value={selectedClass}
                data={classes || []}
                onChange={handleClassChange}
                placeholder={t('selectClass')}
                optionLabel="className"
                optionValue="id"
                disabled={updating}
                size="medium"
                clearable
                required
              />
            </div>
            <div className="pri-form-field">
              <label>{t('section')}</label>
              {/* 🔥 Section Dropdown - Only actual sections */}
              <PriAutocompleteSelect
                key={classId || "no-class"}
                value={selectedSection}
                data={filteredSections || []}
                onChange={handleSectionChange}
                placeholder={t('selectSection')}
                optionLabel="sectionName"
                optionValue="id"
                disabled={!classId || updating}
                size="medium"
                clearable
              />
            </div>
            <div className="pri-form-field">
              <label>{t('date')} *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={updating} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pri-btn pri-btn-primary" onClick={viewAttendance} disabled={updating}>
                📋 {t('viewAttendance')}
              </button>

              <button
                className="pri-btn pri-btn-ghost"
                onClick={downloadExcel}
                disabled={!classId || updating}
              >
                {updating ? `⏳ ${t('downloading')}...` : `📥 ${t('downloadExcel')}`}
              </button>
            </div>
          </div>

          {loaded && (
            <div className="pri-card">
              <div className="pri-toolbar">
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e3a5f' }}>
                  {t('recordsForDate', { count: records.length, date: date })}
                </span>
                <div style={{ display: 'flex', gap: 14 }}>
                  <span className="font-size-13 success">
                    ✓ {records.filter(r => r.status === 'Present').length} {t('present')}
                  </span>
                  <span className="font-size-13 danger">
                    ✗ {records.filter(r => r.status === 'Absent').length} {t('absent')}
                  </span>
                  <span className="font-size-13 warning">
                    ⊘ {records.filter(r => r.status === 'Leave').length} {t('leave')}
                  </span>
                </div>
              </div>
              <div className="table-wrap">
                {updating && records.length === 0 ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : (
                  <table className="pri-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t('rollNo')}</th>
                        <th>{t('studentName')}</th>
                        <th>{t('section')}</th>
                        <th>{t('status')}</th>
                        <th>{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={6}>
                            <div className="pri-empty">
                              <div className="pri-empty-icon">📭</div>
                              <p>{t('noRecordsFound')}</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        records.map((a, i) => (
                          <tr key={a.id}>
                            <td>{i + 1}</td>
                            <td><span className="pri-class-badge">{a.rollNumber || '—'}</span></td>
                            <td>
                              <span className="font-bolder">{a.student?.name || '—'}</span>
                            </td>
                            <td>
                              <span className="pri-class-badge">
                                {a.section?.sectionName || t('sectionA')}
                              </span>
                            </td>
                            <td>
                              <span className={
                                a.status === 'Present' ? 'pri-att-present' :
                                  a.status === 'Absent' ? 'pri-att-absent' :
                                    'pri-att-leave'
                              }>
                                {t(a.status?.toLowerCase() || '')}
                              </span>
                            </td>
                            <td>
                              {editRoll === a.rollNumber ? (
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {['Present', 'Absent', 'Leave'].map(s => (
                                    <button
                                      key={s}
                                      className="pri-btn pri-btn-ghost pri-btn-sm"
                                      disabled={updating}
                                      onClick={() => updateStatus(a.rollNumber, s)}
                                    >
                                      {t(s.toLowerCase())}
                                    </button>
                                  ))}
                                  <button
                                    className="pri-btn pri-btn-ghost pri-btn-sm"
                                    onClick={() => setEditRoll(null)}
                                    disabled={updating}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="pri-btn pri-btn-ghost pri-btn-sm"
                                  onClick={() => setEditRoll(a.rollNumber)}
                                  disabled={updating}
                                >
                                  ✏️ {t('edit')}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: STUDENT HISTORY */}
      {tab === 'student' && (
        <>
          <div className="pri-card pd-24">
            <div className="pri-form-field mb-10">
              <label>{t('studentRollNumber')} *</label>
              <input
                value={studentRoll}
                onChange={e => setStudentRoll(e.target.value)}
                placeholder={t('enterRollNumber')}
                onKeyDown={e => e.key === 'Enter' && filterStudentRecords()}
                disabled={updating}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="pri-btn pri-btn-primary" onClick={filterStudentRecords} disabled={updating}>
                🔍 {t('filterFromCurrentView')}
              </button>
              <button className="pri-btn pri-btn-ghost" onClick={getStudentAttendance} disabled={updating}>
                📊 {t('getPercentageOnly')}
              </button>
            </div>
            <div className="warning-box">
              ⚠️ {t('attendanceNote')}
            </div>
          </div>

          {percentage !== null && (
            <div className="pri-card" style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 44,
                    fontWeight: 900,
                    color: percentage >= 75 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#ef4444'
                  }}>
                    {typeof percentage === 'number' ? percentage.toFixed(1) : percentage}%
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{t('attendancePercentage')}</div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{
                    height: 10,
                    background: '#e2e8f0',
                    borderRadius: 5,
                    overflow: 'hidden',
                    marginBottom: 8
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(percentage, 100)}%`,
                      background: percentage >= 75 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444',
                      borderRadius: 5
                    }} />
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: percentage >= 75 ? '#16a34a' : '#dc2626'
                  }}>
                    {percentage >= 75 ? `✅ ${t('goodAttendance')}` : `⚠️ ${t('lowAttendance')}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="pri-card">
              <div className="pri-toolbar">
                <span style={{ fontWeight: 700, color: '#1e3a5f' }}>
                  {t('attendanceHistoryForRoll', { roll: studentRoll, count: history.length })}
                </span>
              </div>
              <div className="table-wrap">
                {updating && history.length === 0 ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : (
                  <table className="pri-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t('date')}</th>
                        <th>{t('rollNo')}</th>
                        <th>{t('studentName')}</th>
                        <th>{t('section')}</th>
                        <th>{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((a, i) => (
                        <tr key={a.id}>
                          <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                          <td>{a.attendanceDate}</td>
                          <td><span className="pri-class-badge">{a.rollNumber || '—'}</span></td>
                          <td>{a.student?.name || '—'}</td>
                          <td><SectionBadge section={a.section} /></td>
                          <td>
                            <span className={
                              a.status === 'Present' ? 'pri-att-present' :
                                a.status === 'Absent' ? 'pri-att-absent' :
                                  'pri-att-leave'
                            }>
                              {t(a.status?.toLowerCase() || '')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 3: EXPORT & ARCHIVE */}
      {tab === 'export' && (
        <>
          {/* Info Box */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f, #1d4ed8)',
            borderRadius: 16,
            padding: '18px 22px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16
          }}>
            <div style={{ fontSize: 32, flexShrink: 0 }}>📦</div>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 900, color: 'white', marginBottom: 6 }}>
                {t('exportAndArchiveAttendance')}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                {t('exportDescription')}
                <strong style={{ color: '#f87171', marginLeft: 4 }}>{t('actionCannotBeUndone')}</strong>
              </div>
            </div>
          </div>

          {/* Selection Card */}
          <div className="pri-card">
            <div className="pri-card-header">
              <div>
                <div className="pri-card-title">🔍 {t('selectDataToExport')}</div>
                <div className="pri-card-sub">{t('chooseClassSectionYear')}</div>
              </div>
            </div>
            <div style={{ padding: '18px 20px' }}>
              <div className="pri-form-row">
                <div className="pri-form-field">
                  <label>{t('class')} *</label>
                  {/* 🔥 Export Class Dropdown */}
                  <PriAutocompleteSelect
                    value={selectedExpClass}
                    data={classes || []}
                    onChange={handleExpClassChange}
                    placeholder={t('selectClass')}
                    optionLabel="className"
                    optionValue="id"
                    disabled={previewLoading}
                    size="medium"
                    clearable
                    required
                  />
                </div>
                <div className="pri-form-field">
                  <label>{t('sectionOptional')}</label>
                  {/* 🔥 Export Section Dropdown - Only actual sections */}
                  <PriAutocompleteSelect
                    key={expClassId || "no-class"}
                    value={selectedExpSection}
                    data={expFilteredSections || []}
                    onChange={handleExpSectionChange}
                    placeholder={t('selectSection')}
                    optionLabel="sectionName"
                    optionValue="id"
                    disabled={!expClassId || previewLoading}
                    size="medium"
                    clearable
                  />
                </div>
              </div>
              <div className="pri-form-row">
                <div className="pri-form-field">
                  <label>{t('academicYear')}</label>
                  <div style={{
                    padding: '11px 14px',
                    background: '#f1f5f9',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: 13
                  }}>
                    {academicYearName}
                  </div>
                  <small style={{ color: '#64748b' }}>{t('usingCurrentAcademicYear')}</small>
                </div>
                <div className="pri-form-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    className="pri-btn pri-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={generatePreview}
                    disabled={previewLoading || !expClassId || !academicYearId}
                  >
                    {previewLoading ? `⏳ ${t('loading')}...` : `👁️ ${t('generatePreview')}`}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {previewLoading && (
            <div className="pri-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
              <div style={{ fontWeight: 700, color: '#64748b' }}>{t('generatingReportPreview')}</div>
              <TableSkeleton rows={3} columns={6} />
            </div>
          )}

          {/* Preview Results */}
          {previewLoaded && (
            <>
              {/* Statistics Grid */}
              <div className="report-preview-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
                marginBottom: 16
              }}>
                {[
                  { val: previewRecords.length, label: t('totalRecords'), color: '#1d4ed8', bg: '#eff6ff' },
                  { val: totalPresent, label: t('presentDays'), color: '#16a34a', bg: '#f0fdf4' },
                  { val: totalAbsent, label: t('absentDays'), color: '#dc2626', bg: '#fef2f2' },
                  { val: totalLeave, label: t('leaveDays'), color: '#d97706', bg: '#fffbeb' },
                  { val: uniqueStudents, label: t('students'), color: '#7c3aed', bg: '#f5f3ff' },
                  { val: uniqueDates, label: t('workingDays'), color: '#0369a1', bg: '#f0f9ff' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: stat.bg,
                    borderRadius: 12,
                    padding: '14px 16px',
                    border: `1.5px solid ${stat.color}22`,
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 28,
                      fontWeight: 900,
                      color: stat.color,
                      lineHeight: 1,
                      marginBottom: 4
                    }}>
                      {stat.val}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Preview Table */}
              {previewRecords.length > 0 ? (
                <>
                  <div className="pri-card" style={{ marginBottom: 16 }}>
                    <div className="pri-toolbar">
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1e3a5f' }}>
                          📋 {t('previewFor', { class: expClassName, section: expSecName, year: academicYearName })}
                        </span>
                        <span style={{ marginLeft: 10, fontSize: 12, color: '#94a3b8' }}>
                          ({t('showingFirstRecords', { count: previewRecords.length, show: 50 })})
                        </span>
                      </div>
                    </div>
                    <div className="table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {previewLoading ? (
                        <TableSkeleton rows={5} columns={6} />
                      ) : (
                        <table className="pri-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>{t('date')}</th>
                              <th>{t('rollNo')}</th>
                              <th>{t('studentName')}</th>
                              <th>{t('section')}</th>
                              <th>{t('status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewRecords.slice(0, 50).map((a, i) => (
                              <tr key={a.id || i}>
                                <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{a.attendanceDate}</td>
                                <td><span className="pri-class-badge">{a.rollNumber || '—'}</span></td>
                                <td>{a.student?.name || '—'}</td>
                                <td><SectionBadge section={a.section} /></td>
                                <td>
                                  <span className={
                                    a.status === 'Present' ? 'pri-att-present' :
                                      a.status === 'Absent' ? 'pri-att-absent' :
                                        'pri-att-leave'
                                  }>
                                    {t(a.status?.toLowerCase() || '')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {previewRecords.length > 50 && (
                              <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 14 }}>
                                  {t('andMoreRecords', { count: previewRecords.length - 50 })}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Export & Purge Card */}
                  <div className="pri-card" style={{ border: '2px solid #fecaca', marginBottom: 16 }}>
                    <div style={{
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, #fff7ed, #fef2f2)',
                      borderBottom: '1px solid #fecaca'
                    }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span>⚠️</span> {t('exportAndPermanentlyDelete')}
                      </div>
                      <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 4 }}>
                        {t('exportWarning')}
                      </div>
                    </div>

                    <div style={{ padding: '18px 20px' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        marginBottom: 16
                      }}>
                        <div style={{
                          background: '#f0fdf4',
                          borderRadius: 10,
                          padding: '12px 14px',
                          border: '1px solid #bbf7d0'
                        }}>
                          <div style={{
                            fontSize: 11,
                            color: '#16a34a',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            marginBottom: 4
                          }}>
                            ✅ {t('whatWillHappen')}
                          </div>
                          <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.7 }}>
                            • {t('csvWillBeDownloaded')}<br />
                            • {t('fileNameFormat', { classId: expClassId, yearId: academicYearId })}<br />
                            • {t('recordsWillBeExported', { count: previewRecords.length })}
                          </div>
                        </div>
                        <div style={{
                          background: '#fef2f2',
                          borderRadius: 10,
                          padding: '12px 14px',
                          border: '1px solid #fecaca'
                        }}>
                          <div style={{
                            fontSize: 11,
                            color: '#dc2626',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            marginBottom: 4
                          }}>
                            ⚠️ {t('importantNote')}
                          </div>
                          <div style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.7 }}>
                            • {t('dataWillBePermanentlyDeleted')}<br />
                            • {t('actionCannotBeUndoneShort')}<br />
                            • {t('keepCsvBackup')}
                          </div>
                        </div>
                      </div>

                      <button
                        className="pri-btn pri-btn-danger"
                        style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '12px' }}
                        onClick={openPurgeConfirm}
                        disabled={previewLoading}
                      >
                        ⚠️ {t('exportAndPermanentlyDeleteBtn')}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="pri-card">
                  <div className="pri-empty">
                    <div className="pri-empty-icon">📭</div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{t('noDataFound')}</p>
                    <p style={{ fontSize: 12, marginTop: 6 }}>
                      {t('noAttendanceRecordsForSelection')}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!previewLoaded && !previewLoading && (
            <div className="pri-card">
              <div className="pri-empty">
                <div style={{ fontSize: 48, marginBottom: 14 }}>📊</div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#1e3a5f', marginBottom: 8 }}>
                  {t('previewWillAppearHere')}
                </p>
                <p style={{ fontSize: 13, color: '#64748b', maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
                  {t('previewInstructions')}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Purge Confirmation Modal */}
      {purgeModal && (
        <PriModal
          title={`⚠️ ${t('confirmExportAndPurge')}`}
          danger
          onClose={closePurgeModal}
          footer={
            exportStatus === 'done' ? (
              <button className="pri-btn pri-btn-primary" onClick={closePurgeModal}>
                ✅ {t('close')}
              </button>
            ) : exportStatus === 'downloading' ? null : (
              <>
                <button className="pri-btn pri-btn-ghost" onClick={closePurgeModal} disabled={previewLoading}>
                  {t('cancel')}
                </button>
                <button
                  className="pri-btn pri-btn-danger"
                  style={{ opacity: purgeConfirmVal === PURGE_KEYWORD ? 1 : 0.5 }}
                  onClick={handleExportAndPurge}
                  disabled={purgeConfirmVal !== PURGE_KEYWORD || previewLoading}
                >
                  🗑️ {t('yesExportAndPurge')}
                </button>
              </>
            )
          }
        >
          {exportStatus === 'downloading' && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#16a34a', marginBottom: 6 }}>
                {t('processing')}...
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {t('processingMessage')}
              </div>
            </div>
          )}

          {exportStatus === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 900, color: '#16a34a', marginBottom: 8 }}>
                {t('successfullyDone')}
              </div>
              <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.7 }}>
                {t('successMessage')}<br />
                <strong>{t('permanentlyDeleted')}</strong> {t('fromDatabase')}<br />
                {t('saveBackupMessage')}
              </div>
            </div>
          )}

          {!exportStatus && (
            <>
              <div style={{
                background: '#fef2f2',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                border: '1px solid #fecaca'
              }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12
                }}>
                  <span>⚠️</span> {t('actionCannotBeUndoneWarning')}
                </div>
                <ul style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  fontSize: 13,
                  color: '#7f1d1d',
                  lineHeight: 1.8
                }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📥</span> {t('csvWillDownload')}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🗑️</span> <strong>{previewRecords.length} {t('attendanceRecords')}</strong> {t('willBePermanentlyDeleted')}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>❌</span> <strong>{t('dataCannotBeRecovered')}</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>💾</span> {t('downloadedCsvBackup')}
                  </li>
                </ul>
              </div>

              <div style={{
                background: '#f8faff',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 16,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {[
                    [t('class'), expClassName],
                    [t('section'), expSecName],
                    [t('year'), academicYearName],
                    [t('records'), previewRecords.length],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                        {l}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1e3a5f' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1e3a5f',
                  marginBottom: 6
                }}>
                  {t('typeKeywordToConfirm', { keyword: PURGE_KEYWORD })}
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${purgeConfirmVal === PURGE_KEYWORD ? '#16a34a' : '#e2e8f0'}`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: 'center',
                    letterSpacing: '1px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  value={purgeConfirmVal}
                  onChange={e => setPurgeConfirmVal(e.target.value.toUpperCase())}
                  placeholder={PURGE_KEYWORD}
                  autoFocus
                  disabled={previewLoading}
                  onKeyDown={e => e.key === 'Enter' && purgeConfirmVal === PURGE_KEYWORD && handleExportAndPurge()}
                />
                {purgeConfirmVal && purgeConfirmVal !== PURGE_KEYWORD && (
                  <div style={{ fontSize: 11, color: '#dc2626', marginTop: 6, textAlign: 'center' }}>
                    ❌ {t('typeExactlyKeyword', { keyword: PURGE_KEYWORD })}
                  </div>
                )}
                {purgeConfirmVal === PURGE_KEYWORD && (
                  <div style={{ fontSize: 11, color: '#16a34a', marginTop: 6, textAlign: 'center', fontWeight: 700 }}>
                    ✅ {t('confirmedClickButton')}
                  </div>
                )}
              </div>
            </>
          )}
        </PriModal>
      )}
    </div>
  );
}

export default PriAttendance;
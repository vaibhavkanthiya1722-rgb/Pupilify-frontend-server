import React from "react";
import { useTranslation } from "react-i18next";
import PriModal from "../PriModal";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";
import PriResultsController from "./PriResultsController";
import UploadMarksTab from "./UploadMarksTab";
import ClassResultSheetTab from "./ClassResultSheetTab";
import StudentResultCardTab from "./StudentResultCardTab";

function PriResults({
  schoolId,
  token,
  user,
  onToast,
  academicYearId,
  academicYearName,
  classes,
  sections,
  subjects,
  teachers
}) {

  const { t } = useTranslation(); 

  const controllerProps = PriResultsController({
    schoolId,
    token,
    classes,
    sections,
    subjects,
    teachers,
    onToast,
    academicYearId,
    academicYearName,
    t
  });

  const {
    // State
    activeTab, setActiveTab,
    loading,

    // Upload Tab Filters (separate)
    uploadFilterClass, setUploadFilterClass,
    uploadFilterSection, setUploadFilterSection,
    uploadFilterExamName, setUploadFilterExamName,
    uploadFilteredSections,
    
    // Class Sheet Tab Filters (separate)
    classFilterClass, setClassFilterClass,
    classFilterSection, setClassFilterSection,
    classFilterExamName, setClassFilterExamName,
    classFilteredSections,
    
    // Student Card Tab Filters (separate)
    studentFilterClass, setStudentFilterClass,
    studentFilterSection, setStudentFilterSection,
    studentFilterExamName, setStudentFilterExamName,
    studentFilteredSections,

    examNames,

    // Upload Tab
    examSchedules,
    selectedExamSchedule,
    studentsList,
    marksForm,
    uploadModal,
    validationErrors,

    // Class Sheet Tab
    classResult,

    // Student Card Tab
    studentSearch, setStudentSearch,
    studentResult,
    studentCardModal,

    // Functions
    loadClassResult,
    handleExportExcel,
    loadStudentCard,
    openUploadModal,
    closeUploadModal,
    handleMarksChange,
    handleAbsentToggle,
    handleUploadMarks,
    closeStudentCardModal,
    clearUploadFilters,
    clearClassFilters,
    clearStudentFilters,

    // Helpers
    formatPercentage,
    getGradeColor,
    formatDate,
    formatTime

  } = controllerProps;

  // 🔥 Handlers for dropdowns - Upload Tab
  const handleUploadClassChange = (option) => {
    const value = option?.id || '';
    setUploadFilterClass(value);
    setUploadFilterSection('');
  };

  const handleUploadSectionChange = (option) => {
    const value = option?.id || '';
    setUploadFilterSection(value);
  };

  const handleUploadExamNameChange = (option) => {
    const value = option?.id || '';
    setUploadFilterExamName(value);
  };

  // 🔥 Handlers for dropdowns - Class Sheet Tab
  const handleClassClassChange = (option) => {
    const value = option?.id || '';
    setClassFilterClass(value);
    setClassFilterSection('');
  };

  const handleClassSectionChange = (option) => {
    const value = option?.id || '';
    setClassFilterSection(value);
  };

  const handleClassExamNameChange = (option) => {
    const value = option?.id || '';
    setClassFilterExamName(value);
  };

  // 🔥 Handlers for dropdowns - Student Card Tab
  const handleStudentClassChange = (option) => {
    const value = option?.id || '';
    setStudentFilterClass(value);
    setStudentFilterSection('');
  };

  const handleStudentSectionChange = (option) => {
    const value = option?.id || '';
    setStudentFilterSection(value);
  };

  const handleStudentExamNameChange = (option) => {
    const value = option?.id || '';
    setStudentFilterExamName(value);
  };

  // 🔥 Get selected values for dropdowns
  // Upload Tab
  const selectedUploadClass = classes?.find(c => String(c.id) === String(uploadFilterClass)) || null;
  const selectedUploadSection = uploadFilteredSections?.find(s => String(s.id) === String(uploadFilterSection)) || null;
  const uploadExamNameOptions = examNames?.map(name => ({ id: name, name: name })) || [];
  const selectedUploadExam = uploadExamNameOptions.find(e => e.id === uploadFilterExamName) || null;

  // Class Sheet Tab
  const selectedClassClass = classes?.find(c => String(c.id) === String(classFilterClass)) || null;
  const selectedClassSection = classFilteredSections?.find(s => String(s.id) === String(classFilterSection)) || null;
  const classExamNameOptions = examNames?.map(name => ({ id: name, name: name })) || [];
  const selectedClassExam = classExamNameOptions.find(e => e.id === classFilterExamName) || null;

  // Student Card Tab
  const selectedStudentClass = classes?.find(c => String(c.id) === String(studentFilterClass)) || null;
  const selectedStudentSection = studentFilteredSections?.find(s => String(s.id) === String(studentFilterSection)) || null;
  const studentExamNameOptions = examNames?.map(name => ({ id: name, name: name })) || [];
  const selectedStudentExam = studentExamNameOptions.find(e => e.id === studentFilterExamName) || null;

  // Print Result Card Function
  const handlePrintResultCard = () => {
    const printContent = document.getElementById('student-result-card-print');
    if (!printContent) return;

    const originalTitle = document.title;
    document.title = `Result Card - ${studentResult?.studentName || 'Student'}`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Result Card - ${studentResult?.studentName || 'Student'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: #f0f2f5;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
              margin: 0;
            }
            .print-container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            .no-print {
              display: none;
            }
            .school-header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              border-bottom: 2px solid #e2e8f0;
              page-break-inside: avoid;
            }
            .school-logo {
              width: 100px;
              height: 100px;
              object-fit: contain;
              margin-bottom: 15px;
            }
            .student-header {
              background: linear-gradient(135deg, #f0fdf4, #dcfce7);
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .summary-card {
              padding: 12px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #e2e8f0;
              background: white;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f8fafc;
              font-weight: 600;
            }
            .stats-summary {
              display: flex;
              gap: 16px;
              justify-content: center;
              padding: 12px;
              background: #f8fafc;
              border-radius: 8px;
              margin-top: 20px;
              page-break-inside: avoid;
            }
            .remarks-section {
              margin-top: 20px;
              padding: 16px;
              background: #fff9e6;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
              page-break-inside: avoid;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #64748b;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${printContent.outerHTML}
        </div>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
    document.title = originalTitle;
  };

  return (
    <div className="pri-content">
      {/* Header */}
      <div className="mb">
        <div className="content-heading">
          📊 {t("examResultsManagement")}
        </div>
        <div className="content-text">
          {t("examResultsDescription")} •
          {academicYearName && <span>{academicYearName}</span>}
        </div>
      </div>

      <div className="tally-tabs">
        <button
          className={`tally-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 {t("uploadMarks")}
        </button>
        <button
          className={`tally-tab ${activeTab === 'class-sheet' ? 'active' : ''}`}
          onClick={() => setActiveTab('class-sheet')}
        >
          📋 {t("classResultSheet")}
        </button>
        <button
          className={`tally-tab ${activeTab === 'student-card' ? 'active' : ''}`}
          onClick={() => setActiveTab('student-card')}
        >
          🎓 {t("studentResultCard")}
        </button>
      </div>

      {/* ==================== TAB 1: Upload Marks ==================== */}
      {activeTab === 'upload' && (
        <>
          <div className="pri-filter-bar">
            <div className="pri-form-field">
              <label>{t("selectClass")}</label>
              <PriAutocompleteSelect
                value={selectedUploadClass}
                data={classes || []}
                onChange={handleUploadClassChange}
                placeholder={t("selectClass")}
                optionLabel="className"
                optionValue="id"
                size="medium"
                clearable
              />
            </div>

            <div className="pri-form-field">
              <label>{t("selectSection")}</label>
              <PriAutocompleteSelect
                key={uploadFilterClass || "no-class"}
                value={selectedUploadSection}
                data={uploadFilteredSections || []}
                onChange={handleUploadSectionChange}
                placeholder={t("selectSection")}
                optionLabel="sectionName"
                optionValue="id"
                disabled={!uploadFilterClass}
                size="medium"
                clearable={false}
              />
            </div>

            <div className="pri-form-field">
              <label>{t("examName")}</label>
              <PriAutocompleteSelect
                value={selectedUploadExam}
                data={uploadExamNameOptions}
                onChange={handleUploadExamNameChange}
                placeholder={t("selectExam")}
                optionLabel="name"
                optionValue="id"
                size="medium"
                clearable
              />
            </div>

            <button
              onClick={clearUploadFilters}
              className="pri-btn pri-btn-ghost"
            >
              🔄 {t("clearFilters")}
            </button>
          </div>

          <UploadMarksTab
            filterClass={uploadFilterClass}
            examSchedules={examSchedules}
            loading={loading}
            onOpenUploadModal={openUploadModal}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        </>
      )}

      {/* ==================== TAB 2: Class Result Sheet ==================== */}
      {activeTab === 'class-sheet' && (
        <>
          <div className="pri-filter-bar">
            <div className="pri-form-field">
              <label>{t("selectClass")}</label>
              <PriAutocompleteSelect
                value={selectedClassClass}
                data={classes || []}
                onChange={handleClassClassChange}
                placeholder={t("selectClass")}
                optionLabel="className"
                optionValue="id"
                size="medium"
                clearable
              />
            </div>

            <div className="pri-form-field">
              <label>{t("selectSection")}</label>
              <PriAutocompleteSelect
                key={classFilterClass || "no-class"}
                value={selectedClassSection}
                data={classFilteredSections || []}
                onChange={handleClassSectionChange}
                placeholder={t("selectSection")}
                optionLabel="sectionName"
                optionValue="id"
                disabled={!classFilterClass}
                size="medium"
                clearable={false}
              />
            </div>

            <div className="pri-form-field">
              <label>{t("examName")}</label>
              <PriAutocompleteSelect
                value={selectedClassExam}
                data={classExamNameOptions}
                onChange={handleClassExamNameChange}
                placeholder={t("selectExam")}
                optionLabel="name"
                optionValue="id"
                size="medium"
                clearable
              />
            </div>

            <button
              onClick={loadClassResult}
              disabled={loading || !classFilterClass || !classFilterExamName}
              className="print-btn pri-btn"
            >
              {loading ? `⏳ ${t("loading")}` : `📋 ${t("loadResultSheet")}`}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!classResult || loading}
              className="pri-btn excel-btn"
            >
              {loading ? `⏳ ${t("downloading")}` : `📥 ${t("exportToExcel")}`}
            </button>
            <button
              onClick={clearClassFilters}
              className="pri-btn pri-btn-ghost"
            >
              🔄 {t("clearFilters")}
            </button>
          </div>

          <ClassResultSheetTab
            classResult={classResult}
            loading={loading}
            formatPercentage={formatPercentage}
            getGradeColor={getGradeColor}
          />
        </>
      )}

      {/* ==================== TAB 3: Student Result Card ==================== */}
      {activeTab === 'student-card' && (
        <>
          <div className="pri-filter-bar">
            <div className="pri-form-field">
              <label>{t("selectClass")}</label>
              <PriAutocompleteSelect
                value={selectedStudentClass}
                data={classes || []}
                onChange={handleStudentClassChange}
                placeholder={t("selectClass")}
                optionLabel="className"
                optionValue="id"
                size="medium"
                clearable
              />
            </div>

            <div className="pri-form-field">
              <label>{t("selectSection")}</label>
              <PriAutocompleteSelect
                key={studentFilterClass || "no-class"}
                value={selectedStudentSection}
                data={studentFilteredSections || []}
                onChange={handleStudentSectionChange}
                placeholder={t("selectSection")}
                optionLabel="sectionName"
                optionValue="id"
                disabled={!studentFilterClass}
                size="medium"
                clearable={false}
              />
            </div>

            <div className="pri-form-field">
              <label>{t("examName")}</label>
              <PriAutocompleteSelect
                value={selectedStudentExam}
                data={studentExamNameOptions}
                onChange={handleStudentExamNameChange}
                placeholder={t("selectExam")}
                optionLabel="name"
                optionValue="id"
                size="medium"
                clearable
              />
            </div>

            <button
              onClick={clearStudentFilters}
              className="pri-btn pri-btn-ghost"
            >
              🔄 {t("clearFilters")}
            </button>
          </div>

          <StudentResultCardTab
            studentSearch={studentSearch}
            setStudentSearch={setStudentSearch}
            loading={loading}
            onLoadStudentCard={loadStudentCard}
          />
        </>
      )}

      {/* Upload Marks Modal */}
      {uploadModal && selectedExamSchedule && (
        <PriModal
          title={`📤 ${t("uploadMarksForSchedule")} - ${selectedExamSchedule.examName} - ${selectedExamSchedule.subject?.subjectName}`}
          onClose={closeUploadModal}
          wide
          footer={
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={handleUploadMarks}
                disabled={loading}
                className="pri-btn excel-btn"
              >
                {loading ? t("uploading") : `📤 ${t("uploadAllMarks")}`}
              </button>
              <button
                onClick={closeUploadModal}
                className="pri-btn pri-btn-ghost"
              >
                {t("cancel")}
              </button>
            </div>
          }
        >
          <div>
            <div className="info-box mb-10">
              <strong>📊 {t("maxMarks")}:</strong> {t("theoryMarks")} = {selectedExamSchedule.subject?.totalTheoryMarks || 100}
              {selectedExamSchedule.subject?.hasPractical && ` | ${t("practicalMarks")} = ${selectedExamSchedule.subject?.totalPracticalMarks || 50}`}
            </div>
            <div className="pri-card table-wrap">
              <table className="pri-table">
                <thead>
                  <tr>
                    <th>{t("rollNo")}</th>
                    <th>{t("studentName")}</th>
                    <th>{t("absent")}</th>
                    <th>{t("theoryMarks")}</th>
                    {selectedExamSchedule.subject?.hasPractical && (
                      <th>{t("practicalMarks")}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map(student => {
                    const form = marksForm[student.id] || {};
                    const isAbsent = form.isAbsent;
                    const errors = validationErrors?.[student.id] || {};

                    return (
                      <tr key={student.id}>
                        <td>{student.rollNumber}</td>
                        <td><strong>{student.name}</strong></td>
                        <td>
                          <input
                            type="checkbox"
                            checked={isAbsent || false}
                            onChange={() => handleAbsentToggle(student.id)}
                          />
                        </td>
                        <td>
                          <div className="pri-form-field">
                            <input
                              type="number"
                              value={form.marksObtainedTheory || ''}
                              onChange={e => handleMarksChange(student.id, 'marksObtainedTheory', e.target.value)}
                              disabled={isAbsent}
                              className={errors.theory ? 'pri-input-error' : ''}
                              min="0"
                              max={selectedExamSchedule.subject?.totalTheoryMarks || 100}
                              step="0.5"
                            />
                            {errors.theory && (
                              <span className="pri-error-message">⚠️ {errors.theory}</span>
                            )}
                          </div>
                        </td>
                        {selectedExamSchedule.subject?.hasPractical && (
                          <td>
                            <div>
                              <input
                                type="number"
                                value={form.marksObtainedPractical || ''}
                                onChange={e => handleMarksChange(student.id, 'marksObtainedPractical', e.target.value)}
                                disabled={isAbsent}
                                className={errors.practical ? 'pri-input-error' : ''}
                                min="0"
                                max={selectedExamSchedule.subject?.totalPracticalMarks || 50}
                                step="0.5"
                              />
                              {errors.practical && (
                                <span className="pri-error-message">⚠️ {errors.practical}</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </PriModal>
      )}

      {/* Student Result Card Modal */}
      {studentCardModal && studentResult && (
        <PriModal
          title={`🎓 ${t("resultCardFor")} - ${studentResult.studentName}`}
          onClose={closeStudentCardModal}
          wide
          footer={
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={handlePrintResultCard}
                className="pri-btn"
                style={{ background: '#64748b' }}
              >
                🖨️ {t("printResultCard")}
              </button>
              <button
                onClick={closeStudentCardModal}
                className="pri-btn pri-btn-primary"
              >
                {t("close")}
              </button>
            </div>
          }
        >
          <div id="student-result-card-print" style={{ padding: '20px', background: 'white' }}>
            {/* School Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: 30,
              padding: '20px',
              borderBottom: '2px solid #e2e8f0'
            }}>
              {studentResult.school?.schoolLogo && (
                <div style={{ marginBottom: 15 }}>
                  <img
                    src={`${process.env.REACT_APP_API_URL}/uploads/${studentResult.school.schoolLogo}`}
                    alt={studentResult.school.schoolName}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain',
                      borderRadius: '10px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1e3a5f',
                marginBottom: '8px'
              }}>
                {studentResult.school?.schoolName}
              </h1>

              <p style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '4px',
                lineHeight: '1.5'
              }}>
                {studentResult.school?.address}
              </p>

              <p style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '4px'
              }}>
                📞 {studentResult.school?.phoneNumber}
                {studentResult.school?.mailId && ` | ✉️ ${studentResult.school.mailId}`}
              </p>

              <p style={{
                fontSize: '14px',
                color: '#10b981',
                fontWeight: '600',
                marginTop: '8px'
              }}>
                Academic Year: {studentResult.academicYear}
              </p>
            </div>

            {/* Student Info */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Student Name</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e3a5f' }}>{studentResult.studentName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Roll Number</div>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>{studentResult.rollNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Class & Section</div>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>{studentResult.className} / {studentResult.sectionName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Exam Name</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', textTransform: 'uppercase' }}>{studentResult.examName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Father's Name</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{studentResult.student?.fatherName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date of Birth</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {studentResult.student?.dob ? new Date(studentResult.student.dob).toLocaleDateString('en-IN') : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ background: '#e0f2fe', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '8px' }}>Total Obtained</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
                  {studentResult.totalObtained}/{studentResult.totalMaxMarks}
                </div>
              </div>
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '8px' }}>Percentage</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                  {formatPercentage(studentResult.overallPercentage)}
                </div>
              </div>
              <div style={{ background: '#fef9c3', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#854d0e', marginBottom: '8px' }}>Grade</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: getGradeColor(studentResult.overallGrade),
                  background: getGradeColor(studentResult.overallGrade) + '20',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  display: 'inline-block'
                }}>
                  {studentResult.overallGrade}
                </div>
              </div>
              <div style={{
                background: studentResult.passed ? '#f0fdf4' : '#fef2f2',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: studentResult.passed ? '#16a34a' : '#dc2626', marginBottom: '8px' }}>Result</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: studentResult.passed ? '#16a34a' : '#dc2626'
                }}>
                  {studentResult.passed ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </div>

            {/* Results Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: '600' }}>Subject</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '600' }}>Theory</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '600' }}>Practical</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '600' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '600' }}>Max</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '600' }}>%</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '600' }}>Grade</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: '600' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {studentResult.subjectResults?.map((result, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', border: '1px solid #e2e8f0' }}>
                      <strong>{result.subject.subjectName}</strong>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      {result.absent ? 'AB' : (result.marksObtainedTheory || '—')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      {result.absent ? 'AB' : (result.marksObtainedPractical || '—')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', border: '1px solid #e2e8f0' }}>
                      {result.absent ? 'AB' : (result.totalMarksObtained || '—')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{result.totalMaxMarks}</td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{formatPercentage(result.percentage)}</td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{
                        background: getGradeColor(result.grade),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {result.grade || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{
                        color: result.passed ? '#16a34a' : '#dc2626',
                        fontWeight: '600'
                      }}>
                        {result.absent ? 'ABSENT' : (result.passed ? 'PASS' : 'FAIL')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
                  <td colSpan="3" style={{ padding: '12px', textAlign: 'right', border: '1px solid #e2e8f0' }}>Total:</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{studentResult.totalObtained}</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{studentResult.totalMaxMarks}</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{formatPercentage(studentResult.overallPercentage)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <span style={{
                      background: getGradeColor(studentResult.overallGrade),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {studentResult.overallGrade}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: studentResult.passed ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                      {studentResult.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Stats Summary */}
            <div style={{
              marginTop: '20px',
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <div>✅ Passed: {studentResult.subjectsPassed}</div>
              <div>❌ Failed: {studentResult.subjectsFailed}</div>
              <div>⚠️ Absent: {studentResult.subjectsAbsent}</div>
            </div>

            {/* Footer for print */}
            <div style={{
              textAlign: 'center',
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <p>Generated on: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>This is a computer-generated document. No signature required.</p>
              <p style={{ marginTop: '8px' }}>© {studentResult.school?.schoolName} | All Rights Reserved</p>
            </div>
          </div>
        </PriModal>
      )}
    </div>
  );
}

export default PriResults;
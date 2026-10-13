// src/components/admin/TCFormat/index.js

import React from "react";
import TCFormatController from "./TCFormatController";
import TableSkeleton from "../../loaders/TableSkeleton";
import PriAutocompleteSelect from "../../common/PriAutocompleteSelect";
import { useTranslation } from 'react-i18next';
import PriOverviewService from '../../../services/PriOverviewService';

function TCFormat({
  schoolId,
  token,
  user,
  onToast,
  mode = 'single',
  onClose,
  student: propStudent,
  academicYearId,
  classes: propClasses,
  sections: propSections
}) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [logoError, setLogoError] = React.useState(false);

  // ✅ Editable fields state - Complete list
  const [editableFields, setEditableFields] = React.useState({
    // Header fields
    scholarNo: '',
    familyId: '',
    penNumber: '',
    diseCode: '',
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    
    // Student details
    studentName: '',
    fatherName: '',
    motherName: '',
    motherTongue: '',
    religionCity: '',
    inThisSchoolFrom: '',
    leavingSchoolOn: '',
    scholarNoWords: '',
    vaccination: '',
    lastExam: '',
    medium: '',
    year: '',
    result: '',
    attendance: '',
    admissionClass: '',
    currentClass: '',
    currentSection: '',
    conduct: '',
    
    // Fee details
    fee1: '',
    fee1Till: '',
    fee2: '',
    fee2Till: '',
    fee3: '',
    fee3Till: '',
    
    // Reason
    reasonForLeaving: ''
  });

  const handleFieldChange = (field, value) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const {
    tcRef,
    students,
    loading,
    search, setSearch,
    filterClass, setFilterClass,
    filterSection, setFilterSection,
    classes,
    selectedStudent,
    showTCForm,
    reasonForLeaving, setReasonForLeaving,
    showReasonPopup,
    filteredSections,
    filteredStudents,
    hasAcademicYear,
    loadStudents,
    handleSelectStudent,
    handleReasonSubmit,
    handleCancelReason,
    handleBackToList,
    handleClearFilters,
    handlePrint,
    getTCData
  } = TCFormatController({
    schoolId,
    user,
    onToast,
    mode,
    onClose,
    student: propStudent,
    academicYearId,
    classes: propClasses || [],
    sections: propSections || []
  });

  const handleFilterClassChange = (option) => {
    setFilterClass(option?.id || '');
    setFilterSection('');
  };

  const handleFilterSectionChange = (option) => {
    setFilterSection(option?.id || '');
  };

  const selectedFilterClass = classes?.find(c => String(c.id) === String(filterClass)) || null;
  const selectedFilterSection = filteredSections?.find(s => String(s.id) === String(filterSection)) || null;

  const schoolLogo = user?.schoolLogo ||
    localStorage.getItem('ss_school_logo') ||
    user?.school?.logo;

  const logoUrl = schoolLogo ? PriOverviewService.getLogoUrl(schoolLogo) : null;

  // Editable input style
  const inputStyle = {
    border: 'none',
    borderBottom: '1px dotted #999',
    background: 'transparent',
    width: '100%',
    padding: '2px 4px',
    fontSize: isHindi ? '14px' : '13px',
    fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif" : "'Times New Roman', Times, serif",
    outline: 'none',
    transition: 'border-bottom 0.3s ease'
  };

  // ✅ Helper for inline editable fields (for header)
  const renderHeaderEditableInput = (field, placeholder, extraStyles = {}) => {
    return (
      <input
        type="text"
        value={editableFields[field] || ''}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        style={{
          ...inputStyle,
          display: 'inline-block',
          width: 'auto',
          minWidth: '80px',
          color: '#1e3a5f',
          fontWeight: 'bold',
          fontSize: isHindi ? '12px' : '11px',
          fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif" : "'Times New Roman', Times, serif",
          padding: '0 4px',
          ...extraStyles
        }}
        placeholder={placeholder || '__________'}
        onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
        onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
      />
    );
  };



  // ✅ Helper for strong text with editable input (for body)
  const renderEditableStrong = (field, placeholder, extraStyles = {}) => {
    return (
      <strong style={{ color: '#1e3a5f' }}>
        <input
          type="text"
          value={editableFields[field] || ''}
          onChange={(e) => handleFieldChange(field, e.target.value)}
          style={{
            ...inputStyle,
            display: 'inline-block',
            width: 'auto',
            minWidth: '100px',
            color: '#1e3a5f',
            fontWeight: 'bold',
            fontSize: isHindi ? '14px' : '13px',
            fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif" : "'Times New Roman', Times, serif",
            ...extraStyles
          }}
          placeholder={placeholder || '__________'}
          onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
          onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
        />
      </strong>
    );
  };

  if (!hasAcademicYear) {
    return (
      <div className="pri-content">
        <div className="pri-card">
          <div className="pri-empty">
            <div className="pri-empty-icon">⚠️</div>
            <p>{t('academicYearNotConfigured')}</p>
            <button className="pri-btn pri-btn-primary" onClick={onClose} style={{ marginTop: 20 }}>
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showReasonPopup && selectedStudent) {
    return (
      <div className="pri-modal-overlay">
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          width: '500px',
          maxWidth: '90%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              {t('reasonForLeavingSchool')}
            </label>
            <textarea
              value={reasonForLeaving}
              onChange={(e) => setReasonForLeaving(e.target.value)}
              placeholder={t('reasonForLeavingPlaceholder')}
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              autoFocus
            />
          </div>

          <div className="d-flex justify-content-end gap-10">
            <button
              onClick={handleCancelReason}
              className="pri-btn pri-btn-ghost"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleReasonSubmit}
              className="pri-btn pri-btn-primary"
            >
              {t('continueToTC')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showTCForm && selectedStudent) {
    const tcData = getTCData();

    return (
      <div className="tc-container-wrapper">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <button
            className="pri-btn pri-btn-ghost"
            onClick={handleBackToList}
            style={{ display: 'flex', alignItems: 'center', gap: 5, margin: "5px" }}
          >
            ← {t('backToStudentList')}
          </button>
        </div>

        {/* TC Content */}
        <div
          className="tc-container"
          ref={tcRef}
          style={{
            background: 'white',
            padding: '40px 50px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            maxWidth: '794px',
            minHeight: '1123px',
            margin: '0 auto',
            fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif" : "'Times New Roman', Times, serif",
            border: '1px solid #d0d7de',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Watermark */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
            fontSize: isHindi ? '50px' : '70px',
            fontWeight: 'bold',
            color: 'rgba(200, 200, 200, 0.04)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            fontFamily: isHindi ? "'Noto Sans Devanagari', sans-serif" : "Arial, sans-serif",
            textTransform: 'uppercase'
          }}>
            {isHindi ? 'स्थानान्तरण प्रमाण-पत्र' : 'TRANSFER CERTIFICATE'}
          </div>

          {/* School Header */}
          <div className="tc-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 1,
            borderBottom: '2px solid #1e3a5f',
            paddingBottom: '15px'
          }}>
            <div style={{
              flex: '0 0 auto',
              marginRight: '20px'
            }}>
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={t('schoolLogo')}
                  onError={() => setLogoError(true)}
                  style={{
                    maxHeight: '80px',
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <span style={{ fontSize: '60px' }}>🏫</span>
              )}
            </div>

            <div style={{
              flex: 1,
              textAlign: 'center'
            }}>
              <h1 style={{
                color: '#1e3a5f',
                fontSize: isHindi ? '18px' : '22px',
                marginBottom: '2px',
                fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', serif" : "'Times New Roman', Times, serif",
                fontWeight: 'bold'
              }}>
                {tcData.schoolName}
              </h1>
              <p style={{ color: '#555', margin: '2px 0', fontSize: isHindi ? '12px' : '11px' }}>
                {tcData.schoolAddress}
              </p>
              <p style={{ color: '#555', margin: '2px 0', fontSize: isHindi ? '12px' : '11px' }}>
                📧 {tcData.schoolEmail} | 📞 {tcData.schoolPhone}
              </p>
              
              {/* ✅ Header Fields - ALL EDITABLE */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '5px',
                marginTop: '15px',
                fontSize: isHindi ? '12px' : '11px',
                color: '#555',
                flexWrap: 'wrap'
              }}>
                {/* ✅ Scholar No - Editable */}
                <span>
                  <strong>{isHindi ? 'पंजीयन क्रमांक' : 'Scholar No'}:</strong>
                  <strong style={{ color: '#1e3a5f' }}>
                    {renderHeaderEditableInput('scholarNo', tcData.scholarNo || tcData.enrollmentId || '_____')}
                  </strong>
                </span>
                
                {/* ✅ Family ID - Editable */}
                <span>
                  <strong>{t('familyId')}:</strong>
                  <strong style={{ color: '#1e3a5f' }}>
                    {renderHeaderEditableInput('familyId', tcData.familyId || '______')}
                  </strong>
                </span>
                
                {/* ✅ PEN Number - Editable */}
                <span>
                  <strong>{t('penNumber')}:</strong>
                  <strong style={{ color: '#1e3a5f' }}>
                    {renderHeaderEditableInput('penNumber', tcData.penNumber || '______')}
                  </strong>
                </span>
                
                {/* ✅ DISE Code - Editable */}
                <span>
                  <strong>{t('diseCode')}:</strong>
                  <strong style={{ color: '#1e3a5f' }}>
                    {renderHeaderEditableInput('diseCode', tcData.diseCode || '______')}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* TC Title */}
          <div style={{
            textAlign: 'center',
            marginBottom: '15px',
            position: 'relative',
            zIndex: 1
          }}>
            <h2 style={{
              color: '#1e3a5f',
              fontSize: isHindi ? '22px' : '24px',
              textDecoration: 'underline',
              margin: '0',
              fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', serif" : "'Times New Roman', Times, serif"
            }}>
              {isHindi ? 'स्थानान्तरण प्रमाण-पत्र' : 'TRANSFER CERTIFICATE'}
            </h2>
          </div>

          {/* TC Body */}
          <div className="tc-body" style={{
            position: 'relative',
            zIndex: 1,
            fontSize: isHindi ? '14px' : '13px',
            lineHeight: '2'
          }}>
            <p style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: isHindi ? '15px' : '14px' }}>
              {isHindi ? 'प्रमाणित किया जाता है कि -' : 'It is certified that -'}
            </p>

            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '5px 0',
              fontSize: isHindi ? '14px' : '13px'
            }}>
              <tbody>
                {/* Student Name - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', width: '35%', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'श्री/कुमारी' : 'Mr./Ms.'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    {renderEditableStrong('studentName', tcData.studentName)}
                  </td>
                </tr>
                
                {/* Father Name - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'पिता/पति श्री' : 'Father/Husband'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    {renderEditableStrong('fatherName', tcData.fatherName)}
                  </td>
                </tr>
                
                {/* Mother Name - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'माता श्रीमती' : 'Mother'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    {renderEditableStrong('motherName', tcData.motherName)}
                  </td>
                </tr>
                
                {/* Mother Tongue - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('motherTongue')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.motherTongue}
                      onChange={(e) => handleFieldChange('motherTongue', e.target.value)}
                      style={inputStyle}
                      placeholder={isHindi ? '_____' : '_____'}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* Religion/City - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('religionCity')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.religionCity}
                      onChange={(e) => handleFieldChange('religionCity', e.target.value)}
                      style={inputStyle}
                      placeholder={isHindi ? '_____' : '_____'}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* In this school from - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'इस विद्यालय में दिनांक' : 'In this school from'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    {renderEditableStrong('inThisSchoolFrom', tcData.admissionDate || '__________')}
                  </td>
                </tr>
                
                {/* Leaving school on - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'को विद्यालय छोड़ता/छोड़ती है' : 'Leaving school on'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    {renderEditableStrong('leavingSchoolOn', tcData.currentDate)}
                  </td>
                </tr>
                
                {/* School Registration No - Auto */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'विद्यालय के पंजीयन क्रमांक' : 'School Registration No'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <strong>{tcData.scholarNo || tcData.enrollmentId}</strong>
                  </td>
                </tr>
                
                {/* Scholar No in Words - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? '(शब्दों में)' : '(In words)'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.scholarNoWords}
                      onChange={(e) => handleFieldChange('scholarNoWords', e.target.value)}
                      style={inputStyle}
                      placeholder={isHindi ? '_____' : '_____'}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* Vaccination - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('vaccination')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.vaccination}
                      onChange={(e) => handleFieldChange('vaccination', e.target.value)}
                      style={inputStyle}
                      placeholder={isHindi ? 'टीका लगाया जा चुका है' : 'Vaccinated'}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* Last Annual Exam - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'अंतिम वार्षिक परीक्षा' : 'Last Annual Exam'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.lastExam}
                      onChange={(e) => handleFieldChange('lastExam', e.target.value)}
                      style={inputStyle}
                      placeholder={isHindi ? '_____' : '_____'}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* Class - Auto */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('class')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <strong>{tcData.className}</strong>
                  </td>
                </tr>
                
                {/* Medium - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('medium')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.medium}
                      onChange={(e) => handleFieldChange('medium', e.target.value)}
                      style={inputStyle}
                      placeholder={isHindi ? 'हिन्दी' : 'Hindi'}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* Year - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('year')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.year}
                      onChange={(e) => handleFieldChange('year', e.target.value)}
                      style={inputStyle}
                      placeholder={tcData.currentYear}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* Result - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('result')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.result}
                      onChange={(e) => handleFieldChange('result', e.target.value)}
                      style={inputStyle}
                      placeholder={t('promotedToNextClass')}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* Attendance - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('attendance')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.attendance}
                      onChange={(e) => handleFieldChange('attendance', e.target.value)}
                      style={inputStyle}
                      placeholder={isHindi ? 'प्रोडमेंस रहा है' : 'Satisfactory'}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
                
                {/* Admission Class - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'प्रवेश कक्षा' : 'Admission Class'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    {renderEditableStrong('admissionClass', tcData.className)}
                  </td>
                </tr>
                
                {/* Current Class - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'वर्तमान कक्षा' : 'Current Class'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    {renderEditableStrong('currentClass', tcData.className)} 
                    {' - '}
                    {renderEditableStrong('currentSection', tcData.sectionName)}
                  </td>
                </tr>
                
                {/* Reason for Leaving - Auto from popup */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {isHindi ? 'विद्यालय छोड़ने का कारण' : 'Reason for Leaving'}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <strong>{tcData.reasonForLeaving || '________________'}</strong>
                  </td>
                </tr>
                
                {/* Conduct - Editable */}
                <tr>
                  <td style={{ padding: '3px 10px 3px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('conduct')}:
                  </td>
                  <td style={{ padding: '3px 0' }}>
                    <input
                      type="text"
                      value={editableFields.conduct}
                      onChange={(e) => handleFieldChange('conduct', e.target.value)}
                      style={inputStyle}
                      placeholder={isHindi ? 'उत्तम' : 'Excellent'}
                      onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                      onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Fee Payment Details */}
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {isHindi ? 'नीचे लिखें अनुसार छात्र द्वारा विद्यालय के शुल्क का भुगतान कर दिया गया है।' : 'The student has paid the school fees as follows:'}
              </p>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: isHindi ? '13px' : '12px'
              }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '3px 10px 3px 0', width: '40%' }}>
                      <strong>1.</strong> {isHindi ? 'शिक्षण शुल्क' : 'Tuition Fee'}:
                    </td>
                    <td style={{ padding: '3px 0' }}>
                      <input
                        type="text"
                        value={editableFields.fee1}
                        onChange={(e) => handleFieldChange('fee1', e.target.value)}
                        style={{ ...inputStyle, width: '60%', display: 'inline-block' }}
                        placeholder="_____"
                        onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                        onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 10px 3px 0' }}>
                      <strong>2.</strong> {isHindi ? 'अन्य शुल्क' : 'Other Fee'}:
                    </td>
                    <td style={{ padding: '3px 0' }}>
                      <input
                        type="text"
                        value={editableFields.fee2}
                        onChange={(e) => handleFieldChange('fee2', e.target.value)}
                        style={{ ...inputStyle, width: '60%', display: 'inline-block' }}
                        placeholder="_____"
                        onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                        onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 10px 3px 0' }}>
                      <strong>3.</strong> {isHindi ? 'छात्रावास शुल्क' : 'Hostel Fee'}:
                    </td>
                    <td style={{ padding: '3px 0' }}>
                      <input
                        type="text"
                        value={editableFields.fee3}
                        onChange={(e) => handleFieldChange('fee3', e.target.value)}
                        style={{ ...inputStyle, width: '60%', display: 'inline-block' }}
                        placeholder="_____"
                        onFocus={(e) => e.target.style.borderBottom = '1px solid #1e3a5f'}
                        onBlur={(e) => e.target.style.borderBottom = '1px dotted #999'}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TC Footer */}
          <div style={{
            marginTop: '30px',
            position: 'relative',
            zIndex: 1,
            borderTop: '1px solid #d0d7de',
            paddingTop: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '10px',
              fontSize: isHindi ? '14px' : '13px'
            }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ marginBottom: '30px' }}>_________________________</p>
                <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#1e3a5f' }}>
                  {isHindi ? 'हस्ताक्षर' : 'Signature'}
                </p>
                <p style={{ margin: '2px 0', color: '#555', fontSize: isHindi ? '12px' : '11px' }}>
                  {isHindi ? 'प्राधान्याचार्य/प्राचार्य' : 'Principal'}
                </p>
                <p style={{ margin: '2px 0', color: '#888', fontSize: isHindi ? '11px' : '10px' }}>
                  {isHindi ? '(पद नाम सहित)' : '(With Designation)'}
                </p>
                <p style={{ margin: '2px 0', color: '#888', fontSize: isHindi ? '11px' : '10px', fontStyle: 'italic' }}>
                  {isHindi ? 'विद्यालय मुहर' : 'School Seal'}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '15px', fontSize: isHindi ? '13px' : '12px', color: '#555' }}>
              {t('date')}: {tcData.currentDate}
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: isHindi ? '11px' : '10px',
            color: '#999',
            borderTop: '1px dashed #ccc',
            paddingTop: '10px',
            position: 'relative',
            zIndex: 1
          }}>
            {t('computerGeneratedDocument')}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '20px',
          padding: '10px'
        }}>
          <button
            className="pri-btn pri-btn-primary"
            onClick={handlePrint}
            disabled={loading}
            style={{
              background: '#1e3a5f',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🖨️ {t('printDownloadTC')}
          </button>
          <button
            className="pri-btn pri-btn-ghost"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            {t('close')}
          </button>
        </div>
      </div>
    );
  }

  // Student list
  return (
    <div className="pri-content">
      <div className="pri-classes-header">
        <div className="mb">
          <div className="content-heading">
            📜 {t('transferCertificates')}
          </div>
          <div className="content-text">
            {t('selectStudentToGenerateTC')} • {students.length} {t('studentsFound')}
          </div>
        </div>
      </div>

      <div className="pri-filter-bar">
        <div className="pri-form-field">
          <label>{t('class')}</label>
          <PriAutocompleteSelect
            value={selectedFilterClass}
            data={classes || []}
            onChange={handleFilterClassChange}
            placeholder={t('allClasses')}
            optionLabel="className"
            optionValue="id"
            disabled={loading}
            size="medium"
            clearable
          />
        </div>

        <div className="pri-form-field">
          <label>{t('section')}</label>
          <PriAutocompleteSelect
            key={filterClass || "no-class"}
            value={selectedFilterSection}
            data={filteredSections || []}
            onChange={handleFilterSectionChange}
            placeholder={t('allSections')}
            optionLabel="sectionName"
            optionValue="id"
            disabled={!filterClass || loading}
            size="medium"
            clearable
          />
        </div>

        <button
          className="pri-btn pri-btn-ghost pri-btn-sm pd"
          onClick={handleClearFilters}
          disabled={loading}
        >
          {t('clear')}
        </button>

        <div className="pri-search-wrap" style={{ minWidth: 200 }}>
          <span>🔍</span>
          <input
            className="pri-search-input"
            placeholder={t('searchByNameRollFather')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="pri-btn pri-btn-primary pri-btn-sm"
          onClick={loadStudents}
          disabled={loading}
        >
          {loading ? '⏳' : `↻ ${t('refresh')}`}
        </button>
      </div>

      <div className="pri-card">
        <div className="table-wrap">
          {loading && students.length === 0 ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <table className="pri-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('rollNo')}</th>
                  <th>{t('studentName')}</th>
                  <th>{t('classSection')}</th>
                  <th>{t('fathersName')}</th>
                  <th>{t('action')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="pri-empty">
                        <div className="pri-empty-icon">🎓</div>
                        <p>{t('noStudentsFound')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="font-bolder">{s.enrollmentId}</span>
                        <div className="roll-no">
                          {t('rollNo')}: {s.rollNumber !== null && s.rollNumber !== undefined ? s.rollNumber : t('notAssigned')}
                        </div>
                      </td>
                      <td>
                        <div className="common">
                          <div className="avatar-box">
                            {s.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <span className="font-bolder">{s.name}</span>
                            <div className="roll-no">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {s.schoolClass?.className || '—'} / {s.section?.sectionName || '—'}
                      </td>
                      <td>{s.fatherName || '—'}</td>
                      <td>
                        <button
                          className="pri-btn pri-btn-primary"
                          onClick={() => handleSelectStudent(s)}
                          disabled={loading}
                        >
                          📜 {t('generateTC')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default TCFormat;
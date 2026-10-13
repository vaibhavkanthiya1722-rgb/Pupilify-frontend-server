import React, { useState, useEffect } from "react";
import StudentDetailsPrintController from "./StudentDetailsPrintController";
import { useTranslation } from 'react-i18next';
import PriOverviewService from '../../../../services/PriOverviewService';
import FileService from '../../../../services/FileService';

function StudentDetailsPrint({
  schoolId,
  user,
  onToast,
  student: propStudent,
  onClose,
  academicYearId
}) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [logoError, setLogoError] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  const {
    printRef,
    loading,
    getStudentData,
    handlePrint
  } = StudentDetailsPrintController({
    schoolId,
    user,
    onToast,
    student: propStudent,
    academicYearId
  });

  const studentData = getStudentData();

  const schoolLogo = studentData?.schoolLogo ||
    user?.schoolLogo ||
    localStorage.getItem('ss_school_logo') ||
    user?.school?.logo;

  const logoUrl = schoolLogo ? PriOverviewService.getLogoUrl(schoolLogo) : null;

  useEffect(() => {
    if (studentData?.studentPhotoRaw) {
      setPhotoLoading(true);
      let filename = studentData.studentPhotoRaw;
      if (filename.includes('/')) {
        filename = filename.split('/').pop();
      }

      const token = localStorage.getItem('ss_token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

      const fetchPhoto = async () => {
        try {
          const response = await fetch(`${API_URL}/api/admin/students/files/${encodeURIComponent(filename)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPhotoUrl(url);
          } else {
            console.error('❌ Failed to fetch photo:', response.status);
            setPhotoUrl(null);
          }
        } catch (error) {
          console.error('❌ Error fetching photo:', error);
          setPhotoUrl(null);
        } finally {
          setPhotoLoading(false);
        }
      };

      fetchPhoto();
    }
  }, [studentData?.studentPhotoRaw]);

  if (!propStudent) {
    return (
      <div className="pri-content">
        <div className="pri-card">
          <div className="pri-empty">
            <div className="pri-empty-icon">⚠️</div>
            <p>{t('noStudentData')}</p>
            <button className="pri-btn pri-btn-primary" onClick={onClose} style={{ marginTop: 20 }}>
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hindiStyle = isHindi ? {
    fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Arial', sans-serif",
    fontSize: '14px',
    lineHeight: '1.6'
  } : {};

  return (
    <div className="student-details-container-wrapper">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e3a5f' }}>
            📋 {t('studentDetails')}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
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
            🖨️ {t('printDetails')}
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
            ✕ {t('close')}
          </button>
        </div>
      </div>

      {/* A4 Size Container */}
      <div
        ref={printRef}
        className="student-details-print-container"
        style={{
          background: 'white',
          padding: '30px 35px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          maxWidth: '794px',
          minHeight: '1123px',
          margin: '0 auto',
          fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', 'Times New Roman', serif" : "'Times New Roman', Times, serif",
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
          color: 'rgba(200, 200, 200, 0.03)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 0,
          fontFamily: isHindi ? "'Noto Sans Devanagari', sans-serif" : "Arial, sans-serif",
          textTransform: 'uppercase',
          opacity: 0.1
        }}>
          {isHindi ? 'प्रवेश पत्र' : 'ADMISSION FORM'}
        </div>

        {/* Header - Logo Left, School Details Center */}
        <div className="print-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1,
          borderBottom: '2px solid #1e3a5f',
          paddingBottom: '15px',
          ...hindiStyle
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
              fontSize: isHindi ? '20px' : '24px',
              marginBottom: '3px',
              fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', serif" : "'Times New Roman', Times, serif",
              fontWeight: 'bold'
            }}>
              {studentData.schoolName}
            </h1>
            <p style={{ color: '#555', margin: '2px 0', fontSize: isHindi ? '12px' : '11px' }}>
              {studentData.schoolAddress}
            </p>
            <p style={{ color: '#555', margin: '2px 0', fontSize: isHindi ? '12px' : '11px' }}>
              📧 {studentData.schoolEmail} | 📞 {studentData.schoolPhone}
            </p>
            <p style={{
              color: '#1e3a5f',
              margin: '3px 0 0 0',
              fontSize: isHindi ? '13px' : '12px',
              fontWeight: 'bold'
            }}>
              {t('academicYear')}: {studentData.academicYear}
            </p>
          </div>
        </div>

        {/* Admission Form Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '15px',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            color: '#1e3a5f',
            fontSize: isHindi ? '18px' : '20px',
            textDecoration: 'underline',
            margin: '0',
            fontFamily: isHindi ? "'Noto Sans Devanagari', 'Mangal', serif" : "'Times New Roman', Times, serif"
          }}>
            {isHindi ? '📋 प्रवेश पत्र' : '📋 ADMISSION FORM'}
          </h2>
        </div>

        {/* Student Basic Info with Photo */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '15px',
          position: 'relative',
          zIndex: 1,
          ...hindiStyle
        }}>
          {/* Student Info */}
          <div style={{ flex: 1 }}>
            <table style={{ width: '100%', fontSize: isHindi ? '13px' : '12px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 8px 4px 0', fontWeight: 'bold', width: '35%', color: '#555' }}>
                    {t('fullName')}:
                  </td>
                  <td style={{ padding: '4px 0' }}><strong>{studentData.name}</strong></td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px 4px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('rollNumber')}:
                  </td>
                  <td style={{ padding: '4px 0' }}><strong>{studentData.rollNumber}</strong></td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px 4px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('classSection')}:
                  </td>
                  <td style={{ padding: '4px 0' }}>
                    <strong>{studentData.className} - {studentData.sectionName}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px 4px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('gender')}:
                  </td>
                  <td style={{ padding: '4px 0' }}>
                    <strong>
                      {isHindi ?
                        (studentData.gender === 'MALE' ? 'पुरुष' :
                          studentData.gender === 'FEMALE' ? 'महिला' :
                            studentData.gender || '—')
                        : studentData.gender}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px 4px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('dateOfBirth')}:
                  </td>
                  <td style={{ padding: '4px 0' }}><strong>{studentData.dob}</strong></td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 8px 4px 0', fontWeight: 'bold', color: '#555' }}>
                    {t('caste')}:
                  </td>
                  <td style={{ padding: '4px 0' }}>
                    <strong>
                      {isHindi ?
                        (studentData.caste === 'GENERAL' ? 'सामान्य' :
                          studentData.caste === 'OBC' ? 'ओबीसी' :
                            studentData.caste === 'SC' ? 'अनुसूचित जाति' :
                              studentData.caste === 'ST' ? 'अनुसूचित जनजाति' :
                                studentData.caste || '—')
                        : studentData.caste}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Student Photo */}
          <div style={{
            flex: '0 0 120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #d0d7de',
            borderRadius: '8px',
            padding: '8px',
            backgroundColor: '#f8fafc',
            minHeight: '150px'
          }}>
            {photoLoading ? (
              <div style={{
                width: '100px',
                height: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e2e8f0',
                borderRadius: '4px'
              }}>
                <div style={{ fontSize: '24px', color: '#94a3b8' }}>⏳</div>
              </div>
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt={t('studentPhoto')}
                style={{
                  width: '100px',
                  height: '130px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
                onError={() => {
                  console.error('❌ Student photo failed to load');
                  setPhotoUrl(null);
                }}
              />
            ) : (
              <div style={{
                width: '100px',
                height: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e2e8f0',
                borderRadius: '4px',
                fontSize: '50px',
                color: '#94a3b8'
              }}>
                👤
              </div>
            )}
            <p style={{
              margin: '5px 0 0 0',
              fontSize: '10px',
              color: '#666',
              fontWeight: 'bold'
            }}>
              {t('studentPhoto')}
            </p>
          </div>
        </div>

        {/* ID Information Section */}
        <div style={{ position: 'relative', zIndex: 1, ...hindiStyle }}>
          <h3 style={{
            margin: '12px 0 10px 0',
            fontSize: isHindi ? '15px' : '16px',
            color: '#1e3a5f',
            borderBottom: '1px solid #d0d7de',
            paddingBottom: '5px'
          }}>
            🆔 {t('idInformation')}
          </h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: isHindi ? '13px' : '12px'
          }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', width: '25%', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('scholarNo')}:
                </td>
                <td style={{ padding: '4px 0', width: '25%', verticalAlign: 'top' }}>
                  <strong>{studentData.scholarNo}</strong>
                </td>
                <td style={{ padding: '4px 8px 4px 20px', width: '25%', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('familyId')}:
                </td>
                <td style={{ padding: '4px 0', width: '25%', verticalAlign: 'top' }}>
                  <strong>{studentData.familyId}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('samagraId')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <strong>{studentData.samagraId}</strong>
                </td>
                <td style={{ padding: '4px 8px 4px 20px', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('apaarId')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <strong>{studentData.apaarId}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('aadharNumber')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <strong>{studentData.aadharCardNo}</strong>
                </td>
                 <td style={{ padding: '4px 8px 4px 20px', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('penNumber')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <strong>{studentData.penNumber || '—'}</strong>
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>

        {/* Personal Information Section */}
        <div style={{ position: 'relative', zIndex: 1, ...hindiStyle }}>
          <h3 style={{
            margin: '12px 0 10px 0',
            fontSize: isHindi ? '15px' : '16px',
            color: '#1e3a5f',
            borderBottom: '1px solid #d0d7de',
            paddingBottom: '5px'
          }}>
            👤 {t('personalInformation')}
          </h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: isHindi ? '13px' : '12px'
          }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', width: '25%', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('email')}:
                </td>
                <td style={{ padding: '4px 0', width: '25%', verticalAlign: 'top' }}>
                  <strong>{studentData.email}</strong>
                </td>
                <td style={{ padding: '4px 8px 4px 20px', width: '25%', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('phone')}:
                </td>
                <td style={{ padding: '4px 0', width: '25%', verticalAlign: 'top' }}>
                  <strong>{studentData.phoneNo}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('address')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }} colSpan="3">
                  <strong>{studentData.address}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('postalCode')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }} colSpan="3">
                  <strong>{studentData.postalCode}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Family Information Section */}
        <div style={{ position: 'relative', zIndex: 1, ...hindiStyle }}>
          <h3 style={{
            margin: '12px 0 10px 0',
            fontSize: isHindi ? '15px' : '16px',
            color: '#1e3a5f',
            borderBottom: '1px solid #d0d7de',
            paddingBottom: '5px'
          }}>
            👨‍👩‍👧 {t('familyInformation')}
          </h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: isHindi ? '13px' : '12px'
          }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', width: '25%', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('fathersName')}:
                </td>
                <td style={{ padding: '4px 0', width: '25%', verticalAlign: 'top' }}>
                  <strong>{studentData.fatherName}</strong>
                </td>
                <td style={{ padding: '4px 8px 4px 20px', width: '25%', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('mothersName')}:
                </td>
                <td style={{ padding: '4px 0', width: '25%', verticalAlign: 'top' }}>
                  <strong>{studentData.motherName}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('fathersContact')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <strong>{studentData.fatherContactNumber}</strong>
                </td>
                <td style={{ padding: '4px 8px 4px 20px', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('fatherOccupation')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <strong>{studentData.fatherOccupation}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('fatherSalary')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }} colSpan="3">
                  <strong>{studentData.fatherSalary}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bank Information Section */}
        <div style={{ position: 'relative', zIndex: 1, ...hindiStyle }}>
          <h3 style={{
            margin: '12px 0 10px 0',
            fontSize: isHindi ? '15px' : '16px',
            color: '#1e3a5f',
            borderBottom: '1px solid #d0d7de',
            paddingBottom: '5px'
          }}>
            🏦 {t('bankInformation')}
          </h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: isHindi ? '13px' : '12px'
          }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', width: '25%', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('bankName')}:
                </td>
                <td style={{ padding: '4px 0', width: '25%', verticalAlign: 'top' }}>
                  <strong>{studentData.bankName}</strong>
                </td>
                <td style={{ padding: '4px 8px 4px 20px', width: '25%', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('bankAccountNo')}:
                </td>
                <td style={{ padding: '4px 0', width: '25%', verticalAlign: 'top' }}>
                  <strong>{studentData.bankAccountNo}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px 4px 0', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('ifscCode')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <strong>{studentData.ifscCode}</strong>
                </td>
                <td style={{ padding: '4px 8px 4px 20px', fontWeight: '500', color: '#555', verticalAlign: 'top' }}>
                  {t('branch')}:
                </td>
                <td style={{ padding: '4px 0', verticalAlign: 'top' }}>
                  <strong>{studentData.branch}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ✅ SIGNATURE SECTION - Blank space for manual signature */}
        <div style={{
          marginTop: '25px',
          borderTop: '1px solid #d0d7de',
          paddingTop: '15px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end'
        }}>
          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            {/* 👇 Empty space for pen signature after print */}
            <div style={{
              height: '50px',
              borderBottom: '1px solid #000',
              marginBottom: '5px',
              minWidth: '180px'
            }}></div>
            <p style={{
              margin: '2px 0 0 0',
              fontSize: isHindi ? '9px' : '8px',
              color: '#666'
            }}>
              {t('principalSignature')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '15px',
          borderTop: '1px solid #d0d7de',
          paddingTop: '10px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: isHindi ? '11px' : '10px',
          color: '#888'
        }}>
          <div>
            <p style={{ margin: '0' }}>
              📅 {t('generatedOn')}: {studentData.currentDate}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0' }}>
              {t('thisIsAComputerGeneratedDocument')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailsPrint;
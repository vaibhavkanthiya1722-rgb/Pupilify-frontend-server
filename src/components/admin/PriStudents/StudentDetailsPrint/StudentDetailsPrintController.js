import { useState, useRef } from "react";
import { API_URL } from "../../../../libs/constants";

export default function StudentDetailsPrintController({
  schoolId,
  user,
  onToast,
  student,
  academicYearId
}) {
  const printRef = useRef();
  const [loading] = useState(false);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '________________';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // ✅ Helper function to get photo URL with token
  const getPhotoUrlWithToken = (photoUrl) => {
    if (!photoUrl) return null;
    
    const token = localStorage.getItem('ss_token');
    
    // Extract filename from URL
    let filename = photoUrl;
    if (photoUrl.includes('/')) {
      filename = photoUrl.split('/').pop();
    }
    
    try {
      filename = decodeURIComponent(filename);
    } catch (e) {
      // Keep as is
    }
    
    const encodedFilename = encodeURIComponent(filename);
    return `${API_URL}/api/admin/students/files/${encodedFilename}?token=${token}`;
  };

  const getStudentData = () => {
    if (!student) return null;

    const currentYear = student.academicYear?.currentYear || 
                       student.school?.currentYear?.currentYear || 
                       '2025-26';

    return {
      name: student.name || '________________',
      enrollmentId: student.enrollmentId || '________________',
      rollNumber: student.rollNumber || '________________',
      className: student.schoolClass?.className || '________________',
      sectionName: student.section?.sectionName || '________________',
      gender: student.gender || '________________',
      caste: student.caste || '________________',
      dob: formatDateForDisplay(student.dob),
      email: student.email || '________________',
      phoneNo: student.phoneNo || '________________',
      address: student.address || '________________',
      aadharCardNo: student.aadharCardNo || '________________',
      samagraId: student.samagraId || '________________',
      apaarId: student.apaarId || '________________',
      fatherName: student.fatherName || '________________',
      motherName: student.motherName || '________________',
      fatherContactNumber: student.fatherContactNumber || '________________',
      
      familyId: student.familyId || '________________',
      scholarNo: student.scholarNo || '________________',
      penNumber: student.penNumber || '________________', 
      fatherOccupation: student.fatherOccupation || '________________',
      fatherSalary: student.fatherSalary || '________________',
      postalCode: student.postalCode || '________________',
      bankName: student.bankName || '________________',
      bankAccountNo: student.bankAccountNo || '________________',
      ifscCode: student.ifscCode || '________________',
      branch: student.branch || '________________',
      
      // ✅ Student Photo with Token
      studentPhoto: getPhotoUrlWithToken(student.studentPhoto),
      studentPhotoRaw: student.studentPhoto || null,
      
      schoolName: student.school?.schoolName || 
                 student.schoolClass?.school?.schoolName || 
                 user?.schoolName || 
                 'SMART SCHOOL',
      schoolAddress: student.school?.address || 
                    student.schoolClass?.school?.address || 
                    'School Address',
      schoolPhone: student.school?.phoneNumber || 
                  student.schoolClass?.school?.phoneNumber || 
                  '________________',
      schoolEmail: student.school?.mailId || 
                  student.schoolClass?.school?.mailId || 
                  '________________',
      schoolLogo: student.school?.logo || null,
      
      hasPhoto: !!student.studentPhoto,
      hasAadharImg: !!student.aadharCardImage,
      hasMarksheet: !!student.lastClassMarksheet,
      hasTC: !!student.tcImage,
      
      academicYear: currentYear,
      currentDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
    };
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printContent = printRef.current.innerHTML;
    const studentName = student?.name || 'Student';
    const documentTitle = `${studentName}_Details_${new Date().getFullYear()}`;
    
    const styles = document.querySelector('style')?.innerHTML || '';
    const allStyles = document.querySelectorAll('style');
    let stylesHTML = '';
    allStyles.forEach(style => {
      stylesHTML += style.innerHTML;
    });
    
    const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
    let linksHTML = '';
    linkTags.forEach(link => {
      linksHTML += link.outerHTML;
    });
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${documentTitle}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${linksHTML}
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body { 
                font-family: 'Times New Roman', Times, serif; 
                margin: 0;
                padding: 20px;
                background: white;
                color: #000;
              }
              
              .student-details-print-container { 
                max-width: 794px;
                margin: 0 auto; 
                padding: 40px 35px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                position: relative;
                overflow: hidden;
                min-height: 1123px;
              }
              
              .print-header {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #1e3a5f;
                padding-bottom: 15px;
              }
              
              .print-header img {
                max-height: 80px;
                width: auto;
                object-fit: contain;
              }
              
              .print-header h1 {
                color: #1e3a5f;
                font-size: 24px;
                margin-bottom: 3px;
                font-family: 'Times New Roman', Times, serif;
              }
              
              .print-header p {
                color: #555;
                margin: 2px 0;
                font-size: 11px;
              }
              
              .student-details-print-container h2 {
                color: #1e3a5f;
                font-size: 20px;
                text-decoration: underline;
                margin: 0;
                font-family: 'Times New Roman', Times, serif;
              }
              
              .student-details-print-container h3 {
                margin: 12px 0 10px 0;
                font-size: 16px;
                color: #1e3a5f;
                border-bottom: 1px solid #d0d7de;
                padding-bottom: 5px;
                font-family: 'Times New Roman', Times, serif;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
              }
              
              td {
                padding: 4px 8px 4px 0;
                vertical-align: top;
              }
              
              td:first-child {
                font-weight: 500;
                color: #555;
              }
              
              td strong {
                font-weight: bold;
              }
              
              .student-photo-box {
                flex: 0 0 120px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border: 1px solid #d0d7de;
                border-radius: 8px;
                padding: 8px;
                background-color: #f8fafc;
              }
              
              .student-photo-box img {
                width: 100px;
                height: 130px;
                object-fit: cover;
                border-radius: 4px;
                border: 1px solid #ddd;
              }
              
              .student-photo-placeholder {
                width: 100px;
                height: 130px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #e2e8f0;
                border-radius: 4px;
                font-size: 50px;
                color: #94a3b8;
              }
              
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-30deg);
                font-size: 70px;
                font-weight: bold;
                color: rgba(200, 200, 200, 0.03) !important;
                white-space: nowrap;
                pointer-events: none;
                z-index: 0;
                font-family: Arial, sans-serif;
                text-transform: uppercase;
                opacity: 0.1 !important;
              }
              
              @media print {
                .watermark {
                  color: rgba(200, 200, 200, 0.02) !important;
                  opacity: 0.05 !important;
                }
              }
              
              @media print {
                body { 
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                
                .student-details-print-container {
                  border: none;
                  border-radius: 0;
                  padding: 30px 35px;
                  margin: 0 auto;
                  min-height: auto;
                  box-shadow: none !important;
                }
                
                .student-details-print-container > div {
                  position: relative;
                  z-index: 1;
                }
                
                .print-header {
                  page-break-after: avoid;
                }
                
                .student-details-print-container h2,
                .student-details-print-container h3 {
                  page-break-after: avoid;
                }
                
                * {
                  color: #000 !important;
                }
                
                .student-details-print-container {
                  background: white !important;
                }
              }
              
              ${stylesHTML}
            </style>
          </head>
          <body>
            <div class="student-details-print-container">
              <div class="watermark">STUDENT RECORD</div>
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  return {
    printRef,
    loading,
    getStudentData,
    handlePrint,
    formatDateForDisplay
  };
}
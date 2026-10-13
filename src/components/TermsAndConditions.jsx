// src/components/TermsAndConditions.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ Role data - defined properly
  const roles = [
    {
      role: "Super Admin",
      access: "Full System Access",
      description: "Manage states, districts, schools, and all managers",
      icon: "👑"
    },
    {
      role: "State Manager",
      access: "State Level Access",
      description: "Manage all schools and districts within their state",
      icon: "📊"
    },
    {
      role: "District Manager",
      access: "District Level Access",
      description: "Manage all schools within their district",
      icon: "📍"
    },
    {
      role: "Principal",
      access: "School Level Access",
      description: "Complete control over their school - teachers, students, fees, exams",
      icon: "🏫"
    },
    {
      role: "Teacher",
      access: "Class Level Access",
      description: "Marks entry, attendance, timetable, assignments and student reports",
      icon: "👨‍🏫"
    },
    {
      role: "Accountant",
      access: "Finance Access",
      description: "Fee collection, expenses, reports, and Tally export",
      icon: "💰"
    }
  ];

  return (
    <div className="terms-page">
      {/* Header */}
      <header className="terms-page-header">
        <div className="container">
          <Link to="/" className="back-home-btn">
            ← Back to Home
          </Link>
          <h1>📋 Terms & Conditions</h1>
 
        </div>
      </header>

      {/* Main Content */}
      <div className="terms-page-body">
        <div className="container">
          <div className="terms-content">
            {/* Section 1: Data Privacy */}
            <section className="terms-section">
              <h2>1. 🔒 Data Privacy & Security</h2>
              <p>Your data is encrypted with bank-grade security. We never share your data with third parties. Regular security audits and updates are performed. GDPR compliant data handling is strictly followed.</p>
              <ul>
                <li>End-to-end encryption for all data</li>
                <li>Regular security audits</li>
                <li>GDPR compliant</li>
                <li>No third-party data sharing</li>
              </ul>
            </section>

            {/* Section 2: School Management */}
            <section className="terms-section">
              <h2>2. 🏫 School Management</h2>
              <p>Complete control over your school data. Multi-school management under one dashboard. Real-time data synchronization. Role-based access control for all users.</p>
              <ul>
                <li>Complete school data control</li>
                <li>Multi-school management</li>
                <li>Real-time synchronization</li>
                <li>Role-based access control</li>
              </ul>
            </section>

            {/* Section 3: User Roles & Permissions */}
            <section className="terms-section">
              <h2>3. 👑 User Roles & Permissions</h2>
              <p>Different users have different permissions based on their role in the system.</p>
              
              {/* ✅ Roles Grid - This will display the cards */}
              <div className="role-permissions-grid">
                {roles && roles.length > 0 ? (
                  roles.map((role, index) => (
                    <div key={index} className="role-card-term">
                      <div className="role-icon">{role.icon}</div>
                      <h4>{role.role}</h4>
                      <div className="role-access">{role.access}</div>
                      <p>{role.description}</p>
                    </div>
                  ))
                ) : (
                  <p>No roles found</p>
                )}
              </div>
            </section>

            {/* Section 4: Student Deletion Policy */}
            <section className="terms-section highlight-section">
              <h2>4. 🧑‍🎓 Student Deletion Policy</h2>
              <div className="policy-box">
                <h4>Who can delete a student?</h4>
                <ul>
                  <li><strong>Principal</strong> - Can delete any student from the school</li>
               
                  <li><strong>Department</strong> - Can delete students from their department (if permission granted)</li>              
                  <li><strong>School Admin</strong> - Can delete students with proper authorization</li>
                </ul>
                
                <h4>Process:</h4>
                <ul>
                  <li>Student deletion requires proper authorization</li>
                  <li>All student data will be permanently removed</li>
                  <li>Parent/guardian notification is recommended</li>
                  <li>Deletion log is maintained for audit purposes</li>
                </ul>
                
                <div className="important-note">
                  <strong>⚠️ Important:</strong> Once a student is deleted, all their data including marks, attendance, and fee records will be permanently removed and cannot be recovered.
                </div>
              </div>
            </section>

            {/* Section 5: Teacher Deletion Policy */}
            <section className="terms-section highlight-section">
              <h2>5. 👨‍🏫 Teacher Deletion Policy</h2>
              <div className="policy-box">
                <h4>Who can delete a teacher?</h4>
                <ul>
                  <li><strong>Principal</strong> - Can delete any teacher from the school</li>
                  <li><strong>School Admin with Teacher Management Permission</strong> - Can delete teachers with proper authorization</li>
                  <li><strong>Department</strong> - Can delete teachers from their department (if permission granted)</li>
                </ul>
                
                <h4>Process:</h4>
                <ul>
                  <li>Teacher deletion requires proper authorization</li>
                  <li>All teacher data will be permanently removed</li>
                  <li>Students assigned to the teacher will need reassignment</li>
                  <li>Deletion log is maintained for audit purposes</li>
                </ul>
                
                <div className="important-note">
                  <strong>⚠️ Important:</strong> Before deleting a teacher, ensure all their classes, subjects, and student assignments are properly reassigned to other teachers.
                </div>
              </div>
            </section>

            {/* Section 6: School Deletion Policy */}
            <section className="terms-section highlight-section highlight-critical">
              <h2>6. 🏫 School Deletion Policy</h2>
              <div className="policy-box critical-box">
                <h4>⚠️ Critical: School Deletion</h4>
                <ul>
                  <li>School deletion <strong>REQUIRES</strong> Super Admin approval</li>
                  <li>Deletion request must be submitted in writing</li>
                  <li>All school data will be permanently removed</li>
                  <li>30-day data retention period before final deletion</li>
                  <li>Super Admin verification is mandatory</li>
                </ul>
                
                <h4>Contact Super Admin for School Deletion:</h4>
                <div className="contact-super-admin">
                  <p>📧 <strong>Email:</strong> khatushatechworks@gmail.com</p>
                  <p>📞 <strong>Phone:</strong> +91 6266755995</p>
                  <p>📞 <strong>Phone:</strong> +91 73545 96475</p>
                </div>
              </div>
            </section>

            {/* Section 7: Mobile App Terms */}
            <section className="terms-section">
              <h2>7. 📱 Mobile App Terms</h2>
              <ul>
                <li>Free mobile app for teachers & students</li>
                <li>Push notifications for important updates</li>
                <li>Data synchronization across devices</li>
              </ul>
            </section>

            {/* Section 8: AI Features Disclaimer */}
            <section className="terms-section">
              <h2>8. 🤖 AI Features Disclaimer</h2>
              <ul>
                <li>AI features are continuously improving</li>
                <li>Results are for guidance purposes only</li>
                <li>Human oversight recommended for critical decisions</li>
                <li>Features subject to availability</li>
                <li>AI predictions are not 100% accurate</li>
              </ul>
            </section>

            {/* Section 9: Documentation & Support */}
            <section className="terms-section">
              <h2>9. 📄 Documentation & Support</h2>
              <ul>
                <li>Complete user guides and video tutorials</li>
                <li>24/7 customer support via email & phone</li>
                <li>Onboarding and training sessions</li>
                <li>Regular webinar sessions</li>
                <li>Dedicated support team for your institution</li>
              </ul>
            </section>

            {/* Section 10: User Responsibilities */}
            <section className="terms-section">
              <h2>10. 📝 User Responsibilities</h2>
              <ul>
                <li>Maintain confidentiality of login credentials</li>
                <li>Use the system responsibly and ethically</li>
                <li>Report any security issues immediately</li>
                <li>Keep personal information updated</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Do not share your account with others</li>
              </ul>
            </section>

            {/* Section 11: Service Availability */}
            <section className="terms-section">
              <h2>11. ⚡ Service Availability</h2>
              <ul>
                <li>99.9% uptime guarantee</li>
                <li>Scheduled maintenance notifications</li>
                <li>Emergency downtime communication</li>
                <li>24/7 technical support</li>
                <li>Regular backups for data safety</li>
              </ul>
            </section>

            {/* Section 12: Acceptance of Terms */}
            <section className="terms-section acceptance-section">
              <h2>12. ✅ Acceptance of Terms</h2>
              <p>By using Pupilify, you agree to these terms and conditions. If you do not agree with any part of these terms, please do not use our platform. We reserve the right to update these terms at any time.</p>
              <div className="acceptance-box">
                <p><strong>By continuing to use Pupilify, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</strong></p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="terms-page-footer">
        <div className="container">
          <p>&copy; 2026 Pupilify. All rights reserved.</p>
          <Link to="/" className="back-home-btn-bottom">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
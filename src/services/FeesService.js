// src/services/FeesService.js

import API from "../libs/api";

const FeesService = {

  // ========== FEE STRUCTURE ==========

  // Get all fee structures
  getStructures: (schoolId) => {
    return API.get(`/api/admin/fees/structure/school/${schoolId}`);
  },

  // Set fee structure
  setStructure: (schoolId, academicYearId, data) => {
    return API.post(`/api/admin/fees/structure/set/${schoolId}?academicYearId=${academicYearId}`, data);
  },

  // Archive/Delete fee structure
  archiveStructure: (structureId) => {
    return API.delete(`/api/admin/fees/structure/delete/${structureId}`);
  },

  // ========== FEE COLLECTION ==========
  fetchStudentDetails: async (enrollmentId, schoolId) => {
    try {
      const response = await API.get(`/api/admin/fees/fetch-details/${enrollmentId}/${schoolId}`);
      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response Data:', response.data);
      
      // ✅ Log the structure
      if (response.data) {
        console.log('📡 Response data keys:', Object.keys(response.data));
      }
      
      // ✅ Check if response indicates no fee structure
      const data = response.data || response;
      
      // ✅ If totalFees is 0 or undefined, it means no fee structure
      if (data.totalFees === undefined || data.totalFees === null || data.totalFees === 0) {
        // ✅ Return a structured response with feeStructureExists: false
        return {
          ...data,
          totalFees: 0,
          totalClassFees: 0,
          previousYearDue: 0,
          totalPaidThisYear: 0,
          grandTotalDue: 0,
          remainingBalance: 0,
          paymentHistory: [],
          feeAdjustments: [],
          feeStructureExists: false,
          message: 'No fee structure found for this academic year'
        };
      }
      
      // ✅ Return the data with feeStructureExists: true
      return {
        ...data,
        feeStructureExists: true
      };
      
    } catch (error) {
      console.error('❌ fetchStudentDetails - Error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // ✅ If 500 error, return a structured response instead of throwing
      if (error.response?.status === 500) {
        return {
          totalFees: 0,
          totalClassFees: 0,
          previousYearDue: 0,
          totalPaidThisYear: 0,
          grandTotalDue: 0,
          remainingBalance: 0,
          paymentHistory: [],
          feeAdjustments: [],
          feeStructureExists: false,
          message: 'No fee structure found for this academic year'
        };
      }
      
      throw error;
    }
  },

  // Collect current year fees
  collectFees: (schoolId, academicYearId, data) => {
    return API.post(`/api/admin/fees/collect/${schoolId}?academicYearId=${academicYearId}`, data);
  },

  // ========== DUE REPORTS ==========

  // Get due report (all classes)
  getDueReport: (schoolId, academicYearId) => {
    return API.get(`/api/admin/fees/due-report/${schoolId}?academicYearId=${academicYearId}`);
  },

  // Get due report filtered by class
  getDueReportByClass: (schoolId, classId, academicYearId) => {
    return API.get(`/api/admin/fees/due-report/${schoolId}/${classId}?academicYearId=${academicYearId}`);
  },

  // Get due report filtered by section
  getDueReportBySection: (schoolId, classId, sectionId, academicYearId) => {
    return API.get(`/api/admin/fees/due-report/${schoolId}/${classId}/${sectionId}?academicYearId=${academicYearId}`);
  },

  // ========== PREVIOUS YEAR DUES ==========

  // Get previous year dues for a student
  getPreviousDues: (studentId) => {
    return API.get(`/api/admin/fees/dues/student/${studentId}`);
  },

  // Pay previous year due
  payPreviousDue: (dueId, schoolId, academicYearId, amountPaying, paymentMode) => {
    return API.post(`/api/admin/fees/dues/pay/${dueId}/${schoolId}?amountPaying=${amountPaying}&academicYearId=${academicYearId}&paymentMode=${paymentMode}`);
  },

  // Get student due history
  getStudentDueHistory: (studentId) => {
    return API.get(`/api/admin/fees/dues/history/${studentId}`);
  },

  // ========== FEE ADJUSTMENTS ==========

  // Add fee adjustment for a student
  addFeeAdjustment: (enrollmentId, adjustmentData, academicYearId) => {
    return API.post(`/api/admin/fees/adjustments/add/${enrollmentId}?academicYearId=${academicYearId}`, adjustmentData);
  },

  // Get complete fee record with adjustments
  getFeeRecord: async (enrollmentId) => {
    try {
      const response = await API.get(`/api/admin/fees/record/${enrollmentId}`);
      return response.data || response;
    } catch (error) {
      console.error('❌ getFeeRecord - Error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // ✅ If 500 error, return empty record instead of throwing
      if (error.response?.status === 500) {
        return {
          studentName: 'N/A',
          className: 'N/A',
          totalFees: 0,
          totalPaidThisYear: 0,
          previousYearDue: 0,
          grandTotalDue: 0,
          remainingBalance: 0,
          totalClassFees: 0,
          penalty: 0,
          extraFee: 0,
          discount: 0,
          admissionFee: 0,
          paymentHistory: [],
          feeAdjustments: [],
          feeStructureExists: false,
          message: 'No fee record found'
        };
      }
      throw error;
    }
  },

  // ========== CHECK FEE STRUCTURE ==========
  
  // ✅ NEW: Check if fee structure exists for a student
  checkFeeStructure: async (studentId, academicYearId) => {
    try {
      const response = await API.get(`/api/admin/fees/check-structure/${studentId}?academicYearId=${academicYearId}`);
      return response.data || { hasFeeStructure: false };
    } catch (error) {
      console.error('❌ checkFeeStructure - Error:', error);
      return { hasFeeStructure: false };
    }
  }

};

export default FeesService;
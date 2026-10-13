// src/services/BusService.js

import API from '../libs/api';

const BusService = {

    // ================= BUS MANAGEMENT =================
    getBuses: (schoolId) => {
        return API.get(`/api/buses/admin/school/${schoolId}`);
    },

    addBus: (schoolId, registrationNo, capacity) => {
        const params = new URLSearchParams();
        params.append('registrationNo', registrationNo);
        params.append('capacity', capacity);
        return API.post(`/api/buses/admin/${schoolId}/add?${params.toString()}`);
    },

    deleteBus: (schoolId, busId) => {
        return API.delete(`/api/buses/admin/delete/${schoolId}/${busId}`);
    },

    // ================= DRIVER MANAGEMENT =================
    createDriver: (schoolId, driverData, busId) => {
        const formData = new FormData();
        formData.append('driver', JSON.stringify(driverData));
        const params = new URLSearchParams();
        if (busId) params.append('busId', busId);
        return API.postFormData(
            `/api/admin/drivers/${schoolId}/create?${params.toString()}`,
            formData
        );
    },

    getDriversBySchool: (schoolId) => {
        return API.get(`/api/admin/drivers/school/${schoolId}`);
    },

    deleteDriver: (schoolId, driverId) => {
        return API.delete(`/api/admin/drivers/${schoolId}/delete/${driverId}`);
    },

    assignDriverToBus: (schoolId, driverId, busId) => {
        return API.put(`/api/admin/drivers/${schoolId}/${driverId}/assign-bus/${busId}`);
    },

    removeDriverFromBus: (schoolId, driverId) => {
        return API.put(`/api/admin/drivers/remove-from-bus/${driverId}`);
    },

    // ================= ROUTE MANAGEMENT =================
    createRoute: (schoolId, busId, routeName) => {
        const params = new URLSearchParams();
        params.append('busId', busId);
        params.append('routeName', routeName);
        return API.post(`/api/admin/routes/${schoolId}/create?${params.toString()}`);
    },

    getRoutesByBus: (schoolId, busId) => {
        return API.get(`/api/admin/routes/${schoolId}/bus/${busId}`);
    },

    deleteRoute: (schoolId, routeId) => {
        return API.delete(`/api/admin/routes/${schoolId}/${routeId}`);
    },

    // ================= STOPPAGE MANAGEMENT =================
    addStoppage: (schoolId, routeId, stopName) => {
        const params = new URLSearchParams();
        params.append('stopName', stopName);
        return API.post(
            `/api/admin/routes/${schoolId}/${routeId}/stoppages/add?${params.toString()}`
        );
    },

    getStoppagesByRoute: (schoolId, routeId) => {
        return API.get(`/api/admin/routes/${schoolId}/${routeId}/stoppages`);
    },

    updateStoppage: (schoolId, stoppageId, stopName) => {
        const params = new URLSearchParams();
        params.append('stopName', stopName);
        return API.put(
            `/api/admin/routes/${schoolId}/stoppages/${stoppageId}?${params.toString()}`
        );
    },

    deleteStoppage: (schoolId, stoppageId) => {
        return API.delete(`/api/admin/routes/${schoolId}/stoppages/${stoppageId}`);
    },

    // ================= FEE RATE STRUCTURE =================
    createFeeRateStructure: ({
        stoppageId,
        busId,
        schoolId,
        academicYearId,
        monthlyFeeAmount,
        totalMonths,
        academicYearStartMonth,
    }) => {
        const params = new URLSearchParams();
        params.append('stoppageId', stoppageId);
        params.append('busId', busId);
        params.append('schoolId', schoolId);
        params.append('academicYearId', academicYearId);
        params.append('monthlyFeeAmount', monthlyFeeAmount);
        params.append('totalMonths', totalMonths);
        params.append('academicYearStartMonth', academicYearStartMonth);
        return API.post(
            `/api/bus-monthly-fees/rate-structure/create?${params.toString()}`
        );
    },

    getFeeRateStructuresByBus: (busId, schoolId, academicYearId) => {
        return API.get(
            `/api/bus-monthly-fees/rate-structure/bus/${busId}?schoolId=${schoolId}&academicYearId=${academicYearId}`
        );
    },

    updateFeeRateStructure: (rateStructureId, monthlyFeeAmount) => {
        return API.put(
            `/api/bus-monthly-fees/rate-structure/${rateStructureId}?monthlyFeeAmount=${monthlyFeeAmount}`
        );
    },

    deleteFeeRateStructure: (rateStructureId) => {
        return API.delete(`/api/bus-monthly-fees/rate-structure/${rateStructureId}`);
    },

    getFeeRateStructuresByStoppage: (stoppageId, academicYearId) => {
        return API.get(
            `/api/bus-monthly-fees/rate-structure/stoppage/${stoppageId}?academicYearId=${academicYearId}`
        );
    },

    // ================= STUDENT ASSIGNMENT =================
    assignStudentMonthlyFee: ({
        studentId,
        stoppageId,
        busId,
        schoolId,
        academicYearId,
        selectedMonths,
        joiningMonth,
        paymentFrequency,
    }) => {
        const payload = {
            studentId: Number(studentId),
            stoppageId: Number(stoppageId),
            busId: Number(busId),
            schoolId: Number(schoolId),
            academicYearId: Number(academicYearId),
            selectedMonths: selectedMonths || [],
            joiningMonth: joiningMonth || "July",
            paymentFrequency: paymentFrequency || "MONTHLY"
        };

        console.log('📤 BusService sending:', JSON.stringify(payload, null, 2));

        return API.post('/api/bus-monthly-fees/assign-student', payload);
    },

    // ================= FIXED: UPDATE STUDENT ASSIGNMENT =================
    updateStudentFeeAssignment: (assignmentId, selectedMonths, paymentFrequency) => {
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add each selected month as a separate parameter
        if (Array.isArray(selectedMonths)) {
            selectedMonths.forEach(month => {
                params.append('selectedMonths', month);
            });
        }
        
        params.append('paymentFrequency', paymentFrequency);
        
        console.log('📤 Update Assignment URL:', 
            `/api/bus-monthly-fees/assignment/${assignmentId}?${params.toString()}`
        );
        
        return API.put(
            `/api/bus-monthly-fees/assignment/${assignmentId}?${params.toString()}`
        );
    },

    getStudentFeeAssignmentsByBus: (busId, schoolId, academicYearId) => {
        return API.get(
            `/api/bus-monthly-fees/assignments/bus/${busId}?schoolId=${schoolId}&academicYearId=${academicYearId}`
        );
    },

    getStudentFeeAssignmentsByStoppage: (stoppageId, academicYearId) => {
        return API.get(
            `/api/bus-monthly-fees/assignments/stoppage/${stoppageId}?academicYearId=${academicYearId}`
        );
    },

    getStudentFeeAssignment: (studentId, academicYearId) => {
        return API.get(
            `/api/bus-monthly-fees/assignment/${studentId}?academicYearId=${academicYearId}`
        );
    },

    deleteStudentFeeAssignment: (assignmentId) => {
        return API.delete(`/api/bus-monthly-fees/assignment/${assignmentId}`);
    },

    // ================= FEE COLLECTION =================
    collectBusFee: (studentId, academicYearId, amount, paymentMode) => {
        const params = new URLSearchParams();
        params.append('studentId', studentId);
        params.append('academicYearId', academicYearId);
        params.append('amount', amount);
        params.append('paymentMode', paymentMode);
        return API.post(`/api/buses/admin/collect-fee?${params.toString()}`);
    },


    // ================= FEE REPORTS =================
    getMonthlyFeesDueReport: (schoolId, academicYearId) => {
        return API.get(
            `/api/bus-monthly-fees/due-report/${schoolId}?academicYearId=${academicYearId}`
        );
    },

    getStudentMonthlyFeesBreakdown: (studentId, academicYearId) => {
        return API.get(
            `/api/bus-monthly-fees/breakdown/${studentId}?academicYearId=${academicYearId}`
        );
    },

    downloadBusFeeExcel: (schoolId, academicYearId) => {
        return API.get(
            `/api/bus-fees-report/download-excel/${schoolId}?academicYearId=${academicYearId}`,
            { responseType: 'blob' }
        );
    },

    getBusFeeDueCount: (schoolId, academicYearId) => {
        return API.get(
            `/api/bus-fees-report/count-dues/${schoolId}?academicYearId=${academicYearId}`
        );
    },

    getBusFeeTotalDue: (schoolId, academicYearId) => {
        return API.get(
            `/api/bus-fees-report/total-dues/${schoolId}?academicYearId=${academicYearId}`
        );
    },

    getStudentFeeHistory: (studentId) => {
    return API.get(`/api/bus-monthly-fees/student/${studentId}/history`);
},

    // ================= LEGACY =================
    assignStudentToBus: (studentId, stoppageId, academicYearId) => {
        const params = new URLSearchParams();
        params.append('studentId', studentId);
        params.append('stoppageId', stoppageId);
        params.append('academicYearId', academicYearId);
        return API.post(`/api/buses/assign-student?${params.toString()}`);
    },

    getAssignmentsByRoute: (routeId) => {
        return API.get(`/api/buses/assignments/route/${routeId}`);
    },

    getAssignmentsByBus: (schoolId, busId, academicYearId) => {
        return API.get(
            `/api/buses/admin/assignments/${schoolId}/${busId}?academicYearId=${academicYearId}`
        );
    },

    unassignStudent: (assignmentId) => {
        return API.delete(`/api/buses/unassign-student/${assignmentId}`);
    },

    // ================= LIVE BUS LOCATION =================
    toggleTracking: (busId, active) => {
        const params = new URLSearchParams();
        params.append('active', active);
        return API.post(`/api/transport/location/toggle/${busId}?${params.toString()}`);
    },

    updateLocation: (busId, latitude, longitude, speed) => {
        return API.post(`/api/transport/location/update/${busId}`, {
            latitude,
            longitude,
            speed,
        });
    },

    getActiveBusLocations: (schoolId) => {
        return API.get(`/api/transport/location/all/${schoolId}`);
    },

    getStudentBusLocation: (studentId) => {
        return API.get(`/api/transport/location/student/${studentId}`);
    },
};

export default BusService;
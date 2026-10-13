// src/components/admin/Bus/assignments/index.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import BusService from '../../../../services/BusService';
import StudentsService from '../../../../services/StudentsService';
import PriModal from '../../../admin/PriModal';
import PriAutocompleteSelect from '../../../common/PriAutocompleteSelect';
import TableSkeleton from '../../../loaders/TableSkeleton';
import DeleteButton from '../../../common/DeleteButton';

// Months for academic year - in correct order
const ACADEMIC_MONTHS = [
    'July', 'August', 'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April', 'May', 'June'
];

export default function AssignmentManager({ schoolId, selectedBus, academicYearId, onToast }) {
    const { t } = useTranslation();
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [stoppages, setStoppages] = useState([]);
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [feeStructures, setFeeStructures] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        routes: false,
        stoppages: false,
        students: false,
        assignments: false,
        feeStructures: false,
    });
    const [modal, setModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [form, setForm] = useState({
        studentId: '',
        stoppageId: '',
        selectedMonths: [],
        joiningMonth: 'July',
        paymentFrequency: 'MONTHLY',
    });

    // Use refs to prevent infinite loops
    const isFirstRender = useRef(true);
    const previousSelectedBus = useRef(null);
    const previousAcademicYearId = useRef(null);

    // Load routes for selected bus
    const loadRoutes = useCallback(async () => {
        if (!selectedBus?.id) return;
        setLoadingStates(prev => ({ ...prev, routes: true }));
        try {
            const response = await BusService.getRoutesByBus(schoolId, selectedBus.id);
            const data = response?.data || response || [];
            setRoutes(Array.isArray(data) ? data : []);
            if (data.length > 0) {
                setSelectedRoute(prev => prev || data[0]);
            }
        } catch (err) {
            console.error('❌ Error loading routes:', err);
            onToast?.(t('errorLoadingRoutes'), 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, routes: false }));
        }
    }, [selectedBus?.id, schoolId, onToast, t]);

    // Load stoppages for selected route
    const loadStoppages = useCallback(async () => {
        if (!selectedRoute?.id) return;
        setLoadingStates(prev => ({ ...prev, stoppages: true }));
        try {
            const response = await BusService.getStoppagesByRoute(schoolId, selectedRoute.id);
            const data = response?.data || response || [];
            setStoppages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('❌ Error loading stoppages:', err);
            onToast?.(t('errorLoadingStoppages'), 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, stoppages: false }));
        }
    }, [selectedRoute?.id, schoolId, onToast, t]);

    // Load students
    const loadStudents = useCallback(async () => {
        if (!schoolId) return;
        setLoadingStates(prev => ({ ...prev, students: true }));
        try {
            const response = await StudentsService.getStudents(schoolId, '', '', academicYearId);
            const data = response?.data || response || [];
            setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('❌ Error loading students:', err);
        } finally {
            setLoadingStates(prev => ({ ...prev, students: false }));
        }
    }, [schoolId, academicYearId]);

    // Transform students data with displayLabel
    const formattedStudents = useMemo(() => {
        return students.map(student => {
            const name = student.name || '';
            const enrollment = student.enrollmentId || 'N/A';
            
            const className = student.schoolClass?.className || student.className || '';
            const section = student.section?.sectionName || student.section || '';
            
            let displayLabel = name;
            if (enrollment !== 'N/A') {
                displayLabel = `${name} (${enrollment})`;
            }
            if (className) {
                displayLabel = `${displayLabel} - ${className}`;
            }
            if (section) {
                displayLabel = `${displayLabel} ${section}`;
            }
            
            return {
                ...student,
                displayLabel: displayLabel,
            };
        });
    }, [students]);

    // Load fee structures with better error handling
    const loadFeeStructures = useCallback(async () => {
        if (!selectedBus?.id || !academicYearId) {
            setFeeStructures({});
            return;
        }
        setLoadingStates(prev => ({ ...prev, feeStructures: true }));
        try {
            const response = await BusService.getFeeRateStructuresByBus(
                selectedBus.id, schoolId, academicYearId
            );
            
            let data = response?.data || response || [];
            if (!Array.isArray(data)) {
                data = [];
            }
            
            const feeMap = {};
            data.forEach(fee => {
                const stoppageId = fee.stoppageId || fee.stoppage?.id;
                if (stoppageId) {
                    if (!feeMap[stoppageId] || fee.id > feeMap[stoppageId].id) {
                        feeMap[stoppageId] = fee;
                    }
                }
            });
            
            setFeeStructures(feeMap);
        } catch (err) {
            console.error('❌ Error loading fee structures:', err);
            setFeeStructures({});
        } finally {
            setLoadingStates(prev => ({ ...prev, feeStructures: false }));
        }
    }, [selectedBus?.id, schoolId, academicYearId]);

    // Load student assignments
    const loadAssignments = useCallback(async () => {
        if (!selectedBus?.id || !academicYearId) {
            setAssignments([]);
            return;
        }
        setLoadingStates(prev => ({ ...prev, assignments: true }));
        try {
            const response = await BusService.getStudentFeeAssignmentsByBus(
                selectedBus.id, schoolId, academicYearId
            );
            
            let data = response?.data || response || [];
            if (!Array.isArray(data)) {
                data = [];
            }
            
            const parsedData = data.map(item => {
                if (typeof item.selectedMonths === 'string') {
                    try {
                        item.selectedMonths = JSON.parse(item.selectedMonths);
                    } catch (e) {
                        item.selectedMonths = [];
                    }
                }
                return item;
            });
            
            setAssignments(parsedData);
        } catch (err) {
            console.error('❌ Error loading assignments:', err);
            setAssignments([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, assignments: false }));
        }
    }, [selectedBus?.id, schoolId, academicYearId]);

    // Load all data - with proper dependency management
    const loadAllData = useCallback(async () => {
        if (!selectedBus?.id || !academicYearId) return;
        
        // Check if bus or academic year changed
        const busChanged = previousSelectedBus.current?.id !== selectedBus.id;
        const yearChanged = previousAcademicYearId.current !== academicYearId;
        
        if (!busChanged && !yearChanged && isFirstRender.current) {
            // Only load on first render or when dependencies change
            isFirstRender.current = false;
        }
        
        previousSelectedBus.current = selectedBus;
        previousAcademicYearId.current = academicYearId;
        
        await Promise.all([
            loadRoutes(),
            loadStudents(),
            loadFeeStructures(),
            loadAssignments()
        ]);
    }, [selectedBus, academicYearId, loadRoutes, loadStudents, loadFeeStructures, loadAssignments]);

    // Effect for initial data load
    useEffect(() => {
        if (selectedBus?.id && schoolId && academicYearId) {
            loadAllData();
        }
        // Cleanup function
        return () => {
            isFirstRender.current = true;
        };
    }, [selectedBus?.id, schoolId, academicYearId]); // Only re-run when these change

    // Effect for route changes - only load stoppages
    useEffect(() => {
        if (selectedRoute?.id) {
            loadStoppages();
        }
    }, [selectedRoute?.id]); // Only re-run when route changes

    // Effect for fee structures when stoppages change
    useEffect(() => {
        if (stoppages.length > 0 && selectedBus?.id && academicYearId) {
            loadFeeStructures();
        }
    }, [stoppages.length, selectedBus?.id, academicYearId]); // Only re-run when stoppages length changes

    // Get available months for student assignment
    const getAvailableMonths = () => {
        const startIndex = ACADEMIC_MONTHS.indexOf(form.joiningMonth);
        if (startIndex === -1) return [];
        return ACADEMIC_MONTHS.slice(startIndex);
    };

    // Toggle month selection
    const toggleMonthSelection = (month) => {
        setForm(prev => ({
            ...prev,
            selectedMonths: prev.selectedMonths.includes(month)
                ? prev.selectedMonths.filter(m => m !== month)
                : [...prev.selectedMonths, month]
        }));
    };

    // Check if student is already assigned
    const isStudentAssigned = (studentId) => {
        return assignments.some(a => 
            (a.studentId === studentId || a.student?.id === studentId)
        );
    };

    // Calculate total fee for selected months
    const calculateTotalFee = () => {
        const monthlyFee = feeStructures[form.stoppageId]?.monthlyFeeAmount || 0;
        return form.selectedMonths.length * monthlyFee;
    };

    // Handle assign student
    const handleAssignStudent = async () => {
        if (!form.studentId) {
            onToast?.(t('pleaseSelectStudent'), 'error');
            return;
        }
        if (!form.stoppageId) {
            onToast?.(t('pleaseSelectStoppage'), 'error');
            return;
        }
        if (!academicYearId) {
            onToast?.(t('academicYearRequired'), 'error');
            return;
        }
        if (form.selectedMonths.length === 0) {
            onToast?.(t('pleaseSelectMonths'), 'error');
            return;
        }

        if (!feeStructures[form.stoppageId]) {
            onToast?.(t('feeRateNotSetForStoppage'), 'error');
            return;
        }

        const payload = {
            studentId: Number(form.studentId),
            stoppageId: Number(form.stoppageId),
            busId: Number(selectedBus.id),
            schoolId: Number(schoolId),
            academicYearId: Number(academicYearId),
            selectedMonths: form.selectedMonths,
            joiningMonth: form.joiningMonth,
            paymentFrequency: form.paymentFrequency
        };

        setLoading(true);
        try {
            await BusService.assignStudentMonthlyFee(payload);
            
            const student = students.find(s => s.id === Number(form.studentId));
            const stoppage = stoppages.find(s => s.id === Number(form.stoppageId));
            onToast?.(
                t('studentAssignedSuccess', { 
                    student: student?.name || '', 
                    stop: stoppage?.stopName || '' 
                }),
                'success'
            );
            setModal(false);
            setForm({
                studentId: '',
                stoppageId: '',
                selectedMonths: [],
                joiningMonth: 'July',
                paymentFrequency: 'MONTHLY',
            });
            await Promise.all([loadAssignments(), loadFeeStructures()]);
        } catch (err) {
            console.error('❌ Error assigning student:', err);
            
            let errorMsg = t('errorAssigningStudent');
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMsg = err.response.data.error;
            } else if (err.response?.status === 409) {
                errorMsg = t('studentAlreadyAssigned');
            }
            onToast?.(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle update assignment
    const handleUpdateAssignment = async () => {
        if (!editingAssignment?.id) {
            onToast?.(t('invalidAssignment'), 'error');
            return;
        }
        if (form.selectedMonths.length === 0) {
            onToast?.(t('pleaseSelectMonths'), 'error');
            return;
        }

        setLoading(true);
        try {
            await BusService.updateStudentFeeAssignment(
                editingAssignment.id,
                form.selectedMonths,
                form.paymentFrequency
            );
            onToast?.(t('assignmentUpdatedSuccess'), 'success');
            setEditModal(false);
            setEditingAssignment(null);
            setForm({
                studentId: '',
                stoppageId: '',
                selectedMonths: [],
                joiningMonth: 'July',
                paymentFrequency: 'MONTHLY',
            });
            await loadAssignments();
        } catch (err) {
            console.error('❌ Error updating assignment:', err);
            onToast?.(t('errorUpdatingAssignment'), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete assignment
    const handleDeleteAssignment = async (assignmentId, studentName) => {
        if (!assignmentId) {
            onToast?.(t('invalidAssignmentId'), 'error');
            return;
        }
        if (!window.confirm(t('deleteAssignmentConfirm', { student: studentName }))) return;
        
        setLoading(true);
        try {
            await BusService.deleteStudentFeeAssignment(assignmentId);
            onToast?.(t('assignmentDeletedSuccess'), 'success');
            await loadAssignments();
        } catch (err) {
            console.error('❌ Error deleting assignment:', err);
            onToast?.(t('errorDeletingAssignment'), 'error');
        } finally {
            setLoading(false);
        }
    };

    // Open edit modal
    const handleEditAssignment = (assignment) => {
        setEditingAssignment(assignment);
        let selectedMonths = assignment.selectedMonths || [];
        if (typeof selectedMonths === 'string') {
            try {
                selectedMonths = JSON.parse(selectedMonths);
            } catch (e) {
                selectedMonths = [];
            }
        }
        setForm({
            studentId: assignment.studentId || assignment.student?.id || '',
            stoppageId: assignment.stoppageId || assignment.stoppage?.id || '',
            selectedMonths: Array.isArray(selectedMonths) ? selectedMonths : [],
            joiningMonth: assignment.joiningMonth || 'July',
            paymentFrequency: assignment.paymentFrequency || 'MONTHLY',
        });
        setEditModal(true);
    };

    // Check if fee structures are needed but missing
    const needsFeeSetup = useMemo(() => {
        return stoppages.length > 0 && Object.keys(feeStructures).length === 0;
    }, [stoppages, feeStructures]);

    // Check if all stoppages have fee structures
    const allFeeSet = useMemo(() => {
        return stoppages.length > 0 && stoppages.every(stop => feeStructures[stop.id]);
    }, [stoppages, feeStructures]);

    const isLoading = loading || Object.values(loadingStates).some(v => v === true);

    if (!selectedBus) {
        return (
            <div className="pri-card" style={{ padding: 40, textAlign: 'center' }}>
                <div className="pri-empty">
                    <div className="pri-empty-icon">👨‍🎓</div>
                    <p>{t('pleaseSelectBus')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pri-card">
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    gap: 10,
                    padding: '10px',
                }}
            >
                <div>
                    <h3 style={{ margin: 0, color: '#1e3a5f' }}>
                        👨‍🎓 {t('studentAssignment')} - {selectedBus.registrationNo}
                    </h3>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                        {assignments.length} {t('studentsAssigned')} • 
                        {t('academicYear')}: {academicYearId || t('notSet')}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        className="pri-btn pri-btn-primary pri-btn-sm"
                        onClick={() => {
                            setModal(true);
                            setForm({
                                studentId: '',
                                stoppageId: '',
                                selectedMonths: [],
                                joiningMonth: 'July',
                                paymentFrequency: 'MONTHLY',
                            });
                        }}
                        disabled={isLoading || !selectedRoute || needsFeeSetup}
                        title={needsFeeSetup ? t('setFeeRatesFirst') : ''}
                    >
                        + {t('assignStudent')}
                    </button>
                    <button
                        className="pri-btn pri-btn-ghost"
                        onClick={() => {
                            loadAssignments();
                            loadFeeStructures();
                        }}
                        disabled={isLoading}
                    >
                        🔄 {t('refresh')}
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div
                style={{
                    display: 'flex',
                    gap: 20,
                    marginBottom: 16,
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                <div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{t('route')}</span>
                    <select
                        value={selectedRoute?.id || ''}
                        onChange={(e) => {
                            const route = routes.find(r => r.id === parseInt(e.target.value));
                            setSelectedRoute(route);
                            setStoppages([]);
                        }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            minWidth: 180,
                            marginLeft: 8,
                        }}
                        disabled={loadingStates.routes}
                    >
                        <option value="">{t('selectRoute')}</option>
                        {routes.map(route => (
                            <option key={route.id} value={route.id}>
                                {route.routeName}
                            </option>
                        ))}
                    </select>
                    {loadingStates.routes && <span style={{ marginLeft: 8 }}>⏳</span>}
                </div>
                <div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{t('stoppages')}</span>
                    <div style={{ fontWeight: 600 }}>{stoppages.length}</div>
                </div>
                <div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{t('feeRatesSet')}</span>
                    <div style={{ 
                        fontWeight: 600, 
                        color: needsFeeSetup ? '#dc2626' : allFeeSet ? '#16a34a' : '#eab308',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }}>
                        {loadingStates.feeStructures ? (
                            <span>⏳</span>
                        ) : (
                            <>
                                {Object.keys(feeStructures).length} / {stoppages.length}
                                {needsFeeSetup && <span style={{ fontSize: 14 }}>⚠️</span>}
                            </>
                        )}
                    </div>
                </div>
                <div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{t('assignedStudents')}</span>
                    <div style={{ fontWeight: 600 }}>
                        {loadingStates.assignments ? '⏳' : assignments.length}
                    </div>
                </div>
             
            </div>

            {/* Fee Structures Display */}
            {Object.keys(feeStructures).length > 0 && (
                <div style={{
                    padding: '8px 14px',
                    background: '#f0fdf4',
                    borderRadius: 6,
                    marginBottom: 12,
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 16,
                }}>
                    <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: 13 }}>
                        📋 {t('feeRates')}:
                    </span>
                    {stoppages.map(stop => {
                        const fee = feeStructures[stop.id];
                        return (
                            <span key={stop.id} style={{ 
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}>
                                {stop.stopName}: 
                                <span style={{ 
                                    fontWeight: 600, 
                                    color: fee ? '#16a34a' : '#dc2626',
                                    marginLeft: 4,
                                }}>
                                    {fee ? `₹${fee.monthlyFeeAmount}/month` : '❌ ' + t('notSet')}
                                </span>
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Assignments Table */}
            <div className="table-wrap" style={{ marginBottom: 16 }}>
                {loadingStates.assignments && assignments.length === 0 ? (
                    <TableSkeleton rows={3} columns={10} />
                ) : assignments.length === 0 ? (
                    <div className="pri-empty" style={{ padding: 20 }}>
                        <div className="pri-empty-icon" style={{ fontSize: 40, marginBottom: 8 }}>👨‍🎓</div>
                        <p style={{ color: '#94a3b8' }}>
                            {selectedRoute ? t('noStudentsAssigned') : t('pleaseSelectRouteFirst')}
                        </p>
                        {selectedRoute && needsFeeSetup && (
                            <div style={{ 
                                marginTop: 8,
                                padding: '8px 16px',
                                background: '#fef3c7',
                                borderRadius: 6,
                                color: '#92400e',
                                fontSize: 13,
                            }}>
                                ⚠️ {t('setFeeRatesBeforeAssigning')}
                                <br />
                                <span style={{ fontSize: 12 }}>
                                    {t('feeStructuresMissing')}: {stoppages.filter(s => !feeStructures[s.id]).map(s => s.stopName).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <table className="pri-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>{t('student')}</th>
                                <th>{t('stoppage')}</th>
                                <th>{t('monthlyFee')}</th>
                                <th>{t('months')}</th>
                                <th>{t('totalFee')}</th>
                                <th>{t('due')}</th>
                                <th>{t('status')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((assignment, index) => {
                                const totalFee = assignment.totalFeeAmount || 0;
                                const paid = assignment.paidAmount || 0;
                                const due = totalFee - paid;
                                const isFullyPaid = due <= 0;
                                const monthlyFee = assignment.monthlyFeeAmount || 0;
                                const monthsCount = Array.isArray(assignment.selectedMonths) 
                                    ? assignment.selectedMonths.length 
                                    : 0;

                                return (
                                    <tr key={assignment.id || index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{assignment.studentName || assignment.name || '-'}</strong>
                                        </td>
                                        <td>{assignment.stopName || assignment.stoppage?.stopName || '-'}</td>
                                        <td style={{ color: '#16a34a', fontWeight: 600 }}>
                                            ₹{monthlyFee}
                                        </td>
                                        <td>{monthsCount}</td>
                                        <td style={{ fontWeight: 600 }}>₹{totalFee}</td>
                                        <td style={{ color: isFullyPaid ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                            ₹{due}
                                        </td>
                                        <td>
                                            {isFullyPaid ? (
                                                <span className="pri-badge pri-badge-success">✅ {t('paid')}</span>
                                            ) : (
                                                <span className="pri-badge pri-badge-danger">⚠️ {t('pending')}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                <button
                                                    className="pri-btn pri-btn-sm"
                                                    onClick={() => handleEditAssignment(assignment)}
                                                    disabled={isLoading}
                                                    style={{
                                                        background: '#3b82f6',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '2px 8px',
                                                        borderRadius: 4,
                                                        cursor: 'pointer',
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    ✏️
                                                </button>
                                                <DeleteButton
                                                    objectId={assignment.id}
                                                    objectName={assignment.studentName || assignment.name || 'Student'}
                                                    onDelete={(id) => handleDeleteAssignment(
                                                        id, 
                                                        assignment.studentName || assignment.name || 'Student'
                                                    )}
                                                    itemType={t('assignment')}
                                                    title={t('delete')}
                                                    icon="🗑️"
                                                    size="sm"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ============================================================ */}
            {/* ASSIGN STUDENT MODAL */}
            {/* ============================================================ */}
            {modal && (
                <PriModal
                    title={`👨‍🎓 ${t('assignStudentToBus')}`}
                    onClose={() => {
                        setModal(false);
                        setForm({
                            studentId: '',
                            stoppageId: '',
                            selectedMonths: [],
                            joiningMonth: 'July',
                            paymentFrequency: 'MONTHLY',
                        });
                    }}
                    size="lg"
                    footer={
                        <>
                            <button
                                className="pri-btn pri-btn-ghost"
                                onClick={() => {
                                    setModal(false);
                                    setForm({
                                        studentId: '',
                                        stoppageId: '',
                                        selectedMonths: [],
                                        joiningMonth: 'July',
                                        paymentFrequency: 'MONTHLY',
                                    });
                                }}
                                disabled={loading}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                className="pri-btn pri-btn-primary"
                                onClick={handleAssignStudent}
                                disabled={loading || !selectedRoute || needsFeeSetup}
                            >
                                {loading ? t('saving') : t('assignStudent')}
                            </button>
                        </>
                    }
                >
                    {/* Student Selection */}
                    <div className="pri-form-field mb-10">
                        <label>{t('student')} *</label>
                        <PriAutocompleteSelect
                            value={formattedStudents.find(s => s.id === Number(form.studentId))}
                            data={formattedStudents.filter(s => !isStudentAssigned(s.id)) || []}
                            onChange={(option) => {
                                setForm(prev => ({ 
                                    ...prev, 
                                    studentId: option?.id || '' 
                                }));
                            }}
                            placeholder={t('searchStudent')}
                            optionLabel="displayLabel"
                            optionValue="id"
                            disabled={loading}
                            size="medium"
                            clearable
                            required
                        />
                        <small style={{ color: '#64748b', display: 'block', marginTop: 4 }}>
                            {students.filter(s => !isStudentAssigned(s.id)).length} {t('studentsAvailable')}
                            <br />
                            <span style={{ fontSize: 11, fontStyle: 'italic', color: '#94a3b8' }}>
                                💡 {t('searchByEnrollmentHint')}
                            </span>
                        </small>
                    </div>

                    {/* Stoppage Selection */}
                    <div className="pri-form-field mb-10">
                        <label>{t('stoppage')} *</label>
                        <select
                            value={form.stoppageId}
                            onChange={(e) => {
                                const stoppageId = e.target.value;
                                setForm(prev => ({ 
                                    ...prev, 
                                    stoppageId: stoppageId,
                                    selectedMonths: []
                                }));
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: 'white',
                            }}
                            disabled={loading || !selectedRoute}
                        >
                            <option value="">{t('selectStoppage')}</option>
                            {stoppages.map(stop => {
                                const fee = feeStructures[stop.id];
                                const hasFee = !!fee;
                                return (
                                    <option key={stop.id} value={stop.id}>
                                        {stop.stopName}
                                        {hasFee && ` (₹${fee.monthlyFeeAmount}/month)`}
                                        {!hasFee && ' ⚠️ ' + t('noFeeSet')}
                                    </option>
                                );
                            })}
                        </select>
                        {form.stoppageId && !feeStructures[form.stoppageId] && (
                            <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>
                                ⚠️ {t('feeRateNotSetForStoppage')}
                            </div>
                        )}
                    </div>

                    {/* Joining Month */}
                    <div className="pri-form-field mb-10">
                        <label>{t('joiningMonth')}</label>
                        <select
                            value={form.joiningMonth}
                            onChange={(e) => {
                                const joiningMonth = e.target.value;
                                setForm(prev => ({
                                    ...prev,
                                    joiningMonth: joiningMonth,
                                    selectedMonths: []
                                }));
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: 'white',
                            }}
                            disabled={loading}
                        >
                            {ACADEMIC_MONTHS.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <small style={{ color: '#64748b' }}>
                            💡 {t('selectJoiningMonth')}
                        </small>
                    </div>

                    {/* Payment Frequency */}
                    <div className="pri-form-field mb-10">
                        <label>{t('paymentFrequency')}</label>
                        <select
                            value={form.paymentFrequency}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                paymentFrequency: e.target.value
                            }))}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: 'white',
                            }}
                            disabled={loading}
                        >
                            <option value="MONTHLY">{t('monthly')}</option>
                            <option value="YEARLY">{t('yearly')}</option>
                        </select>
                    </div>

                    {/* Month Selection */}
                    <div className="pri-form-field">
                        <label>{t('selectMonths')} *</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: 6,
                            padding: '8px',
                            background: '#f8fafc',
                            borderRadius: 6,
                            maxHeight: 180,
                            overflow: 'auto',
                            border: '1px solid #e2e8f0',
                        }}>
                            {getAvailableMonths().map(month => (
                                <label
                                    key={month}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontSize: 13,
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        cursor: form.stoppageId && feeStructures[form.stoppageId] ? 'pointer' : 'not-allowed',
                                        background: form.selectedMonths.includes(month)
                                            ? '#dbeafe'
                                            : 'transparent',
                                        transition: 'background 0.2s',
                                        opacity: form.stoppageId && feeStructures[form.stoppageId] ? 1 : 0.5,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.selectedMonths.includes(month)}
                                        onChange={() => toggleMonthSelection(month)}
                                        disabled={loading || !form.stoppageId || !feeStructures[form.stoppageId]}
                                    />
                                    {month}
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                            <small style={{ color: '#64748b' }}>
                                {form.selectedMonths.length} {t('monthsSelected')}
                            </small>
                            {form.stoppageId && feeStructures[form.stoppageId] && (
                                <small style={{ color: '#16a34a', fontWeight: 600 }}>
                                    {t('totalFee')}: ₹{calculateTotalFee()}
                                </small>
                            )}
                        </div>
                    </div>

                    {/* Fee Summary */}
                    {form.stoppageId && feeStructures[form.stoppageId] && (
                        <div style={{
                            marginTop: 12,
                            padding: '12px 16px',
                            background: '#f0fdf4',
                            borderRadius: 8,
                            border: '1px solid #bbf7d0',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 13 }}>{t('monthlyFee')}:</span>
                                    <span style={{ fontWeight: 600, marginLeft: 4 }}>
                                        ₹{feeStructures[form.stoppageId].monthlyFeeAmount}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 13 }}>{t('monthsCount')}:</span>
                                    <span style={{ fontWeight: 600, marginLeft: 4 }}>
                                        {form.selectedMonths.length}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: 13 }}>{t('totalFee')}:</span>
                                    <span style={{ fontWeight: 700, color: '#16a34a', marginLeft: 4, fontSize: 16 }}>
                                        ₹{calculateTotalFee()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </PriModal>
            )}

            {/* ============================================================ */}
            {/* EDIT ASSIGNMENT MODAL */}
            {/* ============================================================ */}
            {editModal && editingAssignment && (
                <PriModal
                    title={`✏️ ${t('editAssignment')}`}
                    onClose={() => {
                        setEditModal(false);
                        setEditingAssignment(null);
                        setForm({
                            studentId: '',
                            stoppageId: '',
                            selectedMonths: [],
                            joiningMonth: 'July',
                            paymentFrequency: 'MONTHLY',
                        });
                    }}
                    size="lg"
                    footer={
                        <>
                            <button
                                className="pri-btn pri-btn-ghost"
                                onClick={() => {
                                    setEditModal(false);
                                    setEditingAssignment(null);
                                    setForm({
                                        studentId: '',
                                        stoppageId: '',
                                        selectedMonths: [],
                                        joiningMonth: 'July',
                                        paymentFrequency: 'MONTHLY',
                                    });
                                }}
                                disabled={loading}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                className="pri-btn pri-btn-primary"
                                onClick={handleUpdateAssignment}
                                disabled={loading}
                            >
                                {loading ? t('saving') : t('updateAssignment')}
                            </button>
                        </>
                    }
                >
                    <div style={{
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: 6,
                        marginBottom: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                    }}>
                        <div>
                            <span style={{ color: '#64748b', fontSize: 12 }}>{t('student')}</span>
                            <div style={{ fontWeight: 600 }}>
                                {editingAssignment.studentName || editingAssignment.name || '-'}
                            </div>
                        </div>
                        <div>
                            <span style={{ color: '#64748b', fontSize: 12 }}>{t('stoppage')}</span>
                            <div style={{ fontWeight: 600 }}>
                                {editingAssignment.stopName || editingAssignment.stoppage?.stopName || '-'}
                            </div>
                        </div>
                        <div>
                            <span style={{ color: '#64748b', fontSize: 12 }}>{t('monthlyFee')}</span>
                            <div style={{ fontWeight: 600, color: '#16a34a' }}>
                                ₹{editingAssignment.monthlyFeeAmount || 0}
                            </div>
                        </div>
                    </div>

                    {/* Payment Frequency */}
                    <div className="pri-form-field mb-10">
                        <label>{t('paymentFrequency')}</label>
                        <select
                            value={form.paymentFrequency}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                paymentFrequency: e.target.value
                            }))}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: 6,
                                border: '1px solid #e2e8f0',
                                background: 'white',
                            }}
                            disabled={loading}
                        >
                            <option value="MONTHLY">{t('monthly')}</option>
                            <option value="YEARLY">{t('yearly')}</option>
                        </select>
                    </div>

                    {/* Month Selection */}
                    <div className="pri-form-field">
                        <label>{t('selectMonths')} *</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: 6,
                            padding: '8px',
                            background: '#f8fafc',
                            borderRadius: 6,
                            maxHeight: 180,
                            overflow: 'auto',
                            border: '1px solid #e2e8f0',
                        }}>
                            {ACADEMIC_MONTHS.map(month => {
                                const isSelected = form.selectedMonths.includes(month);
                                return (
                                    <label
                                        key={month}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: 13,
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            background: isSelected ? '#dbeafe' : 'transparent',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleMonthSelection(month)}
                                            disabled={loading}
                                        />
                                        {month}
                                    </label>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                            <small style={{ color: '#64748b' }}>
                                {form.selectedMonths.length} {t('monthsSelected')}
                            </small>
                            <small style={{ color: '#16a34a', fontWeight: 600 }}>
                                {t('totalFee')}: ₹{form.selectedMonths.length * (editingAssignment.monthlyFeeAmount || 0)}
                            </small>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div style={{
                        marginTop: 12,
                        padding: '8px 12px',
                        background: '#fef3c7',
                        borderRadius: 6,
                        fontSize: 13,
                        color: '#92400e',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                    }}>
                        <span>
                            {t('paid')}: ₹{editingAssignment.paidAmount || 0}
                        </span>
                        <span>
                            {t('due')}: ₹{(editingAssignment.totalFeeAmount || 0) - (editingAssignment.paidAmount || 0)}
                        </span>
                        <span>
                            {t('status')}: {(editingAssignment.totalFeeAmount || 0) - (editingAssignment.paidAmount || 0) <= 0 
                                ? '✅ ' + t('paid') 
                                : '⚠️ ' + t('pending')}
                        </span>
                    </div>
                </PriModal>
            )}
        </div>
    );
}
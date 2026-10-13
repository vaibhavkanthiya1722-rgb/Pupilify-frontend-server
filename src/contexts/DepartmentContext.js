// contexts/DepartmentContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DepartmentContext = createContext();

export function DepartmentProvider({ children }) {
    const [department, setDepartment] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [academicYear, setAcademicYear] = useState(null);
    const [loading, setLoading] = useState(true);

    const getDefaultPermissions = useCallback((deptType) => {
        const type = deptType?.toUpperCase();
        switch(type) {
            case 'ADMISSION':
                return ['overview', 'students'];
            case 'EXAM':
                return ['overview', 'results', 'exams'];
            case 'BUS':
                return ['overview', 'bus'];
            case 'FEES':
                return ['overview', 'fees'];
            default:
                return ['overview'];
        }
    }, []);

    const loadDepartmentData = useCallback(() => {
        try {
            // Load department from multiple possible storage keys
            let deptId = localStorage.getItem('ss_dept_id');
            let deptType = localStorage.getItem('ss_dept_type');
            let deptName = localStorage.getItem('ss_dept_name');
            
            // Try to get from ss_user if not found
            if (!deptId) {
                const userStr = localStorage.getItem('ss_user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    deptId = user?.departmentId;
                    deptType = user?.departmentType;
                    deptName = user?.departmentName;
                }
            }
            
            if (deptId) {
                setDepartment({
                    id: deptId,
                    type: deptType,
                    name: deptName
                });
            }
            
            // Load permissions from multiple possible storage keys
            let perms = localStorage.getItem('ss_dept_permissions');
            if (!perms) {
                perms = localStorage.getItem('ss_permissions');
            }
            if (perms) {
                const parsedPerms = JSON.parse(perms);
                // Convert to lowercase for consistent checking
                setPermissions(parsedPerms.map(p => p.toLowerCase()));
            } else {
                // Default permissions based on department type if no stored permissions
                const defaultPerms = getDefaultPermissions(deptType);
                setPermissions(defaultPerms);
            }
            
            // Load academic year
            const year = localStorage.getItem('ss_academic_year');
            if (year) {
                setAcademicYear(year);
            }
        } catch (error) {
            console.error('Error loading department data:', error);
        } finally {
            setLoading(false);
        }
    }, [getDefaultPermissions]);

    useEffect(() => {
        loadDepartmentData();
    }, [loadDepartmentData]);

    const hasPermission = (permissionName) => {
        if (!permissionName) return true;
        const permLower = permissionName.toLowerCase();
        return permissions.includes(permLower);
    };

    const logout = () => {
        // Remove all department related items
        const keysToRemove = [
            'ss_token', 'ss_role', 'ss_user', 'ss_user_type',
            'ss_dept_id', 'ss_dept_type', 'ss_dept_name',
            'ss_school_id', 'ss_dept_permissions', 'ss_permissions',
            'ss_academic_year', 'ss_academic_year_id'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        setDepartment(null);
        setPermissions([]);
        setAcademicYear(null);
    };

    return (
        <DepartmentContext.Provider value={{
            department,
            permissions,
            academicYear,
            loading,
            hasPermission,
            logout
        }}>
            {children}
        </DepartmentContext.Provider>
    );
}

export function useDepartment() {
    const context = useContext(DepartmentContext);
    if (!context) {
        throw new Error('useDepartment must be used within a DepartmentProvider');
    }
    return context;
}
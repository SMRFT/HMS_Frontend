import { useState, useEffect } from 'react';

export const STORE_DEPT_KEY = 'selected_store_department';
export const STORE_DEPT_NAME_KEY = 'selected_store_department_name';
export const STORE_DEPT_EVENT = 'storesDepartmentChange';

export const getSelectedStoreDepartment = () => {
    try {
        return localStorage.getItem(STORE_DEPT_KEY) || '';
    } catch (e) {
        return '';
    }
};

export const getSelectedStoreDepartmentName = () => {
    try {
        return localStorage.getItem(STORE_DEPT_NAME_KEY) || '';
    } catch (e) {
        return '';
    }
};

export const setSelectedStoreDepartment = (deptValue, deptName = '') => {
    const cleanVal = (deptValue === 'ALL' || !deptValue) ? '' : String(deptValue).trim();
    const cleanName = deptName ? String(deptName).trim() : cleanVal;

    try {
        if (cleanVal) {
            localStorage.setItem(STORE_DEPT_KEY, cleanVal);
            localStorage.setItem(STORE_DEPT_NAME_KEY, cleanName);
        } else {
            localStorage.removeItem(STORE_DEPT_KEY);
            localStorage.removeItem(STORE_DEPT_NAME_KEY);
        }
    } catch (e) {
        console.error('Error saving store department to localStorage:', e);
    }

    try {
        window.dispatchEvent(
            new CustomEvent(STORE_DEPT_EVENT, {
                detail: { department: cleanVal, name: cleanName }
            })
        );
    } catch (e) {
        console.error('Error dispatching storesDepartmentChange event:', e);
    }
};

/**
 * Custom React hook to subscribe to the active Stores department.
 * @param {Function} [onChange] Optional callback invoked when department changes
 * @returns {[string, (val: string, name?: string) => void, string]} [currentDeptId, setDeptFn, currentDeptName]
 */
export const useStoresDepartment = (onChange) => {
    const [dept, setDept] = useState(getSelectedStoreDepartment());
    const [deptName, setDeptName] = useState(getSelectedStoreDepartmentName());

    useEffect(() => {
        const handleDeptChange = (e) => {
            const newDept = e?.detail?.department ?? getSelectedStoreDepartment();
            const newName = e?.detail?.name ?? getSelectedStoreDepartmentName();
            setDept(newDept);
            setDeptName(newName);
            if (typeof onChange === 'function') {
                onChange(newDept, newName);
            }
        };

        const handleStorageChange = (e) => {
            if (e.key === STORE_DEPT_KEY || e.key === STORE_DEPT_NAME_KEY) {
                handleDeptChange();
            }
        };

        window.addEventListener(STORE_DEPT_EVENT, handleDeptChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener(STORE_DEPT_EVENT, handleDeptChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [onChange]);

    return [dept, setSelectedStoreDepartment, deptName];
};


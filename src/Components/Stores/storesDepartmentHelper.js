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

    const result = [dept, setSelectedStoreDepartment, deptName];
    // Attach properties & string coercion for callers that do `const activeGlobalDept = useStoresDepartment()`
    result.department = dept;
    result.departmentName = deptName;
    result.toString = () => dept;
    result.valueOf = () => dept;
    return result;
};

/**
 * Normalizes and checks if an item/document's department matches a target department.
 * Handles cross-referencing between:
 * - department ID / code (e.g. "DEPT001", "4")
 * - department Name (e.g. "Cardiology")
 * - department master list variants
 */
export const matchesStoreDepartment = (item, targetDept, targetDeptName, deptList = []) => {
    if (!targetDept || targetDept === 'ALL' || targetDept === '') return true;
    if (!item) return false;

    const tCode = String(targetDept).trim().toLowerCase();
    const tName = targetDeptName ? String(targetDeptName).trim().toLowerCase() : '';

    const validKeys = new Set();
    if (tCode) validKeys.add(tCode);
    if (tName && tName !== 'all departments') validKeys.add(tName);

    // Cross-reference with departments master list
    if (Array.isArray(deptList) && deptList.length > 0) {
        for (const d of deptList) {
            const dId = String(d.department_id || d.id || '').trim().toLowerCase();
            const dCode = String(d.department_code || '').trim().toLowerCase();
            const dName = String(d.department_name || d.name || '').trim().toLowerCase();

            if (
                (dId && (dId === tCode || dId === tName)) ||
                (dCode && (dCode === tCode || dCode === tName)) ||
                (dName && (dName === tCode || dName === tName))
            ) {
                if (dId) validKeys.add(dId);
                if (dCode) validKeys.add(dCode);
                if (dName) validKeys.add(dName);
            }
        }
    }

    const itemValues = [
        item.department,
        item.department_id,
        item.department_code,
        item.department_name,
        item.dept_name,
        item.dept_code,
        item.from_department,
        item.to_department
    ];

    for (const val of itemValues) {
        if (!val) continue;
        const cleanVal = String(val).trim().toLowerCase();
        if (validKeys.has(cleanVal)) return true;
        // Check substring for longer descriptive department names
        for (const vk of validKeys) {
            if (vk.length > 3 && (cleanVal.includes(vk) || vk.includes(cleanVal))) {
                return true;
            }
        }
    }

    return false;
};



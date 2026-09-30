export const PAGE_PERMISSIONS = {
    "/CashCounterManager": "HMS-P-CCC",
};

/**
 * Checks if a user has permission to view a specific route.
 * @param {string} route - The route path (e.g., "/Dashboard")
 * @param {Array} allowedActions - List of allowed permission IDs (e.g., ["HMS-P-ADM-R"])
 * @param {Object} dynamicPermissions - Dynamically fetched mapping of route -> array of permissions
 * @returns {boolean} - True if allowed, False otherwise.
 */
export const hasPagePermission = (route, allowedActions, dynamicPermissions = {}) => {
    // Determine the actual array of permissions the user possesses
    let permissions = [];
    if (Array.isArray(allowedActions)) {
        permissions = allowedActions;
    } else if (allowedActions && Array.isArray(allowedActions.allowed_pages)) {
        permissions = allowedActions.allowed_pages;
    }

    // 1. Super Admin bypass
    if (permissions.includes("HMS-R-SA")) return true;

    // 2. Check hms_pages from localStorage (Page ID based access)
    try {
        const storedHmsPages = JSON.parse(localStorage.getItem("hms_pages") || "[]");
        const numericHmsPages = Array.isArray(storedHmsPages) ? storedHmsPages.map(Number) : [];

        if (numericHmsPages.length > 0) {
            const pageData = dynamicPermissions ? dynamicPermissions[route] : null;
            let pageId = null;
            if (pageData) {
                if (typeof pageData === 'object' && !Array.isArray(pageData) && pageData.page_id != null) {
                    pageId = Number(pageData.page_id);
                } else if (typeof pageData === 'number') {
                    pageId = pageData;
                }
            }

            if (pageId != null && numericHmsPages.includes(pageId)) {
                return true;
            }
        }
    } catch (e) {
        console.error("Error checking hms_pages in hasPagePermission:", e);
    }

    // 3. Check dynamic permissions (Action String based access)
    if (dynamicPermissions && dynamicPermissions[route]) {
        const entry = dynamicPermissions[route];
        const requiredPermissions = (typeof entry === 'object' && !Array.isArray(entry) && entry.permissions)
            ? entry.permissions
            : entry;

        const hasReqPerms = Array.isArray(requiredPermissions)
            ? requiredPermissions.length > 0
            : (requiredPermissions && typeof requiredPermissions === 'object' && Object.keys(requiredPermissions).length > 0);

        if (hasReqPerms && permissions.length > 0) {
            const reqArray = Array.isArray(requiredPermissions)
                ? requiredPermissions
                : Object.values(requiredPermissions);

            if (reqArray.some(reqPerm => permissions.some(action => action.startsWith(reqPerm)))) {
                return true;
            }
        }
    }

    if (permissions.length === 0) {
        // Check if hms_pages exists and has entries
        try {
            const storedHmsPages = JSON.parse(localStorage.getItem("hms_pages") || "[]");
            if (Array.isArray(storedHmsPages) && storedHmsPages.length > 0) {
                // If hms_pages is used instead of allowedActions, allow access if route isn't strictly restricted
                const permissionId = PAGE_PERMISSIONS[route];
                if (!permissionId) return true;
            }
        } catch (e) {}
    }

    // 4. Fallback check for missing routes
    const permissionId = PAGE_PERMISSIONS[route];

    if (!permissionId) return true; // Open access if not mapped

    // Check if any allowed action starts with the Page ID
    return permissions.some(action => action.startsWith(permissionId));
};

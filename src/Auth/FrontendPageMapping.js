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

    if (permissions.length === 0) return false;

    // 1. Check dynamic permissions (prioritized)
    if (dynamicPermissions && dynamicPermissions[route]) {
        const requiredPermissions = dynamicPermissions[route];
        const hasReqPerms = Array.isArray(requiredPermissions) 
            ? requiredPermissions.length > 0 
            : (requiredPermissions && typeof requiredPermissions === 'object' && Object.keys(requiredPermissions).length > 0);

        if (hasReqPerms) {
            // Normalize requiredPermissions to array for comparison
            const reqArray = Array.isArray(requiredPermissions) 
                ? requiredPermissions 
                : Object.values(requiredPermissions);

            return reqArray.some(reqPerm =>
                permissions.some(action => action.startsWith(reqPerm))
            );
        }
    }

    // 2. Fallback check for missing routes
    const permissionId = PAGE_PERMISSIONS[route];

    if (!permissionId) return true; // Open access if not mapped

    // Check if any allowed action starts with the Page ID
    return permissions.some(action => action.startsWith(permissionId));
};

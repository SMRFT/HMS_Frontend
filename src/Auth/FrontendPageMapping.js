export const PAGE_PERMISSIONS = {
    // Dashboard
    "/Dashboard": "HMS-API-SUM", // Hypothetical map based on token, user to verify

    // Patient Registration 
    "/PatientRegistrationForm": "HMS-P-REG", // "HMS-P-REG-R" / "HMS-P-REG-RW" found in token

    // Admission
    "/Admission": "HMS-P-BTD", // "HMS-P-BTD-R" found in token - potentially Admission?
    "/Admission/": "HMS-P-BTD",

    // Pharmacy Stock
    "/IPPharmacyStock": "HMS-P-HMSPS", // "HMS-P-HMSPS-RW" found in token
    "/OPPharmacyStock": "HMS-P-HMSPS", // Reuse or find specific

    // Vendor
    "/VendorManagement": "HMS-API-VM", // Placeholder - check token

    // Pharmacy Sales
    "/IPPharmacy": "HMS-P-PH", // Placeholder
    "/OPPharmacy": "HMS-P-PH",

    // GRN
    "/IPGRNGeneration": "HMS-API-GR", // "HMS-API-GR-RW" found in token
    "/OPGRNGeneration": "HMS-API-GR",

    // Doctor Management
    "/DoctorList": "HMS-API-DRM", // "HMS-API-DRM-RW" found in token

    // Investigation Billing
    "/InvestigationBilling": "HMS-API-IB", // "HMS-API-IB-RW" found in token
    "/ViewBills": "HMS-API-IB",
    "/ViewEstimate": "HMS-API-IB",

    // Investigation Reports
    "/CTList": "HMS-API-ICT", // "HMS-API-ICT-RW" found in token
    "/MRIList": "HMS-API-IMRI", // "HMS-API-IMRI-RW" found in token
    "/USGList": "HMS-API-IUSG", // "HMS-API-IUSG-RW" found in token
    "/XRayList": "HMS-API-IXRAY", // "HMS-API-IXRAY-RW" found in token

    // Rooms Master
    "/Block": "HMS-P-BLK", // Placeholder
    "/RoomCategory": "HMS-P-RCAT", // Placeholder
    "/Room": "HMS-P-RM", // Placeholder
    "/Bed": "HMS-P-BED", // Placeholder
    "/Service": "HMS-P-SRV", // Placeholder

    // Room Operations
    "/RoomEnquiry": "HMS-P-RENQ", // Placeholder
    "/RoomShifting": "HMS-P-RSHFT", // Placeholder

    // Discharge
    "/DischargeForm": "HMS-API-SUM", // "HMS-API-SUM-RW" found in token
    "/Summary": "HMS-API-SUM",
    "/DischargeReport": "HMS-API-SUM",

    // Enquiry
    "/Enquiry": "HMS-P-ENQ", // Placeholder

    // User Permission Manager
    "/UserPermissions": "HMS-P-HMS", // Reusing test permission for access

    // Dummy Test Page
    "/HMSUsers": "HMS-P-HMS",
};

/**
 * Checks if a user has permission to view a specific route.
 * @param {string} route - The route path (e.g., "/Dashboard")
 * @param {Array} allowedActions - List of allowed permission IDs (e.g., ["HMS-P-ADM-R"])
 * @returns {boolean} - True if allowed, False otherwise.
 */
export const hasPagePermission = (route, allowedActions) => {
    if (!allowedActions || allowedActions.length === 0) return false;

    const permissionId = PAGE_PERMISSIONS[route];

    if (!permissionId) return true; // Open access if not mapped

    // Check if any allowed action starts with the Page ID
    // User token format examples: "HMS-API-ICT-RW", "HMS-P-BTD-R"
    // We match if permissionId (e.g., "HMS-API-ICT") is the prefix of any action
    return allowedActions.some(action => action.startsWith(permissionId));
};

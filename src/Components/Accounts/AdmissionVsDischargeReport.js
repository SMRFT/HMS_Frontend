import React from "react";
import MasterAdmissionVsDischargeReport from "../MasterAccounts/MasterAdmissionVsDischargeReport";

/**
 * Admission vs Discharge Report (Accounts & Master Accounts)
 * Grouped hierarchically:
 * 1. Head: Admitting Date
 * 2. Sub-Head: Company / Corporate
 * 3. Sub-Head: Room / Bed
 * Filters: Date Range, Outlet, Company / Corporate, Status, Search, IP Sort Order.
 */
const AdmissionVsDischargeReport = (props) => {
    return <MasterAdmissionVsDischargeReport {...props} />;
};

export default AdmissionVsDischargeReport;

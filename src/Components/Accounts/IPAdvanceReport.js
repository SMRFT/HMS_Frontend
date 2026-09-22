import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { DatePicker, Spin, Tooltip, Modal, Badge } from "antd";
import { 
    FaPrint, 
    FaFileExcel, 
    FaSearch, 
    FaSyncAlt, 
    FaLayerGroup, 
    FaListUl,
    FaMoneyBillWave,
    FaUsers,
    FaHospitalUser,
    FaInfoCircle,
    FaEye
} from "react-icons/fa";
import * as XLSX from "xlsx";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "./printAccountsReport";
import { 
    colors, 
    PageWrapper, 
    fadeIn, 
    FormRow, 
    InputWrapper, 
    Label, 
    Input, 
    Select, 
    Button, 
    TableWrapper, 
    Table, 
    Th, 
    Td, 
    Tr, 
    SectionTitle 
} from "../GlobalStyles";

// ─── STYLED COMPONENTS ───────────────────────────────────────────────────────

const Container = styled.div`
    padding: ${props => props.isModal ? "10px 0" : "20px"};
    animation: ${fadeIn} 0.3s ease-out;
`;

const FilterCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
`;

const MetricCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.1);
    }

    .info {
        .label {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 4px;
        }
        .value {
            font-size: 1.4rem;
            font-weight: 800;
            color: ${colors.textMain};
            margin: 0;
        }
        .sub {
            font-size: 0.75rem;
            color: #94a3b8;
            margin-top: 2px;
        }
    }

    .icon-box {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: ${props => props.bg || "#f1f5f9"};
        color: ${props => props.color || colors.primary};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
    }
`;

const FloorHeaderRow = styled.tr`
    background: #f8fafc !important;
    border-top: 2px solid #cbd5e1;
    border-bottom: 2px solid #cbd5e1;

    td {
        padding: 10px 14px !important;
        font-weight: 800 !important;
        font-size: 0.88rem !important;
        color: #0f172a !important;
        letter-spacing: 0.03em;
        text-transform: uppercase;
    }
`;

const SubtotalRow = styled.tr`
    background: #f1f5f9 !important;
    font-weight: 700;
    border-top: 1px solid #cbd5e1;
    border-bottom: 1px solid #cbd5e1;

    td {
        padding: 8px 12px !important;
        font-size: 0.82rem !important;
        color: #334155 !important;
    }
`;

const GrandTotalRow = styled.tr`
    background: #0f172a !important;
    color: #ffffff !important;
    font-weight: 800;

    td {
        padding: 12px 14px !important;
        font-size: 0.95rem !important;
        color: #ffffff !important;
        border: none !important;
    }
`;

const ActionBtn = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 14px;
    height: 38px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    ${props => props.variant === "primary" && `
        background: ${colors.primary || "#0d9488"};
        color: #ffffff;
        &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
        }
    `}

    ${props => props.variant === "success" && `
        background: #16a34a;
        color: #ffffff;
        &:hover:not(:disabled) {
            background: #15803d;
            transform: translateY(-1px);
        }
    `}

    ${props => props.variant === "secondary" && `
        background: #ffffff;
        border-color: #cbd5e1;
        color: #334155;
        &:hover:not(:disabled) {
            background: #f8fafc;
            border-color: #94a3b8;
        }
    `}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// ─── PRINT TEMPLATE (Exact match to official Hospital PDF) ───────────────────

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        background: #ffffff;
        width: 100%;
        color: #000000;
        font-family: Arial, sans-serif;
        padding: 0;
        margin: 0;
    }
`;

const PrintHeaderContainer = styled.div`
    text-align: left;
    margin-bottom: 8px;

    .hospital-title {
        font-size: 13px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
    }
    .hospital-sub {
        font-size: 9.5px;
        color: #111;
        margin: 1px 0 6px 0;
    }
    .report-title {
        font-size: 11px;
        font-weight: bold;
        margin-top: 4px;
        color: #000;
    }
`;

const PrintTableWrapper = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
    font-size: 8.5px;
    line-height: 1.2;

    thead tr {
        border-top: 1.5px solid #000;
        border-bottom: 1.5px solid #000;
    }

    th {
        padding: 4px 3px;
        text-align: left;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 8.5px;
        color: #000;
        border: none;
    }

    td {
        padding: 2.5px 3px;
        border: none;
        color: #000;
        vertical-align: top;
    }

    .floor-heading td {
        padding: 5px 3px 2px 3px;
        font-weight: bold;
        font-size: 9px;
        text-transform: uppercase;
        text-decoration: underline;
    }

    .subtotal-row td {
        border-top: 0.5px solid #777;
        font-weight: bold;
        padding-top: 3px;
        padding-bottom: 4px;
    }

    .grand-total-row td {
        border-top: 1.5px solid #000;
        border-bottom: 1.5px solid #000;
        font-weight: bold;
        font-size: 9.5px;
        padding: 5px 3px;
    }
`;

const PrintFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 4px;
    border-top: 0.5px solid #000;
    font-size: 8px;
    color: #000;
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const IPAdvanceReport = ({ isModalView = false, startDate, endDate }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    // Filters state
    const [asOnDate, setAsOnDate] = useState(
        endDate || startDate || dayjs().format("YYYY-MM-DD")
    );
    const [selectedFloor, setSelectedFloor] = useState("all");
    const [advanceFilter, setAdvanceFilter] = useState("all"); // 'all' | 'with_advance' | 'zero_advance'
    const [customerType, setCustomerType] = useState("all"); // 'all' | 'General' | 'Insurance'
    const [searchTerm, setSearchTerm] = useState("");
    const [isGroupedView, setIsGroupedView] = useState(true);

    // Data state
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [floorsList, setFloorsList] = useState([]);
    const [summary, setSummary] = useState({
        total_patients: 0,
        total_with_advance: 0,
        total_zero_advance: 0,
        total_advance: 0,
        as_on_date: dayjs().format("DD/MM/YYYY")
    });

    // Patient Advance Breakdown Modal
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Fetch report data from backend
    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (asOnDate) params.append("as_on_date", asOnDate);
            if (selectedFloor && selectedFloor !== "all") params.append("floor", selectedFloor);
            if (advanceFilter && advanceFilter !== "all") params.append("has_advance", advanceFilter);
            if (customerType && customerType !== "all") params.append("customer_type", customerType);
            if (searchTerm.trim()) params.append("search", searchTerm.trim());

            const response = await apiRequest(`${HmsBaseUrl}patient-advance-report/?${params.toString()}`, "GET");

            if (response && response.success) {
                const resPayload = response.data || {};
                const list = Array.isArray(resPayload)
                    ? resPayload
                    : (Array.isArray(resPayload.data) ? resPayload.data : []);
                const grp = Array.isArray(resPayload.grouped_data)
                    ? resPayload.grouped_data
                    : [];
                const flrs = Array.isArray(resPayload.floors_list)
                    ? resPayload.floors_list
                    : [];

                setRecords(list);
                setGroupedData(grp);
                setFloorsList(flrs);
                if (resPayload.summary) {
                    setSummary(resPayload.summary);
                } else {
                    setSummary({
                        total_patients: list.length,
                        total_with_advance: list.filter(r => (r.advance || 0) > 0).length,
                        total_zero_advance: list.filter(r => (r.advance || 0) === 0).length,
                        total_advance: list.reduce((sum, r) => sum + (r.advance || 0), 0),
                        as_on_date: dayjs(asOnDate).format("DD/MM/YYYY")
                    });
                }
            } else {
                setRecords([]);
                setGroupedData([]);
                toast.error(response?.error || response?.message || "Failed to load IP Advance Report");
            }
        } catch (error) {
            console.error("Error fetching IP advance report:", error);
            setRecords([]);
            setGroupedData([]);
            toast.error("Failed to load IP Advance Report");
        } finally {
            setLoading(false);
        }
    }, [asOnDate, selectedFloor, advanceFilter, customerType, searchTerm, HmsBaseUrl]);

    // Initial fetch
    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Update date if props change
    useEffect(() => {
        if (endDate) setAsOnDate(endDate);
        else if (startDate) setAsOnDate(startDate);
    }, [startDate, endDate]);

    // Excel Export
    const handleExportExcel = () => {
        if (!records || records.length === 0) {
            toast.warning("No records available to export");
            return;
        }

        try {
            const exportRows = [];
            const hospName = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
            const hospAddr = localStorage.getItem("hospital_address") || "51/24.Saradha College Road, Salem - 636007";

            // Title block
            exportRows.push({ "Sl-No": hospName });
            exportRows.push({ "Sl-No": hospAddr });
            exportRows.push({ "Sl-No": `Patient advance details as on date ${summary.as_on_date || dayjs(asOnDate).format("DD/MM/YYYY")}` });
            exportRows.push({}); // blank line

            // Header row info
            (groupedData || []).forEach(group => {
                exportRows.push({ "Sl-No": `*** ${group.floor} ***` });
                (group.records || []).forEach(r => {
                    exportRows.push({
                        "Sl-No": r.sl_no,
                        "ROOM": r.room,
                        "IPNUMBER": r.ip_number,
                        "PATIENTNAME": r.patient_name,
                        "ADMITTINGDATE": r.admitting_date,
                        "No of days": r.no_of_days,
                        "ADVANCE": Number((r.advance || 0).toFixed(2)),
                        "COMPANY NAME": r.company_name || ""
                    });
                });
                exportRows.push({
                    "Sl-No": "",
                    "ROOM": "",
                    "IPNUMBER": "",
                    "PATIENTNAME": `Subtotal (${group.floor}):`,
                    "ADMITTINGDATE": "",
                    "No of days": `${group.count} Patients`,
                    "ADVANCE": Number((group.subtotal_advance || 0).toFixed(2)),
                    "COMPANY NAME": ""
                });
                exportRows.push({}); // blank line
            });

            // Grand Total
            exportRows.push({
                "Sl-No": "",
                "ROOM": "",
                "IPNUMBER": "",
                "PATIENTNAME": "GRAND TOTAL:",
                "ADMITTINGDATE": "",
                "No of days": `${summary.total_patients} Patients`,
                "ADVANCE": Number((summary.total_advance || 0).toFixed(2)),
                "COMPANY NAME": ""
            });

            const ws = XLSX.utils.json_to_sheet(exportRows);
            ws["!cols"] = [
                { wch: 8 },  // Sl-No
                { wch: 10 }, // ROOM
                { wch: 16 }, // IPNUMBER
                { wch: 28 }, // PATIENTNAME
                { wch: 16 }, // ADMITTINGDATE
                { wch: 12 }, // No of days
                { wch: 16 }, // ADVANCE
                { wch: 34 }, // COMPANY NAME
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Patient Advance Details");
            XLSX.writeFile(wb, `Patient_Advance_Details_as_on_${asOnDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (error) {
            console.error("Excel export error:", error);
            toast.error("Failed to export Excel");
        }
    };

    // Print Report
    const handlePrint = () => {
        printAccountsReport("printable-report-area", "landscape");
    };

    const hospitalName = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospitalAddress = localStorage.getItem("hospital_address") || "51/24.Saradha College Road, Salem - 636007";
    const currentPrintTime = dayjs().format("DD/MM/YYYY HH:mm:ss");

    return (
        <Container isModal={isModalView}>
            {!isModalView && (
                <SectionTitle>
                    <h3>IP Advance Report</h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                        Patient advance details of currently admitted in-patients grouped by Floor and Ward
                    </p>
                </SectionTitle>
            )}

            {/* Filter Controls Bar */}
            <FilterCard className="no-print">
                <FormRow style={{ alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
                    <InputWrapper style={{ minWidth: "160px", flex: "1 1 160px" }}>
                        <Label>As on Date</Label>
                        <DatePicker
                            value={asOnDate ? dayjs(asOnDate) : null}
                            onChange={(d) => setAsOnDate(d ? d.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            allowClear={false}
                            style={{ width: "100%", height: "38px", borderRadius: "8px" }}
                        />
                    </InputWrapper>

                    <InputWrapper style={{ minWidth: "160px", flex: "1 1 160px" }}>
                        <Label>Floor / Ward</Label>
                        <Select
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                            style={{ height: "38px" }}
                        >
                            <option value="all">All Floors</option>
                            {(floorsList || []).map((flr) => (
                                <option key={flr} value={flr}>{flr}</option>
                            ))}
                        </Select>
                    </InputWrapper>

                    <InputWrapper style={{ minWidth: "170px", flex: "1 1 170px" }}>
                        <Label>Advance Status</Label>
                        <Select
                            value={advanceFilter}
                            onChange={(e) => setAdvanceFilter(e.target.value)}
                            style={{ height: "38px" }}
                        >
                            <option value="all">All In-Patients</option>
                            <option value="with_advance">With Advance (&gt; ₹0)</option>
                            <option value="zero_advance">Zero Advance (₹0)</option>
                        </Select>
                    </InputWrapper>

                    <InputWrapper style={{ minWidth: "160px", flex: "1 1 160px" }}>
                        <Label>Category</Label>
                        <Select
                            value={customerType}
                            onChange={(e) => setCustomerType(e.target.value)}
                            style={{ height: "38px" }}
                        >
                            <option value="all">All Categories</option>
                            <option value="General">Cash / General</option>
                            <option value="Insurance">Insurance / Corporate</option>
                        </Select>
                    </InputWrapper>

                    <InputWrapper style={{ minWidth: "200px", flex: "2 1 200px" }}>
                        <Label>Search</Label>
                        <Input
                            placeholder="Room, IP Number, Patient, Company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ height: "38px" }}
                        />
                    </InputWrapper>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "auto" }}>
                        <ActionBtn variant="primary" onClick={fetchReport} disabled={loading}>
                            <FaSyncAlt className={loading ? "spin" : ""} /> Refresh
                        </ActionBtn>
                        <ActionBtn 
                            variant="secondary" 
                            onClick={() => setIsGroupedView(prev => !prev)}
                            title="Toggle Grouped / Flat View"
                        >
                            {isGroupedView ? <FaListUl /> : <FaLayerGroup />} {isGroupedView ? "Flat List" : "Group by Floor"}
                        </ActionBtn>
                        <ActionBtn 
                            variant="success" 
                            onClick={handleExportExcel} 
                            disabled={loading || records.length === 0}
                        >
                            <FaFileExcel /> Export Excel
                        </ActionBtn>
                        <ActionBtn 
                            variant="secondary" 
                            onClick={handlePrint} 
                            disabled={loading || records.length === 0}
                        >
                            <FaPrint /> Print
                        </ActionBtn>
                    </div>
                </FormRow>
            </FilterCard>

            {/* KPI Summary Cards */}
            <SummaryGrid className="no-print">
                <MetricCard color={colors.primary || "#0d9488"} bg="#ccfbf1">
                    <div className="info">
                        <div className="label">Total In-Patients</div>
                        <div className="value">{summary.total_patients}</div>
                        <div className="sub">Currently Admitted</div>
                    </div>
                    <div className="icon-box">
                        <FaUsers />
                    </div>
                </MetricCard>

                <MetricCard color="#16a34a" bg="#dcfce7">
                    <div className="info">
                        <div className="label">With Advance</div>
                        <div className="value">{summary.total_with_advance}</div>
                        <div className="sub">Patients having deposits</div>
                    </div>
                    <div className="icon-box">
                        <FaHospitalUser />
                    </div>
                </MetricCard>

                <MetricCard color="#f59e0b" bg="#fef3c7">
                    <div className="info">
                        <div className="label">Zero Advance</div>
                        <div className="value">{summary.total_zero_advance}</div>
                        <div className="sub">No advance deposit paid</div>
                    </div>
                    <div className="icon-box">
                        <FaInfoCircle />
                    </div>
                </MetricCard>

                <MetricCard color="#8b5cf6" bg="#ede9fe">
                    <div className="info">
                        <div className="label">Total Advance Collected</div>
                        <div className="value">₹{(summary.total_advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="sub">As on {summary.as_on_date}</div>
                    </div>
                    <div className="icon-box">
                        <FaMoneyBillWave />
                    </div>
                </MetricCard>
            </SummaryGrid>

            {/* Main Interactive Screen Table */}
            <TableWrapper className="no-print">
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spin size="large" />
                        <p style={{ marginTop: "12px", color: colors.textMuted }}>Loading in-patient advance records...</p>
                    </div>
                ) : (!Array.isArray(records) || records.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: colors.textMuted }}>
                        <FaInfoCircle size={36} style={{ opacity: 0.4, marginBottom: "10px" }} />
                        <h4>No Patient Advance Records Found</h4>
                        <p style={{ fontSize: "0.85rem" }}>Try changing the date, floor filter, or search keywords.</p>
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <Tr>
                                <Th style={{ width: "60px", textAlign: "center" }}>Sl-No</Th>
                                <Th style={{ width: "100px" }}>ROOM</Th>
                                <Th style={{ width: "140px" }}>IPNUMBER</Th>
                                <Th>PATIENTNAME</Th>
                                <Th style={{ width: "130px" }}>ADMITTINGDATE</Th>
                                <Th style={{ width: "100px", textAlign: "center" }}>No of days</Th>
                                <Th style={{ width: "140px", textAlign: "right" }}>ADVANCE</Th>
                                <Th style={{ minWidth: "200px" }}>COMPANY NAME</Th>
                                <Th style={{ width: "70px", textAlign: "center" }}>Action</Th>
                            </Tr>
                        </thead>
                        <tbody>
                            {isGroupedView ? (
                                (groupedData || []).map((group) => (
                                    <React.Fragment key={group.floor}>
                                        <FloorHeaderRow>
                                            <td colSpan={9}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span>{group.floor}</span>
                                                    <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#475569" }}>
                                                        {group.count} {group.count === 1 ? "Patient" : "Patients"} &bull; Advance: ₹{Number(group.subtotal_advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </td>
                                        </FloorHeaderRow>
                                        {(group.records || []).map((row) => (
                                            <Tr key={row.ip_number} style={{ cursor: "pointer" }} onClick={() => setSelectedPatient(row)}>
                                                <Td style={{ textAlign: "center", fontWeight: "600", color: "#64748b" }}>{row.sl_no}</Td>
                                                <Td style={{ fontWeight: "700", color: "#0f172a" }}>{row.room}</Td>
                                                <Td style={{ fontFamily: "monospace", fontWeight: "600", color: colors.primary }}>{row.ip_number}</Td>
                                                <Td style={{ fontWeight: "600" }}>{row.patient_name}</Td>
                                                <Td>{row.admitting_date}</Td>
                                                <Td style={{ textAlign: "center" }}>
                                                    <Badge 
                                                        count={row.no_of_days} 
                                                        style={{ 
                                                            backgroundColor: row.no_of_days > 30 ? "#fee2e2" : row.no_of_days > 7 ? "#fef3c7" : "#f1f5f9",
                                                            color: row.no_of_days > 30 ? "#b91c1c" : row.no_of_days > 7 ? "#b45309" : "#334155",
                                                            fontWeight: "bold"
                                                        }} 
                                                    />
                                                </Td>
                                                <Td style={{ 
                                                    textAlign: "right", 
                                                    fontWeight: "700", 
                                                    color: row.advance > 0 ? "#15803d" : "#94a3b8" 
                                                }}>
                                                    ₹{Number(row.advance || 0).toFixed(2)}
                                                </Td>
                                                <Td style={{ textTransform: "uppercase", fontSize: "0.8rem", color: row.company_name ? "#1e293b" : "#94a3b8" }}>
                                                    {row.company_name || "-"}
                                                </Td>
                                                <Td style={{ textAlign: "center" }} onClick={(e) => { e.stopPropagation(); setSelectedPatient(row); }}>
                                                    <Tooltip title="View Advance Details">
                                                        <Button secondary style={{ padding: "4px 8px", height: "auto" }}>
                                                            <FaEye size={12} />
                                                        </Button>
                                                    </Tooltip>
                                                </Td>
                                            </Tr>
                                        ))}
                                        <SubtotalRow>
                                            <td colSpan={5} style={{ textAlign: "right", textTransform: "uppercase" }}>
                                                {group.floor} Subtotal ({group.count} Patients):
                                            </td>
                                            <td style={{ textAlign: "center" }}></td>
                                            <td style={{ textAlign: "right", color: "#0f172a" }}>
                                                ₹{Number(group.subtotal_advance || 0).toFixed(2)}
                                            </td>
                                            <td colSpan={2}></td>
                                        </SubtotalRow>
                                    </React.Fragment>
                                ))
                            ) : (
                                (records || []).map((row) => (
                                    <Tr key={row.ip_number} style={{ cursor: "pointer" }} onClick={() => setSelectedPatient(row)}>
                                        <Td style={{ textAlign: "center", fontWeight: "600", color: "#64748b" }}>{row.sl_no}</Td>
                                        <Td style={{ fontWeight: "700", color: "#0f172a" }}>{row.room}</Td>
                                        <Td style={{ fontFamily: "monospace", fontWeight: "600", color: colors.primary }}>{row.ip_number}</Td>
                                        <Td style={{ fontWeight: "600" }}>{row.patient_name}</Td>
                                        <Td>{row.admitting_date}</Td>
                                        <Td style={{ textAlign: "center" }}>
                                            <Badge 
                                                count={row.no_of_days} 
                                                style={{ 
                                                    backgroundColor: row.no_of_days > 30 ? "#fee2e2" : row.no_of_days > 7 ? "#fef3c7" : "#f1f5f9",
                                                    color: row.no_of_days > 30 ? "#b91c1c" : row.no_of_days > 7 ? "#b45309" : "#334155",
                                                    fontWeight: "bold"
                                                }} 
                                            />
                                        </Td>
                                        <Td style={{ 
                                            textAlign: "right", 
                                            fontWeight: "700", 
                                            color: row.advance > 0 ? "#15803d" : "#94a3b8" 
                                        }}>
                                            ₹{Number(row.advance || 0).toFixed(2)}
                                        </Td>
                                        <Td style={{ textTransform: "uppercase", fontSize: "0.8rem", color: row.company_name ? "#1e293b" : "#94a3b8" }}>
                                            {row.company_name || "-"}
                                        </Td>
                                        <Td style={{ textAlign: "center" }} onClick={(e) => { e.stopPropagation(); setSelectedPatient(row); }}>
                                            <Tooltip title="View Advance Details">
                                                <Button secondary style={{ padding: "4px 8px", height: "auto" }}>
                                                    <FaEye size={12} />
                                                </Button>
                                            </Tooltip>
                                        </Td>
                                    </Tr>
                                ))
                            )}

                            {/* Grand Total Row */}
                            <GrandTotalRow>
                                <td colSpan={5} style={{ textAlign: "right", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    GRAND TOTAL:
                                </td>
                                <td style={{ textAlign: "center" }}>{summary.total_patients} Pts</td>
                                <td style={{ textAlign: "right" }}>
                                    ₹{Number(summary.total_advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td colSpan={2}></td>
                            </GrandTotalRow>
                        </tbody>
                    </Table>
                )}
            </TableWrapper>

            {/* ── PRINT VIEW AREA (Rendered into print frame) ─────────────────── */}
            <PrintTemplate id="printable-report-area">
                <PrintHeaderContainer>
                    <div className="hospital-title">{hospitalName}</div>
                    <div className="hospital-sub">{hospitalAddress}</div>
                    <div className="report-title">
                        Patient advance details as on date {summary.as_on_date || dayjs(asOnDate).format("DD/MM/YYYY")}
                    </div>
                </PrintHeaderContainer>

                <PrintTableWrapper>
                    <thead>
                        <tr>
                            <th style={{ width: "45px" }}>Sl-No</th>
                            <th style={{ width: "65px" }}>ROOM</th>
                            <th style={{ width: "95px" }}>IPNUMBER</th>
                            <th style={{ width: "175px" }}>PATIENTNAME</th>
                            <th style={{ width: "95px" }}>ADMITTINGDATE</th>
                            <th style={{ width: "65px", textAlign: "center" }}>No of days</th>
                            <th style={{ width: "80px", textAlign: "right" }}>ADVANCE</th>
                            <th style={{ width: "175px", paddingLeft: "10px" }}>COMPANY NAME</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(groupedData || []).map((group) => (
                            <React.Fragment key={`print-${group.floor}`}>
                                <tr className="floor-heading">
                                    <td colSpan={8}>{group.floor}</td>
                                </tr>
                                {(group.records || []).map((r) => (
                                    <tr key={`print-row-${r.ip_number}`}>
                                        <td style={{ textAlign: "left" }}>{r.sl_no}</td>
                                        <td>{r.room}</td>
                                        <td>{r.ip_number}</td>
                                        <td style={{ textTransform: "uppercase" }}>{r.patient_name}</td>
                                        <td>{r.admitting_date}</td>
                                        <td style={{ textAlign: "center" }}>{r.no_of_days}</td>
                                        <td style={{ textAlign: "right" }}>{Number(r.advance || 0).toFixed(2)}</td>
                                        <td style={{ paddingLeft: "10px", textTransform: "uppercase" }}>{r.company_name || ""}</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                        <tr className="grand-total-row">
                            <td colSpan={5} style={{ textAlign: "right", textTransform: "uppercase" }}>
                                Grand Total ({summary.total_patients} Patients):
                            </td>
                            <td style={{ textAlign: "center" }}>{summary.total_patients}</td>
                            <td style={{ textAlign: "right" }}>{Number(summary.total_advance || 0).toFixed(2)}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </PrintTableWrapper>

                <PrintFooter>
                    <div>{currentPrintTime}</div>
                    <div>Page 1</div>
                </PrintFooter>
            </PrintTemplate>

            {/* Patient Advance Details Modal */}
            {selectedPatient && (
                <Modal
                    open={!!selectedPatient}
                    onCancel={() => setSelectedPatient(null)}
                    footer={null}
                    title={
                        <div>
                            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: colors.textMain }}>
                                Advance Transactions &bull; {selectedPatient.patient_name}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: colors.textMuted, marginTop: "2px" }}>
                                IP No: <strong style={{ color: colors.primary }}>{selectedPatient.ip_number}</strong> &bull; Room: <strong>{selectedPatient.room}</strong> ({selectedPatient.floor})
                            </div>
                        </div>
                    }
                    width={700}
                >
                    <div style={{ padding: "10px 0" }}>
                        <div style={{ 
                            background: "#f8fafc", 
                            padding: "12px 16px", 
                            borderRadius: "8px", 
                            marginBottom: "16px",
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "10px"
                        }}>
                            <div>
                                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", display: "block" }}>Admitted On</span>
                                <strong>{selectedPatient.admitting_date}</strong> ({selectedPatient.no_of_days} days)
                            </div>
                            <div>
                                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", display: "block" }}>Company / TPA</span>
                                <strong>{selectedPatient.company_name || "Self / Cash"}</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", display: "block" }}>Total Active Advance</span>
                                <strong style={{ color: "#16a34a", fontSize: "1.1rem" }}>
                                    ₹{Number(selectedPatient.advance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </strong>
                            </div>
                        </div>

                        <h5 style={{ fontWeight: "700", marginBottom: "10px", color: colors.textMain }}>Receipt Breakdown</h5>
                        {(!selectedPatient.advance_items || selectedPatient.advance_items.length === 0) ? (
                            <div style={{ textAlign: "center", padding: "30px", color: colors.textMuted, background: "#f8fafc", borderRadius: "8px" }}>
                                No advance deposit receipts recorded for this patient.
                            </div>
                        ) : (
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th>Bill No</Th>
                                        <Th>Date</Th>
                                        <Th style={{ textAlign: "right" }}>IP Portion</Th>
                                        <Th style={{ textAlign: "right" }}>Bill Portion</Th>
                                        <Th style={{ textAlign: "right" }}>Total (₹)</Th>
                                        <Th>Mode</Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {selectedPatient.advance_items.map((item, i) => (
                                        <Tr key={i}>
                                            <Td style={{ fontWeight: "600", fontFamily: "monospace" }}>{item.bill_no || item.advance_id}</Td>
                                            <Td>{item.date}</Td>
                                            <Td style={{ textAlign: "right" }}>₹{Number(item.ip_advance || 0).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right" }}>₹{Number(item.billing_advance || 0).toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right", fontWeight: "700", color: "#16a34a" }}>
                                                ₹{Number(item.amount || 0).toFixed(2)}
                                            </Td>
                                            <Td style={{ textTransform: "uppercase", fontSize: "0.75rem" }}>{item.payment_mode}</Td>
                                            <Td>
                                                <span style={{ 
                                                    background: item.status === "Paid" ? "#dcfce7" : "#fee2e2",
                                                    color: item.status === "Paid" ? "#166534" : "#b91c1c",
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.72rem",
                                                    fontWeight: "700",
                                                    textTransform: "uppercase"
                                                }}>
                                                    {item.status}
                                                </span>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </Modal>
            )}
        </Container>
    );
};

export default IPAdvanceReport;
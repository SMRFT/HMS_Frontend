import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { DatePicker, Select, Button, Spin, Input } from "antd";
import dayjs from "dayjs";
import {
    Printer,
    Download,
    Search,
    RefreshCw,
    Users,
    BedDouble,
    CheckCircle2,
    ArrowUpDown,
    DollarSign,
    Building2,
    Store
} from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    cleanNum,
    exportToExcel,
    printReportArea,
    extractReportData,
    getSafeArray,
    fetchCachedOutlets,
    ReportPageWrapper,
    ControlCard,
    HeaderBar,
    FilterBar,
    KPIGrid,
    KPICard,
    DataTableWrapper,
    ReportPrintHeader,
    ReportPrintFooter
} from "./masterAccountsHelper";

const { RangePicker } = DatePicker;
const { Option } = Select;

const DateHeaderTr = styled.tr`
    background: #f1f5f9 !important;
    td {
        background: #f1f5f9 !important;
        font-weight: 800 !important;
        color: #0f172a !important;
        font-size: 0.90rem !important;
        letter-spacing: 0.03em;
        border-top: 2px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 6px 10px !important;
    }
`;

const CompanyHeaderTr = styled.tr`
    background: #e2e8f0 !important;
    td {
        background: #e2e8f0 !important;
        font-weight: 700 !important;
        color: #1e293b !important;
        font-size: 0.85rem !important;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-top: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 5px 10px 5px 22px !important;
    }
`;

const RoomHeaderTr = styled.tr`
    background: #f8fafc !important;
    td {
        background: #f8fafc !important;
        font-weight: 700 !important;
        color: #0369a1 !important;
        font-size: 0.82rem !important;
        letter-spacing: 0.02em;
        border-top: 1px dashed #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        padding: 4px 10px 4px 38px !important;
    }
`;

const SubtotalTr = styled.tr`
    background: #f8fafc !important;
    font-weight: 700 !important;
    td {
        background: #f8fafc !important;
        border-top: 1px dashed #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        font-size: 0.85rem !important;
        padding: 5px 8px !important;
    }
`;

const AdmissionTable = styled.table`
    width: 100%;
    border-collapse: collapse !important;
    table-layout: fixed;

    th {
        border: 1px solid #cbd5e1 !important;
        padding: 7px 5px !important;
        background: #f8fafc;
        font-size: 0.80rem !important;
        text-align: left;
        color: #1e293b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    td {
        border: 1px solid #cbd5e1 !important;
        padding: 6px 8px !important;
        font-size: 0.84rem;
        vertical-align: middle;
        overflow-wrap: break-word;
        word-break: break-word;
    }

    .font-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        font-size: 0.86rem !important;
    }

    .text-center {
        text-align: center;
    }

    .text-right {
        text-align: right;
    }

    .total-row {
        background: #0f172a !important;
        color: #ffffff !important;
        font-weight: 800;
        border-top: 2px solid #0284c7 !important;

        td {
            padding: 8px 8px !important;
            font-size: 0.88rem !important;
            color: #ffffff !important;
        }
    }
`;

const extractAdmitDate = (val) => {
    if (!val) return "Unknown Date";
    const s = String(val).trim();
    const firstPart = s.split(" ")[0];
    if (firstPart.includes("/")) return firstPart;
    if (firstPart.includes("-") && firstPart.length === 10) {
        const parts = firstPart.split("-");
        if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return firstPart;
    }
    return firstPart || "Unknown Date";
};

const extractAdmitTime = (val) => {
    if (!val) return "-";
    const s = String(val).trim();
    if (s.includes(" ")) {
        return s.split(" ").slice(1).join(" ");
    }
    return "-";
};

const MasterAdmissionVsDischargeReport = ({
    isModalView = false,
    startDate,
    endDate,
    initialStartDate,
    initialEndDate,
    status: propStatus,
    initialStatus = "all",
    company: propCompany,
    initialCompany = "all",
    outlet: propOutlet,
    initialOutlet = "all",
    billType: propBillType,
    category: propCategory
}) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const location = useLocation();
    const routerState = location?.state || {};

    const start = startDate || initialStartDate || routerState.startDate;
    const end = endDate || initialEndDate || routerState.endDate;
    const effectiveStatus = propStatus || initialStatus || routerState.status || "all";
    const effectiveCompany = propCompany || propCategory || propBillType || initialCompany || routerState.company || "all";
    const effectiveOutlet = propOutlet || initialOutlet || routerState.outlet || "all";

    const [dateRange, setDateRange] = useState([
        start ? dayjs(start) : dayjs().startOf("month"),
        end ? dayjs(end) : dayjs()
    ]);
    const [statusFilter, setStatusFilter] = useState(effectiveStatus);
    const [companyFilter, setCompanyFilter] = useState(effectiveCompany);
    const [outlet, setOutlet] = useState(effectiveOutlet);
    const [outletsList, setOutletsList] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Synchronize dates from props
    useEffect(() => {
        if (start && end) {
            setDateRange([dayjs(start), dayjs(end)]);
        }
    }, [start, end]);

    // Synchronize status
    useEffect(() => {
        if (propStatus !== undefined && propStatus !== statusFilter) {
            setStatusFilter(propStatus);
        }
    }, [propStatus, statusFilter]);

    // Synchronize company
    useEffect(() => {
        const c = propCompany || propCategory || propBillType || initialCompany;
        if (c !== undefined && c !== companyFilter) {
            setCompanyFilter(c);
        }
    }, [propCompany, propCategory, propBillType, initialCompany, companyFilter]);

    // Synchronize outlet
    useEffect(() => {
        const o = propOutlet || initialOutlet;
        if (o !== undefined && o !== outlet) {
            setOutlet(o);
        }
    }, [propOutlet, initialOutlet, outlet]);

    // Load Outlets cached list
    useEffect(() => {
        const loadOutlets = async () => {
            try {
                const list = await fetchCachedOutlets(HmsBaseUrl);
                if (Array.isArray(list)) {
                    setOutletsList(list);
                }
            } catch (e) {
                console.error("Failed to load outlets:", e);
            }
        };
        loadOutlets();
    }, [HmsBaseUrl]);

    // Fetch report data
    const fetchReport = useCallback(async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const statusParam = statusFilter && statusFilter !== "all" ? `&status=${encodeURIComponent(statusFilter)}` : "";
            const isAllCompany = !companyFilter || companyFilter.toLowerCase() === "all" || companyFilter.toLowerCase() === "all companies";
            const companyParam = !isAllCompany ? `&company=${encodeURIComponent(companyFilter)}` : "";
            const outletParam = outlet && outlet.toLowerCase() !== "all" ? `&outlet=${encodeURIComponent(outlet)}&outlet_code=${encodeURIComponent(outlet)}` : "";
            const sortParam = `&sort_order=${sortOrder}`;

            const url = `${HmsBaseUrl}master-accounts/admission-vs-discharge/?from_date=${fDate}&to_date=${tDate}${statusParam}${companyParam}${outletParam}${sortParam}`;
            const res = await apiRequest(url, "GET");

            if (res?.success) {
                setReportData(extractReportData(res));
            } else {
                setReportData(null);
            }
        } catch (err) {
            console.error("Admission vs Discharge Report Error:", err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    }, [dateRange, statusFilter, companyFilter, outlet, sortOrder, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const records = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};
    const companiesList = reportData?.companies || [];

    // Client-side quick search filtering
    const filteredRecords = useMemo(() => {
        if (!searchTerm.trim()) return records;
        const q = searchTerm.toLowerCase().trim();
        return records.filter(r =>
            String(r.ip_number || "").toLowerCase().includes(q) ||
            String(r.uhid || "").toLowerCase().includes(q) ||
            String(r.patient_name || "").toLowerCase().includes(q) ||
            String(r.doctor_name || "").toLowerCase().includes(q) ||
            String(r.room || "").toLowerCase().includes(q) ||
            String(r.company_name || "").toLowerCase().includes(q)
        );
    }, [records, searchTerm]);

    // 3-Level Grouping: Admitting Date -> Company / Corporate -> Room
    const groupedData = useMemo(() => {
        if (!filteredRecords || filteredRecords.length === 0) return [];

        // Map: Date -> Map: Company -> Map: Room -> [items]
        const dateMap = new Map();

        filteredRecords.forEach(r => {
            let dateKey = r.admitting_date_display;
            if (!dateKey || dateKey === "-") {
                dateKey = extractAdmitDate(r.admitting_date);
            }

            const compKey = String(r.company_name || "Cash / Self").trim().toUpperCase();
            const roomKey = String(r.room || "Not Assigned").trim();

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, new Map());
            }
            const compMap = dateMap.get(dateKey);
            if (!compMap.has(compKey)) {
                compMap.set(compKey, new Map());
            }
            const roomMap = compMap.get(compKey);
            if (!roomMap.has(roomKey)) {
                roomMap.set(roomKey, []);
            }
            roomMap.get(roomKey).push(r);
        });

        const result = [];
        let runningSlno = 1;

        dateMap.forEach((compMap, dateKey) => {
            const companies = [];
            let dateAdvance = 0;
            let dateGross = 0;
            let dateNet = 0;
            let dateCount = 0;

            compMap.forEach((roomMap, compKey) => {
                const rooms = [];
                let compAdvance = 0;
                let compGross = 0;
                let compNet = 0;
                let compCount = 0;

                roomMap.forEach((items, roomKey) => {
                    let roomAdvance = 0;
                    let roomGross = 0;
                    let roomNet = 0;

                    // Sort items by IP number
                    const sortedItems = [...items].sort((a, b) => {
                        const s1 = String(a.ip_number || "").trim();
                        const s2 = String(b.ip_number || "").trim();
                        return sortOrder === "desc"
                            ? s2.localeCompare(s1, undefined, { numeric: true, sensitivity: 'base' })
                            : s1.localeCompare(s2, undefined, { numeric: true, sensitivity: 'base' });
                    });

                    const enrichedItems = sortedItems.map(it => {
                        const adv = cleanNum(it.advance);
                        const gross = cleanNum(it.gross_bill);
                        const net = cleanNum(it.net_paid);

                        roomAdvance += adv;
                        roomGross += gross;
                        roomNet += net;

                        return {
                            ...it,
                            displaySlno: runningSlno++,
                            adv,
                            gross,
                            net
                        };
                    });

                    rooms.push({
                        roomName: roomKey,
                        items: enrichedItems,
                        roomAdvance,
                        roomGross,
                        roomNet,
                        count: enrichedItems.length
                    });

                    compAdvance += roomAdvance;
                    compGross += roomGross;
                    compNet += roomNet;
                    compCount += enrichedItems.length;
                });

                companies.push({
                    companyName: compKey,
                    rooms,
                    compAdvance,
                    compGross,
                    compNet,
                    count: compCount
                });

                dateAdvance += compAdvance;
                dateGross += compGross;
                dateNet += compNet;
                dateCount += compCount;
            });

            result.push({
                date: dateKey,
                companies,
                dateAdvance,
                dateGross,
                dateNet,
                dateCount
            });
        });

        return result;
    }, [filteredRecords, sortOrder]);

    // Financial totals
    const totalAdvance = filteredRecords.reduce((a, r) => a + cleanNum(r.advance), 0);
    const totalGross = filteredRecords.reduce((a, r) => a + cleanNum(r.gross_bill), 0);
    const totalNet = filteredRecords.reduce((a, r) => a + cleanNum(r.net_paid), 0);

    // Toggle sorting
    const toggleSortOrder = () => {
        setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    };

    // Excel Export
    const handleExport = () => {
        const rows = [];
        groupedData.forEach(dg => {
            dg.companies.forEach(comp => {
                comp.rooms.forEach(room => {
                    room.items.forEach(r => {
                        rows.push({
                            "SL NO": r.displaySlno,
                            "ADMITTING DATE": dg.date,
                            "COMPANY / CORPORATE": comp.companyName,
                            "ROOM / BED": room.roomName,
                            "IP NUMBER": r.ip_number,
                            "ADMITTING TIME": r.admitting_time_display || extractAdmitTime(r.admitting_date),
                            "UHID": r.uhid,
                            "PATIENT NAME": r.patient_name,
                            "DOCTOR NAME": r.doctor_name,
                            "DISCHARGE DATE": r.is_discharged ? (r.discharge_date_display || r.discharge_date) : "Still Admitted",
                            "STAY (DAYS)": r.no_of_days,
                            "ADVANCE (₹)": cleanNum(r.advance),
                            "GROSS BILL (₹)": cleanNum(r.gross_bill),
                            "NET PAID (₹)": cleanNum(r.net_paid),
                            "STATUS": r.is_discharged ? "Discharged" : "Admitted"
                        });
                    });
                });
            });
        });
        exportToExcel(rows, "Master_Admission_vs_Discharge_Report", "AdmissionVsDischarge");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                        <div className="title-group">
                            <h1>
                                Admission vs Discharge Report
                                <span className="badge">Inpatient Tracking</span>
                            </h1>
                            <p>Comprehensive tracking of inpatient bed occupancy, admissions, length of stay, advances, and discharge clearances</p>
                        </div>
                        <div className="btn-group no-print">
                            <Button icon={<Download size={15} />} onClick={handleExport}>
                                Excel Export
                            </Button>
                            <Button
                                type="primary"
                                icon={<Printer size={15} />}
                                onClick={() => printReportArea("printable-admission-discharge-area", "landscape")}
                            >
                                Print Report
                            </Button>
                        </div>
                    </HeaderBar>

                    <FilterBar className="no-print">
                        <div className="filter-item">
                            <label>Date Range:</label>
                            <RangePicker
                                value={dateRange}
                                onChange={(val) => val && setDateRange(val)}
                                format="YYYY-MM-DD"
                            />
                        </div>

                        <div className="filter-item">
                            <label>Outlet:</label>
                            <Select
                                value={outlet}
                                onChange={setOutlet}
                                style={{ width: 180 }}
                            >
                                <Option value="all">All Outlets</Option>
                                {outletsList.map(o => (
                                    <Option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div className="filter-item">
                            <label>Company / Corporate:</label>
                            <Select
                                value={companyFilter}
                                onChange={setCompanyFilter}
                                style={{ width: 220 }}
                                showSearch
                                optionFilterProp="children"
                            >
                                <Option value="all">All Companies</Option>
                                {companiesList.map((c, idx) => (
                                    <Option key={idx} value={c}>
                                        {c}
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div className="filter-item">
                            <label>Status:</label>
                            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }}>
                                <Option value="all">All Patients</Option>
                                <Option value="admitted">Currently Admitted</Option>
                                <Option value="discharged">Discharged</Option>
                            </Select>
                        </div>

                        <div className="filter-item">
                            <Input
                                placeholder="Search IP / Patient / Room / Doctor..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 220 }}
                            />
                        </div>

                        <Button icon={<ArrowUpDown size={14} />} onClick={toggleSortOrder} title="Toggle IP sorting order">
                            IP {sortOrder.toUpperCase()}
                        </Button>

                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "80px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-admission-discharge-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="Admission vs Discharge Report"
                            fromDate={dateRange[0]?.format("YYYY-MM-DD")}
                            toDate={dateRange[1]?.format("YYYY-MM-DD")}
                            typeDesc="Inpatient admissions, bed occupancy, length of stay, and discharge clearance register"
                        />
                    )}

                    {!isModalView && (
                        <KPIGrid className="no-print">
                            <KPICard $border="#0284c7">
                                <span className="kpi-title">Total Inpatients</span>
                                <span className="kpi-value">{summary.total_inpatients || filteredRecords.length}</span>
                                <span className="kpi-subtitle">All active & cleared records</span>
                            </KPICard>

                            <KPICard $border="#059669">
                                <span className="kpi-title">Currently Admitted</span>
                                <span className="kpi-value">{summary.active_admissions ?? filteredRecords.filter(r => !r.is_discharged).length}</span>
                                <span className="kpi-subtitle">Inpatient beds occupied</span>
                            </KPICard>

                            <KPICard $border="#ea580c">
                                <span className="kpi-title">Discharged</span>
                                <span className="kpi-value">{summary.discharged_count ?? filteredRecords.filter(r => r.is_discharged).length}</span>
                                <span className="kpi-subtitle">Final settlements completed</span>
                            </KPICard>

                            <KPICard $border="#16a34a">
                                <span className="kpi-title">Total Advance</span>
                                <span className="kpi-value">₹{formatINR(summary.total_advance ?? totalAdvance)}</span>
                                <span className="kpi-subtitle">Deposited advances</span>
                            </KPICard>

                            <KPICard $border="#6366f1">
                                <span className="kpi-title">Avg Stay (Days)</span>
                                <span className="kpi-value">{summary.avg_length_of_stay || "0"}</span>
                                <span className="kpi-subtitle">Length of stay average</span>
                            </KPICard>
                        </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <AdmissionTable>
                            <thead>
                                <tr>
                                    <th style={{ width: "42px", textAlign: "center" }}>SLNO</th>
                                    <th style={{ width: "105px" }}>IP No</th>
                                    <th style={{ width: "85px" }}>Time</th>
                                    <th style={{ width: "105px" }}>UHID</th>
                                    <th style={{ width: "170px" }}>Patient Name</th>
                                    <th style={{ width: "150px" }}>Doctor Name</th>
                                    <th style={{ width: "140px" }}>Discharge Date</th>
                                    <th style={{ width: "75px", textAlign: "center" }}>Stay (Days)</th>
                                    <th style={{ width: "105px", textAlign: "right" }}>Advance (₹)</th>
                                    <th style={{ width: "105px", textAlign: "right" }}>Gross Bill (₹)</th>
                                    <th style={{ width: "105px", textAlign: "right" }}>Net Paid (₹)</th>
                                    <th style={{ width: "90px", textAlign: "center" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} style={{ textAlign: "center", padding: "35px", color: "#94a3b8" }}>
                                            No Admission vs Discharge records found for the selected period.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map((dg) => (
                                        <React.Fragment key={dg.date}>
                                            {/* Level 1: Admitting Date Header */}
                                            <DateHeaderTr>
                                                <td colSpan={12}>
                                                    Admitting Date : {dg.date}
                                                </td>
                                            </DateHeaderTr>

                                            {dg.companies.map((comp) => (
                                                <React.Fragment key={`${dg.date}-${comp.companyName}`}>
                                                    {/* Level 2: Company / Corporate Sub-Header */}
                                                    <CompanyHeaderTr>
                                                        <td colSpan={12}>
                                                            Company / Corporate : {comp.companyName}
                                                        </td>
                                                    </CompanyHeaderTr>

                                                    {comp.rooms.map((room) => (
                                                        <React.Fragment key={`${dg.date}-${comp.companyName}-${room.roomName}`}>
                                                            {/* Level 3: Room Sub-Header */}
                                                            <RoomHeaderTr>
                                                                <td colSpan={12}>
                                                                    Room / Bed : {room.roomName}
                                                                </td>
                                                            </RoomHeaderTr>

                                                            {/* Item rows inside this room */}
                                                            {room.items.map((r) => (
                                                                <tr key={r.ip_number || r.displaySlno}>
                                                                    <td className="text-center font-mono">{r.displaySlno}</td>
                                                                    <td className="font-mono" style={{ fontWeight: 700, color: "#0f172a" }}>
                                                                        {r.ip_number}
                                                                    </td>
                                                                    <td style={{ color: "#475569" }}>
                                                                        {r.admitting_time_display || extractAdmitTime(r.admitting_date)}
                                                                    </td>
                                                                    <td className="font-mono" style={{ color: "#64748b" }}>
                                                                        {r.uhid}
                                                                    </td>
                                                                    <td style={{ fontWeight: 600 }}>
                                                                        {r.patient_name}
                                                                    </td>
                                                                    <td style={{ color: "#334155" }}>
                                                                        {r.doctor_name}
                                                                    </td>
                                                                    <td>
                                                                        {r.is_discharged ? (
                                                                            <span style={{ color: "#475569" }}>
                                                                                {r.discharge_date_display || r.discharge_date}
                                                                            </span>
                                                                        ) : (
                                                                            <span style={{
                                                                                background: "#ecfdf5",
                                                                                color: "#059669",
                                                                                padding: "2px 8px",
                                                                                borderRadius: "12px",
                                                                                fontWeight: 700,
                                                                                fontSize: "0.75rem"
                                                                            }}>
                                                                                Still Admitted
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <span style={{
                                                                            background: "#f8fafc",
                                                                            border: "1px solid #e2e8f0",
                                                                            padding: "2px 7px",
                                                                            borderRadius: "6px",
                                                                            fontWeight: 700
                                                                        }}>
                                                                            {r.no_of_days}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-right font-mono" style={{ color: "#059669", fontWeight: 700 }}>
                                                                        {r.advance > 0 ? `₹${formatINR(r.advance)}` : "-"}
                                                                    </td>
                                                                    <td className="text-right font-mono">
                                                                        {r.gross_bill > 0 ? `₹${formatINR(r.gross_bill)}` : "-"}
                                                                    </td>
                                                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                                        {r.net_paid > 0 ? `₹${formatINR(r.net_paid)}` : "-"}
                                                                    </td>
                                                                    <td className="text-center">
                                                                        {r.is_discharged ? (
                                                                            <span style={{
                                                                                background: "#f1f5f9",
                                                                                color: "#475569",
                                                                                padding: "3px 8px",
                                                                                borderRadius: "12px",
                                                                                fontSize: "0.74rem",
                                                                                fontWeight: 600
                                                                            }}>
                                                                                Discharged
                                                                            </span>
                                                                        ) : (
                                                                            <span style={{
                                                                                background: "#dcfce7",
                                                                                color: "#15803d",
                                                                                padding: "3px 8px",
                                                                                borderRadius: "12px",
                                                                                fontSize: "0.74rem",
                                                                                fontWeight: 700
                                                                            }}>
                                                                                Admitted
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}

                                                    {/* Company Subtotal Row */}
                                                    <SubtotalTr>
                                                        <td colSpan={8} className="text-right font-bold">
                                                            Total ({comp.companyName}) -&gt;
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                            {comp.compAdvance > 0 ? `₹${formatINR(comp.compAdvance)}` : "-"}
                                                        </td>
                                                        <td className="text-right font-mono font-bold">
                                                            {comp.compGross > 0 ? `₹${formatINR(comp.compGross)}` : "-"}
                                                        </td>
                                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                            {comp.compNet > 0 ? `₹${formatINR(comp.compNet)}` : "-"}
                                                        </td>
                                                        <td className="text-center" style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                                            {comp.count} pts
                                                        </td>
                                                    </SubtotalTr>
                                                </React.Fragment>
                                            ))}

                                            {/* Date Subtotal Row (shown when multiple companies exist on that date) */}
                                            {dg.companies.length > 1 && (
                                                <SubtotalTr style={{ background: "#f1f5f9" }}>
                                                    <td colSpan={8} className="text-right font-bold" style={{ color: "#0f172a" }}>
                                                        Date Total ({dg.date}) -&gt;
                                                    </td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#059669" }}>
                                                        {dg.dateAdvance > 0 ? `₹${formatINR(dg.dateAdvance)}` : "-"}
                                                    </td>
                                                    <td className="text-right font-mono font-bold">
                                                        {dg.dateGross > 0 ? `₹${formatINR(dg.dateGross)}` : "-"}
                                                    </td>
                                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                                        {dg.dateNet > 0 ? `₹${formatINR(dg.dateNet)}` : "-"}
                                                    </td>
                                                    <td className="text-center" style={{ fontSize: "0.75rem", color: "#0f172a", fontWeight: 700 }}>
                                                        {dg.dateCount} pts
                                                    </td>
                                                </SubtotalTr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}

                                {/* Grand Total Summary Row */}
                                {filteredRecords.length > 0 && (
                                    <tr className="total-row">
                                        <td colSpan={8} className="text-right font-bold">
                                            GRAND TOTAL ({filteredRecords.length} INPATIENTS) -&gt;
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#4ade80" }}>
                                            ₹{formatINR(totalAdvance)}
                                        </td>
                                        <td className="text-right font-mono" style={{ color: "#ffffff" }}>
                                            ₹{formatINR(totalGross)}
                                        </td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#38bdf8" }}>
                                            ₹{formatINR(totalNet)}
                                        </td>
                                        <td style={{ color: "#cbd5e1", textAlign: "center", fontSize: "0.75rem" }}>
                                            {filteredRecords.filter(r => !r.is_discharged).length} Adm | {filteredRecords.filter(r => r.is_discharged).length} Dis
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </AdmissionTable>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterAdmissionVsDischargeReport;

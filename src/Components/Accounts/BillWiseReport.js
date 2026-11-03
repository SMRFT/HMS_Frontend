import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import {
    PageWrapper,
    colors,
    FormRow,
    InputWrapper,
    Label,
    Input,
    Select,
    Button,
    SectionTitle,
} from "../GlobalStyles";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { printAccountsReport } from "./printAccountsReport";

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// ─── STYLED PRINT / DOCUMENT LAYOUT ──────────────────────────────────────────
const DocumentContainer = styled.div`
    width: 100%;
    background: #ffffff;
    color: #000000;
    font-family: 'Courier New', Courier, monospace, monospace;
    font-size: 11px;
    line-height: 1.35;
    padding: 12px 16px;
    box-sizing: border-box;

    @media print {
        padding: 0;
    }
`;

const HospitalHeader = styled.div`
    text-align: left;
    margin-bottom: 8px;

    .hospital-title {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin: 0 0 2px 0;
    }
    .hospital-sub {
        font-size: 10.5px;
        font-weight: normal;
        margin: 0 0 6px 0;
    }
    .report-meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        margin-top: 4px;
        padding-bottom: 4px;
        border-bottom: 1.5px solid #000000;
    }
`;

const RegisterTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 2px;
    font-size: 11px;
    font-family: 'Courier New', Courier, monospace;

    thead tr {
        border-top: 1.5px solid #000000;
        border-bottom: 1.5px solid #000000;
    }

    th {
        font-weight: 700;
        padding: 4px 6px;
        text-align: left;
        white-space: nowrap;
        background: transparent !important;
        color: #000000 !important;
    }

    th.num, td.num {
        text-align: right;
    }

    th.flag, td.flag {
        text-align: center;
        width: 25px;
        padding-left: 2px;
        padding-right: 2px;
    }

    tbody td {
        padding: 3px 6px;
        vertical-align: top;
        border: none;
        color: #000000;
    }

    .bill-type-banner {
        font-weight: 700;
        padding: 8px 6px 3px 6px;
        font-size: 11.5px;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        border-bottom: 0.5px solid #000000;
    }

    .patient-cell {
        .main-name {
            font-weight: 600;
        }
        .sub-line {
            font-size: 10px;
            color: #111;
            padding-left: 2px;
        }
        .deduction {
            font-size: 10px;
            font-weight: 600;
            color: #000;
        }
        .cancelled {
            font-size: 10px;
            font-weight: 700;
            color: #b91c1c;
        }
    }

    .subtotal-row {
        border-top: 1px solid #000000;
        border-bottom: 1px solid #000000;
        font-weight: 700;
        td {
            padding: 4px 6px;
        }
    }

    .grandtotal-row {
        border-top: 2px solid #000000;
        border-bottom: 2.5px double #000000;
        font-weight: 800;
        td {
            padding: 5px 6px;
        }
    }
`;

const AccountingSummaryBox = styled.div`
    margin-top: 10px;
    padding-top: 6px;
    border-top: 1px solid #000000;
    font-family: 'Courier New', Courier, monospace;
    font-size: 10.5px;
    line-height: 1.45;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 30px;

    .summary-col {
        display: flex;
        flex-direction: column;
    }

    .summary-line {
        display: flex;
        justify-content: space-between;
        padding: 1px 0;
        white-space: nowrap;
    }

    .summary-line .label {
        font-weight: normal;
    }

    .summary-line .value {
        font-weight: 700;
        text-align: right;
        min-width: 90px;
    }

    .end-marker {
        grid-column: span 2;
        text-align: center;
        font-weight: 700;
        margin-top: 8px;
        border-top: 1px dashed #000000;
        padding-top: 4px;
    }
`;

const BillWiseReport = ({ isModalView = false, startDate, endDate, initialBillType = "All", initialOutlet = "all" }) => {
    const location = useLocation();
    const [fromDate, setFromDate] = useState(startDate || location.state?.startDate || dayjs().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(endDate || location.state?.endDate || dayjs().format("YYYY-MM-DD"));
    const [billType, setBillType] = useState(location.state?.billType || initialBillType || "All");
    const [outlet, setOutlet] = useState(location.state?.outlet || initialOutlet || "all");
    const [outlets, setOutlets] = useState([]);
    const [billTypesList, setBillTypesList] = useState([]);
    const [uhid, setUhid] = useState("");
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospital_address = localStorage.getItem("hospital_address") || "51/24.Saradha College Road, Salem - 636007,";
    const hospital_code = localStorage.getItem("hospital_code") || "SH001";
    const branch_code = localStorage.getItem("selected_branch") || "SHB001";
    const user_id = localStorage.getItem("employeeId");

    useEffect(() => {
        fetchOutlets();
        fetchBillTypes();
    }, [HmsBaseUrl]);

    const fetchOutlets = async () => {
        try {
            const response = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
            if (response.success && Array.isArray(response.data)) {
                setOutlets(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch outlets:", error);
        }
    };

    const fetchBillTypes = async () => {
        try {
            const res = await apiRequest(`${HmsBaseUrl}bill-types_get/`, "GET");
            const recs = res?.records || res?.data?.records || res?.data;
            if (Array.isArray(recs)) {
                setBillTypesList(recs);
            }
        } catch (err) {
            console.error("Failed to fetch bill types:", err);
        }
    };

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
        if (initialBillType) setBillType(initialBillType);
        if (initialOutlet) setOutlet(initialOutlet);
    }, [startDate, endDate, initialBillType, initialOutlet]);

    useEffect(() => {
        fetchReport();
    }, [fromDate, toDate, billType, outlet, uhid]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const payload = {
                from_date: fromDate,
                to_date: toDate,
                bill_type: billType,
                outlet_code: outlet,
                uhid: uhid,
                "auth-hospital-code": hospital_code,
                "auth-branch-code": branch_code,
                "auth-user-id": user_id
            };

            const response = await apiRequest(`${HmsBaseUrl}bill_wise_report/`, "POST", payload);
            if (response.success && response.data.success) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary);
            } else {
                toast.error(response?.data?.message || "Failed to fetch report");
            }
        } catch (error) {
            toast.error("Error fetching report");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatINR = (val) => {
        const num = Number(val);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const handlePrint = () => {
        printAccountsReport("printable-report-area", "landscape");
    };

    // Group items bill-type wise
    const groupedBillTypes = useMemo(() => {
        if (!reportData || reportData.length === 0) return [];

        const groupMap = new Map();
        reportData.forEach((b) => {
            const groupName = (b.type_name || b.type || "OTHER BILLS").trim().toUpperCase();
            if (!groupMap.has(groupName)) {
                groupMap.set(groupName, {
                    billTypeName: groupName,
                    items: [],
                    totals: {
                        gross: 0, cash: 0, credit: 0, bank: 0,
                        discount: 0, advance: 0, sales_return: 0, patient_debit: 0,
                        cashBillsCount: 0, cashBillsAmount: 0,
                        creditBillsCount: 0, creditBillsAmount: 0,
                        cancBillsCount: 0, cancBillsAmount: 0
                    }
                });
            }

            const group = groupMap.get(groupName);
            group.items.push(b);

            const gross = Number(b.gross !== undefined ? b.gross : (b.total_amount || b.net_amount || 0));
            const cash = Number(b.cash !== undefined ? b.cash : (b.payment_mode === "Cash" ? b.net_amount : 0));
            const credit = Number(b.credit !== undefined ? b.credit : (b.payment_mode !== "Cash" && b.payment_mode !== "Bank" ? b.net_amount : 0));
            const bank = Number(b.bank !== undefined ? b.bank : (b.payment_mode === "Bank" ? b.net_amount : 0));
            const disc = Number(b.discount || 0);
            const adv = Number(b.advance || 0);
            const sr = Number(b.sales_return || 0);
            const pdeb = Number(b.patient_debit || 0);
            const isCanc = b.is_cancelled || b.status === "Cancelled";

            group.totals.gross += gross;
            group.totals.cash += cash;
            group.totals.credit += credit;
            group.totals.bank += bank;
            group.totals.discount += disc;
            group.totals.advance += adv;
            group.totals.sales_return += sr;
            group.totals.patient_debit += pdeb;

            if (cash > 0) {
                group.totals.cashBillsCount += 1;
                group.totals.cashBillsAmount += cash;
            }
            if (credit > 0) {
                group.totals.creditBillsCount += 1;
                group.totals.creditBillsAmount += credit;
            }
            if (isCanc) {
                group.totals.cancBillsCount += 1;
                group.totals.cancBillsAmount += gross;
            }
        });

        return Array.from(groupMap.values());
    }, [reportData]);

    // Overall Grand Totals across all bill types
    const grandTotals = useMemo(() => {
        return groupedBillTypes.reduce((acc, g) => {
            acc.gross += g.totals.gross;
            acc.cash += g.totals.cash;
            acc.credit += g.totals.credit;
            acc.bank += g.totals.bank;
            acc.discount += g.totals.discount;
            acc.advance += g.totals.advance;
            acc.sales_return += g.totals.sales_return;
            acc.patient_debit += g.totals.patient_debit;
            acc.cashBillsCount += g.totals.cashBillsCount;
            acc.cashBillsAmount += g.totals.cashBillsAmount;
            acc.creditBillsCount += g.totals.creditBillsCount;
            acc.creditBillsAmount += g.totals.creditBillsAmount;
            acc.cancBillsCount += g.totals.cancBillsCount;
            acc.cancBillsAmount += g.totals.cancBillsAmount;
            return acc;
        }, {
            gross: 0, cash: 0, credit: 0, bank: 0,
            discount: 0, advance: 0, sales_return: 0, patient_debit: 0,
            cashBillsCount: 0, cashBillsAmount: 0,
            creditBillsCount: 0, creditBillsAmount: 0,
            cancBillsCount: 0, cancBillsAmount: 0
        });
    }, [groupedBillTypes]);

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = [];
            let sNo = 1;

            groupedBillTypes.forEach((group) => {
                rows.push({
                    "S.No": `BILLTYPE : ${group.billTypeName}`,
                    "Flag": "", "Bill Date": "", "Bill Number": "",
                    "Patient Name": "", "UHID / Op Number": "",
                    "Gross": "", "Cash": "", "Credit": "", "Bank": "",
                    "Payment Mode": "", "Scheme / Insurance": "", "Cashier": ""
                });

                group.items.forEach((b) => {
                    const gross = Number(b.gross !== undefined ? b.gross : (b.total_amount || b.net_amount || 0));
                    const cash = Number(b.cash !== undefined ? b.cash : (b.payment_mode === "Cash" ? b.net_amount : 0));
                    const credit = Number(b.credit !== undefined ? b.credit : (b.payment_mode !== "Cash" && b.payment_mode !== "Bank" ? b.net_amount : 0));
                    const bank = Number(b.bank !== undefined ? b.bank : (b.payment_mode === "Bank" ? b.net_amount : 0));

                    rows.push({
                        "S.No": sNo++,
                        "Flag": b.flag || (b.payment_mode === "Cash" ? "C" : "R"),
                        "Bill Date": b.bill_date ? dayjs(b.bill_date).format("DD/MM/YYYY") : "—",
                        "Bill Number": b.bill_no,
                        "Patient Name": b.patient_name || "N/A",
                        "UHID / Op Number": b.op_number || b.uhid || "—",
                        "Gross": Number(formatINR(gross)),
                        "Cash": Number(formatINR(cash)),
                        "Credit": Number(formatINR(credit)),
                        "Bank": Number(formatINR(bank)),
                        "Payment Mode": b.payment_mode || "Cash",
                        "Scheme / Insurance": b.scheme || "—",
                        "Cashier": b.cashier_name || "N/A"
                    });
                });

                // Group subtotal row
                rows.push({
                    "S.No": `Total for ${group.billTypeName}`,
                    "Flag": "", "Bill Date": "", "Bill Number": "", "Patient Name": "", "UHID / Op Number": "",
                    "Gross": Number(formatINR(group.totals.gross)),
                    "Cash": Number(formatINR(group.totals.cash)),
                    "Credit": Number(formatINR(group.totals.credit)),
                    "Bank": Number(formatINR(group.totals.bank)),
                    "Payment Mode": "", "Scheme / Insurance": "", "Cashier": ""
                });
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);

            const summaryRows = [
                { "Metric": "From Date", "Value": fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "—" },
                { "Metric": "To Date", "Value": toDate ? dayjs(toDate).format("DD/MM/YYYY") : "—" },
                { "Metric": "Bill Type Filter", "Value": billType },
                { "Metric": "Total Bills Count", "Value": reportData.length },
                { "Metric": "Total Gross (₹)", "Value": Number(formatINR(grandTotals.gross)) },
                { "Metric": "Total Cash (₹)", "Value": Number(formatINR(grandTotals.cash)) },
                { "Metric": "Total Credit (₹)", "Value": Number(formatINR(grandTotals.credit)) },
                { "Metric": "Total Bank (₹)", "Value": Number(formatINR(grandTotals.bank)) }
            ];
            const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
            XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
            XLSX.utils.book_append_sheet(wb, ws, "Detailed Bill Register");
            XLSX.writeFile(wb, `Detailed_Bill_Report_${fromDate}_to_${toDate}.xlsx`);
        } catch (error) {
            console.error("Excel Export Error:", error);
            toast.error("Failed to export to Excel");
        }
    };

    const hasMultipleGroups = groupedBillTypes.length > 1;

    return (
        <PageWrapper style={{ padding: isModalView ? "0" : "20px" }}>
            {!isModalView && (
                <FilterSection>
                    <SectionTitle style={{ marginBottom: "16px" }}>Detailed Bill Report Configuration</SectionTitle>
                    <FormRow style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                        <InputWrapper>
                            <Label>From Date</Label>
                            <DatePicker
                                value={dayjs(fromDate)}
                                onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
                                format="DD/MM/YYYY"
                                style={{ width: "100%", height: "35px" }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker
                                value={dayjs(toDate)}
                                onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
                                format="DD/MM/YYYY"
                                style={{ width: "100%", height: "35px" }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Outlet / Counter</Label>
                            <Select value={outlet} onChange={(e) => setOutlet(e.target.value)} style={{ height: "35px" }}>
                                <option value="all">All Outlets</option>
                                {outlets.map((o) => (
                                    <option key={o.outlet_code || o.outlet_id} value={o.outlet_code || o.outlet_id}>
                                        {o.outlet_name || o.name} ({o.outlet_code || o.outlet_id})
                                    </option>
                                ))}
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Bill Type / Category</Label>
                            <Select value={billType} onChange={(e) => setBillType(e.target.value)} style={{ height: "35px" }}>
                                <option value="All">All Types</option>
                                {billTypesList && billTypesList.length > 0 ? (
                                    billTypesList.map((bt, idx) => (
                                        <option key={bt._id || bt.billTypeNo || idx} value={bt.bill_name || bt.bill_type}>
                                            {bt.bill_name} {bt.billTypeNo ? `(${bt.billTypeNo})` : ""}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="Registration">Registration</option>
                                        <option value="Investigation">Investigation</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Discharge">Discharge</option>
                                        <option value="IP Advance">IP Advance</option>
                                        <option value="Admission">Admission</option>
                                        <option value="Sales Return">Sales Return</option>
                                        <option value="Miscellaneous">Miscellaneous Payment</option>
                                    </>
                                )}
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>UHID Filter</Label>
                            <Input
                                placeholder="e.g. S026/001234"
                                value={uhid}
                                onChange={(e) => setUhid(e.target.value)}
                                style={{ height: "35px" }}
                            />
                        </InputWrapper>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                            <Button onClick={handleExportExcel} style={{ background: "#10b981", height: "35px" }}>
                                <FaFileExcel style={{ marginRight: "6px" }} /> Excel
                            </Button>
                            <Button onClick={handlePrint} secondary style={{ height: "35px" }}>
                                Print
                            </Button>
                        </div>
                    </FormRow>
                </FilterSection>
            )}

            {/* Document / Authentic Detailed Bill Register View */}
            <DocumentContainer id="printable-report-area">
                <HospitalHeader>
                    <div className="hospital-title">{hospital_name}</div>
                    <div className="hospital-sub">{hospital_address}</div>
                    <div className="report-meta-row">
                        <div>
                            Detailed Bill Register for the period {dayjs(fromDate).format("DD/MM/YYYY")} to {dayjs(toDate).format("DD/MM/YYYY")}
                        </div>
                        <div>Page # 1</div>
                    </div>
                </HospitalHeader>

                <RegisterTable>
                    <thead>
                        <tr>
                            <th className="flag"></th>
                            <th style={{ width: "95px" }}>Bill date</th>
                            <th style={{ width: "115px" }}>Bill Number</th>
                            <th>Patient Name</th>
                            <th style={{ width: "110px" }}>Op Number</th>
                            <th className="num" style={{ width: "90px" }}>Gross</th>
                            <th className="num" style={{ width: "90px" }}>Cash</th>
                            <th className="num" style={{ width: "90px" }}>Credit</th>
                            <th className="num" style={{ width: "90px" }}>Bank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedBillTypes.length > 0 ? (
                            groupedBillTypes.map((group, groupIdx) => (
                                <React.Fragment key={group.billTypeName || groupIdx}>
                                    {/* Bill Type Header Banner */}
                                    <tr>
                                        <td colSpan="9" className="bill-type-banner">
                                            BILLTYPE : {group.billTypeName}
                                        </td>
                                    </tr>

                                    {/* Items under this Bill Type */}
                                    {group.items.map((b, i) => {
                                        const flag = b.flag || (b.payment_mode === "Cash" ? "C" : "R");
                                        const gross = b.gross !== undefined ? b.gross : (b.total_amount || b.net_amount || 0);
                                        const cash = b.cash !== undefined ? b.cash : (b.payment_mode === "Cash" ? b.net_amount : 0);
                                        const credit = b.credit !== undefined ? b.credit : (b.payment_mode !== "Cash" && b.payment_mode !== "Bank" ? b.net_amount : 0);
                                        const bank = b.bank !== undefined ? b.bank : (b.payment_mode === "Bank" ? b.net_amount : 0);

                                        return (
                                            <tr key={`${groupIdx}-${i}`}>
                                                <td className="flag">{flag}</td>
                                                <td>{b.bill_date ? dayjs(b.bill_date).format("DD/MM/YYYY") : "—"}</td>
                                                <td>{b.bill_no}</td>
                                                <td className="patient-cell">
                                                    <div className="main-name">{b.patient_name || "N/A"}</div>
                                                    {b.scheme && <div className="sub-line">{b.scheme}</div>}
                                                    {b.discount > 0 && <div className="deduction">LESS DISCOUNT {formatINR(b.discount)}</div>}
                                                    {b.advance > 0 && <div className="deduction">LESS ADVANCE {formatINR(b.advance)}</div>}
                                                    {b.sales_return > 0 && <div className="deduction">LESS CREDIT S.RETURN {formatINR(b.sales_return)}</div>}
                                                    {b.patient_debit > 0 && <div className="deduction">LESS PATIENT DEBIT {formatINR(b.patient_debit)}</div>}
                                                    {b.is_cancelled && <div className="cancelled">CANCELLED:({formatINR(gross)})</div>}
                                                </td>
                                                <td>{b.op_number || b.uhid || "—"}</td>
                                                <td className="num">{formatINR(gross)}</td>
                                                <td className="num">{cash > 0 ? formatINR(cash) : ""}</td>
                                                <td className="num">{credit > 0 ? formatINR(credit) : ""}</td>
                                                <td className="num">{bank > 0 ? formatINR(bank) : ""}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* Subtotal row for this Bill Type */}
                                    <tr className="subtotal-row">
                                        <td className="flag"></td>
                                        <td colSpan="4">Total...</td>
                                        <td className="num">{formatINR(group.totals.gross)}</td>
                                        <td className="num">{formatINR(group.totals.cash)}</td>
                                        <td className="num">{formatINR(group.totals.credit)}</td>
                                        <td className="num">{formatINR(group.totals.bank)}</td>
                                    </tr>
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                                    {loading ? "Loading Detailed Bill Register..." : "No records found for the selected period and criteria."}
                                </td>
                            </tr>
                        )}

                        {/* Overall Grand Total row if multiple bill types exist */}
                        {hasMultipleGroups && (
                            <tr className="grandtotal-row">
                                <td className="flag"></td>
                                <td colSpan="4">Grand Total...</td>
                                <td className="num">{formatINR(grandTotals.gross)}</td>
                                <td className="num">{formatINR(grandTotals.cash)}</td>
                                <td className="num">{formatINR(grandTotals.credit)}</td>
                                <td className="num">{formatINR(grandTotals.bank)}</td>
                            </tr>
                        )}
                    </tbody>
                </RegisterTable>

                {groupedBillTypes.length > 0 && (
                    <AccountingSummaryBox>
                        <div className="summary-col">
                            <div className="summary-line">
                                <span className="label">Cash Bills {grandTotals.cashBillsCount} Amount</span>
                                <span className="value">{formatINR(grandTotals.cashBillsAmount)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Credit Bills {grandTotals.creditBillsCount} Amount</span>
                                <span className="value">{formatINR(grandTotals.creditBillsAmount)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Cash Amount :</span>
                                <span className="value">{formatINR(grandTotals.cash)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Sales Returns :</span>
                                <span className="value">{formatINR(grandTotals.sales_return)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Net Amt :</span>
                                <span className="value">{formatINR(grandTotals.cash - grandTotals.sales_return)}</span>
                            </div>
                        </div>

                        <div className="summary-col">
                            <div className="summary-line">
                                <span className="label">Discount Amount</span>
                                <span className="value">{formatINR(grandTotals.discount)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Advance Amount</span>
                                <span className="value">{formatINR(grandTotals.advance)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">P.Debit Amount</span>
                                <span className="value">{formatINR(grandTotals.patient_debit)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Debit Colln</span>
                                <span className="value">0.00</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Cancelled Bills</span>
                                <span className="value">{grandTotals.cancBillsCount.toFixed(2)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Cancelled Amount</span>
                                <span className="value">{formatINR(grandTotals.cancBillsAmount)}</span>
                            </div>
                        </div>

                        <div className="end-marker">(End.)</div>
                    </AccountingSummaryBox>
                )}
            </DocumentContainer>
        </PageWrapper>
    );
};

export default BillWiseReport;

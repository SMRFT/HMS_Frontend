import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { printAccountsReport } from "./printAccountsReport";
import {
    PageWrapper,
    colors,
    FormRow,
    InputWrapper,
    Label,
    Select,
    Button,
    SectionTitle,
} from "../GlobalStyles";

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// ─── STYLED PRINT / DOCUMENT LAYOUT MATCHING detail discharge.pdf ────────────
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
        padding: 6px 6px 2px 6px;
        font-size: 11px;
        text-transform: uppercase;
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

    .total-row {
        border-top: 1.5px solid #000000;
        border-bottom: 1.5px solid #000000;
        font-weight: 700;
        td {
            padding: 4px 6px;
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

const DischargeBills = ({ 
    isModalView = false, 
    startDate, 
    endDate,
    initialBillType,
    billType: propBillType,
    initialOutlet,
    outlet
}) => {
    const [fromDate, setFromDate] = useState(startDate || dayjs().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(endDate || dayjs().format("YYYY-MM-DD"));
    const [billType, setBillType] = useState(() => {
        const bt = propBillType || initialBillType;
        if (bt && bt !== "All" && bt !== "all") return bt;
        return "all";
    });
    const [insuranceFilter, setInsuranceFilter] = useState("all");
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL LIMITED";
    const hospital_address = localStorage.getItem("hospital_address") || "51/24.Saradha College Road, Salem - 636007,";

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
        const bt = propBillType || initialBillType;
        if (bt) {
            setBillType(bt === "All" || bt === "all" ? "all" : bt);
        }
    }, [startDate, endDate, propBillType, initialBillType]);

    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ from_date: fromDate, to_date: toDate, status: "all" });
            if (billType !== "all") params.set("payment_mode", billType);
            if (insuranceFilter !== "all") params.set("insurance", insuranceFilter);
            const selectedOutlet = outlet || initialOutlet;
            if (selectedOutlet && selectedOutlet !== "All" && selectedOutlet !== "all") {
                params.set("outlet_code", selectedOutlet);
            }

            const response = await apiRequest(`${HmsBaseUrl}discharge-bills-report/?${params.toString()}`, "GET");
            if (response && (response.success || response.status === 200 || response.data)) {
                let rows = [];
                if (Array.isArray(response.data?.data)) {
                    rows = response.data.data;
                } else if (Array.isArray(response.data)) {
                    rows = response.data;
                } else if (Array.isArray(response.result)) {
                    rows = response.result;
                } else if (Array.isArray(response)) {
                    rows = response;
                }
                setReportData(rows);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching discharge bills report:", error);
            toast.error("Failed to fetch discharge bills");
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, billType, insuranceFilter, outlet, initialOutlet, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const formatINR = (val) => {
        const num = Number(val);
        return isNaN(num) ? "0.00" : num.toFixed(2);
    };

    const handlePrint = () => {
        printAccountsReport("printable-cash-discharge-report-area", "landscape");
    };

    // Calculate report statistics matching the PDF structure
    const computedTotals = reportData.reduce((acc, bill) => {
        const mode = (bill.payment_mode || "Cash").toLowerCase();
        const isCash = mode === "cash" || mode === "";
        const isBank = mode.includes("bank") || mode.includes("card") || mode.includes("visa") || mode.includes("pos") || mode.includes("upi");
        const isCredit = bill.has_insurance || mode.includes("credit") || mode.includes("scheme") || mode.includes("tpa") || mode.includes("cghs") || mode.includes("echs");

        const gross = Number(bill.bill_amount || bill.total_amount || bill.net_amount || 0);
        const netAmt = Number(bill.net_amount !== undefined ? bill.net_amount : (bill.paid_by_patient || 0));
        const advance = Number(bill.advance_amount || bill.advance || 0);
        const discount = Number(bill.discount_amount || bill.total_disc || 0);
        const salesReturn = Number(bill.sales_return || 0);
        const patientDebit = Number(bill.patient_debit || 0);

        const cash = isCash ? netAmt : 0;
        const bank = isBank ? netAmt : 0;
        const credit = isCredit ? (bill.credit_amount !== undefined ? Number(bill.credit_amount) : gross - advance - discount) : 0;

        acc.gross += gross;
        acc.cash += cash;
        acc.bank += bank;
        acc.credit += credit;
        acc.advance += advance;
        acc.discount += discount;
        acc.sales_return += salesReturn;
        acc.patient_debit += patientDebit;

        if (cash > 0) {
            acc.cashBillsCount += 1;
            acc.cashBillsAmount += cash;
        }
        if (credit > 0) {
            acc.creditBillsCount += 1;
            acc.creditBillsAmount += credit;
        }
        if (bill.status === "Cancelled" || bill.is_cancelled) {
            acc.cancBillsCount += 1;
            acc.cancBillsAmount += gross;
        }

        return acc;
    }, {
        gross: 0, cash: 0, credit: 0, bank: 0,
        advance: 0, discount: 0, sales_return: 0, patient_debit: 0,
        cashBillsCount: 0, cashBillsAmount: 0,
        creditBillsCount: 0, creditBillsAmount: 0,
        cancBillsCount: 0, cancBillsAmount: 0
    });

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = reportData.map((bill, index) => {
                const mode = (bill.payment_mode || "Cash").toLowerCase();
                const isCash = mode === "cash" || mode === "";
                const isBank = mode.includes("bank") || mode.includes("card") || mode.includes("visa");
                const isCredit = bill.has_insurance || mode.includes("credit") || mode.includes("scheme");

                const gross = Number(bill.bill_amount || bill.total_amount || 0);
                const netAmt = Number(bill.net_amount || 0);
                const advance = Number(bill.advance_amount || 0);
                const discount = Number(bill.discount_amount || 0);

                return {
                    "S.No": index + 1,
                    "Flag": isCash ? "C" : "R",
                    "Bill Date": bill.bill_date ? dayjs(bill.bill_date).format("DD/MM/YYYY") : "—",
                    "Bill Number": bill.bill_no || "",
                    "Patient Name": bill.patient_details?.patient_name || bill.patient_name || "N/A",
                    "Ip Number": bill.ip_number || "—",
                    "Gross": Number(formatINR(gross)),
                    "Cash": Number(formatINR(isCash ? netAmt : 0)),
                    "Credit": Number(formatINR(isCredit ? (gross - advance - discount) : 0)),
                    "Bank": Number(formatINR(isBank ? netAmt : 0)),
                    "Advance": Number(formatINR(advance)),
                    "Discount": Number(formatINR(discount)),
                    "Scheme / Insurance": bill.insurance_company || bill.company_name || ""
                };
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);

            const summaryRows = [
                { "Metric": "From Date", "Value": fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : "—" },
                { "Metric": "To Date", "Value": toDate ? dayjs(toDate).format("DD/MM/YYYY") : "—" },
                { "Metric": "Total Bills", "Value": reportData.length },
                { "Metric": "Gross Total (₹)", "Value": Number(formatINR(computedTotals.gross)) },
                { "Metric": "Cash Total (₹)", "Value": Number(formatINR(computedTotals.cash)) },
                { "Metric": "Credit Total (₹)", "Value": Number(formatINR(computedTotals.credit)) },
                { "Metric": "Bank Total (₹)", "Value": Number(formatINR(computedTotals.bank)) }
            ];
            const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
            XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
            XLSX.utils.book_append_sheet(wb, ws, "Discharge Bills");
            XLSX.writeFile(wb, `Discharge_Bill_Report_${fromDate}_to_${toDate}.xlsx`);
        } catch (error) {
            console.error("Excel Export Error:", error);
            toast.error("Failed to export to Excel");
        }
    };

    return (
        <PageWrapper style={{ padding: isModalView ? "0" : "20px" }}>
            {!isModalView && (
                <FilterSection>
                    <SectionTitle style={{ marginBottom: "16px" }}>Discharge Bill Report</SectionTitle>
                    <FormRow style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                        <InputWrapper>
                            <Label>From Date</Label>
                            <DatePicker
                                value={dayjs(fromDate)}
                                onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
                                format="DD/MM/YYYY"
                                style={{ width: "100%", height: "40px" }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>To Date</Label>
                            <DatePicker
                                value={dayjs(toDate)}
                                onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
                                format="DD/MM/YYYY"
                                style={{ width: "100%", height: "40px" }}
                            />
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Payment Mode</Label>
                            <Select
                                value={billType}
                                onChange={(e) => setBillType(e.target.value)}
                                style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                            >
                                <option value="all">All Modes</option>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Multiple Payment">Multiple Payment</option>
                            </Select>
                        </InputWrapper>
                        <InputWrapper>
                            <Label>Category</Label>
                            <Select
                                value={insuranceFilter}
                                onChange={(e) => setInsuranceFilter(e.target.value)}
                                style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                            >
                                <option value="all">All Discharges</option>
                                <option value="false">Cash / Self-paying Only</option>
                                <option value="true">Insurance Only</option>
                            </Select>
                        </InputWrapper>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                            <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                                <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Searching..." : "Search"}
                            </Button>
                            <Button 
                                onClick={handleExportExcel} 
                                disabled={loading || reportData.length === 0} 
                                style={{ height: "40px", background: "#10b981", borderColor: "#10b981", color: "#fff" }}
                            >
                                <FaFileExcel style={{ marginRight: "8px" }} /> Excel
                            </Button>
                            <Button onClick={handlePrint} secondary style={{ height: "40px" }}>
                                <FaPrint style={{ marginRight: "8px" }} /> Print
                            </Button>
                        </div>
                    </FormRow>
                </FilterSection>
            )}

            {/* Document / Authentic Detailed Bill Register View */}
            <DocumentContainer id="printable-cash-discharge-report-area">
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
                            <th style={{ width: "110px" }}>Ip Number</th>
                            <th className="num" style={{ width: "90px" }}>Gross</th>
                            <th className="num" style={{ width: "90px" }}>Cash</th>
                            <th className="num" style={{ width: "90px" }}>Credit</th>
                            <th className="num" style={{ width: "90px" }}>Bank</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="9" className="bill-type-banner">
                                BILLTYPE : DISCHARGE
                            </td>
                        </tr>

                        {reportData.length > 0 ? (
                            reportData.map((b, i) => {
                                const mode = (b.payment_mode || "Cash").toLowerCase();
                                const isCash = mode === "cash" || mode === "";
                                const isBank = mode.includes("bank") || mode.includes("card") || mode.includes("visa");
                                const isCredit = b.has_insurance || mode.includes("credit") || mode.includes("scheme");

                                const flag = isCash ? "C" : "R";
                                const gross = Number(b.bill_amount || b.total_amount || b.net_amount || 0);
                                const netAmt = Number(b.net_amount !== undefined ? b.net_amount : (b.paid_by_patient || 0));
                                const advAmt = Number(b.advance_amount || b.advance || 0);
                                const discAmt = Number(b.discount_amount || b.total_disc || 0);
                                const srAmt = Number(b.sales_return || 0);
                                const pdebAmt = Number(b.patient_debit || 0);

                                const cashVal = isCash ? netAmt : 0;
                                const bankVal = isBank ? netAmt : 0;
                                const creditVal = isCredit ? (b.credit_amount !== undefined ? Number(b.credit_amount) : gross - advAmt - discAmt) : 0;
                                const schemeLabel = b.insurance_company || b.company_name || (isBank ? "VISA CARD" : "");

                                return (
                                    <tr key={i}>
                                        <td className="flag">{flag}</td>
                                        <td>{b.bill_date ? dayjs(b.bill_date).format("DD/MM/YYYY") : "—"}</td>
                                        <td>{b.bill_no || "—"}</td>
                                        <td className="patient-cell">
                                            <div className="main-name">{b.patient_details?.patient_name || b.patient_name || "N/A"}</div>
                                            {schemeLabel && <div className="sub-line">{schemeLabel}</div>}
                                            {discAmt > 0 && <div className="deduction">LESS DISCOUNT {formatINR(discAmt)}</div>}
                                            {advAmt > 0 && <div className="deduction">LESS ADVANCE {formatINR(advAmt)}</div>}
                                            {srAmt > 0 && <div className="deduction">LESS CREDIT S.RETURN {formatINR(srAmt)}</div>}
                                            {pdebAmt > 0 && <div className="deduction">LESS PATIENT DEBIT {formatINR(pdebAmt)}</div>}
                                            {(b.status === "Cancelled" || b.is_cancelled) && (
                                                <div className="cancelled">CANCELLED:({formatINR(gross)})</div>
                                            )}
                                        </td>
                                        <td>{b.ip_number || "—"}</td>
                                        <td className="num">{formatINR(gross)}</td>
                                        <td className="num">{cashVal !== 0 ? formatINR(cashVal) : ""}</td>
                                        <td className="num">{creditVal > 0 ? formatINR(creditVal) : ""}</td>
                                        <td className="num">{bankVal > 0 ? formatINR(bankVal) : ""}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                                    {loading ? "Loading Discharge Bills..." : "No discharge bills found for the selected period."}
                                </td>
                            </tr>
                        )}

                        {reportData.length > 0 && (
                            <tr className="total-row">
                                <td className="flag"></td>
                                <td colSpan="4">Total...</td>
                                <td className="num">{formatINR(computedTotals.gross)}</td>
                                <td className="num">{formatINR(computedTotals.cash)}</td>
                                <td className="num">{formatINR(computedTotals.credit)}</td>
                                <td className="num">{formatINR(computedTotals.bank)}</td>
                            </tr>
                        )}
                    </tbody>
                </RegisterTable>

                {reportData.length > 0 && (
                    <AccountingSummaryBox>
                        <div className="summary-col">
                            <div className="summary-line">
                                <span className="label">Cash Bills {computedTotals.cashBillsCount} Amount</span>
                                <span className="value">{formatINR(computedTotals.cashBillsAmount)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Credit Bills {computedTotals.creditBillsCount} Amount</span>
                                <span className="value">{formatINR(computedTotals.creditBillsAmount)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Cash Amount :</span>
                                <span className="value">{formatINR(computedTotals.cash)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Sales Returns :</span>
                                <span className="value">{formatINR(computedTotals.sales_return)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Net Amt :</span>
                                <span className="value">{formatINR(computedTotals.cash - computedTotals.sales_return)}</span>
                            </div>
                        </div>

                        <div className="summary-col">
                            <div className="summary-line">
                                <span className="label">Discount Amount</span>
                                <span className="value">{formatINR(computedTotals.discount)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Advance Amount</span>
                                <span className="value">{formatINR(computedTotals.advance)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">P.Debit Amount</span>
                                <span className="value">{formatINR(computedTotals.patient_debit)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Debit Colln</span>
                                <span className="value">0.00</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Cancelled Bills</span>
                                <span className="value">{computedTotals.cancBillsCount.toFixed(2)}</span>
                            </div>
                            <div className="summary-line">
                                <span className="label">Cancelled Amount</span>
                                <span className="value">{formatINR(computedTotals.cancBillsAmount)}</span>
                            </div>
                        </div>

                        <div className="end-marker">(End.)</div>
                    </AccountingSummaryBox>
                )}
            </DocumentContainer>
        </PageWrapper>
    );
};

export default DischargeBills;

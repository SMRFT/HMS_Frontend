import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
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
    fadeIn,
    FormRow,
    InputWrapper,
    Label,
    Select,
    Button,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    SectionTitle,
} from "../GlobalStyles";

const SummaryCard = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const AdvanceRegistration = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-01"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) return;
        setLoading(true);
        try {
            const url = `${HmsBaseUrl}advance-registration-report/?from_date=${fromDate}&to_date=${toDate}`;
            const response = await apiRequest(url, "GET");
            if (response.success && response.data) {
                const rows = Array.isArray(response.data.data)
                    ? response.data.data
                    : Array.isArray(response.data)
                    ? response.data
                    : [];
                setReportData(rows);
            }
        } catch (error) {
            console.error("Error fetching advance report:", error);
            toast.error("Failed to fetch advance registration report");
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Group records by Date (formatted as DD/MM/YYYY)
    const groupedData = React.useMemo(() => {
        const groups = {};
        reportData.forEach(item => {
            const rawDate = item.paid_date || item.date || item.created_date;
            const dateKey = rawDate ? dayjs(rawDate).format("DD/MM/YYYY") : "Others";
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        return groups;
    }, [reportData]);

    const grandTotals = React.useMemo(() => {
        return reportData.reduce((acc, curr) => {
            const cash = Number(curr.cash_amount || ((curr.payment_mode || "").toLowerCase() === "cash" ? curr.amount : 0) || 0);
            const credit = Number(curr.credit_amount || ((curr.payment_mode || "").toLowerCase() !== "cash" ? curr.amount : 0) || 0);
            acc.cash += cash;
            acc.credit += credit;
            acc.total += (cash + credit);
            return acc;
        }, { cash: 0, credit: 0, total: 0 });
    }, [reportData]);

    const handlePrint = () => {
        printAccountsReport("printable-advance-report-area", "portrait");
    };

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const exportRows = [];
            let globalIndex = 1;

            Object.entries(groupedData).forEach(([dateStr, items]) => {
                let dayCash = 0;
                let dayCredit = 0;

                items.forEach((row) => {
                    const cash = Number(row.cash_amount || ((row.payment_mode || "").toLowerCase() === "cash" ? row.amount : 0) || 0);
                    const credit = Number(row.credit_amount || ((row.payment_mode || "").toLowerCase() !== "cash" ? row.amount : 0) || 0);
                    dayCash += cash;
                    dayCredit += credit;

                    exportRows.push({
                        "Date": dateStr,
                        "SLNO": globalIndex++,
                        "BILLNUMBER": row.billnumber || row.bill_no || row.billno || "",
                        "IPNUMBER": row.ipNumber || row.ip_number || row.ipno || "",
                        "PATIENTNAME": row.patientname || row.patient_name || "",
                        "CASH AMOUNT": cash > 0 ? Number(cash.toFixed(2)) : 0,
                        "CREDIT AMOUNT": credit > 0 ? Number(credit.toFixed(2)) : 0,
                        "User": row.user || row.created_by || row.cashier_id || "STAFF"
                    });
                });

                // Date Subtotal row
                exportRows.push({
                    "Date": dateStr,
                    "SLNO": "",
                    "BILLNUMBER": "",
                    "IPNUMBER": "",
                    "PATIENTNAME": "Total",
                    "CASH AMOUNT": Number(dayCash.toFixed(2)),
                    "CREDIT AMOUNT": Number(dayCredit.toFixed(2)),
                    "User": ""
                });
            });

            // Grand Total row
            exportRows.push({
                "Date": "Grand Total",
                "SLNO": "",
                "BILLNUMBER": "",
                "IPNUMBER": "",
                "PATIENTNAME": "Grand Total",
                "CASH AMOUNT": Number(grandTotals.cash.toFixed(2)),
                "CREDIT AMOUNT": Number(grandTotals.credit.toFixed(2)),
                "User": "End"
            });

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportRows);
            ws["!cols"] = Object.keys(exportRows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 15) }));
            XLSX.utils.book_append_sheet(wb, ws, "Advance Register");
            XLSX.writeFile(wb, `Advance_Register_Accounts_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    let runningIndex = 1;

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>ADVANCE REGISTER (ACCOUNTS)</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Daily IP advance register with Cash and Credit breakdown
                </p>
            </SectionTitle>

            <FilterSection className="no-print">
                <FormRow>
                    <InputWrapper>
                        <Label>From Date</Label>
                        <DatePicker 
                            value={fromDate ? dayjs(fromDate) : null} 
                            onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>To Date</Label>
                        <DatePicker 
                            value={toDate ? dayjs(toDate) : null} 
                            onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>

                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <Button onClick={fetchReport} disabled={loading} style={{ height: "40px" }}>
                            <FaSearch style={{ marginRight: "8px" }} /> {loading ? "Searching..." : "Search"}
                        </Button>
                        <Button 
                            onClick={handleExportExcel} 
                            disabled={loading || reportData.length === 0} 
                            style={{ height: "40px", background: "#16a34a", borderColor: "#16a34a", color: "#fff" }}
                        >
                            <FaFileExcel style={{ marginRight: "8px" }} /> Export Excel
                        </Button>
                        <Button onClick={handlePrint} secondary style={{ height: "40px" }}>
                            <FaPrint style={{ marginRight: "8px" }} /> Print
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={colors.success}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Cash Amount</span>
                    <h3 style={{ margin: 0, color: colors.success }}>₹{grandTotals.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
                </SummaryCard>
                <SummaryCard color={colors.primary}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Total Credit / Card</span>
                    <h3 style={{ margin: 0, color: colors.primary }}>₹{grandTotals.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
                </SummaryCard>
                <SummaryCard color={colors.secondary}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" }}>Grand Total Collections</span>
                    <h3 style={{ margin: 0, color: colors.secondary }}>₹{grandTotals.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
                </SummaryCard>
            </div>

            {/* Screen Display Table */}
            <TableWrapper className="no-print">
                <Table>
                    <thead>
                        <Tr>
                            <Th style={{ width: "50px" }}>SLNO</Th>
                            <Th>BILLNUMBER</Th>
                            <Th>IPNUMBER</Th>
                            <Th>PATIENTNAME</Th>
                            <Th style={{ textAlign: "right" }}>CASH AMOUNT</Th>
                            <Th style={{ textAlign: "right" }}>CREDIT AMOUNT</Th>
                            <Th>User</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {Object.keys(groupedData).length > 0 ? (
                            Object.entries(groupedData).map(([dateStr, items]) => {
                                let dayCash = 0;
                                let dayCredit = 0;

                                return (
                                    <React.Fragment key={dateStr}>
                                        <Tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                                            <Td colSpan="7" style={{ color: "#0f172a", fontSize: "0.95rem", padding: "10px 14px" }}>
                                                {dateStr}
                                            </Td>
                                        </Tr>
                                        {items.map((row) => {
                                            const cash = Number(row.cash_amount || ((row.payment_mode || "").toLowerCase() === "cash" ? row.amount : 0) || 0);
                                            const credit = Number(row.credit_amount || ((row.payment_mode || "").toLowerCase() !== "cash" ? row.amount : 0) || 0);
                                            dayCash += cash;
                                            dayCredit += credit;
                                            const sl = runningIndex++;

                                            return (
                                                <Tr key={row.billnumber || row.bill_no || sl}>
                                                    <Td>{sl}</Td>
                                                    <Td style={{ fontWeight: "600" }}>{row.billnumber || row.bill_no || row.billno || "—"}</Td>
                                                    <Td>{row.ipNumber || row.ip_number || row.ipno || "—"}</Td>
                                                    <Td style={{ fontWeight: "600" }}>{row.patientname || row.patient_name || "—"}</Td>
                                                    <Td style={{ textAlign: "right", color: cash > 0 ? colors.success : "inherit" }}>
                                                        {cash > 0 ? cash.toFixed(2) : "0.00"}
                                                    </Td>
                                                    <Td style={{ textAlign: "right", color: credit > 0 ? colors.primary : "inherit" }}>
                                                        {credit > 0 ? credit.toFixed(2) : "0.00"}
                                                    </Td>
                                                    <Td style={{ textTransform: "uppercase", fontSize: "0.85rem" }}>
                                                        {row.user || row.created_by || row.cashier_id || "STAFF"}
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                        {/* Daily Subtotal Row */}
                                        <Tr style={{ background: "#e2e8f0", fontWeight: "bold" }}>
                                            <Td colSpan="4" style={{ textAlign: "right" }}>Total</Td>
                                            <Td style={{ textAlign: "right" }}>{dayCash.toFixed(2)}</Td>
                                            <Td style={{ textAlign: "right" }}>{dayCredit.toFixed(2)}</Td>
                                            <Td></Td>
                                        </Tr>
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <Tr>
                                <Td colSpan="7" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    No advance records found for the selected dates.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#cbd5e1", fontWeight: "900", fontSize: "1rem" }}>
                                <Td colSpan="4" style={{ textAlign: "right" }}>Grand Total</Td>
                                <Td style={{ textAlign: "right" }}>{grandTotals.cash.toFixed(2)}</Td>
                                <Td style={{ textAlign: "right" }}>{grandTotals.credit.toFixed(2)}</Td>
                                <Td>End</Td>
                            </Tr>
                        </tfoot>
                    )}
                </Table>
            </TableWrapper>

            {/* Print Styles */}
            <style>
                {`
                @media print {
                    @page { size: portrait; margin: 8mm; }
                    body * { visibility: hidden; }
                    #printable-advance-report-area, #printable-advance-report-area * { visibility: visible; }
                    #printable-advance-report-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; font-family: monospace, Courier, sans-serif !important; }
                }
                `}
            </style>

            {/* Printable Report matching PDF 1 format */}
            <PrintTemplate id="printable-advance-report-area">
                <PrintHeader>
                    <h1>{localStorage.getItem("hospital_name") || "SHANMUGA HOSPITALS"}</h1>
                    <p>{localStorage.getItem("hospital_address") || "51/24.Saradha College Road, Salem - 636007"}</p>
                    <p>{localStorage.getItem("hospital_phone") || "04272706666"}</p>
                    <div className="report-title">
                        ADVANCE REGISTER(ACCOUNTS) From {dayjs(fromDate).format("DD/MM/YYYY")} To {dayjs(toDate).format("DD/MM/YYYY")}
                    </div>
                </PrintHeader>

                <PrintMetaTable>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: "left" }}>
                                <strong>Printed On :</strong> {dayjs().format("DD/MM/YYYY HH:mm:ss")}
                            </td>
                            <td style={{ textAlign: "right" }}>
                                <strong>Page No :</strong> - 1 -
                            </td>
                        </tr>
                    </tbody>
                </PrintMetaTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th style={{ width: "6%" }}>SLNO</th>
                            <th style={{ width: "16%" }}>BILLNUMBER</th>
                            <th style={{ width: "15%" }}>IPNUMBER</th>
                            <th style={{ width: "27%" }}>PATIENTNAME</th>
                            <th style={{ width: "13%", textAlign: "right" }}>CASH AMOUNT</th>
                            <th style={{ width: "13%", textAlign: "right" }}>CREDIT AMOUNT</th>
                            <th style={{ width: "10%" }}>User</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            let printSl = 1;
                            return Object.entries(groupedData).map(([dateStr, items]) => {
                                let dayCash = 0;
                                let dayCredit = 0;

                                return (
                                    <React.Fragment key={`print-${dateStr}`}>
                                        <tr className="date-group-header">
                                            <td colSpan="7" style={{ fontWeight: "bold", textAlign: "left", padding: "4px 6px", borderBottom: "1px dashed #666" }}>
                                                {dateStr}
                                            </td>
                                        </tr>
                                        {items.map((row) => {
                                            const cash = Number(row.cash_amount || ((row.payment_mode || "").toLowerCase() === "cash" ? row.amount : 0) || 0);
                                            const credit = Number(row.credit_amount || ((row.payment_mode || "").toLowerCase() !== "cash" ? row.amount : 0) || 0);
                                            dayCash += cash;
                                            dayCredit += credit;
                                            const curSl = printSl++;

                                            return (
                                                <tr key={`print-row-${curSl}`}>
                                                    <td>{curSl}</td>
                                                    <td>{row.billnumber || row.bill_no || row.billno || "—"}</td>
                                                    <td>{row.ipNumber || row.ip_number || row.ipno || "—"}</td>
                                                    <td>{row.patientname || row.patient_name || "—"}</td>
                                                    <td style={{ textAlign: "right" }}>{cash > 0 ? cash.toFixed(2) : "0.00"}</td>
                                                    <td style={{ textAlign: "right" }}>{credit > 0 ? credit.toFixed(2) : "0.00"}</td>
                                                    <td style={{ textTransform: "uppercase" }}>{row.user || row.created_by || row.cashier_id || "STAFF"}</td>
                                                </tr>
                                            );
                                        })}
                                        {/* Date Subtotal */}
                                        <tr className="subtotal-row" style={{ fontWeight: "bold", borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
                                            <td colSpan="4" style={{ textAlign: "left", paddingLeft: "10px" }}>Total</td>
                                            <td style={{ textAlign: "right" }}>{dayCash.toFixed(2)}</td>
                                            <td style={{ textAlign: "right" }}>{dayCredit.toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    </React.Fragment>
                                );
                            });
                        })()}

                        {/* Grand Total */}
                        {reportData.length > 0 && (
                            <tr className="grand-total-row" style={{ fontWeight: "bold", borderTop: "2px solid #000", borderBottom: "2px solid #000" }}>
                                <td colSpan="4" style={{ textAlign: "left", paddingLeft: "10px" }}>Grand Total</td>
                                <td style={{ textAlign: "right" }}>{grandTotals.cash.toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>{grandTotals.credit.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </PrintTable>

                <div style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", fontWeight: "bold" }}>
                    End
                </div>
            </PrintTemplate>
        </PageWrapper>
    );
};

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        background: white;
        width: 100%;
        color: black;
        font-family: 'Courier New', Courier, monospace;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    padding-bottom: 4px;
    margin-bottom: 6px;
    h1 { margin: 0; font-size: 16px; text-transform: uppercase; font-weight: bold; }
    p { margin: 1px 0; font-size: 11px; }
    .report-title { font-size: 12px; font-weight: bold; margin-top: 6px; text-transform: uppercase; }
`;

const PrintMetaTable = styled.table`
    width: 100%;
    margin-bottom: 6px;
    border-collapse: collapse;
    font-size: 10px;
    td { padding: 2px 0; border: none !important; }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0;
    font-size: 10px;
    th, td {
        border-top: 1px dashed #999;
        border-bottom: 1px dashed #999;
        padding: 4px 5px;
        text-align: left;
    }
    th {
        border-top: 1px solid #000 !important;
        border-bottom: 1px solid #000 !important;
        font-weight: bold;
        text-transform: uppercase;
    }
    .date-group-header td {
        border-top: none;
        border-bottom: none;
        font-size: 11px;
    }
    .subtotal-row td {
        border-top: 1px dashed #000 !important;
        border-bottom: 1px dashed #000 !important;
    }
    .grand-total-row td {
        border-top: 1px solid #000 !important;
        border-bottom: 1px solid #000 !important;
    }
`;

export default AdvanceRegistration;

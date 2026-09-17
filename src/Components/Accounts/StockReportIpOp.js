import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaInfoCircle, FaFileExcel } from "react-icons/fa";
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-left: 4px solid ${props => props.color || colors.primary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const SummaryValue = styled.h3`
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: ${colors.textMain};
`;

const SummaryLabel = styled.p`
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const FilterSection = styled.div`
    background: ${colors.surface};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InfoNotice = styled.div`
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e3a8a;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
`;

const PrintTemplate = styled.div`
    display: none;
    @media print {
        display: block !important;
        width: 100%;
        background: white;
        color: black;
        font-family: 'Times New Roman', serif;
    }
`;

const PrintHeader = styled.div`
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 12px;
    h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: bold; }
    p { margin: 2px 0; font-size: 11px; }
    .report-title { font-size: 14px; font-weight: bold; margin-top: 8px; text-transform: uppercase; text-decoration: underline; }
`;

const PrintInfoTable = styled.table`
    width: 100%;
    margin-bottom: 12px;
    border-collapse: collapse;
    font-size: 10px;
    td { padding: 2px 0; border: none !important; }
`;

const PrintTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10px;
    th, td {
        border: 1px solid #000 !important;
        padding: 5px 6px;
        text-align: left;
    }
    th {
        background-color: #f2f2f2 !important;
        font-weight: bold;
        text-transform: uppercase;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
`;

const PrintSignatures = styled.div`
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    page-break-inside: avoid;
    .sig-box {
        text-align: center;
        width: 180px;
        border-top: 1px solid #000;
        padding-top: 4px;
        font-weight: bold;
    }
`;

const StockReportIpOp = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState(endDate || format(new Date(), "yyyy-MM-dd"));
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ total_ip_qty: 0, total_ip_amount: 0, total_op_qty: 0, total_op_amount: 0 });
    const [loading, setLoading] = useState(false);

    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const hospital_name = localStorage.getItem("hospital_name") || "SHANMUGA HOSPITAL";
    const branch_name = localStorage.getItem("branch_name") || "Main Branch";
    const user_id = localStorage.getItem("employeeId") || localStorage.getItem("user_id") || "Staff";

    useEffect(() => {
        if (startDate) setFromDate(startDate);
        if (endDate) setToDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (fromDate && toDate) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await apiRequest(`${HmsBaseUrl}stock-report-ip-op/?from_date=${fromDate}&to_date=${toDate}`, "GET");
            if (response.success && response.data) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { total_ip_qty: 0, total_ip_amount: 0, total_op_qty: 0, total_op_amount: 0 });
            }
        } catch (error) {
            console.error("Error fetching stock report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => printAccountsReport("printable-report-area", "landscape");

    const fmtQty = (val) => {
        const n = Number(val || 0);
        return n % 1 === 0 ? Math.round(n) : n.toFixed(2);
    };

    const handleExportExcel = () => {
        if (!reportData || reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }
        try {
            const rows = reportData.map((row, index) => ({
                "S.No": index + 1,
                "Item Name": row.item_name || "",
                "IP Qty": Number(fmtQty(row.ip_qty)),
                "IP Value (₹)": Number((row.ip_amount || 0).toFixed(2)),
                "OP Qty": Number(fmtQty(row.op_qty)),
                "OP Value (₹)": Number((row.op_amount || 0).toFixed(2)),
                "Total Qty": Number(fmtQty(row.total_qty)),
                "Total Value (₹)": Number((row.total_amount || 0).toFixed(2))
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws["!cols"] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 3, 14) }));
            XLSX.utils.book_append_sheet(wb, ws, "Stock Consumption");
            XLSX.writeFile(wb, `Pharmacy_Stock_IP_OP_${fromDate}_to_${toDate}.xlsx`);
            toast.success("Excel exported successfully!");
        } catch (err) {
            console.error("Excel export error:", err);
            toast.error("Failed to export Excel file");
        }
    };

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Pharmacy Stock Report — IP vs OP</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    Item-wise quantity and value sold, split by IP and OP bills
                </p>
            </SectionTitle>

            <InfoNotice className="no-print">
                <FaInfoCircle />
                This is a consumption report (sold via IP vs OP bills), not a stock-balance split — stock quantities
                aren't tracked per-transaction in this system, only as a running balance.
            </InfoNotice>

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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px" }} className="no-print">
                <SummaryCard color={"#2563eb"}>
                    <SummaryLabel>IP Qty Consumed</SummaryLabel>
                    <SummaryValue>{fmtQty(summary.total_ip_qty)}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={"#2563eb"}>
                    <SummaryLabel>IP Value</SummaryLabel>
                    <SummaryValue>₹{(summary.total_ip_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>OP Qty Sold</SummaryLabel>
                    <SummaryValue>{fmtQty(summary.total_op_qty)}</SummaryValue>
                </SummaryCard>
                <SummaryCard color={colors.primary}>
                    <SummaryLabel>OP Value</SummaryLabel>
                    <SummaryValue>₹{(summary.total_op_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</SummaryValue>
                </SummaryCard>
            </div>

            <TableWrapper className="no-print">
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>Item</Th>
                            <Th style={{ textAlign: "right" }}>IP Qty</Th>
                            <Th style={{ textAlign: "right" }}>IP Value</Th>
                            <Th style={{ textAlign: "right" }}>OP Qty</Th>
                            <Th style={{ textAlign: "right" }}>OP Value</Th>
                            <Th style={{ textAlign: "right" }}>Total Qty</Th>
                            <Th style={{ textAlign: "right" }}>Total Value</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: 600 }}>{row.item_name}</Td>
                                    <Td style={{ textAlign: "right" }}>{fmtQty(row.ip_qty)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{(row.ip_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right" }}>{fmtQty(row.op_qty)}</Td>
                                    <Td style={{ textAlign: "right" }}>₹{(row.op_amount || 0).toFixed(2)}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700 }}>{fmtQty(row.total_qty)}</Td>
                                    <Td style={{ textAlign: "right", fontWeight: 700 }}>₹{(row.total_amount || 0).toFixed(2)}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No pharmacy sales found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot>
                            <Tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
                                <Td colSpan="2" style={{ textAlign: "right" }}>Total:</Td>
                                <Td style={{ textAlign: "right" }}>{fmtQty(summary.total_ip_qty)}</Td>
                                <Td style={{ textAlign: "right" }}>₹{(summary.total_ip_amount || 0).toFixed(2)}</Td>
                                <Td style={{ textAlign: "right" }}>{fmtQty(summary.total_op_qty)}</Td>
                                <Td style={{ textAlign: "right" }}>₹{(summary.total_op_amount || 0).toFixed(2)}</Td>
                                <Td style={{ textAlign: "right" }}>{fmtQty((summary.total_ip_qty || 0) + (summary.total_op_qty || 0))}</Td>
                                <Td style={{ textAlign: "right" }}>₹{((summary.total_ip_amount || 0) + (summary.total_op_amount || 0)).toFixed(2)}</Td>
                            </Tr>
                        </tfoot>
                    )}
                </Table>
            </TableWrapper>

            <style>{`
                @media print {
                    @page { size: landscape; margin: 8mm; }
                    body * { visibility: hidden; }
                    #printable-report-area, #printable-report-area * { visibility: visible; }
                    #printable-report-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    body { background: white !important; font-family: 'Times New Roman', serif; }
                }
            `}</style>

            <PrintTemplate id="printable-report-area">
                <PrintHeader>
                    <h1>{hospital_name}</h1>
                    <p>{branch_name}</p>
                    <div className="report-title">Pharmacy Stock Report — IP vs OP Consumption</div>
                </PrintHeader>

                <PrintInfoTable>
                    <tbody>
                        <tr>
                            <td style={{ width: "35%" }}><strong>From Date:</strong> {dayjs(fromDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "35%" }}><strong>To Date:</strong> {dayjs(toDate).format("DD/MM/YYYY")}</td>
                            <td style={{ width: "30%", textAlign: "right" }}><strong>Print Date:</strong> {dayjs().format("DD/MM/YYYY HH:mm")}</td>
                        </tr>
                        <tr>
                            <td><strong>Total IP Value:</strong> ₹{(summary.total_ip_amount || 0).toFixed(2)}</td>
                            <td><strong>Total OP Value:</strong> ₹{(summary.total_op_amount || 0).toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}><strong>Printed By:</strong> {user_id}</td>
                        </tr>
                    </tbody>
                </PrintInfoTable>

                <PrintTable>
                    <thead>
                        <tr>
                            <th style={{ width: "35px" }}>S.No</th>
                            <th>Item Name</th>
                            <th style={{ textAlign: "right" }}>IP Qty</th>
                            <th style={{ textAlign: "right" }}>IP Value (₹)</th>
                            <th style={{ textAlign: "right" }}>OP Qty</th>
                            <th style={{ textAlign: "right" }}>OP Value (₹)</th>
                            <th style={{ textAlign: "right" }}>Total Qty</th>
                            <th style={{ textAlign: "right" }}>Total Value (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td style={{ fontWeight: "bold" }}>{row.item_name}</td>
                                <td style={{ textAlign: "right" }}>{fmtQty(row.ip_qty)}</td>
                                <td style={{ textAlign: "right" }}>₹{(row.ip_amount || 0).toFixed(2)}</td>
                                <td style={{ textAlign: "right" }}>{fmtQty(row.op_qty)}</td>
                                <td style={{ textAlign: "right" }}>₹{(row.op_amount || 0).toFixed(2)}</td>
                                <td style={{ textAlign: "right", fontWeight: "bold" }}>{fmtQty(row.total_qty)}</td>
                                <td style={{ textAlign: "right", fontWeight: "bold" }}>₹{(row.total_amount || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
                            <td colSpan="2" style={{ textAlign: "right" }}>TOTAL:</td>
                            <td style={{ textAlign: "right" }}>{fmtQty(summary.total_ip_qty)}</td>
                            <td style={{ textAlign: "right" }}>₹{(summary.total_ip_amount || 0).toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}>{fmtQty(summary.total_op_qty)}</td>
                            <td style={{ textAlign: "right" }}>₹{(summary.total_op_amount || 0).toFixed(2)}</td>
                            <td style={{ textAlign: "right" }}>{fmtQty((summary.total_ip_qty || 0) + (summary.total_op_qty || 0))}</td>
                            <td style={{ textAlign: "right" }}>₹{((summary.total_ip_amount || 0) + (summary.total_op_amount || 0)).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </PrintTable>

                <PrintSignatures>
                    <div className="sig-box">Prepared By</div>
                    <div className="sig-box">Accounts Officer</div>
                    <div className="sig-box">Authorized Signatory</div>
                </PrintSignatures>
            </PrintTemplate>
        </PageWrapper>
    );
};

export default StockReportIpOp;

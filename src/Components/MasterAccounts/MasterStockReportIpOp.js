import React, { useState, useEffect, useMemo } from "react";
import { DatePicker, Select, Button, Spin, Tag, Input } from "antd";
import dayjs from "dayjs";
import { Printer, Download, Search, RefreshCw, Package } from "lucide-react";
import apiRequest from "../../Auth/apiRequest";
import {
    formatINR,
    exportToExcel,
    printReportArea,
    extractReportData,
    getSafeArray,
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

const MasterStockReportIpOp = ({ isModalView = false, startDate, endDate, initialOutlet = "all" }) => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const [dateRange, setDateRange] = useState([
        startDate ? dayjs(startDate) : dayjs().startOf("month"),
        endDate ? dayjs(endDate) : dayjs()
    ]);
    const [outlet, setOutlet] = useState(initialOutlet || "all");
    const [outletsList, setOutletsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
                if (res?.success && Array.isArray(res?.data)) {
                    setOutletsList(res.data);
                }
            } catch (e) {}
        };
        fetchOutlets();
    }, [HmsBaseUrl]);
    useEffect(() => {
        if (startDate && endDate) {
            setDateRange([dayjs(startDate), dayjs(endDate)]);
        }
    }, [startDate, endDate]);
    useEffect(() => {
        if (initialOutlet !== undefined && initialOutlet !== outlet) {
            setOutlet(initialOutlet);
        }
    }, [initialOutlet]);



    const fetchReport = async () => {
        try {
            setLoading(true);
            const fDate = dateRange[0].format("YYYY-MM-DD");
            const tDate = dateRange[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}master-accounts/ip-op-stock-movement/?from_date=${fDate}&to_date=${tDate}&outlet_code=${outlet}`;
            const res = await apiRequest(url, "GET");
            if (res?.success) {
                setReportData(extractReportData(res));
            }
        } catch (err) {
            console.error("Stock Movement Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange, outlet]);

    const items = getSafeArray(reportData?.data);
    const summary = reportData?.summary || {};

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return items;
        const q = searchTerm.toLowerCase();
        return items.filter(i =>
            String(i.item_name || "").toLowerCase().includes(q) ||
            String(i.item_id || "").toLowerCase().includes(q)
        );
    }, [items, searchTerm]);

    const handleExport = () => {
        const rows = filtered.map(i => ({
            "Item ID": i.item_id,
            "Item Name": i.item_name,
            "IP Quantity Dispensed": i.ip_qty,
            "IP Revenue": i.ip_amount,
            "OP Quantity Dispensed": i.op_qty,
            "OP Revenue": i.op_amount,
            "Total Quantity Dispensed": i.total_qty,
            "Total Value": i.total_amount
        }));
        exportToExcel(rows, "Master_IP_OP_Stock_Movement", "StockConsumption");
    };

    return (
        <ReportPageWrapper $isModal={isModalView}>
            {!isModalView && (
                <ControlCard>
                    <HeaderBar>
                    <div className="title-group">
                        <h1>
                            IP / OP Stock Movement & Consumption Report
                            <span className="badge">Pharmacy Dispensary</span>
                        </h1>
                        <p>Audit of medicine and clinical item consumption dispensed to Inpatients vs Outpatients</p>
                    </div>
                    <div className="btn-group no-print">
                        <Button icon={<Download size={15} />} onClick={handleExport}>
                            Excel Export
                        </Button>
                        <Button type="primary" icon={<Printer size={15} />} onClick={() => printReportArea("printable-report-area", "landscape")}>
                            Print Report
                        </Button>
                    </div>
                </HeaderBar>

                {!isModalView && (
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
                            <Select value={outlet} onChange={setOutlet} style={{ width: 180 }}>
                                <Option value="all">All Outlets</Option>
                                {outletsList.map((o) => (
                                    <Option key={o.outlet_code} value={o.outlet_code}>
                                        {o.outlet_name || o.outlet_code}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="filter-item">
                            <Input
                                placeholder="Search medicine / item name..."
                                prefix={<Search size={14} color="#94a3b8" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 220 }}
                            />
                        </div>
                        <Button icon={<RefreshCw size={14} />} onClick={fetchReport} loading={loading}>
                            Refresh
                        </Button>
                    </FilterBar>
                )}
            </ControlCard>
            )}

            {loading ? (
                <div style={{ padding: "60px", textAlign: "center" }}><Spin size="large" /></div>
            ) : (
                <div id="printable-report-area">
                    {!isModalView && (
                        <ReportPrintHeader
                            title="StockReportIpOp"
                            fromDate={dateRange ? dateRange[0]?.format("YYYY-MM-DD") : undefined}
                            toDate={dateRange ? dateRange[1]?.format("YYYY-MM-DD") : undefined}
                            typeDesc="Audit of medicine and clinical item consumption dispensed to Inpatients vs Outpatients"
                        />
                    )}
                    {!isModalView && (
                        <KPIGrid className="no-print">
                        <KPICard $border="#0ea5e9">
                            <span className="kpi-title">Inpatient Consumption</span>
                            <span className="kpi-value">₹{formatINR(summary.total_ip_amount)}</span>
                            <span className="kpi-subtitle">IP Qty: {summary.total_ip_qty || 0}</span>
                        </KPICard>
                        <KPICard $border="#6366f1">
                            <span className="kpi-title">Outpatient Consumption</span>
                            <span className="kpi-value">₹{formatINR(summary.total_op_amount)}</span>
                            <span className="kpi-subtitle">OP Qty: {summary.total_op_qty || 0}</span>
                        </KPICard>
                        <KPICard $border="#10b981">
                            <span className="kpi-title">Total Medicine Consumption</span>
                            <span className="kpi-value">₹{formatINR(summary.grand_total_amount)}</span>
                            <span className="kpi-subtitle">Grand Total Qty: {summary.grand_total_qty || 0}</span>
                        </KPICard>
                    </KPIGrid>
                    )}

                    <DataTableWrapper>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item ID</th>
                                    <th>Medicine / Item Name</th>
                                    <th className="text-center">IP Qty</th>
                                    <th className="text-right">IP Value (₹)</th>
                                    <th className="text-center">OP Qty</th>
                                    <th className="text-right">OP Value (₹)</th>
                                    <th className="text-center">Total Qty</th>
                                    <th className="text-right">Total Value (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((i, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono">#{i.item_id}</td>
                                        <td><strong>{i.item_name}</strong></td>
                                        <td className="text-center font-mono">{i.ip_qty}</td>
                                        <td className="text-right font-mono">{formatINR(i.ip_amount)}</td>
                                        <td className="text-center font-mono">{i.op_qty}</td>
                                        <td className="text-right font-mono">{formatINR(i.op_amount)}</td>
                                        <td className="text-center font-mono font-bold">{i.total_qty}</td>
                                        <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                            {formatINR(i.total_amount)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={2}><strong>TOTAL CONSUMPTION ({filtered.length} ITEMS)</strong></td>
                                    <td className="text-center font-mono font-bold">{summary.total_ip_qty}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_ip_amount)}</td>
                                    <td className="text-center font-mono font-bold">{summary.total_op_qty}</td>
                                    <td className="text-right font-mono">₹{formatINR(summary.total_op_amount)}</td>
                                    <td className="text-center font-mono font-bold">{summary.grand_total_qty}</td>
                                    <td className="text-right font-mono font-bold" style={{ color: "#0284c7" }}>
                                        ₹{formatINR(summary.grand_total_amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DataTableWrapper>

                    <ReportPrintFooter />
                </div>
            )}
        </ReportPageWrapper>
    );
};

export default MasterStockReportIpOp;

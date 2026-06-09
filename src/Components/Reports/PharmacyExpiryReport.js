import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker, Spin, Tooltip, Switch } from "antd";
import dayjs from "dayjs";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
    Calendar,
    Download,
    Search,
    Filter,
    ClipboardList,
    AlertTriangle,
    ShieldAlert,
    CheckCircle,
    Building2,
    RotateCcw,
    RefreshCw,
    TrendingDown,
    BarChart2
} from "lucide-react";
import {
    PageWrapper,
    InputWrapper,
    Label,
    Select,
    Button,
    colors
} from "../GlobalStyles";
import * as XLSX from 'xlsx';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const RefreshIcon = styled(RefreshCw)`
  ${props => props.$loading && css`
    animation: ${spin} 1s linear infinite;
  `}
`;

const ModernContainer = styled(PageWrapper)`
  background: #f8fafc;
  padding: 16px 20px;
  height: calc(100vh - 125px);
  min-height: unset;
  max-height: calc(100vh - 125px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Inter', -apple-system, sans-serif;

  @media (max-width: 768px) {
    padding: 12px;
    height: auto;
    min-height: auto;
    max-height: none;
    overflow: auto;
  }
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;

  .title-area {
    h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      color: #64748b;
      margin: 4px 0 0 0;
      font-size: 0.875rem;
      font-weight: 500;
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: flex-end;
`;

// Quick filter presets are now handled via standard Select dropdowns.

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.03);
    border-color: ${props => props.$color || colors.primary};
  }

  .icon-wrapper {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: ${props => props.$bg || '#f0fdfa'};
    color: ${props => props.$color || colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      width: 22px;
      height: 22px;
    }
  }

  .data-box {
    display: flex;
    flex-direction: column;
    .value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.85rem;
    transition: all 0.2s;
    background: white;

    &:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 12px;
    color: #94a3b8;
    width: 16px;
    height: 16px;
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
  
  --scrollbar-thumb: #cbd5e1;
  --scrollbar-track: #f1f5f9;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: thin;

  @supports not (scrollbar-color: auto) {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: var(--scrollbar-track);
    }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  background: #f8fafc;
  padding: 14px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  letter-spacing: 0.5px;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 0 #e2e8f0;
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 0.85rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 500;
  white-space: nowrap;
`;

const Tr = styled.tr`
  transition: all 0.2s;
  &:hover {
    background-color: #f1f5f9;
  }
`;

const ExpiryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;

  ${props => {
    switch (props.$type) {
      case 'expired':
        return `
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
        `;
      case 'soon':
        return `
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fef3c7;
        `;
      case 'attention':
        return `
          background: #fff7ed;
          color: #f97316;
          border: 1px solid #ffedd5;
        `;
      default:
        return `
          background: #f0fdf4;
          color: #22c55e;
          border: 1px solid #dcfce7;
        `;
    }
  }}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: #64748b;
  text-align: center;
  svg {
    width: 48px;
    height: 48px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }
  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #334155;
    font-weight: 700;
  }
  p {
    margin: 6px 0 0 0;
    font-size: 0.85rem;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px;
`;

const PaginationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;

  .btn-group {
    display: flex;
    gap: 8px;
  }
`;

const PaginationButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f1f5f9;
    border-color: ${colors.primary};
    color: ${colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PharmacyExpiryReport = () => {
    const HMS_BASE_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    const navigate = useNavigate();

    // Filters and Search States
    const [outlets, setOutlets] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(() => {
        return localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
    });
    const [filterType, setFilterType] = useState("all_time"); // default to all_time, then users can filter via dropdown
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Fetch all outlets on load
    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const response = await apiRequest(`${HMS_BASE_URL}get-all-outlets/`, "GET");
                if (response.success && Array.isArray(response.data)) {
                    setOutlets(response.data);
                }
            } catch (error) {
                console.error("Error fetching outlets:", error);
            }
        };

        fetchOutlets();
    }, [HMS_BASE_URL]);

    // Sync with localStorage when component mounts or gains focus
    useEffect(() => {
        const syncOutlet = () => {
            const activeOutlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
            setSelectedOutlet(activeOutlet);
        };
        syncOutlet();
        
        window.addEventListener("focus", syncOutlet);
        return () => window.removeEventListener("focus", syncOutlet);
    }, []);

    // Fetch report data (with parameter overrides to avoid React batching delays)
    const fetchReport = async (overrideFilterType, overrideDateRange, overrideSearchQuery) => {
        setLoading(true);
        try {
            const activeOutlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
            
            const currentFilterType = overrideFilterType !== undefined ? overrideFilterType : filterType;
            const currentDateRange = overrideDateRange !== undefined ? overrideDateRange : dateRange;
            const currentSearchQuery = overrideSearchQuery !== undefined ? overrideSearchQuery : searchQuery;

            // Determine report_type
            let report_type = "expiry";
            if (currentFilterType === "fast_moving") {
                report_type = "fast_moving";
            } else if (currentFilterType === "not_sold") {
                report_type = "not_sold";
            } else if (currentFilterType === "stock_transfer") {
                report_type = "stock_transfer";
            } else if (currentFilterType === "reorder_level") {
                report_type = "reorder_level";
            }

            const params = {
                start_date: currentDateRange && currentDateRange[0] ? currentDateRange[0].format("YYYY-MM-DD") : "",
                end_date: currentDateRange && currentDateRange[1] ? currentDateRange[1].format("YYYY-MM-DD") : "",
                outlet_code: activeOutlet,
                search_query: currentSearchQuery,
                all_time: currentFilterType === "all_time" || currentFilterType === "fast_moving" || currentFilterType === "not_sold" || currentFilterType === "stock_transfer" || currentFilterType === "reorder_level" || !currentDateRange || (!currentDateRange[0] && !currentDateRange[1]),
                report_type: report_type
            };

            const response = await apiRequest(`${HMS_BASE_URL}pharmacy_expiry_report/`, "POST", params);

            const actualData = response.data?.data || response.data;
            if (response.success && Array.isArray(actualData)) {
                setReportData(actualData);
            } else {
                setReportData([]);
                toast.error(response.error || response.message || "Failed to generate report");
            }
        } catch (error) {
            console.error("Error fetching expiry report:", error);
            toast.error("An error occurred while generating report");
        } finally {
            setLoading(false);
        }
    };

    // Handle Quick Preset filters and fetch immediately
    const handleFilterPresetChange = (preset) => {
        setFilterType(preset);
        setCurrentPage(1);
        
        let newRange = [null, null];
        if (preset === "6months") {
            newRange = [dayjs(), dayjs().add(6, "month")];
        } else if (preset === "expired") {
            newRange = [dayjs().subtract(5, "year"), dayjs()];
        } else if (preset === "all") {
            newRange = [dayjs().subtract(5, "year"), dayjs().add(10, "year")];
        } else if (preset === "all_time" || preset === "custom" || preset === "fast_moving" || preset === "not_sold" || preset === "stock_transfer" || preset === "reorder_level") {
            newRange = [null, null];
        }
        setDateRange(newRange);

        if (preset !== "custom") {
            fetchReport(preset, newRange);
        }
    };

    // Auto-fetch when selectedOutlet changes
    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOutlet]);

    // Calculate metrics
    const totalItems = new Set(reportData.map(item => item.item_id)).size;
    const expiredCount = reportData.filter(item => item.expiry_date && dayjs(item.expiry_date).isBefore(dayjs(), 'day')).length;
    const expiringSoonCount = reportData.filter(item => {
        if (!item.expiry_date) return false;
        const exp = dayjs(item.expiry_date);
        return exp.isAfter(dayjs()) && exp.isBefore(dayjs().add(6, 'month'));
    }).length;
    // Count items flagged below reorder level (works for all presets)
    const reorderLevelCount = reportData.filter(item =>
        item.is_below_reorder === true ||
        (typeof item.reorder_level === 'number' && item.reorder_level > 0 && (item.available_stock ?? 0) <= item.reorder_level)
    ).length;

    // Filter and Paginate Table Data
    const filteredData = reportData; // already filtered backend-side
    const totalItemsCount = filteredData.length;
    const totalPages = Math.ceil(totalItemsCount / itemsPerPage) || 1;
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Get Expiry Status type
    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) {
            return { type: 'normal', label: 'No Expiry' };
        }
        const exp = dayjs(expiryDate);
        const today = dayjs();

        if (exp.isBefore(today, 'day')) {
            const diffMonths = today.diff(exp, 'month');
            const diffDays = today.diff(exp, 'day') % 30;
            let label = 'Expired';
            if (diffMonths > 0) {
                label = `Expired (${diffMonths}M ${diffDays}D ago)`;
            } else {
                label = `Expired (${diffDays}D ago)`;
            }
            return { type: 'expired', label };
        }
        
        const diffMonths = exp.diff(today, 'month');
        const diffDays = exp.diff(today, 'day') % 30;
        
        if (exp.isBefore(today.add(30, 'day'))) {
            return { type: 'attention', label: `Expires in ${exp.diff(today, 'day')} Days` };
        }
        if (exp.isBefore(today.add(180, 'day'))) {
            let label = `Expires in `;
            if (diffMonths > 0) {
                label += `${diffMonths}M ${diffDays}D`;
            } else {
                label += `${diffDays}D`;
            }
            return { type: 'soon', label };
        }
        return { type: 'normal', label: 'Healthy Stock' };
    };

    // Get Outlet Name from Outlet Code
    const getOutletName = (code) => {
        if (!code) return "—";
        const outlet = outlets.find(o => o.outlet_code === code);
        return outlet ? outlet.outlet_name : code;
    };

    // Export to Excel
    const handleExportExcel = () => {
        if (reportData.length === 0) {
            toast.warning("No data to export");
            return;
        }

        const exportData = reportData.map(item => {
            const status = getExpiryStatus(item.expiry_date);
            const baseRow = {
                "Item ID": item.item_id,
                "Item Name": item.item_name,
                "Brand Name": item.brand_name || "—",
                "Category": item.category || "—",
                "HSN Code": item.hsn || "—",
                "Batch Number": item.batch_number,
                "Expiry Date": item.expiry_date ? dayjs(item.expiry_date).format("DD/MM/YYYY") : "—",
                "MRP (₹)": item.mrp,
                "Selling Price (₹)": item.Selling_Price,
                "Total Stock": item.total_stock,
            };

            if (filterType === "fast_moving") {
                baseRow["Sold Quantity"] = item.sold_quantity || 0;
            }
            if (filterType === "stock_transfer") {
                baseRow["Transferred Quantity"] = item.transferred_out_quantity || 0;
            }
            if (filterType === "reorder_level") {
                baseRow["Reorder Level"] = item.reorder_level ?? 0;
                baseRow["Below Reorder?"] = item.is_below_reorder ? "Yes" : "No";
            }

            baseRow["Available Stock"] = item.available_stock;
            baseRow["Status"] = status.label;
            baseRow["Outlet Name"] = getOutletName(item.outlet_code);

            return baseRow;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expiry Report");
        
        // Auto-fit column widths
        const maxLens = {};
        exportData.forEach(row => {
            Object.keys(row).forEach(key => {
                const len = String(row[key] || "").length;
                maxLens[key] = Math.max(maxLens[key] || key.length, len);
            });
        });
        ws["!cols"] = Object.keys(maxLens).map(key => ({ wch: maxLens[key] + 3 }));

        const fileName = `Pharmacy_Expiry_Report_${dayjs().format("YYYYMMDD")}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast.success("Excel report exported successfully");
    };

    return (
        <ModernContainer>
            <HeaderSection>
                <div className="title-area">
                    <h1>
                        <ClipboardList size={28} style={{ color: colors.primary }} />
                        Pharmacy Item & Stock Expiry Report
                    </h1>
                    <p>Track, analyze, and manage stock expiries across all outlets</p>
                </div>
                <div className="action-buttons">
                    <Button
                        onClick={() => navigate('/PharmacyStockDashboard')}
                        style={{ background: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <BarChart2 size={16} /> Dashboard View
                    </Button>
                    <Button 
                        onClick={fetchReport} 
                        disabled={loading}
                        style={{ 
                            background: colors.primary, 
                            fontWeight: 600, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px' 
                        }}
                    >
                        <RefreshIcon size={16} $loading={loading} /> Refresh
                    </Button>
                    <Button 
                        onClick={handleExportExcel} 
                        disabled={reportData.length === 0 || loading}
                        style={{ background: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Download size={16} /> Export to Excel
                    </Button>
                </div>
            </HeaderSection>

            {/* Metrics cards */}
            <StatsGrid>
                <StatCard $color={colors.primary} $bg="rgba(13, 148, 136, 0.08)">
                    <div className="icon-wrapper">
                        <Building2 />
                    </div>
                    <div className="data-box">
                        <span className="value">{totalItems}</span>
                        <span className="label">Unique Items</span>
                    </div>
                </StatCard>
                <StatCard $color="#d97706" $bg="rgba(217, 119, 6, 0.08)">
                    <div className="icon-wrapper" style={{ color: '#d97706' }}>
                        <AlertTriangle />
                    </div>
                    <div className="data-box">
                        <span className="value">{expiringSoonCount}</span>
                        <span className="label">Expiring Soon (&lt; 6M)</span>
                    </div>
                </StatCard>
                <StatCard $color="#ef4444" $bg="rgba(239, 68, 68, 0.08)">
                    <div className="icon-wrapper" style={{ color: '#ef4444' }}>
                        <ShieldAlert />
                    </div>
                    <div className="data-box">
                        <span className="value">{expiredCount}</span>
                        <span className="label">Already Expired</span>
                    </div>
                </StatCard>
                <StatCard
                    $color="#b45309"
                    $bg="rgba(180, 83, 9, 0.08)"
                    onClick={() => handleFilterPresetChange("reorder_level")}
                    style={{ cursor: 'pointer' }}
                    title="Click to view Reorder Level Report"
                >
                    <div className="icon-wrapper" style={{ color: '#b45309' }}>
                        <TrendingDown />
                    </div>
                    <div className="data-box">
                        <span className="value" style={{ color: reorderLevelCount > 0 ? '#b45309' : '#0f172a' }}>{reorderLevelCount}</span>
                        <span className="label">Below Reorder Level</span>
                    </div>
                </StatCard>
            </StatsGrid>

            {/* Glass Filter Section */}
            <GlassCard>
                <FilterGrid>
                    <InputWrapper>
                        <Label>Select Outlet</Label>
                        <Select 
                            value={selectedOutlet} 
                            disabled
                            style={{ background: "#f1f5f9", cursor: "not-allowed", opacity: 0.8 }}
                        >
                            <option value="">All Outlets / Central Stores</option>
                            {outlets.map((o) => (
                                <option key={o.outlet_code} value={o.outlet_code}>
                                    {o.outlet_name} ({o.outlet_code})
                                </option>
                            ))}
                        </Select>
                    </InputWrapper>

                    <InputWrapper>
                        <Label>Quick Filter Preset</Label>
                        <Select 
                            value={filterType} 
                            onChange={(e) => handleFilterPresetChange(e.target.value)}
                        >
                            <option value="6months">Nearby Expiry (Within 6 Months)</option>
                            <option value="expired">Already Expired Only</option>
                            <option value="all">All Stocks with Expiries</option>
                            <option value="all_time">All Time Stock Report</option>
                            <option value="fast_moving">Fast Moving Medicines</option>
                            <option value="not_sold">Not Sold Medicines (Unsold Stock)</option>
                            <option value="stock_transfer">Stock Transfer Report</option>
                            <option value="reorder_level">⚠️ Reorder Level Report</option>
                            <option value="custom">Custom Date Range</option>
                        </Select>
                    </InputWrapper>

                    {filterType === "custom" && (
                        <InputWrapper>
                            <Label>Custom Expiry Date Range</Label>
                            <DatePicker.RangePicker
                                value={dateRange}
                                onChange={(dates) => { 
                                    setDateRange(dates); 
                                    setCurrentPage(1); 
                                    if (dates && dates[0] && dates[1]) {
                                        fetchReport("custom", dates);
                                    }
                                }}
                                format="DD/MM/YYYY"
                                style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </InputWrapper>
                    )}

                    <InputWrapper>
                        <Label>Search Search term</Label>
                        <SearchInputWrapper>
                            <Search />
                            <input 
                                type="text"
                                placeholder="Search Item, Brand, Batch..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                onKeyDown={(e) => e.key === 'Enter' && fetchReport()}
                            />
                        </SearchInputWrapper>
                    </InputWrapper>
                </FilterGrid>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button onClick={() => { 
                        const defaultOutlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
                        setSelectedOutlet(defaultOutlet);
                        setFilterType("all_time");
                        setDateRange([null, null]);
                        setSearchQuery("");
                        setCurrentPage(1);
                        fetchReport("all_time", [null, null], "");
                    }} secondary>
                        <RotateCcw size={14} /> Reset Filters
                    </Button>
                    <Button onClick={fetchReport} success style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshIcon size={14} $loading={loading} /> Search / Refresh
                    </Button>
                </div>
            </GlassCard>

            {/* Table and Results */}
            <TableCard>
                {loading ? (
                    <LoadingOverlay>
                        <Spin size="large" tip="Loading expiry analytics..." />
                    </LoadingOverlay>
                ) : paginatedData.length === 0 ? (
                    <EmptyState>
                        <AlertTriangle />
                        <h3>No Expiry Stock Matches Found</h3>
                        <p>Adjust your dates, search queries, or outlet parameters to see results</p>
                    </EmptyState>
                ) : (
                    <>
                        <TableWrapper>
                            <StyledTable>
                                <thead>
                                    <tr>
                                        <Th>Item ID</Th>
                                        <Th>Item Name</Th>
                                        <Th>Brand</Th>
                                        <Th>Batch No</Th>
                                        <Th>Expiry Date</Th>
                                        <Th style={{ textAlign: 'right' }}>MRP (₹)</Th>
                                        <Th style={{ textAlign: 'right' }}>Selling Price (₹)</Th>
                                        <Th style={{ textAlign: 'center' }}>Total Stock</Th>
                                        {filterType === "fast_moving" && <Th style={{ textAlign: 'center' }}>Sold Qty</Th>}
                                        {filterType === "stock_transfer" && <Th style={{ textAlign: 'center' }}>Transferred Qty</Th>}
                                        {filterType === "reorder_level" && <Th style={{ textAlign: 'center' }}>Reorder Level</Th>}
                                        {filterType === "reorder_level" && <Th style={{ textAlign: 'center' }}>Below Reorder?</Th>}
                                        <Th style={{ textAlign: 'center' }}>Available Stock</Th>
                                        <Th style={{ textAlign: 'center' }}>Status</Th>
                                        <Th>Outlet Name</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((item, idx) => {
                                        const status = getExpiryStatus(item.expiry_date);
                                        return (
                                            <Tr key={`${item.stock_id}-${idx}`}>
                                                <Td>{item.item_id}</Td>
                                                <Td style={{ fontWeight: '700', color: '#1e293b' }}>{item.item_name}</Td>
                                                <Td>{item.brand_name || "—"}</Td>
                                                <Td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                                                    {item.batch_number}
                                                </Td>
                                                <Td style={{ fontWeight: '600' }}>
                                                    {item.expiry_date ? dayjs(item.expiry_date).format("DD/MM/YYYY") : "—"}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                                    {parseFloat(item.mrp || 0).toFixed(2)}
                                                </Td>
                                                <Td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                                                    {parseFloat(item.Selling_Price || 0).toFixed(2)}
                                                </Td>
                                                <Td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                                                    {item.total_stock}
                                                </Td>
                                                {filterType === "fast_moving" && (
                                                    <Td style={{ textAlign: 'center', fontWeight: '700', color: colors.primary, fontFamily: 'monospace' }}>
                                                        {item.sold_quantity || 0}
                                                    </Td>
                                                )}
                                                {filterType === "stock_transfer" && (
                                                    <Td style={{ textAlign: 'center', fontWeight: '700', color: '#8b5cf6', fontFamily: 'monospace' }}>
                                                        {item.transferred_out_quantity || 0}
                                                    </Td>
                                                )}
                                                {filterType === "reorder_level" && (
                                                    <Td style={{ textAlign: 'center', fontWeight: '700', color: '#b45309', fontFamily: 'monospace' }}>
                                                        {item.reorder_level ?? 0}
                                                    </Td>
                                                )}
                                                {filterType === "reorder_level" && (
                                                    <Td style={{ textAlign: 'center' }}>
                                                        <ExpiryBadge $type={item.is_below_reorder ? 'attention' : 'normal'}>
                                                            {item.is_below_reorder ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                                            {item.is_below_reorder ? 'Below Reorder' : 'OK'}
                                                        </ExpiryBadge>
                                                    </Td>
                                                )}
                                                <Td style={{ textAlign: 'center', fontWeight: '700', color: item.available_stock <= 0 ? '#ef4444' : '#0f172a' }}>
                                                    {item.available_stock}
                                                </Td>
                                                <Td style={{ textAlign: 'center' }}>
                                                    <ExpiryBadge $type={status.type}>
                                                        {status.type === 'expired' && <ShieldAlert size={12} />}
                                                        {status.type === 'soon' && <AlertTriangle size={12} />}
                                                        {status.type === 'attention' && <AlertTriangle size={12} />}
                                                        {status.type === 'normal' && <CheckCircle size={12} />}
                                                        {status.label}
                                                    </ExpiryBadge>
                                                </Td>
                                                <Td style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>
                                                    {getOutletName(item.outlet_code)}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </StyledTable>
                        </TableWrapper>

                        <PaginationFooter>
                            <div>
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItemsCount)} of {totalItemsCount} stocks
                            </div>
                            <div className="btn-group">
                                <PaginationButton 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </PaginationButton>
                                <PaginationButton 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </PaginationButton>
                            </div>
                        </PaginationFooter>
                    </>
                )}
            </TableCard>
        </ModernContainer>
    );
};

export default PharmacyExpiryReport;

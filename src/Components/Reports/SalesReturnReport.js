import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
    Calendar,
    RotateCcw,
    IndianRupee,
    Download,
    Printer,
    ChevronRight,
    ChevronLeft,
    Activity,
    Search,
    Building2,
    Users,
    Pill,
    ArrowLeft
} from "lucide-react";
import {
    PageWrapper,
    InputWrapper,
    Label,
    Table,
    Th,
    Td,
    Tr,
    TableWrapper,
    colors,
} from "../GlobalStyles";
import * as XLSX from 'xlsx';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModernPageContainer = styled(PageWrapper)`
  background: #f1f5f9;
  padding: 12px 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  font-family: 'Inter', -apple-system, sans-serif;

  @media (max-width: 768px) {
    padding: 8px;
    height: auto;
    overflow: auto;
  }
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    flex: none;
    height: 500px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 10px 16px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    border-color: ${props => props.color || colors.primary};
  }

  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.lightBg || '#f0fdfa'};
    color: ${props => props.color || colors.primary};
    flex-shrink: 0;

    svg { width: 16px; height: 16px; }
  }

  .content-box { display: flex; flex-direction: column; }

  .label {
    color: #64748b;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  .value {
    font-size: 1.15rem;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
    margin: 0;
    line-height: 1;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;

  .info { font-size: 0.85rem; color: #64748b; font-weight: 600; }
  .controls { display: flex; gap: 8px; }
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.active ? colors.primary : '#e2e8f0'};
  background: ${props => props.active ? colors.primary : 'white'};
  color: ${props => props.active ? 'white' : '#475569'};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    border-color: ${colors.primary};
    color: ${props => props.active ? 'white' : colors.primary};
    background: ${props => props.active ? colors.primary : '#f0fdfa'};
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  background: white;
  padding: 12px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 1.25rem;
    font-weight: 900;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 10px;

    .icon-wrapper {
      background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
      padding: 6px;
      border-radius: 8px;
      display: flex;
      color: white;

      svg { width: 18px; height: 18px; }
    }
  }

  p {
    color: #64748b;
    margin: 2px 0 0 0;
    font-size: 0.8rem;
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ModernButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: auto;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.1);
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  border: none;
  color: white;
  cursor: pointer;

  &:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(13, 148, 136, 0.2); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

const SecondaryButton = styled(ModernButton)`
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.01);

  &:hover { background: #f8fafc; color: #1e293b; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04); }
`;

const FilterSection = styled(GlassCard)`
  padding: 12px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;
  margin-bottom: 12px;
  flex: none;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const ModernInputWrapper = styled(InputWrapper)`
  label {
    font-size: 0.75rem;
    font-weight: 800;
    color: #64748b;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const ModernTableWrapper = styled(TableWrapper)`
  border-radius: 0 0 20px 20px;
  overflow: hidden;
  background: white;
  flex: 1;
  overflow-y: auto;
  position: relative;
  border-top: 1px solid #f1f5f9;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: #f8fafc; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

  thead { position: sticky; top: 0; z-index: 10; background: #f8fafc; }
`;

const ModernTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    background: #f8fafc;
    color: #475569;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 1px;
    padding: 16px 20px;
    border-bottom: 2px solid #f1f5f9;
    white-space: nowrap;
  }

  tbody td {
    padding: 16px 20px;
    color: #1e293b;
    font-size: 0.9rem;
    font-weight: 500;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
  }

  tbody tr:hover td { background-color: #f8fafc; }
`;

const TileGrid = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 8px;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  &:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
`;

const ReportTile = styled.div`
  background: ${props => props.active ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})` : 'white'};
  color: ${props => props.active ? 'white' : '#1e293b'};
  padding: 12px 16px;
  border-radius: 16px;
  cursor: pointer;
  border: 2px solid ${props => props.active ? 'transparent' : '#f1f5f9'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  box-shadow: ${props => props.active ? '0 8px 16px rgba(13, 148, 136, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.01)'};
  flex: 0 0 160px;

  &:hover {
    transform: translateY(-3px);
    border-color: ${props => props.active ? 'transparent' : colors.primary};
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.04);
  }

  .icon-box {
    background: ${props => props.active ? 'rgba(255, 255, 255, 0.15)' : '#f0fdfa'};
    color: ${props => props.active ? 'white' : colors.primary};
    padding: 8px;
    border-radius: 10px;
    display: flex;
    flex-shrink: 0;

    svg { width: 18px; height: 18px; }
  }

  span { font-size: 0.85rem; font-weight: 700; line-height: 1.2; }
`;

const Badge = styled.span`
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  background: ${props => props.bg || '#f1f5f9'};
  color: ${props => props.color || '#475569'};
  white-space: nowrap;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
  background: #fff;

  .icon-container {
    background: #f8fafc;
    padding: 40px;
    border-radius: 50%;
    margin-bottom: 24px;
    color: #cbd5e1;
  }

  h3 { color: #1e293b; font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; }
  p { color: #64748b; max-width: 450px; font-size: 1.1rem; line-height: 1.6; }
`;

const tiles = [
    { key: "all", label: "All Returns", icon: <RotateCcw size={16} /> },
    { key: "op", label: "OP Returns", icon: <Users size={16} /> },
    { key: "ip", label: "IP Returns", icon: <Building2 size={16} /> },
];

const SalesReturnReport = () => {
    const [returnType, setReturnType] = useState("all");
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState({ total_returns: 0, op_returns: 0, ip_returns: 0, total_amount: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const HMS_BASE_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: dateRange[0].format("YYYY-MM-DD"),
                end_date: dateRange[1].format("YYYY-MM-DD"),
                return_type: returnType,
            };
            const queryString = new URLSearchParams(params).toString();
            const response = await apiRequest(`${HMS_BASE_URL}SalesReturnReport/?${queryString}`, "GET");

            if (response.success) {
                setReportData(response.data.data || []);
                setSummary(response.data.summary || { total_returns: 0, op_returns: 0, ip_returns: 0, total_amount: 0 });
            } else {
                setReportData([]);
                toast.error(response.error || "Failed to fetch sales return report");
            }
        } catch (error) {
            console.error("Error fetching sales return report:", error);
            toast.error("An error occurred while fetching the report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [returnType]);

    useEffect(() => {
        setCurrentPage(1);
    }, [reportData, searchTerm]);

    const getFilteredData = () => {
        if (!searchTerm) return reportData;
        const lower = searchTerm.toLowerCase();
        return reportData.filter(item =>
            Object.values(item).some(val => val && val.toString().toLowerCase().includes(lower))
        );
    };

    const getPaginatedData = () => {
        const data = getFilteredData();
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    };

    const handleExport = () => {
        const data = getFilteredData();
        if (data.length === 0) {
            toast.warning("No data to export");
            return;
        }
        const exportData = data.map(r => ({
            "Return Bill No": r.return_bill_no,
            "Return Date": dayjs(r.return_bill_date).format('DD-MM-YYYY HH:mm'),
            "Original Bill No": r.bill_no,
            "Type": r.patient_type,
            "IP No": r.ip_number,
            "UHID": r.uhid,
            "Patient Name": r.patient_name,
            "Doctor": r.doctor_name,
            "Items": r.items_summary,
            "Return Amount (₹)": r.return_amount,
            "Mode": r.mode,
            "Status": r.status,
            "Pharmacist": r.pharmacist_name,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales Return Report");
        XLSX.writeFile(wb, `SalesReturnReport_${returnType}_${dayjs().format('YYYYMMDD')}.xlsx`);
        toast.success("Report exported successfully");
    };

    const handlePrint = () => window.print();

    const typeBadge = (type) => type === "IP"
        ? <Badge bg="#eff6ff" color="#2563eb">IP</Badge>
        : <Badge bg="#f0fdfa" color="#0d9488">OP</Badge>;

    const modeBadge = (mode) => mode === "Cash Return"
        ? <Badge bg="#ecfdf5" color="#059669">{mode}</Badge>
        : <Badge bg="#fffbeb" color="#d97706">{mode}</Badge>;

    return (
        <ModernPageContainer>
            <PageHeader>
                <TitleGroup>
                    <h1>
                        <div className="icon-wrapper"><RotateCcw size={24} /></div>
                        Sales Return Report
                    </h1>
                    <p>Pharmacy sales returns across IP and OP bills.</p>
                </TitleGroup>
                <ActionButtons className="no-print">
                    <SecondaryButton onClick={() => window.history.back()}><ArrowLeft size={20} /> Back</SecondaryButton>
                    {reportData.length > 0 && (
                        <>
                            <SecondaryButton onClick={handleExport}><Download size={20} /> Export</SecondaryButton>
                            <SecondaryButton onClick={handlePrint}><Printer size={20} /> Print</SecondaryButton>
                        </>
                    )}
                </ActionButtons>
            </PageHeader>

            <FilterSection className="no-print">
                <ModernInputWrapper>
                    <Label><Calendar size={18} /> Date Range Selection</Label>
                    <DatePicker.RangePicker
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange(dates)}
                        style={{ width: "100%", height: "48px", borderRadius: "14px", border: '2px solid #f1f5f9' }}
                        format="DD-MM-YYYY"
                        allowClear={false}
                    />
                </ModernInputWrapper>

                <ModernInputWrapper>
                    <Label><Search size={18} /> Quick Search</Label>
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%", height: "38px", borderRadius: "10px",
                            border: '1px solid #e2e8f0', padding: '0 12px',
                            fontSize: '0.9rem', fontWeight: '600'
                        }}
                    />
                </ModernInputWrapper>

                <ModernButton onClick={fetchReport} disabled={loading} style={{ marginBottom: '2px' }}>
                    {loading ? <Activity className="animate-spin" size={18} /> : <RotateCcw size={18} />}
                    {loading ? "Processing..." : "Generate Report"}
                </ModernButton>
            </FilterSection>

            {reportData.length > 0 && (
                <StatsGrid className="no-print">
                    <StatCard color={colors.danger} lightBg="#fef2f2">
                        <div className="icon-box"><RotateCcw size={16} /></div>
                        <div className="content-box">
                            <div className="label">Total Returns</div>
                            <div className="value">{summary.total_returns}</div>
                        </div>
                    </StatCard>
                    <StatCard color={colors.primary} lightBg="#f0fdfa">
                        <div className="icon-box"><Users size={16} /></div>
                        <div className="content-box">
                            <div className="label">OP Returns</div>
                            <div className="value">{summary.op_returns}</div>
                        </div>
                    </StatCard>
                    <StatCard color="#2563eb" lightBg="#eff6ff">
                        <div className="icon-box"><Building2 size={16} /></div>
                        <div className="content-box">
                            <div className="label">IP Returns</div>
                            <div className="value">{summary.ip_returns}</div>
                        </div>
                    </StatCard>
                    <StatCard color={colors.success} lightBg="#f0fdf4">
                        <div className="icon-box"><IndianRupee size={16} /></div>
                        <div className="content-box">
                            <div className="label">Total Return Amount</div>
                            <div className="value">₹{(summary.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </div>
                    </StatCard>
                </StatsGrid>
            )}

            <TileGrid className="no-print">
                {tiles.map(t => (
                    <ReportTile key={t.key} active={returnType === t.key} onClick={() => setReturnType(t.key)}>
                        <div className="icon-box">{t.icon}</div>
                        <span>{t.label}</span>
                    </ReportTile>
                ))}
            </TileGrid>

            <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
                <ModernTableWrapper>
                    {getFilteredData().length > 0 && (
                        <ModernTable>
                            <thead>
                                <Tr>
                                    <Th>Return Bill No</Th>
                                    <Th>Return Date</Th>
                                    <Th>Original Bill No</Th>
                                    <Th>Type</Th>
                                    <Th>UHID</Th>
                                    <Th>Patient Name</Th>
                                    <Th>Doctor</Th>
                                    <Th><Pill size={13} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />Items Returned</Th>
                                    <Th style={{ textAlign: 'right' }}>Amount (₹)</Th>
                                    <Th>Mode</Th>
                                    <Th>Status</Th>
                                    <Th>Pharmacist</Th>
                                </Tr>
                            </thead>
                            <tbody>
                                {getPaginatedData().map((r, idx) => (
                                    <Tr key={idx}>
                                        <Td style={{ fontWeight: 700 }}>{r.return_bill_no}</Td>
                                        <Td>{dayjs(r.return_bill_date).format('DD-MM-YYYY HH:mm')}</Td>
                                        <Td>{r.bill_no}</Td>
                                        <Td>{typeBadge(r.patient_type)}{r.patient_type === 'IP' && r.ip_number ? <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>{r.ip_number}</div> : null}</Td>
                                        <Td>{r.uhid}</Td>
                                        <Td style={{ fontWeight: 600 }}>{r.patient_name}</Td>
                                        <Td>{r.doctor_name}</Td>
                                        <Td style={{ fontSize: '0.82rem', maxWidth: 260 }}>{r.items_summary || `${r.item_count} item(s)`}</Td>
                                        <Td style={{ textAlign: 'right', fontWeight: 700 }}>{(r.return_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Td>
                                        <Td>{modeBadge(r.mode)}</Td>
                                        <Td><Badge bg="#f1f5f9" color="#475569">{r.status}</Badge></Td>
                                        <Td>{r.pharmacist_name}</Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </ModernTable>
                    )}
                    {!loading && getFilteredData().length === 0 && (
                        <EmptyContainer>
                            <div className="icon-container"><Search size={64} /></div>
                            <h3>No Records Found</h3>
                            <p>Adjust your filters and click "Generate Report" to retrieve sales return records.</p>
                        </EmptyContainer>
                    )}
                    {loading && (
                        <EmptyContainer>
                            <div className="icon-container"><Activity className="animate-spin" size={64} /></div>
                            <h3>Fetching Records...</h3>
                            <p>Please wait while we compile the sales return report.</p>
                        </EmptyContainer>
                    )}
                </ModernTableWrapper>

                {getFilteredData().length > pageSize && (
                    <PaginationContainer className="no-print">
                        <div className="info">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, getFilteredData().length)} of {getFilteredData().length} entries
                        </div>
                        <div className="controls">
                            <PageButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronLeft size={14} /> Previous
                            </PageButton>
                            <PageButton active>Page {currentPage}</PageButton>
                            <PageButton
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage * pageSize >= getFilteredData().length}
                            >
                                Next <ChevronRight size={14} />
                            </PageButton>
                        </div>
                    </PaginationContainer>
                )}
            </GlassCard>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { font-size: 11pt; color: black; }
                    table { width: 100% !important; border-collapse: collapse; margin-top: 20px; }
                    th { background: #eee !important; color: black !important; border: 1px solid #000 !important; }
                    td { border: 1px solid #000 !important; padding: 8px !important; color: black !important; }
                    h1 { margin-bottom: 20px; }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </ModernPageContainer>
    );
};

export default SalesReturnReport;

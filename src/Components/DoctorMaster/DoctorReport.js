import React, { useState, useEffect } from "react";
import { DatePicker, Tabs, Tooltip, Modal } from "antd";
import dayjs from "dayjs";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  Users,
  Calendar,
  FileText,
  IndianRupee,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Activity,
  CreditCard,
  Search,
  Filter
} from "lucide-react";
import {
  PageWrapper,
  FormRow,
  InputWrapper,
  Label,
  Select,
  Button,
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
  background: #f8fafc;
  padding: 20px;
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-out;
`;

const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
      color: ${colors.primary};
    }
  }
  
  p {
    color: #64748b;
    margin: 4px 0 0 0;
    font-size: 0.95rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModernButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  height: auto;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(13, 148, 136, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(ModernButton)`
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #0f172a;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: ${props => props.gradient || colors.primary};
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    background: ${props => props.lightBg || '#f0fdfa'};
    color: ${props => props.color || colors.primary};
  }

  .label {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .value {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1e293b;
    margin-top: 4px;
    display: flex;
    align-items: baseline;
    gap: 6px;

    span {
      font-size: 0.9rem;
      font-weight: 500;
      color: #94a3b8;
    }
  }

  .trend {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #10b981;
  }
`;

const FilterSection = styled(GlassCard)`
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
`;

const ModernInputWrapper = styled(InputWrapper)`
  flex: 1;
  min-width: 220px;

  label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #475569;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const StyledSelect = styled(Select)`
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 0 16px;
  font-size: 0.95rem;
  background-color: #fff;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
  }
`;

const ModernTableWrapper = styled(TableWrapper)`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  background: white;
  border: 1px solid #f1f5f9;
`;

const ModernTable = styled(Table)`
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    background: #f8fafc;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
  }

  tbody td {
    padding: 16px 20px;
    color: #334155;
    font-size: 0.95rem;
    border-bottom: 1px solid #f1f5f9;
  }

  tbody tr:hover {
    background-color: #f8fafc;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => props.bg || '#f1f5f9'};
  color: ${props => props.color || '#475569'};
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  img, svg {
    margin-bottom: 20px;
    color: #e2e8f0;
  }

  h3 {
    color: #1e293b;
    font-weight: 700;
    margin-bottom: 8px;
  }

  p {
    color: #64748b;
    max-width: 400px;
  }
`;

const DoctorReport = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
  const [reportType, setReportType] = useState("day");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [detailsModal, setDetailsModal] = useState({ visible: false, data: null, date: "" });
  
  const HMS_BASE_URL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiRequest(`${HMS_BASE_URL}doctor_list_diagnostics/`, "GET");
      if (response.success && Array.isArray(response.data)) {
        setDoctors(response.data);
      } else {
        setDoctors([]);
        toast.error(response.error || "Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to fetch doctors list");
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        doctor_name: selectedDoctor === "all" ? "all" : selectedDoctor,
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD"),
        report_type: reportType,
      };
      
      const queryString = new URLSearchParams(params).toString();
      const response = await apiRequest(`${HMS_BASE_URL}doctor-report/?${queryString}`, "GET");
      
      if (response.success && Array.isArray(response.data)) {
        setReportData(response.data);
      } else {
        setReportData([]);
        if (!response.success) {
          toast.error(response.error || "Access denied or server error");
        }
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to generate report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const exportData = reportData.map(row => ({
      "Date / Period": row.date,
      "Admissions": row.admissions,
      "Billings": row.billings,
      "Total Amount (₹)": row.total_amount
    }));

    // Add Total Row
    const totals = {
      "Date / Period": "GRAND TOTAL",
      "Admissions": reportData.reduce((acc, curr) => acc + curr.admissions, 0),
      "Billings": reportData.reduce((acc, curr) => acc + curr.billings, 0),
      "Total Amount (₹)": reportData.reduce((acc, curr) => acc + curr.total_amount, 0)
    };
    exportData.push(totals);

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns (optional but nice)
    const colWidths = [
      { wch: 15 }, // Date
      { wch: 12 }, // Admissions
      { wch: 12 }, // Billings
      { wch: 20 }, // Amount
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Doctor Report");
    
    const fileName = `Doctor_Report_${selectedDoctor}_${dayjs().format('YYYYMMDD')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Report exported successfully");
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const doctorDetails = doctors.find(d => d.employeeName === selectedDoctor) || {};
    
    const content = `
      <html>
        <head>
          <title>Doctor Report - ${selectedDoctor}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .hospital-info h1 { margin: 0; color: #0d9488; font-size: 1.5rem; font-weight: 800; }
            .hospital-info p { margin: 4px 0; color: #64748b; font-size: 0.85rem; }
            .report-info { text-align: right; }
            .report-info h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #334155; }
            .report-info p { margin: 4px 0; color: #64748b; font-size: 0.85rem; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; }
            .detail-item span { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600; }
            .detail-item strong { display: block; font-size: 1rem; color: #1e293b; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; color: #64748b; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; text-align: left; padding: 12px 16px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px 16px; font-size: 0.9rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
            .amount { font-weight: 600; color: #1e293b; text-align: right; }
            .total-row { background: #f8fafc; font-weight: 800; }
            .total-row td { border-top: 2px solid #e2e8f0; font-weight: 700; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature-box { border-top: 1px solid #334155; width: 200px; padding-top: 10px; text-align: center; font-size: 0.85rem; font-weight: 600; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-info">
              <h1>SHANMUGA HOSPITAL</h1>
              <p>51/24. Saradha College Road, Salem - 636007</p>
              <p>Phone: 0427-2334455 | Email: info@shanmugahospital.com</p>
            </div>
            <div class="report-info">
              <h2>Doctor Performance</h2>
              <p>ID: REP-${dayjs().format('YYYYMMDD')}</p>
              <p>Date: ${dayjs().format('DD-MM-YYYY')}</p>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-item">
              <span>Doctor Name</span>
              <strong>${selectedDoctor}</strong>
            </div>
            <div class="detail-item">
              <span>Reporting Period</span>
              <strong>${dateRange[0].format("DD MMM YYYY")} - ${dateRange[1].format("DD MMM YYYY")}</strong>
            </div>
            <div class="detail-item">
              <span>Report Type</span>
              <strong>${reportType === 'day' ? 'Daily Aggregation' : 'Monthly Aggregation'}</strong>
            </div>
            <div class="detail-item">
              <span>Employee ID</span>
              <strong>${doctorDetails.employeeId || 'N/A'}</strong>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date / Period</th>
                <th>Admissions</th>
                <th>Billings</th>
                <th style="text-align: right;">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(row => `
                <tr>
                  <td>${row.date}</td>
                  <td>${row.admissions}</td>
                  <td>${row.billings}</td>
                  <td class="amount">${row.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td>GRAND TOTAL</td>
                <td>${reportData.reduce((acc, curr) => acc + curr.admissions, 0)}</td>
                <td>${reportData.reduce((acc, curr) => acc + curr.billings, 0)}</td>
                <td class="amount">₹ ${reportData.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <div style="font-size: 0.75rem; color: #94a3b8;">
              * This is a computer-generated report and does not require a physical signature for internal use.
            </div>
            <div class="signature-box">
              Authorized Signatory
            </div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const totalAdmissions = reportData.reduce((acc, curr) => acc + curr.admissions, 0);
  const totalBillings = reportData.reduce((acc, curr) => acc + curr.billings, 0);
  const totalAmount = reportData.reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <ModernPageContainer>
      <PageHeader>
        <TitleGroup>
          <h1><Activity size={32} /> Doctor Insights</h1>
          <p>Analyze performance metrics, admissions, and revenue trends.</p>
        </TitleGroup>
        <ActionButtons>
          {reportData.length > 0 && (
            <>
              <SecondaryButton onClick={handleExport}>
                <Download size={18} /> Export XLS
              </SecondaryButton>
              <SecondaryButton onClick={handlePrint}>
                <Printer size={18} /> Print Report
              </SecondaryButton>
            </>
          )}
          <ModernButton onClick={fetchReport} disabled={loading}>
            {loading ? <Activity className="animate-spin" size={18} /> : <TrendingUp size={18} />}
            {loading ? "Analyzing..." : "Generate Analysis"}
          </ModernButton>
        </ActionButtons>
      </PageHeader>

      <FilterSection>
        <ModernInputWrapper>
          <Label><Users size={16} /> Select Doctor</Label>
          <StyledSelect 
            value={selectedDoctor} 
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">Choose a medical professional...</option>
            <option value="all">All Doctors (Overall)</option>
            {doctors.map(doc => (
              <option key={doc.employeeId} value={doc.employeeName}>
                {doc.employeeName}
              </option>
            ))}
          </StyledSelect>
        </ModernInputWrapper>
        
        <ModernInputWrapper>
          <Label><Calendar size={16} /> Time Range</Label>
          <DatePicker.RangePicker 
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: "100%", height: "44px", borderRadius: "12px" }}
            format="DD-MM-YYYY"
            allowClear={false}
          />
        </ModernInputWrapper>

        <ModernInputWrapper>
          <Label><Filter size={16} /> View By</Label>
          <StyledSelect 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="day">Daily Breakdown</option>
            <option value="month">Monthly Overview</option>
          </StyledSelect>
        </ModernInputWrapper>
      </FilterSection>

      {reportData.length > 0 && (
        <>
          <StatsGrid>
            <StatCard gradient="linear-gradient(to bottom, #0ea5e9, #38bdf8)" color="#0ea5e9" lightBg="#f0f9ff">
              <div className="icon-box"><Users size={24} /></div>
              <div className="label">Total Admissions</div>
              <div className="value">{totalAdmissions.toLocaleString()} <span>patients</span></div>
              <div className="trend"><ChevronRight size={14} /> View patient list</div>
            </StatCard>
            
            <StatCard gradient="linear-gradient(to bottom, #10b981, #34d399)" color="#10b981" lightBg="#ecfdf5">
              <div className="icon-box"><FileText size={24} /></div>
              <div className="label">Total Invoices</div>
              <div className="value">{totalBillings.toLocaleString()} <span>bills</span></div>
              <div className="trend"><ChevronRight size={14} /> Audit revenue</div>
            </StatCard>
            
            <StatCard gradient="linear-gradient(to bottom, #f59e0b, #fbbf24)" color="#f59e0b" lightBg="#fffbeb">
              <div className="icon-box"><IndianRupee size={24} /></div>
              <div className="label">Generated Revenue</div>
              <div className="value">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })} <span>gross</span></div>
              <div className="trend" style={{ color: '#f59e0b' }}><Activity size={14} /> Performance peak</div>
            </StatCard>
          </StatsGrid>

          <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>Detailed Statistics</h2>
              <Badge color={colors.primary} bg="#f0fdfa">{reportType === 'day' ? 'Day-wise' : 'Month-wise'} Report</Badge>
            </div>
            <ModernTableWrapper>
              <ModernTable>
                <thead>
                  <Tr>
                    <Th>Date / Period</Th>
                    <Th style={{ textAlign: 'center' }}>Admissions</Th>
                    <Th style={{ textAlign: 'center' }}>Billings</Th>
                    <Th style={{ textAlign: 'right' }}>Revenue (₹)</Th>
                    <Th style={{ textAlign: 'right' }}>Status</Th>
                  </Tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <Tr key={idx}>
                      <Td style={{ fontWeight: 600, color: '#1e293b' }}>{row.date}</Td>
                      <Td style={{ textAlign: 'center' }}>
                        <Badge bg="#e0f2fe" color="#0369a1">{row.admissions}</Badge>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <Badge bg="#dcfce7" color="#15803d">{row.billings}</Badge>
                      </Td>
                      <Td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {row.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <Button 
                          style={{ 
                            fontSize: "0.75rem", 
                            padding: "6px 12px", 
                            background: "transparent", 
                            color: colors.primary, 
                            border: `1px solid ${colors.primary}`,
                            borderRadius: '8px'
                          }}
                          onClick={() => {
                            setDetailsModal({
                              visible: true,
                              data: row.items,
                              date: row.date
                            });
                          }}
                        >
                          View Details
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </ModernTable>
            </ModernTableWrapper>
          </GlassCard>
        </>
      )}

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.primary }}>
            <FileText size={20} />
            <span>Details for {detailsModal.date}</span>
          </div>
        }
        open={detailsModal.visible}
        onCancel={() => setDetailsModal({ ...detailsModal, visible: false })}
        footer={[
          <ModernButton key="close" onClick={() => setDetailsModal({ ...detailsModal, visible: false })}>
            Close
          </ModernButton>
        ]}
        width={1000}
        centered
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <ModernTable style={{ width: '100%' }}>
            <thead>
              <Tr>
                <Th>Type</Th>
                <Th>Patient Name</Th>
                <Th>UHID / IP</Th>
                <Th>Doctor</Th>
                <Th>Amount (₹)</Th>
                <Th>Details</Th>
              </Tr>
            </thead>
            <tbody>
              {detailsModal.data?.map((item, idx) => (
                <Tr key={idx}>
                  <Td>
                    <Badge 
                      bg={item.type === 'Admission' ? '#eff6ff' : '#f0fdf4'} 
                      color={item.type === 'Admission' ? '#2563eb' : '#16a34a'}
                    >
                      {item.type}
                    </Badge>
                  </Td>
                  <Td style={{ fontWeight: 600 }}>{item.patient_name}</Td>
                  <Td>
                    <div style={{ fontSize: '0.85rem' }}>{item.uhid}</div>
                    {item.ip_number && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.ip_number}</div>}
                  </Td>
                  <Td style={{ fontSize: '0.85rem' }}>{item.doctor || '—'}</Td>
                  <Td style={{ fontWeight: 700, textAlign: 'right' }}>
                    {item.amount > 0 ? item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                  </Td>
                  <Td style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '200px' }}>
                    {item.details}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </ModernTable>
        </div>
      </Modal>

      {!loading && reportData.length === 0 && (
        <EmptyContainer>
          <Search size={64} />
          <h3>{selectedDoctor ? "No records found" : "Ready for Analysis"}</h3>
          <p>
            {selectedDoctor 
              ? `We couldn't find any data for Dr. ${selectedDoctor} between ${dateRange[0].format("DD MMM")} and ${dateRange[1].format("DD MMM")}.` 
              : "Select a doctor and specify a date range to generate a comprehensive performance analysis."}
          </p>
          {!selectedDoctor && (
            <ModernButton style={{ marginTop: '20px', background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }} disabled>
              Select Doctor to start
            </ModernButton>
          )}
        </EmptyContainer>
      )}
    </ModernPageContainer>
  );
};

export default DoctorReport;

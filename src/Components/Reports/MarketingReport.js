import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FiDownload } from 'react-icons/fi';
import {
  PageWrapper,
  Container,
  SectionHeader,
  ControlsContainer,
  InputWrapper,
  Label,
  Input,
  Button,
  TabContainer,
  Tab,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  colors
} from "../GlobalStyles";

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: ${colors.primary};
  font-weight: 600;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${colors.textMuted};
  font-size: 0.95rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: ${colors.danger};
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const Loader = styled.div`
  border: 3px solid rgba(13, 148, 136, 0.2);
  border-top: 3px solid ${colors.primary};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ContentWrapper = styled.div`
  padding: 16px;
`;

const MarketingReport = () => {
  const formatDate = (date) => date.toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(formatDate(new Date(new Date().setDate(new Date().getDate() - 30))));
  const [toDate, setToDate] = useState(formatDate(new Date()));
  const [reportData, setReportData] = useState([]);
  const [flatPatientData, setFlatPatientData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_HMS_BASE_URL}marketing-area-zipcode-report/`, {
        params: {
          from_date: fromDate,
          to_date: toDate
        }
      });
      const data = response.data.data;
      setReportData(data);

      // Flatten patients for details tab
      const allPatients = [];
      data.forEach(areaGroup => {
        if (areaGroup.patients && areaGroup.patients.length > 0) {
          areaGroup.patients.forEach(p => {
            allPatients.push({
              area: areaGroup.area,
              zipcode: areaGroup.zipcode,
              ...p
            });
          });
        }
      });
      setFlatPatientData(allPatients);

    } catch (err) {
      console.error('Error fetching marketing report', err);
      setError('Failed to fetch report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportSummaryCSV = () => {
    if (!reportData || reportData.length === 0) return;
    
    const headers = ['S.No', 'Zipcode', 'Area', 'Patient Count', 'Total Revenue'];
    const rows = reportData.map((row, index) => [
      index + 1,
      `"${row.zipcode || 'N/A'}"`,
      `"${row.area || 'N/A'}"`,
      row.patient_count,
      row.total_revenue
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Marketing_Summary_Report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDetailsCSV = () => {
    if (!flatPatientData || flatPatientData.length === 0) return;

    const headers = ['S.No', 'UHID', 'Name', 'Age', 'Gender', 'Phone', 'Area', 'Zipcode', 'Revenue'];
    const rows = flatPatientData.map((p, index) => [
      index + 1,
      p.uhid,
      `"${p.name || ''}"`,
      p.age,
      p.gender,
      p.phone,
      `"${p.area || 'N/A'}"`,
      `"${p.zipcode || 'N/A'}"`,
      p.revenue
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Marketing_Patient_Details_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageWrapper>
      <Container style={{ padding: '16px', background: 'white' }}>
        <SectionHeader>
          <Title>Marketing Area & Zipcode Report</Title>
        </SectionHeader>

        <ControlsContainer style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <InputWrapper style={{ width: '180px' }}>
              <Label>From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </InputWrapper>
            <InputWrapper style={{ width: '180px' }}>
              <Label>To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
              />
            </InputWrapper>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
              <Button onClick={fetchReportData} disabled={loading}>
                Generate Report
              </Button>
            </div>
          </div>
        </ControlsContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {!loading && (reportData.length > 0 || flatPatientData.length > 0) && (
          <TabContainer style={{ marginTop: '20px' }}>
            <Tab active={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>
              Summary
            </Tab>
            <Tab active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
              Patient Details
            </Tab>
          </TabContainer>
        )}

        <ContentWrapper>
          {loading ? (
            <Loader />
          ) : (
            <>
              {activeTab === 'summary' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <Button secondary disabled={reportData.length === 0} onClick={exportSummaryCSV}>
                      <FiDownload size={14} /> Export Summary CSV
                    </Button>
                  </div>
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <Th>S.No</Th>
                          <Th>Zipcode</Th>
                          <Th>Area</Th>
                          <Th style={{ textAlign: 'right' }}>Patient Count</Th>
                          <Th style={{ textAlign: 'right' }}>Total Revenue (₹)</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.length > 0 ? (
                          reportData.map((row, index) => (
                            <Tr key={`${row.zipcode}-${row.area}`}>
                              <Td>{index + 1}</Td>
                              <Td>{row.zipcode || 'N/A'}</Td>
                              <Td>{row.area || 'N/A'}</Td>
                              <Td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                {row.patient_count}
                              </Td>
                              <Td style={{ textAlign: 'right', fontWeight: '600' }}>
                                ₹{row.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <tr>
                            <Td colSpan="5">
                              <EmptyState>No data found for the selected date range.</EmptyState>
                            </Td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </TableWrapper>
                </>
              )}

              {activeTab === 'details' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <Button secondary disabled={flatPatientData.length === 0} onClick={exportDetailsCSV}>
                      <FiDownload size={14} /> Export Details CSV
                    </Button>
                  </div>
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <Th>S.No</Th>
                          <Th>UHID</Th>
                          <Th>Name</Th>
                          <Th>Age/Gender</Th>
                          <Th>Phone</Th>
                          <Th>Area (Zipcode)</Th>
                          <Th style={{ textAlign: 'right' }}>Revenue (₹)</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {flatPatientData.length > 0 ? (
                          flatPatientData.map((p, index) => (
                            <Tr key={`${p.uhid}-${index}`}>
                              <Td>{index + 1}</Td>
                              <Td>{p.uhid}</Td>
                              <Td>{p.name}</Td>
                              <Td>{p.age} / {p.gender}</Td>
                              <Td>{p.phone || 'N/A'}</Td>
                              <Td>{p.area || 'N/A'} ({p.zipcode || 'N/A'})</Td>
                              <Td style={{ textAlign: 'right', fontWeight: '600', color: colors.success }}>
                                ₹{p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <tr>
                            <Td colSpan="7">
                              <EmptyState>No patient details found.</EmptyState>
                            </Td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </TableWrapper>
                </>
              )}
            </>
          )}
        </ContentWrapper>
      </Container>
    </PageWrapper>
  );
};

export default MarketingReport;

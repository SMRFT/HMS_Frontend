import React, { useState, useEffect } from 'react';
import apiRequest from '../../Auth/apiRequest';
import styled from "styled-components";
import * as XLSX from 'xlsx';
import {
  PageWrapper,
  Container,
  TabContainer,
  Tab,
  SectionHeader,
  FormContent,
  InputWrapper,
  Label,
  Input,
  Select,
  Button,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  colors
} from "../GlobalStyles";

const FixedPageWrapper = styled(PageWrapper)`
  height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
`;

const FixedContainer = styled(Container)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: 100%;
  height: 100%;
`;

const FixedFormContent = styled(FormContent)`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  padding-bottom: 12px;
`;

const InlineScrollTableWrapper = styled(TableWrapper)`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  max-height: calc(100vh - 280px);
  border: 1px solid ${colors.border || '#cbd5e1'};
  border-radius: 8px;
  background-color: #ffffff;

  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f8fafc;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FormRowSmall = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const SearchInput = styled(Input)`
  max-width: 250px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.bg || '#e2e8f0'};
  color: ${props => props.color || '#334155'};
`;


const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;

  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: bold;
  color: #64748b;
  cursor: pointer;
  &:hover {
    color: #0f172a;
  }
`;

const CrashCartChecklist = () => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const [activeTab, setActiveTab] = useState('daily');
    const [nursingStations, setNursingStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([]);
    const [dailyChecks, setDailyChecks] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // For Monthly Report
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [monthlyReport, setMonthlyReport] = useState([]);

    // For Expiry & Stock History Modal
    const [selectedReportItem, setSelectedReportItem] = useState(null);

    useEffect(() => {
        // Fetch Wards/Nursing Stations
        const fetchWards = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get_wards_list/`, "GET");
                if (res.success) {
                    const wardList = res.data?.data || res.data || [];
                    setNursingStations(wardList);
                    if (wardList.length > 0 && !selectedStation) {
                        setSelectedStation(wardList[0].ward_name);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchWards();
    }, [HmsBaseUrl]);

    // Fetch Crash Cart Items & Daily Check for selected floor and date
    useEffect(() => {
        const fetchDailyData = async () => {
            if (!selectedStation || !selectedDate) {
                setItems([]);
                setDailyChecks({});
                return;
            }
            setLoading(true);
            try {
                const res = await apiRequest(`${HmsBaseUrl}crash-cart/daily-check/?nursing_station=${encodeURIComponent(selectedStation)}&date=${selectedDate}`, "GET");
                if (res.success) {
                    const fetchedItems = res.data?.data || res.data || [];
                    setItems(fetchedItems);

                    // Initialize dailyChecks map with fetched data
                    const checksMap = {};
                    fetchedItems.forEach(item => {
                        checksMap[item.id] = {
                            available_qty: item.available_qty !== undefined ? item.available_qty : item.required_stock,
                            expiry_date: item.expiry_date || '',
                            is_checked: item.is_checked !== undefined ? item.is_checked : false
                        };
                    });
                    setDailyChecks(checksMap);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'daily') {
            fetchDailyData();
        }
    }, [selectedStation, selectedDate, activeTab, HmsBaseUrl]);

    const handleDailyCheckChange = (itemId, field, value) => {
        setDailyChecks(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value
            }
        }));
    };

    const markAllAsFullAndChecked = () => {
        const updated = { ...dailyChecks };
        items.forEach(item => {
            updated[item.id] = {
                available_qty: item.required_stock,
                expiry_date: updated[item.id]?.expiry_date || '',
                is_checked: true
            };
        });
        setDailyChecks(updated);
    };

    const submitDailyCheck = async () => {
        if (!selectedStation) {
            alert('Please select a Floor / Nursing Station');
            return;
        }

        const checks = items.map(item => ({
            item_id: item.id,
            available_qty: dailyChecks[item.id]?.available_qty !== undefined ? parseInt(dailyChecks[item.id].available_qty) || 0 : item.required_stock,
            is_checked: dailyChecks[item.id]?.is_checked || false,
            expiry_date: dailyChecks[item.id]?.expiry_date || ''
        }));

        const payload = {
            date: selectedDate,
            nursing_station: selectedStation,
            checks: checks
        };

        try {
            const res = await apiRequest(`${HmsBaseUrl}crash-cart/daily-check/`, "POST", payload);
            if (res.success) {
                alert(`Crash Cart check saved successfully for ${selectedStation} on ${selectedDate}!`);
            } else {
                alert('Error: ' + (res.data?.error || res.error || res.data?.message));
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save daily check.');
        }
    };

    const fetchMonthlyReport = async () => {
        if (!selectedStation) {
            alert('Please select a Floor / Nursing Station');
            return;
        }
        setLoading(true);
        try {
            const res = await apiRequest(`${HmsBaseUrl}crash-cart/monthly-report/?month=${month}&year=${year}&nursing_station=${encodeURIComponent(selectedStation)}`, "GET");
            if (res.success) {
                setMonthlyReport(res.data?.data || res.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Export Daily Check List to Excel
    const exportDailyToExcel = () => {
        if (!items || items.length === 0) {
            alert("No daily crash cart data available to export.");
            return;
        }

        const exportData = items.map((item, idx) => {
            const currentCheck = dailyChecks[item.id] || {};
            const availQty = currentCheck.available_qty !== undefined ? currentCheck.available_qty : item.required_stock;
            const isChecked = currentCheck.is_checked || false;
            const reqStock = parseInt(item.required_stock || 0);
            const currentAvail = parseInt(availQty || 0);
            const usedQty = Math.max(0, reqStock - currentAvail);

            return {
                "S.No": idx + 1,
                "Floor / Station": selectedStation,
                "Date": selectedDate,
                "Name of the Drug": item.drug_name,
                "Required Stock": reqStock,
                "Available Stock": currentAvail,
                "Used / Indent Qty": usedQty > 0 ? `${usedQty} (To Replenish)` : "0 (Full Stock)",
                "Expiry Date": currentCheck.expiry_date || "-",
                "Status": usedQty > 0 ? `Used: ${usedQty} (Indent Needed: ${usedQty})` : (isChecked ? `Verified (${currentAvail}/${reqStock})` : "Pending Check")
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Daily Stock Check");
        const cleanStation = selectedStation ? selectedStation.replace(/[^a-zA-Z0-9]/g, '_') : 'Station';
        XLSX.writeFile(wb, `CrashCart_Daily_Check_${cleanStation}_${selectedDate}.xlsx`);
    };

    // Export Monthly Report to Excel
    const exportMonthlyToExcel = () => {
        if (!monthlyReport || monthlyReport.length === 0) {
            alert("No monthly report data available to export. Click 'Generate Report' first.");
            return;
        }

        const daysInM = new Date(year, month, 0).getDate();

        const exportData = monthlyReport.map((item, idx) => {
            const row = {
                "S.No": idx + 1,
                "Floor / Station": selectedStation,
                "Name of the Drug": item.drug_name,
                "Required Stock": item.required_stock,
                "Expiry Date (Latest)": item.expiry_date || "-"
            };

            for (let d = 1; d <= daysInM; d++) {
                const dayData = item.days ? item.days[d] : null;
                if (dayData && (dayData.is_checked || typeof dayData === 'boolean')) {
                    const qty = dayData.available_qty !== undefined ? dayData.available_qty : item.required_stock;
                    const exp = dayData.expiry_date ? ` [Exp: ${dayData.expiry_date}]` : '';
                    row[`Day ${d}`] = `Checked (${qty})${exp}`;
                } else {
                    row[`Day ${d}`] = "-";
                }
            }
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Monthly Report");
        const cleanStation = selectedStation ? selectedStation.replace(/[^a-zA-Z0-9]/g, '_') : 'Station';
        XLSX.writeFile(wb, `CrashCart_Monthly_Report_${cleanStation}_${month}_${year}.xlsx`);
    };

    const filteredItems = items.filter(item => {
        const term = searchTerm.toLowerCase();
        return item.drug_name.toLowerCase().includes(term);
    });

    const renderDailyTab = () => (
        <FixedFormContent>
            <SectionHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Medicine Crash Cart Checklist</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Select Floor and Date to manage daily medicine stock</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button onClick={exportDailyToExcel}>
                        Export Excel
                    </Button>
                    <Button onClick={markAllAsFullAndChecked}>
                        ✓ Mark All Full Stock & Checked
                    </Button>
                </div>
            </SectionHeader>

            <ControlsContainer>
                <FormRowSmall>
                    <InputWrapper style={{ width: '240px' }}>
                        <Label required>Floor / Nursing Station</Label>
                        <Select value={selectedStation} onChange={e => setSelectedStation(e.target.value)}>
                            <option value="">Select Floor / Ward</option>
                            {nursingStations.map(ns => (
                                <option key={ns.id} value={ns.ward_name}>{ns.ward_name}</option>
                            ))}
                        </Select>
                    </InputWrapper>
                    <InputWrapper style={{ width: '180px' }}>
                        <Label required>Date</Label>
                        <Input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)} 
                        />
                    </InputWrapper>
                    <InputWrapper style={{ width: '240px' }}>
                        <Label>Search Medicine</Label>
                        <SearchInput 
                            type="text"
                            placeholder="Filter by drug name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </InputWrapper>
                </FormRowSmall>
            </ControlsContainer>

            <InlineScrollTableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th style={{ width: '50px', textAlign: 'center' }}>S.No</Th>
                            <Th>Name of the Drug</Th>
                            <Th style={{ textAlign: 'center', width: '120px' }}>Std Stock</Th>
                            <Th style={{ textAlign: 'center', width: '150px' }}>Available Stock</Th>
                            <Th style={{ textAlign: 'center', width: '150px' }}>Used / Indent Qty</Th>
                            <Th style={{ width: '140px' }}>Expiry Date</Th>
                            <Th style={{ textAlign: 'center', width: '90px' }}>Checked?</Th>
                            <Th style={{ width: '160px' }}>Status</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Loading medicines data...</Td>
                            </Tr>
                        ) : filteredItems.length === 0 ? (
                            <Tr>
                                <Td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                                    {selectedStation ? 'No crash cart medicines found for this floor.' : 'Please select a Floor / Nursing Station to view medicines.'}
                                </Td>
                            </Tr>
                        ) : (
                            filteredItems.map((item, idx) => {
                                const currentCheck = dailyChecks[item.id] || {};
                                const availQty = currentCheck.available_qty !== undefined ? currentCheck.available_qty : item.required_stock;
                                const isChecked = currentCheck.is_checked || false;
                                const reqStock = parseInt(item.required_stock || 0);
                                const currentAvail = parseInt(availQty || 0);
                                const usedQty = Math.max(0, reqStock - currentAvail);
                                const isLowStock = usedQty > 0;

                                return (
                                    <Tr key={item.id} style={{ backgroundColor: isLowStock ? '#fff1f2' : 'inherit' }}>
                                        <Td style={{ textAlign: 'center', fontWeight: '500' }}>{idx + 1}</Td>
                                        <Td style={{ fontWeight: '600' }}>{item.drug_name}</Td>
                                        <Td style={{ textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }}>{reqStock}</Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={availQty}
                                                onChange={e => handleDailyCheckChange(item.id, 'available_qty', e.target.value)}
                                                style={{ 
                                                    width: '80px', 
                                                    textAlign: 'center', 
                                                    fontWeight: 'bold',
                                                    borderColor: isLowStock ? '#ef4444' : '#cbd5e1',
                                                    backgroundColor: isLowStock ? '#fef2f2' : '#ffffff'
                                                }}
                                            />
                                        </Td>
                                        <Td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {usedQty > 0 ? (
                                                <span style={{ color: '#dc2626', background: '#fee2e2', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' }}>
                                                    {usedQty} (To Replenish)
                                                </span>
                                            ) : (
                                                <span style={{ color: '#166534', background: '#f0fdf4', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' }}>
                                                    0 (Full Stock)
                                                </span>
                                            )}
                                        </Td>
                                        <Td>
                                            <Input
                                                type="text"
                                                placeholder="MM/YY or YYYY-MM-DD"
                                                value={currentCheck.expiry_date || ''}
                                                onChange={e => handleDailyCheckChange(item.id, 'expiry_date', e.target.value)}
                                                style={{ width: '130px' }}
                                            />
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                style={{ accentColor: colors.primary, width: '18px', height: '18px', cursor: 'pointer' }}
                                                checked={isChecked}
                                                onChange={e => handleDailyCheckChange(item.id, 'is_checked', e.target.checked)}
                                            />
                                        </Td>
                                        <Td>
                                            {usedQty > 0 ? (
                                                <Badge bg="#fee2e2" color="#991b1b">⚠️ Used: {usedQty} (Indent {usedQty})</Badge>
                                            ) : isChecked ? (
                                                <Badge bg="#dcfce7" color="#166534">✓ Verified ({currentAvail}/{reqStock})</Badge>
                                            ) : (
                                                <Badge bg="#f1f5f9" color="#475569">Pending Check</Badge>
                                            )}
                                        </Td>
                                    </Tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </InlineScrollTableWrapper>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={submitDailyCheck} style={{ padding: '10px 24px', fontSize: '15px', fontWeight: 'bold' }}>
                    Save Daily Check ({selectedDate})
                </Button>
            </div>
        </FixedFormContent>
    );

    const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
    const daysInMonth = getDaysInMonth(month, year);

    const renderMonthlyTab = () => (
        <FixedFormContent>
            <SectionHeader style={{ marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Monthly Crash Cart Report</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>View daily medicine stock & expiry date changes across the month for selected floor. Click any medicine row to view daily expiry date log.</p>
            </SectionHeader>

            <ControlsContainer>
                <FormRowSmall>
                    <InputWrapper style={{ width: '240px' }}>
                        <Label required>Floor / Nursing Station</Label>
                        <Select value={selectedStation} onChange={e => setSelectedStation(e.target.value)}>
                            <option value="">Select Floor / Ward</option>
                            {nursingStations.map(ns => (
                                <option key={ns.id} value={ns.ward_name}>{ns.ward_name}</option>
                            ))}
                        </Select>
                    </InputWrapper>
                    <InputWrapper style={{ width: '100px' }}>
                        <Label>Month</Label>
                        <Input type="number" min="1" max="12" value={month} onChange={e => setMonth(e.target.value)} />
                    </InputWrapper>
                    <InputWrapper style={{ width: '110px' }}>
                        <Label>Year</Label>
                        <Input type="number" value={year} onChange={e => setYear(e.target.value)} />
                    </InputWrapper>
                    <Button onClick={fetchMonthlyReport}>Generate Report</Button>
                    <Button onClick={exportMonthlyToExcel}>Export Excel</Button>
                </FormRowSmall>
            </ControlsContainer>

            <InlineScrollTableWrapper>
                <Table style={{ textAlign: 'center', fontSize: '13px' }}>
                    <thead>
                        <Tr>
                            <Th style={{ borderRight: `1px solid ${colors.border}`, width: '40px' }}>S.NO</Th>
                            <Th style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'left', minWidth: '180px' }}>NAME OF THE DRUG</Th>
                            <Th style={{ borderRight: `1px solid ${colors.border}`, width: '60px' }}>STOCK</Th>
                            <Th style={{ borderRight: `1px solid ${colors.border}`, width: '110px' }}>EXP-DATE (LATEST)</Th>
                            {[...Array(daysInMonth)].map((_, i) => (
                                <Th key={i + 1} style={{ borderRight: `1px solid ${colors.border}`, minWidth: '28px', padding: '6px 2px', textAlign: 'center' }}>{i + 1}</Th>
                            ))}
                        </Tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={4 + daysInMonth} style={{ textAlign: 'center', padding: '30px' }}>Loading monthly report...</Td>
                            </Tr>
                        ) : monthlyReport.length === 0 ? (
                            <Tr>
                                <Td colSpan={4 + daysInMonth} style={{ textAlign: 'center', padding: '30px' }}>
                                    Click "Generate Report" to load monthly crash cart data for {selectedStation}.
                                </Td>
                            </Tr>
                        ) : (
                            monthlyReport.map((item, idx) => {
                                // Check if expiry date changed across days
                                const recordedExpiryDates = new Set();
                                if (item.days) {
                                    Object.values(item.days).forEach(d => {
                                        if (d && d.expiry_date) recordedExpiryDates.add(d.expiry_date);
                                    });
                                }
                                const hasMultipleExpiries = recordedExpiryDates.size > 1;

                                return (
                                    <Tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedReportItem(item)}>
                                        <Td style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'center' }}>{idx + 1}</Td>
                                        <Td style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'left', fontWeight: '600', color: colors.primary }}>
                                            {item.drug_name}
                                        </Td>
                                        <Td style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'center', fontWeight: 'bold' }}>{item.required_stock}</Td>
                                        <Td style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'center' }}>
                                            <span>{item.expiry_date || '-'}</span>
                                            {hasMultipleExpiries && (
                                                <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: 'bold' }}>ℹ️ Multiple Expiries</div>
                                            )}
                                        </Td>
                                        {[...Array(daysInMonth)].map((_, i) => {
                                            const dayNum = i + 1;
                                            const dayData = item.days ? item.days[dayNum] : null;
                                            const isChecked = typeof dayData === 'object' ? dayData?.is_checked : Boolean(dayData);
                                            const availQty = typeof dayData === 'object' && dayData?.available_qty !== undefined ? dayData.available_qty : null;
                                            const dayExpDate = typeof dayData === 'object' ? dayData?.expiry_date : '';
                                            const isLow = availQty !== null && availQty < item.required_stock;

                                            const tooltipText = isChecked 
                                                ? `Day ${dayNum} | Expiry: ${dayExpDate || 'N/A'} | Qty: ${availQty ?? item.required_stock} | Checked by: ${dayData?.checked_by || 'Nurse'}` 
                                                : `Day ${dayNum}: Not Checked`;

                                            return (
                                                <Td 
                                                    key={dayNum} 
                                                    style={{ 
                                                        borderRight: `1px solid ${colors.border}`, 
                                                        textAlign: 'center', 
                                                        padding: '4px 2px', 
                                                        fontWeight: 'bold', 
                                                        fontSize: '11px',
                                                        backgroundColor: isChecked ? (isLow ? '#fee2e2' : '#dcfce7') : 'inherit',
                                                        color: isChecked ? (isLow ? '#991b1b' : '#166534') : '#cbd5e1'
                                                    }}
                                                    title={tooltipText}
                                                >
                                                    {isChecked ? (availQty !== null ? availQty : '✓') : '-'}
                                                </Td>
                                            );
                                        })}
                                    </Tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </InlineScrollTableWrapper>

            {/* Daily Expiry Date & Stock Details Modal */}
            {selectedReportItem && (
                <ModalOverlay onClick={() => setSelectedReportItem(null)}>
                    <ModalCard onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <div>
                                <h4>{selectedReportItem.drug_name}</h4>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>
                                    Daily Log & Expiry History for {selectedStation} ({month}/{year})
                                </span>
                            </div>
                            <CloseButton onClick={() => setSelectedReportItem(null)}>✕</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th>Day / Date</Th>
                                        <Th style={{ textAlign: 'center' }}>Required Stock</Th>
                                        <Th style={{ textAlign: 'center' }}>Available Qty</Th>
                                        <Th>Recorded Expiry Date</Th>
                                        <Th>Checked By</Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {[...Array(daysInMonth)].map((_, i) => {
                                        const dayNum = i + 1;
                                        const dayData = selectedReportItem.days ? selectedReportItem.days[dayNum] : null;
                                        if (!dayData || !dayData.is_checked) {
                                            return (
                                                <Tr key={dayNum} style={{ opacity: 0.5 }}>
                                                    <Td style={{ fontWeight: '500' }}>Day {dayNum} ({year}-{String(month).padStart(2,'0')}-{String(dayNum).padStart(2,'0')})</Td>
                                                    <Td style={{ textAlign: 'center' }}>{selectedReportItem.required_stock}</Td>
                                                    <Td style={{ textAlign: 'center' }}>-</Td>
                                                    <Td>-</Td>
                                                    <Td>-</Td>
                                                    <Td><Badge bg="#f1f5f9" color="#64748b">Not Checked</Badge></Td>
                                                </Tr>
                                            );
                                        }

                                        const avail = dayData.available_qty !== undefined ? dayData.available_qty : selectedReportItem.required_stock;
                                        const isLow = avail < selectedReportItem.required_stock;

                                        return (
                                            <Tr key={dayNum} style={{ backgroundColor: isLow ? '#fff1f2' : 'inherit' }}>
                                                <Td style={{ fontWeight: '600' }}>Day {dayNum} ({year}-{String(month).padStart(2,'0')}-{String(dayNum).padStart(2,'0')})</Td>
                                                <Td style={{ textAlign: 'center', fontWeight: 'bold' }}>{selectedReportItem.required_stock}</Td>
                                                <Td style={{ textAlign: 'center', fontWeight: 'bold', color: isLow ? '#dc2626' : '#166534' }}>{avail}</Td>
                                                <Td style={{ fontWeight: '600', color: '#0284c7' }}>{dayData.expiry_date || 'N/A'}</Td>
                                                <Td style={{ fontSize: '13px' }}>{dayData.checked_by || 'Nurse'}</Td>
                                                <Td>
                                                    {isLow ? (
                                                        <Badge bg="#fee2e2" color="#991b1b">Deficit</Badge>
                                                    ) : (
                                                        <Badge bg="#dcfce7" color="#166534">Verified ✓</Badge>
                                                    )}
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </ModalBody>
                    </ModalCard>
                </ModalOverlay>
            )}
        </FixedFormContent>
    );

    return (
        <FixedPageWrapper>
            <FixedContainer>
                <TabContainer style={{ marginBottom: '12px' }}>
                    <Tab 
                        active={activeTab === 'daily'} 
                        onClick={() => setActiveTab('daily')}
                    >
                        Daily Entry & Stock Check
                    </Tab>
                    <Tab 
                        active={activeTab === 'monthly'} 
                        onClick={() => setActiveTab('monthly')}
                    >
                        Monthly Report
                    </Tab>
                </TabContainer>

                {activeTab === 'daily' ? renderDailyTab() : renderMonthlyTab()}
            </FixedContainer>
        </FixedPageWrapper>
    );
};

export default CrashCartChecklist;

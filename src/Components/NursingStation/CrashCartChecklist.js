import React, { useState, useEffect } from 'react';
import apiRequest from '../../Auth/apiRequest';
import { backendUrl } from '../../index';
import styled from "styled-components";
import {
  PageWrapper,
  Container,
  TabContainer,
  Tab,
  SectionHeader,
  FormContent,
  FormRow,
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

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FormRowSmall = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const CrashCartChecklist = () => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    const [activeTab, setActiveTab] = useState('daily');
    const [nursingStations, setNursingStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState('');
    const [items, setItems] = useState([]);
    const [dailyChecks, setDailyChecks] = useState({});
    
    // For Monthly Report
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [monthlyReport, setMonthlyReport] = useState([]);

    useEffect(() => {
        // Fetch Wards/Nursing Stations
        const fetchWards = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}get_wards_list/`, "GET");
                if (res.success) setNursingStations(res.data?.data || res.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        // Fetch Crash Cart Master Items
        const fetchItems = async () => {
            if (!selectedStation) {
                setItems([]);
                return;
            }
            try {
                const res = await apiRequest(`${HmsBaseUrl}crash-cart/items/?nursing_station=${selectedStation}`, "GET");
                if (res.success) setItems(res.data?.data || res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        
        fetchWards();
        fetchItems();
    }, [selectedStation]);

    const handleDailyCheckChange = (itemId, field, value) => {
        setDailyChecks(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value
            }
        }));
    };

    const submitDailyCheck = () => {
        if (!selectedStation) {
            alert('Please select a Nursing Station');
            return;
        }

        const checks = items.map(item => ({
            item_id: item.id,
            is_checked: dailyChecks[item.id]?.is_checked || false,
            expiry_date: dailyChecks[item.id]?.expiry_date || ''
        }));

        const payload = {
            date: new Date().toISOString().split('T')[0],
            nursing_station: selectedStation,
            checks: checks
        };

        const saveCheck = async () => {
            try {
                const res = await apiRequest(`${HmsBaseUrl}crash-cart/daily-check/`, "POST", payload);
                if (res.success) {
                    alert('Daily check saved successfully!');
                } else {
                    alert('Error: ' + (res.data?.error || res.error || res.data?.message));
                }
            } catch (err) {
                console.error(err);
            }
        };
        saveCheck();
    };

    const fetchMonthlyReport = async () => {
        if (!selectedStation) {
            alert('Please select a Nursing Station');
            return;
        }
        try {
            const res = await apiRequest(`${HmsBaseUrl}crash-cart/monthly-report/?month=${month}&year=${year}&nursing_station=${selectedStation}`, "GET");
            if (res.success) {
                setMonthlyReport(res.data?.data || res.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderDailyTab = () => (
        <FormContent>
            <SectionHeader>
                <h3>Daily Crash Cart Check ({new Date().toLocaleDateString()})</h3>
            </SectionHeader>

            <ControlsContainer>
                <FormRowSmall>
                    <InputWrapper style={{ width: '250px' }}>
                        <Label required>Nursing Station</Label>
                        <Select value={selectedStation} onChange={e => setSelectedStation(e.target.value)}>
                            <option value="">Select Station</option>
                            {nursingStations.map(ns => (
                                <option key={ns.id} value={ns.ward_name}>{ns.ward_name}</option>
                            ))}
                        </Select>
                    </InputWrapper>
                </FormRowSmall>
            </ControlsContainer>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>Box Category</Th>
                            <Th>Name of the Drug</Th>
                            <Th>Required Stock</Th>
                            <Th>Checked?</Th>
                            <Th>Expiry Date</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <Tr key={item.id}>
                                <Td>{item.box_category}</Td>
                                <Td>{item.drug_name}</Td>
                                <Td>{item.required_stock}</Td>
                                <Td>
                                    <input
                                        type="checkbox"
                                        style={{ accentColor: colors.primary, width: '16px', height: '16px', cursor: 'pointer' }}
                                        checked={dailyChecks[item.id]?.is_checked || false}
                                        onChange={e => handleDailyCheckChange(item.id, 'is_checked', e.target.checked)}
                                    />
                                </Td>
                                <Td>
                                    <Input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={dailyChecks[item.id]?.expiry_date || ''}
                                        onChange={e => handleDailyCheckChange(item.id, 'expiry_date', e.target.value)}
                                        style={{ width: '100px' }}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </TableWrapper>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={submitDailyCheck}>Save Daily Check</Button>
            </div>
        </FormContent>
    );

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };
    const daysInMonth = getDaysInMonth(month, year);

    const renderMonthlyTab = () => (
        <FormContent>
            <SectionHeader>
                <h3>Monthly Crash Cart Report</h3>
            </SectionHeader>

            <ControlsContainer>
                <FormRowSmall>
                    <InputWrapper style={{ width: '220px' }}>
                        <Label required>Nursing Station</Label>
                        <Select value={selectedStation} onChange={e => setSelectedStation(e.target.value)}>
                            <option value="">Select Station</option>
                            {nursingStations.map(ns => (
                                <option key={ns.id} value={ns.ward_name}>{ns.ward_name}</option>
                            ))}
                        </Select>
                    </InputWrapper>
                    <InputWrapper style={{ width: '100px' }}>
                        <Label>Month</Label>
                        <Input type="number" min="1" max="12" value={month} onChange={e => setMonth(e.target.value)} />
                    </InputWrapper>
                    <InputWrapper style={{ width: '100px' }}>
                        <Label>Year</Label>
                        <Input type="number" value={year} onChange={e => setYear(e.target.value)} />
                    </InputWrapper>
                    <Button onClick={fetchMonthlyReport}>Generate Report</Button>
                </FormRowSmall>
            </ControlsContainer>

            <TableWrapper style={{ overflowX: 'auto' }}>
                <Table style={{ textAlign: 'center' }}>
                    <thead>
                        <Tr>
                            <Th style={{ borderRight: `1px solid ${colors.border}` }}>S.NO</Th>
                            <Th style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'left' }}>NAME OF THE DRUGS</Th>
                            <Th style={{ borderRight: `1px solid ${colors.border}` }}>STOCK</Th>
                            <Th style={{ borderRight: `1px solid ${colors.border}` }}>EXP-DATE</Th>
                            {[...Array(daysInMonth)].map((_, i) => (
                                <Th key={i + 1} style={{ borderRight: `1px solid ${colors.border}`, width: '25px', padding: '7px 4px', textAlign: 'center' }}>{i + 1}</Th>
                            ))}
                        </Tr>
                    </thead>
                    <tbody>
                        {monthlyReport.map((item, idx) => (
                            <Tr key={item.id}>
                                <Td style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'center' }}>{idx + 1}</Td>
                                <Td style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'left', fontWeight: '500' }}>{item.drug_name}</Td>
                                <Td style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'center' }}>{item.required_stock}</Td>
                                <Td style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'center' }}>{item.expiry_date}</Td>
                                {[...Array(daysInMonth)].map((_, i) => (
                                    <Td key={i + 1} style={{ borderRight: `1px solid ${colors.border}`, textAlign: 'center', padding: '6px 4px', fontWeight: 'bold', color: item.days[i + 1] ? colors.success : 'inherit' }}>
                                        {item.days[i + 1] ? '✓' : ''}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </tbody>
                </Table>
            </TableWrapper>
        </FormContent>
    );

    return (
        <PageWrapper>
            <Container>
                <TabContainer>
                    <Tab 
                        active={activeTab === 'daily'} 
                        onClick={() => setActiveTab('daily')}
                    >
                        Daily Entry
                    </Tab>
                    <Tab 
                        active={activeTab === 'monthly'} 
                        onClick={() => setActiveTab('monthly')}
                    >
                        Monthly Report
                    </Tab>
                </TabContainer>

                {activeTab === 'daily' ? renderDailyTab() : renderMonthlyTab()}
            </Container>
        </PageWrapper>
    );
};

export default CrashCartChecklist;

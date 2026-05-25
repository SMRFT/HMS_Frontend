import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { FaPrint, FaSearch, FaShieldAlt } from "react-icons/fa";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
    PageWrapper,
    colors,
    fadeIn,
    FormRow,
    InputWrapper,
    Label,
    Input,
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
    border-left: 4px solid ${colors.secondary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 80px;
    animation: ${fadeIn} 0.4s ease-out;
`;

const AdvanceRegistrationInsurence = ({ isModalView = false, startDate, endDate }) => {
    const [fromDate, setFromDate] = useState(startDate || format(new Date(), "yyyy-MM-dd"));
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
            const response = await apiRequest(`${HmsBaseUrl}advance-registration-report/?from_date=${fromDate}&to_date=${toDate}&insurance=true`, "GET");
            if (response.success && response.data && Array.isArray(response.data.data)) {
                const mappedData = response.data.data.map(item => ({
                    ...item,
                    admissionDateTime: item.admissionDateTime || item.admission_date,
                    patient_name: item.patient_name || item.patientname,
                    firstName: (item.patient_name || item.patientname || '').split(' ')[0],
                    lastName: (item.patient_name || item.patientname || '').split(' ').slice(1).join(' '),
                    insuranceCompanyName: item.insurance_company
                }));
                setReportData(mappedData);
            }
        } catch (error) {
            console.error("Error fetching insurance report:", error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, HmsBaseUrl]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <PageWrapper>
            <SectionTitle className="no-print">
                <h3>Advance Registration (Insurance)</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>
                    List of insurance-based admissions and advance details
                </p>
            </SectionTitle>

            <FilterSection className="no-print">
                <FormRow>
                    <InputWrapper>
                        <Label>From Admission Date</Label>
                        <DatePicker 
                            value={fromDate ? dayjs(fromDate) : null} 
                            onChange={(date) => setFromDate(date ? date.format("YYYY-MM-DD") : "")}
                            format="DD/MM/YYYY"
                            style={{ width: '100%', height: '40px', borderRadius: '8px' }}
                        />
                    </InputWrapper>
                    <InputWrapper>
                        <Label>To Admission Date</Label>
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
                        <Button onClick={handlePrint} secondary style={{ height: "40px" }}>
                            <FaPrint style={{ marginRight: "8px" }} /> Print
                        </Button>
                    </div>
                </FormRow>
            </FilterSection>

            <TableWrapper>
                <Table>
                    <thead>
                        <Tr>
                            <Th>S.No</Th>
                            <Th>IP No</Th>
                            <Th>Patient Details</Th>
                            <Th>Company Name</Th>
                            <Th>Admission Date</Th>
                        </Tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((adm, index) => (
                                <Tr key={index}>
                                    <Td>{index + 1}</Td>
                                    <Td style={{ fontWeight: "700", color: colors.primary }}>{adm.ipNumber}</Td>
                                    <Td>
                                        <div style={{ fontWeight: "600" }}>{adm.firstName} {adm.lastName}</div>
                                        <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>{adm.uhid} | {adm.gender} | {adm.age} yrs</div>
                                    </Td>
                                    <Td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <FaShieldAlt color={colors.secondary} size={12} />
                                            {adm.insuranceCompanyName || adm.company_code || "N/A"}
                                        </div>
                                    </Td>
                                    <Td>{adm.admissionDateTime ? format(new Date(adm.admissionDateTime), "dd/MM/yyyy") : "N/A"}</Td>
                                </Tr>
                            ))
                        ) : (
                            <Tr>
                                <Td colSpan="5" style={{ textAlign: "center", padding: "30px", color: colors.textMuted }}>
                                    No insurance registrations found for the selected period.
                                </Td>
                            </Tr>
                        )}
                    </tbody>
                </Table>
            </TableWrapper>

            <style>
                {`
                @media print {
                    @page { size: portrait; margin: 10mm; }
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    ${TableWrapper} { box-shadow: none; border: 1px solid #000; }
                    ${Table} { width: 100%; border-collapse: collapse; }
                    ${Th}, ${Td} { border: 1px solid #000; padding: 10px; font-size: 11px; }
                    ${Th} { background: #f0f0f0 !important; color: black !important; }
                }
                `}
            </style>
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

export default AdvanceRegistrationInsurence;

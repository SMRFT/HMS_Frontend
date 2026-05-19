import React, { useState, useEffect, useCallback } from "react";
import { 
    Table, Button, DatePicker, Select, Input, Radio, 
    Space, Spin, message, Row, Col, Card 
} from "antd";
import { 
    FaSearch, FaPlus, FaPrint, FaTimes, FaSave, FaShieldAlt 
} from "react-icons/fa";
import styled from "styled-components";
import dayjs from "dayjs";
import apiRequest from "../../Auth/apiRequest";
import { 
    PageWrapper, Container, SectionTitle, colors, fadeIn 
} from "../GlobalStyles";

const { Option } = Select;

// Styled Components
const FilterSection = styled.div`
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    animation: ${fadeIn} 0.3s ease-out;
`;

const ClaimFormCard = styled(Card)`
    margin-bottom: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 12px;
    border: none;
    .ant-card-head {
        border-bottom: 1px solid #f0f0f0;
        background: #fdfdfd;
        border-radius: 12px 12px 0 0;
    }
`;

const FormLabel = styled.label`
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: ${colors.textMain};
    font-size: 0.85rem;
    span {
        color: ${colors.danger};
    }
`;

const InfoBox = styled.div`
    background: #f8fafc;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    min-height: 38px;
    color: ${colors.textMain};
    font-size: 0.9rem;
`;

const StatusBadge = styled.span`
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    background: ${props => props.bg};
    color: ${props => props.color};
`;

const SearchButton = styled(Button)`
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${colors.primary};
    border-color: ${colors.primary};
    &:hover {
        background: ${colors.primaryDark} !important;
        border-color: ${colors.primaryDark} !important;
    }
`;

const ActionButton = styled(Button)`
    border-radius: 6px;
    font-weight: 500;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const InsuranceClaim = () => {
    const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
    
    // State
    const [claims, setClaims] = useState([]);
    const [providers, setProviders] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    // Filters
    const [filterCompany, setFilterCompany] = useState("ALL");
    const [filterDates, setFilterDates] = useState([dayjs(), dayjs()]);
    
    // Form Data
    const [formData, setFormData] = useState({
        uhid: "",
        ip_number: "",
        patient_name: "",
        admission_date: null,
        customer_type: "",
        admitting_doctor: "",
        room_no: "",
        bed_no: "",
        insurance_company: "",
        policy_no: "",
        policy_date: null,
        insurance_id: "",
        approved_amount: 0,
        claim_status: "Approved",
        approved_date: dayjs(),
        patient_ward: ""
    });

    const fetchInitialData = useCallback(async () => {
        try {
            // Fetch Providers
            const provRes = await apiRequest(`${HmsBaseUrl}insurance-providers/`, "GET");
            if (provRes.success) setProviders(provRes.data.data || provRes.data || []);
            
            // Fetch Wards (Room Categories)
            const wardRes = await apiRequest(`${HmsBaseUrl}room-category/`, "GET");
            if (wardRes.success) setWards(wardRes.data || []);
            
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }, [HmsBaseUrl]);

    const fetchClaims = useCallback(async () => {
        setLoading(true);
        try {
            const fromDate = filterDates[0].format("YYYY-MM-DD");
            const toDate = filterDates[1].format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}insurance-claims/?from_date=${fromDate}&to_date=${toDate}&company=${filterCompany}`;
            const res = await apiRequest(url, "GET");
            if (res.success) setClaims(res.data.data || res.data || []);
        } catch (error) {
            message.error("Failed to fetch claims");
        } finally {
            setLoading(false);
        }
    }, [HmsBaseUrl, filterDates, filterCompany]);

    useEffect(() => {
        fetchInitialData();
        fetchClaims();
    }, [fetchInitialData, fetchClaims]);

    const handleSearchPatient = async (type) => {
        const val = type === 'uhid' ? formData.uhid : formData.ip_number;
        if (!val) return message.warning(`Please enter ${type.toUpperCase()}`);
        
        setFormLoading(true);
        try {
            const url = `${HmsBaseUrl}patient-admission-details/?${type === 'uhid' ? 'uhid' : 'ip_number'}=${val}`;
            const res = await apiRequest(url, "GET");
            if (res.success && res.data && res.data.data) {
                const { patient_details, insurance_details, registration_details, room_info, uhid, ipNumber, admissionDateTime, admittingDoctor } = res.data.data;
                setFormData(prev => ({
                    ...prev,
                    uhid: uhid,
                    ip_number: ipNumber,
                    patient_name: `${patient_details?.firstName || ''} ${patient_details?.lastName || ''}`.trim(),
                    admission_date: admissionDateTime ? dayjs(admissionDateTime) : null,
                    customer_type: registration_details?.customer_type || patient_details?.customer_type || 'General',
                    admitting_doctor: admittingDoctor,
                    room_no: room_info?.room_no || '',
                    bed_no: room_info?.bed_no || '',
                    insurance_company: insurance_details?.company_name || '',
                    company_code: insurance_details?.company_code || ''
                }));
                message.success("Patient details fetched");
            } else {
                message.error(res.error || "Patient not found or no active admission");
            }
        } catch (error) {
            message.error("Error fetching patient details");
        } finally {
            setFormLoading(false);
        }
    };

    const handleSaveClaim = async () => {
        if (!formData.uhid || !formData.ip_number) {
            return message.error("Patient details required");
        }
        
        setFormLoading(true);
        try {
            const payload = {
                ...formData,
                admission_date: formData.admission_date?.format("YYYY-MM-DD"),
                policy_date: formData.policy_date?.format("YYYY-MM-DD"),
                approved_date: formData.approved_date?.format("YYYY-MM-DD"),
            };
            
            const res = await apiRequest(`${HmsBaseUrl}insurance-claims/`, "POST", payload);
            if (res.success) {
                message.success("Claim saved successfully");
                setShowForm(false);
                fetchClaims();
                setFormData({
                    uhid: "", ip_number: "", patient_name: "", admission_date: null,
                    customer_type: "", admitting_doctor: "", room_no: "", bed_no: "",
                    insurance_company: "", policy_no: "", policy_date: null, insurance_id: "",
                    approved_amount: 0, claim_status: "Approved", approved_date: dayjs(), patient_ward: ""
                });
            } else {
                message.error(typeof res.error === 'object' ? JSON.stringify(res.error) : res.error);
            }
        } catch (error) {
            message.error("Error saving claim");
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            title: "Patient",
            key: "patient",
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: colors.primary }}>{record.patient_details?.firstName} {record.patient_details?.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>{record.uhid}</div>
                </div>
            )
        },
        {
            title: "Age / Gender",
            key: "age_gender",
            render: (text, record) => (
                <div style={{ fontSize: '0.85rem' }}>
                    {record.patient_details?.age}(Y) / {record.patient_details?.gender}
                </div>
            )
        },
        {
            title: "Insurance Provider",
            dataIndex: "insurance_company",
            key: "insurance_company",
        },
        {
            title: "Approved Amount",
            dataIndex: "approved_amount",
            key: "approved_amount",
            align: 'right',
            render: val => <span style={{ fontWeight: 700 }}>₹{parseFloat(val || 0).toFixed(2)}</span>
        },
        {
            title: "Claim Status",
            dataIndex: "claim_status",
            key: "claim_status",
            render: status => {
                let bg = "#fef3c7", color = "#92400e";
                if (status === "Approved") { bg = "#dcfce7"; color = "#166534"; }
                if (status === "Rejected") { bg = "#fee2e2"; color = "#b91c1c"; }
                return <StatusBadge bg={bg} color={color}>{status}</StatusBadge>
            }
        },
        {
            title: "Claim Date",
            dataIndex: "claim_date",
            key: "claim_date",
            render: date => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: "IP No / SL No",
            key: "ip_no",
            render: (text, record) => (
                <div style={{ fontSize: '0.85rem' }}>
                    {record.ip_number}
                </div>
            )
        },
        {
            title: "Patient Ward",
            dataIndex: "patient_ward",
            key: "patient_ward",
        }
    ];

    return (
        <PageWrapper>
            <Container>
                <SectionTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaShieldAlt size={24} color={colors.primary} />
                        <div>
                            <h3 style={{ margin: 0 }}>Insurance Claim Management</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textMuted }}>Manage and track patient insurance claims</p>
                        </div>
                    </div>
                </SectionTitle>

                {/* Top Filters */}
                <FilterSection className="no-print">
                    <Row gutter={16} align="bottom">
                        <Col span={6}>
                            <FormLabel>Company Name</FormLabel>
                            <Select 
                                style={{ width: '100%' }} 
                                value={filterCompany} 
                                onChange={setFilterCompany}
                                showSearch
                                optionFilterProp="children"
                            >
                                <Option value="ALL">ALL</Option>
                                {providers.map(p => (
                                    <Option key={p.company_code} value={p.company_name}>{p.company_name}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={8}>
                            <FormLabel>Date Range</FormLabel>
                            <DatePicker.RangePicker 
                                style={{ width: '100%' }} 
                                value={filterDates} 
                                onChange={setFilterDates}
                                format="DD/MM/YYYY"
                            />
                        </Col>
                        <Col span={4}>
                            <ActionButton 
                                type="primary" 
                                icon={<FaSearch />} 
                                onClick={fetchClaims}
                                loading={loading}
                            >
                                Fetch
                            </ActionButton>
                        </Col>
                        <Col span={6} style={{ textAlign: 'right' }}>
                            <ActionButton 
                                style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#fff' }}
                                icon={<FaPlus />}
                                onClick={() => setShowForm(!showForm)}
                            >
                                {showForm ? "Close Form" : "New Claim"}
                            </ActionButton>
                        </Col>
                    </Row>
                </FilterSection>

                {showForm && (
                    <ClaimFormCard title={<span><FaPlus style={{marginRight: 8}} /> {formData.claim_id ? "Edit Claim" : "Create New Claim"}</span>}>
                        <Spin spinning={formLoading}>
                            <Row gutter={24}>
                                {/* Left Side: Patient Info */}
                                <Col span={14} style={{ borderRight: '1px solid #f0f0f0' }}>
                                    <Row gutter={[16, 16]}>
                                        <Col span={10}>
                                            <FormLabel>UHID <span>*</span></FormLabel>
                                            <Space.Compact style={{ width: '100%' }}>
                                                <Input 
                                                    placeholder="UHID" 
                                                    value={formData.uhid} 
                                                    onChange={e => setFormData({...formData, uhid: e.target.value})}
                                                    onPressEnter={() => handleSearchPatient('uhid')}
                                                />
                                                <SearchButton type="primary" icon={<FaSearch />} onClick={() => handleSearchPatient('uhid')} />
                                            </Space.Compact>
                                        </Col>
                                        <Col span={10}>
                                            <FormLabel>IP Number</FormLabel>
                                            <Space.Compact style={{ width: '100%' }}>
                                                <Input 
                                                    placeholder="IP Number" 
                                                    value={formData.ip_number} 
                                                    onChange={e => setFormData({...formData, ip_number: e.target.value})}
                                                    onPressEnter={() => handleSearchPatient('ip_number')}
                                                />
                                                <SearchButton type="primary" icon={<FaSearch />} onClick={() => handleSearchPatient('ip_number')} />
                                            </Space.Compact>
                                        </Col>
                                        <Col span={4}>
                                            <FormLabel>Date</FormLabel>
                                            <DatePicker value={dayjs()} format="DD/MM/YYYY" disabled style={{ width: '100%' }} />
                                        </Col>

                                        <Col span={12}>
                                            <FormLabel>Patient Name</FormLabel>
                                            <InfoBox>{formData.patient_name || "-"}</InfoBox>
                                        </Col>
                                        <Col span={6}>
                                            <FormLabel>Admission Date</FormLabel>
                                            <InfoBox>{formData.admission_date ? formData.admission_date.format("DD/MM/YYYY") : "-"}</InfoBox>
                                        </Col>
                                        <Col span={6}>
                                            <FormLabel>Customer Type</FormLabel>
                                            <InfoBox>{formData.customer_type || "-"}</InfoBox>
                                        </Col>

                                        <Col span={12}>
                                            <FormLabel>Admitting Doctor</FormLabel>
                                            <InfoBox>{formData.admitting_doctor || "-"}</InfoBox>
                                        </Col>
                                        <Col span={8}>
                                            <FormLabel>Room No</FormLabel>
                                            <InfoBox>{formData.room_no || "-"}</InfoBox>
                                        </Col>
                                        <Col span={4}>
                                            <FormLabel>Bed No</FormLabel>
                                            <InfoBox>{formData.bed_no || "-"}</InfoBox>
                                        </Col>

                                        <Col span={24}>
                                            <FormLabel>Insurance Company</FormLabel>
                                            <InfoBox>{formData.insurance_company || "-"}</InfoBox>
                                        </Col>
                                    </Row>
                                </Col>

                                {/* Right Side: Claim Details */}
                                <Col span={10}>
                                    <Row gutter={[16, 16]}>
                                        <Col span={12}>
                                            <FormLabel>Policy Date</FormLabel>
                                            <DatePicker 
                                                style={{ width: '100%' }} 
                                                value={formData.policy_date} 
                                                onChange={val => setFormData({...formData, policy_date: val})}
                                                format="DD/MM/YYYY"
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <FormLabel>Approved Amount</FormLabel>
                                            <Input 
                                                type="number" 
                                                prefix="₹"
                                                value={formData.approved_amount} 
                                                onChange={e => setFormData({...formData, approved_amount: e.target.value})}
                                            />
                                        </Col>

                                        <Col span={12}>
                                            <FormLabel>Insurance ID</FormLabel>
                                            <Input 
                                                placeholder="ID"
                                                value={formData.insurance_id} 
                                                onChange={e => setFormData({...formData, insurance_id: e.target.value})}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <FormLabel>Policy No</FormLabel>
                                            <Input 
                                                placeholder="Policy #"
                                                value={formData.policy_no} 
                                                onChange={e => setFormData({...formData, policy_no: e.target.value})}
                                            />
                                        </Col>

                                        <Col span={12}>
                                            <FormLabel>Approved Date</FormLabel>
                                            <DatePicker 
                                                style={{ width: '100%' }} 
                                                value={formData.approved_date} 
                                                onChange={val => setFormData({...formData, approved_date: val})}
                                                format="DD/MM/YYYY"
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <FormLabel>Claim Status</FormLabel>
                                            <Radio.Group 
                                                value={formData.claim_status} 
                                                onChange={e => setFormData({...formData, claim_status: e.target.value})}
                                            >
                                                <Radio value="Approved">Approved</Radio>
                                                <Radio value="Rejected">Rejected</Radio>
                                                <Radio value="Pending">Pending</Radio>
                                            </Radio.Group>
                                        </Col>

                                        <Col span={24}>
                                            <FormLabel>Patient Ward</FormLabel>
                                            <Select 
                                                style={{ width: '100%' }} 
                                                value={formData.patient_ward} 
                                                onChange={val => setFormData({...formData, patient_ward: val})}
                                                placeholder="Select Ward"
                                            >
                                                {wards.map(w => (
                                                    <Option key={w.room_category_id} value={w.name}>{w.name}</Option>
                                                ))}
                                            </Select>
                                        </Col>

                                        <Col span={24} style={{ marginTop: 20 }}>
                                            <Space style={{ width: '100%', justifyContent: 'flex-start' }}>
                                                <ActionButton 
                                                    danger 
                                                    icon={<FaTimes />} 
                                                    onClick={() => setShowForm(false)}
                                                >
                                                    Cancel
                                                </ActionButton>
                                                <ActionButton 
                                                    type="primary" 
                                                    style={{ background: colors.primaryDark }}
                                                    icon={<FaSave />} 
                                                    onClick={handleSaveClaim}
                                                >
                                                    Generate & Save Claim
                                                </ActionButton>
                                            </Space>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Spin>
                    </ClaimFormCard>
                )}

                {/* Claims Table */}
                <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>Active Claims List</span>
                    </div>
                    <Table 
                        dataSource={claims} 
                        columns={columns} 
                        rowKey="claim_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                    />
                </Card>
            </Container>
        </PageWrapper>
    );
};

export default InsuranceClaim;

import React, { useState, useEffect, useCallback } from "react";
import { 
    Table, Button, DatePicker, Select, Input, Radio, 
    Space, Spin, message, Row, Col, Card 
} from "antd";
import { 
    FaSearch, FaPlus, FaPrint, FaTimes, FaSave, FaShieldAlt, FaEdit, FaTrash 
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
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());
    
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
        estimate_amount: 0,
        claim_status: "Approved",
        approved_date: dayjs(),
        patient_ward: "",
        claim_id: null
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
            const fDate = fromDate.format("YYYY-MM-DD");
            const tDate = toDate.format("YYYY-MM-DD");
            const url = `${HmsBaseUrl}insurance-claims/?from_date=${fDate}&to_date=${tDate}&company=${filterCompany}`;
            const res = await apiRequest(url, "GET");
            if (res.success) setClaims(res.data.data || res.data || []);
        } catch (error) {
            message.error("Failed to fetch claims");
        } finally {
            setLoading(false);
        }
    }, [HmsBaseUrl, fromDate, toDate, filterCompany]);

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
                    insurance_id: insurance_details?.company_code || patient_details?.company_code || ''
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
            
            const isEdit = !!formData.claim_id;
            const url = isEdit 
                ? `${HmsBaseUrl}insurance-claims/${formData.claim_id}/` 
                : `${HmsBaseUrl}insurance-claims/`;
            const method = isEdit ? "PATCH" : "POST";

            const res = await apiRequest(url, method, payload);
            if (res.success) {
                message.success(isEdit ? "Claim updated successfully" : "Claim saved successfully");
                setShowForm(false);
                fetchClaims();
                resetForm();
            } else {
                message.error(typeof res.error === 'object' ? JSON.stringify(res.error) : res.error);
            }
        } catch (error) {
            message.error("Error saving claim");
        } finally {
            setFormLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            uhid: "", ip_number: "", patient_name: "", admission_date: null,
            customer_type: "", admitting_doctor: "", room_no: "", bed_no: "",
            insurance_company: "", policy_no: "", policy_date: null, insurance_id: "",
            approved_amount: 0, estimate_amount: 0, claim_status: "Approved", 
            approved_date: dayjs(), patient_ward: "", claim_id: null
        });
    };

    const handleEdit = (record) => {
        setFormData({
            uhid: record.uhid,
            ip_number: record.ip_number,
            patient_name: `${record.patient_details?.firstName || ''} ${record.patient_details?.lastName || ''}`.trim(),
            admission_date: record.admission_details?.admissionDateTime ? dayjs(record.admission_details.admissionDateTime) : null,
            customer_type: record.patient_details?.customer_type || 'General',
            admitting_doctor: record.admission_details?.admittingDoctor || '',
            room_no: record.room_info?.room_no || '',
            bed_no: record.room_info?.bed_no || '',
            insurance_company: record.insurance_company,
            policy_no: record.policy_no,
            policy_date: record.policy_date ? dayjs(record.policy_date) : null,
            insurance_id: record.insurance_id,
            approved_amount: record.approved_amount,
            estimate_amount: record.estimate_amount,
            claim_status: record.claim_status,
            approved_date: record.approved_date ? dayjs(record.approved_date) : null,
            patient_ward: record.patient_ward,
            claim_id: record.claim_id
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (claimId) => {
        try {
            const res = await apiRequest(`${HmsBaseUrl}insurance-claims/${claimId}/`, "DELETE");
            if (res.success) {
                message.success("Claim deleted successfully");
                fetchClaims();
            } else {
                message.error(res.error || "Failed to delete claim");
            }
        } catch (error) {
            message.error("Error deleting claim");
        }
    };

    const handlePrint = (record) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Insurance Claim - ${record.claim_id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; }
                        .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 30px; padding-bottom: 10px; }
                        .row { display: flex; margin-bottom: 15px; }
                        .label { width: 180px; font-weight: bold; }
                        .value { flex: 1; }
                        .section-title { background: #f0f0f0; padding: 8px; font-weight: bold; margin: 25px 0 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>INSURANCE CLAIM DETAILS</h1>
                        <p>Claim ID: ${record.claim_id}</p>
                    </div>
                    
                    <div class="section-title">PATIENT INFORMATION</div>
                    <div class="row"><div class="label">Patient Name:</div><div class="value">${record.patient_details?.firstName} ${record.patient_details?.lastName}</div></div>
                    <div class="row"><div class="label">UHID:</div><div class="value">${record.uhid}</div></div>
                    <div class="row"><div class="label">IP Number:</div><div class="value">${record.ip_number}</div></div>
                    
                    <div class="section-title">CLAIM INFORMATION</div>
                    <div class="row"><div class="label">Insurance Company:</div><div class="value">${record.insurance_company}</div></div>
                    <div class="row"><div class="label">Policy Number:</div><div class="value">${record.policy_no || '-'}</div></div>
                    <div class="row"><div class="label">Estimate Amount:</div><div class="value">₹${record.estimate_amount}</div></div>
                    <div class="row"><div class="label">Approved Amount:</div><div class="value">₹${record.approved_amount}</div></div>
                    <div class="row"><div class="label">Status:</div><div class="value">${record.claim_status}</div></div>
                    <div class="row"><div class="label">Claim Date:</div><div class="value">${dayjs(record.claim_date).format('DD/MM/YYYY')}</div></div>
                    
                    <div style="margin-top: 100px; display: flex; justify-content: space-between;">
                        <div>Prepared By</div>
                        <div>Authorized Signatory</div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const columns = [
        {
            title: "Patient",
            key: "patient",
            fixed: 'left',
            width: 180,
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
            width: 120,
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
            width: 180,
        },
        {
            title: "Estimate Amount",
            dataIndex: "estimate_amount",
            key: "estimate_amount",
            align: 'right',
            width: 140,
            render: val => <span style={{ fontWeight: 600 }}>₹{parseFloat(val || 0).toFixed(2)}</span>
        },
        {
            title: "Approved Amount",
            dataIndex: "approved_amount",
            key: "approved_amount",
            align: 'right',
            width: 140,
            render: val => <span style={{ fontWeight: 700, color: '#16a34a' }}>₹{parseFloat(val || 0).toFixed(2)}</span>
        },
        {
            title: "Claim Date",
            dataIndex: "claim_date",
            key: "claim_date",
            width: 120,
            render: date => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: "Approved On",
            dataIndex: "approved_date",
            key: "approved_date",
            width: 120,
            render: date => date ? dayjs(date).format("DD/MM/YYYY") : "-"
        },
        {
            title: "IP No / SL No",
            key: "ip_no",
            width: 150,
            render: (text, record) => (
                <div style={{ fontSize: '0.85rem' }}>
                    {record.ip_number}
                </div>
            )
        },
        {
            title: "Admission Date",
            key: "admission_date",
            width: 140,
            render: (text, record) => record.admission_details?.admissionDateTime ? dayjs(record.admission_details.admissionDateTime).format("DD/MM/YYYY") : "-"
        },
        {
            title: "Patient Ward",
            dataIndex: "patient_ward",
            key: "patient_ward",
            width: 130,
        },
        {
            title: "Action",
            key: "action",
            fixed: 'right',
            width: 150,
            render: (text, record) => (
                <Space>
                    <Button 
                        size="small" 
                        icon={<FaEdit />} 
                        onClick={() => handleEdit(record)}
                        style={{ color: '#0284c7' }}
                    />
                    <Button 
                        size="small" 
                        icon={<FaPrint />} 
                        onClick={() => handlePrint(record)}
                        style={{ color: '#64748b' }}
                    />
                    <Button 
                        size="small" 
                        danger 
                        icon={<FaTrash />} 
                        onClick={() => handleDelete(record.claim_id)}
                    />
                </Space>
            )
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
                        <Col span={4}>
                            <FormLabel>From Date</FormLabel>
                            <DatePicker 
                                style={{ width: '100%' }} 
                                value={fromDate} 
                                onChange={setFromDate}
                                format="DD/MM/YYYY"
                            />
                        </Col>
                        <Col span={4}>
                            <FormLabel>To Date</FormLabel>
                            <DatePicker 
                                style={{ width: '100%' }} 
                                value={toDate} 
                                onChange={setToDate}
                                format="DD/MM/YYYY"
                            />
                        </Col>
                        <Col span={3}>
                            <ActionButton 
                                type="primary" 
                                icon={<FaSearch />} 
                                onClick={fetchClaims}
                                loading={loading}
                                style={{ width: '100%' }}
                            >
                                Fetch
                            </ActionButton>
                        </Col>
                        <Col span={7} style={{ textAlign: 'right' }}>
                            <ActionButton 
                                style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#fff', marginLeft: 'auto' }}
                                icon={<FaPlus />}
                                onClick={() => {
                                    resetForm();
                                    setShowForm(!showForm);
                                }}
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
                                            <FormLabel>Estimate Amount</FormLabel>
                                            <Input 
                                                type="number" 
                                                prefix="₹"
                                                value={formData.estimate_amount} 
                                                onChange={e => setFormData({...formData, estimate_amount: e.target.value})}
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
                                            <FormLabel>Insurance ID</FormLabel>
                                            <Input 
                                                placeholder="ID"
                                                value={formData.insurance_id} 
                                                onChange={e => setFormData({...formData, insurance_id: e.target.value})}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <FormLabel>Policy Number</FormLabel>
                                            <Input 
                                                placeholder="Policy No"
                                                value={formData.policy_no} 
                                                onChange={e => setFormData({...formData, policy_no: e.target.value})}
                                            />
                                        </Col>

                                        <Col span={12}>
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
                                                    icon={formData.claim_id ? <FaEdit /> : <FaSave />} 
                                                    onClick={handleSaveClaim}
                                                >
                                                    {formData.claim_id ? "Update Claim" : "Generate & Save Claim"}
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

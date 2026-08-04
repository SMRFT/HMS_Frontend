import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Table, Modal, Button as AntButton, Select, Card, Statistic, Tag, ConfigProvider, Checkbox } from 'antd';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import apiRequest from '../../Auth/apiRequest';
import * as S from '../GlobalStyles';

const CalendarGlobalStyles = createGlobalStyle`
    .ant-picker-dropdown {
        z-index: 10000 !important;
    }
    .ant-picker-header {
        display: flex !important;
        align-items: center;
        background: #0d9488 !important;
        padding: 8px 12px !important;
        border-bottom: 1px solid rgba(255,255,255,0.2) !important;
    }
    .ant-picker-header button,
    .ant-picker-header-view,
    .ant-picker-header-view button {
        color: #ffffff !important;
        font-weight: 600 !important;
    }
    .ant-picker-header button:hover,
    .ant-picker-header-view button:hover {
        color: #ccfbf1 !important;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin: 20px 22px;
`;

const StatsCard = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid ${S.colors.border};
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${S.colors.primary};
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .label {
        font-size: 0.8rem;
        color: ${S.colors.textMuted};
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }

    .value {
        font-size: 1.6rem;
        font-weight: 700;
        color: ${S.colors.textMain};
    }

    .sub-value {
        font-size: 0.75rem;
        color: ${S.colors.textMuted};
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  background: ${props => props.type === 'SUCCESS' ? '#f0fdf4' : '#fff1f2'};
  color: ${props => props.type === 'SUCCESS' ? '#16a34a' : '#e11d48'};
  border: 1px solid ${props => props.type === 'SUCCESS' ? '#bbf7d0' : '#fecdd3'};
`;

const ActionSquare = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1.1rem;
  transition: all 0.2s;
  background: ${props => props.bg || S.colors.primary};
  &:hover { opacity: 0.8; transform: translateY(-1px); }
  &:disabled { background: #e2e8f0; cursor: not-allowed; }
`;

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const StoresApprovalManager = () => {
    const navigate = useNavigate();
    const [intents, setIntents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        from_date: new Date().toISOString().split('T')[0],
        to_date: new Date().toISOString().split('T')[0]
    });

    const [showModal, setShowModal] = useState(false);
    const [selectedIntent, setSelectedIntent] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [approvalItems, setApprovalItems] = useState([]);

    useEffect(() => { 
        loadPendingIntents(); 
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/department-master/`, "GET");
        if (res.success) setDepartments(res.data || []);
    };

    const loadPendingIntents = async () => {
        setLoading(true);
        const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/`, "POST", filter);
        if (res.success) setIntents(res.data || []);
        setLoading(false);
    };

    const handleDelete = async (intent_id) => {
        if (window.confirm(`Are you sure you want to DELETE Intent ${intent_id}?`)) {
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/delete/${intent_id}/`, "DELETE");
            if (res.success) {
                toast.success("Intent deleted successfully");
                loadPendingIntents();
            } else {
                toast.error("Error deleting intent");
            }
        }
    };

    const getIntentStatus = (intent) => {
        if (intent.items && intent.items.some(it => it.status === 'Rejected')) return 'Rejected';
        if (intent.is_approved) return 'Approved';
        if (intent.items && intent.items.some(it => it.status === 'Approved')) return 'Partially Approved';
        return 'Pending';
    };

    const handleReject = async (intent) => {
        if (window.confirm(`Are you sure you want to REJECT Intent ${intent.intent_id}? This will mark all items as rejected.`)) {
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/update/${intent.intent_id}/`, "PATCH", {
                items: intent.items.map(it => ({
                    ...it,
                    status: 'Rejected',
                    approval: { approved: false, rejected_at: new Date(), rejected_by: 'Admin' }
                })),
                is_approved: false
            });
            if (res.success) {
                toast.success("Intent rejected successfully");
                loadPendingIntents();
            } else {
                toast.error("Error rejecting intent");
            }
        }
    };

    // --- PRINT FUNCTION ---
    const handlePrint = (intent) => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = intent.items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.hsn || '-'}</td>
                <td>${item.quantity}</td>
                <td>${item.approved_quantity || '0'}</td>
                <td>${item.status}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Intent Report - ${intent.intent_id}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px; }
                        .hospital-name { font-size: 24px; font-weight: 800; color: #0d9488; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 30px; line-height: 1.6; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #f8fafc; text-align: left; padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
                        td { padding: 12px; border: 1px solid #e2e8f0; font-size: 13px; }
                        .footer { margin-top: 50px; display: flex; justify-content: space-between; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
                        <div>51/24. Saradha College Road, Salem - 636007</div>
                    </div>
                    <h3>STORES INTENT REPORT</h3>
                    <div class="info-grid">
                        <div><strong>Intent No:</strong> ${intent.intent_id}</div>
                        <div><strong>Date:</strong> ${new Date(intent.date).toLocaleDateString()}</div>
                        <div><strong>Department:</strong> ${intent.department_name}</div>
                        <div><strong>Status:</strong> ${intent.is_approved ? 'Verified' : 'Pending'}</div>
                    </div>
                    <table>
                        <thead>
                            <tr><th>SL</th><th>Product Name</th><th>HSN</th><th>Req Qty</th><th>Apprv Qty</th><th>Status</th></tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                    <div class="footer">
                        <div>Prepared By</div>
                        <div>Verified By</div>
                        <div>Authorized Signatory</div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const openApprovalModal = (intent) => {
        setSelectedIntent(intent);
        setApprovalItems(intent.items.map(it => ({
            ...it,
            original_approved_qty: Number(it.approved_quantity || 0),
            new_approval_qty: 0 
        })));
        setShowModal(true);
    };

    const handleExportExcel = () => {
        if (intents.length === 0) return toast.info("No data to export");
        
        const flattenedData = [];
        intents.forEach(intent => {
            intent.items.forEach(item => {
                flattenedData.push({
                    'Date': dayjs(intent.date).format('DD/MM/YYYY'),
                    'Intent ID': intent.intent_id,
                    'Department': intent.department_name,
                    'Item Name': item.name,
                    'Requested Qty': item.quantity,
                    'Approved Qty': item.approved_quantity,
                    'Status': item.status
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(flattenedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Approval Report");

        // Column widths
        const wscols = [
            {wch: 15}, {wch: 20}, {wch: 25}, {wch: 35}, {wch: 15}, {wch: 15}, {wch: 15}
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Store_Approval_Report_${dayjs().format('DDMMYYYY')}.xlsx`);
    };

    const submitFinalApproval = async () => {
        setLoading(true);
        
        const finalItems = approvalItems.map(it => {
            if (Number(it.new_approval_qty) === 0) return it;

            const totalApproved = Number(it.original_approved_qty) + Number(it.new_approval_qty);
            const currentApprovals = it.approval?.approvals || [];
            
            // If it's the old single-object format, convert it to array format
            if (it.approval?.approved_at && currentApprovals.length === 0) {
                currentApprovals.push({
                    approved_at: it.approval.approved_at,
                    approved_by: it.approval.approved_by || 'System',
                    quantity: it.original_approved_qty
                });
            }

            const newHistoryEntry = {
                approved_at: new Date(),
                approved_by: 'Admin',
                quantity: Number(it.new_approval_qty)
            };

            return {
                ...it,
                approved_quantity: totalApproved,
                status: 'Approved',
                approval: {
                    approved: true,
                    approvals: [...currentApprovals, newHistoryEntry]
                }
            };
        });

        // If all items are approved with full quantity, we can mark the whole intent as approved
        const allApproved = finalItems.every(it => Number(it.approved_quantity) === Number(it.quantity));

        const payload = {
            items: finalItems,
            is_approved: allApproved 
        };

        // --- LAB DEPARTMENT BRANCH ---
        // DEPT002 items go into the LabApprovedItem model instead of (in addition to)
        // the normal stores-intent item update.
        if (selectedIntent.department === "DEPT002") {
            const labItemsPayload = finalItems
                .filter(it => Number(it.new_approval_qty) > 0)
                .map(it => ({
                    item_id: it.item_id,
                    name: it.name,
                    hsn: it.hsn,
                    quantity: Number(it.quantity),
                    used_qty: null
                }));

            if (labItemsPayload.length === 0) {
                toast.warning("No approved quantity entered for any item");
                setLoading(false);
                return;
            }

            console.log("Submitting Lab Approved Items Payload:", labItemsPayload);

            const labRes = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/lab-approved-items/create/`, "POST", { items: labItemsPayload });

            if (!labRes.success) {
                toast.error(labRes.error || "Failed to save Lab Approved Items.");
                setLoading(false);
                return;
            }

            // Keep the intent record itself in sync so it drops out of "Pending"
            // in this same list. Remove this block if the intent should stay
            // untouched for lab items.
            const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/update/${selectedIntent.intent_id}/`, "PATCH", payload);
            if (res.success) {
                toast.success("Items verified and stored in Lab Approved Items");
                setShowModal(false);
                loadPendingIntents();
            } else {
                toast.error(res.error || "Lab items saved, but failed to update intent status.");
            }
            setLoading(false);
            return;
        }

        // --- EXISTING FLOW (all other departments) ---
        console.log("Submitting Approval Payload:", payload);

        const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/update/${selectedIntent.intent_id}/`, "PATCH", payload);
        
        console.log("Approval Response:", res);

        if (res.success) {
            toast.success("Intent processed successfully");
            setShowModal(false);
            loadPendingIntents();
        } else {
            toast.error(res.error || "Failed to process intent. Check console.");
        }
        setLoading(false);
    };

    return (
        <S.PageWrapper>
            <CalendarGlobalStyles />
            <S.Container style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
                {/* Header Section */}
                <div style={{
                    background: '#ffffff',
                    padding: '24px 40px',
                    borderBottom: `2px solid ${S.colors.primary}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700', color: S.colors.textMain }}>Stores Intent Approval</h1>
                        <p style={{ margin: '4px 0 0', color: S.colors.textMuted, fontSize: '0.9rem' }}>Verify and manage inter-departmental store requests</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <S.Button 
                            secondary 
                            onClick={handleExportExcel}
                            style={{ 
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >📊 Export Excel</S.Button>
                        <S.Button 
                            onClick={() => navigate('/StoresIntent')}
                            style={{ 
                                background: S.colors.primary,
                                color: 'white', 
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontWeight: '600'
                            }}
                        >+ New Intent</S.Button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <StatsGrid>
                    <StatsCard>
                        <div className="label">Total Intents</div>
                        <div className="value">{intents.length}</div>
                        <div className="sub-value">Current Period</div>
                    </StatsCard>
                    <StatsCard>
                        <div className="label">Pending Review</div>
                        <div className="value" style={{ color: '#f59e0b' }}>
                            {intents.filter(i => !i.is_approved).length}
                        </div>
                        <div className="sub-value">Needs Verification</div>
                    </StatsCard>
                    <StatsCard>
                        <div className="label">Approved Requests</div>
                        <div className="value" style={{ color: '#10b981' }}>
                            {intents.filter(i => i.is_approved).length}
                        </div>
                        <div className="sub-value" style={{ color: '#0d9488' }}>🛡️ Verified Records</div>
                    </StatsCard>
                </StatsGrid>

                {/* Filter Section */}
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#1e3a8a',
                            borderRadius: 12,
                            colorLink: '#1e3a8a',
                            colorLinkHover: '#2563eb',
                        },
                        components: {
                            DatePicker: {
                                headerBg: '#1e3a8a',
                                headerColor: '#ffffff',
                                colorIcon: '#ffffff',
                                colorTextHeading: '#ffffff',
                                colorPrimary: '#1e3a8a',
                            }
                        }
                    }}
                >
                    <div style={{
                        background: 'white', 
                        margin: '20px 22px 0', 
                        padding: '24px', 
                        borderRadius: '16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: `1px solid ${S.colors.border}`
                    }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <S.Label style={{ margin: 0 }}>From</S.Label>
                                <DatePicker 
                                    value={filter.from_date ? dayjs(filter.from_date) : null}
                                    onChange={(d) => setFilter({...filter, from_date: d ? d.format('YYYY-MM-DD') : ''})}
                                    format="DD/MM/YYYY"
                                    style={{ height: '38px', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <S.Label style={{ margin: 0 }}>To</S.Label>
                                <DatePicker 
                                    value={filter.to_date ? dayjs(filter.to_date) : null}
                                    onChange={(d) => setFilter({...filter, to_date: d ? d.format('YYYY-MM-DD') : ''})}
                                    format="DD/MM/YYYY"
                                    style={{ height: '38px', borderRadius: '8px' }}
                                />
                            </div>
                            <S.Button onClick={loadPendingIntents} style={{ background: '#0d9488', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }}>🔍 Search</S.Button>
                            <S.Button 
                                onClick={async () => {
                                    setLoading(true);
                                    const res = await apiRequest(`${Hmsbaseurl.replace(/\/$/, '')}/stores-intent/`, "POST", {});
                                    if (res.success) {
                                        const filtered = (res.data || []).filter(intent => {
                                            const status = getIntentStatus(intent);
                                            return status === 'Pending' || status === 'Partially Approved';
                                        });
                                        setIntents(filtered);
                                        toast.info(`Found ${filtered.length} pending/partially approved intents`);
                                    }
                                    setLoading(false);
                                }} 
                                style={{ background: '#f59e0b', color: 'white', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }}
                            >
                                ⏳ Pending Actions
                            </S.Button>
                            <S.Button secondary style={{ background: '#64748b', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }} onClick={() => loadPendingIntents()}>✕ Clear</S.Button>
                            <S.Button secondary onClick={handleExportExcel} style={{ background: '#f8fafc', color: '#0d9488', border: '1px solid #0d9488', padding: '10px 25px', borderRadius: '8px', fontWeight: '600' }}>
                                📥 Export Excel
                            </S.Button>
                        </div>
                    </div>
                </ConfigProvider>

                {/* Table Section */}
                <S.TableWrapper style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${S.colors.border}`, margin: '20px 22px' }}>
                    <S.Table>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <S.Th style={{ padding: '15px' }}>Intent Details</S.Th>
                                <S.Th>Department</S.Th>
                                <S.Th>Items Summary</S.Th>
                                <S.Th>Status</S.Th>
                                <S.Th style={{ textAlign: 'center' }}>Actions</S.Th>
                            </tr>
                        </thead>
                        <tbody>
                            {intents.map((item) => (
                                <S.Tr key={item.intent_id}>
                                    <S.Td style={{ padding: '15px' }}>
                                        <div style={{ color: S.colors.primary, fontWeight: '800', fontSize: '0.95rem' }}>{item.intent_id}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{new Date(item.date).toLocaleDateString()}</div>
                                    </S.Td>
                                    <S.Td style={{ fontWeight: '700', color: '#334155' }}>
                                        {item.department_name || departments.find(d => d.department_id === item.department)?.department_name || item.department}
                                    </S.Td>
                                    <S.Td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            {item.items.map((it, idx) => (
                                                <div key={idx} style={{ 
                                                    padding: '4px 0', 
                                                    borderBottom: idx === item.items.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                    color: '#334155'
                                                }}>
                                                    <span style={{ fontWeight: '600' }}>{it.name}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                                                        ({it.quantity} Req {it.approved_quantity > 0 ? `| ${it.approved_quantity} Apprv` : ''})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </S.Td>
                                    <S.Td>
                                        <Badge 
                                            type={
                                                getIntentStatus(item) === 'Approved' ? 'SUCCESS' : 
                                                (getIntentStatus(item) === 'Rejected' ? 'DANGER' : 'WARNING')
                                            }
                                            style={
                                                getIntentStatus(item) === 'Approved' ? {} : 
                                                (getIntentStatus(item) === 'Rejected' ? {} : 
                                                (getIntentStatus(item) === 'Partially Approved' ? {background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe'} :
                                                {background: '#fffbeb', color: '#b45309', borderColor: '#fef3c7'}))
                                            }
                                        >
                                            {getIntentStatus(item)}
                                        </Badge>
                                    </S.Td>
                                    <S.Td>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <ActionSquare 
                                                bg="#10b981" 
                                                title="Approve" 
                                                disabled={getIntentStatus(item) === 'Rejected'}
                                                onClick={() => openApprovalModal(item)}
                                            >✔</ActionSquare>
                                            <ActionSquare bg="#3b82f6" title="Print" onClick={() => handlePrint(item)}>⎙</ActionSquare>
                                            <ActionSquare 
                                                bg="#ef4444" 
                                                title="Reject" 
                                                disabled={getIntentStatus(item) !== 'Pending'}
                                                onClick={() => handleReject(item)}
                                            >✖</ActionSquare>
                                            <ActionSquare bg="#64748b" title="Delete" onClick={() => handleDelete(item.intent_id)}>🗑</ActionSquare>
                                        </div>
                                    </S.Td>
                                </S.Tr>
                            ))}
                        </tbody>
                    </S.Table>
                </S.TableWrapper>

                {showModal && (
                    <S.ModalOverlay>
                        <S.ModalContainer style={{maxWidth: '800px'}}>
                            <S.ModalHeader style={{background: S.colors.primary, color: '#fff'}}>
                                <S.ModalTitle style={{color: '#fff'}}>Approve Intent: {selectedIntent?.intent_id}</S.ModalTitle>
                                <S.CloseButton style={{color: '#fff'}} onClick={() => setShowModal(false)}>&times;</S.CloseButton>
                            </S.ModalHeader>
                            <S.ModalBody>
                                <S.TableWrapper>
                                    <S.Table>
                                                <thead>
                                                    <tr>
                                                        <S.Th width="50">
                                                            <Checkbox 
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    const copy = approvalItems.map(it => {
                                                                        const isFullyApproved = Number(it.original_approved_qty) >= Number(it.quantity);
                                                                        if (isFullyApproved) return it;
                                                                        return {
                                                                            ...it,
                                                                            new_approval_qty: checked ? (Number(it.quantity) - Number(it.original_approved_qty)) : 0
                                                                        };
                                                                    });
                                                                    setApprovalItems(copy);
                                                                }}
                                                                checked={
                                                                    approvalItems.length > 0 && 
                                                                    approvalItems.filter(it => Number(it.original_approved_qty) < Number(it.quantity))
                                                                                 .every(it => it.new_approval_qty === (Number(it.quantity) - Number(it.original_approved_qty)))
                                                                }
                                                            />
                                                        </S.Th>
                                                        <S.Th>Available Qty</S.Th>
                                                        <S.Th>Item</S.Th>
                                                        <S.Th>Request</S.Th>
                                                        <S.Th>Already Apprv</S.Th>
                                                        <S.Th>Currently Apprv</S.Th>
                                                        <S.Th>Total Apprv</S.Th>
                                                    </tr>
                                                </thead>
                                        <tbody>
                                            {approvalItems.map((it, idx) => (
                                                <S.Tr key={idx}>
                                                    <S.Td>
                                                        <Checkbox 
                                                            disabled={Number(it.original_approved_qty) >= Number(it.quantity)}
                                                            checked={
                                                                Number(it.original_approved_qty) >= Number(it.quantity) ||
                                                                it.new_approval_qty === (Number(it.quantity) - Number(it.original_approved_qty))
                                                            }
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                const copy = [...approvalItems];
                                                                copy[idx].new_approval_qty = checked ? (Number(it.quantity) - Number(it.original_approved_qty)) : 0;
                                                                setApprovalItems(copy);
                                                            }}
                                                        />
                                                    </S.Td>
                                                    <S.Td>{it.available_stock}</S.Td>
                                                    <S.Td style={{fontWeight: '700'}}>{it.name}</S.Td>
                                                    <S.Td>{it.quantity}</S.Td>
                                                    <S.Td style={{color: '#64748b'}}>{it.original_approved_qty}</S.Td>
                                                    <S.Td>
                                                        <S.Input 
                                                            type="number" 
                                                            min="0"
                                                            disabled={Number(it.original_approved_qty) >= Number(it.quantity)}
                                                            max={Number(it.quantity) - Number(it.original_approved_qty)}
                                                            value={it.new_approval_qty} 
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                const remaining = Number(it.quantity) - Number(it.original_approved_qty);
                                                                if (val > remaining) {
                                                                    toast.warning(`Cannot exceed remaining quantity (${remaining})`);
                                                                    return;
                                                                }
                                                                if (val < 0) return;
                                                                const copy = [...approvalItems];
                                                                copy[idx].new_approval_qty = val;
                                                                setApprovalItems(copy);
                                                            }} 
                                                        />
                                                    </S.Td>
                                                    <S.Td style={{fontWeight: '800', color: S.colors.primary}}>
                                                        {Number(it.original_approved_qty) + Number(it.new_approval_qty)}
                                                    </S.Td>
                                                </S.Tr>
                                            ))}
                                        </tbody>
                                    </S.Table>
                                </S.TableWrapper>
                                <S.ButtonContainer>
                                    <S.Button onClick={submitFinalApproval} style={{width: '100%', padding: '12px', fontSize: '1rem'}}>Verify & Approve Intent</S.Button>
                                </S.ButtonContainer>
                            </S.ModalBody>
                        </S.ModalContainer>
                    </S.ModalOverlay>
                )}
            </S.Container>
        </S.PageWrapper>
    );
};

export default StoresApprovalManager;
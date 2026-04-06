import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Plus, Edit, Search, Save, X, Trash2, Loader, Eye, Printer, FileText } from 'lucide-react';

import apiRequest from '../../Auth/apiRequest'; 

import {PageWrapper, Container, ModalHeader, ModalTitle, Button, FormContent, ControlsContainer, InputWrapper, Input, SearchContainer, TableWrapper, Table, Tr, Th, Td, ModalOverlay, ModalBody, FormRow, Label, CloseButton, ButtonContainer} from '../GlobalStyles';
import * as S from '../GlobalStyles';

const baseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:2609/_b_a_c_k_e_n_d/HMS/";

const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
  width: 100%;
`;

const FormGrid = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const FlexCol = styled.div`
  flex: ${props => props.flex || 1};
  min-width: ${props => props.minW || '140px'};
`;

const RecycleManagement = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters (Default: Last 30 days)
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [filters, setFilters] = useState({
        from_date: thirtyDaysAgo,
        to_date: today,
        search_id: ''
    });

    const initialForm = {
        date: today,
        items: [],
        total_amount: 0
    };
    
    const [formData, setFormData] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // View Modal State
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedViewAsset, setSelectedViewAsset] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        const query = `?from_date=${filters.from_date}&to_date=${filters.to_date}`;
        const res = await apiRequest(`${baseurl}recycle_asset/${query}`);
        if (res.success) {
            setAssets(Array.isArray(res.data) ? res.data : []);
        } else {
            setAssets([]);
        }
        setLoading(false);
    }, [filters.from_date, filters.to_date]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleUniversalSearch = async () => {
        if (!filters.search_id) return fetchAssets();
        // Since filtering by ID might not be directly supported yet via GET query strings except if we fetch all and find,
        // let's just fetch all within date range and filter on frontend for universal search
        const filtered = assets.filter(a => String(a.asset_id).toLowerCase().includes(filters.search_id.toLowerCase()));
        if (filtered.length > 0) {
            setAssets(filtered);
        } else {
            toast.info("No matching recycle record found.");
        }
    };

    const handleEditForm = async (asset) => {
        setIsEditing(true);
        setCurrentId(asset.asset_id);
        setShowForm(true);
        setFormData({
            // asset_name: asset.asset_name || '',
            date: asset.date || today,
            items: asset.items || [],
            total_amount: asset.total_amount || 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData(initialForm);
        setShowForm(false);
    };

    // Calculate total amount automatically when items change
    useEffect(() => {
        const total = formData.items.reduce((acc, curr) => {
            return acc + (parseFloat(curr.total) || 0);
        }, 0);
        setFormData(prev => ({ ...prev, total_amount: total.toFixed(2) }));
    }, [formData.items]);

    const handleSave = async () => {
        if (formData.items.length === 0) return toast.warning("Please add at least one item to recycle.");

        const method = isEditing ? 'PATCH' : 'POST';
        const url = isEditing 
            ? `${baseurl}recycle_asset/${encodeURIComponent(currentId)}/` 
            : `${baseurl}recycle_asset/`;
        
        setFormLoading(true);
        const res = await apiRequest(url, method, formData);
        
        if (res.success) {
            toast.success(isEditing ? "Updated Successfully" : "Created Successfully");
            handleCancelForm();
            fetchAssets();
        } else {
            toast.error(res.error || "Failed to save data");
        }
        setFormLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        const res = await apiRequest(`${baseurl}recycle_asset/${encodeURIComponent(id)}/`, 'PATCH', { is_active: false });
        if (res.success) {
            toast.success("Deleted successfully");
            fetchAssets();
        } else {
            toast.error("Failed to delete");
        }
    };

    const handleExportCSV = () => {
        let csvContent = "Record ID,Date,Items & Price,Total Amount\n";
        const grandTotal = assets.reduce((sum, asset) => sum + (parseFloat(asset.total_amount) || 0), 0);
        assets.forEach(asset => {
            const id = asset.asset_id;
            const date = asset.date;
            const total = asset.total_amount;
            
            let itemsStr = "";
            if (asset.items && asset.items.length > 0) {
                itemsStr = asset.items.map(item => `${item.item_name} (${item.unit}kg) - Rs.${item.total}`).join(" | ");
            } else {
                itemsStr = "No items";
            }
            itemsStr = `"${itemsStr.replace(/"/g, '""')}"`;
            csvContent += `${id},${date},${itemsStr},${total}\n`;
        });
        // Add Grand Total Row
        csvContent += `\n,,"GRAND TOTAL",${grandTotal.toFixed(2)}\n`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Recycle_Records_${filters.from_date}_to_${filters.to_date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintTable = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        const grandTotal = assets.reduce((sum, asset) => sum + (parseFloat(asset.total_amount) || 0), 0);
        const rows = assets.map(asset => {
            const itemsStr = asset.items ? asset.items.map(item => `${item.item_name} (${item.unit}kg) - Rs.${item.total}`).join("<br/>") : "No items";
            return `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${asset.asset_id}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${asset.date}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${itemsStr}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">Rs.${asset.total_amount}</td>
                </tr>
            `;
        }).join("");

        printWindow.document.write(`
            <html>
            <head>
                <title>Recycle Records</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f8fafc; border: 1px solid #ddd; padding: 10px; text-align: left; }
                    h2 { text-align: center; color: #0f172a; }
                </style>
            </head>
            <body>
                <h2>Recycled Assets Report (${filters.from_date} to ${filters.to_date})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Record ID</th>
                            <th>Date</th>
                            <th>Items & Price</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                    <tfoot> 
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right; padding: 10px;">GRAND TOTAL:</td>
                        <td style="padding: 10px;">Rs. ${grandTotal.toFixed(2)}</td>
                    </tr>
                </tfoot>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <PageWrapper>
            <Container>
                <ModalHeader $bg="white" style={{ borderBottom: 'none' }}>
                    <ModalTitle>Recycle Management</ModalTitle>
                    <Button onClick={() => {
                        if (showForm) {
                            handleCancelForm();
                        } else {
                            setShowForm(true);
                        }
                    }}>
                        {showForm ? <><X size={18} style={{marginRight: 4}}/> Close Form</> : <><Plus size={18} style={{marginRight: 4}}/> New Record</>}
                    </Button>
                </ModalHeader>

                <FormContent style={{ paddingTop: 0 }}>
                    {/* INLINE FORM */}
                    {showForm && (
                    <FormGrid>
                        {formLoading ? <div style={{textAlign:'center', padding:'20px'}}><Loader className="animate-spin"/></div> : (
                            <>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b' }}>
                                    {isEditing ? `Edit Recycle Record: ${currentId}` : 'Register New Recycle Record'}
                                </h3>
                                <FlexRow>

                                    <FlexCol flex={1}>
                                        <InputWrapper>
                                            <Label>Date</Label>
                                            <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                                        </InputWrapper>
                                    </FlexCol>
                                </FlexRow>

                                <Divider style={{ margin: '15px 0' }} />

                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                                    <h4 style={{fontSize: '14px', fontWeight: '600', margin: 0}}>Recycle Items List</h4>
                                    <Button style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => {
                                        const updated = [...formData.items, { item_name: '', unit: 1, price_per_unit: 0, total: 0 }];
                                        setFormData({...formData, items: updated});
                                    }}>
                                        <Plus size={14}/> Add Item
                                    </Button>
                                </div>

                                {formData.items && formData.items.map((item, idx) => (
                                    <FormRow key={idx} style={{background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px'}}>
                                        <InputWrapper style={{ flex: 1.5 }}>
                                            <Label>Item Description</Label>
                                            <Input placeholder="Enter what is being recycled..." value={item.item_name} onChange={e => {
                                                const updated = [...formData.items];
                                                updated[idx].item_name = e.target.value;
                                                setFormData({...formData, items: updated});
                                            }} />
                                        </InputWrapper>
                                        <InputWrapper style={{ flex: 1 }}>
                                            <Label>Unit (Kg)</Label>
                                            <Input type="number" min="1" value={item.unit} onChange={e => {
                                                const updated = [...formData.items];
                                                updated[idx].unit = e.target.value;
                                                updated[idx].total = (parseFloat(e.target.value || 0) * parseFloat(updated[idx].price_per_unit || 0)).toFixed(2);
                                                setFormData({...formData, items: updated});
                                            }} />
                                        </InputWrapper>
                                        <InputWrapper style={{ flex: 1 }}>
                                            <Label>Price per Unit</Label>
                                            <Input type="number" step="0.01" value={item.price_per_unit} onChange={e => {
                                                const updated = [...formData.items];
                                                updated[idx].price_per_unit = e.target.value;
                                                updated[idx].total = (parseFloat(updated[idx].unit || 0) * parseFloat(e.target.value || 0)).toFixed(2);
                                                setFormData({...formData, items: updated});
                                            }} />
                                        </InputWrapper>
                                        <InputWrapper style={{ flex: 1 }}>
                                            <Label>Total Value</Label>
                                            <Input value={`₹${item.total || 0}`} disabled style={{ background: '#f1f5f9', fontWeight: 'bold' }} />
                                        </InputWrapper>
                                        <Button onClick={() => {
                                             const updated = formData.items.filter((_, i) => i !== idx);
                                             setFormData({...formData, items: updated});
                                        }} style={{background: '#fee2e2', color:'#ef4444', alignSelf:'flex-end'}}><Trash2 size={16}/></Button>
                                    </FormRow>
                                ))}

                                {formData.items.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "10px", color: "#64748b", fontStyle: "italic", fontSize: "0.9rem" }}>
                                        No items added yet. Click "Add Item" to list recycled assets.
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#16a34a' }}>Total Evaluated Amount: ₹{formData.total_amount}</h3>
                                </div>

                                <ButtonContainer style={{ marginTop: '15px', justifyContent: 'flex-end' }}>
                                    <Button secondary onClick={handleCancelForm}>
                                        <X size={16}/> Cancel
                                    </Button>
                                    <Button onClick={handleSave}>
                                        <Save size={16}/> {isEditing ? 'Save Changes' : 'Submit Record'}
                                    </Button>
                                </ButtonContainer>
                            </>
                        )}
                    </FormGrid>
                    )}

                    {/* TABLE CONTROLS */}
                    <ControlsContainer style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{display: 'flex', gap: '15px', alignItems: 'flex-end'}}>
                            <InputWrapper>
                                <Label>From Date</Label>
                                <Input type="date" value={filters.from_date} onChange={e => setFilters({...filters, from_date: e.target.value})} />
                            </InputWrapper>
                            <InputWrapper>
                                <Label>To Date</Label>
                                <Input type="date" value={filters.to_date} onChange={e => setFilters({...filters, to_date: e.target.value})} />
                            </InputWrapper>
                            <Button secondary onClick={fetchAssets}><Search size={16}/> Filter</Button>
                        </div>

                        <SearchContainer style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ display: 'flex' }}>
                                <InputWrapper>
                                    <Label>Search ID/Name</Label>
                                    <Input 
                                        placeholder="Enter Keyword..." 
                                        value={filters.search_id} 
                                        onChange={e => setFilters({...filters, search_id: e.target.value})}
                                        onKeyPress={(e) => e.key === 'Enter' && handleUniversalSearch()}
                                    />
                                </InputWrapper>
                                <Button onClick={handleUniversalSearch}><Search size={16}/></Button>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginLeft: 'auto' }}>
                                <Button success onClick={handleExportCSV} title="Export current table to CSV">
                                    <FileText size={16} style={{marginRight: '6px'}}/> Export CSV
                                </Button>
                                <Button secondary onClick={handlePrintTable} title="Print table format">
                                    <Printer size={16} style={{marginRight: '6px'}}/> Print Table
                                </Button>
                            </div>
                        </SearchContainer>
                    </ControlsContainer>

                    {/* DATA TABLE */}
                    <TableWrapper style={{ marginTop: '15px' }}>
                        {loading ? <div style={{textAlign:'center', padding:'20px'}}><Loader className="animate-spin"/></div> : (
                            <Table>
                                <thead>
                                    <Tr>
                                        <Th>Record ID</Th>
                                        <Th>Date</Th>
                                        <Th>Total Items</Th>
                                        <Th>Total Amount</Th>
                                        <Th style={{textAlign: 'right'}}>Actions</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {assets.map(asset => (
                                        <Tr key={asset.asset_id}>
                                            <Td><strong>{asset.asset_id}</strong></Td>
                                            <Td>{asset.date}</Td>
                                            <Td>{asset.items ? asset.items.length : 0} Items</Td>
                                            <Td>₹{asset.total_amount}</Td>
                                            <Td>
                                                <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center'}}>
                                                    <Button 
                                                        secondary 
                                                        onClick={() => {
                                                            setSelectedViewAsset(asset);
                                                            setShowViewModal(true);
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button success onClick={() => handleEditForm(asset)}><Edit size={14}/></Button>
                                                    <Button danger onClick={() => handleDelete(asset.asset_id)}><Trash2 size={14}/></Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
                                    {assets.length === 0 && (
                                        <Tr>
                                            <Td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                                                No records available
                                            </Td>
                                        </Tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                    </TableWrapper>
                </FormContent>
            </Container>

            {/* VIEW MODAL */}
            {showViewModal && selectedViewAsset && (
                <ModalOverlay>
                <S.ModalContainer style={{ maxWidth: '600px' }}>
                    <ModalHeader>
                        <ModalTitle>Recycle Details: {selectedViewAsset.asset_id}</ModalTitle>
                        <CloseButton onClick={() => setShowViewModal(false)}><X size={18} /></CloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                            <div>
                                <strong style={{color: '#64748b', fontSize: '13px', display: 'block'}}>Date Registered</strong>
                                <span style={{fontSize: '15px'}}>{selectedViewAsset.date}</span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <strong style={{color: '#64748b', fontSize: '13px', display: 'block'}}>Total Evaluated Amount</strong>
                                <span style={{fontSize: '18px', fontWeight: 600, color: '#16a34a'}}>₹{selectedViewAsset.total_amount}</span>
                            </div>
                        </div>

                        <Divider style={{ margin: '15px 0' }} />

                        <div>
                            <strong style={{color: '#64748b', fontSize: '13px', display: 'block', marginBottom: '10px'}}>Recycled Items</strong>
                            {(selectedViewAsset.items && selectedViewAsset.items.length > 0) ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedViewAsset.items.map((item, i) => (
                                        <li key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
                                            <div style={{display:'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                                                <strong style={{fontSize: '14px', color: '#0f172a'}}>{item.item_name}</strong>
                                                <span style={{fontSize: '13px', fontWeight: 600, color: '#0369a1'}}>₹{item.total}</span>
                                            </div>
                                            <p style={{fontSize: '13px', margin: 0, color: '#475569'}}>Units (Kg): {item.unit} &nbsp;|&nbsp; Rate: ₹{item.price_per_unit}/kg</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{fontSize: '14px', color: '#64748b', fontStyle: 'italic', margin: 0}}>No items logged.</p>
                            )}
                        </div>
                    </ModalBody>
                    <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 8px 8px' }}>
                        <ButtonContainer style={{ width: "100%", justifyContent: "flex-end", marginTop: 0 }}>
                            <Button secondary onClick={() => setShowViewModal(false)}>Close</Button>
                        </ButtonContainer>
                    </div>
                </S.ModalContainer>
                </ModalOverlay>
            )}
        </PageWrapper>
    );
};

export default RecycleManagement;

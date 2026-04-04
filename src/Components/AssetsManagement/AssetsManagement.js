import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import JsBarcode from "jsbarcode";
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Printer, 
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  FileDown,
  Calendar
} from "lucide-react";
import styled from "styled-components";
import {
  PageWrapper,
  Container,
  SectionHeader,
  ControlsContainer,
  SearchContainer,
  Input,
  Select,
  Button,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  FormContent,
  FormRow,
  InputWrapper,
  Label,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  CloseButton,
  TextArea,
  ButtonContainer,
  colors
} from "../GlobalStyles";

const StatusToggle = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.active ? colors.success : colors.danger};
  font-weight: 600;
  font-size: 0.82rem;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const ItemDropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ItemDropdownList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 999;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
`;

const ItemDropdownItem = styled.li`
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.85rem;
  color: ${colors.textMain};
  transition: background 0.15s;
  &:hover {
    background: ${colors.tabBg};
    color: ${colors.primary};
  }
`;

const BarcodeDisplay = ({ value }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 2,
          height: 35,
          displayValue: false,
          margin: 0,
          background: "transparent"
        });
      } catch (error) {
        console.error("Barcode generation error:", error);
      }
    }
  }, [value]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "30px", maxWidth: "100px" }}></svg>
      <span style={{ fontSize: "9px", fontWeight: "600", color: colors.textMuted, fontFamily: "monospace" }}>{value}</span>
    </div>
  );
};

const AssetsManagement = () => {
  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [itemMasters, setItemMasters] = useState([]);
  const [formData, setFormData] = useState({
    asset_name: "",
    date: new Date().toISOString().split("T")[0],
    department: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [isLoading, setIsLoading] = useState(false);

  // Date filter — default: last 1 month to today
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const [fromDate, setFromDate] = useState(oneMonthAgo.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);

  // Searchable item dropdown
  const [itemSearch, setItemSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const itemDropdownRef = useRef(null);

  // States for Deactivation
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [assetToDeactivate, setAssetToDeactivate] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState("");

  // States for Printing
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedAssetForPrint, setSelectedAssetForPrint] = useState(null);
  const printSectionRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:2609/_b_a_c_k_e_n_d/HMS/";

  useEffect(() => {
    fetchAssets();
    fetchDepartments();
    fetchItemMasters();
  }, []);

  // Re-fetch when date range changes
  useEffect(() => {
    fetchAssets();
  }, [fromDate, toDate]);

  // Close item dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target)) {
        setShowItemDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showPrintModal && selectedAssetForPrint && printSectionRef.current) {
        const svg = printSectionRef.current.querySelector('svg');
        if (svg) {
            JsBarcode(svg, selectedAssetForPrint.asset_id, {
                format: "CODE128",
                width: 2,
                height: 40,
                displayValue: false,
                margin: 0,
                background: "transparent"
            });
        }
    }
  }, [showPrintModal, selectedAssetForPrint]);

  const fetchAssets = async () => {
    try {
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const resp = await axios.get(`${backendUrl}stores-assets-management/`, { params });
      setAssets(resp.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const resp = await axios.get(`${backendUrl}department-master/`);
      setDepartments(resp.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchItemMasters = async () => {
    try {
      const resp = await axios.get(`${backendUrl}item-master/`);
      setItemMasters(resp.data);
    } catch (error) {
      console.error("Error fetching item masters:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asset_name || !formData.date || !formData.department) {
      toast.warning("Please fill all fields");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${backendUrl}stores-assets-management/`, formData);
      toast.success("Asset added successfully");
      setFormData({
        asset_name: "",
        date: new Date().toISOString().split("T")[0],
        department: "",
      });
      setItemSearch("");
      fetchAssets();
    } catch (error) {
      console.error("Error adding asset:", error);
      toast.error("Failed to add asset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowPrintModal(false);
    setSelectedAssetForPrint(null);
  };

  const handlePrintBarcodes = () => {
    if (!printSectionRef.current) return;

    setIsPrinting(true);

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";

    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;

    doc.open();
    doc.write(`
        <html>
            <head>
                <style>
                    @page {
                        size: 50mm 25mm;
                        margin: 0;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: flex-start;
                        align-items: flex-start;
                    }
                    .barcode-item {
                        width: 50mm;
                        height: 25mm;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        justify-content: flex-start;
                        text-align: left;
                        overflow: hidden;
                        page-break-before: always;
                        padding: 1mm;
                        box-sizing: border-box;
                    }
                    .barcode-text {
                        font-size: 10px;
                        margin: 0 0 1px 0;
                        white-space: nowrap;
                        text-align: left;
                        width: 100%;
                        font-weight: bold;
                    }
                    .barcode-date {
                        font-size: 7px;
                        margin: 0 0 1px 0;
                        text-align: left;
                        width: 100%;
                    }
                    .barcode-number {
                        font-size: 9px;
                        margin: 0;
                        text-align: left;
                        width: 100%;
                        font-weight: 500;
                    }
                    .container-name {
                        font-size: 8px;
                        font-weight: bold;
                        margin: 1px 0 0 0;
                        text-align: left;
                        width: 100%;
                        color: #333;
                    }
                    .barcode-container {
                        display: flex;
                        justify-content: flex-start;
                        align-items: left;
                        width: 100%;
                        margin: 1px 0;
                    }
                    svg {
                        width: 35mm !important;
                        height: 12mm !important;
                        align-self: flex-start;
                    }
                </style>
            </head>
            <body>
                ${printSectionRef.current.innerHTML}
            </body>
        </html >
    `);
    doc.close();

    iframe.contentWindow.onload = () => {
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
            setIsPrinting(false);
            handleCloseModal();
            toast.success("Barcodes sent to printer");
        }, 1000);
    };
  };

  const initiatePrint = (asset) => {
    setSelectedAssetForPrint(asset);
    setShowPrintModal(true);
  };

  const openDeactivateModal = (asset) => {
    setAssetToDeactivate(asset);
    setDeactivateReason("");
    setShowDeactivateModal(true);
  };

  const handleStatusToggle = async (asset) => {
    if (asset.is_active !== false) {
      // If currently active, open modal for reason
      openDeactivateModal(asset);
    } else {
      // If inactive, reactivate immediately
      if (window.confirm(`Are you sure you want to reactivate ${asset.asset_name}?`)) {
        try {
          await axios.patch(`${backendUrl}stores-assets-management/${asset.asset_id}/`, {
            is_active: true,
            deactivate_remarks: "" // Clear remarks on reactivation
          });
          toast.success("Asset reactivated");
          fetchAssets();
        } catch (error) {
          toast.error("Error reactivating asset");
        }
      }
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateReason.trim()) {
      toast.warning("Please provide a reason for deactivation");
      return;
    }

    try {
      await axios.patch(`${backendUrl}stores-assets-management/${assetToDeactivate.asset_id}/`, {
        is_active: false,
        deactivate_remarks: deactivateReason
      });
      toast.success("Asset deactivated");
      setShowDeactivateModal(false);
      fetchAssets();
    } catch (error) {
      toast.error("Error deactivating asset");
    }
  };

  const exportToExcel = () => {
    if (filteredAssets.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const exportData = filteredAssets.map((asset, idx) => ({
      "S.No": idx + 1,
      "Asset ID": asset.asset_id,
      "Asset Name": asset.asset_name,
      "Department": asset.department || "-",
      "Date": asset.date,
      "Status": asset.is_active === false ? "Inactive" : "Active",
      "Deactivated Date": asset.deactivated_date
        ? new Date(asset.deactivated_date).toLocaleDateString()
        : "-",
      "Deactivation Reason": asset.deactivate_remarks || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets");
    const fileName = `Assets_${fromDate}_to_${toDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Exported successfully!");
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "active") return matchesSearch && asset.is_active !== false;
    if (statusFilter === "inactive") return matchesSearch && asset.is_active === false;
    return matchesSearch;
  });

  return (
    <PageWrapper>
      <Container>
        <SectionHeader>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Package size={20} color={colors.primary} />
            <h3 style={{ margin: 0 }}>Asset Management</h3>
          </div>
        </SectionHeader>

        <FormContent>
          <SectionHeader style={{ borderBottom: "none", marginBottom: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={16} />
              <h3 style={{ fontSize: "0.85rem" }}>Add New Asset</h3>
            </div>
          </SectionHeader>
          
          <form onSubmit={handleSubmit}>
            <FormRow>
              <InputWrapper>
                <Label required>Asset Name</Label>
                <ItemDropdownWrapper ref={itemDropdownRef}>
                  <Input
                    placeholder="Search item..."
                    value={itemSearch}
                    onChange={(e) => {
                      setItemSearch(e.target.value);
                      setShowItemDropdown(true);
                      // Clear selection if user edits text
                      if (formData.asset_name && e.target.value !== formData.asset_name) {
                        setFormData(prev => ({ ...prev, asset_name: "" }));
                      }
                    }}
                    onFocus={() => setShowItemDropdown(true)}
                    style={{
                      borderColor: formData.asset_name ? colors.primary : undefined,
                      background: formData.asset_name ? colors.tabBg : undefined
                    }}
                    autoComplete="off"
                  />
                  {showItemDropdown && (
                    <ItemDropdownList>
                      {itemMasters
                        .filter(item =>
                          item.itemName?.toLowerCase().includes(itemSearch.toLowerCase())
                        )
                        .map(item => (
                          <ItemDropdownItem
                            key={item.item_id}
                            onMouseDown={() => {
                              setFormData(prev => ({ ...prev, asset_name: item.itemName }));
                              setItemSearch(item.itemName);
                              setShowItemDropdown(false);
                            }}
                          >
                            {item.itemName}
                          </ItemDropdownItem>
                        ))
                      }
                      {itemMasters.filter(item =>
                        item.itemName?.toLowerCase().includes(itemSearch.toLowerCase())
                      ).length === 0 && (
                        <ItemDropdownItem style={{ color: colors.textMuted, cursor: "default" }}>
                          No items found
                        </ItemDropdownItem>
                      )}
                    </ItemDropdownList>
                  )}
                </ItemDropdownWrapper>
                {/* Hidden required validator */}
                <input
                  type="text"
                  required
                  value={formData.asset_name}
                  onChange={() => {}}
                  style={{ display: "none" }}
                />
              </InputWrapper>
              
              <InputWrapper>
                <Label required>Department</Label>
                <Select 
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.department_id} value={dept.department_name}>
                      {dept.department_name}
                    </option>
                  ))}
                </Select>
              </InputWrapper>
              
              <InputWrapper>
                <Label required>Date</Label>
                <Input 
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
            </FormRow>
            <ButtonContainer style={{ border: "none", marginTop: "0", paddingTop: "0", justifyContent: "flex-end" }}>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Asset"}
              </Button>
            </ButtonContainer>
          </form>
        </FormContent>

        <div style={{ padding: "0 16px 16px" }}>
          <ControlsContainer style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", color: colors.textMain }}>Registered Assets</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Button 
                        style={{ padding: "4px 10px", fontSize: "0.75rem", background: statusFilter === 'all' ? colors.primary : colors.tabBg, color: statusFilter === 'all' ? 'white' : colors.textMain }}
                        onClick={() => setStatusFilter("all")}
                    >
                        All
                    </Button>
                    <Button 
                        style={{ padding: "4px 10px", fontSize: "0.75rem", background: statusFilter === 'active' ? colors.success : colors.tabBg, color: statusFilter === 'active' ? 'white' : colors.textMain }}
                        onClick={() => setStatusFilter("active")}
                    >
                        Active
                    </Button>
                    <Button 
                        style={{ padding: "4px 10px", fontSize: "0.75rem", background: statusFilter === 'inactive' ? colors.danger : colors.tabBg, color: statusFilter === 'inactive' ? 'white' : colors.textMain }}
                        onClick={() => setStatusFilter("inactive")}
                    >
                        Inactive
                    </Button>
                </div>
            </div>

            {/* Date Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Calendar size={15} color={colors.textMuted} />
              <span style={{ fontSize: "0.78rem", color: colors.textMuted, whiteSpace: "nowrap" }}>From</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: "140px", fontSize: "0.82rem", padding: "5px 8px" }}
              />
              <span style={{ fontSize: "0.78rem", color: colors.textMuted, whiteSpace: "nowrap" }}>To</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: "140px", fontSize: "0.82rem", padding: "5px 8px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
              <SearchContainer style={{ position: "relative" }}>
                <Input 
                  type="text" 
                  placeholder="Search assets..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "220px", paddingRight: "35px" }}
                />
                <Search size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: colors.textMuted }} />
              </SearchContainer>
              <Button
                onClick={exportToExcel}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", fontSize: "0.82rem", background: colors.success, color: "white", whiteSpace: "nowrap" }}
              >
                <FileDown size={15} />
                Export Excel
              </Button>
            </div>
          </ControlsContainer>

          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th>Asset ID</Th>
                  <Th>Asset Name</Th>
                  <Th>Department</Th>
                  <Th>Date</Th>
                  <Th>Barcode</Th>
                  <Th style={{ textAlign: "center" }}>Status</Th>
                  <Th style={{ textAlign: "right" }}>Actions</Th>
                </Tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <Tr key={asset.asset_id} style={{ opacity: asset.is_active === false ? 0.7 : 1, background: asset.is_active === false ? "#f8fafc" : "transparent" }}>
                      <Td style={{ fontWeight: "600", color: asset.is_active === false ? colors.textMuted : colors.primary }}>{asset.asset_id}</Td>
                      <Td>
                        <div style={{ textDecoration: asset.is_active === false ? "line-through" : "none" }}>{asset.asset_name}</div>
                        {asset.is_active === false && (
                          <div style={{ fontSize: "0.7rem", color: colors.danger, marginTop: "4px", fontStyle: "italic" }}>
                            {asset.deactivated_date && (
                              <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                                Deactivated: {new Date(asset.deactivated_date).toLocaleDateString()} {new Date(asset.deactivated_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            )}
                            {asset.deactivate_remarks && (
                              <div>Reason: {asset.deactivate_remarks}</div>
                            )}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <span style={{ 
                          padding: "3px 8px", 
                          background: colors.tabBg, 
                          borderRadius: "4px", 
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: colors.primaryDark
                        }}>
                          {asset.department}
                        </span>
                      </Td>
                      <Td>{asset.date}</Td>
                      <Td>
                        <BarcodeDisplay value={asset.asset_id} />
                      </Td>
                      <Td>
                         <div style={{ display: "flex", justifyContent: "center" }}>
                            <StatusToggle 
                              active={asset.is_active !== false} 
                              onClick={() => handleStatusToggle(asset)}
                              title={asset.is_active !== false ? "Click to Deactivate" : "Click to Reactivate"}
                            >
                              {asset.is_active !== false ? (
                                <>
                                  <ToggleRight size={24} />
                                  Active
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={24} />
                                  Deactive
                                </>
                              )}
                            </StatusToggle>
                         </div>
                      </Td>
                      <Td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <Button 
                            secondary 
                            style={{ padding: "6px" }} 
                            onClick={() => initiatePrint(asset)}
                            title="Print Barcode"
                          >
                            <Printer size={15} />
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan="7" style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                      No assets found
                    </Td>
                  </Tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </Container>

      {/* Deactivate Reason Modal */}
      {showDeactivateModal && (
        <ModalOverlay>
          <ModalContainer style={{ maxWidth: "450px" }}>
            <ModalHeader $bg={colors.danger + "20"}>
              <ModalTitle style={{ color: colors.danger, display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertCircle size={20} />
                Deactivate Asset
              </ModalTitle>
              <CloseButton onClick={() => setShowDeactivateModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <p style={{ fontSize: "0.9rem", color: colors.textMain, marginBottom: "15px" }}>
                Are you sure you want to deactivate <strong>{assetToDeactivate?.asset_name}</strong> ({assetToDeactivate?.asset_id})?
              </p>
              <InputWrapper>
                <Label required>Reason for Deactivation</Label>
                <TextArea 
                  placeholder="Enter reason..." 
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  style={{ minHeight: "100px" }}
                />
              </InputWrapper>
              <ButtonContainer>
                <Button danger onClick={handleDeactivate}>
                  Confirm Deactivation
                </Button>
                <Button secondary onClick={() => setShowDeactivateModal(false)}>
                  Cancel
                </Button>
              </ButtonContainer>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* Print Modal */}
      {showPrintModal && selectedAssetForPrint && (
        <ModalOverlay>
          <ModalContainer style={{ maxWidth: "400px" }}>
            <ModalHeader>
              <ModalTitle>Print Preview</ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <div 
                ref={printSectionRef} 
                style={{ 
                  border: `1px dashed ${colors.border}`, 
                  padding: "15px", 
                  marginBottom: "20px",
                  background: "#fff",
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <div className="barcode-item">
                  <div className="barcode-text">Shanmuga Hospital</div>
                  <div className="barcode-date">{selectedAssetForPrint.date}</div>
                  <div className="barcode-container">
                      <svg></svg>
                  </div>
                  <div className="barcode-number">{selectedAssetForPrint.asset_id}</div>
                  <div className="container-name">{selectedAssetForPrint.asset_name}</div>
                </div>
              </div>
              <ButtonContainer>
                <Button onClick={handlePrintBarcodes} disabled={isPrinting}>
                  {isPrinting ? "Printing..." : "Confirm Print"}
                </Button>
                <Button secondary onClick={handleCloseModal}>
                  Cancel
                </Button>
              </ButtonContainer>
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default AssetsManagement;

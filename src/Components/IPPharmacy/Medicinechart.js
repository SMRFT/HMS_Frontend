import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global Font ──────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
`;

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: 2000px; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Wrapper = styled.div`
  padding: 24px;
  font-family: 'DM Sans', sans-serif;
  background: #f0f4f8;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f766e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before {
    content: '💊';
    font-size: 1.2rem;
  }
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.18s;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const SpinIcon = styled.span`
  display: inline-block;
  animation: ${spin} 0.8s linear infinite;
`;

const TableCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 16px rgba(15, 118, 110, 0.08);
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.845rem;
`;

const Thead = styled.thead`
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
  color: #fff;
  th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }
`;

const PatientRow = styled.tr`
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#e6faf8" : "#fff")};
  border-bottom: 1px solid #e8f0ef;
  transition: background 0.15s;
  &:hover {
    background: #f0faf8;
  }
  td {
    padding: 11px 16px;
    color: #374151;
    font-size: 0.85rem;
    white-space: nowrap;
  }
`;

const UHIDCell = styled.td`
  font-family: 'DM Mono', monospace;
  font-size: 0.8rem !important;
  color: #0f766e !important;
  font-weight: 500;
`;

const PrintIcon = styled.td`
  color: #64748b;
  font-size: 1rem;
  text-align: center;
  width: 40px;
`;

const MedicinesBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: ${({ $active }) => ($active ? "#0f766e" : "linear-gradient(135deg,#e0f2f0,#ccfbf1)")};
  color: ${({ $active }) => ($active ? "#fff" : "#0f766e")};
  border: 1.5px solid #99f6e4;
  border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  &:hover {
    background: #0f766e;
    color: #fff;
  }
`;

// ─── Expandable medicine detail panel ────────────────────────────────────────
const DetailPanel = styled.tr`
  background: #f8fffe;
`;

const DetailCell = styled.td`
  padding: 0 !important;
  border-bottom: 3px solid #14b8a6;
`;

const DetailInner = styled.div`
  animation: ${slideDown} 0.3s ease;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 8px;
  background: linear-gradient(90deg, #e6faf8, #f0faf8);
  border-bottom: 1px solid #ccfbf1;
`;

const DetailTitle = styled.span`
  font-weight: 700;
  color: #0f766e;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PatientMeta = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const MetaBadge = styled.span`
  background: #ccfbf1;
  color: #0f766e;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.825rem;
  overflow: visible;
`;

const ItemThead = styled.thead`
  background: #f1faf9;
  th {
    padding: 9px 14px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.78rem;
    letter-spacing: 0.02em;
    border-bottom: 1.5px solid #d1fae5;
    white-space: nowrap;
  }
`;

const ItemRow = styled.tr`
  border-bottom: 1px solid #f0faf8;
  transition: background 0.12s;
  &:hover { background: #f0faf8; }
  td {
    padding: 9px 14px;
    color: #374151;
    vertical-align: middle;
  }
`;

const StatusDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  background: ${({ $type }) =>
    $type === "substitute"  ? "#3b82f6" :
    $type === "emergency"   ? "#ef4444" :
    $type === "insurance"   ? "#22c55e" :
    "#f97316"};
  margin-right: 4px;
`;

const ActionBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #d1d5db;
  background: #f8fafc;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1;
  transition: all 0.15s;
  user-select: none;
  &:hover {
    border-color: #0f766e;
    background: #f0fdf4;
    color: #0f766e;
    box-shadow: 0 2px 6px rgba(15,118,110,0.12);
  }
  &:active {
    transform: scale(0.95);
  }
`;

const ActionMenuWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled.div`
  position: fixed;
  z-index: 99999;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(15, 118, 110, 0.22), 0 2px 8px rgba(0,0,0,0.12);
  min-width: 190px;
  padding: 5px 0;
  animation: ${fadeIn} 0.15s ease;
  border: 1px solid #d1fae5;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid #f0faf8;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  color: #1e293b;
  text-align: left;
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
  &:last-child { border-bottom: none; }
  &:hover {
    background: #f0fdf4;
    color: #0f766e;
  }
`;

const QtyBadge = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 600;
  font-family: 'DM Mono', monospace;
  font-size: 0.8rem;
`;

const StockBadge = styled.span`
  background: ${({ $low }) => ($low ? "#fee2e2" : "#dcfce7")};
  color: ${({ $low }) => ($low ? "#dc2626" : "#16a34a")};
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.78rem;
  font-weight: 500;
  font-family: 'DM Mono', monospace;
`;

const PendingBadge = styled.span`
  background: #fef9c3;
  color: #b45309;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.78rem;
  font-weight: 600;
`;

const BillingStatusBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
  background: ${({ $status }) =>
    $status === "Pending"   ? "#fef3c7" :
    $status === "Approved"  ? "#dcfce7" :
    $status === "Cancelled" ? "#fee2e2" :
    $status === "Billed"    ? "#dbeafe" :
    "#f1f5f9"};
  color: ${({ $status }) =>
    $status === "Pending"   ? "#b45309" :
    $status === "Approved"  ? "#16a34a" :
    $status === "Cancelled" ? "#dc2626" :
    $status === "Billed"    ? "#1d4ed8" :
    "#64748b"};
  border: 1px solid ${({ $status }) =>
    $status === "Pending"   ? "#fcd34d" :
    $status === "Approved"  ? "#86efac" :
    $status === "Cancelled" ? "#fca5a5" :
    $status === "Billed"    ? "#93c5fd" :
    "#e2e8f0"};
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 12px 20px;
  margin-top: 12px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(15, 118, 110, 0.07);
  border: 1px solid #e8f0ef;
  font-size: 0.8rem;
  color: #64748b;
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: #94a3b8;
  font-size: 0.95rem;
`;

const ErrorMsg = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.875rem;
`;

// ─── Portal Dropdown — renders into document.body to escape overflow:hidden ────
const PortalDropdown = ({ menuKey, openActionMenu, pos, children }) => {
  if (openActionMenu !== menuKey || !pos) return null;
  return createPortal(
    <DropdownMenu style={{ top: pos.top, left: pos.left }}>
      {children}
    </DropdownMenu>,
    document.body
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MedicineChart = ({ onConvertToBill }) => {
  const [medicineData, setMedicineData] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [expandedKey, setExpandedKey]   = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null); // { key, top, left }

  // 🔹 Fetch patients + their medicine items
  const fetchMedicineChart = async () => {
    try {
      setLoading(true);
      setError(null);

      const branch_code = localStorage.getItem("selected_branch");

      const response = await apiRequest(
        `${Hmsbaseurl}pharmacy_medicinechart/`,
        "POST",
        { branch_code, outlet_code: "OLET001" }
      );

      if (response.success) {
        setMedicineData(response.data?.data || []);
      } else {
        setError(response.error || "Failed to load data.");
      }
    } catch (err) {
      console.error("Error fetching medicine chart:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicineChart(); }, []);

  // Close action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Toggle expanded row
  const handleToggleMedicines = (key) => {
    setExpandedKey(prev => (prev === key ? null : key));
    setOpenActionMenu(null);
  };

  // ✅ FIX: Safe Convert to Bill handler
  // Validates medicine_items before passing to parent,
  // so parent never receives a patient with undefined/empty items.
  const handleConvertToBillSafe = useCallback((patient) => {
    if (typeof onConvertToBill !== "function") return;

    // Safely resolve medicine_items — never undefined
    const items = Array.isArray(patient?.medicine_items) ? patient.medicine_items : [];

    if (items.length === 0) {
      alert(
        `No medicine items found for patient ${
          patient?.patient_details?.patient_name || patient?.uhid || ""
        }. Cannot convert to bill.`
      );
      return;
    }

    // Pass full patient record — OPPharmacy's convertWardRequest handles the mapping
    onConvertToBill({ ...patient, medicine_items: items });
  }, [onConvertToBill]);

  return (
    <>
      <GlobalStyle />
      <Wrapper>
        <Header>
          <Title>Pharmacy Medicine Chart</Title>
          <RefreshBtn onClick={fetchMedicineChart} disabled={loading}>
            {loading ? <SpinIcon>⟳</SpinIcon> : "⟳"} Refresh
          </RefreshBtn>
        </Header>

        {error && <ErrorMsg>⚠ {error}</ErrorMsg>}

        <TableCard>
          <StyledTable>
            <Thead>
              <tr>
                <th>Print</th>
                <th>UHID</th>
                <th>Patient Name</th>
                <th>Address</th>
                <th>Ward / Room</th>
                <th>IP Number</th>
                <th>Mobile</th>
                <th>Status</th>
                <th></th>
              </tr>
            </Thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState>Loading...</EmptyState>
                  </td>
                </tr>
              ) : medicineData.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState>No Data Available</EmptyState>
                  </td>
                </tr>
              ) : (
                medicineData.map((patient, idx) => {
                  const patientKey = `${patient.uhid || "row"}-${idx}`;
                  const isExpanded = expandedKey === patientKey;

                  // ✅ FIX: Always default to [] — never undefined
                  const items = Array.isArray(patient?.medicine_items)
                    ? patient.medicine_items
                    : [];

                  return (
                    <React.Fragment key={`${patient.uhid || "row"}-${idx}`}>
                      {/* ── Patient Row ── */}
                      <PatientRow
                        $active={isExpanded}
                        onClick={() => handleToggleMedicines(patientKey)}
                      >
                        <PrintIcon>
                          <span title="Print">🖨</span>
                        </PrintIcon>
                        <UHIDCell>{patient.uhid}</UHIDCell>
                        <td style={{ fontWeight: isExpanded ? 700 : 500 }}>
                          {patient.patient_details?.patient_name || patient.patient_name || `Patient (${patient.uhid})`}
                        </td>
                        <td>{patient.patient_details?.address || patient.address || "-"}</td>
                        <td>{patient.ward_name || patient.room_no || "-"}</td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem" }}>
                          {patient.inpatient_number || patient.ip_number || "-"}
                        </td>
                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem" }}>
                          {patient.patient_details?.mobile || patient.ip_serial_no || patient.estimate_no || "-"}
                        </td>
                        <td>
                          {patient.billing_status ? (
                            <BillingStatusBadge $status={patient.billing_status}>
                              {patient.billing_status}
                            </BillingStatusBadge>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>-</span>
                          )}
                        </td>
                        <td>
                          <MedicinesBtn
                            $active={isExpanded}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMedicines(patientKey);
                            }}
                          >
                            💊 Medicines {isExpanded ? "▲" : "▼"}
                          </MedicinesBtn>
                        </td>
                      </PatientRow>

                      {/* ── Expandable Medicine Detail Panel ── */}
                      {isExpanded && (
                        <DetailPanel onClick={(e) => e.stopPropagation()}>
                          <DetailCell colSpan="9">
                            <DetailInner>
                              {/* Sub-header with patient meta */}
                              <DetailHeader>
                                <DetailTitle>
                                  💊 Medicine Items — {patient.patient_details?.patient_name || patient.patient_name || `Patient (${patient.uhid})`}
                                </DetailTitle>
                                <PatientMeta>
                                  {(patient.ward_name || patient.room_no) && <MetaBadge>🏥 {patient.ward_name || patient.room_no}</MetaBadge>}
                                  {patient.doctor_id && <MetaBadge>👨‍⚕️ Dr. {patient.doctor_id}</MetaBadge>}
                                  {patient.billing_status && <MetaBadge>{patient.billing_status}</MetaBadge>}
                                  {patient.billing_mode && <MetaBadge>📋 {patient.billing_mode}</MetaBadge>}
                                  {patient.net_amount && <MetaBadge>₹ {patient.net_amount}</MetaBadge>}
                                  {patient.patient_details?.mobile && <MetaBadge>📞 {patient.patient_details.mobile}</MetaBadge>}
                                </PatientMeta>
                              </DetailHeader>

                              {/* Medicine items table */}
                              <ItemTable>
                                <ItemThead>
                                  <tr>
                                   
                                    <th>Action</th>
                                    <th>Item Name</th>
                                    <th>Qty</th>
                                    <th>Available Stock</th>
                                    <th>Dosage</th>
                                    <th>No. of Days</th>
                                    <th>Usage Date</th>
                                  </tr>
                                </ItemThead>
                                <tbody>
                                  {items.length > 0 ? (
                                    items.map((item, i) => {
                                      // ✅ FIX: Guard against null/undefined item in array
                                      if (!item) return null;

                                      const usageDate = item.usage_date || patient.bill_date || patient.created_date;
                                      const dateStr = usageDate
                                        ? new Date(usageDate).toLocaleDateString("en-GB")
                                        : "-";

                                      const stockLow = item.available_stock !== undefined && item.available_stock < 10;

                                      const dotType =
                                        item.is_substitute || item.substituted
                                          ? "substitute"
                                          : item.is_emergency
                                          ? "emergency"
                                          : item.is_insurance
                                          ? "insurance"
                                          : "regular";

                                      const menuKey = `${patientKey}-${i}`;

                                      return (
                                        <ItemRow key={`${item.item_id ?? i}-${i}`}>
                                         
                                          <td>
                                            <ActionMenuWrapper>
                                              <ActionBtn
                                                title="Actions"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (openActionMenu?.key === menuKey) {
                                                    setOpenActionMenu(null);
                                                  } else {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setOpenActionMenu({
                                                      key: menuKey,
                                                      top: rect.bottom + window.scrollY + 4,
                                                      left: rect.left + window.scrollX,
                                                    });
                                                  }
                                                }}
                                              >
                                                ⋮
                                              </ActionBtn>
                                              <PortalDropdown
                                                menuKey={menuKey}
                                                openActionMenu={openActionMenu?.key}
                                                pos={openActionMenu?.key === menuKey ? { top: openActionMenu.top, left: openActionMenu.left } : null}
                                              >
                                                <DropdownItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenActionMenu(null);
                                                  }}
                                                >
                                                  🔄 Substitute
                                                </DropdownItem>
                                                <DropdownItem
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenActionMenu(null);
                                                    // ✅ FIX: Use safe handler — validates items before calling parent
                                                    handleConvertToBillSafe(patient);
                                                  }}
                                                >
                                                  🧾 Convert to Bill
                                                </DropdownItem>
                                              </PortalDropdown>
                                            </ActionMenuWrapper>
                                          </td>
                                          <td style={{ fontWeight: 600, color: "#1e293b" }}>
                                            {item.item_name || item.medicine_name || "-"}
                                          </td>
                                          <td>
                                            <QtyBadge>{item.qty ?? item.quantity ?? "-"}</QtyBadge>
                                          </td>
                                          <td>
                                            {item.available_stock !== undefined && item.available_stock !== null ? (
                                              <StockBadge $low={stockLow}>{item.available_stock}</StockBadge>
                                            ) : (
                                              <span style={{ color: "#94a3b8" }}>-</span>
                                            )}
                                          </td>
                                          <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem" }}>
                                            {item.dosage || item.dose || <span style={{ color: "#cbd5e1" }}>—</span>}
                                          </td>
                                          <td style={{ textAlign: "center" }}>
                                            {item.noOfDays
                                              ? <PendingBadge>{item.noOfDays} days</PendingBadge>
                                              : <span style={{ color: "#94a3b8" }}>-</span>}
                                          </td>
                                          <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", color: "#64748b" }}>
                                            {dateStr}
                                          </td>
                                        </ItemRow>
                                      );
                                    })
                                  ) : (
                                    <tr>
                                      <td colSpan="8">
                                        <EmptyState style={{ padding: "24px" }}>
                                          No medicine items found for this patient.
                                        </EmptyState>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </ItemTable>

                            </DetailInner>
                          </DetailCell>
                        </DetailPanel>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </StyledTable>
        </TableCard>

        {/* Legend — rendered once at the very bottom of the page */}
        <Legend>
          <LegendItem><StatusDot $type="substitute" /> Substitute Given</LegendItem>
          <LegendItem><StatusDot $type="emergency" /> Emergency Medicine</LegendItem>
          <LegendItem><StatusDot $type="insurance" /> Insurance</LegendItem>
          <LegendItem><StatusDot $type="regular" /> Regular Medicine</LegendItem>
        </Legend>

      </Wrapper>
    </>
  );
};

export default MedicineChart;
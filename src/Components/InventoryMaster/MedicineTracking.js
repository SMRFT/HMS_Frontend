import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper,
  Container,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
} from "../GlobalStyles";
import styled, { keyframes } from "styled-components";

// ─── Styled Components ────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 18px 24px;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(13, 148, 136, 0.18);
  flex-wrap: wrap;
  gap: 12px;
`;
const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
`;
const PageSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.8rem;
  opacity: 0.85;
`;

const OutletBadgeHeader = styled.span`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 14px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 280px;
  flex: 1;
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  white-space: nowrap;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #1e293b;
  outline: none;
  background: white;
  width: 100%;
  transition: all 0.15s;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }
`;

const SearchBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 0 20px;
  height: 38px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover {
    background: #0f766e;
  }
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const ClearBtn = styled.button`
  background: white;
  color: #64748b;
  border: 1.5px solid #cbd5e1;
  padding: 0 16px;
  height: 38px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  &:hover {
    background: #f1f5f9;
    color: #334155;
  }
`;

const OutletTabGroup = styled.div`
  display: flex;
  gap: 6px;
  background: #e2e8f0;
  padding: 3px;
  border-radius: 8px;
  white-space: nowrap;
`;

const OutletTab = styled.button`
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: ${(p) => (p.$active ? "#0d9488" : "transparent")};
  color: ${(p) => (p.$active ? "white" : "#475569")};
  transition: all 0.15s;
  &:hover {
    background: ${(p) => (p.$active ? "#0d9488" : "rgba(255,255,255,0.6)")};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
  padding: 16px 20px;
  background: white;
`;

const StatCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  border-left: 4px solid ${(p) => p.$borderColor || "#0d9488"};
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
`;

const StatValue = styled.div`
  font-size: 1.45rem;
  font-weight: 800;
  color: ${(p) => p.$color || "#1e293b"};
  line-height: 1.2;
`;

const StatSub = styled.div`
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 2px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const SectionTitle = styled.h4`
  color: #0f766e;
  margin: 14px 20px 10px;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: ${(p) => p.$bg || "#f1f5f9"};
  color: ${(p) => p.$color || "#334155"};
`;

const OutletTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${(p) => (p.$type === "OP" ? "#dbeafe" : p.$type === "IP" ? "#fce7f3" : "#f1f5f9")};
  color: ${(p) => (p.$type === "OP" ? "#1e40af" : p.$type === "IP" ? "#9d174d" : "#475569")};
`;

const SelectedInfoBox = styled.div`
  background: #f0fdfa;
  border: 1.5px solid #99f6e4;
  border-radius: 8px;
  padding: 10px 16px;
  margin: 12px 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 0.82rem;
  color: #115e59;
  flex-wrap: wrap;
`;

const TTBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  gap: 8px;
`;

const TableSelect = styled.select`
  height: 28px;
  width: 68px;
  padding: 0 4px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  color: #1e293b;
  cursor: pointer;
  outline: none;
  &:focus {
    border-color: #0d9488;
  }
`;

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  font-size: 0.75rem;
  color: #64748b;
  flex-wrap: wrap;
  gap: 6px;
  background: #fff;
`;

const PB = styled.button`
  height: 26px;
  padding: 0 10px;
  font-size: 0.72rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: ${(p) => (p.active ? "#0d9488" : "#fff")};
  color: ${(p) => (p.active ? "#fff" : "#334155")};
  cursor: pointer;
  font-weight: 600;
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: ${(p) => (p.active ? "#0f766e" : "#f1f5f9")};
  }
`;

const TYPE_META = {
  PURCHASE: { label: "Purchase", bg: "#fef3c7", color: "#92400e" },
  STOCK_TRANSFER_IN: { label: "Transfer In", bg: "#d1fae5", color: "#065f46" },
  STOCK_TRANSFER_OUT: { label: "Transfer Out", bg: "#fee2e2", color: "#991b1b" },
  STOCK_TRANSFER_TRANSFER: { label: "Stock Transfer", bg: "#e0e7ff", color: "#3730a3" },
  SALE: { label: "Sale", bg: "#dbeafe", color: "#1e40af" },
  SALES_RETURN: { label: "Sales Return", bg: "#ffedd5", color: "#9a3412" },
  PURCHASE_RETURN: { label: "Purchase Return", bg: "#fce7f3", color: "#831843" },
};

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://127.0.0.1:2609/_b_a_c_k_e_n_d/HMS/";

function MedicineTracking() {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [results, setResults] = useState(null);
  const [loggedOutlet, setLoggedOutlet] = useState("");
  const [selectedOutletTab, setSelectedOutletTab] = useState("ALL"); // 'ALL', 'OLET002', 'OLET001', 'OLET003'

  const isLockedIP = loggedOutlet === "OLET001";
  const isLockedOP = loggedOutlet === "OLET002";

  const fetchMedicines = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}pharmacy_items/`, "GET");
      const payload = r?.data;
      const list = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.results) ? payload.results : []));
      setMedicines(list);
    } catch {
      setMedicines([]);
    }
  }, []);

  useEffect(() => {
    const selectedOutlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
    setLoggedOutlet(selectedOutlet);
    if (selectedOutlet === "OLET001") {
      setSelectedOutletTab("OLET001");
    } else if (selectedOutlet === "OLET002") {
      setSelectedOutletTab("OLET002");
    } else {
      setSelectedOutletTab("ALL");
    }
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearch = async (outletOverride) => {
    if (!searchValue.trim()) {
      toast.warn("Please enter a medicine name to search");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const activeOutletParam = outletOverride !== undefined ? outletOverride : selectedOutletTab;
      const params = new URLSearchParams();
      params.append("item_name", searchValue.trim());

      if (isLockedIP) {
        params.append("outlet_code", "OLET001");
      } else if (isLockedOP) {
        params.append("outlet_code", "OLET002");
      } else if (activeOutletParam && activeOutletParam !== "ALL") {
        params.append("outlet_code", activeOutletParam);
      }

      const r = await apiRequest(`${HmsBaseUrl}medicine-tracking/?${params.toString()}`, "GET");
      if (r?.success) {
        setResults(r.data || null);
        setSelectedName(r.data?.item_name || searchValue.trim());
        if (!r.data?.count || r.data.count === 0) {
          toast.info("No movement history found for this medicine");
        } else {
          toast.success(`Found ${r.data.count} movement records`);
        }
      } else {
        toast.error(r?.error || "Failed to load tracking data");
        setResults(null);
      }
    } catch {
      toast.error("Failed to connect to server");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const reset = () => {
    setSearchValue("");
    setResults(null);
    setSelectedName("");
    setPage(1);
  };

  const summary = results?.summary || {};
  const timeline = results?.data || [];
  const batches = results?.batches || [];
  const totalItems = timeline.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pagedTimeline = timeline.slice((page - 1) * pageSize, page * pageSize);

  const formatDateTime = (val) => {
    if (!val) return "-";
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d)) return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      return val;
    }
    return "-";
  };

  const getOutletBadgeType = (outletCode) => {
    if (outletCode === "OLET002") return "OP";
    if (outletCode === "OLET001") return "IP";
    return "STORE";
  };

  return (
    <PageWrapper>
      <Container style={{ padding: 0, overflow: "hidden" }}>
        <PageHeader>
          <div>
            <PageTitle>Medicine Movement & Stock Tracking</PageTitle>
            <PageSubtitle>
              Real-time audit log across Procurement, OP/IP Pharmacy sales, and Transfers
            </PageSubtitle>
          </div>
          {isLockedIP ? (
            <OutletBadgeHeader>🏥 IP Pharmacy (OLET001)</OutletBadgeHeader>
          ) : isLockedOP ? (
            <OutletBadgeHeader>💊 OP Pharmacy (OLET002)</OutletBadgeHeader>
          ) : (
            <OutletBadgeHeader>🏢 Central / All Outlets Mode</OutletBadgeHeader>
          )}
        </PageHeader>

        <FilterRow>
          <FilterGroup>
            <FilterLabel>Medicine:</FilterLabel>
            <FilterInput
              list="med-search-list"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by medicine or brand name..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  handleSearch();
                }
              }}
            />
            <datalist id="med-search-list">
              {medicines.slice(0, 300).map((m) => (
                <option key={m.item_id} value={m.item_name}>
                  {m.item_name} {m.brand_name ? `(${m.brand_name})` : ""}
                </option>
              ))}
            </datalist>
          </FilterGroup>

          {!isLockedIP && !isLockedOP && (
            <OutletTabGroup>
              <OutletTab
                $active={selectedOutletTab === "ALL"}
                onClick={() => {
                  setSelectedOutletTab("ALL");
                  setPage(1);
                  if (searchValue) handleSearch("ALL");
                }}
              >
                🏢 All Outlets
              </OutletTab>
              <OutletTab
                $active={selectedOutletTab === "OLET002"}
                onClick={() => {
                  setSelectedOutletTab("OLET002");
                  setPage(1);
                  if (searchValue) handleSearch("OLET002");
                }}
              >
                💊 OP Pharmacy
              </OutletTab>
              <OutletTab
                $active={selectedOutletTab === "OLET001"}
                onClick={() => {
                  setSelectedOutletTab("OLET001");
                  setPage(1);
                  if (searchValue) handleSearch("OLET001");
                }}
              >
                🏥 IP Pharmacy
              </OutletTab>
              <OutletTab
                $active={selectedOutletTab === "OLET003"}
                onClick={() => {
                  setSelectedOutletTab("OLET003");
                  setPage(1);
                  if (searchValue) handleSearch("OLET003");
                }}
              >
                📦 Main Store
              </OutletTab>
            </OutletTabGroup>
          )}

          <SearchBtn onClick={() => { setPage(1); handleSearch(); }} disabled={loading}>
            {loading ? "Searching..." : "Track Medicine"}
          </SearchBtn>

          {results && (
            <ClearBtn onClick={reset}>
              Clear
            </ClearBtn>
          )}
        </FilterRow>

        <div style={{ paddingBottom: 24 }}>
          {selectedName && (
            <SelectedInfoBox>
              <strong>Medicine:</strong> {selectedName}
              <span style={{ marginLeft: "auto", fontWeight: 700 }}>
                Viewing: {results?.outlet_name || (selectedOutletTab === "ALL" ? "All Outlets" : selectedOutletTab)}
              </span>
            </SelectedInfoBox>
          )}

          {summary && results && (
            <StatsGrid>
              <StatCard $borderColor="#0d9488">
                <StatLabel>Procured (GRN)</StatLabel>
                <StatValue $color="#0d9488">{summary.purchased || "0"}</StatValue>
                <StatSub>Total inward from vendor</StatSub>
              </StatCard>

              <StatCard $borderColor="#2563eb">
                <StatLabel>OP Pharmacy Sold</StatLabel>
                <StatValue $color="#2563eb">{summary.sold_op || "0"}</StatValue>
                <StatSub>Sold in Outpatient (OLET002)</StatSub>
              </StatCard>

              <StatCard $borderColor="#9333ea">
                <StatLabel>IP Pharmacy Sold</StatLabel>
                <StatValue $color="#9333ea">{summary.sold_ip || "0"}</StatValue>
                <StatSub>Sold in Inpatient (OLET001)</StatSub>
              </StatCard>

              <StatCard $borderColor="#0284c7">
                <StatLabel>Stock Transfers</StatLabel>
                <StatValue $color="#0284c7">{summary.stock_transfer || "0"}</StatValue>
                <StatSub>In: {summary.stock_transfer_in || "0"} | Out: {summary.stock_transfer_out || "0"}</StatSub>
              </StatCard>

              <StatCard $borderColor="#ea580c">
                <StatLabel>Sales Return</StatLabel>
                <StatValue $color="#ea580c">{summary.sales_return || "0"}</StatValue>
                <StatSub>Returned by patients</StatSub>
              </StatCard>

              <StatCard $borderColor="#059669">
                <StatLabel>Current Available Stock</StatLabel>
                <StatValue $color="#059669">{summary.current_stock || "0"}</StatValue>
                <StatSub>
                  OP: <b>{summary.current_stock_op || "0"}</b> | IP: <b>{summary.current_stock_ip || "0"}</b> | Store: <b>{summary.current_stock_main || "0"}</b>
                </StatSub>
              </StatCard>
            </StatsGrid>
          )}

          {/* Batches Table if available */}
          {batches.length > 0 && (
            <div style={{ padding: "0 20px 14px" }}>
              <SectionTitle style={{ margin: "10px 0 8px" }}>
                <span>Available Batches Across Outlets</span>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                  {batches.length} batch record(s)
                </span>
              </SectionTitle>
              <TableWrapper style={{ border: "1px solid #e2e8f0", borderRadius: 8 }}>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ background: "#f8fafc", color: "#475569", padding: "8px 12px", fontSize: "0.75rem" }}>Batch No</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", padding: "8px 12px", fontSize: "0.75rem" }}>Expiry Date</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", padding: "8px 12px", fontSize: "0.75rem" }}>Outlet</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", padding: "8px 12px", fontSize: "0.75rem" }}>Available Qty</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", padding: "8px 12px", fontSize: "0.75rem" }}>Total Procured Qty</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b, idx) => (
                      <Tr key={idx}>
                        <Td style={{ padding: "8px 12px", fontWeight: 600, fontSize: "0.8rem" }}>{b.batch_number}</Td>
                        <Td style={{ padding: "8px 12px", fontSize: "0.8rem" }}>{b.expiry_date}</Td>
                        <Td style={{ padding: "8px 12px" }}>
                          <OutletTag $type={getOutletBadgeType(b.outlet_code)}>{b.outlet_name || b.outlet_code}</OutletTag>
                        </Td>
                        <Td style={{ padding: "8px 12px", fontWeight: 700, color: "#059669", fontSize: "0.8rem" }}>{b.available}</Td>
                        <Td style={{ padding: "8px 12px", color: "#64748b", fontSize: "0.8rem" }}>{b.total_stock}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            </div>
          )}

          {timeline.length > 0 && (
            <div style={{ padding: "0 20px" }}>
              <SectionTitle style={{ margin: "10px 0 8px" }}>
                <span>Movement History & Audit Log</span>
                <span style={{
                  background: "#e2e8f0", color: "#475569",
                  fontSize: "0.72rem", padding: "2px 8px", borderRadius: 10, fontWeight: 700,
                }}>
                  {totalItems} total movement(s)
                </span>
              </SectionTitle>
              <TTBar>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.8rem", color: "#475569" }}>Show</span>
                  <TableSelect
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {[10, 25, 50, 100].map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </TableSelect>
                  <span style={{ fontSize: "0.8rem", color: "#475569" }}>entries</span>
                </div>
              </TTBar>
              <TableWrapper style={{ border: "1px solid #e2e8f0", borderTop: "none" }}>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "10px 12px", fontSize: "0.75rem" }}>Date</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "10px 12px", fontSize: "0.75rem" }}>Type</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "10px 12px", fontSize: "0.75rem" }}>Ref / Bill No</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "10px 12px", fontSize: "0.75rem" }}>Outlet</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "10px 12px", fontSize: "0.75rem" }}>Batch</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "10px 12px", fontSize: "0.75rem" }}>Qty</Th>
                      <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "10px 12px", fontSize: "0.75rem" }}>Status / Details</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedTimeline.map((row, idx) => {
                      const meta = TYPE_META[row.type] || { label: row.type, bg: "#f1f5f9", color: "#475569" };
                      const refNo = row.ref_no || "-";
                      const billRef = [row.bill_ref, row.grn_number, row.bill_no].filter(Boolean).join(" / ");
                      const outletText = row.outlet_name || [row.from_outlet_name, row.to_outlet_name].filter(Boolean).join(" → ") || row.outlet_code || "-";

                      return (
                        <Tr key={idx}>
                          <Td style={{ padding: "8px 12px", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{formatDateTime(row.date)}</Td>
                          <Td style={{ padding: "8px 12px" }}>
                            <TypeBadge $bg={meta.bg} $color={meta.color}>{meta.label}</TypeBadge>
                          </Td>
                          <Td style={{ padding: "8px 12px" }}>
                            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.82rem" }}>{refNo}</div>
                            {billRef && <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{billRef}</div>}
                          </Td>
                          <Td style={{ padding: "8px 12px" }}>
                            <OutletTag $type={getOutletBadgeType(row.outlet_code)}>{outletText}</OutletTag>
                          </Td>
                          <Td style={{ padding: "8px 12px", fontSize: "0.8rem" }}>{row.batch_no || "-"}</Td>
                          <Td style={{ padding: "8px 12px", fontWeight: 700, color: "#0f766e", fontSize: "0.82rem" }}>{row.quantity || "0"}</Td>
                          <Td style={{ padding: "8px 12px" }}>
                            <div style={{ fontSize: "0.78rem", color: "#334155" }}>
                              {row.details || "-"}
                            </div>
                            {row.patient_name && <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Patient: {row.patient_name}</div>}
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrapper>

              <Pager>
                <div>
                  Showing {totalItems === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, totalItems)} of {totalItems} entries
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <PB
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </PB>
                  {(() => {
                    const pages = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (page > 3) pages.push("...");
                      const start = Math.max(2, page - 1);
                      const end = Math.min(totalPages - 1, page + 1);
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (page < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }
                    return pages.map((pNum, i) =>
                      pNum === "..." ? (
                        <span key={`dots-${i}`} style={{ padding: "0 4px", alignSelf: "center" }}>...</span>
                      ) : (
                        <PB
                          key={pNum}
                          active={page === pNum}
                          onClick={() => setPage(pNum)}
                        >
                          {pNum}
                        </PB>
                      )
                    );
                  })()}
                  <PB
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </PB>
                </div>
              </Pager>
            </div>
          )}

          {results && timeline.length === 0 && (
            <div style={{ textAlign: "center", padding: "36px 20px", color: "#64748b", background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", margin: "14px 20px" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>🔍</div>
              <div style={{ fontWeight: 700 }}>No movement records found for this selection</div>
              <div style={{ fontSize: "0.8rem", marginTop: 4 }}>Try selecting "All Outlets" to view movements across both OP & IP pharmacies.</div>
            </div>
          )}
        </div>
      </Container>
    </PageWrapper>
  );
}

export default MedicineTracking;

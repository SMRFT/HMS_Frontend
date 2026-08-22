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
  colors,
} from "../GlobalStyles";
import styled, { keyframes } from "styled-components";

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 20px 28px;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(13,148,136,0.18);
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
  opacity: 0.82;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;
const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 250px;
  flex: 1;
`;
const FilterLabel = styled.label`
  font-size: 0.73rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
const FilterInput = styled.input`
  padding: 8px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 7px;
  font-size: 0.85rem;
  color: #374151;
  outline: none;
  background: white;
  width: 100%;
  transition: border-color 0.15s;
  &:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
`;
const SearchBtn = styled.button`
  background: #0d9488;
  color: white;
  border: none;
  padding: 9px 20px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  height: 38px;
  align-self: flex-end;
  transition: background 0.15s, transform 0.1s;
  &:hover { background: #0f766e; }
  &:disabled { background: #9ca3af; cursor: not-allowed; }
`;

const ClearBtn = styled.button`
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 9px 20px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  height: 38px;
  align-self: flex-end;
  transition: all 0.15s;
  &:hover { background: #f3f4f6; color: #374151; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding: 20px 24px;
  background: white;
`;
const StatCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const StatLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
`;
const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${(p) => p.$color || "#334155"};
`;
const SectionTitle = styled.h4`
  color: #0d9488;
  margin: 0 24px 16px;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: ${(p) => p.$bg || "#f3f4f6"};
  color: ${(p) => p.$color || "#374151"};
`;

const SelectedInfoBox = styled.div`
  background: #f0fdfa;
  border: 1.5px solid #a7f3d0;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 0 24px 12px;
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 0.85rem;
  color: #065f46;
`;

const TYPE_META = {
  PURCHASE: { label: "Purchase", bg: "#fef3c7", color: "#92400e" },
  STOCK_TRANSFER_IN: { label: "Stock Transfer In", bg: "#d1fae5", color: "#065f46" },
  STOCK_TRANSFER_OUT: { label: "Stock Transfer Out", bg: "#fee2e2", color: "#991b1b" },
  SALE: { label: "Sale", bg: "#e0e7ff", color: "#3730a3" },
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
  const [outlet, setOutlet] = useState("");

  const fetchMedicines = useCallback(async () => {
    try {
      const r = await apiRequest(`${HmsBaseUrl}pharmacy_items/`, "GET");
      if (r?.success && Array.isArray(r?.data)) {
        setMedicines(r.data);
      } else {
        setMedicines([]);
      }
    } catch {
      setMedicines([]);
    }
  }, []);

  useEffect(() => {
    const selectedOutlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
    setOutlet(selectedOutlet);
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.warn("Please enter a medicine name to search");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const params = new URLSearchParams();
      params.append("item_name", searchValue.trim());
      if (outlet) {
        params.append("outlet_code", outlet);
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

  const reset = () => {
    setSearchValue("");
    setResults(null);
    setSelectedName("");
  };

  const summary = results?.summary || {};
  const timeline = results?.data || [];

  const formatDateTime = (val) => {
    if (!val) return "-";
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d)) return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      return val;
    }
    return "-";
  };

  return (
    <PageWrapper>
      <Container style={{ padding: 0, overflow: "hidden" }}>
        <PageHeader>
          <div>
            <PageTitle>Medicine Tracking</PageTitle>
            <PageSubtitle>
              Track complete movement history — purchase, transfer, sale, and returns
            </PageSubtitle>
          </div>
        </PageHeader>

        <FilterRow>
          <FilterGroup>
            <FilterLabel>Medicine Name</FilterLabel>
            <FilterInput
              list="med-search-list"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Start typing to search..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
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
          
          <SearchBtn onClick={handleSearch} disabled={loading}>
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
              <strong>Selected Medicine:</strong> {selectedName}
              {outlet && <span style={{ marginLeft: "auto", fontWeight: 600 }}>Outlet: {outlet}</span>}
            </SelectedInfoBox>
          )}

          {summary && results && (
            <StatsGrid>
              <StatCard>
                <StatLabel>Purchased</StatLabel>
                <StatValue $color="#0d9488">{summary.purchased || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Sold</StatLabel>
                <StatValue $color="#4f46e5">{summary.sold || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Stock Transferred</StatLabel>
                <StatValue $color="#2563eb">{summary.stock_transfer || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Sales Return</StatLabel>
                <StatValue $color="#ea580c">{summary.sales_return || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Purchase Return</StatLabel>
                <StatValue $color="#be123c">{summary.purchase_return || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Current Stock</StatLabel>
                <StatValue $color="#047857">{summary.current_stock || "0"}</StatValue>
              </StatCard>
            </StatsGrid>
          )}

          {timeline.length > 0 && (
            <>
              <SectionTitle>Movement Timeline</SectionTitle>
              <div style={{ padding: "0 24px" }}>
                <TableWrapper style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                  <Table>
                    <thead>
                      <tr>
                        <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>Date</Th>
                        <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>Type</Th>
                        <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>Reference / Bill</Th>
                        <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>Outlet</Th>
                        <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>Batch</Th>
                        <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>Qty</Th>
                        <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>Status / Remark</Th>
                        <Th style={{ background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" }}>Details</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline.map((row, idx) => {
                        const meta = TYPE_META[row.type] || { label: row.type, bg: "#f1f5f9", color: "#475569" };
                        const refNo = row.ref_no || "-";
                        const billRef = [row.bill_ref, row.grn_number, row.bill_no].filter(Boolean).join(" / ");
                        const outletDisplay = [row.from_outlet, row.to_outlet].filter(Boolean).join(" → ") || row.outlet_code || "-";

                        return (
                          <Tr key={idx}>
                            <Td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>{formatDateTime(row.date)}</Td>
                            <Td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                              <TypeBadge $bg={meta.bg} $color={meta.color}>{meta.label}</TypeBadge>
                            </Td>
                            <Td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                              <div>
                                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>{refNo}</div>
                                {billRef && <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{billRef}</div>}
                              </div>
                            </Td>
                            <Td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "0.85rem" }}>{outletDisplay}</Td>
                            <Td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "0.85rem" }}>{row.batch_no || "-"}</Td>
                            <Td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#1e293b" }}>{row.quantity || "0"}</Td>
                            <Td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                              <div>
                                {row.status && <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>{row.status}</div>}
                                {row.approved_by && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>By: {row.approved_by}</div>}
                              </div>
                            </Td>
                            <Td style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                              <div style={{ fontSize: "0.8rem", color: "#475569", maxWidth: 260, lineHeight: 1.4 }} title={row.details || ""}>
                                {row.details || "-"}
                              </div>
                            </Td>
                          </Tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </TableWrapper>
              </div>
            </>
          )}

          {results && timeline.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", margin: "0 24px" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🔍</div>
              <div style={{ fontWeight: 600 }}>No movement records found</div>
              <div style={{ fontSize: "0.85rem", marginTop: 4 }}>This medicine hasn't had any purchase, sale, or transfer activity yet.</div>
            </div>
          )}
        </div>
      </Container>
    </PageWrapper>
  );
}

export default MedicineTracking;

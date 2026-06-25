import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper,
  Container,
  Input,
  InputWrapper,
  Label,
  Button,
  FormRow,
  ButtonContainer,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  colors,
} from "../GlobalStyles";
import styled, { keyframes, css } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  padding: 18px 24px;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(124, 58, 237, 0.18);
`;
const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;
const PageSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 0.8rem;
  opacity: 0.85;
`;
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin: 16px 0;
`;
const StatCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;
const StatLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.textMuted};
`;
const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(p) => p.$color || colors.textMain};
  margin-top: 4px;
`;
const SectionTitle = styled.h4`
  color: #7c3aed;
  margin: 18px 0 12px;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${(p) => p.$bg || "#e0e7ff"};
  color: ${(p) => p.$color || "#3730a3"};
`;
const EmptyRow = styled.tr`
  td {
    text-align: center;
    padding: 20px;
    color: ${colors.textMuted};
    font-size: 0.88rem;
  }
`;
const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 180px auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 14px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
const SearchBtn = styled(Button)`
  background: #7c3aed;
  color: white;
  height: 38px;
  border-radius: 6px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  &:hover { background: #6d28d9; }
`;

const TYPE_META = {
  PURCHASE: {
    label: "Purchase",
    bg: "#fef3c7",
    color: "#92400e",
  },
  STOCK_TRANSFER_IN: {
    label: "Stock Transfer In",
    bg: "#d1fae5",
    color: "#065f46",
  },
  STOCK_TRANSFER_OUT: {
    label: "Stock Transfer Out",
    bg: "#fee2e2",
    color: "#7f1d1d",
  },
  SALE: {
    label: "Sale",
    bg: "#e0e7ff",
    color: "#3730a3",
  },
  SALES_RETURN: {
    label: "Sales Return",
    bg: "#ffedd5",
    color: "#7c2d12",
  },
  PURCHASE_RETURN: {
    label: "Purchase Return",
    bg: "#fce7f3",
    color: "#831843",
  },
};

const HmsBaseUrl =
  process.env.REACT_APP_BACKEND_HMS_BASE_URL ||
  "http://127.0.0.1:2609/_b_a_c_k_e_n_d/HMS/";

function MedicineTracking() {
  const [searchType, setSearchType] = useState("item_id");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
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
    const selectedOutlet =
      localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
    setOutlet(selectedOutlet);
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.warn("Please enter item ID or medicine name");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const params = new URLSearchParams();
      if (searchType === "item_id") {
        params.append("item_id", searchValue.trim());
      } else {
        params.append("item_name", searchValue.trim());
      }
      if (outlet) {
        params.append("outlet_code", outlet);
      }

      const r = await apiRequest(`${HmsBaseUrl}medicine-tracking/?${params.toString()}`, "GET");
      if (r?.success) {
        setResults(r.data || null);
        setSelectedItem(r.data?.item_id || searchValue.trim());
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
    setSelectedItem("");
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
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Medicine Tracking</PageTitle>
            <PageSubtitle>
              Track complete movement history — purchase, transfer, sale, and returns
            </PageSubtitle>
          </div>
        </PageHeader>

        <div style={{ padding: 18 }}>
          <SearchRow>
            <FormRow style={{ marginBottom: 0, gridTemplateColumns: "140px 1fr" }}>
              <InputWrapper>
                <Label>Search By</Label>
                <Input
                  as="select"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="item_id">Item ID</option>
                  <option value="item_name">Medicine Name</option>
                </Input>
              </InputWrapper>
              <InputWrapper>
                <Label>{searchType === "item_id" ? "Item ID" : "Medicine Name"}</Label>
                {searchType === "item_name" ? (
                  <Input
                    list="med-search-list"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Type medicine name..."
                  />
                ) : (
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchType === "item_id" ? "e.g. 12" : "e.g. Paracetamol"}
                  />
                )}
                {searchType === "item_name" && (
                  <datalist id="med-search-list">
                    {medicines.slice(0, 200).map((m) => (
                      <option key={m.item_id} value={m.item_name}>
                        {m.item_name} {m.brand_name ? `(${m.brand_name})` : ""}
                      </option>
                    ))}
                  </datalist>
                )}
              </InputWrapper>
            </FormRow>
            <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
              <SearchBtn onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Track Medicine"}
              </SearchBtn>
              {results && (
                <Button
                  onClick={reset}
                  style={{
                    background: "white",
                    color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                    height: 38,
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </SearchRow>

          {selectedItem && (
            <div
              style={{
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 12,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
                fontSize: "0.88rem",
              }}
            >
              <strong>Selected:</strong>
              <span>ID: {selectedItem}</span>
              <span>Name: {selectedName}</span>
              {outlet && <span>Outlet: {outlet}</span>}
            </div>
          )}

          {summary && results && (
            <StatsGrid>
              <StatCard>
                <StatLabel>Purchased</StatLabel>
                <StatValue $color="#065f46">{summary.purchased || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Sold</StatLabel>
                <StatValue $color="#3730a3">{summary.sold || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Sales Return</StatLabel>
                <StatValue $color="#c2410c">{summary.sales_return || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Purchase Return</StatLabel>
                <StatValue $color="#9d174d">{summary.purchase_return || "0"}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Current Stock</StatLabel>
                <StatValue $color="#7c3aed">{summary.current_stock || "0"}</StatValue>
              </StatCard>
            </StatsGrid>
          )}

          {timeline.length > 0 && (
            <>
              <SectionTitle>Movement Timeline</SectionTitle>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Type</Th>
                      <Th>Reference / Bill</Th>
                      <Th>Outlet</Th>
                      <Th>Batch</Th>
                      <Th>Qty</Th>
                      <Th>Status / Remark</Th>
                      <Th>Details</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map((row, idx) => {
                      const meta = TYPE_META[row.type] || {
                        label: row.type,
                        bg: "#f3f4f6",
                        color: "#374151",
                      };
                      const refNo = row.ref_no || "-";
                      const billRef = [row.bill_ref, row.grn_number, row.bill_no]
                        .filter(Boolean)
                        .join(" / ");
                      const outletDisplay = [row.from_outlet, row.to_outlet]
                        .filter(Boolean)
                        .join(" → ")
                        || row.outlet_code || "-";

                      return (
                        <Tr key={idx}>
                          <Td>{formatDateTime(row.date)}</Td>
                          <Td>
                            <TypeBadge $bg={meta.bg} $color={meta.color}>
                              {meta.label}
                            </TypeBadge>
                          </Td>
                          <Td>
                            <div>
                              <div style={{ fontWeight: 600 }}>{refNo}</div>
                              {billRef && (
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: colors.textMuted,
                                  }}
                                >
                                  {billRef}
                                </div>
                              )}
                            </div>
                          </Td>
                          <Td>{outletDisplay}</Td>
                          <Td>{row.batch_no || "-"}</Td>
                          <Td style={{ fontWeight: 600 }}>{row.quantity || "0"}</Td>
                          <Td>
                            <div>
                              {row.status && (
                                <div
                                  style={{
                                    fontSize: "0.78rem",
                                    color: colors.textMuted,
                                  }}
                                >
                                  {row.status}
                                </div>
                              )}
                              {row.approved_by && (
                                <div
                                  style={{
                                    fontSize: "0.72rem",
                                    color: colors.textMuted,
                                  }}
                                >
                                  By: {row.approved_by}
                                </div>
                              )}
                            </div>
                          </Td>
                          <Td>
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: colors.textMuted,
                                maxWidth: 260,
                              }}
                              title={row.details || ""}
                            >
                              {row.details || "-"}
                            </div>
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              </TableWrapper>
            </>
          )}

          {results && timeline.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 30,
                color: colors.textMuted,
                background: colors.surface,
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                marginTop: 16,
              }}
            >
              No movement records found for this medicine.
            </div>
          )}
        </div>
      </Container>
    </PageWrapper>
  );
}

export default MedicineTracking;
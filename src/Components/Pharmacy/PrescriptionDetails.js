import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaPrescription,
  FaSearch,
  FaCalendarAlt,
  FaSyncAlt,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaPills,
  FaUserMd,
  FaCheckCircle,
  FaClock,
  FaFileInvoiceDollar
} from "react-icons/fa";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  teal:       "#0d9488",
  tealDark:   "#0f766e",
  tealLight:  "#ccfbf1",
  tealBg:     "#f0fdfa",
  tealHover:  "#115e59",
  slate:      "#0f172a",
  slateMid:   "#475569",
  slateLight: "#94a3b8",
  border:     "#e2e8f0",
  surface:    "#ffffff",
  bg:         "#f8fafc",
  amber:      "#d97706",
  amberBg:    "#fef3c7",
  green:      "#16a34a",
  greenBg:    "#dcfce7",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Container = styled.div`
  padding: 24px 28px 40px;
  background: ${T.bg};
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  animation: ${fadeIn} 0.25s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBadge = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${T.slate};
  letter-spacing: -0.01em;
`;

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: ${T.slateMid};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
`;

const StatCard = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const StatLabel = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${T.slateLight};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const StatValue = styled.div`
  font-size: 1.45rem;
  font-weight: 700;
  color: ${props => props.color || T.slate};
  margin-top: 2px;
`;

const FilterCard = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  min-width: 260px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${T.slateLight};
    font-size: 0.85rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 9px 12px 9px 34px;
  border-radius: 8px;
  border: 1.5px solid ${T.border};
  font-size: 0.86rem;
  color: ${T.slate};
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: ${T.teal};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }
`;

const DateBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1.5px solid ${T.border};
  border-radius: 8px;
  padding: 4px 10px;

  span {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${T.slateLight};
    text-transform: uppercase;
  }

  input[type="date"] {
    border: none;
    background: transparent;
    font-size: 0.82rem;
    color: ${T.slate};
    outline: none;
    cursor: pointer;
  }
`;

const Select = styled.select`
  padding: 9px 12px;
  border-radius: 8px;
  border: 1.5px solid ${T.border};
  font-size: 0.84rem;
  color: ${T.slate};
  background: white;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${T.teal};
  }
`;

const RefreshBtn = styled.button`
  background: white;
  border: 1.5px solid ${T.border};
  border-radius: 8px;
  padding: 9px 14px;
  color: ${T.slateMid};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    border-color: ${T.teal};
    color: ${T.teal};
  }

  svg.spinning {
    animation: ${spin} 0.8s linear infinite;
  }
`;

const TableCard = styled.div`
  background: ${T.surface};
  border: 1px solid ${T.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 13px 16px;
  background: #f8fafc;
  color: ${T.slateMid};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1.5px solid ${T.border};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 13px 16px;
  color: ${T.slate};
  font-size: 0.86rem;
  border-bottom: 1px solid ${T.border};
  vertical-align: middle;
`;

const Tr = styled.tr`
  transition: background 0.15s;

  &:hover {
    background: #f8fafc;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: ${T.slateMid};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${T.tealBg};
    color: ${T.teal};
  }
`;

const UhidBadge = styled.span`
  font-family: monospace;
  font-weight: 700;
  color: ${T.tealDark};
  background: ${T.tealBg};
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.83rem;
  border: 1px solid ${T.tealLight};
`;

const DoctorTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: ${T.slate};

  svg {
    color: ${T.teal};
    font-size: 0.85rem;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;

  ${props => props.$status === "Billed" ? `
    background: ${T.greenBg};
    color: ${T.green};
    border: 1px solid #bbf7d0;
  ` : `
    background: ${T.amberBg};
    color: ${T.amber};
    border: 1px solid #fde68a;
  `}
`;

const ActionBtn = styled.button`
  background: linear-gradient(135deg, ${T.tealDark}, ${T.teal});
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(15, 118, 110, 0.25);

  &:hover {
    background: linear-gradient(135deg, #115e59, ${T.tealDark});
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(15, 118, 110, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DetailsDrawerRow = styled.tr`
  background: #f8fafc;
`;

const DrawerContainer = styled.div`
  padding: 16px 20px 20px 48px;
  border-bottom: 1px solid ${T.border};
`;

const DrawerTitle = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${T.tealDark};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SubTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${T.border};

  th {
    background: #f1f5f9;
    padding: 9px 12px;
    font-size: 0.72rem;
    font-weight: 700;
    color: ${T.slateMid};
    text-transform: uppercase;
    border-bottom: 1px solid ${T.border};
  }

  td {
    padding: 9px 12px;
    font-size: 0.82rem;
    color: ${T.slate};
    border-bottom: 1px solid #f1f5f9;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const EmptyState = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: ${T.slateLight};

  svg {
    font-size: 2.5rem;
    margin-bottom: 12px;
    color: #cbd5e1;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    color: ${T.slateMid};
    font-weight: 500;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────
const PrescriptionDetails = ({ onConvertToBill }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${HmsBaseUrl}get_doctor_prescriptions/`;
      const params = [];
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (fromDate) params.push(`from_date=${fromDate}`);
      if (toDate) params.push(`to_date=${toDate}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await apiRequest(url, "GET");
      const resBody = res?.data ?? res;
      const dataList = Array.isArray(resBody?.data)
        ? resBody.data
        : Array.isArray(resBody)
          ? resBody
          : [];

      setPrescriptions(dataList);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [search, fromDate, toDate]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (statusFilter === "all") return true;
    return (p.billing_status || "Pending").toLowerCase() === statusFilter.toLowerCase();
  });

  const totalCount = prescriptions.length;
  const pendingCount = prescriptions.filter(
    (p) => (p.billing_status || "Pending").toLowerCase() === "pending"
  ).length;
  const billedCount = prescriptions.filter(
    (p) => (p.billing_status || "Pending").toLowerCase() === "billed"
  ).length;

  return (
    <Container>
      {/* Header */}
      <Header>
        <TitleBlock>
          <IconBadge>
            <FaPrescription />
          </IconBadge>
          <div>
            <Title>Prescription Details</Title>
            <Subtitle>
              Review outpatient doctor prescriptions and seamlessly convert to pharmacy bill
            </Subtitle>
          </div>
        </TitleBlock>

        <RefreshBtn onClick={fetchPrescriptions} disabled={loading}>
          <FaSyncAlt className={loading ? "spinning" : ""} />
          Refresh
        </RefreshBtn>
      </Header>

      {/* Stats Summary */}
      <StatsGrid>
        <StatCard>
          <div>
            <StatLabel>Total Prescriptions</StatLabel>
            <StatValue>{totalCount}</StatValue>
          </div>
          <FaPrescription style={{ fontSize: "1.8rem", color: T.tealLight }} />
        </StatCard>
        <StatCard>
          <div>
            <StatLabel>Pending Billing</StatLabel>
            <StatValue color={T.amber}>{pendingCount}</StatValue>
          </div>
          <FaClock style={{ fontSize: "1.8rem", color: T.amberBg }} />
        </StatCard>
        <StatCard>
          <div>
            <StatLabel>Already Billed</StatLabel>
            <StatValue color={T.green}>{billedCount}</StatValue>
          </div>
          <FaCheckCircle style={{ fontSize: "1.8rem", color: T.greenBg }} />
        </StatCard>
      </StatsGrid>

      {/* Filter Toolbar */}
      <FilterCard>
        <FilterGroup>
          <SearchInputWrapper>
            <FaSearch />
            <Input
              type="text"
              placeholder="Search UHID, Patient, Doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchInputWrapper>

          <DateBox>
            <FaCalendarAlt style={{ color: T.slateLight, fontSize: "0.8rem" }} />
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </DateBox>

          <DateBox>
            <FaCalendarAlt style={{ color: T.slateLight, fontSize: "0.8rem" }} />
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </DateBox>

          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              style={{
                background: "none",
                border: "none",
                color: T.teal,
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear Dates
            </button>
          )}
        </FilterGroup>

        <FilterGroup>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({totalCount})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="billed">Billed ({billedCount})</option>
          </Select>
        </FilterGroup>
      </FilterCard>

      {/* Table */}
      <TableCard>
        <Table>
          <thead>
            <tr>
              <Th style={{ width: 40 }}></Th>
              <Th>Date & Time</Th>
              <Th>UHID</Th>
              <Th>Patient Name</Th>
              <Th>Age / Gender</Th>
              <Th>Doctor</Th>
              <Th style={{ textAlign: "center" }}>Medicines</Th>
              <Th>Status</Th>
              <Th style={{ textAlign: "right" }}>Action</Th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState>
                    <FaPills />
                    <p>
                      {loading
                        ? "Loading prescriptions..."
                        : "No doctor prescriptions found matching criteria."}
                    </p>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              filteredPrescriptions.map((presc) => {
                const isExpanded = !!expandedRows[presc.id || presc._id];
                const items = presc.prescription_details || [];
                const isBilled = (presc.billing_status || "Pending").toLowerCase() === "billed";

                return (
                  <React.Fragment key={presc.id || presc._id}>
                    <Tr>
                      <Td style={{ width: 40 }}>
                        <ExpandButton
                          onClick={() => toggleRow(presc.id || presc._id)}
                          title={isExpanded ? "Hide Details" : "Show Details"}
                        >
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </ExpandButton>
                      </Td>
                      <Td>
                        {presc.created_date
                          ? presc.created_date.replace("T", " ").substring(0, 16)
                          : "—"}
                      </Td>
                      <Td>
                        <UhidBadge>{presc.uhid}</UhidBadge>
                      </Td>
                      <Td>
                        <div style={{ fontWeight: 600 }}>{presc.patient_name}</div>
                        {presc.mobile && (
                          <div style={{ fontSize: "0.76rem", color: T.slateMid }}>
                            📱 {presc.mobile}
                          </div>
                        )}
                      </Td>
                      <Td>
                        {presc.age ? `${presc.age} Y` : "—"}
                        {presc.gender ? ` / ${presc.gender}` : ""}
                      </Td>
                      <Td>
                        <DoctorTag>
                          <FaUserMd />
                          {presc.doctor_name || "Doctor"}
                        </DoctorTag>
                      </Td>
                      <Td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: T.slateMid,
                          }}
                        >
                          {items.length} {items.length === 1 ? "Item" : "Items"}
                        </span>
                      </Td>
                      <Td>
                        <StatusPill $status={isBilled ? "Billed" : "Pending"}>
                          {isBilled ? <FaCheckCircle /> : <FaClock />}
                          {presc.billing_status || "Pending"}
                        </StatusPill>
                      </Td>
                      <Td style={{ textAlign: "right" }}>
                        <ActionBtn
                          onClick={() => {
                            if (typeof onConvertToBill === "function") {
                              onConvertToBill(presc);
                            }
                          }}
                        >
                          <FaFileInvoiceDollar />
                          {isBilled ? "Re-bill" : "To Bill"}
                          <FaArrowRight style={{ fontSize: "0.75rem" }} />
                        </ActionBtn>
                      </Td>
                    </Tr>

                    {/* Expandable Medicine Details Drawer */}
                    {isExpanded && (
                      <DetailsDrawerRow>
                        <td colSpan={9} style={{ padding: 0 }}>
                          <DrawerContainer>
                            <DrawerTitle>
                              <FaPills /> Prescribed Medicines ({items.length})
                            </DrawerTitle>
                            <SubTable>
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Item Name</th>
                                  <th>Batch No</th>
                                  <th>Expiry</th>
                                  <th style={{ textAlign: "right" }}>MRP (₹)</th>
                                  <th style={{ textAlign: "right" }}>Price (₹)</th>
                                  <th style={{ textAlign: "center" }}>CGST%</th>
                                  <th style={{ textAlign: "right" }}>CGST Amt</th>
                                  <th style={{ textAlign: "center" }}>SGST%</th>
                                  <th style={{ textAlign: "right" }}>SGST Amt</th>
                                  <th>Dosage</th>
                                  <th>Frequency</th>
                                  <th>Duration</th>
                                  <th style={{ textAlign: "center" }}>Qty</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td style={{ color: T.slateLight }}>{idx + 1}</td>
                                    <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                                    <td>
                                      <span
                                        style={{
                                          background: "#f8fafc",
                                          border: "1px solid #e2e8f0",
                                          color: T.navyDark,
                                          padding: "2px 6px",
                                          borderRadius: 4,
                                          fontSize: "0.75rem",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {item.batch_number || item.batch_no || "—"}
                                      </span>
                                    </td>
                                    <td style={{ fontSize: "0.78rem", color: T.slateMid }}>
                                      {item.expiry_date || "—"}
                                    </td>
                                    <td style={{ textAlign: "right", fontWeight: 600, color: T.slate }}>
                                      {item.mrp != null && item.mrp !== 0
                                        ? `₹${parseFloat(item.mrp).toFixed(2)}`
                                        : "—"}
                                    </td>
                                    <td style={{ textAlign: "right", fontWeight: 600, color: T.tealDark }}>
                                      {item.price != null && item.price !== 0
                                        ? `₹${parseFloat(item.price).toFixed(2)}`
                                        : "—"}
                                    </td>
                                    {/* CGST */}
                                    <td style={{ textAlign: "center", color: T.slateMid }}>
                                      {item.cgst_rate != null ? `${parseFloat(item.cgst_rate)}%` : "—"}
                                    </td>
                                    <td style={{ textAlign: "right", color: T.slateMid }}>
                                      {item.cgst_amount != null && item.cgst_amount !== 0
                                        ? `₹${parseFloat(item.cgst_amount).toFixed(2)}`
                                        : "—"}
                                    </td>
                                    {/* SGST */}
                                    <td style={{ textAlign: "center", color: T.slateMid }}>
                                      {item.sgst_rate != null ? `${parseFloat(item.sgst_rate)}%` : "—"}
                                    </td>
                                    <td style={{ textAlign: "right", color: T.slateMid }}>
                                      {item.sgst_amount != null && item.sgst_amount !== 0
                                        ? `₹${parseFloat(item.sgst_amount).toFixed(2)}`
                                        : "—"}
                                    </td>
                                    <td>{item.dosage || "—"}</td>
                                    <td>
                                      <span
                                        style={{
                                          background: T.tealBg,
                                          color: T.tealDark,
                                          padding: "2px 6px",
                                          borderRadius: 4,
                                          fontSize: "0.75rem",
                                          fontWeight: 600,
                                        }}
                                      >
                                        {item.frequency || "—"}
                                      </span>
                                    </td>
                                    <td>{item.duration || "—"}</td>
                                    <td style={{ textAlign: "center", fontWeight: 700 }}>
                                      {item.total_dosage || item.qty || 1}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </SubTable>


                          </DrawerContainer>
                        </td>
                      </DetailsDrawerRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </Table>
      </TableCard>
    </Container>
  );
};

export default PrescriptionDetails;

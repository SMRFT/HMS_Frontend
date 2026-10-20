import React, { useState, useEffect } from "react";
import apiRequest from "../../Auth/apiRequest";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import { FaSearch, FaSyncAlt } from "react-icons/fa";

import {
  PageWrapper,
  colors,
  fadeIn,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  NoResults,
  Button,
} from "../GlobalStyles";

// ─── Styled Components ─────────────────────────────────────────────────────────

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(15, 118, 110, 0.06),
    0 8px 32px rgba(15, 118, 110, 0.10),
    0 0 0 1px rgba(15, 118, 110, 0.07);
  overflow: hidden;
  animation: ${fadeIn} 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: linear-gradient(130deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 160px; height: 160px;
    background: rgba(255,255,255,0.06);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  letter-spacing: -0.01em;
`;

const ContentSection = styled.div`
  padding: 28px 32px;
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0f766e;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, #ccfbf1, transparent);
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fcd34d;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #64748b;
  font-size: 0.95rem;
`;

const StyledToastContainer = styled(ToastContainer)`
  .Toastify__toast {
    border-radius: 10px;
    font-family: 'Segoe UI', sans-serif;
    font-size: 0.9rem;
  }
`;


const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  min-width: 260px;
  outline: none;
  transition: border-color 0.2s;
  &:focus {
    border-color: #0f766e;
    box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
  }
`;

const RefreshBtn = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 0.82rem;
  background: #0f766e;
  color: #fff;
  border: none;
  cursor: pointer;
  &:hover {
    background: #0d9488;
  }
`;

/**
 * ViewEstimate
 *
 * Props:
 *   onConvertEstimate(estimate) — called when user clicks "Edit / Convert"
 *   refreshTrigger — incremented by parent on Save Estimate
 *   activeTab — current active tab string
 */
const ViewEstimate = ({ onConvertEstimate, refreshTrigger, activeTab }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEstimates = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_estimate_bills/`, "GET");
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res)
            ? res
            : [];
      setEstimates(list);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      if (isInitial) toast.error("Failed to load estimates.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Fetch when refreshTrigger updates or when tab becomes active
  useEffect(() => {
    if (!activeTab || activeTab === "view_estimate") {
      fetchEstimates(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, activeTab]);

  const handleConvert = (estimate) => {
    if (!estimate.Bill_id) {
      toast.error("Estimate is missing Bill_id — cannot load.");
      return;
    }
    if (typeof onConvertEstimate === "function") {
      onConvertEstimate(estimate);
    }
  };

  const formatDateTime = (rawDate) => {
    if (!rawDate) return "—";
    let s = String(rawDate).trim();
    // MongoDB stores naive UTC datetimes. If missing timezone offset or 'Z',
    // append 'Z' so JavaScript interprets it as UTC instead of local system time.
    if (s && s.includes("T") && !s.endsWith("Z") && !s.includes("+") && !/-\d{2}:\d{2}$/.test(s)) {
      s += "Z";
    }
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // Filter by search query (Estimate No, Patient Name, UHID, Doctor)
  const filteredEstimates = estimates.filter((e) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const estNo = String(e.estimate_no || "").toLowerCase();
    const pName = String(e.patient_name || "").toLowerCase();
    const uhid = String(e.uhid || "").toLowerCase();
    const ip = String(e.inpatient_number || "").toLowerCase();
    const doc = String(e.doctor_name || e.doctor_id || "").toLowerCase();
    return estNo.includes(q) || pName.includes(q) || uhid.includes(q) || ip.includes(q) || doc.includes(q);
  });

  return (
    <PageWrapper>
      <StyledToastContainer position="top-right" autoClose={3000} />
      <Card>
        {/* ── Estimates Table ── */}
        <ContentSection>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SectionLabel style={{ margin: 0 }}>Active Estimates ({filteredEstimates.length})</SectionLabel>
            <RefreshBtn onClick={() => fetchEstimates(true)} disabled={loading}>
              <FaSyncAlt style={{ animation: loading ? "spin 1s infinite linear" : "none" }} /> Refresh
            </RefreshBtn>
          </div>

          <SearchInputWrapper>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <FaSearch style={{ position: "absolute", left: 10, color: "#94a3b8" }} />
              <SearchInput
                style={{ paddingLeft: 32 }}
                placeholder="Search by Estimate No, Patient, UHID, Doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <Button style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => setSearchTerm("")}>
                Clear
              </Button>
            )}
          </SearchInputWrapper>

          {loading ? (
            <LoadingWrapper>Loading active estimates…</LoadingWrapper>
          ) : filteredEstimates.length === 0 ? (
            <NoResults>
              {searchTerm ? "No estimates matched your search." : "No active estimates found (auto-cleared after 24 hrs)."}
            </NoResults>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>Estimate No</Th>
                    <Th>Patient Name</Th>
                    <Th>UHID / IP</Th>
                    <Th>Doctor</Th>
                    <Th>Date & Time</Th>
                    <Th>Bill Type</Th>
                    <Th>Net Amount</Th>
                    <Th>Status</Th>
                    <Th style={{ textAlign: "center" }}>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstimates.map((estimate, index) => {
                    const dateFormatted = formatDateTime(estimate.bill_date || estimate.created_date);

                    return (
                      <Tr key={estimate.Bill_id || index}>
                        <Td style={{ fontWeight: 700, color: "#0f766e" }}>{estimate.estimate_no || `EST-${estimate.Bill_id}`}</Td>
                        <Td style={{ fontWeight: 600 }}>{estimate.patient_name || "—"}</Td>
                        <Td>
                          <div>{estimate.uhid || "—"}</div>
                          {estimate.inpatient_number && (
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>IP: {estimate.inpatient_number}</div>
                          )}
                        </Td>
                        <Td>{estimate.doctor_name || estimate.doctor_id || "—"}</Td>
                        <Td style={{ fontSize: "0.82rem", color: "#475569", whiteSpace: "nowrap" }}>{dateFormatted}</Td>
                        <Td style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          {estimate.bill_type_name || estimate.bill_name || `Type ${estimate.bill_type || ""}`}
                        </Td>
                        <Td style={{ fontWeight: 700, color: "#0f766e", fontSize: "0.95rem" }}>
                          ₹{parseFloat(estimate.net_amount || estimate.total_amount || 0).toFixed(2)}
                        </Td>
                        <Td>
                          <StatusBadge>Estimate</StatusBadge>
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <Button
                            style={{ padding: "6px 14px", fontSize: "0.82rem", background: "#0f766e", color: "#fff" }}
                            onClick={() => handleConvert(estimate)}
                          >
                            Edit / Convert
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </ContentSection>
      </Card>
    </PageWrapper>
  );
};

export default ViewEstimate;
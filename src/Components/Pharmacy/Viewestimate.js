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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ConfirmBox = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
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
  const [cancellingEstimate, setCancellingEstimate] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchEstimates = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const activeOutlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
      const url = activeOutlet
        ? `${HmsBaseUrl}get_estimate_bills/?outlet_code=${encodeURIComponent(activeOutlet)}`
        : `${HmsBaseUrl}get_estimate_bills/`;
      const res = await apiRequest(url, "GET");
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
      if (isInitial) toast.error("Failed to load estimates.", { autoClose: 2000, pauseOnHover: false });
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const activeOutlet = localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";

  // Fetch when refreshTrigger updates, when tab becomes active, or when outlet changes
  useEffect(() => {
    if (!activeTab || activeTab === "view_estimate") {
      fetchEstimates(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, activeTab, activeOutlet]);

  const handleConvert = (estimate) => {
    if (!estimate.Bill_id) {
      toast.error("Estimate is missing Bill_id — cannot load.", { autoClose: 2000, pauseOnHover: false });
      return;
    }
    if (typeof onConvertEstimate === "function") {
      onConvertEstimate(estimate);
    }
  };

  const handleCancelEstimate = async () => {
    if (!cancellingEstimate) return;
    setCancelLoading(true);
    try {
      const payload = {
        Bill_id: cancellingEstimate.Bill_id,
        estimate_no: cancellingEstimate.estimate_no,
        cancel_reason: "Cancelled from View Estimate page",
      };
      if (activeOutlet) {
        payload.outlet_code = activeOutlet;
      }
      const res = await apiRequest(`${HmsBaseUrl}cancel_estimate_bill/`, "POST", payload);
      if (res?.status === "success" || res?.success) {
        toast.success(res?.message || "Estimate cancelled successfully.", { autoClose: 2000, pauseOnHover: false });
        // Immediately remove from state so it disappears right away
        setEstimates((prev) =>
          prev.filter(
            (e) =>
              e.Bill_id !== cancellingEstimate.Bill_id &&
              e.estimate_no !== cancellingEstimate.estimate_no
          )
        );
        fetchEstimates(false);
        try {
          if (typeof BroadcastChannel !== "undefined") {
            new BroadcastChannel("hms_billing_channel").postMessage({
              type: "ESTIMATE_CANCELLED",
              estimateNo: cancellingEstimate.estimate_no,
              billId: cancellingEstimate.Bill_id,
            });
          }
        } catch (e) {}
      } else {
        toast.error(res?.message || "Failed to cancel estimate.", { autoClose: 2000, pauseOnHover: false });
      }
    } catch (err) {
      console.error("Error cancelling estimate:", err);
      toast.error("Failed to cancel estimate. Please try again.", { autoClose: 2000, pauseOnHover: false });
    } finally {
      setCancelLoading(false);
      setCancellingEstimate(null);
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

  // Filter by search query (Estimate No, Patient Name, UHID, Doctor) and strictly exclude Cancelled
  const filteredEstimates = estimates.filter((e) => {
    const bStatus = String(e.billing_status || e.status || "").toLowerCase();
    if (bStatus === "cancelled" || e.is_cancelled) return false;
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
      <StyledToastContainer position="top-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover={false} limit={3} />
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
                    <Th style={{ width: "95px", whiteSpace: "nowrap" }}>Estimate No</Th>
                    <Th style={{ minWidth: "165px", whiteSpace: "nowrap" }}>Patient Name</Th>
                    <Th style={{ minWidth: "110px", whiteSpace: "nowrap" }}>UHID / IP</Th>
                    <Th style={{ minWidth: "140px", whiteSpace: "nowrap" }}>Doctor</Th>
                    <Th style={{ whiteSpace: "nowrap" }}>Date & Time</Th>
                    <Th style={{ whiteSpace: "nowrap" }}>Bill Type</Th>
                    <Th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Net Amount</Th>
                    <Th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Status</Th>
                    <Th style={{ textAlign: "center", whiteSpace: "nowrap" }}>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstimates.map((estimate, index) => {
                    const dateFormatted = formatDateTime(estimate.bill_date || estimate.created_date);

                    return (
                      <Tr key={estimate.Bill_id || index}>
                        <Td style={{ fontWeight: 700, color: "#0f766e", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                          {estimate.estimate_no || `EST-${estimate.Bill_id}`}
                        </Td>
                        <Td style={{ fontWeight: 600, fontSize: "0.8rem", color: "#1e293b", whiteSpace: "nowrap", minWidth: "165px" }}>
                          {estimate.patient_name || "—"}
                        </Td>
                        <Td style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          <div>{estimate.uhid || "—"}</div>
                          {estimate.inpatient_number && (
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>IP: {estimate.inpatient_number}</div>
                          )}
                        </Td>
                        <Td style={{ fontSize: "0.8rem", color: "#334155", maxWidth: "160px" }}>
                          {estimate.doctor_name || estimate.doctor_id || "—"}
                        </Td>
                        <Td style={{ fontSize: "0.78rem", color: "#475569", whiteSpace: "nowrap" }}>{dateFormatted}</Td>
                        <Td style={{ fontSize: "0.78rem", color: "#64748b", whiteSpace: "nowrap" }}>
                          {estimate.bill_type_name || estimate.bill_name || `Type ${estimate.bill_type || ""}`}
                        </Td>
                        <Td style={{ fontWeight: 700, color: "#0f766e", fontSize: "0.9rem", textAlign: "right", whiteSpace: "nowrap" }}>
                          ₹{parseFloat(estimate.net_amount || estimate.total_amount || 0).toFixed(2)}
                        </Td>
                        <Td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                          <StatusBadge>Estimate</StatusBadge>
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
                            <Button
                              style={{ padding: "5px 12px", fontSize: "0.8rem", background: "#0f766e", color: "#fff", whiteSpace: "nowrap" }}
                              onClick={() => handleConvert(estimate)}
                            >
                              Edit / Convert
                            </Button>
                            <Button
                              style={{ padding: "5px 12px", fontSize: "0.8rem", background: "#ef4444", color: "#fff", border: "none", whiteSpace: "nowrap" }}
                              onClick={() => setCancellingEstimate(estimate)}
                            >
                              Cancel
                            </Button>
                          </div>
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

      {/* ── Cancel Estimate Confirmation Modal ── */}
      {cancellingEstimate && (
        <ModalOverlay onClick={() => !cancelLoading && setCancellingEstimate(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <h4 style={{ margin: "0 0 10px 0", color: "#b91c1c", fontSize: "1.1rem" }}>⚠ Cancel Estimate?</h4>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem", color: "#334155", lineHeight: "1.5" }}>
              Are you sure you want to cancel estimate{" "}
              <strong>{cancellingEstimate.estimate_no || `EST-${cancellingEstimate.Bill_id}`}</strong>
              {cancellingEstimate.patient_name ? ` for ${cancellingEstimate.patient_name}` : ""}?
              <br />
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                This will release any blocked stock and remove the estimate from view.
              </span>
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button
                style={{ padding: "7px 16px", background: "#ef4444", color: "#fff", border: "none" }}
                onClick={handleCancelEstimate}
                disabled={cancelLoading}
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </Button>
              <Button
                secondary
                style={{ padding: "7px 16px" }}
                onClick={() => setCancellingEstimate(null)}
                disabled={cancelLoading}
              >
                Go Back
              </Button>
            </div>
          </ConfirmBox>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default ViewEstimate;
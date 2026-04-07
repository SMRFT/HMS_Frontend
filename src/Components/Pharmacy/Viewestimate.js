import React, { useState, useEffect, useRef } from "react";
import apiRequest from "../../Auth/apiRequest";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
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

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ViewEstimate
 *
 * Props:
 *   onConvertEstimate(estimate) — called when the user clicks "Edit / Convert"
 *                                 on a row. The parent (OPPharmacyTabs) should
 *                                 switch to the "OP Pharmacy Bill" tab and pass
 *                                 the estimate data into OPPharmacy for loading.
 */
const ViewEstimate = ({ onConvertEstimate }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true); // true only on first load
  const intervalRef = useRef(null);

  const fetchEstimates = async (isInitial = false) => {
    // Show spinner only on the very first fetch; background refreshes are silent
    if (isInitial) setLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_estimate_bills/`, "GET");
      const data = res.data ?? res;
      setEstimates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      // Only toast on the initial load so background errors aren't noisy
      if (isInitial) toast.error("Failed to load estimates.");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const startPolling = () => {
    // Clear any existing interval before starting a new one
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchEstimates(false), 5000); // poll every 5 s
  };

  useEffect(() => {
    // Initial fetch (shows loading spinner)
    fetchEstimates(true);
    startPolling();

    // Refetch immediately when the user returns to this browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchEstimates(false); // silent refresh
        startPolling();        // reset timer so next poll is 5 s from now
      } else {
        // Pause polling while the tab is hidden to save resources
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // runs once on mount

  const handleConvert = (estimate) => {
    if (!estimate.Bill_id) {
      toast.error("Estimate is missing Bill_id — cannot load.");
      return;
    }
    if (typeof onConvertEstimate === "function") {
      onConvertEstimate(estimate);
    }
  };

  return (
    <PageWrapper>
      <StyledToastContainer position="top-right" autoClose={3000} />
      <Card>
        
        {/* ── Estimates Table ── */}
        <ContentSection>
          <SectionLabel>Active Estimates</SectionLabel>

          {loading ? (
            <LoadingWrapper>Loading estimates…</LoadingWrapper>
          ) : estimates.length === 0 ? (
            <NoResults>No active estimates found.</NoResults>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>Estimate No</Th>
                    <Th>Patient</Th>
                    <Th>UHID</Th>
                    <Th>Date</Th>
                    <Th>Net Amount</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {estimates.map((estimate, index) => (
                    <Tr key={index}>
                      <Td style={{ fontWeight: 600 }}>{estimate.estimate_no}</Td>
                      <Td>{estimate.patient_name}</Td>
                      <Td>{estimate.uhid}</Td>
                      <Td style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        {estimate.bill_date
                          ? new Date(estimate.bill_date).toLocaleDateString("en-IN")
                          : estimate.created_date
                            ? new Date(estimate.created_date).toLocaleDateString("en-IN")
                            : "—"}
                      </Td>
                      <Td style={{ fontWeight: 700, color: "#0f766e" }}>
                        ₹{parseFloat(estimate.net_amount || estimate.total_amount || 0).toFixed(2)}
                      </Td>
                      <Td>
                        <StatusBadge>Estimate</StatusBadge>
                      </Td>
                      <Td>
                        <Button
                          style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                          onClick={() => handleConvert(estimate)}
                        >
                          Edit / Convert
                        </Button>
                      </Td>
                    </Tr>
                  ))}
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
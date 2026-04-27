import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Styled Components ────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: white; border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;
`;
const ModalHeader = styled.div`
  background-color: #0d9488; color: white;
  padding: 16px 24px;
  display: flex; justify-content: space-between; align-items: center;
  border-radius: 8px 8px 0 0;
`;
const ModalTitle = styled.h2`margin:0; font-size:18px; font-weight:600;`;
const CloseButton = styled.button`
  background:none; border:none; color:white; font-size:24px; cursor:pointer;
  width:32px; height:32px; display:flex; align-items:center; justify-content:center;
  border-radius:4px;
  &:hover { background-color: rgba(255,255,255,0.1); }
`;
const ModalBody = styled.div`padding: 24px;`;
const FormGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;
const FormGroup = styled.div`display:flex; flex-direction:column; gap:6px;`;
const FormLabel = styled.label`font-weight:600; color:#374151; font-size:13px; letter-spacing:0.02em;`;

const FormInput = styled.input`
  border: 1px solid #d1d5db; border-radius: 4px; padding: 10px 12px;
  font-size: 14px; width: 100%; box-sizing: border-box;
  background-color: ${(p) => (p.readOnly ? "#f3f4f6" : "white")};
  cursor: ${(p) => (p.readOnly ? "not-allowed" : "text")};
  color: #111827;
  &:focus { outline:none; border-color:#0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
`;

const ClockInput = styled.input`
  border: 1.5px solid ${(p) => (p.isactive ? "#0d9488" : p.isfrozen ? "#6366f1" : "#d1d5db")};
  border-radius: 4px; padding: 10px 12px;
  font-size: 20px; font-family: monospace; font-weight: 700; letter-spacing: 0.1em;
  width: 100%; box-sizing: border-box;
  background-color: ${(p) => (p.isactive ? "#f0fdfa" : p.isfrozen ? "#eef2ff" : "#f9fafb")};
  color: ${(p) => (p.isactive ? "#0d9488" : p.isfrozen ? "#4338ca" : "#9ca3af")};
  cursor: not-allowed; text-align: center;
`;

const ShiftBadge = styled.div`
  display:inline-flex; align-items:center; gap:6px;
  padding:8px 14px; border-radius:20px; font-size:13px; font-weight:600;
  background-color:${(p) => p.status==="active" ? "#dcfce7" : p.status==="inactive" ? "#fee2e2" : "#f3f4f6"};
  color:${(p) => p.status==="active" ? "#166534" : p.status==="inactive" ? "#991b1b" : "#6b7280"};
  border:1px solid ${(p) => p.status==="active" ? "#bbf7d0" : p.status==="inactive" ? "#fecaca" : "#e5e7eb"};
`;
const ButtonGroup = styled.div`
  display:flex; justify-content:center; gap:16px; margin-top:24px;
`;
const ActionButton = styled.button`
  padding:12px 28px; border:none; border-radius:4px; font-size:14px; font-weight:600;
  display:flex; align-items:center; gap:8px; transition:background-color 0.2s;
  opacity:${(p) => p.disabled ? 0.5 : 1};
  cursor:${(p) => p.disabled ? "not-allowed" : "pointer"};
  ${(p) => p.variant === "start"
    ? "background-color:#0d9488; color:white; &:hover:not(:disabled){background-color:#0f766e;}"
    : "background-color:#dc2626; color:white; &:hover:not(:disabled){background-color:#b91c1c;}"}
`;
const LoadingSpinner = styled.div`
  display:inline-block; width:16px; height:16px;
  border:2px solid #ffffff40; border-top:2px solid #ffffff;
  border-radius:50%; animation:spin 1s linear infinite;
  @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
`;
const AlertBox = styled.div`
  padding:12px 16px; border-radius:4px; margin-bottom:16px; font-size:14px;
  display:flex; align-items:flex-start; gap:8px;
  background-color:${({type}) => type==="error"?"#fef2f2":type==="success"?"#f0fdf4":"#fffbeb"};
  color:${({type}) => type==="error"?"#dc2626":type==="success"?"#166534":"#92400e"};
  border:1px solid ${({type}) => type==="error"?"#fecaca":type==="success"?"#bbf7d0":"#fde68a"};
`;
const SectionDivider = styled.div`border-top:1px solid #e5e7eb; margin:8px 0 20px;`;
const TimeSection = styled.div`
  grid-column: 1 / -1;
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
`;
const SubLabel = styled.div`font-size:11px; color:#6b7280; margin-top:3px;`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
};

const parseBackendDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  return new Date(String(val).replace(" ", "T"));
};

const toHHMMSS = (val) => {
  const d = parseBackendDate(val);
  if (!d || isNaN(d.getTime())) return "--:--:--";
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
};

const formatDateTime = (val) => {
  if (!val) return "";
  try {
    return parseBackendDate(val).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: true,
    });
  } catch { return ""; }
};

const statusLabel = (s) =>
  s === "active" ? "Shift Active" : s === "inactive" ? "Shift Completed" : "Shift Not Started";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShiftDetails({ isOpen, onClose, outletCode, outletName, onShiftChange, activeShiftData }) {

  const [formData,       setFormData]       = useState({});
  const [loading,        setLoading]        = useState(false);
  const [checkingShift,  setCheckingShift]  = useState(false);
  const [alerts,         setAlerts]         = useState([]);
  const [isActive,       setIsActive]       = useState(false);   // driven by API is_active
  const [currentShiftId, setCurrentShiftId] = useState(null);
  const [shiftStartISO,  setShiftStartISO]  = useState(null);
  const [shiftEndISO,    setShiftEndISO]    = useState(null);
  const [startClock,     setStartClock]     = useState("");
  const [closingClock,   setClosingClock]   = useState("");

  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setClosingClock(getCurrentTime()), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const clearAlerts = () => setAlerts([]);
  const addAlert    = (type, msg) => setAlerts((prev) => [...prev, { type, msg }]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearAlerts();
  };

  // ── SINGLE painter — called after every API response ─────────────────────
  // Reads every field from the API object and pushes them to state
  const applyShiftData = useCallback((d) => {
    const active = d.is_active === true;

    setCurrentShiftId(d.shiftno || null);
    setIsActive(active);

    setFormData({
      shiftNo:         d.shiftno          || "",
      cashCounter:     d.CashCounter      || d.outlet_code || "",
      cashCounterName: d.CashCounter      || d.outlet_code || "",
      cashierID:       d.CashierID        || "",
      branchCode:      d.branch_code      || "",
      hospitalCode:    d.hospital_code    || "",
      outletCode:      d.outlet_code      || "",
      date:            d.date             || "",
      openingBalance:  d.OpeningBalance   != null ? String(d.OpeningBalance)  : "0.00",
      closingBalance:  d.ClosingBalance   != null ? String(d.ClosingBalance)  : "0.00",
      shiftStatus:     d.ShiftStatus      || (active ? "active" : "not_started"),
    });

    // StartingTime
    if (d.StartingTime) {
      setShiftStartISO(d.StartingTime);
      setStartClock(toHHMMSS(d.StartingTime));
    } else {
      setShiftStartISO(null);
      setStartClock("");
    }

    // ClosingTime / ticker
    if (d.closingTime) {
      stopTimer();
      setShiftEndISO(d.closingTime);
      setClosingClock(toHHMMSS(d.closingTime));
    } else if (active) {
      setShiftEndISO(null);
      setClosingClock(getCurrentTime());
      startTimer();
    } else {
      stopTimer();
      setShiftEndISO(null);
      setClosingClock("");
    }
  }, [startTimer, stopTimer]);

  // ── GET get_active_shift — called on modal open + after every POST/PATCH ──
  const fetchActiveShift = useCallback(async (cashCounter) => {
    setCheckingShift(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_active_shift/`,
        "POST",
        { CashCounter: cashCounter }
      );
      console.log("🔍 [ShiftDetails] get_active_shift:", res);
      if (res?.success && res?.data) {
        console.log("test",res.data.data)
        applyShiftData(res.data.data);
        return res.data;
      }
      // No active shift — clear clocks & buttons
      setIsActive(false);
      setCurrentShiftId(null);
      setShiftStartISO(null);
      setShiftEndISO(null);
      setStartClock("");
      setClosingClock("");
      stopTimer();
      return null;
    } catch (err) {
      console.warn("⚠️ [ShiftDetails] get_active_shift error:", err);
      return null;
    } finally {
      setCheckingShift(false);
    }
  }, [applyShiftData, stopTimer]);

  // ── On modal open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    clearAlerts();

    const resolvedOutlet =
      outletCode || localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";
    const resolvedName =
      outletName || localStorage.getItem("selected_outlet_name") || resolvedOutlet || "";

    // Pre-fill outlet before GET returns
    setFormData((prev) => ({
      ...prev,
      cashCounter:     resolvedOutlet,
      cashCounterName: resolvedName,
      openingBalance:  prev.openingBalance  || "0.00",
      closingBalance:  prev.closingBalance  || "0.00",
    }));

    // If parent passed fresh data, paint immediately (no flicker)
    if (activeShiftData?.shiftno) {
      applyShiftData(activeShiftData);
    }

    // Always confirm from backend (handles page refresh, other sessions)
    fetchActiveShift(resolvedOutlet);

  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── START COUNTER ─────────────────────────────────────────────────────────
  const handleStartCounter = async () => {
    clearAlerts();

    const resolvedOutlet =
      outletCode || localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";

    const payload = {
      CashCounter:    formData.cashCounter || resolvedOutlet,
      StartingTime:   new Date().toISOString(),
      OpeningBalance: parseFloat(formData.openingBalance) || 0,
    };

    setLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}cash_counter_shiftdetails/`, "POST", payload);
      console.log("🚀 [ShiftDetails] Start:", res);

      if (res?.success && res?.data) {
        // Paint from POST response first (instant feedback)
        applyShiftData(res.data);
        addAlert("success", `Shift started — ${res.data.shiftno}`);

        // ✅ Immediate GET to refresh all fields from DB
        const fresh = await fetchActiveShift(resolvedOutlet);
        if (onShiftChange) onShiftChange(fresh || res.data);

      } else {
        addAlert("error", res?.message || "Failed to start shift.");
      }
    } catch (err) {
      console.error("❌ [ShiftDetails] Start error:", err);
      addAlert("error", "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── STOP COUNTER ──────────────────────────────────────────────────────────
  const handleStopCounter = async () => {
    clearAlerts();

    if (!currentShiftId) {
      addAlert("error", "No active shift found. Close and reopen this dialog.");
      return;
    }

    const resolvedOutlet =
      outletCode || localStorage.getItem("selected_outlet") || localStorage.getItem("outlet_code") || "";

    const payload = {
      shiftno:        currentShiftId,
      ClosingBalance: parseFloat(formData.closingBalance) || 0,
      closingTime:    new Date().toISOString(),
    };

    setLoading(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}cash_counter_shiftdetails/`, "PATCH", payload);
      console.log("🛑 [ShiftDetails] Stop:", res);

      if (res?.success && res?.data) {
        // Paint from PATCH response first (instant feedback)
        applyShiftData(res.data);
        addAlert("success", res.message || "Shift closed successfully.");

        // ✅ Immediate GET — closed shift won't return from get_active_shift,
        // so fall back to PATCH data for parent notification
        const fresh = await fetchActiveShift(resolvedOutlet);
        if (onShiftChange) onShiftChange(fresh || res.data);

      } else {
        addAlert("error", res?.message || "Failed to close shift.");
      }
    } catch (err) {
      console.error("❌ [ShiftDetails] Stop error:", err);
      addAlert("error", "Server error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const shiftStatusValue = formData.shiftStatus || "not_started";
  const startActive  = isActive ? "true" : undefined;
  const startFrozen  = (shiftStartISO && !isActive) ? "true" : undefined;
  const closeActive  = (isActive && !shiftEndISO) ? "true" : undefined;
  const closeFrozen  = shiftEndISO ? "true" : undefined;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>

        <ModalHeader>
          <ModalTitle>Shift Details</ModalTitle>
          <CloseButton onClick={onClose} title="Close">×</CloseButton>
        </ModalHeader>

        <ModalBody>

          {alerts.map((a, i) => (
            <AlertBox key={i} type={a.type}>
              {a.type === "error" ? "⚠️" : a.type === "success" ? "✅" : "ℹ️"} {a.msg}
            </AlertBox>
          ))}

          {checkingShift && (
            <AlertBox type="info">⏳ Loading shift details…</AlertBox>
          )}

          {/* Status badge */}
          <div style={{ marginBottom: 16 }}>
            <ShiftBadge status={shiftStatusValue}>
              {shiftStatusValue === "active" ? "🟢" : shiftStatusValue === "inactive" ? "🔴" : "⚪"}
              {statusLabel(shiftStatusValue)}
              {formData.shiftNo && ` — ${formData.shiftNo}`}
            </ShiftBadge>
          </div>

          <SectionDivider />

          <FormGrid>

            <FormGroup>
              <FormLabel>CASH COUNTER</FormLabel>
              <FormInput type="text" value={formData.cashCounterName || "—"} readOnly />
            </FormGroup>

            <FormGroup>
              <FormLabel>CASHIER ID</FormLabel>
              <FormInput type="text" value={formData.cashierID || "—"} readOnly />
            </FormGroup>

            <FormGroup>
              <FormLabel>OPENING BALANCE</FormLabel>
              <FormInput
                type="number" min="0" step="0.01"
                value={formData.openingBalance || "0.00"}
                onChange={(e) => handleInputChange("openingBalance", e.target.value)}
                readOnly={isActive}
                placeholder="0.00"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>CLOSING BALANCE</FormLabel>
              <FormInput
                type="number" min="0" step="0.01"
                value={formData.closingBalance || "0.00"}
                onChange={(e) => handleInputChange("closingBalance", e.target.value)}
                readOnly={!isActive}
                placeholder="0.00"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>BRANCH CODE</FormLabel>
              <FormInput type="text" value={formData.branchCode || "—"} readOnly />
            </FormGroup>

            <FormGroup>
              <FormLabel>DATE</FormLabel>
              <FormInput type="text" value={formData.date || "—"} readOnly />
            </FormGroup>

            <TimeSection>

              {/* Starting Time — frozen to API StartingTime */}
              <FormGroup>
                <FormLabel>STARTING TIME</FormLabel>
                <ClockInput
                  type="text"
                  value={startClock || "— : — : —"}
                  readOnly
                  isactive={startActive}
                  isfrozen={startFrozen}
                />
                <SubLabel>
                  {shiftStartISO ? formatDateTime(shiftStartISO) : "— not started —"}
                </SubLabel>
              </FormGroup>

              {/* Closing Time — live ticker while active, frozen on stop */}
              <FormGroup>
                <FormLabel>CLOSING TIME</FormLabel>
                <ClockInput
                  type="text"
                  value={closingClock || "— : — : —"}
                  readOnly
                  isactive={closeActive}
                  isfrozen={closeFrozen}
                />
                <SubLabel>
                  {shiftEndISO
                    ? formatDateTime(shiftEndISO)
                    : isActive
                    ? "Shift running…"
                    : "— not stopped —"}
                </SubLabel>
              </FormGroup>

            </TimeSection>

          </FormGrid>

          {/* Buttons — purely driven by is_active from API */}
          <ButtonGroup>

            {/* is_active: false → Start Counter */}
            {!isActive && (
              <ActionButton
                variant="start"
                onClick={handleStartCounter}
                disabled={loading || checkingShift}
              >
                {loading ? <LoadingSpinner /> : "▶"}
                Start Counter
              </ActionButton>
            )}

            {/* is_active: true → Stop Counter */}
            {isActive && (
              <ActionButton
                variant="stop"
                onClick={handleStopCounter}
                disabled={loading || checkingShift}
              >
                {loading ? <LoadingSpinner /> : "⏹"}
                Stop Counter
              </ActionButton>
            )}

          </ButtonGroup>

        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
}
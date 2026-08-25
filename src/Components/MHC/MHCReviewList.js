import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { format, addDays, differenceInCalendarDays, parseISO, isValid } from "date-fns";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import headerImage from "../Images/Header.png";
import FooterImage from "../Images/Footer.png";
import {
  PageWrapper,
  Container,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  colors,
} from "../GlobalStyles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Date Helpers ─────────────────────────────────────────────────────────────
const getTodayString = () => new Date().toISOString().split("T")[0];

const parseDateSafe = (dateStr) => {
  if (!dateStr) return null;
  try {
    // Check if ISO format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const d = parseISO(dateStr.slice(0, 10));
      return isValid(d) ? d : null;
    }
    // Check if DD/MM/YYYY or DD-MM-YYYY
    const parts = dateStr.split(/[/.-]/);
    if (parts.length === 3) {
      // If first part is 4 digits -> YYYY/MM/DD
      if (parts[0].length === 4) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return isValid(d) ? d : null;
      }
      // DD/MM/YYYY
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      return isValid(d) ? d : null;
    }
    const d = new Date(dateStr);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
};

const formatDateDisplay = (dateStr) => {
  const d = parseDateSafe(dateStr);
  if (!d) return dateStr || "—";
  try {
    return format(d, "dd/MM/yyyy");
  } catch {
    return dateStr || "—";
  }
};

const formatDateForInput = (d) => {
  if (!d || !isValid(d)) return "";
  try {
    return format(d, "yyyy-MM-dd");
  } catch {
    return "";
  }
};

// ─── Styled Components ────────────────────────────────────────────────────────
const ContentCard = styled.div`
  background: #ffffff;
  border-radius: 18px;
  padding: 1.5rem 1.8rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.25s ease-out;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1.5px solid #f1f5f9;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PageTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SubText = styled.span`
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 500;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${(p) => p.$padding || "7px 14px"};
  font-size: ${(p) => p.$fontSize || "0.82rem"};
  font-weight: 600;
  border-radius: 8px;
  border: ${(p) => p.$border || "none"};
  background: ${(p) => p.$bg || "linear-gradient(135deg, #0d9488, #0f766e)"};
  color: ${(p) => p.$color || "#ffffff"};
  cursor: pointer;
  box-shadow: ${(p) => p.$shadow || "0 2px 6px rgba(0,0,0,0.08)"};
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// ─── Stats Row ────────────────────────────────────────────────────────────────
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.3rem;
`;

const StatBox = styled.div`
  background: ${(p) => p.$bg || "#f8fafc"};
  border: 1.5px solid ${(p) => p.$border || "#e2e8f0"};
  border-radius: 12px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  transition: all 0.15s ease;

  &:hover {
    ${(p) => p.$clickable && "transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06);"}
  }
`;

const StatCount = styled.div`
  font-size: 1.45rem;
  font-weight: 800;
  color: ${(p) => p.$color || "#0f766e"};
`;

const StatTitle = styled.div`
  font-size: 0.73rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ─── Due Calculator Panel ─────────────────────────────────────────────────────
const CalculatorPanel = styled.div`
  background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%);
  border: 1.5px solid #ccfbf1;
  border-radius: 14px;
  padding: 1.1rem 1.3rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const CalcHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const CalcControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);
`;

const NumberInput = styled.input`
  width: 65px;
  height: 32px;
  font-size: 1.05rem;
  font-weight: 700;
  text-align: center;
  color: #0f766e;
  border: none;
  outline: none;
  background: transparent;
`;

const TargetDateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0d9488;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
`;

const PresetsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

const PresetChip = styled.button`
  background: ${(p) => (p.$active ? "#0d9488" : "#ffffff")};
  color: ${(p) => (p.$active ? "#ffffff" : "#334155")};
  border: 1.5px solid ${(p) => (p.$active ? "#0d9488" : "#cbd5e1")};
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #0d9488;
    color: ${(p) => (p.$active ? "#ffffff" : "#0d9488")};
  }
`;

// ─── Filter Bar ───────────────────────────────────────────────────────────────
const FilterBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  background: #f8fafc;
  padding: 0.9rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FilterLabel = styled.label`
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const StyledInput = styled.input`
  height: 36px;
  padding: 0 10px;
  font-size: 0.84rem;
  color: #1e293b;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;

  &:focus {
    border-color: #0d9488;
  }
`;

const StyledSelect = styled.select`
  height: 36px;
  padding: 0 10px;
  font-size: 0.84rem;
  color: #1e293b;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  width: 100%;
  cursor: pointer;

  &:focus {
    border-color: #0d9488;
  }
`;

// ─── Badges & Status Pills ────────────────────────────────────────────────────
const DueBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 0.78rem;
  font-weight: 700;
  background: ${(p) => p.$bg || "#ecfdf5"};
  color: ${(p) => p.$color || "#065f46"};
  border: 1px solid ${(p) => p.$border || "#a7f3d0"};
  white-space: nowrap;
`;

const CountdownChip = styled.span`
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  background: ${(p) => p.$bg || "#f1f5f9"};
  color: ${(p) => p.$color || "#475569"};
  margin-top: 3px;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 12px;
  font-size: 0.74rem;
  font-weight: 700;
  background: ${(p) => (p.$active ? "#dcfce7" : "#fef3c7")};
  color: ${(p) => (p.$active ? "#15803d" : "#b45309")};
  border: 1px solid ${(p) => (p.$active ? "#86efac" : "#fde68a")};
`;

const GenderAgeBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
`;

const ContactButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  text-decoration: none;
  background: ${(p) => p.$bg || "#f8fafc"};
  color: ${(p) => p.$color || "#334155"};
  border: 1px solid ${(p) => p.$border || "#cbd5e1"};
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }
`;

// ─── Modal ────────────────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
`;

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: min(560px, 95vw);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalHead = styled.div`
  padding: 1rem 1.4rem;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalBody = styled.div`
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalFoot = styled.div`
  padding: 1rem 1.4rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
`;

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT: MHCReviewList
// ══════════════════════════════════════════════════════════════════════════════
const MHCReviewList = () => {
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "";

  // Data state
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  // Days offset filter: default 0 (Today)
  const [daysOffset, setDaysOffset] = useState(0);
  const [filterMode, setFilterMode] = useState("exact"); // "exact" | "range" | "overdue" | "all"
  const [activePreset, setActivePreset] = useState("today");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [contactFilter, setContactFilter] = useState("ALL"); // "ALL" | "HAS_PHONE" | "NO_PHONE"
  const [reportStatusFilter, setReportStatusFilter] = useState("ALL"); // "ALL" | "APPROVED" | "PENDING"

  // ── Calculated Target Date based on Days Offset ─────────────────────────────
  const baseToday = useMemo(() => new Date(), []);
  
  const targetDate = useMemo(() => {
    return addDays(new Date(), Number(daysOffset) || 0);
  }, [daysOffset]);

  const targetDateFormatted = useMemo(() => {
    return format(targetDate, "dd/MM/yyyy");
  }, [targetDate]);

  const targetDateInputVal = useMemo(() => {
    return formatDateForInput(targetDate);
  }, [targetDate]);

  // ── Fetch Investigations ───────────────────────────────────────────────────
  const fetchInvestigations = useCallback(async () => {
    setLoading(true);
    try {
      // We fetch all MHC investigations (billTypeNo == 'PACK')
      const result = await apiRequest(`${HMSURL}mhc-investigations/`, "GET");
      if (result.success && Array.isArray(result.data)) {
        setRecords(result.data);
      } else {
        setRecords([]);
        if (result.error) toast.error(result.error);
      }
    } catch (err) {
      console.error("Error fetching MHC review records:", err);
      toast.error("Failed to load MHC review records");
    } finally {
      setLoading(false);
    }
  }, [HMSURL]);

  useEffect(() => {
    fetchInvestigations();
  }, [fetchInvestigations]);

  // ── Handle Days Offset Change ───────────────────────────────────────────────
  const handleDaysChange = (val) => {
    const num = Number(val);
    setDaysOffset(isNaN(num) ? 0 : num);
    setActivePreset(num === 0 ? "today" : num === 1 ? "tomorrow" : num === 2 ? "2d" : "custom");
    if (filterMode === "overdue" || filterMode === "all") {
      setFilterMode("exact");
    }
  };

  // ── Handle Target Date Picker Change ─────────────────────────────────────────
  const handleDatePickerChange = (e) => {
    const chosenVal = e.target.value;
    if (!chosenVal) return;
    const chosenDate = parseDateSafe(chosenVal);
    if (!chosenDate) return;
    const diff = differenceInCalendarDays(chosenDate, new Date());
    setDaysOffset(diff);
    setActivePreset("custom");
    if (filterMode === "overdue" || filterMode === "all") {
      setFilterMode("exact");
    }
  };

  // ── Apply Quick Preset ──────────────────────────────────────────────────────
  const applyPreset = (presetKey, offset, mode = "exact") => {
    setActivePreset(presetKey);
    setDaysOffset(offset);
    setFilterMode(mode);
  };

  // ── Unique Filter Options ───────────────────────────────────────────────────
  const packageOptions = useMemo(() => {
    const pkgs = new Set();
    records.forEach((r) => {
      if (r.packageName) pkgs.add(r.packageName);
    });
    return Array.from(pkgs).sort();
  }, [records]);

  const doctorOptions = useMemo(() => {
    const docs = new Set();
    records.forEach((r) => {
      const doc = r.doctorName || r.referredByName;
      if (doc && doc !== "SELF") docs.add(doc);
    });
    return Array.from(docs).sort();
  }, [records]);

  // ── Filtered Records & Statistics ───────────────────────────────────────────
  const processedRecords = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return records.map((row) => {
      const rawDueDate = row.next_due_date || row.report?.next_due_date || "";
      const parsedDueDate = parseDateSafe(rawDueDate);

      let diffDays = null;
      let statusType = "NONE"; // "OVERDUE" | "TODAY" | "UPCOMING" | "NONE"

      if (parsedDueDate) {
        parsedDueDate.setHours(0, 0, 0, 0);
        diffDays = differenceInCalendarDays(parsedDueDate, today);
        if (diffDays < 0) statusType = "OVERDUE";
        else if (diffDays === 0) statusType = "TODAY";
        else statusType = "UPCOMING";
      }

      return {
        ...row,
        parsedDueDate,
        diffDays,
        statusType,
        formattedDueDate: parsedDueDate ? format(parsedDueDate, "dd/MM/yyyy") : rawDueDate || "—",
      };
    });
  }, [records]);

  // Filtered rows based on due criteria and search
  const filteredRows = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    return processedRecords.filter((row) => {
      // 1. Due Date filter mode
      if (filterMode === "exact") {
        if (!row.parsedDueDate) return false;
        if (differenceInCalendarDays(row.parsedDueDate, target) !== 0) return false;
      } else if (filterMode === "range") {
        if (!row.parsedDueDate) return false;
        const diffFromToday = differenceInCalendarDays(row.parsedDueDate, today);
        const diffFromTarget = differenceInCalendarDays(row.parsedDueDate, target);
        // Between today and target date
        if (daysOffset >= 0) {
          if (diffFromToday < 0 || diffFromTarget > 0) return false;
        } else {
          if (diffFromTarget < 0 || diffFromToday > 0) return false;
        }
      } else if (filterMode === "overdue") {
        if (!row.parsedDueDate || row.diffDays === null || row.diffDays >= 0) return false;
      } else if (filterMode === "upcoming") {
        if (!row.parsedDueDate || row.diffDays === null || row.diffDays < 0) return false;
      } else if (filterMode === "all_due") {
        if (!row.parsedDueDate) return false;
      }

      // 2. Package Filter
      if (selectedPackage !== "ALL" && row.packageName !== selectedPackage) {
        return false;
      }

      // 3. Doctor Filter
      if (selectedDoctor !== "ALL") {
        const docMatch = row.doctorName === selectedDoctor || row.referredByName === selectedDoctor;
        if (!docMatch) return false;
      }

      // 4. Contact Filter
      const phone = row.phone || row.mobilePhone || "";
      if (contactFilter === "HAS_PHONE" && !phone.trim()) return false;
      if (contactFilter === "NO_PHONE" && phone.trim()) return false;

      // 5. Report Status
      if (reportStatusFilter === "APPROVED" && !row.is_approved) return false;
      if (reportStatusFilter === "PENDING" && row.is_approved) return false;

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (row.patientName || "").toLowerCase();
        const uhid = (row.uhid || "").toLowerCase();
        const bill = (row.investBillNo || "").toLowerCase();
        const pkg = (row.packageName || "").toLowerCase();
        const ph = (row.phone || row.mobilePhone || "").toLowerCase();
        const doc = (row.doctorName || row.referredByName || "").toLowerCase();
        if (
          !name.includes(q) &&
          !uhid.includes(q) &&
          !bill.includes(q) &&
          !pkg.includes(q) &&
          !ph.includes(q) &&
          !doc.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    processedRecords,
    filterMode,
    targetDate,
    daysOffset,
    selectedPackage,
    selectedDoctor,
    contactFilter,
    reportStatusFilter,
    searchQuery,
  ]);

  // Overall counts
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    let dueOnTargetCount = 0;
    let dueTodayCount = 0;
    let dueNext7Count = 0;
    let overdueCount = 0;
    let contactableCount = 0;

    processedRecords.forEach((r) => {
      if (r.parsedDueDate) {
        if (differenceInCalendarDays(r.parsedDueDate, target) === 0) {
          dueOnTargetCount++;
        }
        if (r.diffDays === 0) {
          dueTodayCount++;
        }
        if (r.diffDays !== null && r.diffDays >= 0 && r.diffDays <= 7) {
          dueNext7Count++;
        }
        if (r.diffDays !== null && r.diffDays < 0) {
          overdueCount++;
        }
      }
      if ((r.phone || r.mobilePhone || "").trim()) {
        contactableCount++;
      }
    });

    return {
      total: processedRecords.length,
      dueOnTarget: dueOnTargetCount,
      dueToday: dueTodayCount,
      dueNext7: dueNext7Count,
      overdue: overdueCount,
      contactable: contactableCount,
    };
  }, [processedRecords, targetDate]);

  // ── Print Filtered Data ─────────────────────────────────────────────────────
  const handlePrintTable = () => {
    if (!filteredRows || filteredRows.length === 0) {
      toast.warn("No records to print.");
      return;
    }

    const rowsHtml = filteredRows
      .map(
        (r, idx) => `
      <tr>
        <td style="text-align:center;font-weight:600;">${idx + 1}</td>
        <td>
          <div style="font-weight:600;">${formatDateDisplay(r.rawInvestBillDate || r.investBillDate)}</div>
          <div style="font-size:11px;color:#64748b;">#${r.investBillNo || ""}</div>
        </td>
        <td style="font-family:monospace;font-weight:600;">${r.uhid || "—"}</td>
        <td>
          <div style="font-weight:700;">${r.patientName || "—"}</div>
          <div style="font-size:11px;color:#64748b;">${r.gender || ""} / ${r.age || ""}${r.age_type || "Y"}</div>
        </td>
        <td style="font-weight:600;">${r.phone || r.mobilePhone || "—"}</td>
        <td>${r.packageName || "—"}</td>
        <td style="font-weight:700;color:#0f766e;">${r.formattedDueDate}</td>
        <td>${r.doctorName || r.referredByName || "SELF"}</td>
      </tr>
    `,
      )
      .join("");

    const filterSummary = `
      <div style="display:flex;justify-content:space-between;margin-bottom:14px;background:#f8fafc;padding:10px 14px;border-radius:8px;border:1px solid #e2e8f0;font-size:12px;">
        <div><strong>Target Due Date:</strong> ${targetDateFormatted} (${daysOffset >= 0 ? `+${daysOffset} Days` : `${daysOffset} Days`})</div>
        <div><strong>Filter Mode:</strong> ${filterMode.toUpperCase()}</div>
        <div><strong>Total Patients Listed:</strong> ${filteredRows.length}</div>
        <div><strong>Generated On:</strong> ${format(new Date(), "dd/MM/yyyy hh:mm a")}</div>
      </div>
    `;

    const printedByName =
      localStorage.getItem("name") ||
      localStorage.getItem("username") ||
      localStorage.getItem("employeeName") ||
      localStorage.getItem("employeeId") ||
      "System User";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MHC Next Due & Review List</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 12px; }
            .header-img { width: 100%; max-height: 80px; object-fit: contain; margin-bottom: 12px; }
            h2 { color: #0f766e; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; text-align: center; }
            .sub-title { text-align: center; color: #64748b; font-size: 12px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
            th { background: #0f766e; color: #ffffff; padding: 7px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #0f766e; }
            td { padding: 6px 8px; border: 1px solid #e2e8f0; vertical-align: middle; }
            tr:nth-child(even) { background: #f8fafc; }
            .footer { margin-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; }
            @media print {
              thead { display: table-header-group; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <img src="${headerImage}" class="header-img" onerror="this.style.display='none'" />
          <h2>🩺 Master Health Check-up (MHC) — Next Due & Review Schedule</h2>
          <div class="sub-title">Client follow-up & renewal reminder report</div>
          ${filterSummary}
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center;">#</th>
                <th>Last Check-up</th>
                <th>UHID</th>
                <th>Patient Details</th>
                <th>Contact No</th>
                <th>Package Name</th>
                <th>Next Due Date</th>
                <th>Doctor / Ref By</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <span>Shanmuga Hospital — MHC Follow-up Department</span>
            <span>Printed by: <strong>${printedByName}</strong></span>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      toast.error("Pop-up blocked. Please allow pop-ups for this site to print.");
    }
  };

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!filteredRows || filteredRows.length === 0) {
      toast.warn("No records to export.");
      return;
    }

    const escapeCell = (val) => {
      const str = val === null || val === undefined ? "" : String(val);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return `"${str}"`;
    };

    const headers = [
      "S.No",
      "Last Check-up Date",
      "Last Bill No",
      "UHID",
      "Patient Name",
      "Gender",
      "Age",
      "Contact Number",
      "Package Name",
      "Package ID",
      "Next Due Date",
      "Days Relative",
      "Doctor",
      "Referred By",
    ];

    const lines = [headers.map(escapeCell).join(",")];

    filteredRows.forEach((r, idx) => {
      const relStr =
        r.diffDays === 0
          ? "Today"
          : r.diffDays > 0
          ? `In ${r.diffDays} days`
          : r.diffDays < 0
          ? `Overdue by ${Math.abs(r.diffDays)} days`
          : "";

      lines.push(
        [
          idx + 1,
          formatDateDisplay(r.rawInvestBillDate || r.investBillDate),
          r.investBillNo || "",
          r.uhid || "",
          r.patientName || "",
          r.gender || "",
          `${r.age || ""}${r.age_type || "Y"}`,
          r.phone || r.mobilePhone || "",
          r.packageName || "",
          r.package_id || "",
          r.formattedDueDate || "",
          relStr,
          r.doctorName || "",
          r.referredByName || "",
        ]
          .map(escapeCell)
          .join(","),
      );
    });

    const csvContent = `${lines.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `MHC_Next_Due_List_${targetDateFormatted.replace(/\//g, "-")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV export downloaded successfully!");
  };

  return (
    <PageWrapper>
      <Container>
        <ContentCard>
          {/* Top Bar */}
          <TopBar>
            <PageHeader>
              <PageTitle>📅 MHC Patient Review & Next Due Schedule</PageTitle>
              <SubText>
                Identify upcoming health check-up renewal dates and remind clients to maintain their health reviews.
              </SubText>
            </PageHeader>
            <HeaderActions>
              <ActionBtn
                $bg="#ffffff"
                $color="#0d9488"
                $border="1.5px solid #0d9488"
                onClick={() => navigate("/MHCList")}
                title="Go to MHC Reports List"
              >
                🩺 MHC Reports List
              </ActionBtn>
              <ActionBtn
                $bg="#ffffff"
                $color="#334155"
                $border="1.5px solid #cbd5e1"
                onClick={fetchInvestigations}
                disabled={loading}
                title="Reload Data"
              >
                🔄 {loading ? "Loading…" : "Refresh"}
              </ActionBtn>
              <ActionBtn
                $bg="#0f172a"
                $color="#ffffff"
                onClick={handlePrintTable}
                title="Print Filtered Table"
              >
                🖨 Print List
              </ActionBtn>
              <ActionBtn
                $bg="#059669"
                $color="#ffffff"
                onClick={handleExportCSV}
                title="Export as CSV"
              >
                ⬇ Export CSV
              </ActionBtn>
            </HeaderActions>
          </TopBar>

          {/* Stats Summary Cards */}
          <StatsGrid>
            <StatBox
              $bg="#f0fdfa"
              $border="#99f6e4"
              $clickable
              onClick={() => applyPreset("custom", daysOffset, "exact")}
            >
              <StatTitle>Due on Target Date</StatTitle>
              <StatCount $color="#0d9488">{stats.dueOnTarget}</StatCount>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                {targetDateFormatted}
              </span>
            </StatBox>

            <StatBox
              $bg="#ecfdf5"
              $border="#a7f3d0"
              $clickable
              onClick={() => applyPreset("today", 0, "exact")}
            >
              <StatTitle>Due Today</StatTitle>
              <StatCount $color="#059669">{stats.dueToday}</StatCount>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                {format(baseToday, "dd/MM/yyyy")}
              </span>
            </StatBox>

            <StatBox
              $bg="#eff6ff"
              $border="#bfdbfe"
              $clickable
              onClick={() => applyPreset("7d", 7, "range")}
            >
              <StatTitle>Due Next 7 Days</StatTitle>
              <StatCount $color="#2563eb">{stats.dueNext7}</StatCount>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                Within this week
              </span>
            </StatBox>

            <StatBox
              $bg="#fef2f2"
              $border="#fecaca"
              $clickable
              onClick={() => applyPreset("overdue", 0, "overdue")}
            >
              <StatTitle>Overdue Reviews</StatTitle>
              <StatCount $color="#dc2626">{stats.overdue}</StatCount>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                Pending renewals
              </span>
            </StatBox>

            <StatBox $bg="#f8fafc" $border="#e2e8f0">
              <StatTitle>Contactable Clients</StatTitle>
              <StatCount $color="#475569">{stats.contactable}</StatCount>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                Of {stats.total} total records
              </span>
            </StatBox>
          </StatsGrid>

          {/* Due Calculator Control Panel */}
          <CalculatorPanel>
            <CalcHeader>
              <CalcControls>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f766e" }}>
                  🔢 Add Days to Current Date:
                </span>
                <InputGroup>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>+</span>
                  <NumberInput
                    type="number"
                    min="-365"
                    max="730"
                    value={daysOffset}
                    onChange={(e) => handleDaysChange(e.target.value)}
                    placeholder="0"
                  />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>Days</span>
                </InputGroup>

                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b" }}>or pick date:</span>
                <StyledInput
                  type="date"
                  value={targetDateInputVal}
                  onChange={handleDatePickerChange}
                  style={{ width: "160px", height: "36px", fontWeight: 600 }}
                />

                <TargetDateBadge>
                  🎯 Target Due Date: <span>{targetDateFormatted}</span>
                  <span style={{ opacity: 0.85, fontSize: "0.75rem" }}>
                    ({daysOffset === 0 ? "Today" : daysOffset > 0 ? `in ${daysOffset}d` : `${Math.abs(daysOffset)}d ago`})
                  </span>
                </TargetDateBadge>
              </CalcControls>

              {/* Filter Mode Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>Mode:</span>
                <StyledSelect
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                  style={{ width: "210px", height: "36px", fontWeight: 600 }}
                >
                  <option value="exact">🎯 Exact Due Date ({targetDateFormatted})</option>
                  <option value="range">📅 Range (Today to Target Date)</option>
                  <option value="overdue">⚠️ Overdue Only (&lt; Today)</option>
                  <option value="upcoming">⏳ All Upcoming (≥ Today)</option>
                  <option value="all_due">📋 All Scheduled Reviews</option>
                  <option value="all">🌐 All Records</option>
                </StyledSelect>
              </div>
            </CalcHeader>

            {/* Quick Presets */}
            <PresetsWrapper>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Quick Offsets:
              </span>
              <PresetChip
                $active={activePreset === "today" && filterMode === "exact"}
                onClick={() => applyPreset("today", 0, "exact")}
              >
                Today (0d)
              </PresetChip>
              <PresetChip
                $active={activePreset === "tomorrow" && filterMode === "exact"}
                onClick={() => applyPreset("tomorrow", 1, "exact")}
              >
                Tomorrow (+1d)
              </PresetChip>
              <PresetChip
                $active={activePreset === "2d" && filterMode === "exact"}
                onClick={() => applyPreset("2d", 2, "exact")}
              >
                +2 Days
              </PresetChip>
              <PresetChip
                $active={activePreset === "3d" && filterMode === "exact"}
                onClick={() => applyPreset("3d", 3, "exact")}
              >
                +3 Days
              </PresetChip>
              <PresetChip
                $active={activePreset === "7d"}
                onClick={() => applyPreset("7d", 7, "range")}
              >
                +7 Days (Next 1 Wk)
              </PresetChip>
              <PresetChip
                $active={activePreset === "15d"}
                onClick={() => applyPreset("15d", 15, "range")}
              >
                +15 Days
              </PresetChip>
              <PresetChip
                $active={activePreset === "30d"}
                onClick={() => applyPreset("30d", 30, "range")}
              >
                +30 Days (1 Month)
              </PresetChip>
              <PresetChip
                $active={filterMode === "overdue"}
                onClick={() => applyPreset("overdue", 0, "overdue")}
                style={{ color: filterMode === "overdue" ? "#ffffff" : "#dc2626" }}
              >
                ⚠️ Overdue
              </PresetChip>
              <PresetChip
                $active={filterMode === "all_due"}
                onClick={() => applyPreset("all_due", 0, "all_due")}
              >
                All Scheduled
              </PresetChip>
            </PresetsWrapper>
          </CalculatorPanel>

          {/* Search & Filter Bar */}
          <FilterBar>
            <FilterField>
              <FilterLabel>🔍 Search Patients / Bill / Phone</FilterLabel>
              <StyledInput
                type="text"
                placeholder="Search patient, UHID, phone, bill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </FilterField>

            <FilterField>
              <FilterLabel>📦 MHC Package</FilterLabel>
              <StyledSelect
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
              >
                <option value="ALL">All Packages ({packageOptions.length})</option>
                {packageOptions.map((pkg) => (
                  <option key={pkg} value={pkg}>
                    {pkg}
                  </option>
                ))}
              </StyledSelect>
            </FilterField>

            <FilterField>
              <FilterLabel>👨‍⚕️ Doctor / Referred By</FilterLabel>
              <StyledSelect
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="ALL">All Doctors</option>
                {doctorOptions.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </StyledSelect>
            </FilterField>

            <FilterField>
              <FilterLabel>📱 Contact Availability</FilterLabel>
              <StyledSelect
                value={contactFilter}
                onChange={(e) => setContactFilter(e.target.value)}
              >
                <option value="ALL">All Patients</option>
                <option value="HAS_PHONE">Has Phone Number</option>
                <option value="NO_PHONE">Missing Phone Number</option>
              </StyledSelect>
            </FilterField>

            <FilterField>
              <FilterLabel>📋 Report Status</FilterLabel>
              <StyledSelect
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
              >
                <option value="ALL">All Report Statuses</option>
                <option value="APPROVED">Approved Reports</option>
                <option value="PENDING">Pending / Draft Reports</option>
              </StyledSelect>
            </FilterField>
          </FilterBar>

          {/* Results Summary Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.85rem",
              padding: "0 4px",
            }}
          >
            <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1e293b" }}>
              Showing {filteredRows.length} client{filteredRows.length !== 1 ? "s" : ""} matching due schedule
            </span>
            {(searchQuery || selectedPackage !== "ALL" || selectedDoctor !== "ALL" || contactFilter !== "ALL" || reportStatusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPackage("ALL");
                  setSelectedDoctor("ALL");
                  setContactFilter("ALL");
                  setReportStatusFilter("ALL");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0d9488",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table */}
          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  <Th style={{ width: "45px", textAlign: "center" }}>#</Th>
                  <Th style={{ minWidth: "130px" }}>Last Check-up</Th>
                  <Th style={{ minWidth: "120px" }}>UHID</Th>
                  <Th style={{ minWidth: "180px" }}>Patient Details</Th>
                  <Th style={{ minWidth: "160px" }}>Contact No</Th>
                  <Th style={{ minWidth: "180px" }}>Package Name</Th>
                  <Th style={{ minWidth: "140px" }}>Next Due Date</Th>
                  <Th style={{ minWidth: "140px" }}>Doctor / Ref By</Th>
                </Tr>
              </thead>
              <tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      🔄 Loading MHC patient investigations & due dates...
                    </Td>
                  </Tr>
                ) : filteredRows.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} style={{ textAlign: "center", padding: "45px 20px", color: "#64748b" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📭</div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "#334155" }}>
                        No MHC clients found for this due date schedule.
                      </div>
                      <div style={{ fontSize: "0.82rem", marginTop: "4px" }}>
                        Try adjusting the <strong>Days offset</strong> or changing the filter mode to <strong>Range</strong> or <strong>All Scheduled</strong>.
                      </div>
                    </Td>
                  </Tr>
                ) : (
                  filteredRows.map((row, idx) => {
                    const phone = row.phone || row.mobilePhone || "";
                    const diffDays = row.diffDays;

                    // Due styling
                    let badgeBg = "#ecfdf5";
                    let badgeColor = "#065f46";
                    let badgeBorder = "#a7f3d0";
                    let countdownText = "";
                    let countdownBg = "#f1f5f9";
                    let countdownColor = "#475569";

                    if (diffDays === 0) {
                      badgeBg = "#ecfdf5";
                      badgeColor = "#059669";
                      badgeBorder = "#6ee7b7";
                      countdownText = "🔥 Due Today";
                      countdownBg = "#dcfce7";
                      countdownColor = "#15803d";
                    } else if (diffDays > 0) {
                      badgeBg = "#f0fdfa";
                      badgeColor = "#0d9488";
                      badgeBorder = "#99f6e4";
                      countdownText = `⏳ In ${diffDays} day${diffDays > 1 ? "s" : ""}`;
                      countdownBg = "#ccfbf1";
                      countdownColor = "#0f766e";
                    } else if (diffDays < 0) {
                      badgeBg = "#fef2f2";
                      badgeColor = "#dc2626";
                      badgeBorder = "#fecaca";
                      countdownText = `⚠️ Overdue (${Math.abs(diffDays)}d)`;
                      countdownBg = "#fee2e2";
                      countdownColor = "#991b1b";
                    }

                    return (
                      <Tr key={row.investBillNo || idx} isEven={idx % 2 === 0}>
                        <Td style={{ textAlign: "center", fontWeight: 700, color: "#64748b" }}>
                          {idx + 1}
                        </Td>

                        {/* Last Check-up / Bill Date */}
                        <Td>
                          <div style={{ fontWeight: 600, color: "#334155" }}>
                            {formatDateDisplay(row.rawInvestBillDate || row.investBillDate)}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                            Bill: #{row.investBillNo}
                          </div>
                        </Td>

                        {/* UHID */}
                        <Td style={{ fontWeight: 700, color: "#0f766e", fontFamily: "monospace" }}>
                          {row.uhid || "—"}
                        </Td>

                        {/* Patient Details */}
                        <Td>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>
                            {row.patientName || "—"}
                            {(row.gender || row.age) && (
                              <GenderAgeBadge>
                                {row.gender?.charAt(0) || ""}{row.age ? `/${row.age}${row.age_type || "Y"}` : ""}
                              </GenderAgeBadge>
                            )}
                          </div>
                          {row.ipNumber && (
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              IP: {row.ipNumber}
                            </div>
                          )}
                        </Td>

                        {/* Contact Number */}
                        <Td style={{ fontWeight: 600, color: phone ? "#334155" : "#94a3b8" }}>
                          {phone || "—"}
                        </Td>

                        {/* Package Name */}
                        <Td>
                          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.84rem" }}>
                            {row.packageName || "—"}
                          </div>
                          {row.package_id && (
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              Pkg #{row.package_id}
                            </div>
                          )}
                        </Td>

                        {/* Next Due Date & Countdown */}
                        <Td>
                          <DueBadge $bg={badgeBg} $color={badgeColor} $border={badgeBorder}>
                            📅 {row.formattedDueDate}
                          </DueBadge>
                          {countdownText && (
                            <div>
                              <CountdownChip $bg={countdownBg} $color={countdownColor}>
                                {countdownText}
                              </CountdownChip>
                            </div>
                          )}
                        </Td>

                        {/* Doctor / Referred By */}
                        <Td style={{ fontSize: "0.82rem", color: "#475569" }}>
                          {row.doctorName || row.referredByName || "SELF"}
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </ContentCard>
      </Container>
    </PageWrapper>
  );
};

export default MHCReviewList;

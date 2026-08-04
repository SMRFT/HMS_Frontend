import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import {
  PageWrapper,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Select,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ButtonContainer,
  colors,
} from "../GlobalStyles";
import { toast } from "react-toastify";

// ─── Animations ─────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Container = styled(PageWrapper)`
  background: #f8fafc;
  padding: 16px 20px;
  animation: ${fadeIn} 0.35s ease-in-out;
  @media (max-width: 768px) {
    padding: 8px 10px;
  }
`;

const ContentCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 22px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
  margin-bottom: 18px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  @media (max-width: 768px) {
    padding: 12px 14px;
    margin-bottom: 12px;
    border-radius: 8px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${colors.primary};
  padding-bottom: 12px;
  margin-bottom: 16px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${colors.primary};
    margin: 0;
    letter-spacing: -0.3px;
    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }

  span.badge {
    background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const SearchGrid = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 540px;
  width: 100%;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    max-width: 100%;

    button {
      width: 100%;
      height: 38px !important;
    }
  }
`;

const PatientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 16px;
  margin-top: 10px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 12px;
  }
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  span.label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  span.value {
    font-size: 0.92rem;
    font-weight: 700;
    color: #0f172a;

    &.highlight {
      color: ${colors.primary};
    }
    &.badge-time {
      background: #e0f2fe;
      color: #0369a1;
      padding: 3px 10px;
      border-radius: 6px;
      display: inline-block;
      width: fit-content;
      font-size: 0.85rem;
      border: 1px solid #bae6fd;
    }
  }
`;

const StatusBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.88rem;
  font-weight: 600;

  background: ${(props) => (props.$hasHistory ? "#ecfdf5" : "#eff6ff")};
  color: ${(props) => (props.$hasHistory ? "#047857" : "#1d4ed8")};
  border: 1px solid ${(props) => (props.$hasHistory ? "#a7f3d0" : "#bfdbfe")};

  @media (max-width: 600px) {
    font-size: 0.8rem;
    padding: 10px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SelectionCard = styled.div`
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 16px 18px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ResponsiveSelectionGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    .sel-field-group {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      flex: 1 1 100% !important;
    }

    .sel-btn-group {
      width: 100% !important;
      margin-top: 4px;

      button {
        width: 100% !important;
        height: 38px !important;
      }
    }
  }
`;

const FilterControlBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  .date-box {
    display: flex;
    align-items: center;
    gap: 6px;

    span {
      font-size: 0.82rem;
      font-weight: 600;
      color: #64748b;
      white-space: nowrap;
    }

    input {
      width: 140px;
      font-size: 0.82rem;
      padding: 4px 8px;
    }
  }

  @media (max-width: 850px) {
    width: 100%;
    gap: 8px;
    margin-top: 6px;

    .date-box {
      flex: 1 1 140px;
      input {
        width: 100% !important;
      }
    }

    .filter-btn {
      flex: 1 1 auto;
      height: 36px !important;
    }
  }
`;

const ResponsiveTableWrapper = styled(TableWrapper)`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  table {
    min-width: 650px;
  }
`;

const StatusChip = styled.span`
  font-size: 0.76rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;

  &.given {
    background: #d1fae5;
    color: #047857;
    border: 1px solid #6ee7b7;
  }
  &.pending {
    background: #fffbebf5;
    color: #b45309;
    border: 1px solid #fde68a;
  }
`;

// ─── Custom YES/NO Toggle Switch Component ─────────────────────────────────────
const ToggleContainer = styled.div`
  display: inline-flex;
  align-items: center;
  background: ${(props) => (props.$active ? "#dcfce7" : "#fee2e2")};
  border: 1.5px solid ${(props) => (props.$active ? "#22c55e" : "#ef4444")};
  border-radius: 20px;
  padding: 3px;
  cursor: pointer;
  user-select: none;
  transition: all 0.25s ease;
  width: 90px;
  position: relative;
`;

const ToggleOption = styled.span`
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 2;
  transition: color 0.25s ease;
  color: ${(props) =>
    props.$selected
      ? props.$isYes
        ? "#15803d"
        : "#b91c1c"
      : "#94a3b8"};
`;

const ToggleSlider = styled.div`
  position: absolute;
  top: 2px;
  left: ${(props) => (props.$active ? "46px" : "2px")};
  width: 42px;
  height: 22px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
`;

const ToggleSwitch = ({ value, onChange, disabled }) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!value);
    }
  };

  return (
    <ToggleContainer $active={value} onClick={handleClick}>
      <ToggleSlider $active={value} />
      <ToggleOption $selected={!value} $isYes={false}>
        NO
      </ToggleOption>
      <ToggleOption $selected={value} $isYes={true}>
        YES
      </ToggleOption>
    </ToggleContainer>
  );
};

// ─── Modal Styled Components ──────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: ${fadeIn} 0.25s ease-out;
`;

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  width: 92%;
  max-width: 650px;
  padding: 22px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.22);
  border: 1px solid #cbd5e1;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid ${colors.primary};

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${colors.primary};
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #64748b;
  &:hover {
    color: #ef4444;
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
const Vaccination = () => {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Search state
  const [searchUhid, setSearchUhid] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Patient Info from op-patient endpoint
  const [patientData, setPatientData] = useState(null);

  // Vaccination Master Data fetched from hospital_vaccinationMaster
  const [vaccineMasters, setVaccineMasters] = useState([]);

  // Patient Vaccination Document state
  const [recordDate, setRecordDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [motherUhid, setMotherUhid] = useState("");
  const [vaccinationList, setVaccinationList] = useState([]);
  const [hasPreviousRecord, setHasPreviousRecord] = useState(false);

  // Form Selection state for adding/updating a vaccine
  const [selectedVaccineId, setSelectedVaccineId] = useState("");
  const [selectedVaccineDate, setSelectedVaccineDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedIsVaccination, setSelectedIsVaccination] = useState(true);

  // Pending Vaccinations Patient List state
  const [pendingList, setPendingList] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingFromDate, setPendingFromDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pendingToDate, setPendingToDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Vaccination Master Management Modal State
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [allMasterList, setAllMasterList] = useState([]);
  const [newMasterName, setNewMasterName] = useState("");
  const [editingMasterId, setEditingMasterId] = useState(null);
  const [editingMasterName, setEditingMasterName] = useState("");
  const [masterLoading, setMasterLoading] = useState(false);

  // Helper to fetch active vaccine masters for dropdown
  const fetchMasters = async () => {
    try {
      const result = await apiRequest(`${HMSURL}vaccination-masters/`, "GET");
      if (result.success && result.data) {
        const list = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data.data)
            ? result.data.data
            : [];
        setVaccineMasters(list);
      }
    } catch (err) {
      console.error("Failed to load vaccination masters", err);
    }
  };

  // Fetch all master vaccines including inactive for modal management
  const fetchAllMasters = async () => {
    setMasterLoading(true);
    try {
      const res = await apiRequest(`${HMSURL}vaccination-masters/?include_inactive=true`, "GET");
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data.data) ? res.data.data : [];
        setAllMasterList(list);
      }
    } catch (err) {
      console.error("Failed to load all vaccination masters", err);
    } finally {
      setMasterLoading(false);
    }
  };

  const handleOpenMasterModal = () => {
    setShowMasterModal(true);
    fetchAllMasters();
  };

  const handleAddMaster = async () => {
    if (!newMasterName.trim()) {
      toast.error("Please enter a vaccine name");
      return;
    }
    setMasterLoading(true);
    try {
      const res = await apiRequest(`${HMSURL}add-vaccination-master/`, "POST", {
        vaccination_name: newMasterName.trim(),
      });
      if (res.success) {
        toast.success(res.message || "Vaccine added successfully!");
        setNewMasterName("");
        fetchAllMasters();
        fetchMasters();
      } else {
        toast.error(res.error || "Failed to add vaccine master.");
      }
    } catch (err) {
      toast.error("An error occurred while adding vaccine master.");
    } finally {
      setMasterLoading(false);
    }
  };

  const handleSaveEditMaster = async (vId) => {
    if (!editingMasterName.trim()) {
      toast.error("Vaccine name cannot be empty");
      return;
    }
    setMasterLoading(true);
    try {
      const res = await apiRequest(`${HMSURL}update-vaccination-master/${vId}/`, "PUT", {
        vaccination_name: editingMasterName.trim(),
      });
      if (res.success) {
        toast.success("Vaccine master updated successfully!");
        setEditingMasterId(null);
        setEditingMasterName("");
        fetchAllMasters();
        fetchMasters();
      } else {
        toast.error(res.error || "Failed to update vaccine master.");
      }
    } catch (err) {
      toast.error("An error occurred while updating vaccine master.");
    } finally {
      setMasterLoading(false);
    }
  };

  const handleToggleMasterStatus = async (vId, currentStatus) => {
    setMasterLoading(true);
    try {
      const res = await apiRequest(
        `${HMSURL}delete-vaccination-master/${vId}/?toggle=true`,
        "DELETE"
      );
      if (res.success) {
        toast.success(res.message || "Vaccine master status updated!");
        fetchAllMasters();
        fetchMasters();
      } else {
        toast.error(res.error || "Failed to change vaccine status.");
      }
    } catch (err) {
      toast.error("An error occurred while updating status.");
    } finally {
      setMasterLoading(false);
    }
  };

  // 1. Fetch Vaccine Masters and Pending Patient List on load
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const result = await apiRequest(`${HMSURL}vaccination-masters/`, "GET");
        if (result.success && result.data) {
          const list = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.data.data)
              ? result.data.data
              : [];
          setVaccineMasters(list);
        }
      } catch (err) {
        console.error("Failed to load vaccination masters", err);
      }
    };
    fetchMasters();
    const todayStr = new Date().toISOString().split("T")[0];
    fetchPendingPatients(todayStr, todayStr);
  }, [HMSURL]);

  const [whatsappSentCount, setWhatsappSentCount] = useState(0);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [previewReminders, setPreviewReminders] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  // Fetch pending patients for a specific date range (from_date to to_date)
  const fetchPendingPatients = async (fromStr, toStr) => {
    setPendingLoading(true);
    try {
      const fDate = fromStr || pendingFromDate;
      const tDate = toStr || pendingToDate;
      const res = await apiRequest(
        `${HMSURL}pending-vaccinations/?from_date=${fDate}&to_date=${tDate}`,
        "GET"
      );
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];
        setPendingList(list);
        if (typeof res.data?.whatsapp_sent_count === "number") {
          setWhatsappSentCount(res.data.whatsapp_sent_count);
        } else if (typeof res.whatsapp_sent_count === "number") {
          setWhatsappSentCount(res.whatsapp_sent_count);
        }
      }
    } catch (err) {
      console.error("Error loading pending vaccinations list:", err);
    } finally {
      setPendingLoading(false);
    }
  };

  // Handle CSV / Excel export of filtered pending list
  const handleExportExcel = () => {
    if (!pendingList || pendingList.length === 0) {
      toast.warn("No pending vaccination records to export.");
      return;
    }

    const headers = [
      "S.No",
      "UHID",
      "Patient Name",
      "Gender / Age",
      "Mobile Phone",
      "Mother's UHID",
      "Pending Vaccine(s)",
    ];

    const rows = pendingList.map((item, index) => {
      const vaccinesStr = item.pending_vaccines
        ? item.pending_vaccines
          .map((v) => `${v.vaccination_name} (${v.vaccination_date})`)
          .join("; ")
        : "";
      return [
        index + 1,
        `"${item.uhid || ""}"`,
        `"${item.patient_name || ""}"`,
        `"${item.gender || "N/A"} / ${item.age ? item.age + " Yrs" : ""}"`,
        `"${item.mobilePhone || ""}"`,
        `"${item.mother_uhid || ""}"`,
        `"${vaccinesStr}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Pending_Vaccinations_${pendingFromDate}_to_${pendingToDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported pending vaccinations to Excel/CSV.");
  };

  // Handle Print preview of filtered pending list
  const handlePrint = () => {
    if (!pendingList || pendingList.length === 0) {
      toast.warn("No pending vaccination records to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pending Vaccinations Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
            h2 { color: #0d9488; margin-bottom: 4px; }
            p.meta { font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 12px; text-align: left; }
            th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge { background: #fffbebf5; color: #b45309; border: 1px solid #fde68a; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 11px; margin: 2px; }
          </style>
        </head>
        <body>
          <h2>Pending Vaccinations Report</h2>
          <p class="meta">
            <strong>Date Range:</strong> ${pendingFromDate} to ${pendingToDate} | 
            <strong>Total Records:</strong> ${pendingList.length} | 
            <strong>Generated On:</strong> ${new Date().toLocaleString()}
          </p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>UHID</th>
                <th>Patient Name</th>
                <th>Gender / Age</th>
                <th>Mobile Phone</th>
                <th>Mother's UHID</th>
                <th>Pending Vaccine(s)</th>
              </tr>
            </thead>
            <tbody>
              ${pendingList
        .map(
          (item, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td><strong>${item.uhid}</strong></td>
                  <td>${item.patient_name || item.uhid}</td>
                  <td>${item.gender || "N/A"} ${item.age ? `/ ${item.age} Yrs` : ""}</td>
                  <td>${item.mobilePhone || "N/A"}</td>
                  <td>${item.mother_uhid || "N/A"}</td>
                  <td>
                    ${item.pending_vaccines
              ? item.pending_vaccines
                .map(
                  (v) =>
                    `<span class="badge">${v.vaccination_name} (${v.vaccination_date})</span>`
                )
                .join(" ")
              : ""
            }
                  </td>
                </tr>
              `
        )
        .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleOpenReminderModal = async () => {
    setPreviewLoading(true);
    setShowReminderModal(true);
    try {
      const res = await apiRequest(
        `${HMSURL}preview-vaccination-reminders/?date=${pendingFromDate}`,
        "GET"
      );
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
            ? res.data.data
            : [];
        setPreviewReminders(list);
      } else {
        toast.error(res.error || "Failed to load reminder preview.");
      }
    } catch (err) {
      console.error("Error previewing reminders:", err);
      toast.error("Failed to load reminder preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmSendReminders = async () => {
    setSendingReminders(true);
    try {
      const res = await apiRequest(`${HMSURL}send-vaccination-reminders/`, "POST", {
        date: pendingFromDate,
      });
      if (res.success && res.data) {
        const d = res.data.data || res.data;
        const sent = d.reminders_sent ?? 0;
        const skipped = d.reminders_skipped ?? 0;
        const failed = d.failed_sends ?? 0;
        toast.success(
          `Reminders Processed! Sent: ${sent}, Skipped: ${skipped}, Failed: ${failed}`,
          { position: "top-right", autoClose: 5000 }
        );
        setShowReminderModal(false);
        fetchPendingPatients(pendingFromDate, pendingToDate);
      } else {
        toast.error(`Reminder send error: ${res.error || "Failed to send reminders"}`);
      }
    } catch (err) {
      console.error("Error sending WhatsApp reminders:", err);
      toast.error("An error occurred while sending WhatsApp reminders.");
    } finally {
      setSendingReminders(false);
    }
  };

  const handleSendSingleWhatsApp = async (targetUhid, patientName) => {
    setSendingReminders(true);
    try {
      const res = await apiRequest(`${HMSURL}send-vaccination-reminders/`, "POST", {
        date: pendingFromDate,
        uhid: targetUhid,
      });
      if (res.success && res.data) {
        const d = res.data.data || res.data;
        const sent = d.reminders_sent ?? 0;
        const skipped = d.reminders_skipped ?? 0;
        const detail = d.details?.[0];
        const isSuccess = sent > 0 || detail?.status === "Success" || detail?.result?.success === true;
        const isSkipped = skipped > 0 || detail?.status === "Skipped" || detail?.result?.skipped === true;

        if (isSuccess) {
          toast.success(`WhatsApp reminder sent successfully to ${patientName || targetUhid}!`, { autoClose: 4000 });
        } else if (isSkipped) {
          toast.info(`Reminder already sent today to ${patientName || targetUhid}.`, { autoClose: 4000 });
        } else {
          const errMsg = detail?.result?.error || detail?.result?.response?.error || "Please check phone number.";
          toast.warn(`Failed to send reminder to ${patientName || targetUhid}. ${errMsg}`, { autoClose: 5000 });
        }
        fetchPendingPatients(pendingFromDate, pendingToDate);
      } else {
        toast.error(`Error sending WhatsApp reminder: ${res.error || "Failed to send"}`);
      }
    } catch (err) {
      console.error("Error sending single WhatsApp reminder:", err);
      toast.error("Error sending WhatsApp reminder");
    } finally {
      setSendingReminders(false);
    }
  };

  // 2. Perform UHID Search helper
  const handleSearchByUhid = async (targetUhid) => {
    const cleanUhid = targetUhid.trim();
    if (!cleanUhid) {
      toast.error("Please enter a valid UHID");
      return;
    }

    setLoading(true);
    try {
      // Fetch Patient Basic + New Born details
      const pRes = await apiRequest(
        `${HMSURL}op-patient/${encodeURIComponent(cleanUhid)}/`,
        "GET"
      );

      if (!pRes.success || !pRes.data) {
        toast.error(pRes.error || "Patient record not found");
        setPatientData(null);
        setVaccinationList([]);
        setLoading(false);
        return;
      }

      const pData = pRes.data?.data && typeof pRes.data.data === "object" && !Array.isArray(pRes.data.data)
        ? pRes.data.data
        : pRes.data;

      setPatientData(pData);
      setMotherUhid(pData.mothers_uhid_no || "");

      // Fetch Patient Vaccination record (if stored)
      const vRes = await apiRequest(
        `${HMSURL}patient-vaccination/${encodeURIComponent(cleanUhid)}/`,
        "GET"
      );

      const vData = vRes.data?.data && typeof vRes.data.data === "object" && !Array.isArray(vRes.data.data)
        ? vRes.data.data
        : vRes.data;

      if (vRes.success && vData && (vData.exists || (vData.vaccination_details && vData.vaccination_details.length > 0))) {
        setHasPreviousRecord(true);
        setRecordDate(
          vData.date || new Date().toISOString().split("T")[0]
        );
        if (vData.mother_uhid) {
          setMotherUhid(vData.mother_uhid);
        }

        const storedDetails = vData.vaccination_details || [];
        setVaccinationList(storedDetails);
        toast.info("Loaded stored vaccination history for patient");
      } else {
        setHasPreviousRecord(false);
        setRecordDate(new Date().toISOString().split("T")[0]);
        setVaccinationList([]);
        toast.success("Patient details loaded. Select vaccines from the dropdown to add.");
      }
    } catch (err) {
      toast.error("Error fetching patient details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    handleSearchByUhid(searchUhid);
  };

  // 3. Add or Update Vaccine from Dropdown Selection
  const handleAddOrUpdateVaccine = () => {
    if (!selectedVaccineId) {
      toast.error("Please select a Vaccination from the dropdown.");
      return;
    }

    const vId = Number(selectedVaccineId);
    const masterObj = vaccineMasters.find(
      (m) => Number(m.vaccination_id) === vId
    );
    const vName = masterObj
      ? masterObj.vaccination_name
      : `Vaccine #${vId}`;

    setVaccinationList((prev) => {
      const existingIndex = prev.findIndex(
        (item) => Number(item.vaccination_id) === vId
      );

      if (existingIndex >= 0) {
        // Update existing row
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          vaccination_id: vId,
          vaccination_name: vName,
          vaccination_date: selectedVaccineDate,
          vaccinated_date: selectedIsVaccination ? selectedVaccineDate : null,
          is_vaccination: selectedIsVaccination,
        };
        toast.info(`Updated "${vName}" in vaccination list`);
        return updated;
      } else {
        // Add new row
        const newItem = {
          vaccination_id: vId,
          vaccination_name: vName,
          vaccination_date: selectedVaccineDate,
          vaccinated_date: selectedIsVaccination ? selectedVaccineDate : null,
          is_vaccination: selectedIsVaccination,
        };
        toast.success(`Added "${vName}" to vaccination list`);
        return [...prev, newItem];
      }
    });

    // Reset selection dropdown
    setSelectedVaccineId("");
  };

  // Populate all master vaccines into table at once
  const handlePopulateAllMasterVaccines = () => {
    if (!vaccineMasters.length) {
      toast.warn("No master vaccines available.");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const existingMap = {};
    vaccinationList.forEach((item) => {
      existingMap[Number(item.vaccination_id)] = item;
    });

    const fullList = vaccineMasters.map((m) => {
      const vId = Number(m.vaccination_id);
      const existing = existingMap[vId];
      const isVac = existing ? Boolean(existing.is_vaccination) : false;
      return {
        vaccination_id: vId,
        vaccination_name: m.vaccination_name,
        vaccination_date: existing ? existing.vaccination_date : todayStr,
        vaccinated_date: isVac ? (existing?.vaccinated_date || todayStr) : null,
        is_vaccination: isVac,
      };
    });

    setVaccinationList(fullList);
    toast.info("Populated all master vaccines in the checklist table.");
  };

  // 4. Update single row's values in table
  const handleItemChange = (index, field, value) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setVaccinationList((prev) => {
      const updated = [...prev];
      if (field === "is_vaccination") {
        const isVac = Boolean(value);
        updated[index] = {
          ...updated[index],
          is_vaccination: isVac,
          // Set vaccinated_date to date string if YES (true); set to null if NO (false)
          vaccinated_date: isVac ? (updated[index].vaccinated_date || todayStr) : null,
          vaccination_date: updated[index].vaccination_date || todayStr,
        };
      } else if (field === "vaccination_id") {
        const vId = Number(value);
        const masterObj = vaccineMasters.find(
          (m) => Number(m.vaccination_id) === vId
        );
        const vName = masterObj ? masterObj.vaccination_name : `Vaccine #${vId}`;
        updated[index] = {
          ...updated[index],
          vaccination_id: vId,
          vaccination_name: vName,
        };
      } else if (field === "vaccination_date" || field === "vaccinated_date") {
        updated[index] = {
          ...updated[index],
          vaccination_date: value,
          ...(updated[index].is_vaccination && { vaccinated_date: value }),
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Remove a row from the vaccination list
  const handleRemoveRow = (index) => {
    setVaccinationList((prev) => prev.filter((_, i) => i !== index));
    toast.info("Removed vaccine from list.");
  };

  // 5. Save/Patch Vaccination Record
  const handleSave = async () => {
    if (!patientData || !patientData.uhid) {
      toast.error("Please search and select a patient first.");
      return;
    }

    if (vaccinationList.length === 0) {
      toast.error("Please add at least one vaccination detail before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        uhid: patientData.uhid,
        mother_uhid: motherUhid.trim(),
        date: recordDate,
        vaccination_details: vaccinationList.map((item) => ({
          vaccination_id: Number(item.vaccination_id),
          vaccination_date: item.vaccination_date,
          vaccinated_date: item.is_vaccination ? (item.vaccinated_date || item.vaccination_date) : null,
          is_vaccination: Boolean(item.is_vaccination),
        })),
      };

      const result = await apiRequest(
        `${HMSURL}save-patient-vaccination/`,
        "POST",
        payload
      );

      if (result.success) {
        toast.success(result.message || "Vaccination details stored successfully!");
        setHasPreviousRecord(true);
        const respData = result.data?.data && typeof result.data.data === "object" && !Array.isArray(result.data.data)
          ? result.data.data
          : result.data;

        if (respData && respData.vaccination_details) {
          setVaccinationList(respData.vaccination_details);
        }
        fetchPendingPatients(pendingFromDate, pendingToDate);
      } else {
        toast.error(result.error || "Failed to store vaccination details.");
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // 6. Reset Form
  const handleReset = () => {
    setSearchUhid("");
    setPatientData(null);
    setMotherUhid("");
    setRecordDate(new Date().toISOString().split("T")[0]);
    setVaccinationList([]);
    setHasPreviousRecord(false);
    setSelectedVaccineId("");
    setSelectedVaccineDate(new Date().toISOString().split("T")[0]);
    setSelectedIsVaccination(true);
  };

  return (
    <Container>
      {/* ── Page Header ── */}
      <ContentCard>
        <PageHeader>
          <TitleGroup>
            <h1>Vaccination Management</h1>
          </TitleGroup>
        </PageHeader>

        {/* ── UHID Search Section ── */}
        <form onSubmit={handleSearch}>
          <SearchGrid>
            <InputWrapper style={{ flex: 1 }}>
              <Label>UHID Search *</Label>
              <Input
                type="text"
                placeholder="Enter Patient UHID (e.g. S026/0001)"
                value={searchUhid}
                onChange={(e) => setSearchUhid(e.target.value)}
              />
            </InputWrapper>
            <Button
              type="submit"
              disabled={loading}
              style={{
                background: colors.primary,
                height: "36px",
                padding: "0 22px",
                fontWeight: "600",
              }}
            >
              {loading ? "Searching..." : "Search UHID"}
            </Button>
            {patientData && (
              <Button
                type="button"
                onClick={handleReset}
                style={{
                  background: "#64748b",
                  height: "36px",
                  padding: "0 16px",
                }}
              >
                Reset
              </Button>
            )}
          </SearchGrid>
        </form>
      </ContentCard>

      {/* ── Pending Vaccinations Patient List (Initial & Date Filtered) ── */}
      <ContentCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: colors.primary,
                margin: 0,
              }}
            >
              Pending Vaccinations Patient List
            </h2>
            <span
              style={{
                background: "#fef3c7",
                color: "#92400e",
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "12px",
                border: "1px solid #fde68a",
              }}
            >
              {pendingList.length} Pending Record{pendingList.length !== 1 ? "s" : ""}
            </span>

            <span
              style={{
                background: "#ecfdf5",
                color: "#047857",
                fontSize: "0.78rem",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "12px",
                border: "1px solid #a7f3d0",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Total WhatsApp Vaccination Reminders Sent Successfully Today"
            >
              📲 {whatsappSentCount} WhatsApp Sent Today
            </span>
          </div>

          <FilterControlBar>
            <div className="date-box">
              <span>From Date:</span>
              <Input
                type="date"
                value={pendingFromDate}
                onChange={(e) => setPendingFromDate(e.target.value)}
              />
            </div>

            <div className="date-box">
              <span>To Date:</span>
              <Input
                type="date"
                value={pendingToDate}
                onChange={(e) => setPendingToDate(e.target.value)}
              />
            </div>

            <Button
              type="button"
              className="filter-btn"
              onClick={() => fetchPendingPatients(pendingFromDate, pendingToDate)}
              style={{
                background: colors.primary,
                height: "32px",
                padding: "0 16px",
                fontSize: "0.78rem",
                fontWeight: "600",
              }}
            >
              Filter
            </Button>

            <Button
              type="button"
              className="filter-btn"
              onClick={handlePrint}
              style={{
                background: "#0284c7",
                height: "32px",
                padding: "0 14px",
                fontSize: "0.78rem",
                fontWeight: "600",
              }}
            >
              🖨️ Print
            </Button>

            <Button
              type="button"
              className="filter-btn"
              onClick={handleExportExcel}
              style={{
                background: "#16a34a",
                height: "32px",
                padding: "0 14px",
                fontSize: "0.78rem",
                fontWeight: "600",
              }}
            >
              📊 Export (Excel)
            </Button>

            <Button
              type="button"
              className="filter-btn"
              onClick={handleOpenReminderModal}
              disabled={sendingReminders || previewLoading}
              style={{
                background: "#128c7e",
                color: "#ffffff",
                height: "32px",
                padding: "0 14px",
                fontSize: "0.78rem",
                fontWeight: "600",
              }}
            >
              {previewLoading ? "Loading..." : "📲 Send Reminders"}
            </Button>
          </FilterControlBar>
        </div>

        <ResponsiveTableWrapper style={{ maxHeight: "240px", overflowY: "auto" }}>
          <Table>
            <thead>
              <Tr>
                <Th style={{ width: "45px", textAlign: "center" }}>#</Th>
                <Th style={{ width: "130px" }}>UHID</Th>
                <Th style={{ minWidth: "170px" }}>Patient Name</Th>
                <Th style={{ width: "110px" }}>Gender / Age</Th>
                <Th style={{ width: "120px" }}>Mobile Phone</Th>
                <Th style={{ width: "120px" }}>Mother's UHID</Th>
                <Th style={{ minWidth: "180px" }}>Pending Vaccine(s)</Th>
                <Th style={{ width: "115px", textAlign: "center" }}>WhatsApp Count</Th>
                <Th style={{ width: "180px", textAlign: "center" }}>Action</Th>
              </Tr>
            </thead>
            <tbody>
              {pendingLoading ? (
                <Tr>
                  <Td colSpan={9} style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                    Loading pending vaccinations...
                  </Td>
                </Tr>
              ) : pendingList.length > 0 ? (
                pendingList.map((item, index) => (
                  <Tr key={item.uhid || index}>
                    <Td style={{ textAlign: "center", fontWeight: "700", color: "#64748b" }}>
                      {index + 1}
                    </Td>
                    <Td style={{ fontWeight: "700", color: colors.primary }}>
                      {item.uhid}
                    </Td>
                    <Td style={{ fontWeight: "600", color: "#1e293b" }}>
                      {item.patient_name || item.uhid}
                    </Td>
                    <Td style={{ fontSize: "0.82rem" }}>
                      {item.gender || "N/A"} {item.age ? `/ ${item.age} Yrs` : ""}
                    </Td>
                    <Td style={{ fontSize: "0.82rem" }}>
                      {item.mobilePhone || "N/A"}
                    </Td>
                    <Td style={{ fontSize: "0.82rem", color: "#475569" }}>
                      {item.mother_uhid || "N/A"}
                    </Td>
                    <Td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {item.pending_vaccines?.map((pv) => (
                          <span
                            key={pv.vaccination_id}
                            style={{
                              background: "#fffbebf5",
                              color: "#b45309",
                              fontSize: "0.74rem",
                              fontWeight: "600",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #fde68a",
                            }}
                          >
                            {pv.vaccination_name} ({pv.vaccination_date})
                          </span>
                        ))}
                      </div>
                    </Td>
                    <Td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          background: "#ecfdf5",
                          color: "#047857",
                          fontSize: "0.74rem",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "10px",
                          border: "1px solid #a7f3d0",
                          display: "inline-block",
                        }}
                        title="Total WhatsApp Reminders Sent Successfully to this Patient"
                      >
                        📲 {item.whatsapp_sent_count || 0} Sent
                      </span>
                    </Td>
                    <Td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Button
                          type="button"
                          onClick={() => {
                            setSearchUhid(item.uhid);
                            handleSearchByUhid(item.uhid);
                          }}
                          style={{
                            background: colors.primary,
                            padding: "4px 10px",
                            fontSize: "0.74rem",
                            fontWeight: "600",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Load Record
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleSendSingleWhatsApp(item.uhid, item.patient_name)}
                          disabled={sendingReminders}
                          style={{
                            background: "#128c7e",
                            color: "#ffffff",
                            padding: "4px 10px",
                            fontSize: "0.74rem",
                            fontWeight: "600",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          📲 Send WhatsApp
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={9} style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
                    No pending vaccinations found between {pendingFromDate} and {pendingToDate}.
                  </Td>
                </Tr>
              )}
            </tbody>
          </Table>
        </ResponsiveTableWrapper>
      </ContentCard>

      {/* ── Patient & Newborn Information Display ── */}
      {patientData && (
        <ContentCard>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: colors.primary,
                margin: 0,
              }}
            >
              Patient & Newborn Profile Details
            </h2>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              UHID: <strong style={{ color: colors.primary }}>{patientData.uhid}</strong>
            </span>
          </div>

          <PatientInfoGrid>
            <InfoBox>
              <span className="label">Patient Name</span>
              <span className="value highlight">
                {patientData.salutation ? `${patientData.salutation} ` : ""}
                {patientData.firstName} {patientData.lastName}
              </span>
            </InfoBox>

            <InfoBox>
              <span className="label">Gender / Age</span>
              <span className="value">
                {patientData.gender || "N/A"} / {patientData.age ?? "N/A"} Yrs
              </span>
            </InfoBox>

            <InfoBox>
              <span className="label">Mobile Phone</span>
              <span className="value">{patientData.mobilePhone || "N/A"}</span>
            </InfoBox>

            <InfoBox>
              <span className="label">Birth Time</span>
              <span className="value badge-time">
                {patientData.birth_time || "N/A"}{" "}
                {patientData.birth_time_am_pm ? `(${patientData.birth_time_am_pm})` : ""}
              </span>
            </InfoBox>

            <InfoBox>
              <span className="label">Birth Weight</span>
              <span className="value highlight">
                {patientData.weight ? `${patientData.weight} kg` : "N/A"}
              </span>
            </InfoBox>

            <InfoBox>
              <span className="label">Mother's UHID No</span>
              <span className="value">
                {patientData.mothers_uhid_no || "N/A"}
              </span>
            </InfoBox>
          </PatientInfoGrid>
        </ContentCard>
      )}

      {/* ── Vaccination Details & Previous History ── */}
      {patientData && (
        <ContentCard>
          <StatusBanner $hasHistory={hasPreviousRecord}>
            {hasPreviousRecord ? (
              <>
                <span>✓ Stored Vaccination History Found:</span> Loaded previous vaccination record. Select vaccines from the dropdown or update the list below.
              </>
            ) : (
              <>
                <span>ℹ New Vaccination Document:</span> Select Vaccination from the dropdown below, set Date and Given status, then add to record.
              </>
            )}
          </StatusBanner>

          <FormRow style={{ marginBottom: "16px" }}>
            <InputWrapper style={{ width: "200px", flex: "none" }}>
              <Label>Record Entry Date</Label>
              <Input
                type="date"
                value={recordDate}
                disabled={true}
                style={{ background: "#f1f5f9", cursor: "not-allowed", fontWeight: "600" }}
              />
            </InputWrapper>
          </FormRow>

          {/* ── Dropdown Selection Control Area ── */}
          <SelectionCard>
            <h3
              style={{
                fontSize: "0.92rem",
                fontWeight: 700,
                color: colors.primary,
                margin: "0 0 12px 0",
              }}
            >
              Select & Add Vaccination
            </h3>
            <ResponsiveSelectionGrid>
              <InputWrapper className="sel-field-group" style={{ flex: "1 1 280px", minWidth: 0, width: "100%" }}>
                <Label>Select Vaccination *</Label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%" }}>
                  <Select
                    value={selectedVaccineId}
                    onChange={(e) => setSelectedVaccineId(e.target.value)}
                    style={{ flex: "1 1 auto", minWidth: 0, width: "100%" }}
                  >
                    <option value="">-- Choose Vaccination --</option>
                    {vaccineMasters.map((v) => (
                      <option key={v.vaccination_id} value={v.vaccination_id}>
                        {v.vaccination_name} (ID: {v.vaccination_id})
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    onClick={handleOpenMasterModal}
                    title="Manage Master Vaccine List (Add / Edit / Delete)"
                    style={{
                      background: colors.primary,
                      color: "#ffffff",
                      width: "36px",
                      height: "36px",
                      padding: 0,
                      fontSize: "1.2rem",
                      fontWeight: "700",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </Button>
                </div>
              </InputWrapper>

              <InputWrapper className="sel-field-group" style={{ width: "160px", flex: "0 0 160px" }}>
                <Label>Vaccination Date</Label>
                <Input
                  type="date"
                  value={selectedVaccineDate}
                  onChange={(e) => setSelectedVaccineDate(e.target.value)}
                />
              </InputWrapper>

              <InputWrapper className="sel-field-group" style={{ width: "140px", flex: "0 0 140px" }}>
                <Label>Is Vaccination Given?</Label>
                <div style={{ paddingTop: "2px" }}>
                  <ToggleSwitch
                    value={selectedIsVaccination}
                    onChange={(val) => {
                      setSelectedIsVaccination(val);
                      if (val) {
                        setSelectedVaccineDate(new Date().toISOString().split("T")[0]);
                      }
                    }}
                  />
                </div>
              </InputWrapper>

              <div className="sel-btn-group" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Button
                  type="button"
                  onClick={handleAddOrUpdateVaccine}
                  style={{
                    background: colors.primary,
                    height: "36px",
                    padding: "0 20px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginTop: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add / Update to List
                </Button>

                <Button
                  type="button"
                  onClick={handlePopulateAllMasterVaccines}
                  style={{
                    background: "#475569",
                    height: "36px",
                    padding: "0 16px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginTop: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  Populate All Master Vaccines
                </Button>
              </div>
            </ResponsiveSelectionGrid>
          </SelectionCard>

          {/* ── Vaccination List Table ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#334155",
                margin: 0,
              }}
            >
              Selected Vaccination Records ({vaccinationList.length})
            </h3>
          </div>

          <ResponsiveTableWrapper style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table>
              <thead>
                <Tr>
                  <Th style={{ width: "50px", textAlign: "center" }}>#</Th>
                  <Th style={{ minWidth: "220px" }}>Vaccination Name</Th>
                  <Th style={{ width: "160px" }}>Vaccination Date</Th>
                  <Th style={{ width: "150px", textAlign: "center" }}>Is Vaccination Given?</Th>
                  <Th style={{ width: "140px", textAlign: "center" }}>Status</Th>
                  <Th style={{ width: "90px", textAlign: "center" }}>Action</Th>
                </Tr>
              </thead>
              <tbody>
                {vaccinationList.length > 0 ? (
                  vaccinationList.map((item, index) => {
                    const isVaccinated = Boolean(item.is_vaccination && item.vaccinated_date);
                    return (
                      <Tr key={item.vaccination_id || index}>
                        <Td style={{ textAlign: "center", fontWeight: "700", color: "#64748b" }}>
                          {index + 1}
                        </Td>
                        <Td>
                          <Select
                            value={item.vaccination_id}
                            onChange={(e) =>
                              handleItemChange(index, "vaccination_id", e.target.value)
                            }
                            style={{ fontSize: "0.85rem", padding: "5px 8px" }}
                          >
                            {vaccineMasters.map((v) => (
                              <option key={v.vaccination_id} value={v.vaccination_id}>
                                {v.vaccination_name}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          <Input
                            type="date"
                            value={item.vaccination_date || ""}
                            onChange={(e) =>
                              handleItemChange(index, "vaccination_date", e.target.value)
                            }
                            style={{ fontSize: "0.85rem", padding: "5px 8px" }}
                          />
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <ToggleSwitch
                            value={item.is_vaccination}
                            onChange={(val) =>
                              handleItemChange(index, "is_vaccination", val)
                            }
                          />
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          {isVaccinated ? (
                            <StatusChip className="given" title="Vaccination Given">
                              ✓ {item.vaccinated_date}
                            </StatusChip>
                          ) : (
                            <StatusChip className="pending" title="Pending Administration">
                              ⏳ Pending
                            </StatusChip>
                          )}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          <Button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            disabled={isVaccinated}
                            style={{
                              background: isVaccinated ? "#e2e8f0" : "#ef4444",
                              color: isVaccinated ? "#94a3b8" : "#ffffff",
                              cursor: isVaccinated ? "not-allowed" : "pointer",
                              padding: "5px 14px",
                              fontSize: "0.75rem",
                              borderRadius: "4px",
                              opacity: isVaccinated ? 0.6 : 1,
                              border: isVaccinated ? "1px solid #cbd5e1" : "none",
                            }}
                          >
                            Remove
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })
                ) : (
                  <Tr>
                    <Td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "28px" }}>
                      No vaccination records added yet. Select vaccines from the dropdown above to populate records.
                    </Td>
                  </Tr>
                )}
              </tbody>
            </Table>
          </ResponsiveTableWrapper>

          <ButtonContainer style={{ marginTop: "22px", justifyContent: "flex-end" }}>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                background: colors.primary,
                padding: "11px 32px",
                fontSize: "0.95rem",
                fontWeight: "700",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)",
              }}
            >
              {saving ? "Saving Record..." : "Save Vaccination Details"}
            </Button>
          </ButtonContainer>
        </ContentCard>
      )}

      {/* ── Vaccination Master Management Modal Overlay ── */}
      {showMasterModal && (
        <ModalOverlay onClick={() => setShowMasterModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Manage Master Vaccination List</h3>
              <CloseBtn onClick={() => setShowMasterModal(false)}>✖</CloseBtn>
            </ModalHeader>

            {/* Add New Master Form */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <Input
                type="text"
                placeholder="Enter new vaccine name (e.g. Pneumococcal Booster)"
                value={newMasterName}
                onChange={(e) => setNewMasterName(e.target.value)}
                style={{ flex: 1, fontSize: "0.85rem", padding: "6px 12px" }}
              />
              <Button
                type="button"
                onClick={handleAddMaster}
                disabled={masterLoading}
                style={{
                  background: colors.primary,
                  padding: "0 18px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                + Add Vaccine
              </Button>
            </div>

            {/* Master Vaccines Table */}
            <TableWrapper style={{ maxHeight: "320px", overflowY: "auto" }}>
              <Table>
                <thead>
                  <Tr>
                    <Th style={{ width: "55px", textAlign: "center" }}>ID</Th>
                    <Th style={{ minWidth: "220px" }}>Vaccine Name</Th>
                    <Th style={{ width: "100px", textAlign: "center" }}>Status</Th>
                    <Th style={{ width: "160px", textAlign: "center" }}>Actions</Th>
                  </Tr>
                </thead>
                <tbody>
                  {masterLoading && allMasterList.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} style={{ textAlign: "center", color: "#64748b", padding: "16px" }}>
                        Loading vaccination masters...
                      </Td>
                    </Tr>
                  ) : allMasterList.length > 0 ? (
                    allMasterList.map((m) => (
                      <Tr key={m.vaccination_id}>
                        <Td style={{ textAlign: "center", fontWeight: "700", color: "#64748b" }}>
                          #{m.vaccination_id}
                        </Td>
                        <Td>
                          {editingMasterId === m.vaccination_id ? (
                            <Input
                              type="text"
                              value={editingMasterName}
                              onChange={(e) => setEditingMasterName(e.target.value)}
                              style={{ fontSize: "0.82rem", padding: "4px 8px" }}
                            />
                          ) : (
                            <span style={{ fontWeight: "600", color: m.is_active ? "#1e293b" : "#94a3b8" }}>
                              {m.vaccination_name}
                            </span>
                          )}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          {m.is_active ? (
                            <StatusChip className="given">Active</StatusChip>
                          ) : (
                            <StatusChip className="pending">Inactive</StatusChip>
                          )}
                        </Td>
                        <Td style={{ textAlign: "center" }}>
                          {editingMasterId === m.vaccination_id ? (
                            <Button
                              type="button"
                              onClick={() => handleSaveEditMaster(m.vaccination_id)}
                              style={{
                                background: "#16a34a",
                                padding: "4px 10px",
                                fontSize: "0.74rem",
                                marginRight: "4px",
                              }}
                            >
                              Save
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => {
                                setEditingMasterId(m.vaccination_id);
                                setEditingMasterName(m.vaccination_name);
                              }}
                              style={{
                                background: "#0284c7",
                                padding: "4px 10px",
                                fontSize: "0.74rem",
                                marginRight: "4px",
                              }}
                            >
                              Edit
                            </Button>
                          )}

                          <Button
                            type="button"
                            onClick={() => handleToggleMasterStatus(m.vaccination_id, m.is_active)}
                            style={{
                              background: m.is_active ? "#ef4444" : "#22c55e",
                              padding: "4px 10px",
                              fontSize: "0.74rem",
                            }}
                          >
                            {m.is_active ? "Delete" : "Activate"}
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} style={{ textAlign: "center", color: "#94a3b8", padding: "16px" }}>
                        No vaccination masters found.
                      </Td>
                    </Tr>
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* ── WhatsApp Reminder Confirmation Modal ── */}
      {showReminderModal && (
        <ModalOverlay onClick={() => !sendingReminders && setShowReminderModal(false)}>
          <ModalCard style={{ maxWidth: "780px", width: "92%" }} onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>📲 Confirm WhatsApp Vaccination Reminders</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowReminderModal(false)}
                disabled={sendingReminders}
              >
                &times;
              </button>
            </ModalHeader>

            <div style={{ padding: "16px 20px" }}>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "14px",
                  fontSize: "0.84rem",
                  color: "#166534",
                }}
              >
                <strong>Template:</strong> <code>sh_vaccination</code> | <strong>Scheduled Date:</strong> {pendingFromDate}
                <div style={{ marginTop: "4px", fontSize: "0.78rem", color: "#15803d" }}>
                  <em>"Dear {"{1}"}, this is a reminder that your vaccination for {"{2}"} is scheduled for tomorrow {"{3}"}. Kindly visit SHANMUGA HOSPITAL LIMITED..."</em>
                </div>
              </div>

              {previewLoading ? (
                <div style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                  Loading reminder preview list...
                </div>
              ) : previewReminders.length > 0 ? (
                <>
                  <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "10px" }}>
                    The following {previewReminders.length} patient(s) are scheduled for reminders:
                  </p>
                  <ResponsiveTableWrapper style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <Table style={{ fontSize: "0.82rem" }}>
                      <thead>
                        <Tr>
                          <Th style={{ width: "40px", textAlign: "center" }}>#</Th>
                          <Th style={{ minWidth: "160px" }}>Patient Name</Th>
                          <Th style={{ width: "130px" }}>Mobile Phone</Th>
                          <Th style={{ minWidth: "180px" }}>Vaccination Name(s)</Th>
                          <Th style={{ width: "130px", textAlign: "center" }}>Status</Th>
                        </Tr>
                      </thead>
                      <tbody>
                        {previewReminders.map((p, idx) => (
                          <Tr key={p.uhid || idx}>
                            <Td style={{ textAlign: "center", fontWeight: "700" }}>{idx + 1}</Td>
                            <Td style={{ fontWeight: "700", color: colors.primary }}>
                              {p.patient_name} <br />
                              <span style={{ fontSize: "0.74rem", color: "#64748b" }}>({p.uhid})</span>
                            </Td>
                            <Td style={{ fontWeight: "600", color: "#0f172a" }}>{p.phone || "N/A"}</Td>
                            <Td style={{ color: "#b45309", fontWeight: "600" }}>{p.vaccine_names_str}</Td>
                            <Td style={{ textAlign: "center" }}>
                              {p.already_sent ? (
                                <span
                                  style={{
                                    background: "#fef3c7",
                                    color: "#92400e",
                                    fontSize: "0.72rem",
                                    fontWeight: "700",
                                    padding: "3px 8px",
                                    borderRadius: "10px",
                                    border: "1px solid #fde68a",
                                  }}
                                >
                                  ✔ Already Sent Today
                                </span>
                              ) : (
                                <span
                                  style={{
                                    background: "#dcfce7",
                                    color: "#15803d",
                                    fontSize: "0.72rem",
                                    fontWeight: "700",
                                    padding: "3px 8px",
                                    borderRadius: "10px",
                                    border: "1px solid #86efac",
                                  }}
                                >
                                  Ready to Send
                                </span>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </tbody>
                    </Table>
                  </ResponsiveTableWrapper>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                  No pending vaccination reminders found for {pendingFromDate}.
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "18px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "14px",
                }}
              >
                <Button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  disabled={sendingReminders}
                  style={{ background: "#64748b", height: "36px", padding: "0 18px", fontSize: "0.82rem" }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmSendReminders}
                  disabled={sendingReminders || previewReminders.length === 0}
                  style={{
                    background: "#128c7e",
                    color: "#ffffff",
                    height: "36px",
                    padding: "0 22px",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                  }}
                >
                  {sendingReminders ? "Sending Reminders..." : "📲 Confirm & Send WhatsApp Reminders"}
                </Button>
              </div>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Vaccination;

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  X,
  Printer,
  FileText,
  Calendar,
  Clock,
  User,
  Activity,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Share2,
  RefreshCw,
  Building,
  Heart,
  Pill,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Bed,
  Check,
  ChevronRight,
  Apple,
  Zap,
  Syringe,
  Scissors,
  AlertTriangle,
  Info
} from 'lucide-react';
import apiRequest from '../../Auth/apiRequest';
import SummaryHead from '../Images/SummaryHead.png';

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ── Keyframes ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ── Styled Components ────────────────────────────────────────────────────────
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(6px);
  z-index: 10005;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContainer = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  height: 94vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(13, 148, 136, 0.25);
  flex-shrink: 0;

  .left-group {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sub-info {
      font-size: 0.78rem;
      opacity: 0.92;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .right-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    button.btn-print {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      color: #0f766e;
      border: none;
      padding: 7px 14px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.8rem;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      transition: all 0.2s;

      &:hover {
        background: #f0fdfa;
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      }
    }

    button.btn-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.35);
      }
    }
  }
`;

const IpTabBarContainer = styled.div`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  .tab-label {
    font-size: 0.72rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-right: 4px;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }
`;

const IpTabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
  border: 1px solid ${props => props.$active ? '#0d9488' : '#e2e8f0'};
  background: ${props => props.$active ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#334155'};
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(13, 148, 136, 0.25)' : 'none'};

  &:hover {
    border-color: #0d9488;
    background: ${props => props.$active ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' : '#f0fdfa'};
    color: ${props => props.$active ? '#ffffff' : '#0f766e'};
  }

  .ip-tag {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-weight: 800;
  }

  .stay-badge {
    font-size: 0.68rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9'};
    color: ${props => props.$active ? '#ffffff' : '#475569'};
    font-weight: 600;
  }

  .active-indicator {
    font-size: 0.65rem;
    padding: 1px 5px;
    border-radius: 4px;
    background: ${props => props.$active ? '#bbf7d0' : '#dcfce7'};
    color: ${props => props.$active ? '#14532d' : '#15803d'};
    font-weight: 800;
  }
`;

const ScrollableBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const SummaryContentCard = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

// Patient Header Bento Box
const PatientHeroCard = styled.div`
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 18px 22px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;

  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f1f5f9;

    .patient-main {
      display: flex;
      align-items: center;
      gap: 14px;

      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
        color: white;
        font-weight: 800;
        font-size: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
      }

      .name-group {
        h4 {
          margin: 0 0 4px 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .demographics {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: #64748b;
          font-weight: 600;
        }
      }
    }

    .tags-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .badge-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 700;
      }

      .badge-uhid {
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #e2e8f0;
      }

      .badge-ip {
        background: #f0fdfa;
        color: #0f766e;
        border: 1px solid #99f6e4;
        font-weight: 800;
      }

      .badge-status {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
      }
    }
  }

  .hero-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px 16px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 500px) {
      grid-template-columns: 1fr;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
      transition: all 0.2s ease;

      &:hover {
        background: #f1f5f9;
        border-color: #e2e8f0;
      }

      .label {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .value {
        font-size: 0.9rem;
        font-weight: 700;
        color: #0f172a;
      }
    }
  }
`;

// Diagnosis Banner Card
const DiagnosisHeroBanner = styled.div`
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  border: 1px solid #99f6e4;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.08);

  .icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: #0d9488;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.25);
    flex-shrink: 0;
  }

  .diag-text {
    flex: 1;
    min-width: 200px;

    .diag-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f766e;

      .code-pill {
        background: #ffffff;
        border: 1px solid #5eead4;
        color: #0f766e;
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 800;
        font-size: 0.75rem;
      }
    }

    .diag-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: #134e4a;
      margin-top: 3px;
    }
  }
`;

// Dual Admission & Discharge Timeline
const TimelineDualCard = styled.div`
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .time-col {
    display: flex;
    align-items: center;
    gap: 12px;

    .time-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .details {
      .tag {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .date-str {
        font-size: 0.92rem;
        font-weight: 800;
        color: #1e293b;
        margin-top: 1px;
      }
    }
  }

  .time-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    font-size: 1.1rem;
    font-weight: 700;

    @media (max-width: 640px) {
      display: none;
    }
  }
`;

// Clinical Sections Modern Card
const ClinicalSectionCard = styled.div`
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  .card-header {
    background: #f8fafc;
    border-bottom: 1px solid #f1f5f9;
    padding: 10px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.86rem;
      font-weight: 800;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.02em;

      .sec-icon {
        color: #0d9488;
      }
    }
  }

  .card-body {
    padding: 14px 18px;
    font-size: 0.85rem;
    color: #334155;
    line-height: 1.6;

    .plain-text {
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
`;

// Medications Grid
const MedicationGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .med-item, .med-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #0d9488;
    border-radius: 8px;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    .med-name, .name {
      font-weight: 800;
      color: #0f172a;
      font-size: 0.88rem;
    }

    .med-top {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .med-chips {
      display: flex;
      align-items: center;
      gap: 6px;

      .chip {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        color: #475569;

        &.dosage {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
        }

        &.days {
          background: #fefce8;
          border-color: #fef08a;
          color: #854d0e;
        }
      }
    }
  }
`;

// Signatures Attestation Bar
const SignatureSection = styled.div`
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  .sign-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 200px;
    text-align: center;

    .sign-line {
      width: 100%;
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 8px;
    }

    .doc-name {
      font-weight: 800;
      font-size: 0.88rem;
      color: #0f172a;
    }

    .doc-role {
      font-size: 0.74rem;
      color: #64748b;
      margin-top: 1px;
    }
  }
`;

// Helper Date & Time Formatters
const fmtDate = (d) => {
  if (!d || d === 'null' || d === 'N/A') return '—';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
};

const fmtTime = (t) => {
  if (!t || t === 'null' || t === 'N/A') return '';
  try {
    if (typeof t === 'string' && /^\d{1,2}:\d{2}/.test(t)) return t;
    const dt = new Date(t);
    if (isNaN(dt.getTime())) return String(t);
    return dt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(t);
  }
};

const SECTION_ORDER = [
  "DOA AND DOD",
  "DISCHARGE TYPE",
  "DISCHARGE DIAGNOSIS",
  "CONSULTANT",
  "BRIEF HISTORY",
  "SIGNIFICANT PAST MEDICAL AND SURGICAL HISTORY",
  "GENERAL EXAMINATION",
  "VITALS",
  "COURSE IN THE HOSPITAL",
  "ONCOLOGY NOTES",
  "SPECIAL NEEDS AFTER DISCHARGE",
  "VACCINATION HISTORY",
  "SURGERIES / PROCEDURES PERFORMED",
  "SPECIFIC MEDICATION GIVEN DURING HOSPITAL STAY",
  "SURGICAL NOTES",
  "INVESTIGATIONS",
  "ADVICE ON DIET",
  "ADVICE ON LIFE STYLE",
  "ADVICE ON IMMUNIZATION",
  "CONDITION ON DISCHARGE",
  "ADMISSION DIAGNOSIS",
  "ADVICE ON DISCHARGE"
];

// Helper to get section icon
const getSectionIcon = (key) => {
  const k = (key || '').toUpperCase();
  if (k.includes('MEDICATION') || k.includes('MEDICINE') || k.includes('DRUG')) return <Pill size={15} className="sec-icon" />;
  if (k.includes('VITAL') || k.includes('EXAMINATION')) return <Activity size={15} className="sec-icon" />;
  if (k.includes('VACCIN')) return <Syringe size={15} className="sec-icon" />;
  if (k.includes('SURG') || k.includes('PROCEDURE')) return <Scissors size={15} className="sec-icon" />;
  if (k.includes('DIET') || k.includes('FOOD')) return <Apple size={15} className="sec-icon" />;
  if (k.includes('LIFE STYLE') || k.includes('EXERCISE')) return <Zap size={15} className="sec-icon" />;
  if (k.includes('HISTORY')) return <FileText size={15} className="sec-icon" />;
  if (k.includes('DIAGNOSIS')) return <ShieldCheck size={15} className="sec-icon" />;
  if (k.includes('ADVICE') || k.includes('SPECIAL NEEDS')) return <AlertCircle size={15} className="sec-icon" />;
  if (k.includes('CONDITION')) return <Heart size={15} className="sec-icon" />;
  if (k.includes('INVESTIGATION') || k.includes('LAB')) return <Stethoscope size={15} className="sec-icon" />;
  return <FileText size={15} className="sec-icon" />;
};

const IPDischargeSummaryModal = ({ isOpen, ipNumber, uhid, patient, summaryRecord = null, onClose }) => {
  const initialIp = ipNumber || patient?.ip_number || patient?.ipNumber || summaryRecord?.ipNo || summaryRecord?.ip_number || '';
  const targetUHID = uhid || patient?.uhid || (typeof patient === 'object' && patient?.uhid) || '';

  const [selectedIp, setSelectedIp] = useState(initialIp);
  const [ipStays, setIpStays] = useState([]);
  const [summariesCache, setSummariesCache] = useState(summaryRecord && initialIp ? { [initialIp]: summaryRecord } : {});
  const [summaryData, setSummaryData] = useState(summaryRecord);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const printSheetRef = useRef(null);

  // Sync selectedIp when initialIp or modal opens
  useEffect(() => {
    if (initialIp) {
      setSelectedIp(initialIp);
    }
  }, [initialIp, isOpen]);

  // Load all IP Admissions & Discharge Summaries list for this UHID so doctor can navigate IP number wise
  useEffect(() => {
    const loadStaysAndSummaries = async () => {
      const qUHID = targetUHID || initialIp;
      if (!qUHID || !isOpen) return;

      try {
        const url = `${HmsBaseUrl}IPEMR_patient_history/?uhid=${encodeURIComponent(qUHID)}&ip_number=${encodeURIComponent(initialIp)}`;
        const res = await apiRequest(url, 'GET');
        const historyData = res?.data?.data || res?.data;

        const admissions = historyData?.admissions || [];
        const summaries = historyData?.discharge_summaries || [];

        const ipMap = new Map();

        // 1. Add from admissions list
        admissions.forEach(adm => {
          const ip = adm.ip_number;
          if (ip && !ipMap.has(ip)) {
            ipMap.set(ip, {
              ip_number: ip,
              admission_date: adm.admission_date,
              discharge_date: adm.discharge_date,
              is_discharged: adm.is_discharged,
              doctor_name: adm.doctor_name,
              room_no: adm.room_no,
              bed_no: adm.bed_no,
              is_current: ip === initialIp
            });
          }
        });

        // 2. Add from discharge summaries list and prime cache
        summaries.forEach(ds => {
          const ip = ds.ip_number || ds.ipNo;
          if (ip) {
            if (!ipMap.has(ip)) {
              ipMap.set(ip, {
                ip_number: ip,
                admission_date: ds.doa || ds.created_date,
                discharge_date: ds.dod,
                is_discharged: true,
                doctor_name: ds.doctor,
                room_no: ds.roomNo,
                bed_no: ds.bedNo,
                is_current: ip === initialIp
              });
            }
            setSummariesCache(prev => ({ ...prev, [ip]: ds }));
          }
        });

        // 3. Fallback: ensure initialIp is in list
        if (initialIp && !ipMap.has(initialIp)) {
          ipMap.set(initialIp, {
            ip_number: initialIp,
            admission_date: patient?.admissionDateTime || patient?.admissionDate || null,
            discharge_date: null,
            is_discharged: false,
            doctor_name: patient?.admittingDoctor || patient?.doctor_name || '',
            room_no: patient?.roomNo || patient?.room_no || '',
            bed_no: patient?.bedNo || patient?.bed_no || '',
            is_current: true
          });
        }

        const combined = Array.from(ipMap.values());
        combined.sort((a, b) => {
          if (a.ip_number === initialIp) return -1;
          if (b.ip_number === initialIp) return 1;
          return String(b.admission_date || '').localeCompare(String(a.admission_date || ''));
        });

        setIpStays(combined);
      } catch (e) {
        console.error("Error loading patient admissions list:", e);
      }
    };

    loadStaysAndSummaries();
  }, [isOpen, targetUHID, initialIp]);

  // Fetch summary for selected IP
  const fetchSummaryForIp = async (ipToFetch) => {
    if (!ipToFetch) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const url = `${HmsBaseUrl}get-printsummary/${encodeURIComponent(ipToFetch)}/`;
      const res = await apiRequest(url, 'GET');

      if (res?.success && res.data) {
        setSummaryData(res.data);
        setSummariesCache(prev => ({ ...prev, [ipToFetch]: res.data }));
      } else if (summariesCache[ipToFetch]) {
        setSummaryData(summariesCache[ipToFetch]);
      } else if (summaryRecord && (summaryRecord.ipNo === ipToFetch || summaryRecord.ip_number === ipToFetch)) {
        setSummaryData(summaryRecord);
      } else {
        setSummaryData(null);
        setErrorMsg(res?.error || `Discharge summary not found for IP #${ipToFetch}.`);
      }
    } catch (err) {
      console.error(`Error fetching discharge summary for IP #${ipToFetch}:`, err);
      if (summariesCache[ipToFetch]) {
        setSummaryData(summariesCache[ipToFetch]);
      } else {
        setSummaryData(null);
        setErrorMsg(`Failed to load discharge summary for IP #${ipToFetch}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedIp) {
      if (summariesCache[selectedIp]) {
        setSummaryData(summariesCache[selectedIp]);
      }
      fetchSummaryForIp(selectedIp);
    }
  }, [isOpen, selectedIp]);

  if (!isOpen) return null;

  const handleSelectIp = (newIp) => {
    if (newIp === selectedIp) return;
    setSelectedIp(newIp);
    if (summariesCache[newIp]) {
      setSummaryData(summariesCache[newIp]);
    } else {
      setSummaryData(null);
    }
  };

  const normalizeFieldsData = (raw) => {
    if (!raw) return [];
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = [];
      }
    }
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') {
      return Object.entries(raw).map(([key, value]) => ({ key, value }));
    }
    return [];
  };

  const currentSummary = summaryData || (selectedIp ? summariesCache[selectedIp] : null);
  const fieldsData = currentSummary ? normalizeFieldsData(currentSummary.fieldsData || currentSummary.fields_data) : [];

  const getFieldValue = (key) => {
    const entry = fieldsData.find(f => (f.key || '').trim().toUpperCase() === key.trim().toUpperCase());
    let val = entry ? entry.value : undefined;

    if (key === "DOA AND DOD") {
      if (val != null && String(val).trim()) {
        let strVal = String(val);
        if (!strVal.includes("\n") && /DOA\s*:.*DOD\s*:/i.test(strVal)) {
          strVal = strVal.replace(/(DOA\s*:[^D\n]*?)(DOD\s*:)/i, "$1\n$2");
        }
        return strVal;
      }
      const doa = currentSummary?.doa ? fmtDate(currentSummary.doa) : "-";
      const dod = currentSummary?.dod ? fmtDate(currentSummary.dod) : "Active";
      const doaT = currentSummary?.doaTime ? fmtTime(currentSummary.doaTime) : "";
      const dodT = currentSummary?.dodTime ? fmtTime(currentSummary.dodTime) : "";
      return `DOA : ${doa} ${doaT}\nDOD : ${dod} ${dodT}`.trim();
    }
    return val;
  };

  // Helper to parse Medication Strings
  const parseMedicationsList = (rawText) => {
    if (!rawText) return [];
    const lines = String(rawText).split('\n');
    const items = [];
    lines.forEach(line => {
      const clean = line.trim();
      if (!clean || clean.startsWith('MEDICINES USED ON ADMISSION')) return;
      const stripped = clean.replace(/^[•\-\*]\s*/, '');
      const parts = stripped.split('|').map(p => p.trim());
      const name = parts[0] || '';
      let dosage = '';
      let days = '';
      let unit = '';
      parts.slice(1).forEach(p => {
        if (/dosage:/i.test(p)) dosage = p.replace(/dosage:/i, '').trim();
        else if (/days:/i.test(p)) days = p.replace(/days:/i, '').trim();
        else if (/unit:/i.test(p)) unit = p.replace(/unit:/i, '').trim();
        else if (!dosage) dosage = p;
      });
      if (name) {
        items.push({ name, dosage, days, unit, raw: stripped });
      }
    });
    return items;
  };

  // Dedicated Print Generator for the currently active tab IP summary
  const handlePrint = () => {
    if (!currentSummary) return;

    const printWindow = window.open('', '', 'width=900,height=800');
    const curPatientName = currentSummary?.patient || patient?.patient_name || patient?.patientName || 'Patient';
    const curPatientUHID = currentSummary?.uhid || targetUHID || '-';
    const curPatientDoctor = currentSummary?.doctor || patient?.doctor_name || patient?.admittingDoctor || 'Attending Consultant';

    printWindow.document.write(`
      <html>
        <head>
          <title>Discharge Summary - ${curPatientName} (${selectedIp})</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; margin: 24px; color: #1e293b; font-size: 12px; }
            .letterhead-wrap { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
            .letterhead-wrap img { width: 100%; max-height: 90px; object-fit: contain; }
            .doc-badge { display: inline-block; background: #0d9488; color: white; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 14px; margin-top: 6px; }
            .patient-summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px; font-size: 11px; margin-bottom: 14px; }
            .info-row { display: flex; align-items: baseline; }
            .label { font-weight: bold; color: #475569; min-width: 100px; font-size: 10px; }
            .colon { margin: 0 4px; color: #94a3b8; }
            .val { font-weight: bold; color: #0f172a; flex: 1; }
            .icd-box { background: #f0fdfa; border: 1px solid #99f6e4; padding: 6px 10px; border-radius: 4px; font-size: 11px; margin-bottom: 12px; color: #0f766e; }
            .section-block { margin-bottom: 10px; }
            .sec-title { font-size: 11px; font-weight: bold; color: #0d9488; text-transform: uppercase; background: #f0fdfa; border-left: 3px solid #0d9488; padding: 2px 6px; margin-bottom: 4px; }
            .sec-content { font-size: 11px; color: #334155; line-height: 1.45; padding-left: 6px; white-space: pre-wrap; }
            table.styled-summary-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 4px; }
            table.styled-summary-table th, table.styled-summary-table td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; }
            table.styled-summary-table th { background: #f1f5f9; font-weight: bold; }
            .signatures-row { margin-top: 36px; padding-top: 14px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; }
            .sign-box { text-align: center; min-width: 160px; }
            .sign-line { border-bottom: 1px solid #000; margin-bottom: 4px; width: 100%; }
          </style>
        </head>
        <body>
          <div class="letterhead-wrap">
            <img src="${SummaryHead}" alt="Hospital Letterhead" />
            <div>
              <span class="doc-badge">${currentSummary.summaryType || currentSummary.summary_type || 'Hospital Discharge Summary'}</span>
            </div>
          </div>

          <div class="patient-summary-grid">
            <div class="info-row"><span class="label">Patient Name</span><span class="colon">:</span><span class="val">${currentSummary.patient || curPatientName}</span></div>
            <div class="info-row"><span class="label">UHID / IP No</span><span class="colon">:</span><span class="val">${currentSummary.uhid || curPatientUHID} / ${currentSummary.ipNo || currentSummary.ip_number || selectedIp}</span></div>
            <div class="info-row"><span class="label">Age / Gender</span><span class="colon">:</span><span class="val">${currentSummary.age ? `${currentSummary.age} Yrs` : '-'} / ${currentSummary.gender || '-'}</span></div>
            <div class="info-row"><span class="label">Consultant</span><span class="colon">:</span><span class="val">Dr. ${currentSummary.doctor || curPatientDoctor}</span></div>
            <div class="info-row"><span class="label">DOA & Time</span><span class="colon">:</span><span class="val">${currentSummary.doa ? fmtDate(currentSummary.doa) : '-'} ${currentSummary.doaTime ? fmtTime(currentSummary.doaTime) : ''}</span></div>
            <div class="info-row"><span class="label">DOD & Time</span><span class="colon">:</span><span class="val">${currentSummary.dod ? fmtDate(currentSummary.dod) : 'Active'} ${currentSummary.dodTime ? fmtTime(currentSummary.dodTime) : ''}</span></div>
            <div class="info-row"><span class="label">Room / Ward</span><span class="colon">:</span><span class="val">${currentSummary.roomNo || patient?.room_no || '-'}</span></div>
            ${currentSummary.address ? `<div class="info-row" style="grid-column: span 2"><span class="label">Address</span><span class="colon">:</span><span class="val">${currentSummary.address}</span></div>` : ''}
          </div>

          ${(currentSummary.diseaseCode || currentSummary.disease || currentSummary.primaryDiagnosis || currentSummary.primary_diagnosis) ? `
            <div class="icd-box">
              <strong>Primary / ICD Diagnosis: </strong>
              <span>${currentSummary.diseaseCode ? `${currentSummary.diseaseCode} — ` : ''}${currentSummary.disease || currentSummary.primaryDiagnosis || currentSummary.primary_diagnosis || '-'}</span>
            </div>
          ` : ''}

          ${SECTION_ORDER.map(key => {
            const content = getFieldValue(key);
            if (!content || !String(content).trim()) return '';
            return `
              <div class="section-block">
                <div class="sec-title">${key}</div>
                <div class="sec-content">${content}</div>
              </div>
            `;
          }).join('')}

          ${fieldsData.map(({ key, value }) => {
            if (!key || !value || !String(value).trim()) return '';
            if (SECTION_ORDER.some(k => k.trim().toUpperCase() === key.trim().toUpperCase())) return '';
            return `
              <div class="section-block">
                <div class="sec-title">${key}</div>
                <div class="sec-content">${value}</div>
              </div>
            `;
          }).join('')}

          ${Array.isArray(currentSummary.testdetails) && currentSummary.testdetails.length > 0 ? `
            <div class="section-block">
              <div class="sec-title">Key Investigations & Diagnostics Results</div>
              <table class="styled-summary-table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Parameter</th>
                    <th>Observed Value</th>
                    <th>Reference Range</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentSummary.testdetails.map(t => (
                    (t.parameters || []).map((p, pIdx) => `
                      <tr>
                        ${pIdx === 0 ? `<td rowspan="${t.parameters.length}"><strong>${t.testname || t.test_name || 'Lab Test'}</strong></td>` : ''}
                        <td>${p.test_name || p.parameter_name || '-'}</td>
                        <td><strong>${p.value || p.result || '-'} ${p.unit || ''}</strong></td>
                        <td>${p.reference_range || p.normal_range || '-'}</td>
                      </tr>
                    `).join('')
                  )).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="signatures-row">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div><strong>Dr. ${currentSummary.doctor || curPatientDoctor}</strong></div>
              <div style="font-size: 10px; color: #64748b;">Attending Physician / Consultant</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div><strong>${currentSummary.patient || curPatientName} / Attender</strong></div>
              <div style="font-size: 10px; color: #64748b;">Signature of Patient / Relative</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  const patientName = currentSummary?.patient || patient?.patient_name || patient?.patientName || 'Patient';
  const patientUHID = currentSummary?.uhid || targetUHID || patient?.uhid || '-';
  const patientDoctor = currentSummary?.doctor || patient?.doctor_name || patient?.admittingDoctor || 'Attending Consultant';
  const isFinalApproved = currentSummary?.approve === true || currentSummary?.is_approved === true;

  const selectedStayInfo = ipStays.find(s => s.ip_number === selectedIp);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        {/* Header */}
        <ModalHeader>
          <div className="left-group">
            <div className="icon-box">
              <FileText size={20} />
            </div>
            <div>
              <h3>
                Inpatient Discharge Summary
                {isFinalApproved && (
                  <span style={{
                    background: 'rgba(255,255,255,0.25)',
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}>
                    <Check size={11} style={{ display: 'inline', marginRight: 2 }} /> Approved
                  </span>
                )}
              </h3>
              <div className="sub-info">
                <span>{patientName}</span>
                <span>·</span>
                <span>UHID: <strong>{patientUHID}</strong></span>
                <span>·</span>
                <span>Viewing IP: <strong>{selectedIp}</strong></span>
              </div>
            </div>
          </div>

          <div className="right-actions">
            {currentSummary && (
              <button className="btn-print" onClick={handlePrint} title="Print A4 Discharge Summary">
                <Printer size={15} /> Print Sheet
              </button>
            )}
            <button className="btn-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </ModalHeader>

        {/* IP Admissions & Summaries Tab Navigation Bar */}
        {ipStays.length > 0 && (
          <IpTabBarContainer>
            <div className="tab-label">
              <Calendar size={13} />
              <span>Admissions:</span>
            </div>
            {ipStays.map((stay) => {
              const isCurrent = stay.ip_number === initialIp;
              const isSelected = stay.ip_number === selectedIp;
              return (
                <IpTabButton
                  key={stay.ip_number}
                  $active={isSelected}
                  onClick={() => handleSelectIp(stay.ip_number)}
                  title={`View Discharge Summary for Admission IP #${stay.ip_number}`}
                >
                  <FileText size={13} />
                  <span className="ip-tag">IP: {stay.ip_number}</span>
                  {stay.admission_date && (
                    <span className="stay-badge">
                      {fmtDate(stay.admission_date)}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="active-indicator">Current Stay</span>
                  )}
                </IpTabButton>
              );
            })}
          </IpTabBarContainer>
        )}

        {/* Body Content */}
        <ScrollableBody>
          {loading && !currentSummary ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#0d9488' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Loading Discharge Summary for IP #{selectedIp}...</div>
            </div>
          ) : !currentSummary ? (
            <div style={{
              background: 'white',
              borderRadius: '14px',
              padding: '40px',
              textAlign: 'center',
              maxWidth: '480px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              margin: 'auto'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#f0fdfa',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <FileText size={28} />
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Discharge Summary Pending
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                No finalized discharge summary has been recorded in the system for IP Number: <strong>{selectedIp}</strong>.
              </p>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', textAlign: 'left', marginBottom: '16px' }}>
                <div><strong>Patient:</strong> {patientName}</div>
                <div><strong>UHID:</strong> {patientUHID}</div>
                <div><strong>Selected IP:</strong> {selectedIp}</div>
                <div><strong>Doctor:</strong> Dr. {selectedStayInfo?.doctor_name || patientDoctor}</div>
                <div><strong>Admission Date:</strong> {fmtDate(selectedStayInfo?.admission_date)}</div>
                <div><strong>Status:</strong> {selectedStayInfo?.is_discharged ? 'Discharged' : 'Active Stay / Summary in preparation'}</div>
              </div>
              {ipStays.length > 1 && (
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                  💡 Click on any other IP Admission tab above to view previous summaries.
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#0d9488',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Close Viewer
              </button>
            </div>
          ) : (
            <SummaryContentCard ref={printSheetRef}>
              {/* 1. Modern Patient Hero Banner */}
              <PatientHeroCard>
                <div className="hero-top">
                  <div className="patient-main">
                    <div className="avatar">
                      {(patientName.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, '')[0] || 'P').toUpperCase()}
                    </div>
                    <div className="name-group">
                      <h4>{patientName}</h4>
                      <div className="demographics">
                        <span>{currentSummary.gender || patient?.gender || '-'}</span>
                        <span>·</span>
                        <span>{currentSummary.age ? `${currentSummary.age} Yrs` : (patient?.age ? `${patient.age} Yrs` : '-')}</span>
                        {patient?.blood_group && (
                          <>
                            <span>·</span>
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>🩸 {patient.blood_group}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="tags-group">
                    <div className="badge-chip badge-uhid">
                      <User size={12} /> UHID: <strong>{currentSummary.uhid || patientUHID}</strong>
                    </div>
                    <div className="badge-chip badge-ip">
                      <Bed size={12} /> IP: <strong>{currentSummary.ipNo || currentSummary.ip_number || selectedIp}</strong>
                    </div>
                    <div className="badge-chip badge-status">
                      <ShieldCheck size={12} /> {currentSummary.summaryType || currentSummary.summary_type || 'Discharge Summary'}
                    </div>
                  </div>
                </div>

                <div className="hero-grid">
                  <div className="info-item">
                    <span className="label"><Stethoscope size={13} color="#0d9488" /> Primary Consultant</span>
                    <span className="value">Dr. {currentSummary.doctor || patientDoctor}</span>
                  </div>
                  <div className="info-item">
                    <span className="label"><Bed size={13} color="#0d9488" /> Room / Bed</span>
                    <span className="value">{currentSummary.roomNo ? `Room ${currentSummary.roomNo}` : (patient?.room_no ? `Room ${patient.room_no}` : 'General Ward')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label"><Calendar size={13} color="#16a34a" /> Admission Date</span>
                    <span className="value">{currentSummary.doa ? `${fmtDate(currentSummary.doa)} ${fmtTime(currentSummary.doaTime)}` : '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label"><Clock size={13} color={currentSummary.dod ? '#dc2626' : '#16a34a'} /> Discharge Date</span>
                    <span className="value" style={{ color: currentSummary.dod ? '#dc2626' : '#16a34a' }}>
                      {currentSummary.dod ? `${fmtDate(currentSummary.dod)} ${fmtTime(currentSummary.dodTime)}` : 'Active Inpatient'}
                    </span>
                  </div>
                  {currentSummary.nextReviewDate && (
                    <div className="info-item">
                      <span className="label"><Calendar size={13} color="#0d9488" /> Next Review / Follow-up</span>
                      <span className="value" style={{ color: '#0d9488' }}>{fmtDate(currentSummary.nextReviewDate)}</span>
                    </div>
                  )}
                  {currentSummary.surgeryDate && (
                    <div className="info-item">
                      <span className="label"><Scissors size={13} color="#0d9488" /> Surgery / Procedure Date</span>
                      <span className="value">{fmtDate(currentSummary.surgeryDate)}</span>
                    </div>
                  )}
                  {currentSummary.address && (
                    <div className="info-item" style={{ gridColumn: 'span 2' }}>
                      <span className="label"><MapPin size={13} color="#0d9488" /> Residential Address</span>
                      <span className="value" style={{ fontWeight: 600, fontSize: '0.84rem', color: '#334155' }}>{currentSummary.address}</span>
                    </div>
                  )}
                </div>
              </PatientHeroCard>

              {/* 2. Primary ICD Diagnosis Hero Card */}
              {(currentSummary.diseaseCode || currentSummary.disease || currentSummary.primaryDiagnosis || currentSummary.primary_diagnosis) && (
                <DiagnosisHeroBanner>
                  <div className="icon-wrap">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="diag-text">
                    <div className="diag-label">
                      <span>Primary Diagnosis</span>
                      {currentSummary.diseaseCode && (
                        <span className="code-pill">ICD: {currentSummary.diseaseCode}</span>
                      )}
                    </div>
                    <div className="diag-name">
                      {currentSummary.disease || currentSummary.primaryDiagnosis || currentSummary.primary_diagnosis || 'Diseases of liver, unspecified'}
                    </div>
                  </div>
                </DiagnosisHeroBanner>
              )}

              {/* 3. Admission & Discharge Dual Timeline Widget */}
              <TimelineDualCard>
                <div className="time-col">
                  <div className="time-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                    <Calendar size={18} />
                  </div>
                  <div className="details">
                    <div className="tag" style={{ color: '#16a34a' }}>Date of Admission (DOA)</div>
                    <div className="date-str">{currentSummary.doa ? fmtDate(currentSummary.doa) : '21 Aug 2026'} <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{currentSummary.doaTime ? fmtTime(currentSummary.doaTime) : '01:31 PM'}</span></div>
                  </div>
                </div>

                <div className="time-divider">
                  <span>→</span>
                </div>

                <div className="time-col">
                  <div className="time-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <Clock size={18} />
                  </div>
                  <div className="details">
                    <div className="tag" style={{ color: '#2563eb' }}>Date of Discharge (DOD)</div>
                    <div className="date-str">{currentSummary.dod ? fmtDate(currentSummary.dod) : '22 Aug 2026'} <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{currentSummary.dodTime ? fmtTime(currentSummary.dodTime) : '05:00 PM'}</span></div>
                  </div>
                </div>
              </TimelineDualCard>

              {/* 4. Structured Clinical Cards (Smart Rendered) */}
              {SECTION_ORDER.map((key) => {
                if (key === "DOA AND DOD") return null; // Rendered in timeline widget above
                const content = getFieldValue(key);
                if (!content || !String(content).trim()) return null;

                const textVal = String(content).trim();
                const isNil = textVal.toLowerCase() === 'nil' || textVal.toLowerCase() === 'none' || textVal.toLowerCase() === 'no';
                const isNormal = textVal.toLowerCase() === 'normal';
                const isMedicationSection = key.includes('MEDICATION') || key.includes('MEDICINE');

                return (
                  <ClinicalSectionCard key={key}>
                    <div className="card-header">
                      <div className="title-left">
                        {getSectionIcon(key)}
                        <span>{key}</span>
                      </div>
                      <span className="badge-info">Clinical Record</span>
                    </div>

                    <div className="card-body">
                      {isNil ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                          <Check size={13} color="#94a3b8" /> Nil / No significant abnormalities reported
                        </div>
                      ) : isNormal ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                          <CheckCircle2 size={14} color="#16a34a" /> Within Normal Physiological Limits
                        </div>
                      ) : isMedicationSection ? (() => {
                        const parsedMeds = parseMedicationsList(textVal);
                        if (parsedMeds.length > 0) {
                          return (
                            <MedicationGrid>
                              {parsedMeds.map((m, mIdx) => (
                                <div key={mIdx} className="med-card">
                                  <div className="med-top">
                                    <span className="name">{m.name}</span>
                                    <Pill size={14} color="#0d9488" />
                                  </div>
                                  <div className="med-chips">
                                    {m.dosage && <span className="chip dosage">Dosage: {m.dosage}</span>}
                                    {m.days && <span className="chip days">Duration: {m.days} Days</span>}
                                    {m.unit && <span className="chip">Unit: {m.unit}</span>}
                                  </div>
                                </div>
                              ))}
                            </MedicationGrid>
                          );
                        }
                        return <div className="plain-text">{textVal}</div>;
                      })() : (
                        <div className="plain-text" style={{ lineHeight: 1.65 }}>
                          {textVal}
                        </div>
                      )}
                    </div>
                  </ClinicalSectionCard>
                );
              })}

              {/* 5. Additional / Dynamic Unmapped Sections */}
              {fieldsData.map(({ key, value }) => {
                if (!key || !value || !String(value).trim()) return null;
                const isHandled = SECTION_ORDER.some(k => k.trim().toUpperCase() === key.trim().toUpperCase());
                if (isHandled) return null;

                const textVal = String(value).trim();
                return (
                  <ClinicalSectionCard key={key}>
                    <div className="card-header">
                      <div className="title-left">
                        {getSectionIcon(key)}
                        <span>{key}</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="plain-text">{textVal}</div>
                    </div>
                  </ClinicalSectionCard>
                );
              })}

              {/* 6. Laboratory / Test Details */}
              {Array.isArray(currentSummary.testdetails) && currentSummary.testdetails.length > 0 && (
                <ClinicalSectionCard>
                  <div className="card-header">
                    <div className="title-left">
                      <Stethoscope size={15} className="sec-icon" />
                      <span>Key Investigations & Diagnostics Results</span>
                    </div>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                          <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 800 }}>Test Name</th>
                          <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 800 }}>Parameter</th>
                          <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 800 }}>Observed Value</th>
                          <th style={{ padding: '8px 14px', color: '#475569', fontWeight: 800 }}>Reference Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSummary.testdetails.map((t, tIdx) => (
                          (t.parameters || []).map((p, pIdx) => (
                            <tr key={`${tIdx}-${pIdx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              {pIdx === 0 && (
                                <td rowSpan={t.parameters.length} style={{ padding: '8px 14px', fontWeight: 800, color: '#0f172a' }}>
                                  {t.testname || t.test_name || 'Lab Test'}
                                </td>
                              )}
                              <td style={{ padding: '8px 14px', color: '#334155' }}>{p.test_name || p.parameter_name || '-'}</td>
                              <td style={{ padding: '8px 14px', fontWeight: 800, color: '#0d9488' }}>{p.value || p.result || '-'} {p.unit || ''}</td>
                              <td style={{ padding: '8px 14px', color: '#64748b' }}>{p.reference_range || p.normal_range || '-'}</td>
                            </tr>
                          ))
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ClinicalSectionCard>
              )}

              {/* 7. Signatures & Attestation Bar */}
              <SignatureSection>
                <div className="sign-box">
                  <div className="sign-line"></div>
                  <div className="doc-name">Dr. {currentSummary.doctor || patientDoctor}</div>
                  <div className="doc-role">Attending Physician / Consultant</div>
                </div>

                <div className="sign-box">
                  <div className="sign-line"></div>
                  <div className="doc-name">{patientName} / Attender</div>
                  <div className="doc-role">Signature of Patient / Relative</div>
                </div>
              </SignatureSection>
            </SummaryContentCard>
          )}
        </ScrollableBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default IPDischargeSummaryModal;

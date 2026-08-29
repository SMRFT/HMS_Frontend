import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  FiUser, FiActivity, FiClock, FiPlus, FiTrash2, FiPrinter, FiSave,
  FiSearch, FiCheck, FiAlertCircle, FiFileText, FiCalendar, FiChevronRight,
  FiChevronLeft, FiLayers, FiCheckCircle, FiX
} from 'react-icons/fi';
import OPDSummaryPrintModal from './OPDSummaryPrintModal';

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://localhost:2609/api/";

const PageContainer = styled.div`
  background: #f8fafc;
  min-height: calc(100vh - 64px);
  padding: 20px 28px;
  font-family: 'Outfit', 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: 900px) {
    padding: 12px;
  }
`;

const TopDoctorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .doc-title {
    h2 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 2px 0;
    }
    p {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }
  }

  .actions {
    display: flex;
    gap: 12px;
    align-items: center;

    .queue-toggle {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-weight: 700;
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      &:hover { background: #f1f5f9; }
    }

    .btn-save {
      background: #0d9488;
      color: #ffffff;
      border: none;
      font-weight: 700;
      padding: 9px 20px;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
      &:hover { background: #0f766e; }
    }

    .btn-print {
      background: #0284c7;
      color: #ffffff;
      border: none;
      font-weight: 700;
      padding: 9px 20px;
      border-radius: 10px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
      &:hover { background: #0369a1; }
    }
  }
`;

const EMRWorkspaceGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$showQueue ? '300px 1fr' : '1fr'};
  gap: 20px;
  flex: 1;
  min-height: 0;
  transition: all 0.3s ease;
`;

// ── Left Queue Sidebar ──
const QueueSidebar = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - 170px);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  .queue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
    }
    span {
      font-size: 0.75rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #0d9488;
      padding: 4px 10px;
      border-radius: 20px;
    }
  }

  .queue-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-right: 2px;

    &::-webkit-scrollbar { width: 5px; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  }
`;

const PatientQueueCard = styled.div`
  background: ${props => props.$active ? '#0d9488' : '#f8fafc'};
  color: ${props => props.$active ? '#ffffff' : '#0f172a'};
  border: ${props => props.$active ? 'none' : '1px solid #e2e8f0'};
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0d9488;
    transform: translateY(-1px);
  }

  .top-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    h5 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 800;
    }
    .token {
      font-size: 0.72rem;
      font-weight: 800;
      background: ${props => props.$active ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0'};
      color: ${props => props.$active ? '#ffffff' : '#475569'};
      padding: 2px 8px;
      border-radius: 6px;
    }
  }

  .sub-line {
    font-size: 0.76rem;
    color: ${props => props.$active ? 'rgba(255, 255, 255, 0.85)' : '#64748b'};
    margin-bottom: 6px;
  }

  .status-tag {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    background: ${props => {
      if (props.$active) return 'rgba(255, 255, 255, 0.2)';
      if (props.$status === 'In-Consultation') return '#e0f2fe';
      if (props.$status === 'Waiting') return '#fef3c7';
      return '#dcfce7';
    }};
    color: ${props => {
      if (props.$active) return '#ffffff';
      if (props.$status === 'In-Consultation') return '#0284c7';
      if (props.$status === 'Waiting') return '#d97706';
      return '#15803d';
    }};
  }
`;

// ── Main EMR Center Content ──
const MainEMRPanel = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 170px);
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const PatientHeaderBanner = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .pat-identity {
    display: flex;
    align-items: center;
    gap: 14px;

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #0d9488;
      color: #ffffff;
      font-size: 1.2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info {
      h3 {
        margin: 0 0 2px 0;
        font-size: 1.1rem;
        font-weight: 800;
        color: #0f172a;
      }
      p {
        margin: 0;
        font-size: 0.8rem;
        color: #64748b;
      }
    }
  }

  .allergies-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 700;
  }
`;

const VitalsInlineRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;

  .vital-item {
    flex: 1;
    min-width: 100px;
    background: #f8fafc;
    border-radius: 10px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;

    label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
    }

    input {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #0f172a;
      outline: none;

      &:focus { border-color: #0d9488; }
    }
  }
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 4px;

  button {
    border: none;
    background: transparent;
    padding: 8px 16px;
    font-size: 0.85rem;
    font-weight: 700;
    color: #64748b;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.active {
      background: #0d9488;
      color: #ffffff;
    }
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .sec-label {
    font-size: 0.82rem;
    font-weight: 800;
    color: #0d9488;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const RxTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
    font-size: 0.82rem;
  }

  th {
    background: #f8fafc;
    font-weight: 700;
    color: #475569;
    text-align: left;
  }

  input, select {
    width: 100%;
    padding: 6px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.8rem;
    box-sizing: border-box;

    &:focus { outline: none; border-color: #0d9488; }
  }

  .btn-del {
    background: #fef2f2;
    color: #ef4444;
    border: none;
    padding: 6px;
    border-radius: 6px;
    cursor: pointer;
    &:hover { background: #fee2e2; }
  }
`;

const OPEMRDesk = () => {
  const [showQueue, setShowQueue] = useState(true);
  const [queueList, setQueueList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("clinical"); // "clinical", "rx", "investigations", "advice"
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Form State
  const [vitals, setVitals] = useState({ bp: "", pulse: "", temp: "", spo2: "", weight_kg: "", height_cm: "", bmi: "" });
  const [chiefComplaints, setChiefComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState({ symptom: "", duration: "3 Days", severity: "Moderate" });
  const [examinationNotes, setExaminationNotes] = useState({ cvs: "Normal", rs: "Bilateral Clear", pa: "Soft", notes: "" });
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [newDiagName, setNewDiagName] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [investigationOrders, setInvestigationOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({ type: "Lab", test_name: "" });
  const [adviceText, setAdviceText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const res = await axios.get(`${Hmsbaseurl}op-emr/queue/`);
      if (res.data && res.data.queue) {
        setQueueList(res.data.queue);
        if (res.data.queue.length > 0) {
          loadPatientIntoDesk(res.data.queue[0]);
        }
      }
    } catch (e) {
      toast.error("Failed to load OP Queue");
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const loadPatientIntoDesk = (patient) => {
    setSelectedPatient(patient);
    setVitals(patient.vitals || { bp: "", pulse: "", temp: "", spo2: "", weight_kg: "", height_cm: "", bmi: "" });
    setChiefComplaints(patient.chief_complaints || []);
    setExaminationNotes(patient.examination || { cvs: "Normal", rs: "Bilateral Clear", pa: "Soft", notes: "" });
    setDiagnosisList(patient.diagnosis || []);
    setPrescriptions(patient.prescriptions || []);
    setInvestigationOrders(patient.investigation_orders || []);
    setAdviceText(patient.advice || "");
    setFollowUpDate(patient.follow_up_date || "");
  };

  // Auto calculate BMI
  const handleWeightHeightChange = (field, val) => {
    const nextVitals = { ...vitals, [field]: val };
    const w = parseFloat(nextVitals.weight_kg);
    const h_m = parseFloat(nextVitals.height_cm) / 100;
    if (w > 0 && h_m > 0) {
      nextVitals.bmi = (w / (h_m * h_m)).toFixed(2);
    }
    setVitals(nextVitals);
  };

  const handleAddComplaint = () => {
    if (!newComplaint.symptom) return;
    setChiefComplaints([...chiefComplaints, newComplaint]);
    setNewComplaint({ symptom: "", duration: "3 Days", severity: "Moderate" });
  };

  const handleAddDiagnosis = () => {
    if (!newDiagName) return;
    setDiagnosisList([...diagnosisList, { code: "ICD-11", name: newDiagName, type: "Primary" }]);
    setNewDiagName("");
  };

  const handleAddRxRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine_name: "", dosage: "1-0-1", timing: "After Food", duration_days: 5, total_qty: 10, instructions: "" }
    ]);
  };

  const handleUpdateRx = (idx, field, val) => {
    const nextRx = [...prescriptions];
    nextRx[idx][field] = val;
    // Auto calculate qty
    if (field === 'dosage' || field === 'duration_days') {
      const days = parseInt(nextRx[idx].duration_days) || 0;
      let freqMultiplier = 2; // Default 1-0-1
      const dos = nextRx[idx].dosage;
      if (dos === '1-1-1') freqMultiplier = 3;
      if (dos === '1-0-0' || dos === '0-0-1') freqMultiplier = 1;
      nextRx[idx].total_qty = days * freqMultiplier;
    }
    setPrescriptions(nextRx);
  };

  const handleRemoveRx = (idx) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handleAddOrder = () => {
    if (!newOrder.test_name) return;
    setInvestigationOrders([...investigationOrders, newOrder]);
    setNewOrder({ type: "Lab", test_name: "" });
  };

  const handleSaveEMR = async () => {
    if (!selectedPatient) return;
    const payload = {
      ...selectedPatient,
      vitals,
      chief_complaints: chiefComplaints,
      examination: examinationNotes,
      diagnosis: diagnosisList,
      prescriptions,
      investigation_orders: investigationOrders,
      advice: adviceText,
      follow_up_date: followUpDate,
      status: "Completed"
    };

    try {
      const res = await axios.post(`${Hmsbaseurl}op-emr/save-consultation/`, payload);
      if (res.data && res.data.success) {
        toast.success("OP EMR Consultation saved successfully!");
        setSelectedPatient(payload);
      }
    } catch (e) {
      toast.error("Error saving EMR consultation");
    }
  };

  return (
    <PageContainer>
      {/* Top Header */}
      <TopDoctorHeader>
        <div className="doc-title">
          <h2>OP Consultation Desk</h2>
          <p>Electronic Medical Records · Outpatient Department</p>
        </div>
        <div className="actions">
          <button className="queue-toggle" onClick={() => setShowQueue(!showQueue)}>
            <FiLayers /> {showQueue ? "Hide Queue" : "Show Queue"} ({queueList.length})
          </button>
          <button className="btn-save" onClick={handleSaveEMR}>
            <FiSave /> Save EMR Record
          </button>
          <button className="btn-print" onClick={() => setShowPrintModal(true)}>
            <FiPrinter /> Print OPD Sheet
          </button>
        </div>
      </TopDoctorHeader>

      <EMRWorkspaceGrid $showQueue={showQueue}>
        {/* Left Patient Queue Sidebar */}
        {showQueue && (
          <QueueSidebar>
            <div className="queue-header">
              <h4>OP Patients Queue</h4>
              <span>Today</span>
            </div>

            <div className="queue-list">
              {isLoadingQueue ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading Patients...</div>
              ) : queueList.map(pat => {
                const isSel = selectedPatient?.op_number === pat.op_number;
                return (
                  <PatientQueueCard
                    key={pat.op_number}
                    $active={isSel}
                    $status={pat.status}
                    onClick={() => loadPatientIntoDesk(pat)}
                  >
                    <div className="top-line">
                      <h5>{pat.patient_name}</h5>
                      <span className="token">Token #{pat.token_no}</span>
                    </div>
                    <div className="sub-line">
                      {pat.age} Yrs · {pat.gender} · {pat.uhid}
                    </div>
                    <div className="status-tag">{pat.status}</div>
                  </PatientQueueCard>
                );
              })}
            </div>
          </QueueSidebar>
        )}

        {/* Main EMR Panel */}
        <MainEMRPanel>
          {selectedPatient ? (
            <>
              {/* Selected Patient Banner */}
              <PatientHeaderBanner>
                <div className="pat-identity">
                  <div className="avatar">
                    {(selectedPatient.patient_name || "P").charAt(0).toUpperCase()}
                  </div>
                  <div className="info">
                    <h3>{selectedPatient.patient_name}</h3>
                    <p>
                      {selectedPatient.age} Yrs / {selectedPatient.gender} · Mobile: {selectedPatient.mobile} · UHID: <strong>{selectedPatient.uhid}</strong> · OP No: {selectedPatient.op_number}
                    </p>
                  </div>
                </div>

                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                  <div className="allergies-alert">
                    <FiAlertCircle size={16} /> Known Allergies: {selectedPatient.allergies.join(", ")}
                  </div>
                )}
              </PatientHeaderBanner>

              {/* Vitals Inline Bar */}
              <VitalsInlineRow>
                <div className="vital-item">
                  <label>BP (mmHg)</label>
                  <input
                    value={vitals.bp}
                    onChange={e => setVitals({ ...vitals, bp: e.target.value })}
                    placeholder="120/80"
                  />
                </div>
                <div className="vital-item">
                  <label>Pulse (bpm)</label>
                  <input
                    value={vitals.pulse}
                    onChange={e => setVitals({ ...vitals, pulse: e.target.value })}
                    placeholder="78"
                  />
                </div>
                <div className="vital-item">
                  <label>Temp (°F)</label>
                  <input
                    value={vitals.temp}
                    onChange={e => setVitals({ ...vitals, temp: e.target.value })}
                    placeholder="98.6"
                  />
                </div>
                <div className="vital-item">
                  <label>SpO2 (%)</label>
                  <input
                    value={vitals.spo2}
                    onChange={e => setVitals({ ...vitals, spo2: e.target.value })}
                    placeholder="99"
                  />
                </div>
                <div className="vital-item">
                  <label>Weight (kg)</label>
                  <input
                    value={vitals.weight_kg}
                    onChange={e => handleWeightHeightChange('weight_kg', e.target.value)}
                    placeholder="70"
                  />
                </div>
                <div className="vital-item">
                  <label>Height (cm)</label>
                  <input
                    value={vitals.height_cm}
                    onChange={e => handleWeightHeightChange('height_cm', e.target.value)}
                    placeholder="172"
                  />
                </div>
                <div className="vital-item">
                  <label>BMI</label>
                  <input value={vitals.bmi} readOnly style={{ background: '#f1f5f9' }} />
                </div>
              </VitalsInlineRow>

              {/* Workspace Navigation Tabs */}
              <TabNavigation>
                <button
                  className={activeTab === 'clinical' ? 'active' : ''}
                  onClick={() => setActiveTab('clinical')}
                >
                  1. Clinical Notes & Diagnosis
                </button>
                <button
                  className={activeTab === 'rx' ? 'active' : ''}
                  onClick={() => setActiveTab('rx')}
                >
                  2. Prescriptions (Rx) ({prescriptions.length})
                </button>
                <button
                  className={activeTab === 'investigations' ? 'active' : ''}
                  onClick={() => setActiveTab('investigations')}
                >
                  3. Lab & Radiology Orders ({investigationOrders.length})
                </button>
                <button
                  className={activeTab === 'advice' ? 'active' : ''}
                  onClick={() => setActiveTab('advice')}
                >
                  4. Advice & Follow-up
                </button>
              </TabNavigation>

              {/* TAB 1: Clinical Notes */}
              {activeTab === 'clinical' && (
                <FormSection>
                  <div className="sec-label">Chief Complaints</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      placeholder="Enter symptom (e.g. Fever, Headache)"
                      value={newComplaint.symptom}
                      onChange={e => setNewComplaint({ ...newComplaint, symptom: e.target.value })}
                    />
                    <select
                      style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      value={newComplaint.duration}
                      onChange={e => setNewComplaint({ ...newComplaint, duration: e.target.value })}
                    >
                      <option>1 Day</option>
                      <option>3 Days</option>
                      <option>1 Week</option>
                      <option>1 Month</option>
                    </select>
                    <button
                      onClick={handleAddComplaint}
                      style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>

                  {chiefComplaints.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {chiefComplaints.map((c, i) => (
                        <div key={i} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {c.symptom} - {c.duration}
                          <FiX style={{ cursor: 'pointer' }} onClick={() => setChiefComplaints(chiefComplaints.filter((_, idx) => idx !== i))} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="sec-label" style={{ marginTop: '12px' }}>Diagnosis (ICD-11 / Clinical)</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      placeholder="Search / Enter diagnosis (e.g. Acute URTI, Type 2 Diabetes)"
                      value={newDiagName}
                      onChange={e => setNewDiagName(e.target.value)}
                    />
                    <button
                      onClick={handleAddDiagnosis}
                      style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Add Diagnosis
                    </button>
                  </div>

                  {diagnosisList.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {diagnosisList.map((d, i) => (
                        <div key={i} style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {d.name} ({d.code})
                          <FiX style={{ cursor: 'pointer' }} onClick={() => setDiagnosisList(diagnosisList.filter((_, idx) => idx !== i))} />
                        </div>
                      ))}
                    </div>
                  )}
                </FormSection>
              )}

              {/* TAB 2: Prescriptions (Rx) */}
              {activeTab === 'rx' && (
                <FormSection>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="sec-label">Rx - Medication Order Table</div>
                    <button
                      onClick={handleAddRxRow}
                      style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <RxTable>
                    <thead>
                      <tr>
                        <th style={{ width: '30%' }}>Medicine Name</th>
                        <th>Dosage</th>
                        <th>Timing</th>
                        <th>Days</th>
                        <th>Qty</th>
                        <th>Instructions</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptions.map((rx, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              value={rx.medicine_name}
                              onChange={e => handleUpdateRx(idx, 'medicine_name', e.target.value)}
                              placeholder="Search medicine name..."
                            />
                          </td>
                          <td>
                            <select
                              value={rx.dosage}
                              onChange={e => handleUpdateRx(idx, 'dosage', e.target.value)}
                            >
                              <option>1-0-1</option>
                              <option>1-1-1</option>
                              <option>1-0-0</option>
                              <option>0-0-1</option>
                              <option>SOS</option>
                              <option>Stat</option>
                            </select>
                          </td>
                          <td>
                            <select
                              value={rx.timing}
                              onChange={e => handleUpdateRx(idx, 'timing', e.target.value)}
                            >
                              <option>After Food</option>
                              <option>Before Food</option>
                              <option>With Food</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={rx.duration_days}
                              onChange={e => handleUpdateRx(idx, 'duration_days', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={rx.total_qty}
                              onChange={e => handleUpdateRx(idx, 'total_qty', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              value={rx.instructions}
                              onChange={e => handleUpdateRx(idx, 'instructions', e.target.value)}
                              placeholder="e.g. Take for fever"
                            />
                          </td>
                          <td>
                            <button className="btn-del" onClick={() => handleRemoveRx(idx)}>
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </RxTable>
                </FormSection>
              )}

              {/* TAB 3: Investigations */}
              {activeTab === 'investigations' && (
                <FormSection>
                  <div className="sec-label">Order Lab & Radiology Tests</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      value={newOrder.type}
                      onChange={e => setNewOrder({ ...newOrder, type: e.target.value })}
                    >
                      <option>Lab</option>
                      <option>Radiology</option>
                    </select>
                    <input
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      placeholder="Enter test name (e.g. Complete Blood Count, Chest X-Ray)"
                      value={newOrder.test_name}
                      onChange={e => setNewOrder({ ...newOrder, test_name: e.target.value })}
                    />
                    <button
                      onClick={handleAddOrder}
                      style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Add Order
                    </button>
                  </div>

                  {investigationOrders.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                      {investigationOrders.map((inv, i) => (
                        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: inv.type === 'Lab' ? '#e0f2fe' : '#fef3c7', color: inv.type === 'Lab' ? '#0369a1' : '#b45309', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>
                              {inv.type}
                            </span>
                            <strong style={{ fontSize: '0.88rem' }}>{inv.test_name}</strong>
                          </div>
                          <FiTrash2 style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => setInvestigationOrders(investigationOrders.filter((_, idx) => idx !== i))} />
                        </div>
                      ))}
                    </div>
                  )}
                </FormSection>
              )}

              {/* TAB 4: Advice & Follow-up */}
              {activeTab === 'advice' && (
                <FormSection>
                  <div className="sec-label">Dietary Advice & Instructions</div>
                  <textarea
                    rows={4}
                    style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    placeholder="Enter dietary restrictions, rest recommendations, lifestyle changes..."
                    value={adviceText}
                    onChange={e => setAdviceText(e.target.value)}
                  />

                  <div className="sec-label" style={{ marginTop: '12px' }}>Next Follow-up Date</div>
                  <input
                    type="date"
                    style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '200px' }}
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                  />
                </FormSection>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              Select a patient from the queue to start OP EMR consultation.
            </div>
          )}
        </MainEMRPanel>
      </EMRWorkspaceGrid>

      {/* OPD Summary Print Modal */}
      {showPrintModal && (
        <OPDSummaryPrintModal
          patient={{
            ...selectedPatient,
            vitals,
            chief_complaints: chiefComplaints,
            examination: examinationNotes,
            diagnosis: diagnosisList,
            prescriptions,
            investigation_orders: investigationOrders,
            advice: adviceText,
            follow_up_date: followUpDate
          }}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </PageContainer>
  );
};

export default OPEMRDesk;

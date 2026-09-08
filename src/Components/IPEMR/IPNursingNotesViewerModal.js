import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import apiRequest from '../../Auth/apiRequest';
import {
  X,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Clock,
  User,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Copy,
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9995;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.01em;
    }

    .sub {
      font-size: 0.8rem;
      opacity: 0.9;
      margin-top: 2px;
    }
  }

  .close-btn {
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
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8fafc;
`;

const TimelineCard = styled.div`
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    border-color: #cbd5e1;
  }
`;

const CardHeader = styled.div`
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  .left-meta {
    display: flex;
    align-items: center;
    gap: 10px;

    .shift-tag {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 800;
      background: #e0f2fe;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .date-time {
      font-size: 0.85rem;
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .nurse-meta {
    font-size: 0.8rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;

    strong { color: #0f172a; }
  }
`;

const CardBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PainScoreBanner = styled.div`
  background: ${props => props.$bgColor || '#f0fdf4'};
  border: 1px solid ${props => props.$borderColor || '#bbf7d0'};
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  .pain-title {
    display: flex;
    align-items: center;
    gap: 10px;

    .emoji {
      font-size: 1.8rem;
      line-height: 1;
    }

    .score-info {
      .num {
        font-size: 1.15rem;
        font-weight: 800;
        color: ${props => props.$color || '#166534'};
      }
      .desc {
        font-size: 0.78rem;
        color: #475569;
        margin-top: 2px;
      }
    }
  }

  .pain-details {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.8rem;
    color: #334155;

    .item {
      background: rgba(255, 255, 255, 0.7);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(0, 0, 0, 0.05);

      strong { color: #0f172a; margin-right: 4px; }
    }
  }
`;

const VitalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const VitalItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  .icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: white;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0d9488;
  }

  .info {
    .label {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    .value {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 1px;
    }
  }
`;

const SectionBox = styled.div`
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 16px;
  border: 1px solid #f1f5f9;

  h4 {
    margin: 0 0 6px 0;
    font-size: 0.8rem;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: #1e293b;
    line-height: 1.4;
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const ImportButton = styled.button`
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dcfce7;
    border-color: #86efac;
    transform: translateY(-1px);
  }
`;

const painColorMap = {
  0: { color: '#166534', bgColor: '#f0fdf4', borderColor: '#bbf7d0', emoji: '😄', label: 'No Pain' },
  1: { color: '#3f6212', bgColor: '#f7fee7', borderColor: '#d9f99d', emoji: '🙂', label: 'Mild Pain' },
  2: { color: '#3f6212', bgColor: '#f7fee7', borderColor: '#d9f99d', emoji: '🙂', label: 'Mild Pain' },
  3: { color: '#854d0e', bgColor: '#fefce8', borderColor: '#fef08a', emoji: '😐', label: 'Moderate' },
  4: { color: '#854d0e', bgColor: '#fefce8', borderColor: '#fef08a', emoji: '😐', label: 'Moderate' },
  5: { color: '#9a3412', bgColor: '#fff7ed', borderColor: '#fed7aa', emoji: '🙁', label: 'Severe' },
  6: { color: '#9a3412', bgColor: '#fff7ed', borderColor: '#fed7aa', emoji: '🙁', label: 'Severe' },
  7: { color: '#991b1b', bgColor: '#fef2f2', borderColor: '#fecaca', emoji: '😢', label: 'Very Severe' },
  8: { color: '#991b1b', bgColor: '#fef2f2', borderColor: '#fecaca', emoji: '😢', label: 'Very Severe' },
  9: { color: '#7f1d1d', bgColor: '#fef2f2', borderColor: '#fca5a5', emoji: '😭', label: 'Worst Pain' },
  10: { color: '#7f1d1d', bgColor: '#450a0a', borderColor: '#fca5a5', emoji: '😭', label: 'Worst Pain' }
};

const IPNursingNotesViewerModal = ({
  patient,
  onClose,
  onImportVitals = null
}) => {
  const [nursingNotes, setNursingNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const ipNumber = patient?.ip_number || patient?.ipNumber || '';
  const uhid = patient?.uhid || '';

  const fetchNotes = async () => {
    if (!ipNumber && !uhid) return;
    try {
      setLoading(true);
      const url = ipNumber
        ? `${HmsBaseUrl}IPEMR_NursingNotes/?ip_number=${encodeURIComponent(ipNumber)}`
        : `${HmsBaseUrl}IPEMR_NursingNotes/?uhid=${encodeURIComponent(uhid)}`;
      const res = await apiRequest(url, 'GET');
      let list = [];
      if (Array.isArray(res?.data)) list = res.data;
      else if (res?.data && Array.isArray(res.data.data)) list = res.data.data;
      setNursingNotes(list);
    } catch (err) {
      console.error("Error fetching nursing notes:", err);
      toast.error("Failed to load nursing notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [ipNumber, uhid]);

  const handleCopyVitals = (note) => {
    if (onImportVitals && note.vitals) {
      onImportVitals(note.vitals);
      toast.success("Vitals imported into Physical Examination successfully!");
      onClose();
    } else {
      toast.info("Vitals copied to clipboard.");
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div className="left">
            <div className="icon-box"><Activity size={22} /></div>
            <div>
              <h3>Inpatient Nursing Notes & Vitals Record</h3>
              <div className="sub">
                {patient?.patient_name || 'Patient'} · IP No: <strong>{ipNumber || '-'}</strong>
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>Loading nursing documentation...</div>
            </div>
          ) : nursingNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <Activity size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <h4 style={{ margin: 0, color: '#475569', fontSize: '1.1rem' }}>No Nursing Notes Found</h4>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>
                No shift vitals or pain scores have been recorded by the nursing team for this admission stay yet.
              </p>
            </div>
          ) : (
            nursingNotes.map((note) => {
              const painMeta = painColorMap[note.pain_score] || painColorMap[0];
              const vitals = typeof note.vitals === 'object' && note.vitals !== null ? note.vitals : {};
              const intakeOutput = typeof note.intake_output === 'object' && note.intake_output !== null ? note.intake_output : {};
              const assessment = typeof note.nursing_assessment === 'object' && note.nursing_assessment !== null ? note.nursing_assessment : {};

              return (
                <TimelineCard key={note.id}>
                  <CardHeader>
                    <div className="left-meta">
                      <span className="shift-tag">{note.shift || 'General'} Shift</span>
                      <span className="date-time">
                        <Clock size={14} color="#0d9488" />
                        {new Date(note.note_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="nurse-meta">
                        <User size={14} />
                        Nurse: <strong>{note.nurse_name || note.nurse_id || 'Staff Nurse'}</strong>
                      </div>
                      {onImportVitals && Object.keys(vitals).length > 0 && (
                        <ImportButton onClick={() => handleCopyVitals(note)}>
                          <Copy size={13} /> Copy to Exam Vitals
                        </ImportButton>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody>
                    {/* 1. Pain Scale Banner */}
                    <PainScoreBanner
                      $color={painMeta.color}
                      $bgColor={painMeta.bgColor}
                      $borderColor={painMeta.borderColor}
                    >
                      <div className="pain-title">
                        <span className="emoji">{painMeta.emoji}</span>
                        <div className="score-info">
                          <div className="num">
                            Pain Score: {note.pain_score} / 10 ({note.pain_severity || painMeta.label})
                          </div>
                          <div className="desc">Assessed via Wong-Baker Numeric Rating Scale</div>
                        </div>
                      </div>

                      <div className="pain-details">
                        {note.pain_location && (
                          <div className="item">
                            <strong>Site:</strong> {note.pain_location}
                          </div>
                        )}
                        {note.pain_characteristics && (
                          <div className="item">
                            <strong>Quality:</strong> {note.pain_characteristics}
                          </div>
                        )}
                      </div>
                    </PainScoreBanner>

                    {/* 2. Vital Signs Grid */}
                    <VitalsGrid>
                      <VitalItem>
                        <div className="icon"><Heart size={18} color="#ef4444" /></div>
                        <div className="info">
                          <div className="label">Pulse / HR</div>
                          <div className="value">{vitals.pulse ? `${vitals.pulse} bpm` : '-'}</div>
                        </div>
                      </VitalItem>

                      <VitalItem>
                        <div className="icon"><Activity size={18} color="#0d9488" /></div>
                        <div className="info">
                          <div className="label">Blood Pressure</div>
                          <div className="value">{vitals.bp ? `${vitals.bp} mmHg` : '-'}</div>
                        </div>
                      </VitalItem>

                      <VitalItem>
                        <div className="icon"><Thermometer size={18} color="#f59e0b" /></div>
                        <div className="info">
                          <div className="label">Temperature</div>
                          <div className="value">{vitals.temp ? (vitals.temp.includes('°') ? vitals.temp : `${vitals.temp} °F`) : '-'}</div>
                        </div>
                      </VitalItem>

                      <VitalItem>
                        <div className="icon"><Wind size={18} color="#10b981" /></div>
                        <div className="info">
                          <div className="label">SpO2 / RA</div>
                          <div className="value">{vitals.spo2 ? (vitals.spo2.includes('%') ? vitals.spo2 : `${vitals.spo2}%`) : '-'}</div>
                        </div>
                      </VitalItem>

                      <VitalItem>
                        <div className="icon"><Activity size={18} color="#6366f1" /></div>
                        <div className="info">
                          <div className="label">Respiratory Rate</div>
                          <div className="value">{vitals.rr ? (vitals.rr.includes('/') ? vitals.rr : `${vitals.rr} /min`) : '-'}</div>
                        </div>
                      </VitalItem>

                      <VitalItem>
                        <div className="icon"><Droplets size={18} color="#ec4899" /></div>
                        <div className="info">
                          <div className="label">GRBS / Sugar</div>
                          <div className="value">{vitals.grbs ? (vitals.grbs.includes('mg') ? vitals.grbs : `${vitals.grbs} mg/dL`) : '-'}</div>
                        </div>
                      </VitalItem>

                      <VitalItem>
                        <div className="icon"><ShieldCheck size={18} color="#8b5cf6" /></div>
                        <div className="info">
                          <div className="label">GCS Scale</div>
                          <div className="value">{vitals.gcs || '15/15'}</div>
                        </div>
                      </VitalItem>

                      <VitalItem>
                        <div className="icon"><CheckCircle2 size={18} color="#14b8a6" /></div>
                        <div className="info">
                          <div className="label">Consciousness</div>
                          <div className="value">{vitals.consciousness || 'Alert'}</div>
                        </div>
                      </VitalItem>
                    </VitalsGrid>

                    {/* 3. Fluid Balance & Cannula Care */}
                    <TwoCol>
                      {Object.keys(intakeOutput).length > 0 && (
                        <SectionBox>
                          <h4><Droplets size={14} color="#0d9488" /> Fluid Intake & Output</h4>
                          <p>
                            <strong>Intake:</strong> {intakeOutput.total_intake || '0 mL'} (Oral: {intakeOutput.oral_fluid || '0'}, IV: {intakeOutput.iv_fluid || '0'} mL) <br />
                            <strong>Output:</strong> {intakeOutput.total_output || '0 mL'} (Urine: {intakeOutput.urine_output || '0'} mL) <br />
                            <strong>Net Balance:</strong> <span style={{ fontWeight: 800, color: '#0f172a' }}>{intakeOutput.fluid_balance || '0 mL'}</span>
                          </p>
                        </SectionBox>
                      )}

                      {Object.keys(assessment).length > 0 && (
                        <SectionBox>
                          <h4><ShieldCheck size={14} color="#16a34a" /> Nursing Assessment</h4>
                          <p>
                            <strong>Cannula:</strong> {assessment.cannula_site || 'Patent'} <br />
                            <strong>Skin / Ulcer:</strong> {assessment.skin_integrity || 'Intact'} <br />
                            <strong>Fall Risk:</strong> {assessment.fall_risk || 'Low'}
                          </p>
                        </SectionBox>
                      )}
                    </TwoCol>

                    {/* 4. Nursing Handover Remarks */}
                    {note.handover_notes && (
                      <SectionBox style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                        <h4 style={{ color: '#166534' }}><FileText size={14} /> Nurse Remarks & Shift Handover</h4>
                        <p style={{ color: '#14532d', fontWeight: 600 }}>{note.handover_notes}</p>
                      </SectionBox>
                    )}
                  </CardBody>
                </TimelineCard>
              );
            })
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default IPNursingNotesViewerModal;

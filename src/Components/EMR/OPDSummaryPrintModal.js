import React from 'react';
import styled from 'styled-components';
import { FiPrinter, FiX } from 'react-icons/fi';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .actions {
    display: flex;
    gap: 12px;

    button {
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;

      &.btn-print {
        background: #0d9488;
        color: #ffffff;
        &:hover { background: #0f766e; }
      }

      &.btn-close {
        background: #334155;
        color: #ffffff;
        &:hover { background: #475569; }
      }
    }
  }
`;

const PrintArea = styled.div`
  padding: 32px;
  overflow-y: auto;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #0f172a;
  background: #ffffff;

  @media print {
    padding: 0;
  }
`;

const PrintHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #0d9488;
  padding-bottom: 16px;
  margin-bottom: 20px;

  .hospital-brand {
    h1 {
      font-size: 1.6rem;
      font-weight: 900;
      color: #0d9488;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }
    p {
      margin: 0;
      font-size: 0.78rem;
      color: #64748b;
    }
  }

  .doctor-info {
    text-align: right;
    h4 {
      margin: 0 0 2px 0;
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
    }
    p {
      margin: 0;
      font-size: 0.8rem;
      color: #475569;
    }
  }
`;

const PatientBannerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;

  .item {
    span {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }
    strong {
      font-size: 0.88rem;
      color: #0f172a;
    }
  }
`;

const SectionBox = styled.div`
  margin-bottom: 20px;

  .sec-title {
    font-size: 0.82rem;
    font-weight: 800;
    color: #0d9488;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-bottom: 10px;
  }
`;

const PrescriptionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;

  th, td {
    border: 1px solid #e2e8f0;
    padding: 8px 12px;
    font-size: 0.82rem;
    text-align: left;
  }

  th {
    background: #f1f5f9;
    font-weight: 700;
    color: #475569;
  }
`;

const PrintFooter = styled.div`
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  .advice {
    font-size: 0.82rem;
    color: #334155;
  }

  .signature {
    text-align: center;
    .sig-line {
      width: 150px;
      border-top: 1px solid #0f172a;
      margin-bottom: 4px;
    }
    p {
      margin: 0;
      font-size: 0.78rem;
      font-weight: 700;
    }
  }
`;

const OPDSummaryPrintModal = ({ patient, onClose }) => {
  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h3>OPD Prescription Summary Sheet</h3>
          <div className="actions">
            <button className="btn-print" onClick={handlePrint}>
              <FiPrinter /> Print OPD Sheet
            </button>
            <button className="btn-close" onClick={onClose}>
              <FiX /> Close
            </button>
          </div>
        </ModalHeader>

        <PrintArea>
          <PrintHeader>
            <div className="hospital-brand">
              <h1>SHANMUGA HOSPITAL</h1>
              <p>Multi-Speciality Healthcare Centre · Main Block</p>
              <p>Phone: 0427-2345678 · Web: www.shanmugahospital.com</p>
            </div>
            <div className="doctor-info">
              <h4>{patient.doctor_name || "Dr. S. Ramesh MD"}</h4>
              <p>Consultant Physician & Diabetologist</p>
              <p>Reg No: TN-MC-60291</p>
            </div>
          </PrintHeader>

          <PatientBannerGrid>
            <div className="item">
              <span>Patient Name</span>
              <strong>{patient.patient_name}</strong>
            </div>
            <div className="item">
              <span>Age / Gender</span>
              <strong>{patient.age} Yrs / {patient.gender}</strong>
            </div>
            <div className="item">
              <span>UHID / OP No</span>
              <strong>{patient.uhid} ({patient.op_number})</strong>
            </div>
            <div className="item">
              <span>Visit Date</span>
              <strong>{new Date(patient.visit_date).toLocaleDateString('en-GB')}</strong>
            </div>
          </PatientBannerGrid>

          {/* Vitals */}
          {patient.vitals && (
            <SectionBox>
              <div className="sec-title">Vital Signs</div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', background: '#fafafa', padding: '8px 12px', borderRadius: '8px' }}>
                <span><strong>BP:</strong> {patient.vitals.bp || '-'}</span>
                <span><strong>Pulse:</strong> {patient.vitals.pulse || '-'} bpm</span>
                <span><strong>Temp:</strong> {patient.vitals.temp || '-'} °F</span>
                <span><strong>SpO2:</strong> {patient.vitals.spo2 || '-'}%</span>
                <span><strong>Weight:</strong> {patient.vitals.weight_kg || '-'} kg</span>
                <span><strong>BMI:</strong> {patient.vitals.bmi || '-'}</span>
              </div>
            </SectionBox>
          )}

          {/* Chief Complaints */}
          {patient.chief_complaints && patient.chief_complaints.length > 0 && (
            <SectionBox>
              <div className="sec-title">Chief Complaints</div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
                {patient.chief_complaints.map((c, i) => (
                  <li key={i}><strong>{c.symptom}</strong> - {c.duration} ({c.severity})</li>
                ))}
              </ul>
            </SectionBox>
          )}

          {/* Diagnosis */}
          {patient.diagnosis && patient.diagnosis.length > 0 && (
            <SectionBox>
              <div className="sec-title">Diagnosis</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                {patient.diagnosis.map(d => `${d.name} (${d.code || 'ICD-11'})`).join(', ')}
              </div>
            </SectionBox>
          )}

          {/* Prescription Table */}
          {patient.prescriptions && patient.prescriptions.length > 0 && (
            <SectionBox>
              <div className="sec-title">Rx - Prescribed Medications</div>
              <PrescriptionTable>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine Name</th>
                    <th>Dosage</th>
                    <th>Timing</th>
                    <th>Duration</th>
                    <th>Total Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.prescriptions.map((rx, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td><strong>{rx.medicine_name}</strong></td>
                      <td>{rx.dosage}</td>
                      <td>{rx.timing}</td>
                      <td>{rx.duration_days} Days</td>
                      <td>{rx.total_qty}</td>
                    </tr>
                  ))}
                </tbody>
              </PrescriptionTable>
            </SectionBox>
          )}

          {/* Investigations */}
          {patient.investigation_orders && patient.investigation_orders.length > 0 && (
            <SectionBox>
              <div className="sec-title">Advice Investigations / Tests</div>
              <div style={{ fontSize: '0.85rem' }}>
                {patient.investigation_orders.map((inv, i) => `${i + 1}. [${inv.type}] ${inv.test_name}`).join('   ·   ')}
              </div>
            </SectionBox>
          )}

          {/* Print Footer */}
          <PrintFooter>
            <div className="advice">
              <div style={{ fontWeight: 800, marginBottom: '4px' }}>ADVICE & INSTRUCTIONS:</div>
              <p style={{ margin: 0 }}>{patient.advice || "Take prescribed medicines regularly. Drink plenty of water."}</p>
              {patient.follow_up_date && (
                <p style={{ margin: '6px 0 0 0', fontWeight: 700, color: '#0d9488' }}>
                  Next Follow-up Date: {patient.follow_up_date}
                </p>
              )}
            </div>
            <div className="signature">
              <div className="sig-line" />
              <p>Doctor Signature</p>
            </div>
          </PrintFooter>
        </PrintArea>
      </ModalCard>
    </ModalOverlay>
  );
};

const ModalCard = styled(ModalContainer)`
  animation: fadeIn 0.2s ease-out;
`;

export default OPDSummaryPrintModal;

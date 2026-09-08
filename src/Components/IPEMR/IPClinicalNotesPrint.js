import React, { useRef } from 'react';
import styled from 'styled-components';
import { Printer, X } from 'lucide-react';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const PrintModalCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 16px 24px;
  background: #0f172a;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  button.print-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #0d9488;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: #0f766e; }
  }

  button.close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover { background: rgba(255, 255, 255, 0.2); }
  }
`;

const PrintContentArea = styled.div`
  padding: 32px;
  overflow-y: auto;
  background: #f8fafc;

  @media print {
    padding: 0;
    background: white;
  }
`;

const PaperSheet = styled.div`
  background: white;
  padding: 36px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1e293b;

  .hospital-header {
    text-align: center;
    border-bottom: 2px solid #0d9488;
    padding-bottom: 16px;
    margin-bottom: 20px;

    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0d9488;
      margin: 0 0 4px 0;
      letter-spacing: 0.5px;
    }
    .sub-head {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .doc-type-badge {
      display: inline-block;
      background: #0f172a;
      color: white;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .patient-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    background: #f1f5f9;
    padding: 14px 18px;
    border-radius: 8px;
    font-size: 12px;
    margin-bottom: 24px;
    border: 1px solid #e2e8f0;

    .item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      .lbl { color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; }
      .val { color: #0f172a; font-weight: 700; font-size: 13px; }
    }
  }

  .section-block {
    margin-bottom: 20px;

    .sec-title {
      font-size: 13px;
      font-weight: 800;
      color: #0d9488;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .sec-content {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.5;
    }
  }

  table.styled-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 6px;

    th, td {
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      font-weight: 700;
      color: #475569;
    }
  }

  .signature-area {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 20px;
    border-top: 1px dashed #cbd5e1;

    .date-info {
      font-size: 12px;
      color: #64748b;
    }

    .doc-sign {
      text-align: center;
      .sign-line {
        width: 180px;
        border-bottom: 1px solid #0f172a;
        margin-bottom: 6px;
      }
      .name { font-weight: 700; color: #0f172a; font-size: 13px; }
      .desig { font-size: 11px; color: #64748b; }
    }
  }
`;

const IPClinicalNotesPrint = ({ noteData, patient, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '', 'width=900,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>IP Doctor Clinical Notes - ${patient?.patient_name || noteData?.patient_name || 'Patient'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; margin: 20px; color: #1e293b; }
            .hospital-header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
            .hospital-header h1 { font-size: 22px; color: #0d9488; margin: 0; }
            .hospital-header .sub-head { font-size: 12px; color: #64748b; }
            .doc-type-badge { display: inline-block; background: #0f172a; color: white; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 12px; margin-top: 6px; }
            .patient-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 11px; margin-bottom: 16px; }
            .patient-summary-grid .item .lbl { color: #64748b; font-weight: bold; font-size: 10px; }
            .patient-summary-grid .item .val { color: #0f172a; font-weight: bold; font-size: 12px; }
            .section-block { margin-bottom: 14px; }
            .sec-title { font-size: 12px; font-weight: bold; color: #0d9488; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 6px; }
            .sec-content { font-size: 11.5px; line-height: 1.4; color: #334155; }
            table.styled-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
            table.styled-table th, table.styled-table td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }
            table.styled-table th { background: #f8fafc; font-weight: bold; }
            .signature-area { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 15px; border-top: 1px dashed #cbd5e1; }
            .doc-sign { text-align: center; }
            .sign-line { width: 160px; border-bottom: 1px solid #000; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
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

  const pName = patient?.patient_name || noteData?.patient_name || 'N/A';
  const uhid = patient?.uhid || noteData?.uhid || 'N/A';
  const ipNo = patient?.ip_number || noteData?.ip_number || 'N/A';
  const roomBed = `Room ${patient?.room_no || noteData?.room_no || '-'} · Bed ${patient?.bed_no || noteData?.bed_no || '-'}`;
  const docName = noteData?.doctor_name || patient?.doctor_name || 'Attending Physician';
  const noteDate = noteData?.note_date ? new Date(noteData.note_date).toLocaleString() : new Date().toLocaleString();

  const allergies = noteData?.allergies || {};
  const chiefComplaints = noteData?.chief_complaints || [];
  const pastHistory = noteData?.past_history || {};
  const presentMeds = noteData?.present_medications || [];
  const socialHistory = noteData?.social_history || {};
  const menstrualHistory = noteData?.menstrual_history || {};
  const vaccinationHistory = noteData?.vaccination_history || {};
  const obstetricsHistory = noteData?.obstetrics_history || {};
  const investigationsDone = noteData?.investigations_done || {};
  const physicalExam = noteData?.physical_examination || {};
  const diagnosis = noteData?.provisional_diagnosis || {};
  const planOfCare = noteData?.plan_of_care || {};

  return (
    <ModalOverlay onClick={onClose}>
      <PrintModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3><Printer size={18} /> IP Clinical Notes Preview</h3>
          <div className="actions">
            <button className="print-btn" onClick={handlePrint}>
              <Printer size={16} /> Print Sheet
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </ModalHeader>

        <PrintContentArea>
          <PaperSheet ref={printRef}>
            <div className="hospital-header">
              <h1>HOSPITAL INPATIENT MEDICAL RECORD</h1>
              <div className="sub-head">Clinical Department of Inpatient Care & Surgery</div>
              <div className="doc-type-badge">{noteData?.note_type || 'Inpatient Clinical Note'}</div>
            </div>

            {/* Patient Header Grid */}
            <div className="patient-summary-grid">
              <div className="item">
                <span className="lbl">Patient Name</span>
                <span className="val">{pName}</span>
              </div>
              <div className="item">
                <span className="lbl">UHID / IP Number</span>
                <span className="val">{uhid} / {ipNo}</span>
              </div>
              <div className="item">
                <span className="lbl">Age / Gender</span>
                <span className="val">{patient?.age || noteData?.age || '-'} Yrs / {patient?.gender || noteData?.gender || '-'}</span>
              </div>
              <div className="item">
                <span className="lbl">Ward / Bed Location</span>
                <span className="val">{roomBed}</span>
              </div>
              <div className="item">
                <span className="lbl">Attending Doctor</span>
                <span className="val">Dr. {docName}</span>
              </div>
              <div className="item">
                <span className="lbl">Date & Time</span>
                <span className="val">{noteDate}</span>
              </div>
            </div>

            {/* 1. Allergies */}
            <div className="section-block">
              <div className="sec-title">1. Known Allergies</div>
              <div className="sec-content">
                {allergies.drug || allergies.food || allergies.environmental || allergies.notes ? (
                  <div>
                    {allergies.drug && <div><strong>Drug Allergies:</strong> {allergies.drug} (Severity: {allergies.drug_severity || 'Moderate'})</div>}
                    {allergies.food && <div><strong>Food Allergies:</strong> {allergies.food}</div>}
                    {allergies.environmental && <div><strong>Environmental:</strong> {allergies.environmental}</div>}
                    {allergies.reaction && <div><strong>Allergic Reaction:</strong> {allergies.reaction}</div>}
                    {allergies.notes && <div><strong>Notes:</strong> {allergies.notes}</div>}
                  </div>
                ) : (
                  <span>No known drug or food allergies documented (NKDA).</span>
                )}
              </div>
            </div>

            {/* 2. Chief Complaints */}
            <div className="section-block">
              <div className="sec-title">2. Chief Complaints</div>
              <div className="sec-content">
                {chiefComplaints.length > 0 ? (
                  <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                    {chiefComplaints.map((c, i) => (
                      <li key={i}>
                        <strong>{c.complaint || c}</strong> {c.duration ? `— for ${c.duration}` : ''} {c.severity ? `(${c.severity})` : ''} {c.description ? `: ${c.description}` : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span>No active chief complaints recorded.</span>
                )}
              </div>
            </div>

            {/* 3. Past History */}
            <div className="section-block">
              <div className="sec-title">3. Past Medical & Surgical History</div>
              <div className="sec-content">
                <div><strong>Past Medical History:</strong> {pastHistory.medical_conditions?.join(', ') || pastHistory.medical_notes || 'None reported'}</div>
                {pastHistory.surgical_history && <div><strong>Surgical History:</strong> {pastHistory.surgical_history}</div>}
                {pastHistory.family_history && <div><strong>Family History:</strong> {pastHistory.family_history}</div>}
              </div>
            </div>

            {/* 4. Present Medications */}
            <div className="section-block">
              <div className="sec-title">4. Present Medications</div>
              <div className="sec-content">
                {presentMeds.length > 0 ? (
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Medication Name</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Route</th>
                        <th>Duration / Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presentMeds.map((m, idx) => (
                        <tr key={idx}>
                          <td><strong>{m.name || m.medicine_name || '-'}</strong></td>
                          <td>{m.dosage || '-'}</td>
                          <td>{m.frequency || '-'}</td>
                          <td>{m.route || 'Oral'}</td>
                          <td>{m.duration || m.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <span>No home or pre-admission medications listed.</span>
                )}
              </div>
            </div>

            {/* 5. Social History */}
            <div className="section-block">
              <div className="sec-title">5. Social History</div>
              <div className="sec-content">
                <span>
                  <strong>Diet:</strong> {socialHistory.diet || 'Mixed'} | 
                  <strong> Smoking / Tobacco:</strong> {socialHistory.smoking || 'Non-smoker'} | 
                  <strong> Alcohol:</strong> {socialHistory.alcohol || 'Non-alcoholic'} | 
                  <strong> Occupation:</strong> {socialHistory.occupation || 'N/A'}
                  {socialHistory.notes ? ` | Notes: ${socialHistory.notes}` : ''}
                </span>
              </div>
            </div>

            {/* 6. Menstrual History & 8. Obstetrics History */}
            {(menstrualHistory.lmp || obstetricsHistory.gravida || patient?.gender?.toLowerCase() === 'female') && (
              <div className="section-block">
                <div className="sec-title">6 & 8. Menstrual & Obstetric History</div>
                <div className="sec-content">
                  {menstrualHistory.lmp && <div><strong>LMP:</strong> {menstrualHistory.lmp} | <strong>Cycle:</strong> {menstrualHistory.cycle || 'Regular'} | <strong>Flow:</strong> {menstrualHistory.flow || 'Normal'}</div>}
                  {(obstetricsHistory.gravida || obstetricsHistory.para) && (
                    <div>
                      <strong>Obstetrics Score:</strong> G: {obstetricsHistory.gravida || 0} P: {obstetricsHistory.para || 0} L: {obstetricsHistory.living || 0} A: {obstetricsHistory.abortions || 0}
                      {obstetricsHistory.delivery_type && ` | Delivery Mode: ${obstetricsHistory.delivery_type}`}
                      {obstetricsHistory.notes && ` | Details: ${obstetricsHistory.notes}`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. Vaccination History */}
            <div className="section-block">
              <div className="sec-title">7. Vaccination History</div>
              <div className="sec-content">
                <div>
                  <strong>COVID-19:</strong> {vaccinationHistory.covid || 'Completed'} | 
                  <strong> Tetanus (TT):</strong> {vaccinationHistory.tt || 'Up to date'} | 
                  <strong> Hepatitis B:</strong> {vaccinationHistory.hepb || 'Up to date'}
                  {vaccinationHistory.others ? ` | Others: ${vaccinationHistory.others}` : ''}
                </div>
              </div>
            </div>

            {/* 9. Investigation Done If Any */}
            <div className="section-block">
              <div className="sec-title">9. Investigations Done If Any</div>
              <div className="sec-content">
                {investigationsDone.lab_findings || investigationsDone.radiology_findings || investigationsDone.summary ? (
                  <div>
                    {investigationsDone.lab_findings && <div><strong>Lab / Blood Results:</strong> {investigationsDone.lab_findings}</div>}
                    {investigationsDone.radiology_findings && <div><strong>Radiology / Imaging:</strong> {investigationsDone.radiology_findings}</div>}
                    {investigationsDone.summary && <div><strong>Summary / Other:</strong> {investigationsDone.summary}</div>}
                  </div>
                ) : (
                  <span>Pending / No previous investigations attached.</span>
                )}
              </div>
            </div>

            {/* 10. Physical Examination */}
            <div className="section-block">
              <div className="sec-title">10. Physical Examination</div>
              <div className="sec-content">
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', marginBottom: '6px' }}>
                  <strong>Vitals: </strong>
                  Pulse: {physicalExam.vitals?.pulse || '-'} bpm | 
                  BP: {physicalExam.vitals?.bp || '-'} mmHg | 
                  Temp: {physicalExam.vitals?.temp || '-'} °F | 
                  RR: {physicalExam.vitals?.rr || '-'} /min | 
                  SpO2: {physicalExam.vitals?.spo2 || '-'}% | 
                  GRBS: {physicalExam.vitals?.grbs || '-'} mg/dL
                </div>
                <div><strong>General Exam:</strong> {physicalExam.general || 'Conscious, Oriented, Afebrile, No pallor/icterus/cyanosis/clubbing/edema'}</div>
                <div><strong>CVS:</strong> {physicalExam.systemic_cvs || 'S1 S2 heard, No murmurs'}</div>
                <div><strong>Respiratory (RS):</strong> {physicalExam.systemic_rs || 'Bilateral normal vesicular breath sounds, No added sounds'}</div>
                <div><strong>Abdomen (PA):</strong> {physicalExam.systemic_pa || 'Soft, non-tender, no organomegaly, normal bowel sounds'}</div>
                <div><strong>CNS:</strong> {physicalExam.systemic_cns || 'Higher mental functions intact, no focal neurological deficits'}</div>
                {physicalExam.local_exam && <div><strong>Local / Site Examination:</strong> {physicalExam.local_exam}</div>}
              </div>
            </div>

            {/* 11. Provisional Diagnosis */}
            <div className="section-block">
              <div className="sec-title">11. Provisional Diagnosis</div>
              <div className="sec-content">
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  {diagnosis.primary || diagnosis.primary_diagnosis || 'Under Evaluation'}
                </div>
                {diagnosis.secondary && <div><strong>Secondary / Co-morbidities:</strong> {diagnosis.secondary}</div>}
                {diagnosis.icd_code && <div><strong>ICD-10/11:</strong> {diagnosis.icd_code}</div>}
                {diagnosis.differential && <div><strong>Differential Diagnosis:</strong> {diagnosis.differential}</div>}
              </div>
            </div>

            {/* 12. Plan of Care */}
            <div className="section-block">
              <div className="sec-title">12. Plan of Care</div>
              <div className="sec-content">
                <div><strong>Treatment Orders:</strong> {planOfCare.treatment_orders || 'Continue supportive inpatient care and prescribed IV medications.'}</div>
                {planOfCare.investigations_advised && <div><strong>Investigations Advised:</strong> {planOfCare.investigations_advised}</div>}
                {planOfCare.diet_orders && <div><strong>Diet Orders:</strong> {planOfCare.diet_orders}</div>}
                {planOfCare.nursing_instructions && <div><strong>Nursing / Monitoring:</strong> {planOfCare.nursing_instructions}</div>}
                {planOfCare.consults && <div><strong>Specialist Referrals:</strong> {planOfCare.consults}</div>}
              </div>
            </div>

            {/* Signature Area */}
            <div className="signature-area">
              <div className="date-info">
                <div>Document Generated: {new Date().toLocaleString()}</div>
                <div>Status: {noteData?.is_finalized ? 'Finalized Note' : 'Active Clinical Note'}</div>
              </div>
              <div className="doc-sign">
                <div className="sign-line"></div>
                <div className="name">Dr. {docName}</div>
                <div className="desig">Attending Physician / Surgeon</div>
              </div>
            </div>
          </PaperSheet>
        </PrintContentArea>
      </PrintModalCard>
    </ModalOverlay>
  );
};

export default IPClinicalNotesPrint;

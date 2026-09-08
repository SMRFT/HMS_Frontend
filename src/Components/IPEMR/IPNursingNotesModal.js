import React from 'react';
import styled from 'styled-components';
import { X, Activity } from 'lucide-react';
import IPNursingDesk from './IPNursingDesk';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9990;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left {
    display: flex;
    align-items: center;
    gap: 10px;

    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sub {
      font-size: 0.8rem;
      opacity: 0.9;
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
  padding: 16px;
  background: #f8fafc;
`;

const IPNursingNotesModal = ({ patient, onClose }) => {
  // Normalize patient props for consistency
  const normalizedPatient = {
    ...patient,
    patient_name: patient.patient_name || patient.patientName || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Patient',
    uhid: patient.uhid || '-',
    ip_number: patient.ip_number || patient.ipNumber || '-',
    room_no: patient.room_no || patient.roomNo || '-',
    bed_no: patient.bed_no || patient.bedNo || '-',
    doctor_name: patient.doctorName || patient.doctor_name || patient.admittingDoctor || 'Attending Physician',
    gender: patient.gender || 'Male',
    age: patient.age || '-'
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div className="left">
            <h3><Activity size={20} /> Inpatient Nursing Notes & Vitals</h3>
            <span className="sub">
              | {normalizedPatient.patient_name} · Room {normalizedPatient.room_no} Bed {normalizedPatient.bed_no} · Pain Scale & Intake/Output
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </ModalHeader>

        <ModalBody>
          <IPNursingDesk
            initialPatient={normalizedPatient}
            isModal={true}
            onClose={onClose}
          />
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default IPNursingNotesModal;

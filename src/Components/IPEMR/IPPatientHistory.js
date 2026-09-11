import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IPPatientHistoryModal from './IPPatientHistoryModal';

const IPPatientHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const uhidFromQuery = queryParams.get('uhid') || location.state?.uhid || '';
  const ipNumberFromQuery = queryParams.get('ip_number') || location.state?.ip_number || location.state?.ipNumber || '';

  const patientState = location.state?.patient || {
    uhid: uhidFromQuery,
    ip_number: ipNumberFromQuery
  };

  return (
    <div style={{ padding: '0', height: '100vh', background: '#f1f5f9' }}>
      <IPPatientHistoryModal
        isOpen={true}
        uhid={uhidFromQuery}
        ipNumber={ipNumberFromQuery}
        patient={patientState}
        onClose={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/IPEMRDesk');
          }
        }}
      />
    </div>
  );
};

export default IPPatientHistory;

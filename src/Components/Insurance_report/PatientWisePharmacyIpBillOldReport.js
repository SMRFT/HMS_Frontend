import React from 'react';
import PatientWisePharmacyIpBillReport from './PatientWisePharmacyIpBillReport';

const PatientWisePharmacyIpBillOldReport = ({ embedded = false }) => {
    return <PatientWisePharmacyIpBillReport embedded={embedded} isOldReport={true} />;
};

export default PatientWisePharmacyIpBillOldReport;

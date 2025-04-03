import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import Login from './Components/Login'; // Import Login component
import Register from './Components/Register';
import PharmacyBilling from './Components/pharmacy';
import StockEntry from './Components/StockEntry';
import './App.css';
import PatientRegistrationForm from './Components/PatientRegistrationForm';
import HSNCodeForm from './Components/HSNCode';
import VentorForm from './Components/VentorForm';
import StockDisplay from './Components/StockDisplay';
import DoctorList from './Components/DoctorList';
import DoctorReport from './Components/DoctorReport';
import CTList from './Components/CTList';
import CTReportForm from './Components/CTReportForm';
import MRIList from './Components/MRIList';
import MRIReportForm from './Components/MRIReportForm';
import Doctor from './Components/Doctor';
import Admission from './Components/Admission';
import Enquiry from './Components/Enquiry';
import DoctorBill from './Components/DoctorBill';
import SummaryPrint from './Components/SummaryPrint';
import Summary from './Components/Summary';
import EditSummary from './Components/EditSummary';
import QRScanForm from './Components/QRScanForm';
import QRScan from './Components/QRScan';
import ReferenceDoctorForm from './Components/ReferenceDoctorForm';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/'; // Check if the current route is the login page
  const isRegisterPage1 = location.pathname === '/QRScan'; // Check if the current route is th
  const isRegisterPage = location.pathname === '/QRScanForm'; // Check if the current route is th



  return (
    <div className="App">
      {!isLoginPage && <Sidebar />} 
      <div className="content">{children}</div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route for the login page */}
        <Route path="/" element={<Login />} />
        <Route path="/QRScanForm" element={<QRScanForm />} />
        <Route path="/QRScan" element={<QRScan />} />
        {/* All other routes wrapped in the Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/Register" element={<Register />} />
                <Route path="/PatientRegistrationForm" element={<PatientRegistrationForm />} />
                <Route path="/ReferenceDoctorForm" element={<ReferenceDoctorForm />} />
                <Route path="/Enquiry" element={<Enquiry />} />
                <Route path="/PharmacyBilling" element={<PharmacyBilling />} />
                <Route path="/StockEntry" element={<StockEntry />} />
                <Route path="/StockDisplay" element={<StockDisplay />} />
                <Route path="/HSNCodeForm" element={<HSNCodeForm />} />
                <Route path="/VentorForm" element={<VentorForm />} />
                <Route path="/Doctor" element={<Doctor />} />
                <Route path="/DoctorList" element={<DoctorList />} />
                <Route path="/DoctorBill" element={<DoctorBill/>} />
                <Route path="/DoctorList/:first_name" element={<DoctorReport />} />
                <Route path="/CTList" element={<CTList />} />         
                <Route path="/CTList/:uhid/:subUhid" element={<CTReportForm />} />
                <Route path="/MRIList" element={<MRIList />} />         
                <Route path="/MRIList/:uhid/:subUhid" element={<MRIReportForm />} />
                <Route path="/Admission" element={<Admission />} />
                <Route path="/Summary" element={<Summary />} />
                <Route path="/EditSummary/:ipNo" element={<EditSummary />} />
                <Route path="/SummaryPrint/:ipNo" element={<SummaryPrint/>} />
                {/* <Route path="/QRScanForm" element={<QRScanForm/>} /> */}
                {/* <Route path="/QRScan" element={<QRScan/>} /> */}
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

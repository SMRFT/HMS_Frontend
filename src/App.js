import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Login from "./Components/Login"; // Import Login component
import Register from "./Components/Register";
import PharmacyBilling from "./Components/pharmacy";
import Doctor from "./Components/Doctor";
import DoctorList from "./Components/DoctorList";
import DoctorReport from "./Components/DoctorReport";
import "./App.css";
import CTReportForm from "./Components/CTReportForm";
import CTList from "./Components/CTList";
import MRIList from "./Components/MRIList";
import MRIReportForm from "./Components/MRIReportForm";
import Admission from "./Components/Admission";
import Summary from "./Components/Summary";
import EditSummary from "./Components/EditSummary";
import SummaryPrint from "./Components/SummaryPrint";
import InvestigationBilling from "./Components/InvestigationBilling";
import ViewEstimate from "./Components/ViewEstimate";
import ViewBills from "./Components/ViewBills";
import USGList from "./Components/USGList";
import USGReportForm from "./Components/USGReportForm";

function App() {
  // Initialize sidebar state from localStorage (if available)
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    JSON.parse(localStorage.getItem("sidebarOpen")) || false
  );

  // Update localStorage whenever sidebar state changes
  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  return (
    <Router>
      <div className="App">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/sidebar" element={<Sidebar />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/PharmacyBilling" element={<PharmacyBilling />} />
            <Route path="/Doctor" element={<Doctor />} />
            <Route path="/DoctorList" element={<DoctorList />} />
            <Route path="/DoctorList/:first_name" element={<DoctorReport />} />
            <Route path="/CTList" element={<CTList />} />
            <Route path="/CTList/:uhid/:subUhid" element={<CTReportForm />} />
            <Route path="/MRIList" element={<MRIList />} />
            <Route path="/MRIList/:uhid/:subUhid" element={<MRIReportForm />} />
            <Route path="/Admission" element={<Admission />} />
            <Route path="/Summary" element={<Summary />} />
            <Route path="/EditSummary/:ipNo" element={<EditSummary />} />
            <Route path="/SummaryPrint/:ipNo" element={<SummaryPrint />} />
            <Route
              path="/InvestigationBilling"
              element={<InvestigationBilling />}
            />
            <Route path="/ViewEstimate" element={<ViewEstimate />} />
            <Route path="/ViewBills" element={<ViewBills />} />

            <Route path="/USGList" element={<USGList />} />
            <Route path="/USGList/:uhid/:subUhid" element={<USGReportForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";
import Sidebar from "./Components/Sidebar";

// Import all HMS components
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Admission from "./Components/NursingStation/Admission";
import RoomShifting from "./Components/NursingStation/RoomShifting";
import RoomEnquiry from "./Components/Rooms/EnquiryRoom";
import RoomCategory from "./Components/Rooms/RoomCategory";
import Room from "./Components/Rooms/Room";
import Block from "./Components/Rooms/Block";
import DischargeForm from "./Components/Discharge/DischargeForm";
import VendorManagement from "./Components/InventoryMaster/VendorManagement";
import PharmacyItemMaster from "./Components/InventoryMaster/PharmacyItem";
import GRNGeneration from "./Components/InventoryMaster/GRNGeneration";
import PatientRegistrationForm from "./Components/Register/PatientRegistrationForm";
import OPPharmacy from "./Components/Pharmacy/OPPharmacy";
import IPPharmacy from "./Components/Pharmacy/IPPharmacy";
import Summary from "./Components/Summary/Summary";
import EditSummary from "./Components/Summary/EditSummary";
import SummaryPrint from "./Components/Summary/SummaryPrint";
// Doctor Master
import DoctorList from "./Components/DoctorMaster/DoctorList";
import DoctorSchedule from "./Components/DoctorMaster/DoctorSchedule";

// Investigation Billing
import InvestigationBilling from "./Components/InvestigationBilling/InvestigationBilling";
import ViewBills from "./Components/InvestigationBilling/ViewBills";
import ViewEstimate from "./Components/InvestigationBilling/ViewEstimate";

// Investigation Reports
import CTList from "./Components/InvestigationReports/CTList";
import CTReportForm from "./Components/InvestigationReports/CTReportForm";
import MRIList from "./Components/InvestigationReports/MRIList";
import MRIReportForm from "./Components/InvestigationReports/MRIReportForm";
import USGList from "./Components/InvestigationReports/USGList";
import USGReportForm from "./Components/InvestigationReports/USGReportForm";
import XRayList from "./Components/InvestigationReports/XRayList";
import XRayReportForm from "./Components/InvestigationReports/XRayRportForm";
import Enquiry from "./Components/Register/Enquiry";

// Discharge
import DischargeReport from "./Components/Discharge/DischargeReport";
import IPAdvance from "./Components/NursingStation/IPAdvance";
import PharmacyCategory from "./Components/InventoryMaster/PharmacyCategory";
import GRNAnalysis from "./Components/InventoryMaster/GRNAnalysis";
// Layout wrapper
const ContentWrapper = styled.div`
  margin-top: 15px;
  padding: 20px;
  margin-left: 210px;

  @media (max-width: 1024px) {
    margin-left: 200px;
  }
  @media (max-width: 768px) {
    margin-left: 100px;
  }
  @media (max-width: 480px) {
    margin-left: 20px;
  }
`;

// Main App
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: get role from localStorage or API
  useEffect(() => {
    const userRole = localStorage.getItem('role')
    setRole(userRole);

    // Auto-navigate to default route
    if (location.pathname === "/") {
      if (userRole === "Pharmacist") navigate("/OPPharmacy");
      if (userRole === "Super Admin") navigate("/PatientRegistrationForm");
      else navigate("/PatientRegistrationForm");
    }
    setIsLoading(false);
  }, [location.pathname, navigate]);

  // Update page title based on route
  useEffect(() => {
    const routeTitles = {
      "/": "Login",
      "/Dashboard": "Dashboard",
      "/PatientRegistrationForm": "Patient Registration",
      "/Admission": "Admission",
      "/IPAdvance": "IPAdvance",
      "/RoomShifting": "Room Shifting",
      "/RoomEnquiry": "Room Enquiry",
      "/RoomCategory": "Room Category",
      "/Room": "Room Master",
      "/Block": "Block Master",
      "/PharmacyItemMaster": "Pharmacy Stock",
      "/VendorManagement": "Vendor Management",
      "/GRNGeneration": "GRN Generation",
      "/IPPharmacy": "IP Pharmacy",
      "/OPPharmacy": "OP Pharmacy",
      "/DischargeForm": "Discharge Form",
      "/Summary": "Discharge Summary",
      "/DoctorList": "Doctor List",
      "/DoctorSchedule": "Doctor Schedule",
      "/InvestigationBilling": "Investigation Billing",
      "/ViewBills": "View Bills",
      "/ViewEstimate": "View Estimates",
      "/CTList": "CT Reports",
      "/MRIList": "MRI Reports",
      "/USGList": "USG Reports",
      "/XRayList": "X-Ray Reports",
      "/DischargeReport": "Discharge Report",
      "/Enquiry": "Enquiry",
    };

    const path = location.pathname;
    // Handle dynamic routes (e.g., /EditSummary/123)
    if (path.startsWith("/EditSummary/")) {
      document.title = "Edit Summary - Shanmuga Hospital";
    } else if (path.startsWith("/SummaryPrint/")) {
      document.title = "Print Summary - Shanmuga Hospital";
    } else if (path.startsWith("/CTReportForm/")) {
      document.title = "CT Report Form - Shanmuga Hospital";
    } else if (path.startsWith("/MRIReportForm/")) {
      document.title = "MRI Report Form - Shanmuga Hospital";
    } else if (path.startsWith("/USGReportForm/")) {
      document.title = "USG Report Form - Shanmuga Hospital";
    } else if (path.startsWith("/XRayReportForm/")) {
      document.title = "X-Ray Report Form - Shanmuga Hospital";
    } else {
      const title = routeTitles[path] || "Shanmuga Hospital Management System";
      document.title = `${title} - Shanmuga Hospital`;
    }
  }, [location.pathname]);

  // Routes where sidebar is hidden (login page)
  const hideSidebarRoutes = ["/"];
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar role={role} />}

      {hideSidebarRoutes.includes(location.pathname) ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          Redirecting based on your role...
        </div>
      ) : (
        <ContentWrapper>
          <Routes>
              <>
                <Route path="/PatientRegistrationForm" element={<PatientRegistrationForm />} />

                <Route path="/Block" element={<Block />} />
                <Route path="/RoomCategory" element={<RoomCategory />} />
                <Route path="/Room" element={<Room />} />
                <Route path="/RoomShifting" element={<RoomShifting />} />
                <Route path="/RoomEnquiry" element={<RoomEnquiry />} />

                <Route path="/PharmacyItemMaster" element={<PharmacyItemMaster />} />
                <Route path="/PharmacyCategory" element={<PharmacyCategory />} />
                <Route path="/VendorManagement" element={<VendorManagement />} />
                <Route path="/GRNGeneration" element={<GRNGeneration />} />
                <Route path="/GRNAnalysis" element={<GRNAnalysis />} />

                <Route path="/Admission" element={<Admission />} />
                <Route path="/IPAdvance" element={<IPAdvance />} />

                <Route path="/DischargeForm" element={<DischargeForm />} />
                <Route path="/DischargeReport" element={<DischargeReport />} />

                <Route path="/IPPharmacy" element={<IPPharmacy />} />
                <Route path="/OPPharmacy" element={<OPPharmacy />} />
                <Route path="/Summary" element={<Summary />} />
                <Route path="/EditSummary/:ipNo" element={<EditSummary />} />
                <Route path="/SummaryPrint/:ipNo" element={<SummaryPrint />} />
                <Route path="/Enquiry" element={<Enquiry />} />

                {/* Doctor Master */}
                <Route path="/DoctorList" element={<DoctorList />} />
                <Route path="/DoctorSchedule/:employee_id" element={<DoctorSchedule />} />

                {/* Investigation Billing */}
                <Route path="/InvestigationBilling" element={<InvestigationBilling />} />
                <Route path="/ViewBills" element={<ViewBills />} />
                <Route path="/ViewEstimate" element={<ViewEstimate />} />

                {/* Investigation Reports */}
                <Route path="/CTList" element={<CTList />} />
                <Route path="/CTReportForm/:uhid/:subUhid" element={<CTReportForm />} />
                <Route path="/MRIList" element={<MRIList />} />
                <Route path="/MRIReportForm/:uhid/:subUhid" element={<MRIReportForm />} />
                <Route path="/USGList" element={<USGList />} />
                <Route path="/USGReportForm/:uhid/:subUhid" element={<USGReportForm />} />
                <Route path="/XRayList" element={<XRayList />} />
                <Route path="/XRayReportForm/:uhid/:subUhid" element={<XRayReportForm />} />

              </>
          </Routes>
        </ContentWrapper>
      )}
    </div>
  );
}

// Export with Router wrapper
export default function AppWrapper() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <App />
    </Router>
  );
}

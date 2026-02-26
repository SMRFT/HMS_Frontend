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
import { hasPagePermission } from "./Auth/FrontendPageMapping";
import { fetchUserPermissions } from "./Auth/apiRequest";
import UserPermissionManager from "./Auth/UserPermissionManager";
import Admission from "./Components/NursingStation/Admission";
import RoomShifting from "./Components/NursingStation/RoomShifting";
import RoomEnquiry from "./Components/Rooms/EnquiryRoom";
import RoomCategory from "./Components/Rooms/RoomCategory";
import Room from "./Components/Rooms/Room";
import Bed from "./Components/Rooms/Bed";
import Service from "./Components/Rooms/Service";
import Block from "./Components/Rooms/Block";
import DischargeForm from "./Components/Discharge/DischargeForm";
import IPPharmacyStock from "./Components/InventoryMaster/IPPharmacyStock";
import OPPharmacyStock from "./Components/InventoryMaster/OPPharmacyStock";
import VendorManagement from "./Components/InventoryMaster/VendorManagement";
import IPGRNGeneration from "./Components/InventoryMaster/IPGRNGeneration";
import OPGRNGeneration from "./Components/InventoryMaster/OPGRNGeneration";
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

// Insurance
import InsuranceProvider from "./Components/Insurance/InsuranceProvider";

// Discharge
import DischargeReport from "./Components/Discharge/DischargeReport";
import Dashboard from "./Components/Dashboard/Dashboard";
import RegistrationBills from "./Components/Register/RegistrationBills";
import MobileRegistration from "./Components/Register/MobileRegistration";
// Layout wrapper
const ContentWrapper = styled.div`
  margin-top: 15px;
  padding: 20px;
  margin-left: 260px;

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

// Determine user role based on allowed actions
function getUserRole(allowedActions) {
  if (!allowedActions || !Array.isArray(allowedActions)) return "Pharmacist";
  if (allowedActions.includes("HMS-R-PH")) return "Pharmacist";
  return "Receptionist";
}

// Main App
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [allowedActions, setAllowedActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: get role from localStorage or API
  useEffect(() => {
    const initPermissions = async () => {
      let actions = JSON.parse(localStorage.getItem("allowedActions")) || [];
      const employeeId = localStorage.getItem("employeeId");

      if (employeeId) {
        try {
          // Fetch dynamic permissions from the new API table
          const permissionData = await fetchUserPermissions(employeeId);
          // New API returns object { allowed_pages: [], roles: [] }
          const extraPermissions = permissionData?.allowed_pages || [];

          if (Array.isArray(extraPermissions) && extraPermissions.length > 0) {
            // Merge unique permissions
            actions = [...new Set([...actions, ...extraPermissions])];
            localStorage.setItem("allowedActions", JSON.stringify(actions));
          }
        } catch (error) {
          console.error("Failed to load dynamic permissions", error);
        }
      }

      setAllowedActions(actions);
      const userRole = getUserRole(actions);
      setRole(userRole);

      // Auto-navigate to default route
      if (location.pathname === "/") {
        if (userRole === "Pharmacist") navigate("/OPPharmacy");
        else navigate("/PatientRegistrationForm");
      }
      setIsLoading(false);
    };

    initPermissions();
  }, [location.pathname, navigate]);

  // Update page title based on route
  useEffect(() => {
    const routeTitles = {
      "/": "Login",
      "/Dashboard": "Dashboard",
      "/PatientRegistrationForm": "Patient Registration",
      "/Admission": "Admission",
      "/RoomShifting": "Room Shifting",
      "/RoomEnquiry": "Room Enquiry",
      "/RoomCategory": "Room Category",
      "/Room": "Room Master",
      "/Bed": "Bed Master",
      "/Service": "Service Master",
      "/Block": "Block Master",
      "/IPPharmacyStock": "IP Pharmacy Stock",
      "/OPPharmacyStock": "OP Pharmacy Stock",
      "/VendorManagement": "Vendor Management",
      "/IPGRNGeneration": "IP GRN Generation",
      "/OPGRNGeneration": "OP GRN Generation",
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

  // Routes where sidebar is hidden (login page and mobile reg)
  const hideSidebarRoutes = ["/", "/MobileRegistration"];

  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;

  // Allow public access to MobileRegistration
  if (!role && location.pathname !== "/MobileRegistration") {
    return <div style={{ color: "red", textAlign: "center", marginTop: "50px" }}>Authentication error. Refresh the page.</div>;
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar role={role} allowedActions={allowedActions} />}

      {hideSidebarRoutes.includes(location.pathname) ? (
        location.pathname === "/MobileRegistration" ? (
          <Routes>
            <Route path="/MobileRegistration" element={<MobileRegistration />} />
          </Routes>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            Redirecting based on your role...
          </div>
        )
      ) : (
        <ContentWrapper>
          <Routes>
            {/* Dashboard */}
            {hasPagePermission("/Dashboard", allowedActions) && (
              <Route path="/Dashboard" element={<Dashboard />} />
            )}

            {/* User Permission Manager */}
            {hasPagePermission("/UserPermissions", allowedActions) && (
              <Route path="/UserPermissions" element={<UserPermissionManager />} />
            )}

            {/* Front Office */}
            {hasPagePermission("/Admission", allowedActions) && (
              <Route path="/Admission" element={<Admission />} />
            )}
            {hasPagePermission("/PatientRegistrationForm", allowedActions) && (
              <Route path="/PatientRegistrationForm" element={<PatientRegistrationForm />} />
            )}
            {hasPagePermission("/Enquiry", allowedActions) && (
              <Route path="/Enquiry" element={<Enquiry />} />
            )}
            {hasPagePermission("/RegistrationBills", allowedActions) && (
              <Route path="/RegistrationBills" element={<RegistrationBills />} />
            )}
            {hasPagePermission("/DischargeForm", allowedActions) && (
              <Route path="/DischargeForm" element={<DischargeForm />} />
            )}
            {hasPagePermission("/Summary", allowedActions) && (
              <Route path="/Summary" element={<Summary />} />
            )}
            {hasPagePermission("/Summary", allowedActions) && ( // Edit uses Summary permission
              <Route path="/EditSummary/:ipNo" element={<EditSummary />} />
            )}
            {hasPagePermission("/Summary", allowedActions) && ( // Print uses Summary permission
              <Route path="/SummaryPrint/:ipNo" element={<SummaryPrint />} />
            )}
            {hasPagePermission("/DischargeReport", allowedActions) && (
              <Route path="/DischargeReport" element={<DischargeReport />} />
            )}

            {/* Insurance */}
            {hasPagePermission("/InsuranceProvider", allowedActions) && (
              <Route path="/InsuranceProvider" element={<InsuranceProvider />} />
            )}

            {/* Nursing Station */}
            {hasPagePermission("/RoomShifting", allowedActions) && (
              <Route path="/RoomShifting" element={<RoomShifting />} />
            )}

            {/* Rooms */}
            {hasPagePermission("/RoomEnquiry", allowedActions) && (
              <Route path="/RoomEnquiry" element={<RoomEnquiry />} />
            )}
            {hasPagePermission("/RoomCategory", allowedActions) && (
              <Route path="/RoomCategory" element={<RoomCategory />} />
            )}
            {hasPagePermission("/Room", allowedActions) && (
              <Route path="/Room" element={<Room />} />
            )}
            {hasPagePermission("/Bed", allowedActions) && (
              <Route path="/Bed" element={<Bed />} />
            )}
            {hasPagePermission("/Service", allowedActions) && (
              <Route path="/Service" element={<Service />} />
            )}
            {hasPagePermission("/Block", allowedActions) && (
              <Route path="/Block" element={<Block />} />
            )}

            {/* Inventory */}
            {hasPagePermission("/IPPharmacyStock", allowedActions) && (
              <Route path="/IPPharmacyStock" element={<IPPharmacyStock />} />
            )}
            {hasPagePermission("/OPPharmacyStock", allowedActions) && (
              <Route path="/OPPharmacyStock" element={<OPPharmacyStock />} />
            )}
            {hasPagePermission("/VendorManagement", allowedActions) && (
              <Route path="/VendorManagement" element={<VendorManagement />} />
            )}
            {hasPagePermission("/IPGRNGeneration", allowedActions) && (
              <Route path="/IPGRNGeneration" element={<IPGRNGeneration />} />
            )}
            {hasPagePermission("/OPGRNGeneration", allowedActions) && (
              <Route path="/OPGRNGeneration" element={<OPGRNGeneration />} />
            )}

            {/* Pharmacy */}
            {hasPagePermission("/IPPharmacy", allowedActions) && (
              <Route path="/IPPharmacy" element={<IPPharmacy />} />
            )}
            {hasPagePermission("/OPPharmacy", allowedActions) && (
              <Route path="/OPPharmacy" element={<OPPharmacy />} />
            )}

            {/* Doctor Master */}
            {hasPagePermission("/DoctorList", allowedActions) && (
              <Route path="/DoctorList" element={<DoctorList />} />
            )}
            {hasPagePermission("/DoctorList", allowedActions) && ( // Schedule linked to Doctor List
              <Route path="/DoctorSchedule/:employee_id" element={<DoctorSchedule />} />
            )}

            {/* Investigation Billing */}
            {hasPagePermission("/InvestigationBilling", allowedActions) && (
              <Route path="/InvestigationBilling" element={<InvestigationBilling />} />
            )}
            {hasPagePermission("/ViewBills", allowedActions) && (
              <Route path="/ViewBills" element={<ViewBills />} />
            )}
            {hasPagePermission("/ViewEstimate", allowedActions) && (
              <Route path="/ViewEstimate" element={<ViewEstimate />} />
            )}

            {/* Investigation Reports */}
            {hasPagePermission("/CTList", allowedActions) && (
              <Route path="/CTList" element={<CTList />} />
            )}
            {hasPagePermission("/CTList", allowedActions) && (
              <Route path="/CTReportForm/:uhid/:subUhid" element={<CTReportForm />} />
            )}
            {hasPagePermission("/MRIList", allowedActions) && (
              <Route path="/MRIList" element={<MRIList />} />
            )}
            {hasPagePermission("/MRIList", allowedActions) && (
              <Route path="/MRIReportForm/:uhid/:subUhid" element={<MRIReportForm />} />
            )}
            {hasPagePermission("/USGList", allowedActions) && (
              <Route path="/USGList" element={<USGList />} />
            )}
            {hasPagePermission("/USGList", allowedActions) && (
              <Route path="/USGReportForm/:uhid/:subUhid" element={<USGReportForm />} />
            )}
            {hasPagePermission("/XRayList", allowedActions) && (
              <Route path="/XRayList" element={<XRayList />} />
            )}
            {hasPagePermission("/XRayList", allowedActions) && (
              <Route path="/XRayReportForm/:uhid/:subUhid" element={<XRayReportForm />} />
            )}

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

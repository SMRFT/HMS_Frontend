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
import XRayReportForm from "./Components/InvestigationReports/XRayReportForm";
import Enquiry from "./Components/Register/Enquiry";


import GRNGenerator from "./Components/InventoryMaster/GRNGeneration";
import Pharmacystock from "./Components/InventoryMaster/PharmacyStock";
import VendorManagement from "./Components/InventoryMaster/VendorManagement";

// Insurance
import InsuranceProvider from "./Components/Insurance/InsuranceProvider";

// Discharge
import DischargeReport from "./Components/Discharge/DischargeReport";
import IPAdvance from "./Components/NursingStation/IPAdvance";
import PharmacyCategory from "./Components/InventoryMaster/PharmacyCategory";
import GRNAnalysis from "./Components/InventoryMaster/GRNAnalysis";

// Billing Master
import Package from "./Components/BillingMaster/Package";
import Investigationprice from "./Components/BillingMaster/Investigationprice";
import BillType from "./Components/BillingMaster/BillType";
import RadiologySlot from "./Components/InvestigationReports/RadiologySlot";
import DeptBUDReport from "./Components/InvestigationBilling/DeptBUDReport";
import InvoiceGeneration from "./Components/Velavan/InvoiceGeneration";
import InvoiceReport from "./Components/Velavan/InvoiceReport";
import AddVelavanItems from "./Components/Velavan/AddVelavanItems";
import AddVelavanVendors from "./Components/Velavan/AddVelavanVendors";
import VelavanItemList from "./Components/Velavan/VelavanItemList";
import VelavanVendorList from "./Components/Velavan/VelavanVendorList";

import Dashboard from "./Components/Dashboard/Dashboard";
import AdvancedDashboard from "./Components/Dashboard/AdvancedDashboard";
import DoctorDashboard from "./Components/Dashboard/DoctorDashboard";
import RegistrationBills from "./Components/Register/RegistrationBills";
import MobileRegistration from "./Components/Register/MobileRegistration";
import SidebarEditor from "./Components/Admin/SidebarEditor";
import LabWardRequest from "./Components/NursingStation/LabWardRequest";
import Wardrequest from "./Components/NursingStation/wardrequest";



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

// Determine user role based on allowed actions
function getUserRole(allowedActions) {
  if (!allowedActions || !Array.isArray(allowedActions)) return "Super Admin";
  if (allowedActions.includes("HMS-R-SA")) return "Super Admin";
  return "Employee";
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
      "/AdvancedDashboard": "Advanced Dashboard",
      "/DoctorDashboard": "Doctor Dashboard",
      "/PatientRegistrationForm": "Patient Registration",
      "/Admission": "Admission",
      "/IPAdvance": "IPAdvance",
      "/RoomShifting": "Room Shifting",
      "/RoomEnquiry": "Room Enquiry",
      "/RoomCategory": "Room Category",
      "/Room": "Room Master",
      "/Block": "Block Master",
      "/VendorManagement": "Vendor Management",
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
      "/Package": "Package",
      "/Investigationprice": "Investigation Price",
      "/SidebarConfiguration": "Sidebar Editor",
      "/GRNGenerator": "GRN Generator",
      "/Pharmacystock": "Pharmacy Stock",
      "/VendorManagement": "Vendor Management",
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
            {hasPagePermission("/AdvancedDashboard", allowedActions) && (
              <Route path="/AdvancedDashboard" element={<AdvancedDashboard />} />
            )}
            {hasPagePermission("/DoctorDashboard", allowedActions) && (
              <Route path="/DoctorDashboard" element={<DoctorDashboard />} />
            )}

            {/* User Permission Manager */}
            {hasPagePermission("/UserPermissions", allowedActions) && (
              <Route path="/UserPermissions" element={<UserPermissionManager />} />
            )}

            {/* Sidebar Configuration Editor */}
            {hasPagePermission("/SidebarConfiguration", allowedActions) && (
              <Route path="/SidebarConfiguration" element={<SidebarEditor />} />
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
            {hasPagePermission("/wardrequest", allowedActions) && (
              <Route path="/wardrequest" element={<Wardrequest />} />
            )}
            {hasPagePermission("/LabWardRequest", allowedActions) && (
              <Route path="/LabWardRequest" element={<LabWardRequest />} />
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
            {hasPagePermission("/Block", allowedActions) && (
              <Route path="/Block" element={<Block />} />
            )}

            {/* Inventory */}
            {hasPagePermission("/VendorManagement", allowedActions) && (
              <Route path="/VendorManagement" element={<VendorManagement />} />
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
              <Route
                path="/XRayReportForm/:uhid/:subUhid"
                element={<XRayReportForm />}
              />
              <Route path="/RadiologySlot" element={<RadiologySlot />} />

            {/* Packages */}
            {hasPagePermission("/Package", allowedActions) && (
              <Route path="/Package" element={<Package />} />
            )}
            {/* Investigationprice */}
            {hasPagePermission("/Investigationprice", allowedActions) && (
              <Route path="/Investigationprice" element={<Investigationprice />} />
            )}
            {/* BillType */}
            {hasPagePermission("/BillType", allowedActions) && (
              <Route path="/BillType" element={<BillType />} />
              {/* Reports */}
              <Route path="/DeptBUDReport" element={<DeptBUDReport />} />

              {/* Velavan */}
              <Route
                path="/InvoiceGeneration"
                element={<InvoiceGeneration />}
              />
              <Route path="/InvoiceReport" element={<InvoiceReport />} />
              <Route path="/AddVelavanItems" element={<AddVelavanItems />} />
              <Route path="/VelavanItemList" element={<VelavanItemList />} />
              <Route
                path="/AddVelavanVendors"
                element={<AddVelavanVendors />}
              />
              <Route
                path="/VelavanVendorList"
                element={<VelavanVendorList />}
              />
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

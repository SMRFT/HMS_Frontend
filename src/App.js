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
import Header from "./Components/Header";

// Import all HMS components
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { hasPagePermission } from "./Auth/FrontendPageMapping";
import { fetchUserPermissions, fetchSidebarMapping } from "./Auth/apiRequest";
import UserPermissionManager from "./Auth/UserPermissionManager";
import Admission from "./Components/NursingStation/Admission";
import RoomShifting from "./Components/NursingStation/RoomShifting";
import RoomEnquiry from "./Components/Rooms/EnquiryRoom";
import RoomCategory from "./Components/Rooms/RoomCategory";
import Room from "./Components/Rooms/Room";
import Block from "./Components/Rooms/Block";
// import VendorManagement from "./Components/InventoryMaster/VendorManagement";
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

import VendorManagement from "./Components/InventoryMaster/VendorManagement";

// Insurance
import InsuranceProvider from "./Components/Insurance/InsuranceProvider";

// Discharge
import DischargeReport from "./Components/Discharge/DischargeReport";
import IPAdvance from "./Components/NursingStation/IPAdvance";
import PharmacyCategory from "./Components/InventoryMaster/PharmacyCategory";
import GRNAnalysis from "./Components/InventoryMaster/GRNAnalysis";
// import PharmacyStock from "./Components/InventoryMaster/PharmacyStock";

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

import Items from "./Components/Stores/Items";
import StoresGRNGeneration from "./Components/Stores/StoresGRNGeneration";
import StoresGRNReport from "./Components/Stores/StoresGRNReport";
import StoresIntent from "./Components/Stores/StoresIntent";
import StoreIntentApproval from "./Components/Stores/StoreIntentApproval";
import AnesNameMaster from "./Components/OT/AnesNameMaster";
import OTLabBilling from "./Components/OT/OTLabBilling";
import OTMaster from "./Components/OT/OTMaster";
import SurgerySchedule from "./Components/OT/SurgerySchedule";
import OTMedicineBilling from "./Components/OT/OTMedicineBilling";

// Layout wrapper
const ContentWrapper = styled.div`
  margin-top: 15px;
  padding: 20px;
  margin-left: ${(props) => (props.$collapsed ? "0" : "260px")};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-top: 62px;
  @media (max-width: 1024px) {
    margin-left: ${(props) => (props.$collapsed ? "0" : "260px")};
  }
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 15px;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dynamicPermissions, setDynamicPermissions] = useState({});

  // On mount: get role from localStorage or API
  useEffect(() => {
    const initPermissions = async () => {
      let actions = JSON.parse(localStorage.getItem("allowedActions")) || [];
      const employeeId = localStorage.getItem("employeeId");
      let dPerms = {};

      try {
        const [permissionData, allSidebarData] = await Promise.all([
          employeeId ? fetchUserPermissions(employeeId) : Promise.resolve(null),
          fetchSidebarMapping(),
        ]);

        if (permissionData) {
          const extraPermissions = permissionData?.allowed_pages || [];
          if (Array.isArray(extraPermissions) && extraPermissions.length > 0) {
            actions = [...new Set([...actions, ...extraPermissions])];
            localStorage.setItem("allowedActions", JSON.stringify(actions));
          }
        }

        if (allSidebarData && Array.isArray(allSidebarData)) {
          allSidebarData.forEach((group) => {
            if (group.pages) {
              group.pages.forEach((page) => {
                if (
                  page.route &&
                  page.permissions &&
                  page.permissions.length > 0
                ) {
                  dPerms[page.route] = page.permissions;
                }
              });
            }
          });
        }
      } catch (error) {
        console.error("Failed to load permissions or mapping", error);
      }

      setDynamicPermissions(dPerms);
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
      "/GRNGeneration": "GRN Generation",
      "/Pharmacystock": "Pharmacy Stock",
      "/VendorManagement": "Vendor Management",
      "/Items": "Items",
      "/StoresGRNGeneration": "Stores GRN Generation",
      "/StoresGRNReport": "Stores GRN Report",
      "/StoresIntent": "Stores Intent",
      "/StoresIntentApproval": "Store Intent Approval",
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

  if (isLoading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );

  // Allow public access to MobileRegistration
  if (!role && location.pathname !== "/MobileRegistration") {
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "50px" }}>
        Authentication error. Refresh the page.
      </div>
    );
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {!hideSidebarRoutes.includes(location.pathname) && (
        <Sidebar
          role={role}
          allowedActions={allowedActions}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
      )}

      {hideSidebarRoutes.includes(location.pathname) ? (
        location.pathname === "/MobileRegistration" ? (
          <Routes>
            <Route
              path="/MobileRegistration"
              element={<MobileRegistration />}
            />
          </Routes>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            Redirecting based on your role...
          </div>
        )
      ) : (
        <ContentWrapper $collapsed={sidebarCollapsed}>
          <Header
            isSidebarCollapsed={sidebarCollapsed}
            setIsSidebarCollapsed={setSidebarCollapsed}
          />
          <Routes>
            {/* Dashboard */}
            {hasPagePermission(
              "/Dashboard",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/Dashboard" element={<Dashboard />} />}
            {hasPagePermission(
              "/AdvancedDashboard",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/AdvancedDashboard"
                element={<AdvancedDashboard />}
              />
            )}
            {hasPagePermission(
              "/DoctorDashboard",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route path="/DoctorDashboard" element={<DoctorDashboard />} />
            )}

            {/* User Permission Manager */}
            {hasPagePermission(
              "/UserPermissions",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/UserPermissions"
                element={<UserPermissionManager />}
              />
            )}

            {/* Sidebar Configuration Editor */}
            {hasPagePermission(
              "/SidebarConfiguration",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route path="/SidebarConfiguration" element={<SidebarEditor />} />
            )}

            {/* Front Office */}
            {hasPagePermission(
              "/Admission",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/Admission" element={<Admission />} />}
            {hasPagePermission(
              "/PatientRegistrationForm",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/PatientRegistrationForm"
                element={<PatientRegistrationForm />}
              />
            )}
            {hasPagePermission(
              "/Enquiry",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/Enquiry" element={<Enquiry />} />}
            {hasPagePermission(
              "/RegistrationBills",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/RegistrationBills"
                element={<RegistrationBills />}
              />
            )}

            {hasPagePermission(
              "/Summary",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/Summary" element={<Summary />} />}
            {hasPagePermission(
              "/Summary",
              allowedActions,
              dynamicPermissions,
            ) && ( // Edit uses Summary permission
              <Route path="/EditSummary/:ipNo" element={<EditSummary />} />
            )}
            {hasPagePermission(
              "/Summary",
              allowedActions,
              dynamicPermissions,
            ) && ( // Print uses Summary permission
              <Route path="/SummaryPrint/:ipNo" element={<SummaryPrint />} />
            )}
            {hasPagePermission(
              "/DischargeReport",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route path="/DischargeReport" element={<DischargeReport />} />
            )}

            {/* Insurance */}
            {hasPagePermission(
              "/InsuranceProvider",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/InsuranceProvider"
                element={<InsuranceProvider />}
              />
            )}

            {/* Nursing Station */}
            {hasPagePermission(
              "/RoomShifting",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/RoomShifting" element={<RoomShifting />} />}
            {hasPagePermission(
              "/wardrequest",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/wardrequest" element={<Wardrequest />} />}
            {hasPagePermission(
              "/LabWardRequest",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/LabWardRequest" element={<LabWardRequest />} />}

            {/* Rooms */}
            {hasPagePermission(
              "/RoomEnquiry",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/RoomEnquiry" element={<RoomEnquiry />} />}
            {hasPagePermission(
              "/RoomCategory",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/RoomCategory" element={<RoomCategory />} />}
            {hasPagePermission("/Room", allowedActions, dynamicPermissions) && (
              <Route path="/Room" element={<Room />} />
            )}
            {hasPagePermission(
              "/Block",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/Block" element={<Block />} />}

            {/* Inventory */}
            {hasPagePermission(
              "/VendorManagement",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route path="/VendorManagement" element={<VendorManagement />} />
            )}
            {hasPagePermission(
              "/GRNGeneration",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/GRNGeneration" element={<GRNGeneration />} />}
            {hasPagePermission(
              "/GRNAnalysis",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/GRNAnalysis" element={<GRNAnalysis />} />}
            {hasPagePermission(
              "/PharmacyItemMaster",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/PharmacyItemMaster"
                element={<PharmacyItemMaster />}
              />
            )}

            {/* Pharmacy */}
            {hasPagePermission(
              "/IPPharmacy",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/IPPharmacy" element={<IPPharmacy />} />}
            {hasPagePermission(
              "/OPPharmacy",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/OPPharmacy" element={<OPPharmacy />} />}

            {/* Doctor Master */}
            {hasPagePermission(
              "/DoctorList",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/DoctorList" element={<DoctorList />} />}
            {hasPagePermission(
              "/DoctorList",
              allowedActions,
              dynamicPermissions,
            ) && ( // Schedule linked to Doctor List
              <Route
                path="/DoctorSchedule/:employee_id"
                element={<DoctorSchedule />}
              />
            )}

            {/* Investigation Billing */}
            {hasPagePermission(
              "/InvestigationBilling",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/InvestigationBilling"
                element={<InvestigationBilling />}
              />
            )}
            {hasPagePermission(
              "/ViewBills",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/ViewBills" element={<ViewBills />} />}
            {hasPagePermission(
              "/ViewEstimate",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/ViewEstimate" element={<ViewEstimate />} />}

            {/* Investigation Reports */}
            {hasPagePermission(
              "/CTList",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/CTList" element={<CTList />} />}
            {hasPagePermission(
              "/CTList",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/CTReportForm/:uhid/:subUhid"
                element={<CTReportForm />}
              />
            )}
            {hasPagePermission(
              "/MRIList",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/MRIList" element={<MRIList />} />}
            {hasPagePermission(
              "/MRIList",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/MRIReportForm/:uhid/:subUhid"
                element={<MRIReportForm />}
              />
            )}
            {hasPagePermission(
              "/USGList",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/USGList" element={<USGList />} />}
            {hasPagePermission(
              "/USGList",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/USGReportForm/:uhid/:subUhid"
                element={<USGReportForm />}
              />
            )}
            {hasPagePermission(
              "/XRayList",
              allowedActions,
              dynamicPermissions,
            ) && (
              <>
                <Route path="/XRayList" element={<XRayList />} />
                <Route
                  path="/XRayReportForm/:uhid/:subUhid"
                  element={<XRayReportForm />}
                />
                <Route path="/RadiologySlot" element={<RadiologySlot />} />
              </>
            )}

            {/* Packages */}
            {hasPagePermission(
              "/Package",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/Package" element={<Package />} />}
            {/* Investigationprice */}
            {hasPagePermission(
              "/Investigationprice",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/Investigationprice"
                element={<Investigationprice />}
              />
            )}
            {/* BillType */}
            {hasPagePermission(
              "/BillType",
              allowedActions,
              dynamicPermissions,
            ) && (
              <>
                <Route path="/BillType" element={<BillType />} />
              </>
            )}
            {/* Reports */}
            {hasPagePermission(
              "/DeptBUDReport",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/DeptBUDReport" element={<DeptBUDReport />} />}

            {/* Velavan */}
            {hasPagePermission(
              "/InvoiceGeneration",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/InvoiceGeneration"
                element={<InvoiceGeneration />}
              />
            )}
            {hasPagePermission(
              "/InvoiceReport",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/InvoiceReport" element={<InvoiceReport />} />}
            {hasPagePermission(
              "/AddVelavanItems",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route path="/AddVelavanItems" element={<AddVelavanItems />} />
            )}
            {hasPagePermission(
              "/VelavanItemList",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route path="/VelavanItemList" element={<VelavanItemList />} />
            )}
            {hasPagePermission(
              "/AddVelavanVendors",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/AddVelavanVendors"
                element={<AddVelavanVendors />}
              />
            )}
            {hasPagePermission(
              "/VelavanVendorList",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/VelavanVendorList"
                element={<VelavanVendorList />}
              />
            )}
            {hasPagePermission(
              "/items",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/items" element={<Items />} />}
            {/* OT*/}
            {hasPagePermission(
              "/AnesNameMaster",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/AnesNameMaster" element={<AnesNameMaster />} />}
            {hasPagePermission(
              "/OTLabBilling",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/OTLabBilling" element={<OTLabBilling />} />}
            {hasPagePermission(
              "/OTMedicineBilling",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route
                path="/OTMedicineBilling"
                element={<OTMedicineBilling />}
              />
            )}
            {hasPagePermission(
              "/OTMaster",
              allowedActions,
              dynamicPermissions,
            ) && <Route path="/OTMaster" element={<OTMaster />} />}
            {hasPagePermission(
              "/SurgerySchedule",
              allowedActions,
              dynamicPermissions,
            ) && (
              <Route path="/SurgerySchedule" element={<SurgerySchedule />} />
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

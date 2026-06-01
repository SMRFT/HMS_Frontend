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
import {
  fetchSidebarMapping,
  fetchUserPermissions,
  fetchOutlets,
} from "./Auth/apiRequest";
import UserPermissionManager from "./Auth/UserPermissionManager";
import OutletSelectionModal from "./Components/OutletSelectionModal";
import Admission from "./Components/NursingStation/Admission";
import RoomShifting from "./Components/NursingStation/RoomShifting";
import RoomEnquiry from "./Components/Rooms/EnquiryRoom";
import RoomCategory from "./Components/Rooms/RoomCategory";
import Room from "./Components/Rooms/Room";
import Block from "./Components/Rooms/Block";
import PharmacyItemMaster from "./Components/InventoryMaster/PharmacyItem";
import GRNGeneration from "./Components/InventoryMaster/GRNGeneration";
import PatientRegistrationForm from "./Components/Register/PatientRegistrationForm";
import OPPharmacy from "./Components/Pharmacy/OPPharmacy";
import IPPharmacy from "./Components/IPPharmacy/IPPharmacy";
import Summary from "./Components/Summary/Summary";
import SummaryPrint from "./Components/Summary/SummaryPrint";
// Doctor Master
import DoctorList from "./Components/DoctorMaster/DoctorList";
import DoctorSchedule from "./Components/DoctorMaster/DoctorSchedule";

// Investigation Billing
import InvestigationBilling from "./Components/InvestigationBilling/InvestigationBilling";
import ViewBills from "./Components/InvestigationBilling/ViewBills";
import ViewEstimate from "./Components/InvestigationBilling/ViewEstimate";

// Investigation Reports
import RDList from "./Components/InvestigationReports/RDList";
import RDReportForm from "./Components/InvestigationReports/RDReportForm";

import Enquiry from "./Components/Register/Enquiry";

import VendorManagement from "./Components/InventoryMaster/VendorManagement";

// Insurance
import InsuranceProvider from "./Components/Insurance/InsuranceProvider";

// Discharge
import DischargeReport from "./Components/Discharge/DischargeReport";
import DischargeBilling from "./Components/Discharge/DischargeBilling";
import GRNAnalysis from "./Components/InventoryMaster/GRNAnalysis";
import PurchaseReturn from "./Components/InventoryMaster/PurchaseReturn";

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
import AssetsManagement from "./Components/AssetsManagement/AssetsManagement";
import AssetsMaintainance from "./Components/AssetsManagement/AssetsMaintenance";
import RecycleManagement from "./Components/AssetsManagement/RecycleManagement";
import AnesNameMaster from "./Components/OT/AnesNameMaster";
import OTLabBilling from "./Components/OT/OTLabBilling";
import OTMaster from "./Components/OT/OTMaster";
import SurgerySchedule from "./Components/OT/SurgerySchedule";
import OTMedicineBilling from "./Components/OT/OTMedicineBilling";

import OPPharmacyTabs from "./Components/Pharmacy/Oppharmacytabs";

// import CustomerType from "./Components/BillingMaster/CustomerType";
import CentralCashCounter from "./Components/CentralCashCounter/CentralCashCounter";
import CashCounterManager from "./Components/CentralCashCounter/CashCounterManager";

import Oppharmacytabs from "./Components/Pharmacy/Oppharmacytabs";

import CustomerType from "./Components/BillingMaster/CustomerType";
// import DoctorSchedule from "./Components/DoctorMaster/DoctorSchedule";
import DoctorReport from "./Components/DoctorMaster/DoctorReport";
import NursingStation from "./Components/Rooms/NursingStation";
import RoomServiceDescription from "./Components/Rooms/RoomServiceDescription";
import RoomKitItems from "./Components/Rooms/RoomKitItems";
import IPAdvance from "./Components/NursingStation/IPAdvance";
import PharmacyCategory from "./Components/InventoryMaster/PharmacyCategory";
import ChemicalComposition from "./Components/InventoryMaster/ChemicalComposition";
import StockTransfer from "./Components/InventoryMaster/StockTransfer";
import IPAdvanceReport from "./Components/Accounts/IPAdvanceReport";
import DietOrderReport from "./Components/NursingStation/DietOrderReport";
import DietOrder from "./Components/NursingStation/DietMaster";
import ShiftBasisReport from "./Components/Accounts/ShiftBasisReport";
import SalesReturn from "./Components/Pharmacy/SalesReturn";
import FrontOfficeReports from "./Components/Reports/FrontOfficeReports";
import BillWiseReport from "./Components/Accounts/BillWiseReport"
import RDPrint from "./Components/InvestigationReports/RDPrint";
import JRDReport from "./Components/InvestigationReports/JRDReport";

import DischargeBills from "./Components/Accounts/DischargeBills";
import DischargeBillsDetailed from "./Components/Accounts/DischargeBillsDetailed";
import CashierWiseReport from "./Components/Accounts/CashierWiseReport";
import CashierWiseDetailedReport from "./Components/Accounts/CashierWiseDetailedReport";
import AdvanceRegistrationInsurence from "./Components/Accounts/AdvanceRegistrationInsurence";
import AdvanceRegistration from "./Components/Accounts/AdvanceRegistration";
import AccountsReports from "./Components/Reports/AccountsReports";
import InsuranceClaim from "./Components/Insurance/InsuranceClaim";
import PharmacyExpiryReport from "./Components/Reports/PharmacyExpiryReport";
import PharmacyStockDashboard from "./Components/Reports/PharmacyStockDashboard";
import PharmacyNotification from "./Components/InventoryMaster/PharmacyNotification";
import MedicineRequisition from "./Components/InventoryMaster/MedicineRequisitionForm";
import MedicineRequisitionApproval from "./Components/InventoryMaster/Medicinerequisitionapproval";
import PurchaseOrder from "./Components/InventoryMaster/PurchaseOrder";
import PurchaseOrderApproval from "./Components/InventoryMaster/PurchaseOrderApproval";
import PurchaseRequisition from "./Components/InventoryMaster/PurchaseRequisitionForm";



import RoomOccupencyReport from "./Components/Reports/RoomOccupencyReport";
import PreDayRoomOccupancyReport from "./Components/Reports/PreDayRoomOccupancyReport";

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
  const [userOutlets, setUserOutlets] = useState([]);
  const [showOutletModal, setShowOutletModal] = useState(false);

  // On mount: get role from localStorage or API
  useEffect(() => {
    const initPermissions = async () => {
      let actions = JSON.parse(localStorage.getItem("allowedActions")) || [];
      const employeeId = localStorage.getItem("employeeId");
      let dPerms = {};

      // Skip permission loading for public routes if not logged in
      if (location.pathname === "/MobileRegistration" && !employeeId) {
        setIsLoading(false);
        return;
      }

      try {
        const allSidebarData = await fetchSidebarMapping();

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

      // Handle Outlet Selection
      if (employeeId) {
        try {
          const [userPerms, allOutlets] = await Promise.all([
            fetchUserPermissions(employeeId),
            fetchOutlets(),
          ]);

          const assignedOutletCodes = userPerms.hms_outlets || [];

          if (assignedOutletCodes.length > 0) {
            // Map codes to full outlet objects
            const userAssignedOutlets = allOutlets.filter((o) =>
              assignedOutletCodes.includes(o.outlet_code),
            );

            setUserOutlets(userAssignedOutlets);

            const storedOutlet = localStorage.getItem("selected_outlet");
            if (!storedOutlet) {
              if (userAssignedOutlets.length === 1) {
                // Auto-select if only one
                const outlet = userAssignedOutlets[0];
                localStorage.setItem("selected_outlet", outlet.outlet_code);
                localStorage.setItem("outlet_code", outlet.outlet_code);
                localStorage.setItem(
                  "selected_outlet_name",
                  outlet.outlet_name,
                );
              } else if (userAssignedOutlets.length > 1) {
                setShowOutletModal(true);
              }
            }
          }
        } catch (error) {
          console.error("Error initializing outlets:", error);
        }
      }

      // Auto-navigate to default route
      if (location.pathname === "/") {
        if (userRole === "Pharmacist") navigate("/OPPharmacy");
        else navigate("/Dashboard");
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
      "/RDList": "RD Reports",
      "/JRDReport": "JRD Report",
      "/DischargeReport": "Discharge Report",
      "/Enquiry": "Enquiry",
      "/Package": "Package",
      "/Investigationprice": "Investigation Price",
      "/SidebarConfiguration": "Sidebar Editor",
      "/GRNGeneration": "GRN Generation",
      "/Pharmacystock": "Pharmacy Stock",
      "/PharmacyExpiryReport": "Pharmacy Expiry Report",
      "/PharmacyStockDashboard": "Pharmacy Stock Dashboard",
      "/Items": "Items",
      "/StoresGRNGeneration": "Stores GRN Generation",
      "/StoresGRNReport": "Stores GRN Report",
      "/StoresIntent": "Stores Intent",
      "/StoresIntentApproval": "Store Intent Approval",
      "/AssetsManagement": "Assets Management",
      "/AssetsMaintainance": "Assets maintenance",
      "/RecycleManagement": "Recycle Management",
      "/DischargeBilling": "Discharge Billing",
      "/DoctorReport": "Doctor Day/Month Report",
      "/Oppharmacytabs": "OP Pharmacy Tabs",
      "/ShiftBasisReport": "Shift Basis Report",
      "/CashCounterManager": "Cash Counter Manager",
      "/BillWiseReport": "BillWiseReport",
      "/DischargeBills": "Discharge Bills",
      "/DischargeBillsDetailed": "Discharge Bills Detailed",
      "/CashierWiseReport": "Cashier Wise Report",
      "/CashierWiseDetailedReport": "Cashier Wise Detailed Report",
      "/AdvanceRegistrationInsurence": "Advance Registration (Insurance)",
      "/AdvanceRegistration": "Advance Registration",
     
    };

    const path = location.pathname;
    if (path.startsWith("/SummaryPrint/")) {
      document.title = "Print Summary - Shanmuga Hospital";
    } else if (path.startsWith("/RDReportForm/")) {
      document.title = "RD Report Form - Shanmuga Hospital";
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

  const isNoSidebarRoute = hideSidebarRoutes.includes(location.pathname);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />

      {showOutletModal && (
        <OutletSelectionModal
          outlets={userOutlets}
          currentOutletCode={localStorage.getItem("selected_outlet")}
          onClose={
            localStorage.getItem("selected_outlet")
              ? () => setShowOutletModal(false)
              : undefined
          }
          onSelect={(outlet) => {
            localStorage.setItem("selected_outlet", outlet.outlet_code);
            localStorage.setItem("outlet_code", outlet.outlet_code);
            localStorage.setItem("selected_outlet_name", outlet.outlet_name);
            setShowOutletModal(false);

            const userRole = getUserRole(allowedActions);
            const targetPath = userRole === "Pharmacist" ? "/OPPharmacy" : "/Dashboard";

            navigate(targetPath);
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }}
        />
      )}

      {isNoSidebarRoute ? (
        <div
          style={
            location.pathname === "/"
              ? {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }
              : {}
          }
        >
          {location.pathname === "/" ? (
            <div>Redirecting based on your role...</div>
          ) : (
            <Routes>
              <Route
                path="/MobileRegistration"
                element={<MobileRegistration />}
              />
            </Routes>
          )}
        </div>
      ) : (
        <>
          <Sidebar
            role={role}
            allowedActions={allowedActions}
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
          />
          <ContentWrapper $collapsed={sidebarCollapsed}>
            <Header
              isSidebarCollapsed={sidebarCollapsed}
              setIsSidebarCollapsed={setSidebarCollapsed}
              onSwitchOutlet={() => setShowOutletModal(true)}
              hasMultipleOutlets={userOutlets.length > 1}
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
                  <Route
                    path="/SidebarConfiguration"
                    element={<SidebarEditor />}
                  />
                )}

              {/* Front Office */}
              {hasPagePermission(
                "/Admission",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/Admission" element={<Admission />} />}

              {hasPagePermission(
                "/IPAdvance",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/IPAdvance" element={<IPAdvance />} />}

              {hasPagePermission(
                "/IPAdvanceReport",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/IPAdvanceReport"
                    element={<IPAdvanceReport />}
                  />
                )}

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
              {hasPagePermission(
                "/DischargeBilling",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/DischargeBilling"
                    element={<DischargeBilling />}
                  />
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
                {hasPagePermission(
                "/InsuranceClaim",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/InsuranceClaim"
                    element={<InsuranceClaim />}
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
              ) && (
                  <Route path="/LabWardRequest" element={<LabWardRequest />} />
                )}

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
              {hasPagePermission(
                "/Room",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/Room" element={<Room />} />}
              {hasPagePermission(
                "/Block",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/Block" element={<Block />} />}
              {hasPagePermission(
                "/NursingStation",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route path="/NursingStation" element={<NursingStation />} />
                )}
              {hasPagePermission(
                "/RoomKitItems",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/RoomKitItems" element={<RoomKitItems />} />}
              {hasPagePermission(
                "/RoomServiceDescription",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/RoomServiceDescription"
                    element={<RoomServiceDescription />}
                  />
                )}
              {hasPagePermission(
                "/PurchaseRequisition",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/PurchaseRequisition"
                    element={<PurchaseRequisition />}
                 
                  />
                )}
              {/* Inventory */}
              {hasPagePermission(
                "/VendorManagement",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/VendorManagement"
                    element={<VendorManagement />}
                  />
                )}
              {hasPagePermission(
                "/ChemicalComposition",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/ChemicalComposition"
                    element={<ChemicalComposition />}
                  />
                )}
              {hasPagePermission(
                "/PharmacyCategory",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/PharmacyCategory"
                    element={<PharmacyCategory />}
                  />
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
                "/StockTransfer",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/StockTransfer"
                    element={<StockTransfer />}
                  />
                )}

             {hasPagePermission(
                "/PurchaseReturn",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/PurchaseReturn"
                    element={<PurchaseReturn />}
                  />
                )}

               {hasPagePermission(
                "/PharmacyNotification",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/PharmacyNotification"
                    element={<PharmacyNotification />}
                  />
              )}

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

                
              {hasPagePermission(
                "/MedicineRequisition",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/MedicineRequisition"
                    element={<MedicineRequisition />}
                  />
                )}

              {hasPagePermission(
                "/MedicineRequisitionApproval",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/MedicineRequisitionApproval"
                    element={<MedicineRequisitionApproval />}
                  />
                )}

              {hasPagePermission(
                "/PurchaseOrder",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/PurchaseOrder"
                    element={<PurchaseOrder />}
                  />
                )}

              {hasPagePermission(
                "/PurchaseOrderApproval",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/PurchaseOrderApproval"
                    element={<PurchaseOrderApproval />}
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
              <Route path="/ShiftBasisReport" element={<ShiftBasisReport />} />

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
                "/RDList",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/RDList" element={<RDList />} />}
              {hasPagePermission(
                "/RDList",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/RDReportForm/:uhid/:subUhid"
                    element={<RDReportForm />}
                  />
                )}
                {hasPagePermission(
                "/RDList",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/RDPrint"
                    element={<RDPrint />}
                  />
                )}
                {hasPagePermission(
                "/JRDReport",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/JRDReport"
                    element={<JRDReport />}
                  />
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
                    <Route path="/CustomerType" element={<CustomerType />} />
                  </>
                )}
              {/* Reports */}
              {hasPagePermission(
                "/DeptBUDReport",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/DeptBUDReport" element={<DeptBUDReport />} />}
              {hasPagePermission(
                "/DoctorReport",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/DoctorReport" element={<DoctorReport />} />}

              {hasPagePermission(
                "/FrontOfficeReports",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/FrontOfficeReports" element={<FrontOfficeReports />} />}
              {hasPagePermission(
                "/AccountsReports",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/AccountsReports" element={<AccountsReports />} />}
              {hasPagePermission(
                "/PharmacyExpiryReport",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/PharmacyExpiryReport" element={<PharmacyExpiryReport />} />}
              {hasPagePermission(
                "/PharmacyExpiryReport",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/PharmacyStockDashboard" element={<PharmacyStockDashboard />} />}

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
              {hasPagePermission("/Items", allowedActions) && (
                <Route path="/Items" element={<Items />} />
              )}
              {hasPagePermission("/StoresGRNGeneration", allowedActions) && (
                <Route
                  path="/StoresGRNGeneration"
                  element={<StoresGRNGeneration />}
                />
              )}
              {hasPagePermission("/StoresGRNReport", allowedActions) && (
                <Route path="/StoresGRNReport" element={<StoresGRNReport />} />
              )}
              {hasPagePermission("/StoresIntent", allowedActions) && (
                <Route path="/StoresIntent" element={<StoresIntent />} />
              )}
              {hasPagePermission("/StoreIntentApproval", allowedActions) && (
                <Route
                  path="/StoreIntentApproval"
                  element={<StoreIntentApproval />}
                />
              )}
              {hasPagePermission("/AssetsManagement", allowedActions) && (
                <Route
                  path="/AssetsManagement"
                  element={<AssetsManagement />}
                />
              )}

              {hasPagePermission("/AssetsMaintainance", allowedActions) && (
                <Route
                  path="/AssetsMaintainance"
                  element={<AssetsMaintainance />}
                />
              )}
              {hasPagePermission("/DietOrder", allowedActions) && (
                <Route path="/DietOrder" element={<DietOrder />} />
              )}
              {hasPagePermission("/DietOrderReport", allowedActions) && (
                <Route path="/DietOrderReport" element={<DietOrderReport />} />
              )}
              {hasPagePermission("/RecycleManagement", allowedActions) && (
                <Route
                  path="/RecycleManagement"
                  element={<RecycleManagement />}
                />
              )}
              {hasPagePermission(
                "/AnesNameMaster",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route path="/AnesNameMaster" element={<AnesNameMaster />} />
                )}
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
                "/ShiftBasisReport",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/ShiftBasisReport" element={<ShiftBasisReport />} />}
              {hasPagePermission(
                "/BillWiseReport",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/BillWiseReport" element={<BillWiseReport />} />}


              {hasPagePermission(
                "/SalesReturn",
                allowedActions,
                dynamicPermissions,
              ) && <Route path="/SalesReturn" element={<SalesReturn />} />}


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

              <Route path="/OPPharmacyTabs" element={<OPPharmacyTabs />} />

              {hasPagePermission(
                "/CentralCashCounter",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/CentralCashCounter"
                    element={<CentralCashCounter />}
                  />
                )}
              {hasPagePermission(
                "/CashCounterManager",
                allowedActions,
                dynamicPermissions,
              ) && (
                  <Route
                    path="/CashCounterManager"
                    element={<CashCounterManager />}
                  />
                )}

              {/* Accounts Reports */}
              {hasPagePermission("/DischargeBills", allowedActions, dynamicPermissions) && (
                <Route path="/DischargeBills" element={<DischargeBills />} />
              )}
              {hasPagePermission("/DischargeBillsDetailed", allowedActions, dynamicPermissions) && (
                <Route path="/DischargeBillsDetailed" element={<DischargeBillsDetailed />} />
              )}
              {hasPagePermission("/CashierWiseReport", allowedActions, dynamicPermissions) && (
                <Route path="/CashierWiseReport" element={<CashierWiseReport />} />
              )}
              {hasPagePermission("/CashierWiseDetailedReport", allowedActions, dynamicPermissions) && (
                <Route path="/CashierWiseDetailedReport" element={<CashierWiseDetailedReport />} />
              )}
              {hasPagePermission("/AdvanceRegistrationInsurence", allowedActions, dynamicPermissions) && (
                <Route path="/AdvanceRegistrationInsurence" element={<AdvanceRegistrationInsurence />} />
              )}
              {hasPagePermission("/AdvanceRegistration", allowedActions, dynamicPermissions) && (
                <Route path="/AdvanceRegistration" element={<AdvanceRegistration />} />
              )}

              {hasPagePermission("/RoomOccupencyReport", allowedActions, dynamicPermissions) && (
                <Route path="/RoomOccupencyReport" element={<RoomOccupencyReport />} />
              )}

              {hasPagePermission("/PreDayRoomOccupancyReport", allowedActions, dynamicPermissions) && (
                <Route path="/PreDayRoomOccupancyReport" element={<PreDayRoomOccupancyReport />} />
              )}
              
            </Routes>
          </ContentWrapper>
        </>
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

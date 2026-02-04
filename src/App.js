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
  const [isLoading, setIsLoading] = useState(true);

  // On mount: get role from localStorage or API
  useEffect(() => {
    const allowedActions = JSON.parse(localStorage.getItem("allowedActions")); // Example
    const userRole = getUserRole(allowedActions);
    setRole(userRole);

    // Auto-navigate to default route
    if (location.pathname === "/") {
      if (userRole === "Pharmacist") navigate("/OPPharmacy");
      else navigate("/PatientRegistrationForm");
    }
    setIsLoading(false);
  }, [location.pathname, navigate]);

  // Routes where sidebar is hidden (login page)
  const hideSidebarRoutes = ["/"];

  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  if (!role) return <div style={{ color: "red", textAlign: "center", marginTop: "50px" }}>Authentication error. Refresh the page.</div>;

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
            {/* Pharmacist sees all */}
            {role === "Pharmacist" && (
              <>
                <Route path="/Admission" element={<Admission />} />
                <Route path="/PatientRegistrationForm" element={<PatientRegistrationForm />} />
                <Route path="/RoomShifting" element={<RoomShifting />} />
                <Route path="/RoomEnquiry" element={<RoomEnquiry />} />
                <Route path="/RoomCategory" element={<RoomCategory />} />
                <Route path="/Room" element={<Room />} />
                <Route path="/Bed" element={<Bed />} />
                <Route path="/Service" element={<Service />} />
                <Route path="/Block" element={<Block />} />
                <Route path="/IPPharmacyStock" element={<IPPharmacyStock />} />
                <Route path="/OPPharmacyStock" element={<OPPharmacyStock />} />
                <Route path="/VendorManagement" element={<VendorManagement />} />
                <Route path="/IPGRNGeneration" element={<IPGRNGeneration />} />
                <Route path="/OPGRNGeneration" element={<OPGRNGeneration />} />
                <Route path="/DischargeForm" element={<DischargeForm />} />
              </>
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

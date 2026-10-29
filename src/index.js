import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

// console.log("=== HMS INDEX.JS DEBUG ===");
// console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0lOLUFQSS1PUlItUiIsIlNULUFQSS1DUkQtUlciLCJNREMtUC1EUy1SVyIsIkhNUy1QLUNDR1JCIiwiSE1TLVAtU0FETS1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtUE8tUlciLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtU0RQLVJXIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiU0lOLVAtRlVBLVJXIiwiSE1TLVAtQ0NJUEFCLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1ITVMiLCJITVMtUC1BQS1SVyIsIkhNUy1QLUNDVVBCIiwiTURDLVAtUkVHLVIiLCJTSU4tUC1FTlEtUlciLCJITVMtUC1HQURNLVJXIiwiTURDLUFQSS1DRFItUiIsIkdQLVAtR0NOLVIiLCJITVMtUC1OUy1SVyIsIkhNUy1QLURJUy1SVyIsIkhNUy1QLUNDU1RTRC1SVyIsIlNJTi1SLUFWUCIsIk1EQy1QLVJFRy1SVyIsIk1EQy1QLVBOUC1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLUlQREItUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtUktJVEQtUlciLCJNREMtQVBJLUdBUy1SIiwiSE1TLVAtRFJNLVJXIiwiTURDLVAtR0FULVJXIiwiTURDLVAtQ0RFLVJXIiwiSE1TLVAtQ0MtUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1QUkEtUlciLCJITVMtUC1SQ0FURC1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1QQ0QtUlciLCJTVC1QLU5URi1SIiwiSE1TLVAtQkxLRC1SVyIsIlNULVAtVERMLVJXIiwiSE1TLVAtQ0NQUlAtUlciLCJITVMtUC1BRE1ELVJXIiwiSE1TLVAtUEMtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVJDTE4tUlciLCJITVMtUC1DQ0QtUlciLCJITVMtUC1QT0EtUlciLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLVJNRC1SVyIsIlNJTi1QLVJULVJXIiwiSE1TLVAtTlNELVJXIiwiTURDLVAtQUQtUlciLCJTVC1BUEktQlJELVJXIiwiU0lOLVAtQ0hFLVJXIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtU1RBLVJXIiwiTURDLVAtVFJCLVJXIiwiSE1TLVAtTVJBLVJXIiwiTURDLUFQSS1USFItUiIsIkhNUy1QLUNDQ1JCIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLVBSLVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtUlNIRlQtUlciLCJNREMtQVBJLUFULVJXIiwiU1QtQVBJLUVNUC1SIiwiU0lOLVAtQ0hFQS1SVyIsIkhNUy1QLU9TLVJXIiwiSE1TLVAtUEdTLVJXIiwiU0lOLUFQSS1PUi1SVyIsIk1EQy1QLVBURS1SVyIsIlNULVAtQ01ULVIiLCJITVMtUC1NUi1SVyIsIkhNUy1BUEktVUhJRC1SIiwiU1QtUC1ERVMtUiIsIkhNUy1QLUNDVVBCLVJXIiwiSE1TLVAtUEVSLVJXIiwiU1QtUC1UREwtUiIsIk1EQy1BUEktQVQtUiIsIkhNUy1QLUNDR0FTLVJXIiwiU0lOLVAtUkFVLVJXIiwiTURDLUFQSS1QQVQtUiIsIlNJTi1QLU9QLVJXIiwiSE1TLVAtUFNILVJXIiwiTURDLVAtU09SLVIiLCJNREMtUC1PU0ItUlciLCJNREMtUC1FRi1SVyIsIk1EQy1BUEktUkRMLVIiLCJITVMtUC1TUk0tUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLUNDR1JQIiwiSE1TLVAtR1JOLVJXIiwiU0lOLVAtR0RMLVJXIiwiTURDLVAtQVNNLVJXIiwiTURDLUFQSS1MQk4tUiIsIkhNUy1QLUJST09NLVJXIiwiSE1TLVAtQlQtUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1DVElBLVJXIiwiSE1TLVAtV1ItUlciLCJTSU4tQVBJLUlGLVJXIiwiSE1TLVAtR1JOQS1SVyIsIkhNUy1QLUdQUkEtUlciLCJTSU4tUC1SVEEtUlciLCJTSU4tQVBJLUdJQy1SIiwiSE1TLVAtR1BSLVJXIiwiTURDLVAtQ0EtUlciLCJITVMtUC1JQi1SVyIsIk1EQy1BUEktUlRTLVIiLCJNREMtUC1SREUtUlciLCJITVMtUC1NVC1SVyIsIlNJTi1QLUVOUUwtUlciLCJITVMtUC1QUkwtUlciLCJITVMtUC1DQ0dBSC1SVyIsIlNULVAtQlJELVIiLCJITVMtUC1SRU5RLVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiTURDLVAtVUFTLVJXIiwiU1QtUC1ERVMtUlciLCJNREMtUC1HRFRTLVIiLCJTVC1SLUhPRCIsIkhNUy1QLVJTREQtUlciLCJTVC1QLUNNVC1SVyIsIlNJTi1QLUNGLVIiLCJTSU4tUC1GVS1SVyIsIlNJTi1BUEktRlUtUlciLCJTVC1QLVNOTy1SVyIsIk1EQy1QLVBOUC1SIiwiSE1TLVAtUE9MLVJXIiwiSE1TLVAtSVBBLVJXIiwiSE1TLVAtTVJMLVJXIiwiSE1TLVAtUEktUlciLCJITVMtUC1CTEstUlciLCJNREMtUC1HQUQtUlciLCJITVMtUC1QSU4tUlciLCJTSU4tUC1SQS1SVyIsIlNJTi1BUEktU0YtUlciLCJITVMtUC1STS1SVyIsIkhNUy1QLUdSTlItUlciLCJITVMtUC1EQi1SVyIsIlNJTi1QLUZBLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMjksMTcyLDEsMiwzLDExMiw0LDI2LDUwLDI3LDUyLDUxLDI4LDUsMTAsMTMsMTUsNTgsNTksMTQsMTIyLDEyMywxNiwxNywxMjAsMTIxLDEzMywxMzQsMTM1LDEwMiwxMTMsMTE0LDEzNiwxMzcsMTM4LDExNSwxMTYsMTE3LDExOCwyMCwyMSw1NSwzMSwzMCw0NCwyMDAsMTU1LDMzLDE5MywxOTQsNDMsMTAxLDExMCw0OSwxMjcsMTI4XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDA0IiwiT0xFVDAwMSIsIk9MRVQwMDIiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3OTMxNjY3OTEsImV4cCI6MTc5MzI1Mzc5MX0.G5mDhZZ6Q2gqt9rCS_GNJ_UdNc07FRV7jAViZPrR-ksTxl9ZHT1xHHBmTeD1KMOSb8IJggup7ZJJ02hWhr-jgRRtsaQitXnNH2uix5ovG5T3lXXg4OSDnu0GISYMStOWCnlRJl5A93xSJuKDSYd7bYxgntape0_J3zqEhxudBh6liTzBoASEG2TvCOZFRbiXDfplHi29OykZiICrxc8wLaz4Xdg-bRgUheqU21h09BPWoLucT2d5iU_RNqUL2PC202p2onu1oHdoZNxa0KIhM9HZcumAfPbdRlPRw4rH4G9cWVEJjHI4I0O-Iowrm0HPNGwgh8a0ZwCLcqqGTSRHRg";
  if (dev_token && dev_token.trim() !== "") {
    if (!localStorage.getItem("selected_branch")) {
      const selectedBranch = "SHB001";
      localStorage.setItem("selected_branch", selectedBranch);
    }
    // Only set default outlet if user has not yet selected one
    if (!localStorage.getItem("selected_outlet")) {
      const selectedOutlet = "OLET003";
      localStorage.setItem("selected_outlet", selectedOutlet);
      localStorage.setItem("outlet_code", selectedOutlet);
      localStorage.setItem("selected_outlet_name", "MAIN BLOCK");
    }
    if (!localStorage.getItem("selected_hospital")) {
      const selectedHospital = "SH001";
      localStorage.setItem("selected_hospital", selectedHospital);
      localStorage.setItem("hospital_code", selectedHospital);
    }
  }
  return dev_token;
}

// --- Function to redirect to login ---
function redirectToLogin() {
  if (REDIRECT_URL) {
    console.log("🔄 Redirecting to login URL:", REDIRECT_URL);
    window.location.href = REDIRECT_URL;
  } else {
    console.error("❌ REDIRECT_URL not configured");
    // Even if REDIRECT_URL is not configured, don't show error - just redirect to a fallback
    // window.location.href = "https://shinova.in/login";
  }
}

// --- Validate JWT Token Locally ---
function validate(token) {
  if (!token || token.trim() === "") {
    throw new Error("Token is empty");
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      throw new Error("Token expired");
    }
    return payload;
  } catch (err) {
    throw new Error("Invalid token");
  }
}

// --- Function to determine user role based on allowed-actions ---
function getUserRole(allowedActions) {
  if (!allowedActions || !Array.isArray(allowedActions)) {
    return "Receptionist"; // Default role
  }
  // console.log("Allowed actions:", allowedActions);
  if (allowedActions.includes("HMS-R-SA")) {
    return "Super Admin";
  }
  if (allowedActions.includes("HMS-R-PH")) {
    return "Pharmacist";
  }
  if (allowedActions.includes("HMS-R-NS")) {
    return "Nursing Station";
  } else {
    return "Receptionist"; // Default role if none of the specific roles are found
  }
}

// --- List of public routes that don't require login token ---
const PUBLIC_ROUTES = [
  "/MobileRegistration",
  "/InPatientFeedbackForm",
  "/OutPatientfeedForm",
  "/outpatientfeedform",
  "/OutPatientFeedbackForm",
  "/outpatientfeedbackform",
  "/InpatientQRScan",
  "/inpatientqrscan",
  "/OutPatientQRScan",
  "/outpatientqrscan",
  "/QRScan",
  "/qrscan",
  "/BreastCancerScreening",
];

function isPublicRoute() {
  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, "");
  const hash = window.location.hash.toLowerCase();

  return PUBLIC_ROUTES.some((route) => {
    const r = route.toLowerCase();
    return (
      currentPath === r ||
      currentPath.endsWith(r) ||
      hash.includes(r)
    );
  });
}

// --- Main execution ---
(function main() {
  const isPublic = isPublicRoute();

  try {
    // If development token is provided, prioritize it for local development
    const devToken = setforlocaldev();
    let accessToken = (devToken && devToken.trim() !== "") ? devToken : localStorage.getItem("access_token");

    // If still no token (development token is empty) and not a public route, redirect to login
    if ((!accessToken || accessToken.trim() === "") && !isPublic) {
      redirectToLogin();
      return; // Stop execution here
    }

    // If token exists, validate it
    if (accessToken && accessToken.trim() !== "") {
      try {
        const userPayload = validate(accessToken);

        localStorage.setItem("access_token", accessToken);

        const employeeId = userPayload.aud; // Using 'aud' field as ID
        const name = userPayload.name;
        const userEmail = userPayload.email;
        const userRole = getUserRole(userPayload["allowed-actions"]);

        if (employeeId && name) {
          localStorage.setItem("user_payload", JSON.stringify(userPayload));
          localStorage.setItem("employeeId", employeeId);
          localStorage.setItem("name", name);
          localStorage.setItem("userEmail", userEmail);
          const hospitalCode = userPayload.hospital_code || "SH001";
          localStorage.setItem("hospital_code", hospitalCode);
          localStorage.setItem("selected_hospital", hospitalCode);
          localStorage.setItem(
            "allowed-outlets",
            JSON.stringify(userPayload["allowed-outlets"] || []),
          );
          localStorage.setItem(
            "hms_pages",
            JSON.stringify(userPayload["hms_pages"] || []),
          );
          localStorage.setItem("role", userRole);
          localStorage.setItem(
            "allowedActions",
            JSON.stringify(userPayload["allowed-actions"] || []),
          );
        }
      } catch (tokenErr) {
        console.error("❌ Token validation failed:", tokenErr.message);
        if (!isPublic) {
          redirectToLogin();
          return;
        }
      }
    }

    // Render app
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    reportWebVitals();
  } catch (error) {
    console.error("❌ Token validation / main execution failed:", error.message);
    if (!isPublic) {
      redirectToLogin();
    }
  }
})();
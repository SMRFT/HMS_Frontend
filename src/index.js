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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0lOLUFQSS1PUlItUiIsIlNULUFQSS1DUkQtUlciLCJNREMtUC1EUy1SVyIsIkhNUy1QLUNDR1JCIiwiSE1TLVAtU0FETS1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtUE8tUlciLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtU0RQLVJXIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiU0lOLVAtRlVBLVJXIiwiSE1TLVAtQ0NJUEFCLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1ITVMiLCJITVMtUC1BQS1SVyIsIkhNUy1QLUNDVVBCIiwiTURDLVAtUkVHLVIiLCJTSU4tUC1FTlEtUlciLCJITVMtUC1HQURNLVJXIiwiTURDLUFQSS1DRFItUiIsIkdQLVAtR0NOLVIiLCJITVMtUC1OUy1SVyIsIkhNUy1QLURJUy1SVyIsIkhNUy1QLUNDU1RTRC1SVyIsIlNJTi1SLUFWUCIsIk1EQy1QLVJFRy1SVyIsIk1EQy1QLVBOUC1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLUlQREItUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtUktJVEQtUlciLCJNREMtQVBJLUdBUy1SIiwiSE1TLVAtRFJNLVJXIiwiTURDLVAtR0FULVJXIiwiTURDLVAtQ0RFLVJXIiwiSE1TLVAtQ0MtUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1QUkEtUlciLCJITVMtUC1SQ0FURC1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1QQ0QtUlciLCJTVC1QLU5URi1SIiwiSE1TLVAtQkxLRC1SVyIsIlNULVAtVERMLVJXIiwiSE1TLVAtQ0NQUlAtUlciLCJITVMtUC1BRE1ELVJXIiwiSE1TLVAtUEMtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVJDTE4tUlciLCJITVMtUC1DQ0QtUlciLCJITVMtUC1QT0EtUlciLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLVJNRC1SVyIsIlNJTi1QLVJULVJXIiwiSE1TLVAtTlNELVJXIiwiTURDLVAtQUQtUlciLCJTVC1BUEktQlJELVJXIiwiU0lOLVAtQ0hFLVJXIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtU1RBLVJXIiwiTURDLVAtVFJCLVJXIiwiSE1TLVAtTVJBLVJXIiwiTURDLUFQSS1USFItUiIsIkhNUy1QLUNDQ1JCIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLVBSLVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtUlNIRlQtUlciLCJNREMtQVBJLUFULVJXIiwiU1QtQVBJLUVNUC1SIiwiU0lOLVAtQ0hFQS1SVyIsIkhNUy1QLU9TLVJXIiwiU0lOLUFQSS1PUi1SVyIsIk1EQy1QLVBURS1SVyIsIlNULVAtQ01ULVIiLCJITVMtUC1NUi1SVyIsIkhNUy1BUEktVUhJRC1SIiwiU1QtUC1ERVMtUiIsIkhNUy1QLUNDVVBCLVJXIiwiSE1TLVAtUEVSLVJXIiwiU1QtUC1UREwtUiIsIk1EQy1BUEktQVQtUiIsIkhNUy1QLUNDR0FTLVJXIiwiU0lOLVAtUkFVLVJXIiwiTURDLUFQSS1QQVQtUiIsIlNJTi1QLU9QLVJXIiwiSE1TLVAtUFNILVJXIiwiTURDLVAtU09SLVIiLCJNREMtUC1PU0ItUlciLCJNREMtUC1FRi1SVyIsIk1EQy1BUEktUkRMLVIiLCJITVMtUC1TUk0tUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLUNDR1JQIiwiSE1TLVAtR1JOLVJXIiwiU0lOLVAtR0RMLVJXIiwiTURDLVAtQVNNLVJXIiwiTURDLUFQSS1MQk4tUiIsIkhNUy1QLUJST09NLVJXIiwiSE1TLVAtQlQtUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1DVElBLVJXIiwiU0lOLUFQSS1JRi1SVyIsIkhNUy1QLUdSTkEtUlciLCJITVMtUC1HUFJBLVJXIiwiU0lOLVAtUlRBLVJXIiwiU0lOLUFQSS1HSUMtUiIsIkhNUy1QLUdQUi1SVyIsIk1EQy1QLUNBLVJXIiwiSE1TLVAtSUItUlciLCJNREMtQVBJLVJUUy1SIiwiTURDLVAtUkRFLVJXIiwiSE1TLVAtTVQtUlciLCJTSU4tUC1FTlFMLVJXIiwiSE1TLVAtUFJMLVJXIiwiSE1TLVAtQ0NHQUgtUlciLCJTVC1QLUJSRC1SIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIk1EQy1QLVVBUy1SVyIsIlNULVAtREVTLVJXIiwiTURDLVAtR0RUUy1SIiwiU1QtUi1IT0QiLCJITVMtUC1SU0RELVJXIiwiU1QtUC1DTVQtUlciLCJTSU4tUC1DRi1SIiwiU0lOLVAtRlUtUlciLCJTSU4tQVBJLUZVLVJXIiwiU1QtUC1TTk8tUlciLCJNREMtUC1QTlAtUiIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLUlQQS1SVyIsIkhNUy1QLU1STC1SVyIsIkhNUy1QLVBJLVJXIiwiSE1TLVAtQkxLLVJXIiwiTURDLVAtR0FELVJXIiwiSE1TLVAtUElOLVJXIiwiU0lOLVAtUkEtUlciLCJTSU4tQVBJLVNGLVJXIiwiSE1TLVAtUk0tUlciLCJITVMtUC1HUk5SLVJXIiwiSE1TLVAtREItUlciLCJTSU4tUC1GQS1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzI5LDE3MiwxLDIsMywxMTIsNCwyNiw1MCwyNyw1Miw1MSwyOCw1LDEwLDEzLDE1LDU4LDU5LDE0LDEyMiwxMjMsMTYsMTcsMTIwLDEyMSwxMzMsMTM0LDEzNSwxMDIsMTEzLDExNCwxMzYsMTM3LDEzOCwxMTUsMTE2LDExNywxMTgsMjAsMjEsNTUsMzEsMzAsNDQsMTU1LDMzLDE5MywxOTQsNDMsMTAxLDExMCw0OSwxMjcsMTI4LDIwMF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzkzMDc4NDc3LCJleHAiOjE3OTMxNjU0Nzd9.S7QYpJ2APSBL2mQOmaB9-7dbGa0-7h52dbHp7GoxUqgAS2ucPbeet3JCjpF7MvnzRg-dMaVrK2ojefB2Jf8j19tUnNXn7OkJJHKs_xL21N1X5RdB4N1OMQ_ZIPT6PuqhC8DmBTrs5CQkRxIhrqvj0_FzP1gmhpX5TsFUURtaY2bplQkeXkZ-sDe1KroMGAwcDRKx9T2bynl2YNp8TV9LVKV7fbBDWqN0wsqMI2VkUkbdoeo1MuZoqtBcDUcz4hKwqGTiMILbafHMnPXpKaEy1Hzw5qrP_vmDOaRHrsJ35P-OG3NOWqqUtmb_7ceBkKbkHJ3a4-kQ0OPaQ6EwGZNQvw";
  if (dev_token && dev_token.trim() !== "") {
    const selectedBranch = "SHB001";
    localStorage.setItem("selected_branch", selectedBranch);
    const selectedOutlet = "OLET003";
    localStorage.setItem("selected_outlet", selectedOutlet);
    const selectedHospital = "SH001";
    localStorage.setItem("selected_hospital", selectedHospital);
    localStorage.setItem("hospital_code", selectedHospital);
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
            userPayload["allowed-outlets"],
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
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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtSE1TUFMiLCJITVMtUC1QUkwtUlciLCJTRC1BUEktVEQtUiIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLVAtQ1RJQS1SVyIsIk1EQy1QLUdTUC1SIiwiSE1TLVAtTlMtUlciLCJNREMtUC1HUFAtUiIsIlNELVAtTEdFLVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtVk5ERC1SVyIsIk1EQy1QLU9TQi1SVyIsIk1EQy1QLUFBVS1SVyIsIlNELVAtTEJMLVJXIiwiU0QtUC1MQkMtUlciLCJITVMtUC1HQURNLVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJNREMtQVBJLVRIUi1SIiwiSE1TLVAtTVQtUlciLCJTVC1QLURFUy1SIiwiSE1TLVAtUFJBLVJXIiwiU1QtUi1FTVAiLCJITVMtUC1NUi1SVyIsIkhNUy1QLVNUQS1SVyIsIk1EQy1BUEktUkRMLVJXIiwiSE1TLVAtUk1ELVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtUkNMTi1SVyIsIlNELVAtUkItUlciLCJTRC1QLVBHLVJXIiwiSE1TLVAtUENELVJXIiwiTURDLVAtUE5QLVJXIiwiSE1TLUFQSS1WTSIsIkhNUy1QLU1SQS1SVyIsIlNELUFQSS1SQi1SVyIsIlNELVAtUEYtUlciLCJITVMtUC1EQiIsIkhNUy1QLVBTSC1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1BUEktRExELVIiLCJTRC1QLVVQQi1SVyIsIkhNUy1QLVJTSEZURC1SVyIsIkhNUy1QLVBJLVJXIiwiTURDLUFQSS1QR1AtUlciLCJTRC1QLVNTLVJXIiwiU1QtUC1CUkQtUiIsIk1EQy1BUEktQ0dQLVJXIiwiTURDLVAtUkVHLVIiLCJNREMtUC1UUkItUlciLCJNREMtQVBJLVBBVCIsIkhNUy1QLUdSTi1SVyIsIk1EQy1QLUdPUC1SIiwiSE1TLVAtR1BSQS1SVyIsIk1EQy1QLUFELVJXIiwiTURDLUFQSS1BRE0tUlciLCJNREMtUC1SRUctUlciLCJTRC1QLUxQSS1SIiwiU0QtUC1QQi1SVyIsIlNULUFQSS1BTUMtUiIsIlNULVAtVERMLVIiLCJTRC1BUEktU1MtUlciLCJITVMtUC1CTEtELVJXIiwiSE1TLVAtT1MtUlciLCJTRC1QLVNTVS1SVyIsIkhNUy1QLUFETUQtUlciLCJITVMtUC1PQ1ItUlciLCJNREMtUi1BRE0iLCJTRC1SLVNNQyIsIkhNUy1QLUlCRS1SVyIsIkhNUy1QLVJTREQtUlciLCJNREMtUC1TT1ItUiIsIkhNUy1QLURJUy1SVyIsIlNELVAtU0MtUiIsIkhNUy1QLUNDLVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1QLUNDRC1SVyIsIlNULUFQSS1DUkQtUiIsIlNELVAtTEJOLVIiLCJNREMtQVBJLU9HUC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiSE1TLVAtUktJVC1SVyIsIk1EQy1BUEktTEJOLVIiLCJITVMtUC1QQy1SVyIsIkhNUy1QLUlCRC1SVyIsIk1EQy1BUEktUEFULVIiLCJTRC1QLUxUTS1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLU1STC1SVyIsIlNULUFQSS1CUkQtUlciLCJNREMtUC1BU00tUlciLCJITVMtUC1SQ0FURC1SVyIsIkhNUy1QLVBPLVJXIiwiSE1TLVAtUE9MLVIiLCJITVMtUC1TSURFQkFSIiwiU0QtQVBJLUNOLVJXIiwiU0QtUC1HUEItUiIsIlNELVAtTEJGLVJXIiwiSE1TLVAtU1JNLVJXIiwiSE1TLVAtTlNELVJXIiwiU1QtUC1TTk8tUlciLCJNREMtUC1VQVMtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtUlNIRlQtUlciLCJTRC1QLVNTLVIiLCJNREMtQVBJLUwtUlciLCJITVMtUC1HUk5SLVJXIiwiSE1TLVAtSE1TIiwiTURDLUFQSS1QREMtUlciLCJTVC1QLUNNVC1SVyIsIkhNUy1QLUJST09NLVJXIiwiU0QtUC1CQS1SVyIsIlNELVAtQkctUlciLCJNREMtQVBJLVNHUC1SVyIsIkhNUy1QLVJLSVRELVJXIiwiTURDLUFQSS1BVC1SVyIsIkhNUy1QLUFETUwtUlciLCJTRC1QLVNQLVIiLCJNREMtUC1HQVQtUlciLCJTRC1QLVBPVi1SVyIsIk1EQy1BUEktQVQtUiIsIk1EQy1BUEktUlRTLVIiLCJTRC1BUEktVE0tUlciLCJITVMtUC1JQi1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLVJNLVJXIiwiU0QtUC1HU1AtUiIsIkhNUy1QLVZORC1SVyIsIlNELVAtTFJDLVIiLCJTRC1QLUdQRC1SIiwiU1QtUi1DRFIiLCJNREMtQVBJLUNEUi1SIiwiTURDLVAtR0NQLVIiLCJTRC1QLUJURC1SVyIsIk1EQy1BUEktR0FTLVIiLCJNREMtUC1HQVAtUiIsIkhNUy1QLVNBRE0tUlciLCJTRC1QLUxDQy1SVyIsIkhNUy1QLUJMSy1SVyIsIlNULVAtQ01ULVIiLCJTVC1QLU5URi1SVyIsIkhNUy1QLUhNU1BTLVJXIiwiTURDLVAtUE5QLVIiLCJNREMtUC1HT0EtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxMjgsMiw1LDEzNCwxMzUsMTM2LDEwLDE0LDE1LDE2LDI2LDI3LDI4LDI5LDMwLDQ0LDUwLDUxLDUyLDU1LDU4LDU5LDExNCwxMjEsMTIyLDEyNywyMF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg3NzE3Nzc3LCJleHAiOjE3ODc4MDQ3Nzd9.J_HoPqT9nsTDzuUjNaDm_OqHIF_bP5Km-H7Of6GTL1L9BG-Ec-c6iRNM4dT5T9A3uIGbrn6TNUmCfAp9-qYxmgfdR5GJkoj3ya52HBDOc96tSSaCXmWg_mvwMlDxOzkkkdiANN-UiDIsdPo9xX9zwxUXRKdVLeUA2PnNjw35EiXzNWaa6Jcz5F2JbykwGLXjAHLBrqkwWJIcc4dLJSUAfxzhbfeiL2zBYU-FFBEcKZaWip3_lTiZdHHSa6-b27BakFbMt9MqCMOzGsqK8MaocuwrwXow75yse6ymCifvQri7VHMgRamAZ0XBX09AOmNYOxz4MMh_Wf17a76rbbSU7g";
  console.log("🔧 Development token is empty - will redirect to login");
  if (dev_token && dev_token.trim() !== "") {
    const selectedBranch = "SHB001";
    localStorage.setItem("selected_branch", selectedBranch);
    const selectedOutlet = "OLET005";
    localStorage.setItem("selected_outlet", selectedOutlet);
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
    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");

    // If no token found and not a public route, try development token
    if (!accessToken && !isPublic) {
      console.log(
        "❌ No token found in localStorage, trying development token",
      );
      accessToken = setforlocaldev();
    }

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
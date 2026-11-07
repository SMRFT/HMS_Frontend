import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// Patch performance.measure to prevent DataCloneError / Out of memory crashes from React dev User Timing profiling
if (typeof performance !== 'undefined' && typeof performance.measure === 'function') {
  const _origMeasure = performance.measure.bind(performance);
  performance.measure = function (name, startOrOptions, endMark) {
    try {
      return _origMeasure(name, startOrOptions, endMark);
    } catch (err) {
      if (err && (err.name === 'DataCloneError' || (err.message && err.message.includes('cloned')))) {
        try {
          if (startOrOptions && typeof startOrOptions === 'object') {
            const { start, end } = startOrOptions;
            return _origMeasure(name, start !== undefined && end !== undefined ? { start, end } : undefined);
          }
        } catch (_) { }
        return;
      }
      throw err;
    }
  };
}

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

// console.log("=== HMS INDEX.JS DEBUG ===");
// console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtUE9BLVJXIiwiU1QtUC1OVEYtUlciLCJITVMtUC1DVElBLVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtUENPUFAtUlciLCJITVMtUC1STS1SVyIsIkhNUy1QLVdSLVJXIiwiSE1TLVAtRk9SLVJXIiwiSE1TLVAtU1JNLVJXIiwiSE1TLVAtU0RQLVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUNDUFJQLVJXIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtUC1QR1MtUlciLCJITVMtUC1ITVMiLCJITVMtUC1HUk5BLVJXIiwiSE1TLVAtUE8tUlciLCJTVC1QLVRETC1SVyIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLUlQLVIiLCJITVMtQVBJLVBBQ0stUiIsIkhNUy1QLURPLVJXIiwiSE1TLVAtTVJMLVJXIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtSVBFLVJXIiwiSE1TLVAtUEMtUlciLCJTVC1BUEktQ1JELVJXIiwiSE1TLVAtQ0MtUlciLCJITVMtUC1CUk9PTS1SVyIsIkhNUy1QLUdBRE0tUlciLCJITVMtUC1DQ09QUEItUlciLCJITVMtUC1DQ0dSUCIsIlNULVAtVERMLVIiLCJITVMtUC1HUk4tUlciLCJITVMtUC1NUkEtUlciLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1QLUJULVJXIiwiSE1TLVAtUElOLVJXIiwiU1QtUC1DTVQtUlciLCJITVMtUC1QUkwtUlciLCJITVMtUC1WTkRELVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1BUEktRExELVIiLCJTVC1QLURFUy1SIiwiU1QtUi1IT0QiLCJITVMtUC1OUy1SVyIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLUNDVVBCIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtR1BSQS1SVyIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtQ0NHUkIiLCJITVMtUC1WTkQtUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1CVEQtUlciLCJITVMtUC1SQ0xOLVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLVBTSC1SVyIsIkhNUy1QLUNDSVBBQi1SVyIsIkhNUy1QLVJTREQtUlciLCJITVMtUC1JUEQtUlciLCJITVMtUC1JUEEtUlciLCJITVMtUC1QSUQtUlciLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1CTEstUlciLCJITVMtUC1OU0QtUlciLCJITVMtUC1GT1ItUiIsIlNULVAtU05PLVJXIiwiSE1TLVAtSUItUlciLCJITVMtUC1BRE1ELVJXIiwiSE1TLVAtRElTLVJXIiwiSE1TLVAtTVItUlciLCJITVMtUC1QRVItUlciLCJITVMtUC1NVC1SVyIsIkhNUy1BUEktVUhJRC1SIiwiU1QtUC1DTVQtUiIsIkhNUy1QLVBJLVJXIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1DQ0QtUlciLCJITVMtUC1DQ0NSQiIsIkhNUy1QLVNBRE0tUlciLCJITVMtUC1QUi1SVyIsIkhNUy1QLVBDRC1SVyIsIkhNUy1QLURSTS1SVyIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1JUC1SVyIsIkhNUy1QLUJURS1SVyIsIkhNUy1QLUlQREItUlciLCJITVMtUC1EQi1SVyIsIkhNUy1QLVNULVJXIiwiU1QtUC1CUkQtUiIsIkhNUy1QLUNDR01QQi1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1QLUJULVIiLCJITVMtUC1DQ0MtUlciLCJITVMtUC1SS0lULVJXIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLUJMS0QtUlciLCJITVMtUC1SQ0FULVJXIiwiU1QtQVBJLUFNQy1SVyIsIkhNUy1QLVJNRC1SVyIsIkdQLVAtR0NOLVIiLCJTVC1QLURFUy1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLUNDR0FTLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMjksMTcyLDEsMiwxMTIsMTQ1LDQsMjYsNTAsMjcsNTIsNTEsMjgsNSwyMDMsMTAsMTIsMTMsMTksMjAsMjEsNTUsMzEsMzAsNDQsMywyMDAsMTU1LDMzLDE5MywxOTQsNDMsMTAxLDExMCw0OSw1Myw1NCwxOTYsMjAxLDIwMiwxMjcsMTI4LDE1OSwxNSw1OCw1OSwxNCwxMjIsMTIzLDE2LDE3LDEyMCwxMjEsMTMzLDEzNCwxMzUsMTAyLDEzNiwxMzcsMTM4LDExNSwxMTYsMTE3LDExOF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDYiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc5NDAyMjI2MiwiZXhwIjoxNzk0MTA5MjYyfQ.AoOUAo_dxLA1XDbZydiabmObSM18BAMeKtfza7_DmBklbbLOz2a7ewySbmnwGCPEulG5T6pEnGdXRT387g3518S4U7khW78vcdMRUKuYCMrBo7uud4P8k3obOJOGvrVBTXAXKfCpA_6_1aPUa16X3mWODSJ-BMwyy8lwQ0b7W9JYnY0q4HdKKe6KcZJYWdPPet0T8qbObBfxhkdGWmtg-Nqpdlh_53VQj2cua39fZQRtWhjxEYsWAtShAq_39PYTtEb8uRhm2tXNQYBVNnKQpmg9t5lFbYr1DtNGck2Ks6_UNS_urWId4Jo4beP1K8SGcQXViW228w4MyvBkJecsCg";
  if (dev_token && dev_token.trim() !== "") {
    if (!localStorage.getItem("selected_branch")) {
      const selectedBranch = "SHB001";
      localStorage.setItem("selected_branch", selectedBranch);
    }
    // Only set default outlet if user has not yet selected one
    if (!localStorage.getItem("selected_outlet")) {
      const selectedOutlet = "OLET002";
      localStorage.setItem("selected_outlet", selectedOutlet);
      localStorage.setItem("outlet_code", selectedOutlet);
      localStorage.setItem("selected_outlet_name", "OP PHARMACY");
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
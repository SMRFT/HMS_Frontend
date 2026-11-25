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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJjaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLVBTQi1SVyIsIlNULUFQSS1DUkQtUlciLCJTVC1QLURFUy1SIiwiSE1TLVAtUEhWU0ItUlciLCJITVMtUC1DQ0dBSC1SVyIsIlNULVAtVERMLVIiLCJHUC1QLUdDTi1SIiwiSE1TLVAtQ0NQUlAtUlciLCJITVMtUC1QQVMtUlciLCJITVMtUC1NSENTLVJXIiwiSE1TLVAtUEZCLVJXIiwiU1QtUC1TTk8tUlciLCJTVC1QLUJSRC1SIiwiSE1TLVAtSE1TIiwiSE1TLVAtT1BTUkJELVJXIiwiSE1TLVAtQ0REUy1SVyIsIkhNUy1QLU9QSCIsIkhNUy1QLVBNQy1SVyIsIkhNUy1QLU1IUENLLVJXIiwiSE1TLVAtQ1NMRC1SVyIsIlNULVAtQ01ULVIiLCJTVC1QLU5URi1SIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtUENCX1JXIiwiU1QtUC1UREwtUlciLCJITVMtUC1QR1MtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1QRERTLVJXIiwiSE1TLVAtTUhDRC1SVyIsIkhNUy1QLUNTTFItUlciLCJITVMtUC1QR1BCVC1SVyIsIkhNUy1BUEktRExELVJXIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1DQ09QUEItUlciLCJITVMtUC1DVEktUlciLCJITVMtUC1QU0lQLVJXIiwiU1QtUC1DTVQtUlciLCJITVMtUC1QREItUlciLCJITVMtUC1TUkJELVJXIiwiSE1TLVAtQ0NDUkItUlciLCJTVC1BUEktRU1QLVIiLCJITVMtUC1QU00tUlciLCJITVMtUC1DU0lMLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUNDVVBCLVJXIiwiSE1TLVAtTUhDUi1SVyIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLVAtUEdFQi1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiSE1TLVAtU1JHUEQtUlciLCJITVMtUC1DQ0dBUy1SVyIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1DQ0lQQUItUlciLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtUFBELVJXIiwiSE1TLVAtQ1NMTS1SVyIsIkhNUy1QLVMzNjAtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVBHU1JELVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtQ1RJQS1SVyIsIlNULVItQSIsIkhNUy1QLVRTU1ItUlciLCJITVMtUC1QR0xCVS1SVyIsIkhNUy1QLU1IUFNELVJXIiwiU1QtUC1ERVMtUlciLCJITVMtUC1UQkNTLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbNSwxMCwxOCwxOSw0MywxMjcsMTI4LDEyOSwxNDYsMTQ3LDE2MCwxNjEsMTYyLDE2MywxNjUsMTU5LDE5MSwxOTksMjExLDIxMl0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAxIiwiT0xFVDAwMiIsIk9MRVQwMDMiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3OTU1ODM4NDQsImV4cCI6MTc5NTY3MDg0NH0.IBPIzRir_rG38W8N8GTMJzGmvTz9_-D3Gnq6GlH3A9-tHVvjUC-M4MISM7EEyM5IBpJ7acUlLm6Jvhp9auHrBuofIUNsxday8yNzVznKE7ryucdWLHJ50ah_M0N4mV5uJ2kM0fvyAEd3I75X7zzXDKk_nKcFAytnKZcla20Yq9_jeJ1aBILFXk_KNIckftlNgCn2FRTVfAR-4foeZiEOHDvYsHQVrRdbkyKtbHyCiMRHsSxtLA6dC5JBRN8Fr-5n0fnNwOgsH-lNgjinTcDheHOAn_nznmj5Iw_jaXyiNmJ7xWjSBZy3T7idhCSLwt-JH4sTDLCzbfYVtBSmtg8gdg";

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
          if (userPayload["page_outlets"]) {
            localStorage.setItem(
              "page_outlets",
              JSON.stringify(userPayload["page_outlets"] || {}),
            );
          }
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
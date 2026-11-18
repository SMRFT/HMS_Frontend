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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU1QtUC1DTVQtUlciLCJITVMtUC1DQ1VQQi1SVyIsIkhNUy1QLURSTS1SVyIsIkhNUy1QLVZOREQtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1QSS1SVyIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1JUC1SVyIsIkhNUy1QLVBPQS1SVyIsIkhNUy1QLURJUy1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLUJMSy1SVyIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1QT0wtUlciLCJNREMtQVBJLUFULVJXIiwiSE1TLVAtRE8tUlciLCJITVMtUC1DQ1VQQiIsIkhNUy1QLUNDR1JQIiwiSE1TLUFQSS1VSElELVIiLCJITVMtUC1JUEQtUlciLCJITVMtUC1CVEUtUlciLCJITVMtUC1CVEQtUlciLCJHUC1QLUdDTi1SIiwiTURDLUFQSS1PR1AtUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1QRVItUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1HUk5BLVJXIiwiSE1TLVAtQ0NHUlAtUlciLCJITVMtUC1OU0QtUlciLCJITVMtUC1CTEtELVJXIiwiSE1TLVAtUFItUlciLCJITVMtUC1JUC1SIiwiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLUNDR0FILVJXIiwiTURDLVAtR0NQLVIiLCJITVMtUC1TUk0tUlciLCJITVMtUC1DVEktUlciLCJITVMtUC1JUERCLVJXIiwiSE1TLVAtUktJVEQtUlciLCJITVMtUC1OUy1SVyIsIkhNUy1QLUNDR1JCLVJXIiwiSE1TLVAtTVJBLVJXIiwiSE1TLVAtUlNERC1SVyIsIlNULVAtU05PLVJXIiwiTURDLUFQSS1BR1AtUlciLCJTVC1BUEktRU1QLVIiLCJNREMtUC1TTUNILVJXIiwiSE1TLVAtQ0NQUlAtUlciLCJITVMtUC1XUi1SVyIsIkhNUy1QLUJST09NLVJXIiwiSE1TLVAtR1BSQS1SVyIsIkhNUy1QLVBDRC1SVyIsIlNULVAtTlRGLVJXIiwiSE1TLVAtTE5ELVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtUElOLVJXIiwiSE1TLVAtQlQtUiIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtRk9SLVJXIiwiSE1TLVAtQURNRC1SVyIsIlNULVAtVERMLVJXIiwiSE1TLVAtUlNIRlQtUlciLCJITVMtUC1STUQtUlciLCJITVMtUC1DVElBLVJXIiwiU1QtUC1ERVMtUiIsIk1EQy1SLVBEQyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1PUy1SVyIsIkhNUy1QLUFJTi1SIiwiSE1TLVAtT0NSLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1DQ0lQQUItUlciLCJITVMtUC1EQi1SVyIsIkhNUy1QLVNUQS1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtQlQtUlciLCJNREMtUC1HT1AtUiIsIkhNUy1QLUhNUyIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtUENPUFAtUlciLCJITVMtUC1JUEUtUlciLCJITVMtUC1DQ0dBUy1SVyIsIkhNUy1BUEktRExELVIiLCJTVC1BUEktQU1DLVJXIiwiU1QtUC1OVEYtUiIsIk1EQy1QLUdNQy1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiSE1TLVAtU0RQLVJXIiwiSE1TLVAtTVQtUlciLCJITVMtUC1DQy1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtUE8tUlciLCJITVMtUC1JUEEtUlciLCJNREMtUC1HQVQtUiIsIk1EQy1QLUFBVS1SVyIsIk1EQy1QLUdBUC1SIiwiTURDLUFQSS1MLVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtUFNILVJXIiwiU1QtUC1ERVMtUlciLCJITVMtUC1QUkEtUlciLCJITVMtUC1DQ0MtUlciLCJITVMtUC1NUi1SVyIsIkhNUy1QLUdBRE0tUlciLCJTVC1SLUhPRCIsIk1EQy1QLUdTUC1SIiwiSE1TLVAtQ0NDUkItUlciLCJITVMtUC1DQ0dSQiIsIkhNUy1QLURQUkQtUlciLCJITVMtUC1DQ0NSQiIsIkhNUy1QLVNBRE0tUlciLCJTVC1QLUJSRC1SIiwiTURDLUFQSS1QREMtUlciLCJITVMtUC1SRU5RLVJXIiwiTURDLVAtR0EtUlciLCJITVMtUC1BRE1MLVJXIiwiTURDLVAtQ0JDTC1SVyIsIk1EQy1QLUdQUC1SIiwiTURDLVAtR09BLVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLVBHUy1SVyIsIkhNUy1QLUNDR01QQi1SVyIsIk1EQy1BUEktUEdQLVJXIiwiTURDLVAtQUQtUiIsIkhNUy1QLUNDRC1SVyIsIk1EQy1QLVBOUFItUiIsIkhNUy1QLVNJREVCQVIiLCJTVC1QLVRETC1SIiwiSE1TLVAtUkNBVC1SVyIsIk1EQy1QLVRTLVJXIiwiU1QtUC1DTVQtUiIsIkhNUy1QLU1STC1SVyIsIkhNUy1QLVBSTC1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtUEMtUlciLCJNREMtQVBJLVNHUC1SVyIsIkhNUy1QLUZPUi1SIiwiTURDLUFQSS1DRFItUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsyOSwxNzIsMSwyLDExMiwxNDUsMjE3LDQsMjYsNTAsMjcsNTIsNTEsMjgsNSwyMDMsMjA1LDEwLDEyLDEzLDE1LDU4LDU5LDE0LDEyMiwxMjMsMTYsMTcsMTIwLDEyMSwxMzMsMTM0LDEzNSwxMDIsMTM2LDEzNywxMzgsMTE1LDExNiwxMTcsMTE4LDIxMywxOSwyMCwyMSwyMDQsNTUsMzEsMzAsNDQsMywyMDAsMTU1LDMzLDE5MywxOTQsNDMsMTAxLDExMCw0OSw1Myw1NCwxOTYsMjAxLDIwMiwxMjYsMTI3LDEyOCwxNTldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDQiLCJPTEVUMDA2IiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJHTE9CQUwiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3OTQ5NzI0NDUsImV4cCI6MTc5NTA1OTQ0NX0.LyocTCUZLVqesz_2jJNVA1ju-1P5eyLx-QXnIhMiYu3_TsTTDAMAYf7PMYgc7qYJgHnG5LhBIQ_kkILT5qq1NdXtsAWy9Cy-Zbu88FSUlmf7vfMUntY1Fp9owls1tBWRCnns8N0mryZic6Jq1QTcLvZ8QbsuD6uoi37wi4lPKSE-0Ul625eWk3mwfwzshGb5YlrQjSsBzg5sLD7WOHERd12frGrj6SymMO6nzHSpwgFF9hpVczELQ_6gbyumNofVkTDrXUZJlrH0tQHA2qhE8vnFu1q0sKJeqjyXhv_XE6r1b6AqoJNev9RyWmthpdWoez-VjeRMV6o-ulqODtqLqw";

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
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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU1QtQVBJLUNSRC1SVyIsIkhNUy1QLUNDR1JCIiwiSE1TLVAtU0FETS1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtUE8tUlciLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtU0RQLVJXIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiSE1TLVAtQ0NJUEFCLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1ITVMiLCJITVMtUC1BQS1SVyIsIkhNUy1QLUNDVVBCIiwiSE1TLVAtR0FETS1SVyIsIkdQLVAtR0NOLVIiLCJITVMtUC1OUy1SVyIsIkhNUy1QLURJUy1SVyIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLUlQREItUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtUktJVEQtUlciLCJITVMtUC1EUk0tUlciLCJITVMtUC1DQy1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLVBSQS1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtT0NSLVJXIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLVBDRC1SVyIsIlNULVAtTlRGLVIiLCJITVMtUC1CTEtELVJXIiwiU1QtUC1UREwtUlciLCJITVMtUC1DQ1BSUC1SVyIsIkhNUy1QLUFETUQtUlciLCJITVMtUC1QQy1SVyIsIlNULVAtTlRGLVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLUNDRC1SVyIsIkhNUy1QLVBPQS1SVyIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtUk1ELVJXIiwiSE1TLVAtTlNELVJXIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLUZPUi1SIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtTVJBLVJXIiwiSE1TLVAtQ0NDUkIiLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtUFItUlciLCJITVMtUC1SU0hGVC1SVyIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLU9TLVJXIiwiSE1TLVAtUEdTLVJXIiwiSE1TLVAtTVItUlciLCJTVC1QLUNNVC1SIiwiSE1TLUFQSS1VSElELVIiLCJTVC1QLURFUy1SIiwiSE1TLVAtRk9SLVJXIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtUC1QRVItUlciLCJTVC1QLVRETC1SIiwiSE1TLVAtQ0NHQVMtUlciLCJITVMtUC1QU0gtUlciLCJITVMtUC1TUk0tUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLUNDR1JQIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1CVC1SVyIsIkhNUy1QLVJTSEZURC1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1XUi1SVyIsIkhNUy1QLUdSTkEtUlciLCJITVMtUC1HUFJBLVJXIiwiSE1TLVAtR1BSLVJXIiwiSE1TLVAtSUItUlciLCJITVMtUC1NVC1SVyIsIkhNUy1QLVBSTC1SVyIsIkhNUy1QLUNDR0FILVJXIiwiU1QtUC1CUkQtUiIsIkhNUy1QLVJFTlEtUlciLCJITVMtUC1DQ09QUEItUlciLCJTVC1QLURFUy1SVyIsIlNULVItSE9EIiwiSE1TLVAtUlNERC1SVyIsIlNULVAtQ01ULVJXIiwiU1QtUC1TTk8tUlciLCJITVMtUC1QT0wtUlciLCJITVMtUC1JUEEtUlciLCJITVMtUC1NUkwtUlciLCJITVMtUC1QSS1SVyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLVBJTi1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLURCLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMjksMTcyLDEsMiwxMTIsMTQ1LDQsMjYsNTAsMjcsNTIsNTEsMjgsNSwxMCwxMywxNSw1OCw1OSwxNCwxMjIsMTIzLDE2LDE3LDEyMCwxMjEsMTMzLDEzNCwxMzUsMTAyLDExMywxMTQsMTM2LDEzNywxMzgsMTE1LDExNiwxMTcsMTE4LDE5LDIwLDIxLDU1LDMxLDMwLDQ0LDMsMjAwLDE1NSwzMywxOTMsMTk0LDQzLDEwMSwxMTAsNDksMTI3LDEyOCwyMDFdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDQiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc5MzQxNzE2OCwiZXhwIjoxNzkzNTA0MTY4fQ.MKLqc6Q0eTZ3BlXHGFU_UdExEgLzBi6u6-lYUrs-HSriJpayrzBIq6u5ephtCR1S3QPBlyk2a1Nf8nICeIxAzwYnTMmJGTL_RYgAAXltrzrJGwE-5wcQhjW31mg7Z6oQys2TZhGJ6noDCKPRFuw_dmWVzpWMytkwyRQBo-Go6REkobztneV_ulmzaDa3EB2ztQJN4NOivStRe_2iNIw4Rt_z54w1IiHkQF2Nc4ThdH70N3AIbTft30H3Cu1uZ37f5z9Gg2WuS9Q3sTtA_i3pYx0RYTJ0Df-MBYOHn8NKrxtz8Y9jf4SD3ZWeurgrK5rQtwtvv0U_aPUANMrweKaEJw";
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
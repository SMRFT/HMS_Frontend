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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLVMzNjAtUlciLCJITVMtUC1HT1BCTi1SIiwiSE1TLVAtQURNTC1SVyIsIkhNUy1QLUhTTi1SVyIsIkhNUy1QLVBGQi1SVyIsIkhNUy1QLVBHRUItUiIsIkhNUy1QLVBNQy1SVyIsIkhNUy1QLVBHUEJULVJXIiwiSE1TLVAtQ0NTUFNELVJXIiwiSE1TLVAtQkxLLVIiLCJITVMtUC1SQ0FULVIiLCJITVMtUC1QR0FTLVIiLCJITVMtUC1QR1MtUlciLCJITVMtUC1DRERTLVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtQ0NHQVMtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1DT1BQLVJXIiwiSE1TLVAtUERCLVJXIiwiSE1TLVAtUFNSQkQtUlciLCJITVMtUC1EUk0tUiIsIkhNUy1QLUdMQlQtUiIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1QR0xCVS1SIiwiSE1TLVAtUE9QUERCLVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiSE1TLVAtQ0NHQUgtUlciLCJITVMtUC1PUEgiLCJITVMtUC1TUkJELVJXIiwiSE1TLVAtQ0NDUkItUlciLCJITVMtUC1HUEJULVIiLCJHUC1QLUdDTi1SIiwiSE1TLVAtSUItUiIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLUdMQlUtUiIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIkhNUy1BUEktSVQtUlciLCJITVMtUC1QQ09QUC1SVyIsIkhNUy1QLVBPUFVBUy1SVyIsIkhNUy1QLVBHRUItUlciLCJITVMtUC1QU09QQi1SVyIsIkhNUy1QLVBQRC1SIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLUFQSS1ETEQtUlciLCJITVMtUC1DQ0lQQUItUlciLCJITVMtUC1QT1BTUkJELVJXIiwiSE1TLVAtQ1MtUlciLCJITVMtUC1QQ0ItUlciLCJITVMtUC1PUFNSQkQtUlciLCJITVMtUC1CVC1SVyIsIkhNUy1QLVBBUy1SVyIsIkhNUy1QLVBDQ1NEX1JXIiwiSE1TLVAtUEREUy1SVyIsIkhNUy1QLVBTTS1SVyIsIkhNUy1QLVNSR1BELVJXIiwiSE1TLVAtUE9QU1ItUlciLCJITVMtUC1HT1BTLVIiLCJITVMtUC1DQ0dQQi1SVyIsIkhNUy1QLVBQRC1SVyIsIkhNUy1QLVdSLVJXIiwiSE1TLVAtVkwtUlciLCJITVMtUC1QR1BCVC1SIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1DQ1VQQi1SVyIsIkhNUy1QLVNHTEEtUlciLCJITVMtUC1UQkNTLVJXIiwiSE1TLVAtR0FFLVIiLCJITVMtUC1DQ0dBSC1SIiwiSE1TLVAtVFNTUi1SVyIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtT1BQQi1SIiwiSE1TLVAtR1dMLVIiLCJITVMtUC1TRFVJLVJXIiwiSE1TLVAtUEhWU0ItUlciLCJITVMtUC1DRUItUlciLCJITVMtUC1XUlEtUlciLCJITVMtUC1DQ0dTUkRfUlciLCJITVMtUC1DQ01CUEItUlciLCJITVMtUC1BRE0tUlciLCJITVMtUC1DQ1BSUC1SVyIsIkhNUy1SLVBIIiwiSE1TLVAtU09QRS1SVyIsIkhNUy1QLVBHTEJVLVJXIiwiSE1TLVAtUFNJUC1SVyIsIkhNUy1QLVBJUEEtUlciLCJITVMtUC1DQ08tUlciLCJITVMtUC1ETEQtUlciLCJITVMtQVBJLVNJTlRFTlRBLVJXIiwiSE1TLVAtUFNCLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtU09QQi1SVyIsIkhNUy1QLVBHU1JELVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbNSwxMCwxMywxOCwxOSwyMCwzMSw0NCwzMiwzMywzNCwzNiwzNSwxNTMsMTU0LDE2NywzNywzOCwzOSw0MywxMDEsMTEwLDQ5LDEyNywxMjgsMTI5LDE5MSwxOTgsMjAwLDIwMV0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJPTEVUMDA0Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzkzNjA1MjYwLCJleHAiOjE3OTM2OTIyNjB9.CMQqSIwlLaCkCGPvu4CEVRYViM3WRs_xPRg5mUtMfRod46l0ZH-hMfKSPl9DF8Rudoh3mBoRqK8uew6s18oGdPOuw-fmDljpr_xI9tzWlu3XV8ltt8jnlh9RgJvNFh47HSm0EvetgfJbXUs1e6fJvWikIm4H92oEntiZJyMzHLkocGNCRWwKF-KW1c9zVehUh6oMtp54j-7M-IUvTB-lg6-CCp2Yv0Of9LXCuf8SsJb827u7HI5SkoBShzNXZKEWbd2cvN_odY-21_DAxkfRoLcHjLA_jVjxgtC2ix_bSJWudDnpKc9KTif0zq2_vh5uEiDeijSeWlYKk5ZTPwwoSQ";
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
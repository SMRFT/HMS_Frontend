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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJITVMiLCJlbWFpbCI6IiIsIm5hbWUiOiJITVMgKEFsbCBQZXJtaXNzaW9ucykiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtQ0NVUEItUlciLCJITVMtUC1EUk0tUlciLCJITVMtUC1WTkRELVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtUEktUlciLCJITVMtUC1QT0EtUlciLCJITVMtUC1ESVMtUlciLCJITVMtUC1HUFItUlciLCJITVMtUC1WTkQtUlciLCJITVMtQVBJLUlVU0ctUlciLCJITVMtUC1QT0wtUlciLCJITVMtUC1EREFTSCIsIkhNUy1QLVNVTS1SVyIsIkhNUy1QLURPLVJXIiwiSE1TLVAtSVBLRy1SIiwiSE1TLVAtU0dSTi1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLUFQSS1JQ1QtUiIsIkdQLVAtR0NOLVIiLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1QRVItUlciLCJITVMtUC1TRFVJLVJXIiwiSE1TLVItQSIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLUNTSUwtUlciLCJITVMtUC1HUk5BLVJXIiwiSE1TLVAtQ0NHUlAtUlciLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLVBSLVJXIiwiSE1TLVAtU1JNLVJXIiwiSE1TLUFQSS1TQU1ULVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtSVBEQi1SVyIsIkhNUy1BUEktSU1SSS1SVyIsIkhNUy1QLUNDR1JCLVJXIiwiSE1TLVAtTVJBLVJXIiwiSE1TLVAtQ0NQUlAtUlciLCJITVMtUC1XUi1SVyIsIkhNUy1QLUdQUkEtUlciLCJITVMtUC1QQ0QtUlciLCJITVMtUC1TMzYwLVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtQlQtUiIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtRk9SLVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVJPUi1SVyIsIkhNUy1QLVJTSEZULVJXIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLUlDRC1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1PUy1SVyIsIkhNUy1QLUFEQVNIIiwiSE1TLUFQSS1JVVNHLVIiLCJITVMtUC1SQklMTCIsIkhNUy1BUEktUkQtUiIsIkhNUy1QLUFTUi1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLUFQSS1JQi1SVyIsIkhNUy1QLUNDSVBBQi1SVyIsIkhNUy1QLURCLVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtQlQtUlciLCJITVMtQVBJLVNBTS1SVyIsIkhNUy1QLUhNUyIsIkhNUy1QLUlCLVIiLCJITVMtUC1QQ09QUC1SVyIsIkhNUy1QLUNDR0FTLVJXIiwiSE1TLVAtREJVRFItUiIsIkhNUy1BUEktRExELVIiLCJITVMtUC1TVU0tUiIsIkhNUy1BUEktRFJNLVIiLCJITVMtQVBJLUlYUkFZLVIiLCJITVMtUC1EUi1SVyIsIkhNUy1QLVNEUC1SVyIsIkhNUy1BUEktSVQtUlciLCJITVMtUC1DQy1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtUE8tUlciLCJITVMtQVBJLVNVTS1SIiwiSE1TLVAtU0dMQS1SVyIsIkhNUy1BUEktQUlBLVJXIiwiSE1TLUFQSS1JWFJBWS1SVyIsIkhNUy1BUEktQU1SLVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtUFNILVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtQ1NMTS1SVyIsIkhNUy1QLU1SLVJXIiwiSE1TLVAtR0FETS1SVyIsIkhNUy1BUEktRFJNLVJXIiwiSE1TLVAtU1VNQS1SVyIsIkhNUy1QLUNDQ1JCLVJXIiwiSE1TLVAtQ1NMUi1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLVNVTUQtUlciLCJITVMtUC1EUFJELVJXIiwiSE1TLUFQSS1JTVJJLVIiLCJITVMtUC1TQURNLVJXIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtQVBJLUFNQS1SVyIsIkhNUy1BUEktSUNULVJXIiwiSE1TLVAtQURNTC1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJITVMtUC1DU0xELVJXIiwiSE1TLUFQSS1TVU0tUlciLCJITVMtUC1DQ0dNUEItUlciLCJITVMtUC1DQ0QtUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtU0dSTiIsIkhNUy1QLU1SLVIiLCJITVMtQVBJLUlUIiwiSE1TLVAtTVJMLVJXIiwiSE1TLVAtUFJMLVJXIiwiSE1TLUFQSS1JQi1SIiwiSE1TLUFQSS1TUk0tUlciLCJITVMtQVBJLUVNTC1SVyIsIkhNUy1QLVBDLVJXIiwiSE1TLVAtTVQtUlciLCJITVMtUC1GT1ItUiIsIkhNUy1QLUNDT1BQQi1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzYsMSwyLDExMiwxNDUsOCw0LDUsMjAzLDIwNSwxMCwxMSwxMyw3LDE1LDU4LDU5LDE0LDEyMiwxMjMsMTYsMTcsMTIwLDEyMSwxMzMsMTM0LDEzNSwxMDIsMTM2LDEzNywxMzgsMTE1LDExNiwxMTcsMTE4LDIwOSwyMTAsMTgsMTksMjAsMjEsOSwyMiwyMDQsMzEsMzAsNDQsMywzMiwxNTUsMTkyLDMzLDM0LDM2LDM1LDE1MywxNTQsMTY3LDE3MCwxNzEsMTkzLDE5NCwyMDYsMzcsMzgsMzksMTU2LDE1NywxNTgsNDMsMTAxLDQ1LDEwMCwxMTAsMTI0LDEyNSw0OSw1Myw1NCwxMTEsMTk2LDE5NywyMDEsMjAyLDEyNywxMjgsMTI5LDE0NCwxNDYsMTQ3LDE1OSwxMzIsMTkxLDIxMywyMTJdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDQiLCJPTEVUMDA2IiwiT0xFVDAwMSIsIk9MRVQwMDIiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3OTQ1Mzk4NTAsImV4cCI6MTc5NDYyNjg1MH0.RmoZBpWUypcjyvllDG2_8QACHtgUA4Hy6uGTC5KUpUeDAqAwxeUCFIwmNACFAoH2Ecxuu-vFYdONnQE87LPCaz0iUadOSIgP1n-8j7s93XmxHugDgkOgM1ajuj0iSeyZVnCR6eFh3av5SBv5tMPQQ5-4emhIS5Gs2g0B0fCOOwNE-LCmJHcJ6t9CMNSfA8pwyRxpYBFX8kY3cbS7qycQPBYqKh24fXxRcoLGGHe7zkmiCHqKvxJzmpdx4dG18dQxsvfZpJre9yN6to4CovCvuAYRzddBOZWSak2nXNdl5BMc2Y-QqwDEIE6mv4N1eTWSGMmVyH4nGB7xPyCNPaH-rw";
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
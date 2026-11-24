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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJITVMiLCJlbWFpbCI6IiIsIm5hbWUiOiJITVMgKEFsbCBQZXJtaXNzaW9ucykiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtRFJNLVJXIiwiSFItUC1QUk0tRU1QLVJXIiwiSE1TLVAtQ1NMTS1SVyIsIkhNUy1BUEktRExELVIiLCJITVMtUC1ERkNBIiwiSE1TLVAtQ0MtUlciLCJITVMtUC1QRVItUlciLCJITVMtUC1NSENELVJXIiwiSE1TLVAtSFJJTlAtUlciLCJITVMtUC1ERkNFIiwiSE1TLVAtREJVRFItUiIsIkhNUy1QLVBTSC1SVyIsIkhNUy1QLUNDQy1SVyIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1ETy1SVyIsIkhNUy1QLVNHUk4tUlciLCJHTC1QLUJELVIiLCJITVMtUC1ST1ItUlciLCJITVMtQVBJLVdUU0FQLVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiSE1TLUFQSS1JVVNHLVJXIiwiSFItUC1QUk0tRU1QLVIiLCJITVMtUC1IVkNDLVJXIiwiSE1TLVAtU1VNUEEtUlciLCJITVMtUC1ERkMtUlciLCJITVMtUC1WUy1SIiwiSE1TLVAtTVJELVIiLCJITVMtUC1JQkUtUlciLCJITVMtUC1DQ0QtUlciLCJITVMtUC1WTkQtUlciLCJITVMtQVBJLUlNUkktUiIsIkZSLUFQSS1GUi1SVyIsIkhNUy1QLUlDRC1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLU9UTS1SVyIsIkhNUy1BUEktU1VNLVIiLCJITVMtUC1QSUQtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1NSENTLVJXIiwiSFItUC1MRVYtQ0ZHLVJXIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1QLU1SRC1SVyIsIkhNUy1QLVBPQS1SVyIsIkNOLUFQSS1DVC1SIiwiSE1TLVAtQU1FLVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1BUEktSVQiLCJITVMtQVBJLUVNTC1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJITVMtUC1TVU0tUlciLCJITVMtQVBJLURSTS1SIiwiSE1TLVAtQlQtUlciLCJITVMtUC1BU1ItUlciLCJITVMtUC1DQ0NSQi1SVyIsIkhNUy1QLUFJTi1SIiwiR0wtUC1FUC1SIiwiSE1TLVAtU0dSTiIsIkhNUy1BUEktUkQtUiIsIkhNUy1QLVZJLVIiLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1QSS1SVyIsIkhNUy1QLU9UTUQtUlciLCJITVMtUC1DQ1BSUC1SVyIsIkhNUy1BUEktSVQtUlciLCJITVMtQVBJLUlCLVJXIiwiSE1TLVAtQ0NHUlAtUlciLCJITVMtUC1JQi1SIiwiSE1TLUFQSS1VSElELVIiLCJIUi1QLVBBWS1TTElQLVIiLCJITVMtUC1DU0xELVJXIiwiSE1TLVAtUEMtUlciLCJITVMtUC1DVElBLVJXIiwiSE1TLUFQSS1JQi1SIiwiSE1TLVAtSE1TIiwiSE1TLUFQSS1JWFJBWS1SVyIsIkhNUy1BUEktSUNULVJXIiwiSFItUC1USy1NR1QtUiIsIkhNUy1QLUFNLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLVNVTUEtUlciLCJIUi1QLUxFVi1FTVAtUiIsIkhNUy1QLUNDSVBBQi1SVyIsIkhNUy1QLUFNLVIiLCJITVMtUC1BQS1SVyIsIkhNUy1QLUNMLVJXIiwiSE1TLVAtQ1NMUi1SVyIsIkhNUy1QLU1IUFNELVJXIiwiSE1TLVAtSUJELVJXIiwiSFItUi1FTVAiLCJITVMtUC1IUklOQS1SVyIsIkhNUy1QLUlCLVJXIiwiSFItUC1USy1NR1QtUlciLCJHTC1QLUVQLVJXIiwiSE1TLUFQSS1TVU0tUlciLCJITVMtUC1DQ0dBUy1SVyIsIkhNUy1QLUZPUi1SIiwiSE1TLUFQSS1JWFJBWS1SIiwiSE1TLVAtSFZDQy1SIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtQVBJLUlDVC1SIiwiSE1TLVAtRk9SLVJXIiwiSE1TLVAtRFItUlciLCJITVMtUC1TVU0tUiIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLU1IQ1ItUlciLCJITVMtQVBJLUlNUkktUlciLCJITVMtUC1EUFJELVJXIiwiSFItUC1MRVYtRU1QLVJXIiwiSE1TLVAtR1BSQS1SVyIsIkhNUy1QLVNEVUktUlciLCJITVMtQVBJLUlVU0ctUiIsIkhNUy1QLUREQVNIIiwiSE1TLVAtUENELVJXIiwiSE1TLVAtT0NSLVJXIiwiSE1TLVAtTUhQQ0stUlciLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLVBPLVJXIiwiSE1TLUFQSS1EUk0tUlciLCJITVMtUC1PUy1SVyIsIkhNUy1QLVZJTlItUiIsIkhNUy1QLUNDR01QQi1SVyIsIkhNUy1QLUdSTkEtUlciLCJITVMtUC1IUklOLVIiLCJITVMtUC1JUERCLVJXIiwiSE1TLVAtSFJJTi1SVyIsIkhNUy1QLUNTSUwtUlciLCJITVMtUC1ERkMtUiIsIkhNUy1QLVNVTUQtUlciLCJITVMtUC1DQ0dSQi1SVyIsIkhNUy1QLU9UTUUtUlciLCJITVMtUC1ERkNSLVIiLCJITVMtUC1HUk4tUlciLCJITVMtUC1PVE0tUiIsIkhSLVAtUk9TLU1HVC1SIiwiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiSE1TLVAtQU1ELVJXIiwiSE1TLVAtVlYtUiIsIkhNUy1QLUlQQS1SVyIsIkhNUy1QLUFEQVNIIiwiSE1TLVItQSJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzYsMSwxNDUsNSwyMDMsMjA1LDEwLDcsMTUsNTgsNTksMTQsMTIzLDE2LDE3LDEzNiwxMTYsMTE3LDIxMiwyMTMsMjAsMjEsOSw1NSwxMzAsMTUyLDMsMjAwLDMyLDE1NSwxOTIsMzMsMzQsMzYsMzUsMTU0LDE2NywxNzAsMTcxLDE5MywxOTQsMjA2LDIxNSwxOTUsNDMsMTAxLDQ1LDEwMCwxMjQsMTI1LDIxNiw0Nyw0OCw1Myw1NCwxMTEsMTk2LDE5NywyMDEsMjAyLDEyNywxMjgsMTUxLDE2NCwxNDMsMTQ0LDE0NiwxNDcsMTYwLDE2MSwxNjIsMTYzLDE2NSwxNTBdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDYiLCJPTEVUMDAyIiwiT0xFVDAwMSIsIk9MRVQwMDQiLCJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzk1NDg2NjI3LCJleHAiOjE3OTU1NzM2Mjd9.fBo7jeCrKDilR_U-94L8mjKXKiNtO69Hy1zVxO5mxYxu6NF64UTka4E2asbXUu-2BCW2nYvEp6SHNRBgMxxO9vaiYWYolmZ5z4AUyqzekFdv5sWrwkaEarC6sF0wLtwqzSbVDww-FQhFwr6aQ2F5AmE92z8w-r9RLo6ff3Z_0qmtodIQrQSgl-hEGpnzMxJugubqywn_C9Rf4zi99JTWg1J53k-B1CeXdCs95Au5yXhlPtbJ2t1RN0fZsaGOaTkCWzrXJotJTeYJUHeKCQq4bFh0PNYk2S-7zeMU7fPTmdZXFDrDqKaawaJPf2eLA7BzrHVzyfisGNHtVdCyvouY2g";

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
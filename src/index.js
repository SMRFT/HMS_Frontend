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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJITVMiLCJlbWFpbCI6IiIsIm5hbWUiOiJITVMgKEFsbCBQZXJtaXNzaW9ucykiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtRFJNLVJXIiwiSFItUC1QUk0tRU1QLVJXIiwiSE1TLVAtQ1NMTS1SVyIsIkhNUy1BUEktRExELVIiLCJITVMtUC1DQy1SVyIsIkhNUy1QLVBFUi1SVyIsIkhNUy1QLU1IQ0QtUlciLCJITVMtUC1IUklOUC1SVyIsIkhNUy1QLURCVURSLVIiLCJITVMtUC1QU0gtUlciLCJITVMtUC1DQ0MtUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtRE8tUlciLCJITVMtUC1TR1JOLVJXIiwiR0wtUC1CRC1SIiwiSE1TLVAtUk9SLVJXIiwiSE1TLUFQSS1XVFNBUC1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIkhNUy1BUEktSVVTRy1SVyIsIkhSLVAtUFJNLUVNUC1SIiwiSE1TLVAtSFZDQy1SVyIsIkhNUy1QLVNVTVBBLVJXIiwiSE1TLVAtTVJELVIiLCJITVMtUC1WUy1SIiwiSE1TLVAtSUJFLVJXIiwiSE1TLVAtQ0NELVJXIiwiSE1TLVAtVk5ELVJXIiwiSE1TLUFQSS1JTVJJLVIiLCJGUi1BUEktRlItUlciLCJITVMtUC1JQ0QtUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1PVE0tUlciLCJITVMtQVBJLVNVTS1SIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtTUhDUy1SVyIsIkhSLVAtTEVWLUNGRy1SVyIsIkhNUy1QLVNVTUUtUlciLCJITVMtUC1HUFItUlciLCJITVMtUC1NUkQtUlciLCJITVMtUC1QT0EtUlciLCJDTi1BUEktQ1QtUiIsIkhNUy1QLUFNRS1SVyIsIkdQLVAtR0NOLVIiLCJITVMtQVBJLUlUIiwiSE1TLUFQSS1FTUwtUlciLCJITVMtQVBJLVNJTlRFTlRBLVJXIiwiSE1TLVAtU1VNLVJXIiwiSE1TLUFQSS1EUk0tUiIsIkhNUy1QLUJULVJXIiwiSE1TLVAtQVNSLVJXIiwiSE1TLVAtQ0NDUkItUlciLCJHTC1QLUVQLVIiLCJITVMtUC1TR1JOIiwiSE1TLUFQSS1SRC1SIiwiSE1TLVAtVkktUiIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIkhNUy1QLVBJLVJXIiwiSE1TLVAtT1RNRC1SVyIsIkhNUy1QLUNDUFJQLVJXIiwiSE1TLUFQSS1JVC1SVyIsIkhNUy1BUEktSUItUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLUlCLVIiLCJITVMtQVBJLVVISUQtUiIsIkhSLVAtUEFZLVNMSVAtUiIsIkhNUy1QLUNTTEQtUlciLCJITVMtUC1QQy1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtQVBJLUlCLVIiLCJITVMtUC1ITVMiLCJITVMtQVBJLUlYUkFZLVJXIiwiSE1TLUFQSS1JQ1QtUlciLCJIUi1QLVRLLU1HVC1SIiwiSE1TLVAtQU0tUlciLCJITVMtUC1WTkRELVJXIiwiSE1TLVAtU1VNQS1SVyIsIkhSLVAtTEVWLUVNUC1SIiwiSE1TLVAtQ0NJUEFCLVJXIiwiSE1TLVAtQU0tUiIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtQ0wtUlciLCJITVMtUC1DU0xSLVJXIiwiSE1TLVAtTUhQU0QtUlciLCJITVMtUC1JQkQtUlciLCJIUi1SLUVNUCIsIkhNUy1QLUhSSU5BLVJXIiwiSE1TLVAtSUItUlciLCJIUi1QLVRLLU1HVC1SVyIsIkdMLVAtRVAtUlciLCJITVMtQVBJLVNVTS1SVyIsIkhNUy1QLUNDR0FTLVJXIiwiSE1TLVAtRk9SLVIiLCJITVMtQVBJLUlYUkFZLVIiLCJITVMtUC1IVkNDLVIiLCJITVMtUC1DQ1VQQi1SVyIsIkhNUy1BUEktSUNULVIiLCJITVMtUC1GT1ItUlciLCJITVMtUC1EUi1SVyIsIkhNUy1QLVNVTS1SIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtTUhDUi1SVyIsIkhNUy1BUEktSU1SSS1SVyIsIkhNUy1QLURQUkQtUlciLCJIUi1QLUxFVi1FTVAtUlciLCJITVMtUC1HUFJBLVJXIiwiSE1TLVAtU0RVSS1SVyIsIkhNUy1BUEktSVVTRy1SIiwiSE1TLVAtRERBU0giLCJITVMtUC1QQ0QtUlciLCJITVMtUC1PQ1ItUlciLCJITVMtUC1NSFBDSy1SVyIsIkhNUy1QLUNDR0FILVJXIiwiSE1TLVAtUE9MLVJXIiwiSE1TLVAtUE8tUlciLCJITVMtQVBJLURSTS1SVyIsIkhNUy1QLU9TLVJXIiwiSE1TLVAtVklOUi1SIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtR1JOQS1SVyIsIkhNUy1QLUhSSU4tUiIsIkhNUy1QLUlQREItUlciLCJITVMtUC1IUklOLVJXIiwiSE1TLVAtQ1NJTC1SVyIsIkhNUy1QLVNVTUQtUlciLCJITVMtUC1DQ0dSQi1SVyIsIkhNUy1QLU9UTUUtUlciLCJITVMtUC1ERkNSLVIiLCJITVMtUC1HUk4tUlciLCJITVMtUC1PVE0tUiIsIkhSLVAtUk9TLU1HVC1SIiwiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiSE1TLVAtQU1ELVJXIiwiSE1TLVAtVlYtUiIsIkhNUy1QLUlQQS1SVyIsIkhNUy1QLUFEQVNIIiwiSE1TLVItQSJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzYsMSwxNDUsNSwyMDMsMjA1LDEwLDcsMTUsNTgsNTksMTQsMTIzLDE2LDE3LDEzNiwxMTYsMTE3LDIxMiwyMTMsMjAsMjEsOSw1NSwxMzAsMTUyLDIwMCwzMiwxNTUsMTkyLDMzLDM0LDM2LDM1LDE1NCwxNjcsMTcwLDE3MSwxOTMsMTk0LDIwNiwyMTUsMTk1LDQzLDEwMSw0NSwxMDAsMTEwLDEyNCwxMjUsMjE2LDQ3LDQ4LDUzLDU0LDExMSwxOTYsMTk3LDIwMSwyMDIsMTI3LDEyOCwxNTEsMTY0LDE0MywxNDQsMTQ2LDE0NywxNjAsMTYxLDE2MiwxNjMsMTY1LDNdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDYiLCJPTEVUMDAyIiwiT0xFVDAwMSIsIk9MRVQwMDQiLCJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzk1NDE2Njg2LCJleHAiOjE3OTU1MDM2ODZ9.OD4uXsPBXjHnTZRWgmvLctEY8hhCiN_wu0LNb4WHzo8RB69yT_kkUIGzXltcMsFphXT_SMvW2tjlOZq16yN8sZd_9u68Z-9xidWoOvW8saYpLIRwrPkeGg0dxYdHMIpX1LeqkG8luHFqCrWBO2SIR0ZG8AbDou5WIoXSDzzRq91bU-24veK01owP8ivnf1gNEn-58ObQ0-RGeYj1Xm9HYrJInWaZMhTi8jaE6ZDMmC5ASAgtJsVzUvO0b8S2xocTTqvjl4NrWPIKeEZTutd7kR5LUvH05IuMP6OgLQhF6xdoy5yAzTWNSR7mvNsJfAZ9wf5YU_FPxTDcXctCgPOx6A";

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
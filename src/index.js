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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJITVMiLCJlbWFpbCI6IiIsIm5hbWUiOiJITVMgKEFsbCBQZXJtaXNzaW9ucykiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtQ0wtUlciLCJITVMtUC1HUk5SLVJXIiwiSE1TLUFQSS1JQi1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJITVMtQVBJLUFNQS1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtUE9BLVJXIiwiSE1TLVItQSIsIkhNUy1QLVBTQi1SVyIsIkhNUy1BUEktQUlBLVJXIiwiSE1TLVAtQ1RJQS1SVyIsIkhNUy1QLVBSQS1SVyIsIkhNUy1BUEktSVhSQVktUiIsIkhNUy1QLVJTSEZURC1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtV1ItUlciLCJITVMtUC1TR1JOIiwiSE1TLVAtRk9SLVJXIiwiSE1TLVAtU1JNLVJXIiwiSE1TLVAtUERCLVJXIiwiSE1TLVAtUk9SLVJXIiwiSE1TLVAtUEdTLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtR1JOQS1SVyIsIkhNUy1QLVBPLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1ETy1SVyIsIkhNUy1QLU1STC1SVyIsIkhNUy1QLVBHTEJVLVJXIiwiSE1TLVAtU0dSTi1SVyIsIkhNUy1BUEktREFTSCIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLVJCSUxMIiwiSE1TLVAtRERBU0giLCJITVMtUC1QQy1SVyIsIkhNUy1QLUNDLVJXIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1HQURNLVJXIiwiSE1TLVAtTUhDRC1SVyIsIkhNUy1BUEktSU1SSS1SVyIsIkhNUy1QLUdSTi1SVyIsIkhNUy1QLVBHU1JELVJXIiwiSE1TLUFQSS1TUk0tUlciLCJITVMtUC1NUkEtUlciLCJITVMtUC1QTUMtUlciLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1BUEktSUItUiIsIkhNUy1QLUlQS0ctUiIsIkhNUy1QLUJULVJXIiwiSE1TLVAtUElOLVJXIiwiSE1TLVAtUFJMLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLVNSR1BELVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1TUkJELVJXIiwiSE1TLVAtU0dMQS1SVyIsIkhNUy1QLVBHRUItUlciLCJITVMtUC1MTkQtUlciLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtUFBELVJXIiwiSE1TLUFQSS1JTVJJLVIiLCJITVMtUC1QRkItUlciLCJITVMtUC1OUy1SVyIsIkhNUy1BUEktSVQiLCJITVMtUC1QT0wtUlciLCJITVMtUC1QQ0JfUlciLCJITVMtUC1DVEktUlciLCJITVMtUC1QQVMtUlciLCJITVMtUC1TVEEtUlciLCJITVMtUC1HUFJBLVJXIiwiSE1TLVAtQUEtUlciLCJITVMtQVBJLUlYUkFZLVJXIiwiSE1TLVAtUFNJUC1SVyIsIkhNUy1QLU9QSCIsIkhNUy1QLURCVURSLVIiLCJITVMtUC1WTkQtUlciLCJITVMtUC1EUi1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1BUEktRExELVJXIiwiSE1TLUFQSS1JVVNHLVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLVJFTlEtUlciLCJITVMtUC1QU0gtUlciLCJITVMtUC1QU00tUlciLCJITVMtUC1PUFNSQkQtUlciLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtSUNELVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLUZPUi1SIiwiSE1TLUFQSS1BTVItUlciLCJITVMtUC1BRE1ELVJXIiwiSE1TLVAtTVItUlciLCJITVMtUC1QRVItUlciLCJITVMtQVBJLVNBTS1SVyIsIkhNUy1QLU1ULVJXIiwiSE1TLUFQSS1TVU0tUiIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLUFQSS1JQ1QtUlciLCJITVMtUC1QSS1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtQ0NELVJXIiwiSE1TLVAtUFItUlciLCJITVMtQVBJLURSTS1SIiwiSE1TLVAtUENELVJXIiwiSE1TLVAtQVNSLVJXIiwiSE1TLUFQSS1JVVNHLVIiLCJITVMtUC1EUk0tUlciLCJITVMtUC1BREFTSCIsIkhNUy1QLUFETUwtUlciLCJITVMtQVBJLVNBTVQtUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1JUERCLVJXIiwiSE1TLUFQSS1TVU0tUlciLCJITVMtQVBJLUlDVC1SIiwiSE1TLVAtU1QtUlciLCJITVMtUC1QR1BCVC1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1BUEktSVQtUlciLCJITVMtUC1DQ0MtUlciLCJITVMtUC1SS0lULVJXIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLVJDQVQtUlciLCJITVMtUC1STUQtUlciLCJHUC1QLUdDTi1SIiwiSE1TLUFQSS1EUk0tUlciLCJITVMtUC1PQ1ItUlciLCJITVMtUC1QSFZTQi1SVyIsIkhNUy1QLVNEVUktUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOls2LDcsOCw5LDI5LDE3MiwxLDIsMTEyLDE0NSw0LDI2LDUwLDI3LDUyLDUxLDI4LDUsMjAzLDIwNSwxMCwxMSwxMywxNSw1OCw1OSwxNCwxMjIsMTIzLDE2LDE3LDEyMCwxMjEsMTMzLDEzNCwxMzUsMTAyLDEzNiwxMzcsMTM4LDExNSwxMTYsMTE3LDExOCwxOCwxOSwyMCwyMSwyMDQsNTUsMzEsMTMwLDMwLDQ0LDMsMzIsMTU1LDE5MiwzMywzNCwzNiwzNSwxNTMsMTU0LDE2NywxNzAsMTcxLDE5MywxOTQsMzcsMzgsMzksMTU2LDE1NywxNTgsMTAxLDQ1LDEwMCwxMTAsMTI0LDEyNSw0OSw1Myw1NCwxMTEsMTk2LDE5NywyMDEsMjAyLDEyNiwxMjcsMTI4LDEyOSwxNjMsMTU5XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDA0IiwiT0xFVDAwNiIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzkzODczMTU5LCJleHAiOjE3OTM5NjAxNTl9.TDZeT6rz1fUE6vK0vrXu0FT5tKOFUDk6FLVYB90v0w4CADBcxfIcvF7C3J1m2UW0bDwTTEGOTH5mD17I2ZK732KuqrlNWONUEhT9jGhif-yVEEscKc2SIi_AeCCdAiFiWW7Qvm71qhVPgGBOSj0kilGTdbgqJxTYc7EfNTO29FZzZAKNXE8igalU5VGSKnsZNjsyWAbPD_GNqEVje6rgyety49RyZmpZLCjtcohjPGHHM5cs_r_v-T9IAvdRiVA5AzGus7Vx6ETH3sa6WeHUwZm-_nU9hQP9hR3kSdPQ0Ikq71AWx1ImVQlj6zwLnU2bVNKasjSEugUG4gwPRMwYlw";
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
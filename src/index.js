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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJITVMiLCJlbWFpbCI6IiIsIm5hbWUiOiJITVMgKEFsbCBQZXJtaXNzaW9ucykiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtRFJNLVJXIiwiSE1TLVAtT1RJUi1SVyIsIkhSLVAtUFJNLUVNUC1SVyIsIkhNUy1QLUNTTE0tUlciLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtREZDQSIsIkhNUy1QLUNDLVJXIiwiSE1TLVAtUEVSLVJXIiwiSE1TLVAtTUhDRC1SVyIsIkhNUy1QLUhSSU5QLVJXIiwiSE1TLVAtREZDRSIsIkhNUy1QLVBTSC1SVyIsIkhNUy1QLUNDQy1SVyIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1ETy1SVyIsIkhNUy1QLVNHUk4tUlciLCJHTC1QLUJELVIiLCJITVMtUC1ST1ItUlciLCJITVMtQVBJLVdUU0FQLVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiSE1TLUFQSS1JVVNHLVJXIiwiSFItUC1QUk0tRU1QLVIiLCJITVMtUC1ERkMtUlciLCJITVMtUC1DQ0QtUlciLCJITVMtUC1WTkQtUlciLCJITVMtQVBJLUlNUkktUiIsIkZSLUFQSS1GUi1SVyIsIkhNUy1QLUlDRC1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLU9USVJFLVJXIiwiSE1TLVAtT1RNLVJXIiwiSE1TLVAtSVBLRy1SIiwiSE1TLUFQSS1TVU0tUiIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLU1IQ1MtUlciLCJIUi1QLUxFVi1DRkctUlciLCJITVMtUC1PVE1CRS1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1QLVBPQS1SVyIsIkNOLUFQSS1DVC1SIiwiSE1TLVAtQU1FLVJXIiwiSE1TLVAtT1RTU0EtUlciLCJHUC1QLUdDTi1SIiwiSE1TLUFQSS1JVCIsIkhNUy1BUEktRU1MLVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIkhNUy1BUEktRFJNLVIiLCJITVMtUC1CVC1SVyIsIkhNUy1QLUFTUi1SVyIsIkhNUy1QLUNDQ1JCLVJXIiwiSE1TLVAtT1RTU1UtUlciLCJITVMtUC1BSU4tUiIsIkdMLVAtRVAtUiIsIkhNUy1QLVNHUk4iLCJITVMtQVBJLVJELVIiLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1QSS1SVyIsIkhNUy1QLU9UTUQtUlciLCJITVMtUC1DQ1BSUC1SVyIsIkhNUy1BUEktSVQtUlciLCJITVMtQVBJLUlCLVJXIiwiSE1TLVAtQ0NHUlAtUlciLCJITVMtUC1JQi1SIiwiSE1TLUFQSS1VSElELVIiLCJIUi1QLVBBWS1TTElQLVIiLCJITVMtUC1DU0xELVJXIiwiSE1TLVAtUEMtUlciLCJITVMtUC1DVElBLVJXIiwiSE1TLUFQSS1JQi1SIiwiSE1TLVAtSE1TIiwiSE1TLUFQSS1JWFJBWS1SVyIsIkhNUy1BUEktSUNULVJXIiwiSFItUC1USy1NR1QtUiIsIkhNUy1QLU9UTUItUlciLCJITVMtUC1BTS1SVyIsIkhNUy1QLVZOREQtUlciLCJIUi1QLUxFVi1FTVAtUiIsIkhNUy1QLUNDSVBBQi1SVyIsIkhNUy1QLUFNLVIiLCJITVMtUC1BQS1SVyIsIkhNUy1QLUNMLVJXIiwiSE1TLVAtQ1NMUi1SVyIsIkhNUy1QLU1IUFNELVJXIiwiSFItUi1FTVAiLCJITVMtUC1IUklOQS1SVyIsIkhNUy1QLUlCLVJXIiwiSFItUC1USy1NR1QtUlciLCJHTC1QLUVQLVJXIiwiSE1TLUFQSS1TVU0tUlciLCJITVMtUC1DQ0dBUy1SVyIsIkhNUy1QLUZPUi1SIiwiSE1TLUFQSS1JWFJBWS1SIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtQVBJLUlDVC1SIiwiSE1TLVAtT1RTU0QtUlciLCJITVMtUC1GT1ItUlciLCJITVMtUC1EUi1SVyIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLU1IQ1ItUlciLCJITVMtQVBJLUlNUkktUlciLCJITVMtUC1EUFJELVJXIiwiSFItUC1MRVYtRU1QLVJXIiwiSE1TLVAtR1BSQS1SVyIsIkhNUy1QLVNEVUktUlciLCJITVMtQVBJLUlVU0ctUiIsIkhNUy1QLUREQVNIIiwiSE1TLVAtUENELVJXIiwiSE1TLVAtT0NSLVJXIiwiSE1TLVAtTUhQQ0stUlciLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLVBPLVJXIiwiSE1TLUFQSS1EUk0tUlciLCJITVMtUC1PUy1SVyIsIkhNUy1QLUNDR01QQi1SVyIsIkhNUy1QLUdSTkEtUlciLCJITVMtUC1IUklOLVIiLCJITVMtUC1PVE1CRC1SVyIsIkhNUy1QLUlQREItUlciLCJITVMtUC1IUklOLVJXIiwiSE1TLVAtQ1NJTC1SVyIsIkhNUy1QLURGQy1SIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1PVE1FLVJXIiwiSE1TLVAtREZDUi1SIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtT1RNLVIiLCJITVMtUC1PVFNTLVJXIiwiSFItUC1ST1MtTUdULVIiLCJITVMtUC1HUk5SLVJXIiwiSE1TLVAtT1RJUkQtUlciLCJITVMtUC1PVFNTLVIiLCJITVMtUC1QQ09QUC1SVyIsIkhNUy1QLU9UU1NFLVJXIiwiSE1TLVAtQU1ELVJXIiwiSE1TLVAtSVBBLVJXIiwiSE1TLVAtQURBU0giLCJITVMtUi1BIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbNiwxLDE0NSw1LDIwMywyMDUsMTAsNywxNSw1OCw1OSwxNCwxMjMsMTYsMTcsMTM2LDExNiwxMTcsMjEyLDIxMywyMSw5LDU1LDEzMCwyMDAsMzIsMTU1LDE5MiwzMywzNCwzNiwzNSwxNTQsMTY3LDE3MCwxNzEsMTkzLDE5NCwyMDYsMjE1LDQzLDEwMSwxMDAsMTI0LDEyNSwyMTYsNDcsNDgsNTMsNTQsMTExLDE5NiwxOTcsMjAxLDIwMiwxMjcsMTI4LDE1MCwxNTEsMTQzLDE0NCwxNDYsMTQ3LDE2MCwxNjEsMTYyLDE2MywxNjUsNDldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDYiLCJPTEVUMDAyIiwiT0xFVDAwMSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc5NTU4MTAzMSwiZXhwIjoxNzk1NjY4MDMxfQ.QxFsxrB15WDFc3swbYYauKfpDTWGxXjciSCjvpAL1-A2OGVxLIyrATytrxbFi8UoSdINkk007nm2NtHQJuBkrmkszYsSmq2IPFd2MszeLOYPWr7CPnkYo074c5-izVVj7tz-Jtl0yBWcJFraexZMJSJb7QsglJEyGNs8UMxkbKFax1ltLa6FfR8thO4x6N8NbLFENum9IZHDbKftCcXos0W2LJgpu9QSDTn7t4kzrp3oMYjVXOHYG1wMYVwg9mYTz8QWDiG1wX4jnpKObSXD4PmCyo-qarP8YlcDy8MfnuVEMz5KpmLNCSJatTTzJeiDyxjHMJEQm2jb8dH0YyuOVg";

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
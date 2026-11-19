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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJITVMiLCJlbWFpbCI6IiIsIm5hbWUiOiJITVMgKEFsbCBQZXJtaXNzaW9ucykiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtRFJNLVJXIiwiSFItUC1QUk0tRU1QLVJXIiwiSE1TLVAtQ1NMTS1SVyIsIkhNUy1BUEktRExELVIiLCJITVMtUC1DQy1SVyIsIkhNUy1QLVBFUi1SVyIsIkhNUy1QLU1IQ0QtUlciLCJITVMtUC1IUklOUC1SVyIsIkhNUy1QLURCVURSLVIiLCJITVMtUC1QU0gtUlciLCJITVMtUC1DQ0MtUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtRE8tUlciLCJITVMtUC1TR1JOLVJXIiwiR0wtUC1CRC1SIiwiSE1TLVAtUk9SLVJXIiwiSE1TLUFQSS1XVFNBUC1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIkhNUy1BUEktSVVTRy1SVyIsIkhSLVAtUFJNLUVNUC1SIiwiSE1TLVAtSFZDQy1SVyIsIkhNUy1QLU1SRC1SIiwiSE1TLVAtVlMtUiIsIkhNUy1QLUlCRS1SVyIsIkhNUy1QLUNDRC1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1BUEktSU1SSS1SIiwiRlItQVBJLUZSLVJXIiwiSE1TLVAtSUNELVJXIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtT1RNLVJXIiwiSE1TLUFQSS1TVU0tUiIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLU1IQ1MtUlciLCJIUi1QLUxFVi1DRkctUlciLCJITVMtUC1HUFItUlciLCJITVMtUC1NUkQtUlciLCJITVMtUC1QT0EtUlciLCJDTi1BUEktQ1QtUiIsIkhNUy1QLUFNRS1SVyIsIkdQLVAtR0NOLVIiLCJITVMtQVBJLUlUIiwiSE1TLUFQSS1FTUwtUlciLCJITVMtQVBJLVNJTlRFTlRBLVJXIiwiSE1TLUFQSS1EUk0tUiIsIkhNUy1QLUJULVJXIiwiSE1TLVAtQVNSLVJXIiwiSE1TLVAtQ0NDUkItUlciLCJHTC1QLUVQLVIiLCJITVMtUC1TR1JOIiwiSE1TLUFQSS1SRC1SIiwiSE1TLVAtVkktUiIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIkhNUy1QLVBJLVJXIiwiSE1TLVAtT1RNRC1SVyIsIkhNUy1QLUNDUFJQLVJXIiwiSE1TLUFQSS1JVC1SVyIsIkhNUy1BUEktSUItUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSFItUC1QQVktU0xJUC1SIiwiSE1TLVAtQ1NMRC1SVyIsIkhNUy1QLVBDLVJXIiwiSE1TLVAtQ1RJQS1SVyIsIkhNUy1BUEktSUItUiIsIkhNUy1QLUhNUyIsIkhNUy1BUEktSVhSQVktUlciLCJITVMtQVBJLUlDVC1SVyIsIkhSLVAtVEstTUdULVIiLCJITVMtUC1BTS1SVyIsIkhNUy1QLVZOREQtUlciLCJIUi1QLUxFVi1FTVAtUiIsIkhNUy1QLUNDSVBBQi1SVyIsIkhNUy1QLUFNLVIiLCJITVMtUC1BQS1SVyIsIkhNUy1QLUNMLVJXIiwiSE1TLVAtQ1NMUi1SVyIsIkhNUy1QLU1IUFNELVJXIiwiSE1TLVAtSUJELVJXIiwiSFItUi1FTVAiLCJITVMtUC1IUklOQS1SVyIsIkhNUy1QLUlCLVJXIiwiSFItUC1USy1NR1QtUlciLCJHTC1QLUVQLVJXIiwiSE1TLUFQSS1TVU0tUlciLCJITVMtUC1DQ0dBUy1SVyIsIkhNUy1QLUZPUi1SIiwiSE1TLUFQSS1JWFJBWS1SIiwiSE1TLVAtSFZDQy1SIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtQVBJLUlDVC1SIiwiSE1TLVAtRk9SLVJXIiwiSE1TLVAtRFItUlciLCJITVMtUC1DVEktUlciLCJITVMtUC1NSENSLVJXIiwiSE1TLUFQSS1JTVJJLVJXIiwiSE1TLVAtRFBSRC1SVyIsIkhSLVAtTEVWLUVNUC1SVyIsIkhNUy1QLUdQUkEtUlciLCJITVMtUC1TRFVJLVJXIiwiSE1TLUFQSS1JVVNHLVIiLCJITVMtUC1EREFTSCIsIkhNUy1QLVBDRC1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLU1IUENLLVJXIiwiSE1TLVAtQ0NHQUgtUlciLCJITVMtUC1QT0wtUlciLCJITVMtUC1QTy1SVyIsIkhNUy1BUEktRFJNLVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1WSU5SLVIiLCJITVMtUC1DQ0dNUEItUlciLCJITVMtUC1HUk5BLVJXIiwiSE1TLVAtSFJJTi1SIiwiSE1TLVAtSVBEQi1SVyIsIkhNUy1QLUhSSU4tUlciLCJITVMtUC1DU0lMLVJXIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1PVE1FLVJXIiwiSE1TLVAtREZDUi1SIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtT1RNLVIiLCJIUi1QLVJPUy1NR1QtUiIsIkhNUy1QLUdSTlItUlciLCJITVMtUC1QQ09QUC1SVyIsIkhNUy1QLUFNRC1SVyIsIkhNUy1QLVZWLVIiLCJITVMtUC1JUEEtUlciLCJITVMtUC1BREFTSCIsIkhNUy1SLUEiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOls2LDEsMTQ1LDUsMjAzLDIwNSwxMCw3LDE1LDU4LDU5LDE0LDEyMywxNiwxNywxMzYsMTE2LDExNywyMTIsMjEzLDIwLDIxLDksNTUsMTMwLDE1MiwyMDAsMzIsMTU1LDE5MiwzMywzNCwzNiwzNSwxNTQsMTY3LDE3MCwxNzEsMTkzLDE5NCwyMDYsMjE1LDE5NSw0MywxMDEsNDUsMTAwLDExMCwxMjQsMTI1LDIxNiw0Nyw0OCw1Myw1NCwxMTEsMTk2LDE5NywyMDEsMjAyLDEyNywxMjgsMTUxLDE2NCwxNDMsMTQ0LDE0NiwxNDcsMTYwLDE2MSwxNjIsMTYzLDE2NV0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNiIsIk9MRVQwMDIiLCJPTEVUMDAxIiwiT0xFVDAwNCIsIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3OTUwNjQxNTcsImV4cCI6MTc5NTE1MTE1N30.Py9YYs0z3-cu4H6b1P1KppUeD9_feq07f5W5xuznX3AuXN_pdA3iDBUE22oMajdmKKqQjrkVJE9OFQD3KacwIipujWhbmGa0quOxEnG6C-1AtJiUdtHhQolDDKUfhnzeTgMJTAggITc3mM9kU4wFQzhOtckB3VA44mkQmqC2UZf0BTDVNHJmT6Y7yJzazacw3XQSwG0XAkEzLUf3ihWj-Y3SbUHAsOSIBNz__3SvGlX8Jtp8CwdoFvjVLbntgg3QRGmL2wI_aDOsYwznWCZwYweoXzFz7lpQF2cbAgI9yJcBdDEdTxLQM6C-gxibOKZX7zMzbpA-aFGvShBp3AgEgw";

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
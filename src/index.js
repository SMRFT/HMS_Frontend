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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJITVMtUC1ESVMtUlciLCJITVMtUC1BRE1MLVJXIiwiSE1TLUFQSS1EQVNIIiwiSE1TLVAtT1BFTVJHUy1SVyIsIkhNUy1QLVNVTS1SVyIsIkhNUy1QLU9QRU1SR00tUlciLCJNREMtQVBJLUxCTi1SIiwiSE1TLVAtT1BFTVJHRC1SVyIsIkhNUy1QLVNVTUEtUlciLCJITVMtUC1QRkItUlciLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtUE1DLVJXIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtUC1QR1MtUlciLCJITVMtQVBJLUlUIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtRFJNLVJXIiwiSE1TLVAtSVBIIiwiTURDLUFQSS1BVC1SIiwiSE1TLVAtUFItUlciLCJNREMtQVBJLUdBUy1SIiwiTURDLVAtUkVHLVJXIiwiSE1TLVAtQlQtUiIsIk1EQy1QLVVBUy1SVyIsIkhNUy1BUEktQUlBLVJXIiwiTURDLVAtQVNNLVJXIiwiSE1TLVAtT1BFTVJEQy1SVyIsIkhNUy1QLVBEQi1SVyIsIk1EQy1SLVJFQyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1HUFItUlciLCJITVMtUC1TVC1SVyIsIk1EQy1QLVJERS1SVyIsIkhNUy1QLU1ULVJXIiwiSE1TLVAtSVBFTVItUlciLCJNREMtQVBJLUFULVJXIiwiSE1TLVAtUEktUlciLCJITVMtUC1PUEgiLCJITVMtUC1JQ0QtUlciLCJITVMtUC1QUkwtUlciLCJITVMtUC1JQkUtUlciLCJITVMtUC1PQ1ItUlciLCJITVMtUC1HUk5SLVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtU0FETS1SVyIsIkhNUy1QLUFTUi1SVyIsIkhNUy1QLU9QRU1SR1AtUlciLCJHUC1QLUdDTi1SIiwiSE1TLVAtSUItUiIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1TVEEtUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1PVE1FLVJXIiwiSE1TLUFQSS1JVC1SVyIsIk1EQy1QLVJFRy1SIiwiSE1TLUFQSS1TQU1ULVJXIiwiTURDLVAtUFRFLVJXIiwiTURDLUFQSS1DRFItUiIsIkhNUy1QLUJURS1SVyIsIkhNUy1QLVBHRUItUlciLCJITVMtUC1PUEVNUlBULVJXIiwiSE1TLVAtT1BFTURELVJXIiwiSE1TLVAtU1JNLVJXIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtUFNHLVJXIiwiSE1TLUFQSS1TUk0tUlciLCJITVMtUC1HUFJBLVJXIiwiSE1TLUFQSS1ETEQtUlciLCJITVMtUC1QRVItUlciLCJITVMtUC1TRFAtUlciLCJITVMtUC1QQ0ItUlciLCJITVMtUC1QU0gtUlciLCJITVMtUC1CVC1SVyIsIk1EQy1QLUVGLVJXIiwiTURDLUFQSS1SVFMtUiIsIk1EQy1QLUdEVFMtUlciLCJNREMtQVBJLVJETC1SVyIsIkhNUy1QLVBBUy1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtUFNNLVJXIiwiTURDLUFQSS1USFItUiIsIkhNUy1QLU9QRU1SVkUtUlciLCJITVMtUC1JUERCLVJXIiwiSE1TLUFQSS1FTUwtUlciLCJITVMtUC1JUEtHLVIiLCJNREMtUC1EUy1SVyIsIkhNUy1QLUJURC1SVyIsIkhNUy1QLUFETUQtUlciLCJNREMtUC1PU0ItUlciLCJITVMtUC1QUEQtUlciLCJITVMtUC1QSUQtUlciLCJNREMtUC1UUkItUlciLCJITVMtQVBJLUFNQS1SVyIsIkhNUy1QLUdSTkEtUlciLCJITVMtQVBJLVVISUQtUiIsIkhNUy1QLVNHTEEtUlciLCJITVMtQVBJLVNBTS1SVyIsIk1EQy1QLVBOUC1SVyIsIk1EQy1QLVBOUC1SIiwiSE1TLVAtT1RNRC1SVyIsIk1EQy1QLUdBRC1SVyIsIkhNUy1QLVZOREQtUlciLCJITVMtUC1PVE0tUlciLCJITVMtUC1JQi1SVyIsIkhNUy1QLVNVTS1SIiwiTURDLUFQSS1QQVQtUiIsIkhNUy1QLVNEVUktUlciLCJITVMtUC1QSFZTQi1SVyIsIk1EQy1QLUdBVC1SVyIsIk1EQy1QLVNPUi1SIiwiSE1TLVAtSUJELVJXIiwiTURDLVAtQ0EtUlciLCJITVMtUC1EQi1SVyIsIkhNUy1QLU9UTS1SIiwiSE1TLVAtU0dSTi1SVyIsIkhNUy1QLVBHTEJVLVJXIiwiSE1TLVAtUFNJUC1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1BUEktQU1SLVJXIiwiTURDLVAtQUQtUlciLCJITVMtUC1SQklMTCIsIkhNUy1QLVNVTUQtUlciLCJITVMtUC1QTy1SVyIsIk1EQy1BUEktUEFUIiwiTURDLVAtUE5QUi1SIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIkhNUy1QLU9TLVJXIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLVBTQi1SVyIsIkhNUy1QLUhNUyIsIkhNUy1QLVNHUk4iLCJNREMtUC1DREUtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxLDIsMyw0LDExMiwxNzIsNiw4LDUsMTAsMTEsMTMsMTUsMTQsMTIyLDE2LDE3LDEzMywxMzQsMTM1LDEwMiwxMzYsMTE1LDExNiwxMTcsMTE4LDE4LDE5LDIwLDIxLDMxLDQ0LDE3MCwxNzEsMTkwLDMyLDE1NSwxOTIsMzMsMzQsMzYsMzUsMTUzLDE1NCwxNjcsMTkzLDE5NCwzNywzOCwzOSwxNTYsMTU3LDE1OCwxMDEsMTczLDE4OCwxODksMTEwLDQ3LDQ5LDExMSwxOTYsMTk3LDEyNywxMjgsMTI5LDE0NCwxNjYsMTY5LDIwM10sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzkzNTk2OTA3LCJleHAiOjE3OTM2ODM5MDd9.BlnOaUVC4UtVRvRW4O-P0uK3xFSetEiWyAfAjs5CI4TQZodqu3ditMb2hT7YELmXeqgt0vcjH57NqdAnofn6N4lmL-axJFlWOEcLbn6z8rwpVyPqFEqGYxm5YkMjGFAR1W4PmPQS6EVf3fcePxIrInE9O0kFwj6FrbG48bPhIsqX9Oup54CYjzAKEJvqhFs2cRJexOm1Uy8yP45EEcanzdSZUSRItnijL33RBfiEmKC7XoF8hdOGYSA6i3cukxGQDwM2dZQN0zcG2lLs_bfQi94YSRhwo6HQJ-9ZbBVlNnyaOHk4R98Lk7uN1_xWap5KnkydkOj2TrSiTSf3LGQBzA";
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
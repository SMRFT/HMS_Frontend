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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJjaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkNOLUFQSS1DVC1SIiwiSE1TLVAtQ1NMTS1SVyIsIlNULVAtTlRGLVJXIiwiSE1TLVAtUFNCLVJXIiwiSFItUC1MRVYtQ0ZHLVJXIiwiSE1TLVAtQ1RJQS1SVyIsIlNJTi1QLUdETC1SIiwiRVItUC1FUlZCLVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtUENPUFAtUlciLCJITVMtUC1QREItUlciLCJITVMtUC1UQkNTLVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUNDUFJQLVJXIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtUC1QR1MtUlciLCJITVMtUC1ITVMiLCJTVC1QLVRETC1SVyIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLVBHTEJVLVJXIiwiRVItUC1FUlVTLVJXIiwiSE1TLVAtQ1NMUi1SVyIsIkhSLVAtTEVWLUVNUC1SVyIsIkhSLVAtUFJNLUVNUC1SIiwiU1QtQVBJLUNSRC1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIlNULVItQSIsIkhNUy1QLUNDR1JQIiwiSE1TLVAtTUhDRC1SVyIsIkhSLVAtTEVWLUFQUi1SVyIsIlNULVAtVERMLVIiLCJIUi1QLVJPUy1NR1QtUlciLCJITVMtUC1QR1NSRC1SVyIsIkhSLVAtUk9TLU1HVC1SIiwiSFItUC1BVFQtQVBSLVIiLCJITVMtUC1QTUMtUlciLCJITVMtUC1DU0lMLVJXIiwiSE1TLVAtTUhDUi1SVyIsIkhNUy1QLUJULVJXIiwiU1QtUC1DTVQtUlciLCJITVMtUC1TUkdQRC1SVyIsIlNJTi1QLUNIRS1SVyIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLVAtU1JCRC1SVyIsIkhNUy1QLVBHRUItUlciLCJTSU4tUC1DSEVBLVJXIiwiSFItUC1QQVktU0xJUC1SIiwiSE1TLVAtUFBELVJXIiwiU1QtUC1ERVMtUiIsIkhNUy1QLVBGQi1SVyIsIkVSLVAtRVJHQVMtUlciLCJITVMtUC1QQ0JfUlciLCJIUi1QLVBSTS1FTVAtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1DQ1VQQiIsIkhNUy1QLVBBUy1SVyIsIkhNUy1QLUNUSS1SVyIsIlNJTi1SLUNIRSIsIkhSLVAtTEVWLUFQUi1SIiwiSE1TLVAtUFNJUC1SVyIsIkhNUy1QLUNDR1JCIiwiR0wtUC1FUC1SVyIsIkhNUy1QLU9QSCIsIkhNUy1BUEktRExELVJXIiwiSE1TLVAtTUhQU0QtUlciLCJITVMtUC1QU00tUlciLCJITVMtUC1DQ0lQQUItUlciLCJIUi1QLUFUVC1BUFItUlciLCJITVMtUC1PUFNSQkQtUlciLCJITVMtUC1NSENTLVJXIiwiSE1TLVAtQ0NHQUgtUlciLCJITVMtUC1TSURFQkFSIiwiSFItUC1QUk0tQVBSLVJXIiwiU1QtUC1TTk8tUlciLCJHTC1QLUVQLVIiLCJITVMtUC1UU1NSLVJXIiwiRVItUC1FUkdQUi1SVyIsIkhSLVAtVEstTUdULVIiLCJFUi1SLUVSUCIsIlNULVAtQ01ULVIiLCJITVMtUC1DQ0NSQiIsIkVSLVAtRVJTRC1SVyIsIlNJTi1BUEktR0lDLVIiLCJITVMtUC1TMzYwLVJXIiwiSE1TLVAtQ1NMRC1SVyIsIkhSLVAtTEVWLUVNUC1SIiwiSFItUC1QUk0tQVBSLVIiLCJTVC1QLUJSRC1SIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtUC1DQ0dNUEItUlciLCJIUi1QLVRLLU1HVC1SVyIsIkhSLVItSE9EIiwiSE1TLVAtQ0NDLVJXIiwiRVItUC1FUlAtUiIsIlNULUFQSS1CUkQtUlciLCJIUi1QLUFUVC1SRVAtUiIsIlNULUFQSS1BTUMtUlciLCJHUC1QLUdDTi1SIiwiU1QtUC1ERVMtUlciLCJITVMtUC1QSFZTQi1SVyIsIkhNUy1QLUNDR0FTLVJXIiwiR0wtUC1CRC1SIiwiSE1TLVAtTUhQQ0stUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOls1LDEwLDEzLDE4LDE5LDMxLDQzLDEwMSwxMTAsMTI3LDEyOCwxMjksMTQ2LDE0NywxNjAsMTYxLDE2MiwxNjMsMTY1LDE1OSwxOTEsMTk5XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDAxIiwiT0xFVDAwMiIsIk9MRVQwMDQiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3OTM0MzU4NDgsImV4cCI6MTc5MzUyMjg0OH0.TV_FeyujpQWZ8Mb5n5BYDCdS2vD4k6ZpfQx3Emx1zQ2aGt9KDldBdG2ZBg88di3S3rMuM7wx9KmW1Rzv3MwXiu66V5NTwt_yl7mUoQIcBYQGeasmg89AhgLnV_PS8NcDOZgEMRP-72Xe2Rc-Y5nvLsGoSDSBvSQZSczdVMOjEVCKCH6Q7nlpLKR0oln8UZUVlBJ-QCxywxA5Ia6nP0jkmJ_6WXAkeU2hGQpINzAy_cJ4v1_0Wq3LytyYIZN_kvV83VWf3-fyhuoL8oiaBx898-rYZgOjzPj3Df8Gn3ng4wY6WG4c7VnKLoU-zcg36L_hhXxnX2QNxkvgVqW6idOAUg";
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
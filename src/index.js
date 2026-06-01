import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

// console.log("=== HMS INDEX.JS DEBUG ===");
// console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLURSTS1SIiwiSE1TLVAtT1BQQi1SIiwiR0wtUC1FQlQtUlciLCJITVMtUC1QQ0NTRF9SVyIsIkhNUy1QLU9TLVJXIiwiSE1TLVAtRERTLVJXIiwiTURDLUFQSS1QR1AtUlciLCJITVMtUC1TT1BFLVJXIiwiU1QtUi1BIiwiSE1TLVAtUE9QUERCLVJXIiwiTURDLUFQSS1QREMtUlciLCJITVMtUC1DQ0dBSC1SIiwiU1QtUi1DRFIiLCJITVMtUC1WTC1SVyIsIkhNUy1QLVNPUEItUlciLCJITVMtUC1TVU1ELVJXIiwiSE1TLVAtUEZCLVJXIiwiSE1TLVAtQ0NTUFNELVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1QLVNJREVCQVIiLCJTSU4tUi1TVEEiLCJTVC1BUEktQlJELVJXIiwiTURDLVAtR0NQLVIiLCJITVMtUC1QR0VCLVIiLCJITVMtUC1CTEstUiIsIkhNUy1QLUNDTUJQQi1SVyIsIkdMLVAtRUQtUlciLCJITVMtUC1TVU1FLVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtUFNHLVJXIiwiU0lOLUFQSS1JRi1SVyIsIkhNUy1QLVBPUFVBUy1SVyIsIkhNUy1QLUlCLVIiLCJFUi1QLUVSVVMtUlciLCJNREMtUC1HQVAtUiIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1DQ0dBSC1SVyIsIk1EQy1QLVBOUFItUiIsIkhNUy1QLUdXTC1SIiwiSE1TLVAtUElQQS1SVyIsIkhNUy1QLUFBLVJXIiwiU0lOLUFQSS1PUlItUiIsIlNULVAtVERMLVIiLCJITVMtUC1QSFZTQi1SVyIsIlNULVAtTlRGLVIiLCJITVMtUC1TVEEtUlciLCJTVC1BUEktQ1JELVJXIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtUC1IU04tUlciLCJITVMtUC1HTEJVLVIiLCJITVMtUC1QQ09QUC1SVyIsIkhNUy1QLVNVTS1SVyIsIkhNUy1QLVBTTS1SVyIsIk1EQy1QLUFBVS1SVyIsIk1EQy1BUEktU0dQLVJXIiwiSE1TLVAtUFNPUEItUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUi1QSCIsIk1EQy1BUEktQVQtUiIsIkVSLVAtRVJQLVIiLCJITVMtUC1SQ0FULVIiLCJITVMtUC1QT1BTUi1SVyIsIkdMLVAtUC1SVyIsIkhNUy1QLUdPUFMtUiIsIkVSLVAtRVJTRC1SVyIsIlNJTi1BUEktU0YtUiIsIkhNUy1QLUNDUFJQLVJXIiwiTURDLUFQSS1BR1AtUlciLCJITVMtUC1QR1BCVC1SIiwiU1QtQVBJLUFNQy1SVyIsIlNULVAtU05PLVJXIiwiSE1TLVAtQ0VCLVJXIiwiTURDLVAtR09QLVIiLCJITVMtUC1QT1BTUkJELVJXIiwiR0wtUC1FUC1SVyIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLVAtR09QQk4tUiIsIlNULVAtREVTLVJXIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1BRE0tUlciLCJITVMtUC1QR1MtUlciLCJFUi1SLUVSUCIsIkhNUy1QLVNVTS1SIiwiSE1TLVAtUEdBUy1SIiwiU0lOLVAtR0RMLVIiLCJITVMtUC1QUEQtUiIsIkhNUy1QLUNPUFAtUlciLCJTSU4tQVBJLU9SLVJXIiwiR0wtUC1OREMtUlciLCJITVMtUC1QR0xCVS1SIiwiSE1TLVAtU1QtUlciLCJITVMtUC1DQ09QUEItUlciLCJTVC1QLUNNVC1SIiwiU1QtUC1UREwtUlciLCJTVC1QLUJSRC1SIiwiSE1TLVAtQ0NDLVJXIiwiU0hJLVAtVFJBSU4tUlciLCJITVMtUC1QTUMtUlciLCJTSEktUC1JTkMiLCJNREMtUi1QREMiLCJTVC1BUEktRU1QLVIiLCJITVMtUC1XUlEtUlciLCJHTC1QLUFORC1SVyIsIkhNUy1BUEktRExELVJXIiwiR0wtUC1FTC1SVyIsIk1EQy1QLUdTUC1SIiwiRVItUC1FUlZCLVJXIiwiSE1TLVAtR0xCVC1SIiwiSE1TLVAtU1VNQS1SVyIsIlNULVAtTlRGLVJXIiwiTURDLUFQSS1PR1AtUlciLCJITVMtUC1QU1JCRC1SVyIsIlNULVAtQ01ULVJXIiwiU1QtUC1ERVMtUiIsIkVSLVAtRVJHQVMtUlciLCJITVMtUC1DUy1SVyIsIkhNUy1QLUdQQlQtUiIsIkdMLVAtRUFELVJXIiwiRVItUC1FUkdQUi1SVyIsIk1EQy1QLUdQUC1SIiwiSE1TLVAtRExELVJXIiwiSE1TLVAtR0FFLVIiLCJITVMtUC1DQ08tUlciLCJITVMtUC1QQ0ItUlciLCJITVMtUC1PUEgiLCJITVMtUC1DQ0dBUy1SVyIsIlNISS1QLUVYUC1SVyIsIkhNUy1QLUNDR1BCLVJXIiwiR0wtUC1SU0UtUlciLCJTSU4tUC1HSUMtUiIsIk1EQy1BUEktQ0dQLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtQ0NHU1JEX1JXIiwiSE1TLVAtQ0NDUkItUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOls1LDEwMSwxMCw0MywxOCwxOSwxMTQsNTUsM10sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3ODAyODI2ODcsImV4cCI6MTc4MDM2OTY4N30.FBVbBcuRERheEe8mkPU8VC0ANUezY8r-w4nuNbm2YOhyF2NmluT1blkDTOh28tlOgCvCOJMpX1eWkZZIeWCL_uUWQxp94HF7NA690FC3oad-4ESYBQwSc-qCZxHK1ZYLux6ydy1FHijOyc_IodglSkNypHCj4UMBlJbfz-CTahlprQ-xOX_XjHhc0TBq1OezXaTnGhrD3PBcFJpopkQc6SNxUo_HPhgh2INCzeqkrgdAC8b5XKida_9SaJVKp9Vv7DjX8YuZvTvf-p_-cVoNfHuUcUYcBJfrPDvDtcp9OvJxS6SddvuFCrHNogmZccgxfSbI-_uIGr2M-HMUpZvJXA"
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
  const selectedOutlet = "OLET002";
  localStorage.setItem("selected_outlet", selectedOutlet);
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

// --- Main execution ---
(function main() {
  try {
    // console.log("Starting token validation...");

    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");
    // console.log("Access token from localStorage exists:", !!accessToken);

    // If no token found, try development token
    if (!accessToken) {
      console.log(
        "❌ No token found in localStorage, trying development token",
      );
      accessToken = setforlocaldev();
    }

    // If still no token (development token is empty), redirect to login
    if (!accessToken || accessToken.trim() === "") {
      // console.log("❌ No valid token available, redirecting to login");
      localStorage.removeItem("access_token"); // Clean up
      redirectToLogin();
      return; // Stop execution here
    }

    // Validate the token
    const userPayload = validate(accessToken);
    // console.log("✅ Token validated successfully");
    // console.log("Decoded token payload:", userPayload);

    // Store the valid token and user information
    localStorage.setItem("access_token", accessToken);

    // Extract user information from token payload
    const employeeId = userPayload.aud; // Using 'aud' field as ID
    const name = userPayload.name;
    const userEmail = userPayload.email;

    const userRole = getUserRole(userPayload["allowed-actions"]);

    // console.log("Employee ID:", employeeId);
    // console.log("Name:", name);
    // console.log("Email:", userEmail);
    // console.log("User Role:", userRole);

    // Check if we have required data
    const isLoggedIn = !!(employeeId && name);
    // console.log("Is logged in:", isLoggedIn);

    if (!isLoggedIn) {
      throw new Error(
        "Missing required user data (employeeId or employeeName)",
      );
    }

    // Store user payload and extracted information for app usage
    localStorage.setItem("user_payload", JSON.stringify(userPayload));
    localStorage.setItem("employeeId", employeeId);
    localStorage.setItem("name", name);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("allowed-outlets", userPayload["allowed-outlets"]);
    localStorage.setItem(
      "hms_pages",
      JSON.stringify(userPayload["hms_pages"] || []),
    );
    localStorage.setItem("role", userRole);

    localStorage.setItem(
      "allowedActions",
      JSON.stringify(userPayload["allowed-actions"] || []),
    );

    // console.log("✅ User payload and extracted data stored in localStorage");
    // console.log("Stored data:", {
    //   employeeId,
    //   name,
    //   userEmail,
    //   role: userRole,
    // });

    // Token is valid, render app
    // console.log("✅ Rendering lab app...");
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    reportWebVitals();
  } catch (error) {
    console.error("❌ Token validation failed:", error.message);

    // Clean up invalid token
    localStorage.removeItem("access_token");

    // If validation fails, redirect to login instead of showing debug page
    console.log("❌ Redirecting to login due to validation failure");
    redirectToLogin();
  }
})();

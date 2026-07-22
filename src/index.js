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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUNDUFJQLVJXIiwiSE1TLVAtUE9QVUFTLVJXIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiSE1TLVAtU1VNRC1SVyIsIlNELVAtQkEtUlciLCJITVMtUC1QUEQtUlciLCJITVMtUC1DU0xNLVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUC1DQ1NQU0QtUlciLCJNREMtQVBJLVBBVCIsIkhNUy1QLUNDR1NSRF9SVyIsIkhNUy1QLVBTUkJELVJXIiwiSE1TLVAtR09QQk4tUiIsIlNELVAtTEdFLVJXIiwiSE1TLVAtUERCLVJXIiwiU0QtUC1HU1AtUiIsIk1EQy1QLUdEVFMtUlciLCJITVMtUC1QR1NSRC1SVyIsIk1EQy1QLUFELVJXIiwiSE1TLVAtU09QQi1SVyIsIlNELVAtU1AtUiIsIlNELVAtU1ZGLVJXIiwiSE1TLVAtQ09QUC1SVyIsIkhNUy1QLUNDVVBCLVJXIiwiU0QtUC1MUkMtUiIsIkhNUy1QLVNSR1BELVJXIiwiSE1TLVAtUEdQQlQtUiIsIlNELUFQSS1UTS1SVyIsIkhNUy1QLVBQRC1SIiwiTURDLUFQSS1QQVQtUiIsIkhNUy1QLUFETUwtUlciLCJNREMtUC1VQVMtUlciLCJTRC1QLUxQSS1SIiwiSE1TLVAtT1MtUlciLCJITVMtUC1TVU1FLVJXIiwiU0QtUC1VUEItUlciLCJITVMtUC1CTEstUiIsIkhNUy1QLVBTT1BCLVJXIiwiTURDLUFQSS1SREwtUlciLCJITVMtQVBJLURMRC1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiTURDLVAtUkVHLVJXIiwiU0QtQVBJLUNOLVIiLCJITVMtUC1QTUMtUlciLCJITVMtUC1DQ08tUlciLCJNREMtQVBJLVJUUy1SIiwiSE1TLVAtUFNNLVJXIiwiSE1TLVAtUkNBVC1SIiwiSE1TLVAtUEdBUy1SIiwiSE1TLVAtQ1RJQS1SVyIsIk1EQy1BUEktQVQtUiIsIk1EQy1QLVRSQi1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLUNDSVBBQi1SVyIsIkhNUy1QLUdBRS1SIiwiSE1TLVAtUENDU0RfUlciLCJNREMtUC1BU00tUlciLCJITVMtUC1DQ0dBUy1SVyIsIk1EQy1SLVJFQyIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1BQS1SVyIsIkhNUy1QLURSTS1SIiwiSE1TLVAtUElQQS1SVyIsIkhNUy1QLU5TRC1SVyIsIk1EQy1QLUVGLVJXIiwiU0QtQVBJLVNTLVJXIiwiSE1TLVAtQ0NHQUgtUiIsIkhNUy1QLVNVTS1SVyIsIk1EQy1QLUNERS1SVyIsIkhNUy1QLUNTLVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtUEREUy1SVyIsIkhNUy1QLUNDR1BCLVJXIiwiSE1TLVAtUEFTLVJXIiwiSE1TLVAtUFNJUC1SVyIsIkhNUy1QLURCIiwiSE1TLVAtSUItUiIsIk1EQy1QLVJERS1SVyIsIkhNUy1QLUhTTi1SVyIsIkhNUy1QLVNVTUEtUlciLCJITVMtUC1DVEktUlciLCJITVMtUC1TVEEtUlciLCJITVMtUi1QSCIsIlNELVAtU0hGLVJXIiwiU0QtQVBJLVRELVIiLCJTRC1QLVBGLVJXIiwiSE1TLVAtUEZCLVJXIiwiTURDLUFQSS1HQVMtUiIsIkhNUy1QLVdSUS1SVyIsIkdQLVAtR0NOLVIiLCJNREMtQVBJLUNEUi1SIiwiSE1TLVAtT1BQQi1SIiwiSE1TLVAtUE9QU1JCRC1SVyIsIlNELVAtUkItUlciLCJTRC1QLVNTLVJXIiwiTURDLVAtUE5QUi1SIiwiU0QtUC1MQkYtUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLVNVTS1SIiwiSE1TLVAtUE9QUERCLVJXIiwiSE1TLVAtR0xCVS1SIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1TUkJELVJXIiwiU0QtUC1CVEQtUlciLCJTRC1QLVNJUi1SVyIsIlNELVAtR1BCLVIiLCJITVMtUC1PUEgiLCJNREMtQVBJLUFULVJXIiwiTURDLVAtUE5QLVJXIiwiU0QtUC1TQy1SIiwiSE1TLVAtQ0NHQUgtUlciLCJTRC1BUEktUkItUiIsIlNELVAtUEctUlciLCJNREMtUC1HQUQtUlciLCJNREMtUC1PU0ItUlciLCJNREMtUC1SRUctUiIsIkhNUy1QLVBHUEJULVJXIiwiSE1TLVAtUFNCLVJXIiwiSE1TLVAtUEdMQlUtUiIsIlNELVAtU0dBQy1SIiwiU0QtUC1MQ0MtUlciLCJITVMtUC1QQ0JfUlciLCJTRC1QLUJHLVJXIiwiSE1TLVAtR09QUy1SIiwiSE1TLVAtR1BCVC1SIiwiSE1TLVAtQ1NJTC1SVyIsIkhNUy1QLUNERFMtUlciLCJTRC1SLVNFIiwiU0QtUC1HUEQtUiIsIk1EQy1BUEktTEJOLVIiLCJITVMtUC1EQlVEUi1SIiwiSE1TLVAtUENCLVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1ITVMiLCJNREMtUC1QVEUtUlciLCJTRC1QLVBPVi1SVyIsIkhNUy1QLU9QU1JCRC1SVyIsIkhNUy1QLUdMQlQtUiIsIkhNUy1QLVBHRUItUlciLCJITVMtUC1HV0wtUiIsIlNELVAtTEJOLVIiLCJITVMtUC1QR0VCLVIiLCJITVMtUC1TT1BFLVJXIiwiSE1TLVAtUEdMQlUtUlciLCJNREMtUC1HQVQtUlciLCJNREMtQVBJLVRIUi1SIiwiSE1TLVAtQ1NMRC1SVyIsIkhNUy1QLVZMLVJXIiwiSE1TLVAtQURNLVJXIiwiU0QtUC1MQkwtUlciLCJITVMtUC1QT1BTUi1SVyIsIk1EQy1QLVNPUi1SIiwiSE1TLVAtSVBIIiwiSE1TLVAtUEhWU0ItUlciLCJITVMtUC1TVC1SVyIsIkhNUy1QLVBHUy1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIkhNUy1QLUNFQi1SVyIsIkhNUy1QLUNDQ1JCLVJXIiwiU0QtUC1QQi1SVyIsIk1EQy1QLUNBLVJXIiwiSE1TLVAtRExELVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMTI4LDEyOSwzLDUsMTAsMTgsMTksMjgsNDMsNDQsNDUsNTAsNTUsMTAxLDEwMiwxMTMsMTE0LDEyNywxNDYsMTQ3XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4NDY5MjYxOCwiZXhwIjoxNzg0Nzc5NjE4fQ.WPqtb4dW_grv6NZxrP2GYMa8ZvQ4YfbX0WQk2VV_bD-2OtyAaLsQHkMu9kNEZS8qaUkjSj2Bv9bgeOFNisZii5twpC_AjQdczqW8teKq7bcfCTP4xBpBSKsDhynsVDen43PBkMQAHkB38B_6F4jnWLm77w9Ktmmr9ulfc5-aXJtGK2hEFxWMf4QsRIYUo3EGYV1dB4CmBo0v6ohBeAxAToVaxt8Q668lM64PepHwpxmh_r73Phv1Vf0Qu4G7wbeiTarUxQ5MMO8VcXpr36eYQ-1TARZXpG7wqvk2NHASiidnE8D0zuF1-3bhp5wh76T0lw0q_ucdRkQdfPHz6aHg"
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

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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUNDUFJQLVJXIiwiSE1TLVAtUE9QVUFTLVJXIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiSE1TLVAtU1VNRC1SVyIsIkhNUy1QLVBQRC1SVyIsIkhNUy1QLUNTTE0tUlciLCJITVMtUC1DQ1NQU0QtUlciLCJITVMtUC1DQ0dTUkRfUlciLCJITVMtUC1QU1JCRC1SVyIsIkhNUy1QLUdPUEJOLVIiLCJITVMtUC1MQlJJLVJXIiwiSE1TLVAtUERCLVJXIiwiSE1TLVAtUEdTUkQtUlciLCJITVMtUC1TT1BCLVJXIiwiSE1TLVAtQ09QUC1SVyIsIkhNUy1QLUNDVVBCLVJXIiwiSE1TLVAtU1JHUEQtUlciLCJITVMtUC1QR1BCVC1SIiwiSE1TLVAtUFBELVIiLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1TVU1FLVJXIiwiSE1TLVAtQkxLLVIiLCJITVMtUC1QU09QQi1SVyIsIkhNUy1BUEktRExELVJXIiwiSE1TLVAtUENPUFAtUlciLCJITVMtUC1QTUMtUlciLCJITVMtUC1DQ08tUlciLCJITVMtUC1QU00tUlciLCJITVMtUC1SQ0FULVIiLCJITVMtUC1QR0FTLVIiLCJITVMtUC1DVElBLVJXIiwiSE1TLVAtUFNHLVJXIiwiSE1TLVAtQ0NJUEFCLVJXIiwiSE1TLVAtR0FFLVIiLCJITVMtUC1QQ0NTRF9SVyIsIkhNUy1QLUNDR0FTLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtRFJNLVIiLCJITVMtUC1QSVBBLVJXIiwiSE1TLVAtTlNELVJXIiwiSE1TLVAtU1VNLVJXIiwiSE1TLVAtQ0NHQUgtUiIsIkhNUy1QLUNTLVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtUEREUy1SVyIsIkhNUy1QLUNDR1BCLVJXIiwiSE1TLVAtUEFTLVJXIiwiSE1TLVAtUFNJUC1SVyIsIkhNUy1QLURCIiwiSE1TLVAtSUItUiIsIkhNUy1QLUhTTi1SVyIsIkhNUy1QLVNVTUEtUlciLCJITVMtUC1DVEktUlciLCJITVMtUC1TVEEtUlciLCJITVMtUi1QSCIsIkhNUy1QLVBGQi1SVyIsIkhNUy1QLVdSUS1SVyIsIkdQLVAtR0NOLVIiLCJITVMtUC1PUFBCLVIiLCJITVMtUC1QT1BTUkJELVJXIiwiSE1TLVAtQ0NHUlAtUlciLCJITVMtUC1TVU0tUiIsIkhNUy1QLVBPUFBEQi1SVyIsIkhNUy1QLUdMQlUtUiIsIkhNUy1QLUNDR1JCLVJXIiwiSE1TLVAtU1JCRC1SVyIsIkhNUy1QLUNTTFItUlciLCJITVMtUC1PUEgiLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLVBHUEJULVJXIiwiSE1TLVAtUFNCLVJXIiwiSE1TLVAtUEdMQlUtUiIsIkhNUy1QLVBDQl9SVyIsIkhNUy1QLUNTSUwtUlciLCJITVMtUC1HT1BTLVIiLCJITVMtUC1HUEJULVIiLCJITVMtUC1DRERTLVJXIiwiSE1TLVAtREJVRFItUiIsIkhNUy1QLVBDQi1SVyIsIkhNUy1QLU5TLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtT1BTUkJELVJXIiwiSE1TLVAtR0xCVC1SIiwiSE1TLVAtUEdFQi1SVyIsIkhNUy1QLUdXTC1SIiwiSE1TLVAtUEdFQi1SIiwiSE1TLVAtU09QRS1SVyIsIkhNUy1QLVBHTEJVLVJXIiwiSE1TLVAtQ1NMRC1SVyIsIkhNUy1QLVZMLVJXIiwiSE1TLVAtQURNLVJXIiwiSE1TLVAtUE9QU1ItUlciLCJITVMtUC1JUEgiLCJITVMtUC1QSFZTQi1SVyIsIkhNUy1QLUxCREktUlciLCJITVMtUC1TVC1SVyIsIkhNUy1QLVBHUy1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIkhNUy1QLUNFQi1SVyIsIkhNUy1QLUNDQ1JCLVJXIiwiSE1TLVAtRExELVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMTI4LDEyOSwzLDUsMTAsMTgsMTksMTQ2LDE0NywyOCw0Myw0NCw0NSw1MCw1NSwxMDEsMTAyLDExMywxMTQsMTI3LDE0OCwxNDldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg1ODIxMzQ4LCJleHAiOjE3ODU5MDgzNDh9.frxNmWOHVJJhAPWDsCma8MdHKFFQRcmF5c8kGC5c76KREISzdnYcybz1Xl8QA1W71w4rbhv7hUwRsgkMlv24VEt973LoXV6g-mgF0ebxmX4ln0XGFzSMHekDJodGnuiH5Dqapzf3rp58gOwwBHJsG-IJDJvm_wvlA0nvpJr0n8pN5dTehDg5FZOFqFS5C6vOFXJmxOiU36G4jV8BRCTx0hlXWOqlg62Xh_BMzgQea0zyKwHHXYws2K8atdqMbgYVnT1yRM2MUxdiZoz_4DXAQz3vAepYYAoQ60lzE1ygWT6NSApUcyCbNeK2_7Kw7_iEyzX8QF7oqzUYffbLaMNIHA";
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

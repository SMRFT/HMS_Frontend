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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLU9QU1JCRC1SVyIsIkdMLVAtRUQtUlciLCJITVMtUC1SQ0FULVIiLCJITVMtUC1DQ1NQU0QtUlciLCJITVMtUC1TVU0tUlciLCJTVC1BUEktQlJELVJXIiwiRVItUC1FUlAtUiIsIkVSLVAtRVJWQi1SVyIsIk1EQy1SLVBEQyIsIkhNUy1QLUNDR1JCLVJXIiwiSE1TLVAtUEZCLVJXIiwiU0lOLUFQSS1PUi1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtQ09QUC1SVyIsIkhNUy1QLUFBLVJXIiwiU0lOLVAtR0RMLVIiLCJNREMtUC1HT1AtUiIsIkhNUy1QLVBQRC1SIiwiSE1TLVAtUEdBUy1SIiwiSE1TLVAtQ0NPLVJXIiwiSE1TLVAtV1JRLVJXIiwiSE1TLVAtR0xCVC1SIiwiSE1TLVAtUE9QUERCLVJXIiwiSE1TLUFQSS1ETEQtUlciLCJITVMtUC1DQ0MtUlciLCJITVMtUC1JQi1SIiwiSE1TLVAtT1MtUlciLCJNREMtUC1BQVUtUlciLCJITVMtUC1QRERTLVJXIiwiSE1TLVAtU1QtUlciLCJITVMtUC1DVElBLVJXIiwiSE1TLVAtR1dMLVIiLCJITVMtUC1TT1BCLVJXIiwiSE1TLVAtT1BQQi1SIiwiSE1TLVAtUEFTLVJXIiwiSE1TLVAtUElQQS1SVyIsIkhNUy1QLVBHUy1SVyIsIkdMLVAtRVAtUlciLCJNREMtUC1HQVAtUiIsIkhNUy1QLVNPUEUtUlciLCJITVMtUC1QR0VCLVIiLCJITVMtUC1QTUMtUlciLCJITVMtUC1DQ1VQQi1SVyIsIlNULVItQ0RSIiwiSE1TLVAtU1VNQS1SVyIsIkhNUy1QLVBTUkJELVJXIiwiSE1TLVAtQ0VCLVJXIiwiSE1TLVAtQ0NQUlAtUlciLCJITVMtUC1DRERTLVJXIiwiSE1TLVAtU1VNRC1SVyIsIkhNUy1QLVBPUFVBUy1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiRVItUC1FUkdQUi1SVyIsIkVSLVAtRVJHQVMtUlciLCJITVMtUC1DQ0dNUEItUlciLCJITVMtUC1ETEQtUlciLCJITVMtUC1ITVMiLCJITVMtUC1TVU1FLVJXIiwiSE1TLVAtQ0NJUEFCLVJXIiwiSE1TLVAtR0FFLVIiLCJFUi1QLUVSU0QtUlciLCJITVMtUC1WTC1SVyIsIkhNUy1QLVBIVlNCLVJXIiwiSE1TLVAtQ0NHU1JEX1JXIiwiTURDLUFQSS1TR1AtUlciLCJNREMtQVBJLUFHUC1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiR0wtUC1QLVJXIiwiSE1TLVAtRFJNLVIiLCJHTC1QLUFORC1SVyIsIkhNUy1QLVBDQl9SVyIsIkhNUy1QLUdPUFMtUiIsIkhNUy1QLUdMQlUtUiIsIk1EQy1BUEktT0dQLVJXIiwiSE1TLVAtU1RBLVJXIiwiTURDLUFQSS1QREMtUlciLCJITVMtUC1IU04tUlciLCJNREMtQVBJLVBHUC1SVyIsIkhNUy1QLVBDQi1SVyIsIlNJTi1BUEktU0YtUiIsIkhNUy1SLVBIIiwiU1QtUC1TTk8tUlciLCJITVMtUC1DQ0dBUy1SVyIsIkdMLVAtTkRDLVJXIiwiRVItUi1FUlAiLCJHUC1QLUdDTi1SIiwiU1QtUC1UREwtUlciLCJITVMtUC1QUEQtUlciLCJTVC1QLUNNVC1SVyIsIkhNUy1QLVBHU1JELVJXIiwiSE1TLVAtQ0NHQUgtUiIsIlNISS1QLVRSQUlOLVJXIiwiTURDLVAtR1BQLVIiLCJITVMtUC1QREItUlciLCJTVC1QLURFUy1SIiwiSE1TLVAtQ1MtUlciLCJITVMtUC1QQ0NTRF9SVyIsIlNJTi1SLVNUQSIsIkhNUy1QLVNVTS1SIiwiSE1TLVAtUFNHLVJXIiwiU1QtQVBJLUFNQy1SVyIsIkhNUy1QLVBTTS1SVyIsIlNULVAtVERMLVIiLCJITVMtUC1DQ09QUEItUlciLCJTSEktUC1FWFAtUlciLCJITVMtUC1DQ0dBSC1SVyIsIlNJTi1BUEktT1JSLVIiLCJITVMtUC1EQiIsIkdMLVAtRUJULVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLVBHUEJULVIiLCJITVMtUC1PUEgiLCJITVMtUC1DQ0dQQi1SVyIsIkhNUy1QLVBPUFNSQkQtUlciLCJTVC1BUEktRU1QLVIiLCJITVMtUC1HT1BCTi1SIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtUFNPUEItUlciLCJNREMtQVBJLUFULVIiLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtQkxLLVIiLCJITVMtUC1QR0xCVS1SVyIsIkdMLVAtRUwtUlciLCJFUi1QLUVSVVMtUlciLCJITVMtUC1DVEktUlciLCJTSU4tUC1HSUMtUiIsIkhNUy1QLVBHTEJVLVIiLCJITVMtUC1QT1BTUi1SVyIsIkhNUy1QLVNSQkQtUlciLCJITVMtUC1QU0lQLVJXIiwiR0wtUC1FQUQtUlciLCJTVC1QLUJSRC1SIiwiU1QtUC1OVEYtUlciLCJHTC1QLVJTRS1SVyIsIkhNUy1QLVBHUEJULVJXIiwiSE1TLVAtUEdFQi1SVyIsIlNJTi1BUEktSUYtUlciLCJNREMtUC1HU1AtUiIsIkhNUy1QLUlQSCIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLVAtU1JHUEQtUlciLCJITVMtUC1BRE1MLVJXIiwiU1QtQVBJLUNSRC1SVyIsIkhNUy1QLUdQQlQtUiIsIlNULVAtQ01ULVIiLCJTVC1SLUEiLCJITVMtUC1BRE0tUlciLCJTSEktUC1JTkMiLCJITVMtUC1QU0ItUlciLCJNREMtUC1HQ1AtUiIsIkhNUy1QLUNDTUJQQi1SVyIsIkhNUy1QLUNDQ1JCLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMTI4LDEyOSwzLDUsMTAxLDEwMiwxMCw0Myw0NCwxMTMsMTgsMTksMTE0LDU1LDEyN10sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAxIiwiT0xFVDAwMiIsIk9MRVQwMDMiLCJPTEVUMDA0Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzgyMDk4NjU5LCJleHAiOjE3ODIxODU2NTl9.Lk5xjSRjncI0I7cZF7tMPVFQXnR1dGCG9iFiuVZoCM81trAZVBxJSpoVpO9y3dvWQptDe9MS6AQATqjM3e1zr5Dc8L6tQ5PB5-tY2vQr10nw372QmACwBKebQneZACJq-wGjkVFNNarwxVxCGUYHaGcwtVbmqB_HK0huzG45vWUfEcffZ9rR4aPwUn5P_UXAokw5SbQaxgARdcmZNGiLbxm4b5EweUeDDI6LgVsAvvC5uQaStVjJxUyrxBHvxfct3cLtVgjnqydvBFzCsCoxeTSVwEsfXCP6orOkhwcBhwFuyOSeg3nAwXPhuGgbi-_9a-MrxmXE51vY4MfTv3S0Sw"
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
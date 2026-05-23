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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiRVItUi1FUk4iLCJITVMtUC1QSUQtUlciLCJITVMtUC1PUy1SVyIsIk1EQy1QLVJFRy1SVyIsIlNELVAtR1BELVIiLCJNREMtQVBJLUdBUy1SIiwiTURDLUFQSS1QR1AtUlciLCJITVMtUC1QQy1SVyIsIk1EQy1BUEktUERDLVJXIiwiU0QtUC1CVEQtUlciLCJITVMtUC1HUk5BLVJXIiwiU0QtQVBJLVJCLVIiLCJITVMtUC1DQy1SVyIsIkhNUy1BUEktUEFDSy1SIiwiU0QtUC1MVE0tUlciLCJITVMtUC1SU0hGVC1SVyIsIkdQLVAtR0NOLVIiLCJTRC1QLUxCTi1SIiwiTURDLVAtQVNNLVJXIiwiU1QtUi1IT0QiLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtQ0NELVJXIiwiSE1TLVAtREIiLCJTVC1BUEktQlJELVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUC1HUk4iLCJTRC1QLVNTLVIiLCJNREMtUC1HQ1AtUiIsIlNELVAtVVBCLVJXIiwiU0QtQVBJLVRELVIiLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVJLSVQtUlciLCJNREMtUC1QTlAtUlciLCJTRC1QLUJBLVJXIiwiU0QtUC1MUEktUiIsIk1EQy1BUEktQVQtUlciLCJTRC1QLUxSQy1SIiwiSE1TLVAtSVBIIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1QQ0QtUlciLCJFUi1QLUVSUkVQLVJXIiwiTURDLVAtR0FQLVIiLCJNREMtQVBJLUFETS1SVyIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1STUQtUlciLCJITVMtUC1HUk4tUlciLCJNREMtUC1QTlBSLVIiLCJITVMtUC1BQS1SVyIsIlNELVAtUkItUlciLCJTRC1QLVBHLVJXIiwiU1QtUC1UREwtUiIsIlNELVAtR1BCLVIiLCJNREMtQVBJLVJUUy1SIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUhNU1BTIiwiU1QtQVBJLUNSRC1SVyIsIkhNUy1QLVNUQS1SVyIsIkhNUy1QLVBPTC1SIiwiTURDLVAtQUFVLVJXIiwiTURDLUFQSS1TR1AtUlciLCJNREMtQVBJLVJETC1SVyIsIk1EQy1BUEktVEhSLVIiLCJNREMtQVBJLUFULVIiLCJITVMtUC1ITVNQUy1SVyIsIkhNUy1QLVJTREQtUlciLCJFUi1QLUVSUEItUlciLCJTRC1QLVNQLVIiLCJTRC1QLUxCQy1SVyIsIkhNUy1QLVJDQVRELVJXIiwiTURDLVAtT1NCLVJXIiwiRVItUC1FUkRMLVIiLCJTRC1QLUJHLVJXIiwiU0QtUC1QQi1SVyIsIkhNUy1BUEktVUhJRC1SIiwiTURDLUFQSS1BR1AtUlciLCJNREMtUC1UUkItUlciLCJTRC1QLVNDLVIiLCJNREMtUC1SRUctUiIsIkhNUy1QLVJFTlEtUlciLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtUEktUlciLCJNREMtUC1HT1AtUiIsIlNULVAtU05PLVJXIiwiU0QtUC1QT1YtUlciLCJNREMtUi1BRE0iLCJITVMtUC1OUy1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtUk0tUlciLCJITVMtUC1CTEstUlciLCJITVMtUC1WTkQtUlciLCJITVMtUC1CTEtELVJXIiwiTURDLUFQSS1QQVQiLCJITVMtUC1TVC1SVyIsIlNULVAtQ01ULVIiLCJTVC1QLVRETC1SVyIsIkhNUy1QLUdSTkEiLCJNREMtQVBJLVBBVC1SIiwiTURDLUFQSS1MQk4tUiIsIlNULVAtQlJELVIiLCJTRC1BUEktQ04tUiIsIkhNUy1QLVNSTS1SVyIsIlNELVAtUEYtUlciLCJTVC1BUEktRU1QLVIiLCJNREMtUC1HU1AtUiIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtUlNELVJXIiwiU0QtUC1HU1AtUiIsIk1EQy1BUEktQ0RSLVIiLCJTVC1QLU5URi1SVyIsIkhNUy1BUEktREFTSCIsIkhNUy1BUEktVk0iLCJITVMtUC1HQURNLVJXIiwiTURDLUFQSS1PR1AtUlciLCJTVC1QLUNNVC1SVyIsIlNELVItU01DIiwiU1QtUC1ERVMtUiIsIlNELUFQSS1TUy1SVyIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLVJDTE4tUlciLCJITVMtUC1WTkRELVJXIiwiRVItUC1FUlBMLVIiLCJNREMtUC1HUFAtUiIsIkVSLVAtRVJCLVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtT1BIIiwiU0QtUC1TU1UtUlciLCJITVMtUC1OU0QtUlciLCJTRC1QLVNTLVJXIiwiTURDLUFQSS1DR1AtUlciLCJTRC1BUEktVE0tUlciLCJITVMtUC1ITVMiLCJNREMtUC1TT1ItUiIsIkhNUy1BUEktRExELVIiLCJFUi1QLUVSR05CTi1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMiw1LDYsMTAsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjYsMjcsMjgsMjksMzAsNDQsNTAsNTEsNTIsNTUsNTgsNTksMTAyLDEyMiwxMjMsMTIwLDEyMV0sImFsbG93ZWQtb3V0bGV0cyI6W10sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc5NTE4MzM0LCJleHAiOjE3Nzk2MDUzMzR9.G41mgZevvnwMSWImrQmnTRPMZJ2w1udE4G0nmyCA8aHek2YwioptrOtgDkVWCG3a759FVATpUio6Bq6KzPKg19xZWIEVACCI1TpXdar0bhdywqk-SxqqkLQifOAtxtky5ryxXPltQgrAzOXvv8c4YDYLfQggEpLHqWKsn-iSPwh8LeYhp-TjVuLKz4DRRShjVsHvsarwvxAj--qEJIFCH-vj9FDQIIr_Ct166HBUDbvAkPpzDx2FMW1qCLI40s4B1cxiZsN3k4ZUrGkgobIAH6Fy8iU-7j3C_jzEX7gk_7wXJ61SUSEbLp6nFnqbk-gXmDh9lf8Au8uSuAsBTwb4DQ";
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
  const selectedOutlet = "OLET003";
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

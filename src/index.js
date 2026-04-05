import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

console.log("=== HMS INDEX.JS DEBUG ===");
console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtVklOUi1SIiwiTURDLUFQSS1DRFItUiIsIkhNUy1QLUhNUyIsIk1EQy1BUEktUkRMLVJXIiwiTURDLUFQSS1QQVQiLCJITVMtUC1ITVNQUy1SVyIsIkVSLVAtRVJQTC1SIiwiU1QtUC1DTVQtUiIsIkVSLVAtRVJHTkJOLVIiLCJITVMtUC1SQ0FURC1SVyIsIlNULVAtU05PLVJXIiwiSE1TLVAtREIiLCJNREMtUC1SRUctUiIsIkhNUy1QLVZJTi1SVyIsIlNULUFQSS1FTVAtUiIsIk1EQy1QLVRSQi1SVyIsIkhNUy1BUEktSVQtUlciLCJNREMtUC1PU0ItUlciLCJTVC1QLVRETC1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLUhNU1BTIiwiSE1TLVAtR1JOIiwiRVItUC1FUlJFUC1SVyIsIk1EQy1QLUFTTS1SVyIsIk1EQy1BUEktQURNLVJXIiwiSE1TLUFQSS1WTSIsIkhNUy1QLUJMS0QtUlciLCJTVC1QLUJSRC1SIiwiU1QtQVBJLUNSRC1SVyIsIlNULVItSE9EIiwiTURDLVAtR0FQLVIiLCJFUi1QLUVSUEItUlciLCJNREMtQVBJLUNHUC1SVyIsIlNULVAtREVTLVIiLCJITVMtUC1TUk0tUlciLCJITVMtUC1HUk5BIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLVZWLVJXIiwiTURDLUFQSS1HQVMtUiIsIkVSLVAtRVJCLVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUC1BRE0tUlciLCJFUi1QLUVSREwtUiIsIk1EQy1BUEktUlRTLVIiLCJTVC1QLUNNVC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiRVItUi1FUk4iLCJITVMtUC1SU0hGVCIsIk1EQy1QLVBOUFItUiIsIk1EQy1BUEktQVQtUiIsIk1EQy1BUEktUERDLVJXIiwiTURDLUFQSS1QQVQtUiIsIk1EQy1QLUdTUC1SIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIk1EQy1QLVNPUi1SIiwiSE1TLUFQSS1EQVNIIiwiTURDLUFQSS1USFItUiIsIk1EQy1BUEktQVQtUlciLCJNREMtUC1QTlAtUlciLCJNREMtUC1BQVUtUlciLCJITVMtUC1TSURFQkFSIiwiU1QtUC1OVEYtUlciLCJTVC1BUEktQU1DLVJXIiwiTURDLVAtUkVHLVJXIiwiTURDLUFQSS1PR1AtUlciLCJTVC1QLVRETC1SIiwiTURDLVAtR09QLVIiLCJTVC1QLU5URi1SIiwiTURDLVItQURNIiwiSE1TLVAtUk0tUlciLCJNREMtUC1HUFAtUiIsIk1EQy1QLUdDUC1SIiwiTURDLUFQSS1QR1AtUlciLCJNREMtQVBJLUxCTi1SIiwiSE1TLVAtU0dSTi1SVyIsIk1EQy1BUEktU0dQLVJXIiwiR1AtUC1HQ04tUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzIsNSw2LDEwLDE0LDE1LDE2LDE3LDI2LDI3LDI4LDI5LDMwLDMzLDQwLDQxLDQyLDQ0LDQ2LDM2XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzUzNzE2MTksImV4cCI6MTc3NTQ1ODYxOX0.X-ZibcY0_5na40SXE_zTBiULxPReryco6ijv2HvvxWvZkgycF_Hb3nqKVtQoq2G96uA2ofPptLStB65oQHBHnsP5xOlaXC4TYHo6zcgvwZgyvyaF2L7cIJyki_JALa_fpvyy0AXAjqi2w7-R_3ZBFZWpmUYsb_aqNx5MMF85GyzUiZ2toBqdRdyVkc5nKNr42zbD52z8ca8CaoOwYytjVAUHXRCOfBTCN44HUVtqkhM9lvTY0f_M-ave1iRvE5i-Idu96ZJ8GAcaw3LhJwZucqXtWQww76Ai2_D47DZEvS8LQRyo_MPGZkGvpKA-KU23KyvcKwfoCjHmN3w2RNl0RA";
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
  const selectedOutlet = "OLET001";
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
    window.location.href = "https://shinova.in/login";
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
  console.log("Allowed actions:", allowedActions);
  if (allowedActions.includes("HMS-R-SA")) {
    return "Super Admin";
  }
  if (allowedActions.includes("HMS-R-PH")) {
    return "Pharmacist";
  }
  if (allowedActions.includes("HMS-R-NS")) {
    return "Nursing Station";
  }
  else {
    return "Receptionist"; // Default role if none of the specific roles are found
  }
}

// --- Main execution ---
(function main() {
  try {
    console.log("Starting token validation...");

    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");
    console.log("Access token from localStorage exists:", !!accessToken);

    // If no token found, try development token
    if (!accessToken) {
      console.log(
        "❌ No token found in localStorage, trying development token"
      );
      accessToken = setforlocaldev();
    }

    // If still no token (development token is empty), redirect to login
    if (!accessToken || accessToken.trim() === "") {
      console.log("❌ No valid token available, redirecting to login");
      localStorage.removeItem("access_token"); // Clean up
      redirectToLogin();
      return; // Stop execution here
    }

    // Validate the token
    const userPayload = validate(accessToken);
    console.log("✅ Token validated successfully");
    console.log("Decoded token payload:", userPayload);

    // Store the valid token and user information
    localStorage.setItem("access_token", accessToken);

    // Extract user information from token payload
    const employeeId = userPayload.aud; // Using 'aud' field as ID
    const name = userPayload.name;
    const userEmail = userPayload.email;

    const userRole = getUserRole(userPayload["allowed-actions"]);

    console.log("Employee ID:", employeeId);
    console.log("Name:", name);
    console.log("Email:", userEmail);
    console.log("User Role:", userRole);

    // Check if we have required data
    const isLoggedIn = !!(employeeId && name);
    console.log("Is logged in:", isLoggedIn);

    if (!isLoggedIn) {
      throw new Error(
        "Missing required user data (employeeId or employeeName)"
      );
    }

    // Store user payload and extracted information for app usage
    localStorage.setItem("user_payload", JSON.stringify(userPayload));
    localStorage.setItem("employeeId", employeeId);
    localStorage.setItem("name", name);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("allowed-outlets", userPayload["allowed-outlets"]);
    localStorage.setItem("role", userRole);

    localStorage.setItem(
      "allowedActions",
      JSON.stringify(userPayload["allowed-actions"] || []),
    );

    console.log("✅ User payload and extracted data stored in localStorage");
    console.log("Stored data:", {
      employeeId,
      name,
      userEmail,
      role: userRole,
    });

    // Token is valid, render app
    console.log("✅ Rendering lab app...");
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
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

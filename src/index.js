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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDAwMiIsImVtYWlsIjoibmFqbWFzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiTmFqbWEgQi4sIE1TLiwgRE5CLiwiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1ERi1SIiwiU1RSLUFQSS1WTC1SIiwiU1QtUC1DTVQtUiIsIkhNUy1QLUlQR1JOLVJXIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1STUQtUlciLCJTVC1QLVNOTy1SVyIsIkhNUy1SLVNBIiwiU0QtUC1ITVNVQy1SVyIsIlNELVAtUEwtUiIsIlNUUi1QLUlDUy1SIiwiSE1TLVAtVklOLVJXIiwiU1QtQVBJLUVNUC1SIiwiU1RSLVAtVElOUi1SIiwiU1RSLUFQSS1WTC1SVyIsIlNULVAtVERMLVJXIiwiU0QtUC1CQS1SIiwiU1QtUC1ERVMtUlciLCJITVMtUC1BREQtUlciLCJITVMtUC1SRUctUlciLCJTRC1BUEktQ04tUiIsIkhNUy1QLVJDQVQtUlciLCJITVMtUC1CTEstUlciLCJTRC1BUEktVEQtUiIsIlNELVAtU1NVLVJXIiwiU0QtUC1ITVNQQi1SIiwiU1RSLVAtVElOUi1SVyIsIkhNUy1QLVNSVi1SVyIsIkhNUy1QLUlQUFNELVJXIiwiU0QtUC1DSEMtUiIsIkhNUy1QLVZORC1SVyIsIlNELVAtSE1TVEQtUlciLCJTRC1QLUhNU1BCLVJXIiwiU0QtUC1MUEktUiIsIlNELVAtQlRELVJXIiwiU0QtUC1ITVNQUy1SVyIsIkhNUy1QLUJMS0QtUlciLCJITVMtUC1BVUhJRC1SVyIsIlNULVAtQlJELVIiLCJTVFItQVBJLVRJTi1SVyIsIlNULUFQSS1DUkQtUlciLCJTRC1QLVRFLVJXIiwiSE1TLVAtSVhSQVktUlciLCJTVC1SLUhPRCIsIkhNUy1BUEktRFNVTSIsIlNELVAtTEdMRC1SIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLVNVTS1SVyIsIlNELVAtUE9WLVIiLCJTRC1QLUdTUC1SIiwiSE1TLVAtUlNIRlQtUlciLCJTRC1QLVNTLVJXIiwiU0QtUC1TUy1SIiwiSE1TLVAtSVAtUlciLCJTRC1BUEktVE0tUlciLCJTRC1QLVRELVJXIiwiU1QtUC1ERVMtUiIsIlNUUi1BUEktVFJMUi1SIiwiSE1TLVAtRExELVJXIiwiSE1TLVAtU1JNLVJXIiwiSE1TLVAtVkktUlciLCJTVC1BUEktQlJELVJXIiwiU0QtQVBJLU1JUy1SVyIsIlNELVAtQ0hDLVJXIiwiU0QtUC1TSVItUlciLCJTRC1SLUEiLCJITVMtUC1WVi1SVyIsIlNELVAtTUlTLVIiLCJTRC1BUEktR09SLVJXIiwiSE1TLVAtT1BHUk5ELVJXIiwiSE1TLVAtQkVELVJXIiwiU0QtUC1NQlRWLVIiLCJITVMtUC1PUFBTRC1SVyIsIlNELVAtUEItUiIsIlNELUFQSS1JVk0tUiIsIlNELVAtVVBCLVIiLCJITVMtUC1TUlZELVJXIiwiU0QtUC1TQ1UtUlciLCJITVMtUC1EUk0tUlciLCJTRC1QLUxTRC1SVyIsIkhNUy1QLUlQS0ctUlciLCJTRC1QLUxVU0NELVJXIiwiU0QtQVBJLU1CVEQtUlciLCJTRC1QLVRELVIiLCJTRC1BUEktR1ItUlciLCJITVMtUC1BRE0tUlciLCJTVFItUi1BIiwiU1RSLUFQSS1USU4tUiIsIlNELVAtSE1TU1AtUiIsIlNELVAtUEYtUiIsIkhNUy1QLURJUy1SVyIsIlNUUi1BUEktSUwtUiIsIlNELUFQSS1HQy1SVyIsIkhNUy1QLUlQR1JORC1SVyIsIkhNUy1QLUFNLVJXIiwiU1QtUC1DTVQtUlciLCJITVMtUC1WRUwiLCJTRC1QLVNTVS1SIiwiSE1TLVAtT1RNLVJXIiwiU0QtUC1ITVNDUy1SIiwiU0QtUC1ITVNMRC1SIiwiU0QtUC1ITVNTUy1SIiwiSE1TLVAtQkVERC1SVyIsIkhNUy1QLUFJUC1SVyIsIlNELVAtU0dBQy1SIiwiU0QtUC1QRy1SVyIsIlNELUFQSS1WQy1SVyIsIlNUUi1BUEktVFJMLVIiLCJITVMtUC1CVC1SVyIsIkhNUy1QLVZJTlItUlciLCJTRC1QLUhNU1RELVIiLCJTRC1QLUxHTFQtUiIsIlNELVAtVEUtUiIsIlNELUFQSS1HT0MtUlciLCJTVFItQVBJLUlMLVJXIiwiU0QtUC1TR0FDLVJXIiwiU0QtUC1HUEItUlciLCJTRC1BUEktSVZNLVJXIiwiU0QtUC1ERi1SVyIsIlNELVAtTEJOLVIiLCJITVMtUC1SRU5RLVJXIiwiU1RSLUFQSS1UUkwtUlciLCJTRC1QLUxHU0MtUiIsIlNELVAtTUJQRC1SIiwiU0QtUC1ITVNTUC1SVyIsIlNELVAtSE1TR0MtUiIsIlNELUFQSS1HRC1SIiwiU0QtQVBJLVBSLVIiLCJITVMtUC1PUFAtUlciLCJITVMtUC1JQi1SVyIsIkhNUy1QLUlNUkktUlciLCJTRC1QLUhNU1NELVJXIiwiU1QtUC1OVEYtUlciLCJITVMtUC1TQURNLVJXIiwiU0QtUC1NQkRGLVJXIiwiU1QtQVBJLUFNQy1SVyIsIlNELVAtU1ZGLVIiLCJTRC1BUEktVE0tUiIsIlNELVAtVVBCLVJXIiwiU0QtUC1MU0MtUlciLCJTRC1QLUdQRC1SIiwiU0QtUC1TVkYtUlciLCJITVMtUC1JUFBTLVJXIiwiU0QtUC1QRi1SVyIsIlNELVAtTEdELVJXIiwiU0QtQVBJLVJDTC1SVyIsIlNELVAtQlRELVIiLCJTVC1BUEktVFJMUi1SVyIsIlNULVAtVERMLVIiLCJTRC1QLVBPVi1SVyIsIkhNUy1QLUlCIiwiU0QtUC1TSEYtUlciLCJTVC1QLU5URi1SIiwiU0QtQVBJLVRWLVIiLCJTRC1QLUJBLVJXIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtT1BHUk4tUlciLCJITVMtUC1STS1SVyIsIlNELVAtU0hGLVIiLCJTRC1QLVBHLVIiLCJITVMtUC1PUFBTLVJXIiwiU0QtUC1ITVNTUy1SVyIsIkhNUy1QLUlDVC1SVyIsIlNELVAtU0lSLVIiLCJTRC1QLUxTQ0wtUiIsIlNELVAtU0MtUiIsIlNELUFQSS1WUC1SVyIsIlNELVAtQkctUiIsIlNELVAtUEQtUiIsIkhNUy1QLU9UU1MtUlciLCJITVMtUC1JVVNHLVJXIiwiU0QtQVBJLVJCLVIiLCJTRC1QLVBCLVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1MUkMtUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIiwiU0hCMDAyIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6bnVsbCwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzUxMDU4OTUsImV4cCI6MTc3NTE5Mjg5NX0.dMTnmgmFojWvsvVaJShHeMSDeYuSnITxf_z_3R4kWKEEGKuhN4IT95KI5K4liKU3-O3Jzi5iGSYNajQQCA-lGqsnBj_DwtanNivTl7vP1IJODdjUU2rbZAsQmJHFNCqUOc3CJkzyjVkq-wNH6QX5sGLBgSoomXGkQJkQUFc397bv2jbTEknl1De7ED_eZEyGq4HdVWd2hvQaD9hYMtpnCEZWArynVf1e0__CGN8km7QfAQYlUVMcg6BV69gc3JAug6HriuItB7ieoDR5rPlJdpTs2VSBnn1TJ6P28jYbCwIiENvdodgE-MCyKG5z2wwRlmw";
  console.log(
    "🔧 Development token is empty - will redirect to login",
    dev_token,
  );
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
    localStorage.setItem("hms_pages", JSON.stringify(userPayload["hms_pages"] || []));
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

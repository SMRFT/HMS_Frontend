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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDAwMiIsImVtYWlsIjoibmFqbWFzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiTmFqbWEiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtT1BQUy1SVyIsIlNULVAtQlJELVIiLCJTRC1BUEktVkMtUlciLCJTVFItQVBJLVZMLVIiLCJITVMtUC1JQi1SVyIsIlNELVAtTUlTLVIiLCJTRC1QLUxHTFQtUiIsIlNELVAtSE1TVEQtUiIsIlNELUFQSS1DTi1SIiwiSE1TLVAtSVBQU0QtUlciLCJITVMtUC1SRU5RLVJXIiwiSE1TLVAtVkktUlciLCJTRC1QLVNTLVJXIiwiU1QtUC1ERVMtUiIsIlNELVAtSE1TUFMtUlciLCJITVMtUC1PVE0tUlciLCJITVMtUC1JUEdSTkQtUlciLCJTVC1QLU5URi1SIiwiU0QtUC1QQi1SIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLUJFREQtUlciLCJTRC1QLVRELVIiLCJTRC1QLVNIRi1SIiwiSE1TLVAtVlYtUlciLCJTRC1BUEktUkNMLVJXIiwiU0QtUC1QRC1SIiwiSE1TLVAtUk0tUlciLCJITVMtUC1ESVMtUlciLCJITVMtUC1JWFJBWS1SVyIsIlNELVAtTEJOLVIiLCJTRC1BUEktR09SLVJXIiwiU0QtUC1CVEQtUlciLCJTRC1BUEktR1ItUlciLCJTRC1QLUJBLVJXIiwiU0QtQVBJLVZQLVJXIiwiSE1TLVAtSVBHUk4tUlciLCJITVMtUC1EUk0tUlciLCJTRC1QLUhNU0xELVIiLCJTRC1QLUxTQ0wtUiIsIlNELVAtUEctUiIsIlNELVAtQ0hDLVIiLCJTRC1QLUhNU0NTLVIiLCJTRC1BUEktR0QtUiIsIlNELVAtQkEtUiIsIkhNUy1QLVNSVi1SVyIsIlNULVAtU05PLVJXIiwiU0QtUC1TU1UtUiIsIlNELVAtSE1TVUMtUlciLCJTRC1QLUhNU1NTLVIiLCJTRC1QLUNIQy1SVyIsIkhNUy1QLUJMSy1SVyIsIlNELVAtTEdMRC1SIiwiU1QtUC1DTVQtUlciLCJTRC1BUEktTUlTLVJXIiwiSE1TLVAtVklOUi1SIiwiSE1TLVAtUkNBVC1SVyIsIlNUUi1QLVRJTlItUiIsIlNELVAtU0dBQy1SVyIsIkhNUy1QLUFETS1SVyIsIlNELVAtUEItUlciLCJTRC1QLU1CUEQtUiIsIkhNUy1QLVZOREQtUlciLCJTVFItQVBJLUlMIiwiU0QtUC1QT1YtUiIsIlNELUFQSS1HQy1SVyIsIkhNUy1QLUlNUkktUlciLCJTRC1BUEktSVZNLVJXIiwiU0QtUC1ITVNTUC1SVyIsIlNELVAtSE1TUEItUiIsIlNELVAtUEYtUiIsIlNELVAtSE1TU0QtUlciLCJTVC1QLVRETC1SIiwiU1RSLUFQSS1JTC1SVyIsIkhNUy1QLUFVSElELVJXIiwiSE1TLVAtSVVTRy1SVyIsIlNELVAtU1AtUiIsIlNELVAtTEdELVJXIiwiU0QtUC1TSEYtUlciLCJTRC1BUEktTUJURC1SVyIsIlNULUFQSS1DUkQtUlciLCJTRC1BUEktUFItUiIsIlNELVAtU0dBQy1SIiwiU0QtUC1QRi1SVyIsIlNELVAtVEUtUlciLCJTRC1QLUxVU0NELVJXIiwiU1RSLUFQSS1UUkxSLVIiLCJTRC1QLVBPVi1SVyIsIlNUUi1BUEktVFJMLVIiLCJITVMtUC1WTkQtUlciLCJTRC1BUEktUkItUiIsIlNELVAtTUJUVi1SIiwiU1RSLUFQSS1USU4tUlciLCJTRC1QLURGLVIiLCJTRC1QLU1CREYtUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1JUFBTLVJXIiwiSE1TLVAtT1BQLVJXIiwiU0QtUC1ERi1SVyIsIlNELVAtVEUtUiIsIkhNUy1QLURCVURSLVIiLCJTRC1BUEktR09DLVJXIiwiU0QtUC1CVEQtUiIsIkhNUy1QLUlDVC1SVyIsIlNELUFQSS1UVi1SIiwiU0QtUC1TQy1SIiwiU1RSLVAtSUNTLVIiLCJTRC1QLVNTLVIiLCJTRC1QLVNWRi1SIiwiU1QtQVBJLUFNQy1SVyIsIkhNUy1QLURMRC1SVyIsIkhNUy1QLU9QR1JOLVJXIiwiU1RSLUFQSS1USU4tUiIsIlNELUFQSS1UTS1SIiwiU1QtUC1UREwtUlciLCJTRC1QLVBMLVIiLCJITVMtUC1BSVAtUlciLCJTRC1QLVNJUi1SVyIsIlNULVAtTlRGLVJXIiwiSE1TLVAtUk1ELVJXIiwiU0QtUC1HUEItUlciLCJTRC1QLUhNU1NTLVJXIiwiSE1TLVAtQU0tUlciLCJITVMtUC1PUFBTRC1SVyIsIlNELUFQSS1JVk0tUiIsIlNELVAtU1ZGLVJXIiwiU0QtUC1MR1NDLVIiLCJTRC1QLUxTQy1SVyIsIkhNUy1QLU9QR1JORC1SVyIsIkhNUy1SLVNBIiwiU1RSLUFQSS1WTC1SVyIsIlNELVAtSE1TUEItUlciLCJTRC1QLVRELVJXIiwiSE1TLVAtSVAtUlciLCJITVMtUC1SU0hGVC1SVyIsIlNULUFQSS1FTVAtUiIsIlNELVAtSE1TVEQtUlciLCJTVC1BUEktQlJELVJXIiwiU0QtUC1MU0QtUlciLCJTRC1QLUdQRC1SIiwiU1QtUi1BIiwiSE1TLVAtQlQtUlciLCJTVC1QLURFUy1SVyIsIlNELVAtSE1TR0MtUiIsIkhNUy1QLVNSTS1SVyIsIlNULVAtQ01ULVIiLCJTRC1BUEktVE0tUlciLCJTRC1QLUhNU1NQLVIiLCJTRC1QLUxSQy1SIiwiSE1TLVAtQkVELVJXIiwiU0QtUi1BIiwiU0QtUC1CRy1SIiwiU1RSLUFQSS1UUkwtUlciLCJTVC1BUEktVFJMUi1SVyIsIlNELUFQSS1URC1SIiwiSE1TLVAtVklOUi1SVyIsIkhNUy1QLVNVTS1SVyIsIkhNUy1QLVNBRE0tUlciLCJTVFItUi1BIiwiSE1TLVAtU1JWRC1SVyIsIkhNUy1QLVZJTi1SVyIsIlNUUi1BUEktSUwtUiIsIlNELVAtR1NQLVIiLCJTRC1QLVNJUi1SIiwiU0QtUC1VUEItUiIsIkhNUy1QLVJDQVRELVJXIiwiU0QtUC1TQ1UtUlciLCJTRC1QLVNTVS1SVyIsIlNELVAtUEctUlciLCJITVMtUC1JUEtHLVJXIiwiU1RSLVAtVElOUi1SVyIsIkhNUy1QLUFERC1SVyIsIlNELVAtVVBCLVJXIiwiU0QtUC1MUEktUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIiwiU0hCMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc0NDA3ODYyLCJleHAiOjE3NzQ0OTQ4NjIsImp0aSI6Ijg1OWZjMTAyLWI4MzUtNDdkMS04NjNjLWI2MjE3ZmJiMWFmOSJ9.BXHrvDmpW6yoxZ4u784lpMWJx35KcIa01Z1geTSI4pKtSeG2LAicVfA4OaxCTZNRTRWIqf0Nd9rHClDDguYFGZoLW7FRJgWk1P0CA2RosjaNkoiWJglH7pxeHRjJEC8QDdZYJF1Le4KHTUKMHjRACz6lQ9O54A_V6mQbYa8RVECt3FPSf9A0fVCxJNTIOiDEFireZkDfng9vGr8bfRh4x78IxyaU-QSpoG3tf96PklSRPHfL1c3izumWt3WBoG2-aagvPgl69Agdei4zwJcIg3DzFcyG9wMGTYYJloRdgSiWSdi_CeEijuDdWsg3yt_iS2qU1_J8XY0zBkHTAJ6ZQw"; // Intentionally left empty to force redirect to login in development
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
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
    return "Employee"; // Default role
  }
  console.log("Allowed actions:", allowedActions);
  if (allowedActions.includes("HMS-R-SA")) {
    return "Super Admin";
  } else {
    return "Employee"; // Default role if none of the specific roles are found
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
        "❌ No token found in localStorage, trying development token",
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
        "Missing required user data (employeeId or employeeName)",
      );
    }

    // Store user payload and extracted information for app usage
    localStorage.setItem("user_payload", JSON.stringify(userPayload));
    localStorage.setItem("employeeId", employeeId);
    localStorage.setItem("name", name);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("role", userRole);

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

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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDAwMiIsImVtYWlsIjoibmFqbWFzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiTmFqbWEiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtT1BQUy1SVyIsIlNULVAtQlJELVIiLCJTRC1BUEktVkMtUlciLCJTVFItQVBJLVZMLVIiLCJITVMtUC1JQi1SVyIsIlNELVAtTUlTLVIiLCJTRC1QLUxHTFQtUiIsIlNELVAtSE1TVEQtUiIsIlNELUFQSS1DTi1SIiwiSE1TLVAtSVBQU0QtUlciLCJITVMtUC1SRU5RLVJXIiwiU0QtUC1TUy1SVyIsIlNULVAtREVTLVIiLCJTRC1QLUhNU1BTLVJXIiwiSE1TLVAtSVBHUk5ELVJXIiwiU1QtUC1OVEYtUiIsIlNELVAtUEItUiIsIkhNUy1QLUJMS0QtUlciLCJITVMtUC1CRURELVJXIiwiU0QtUC1URC1SIiwiU0QtUC1TSEYtUiIsIlNELUFQSS1SQ0wtUlciLCJTRC1QLVBELVIiLCJITVMtUC1STS1SVyIsIkhNUy1QLURJUy1SVyIsIkhNUy1QLUlYUkFZLVJXIiwiU0QtUC1MQk4tUiIsIlNELUFQSS1HT1ItUlciLCJTRC1QLUJURC1SVyIsIlNELUFQSS1HUi1SVyIsIlNELVAtQkEtUlciLCJTRC1BUEktVlAtUlciLCJITVMtUC1JUEdSTi1SVyIsIkhNUy1QLURSTS1SVyIsIlNELVAtSE1TTEQtUiIsIlNELVAtTFNDTC1SIiwiU0QtUC1QRy1SIiwiU0QtUC1DSEMtUiIsIlNELVAtSE1TQ1MtUiIsIlNELUFQSS1HRC1SIiwiU0QtUC1CQS1SIiwiSE1TLVAtU1JWLVJXIiwiU1QtUC1TTk8tUlciLCJTRC1QLVNTVS1SIiwiU0QtUC1ITVNVQy1SVyIsIlNELVAtSE1TU1MtUiIsIlNELVAtQ0hDLVJXIiwiSE1TLVAtQkxLLVJXIiwiU0QtUC1MR0xELVIiLCJTVC1QLUNNVC1SVyIsIlNELUFQSS1NSVMtUlciLCJITVMtUC1SQ0FULVJXIiwiU1RSLVAtVElOUi1SIiwiU0QtUC1TR0FDLVJXIiwiSE1TLVAtQURNLVJXIiwiU0QtUC1QQi1SVyIsIlNELVAtTUJQRC1SIiwiSE1TLVAtVk5ERC1SVyIsIlNUUi1BUEktSUwiLCJTRC1QLVBPVi1SIiwiU0QtQVBJLUdDLVJXIiwiSE1TLVAtSU1SSS1SVyIsIlNELUFQSS1JVk0tUlciLCJTRC1QLUhNU1NQLVJXIiwiU0QtUC1ITVNQQi1SIiwiU0QtUC1QRi1SIiwiU0QtUC1ITVNTRC1SVyIsIlNULVAtVERMLVIiLCJTVFItQVBJLUlMLVJXIiwiSE1TLVAtQVVISUQtUlciLCJITVMtUC1JVVNHLVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1MR0QtUlciLCJTRC1QLVNIRi1SVyIsIlNELUFQSS1NQlRELVJXIiwiU1QtQVBJLUNSRC1SVyIsIlNELUFQSS1QUi1SIiwiU0QtUC1TR0FDLVIiLCJTRC1QLVBGLVJXIiwiU0QtUC1URS1SVyIsIlNELVAtTFVTQ0QtUlciLCJTVFItQVBJLVRSTFItUiIsIlNELVAtUE9WLVJXIiwiU1RSLUFQSS1UUkwtUiIsIkhNUy1QLVZORC1SVyIsIlNELUFQSS1SQi1SIiwiU0QtUC1NQlRWLVIiLCJTVFItQVBJLVRJTi1SVyIsIlNELVAtREYtUiIsIlNELVAtTUJERi1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLUlQUFMtUlciLCJITVMtUC1PUFAtUlciLCJTRC1QLURGLVJXIiwiU0QtUC1URS1SIiwiU0QtQVBJLUdPQy1SVyIsIlNELVAtQlRELVIiLCJITVMtUC1JQ1QtUlciLCJTRC1BUEktVFYtUiIsIlNELVAtU0MtUiIsIlNUUi1QLUlDUy1SIiwiU0QtUC1TUy1SIiwiU0QtUC1TVkYtUiIsIlNULUFQSS1BTUMtUlciLCJITVMtUC1ETEQtUlciLCJITVMtUC1PUEdSTi1SVyIsIlNUUi1BUEktVElOLVIiLCJTRC1BUEktVE0tUiIsIlNULVAtVERMLVJXIiwiU0QtUC1QTC1SIiwiSE1TLVAtQUlQLVJXIiwiU0QtUC1TSVItUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVJNRC1SVyIsIlNELVAtR1BCLVJXIiwiU0QtUC1ITVNTUy1SVyIsIkhNUy1QLU9QUFNELVJXIiwiU0QtQVBJLUlWTS1SIiwiU0QtUC1TVkYtUlciLCJTRC1QLUxHU0MtUiIsIlNELVAtTFNDLVJXIiwiSE1TLVAtT1BHUk5ELVJXIiwiSE1TLVItU0EiLCJTVFItQVBJLVZMLVJXIiwiU0QtUC1ITVNQQi1SVyIsIlNELVAtVEQtUlciLCJITVMtUC1JUC1SVyIsIkhNUy1QLVJTSEZULVJXIiwiU1QtQVBJLUVNUC1SIiwiU0QtUC1ITVNURC1SVyIsIlNULUFQSS1CUkQtUlciLCJTRC1QLUxTRC1SVyIsIlNELVAtR1BELVIiLCJTVC1SLUEiLCJITVMtUC1CVC1SVyIsIlNULVAtREVTLVJXIiwiU0QtUC1ITVNHQy1SIiwiSE1TLVAtU1JNLVJXIiwiU1QtUC1DTVQtUiIsIlNELUFQSS1UTS1SVyIsIlNELVAtSE1TU1AtUiIsIlNELVAtTFJDLVIiLCJITVMtUC1CRUQtUlciLCJTRC1SLUEiLCJTRC1QLUJHLVIiLCJTVFItQVBJLVRSTC1SVyIsIlNULUFQSS1UUkxSLVJXIiwiU0QtQVBJLVRELVIiLCJITVMtUC1TVU0tUlciLCJITVMtUC1TQURNLVJXIiwiU1RSLVItQSIsIkhNUy1QLVNSVkQtUlciLCJTVFItQVBJLUlMLVIiLCJTRC1QLUdTUC1SIiwiU0QtUC1TSVItUiIsIlNELVAtVVBCLVIiLCJITVMtUC1SQ0FURC1SVyIsIlNELVAtU0NVLVJXIiwiU0QtUC1TU1UtUlciLCJTRC1QLVBHLVJXIiwiSE1TLVAtSVBLRy1SVyIsIlNUUi1QLVRJTlItUlciLCJITVMtUC1BREQtUlciLCJTRC1QLVVQQi1SVyIsIlNELVAtTFBJLVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSIsIlNIQjAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3MzA1MzU4OCwiZXhwIjoxNzczMTQwNTg4LCJqdGkiOiI1MDFkY2UwZC05MzY1LTRlNmQtYmRlZC00ZTY3ZTY2NzI2ZDAifQ.MPsrqCPk_Y_1SX4g0iHGTDf7Gt9apx42bt0FCxgEMx5ZRulcj9xlldKuCZ7nTDnNogyhk8awsTmd_CuKRVKsJeb1Au6VhOkRYJt1Z0i_1hq23anoxyR6bvxDSQ8fBnwl14tOgADXtF78E-81cdz85evRL_C2PqcSS83dyIK4GdmBCeV_lN9YjNz4NlWuWDvCfLSsBvDEADf6Av5793n7Ng9MRtNWFXFEaMx9Bf3q3wY4OhKPnwgxWiEMQlAyprQeOg7iEU8XIG7dP15-yIBH565Bl3fYI37WZsOs-N5shk_wtr99lWh4t8tQfLN_BF1qiWu7qD-wQhzdQItGIjbEwg";
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

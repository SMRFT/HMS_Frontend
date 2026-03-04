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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDAwMiIsImVtYWlsIjoibmFqbWFzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiTmFqbWEiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtT1BQUy1SVyIsIlNULVAtQlJELVIiLCJTRC1BUEktVkMtUlciLCJTVFItQVBJLVZMLVIiLCJITVMtUC1JQi1SVyIsIlNELVAtTUlTLVIiLCJTRC1QLUxHTFQtUiIsIlNELVAtSE1TVEQtUiIsIlNELUFQSS1DTi1SIiwiSE1TLVAtSVBQU0QtUlciLCJITVMtUC1SRU5RLVJXIiwiU0QtUC1TUy1SVyIsIlNULVAtREVTLVIiLCJTRC1QLUhNU1BTLVJXIiwiSE1TLVAtSVBHUk5ELVJXIiwiU1QtUC1OVEYtUiIsIlNELVAtUEItUiIsIkhNUy1QLUJMS0QtUlciLCJITVMtUC1CRURELVJXIiwiU0QtUC1URC1SIiwiU0QtUC1TSEYtUiIsIlNELUFQSS1SQ0wtUlciLCJTRC1QLVBELVIiLCJITVMtUC1STS1SVyIsIkhNUy1QLURJUy1SVyIsIkhNUy1QLUlYUkFZLVJXIiwiU0QtUC1MQk4tUiIsIlNELUFQSS1HT1ItUlciLCJTRC1QLUJURC1SVyIsIlNELUFQSS1HUi1SVyIsIlNELVAtQkEtUlciLCJTRC1BUEktVlAtUlciLCJITVMtUC1JUEdSTi1SVyIsIkhNUy1QLURSTS1SVyIsIlNELVAtSE1TTEQtUiIsIlNELVAtTFNDTC1SIiwiU0QtUC1QRy1SIiwiU0QtUC1DSEMtUiIsIlNELVAtSE1TQ1MtUiIsIlNELUFQSS1HRC1SIiwiU0QtUC1CQS1SIiwiSE1TLVAtU1JWLVJXIiwiU1QtUC1TTk8tUlciLCJTRC1QLVNTVS1SIiwiU0QtUC1ITVNVQy1SVyIsIlNELVAtSE1TU1MtUiIsIlNELVAtQ0hDLVJXIiwiSE1TLVAtQkxLLVJXIiwiU0QtUC1MR0xELVIiLCJTVC1QLUNNVC1SVyIsIlNELUFQSS1NSVMtUlciLCJITVMtUC1SQ0FULVJXIiwiU1RSLVAtVElOUi1SIiwiU0QtUC1TR0FDLVJXIiwiSE1TLVAtQURNLVJXIiwiU0QtUC1QQi1SVyIsIlNELVAtTUJQRC1SIiwiSE1TLVAtVk5ERC1SVyIsIlNUUi1BUEktSUwiLCJTRC1QLVBPVi1SIiwiU0QtQVBJLUdDLVJXIiwiSE1TLVAtSU1SSS1SVyIsIlNELUFQSS1JVk0tUlciLCJTRC1QLUhNU1NQLVJXIiwiU0QtUC1ITVNQQi1SIiwiU0QtUC1QRi1SIiwiU0QtUC1ITVNTRC1SVyIsIlNULVAtVERMLVIiLCJTVFItQVBJLUlMLVJXIiwiSE1TLVAtQVVISUQtUlciLCJITVMtUC1JVVNHLVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1MR0QtUlciLCJTRC1QLVNIRi1SVyIsIlNELUFQSS1NQlRELVJXIiwiU1QtQVBJLUNSRC1SVyIsIlNELUFQSS1QUi1SIiwiU0QtUC1TR0FDLVIiLCJTRC1QLVBGLVJXIiwiU0QtUC1URS1SVyIsIlNELVAtTFVTQ0QtUlciLCJTVFItQVBJLVRSTFItUiIsIlNELVAtUE9WLVJXIiwiU1RSLUFQSS1UUkwtUiIsIkhNUy1QLVZORC1SVyIsIlNELUFQSS1SQi1SIiwiU0QtUC1NQlRWLVIiLCJTVFItQVBJLVRJTi1SVyIsIlNELVAtREYtUiIsIlNELVAtTUJERi1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLUlQUFMtUlciLCJITVMtUC1PUFAtUlciLCJTRC1QLURGLVJXIiwiU0QtUC1URS1SIiwiU0QtQVBJLUdPQy1SVyIsIlNELVAtQlRELVIiLCJITVMtUC1JQ1QtUlciLCJTRC1BUEktVFYtUiIsIlNELVAtU0MtUiIsIlNUUi1QLUlDUy1SIiwiU0QtUC1TUy1SIiwiU0QtUC1TVkYtUiIsIlNULUFQSS1BTUMtUlciLCJITVMtUC1ETEQtUlciLCJITVMtUC1PUEdSTi1SVyIsIlNUUi1BUEktVElOLVIiLCJTRC1BUEktVE0tUiIsIlNULVAtVERMLVJXIiwiU0QtUC1QTC1SIiwiSE1TLVAtQUlQLVJXIiwiU0QtUC1TSVItUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVJNRC1SVyIsIlNELVAtR1BCLVJXIiwiU0QtUC1ITVNTUy1SVyIsIkhNUy1QLU9QUFNELVJXIiwiU0QtQVBJLUlWTS1SIiwiU0QtUC1TVkYtUlciLCJTRC1QLUxHU0MtUiIsIlNELVAtTFNDLVJXIiwiSE1TLVAtT1BHUk5ELVJXIiwiSE1TLVItU0EiLCJTVFItQVBJLVZMLVJXIiwiU0QtUC1ITVNQQi1SVyIsIlNELVAtVEQtUlciLCJITVMtUC1SU0hGVC1SVyIsIlNULUFQSS1FTVAtUiIsIlNELVAtSE1TVEQtUlciLCJTVC1BUEktQlJELVJXIiwiU0QtUC1MU0QtUlciLCJTRC1QLUdQRC1SIiwiU1QtUi1BIiwiU1QtUC1ERVMtUlciLCJTRC1QLUhNU0dDLVIiLCJITVMtUC1TUk0tUlciLCJTVC1QLUNNVC1SIiwiU0QtQVBJLVRNLVJXIiwiU0QtUC1ITVNTUC1SIiwiU0QtUC1MUkMtUiIsIkhNUy1QLUJFRC1SVyIsIlNELVItQSIsIlNELVAtQkctUiIsIlNUUi1BUEktVFJMLVJXIiwiU1QtQVBJLVRSTFItUlciLCJTRC1BUEktVEQtUiIsIkhNUy1QLVNVTS1SVyIsIkhNUy1QLVNBRE0tUlciLCJTVFItUi1BIiwiSE1TLVAtU1JWRC1SVyIsIlNUUi1BUEktSUwtUiIsIlNELVAtR1NQLVIiLCJTRC1QLVNJUi1SIiwiU0QtUC1VUEItUiIsIkhNUy1QLVJDQVRELVJXIiwiU0QtUC1TQ1UtUlciLCJTRC1QLVNTVS1SVyIsIlNELVAtUEctUlciLCJTVFItUC1USU5SLVJXIiwiSE1TLVAtQURELVJXIiwiU0QtUC1VUEItUlciLCJTRC1QLUxQSS1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiLCJTSEIwMDIiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzI2MjA0NDgsImV4cCI6MTc3MjcwNzQ0OCwianRpIjoiOTc1YjFlZTEtZjIyNS00ZjMwLWE5ODQtOWY2M2I2ZDRmMDdlIn0.DV-WKuAMoBHvTqZhfPWHnfCzEdxJPQdZBxxbHy0PqQjhWgqf0pJzqy5ZG64sUTbd23Pzj-5_GI2yDwrgLYpJd5K-RLH4tvpd879d2fZ756WN7SPjZqgh2zjtvs4LiwGu3RCqs1l7XRsugJOhelsstA0vSyEugUBFZVtacHxc0ykkFEyScWyGfwiASESA26P9aV1YQn5deeOMo3PlSPmUKan3Mrp-TmYrlobLKPBFuF3jv_7jvX2mNzgTdHDUdA0yN55Z2usLYNY7l1h_zImwo8B82vxJAp2x6KsFKCYmiBuylb2e-QolkFNlinym4_Zf8Z-Q0keAfT7fnWmXFZx9lQ";
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

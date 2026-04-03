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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLUFQSS1DRFItUiIsIkhNUy1QLUhNUyIsIk1EQy1BUEktUkRMLVJXIiwiTURDLUFQSS1QQVQiLCJITVMtUC1ITVNQUy1SVyIsIkVSLVAtRVJQTC1SIiwiU1QtUC1DTVQtUiIsIlNELVItSFIiLCJFUi1QLUVSR05CTi1SIiwiU1QtUC1TTk8tUlciLCJITVMtUC1JTkEiLCJITVMtUC1DQ0MiLCJITVMtUC1JUEgiLCJITVMtUC1EQiIsIk1EQy1QLVJFRy1SIiwiU1QtQVBJLUVNUC1SIiwiTURDLVAtVFJCLVJXIiwiTURDLVAtT1NCLVJXIiwiSE1TLUFQSS1JWFJBWSIsIlNULVAtVERMLVJXIiwiU1QtUC1ERVMtUlciLCJITVMtQVBJLUlNUkktUlciLCJITVMtQVBJLUlNUkkiLCJITVMtUC1ITVNQUyIsIkhNUy1QLVJDQVQiLCJITVMtUC1HUk4iLCJFUi1QLUVSUkVQLVJXIiwiTURDLVAtQVNNLVJXIiwiTURDLUFQSS1BRE0tUlciLCJITVMtQVBJLVZNIiwiU1QtUC1CUkQtUiIsIlNULUFQSS1DUkQtUlciLCJTVC1SLUhPRCIsIkhNUy1BUEktRFNVTSIsIkhNUy1BUEktSUNULVJXIiwiSE1TLVAtUkJJTEwiLCJNREMtUC1HQVAtUiIsIkVSLVAtRVJQQi1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiU1QtUC1ERVMtUiIsIkhNUy1QLUdSTkEiLCJITVMtUC1PUEgiLCJITVMtUC1XUiIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1QSCIsIk1EQy1BUEktR0FTLVIiLCJITVMtUC1BREFTSCIsIkVSLVAtRVJCLVJXIiwiSE1TLVAtSVQiLCJTSU4tUi1FTVAiLCJITVMtUC1ITVNJTlMiLCJNREMtUC1QTlAtUiIsIkhNUy1QLUFETSIsIkVSLVAtRVJETC1SIiwiSE1TLVAtVlYiLCJNREMtQVBJLVJUUy1SIiwiU1QtUC1DTVQtUlciLCJNREMtQVBJLUFHUC1SVyIsIkhNUy1BUEktSVVTRy1SVyIsIkVSLVItRVJOIiwiSE1TLVAtSU5WUCIsIkhNUy1QLVBBQ0siLCJITVMtUC1STSIsIkhNUy1QLVJTSEZUIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtSU5URU5UIiwiSE1TLUFQSS1JVVNHIiwiTURDLUFQSS1BVC1SIiwiTURDLUFQSS1QREMtUlciLCJITVMtQVBJLUlDVCIsIkhNUy1QLUJULVJXIiwiSE1TLVAtVklUTSIsIkhNUy1QLVZJTlItUlciLCJNREMtQVBJLVBBVC1SIiwiTURDLVAtR1NQLVIiLCJITVMtUC1TSU5URU5UIiwiSE1TLVAtU0dSTiIsIkhNUy1QLUREQVNIIiwiTURDLVAtU09SLVIiLCJITVMtUC1WSU5HIiwiSE1TLUFQSS1EQVNIIiwiTURDLUFQSS1USFItUiIsIkhNUy1BUEktU1VNIiwiTURDLUFQSS1BVC1SVyIsIk1EQy1QLVBOUC1SVyIsIk1EQy1QLUFBVS1SVyIsIkhNUy1QLVNJREVCQVIiLCJTVC1QLU5URi1SVyIsIk1EQy1QLVJFRy1SVyIsIlNULUFQSS1BTUMtUlciLCJITVMtUC1JTiIsIk1EQy1BUEktT0dQLVJXIiwiU1QtUC1UREwtUiIsIk1EQy1QLUdPUC1SIiwiSE1TLUFQSS1JWFJBWS1SVyIsIlNULVAtTlRGLVIiLCJNREMtUi1BRE0iLCJITVMtUCIsIkhNUy1BUEktSUIiLCJITVMtUC1CVUQiLCJITVMtUC1WSU4iLCJITVMtUC1CTEsiLCJITVMtUC1SRUciLCJNREMtUC1HUFAtUiIsIk1EQy1QLUdDUC1SIiwiTURDLUFQSS1QR1AtUlciLCJNREMtQVBJLUxCTi1SIiwiTURDLUFQSS1TR1AtUlciLCJNREMtUi1QREMiLCJITVMtUC1WRUwiLCJHUC1QLUdDTi1SIiwiSE1TLVAtUkVOUSJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzQwLDQxLDQyXSwiYWxsb3dlZC1vdXRsZXRzIjpbXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzUxODUzNDksImV4cCI6MTc3NTI3MjM0OX0.aFceSkAreBBT-DsufV6wcDVKCwEWxFe2beNKboPxXOz8vzTkVDb7J-YAz4ab4h5Z6wCfTYYioVIMtfv8guM9NvstljnPhwI5Z7gOUyXgie76FZ6P_CXxYGgHZ7GEgof_Cx5p8RV4a8t_sTpETM8w5VwYG-vH96EqnvxukGDzvgP-Qt0yC31nik5KcnPT5yq81nPtl-wNop_EjZZuQjatGlcsxevFj62SfH4PRUmGDp8YoQyqE7Z3Axy1TutIsEsFmv98kFUL7mt2mnvZZatjX9ZW0cDzEz9uHTouJexCt9rCDvGk8VEt1U6R9a6VlK7qDZ_UNaSFd4Sv8wOy7phYiA";
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

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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIlNULVAtQ01ULVJXIiwiSE1TLVAtVklORyIsIkhNUy1QLVJDQVQiLCJITVMtQVBJLVZNIiwiSE1TLVAtT1BIIiwiSE1TLUFQSS1JVVNHLVJXIiwiU1QtUC1CUkQtUiIsIkhNUy1QLVZJTi1SVyIsIlNULVAtVERMLVJXIiwiSE1TLVAtQURBU0giLCJITVMtUC1WSVRNIiwiSE1TLUFQSS1EQVNILVJXIiwiSE1TLVAtSU5WUCIsIkhNUy1QLVdSIiwiSE1TLVAtSE1TIiwiU1QtUC1UREwtUiIsIlNJTi1SLUVNUCIsIkhNUy1QLUNDQyIsIkhNUy1QLVNHUk4iLCJITVMtUC1BRE0iLCJNREMtUi1QREMiLCJITVMtUC1QSCIsIlNULUFQSS1BTUMtUlciLCJITVMtUC1QQUNLIiwiSE1TLVAtR1JOQSIsIlNULVAtTlRGLVIiLCJTVC1SLUNEUiIsIkhNUy1QLUlCLVJXIiwiSE1TLUFQSS1JWFJBWS1SVyIsIkhNUy1QLUJMSyIsIlNULVAtREVTLVJXIiwiSE1TLVAtSU4iLCJITVMtUC1JVCIsIkhNUy1QLVJTSEZUIiwiSE1TLVAtU0lOVEVOVCIsIkhNUy1QLUhNU1BTLVJXIiwiSE1TLVAtRERBU0giLCJITVMtUC1EQiIsIkhNUy1BUEktSU1SSS1SVyIsIkhNUy1BUEktU1VNIiwiU1QtUC1DTVQtUiIsIlNULUFQSS1CUkQtUlciLCJTVC1QLVNOTy1SVyIsIkhNUy1QLUlOQSIsIkhNUy1BUEktSUNULVJXIiwiU1QtQVBJLUVNUC1SIiwiU1QtUC1OVEYtUlciLCJITVMtUC1WVi1SVyIsIkhNUy1BUEktSUNUIiwiSE1TLUFQSS1EQVNIIiwiSE1TLUFQSS1EU1VNIiwiU0QtUi1IUiIsIkhNUy1QLVNJREVCQVIiLCJITVMtQVBJLUlCIiwiSE1TLVAiLCJTVC1SLUEiLCJITVMtUC1CVUQiLCJITVMtQVBJLUlVU0ciLCJITVMtUC1JTlRFTlQiLCJITVMtUC1ITVNJTlMiLCJITVMtUC1SRUciLCJITVMtUC1JUEgiLCJITVMtUC1SQklMTCIsIkhNUy1QLVZJLVJXIiwiSE1TLUFQSS1JTVJJIiwiSE1TLVAtVklOUi1SVyIsIkhNUy1QLUhNU1BTIiwiSE1TLVAtRExELVJXIiwiSE1TLVAtUkVOUSIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1STSIsIkhNUy1BUEktSVhSQVkiLCJITVMtUC1HUk4iLCJITVMtUC1WRUwiLCJTVC1QLURFUy1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiLCJTSEIwMDIiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzQ5MzQ2MDUsImV4cCI6MTc3NTAyMTYwNX0.Q1pdAK7FSlrJ3IsKO2F4WqKbVW6XrczTBwEL82sVZr3DkddEtXgOPhF1oIY82ksJ1GIrJjZymPulLn2AG0F6T3uKw3K-j5PhSOZe8vyKae3GOGZqpooYLw4IVQ5S7Xoj9jJ4H-w-uSuHuTMnFGlycz9g9MeZUpJiIIXUHNqkZSkl_kHsgM861DSnT60Vhlm2DyWMIYlItutKAnYLMoSLyBlhVf1S7XfrMexW_iV2KXj9ekW2wTu46Xq8pieo_wk-difCPzvTXOO_WHD3Rw42EV0YGP-C2UWvWkSIsQoZrx6OKXZXWunVAzci4GsjUeVvYoqeElH1PgbQRgoAeX4oYA";
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

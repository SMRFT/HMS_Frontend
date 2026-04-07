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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLURCVURSLVIiLCJITVMtUC1WSU5SLVIiLCJITVMtUC1ITVMiLCJITVMtUC1ITVNQUy1SVyIsIkhNUy1QLVJLSVRELVJXIiwiU1QtUC1DTVQtUiIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLVJNRC1SVyIsIlNULVAtU05PLVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtREIiLCJITVMtUC1WSU4tUlciLCJTVC1BUEktRU1QLVIiLCJTVC1SLUNEUiIsIkhNUy1BUEktSVQtUlciLCJTVC1QLVRETC1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtUkVHLVJXIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLUhNU1BTIiwiSE1TLVAtUlNERC1SVyIsIkhNUy1QLUdSTiIsIkhNUy1BUEktVk0iLCJITVMtUC1CTEtELVJXIiwiU1QtUC1CUkQtUiIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1JWFJBWS1SVyIsIkhNUy1QLVNVTS1SVyIsIlNULVAtREVTLVIiLCJITVMtUC1ETEQtUlciLCJITVMtUC1TUk0tUlciLCJITVMtUC1WSS1SVyIsIkhNUy1QLUdSTkEiLCJITVMtUC1PUEgiLCJITVMtUC1XUiIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1WVi1SVyIsIkhNUy1QLUhNU0lOUyIsIkhNUy1QLUlQS0ctUlciLCJITVMtUC1EUk0tUlciLCJITVMtUC1HQURNLVJXIiwiSE1TLVAtQURNLVJXIiwiSE1TLVAtUlNELVJXIiwiSE1TLUFQSS1TUk0tUlciLCJITVMtUC1BTS1SVyIsIlNULVAtQ01ULVJXIiwiSE1TLUFQSS1EQVNILVJXIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1SU0hGVCIsIkhNUy1QLUJULVJXIiwiSE1TLVAtVklOUi1SVyIsIkhNUy1QLVJFTlEtUlciLCJITVMtUC1EREFTSCIsIkhNUy1QLU5TLVJXIiwiSE1TLUFQSS1TQU1ULVJXIiwiSE1TLUFQSS1TSU5URU5ULVJXIiwiSE1TLUFQSS1EQVNIIiwiSE1TLVAtSU1SSS1SVyIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtU0lERUJBUiIsIlNULVAtTlRGLVJXIiwiU1QtQVBJLUFNQy1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJITVMtQVBJLVNBTS1SVyIsIlNULVAtVERMLVIiLCJITVMtUC1OU0QtUlciLCJTVC1QLU5URi1SIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtSUNULVJXIiwiSE1TLVAtU0dSTi1SVyIsIkhNUy1QLU9UU1MtUlciLCJTVC1SLUEiLCJITVMtUC1JVVNHLVJXIiwiSE1TLVAtSVAtUlciLCJITVMtUC1PVE0tUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSIsIlNIQjAwMiJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxLDIsMyw0LDUsNiw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQwLDQxLDQyLDQ0LDQ1LDQ2LDQ3LDQ4LDQ5LDUwLDUyLDUxXSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzU1Mzc0MjgsImV4cCI6MTc3NTYyNDQyOH0.MyeW_4C45yWq2GwY6fLkOyotlCQpWRdrSA-sgc4Gy_7NTKNLNO-A4SMoP3LdZegusrlEI1DGL9dg6nUeyVrCISIXyDbc5h2eGz6uPjNC4f7pdXcITHbbC6qUtD00hxsIb-jKD1yNZAfZXE9qrwipaSFHHb9mrDKCygPPPZ_LBrzaLwjfDZxOjIEbLv0dtQC-t1TWevwGwc4QkT3bga-fYEoIL6hOGWaCGRNucY5orn6r726Uj3YtFmKsx7ZGmMWRj607b9Nuay0QgO35sdL26UlWdMrEo2GPWFcVi0KoUHyMiR_ACjLusvoUYPCTMJrcN3zPGcXf-sZ_f05U8j3mrA";
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB005";
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

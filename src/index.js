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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1BUEktSUNULVJXIiwiSE1TLVAtVklOUi1SIiwiSE1TLVAtSE1TIiwiU1QtUC1DTVQtUlciLCJITVMtQVBJLURBU0gtUlciLCJITVMtUC1ITVNQUy1SVyIsIkhNUy1QLUlQLVJXIiwiU1QtUC1DTVQtUiIsIkhNUy1BUEktSVVTRy1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJTVC1QLURFUy1SIiwiSE1TLVAtUkNBVEQtUlciLCJTVC1QLVNOTy1SVyIsIkhNUy1QLURMRC1SVyIsIkhNUy1QLVNSTS1SVyIsIkhNUy1QLVZJLVJXIiwiSE1TLVAtR1JOQSIsIlNULVAtVERMLVIiLCJITVMtUC1SU0hGVCIsIkhNUy1BUEktU0FNLVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtT1BIIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLVdSIiwiSE1TLVAtVklOLVJXIiwiSE1TLUFQSS1JVVNHIiwiSE1TLVAtREIiLCJTVC1BUEktRU1QLVIiLCJTVC1SLUNEUiIsIkhNUy1BUEktSVhSQVktUlciLCJITVMtQVBJLUlULVJXIiwiSE1TLVAtVlYtUlciLCJTVC1QLU5URi1SIiwiSE1TLUFQSS1JQ1QiLCJTVC1QLVRETC1SVyIsIkhNUy1BUEktSVhSQVkiLCJITVMtUC1CVC1SVyIsIkhNUy1QLVZJTlItUlciLCJTVC1QLURFUy1SVyIsIkhNUy1BUEktSU1SSS1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtUkVHLVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLUREQVNIIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1QLU9UQU0tUlciLCJITVMtUC1CTEstUlciLCJITVMtUC1CVUQtUiIsIkhNUy1BUEktSU1SSSIsIkhNUy1QLUhNU1BTIiwiSE1TLUFQSS1TQU1ULVJXIiwiSE1TLUFQSS1TSU5URU5ULVJXIiwiSE1TLVAtR1JOIiwiSE1TLUFQSS1EU1VNLVJXIiwiSE1TLUFQSS1EQVNIIiwiSE1TLVAtSE1TSU5TIiwiSE1TLVAtSVBLRy1SVyIsIkhNUy1BUEktVk0iLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLUFETS1SVyIsIkhNUy1QLVNHUk4tUlciLCJITVMtQVBJLVNSTS1SVyIsIkhNUy1QLUlCLVJXIiwiU1QtUC1CUkQtUiIsIlNULVItQSIsIkhNUy1QLU9UU1MtUlciLCJTVC1BUEktQ1JELVJXIiwiU1QtUC1OVEYtUlciLCJITVMtUC1PVE0tUlciLCJTVC1BUEktQU1DLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiLCJTSEIwMDIiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMSwyLDMsNCw1LDYsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyMywyNCwyNSwyNiwyNywyOCwyOSwzMCwzMSwzMiwzMywzNCwzNSwzNiwzNywzOCwzOSw0MCw0MSw0Miw0NCw0NSw0Niw0Nyw0OCw0OV0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc1NDcwOTEzLCJleHAiOjE3NzU1NTc5MTN9.HY40rneVtzLBNrxa5gK9qCQa3HVtGRPgICt0qEucuUvxyftGI1e3q3bCHmExD0cpLMh8xGf1tIR01HgOEZI6-w_M2-LEs2CO2kk8Cn6w57aqG51B-GQr60jMWtKxvLqfjUc1DylUoUsbfYpJMITNV0I9PKzfSAJdc5MCWCoBrzukXQpob6zLgtz9v8kljlham4qWeFn78Kh8M5ReSG_vIrHIwL9lYMWvTg9DZygmCv1WpBXl14Ebs2PB0KGGG6uqHPZ6EBJAzWu3j9YkiJVFK8VtMSBM4ePAp2-SxXOzGXeoFSvH_icArUIxZAY6Z1KwS8lvxHpTAn847-hKGqvq8w";
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

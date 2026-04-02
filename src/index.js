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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1BUEktSUNULVJXIiwiSE1TLVAtSE1TIiwiU1QtUC1DTVQtUlciLCJITVMtQVBJLURBU0gtUlciLCJITVMtUC1SQklMTCIsIkhNUy1QLUhNU1BTLVJXIiwiU1QtUC1DTVQtUiIsIkhNUy1BUEktSVVTRy1SVyIsIkhNUy1QLVBBQ0siLCJITVMtUC1JTlZQIiwiU1QtUC1ERVMtUiIsIkhNUy1QLVNSTSIsIlNULVAtU05PLVJXIiwiSE1TLVAtRExELVJXIiwiSE1TLVAtUk0iLCJITVMtUC1WSS1SVyIsIkhNUy1QLUdSTkEiLCJTVC1QLVRETC1SIiwiSE1TLVAtUlNIRlQiLCJITVMtUC1JTkEiLCJITVMtUC1PUEgiLCJITVMtUC1XUiIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1DQ0MiLCJITVMtUC1WSU4tUlciLCJITVMtQVBJLUlVU0ciLCJITVMtUC1EQiIsIlNULUFQSS1FTVAtUiIsIlNULVItQ0RSIiwiSE1TLUFQSS1JWFJBWS1SVyIsIkhNUy1QLVZJTlIiLCJITVMtUC1PVE0iLCJITVMtUC1WVi1SVyIsIlNULVAtTlRGLVIiLCJITVMtQVBJLUlDVCIsIlNULVAtVERMLVJXIiwiSE1TLUFQSS1JWFJBWSIsIkhNUy1QLVZJTlItUlciLCJITVMtUC1BREFTSCIsIlNULVAtREVTLVJXIiwiSE1TLUFQSS1JTVJJLVJXIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtU0lOVEVOVCIsIkhNUy1QLU9UQU0iLCJITVMtUC1SRUctUlciLCJITVMtUC1TR1JOIiwiSE1TLVAtRERBU0giLCJITVMtUC1TQU1UIiwiSE1TLUFQSS1JQiIsIkhNUy1QLU9UU1MiLCJITVMtQVBJLUlNUkkiLCJITVMtUC1ITVNQUyIsIkhNUy1QLVNBTSIsIkhNUy1QLUlUIiwiSE1TLVAtR1JOIiwiSE1TLVAtUkNBVCIsIkhNUy1QLUJVRCIsIkhNUy1BUEktREFTSCIsIkhNUy1BUEktRFJNIiwiSE1TLVAtSE1TSU5TIiwiSE1TLVAtQkxLIiwiSE1TLUFQSS1WTSIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1BRE0tUlciLCJITVMtUC1BRE0iLCJITVMtUC1JQi1SVyIsIlNULVAtQlJELVIiLCJTVC1SLUEiLCJTVC1BUEktQ1JELVJXIiwiSE1TLVAtQlQiLCJTVC1QLU5URi1SVyIsIkhNUy1BUEktRFNVTSIsIkhNUy1QLVJFTlEiLCJTVC1BUEktQU1DLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiLCJTSEIwMDIiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDMsNDQsNDUsNDYsNDcsNDgsNDldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3NTEyNjk3OCwiZXhwIjoxNzc1MjEzOTc4fQ.NOB2exJAgO1_LMqCAaidJCR090W36E25Y527LajrpGhcXsKPm-ITa2XC_3dWSOhECw_pC9gEZtR44MjMxLjOvtljh52p0Si4K1feM0nL9QhMeUtjDGQ9rhIWmB_tZ6bLrTqsE4VyJ3YFfdHxZgnlaJN5O_fhWz-w_UEp2lviRjZHjQ6KFn4IlsIWC380jsyl9NEQpf36QrCEMELTYefNEitpirLRu-pnLvcDIdr5zpJ6lkxy6q2E04PC0drc4942UyfqCwWX99uNNdIjAallMsH2EXdhKohgFw6GFVl1DFwbSdzoLoEia2q2as6ZrKG4kxfsH9XKYj51S1dexY9t_Q";
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

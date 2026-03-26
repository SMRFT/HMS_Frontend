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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoiUGFydGhpcGFuMzEyMTQ2MUBnbWFpbC5jb20iLCJuYW1lIjoiTS5QYXJ0aGliYW4iLCJhbGxvd2VkLWFjdGlvbnMiOlsiU1QtUC1CUkQtUiIsIlNELUFQSS1WQy1SVyIsIlNELVAtTUlTLVIiLCJTRC1QLUxHTFQtUiIsIlNELVAtSE1TVEQtUiIsIlNELUFQSS1DTi1SIiwiU0QtUC1TUy1SVyIsIlNULVAtREVTLVIiLCJTSU4tQVBJLVNGLVIiLCJTRC1QLUhNU1BTLVJXIiwiU1QtUC1OVEYtUiIsIlNISS1QLUYxUy1SVyIsIlNISS1QLUVYUC1SVyIsIlNELVAtUEItUiIsIlNISS1QLU1JQ1VSLVJXIiwiU0hJLVAtU0lDVVItUlciLCJTRC1QLVRELVIiLCJTSEktUC1GMVItUlciLCJTRC1QLVNIRi1SIiwiU0hJLVAtTU9DSy1SVyIsIlNELUFQSS1SQ0wtUlciLCJTRC1QLVBELVIiLCJTSEktUC1NUkQtUlciLCJTRC1QLUxCTi1SIiwiU0hJLVAtT1QtUlciLCJTSEktUC1UUkFJTlItUlciLCJTRC1BUEktR09SLVJXIiwiU0QtUC1CVEQtUlciLCJTRC1BUEktR1ItUlciLCJTRC1QLUJBLVJXIiwiU0QtQVBJLVZQLVJXIiwiU0hJLVAtRElBLVJXIiwiU0QtUC1MU0NMLVIiLCJTRC1QLUhNU0xELVIiLCJTRC1QLVBHLVIiLCJTRC1QLUNIQy1SIiwiU0QtUC1ITVNDUy1SIiwiU0QtQVBJLUdELVIiLCJTSEktUC1GMlNSLVJXIiwiU0QtUC1CQS1SIiwiU0hJLVAtUkVDLVJXIiwiU1QtUC1TTk8tUlciLCJTRC1QLVNTVS1SIiwiU0QtUC1ITVNVQy1SVyIsIlNELVAtSE1TU1MtUiIsIlNELVAtQ0hDLVJXIiwiU0QtUC1MR0xELVIiLCJTSEktUC1DSEVNT1ItUlciLCJTSS1SLUlOREUiLCJTVC1QLUNNVC1SVyIsIlNELUFQSS1NSVMtUlciLCJTSU4tQVBJLU9SUi1SIiwiU0QtUC1TR0FDLVJXIiwiU0QtUC1QQi1SVyIsIlNISS1QLVBIWS1SVyIsIlNELVAtTUJQRC1SIiwiU0QtUC1QT1YtUiIsIlNISS1QLU9QRC1SVyIsIlNISS1QLUYxU1ItUlciLCJTRC1BUEktR0MtUlciLCJTVC1QLVRETC1SIiwiU0QtQVBJLUlWTS1SVyIsIlNELVAtSE1TUEItUiIsIlNELVAtUEYtUiIsIlNELVAtSE1TU1AtUlciLCJTSU4tQVBJLUlGLVIiLCJTRC1QLUhNU1NELVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1MR0QtUlciLCJTRC1QLVNIRi1SVyIsIlNISS1QLUZPUk0tUlciLCJTRC1BUEktTUJURC1SVyIsIlNULUFQSS1DUkQtUlciLCJTSEktUC1BVkFJTC1SVyIsIlNELUFQSS1QUi1SIiwiU0QtUC1TR0FDLVIiLCJTRC1QLVBGLVJXIiwiU0QtUC1URS1SVyIsIlNELVAtTFVTQ0QtUlciLCJTRC1QLVBPVi1SVyIsIlNELUFQSS1SQi1SIiwiU0hJLVAtTEFCLVJXIiwiU0hJLVAtSEFORC1SVyIsIlNELVAtTUJUVi1SIiwiU0hJLVAtRU1SUi1SVyIsIlNELVAtREYtUiIsIlNELVAtTUJERi1SVyIsIlNELVAtREYtUlciLCJTRC1QLVRFLVIiLCJTSEktUC1GM1ItUlciLCJTSEktUC1GMy1SVyIsIlNISS1QLVVQRFJBVy1SVyIsIlNISS1QLUYxLVJXIiwiU0QtQVBJLUdPQy1SVyIsIlNELVAtQlRELVIiLCJTSU4tUi1BQ0MiLCJTRC1BUEktVFYtUiIsIlNELVAtU0MtUiIsIlNELVAtU1MtUiIsIlNISS1QLVNJQ1UtUlciLCJTRC1QLVNWRi1SIiwiU1QtQVBJLUFNQy1SVyIsIlNISS1QLUNIRU1PLVJXIiwiU0hJLVAtRlJOVC1SVyIsIlNELUFQSS1UTS1SIiwiU1QtUC1UREwtUlciLCJTSEktUC1SRUNSLVJXIiwiU0QtUC1QTC1SIiwiU0hJLVAtTklDVS1SVyIsIlNELVAtU0lSLVJXIiwiU1QtUC1OVEYtUlciLCJTRC1QLUdQQi1SVyIsIlNISS1QLUhSLVJXIiwiU0hJLVAtTklDVVItUlciLCJTRC1QLUhNU1NTLVJXIiwiU0QtUC1TVkYtUlciLCJTRC1QLUxTQy1SVyIsIlNELVAtTEdTQy1SIiwiU0QtQVBJLUlWTS1SIiwiU0QtUC1ITVNQQi1SVyIsIlNISS1QLUYyLVJXIiwiU0hJLVAtRU1SLVJXIiwiU0hJLVAtRjJTLVJXIiwiU0QtUC1URC1SVyIsIlNULUFQSS1FTVAtUiIsIlNULUFQSS1CUkQtUlciLCJTRC1QLUhNU1RELVJXIiwiU0hJLVAtVFJBSU4tUlciLCJTRC1QLUxTRC1SVyIsIlNELVAtR1BELVIiLCJHUC1QLUdDTi1SIiwiU1QtUi1BIiwiU0hJLVAtWFJBWS1SVyIsIlNULVAtREVTLVJXIiwiU0QtUC1ITVNHQy1SIiwiU1QtUC1DTVQtUiIsIlNELUFQSS1UTS1SVyIsIlNELVAtSE1TU1AtUiIsIlNELVAtTFJDLVIiLCJTSEktUC1NSUNVLVJXIiwiU0QtUi1BIiwiU0QtUC1CRy1SIiwiU0QtQVBJLVRELVIiLCJTSEktUC1GMlItUlciLCJTRC1QLUdTUC1SIiwiU0hJLVAtQ1QtUlciLCJTRC1QLVNJUi1SIiwiU0hJLVAtSU5DIiwiU0QtUC1VUEItUiIsIlNELVAtU0NVLVJXIiwiU0QtUC1TU1UtUlciLCJTSEktUC1IQU5EUi1SVyIsIlNELVAtUEctUlciLCJTRC1QLVVQQi1SVyIsIlNISS1QLU1SSS1SVyIsIlNISS1QLUdFVFJBVy1SVyIsIlNELVAtTFBJLVIiLCJTSEktUC1QSEFSTS1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc0NDk4MTE1LCJleHAiOjE3NzQ1ODUxMTUsImp0aSI6ImQ0MjBlOGUxLTI1NDUtNDY4Ny1hNzM1LWE5YWJhZWQ2NzBkMyJ9.dPJqTkhX-ObzQbPsBBwRmjI9TGHRE8akLMXynCtQ-Ad3MC3ivH37Vf7UgwLxnVHo8t0ZDlPtLK27SLY_c450k5NlaFqSD7MA2lIZPYU956hGeoZRfZshdo7YlW6eLsfJv3T1ILkq00YJ1wkfBZUHC78K-irC_RQgetkF2gz3fLch6G2UGmNAt2SzBSCJ5JRYxcHMdi4Z7XmtsiMJSFhhkZC_lX50uhLr9RgBT82vIw0-jVE7nRfyFo9C0l89pWwwdqTl9irvBm6Rqx33XobvSOzhf0o7h1ccx30hfwQOdW5pLPmimFOo39q5kgduPye3LuzQdGF7SC1HECugWkD7fw";
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

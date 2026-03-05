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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoiUGFydGhpcGFuMzEyMTQ2MUBnbWFpbC5jb20iLCJuYW1lIjoiTS5QYXJ0aGliYW4iLCJhbGxvd2VkLWFjdGlvbnMiOlsiU1QtUC1CUkQtUiIsIlNELVAtTUlTLVIiLCJTRC1QLUJHLVJXIiwiU0QtQVBJLUNOLVIiLCJTRC1QLVNTLVJXIiwiU1QtUC1ERVMtUiIsIlNJTi1BUEktU0YtUiIsIlNULVAtTlRGLVIiLCJTSEktUC1GMVMtUlciLCJTSEktUC1FWFAtUlciLCJTSEktUC1NSUNVUi1SVyIsIlNISS1QLVNJQ1VSLVJXIiwiTURDLVItUERDIiwiU0QtUC1URC1SIiwiU0hJLVAtRjFSLVJXIiwiU0hJLVAtTU9DSy1SVyIsIlNELVAtUEQtUiIsIlNISS1QLU1SRC1SVyIsIk1EQy1QLUdPUC1SIiwiU0QtUC1MQk4tUiIsIlNISS1QLU9ULVJXIiwiU0hJLVAtVFJBSU5SLVJXIiwiU0QtUC1CVEQtUlciLCJNREMtQVBJLUFHUC1SVyIsIlNELVItU01DIiwiU0QtUC1CQS1SVyIsIlNISS1QLURJQS1SVyIsIk1EQy1BUEktU0dQLVJXIiwiU0QtUC1DSEMtUiIsIlNISS1QLUYyU1ItUlciLCJTSEktUC1SRUMtUlciLCJTVC1QLVNOTy1SVyIsIlNELVAtU1NVLVIiLCJTRC1QLUNIQy1SVyIsIk1EQy1BUEktUEdQLVJXIiwiTURDLUFQSS1BVC1SIiwiU0QtUC1MQkMtUlciLCJTSEktUC1DSEVNT1ItUlciLCJTSS1SLUlOREUiLCJNREMtUC1HUFAtUiIsIlNULVAtQ01ULVJXIiwiU0lOLUFQSS1PUlItUiIsIlNELVAtUEItUlciLCJNREMtUC1BQVUtUlciLCJTSEktUC1QSFktUlciLCJTRC1QLUdQQi1SIiwiU0QtUC1MVE0tUlciLCJTRC1QLVBPVi1SIiwiU0hJLVAtT1BELVJXIiwiU0hJLVAtRjFTUi1SVyIsIkVSLVItRVJBIiwiU1QtUC1UREwtUiIsIlNJTi1BUEktSUYtUiIsIlNELVAtU1AtUiIsIlNELVItQ0VPIiwiU0hJLVAtRk9STS1SVyIsIlNULUFQSS1DUkQtUlciLCJTSEktUC1BVkFJTC1SVyIsIlNELVAtUEYtUlciLCJFUi1QLUVSQVMtUlciLCJTRC1QLVBPVi1SVyIsIlNELUFQSS1SQi1SIiwiU0hJLVAtTEFCLVJXIiwiU0hJLVAtSEFORC1SVyIsIlNISS1QLUVNUlItUlciLCJNREMtQVBJLU9HUC1SVyIsIlNELVAtREYtUiIsIk1EQy1QLVBOUFItUiIsIk1EQy1BUEktQ0dQLVJXIiwiU0QtUC1ERi1SVyIsIk1EQy1QLUdTUC1SIiwiU0hJLVAtRjNSLVJXIiwiU0hJLVAtRjMtUlciLCJTSEktUC1VUERSQVctUlciLCJTSEktUC1GMS1SVyIsIk1EQy1QLUdBUC1SIiwiU0QtUC1CVEQtUiIsIlNJTi1SLUFDQyIsIlNELUFQSS1UVi1SIiwiU0QtUC1TQy1SIiwiU0QtUC1TUy1SIiwiU0hJLVAtU0lDVS1SVyIsIlNELVAtUkItUlciLCJTVC1BUEktQU1DLVJXIiwiU0hJLVAtQ0hFTU8tUlciLCJTSEktUC1GUk5ULVJXIiwiU0QtQVBJLVRNLVIiLCJTVC1QLVRETC1SVyIsIlNISS1QLVJFQ1ItUlciLCJTRC1QLVBMLVIiLCJTSEktUC1OSUNVLVJXIiwiU1QtUC1OVEYtUlciLCJTSEktUC1IUi1SVyIsIlNISS1QLU5JQ1VSLVJXIiwiU0QtQVBJLVNTLVJXIiwiU0hJLVAtRjItUlciLCJTSEktUC1FTVItUlciLCJTSEktUC1GMlMtUlciLCJTRC1QLVRELVJXIiwiU1QtQVBJLUVNUC1SIiwiU1QtQVBJLUJSRC1SVyIsIk1EQy1BUEktUERDLVJXIiwiU0hJLVAtVFJBSU4tUlciLCJTRC1QLUdQRC1SIiwiR1AtUC1HQ04tUiIsIlNULVItQSIsIlNISS1QLVhSQVktUlciLCJTVC1QLURFUy1SVyIsIk1EQy1QLUdDUC1SIiwiU1QtUC1DTVQtUiIsIlNELUFQSS1UTS1SVyIsIlNELVAtTFJDLVIiLCJTSEktUC1NSUNVLVJXIiwiU0QtUC1CRy1SIiwiU0QtQVBJLVRELVIiLCJTSEktUC1GMlItUlciLCJTRC1QLUdTUC1SIiwiU0hJLVAtQ1QtUlciLCJTSEktUC1JTkMiLCJTRC1QLVNDVS1SVyIsIlNELVAtU1NVLVJXIiwiU0hJLVAtSEFORFItUlciLCJTRC1QLVBHLVJXIiwiU0QtUC1VUEItUlciLCJTSEktUC1NUkktUlciLCJTSEktUC1HRVRSQVctUlciLCJTRC1QLUxQSS1SIiwiU0hJLVAtUEhBUk0tUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3MjUxMDQ5OCwiZXhwIjoxNzcyNTk3NDk4LCJqdGkiOiJiM2I1OWFlOC0xZjg4LTRmODctOGEyNC04MGZhZjIzOWJhZTMifQ.DjwumEJknMqwcvuqQ76l88JWIlkjHIhXpaBQZWRvyAUDZSgaCgfZSOBNdt23nl2J9udrMBNkl6HVCeRT6esmXs5UFpdmTzM-LLvaI4CLG3mNxfm5oph8IRJRRJRifHH2Rr24g59R57mwCAqAN9vJxFbWRGUxR56UEo1AMnhryRhBks5PTy1foJG8wQWWR9_qfFyWVZV0p09R9mUYt6FkkfXqyN-lypVrWpWvmArou3RXteVji_7U72NnGdo8FHykiW2WrmQbBm8L18bPJvSTg9mxdVvp5LbppIiWKKHbIfE293Rpv0AydwK7yBBX3Za_gbikoxHJEQqheSdWc1OBNw"
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

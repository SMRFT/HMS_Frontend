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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoiUGFydGhpcGFuMzEyMTQ2MUBnbWFpbC5jb20iLCJuYW1lIjoiTS5QYXJ0aGliYW4iLCJhbGxvd2VkLWFjdGlvbnMiOlsiU1QtUC1CUkQtUiIsIlNELVAtTUlTLVIiLCJTSS1SLUlORElOIiwiU0QtQVBJLUNOLVIiLCJTRC1QLVNTLVJXIiwiU1QtUC1ERVMtUiIsIlNISS1QLVVQRC1SVyIsIlNJTi1BUEktU0YtUiIsIlNULVAtTlRGLVIiLCJTSEktUC1GMVMtUlciLCJTSEktUC1FWFAtUlciLCJTSEktUC1NSUNVUi1SVyIsIlNISS1QLVNJQ1VSLVJXIiwiTURDLVItUERDIiwiU0QtUC1URC1SIiwiU0hJLVAtRjFSLVJXIiwiU0hJLVAtTU9DSy1SVyIsIlNELVAtUEQtUiIsIlNISS1QLU1SRC1SVyIsIk1EQy1QLUdPUC1SIiwiU0hJLVAtT1QtUlciLCJTSEktUC1UUkFJTlItUlciLCJTRC1QLUJURC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiU0hJLVAtRElBLVJXIiwiU0QtUC1DSEMtUiIsIk1EQy1BUEktU0dQLVJXIiwiU0hJLVAtRjJTUi1SVyIsIlNISS1QLVJFQy1SVyIsIlNULVAtU05PLVJXIiwiU0QtUC1TU1UtUiIsIlNELVAtQ0hDLVJXIiwiTURDLUFQSS1QR1AtUlciLCJNREMtQVBJLUFULVIiLCJTSEktUC1DSEVNT1ItUlciLCJNREMtUC1HUFAtUiIsIlNULVAtQ01ULVJXIiwiU0lOLUFQSS1PUlItUiIsIk1EQy1QLUFBVS1SVyIsIlNISS1QLVBIWS1SVyIsIlNELVAtUE9WLVIiLCJTSEktUC1PUEQtUlciLCJTSEktUC1GMVNSLVJXIiwiRVItUi1FUkEiLCJTVC1QLVRETC1SIiwiU0lOLUFQSS1JRi1SIiwiU0QtUi1DRU8iLCJTSEktUC1GT1JNLVJXIiwiU1QtQVBJLUNSRC1SVyIsIlNISS1QLUFWQUlMLVJXIiwiRVItUC1FUkFTLVJXIiwiU0QtUC1QT1YtUlciLCJTSEktUC1ERUwtUlciLCJTRC1BUEktUkItUiIsIlNISS1QLUxBQi1SVyIsIlNISS1QLUhBTkQtUlciLCJTSEktUC1FTVJSLVJXIiwiTURDLUFQSS1PR1AtUlciLCJTRC1QLURGLVIiLCJNREMtUC1QTlBSLVIiLCJNREMtQVBJLUNHUC1SVyIsIlNELVAtREYtUlciLCJNREMtUC1HU1AtUiIsIlNISS1QLUYzUi1SVyIsIlNISS1QLUYzLVJXIiwiU0hJLVAtVVBEUkFXLVJXIiwiU0hJLVAtRjEtUlciLCJNREMtUC1HQVAtUiIsIlNELVAtQlRELVIiLCJTSU4tUi1BQ0MiLCJTRC1BUEktVFYtUiIsIlNELVAtU1MtUiIsIlNISS1QLVNJQ1UtUlciLCJTVC1BUEktQU1DLVJXIiwiU0hJLVAtQ0hFTU8tUlciLCJTSEktUC1GUk5ULVJXIiwiU0QtQVBJLVRNLVIiLCJTVC1QLVRETC1SVyIsIlNISS1QLVJFQ1ItUlciLCJTRC1QLVBMLVIiLCJTSEktUC1OSUNVLVJXIiwiU1QtUC1OVEYtUlciLCJTSEktUC1IUi1SVyIsIlNISS1QLU5JQ1VSLVJXIiwiU0hJLVAtRjItUlciLCJTSEktUC1FTVItUlciLCJTSEktUC1GMlMtUlciLCJTRC1QLVRELVJXIiwiU1QtQVBJLUVNUC1SIiwiU1QtQVBJLUJSRC1SVyIsIk1EQy1BUEktUERDLVJXIiwiU0hJLVAtVFJBSU4tUlciLCJTRC1QLUdQRC1SIiwiR1AtUC1HQ04tUiIsIlNULVItQSIsIlNISS1QLVhSQVktUlciLCJTVC1QLURFUy1SVyIsIk1EQy1QLUdDUC1SIiwiU1QtUC1DTVQtUiIsIlNISS1QLU1JQ1UtUlciLCJTRC1QLUJHLVIiLCJTRC1BUEktVEQtUiIsIlNISS1QLUYyUi1SVyIsIlNISS1QLUNULVJXIiwiU0hJLVAtSU5DIiwiU0QtUC1TQ1UtUlciLCJTRC1QLVNTVS1SVyIsIlNISS1QLUhBTkRSLVJXIiwiU0hJLVAtREVMUkFXLVJXIiwiU0hJLVAtTVJJLVJXIiwiU0hJLVAtR0VUUkFXLVJXIiwiU0hJLVAtUEhBUk0tUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3MzYzMTkzNywiZXhwIjoxNzczNzE4OTM3LCJqdGkiOiIyYmI4YjZhOC01ZDcwLTRiMjEtYTI4OC0xOWY2MjhlMGU4OTcifQ.B6Xlubs3DSnQlppSsmittqBcT2waR3ljr9Zpk5K5OplYynVSIv3Rzri79tu5XbDcFC0eC69WgOSH5T7ezHPSYYI7nRPpcZjxuT4A7eVfAEtKQRGKRhCqGIRcP6OrG3oAJmgG5r8L3TP5B0ftUTAt4ExmdN7gyZGxaIBqpf6H42o6gJf2cG842_zE0TEeU-ve74U_HWVEVgbo-qxmX7Cz8mPru1ouWTDJJmdDnNKd6TfWBtPYJ9DPfBorgfQltoCpk_8yyOwexdN8zWNZhXzH9JwSMc3lxHpzQ_TLum70Y8pk5Mysb-J6j0k1YR1iKx0qt-7Zfu6U3fOPYg_Z2KELyA"
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

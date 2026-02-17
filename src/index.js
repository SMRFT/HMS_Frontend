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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoiUGFydGhpcGFuMzEyMTQ2MUBnbWFpbC5jb20iLCJuYW1lIjoiTS5QYXJ0aGliYW4iLCJhbGxvd2VkLWFjdGlvbnMiOlsiU1QtUC1CUkQtUiIsIlNELVAtTUlTLVIiLCJTRC1QLUJHLVJXIiwiU0QtQVBJLUNOLVIiLCJTRC1QLVNTLVJXIiwiU1QtUC1ERVMtUiIsIlNJTi1BUEktU0YtUiIsIlNULVAtTlRGLVIiLCJTSEktUC1GMVMtUlciLCJTSEktUC1FWFAtUlciLCJTSEktUC1NSUNVUi1SVyIsIlNISS1QLVNJQ1VSLVJXIiwiTURDLVItUERDIiwiU0QtUC1URC1SIiwiU0hJLVAtRjFSLVJXIiwiU0hJLVAtTU9DSy1SVyIsIlNELVAtUEQtUiIsIlNISS1QLU1SRC1SVyIsIk1EQy1QLUdPUC1SIiwiU0QtUC1MQk4tUiIsIlNISS1QLU9ULVJXIiwiU0hJLVAtVFJBSU5SLVJXIiwiU0QtUC1CVEQtUlciLCJNREMtQVBJLUFHUC1SVyIsIlNELVItU01DIiwiU0QtUC1CQS1SVyIsIlNISS1QLURJQS1SVyIsIk1EQy1BUEktU0dQLVJXIiwiU0QtUC1DSEMtUiIsIlNISS1QLUYyU1ItUlciLCJTSEktUC1SRUMtUlciLCJTVC1QLVNOTy1SVyIsIlNELVAtU1NVLVIiLCJTRC1QLUNIQy1SVyIsIk1EQy1BUEktUEdQLVJXIiwiTURDLUFQSS1BVC1SIiwiU0QtUC1MR0xELVIiLCJTSEktUC1DSEVNT1ItUlciLCJTSS1SLUlOREUiLCJNREMtUC1HUFAtUiIsIlNULVAtQ01ULVJXIiwiU0lOLUFQSS1PUlItUiIsIlNELVAtUEItUlciLCJNREMtUC1BQVUtUlciLCJTSEktUC1QSFktUlciLCJTRC1QLUdQQi1SIiwiU0QtUC1QT1YtUiIsIlNISS1QLU9QRC1SVyIsIlNISS1QLUYxU1ItUlciLCJFUi1SLUVSQSIsIlNULVAtVERMLVIiLCJTSU4tQVBJLUlGLVIiLCJTRC1QLVNQLVIiLCJTRC1SLUNFTyIsIlNISS1QLUZPUk0tUlciLCJTVC1BUEktQ1JELVJXIiwiU0hJLVAtQVZBSUwtUlciLCJTRC1QLVBGLVJXIiwiU0QtUC1MVVNDRC1SVyIsIkVSLVAtRVJBUy1SVyIsIlNELVAtUE9WLVJXIiwiU0QtQVBJLVJCLVIiLCJTRC1QLUhNU0dCLVIiLCJTSEktUC1MQUItUlciLCJTSEktUC1IQU5ELVJXIiwiU0hJLVAtRU1SUi1SVyIsIk1EQy1BUEktT0dQLVJXIiwiU0QtUC1ERi1SIiwiTURDLVAtUE5QUi1SIiwiTURDLUFQSS1DR1AtUlciLCJTRC1QLURGLVJXIiwiTURDLVAtR1NQLVIiLCJTSEktUC1GM1ItUlciLCJTSEktUC1GMy1SVyIsIlNISS1QLVVQRFJBVy1SVyIsIlNISS1QLUYxLVJXIiwiTURDLVAtR0FQLVIiLCJTRC1QLUJURC1SIiwiU0lOLVItQUNDIiwiU0QtQVBJLVRWLVIiLCJTRC1QLVNDLVIiLCJTRC1QLVNTLVIiLCJTSEktUC1TSUNVLVJXIiwiU0QtUC1SQi1SVyIsIlNULUFQSS1BTUMtUlciLCJTSEktUC1DSEVNTy1SVyIsIlNISS1QLUZSTlQtUlciLCJTRC1BUEktVE0tUiIsIlNULVAtVERMLVJXIiwiU0hJLVAtUkVDUi1SVyIsIlNELVAtUEwtUiIsIlNISS1QLU5JQ1UtUlciLCJTVC1QLU5URi1SVyIsIlNISS1QLUhSLVJXIiwiU0hJLVAtTklDVVItUlciLCJTRC1QLUxTQ0wtUlciLCJTRC1QLUxTQy1SVyIsIlNELVAtTEdTQy1SIiwiU0QtQVBJLVNTLVJXIiwiU0QtUC1ITVNQQi1SVyIsIlNISS1QLUYyLVJXIiwiU0hJLVAtRU1SLVJXIiwiU0hJLVAtRjJTLVJXIiwiU0QtUC1URC1SVyIsIlNULUFQSS1FTVAtUiIsIlNULUFQSS1CUkQtUlciLCJNREMtQVBJLVBEQy1SVyIsIlNISS1QLVRSQUlOLVJXIiwiU0QtUC1MU0QtUlciLCJTRC1QLUdQRC1SIiwiR1AtUC1HQ04tUiIsIlNULVItQSIsIlNISS1QLVhSQVktUlciLCJTVC1QLURFUy1SVyIsIk1EQy1QLUdDUC1SIiwiU1QtUC1DTVQtUiIsIlNELUFQSS1UTS1SVyIsIlNELVAtTFJDLVIiLCJTSEktUC1NSUNVLVJXIiwiU0QtUC1CRy1SIiwiU0QtQVBJLVRELVIiLCJTSEktUC1GMlItUlciLCJTRC1QLUdTUC1SIiwiU0hJLVAtQ1QtUlciLCJTSEktUC1JTkMiLCJTRC1QLVNDVS1SVyIsIlNELVAtU1NVLVJXIiwiU0hJLVAtSEFORFItUlciLCJTRC1QLVBHLVJXIiwiU0QtUC1VUEItUlciLCJTSEktUC1NUkktUlciLCJTSEktUC1HRVRSQVctUlciLCJTRC1QLUxQSS1SIiwiU0hJLVAtUEhBUk0tUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3MDg4NDI0MSwiZXhwIjoxNzcwOTcxMjQxLCJqdGkiOiJiOWU5ZmQ5Zi01YTNiLTRhNmEtODAwYS1kOTI4MDhlZDA2ZDAifQ.K7BdbHZd9Kgat_njbSxceLSMmZ1MzVu3Ew7ffh_11ZLrctaS9k562MLtIqqRge2mFQXdeZgG_xt8IPRzXFIm4xaQe2Rp-wl0SRnn9I57nPWVBL3ZChQ4_PMzLOtGe2JxDAobVox8T1RNf5JQa8smfTxp3ihhaBo75lPYOGJPnL-eRrxxxdoe9ynycTJiqiu8H1tM0jD4grdjz1O6-frBRmoXk33_zK7DAt_KaCTnXb2_1rlb_jp44TP33LbBhArk1Gq1SCkPJoeZUOE9jNubDlDFZ_DUSBVGfdLqCIi5dCUGNitIYHSEhKjz0VmAP7hYFU1G5ASQjdV_JavLcL733w";
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
    return "Pharmacist"; // Default role
  }
  console.log("Allowed actions:", allowedActions);
  if (allowedActions.includes("HMS-R-PH")) {
    return "Pharmacist";
  } else {
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

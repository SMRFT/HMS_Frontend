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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDAwMiIsImVtYWlsIjoibmFqbWFzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiTmFqbWEiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1CVEQtUlciLCJTRC1BUEktVE0tUiIsIlNELVAtR1BELVIiLCJTRC1BUEktUkNMLVJXIiwiU0QtUC1CVEQtUiIsIlNISS1QLVRSQUlOLVJXIiwiU0QtUC1TQy1SIiwiU0QtUC1NQlBELVIiLCJNREMtQVBJLUxCTi1SIiwiU0QtUC1ITVNTUy1SIiwiU1QtUC1ERVMtUiIsIk1EQy1BUEktUkRMLVIiLCJFUi1QLUVSQVMtUlciLCJTRC1QLUNIQy1SVyIsIlNELUFQSS1NSVMtUlciLCJTRC1QLUxHTFQtUiIsIlNELVAtU1NVLVIiLCJNREMtUC1SRUctUiIsIlNELVAtUE9WLVIiLCJTRC1BUEktUkItUiIsIlNELVAtU0dBQy1SIiwiU1QtUi1BIiwiTURDLVAtQVNNLVJXIiwiTURDLVAtT1NCLVJXIiwiU0QtUC1QQi1SVyIsIkhNUy1BUEktRFJNLVJXIiwiU1RSLVAtSUNTLVIiLCJNREMtQVBJLVRIUi1SIiwiU0QtQVBJLUNOLVIiLCJTRC1BUEktR0QtUiIsIlNELVAtTUlTLVIiLCJITVMtQVBJLUlVU0ctUiIsIlNULVAtTlRGLVJXIiwiTURDLVAtUFRFLVJXIiwiU0QtQVBJLUdSLVJXIiwiRVItUi1FUkEiLCJNREMtUC1QTlAtUlciLCJTRC1BUEktR09SLVJXIiwiU0QtUC1QRy1SIiwiU0QtUi1BIiwiU0QtQVBJLUlWTS1SIiwiU0QtUC1TVkYtUlciLCJHTC1QLVJTRS1SVyIsIlNELVAtVEQtUiIsIkhNUy1BUEktSVVTRy1SVyIsIk1EQy1QLUNERS1SVyIsIlNELVAtVVBCLVIiLCJTRC1QLUJBLVJXIiwiSE1TLUFQSS1JTVJJLVJXIiwiU0QtUC1ITVNTUC1SVyIsIk1EQy1BUEktR0FTLVIiLCJTVFItQVBJLUlMLVJXIiwiU0QtUC1MU0QtUlciLCJTRC1QLVNTLVIiLCJTRC1QLVNIRi1SIiwiR0wtUC1FUC1SVyIsIlNELVAtTEdTQy1SIiwiU0QtUC1MU0NMLVIiLCJTRC1QLUhNU0NTLVIiLCJTRC1QLVVQQi1SVyIsIlNELVAtVEUtUiIsIlNELVAtU0dBQy1SVyIsIlNISS1QLUVYUC1SVyIsIlNUUi1BUEktVFJMLVIiLCJTVFItQVBJLVRJTi1SVyIsIlNELUFQSS1WUC1SVyIsIlNELVAtUEwtUiIsIkhNUy1BUEktSUItUlciLCJNREMtUC1TT1ItUiIsIlNELUFQSS1WQy1SVyIsIlNULUFQSS1BTUMtUlciLCJTVFItQVBJLVRSTFItUiIsIkhNUy1BUEktSU1SSS1SIiwiU0QtQVBJLUdDLVJXIiwiSE1TLUFQSS1JQ1QtUiIsIlNELVAtUEYtUiIsIlNELVAtTFNDLVJXIiwiU1RSLUFQSS1JTCIsIlNELVAtSE1TU1AtUiIsIk1EQy1BUEktQ0RSLVIiLCJITVMtQVBJLUlDVC1SVyIsIlNELVAtREYtUlciLCJTRC1QLUJHLVIiLCJTRC1QLUxHTEQtUiIsIlNULVAtVERMLVIiLCJTRC1QLU1CVFYtUiIsIlNELVAtVEQtUlciLCJHTC1QLU5EQy1SVyIsIlNULVAtQlJELVIiLCJTRC1QLUxQSS1SIiwiSE1TLUFQSS1EUk0tUiIsIlNELVAtU1NVLVJXIiwiU1RSLUFQSS1USU4tUiIsIlNELVAtTFJDLVIiLCJTRC1BUEktUFItUiIsIlNELVAtU0NVLVJXIiwiU1RSLUFQSS1WTC1SVyIsIlNULUFQSS1DUkQtUlciLCJTVFItQVBJLVRSTC1SVyIsIlNELVAtR1NQLVIiLCJTRC1QLVNJUi1SIiwiU0QtUC1QRC1SIiwiU0QtUC1ITVNMRC1SIiwiU1QtUC1TTk8tUlciLCJTRC1QLUhNU1RELVJXIiwiSE1TLUFQSS1TVU0tUiIsIlNELVAtSE1TUEItUiIsIkdMLVAtRUFELVJXIiwiSE1TLUFQSS1JQi1SIiwiU0QtUC1DSEMtUiIsIlNELVAtSE1TR0MtUiIsIlNELVAtUEctUlciLCJTRC1QLUhNU1BTLVJXIiwiU1RSLVAtVElOUi1SVyIsIlNULUFQSS1CUkQtUlciLCJTVC1QLURFUy1SVyIsIlNELVAtREYtUiIsIlNUUi1BUEktVkwtUiIsIkhNUy1BUEktU1VNLVJXIiwiTURDLVAtUE5QUi1SIiwiTURDLVAtUkVHLVJXIiwiU0QtUC1ITVNURC1SIiwiU0QtQVBJLU1CVEQtUlciLCJTRC1QLUhNU1BCLVJXIiwiU0QtUC1QT1YtUlciLCJNREMtQVBJLVJUUy1SIiwiU1RSLVAtVElOUi1SIiwiU0QtUC1HUEItUlciLCJTRC1QLUJBLVIiLCJTRC1QLUxCTi1SIiwiU1QtUC1DTVQtUlciLCJTRC1QLVRFLVJXIiwiU0QtQVBJLUlWTS1SVyIsIlNELVAtSE1TU0QtUlciLCJTRC1QLVNWRi1SIiwiU1QtQVBJLUVNUC1SIiwiU1QtUC1UREwtUlciLCJTVC1BUEktVFJMUi1SVyIsIlNELVAtTEdELVJXIiwiR1AtUC1HQ04tUiIsIlNELVAtSE1TU1MtUlciLCJTRC1QLVNQLVIiLCJTVFItUi1BIiwiR0wtUC1QLVJXIiwiR0wtUC1BTkQtUlciLCJNREMtUC1UUkItUlciLCJTRC1QLVNTLVJXIiwiTURDLVAtUE5QLVIiLCJNREMtUC1SREUtUlciLCJTSEktUC1JTkMiLCJNREMtQVBJLVBBVC1SIiwiU0QtUC1NQkRGLVJXIiwiR0wtUC1FRC1SVyIsIlNELVAtU0lSLVJXIiwiU0QtQVBJLUdPQy1SVyIsIlNELVAtU0hGLVJXIiwiU1RSLUFQSS1JTC1SIiwiSE1TLUFQSS1JWFJBWS1SVyIsIlNULVAtTlRGLVIiLCJTRC1QLVBCLVIiLCJITVMtQVBJLUlYUkFZLVIiLCJNREMtQVBJLUFULVIiLCJTVC1QLUNNVC1SIiwiU0QtQVBJLVRWLVIiLCJNREMtQVBJLUFULVJXIiwiR0wtUC1FQlQtUlciLCJTRC1BUEktVEQtUiIsIlNELVAtTFVTQ0QtUlciLCJTRC1BUEktVE0tUlciLCJTRC1QLVBGLVJXIiwiU0QtUC1ITVNVQy1SVyIsIkdMLVAtRUwtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSIsIlNIQjAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3MDI2Mjc4MiwiZXhwIjoxNzcwMzQ5NzgyLCJqdGkiOiJiODNhMDU4Yi0yZjE0LTQ3MTgtYjMzOC05ODdkMmIyM2E2OWEifQ.dN9YkVzMoBkoGxAJOxpoIWvjS40G6Hsio9iaibeiLYKc_DC6auiqTi9Er5jNor6qwtKmqQs8mxaFsW13Zc7nGoasBb3gE4ystt7-wsgP6IwA3XgUNFF_HYvJ0-x5u2LpH10hVTU3_sn9CW7KtjPRDOG_adZZNMvSbuMsg46UwEc9OXQPzJlaV4TpKBVtchR-NiAHHAdFgQLbRVb70mYDZuLykM4YLeBY3dqT6lc1wdShW79ZnyLJsTPUNQ6w-QiB7woO3gI9hKgSL6SBiY_D1OZuApvt7zSqYLwSmKqAAQlaWyKpw1u2a34BDt3SMb20V-FRem0v46XLjWqwH6H4Zg";
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

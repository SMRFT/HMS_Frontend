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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoiUGFydGhpcGFuMzEyMTQ2MUBnbWFpbC5jb20iLCJuYW1lIjoiTS5QYXJ0aGliYW4iLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1CVEQtUlciLCJTRC1BUEktVE0tUiIsIlNELVAtR1BELVIiLCJTSEktUC1FTVItUlciLCJFUi1QLUVSU0QtUlciLCJTSEktUC1UUkFJTi1SVyIsIlNELVAtQlRELVIiLCJTSEktUC1GMlItUlciLCJTRC1QLVNDLVIiLCJTVC1QLURFUy1SIiwiU0QtUC1DSEMtUlciLCJTRC1BUEktU1MtUlciLCJTRC1QLVNTVS1SIiwiU0QtUC1QT1YtUiIsIlNELUFQSS1SQi1SIiwiU1QtUi1BIiwiU0hJLVAtTVJJLVJXIiwiRVItUi1FUlAiLCJTRC1QLVBCLVJXIiwiTURDLVItUERDIiwiU0QtQVBJLUNOLVIiLCJTSEktUC1QSFktUlciLCJTRC1QLU1JUy1SIiwiU0hJLVAtUEhBUk0tUlciLCJTVC1QLU5URi1SVyIsIlNISS1QLU1SRC1SVyIsIlNISS1QLUYzLVJXIiwiU0hJLVAtQ0hFTU9SLVJXIiwiR0wtUC1SU0UtUlciLCJTRC1QLVRELVIiLCJTSEktUC1PVC1SVyIsIlNISS1QLUNIRU1PLVJXIiwiTURDLUFQSS1DR1AtUlciLCJFUi1QLUVSUC1SIiwiU0hJLVAtWFJBWS1SVyIsIk1EQy1QLUdDUC1SIiwiU0QtUC1CQS1SVyIsIlNISS1QLUYxUy1SVyIsIkVSLVAtRVJBUy1SIiwiU0hJLVAtQVZBSUwtUlciLCJTRC1QLVNTLVIiLCJTRC1QLUxTRC1SVyIsIlNELVAtSE1TR0ItUiIsIkdMLVAtRVAtUlciLCJTRC1QLUxHU0MtUiIsIlNELVAtVVBCLVJXIiwiU0hJLVAtRk9STS1SVyIsIlNELVAtQkctUlciLCJFUi1QLUVSVVMtUlciLCJTSEktUC1FWFAtUlciLCJTRC1QLUxTQ0wtUlciLCJTRC1QLVBMLVIiLCJTVC1BUEktQU1DLVJXIiwiU0hJLVAtTklDVVItUlciLCJTSEktUC1UUkFJTlItUlciLCJNREMtQVBJLU9HUC1SVyIsIlNELVAtTFNDLVJXIiwiU0hJLVAtRjJTUi1SVyIsIkVSLVAtRVJHQVMtUiIsIlNELVAtREYtUlciLCJTRC1QLUJHLVIiLCJTVC1QLVRETC1SIiwiU0QtUC1MR0xELVIiLCJTRC1QLVRELVJXIiwiR0wtUC1OREMtUlciLCJTVC1QLUJSRC1SIiwiU0hJLVAtTUlDVVItUlciLCJTRC1QLUxQSS1SIiwiU0hJLVAtR0VUUkFXLVJXIiwiU0hJLVAtRjItUlciLCJTSEktUC1IQU5EUi1SVyIsIlNELVAtU1NVLVJXIiwiU0hJLVAtSEFORC1SVyIsIlNELVAtTFJDLVIiLCJTSEktUC1GUk5ULVJXIiwiTURDLUFQSS1QREMtUlciLCJTVC1BUEktQ1JELVJXIiwiU0QtUi1DRU8iLCJTSEktUC1GMS1SVyIsIlNELVAtR1NQLVIiLCJTRC1QLVBELVIiLCJTVC1QLVNOTy1SVyIsIk1EQy1BUEktUEdQLVJXIiwiTURDLVAtR1BQLVIiLCJHTC1QLUVBRC1SVyIsIlNELVAtQ0hDLVIiLCJTSEktUC1NT0NLLVJXIiwiU0QtUC1QRy1SVyIsIlNISS1QLUYxU1ItUlciLCJTSEktUC1SRUNSLVJXIiwiU1QtQVBJLUJSRC1SVyIsIlNULVAtREVTLVJXIiwiU0QtUC1ERi1SIiwiTURDLVAtQUFVLVJXIiwiTURDLVAtUE5QUi1SIiwiTURDLVAtR0FQLVIiLCJTRC1QLUhNU1BCLVJXIiwiU0QtUC1QT1YtUlciLCJTSEktUC1TSUNVUi1SVyIsIlNELVAtTEJOLVIiLCJTVC1QLUNNVC1SVyIsIlNISS1QLU5JQ1UtUlciLCJTRC1SLVNNQyIsIlNISS1QLU1JQ1UtUlciLCJTVC1BUEktRU1QLVIiLCJTVC1QLVRETC1SVyIsIlNISS1QLVNJQ1UtUlciLCJHUC1QLUdDTi1SIiwiU0hJLVAtT1BELVJXIiwiU0hJLVAtRU1SUi1SVyIsIlNELVAtU1AtUiIsIk1EQy1BUEktU0dQLVJXIiwiU0hJLVAtVVBEUkFXLVJXIiwiR0wtUC1QLVJXIiwiR0wtUC1BTkQtUlciLCJTRC1QLVNTLVJXIiwiU0hJLVAtSU5DIiwiR0wtUC1FRC1SVyIsIlNISS1QLUYyUy1SVyIsIlNISS1QLUNULVJXIiwiU0QtUC1HUEItUiIsIlNISS1QLUxBQi1SVyIsIlNISS1QLUYzUi1SVyIsIlNULVAtTlRGLVIiLCJNREMtUC1HT1AtUiIsIlNISS1QLUhSLVJXIiwiU0ktUi1JTkRFIiwiTURDLUFQSS1BVC1SIiwiU1QtUC1DTVQtUiIsIlNELUFQSS1UVi1SIiwiR0wtUC1FQlQtUlciLCJNREMtQVBJLUFHUC1SVyIsIlNISS1QLUYxUi1SVyIsIlNELVAtUkItUlciLCJTRC1BUEktVEQtUiIsIlNELVAtTFVTQ0QtUlciLCJNREMtUC1HU1AtUiIsIlNELUFQSS1UTS1SVyIsIlNELVAtUEYtUlciLCJTSEktUC1SRUMtUlciLCJTSEktUC1ESUEtUlciLCJHTC1QLUVMLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzAxNzQxMTIsImV4cCI6MTc3MDI2MTExMiwianRpIjoiY2JhNTEzYTItYzM1Zi00NGYwLThlZjItZTNjOTIxOGI2NjdiIn0.afyff1YoBOOI86muw7JHobLzqRLAmJJmWh9iIWFa0tflMl6USuHagjQ1d9rL-IrsIsZJjSFfRnNcAZ0bX6QX1nMoH5uteE1yNmLrszyeLPViANZyylsaOkxKwCxQ1POVHa7EYlBlSXtBQrhhquvNv_M2lITzPfnYj9IMt8QVVr0_8ebbRSfpDuwb0shpcX38PIESJaKwx0AtO6lOezV87xmV8zzl54YOd4u19IEEo2VIrJVFBlJjK6NuRg4ZWpVSer2muCjvazFgsglP0x9afLovuNSbKYfEOtdX591UoGjAJr2EeRLao64_VwygjEVXIgefnBlGyQ1pIsJEYDU7kA";
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

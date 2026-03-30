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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIlNISS1QLUYxUi1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiU0QtUC1TU1UtUlciLCJNREMtUC1BQVUtUlciLCJNREMtQVBJLUFULVIiLCJTSEktUC1OSUNVUi1SVyIsIlNULVAtQ01ULVJXIiwiU0hJLVAtUEhBUk0tUlciLCJNREMtUC1QTlBSLVIiLCJTVC1QLU5URi1SIiwiU0hJLVAtRjJTLVJXIiwiU0hJLVAtRjFTUi1SVyIsIlNISS1QLUYzLVJXIiwiU0hJLVAtUkVDLVJXIiwiSE1TLVAtSE1TUFMtUlciLCJHTC1QLUVBRC1SVyIsIlNELVAtUEwtUiIsIlNISS1QLUlOQyIsIkhNUy1QLVBBQ0siLCJITVMtQVBJLUlCIiwiR0wtUC1FQlQtUlciLCJITVMtUC1JTiIsIlNELVAtR1BELVIiLCJTSEktUC1OSUNVLVJXIiwiU0QtUC1TU1UtUiIsIlNELUFQSS1UVi1SIiwiSE1TLVAtT1BIIiwiSE1TLVAtVkVMIiwiU0QtUC1CRy1SIiwiU1QtUC1CUkQtUiIsIlNISS1QLUFWQUlMLVJXIiwiSE1TLVAtUlNIRlQiLCJNREMtQVBJLU9HUC1SVyIsIk1EQy1QLUdBUC1SIiwiR0wtUC1FRC1SVyIsIlNULVAtTlRGLVJXIiwiU0QtUC1URC1SVyIsIlNISS1QLUYyU1ItUlciLCJTRC1BUEktVEQtUiIsIlNELUFQSS1DTi1SIiwiR0wtUC1FTC1SVyIsIlNELVAtUE9WLVJXIiwiSE1TLUFQSS1TVU0iLCJTSEktUC1GMlItUlciLCJTVC1QLUNNVC1SIiwiSE1TLVAtU0lERUJBUiIsIlNELVAtVEQtUiIsIlNULVAtU05PLVJXIiwiSE1TLVAtQlVEIiwiU0hJLVAtT1BELVJXIiwiU0QtUC1DSEMtUiIsIlNELVAtU1MtUiIsIkhNUy1QLVJFRyIsIkhNUy1QIiwiRVItUi1FUkEiLCJITVMtUC1JTlZQIiwiR0wtUC1FUC1SVyIsIk1EQy1QLUdTUC1SIiwiU0hJLVAtSEFORFItUlciLCJITVMtUC1TSU5URU5UIiwiSE1TLVAtQ0NDIiwiU0lOLVAtSUNFLVIiLCJTSU4tQVBJLVNGLVIiLCJNREMtQVBJLVBEQy1SVyIsIlNISS1QLU1SRC1SVyIsIkhNUy1QLVJFTlEiLCJTSEktUC1NUkktUlciLCJHTC1QLVJTRS1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLVZJTkciLCJITVMtUC1WSVRNIiwiU0hJLVAtTUlDVS1SVyIsIkdELVAtR1AiLCJTSEktUC1GMVMtUlciLCJTSEktUC1HRVRSQVctUlciLCJTRC1QLUNIQy1SVyIsIkhNUy1BUEktSUNULVJXIiwiU0hJLVAtU0lDVS1SVyIsIlNULVItQ0RSIiwiSE1TLVAtQkxLIiwiU0QtUi1IUiIsIkhNUy1BUEktSVhSQVkiLCJTSEktUC1QSFktUlciLCJITVMtUC1HUk4iLCJNREMtQVBJLUFHUC1SVyIsIlNELVAtU1MtUlciLCJITVMtUC1TR1JOIiwiU0QtUC1NSVMtUiIsIkhNUy1BUEktSVVTRyIsIlNISS1QLVNJQ1VSLVJXIiwiU0hJLVAtRjEtUlciLCJTSEktUC1DVC1SVyIsIlNJTi1BUEktT1ItUlciLCJTVC1BUEktQU1DLVJXIiwiU0hJLVAtRU1SLVJXIiwiU0hJLVAtT1QtUlciLCJNREMtUC1HUFAtUiIsIlNISS1QLUZSTlQtUlciLCJTVC1BUEktQ1JELVJXIiwiU0QtUC1QT1YtUiIsIlNULUFQSS1FTVAtUiIsIlNISS1QLU1JQ1VSLVJXIiwiR0wtUC1QLVJXIiwiU0lOLUFQSS1JRi1SVyIsIlNJTi1QLUdJQy1SIiwiSE1TLUFQSS1JTVJJIiwiSE1TLUFQSS1EQVNIIiwiU0QtUC1QRC1SIiwiU0hJLVAtVFJBSU5SLVJXIiwiR0wtUC1BTkQtUlciLCJITVMtUC1SQklMTCIsIk1EQy1BUEktUEdQLVJXIiwiSE1TLUFQSS1WTSIsIlNULVAtREVTLVJXIiwiSE1TLVAtSE1TUFMiLCJTVC1BUEktQlJELVJXIiwiU0hJLVAtRElBLVJXIiwiSE1TLVAtRERBU0giLCJITVMtUC1EQiIsIlNISS1QLUVYUC1SVyIsIkhNUy1QLUlUIiwiU0QtUC1ERi1SVyIsIkVSLVAtRVJBUy1SVyIsIlNISS1QLUZPUk0tUlciLCJTSEktUC1IUi1SVyIsIlNELVAtREYtUiIsIlNULVItQSIsIkhNUy1BUEktSVVTRy1SVyIsIlNISS1QLU1PQ0stUlciLCJNREMtUi1QREMiLCJTVC1QLVRETC1SIiwiR0wtUC1OREMtUlciLCJTSEktUC1IQU5ELVJXIiwiSE1TLVAtV1IiLCJITVMtUC1JTlRFTlQiLCJITVMtQVBJLUlYUkFZLVJXIiwiU0QtUC1CVEQtUiIsIlNISS1QLUYzUi1SVyIsIlNELUFQSS1SQi1SIiwiTURDLUFQSS1TR1AtUlciLCJTVC1QLURFUy1SIiwiSE1TLUFQSS1JTVJJLVJXIiwiU0hJLVAtRjItUlciLCJITVMtUC1JTkEiLCJTSEktUC1YUkFZLVJXIiwiU0hJLVAtVVBEUkFXLVJXIiwiSE1TLUFQSS1JQ1QiLCJITVMtUC1ITVMiLCJTSU4tQVBJLUZVLVJXIiwiU0QtUi1DRU8iLCJTSEktUC1DSEVNTy1SVyIsIkhNUy1QLUFEQVNIIiwiU1QtUC1UREwtUlciLCJITVMtUC1BRE0iLCJITVMtUC1HUk5BIiwiU0hJLVAtUkVDUi1SVyIsIkhNUy1QLVJNIiwiU0lOLVItRU1QIiwiSE1TLUFQSS1EU1VNIiwiU0hJLVAtQ0hFTU9SLVJXIiwiSE1TLVAtSE1TSU5TIiwiTURDLVAtR0NQLVIiLCJTSEktUC1FTVJSLVJXIiwiU0ktUi1JTkRFIiwiTURDLVAtR09QLVIiLCJTSEktUC1UUkFJTi1SVyIsIkhNUy1QLVJDQVQiLCJITVMtUC1QSCIsIlNELVAtQlRELVJXIiwiU0hJLVAtTEFCLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiLCJTSEIwMDIiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiYWxsb3dlZC1vdXRsZXRzIjpbXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzQ4NDIyMDksImV4cCI6MTc3NDkyOTIwOX0.NA1Xtn5RT8D5zgw8zS9pFxfl__EvPiRICwm1ghzSsX2o3FZStyhCcMLZbahM10gQjNXxAoAxlj2yO53hXMTLTPRO1pYJkF4_YWO9EYdrbRRTS3Zj2rYxVQv1rCGj3bx2K18tpaIiJYRR4RNoL1ccf382-TEHP9FfZ1SMCoyW9gNsykE2HDihMihFrIZ9JTAq1M4Z6pjb-eMiki4DGdEw_WBQlWj0Q7J2GDcpSK82pc4GiRzLYo0jLv5WWlBKEvWarD1dsUZ1tkeqWwLPV57C0z-Mu39m7_j8xSizFylJ70VukUgrLrTERnaG2wGJyGgsGyNzDM5hHmN5YFUymTeyjQ";
  console.log(
    "🔧 Development token is empty - will redirect to login",
    dev_token,
  );
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

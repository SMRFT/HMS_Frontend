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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoiUGFydGhpcGFuMzEyMTQ2MUBnbWFpbC5jb20iLCJuYW1lIjoiTS5QYXJ0aGliYW4iLCJhbGxvd2VkLWFjdGlvbnMiOlsiU1QtUC1CUkQtUiIsIlNELUFQSS1WQy1SVyIsIlNELVAtTUlTLVIiLCJTRC1QLUxHTFQtUiIsIlNJLVItSU5ESU4iLCJTRC1QLUJHLVJXIiwiU0QtUC1QTy1SVyIsIlNELUFQSS1DTi1SIiwiU0QtUC1ITVNURC1SIiwiU0QtUC1TUy1SVyIsIlNULVAtREVTLVIiLCJTSEktUC1VUEQtUlciLCJTSU4tQVBJLVNGLVIiLCJTRC1QLUhNU1BTLVJXIiwiU1QtUC1OVEYtUiIsIlNISS1QLUYxUy1SVyIsIlNISS1QLUVYUC1SVyIsIlNELVAtUEItUiIsIlNISS1QLU1JQ1VSLVJXIiwiU0hJLVAtU0lDVVItUlciLCJNREMtUi1QREMiLCJTRC1QLVRELVIiLCJTSEktUC1GMVItUlciLCJTRC1QLVNIRi1SIiwiU0hJLVAtTU9DSy1SVyIsIlNELUFQSS1SQ0wtUlciLCJTRC1QLVBELVIiLCJTSEktUC1NUkQtUlciLCJNREMtUC1HT1AtUiIsIlNELVAtTUlTLVJXIiwiU0hJLVAtT1QtUlciLCJTSEktUC1UUkFJTlItUlciLCJTRC1QLUxCTi1SIiwiU0QtQVBJLUdPUi1SVyIsIk1EQy1BUEktQUdQLVJXIiwiU0QtQVBJLUdSLVJXIiwiU0QtUC1CQS1SVyIsIlNELUFQSS1WUC1SVyIsIlNELVAtQlRELVJXIiwiU0hJLVAtRElBLVJXIiwiU0QtUC1MU0NMLVIiLCJTRC1QLUhNU0xELVIiLCJNREMtQVBJLVNHUC1SVyIsIlNELVAtUEctUiIsIlNELVAtQ0hDLVIiLCJTRC1QLUhNU0NTLVIiLCJTRC1BUEktR0QtUiIsIlNISS1QLUYyU1ItUlciLCJTRC1QLVNWRC1SVyIsIlNISS1QLVJFQy1SVyIsIlNELVAtQkEtUiIsIlNELVAtVERFLVJXIiwiU1QtUC1TTk8tUlciLCJTRC1QLVNTVS1SIiwiU0QtUC1ITVNVQy1SVyIsIlNELVAtSE1TU1MtUiIsIlNELVAtQ0hDLVJXIiwiTURDLUFQSS1QR1AtUlciLCJNREMtQVBJLUFULVIiLCJTRC1QLUxHTEQtUiIsIlNISS1QLUNIRU1PUi1SVyIsIlNELVAtT0QtUlciLCJTRC1QLUNCLVJXIiwiTURDLVAtR1BQLVIiLCJTVC1QLUNNVC1SVyIsIlNELUFQSS1NSVMtUlciLCJTSU4tQVBJLU9SUi1SIiwiU0QtUC1TR0FDLVJXIiwiTURDLVAtQUFVLVJXIiwiU0QtUC1QQi1SVyIsIlNISS1QLVBIWS1SVyIsIlNELVAtTUJQRC1SIiwiTURDLVAtU09SLVJXIiwiU0QtUC1QT1YtUiIsIlNISS1QLU9QRC1SVyIsIlNISS1QLUYxU1ItUlciLCJFUi1SLUVSQSIsIlNELUFQSS1HQy1SVyIsIlNULVAtVERMLVIiLCJTRC1BUEktSVZNLVJXIiwiU0QtUC1ITVNQQi1SIiwiU0QtUC1QRi1SIiwiU0QtUC1ITVNTUC1SVyIsIlNJTi1BUEktSUYtUiIsIlNELVAtSE1TU0QtUlciLCJTRC1QLUxELVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1MR0QtUlciLCJTRC1QLVNIRi1SVyIsIlNISS1QLUZPUk0tUlciLCJTRC1BUEktTUJURC1SVyIsIlNULUFQSS1DUkQtUlciLCJTSEktUC1BVkFJTC1SVyIsIlNELVAtQklMTC1SVyIsIlNELUFQSS1QUi1SIiwiU0QtUC1TR0FDLVIiLCJTRC1QLVBGLVJXIiwiU0QtUC1URS1SVyIsIlNELVAtTFVTQ0QtUlciLCJFUi1QLUVSQVMtUlciLCJTRC1QLVNWUk8tUlciLCJTRC1QLVBPVi1SVyIsIlNISS1QLURFTC1SVyIsIlNELUFQSS1SQi1SIiwiU0hJLVAtTEFCLVJXIiwiU0hJLVAtSEFORC1SVyIsIlNELVAtTUJUVi1SIiwiU0hJLVAtRU1SUi1SVyIsIk1EQy1BUEktT0dQLVJXIiwiU0QtUC1ERi1SIiwiU0QtUC1NQkRGLVJXIiwiU0QtUC1JTlYtUlciLCJNREMtUC1QTlBSLVIiLCJNREMtQVBJLUNHUC1SVyIsIlNELVAtREYtUlciLCJTRC1QLVRFLVIiLCJNREMtUC1HU1AtUiIsIlNISS1QLUYzUi1SVyIsIlNISS1QLUYzLVJXIiwiU0hJLVAtVVBEUkFXLVJXIiwiU0hJLVAtRjEtUlciLCJNREMtUC1HQVAtUiIsIlNELVAtU0EtUlciLCJTRC1BUEktR09DLVJXIiwiU0QtUC1CVEQtUiIsIlNJTi1SLUFDQyIsIlNELUFQSS1UVi1SIiwiU0QtUC1TQy1SIiwiU0QtUC1QRkUtUlciLCJTRC1QLVNTLVIiLCJTSEktUC1TSUNVLVJXIiwiU0QtUC1SQi1SVyIsIlNELVAtU1ZGLVIiLCJTRC1QLVJHLVJXIiwiU0QtUC1SQS1SVyIsIlNULUFQSS1BTUMtUlciLCJTRC1QLUxBLVJXIiwiU0hJLVAtQ0hFTU8tUlciLCJTSEktUC1GUk5ULVJXIiwiU0QtQVBJLVRNLVIiLCJTVC1QLVRETC1SVyIsIlNISS1QLVJFQ1ItUlciLCJTRC1QLVBMLVIiLCJTRC1QLVJFRy1SVyIsIlNISS1QLU5JQ1UtUlciLCJTRC1QLVNJUi1SVyIsIlNULVAtTlRGLVJXIiwiU0QtUC1HUEItUlciLCJTSEktUC1IUi1SVyIsIlNISS1QLU5JQ1VSLVJXIiwiU0QtUC1ITVNTUy1SVyIsIlNELVAtU1ZGLVJXIiwiU0QtUC1MU0MtUlciLCJTRC1QLUxHU0MtUiIsIlNELUFQSS1JVk0tUiIsIlNELVAtSE1TUEItUlciLCJTSEktUC1GMi1SVyIsIlNISS1QLUVNUi1SVyIsIlNISS1QLUYyUy1SVyIsIlNELVAtVEQtUlciLCJTVC1BUEktRU1QLVIiLCJTVC1BUEktQlJELVJXIiwiTURDLUFQSS1QREMtUlciLCJTSEktUC1UUkFJTi1SVyIsIlNELVAtSE1TVEQtUlciLCJTRC1QLUxTRC1SVyIsIlNELVAtR1BELVIiLCJHUC1QLUdDTi1SIiwiU1QtUi1BIiwiU0hJLVAtWFJBWS1SVyIsIlNULVAtREVTLVJXIiwiU0QtUC1ITVNHQy1SIiwiTURDLVAtR0NQLVIiLCJTVC1QLUNNVC1SIiwiU0QtQVBJLVRNLVJXIiwiU0QtUC1DVC1SVyIsIlNELVAtTFRBLVJXIiwiU0QtUC1ITVNTUC1SIiwiU0QtUC1MUkMtUiIsIlNISS1QLU1JQ1UtUlciLCJTRC1SLUEiLCJTRC1QLUJHLVIiLCJTRC1QLVVSLVJXIiwiU0QtUC1DTi1SVyIsIlNELVAtU1ZSSS1SVyIsIlNELUFQSS1URC1SIiwiU0hJLVAtRjJSLVJXIiwiU0QtUC1HU1AtUiIsIlNISS1QLUNULVJXIiwiU0QtUC1TSVItUiIsIlNISS1QLUlOQyIsIlNELVAtVVBCLVIiLCJTRC1QLVNDVS1SVyIsIlNELVAtU1NVLVJXIiwiU0hJLVAtSEFORFItUlciLCJTRC1QLVBHLVJXIiwiU0QtUC1TQy1SVyIsIlNISS1QLURFTFJBVy1SVyIsIkdMLVAtRVBNLVJXIiwiU0QtUC1SRC1SVyIsIlNELVAtVVBCLVJXIiwiU0hJLVAtTVJJLVJXIiwiU0hJLVAtR0VUUkFXLVJXIiwiU0QtUC1MUEktUiIsIlNISS1QLVBIQVJNLVJXIl0sImFsbG9"
  console.log("🔧 Development token is empty - will redirect to login", dev_token);
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

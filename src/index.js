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
  const dev_token ="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIlNISS1QLVRSQUlOLVJXIiwiSE1TLVAtUEdQQlQtUiIsIk1EQy1BUEktQVQtUiIsIkdMLVAtTkRDLVJXIiwiRkUtUC1GUi1SVyIsIkdMLVAtUC1SVyIsIlNISS1QLUlOQyIsIkZFLVAtRkdGLVIiLCJITVMtUC1JQi1SIiwiTURDLVAtR1BQLVIiLCJHUC1QLUdDTi1SIiwiSE1TLVAtUEdMQlUtUiIsIk1EQy1QLUdTUC1SIiwiTURDLVAtR09QLVIiLCJITVMtUC1PUEgiLCJITVMtUi1QSCIsIkZFLVAtRkctUlciLCJITVMtUC1QQ0NTRF9SVyIsIkVSLVAtRVJQLVIiLCJGRS1QLUZVUy1SVyIsIkVSLVAtRVJVUy1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiU0hJLVAtRVhQLVJXIiwiRkUtUC1GU0ItUlciLCJITVMtUC1HT1BTLVIiLCJGRS1QLUZGLVJXIiwiSE1TLVAtUFNPUEItUlciLCJNREMtQVBJLU9HUC1SVyIsIkhNUy1QLVBNQy1SVyIsIkdMLVAtRUQtUlciLCJITVMtUC1DUy1SVyIsIkZFLVItRkEtUlciLCJITVMtUC1ETEQtUlciLCJFUi1QLUVSR0FTLVJXIiwiSE1TLVAtSFNOLVJXIiwiSE1TLVAtR1BCVC1SIiwiSE1TLVAtQ09QUC1SVyIsIkhNUy1QLVJDQVQtUiIsIkhNUy1QLVBPUFVBUy1SVyIsIkVSLVAtRVJWQi1SVyIsIk1EQy1BUEktQUdQLVJXIiwiSE1TLVAtU09QRS1SVyIsIkhNUy1QLUdMQlUtUiIsIkdMLVAtRUwtUlciLCJNREMtQVBJLVNHUC1SVyIsIkhNUy1QLVBHRUItUiIsIkdMLVAtRUJULVJXIiwiSE1TLVAtR09QQk4tUiIsIkZFLVItRkEiLCJFUi1SLUVSUCIsIkhNUy1QLURSTS1SIiwiRkUtUC1GQUwtUiIsIk1EQy1BUEktUERDLVJXIiwiRkUtUC1GVUItUlciLCJITVMtUC1QQ09QUC1SVyIsIkhNUy1QLVZMLVJXIiwiRkUtUC1GR0wtUiIsIkdMLVAtQU5ELVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtQURNLVJXIiwiTURDLVAtQUFVLVJXIiwiTURDLVAtR0NQLVIiLCJITVMtUC1CTEstUiIsIkdMLVAtRVAtUlciLCJFUi1QLUVSR1BSLVJXIiwiTURDLUFQSS1QR1AtUlciLCJITVMtUC1JUEgiLCJITVMtUC1QT1BQREItUlciLCJITVMtUC1PUFBCLVIiLCJITVMtUC1QR0FTLVIiLCJITVMtUC1XUlEtUlciLCJITVMtUC1HV0wtUiIsIkVSLVAtRVJTRC1SVyIsIkhNUy1QLUdBRS1SIiwiR0wtUC1SU0UtUlciLCJITVMtUC1QR1MtUlciLCJITVMtUC1TT1BCLVJXIiwiRkUtUC1GUy1SVyIsIkdMLVAtRUFELVJXIiwiSE1TLVAtQ0VCLVJXIiwiSE1TLVAtR0xCVC1SIiwiTURDLVItUERDIiwiTURDLVAtR0FQLVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxOCwxOV0sImhtc19vdXRsZXRzIjpbXSwiYWxsb3dlZC1vdXRsZXRzIjpbXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzU4NzgzNDIsImV4cCI6MTc3NTk2NTM0Mn0.K49q2lQHA0SYDvOC6Dnwe2vsGOY2FwGFE10qRve3RvUwa_-AFFdNnfXKnwz2D8Zm2X-xAMoleJUGREzITPXcq_2hIR3ID-qbPSDmMWERaLYxeaX7tZakMl_mO3i3wKnDwf4p0QlP0UPEyiddpsW4BnSwWTiroS8whBZGOQ83UGNQYnrEQPxM11yifji4D4EquOoHns06gFV2TH6LKuPvJvACQ_ZgCRatqMM7h6LtrtAS4b5eiR9u21sBAd10sLXT_hY7qnQvKeTbug-bIzl9hhljLeD9M7BL15VSiQL44gvJawDADFvTQSAqIpE2OzDiQbotN08hV-LZy4Xeh4RZDA"
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
    localStorage.setItem("hms_pages", JSON.stringify(userPayload["hms_pages"] || []));
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

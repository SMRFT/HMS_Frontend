import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

// console.log("=== HMS INDEX.JS DEBUG ===");
// console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLUFQSS1QQVQtUiIsIkhNUy1QLUdSTkEiLCJITVMtUC1QT0wtUlciLCJTRC1QLUxQSS1SIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLURSTS1SVyIsIkhNUy1QLVBFUi1SVyIsIk1EQy1QLVJFRy1SVyIsIk1EQy1QLVBOUC1SIiwiTURDLUFQSS1DRFItUiIsIlNELVAtU1MtUlciLCJTRC1QLVNTLVIiLCJITVMtQVBJLURBU0giLCJTVC1QLURFUy1SVyIsIkVSLVAtRVJHTkJOLVIiLCJTSU4tQVBJLU9SLVJXIiwiSE1TLVAtV1ItUlciLCJITVMtUC1BQS1SVyIsIkhNUy1QLVBDLVJXIiwiSE1TLVAtQ0NELVJXIiwiTURDLVAtR09QLVIiLCJTSU4tUC1HREwtUiIsIlNELVAtU1AtUiIsIlNELVAtR1BCLVIiLCJITVMtUC1CTEtELVJXIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLU9TLVJXIiwiTURDLVAtQUFVLVJXIiwiSE1TLVAtTVJBLVJXIiwiTURDLVItQURNIiwiRVItUC1FUkRMLVIiLCJITVMtUC1TVC1SVyIsIlNULVItSE9EIiwiU0lOLVAtUkFVLVJXIiwiSE1TLVAtQ1RJQS1SVyIsIlNELVAtTEJDLVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtUE9BLVJXIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtQURNRC1SVyIsIk1EQy1QLU9TQi1SVyIsIkhNUy1QLVJFTlEtUlciLCJTRC1SLVNNQyIsIkhNUy1QLUhNU1BTIiwiRVItUC1FUkItUlciLCJNREMtUC1HQVAtUiIsIkhNUy1QLVJNRC1SVyIsIkhNUy1QLUdSTiIsIlNELVAtVVBCLVJXIiwiU0lOLVItU0EiLCJITVMtUC1EREFTSCIsIk1EQy1QLVRSQi1SVyIsIkhNUy1BUEktRExELVIiLCJITVMtUC1QQ0QtUlciLCJITVMtUC1DQy1SVyIsIk1EQy1BUEktTEJOLVIiLCJTRC1QLVBHLVJXIiwiTURDLUFQSS1SREwtUlciLCJITVMtUC1SU0QtUlciLCJITVMtQVBJLVVISUQtUiIsIlNELVAtU1NVLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtQkxLLVJXIiwiSE1TLVAtUlNERC1SVyIsIkhNUy1QLVNSTS1SVyIsIk1EQy1BUEktU0dQLVJXIiwiTURDLUFQSS1BR1AtUlciLCJNREMtQVBJLUNHUC1SVyIsIlNELUFQSS1UTS1SVyIsIlNELVAtUEItUlciLCJNREMtQVBJLUFULVJXIiwiU0QtQVBJLVNTLVJXIiwiSE1TLVAtR1JOQS1SVyIsIk1EQy1BUEktT0dQLVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtUlNIRlQtUlciLCJNREMtQVBJLVBEQy1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtVk5ERC1SVyIsIk1EQy1QLVNPUi1SIiwiTURDLUFQSS1QR1AtUlciLCJTSU4tQVBJLVNGLVIiLCJTRC1QLVNDLVIiLCJTVC1QLVNOTy1SVyIsIk1EQy1QLUFTTS1SVyIsIkhNUy1QLVJTSEZURC1SVyIsIlNJTi1BUEktRlUtUlciLCJHUC1QLUdDTi1SIiwiU0lOLVAtRkEtUlciLCJITVMtUC1SQ0xOLVJXIiwiRVItUC1FUlJFUC1SVyIsIlNULVAtVERMLVJXIiwiSE1TLUFQSS1WTSIsIlNJTi1QLVJBLVJXIiwiU1QtUC1DTVQtUlciLCJITVMtUC1SS0lURC1SVyIsIkhNUy1QLU1SLVJXIiwiSE1TLVAtR0FETS1SVyIsIlNELUFQSS1DTi1SIiwiTURDLUFQSS1HQVMtUiIsIk1EQy1QLUdQUC1SIiwiU0QtUC1CVEQtUlciLCJTRC1QLVBGLVJXIiwiU0lOLVAtT1AtUlciLCJTVC1QLURFUy1SIiwiRVItUC1FUlBCLVJXIiwiU0QtUC1CQS1SVyIsIkhNUy1QLVBTRy1SVyIsIlNULUFQSS1BTUMtUlciLCJTVC1QLVRETC1SIiwiU0QtUC1MQk4tUiIsIkhNUy1QLU5TRC1SVyIsIlNJTi1BUEktT1JSLVIiLCJITVMtUC1EQiIsIlNULVAtTlRGLVIiLCJTVC1BUEktRU1QLVIiLCJITVMtUC1TSURFQkFSIiwiTURDLVAtUE5QUi1SIiwiTURDLUFQSS1BVC1SIiwiU0QtUC1SQi1SVyIsIkhNUy1QLUNUSS1SVyIsIlNELVAtR1NQLVIiLCJFUi1SLUVSTiIsIlNJTi1QLUdJQy1SIiwiSE1TLVAtSE1TUFMtUlciLCJITVMtUC1STS1SVyIsIlNULVAtQlJELVIiLCJTVC1QLU5URi1SVyIsIkVSLVAtRVJQTC1SIiwiSE1TLVAtUE9MLVIiLCJNREMtUC1QTlAtUlciLCJNREMtUC1HU1AtUiIsIlNJTi1BUEktSUYtUlciLCJITVMtUC1WTkQtUlciLCJTRC1QLVBPVi1SVyIsIkhNUy1QLUdSTi1SVyIsIkhNUy1QLUFETUwtUlciLCJTVC1BUEktQ1JELVJXIiwiTURDLUFQSS1QQVQiLCJTVC1QLUNNVC1SIiwiU0QtQVBJLVRELVIiLCJITVMtUC1OUy1SVyIsIk1EQy1BUEktUlRTLVIiLCJTRC1QLUxSQy1SIiwiTURDLUFQSS1BRE0tUlciLCJITVMtUC1QSS1SVyIsIk1EQy1QLUdDUC1SIiwiTURDLUFQSS1USFItUiIsIlNELVAtR1BELVIiLCJTRC1BUEktUkItUiIsIlNELVAtTFRNLVJXIiwiSE1TLVAtQlJPT00tUlciLCJTRC1QLUJHLVJXIiwiTURDLVAtUkVHLVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxMjgsMSwyLDYsOSwxMCwxNCwxNSwxNiwxNywyNiwyNywyOCwyOSwzMCwzMSw0NCw1MCw1MSw1Miw1NSw1OCw1OSwxMDIsMTE2LDExNywxMjAsMTIxLDEyMiwxMjMsMTI3LDExNSwxMTgsNV0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3ODA5NzY4NzksImV4cCI6MTc4MTA2Mzg3OX0.Ty9IZjno-nPMl4zc8dXGdNw_cWgEC0h6mte3Z5yZtKIX4HaLJ1jTpC2oV_fI9Mxvz6REMCsGdWe7TLKCJ2JLX3grOS0rybEDUlLJhNpBZFa51XuqvkT0CHzrntMWgT-Y_0eSnrhf8SU2kBIhHWB5afbrU2a-PaRkyfK6nLWvE_59jEuLKHxVal7IflqoeSnoLx3qV0hdbR6Eh4-1Meb-NRXtz3BkV4mwcl6PVxgU1nd5r78GVngriEWcN4UHqfOxdKIQLaRnIXEhUoHfhUIDGQgh1t569HtvqpGQE0ilD3IpKuGDJpqjKtqWCggjB0Afsfe10Ss7u9JVwZTUmsNLIQ";
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
  const selectedOutlet = "OLET002";
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
  // console.log("Allowed actions:", allowedActions);
  if (allowedActions.includes("HMS-R-SA")) {
    return "Super Admin";
  }
  if (allowedActions.includes("HMS-R-PH")) {
    return "Pharmacist";
  }
  if (allowedActions.includes("HMS-R-NS")) {
    return "Nursing Station";
  } else {
    return "Receptionist"; // Default role if none of the specific roles are found
  }
}

// --- Main execution ---
(function main() {
  try {
    // console.log("Starting token validation...");

    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");
    // console.log("Access token from localStorage exists:", !!accessToken);

    // If no token found, try development token
    if (!accessToken) {
      console.log(
        "❌ No token found in localStorage, trying development token",
      );
      accessToken = setforlocaldev();
    }

    // If still no token (development token is empty), redirect to login
    if (!accessToken || accessToken.trim() === "") {
      // console.log("❌ No valid token available, redirecting to login");
      localStorage.removeItem("access_token"); // Clean up
      redirectToLogin();
      return; // Stop execution here
    }

    // Validate the token
    const userPayload = validate(accessToken);
    // console.log("✅ Token validated successfully");
    // console.log("Decoded token payload:", userPayload);

    // Store the valid token and user information
    localStorage.setItem("access_token", accessToken);

    // Extract user information from token payload
    const employeeId = userPayload.aud; // Using 'aud' field as ID
    const name = userPayload.name;
    const userEmail = userPayload.email;

    const userRole = getUserRole(userPayload["allowed-actions"]);

    // console.log("Employee ID:", employeeId);
    // console.log("Name:", name);
    // console.log("Email:", userEmail);
    // console.log("User Role:", userRole);

    // Check if we have required data
    const isLoggedIn = !!(employeeId && name);
    // console.log("Is logged in:", isLoggedIn);

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
    localStorage.setItem(
      "hms_pages",
      JSON.stringify(userPayload["hms_pages"] || []),
    );
    localStorage.setItem("role", userRole);

    localStorage.setItem(
      "allowedActions",
      JSON.stringify(userPayload["allowed-actions"] || []),
    );

    // console.log("✅ User payload and extracted data stored in localStorage");
    // console.log("Stored data:", {
    //   employeeId,
    //   name,
    //   userEmail,
    //   role: userRole,
    // });

    // Token is valid, render app
    // console.log("✅ Rendering lab app...");
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
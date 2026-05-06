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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1HUEQtUiIsIlNELVAtTFJDLVIiLCJITVMtUC1BQS1SVyIsIkhNUy1QLURCIiwiU1QtUC1OVEYtUiIsIlNULUFQSS1DUkQtUlciLCJTRC1QLVNTVS1SVyIsIkVSLVAtRVJCLVJXIiwiU0QtQVBJLVRNLVJXIiwiTURDLVAtU09SLVIiLCJNREMtUC1HQ1AtUiIsIkhNUy1QLUdSTi1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtR1JOQSIsIkVSLVAtRVJSRVAtUlciLCJITVMtUC1TUk0tUlciLCJTRC1QLVNTLVIiLCJITVMtUC1SU0QtUlciLCJITVMtUC1STUQtUlciLCJNREMtQVBJLVBBVCIsIlNELVAtUEYtUlciLCJTVC1QLURFUy1SIiwiTURDLVAtUE5QLVJXIiwiSE1TLVAtR1JOIiwiU0QtQVBJLVNTLVJXIiwiU0QtUC1SQi1SVyIsIkhNUy1QLVZOREQtUlciLCJNREMtQVBJLVBEQy1SVyIsIk1EQy1QLUdBUC1SIiwiTURDLVAtQUFVLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJNREMtQVBJLUFULVIiLCJTRC1QLVBCLVJXIiwiU0QtQVBJLVJCLVIiLCJTRC1QLUxQSS1SIiwiU0QtQVBJLUNOLVIiLCJNREMtQVBJLVJUUy1SIiwiRVItUC1FUlBCLVJXIiwiSE1TLVAtVk5ELVJXIiwiSE1TLVAtTlNELVJXIiwiSE1TLVAtQkxLRC1SVyIsIlNULVAtVERMLVIiLCJITVMtUC1TSURFQkFSIiwiU1QtUC1CUkQtUiIsIlNELVAtU1AtUiIsIkhNUy1QLVJDQVQtUlciLCJNREMtUC1QTlAtUiIsIkhNUy1BUEktVk0iLCJITVMtUC1CTEstUlciLCJTRC1QLVVQQi1SVyIsIk1EQy1QLUFTTS1SVyIsIlNULUFQSS1BTUMtUlciLCJTRC1QLVNTLVJXIiwiTURDLVItQURNIiwiU0QtUC1HU1AtUiIsIlNELVAtUEctUlciLCJFUi1SLUVSTiIsIlNULVAtU05PLVJXIiwiTURDLUFQSS1TR1AtUlciLCJTVC1SLUhPRCIsIk1EQy1BUEktT0dQLVJXIiwiTURDLUFQSS1QQVQtUiIsIkhNUy1QLVJFTlEtUlciLCJITVMtQVBJLURMRC1SIiwiTURDLUFQSS1USFItUiIsIlNELVAtUE9WLVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1SU0hGVC1SVyIsIlNELVAtQlRELVJXIiwiTURDLUFQSS1SREwtUlciLCJTVC1QLURFUy1SVyIsIkhNUy1QLVJDTE4tUlciLCJITVMtUC1ITVNQUyIsIkhNUy1QLVJTREQtUlciLCJITVMtUC1ITVMiLCJITVMtUC1QSUQtUlciLCJITVMtQVBJLURBU0giLCJTRC1QLUJHLVJXIiwiU1QtUC1UREwtUlciLCJNREMtQVBJLUFETS1SVyIsIk1EQy1QLUdQUC1SIiwiSE1TLVAtUEMtUlciLCJTVC1QLUNNVC1SVyIsIlNELVAtQkEtUlciLCJITVMtQVBJLVVISUQtUiIsIk1EQy1BUEktQ0dQLVJXIiwiTURDLUFQSS1DRFItUiIsIkhNUy1QLVBDRC1SVyIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1DQy1SVyIsIlNULUFQSS1CUkQtUlciLCJNREMtUC1QTlBSLVIiLCJFUi1QLUVSUEwtUiIsIkhNUy1QLVJLSVQtUlciLCJNREMtQVBJLVBHUC1SVyIsIkVSLVAtRVJETC1SIiwiSE1TLVAtSE1TUFMtUlciLCJITVMtUC1SS0lURC1SVyIsIlNELVAtU0MtUiIsIlNELVAtR1BCLVIiLCJTRC1QLUxUTS1SVyIsIlNELVItU01DIiwiSE1TLVAtQURNRC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiTURDLVAtT1NCLVJXIiwiTURDLVAtR1NQLVIiLCJITVMtUC1HUk5BLVJXIiwiR1AtUC1HQ04tUiIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLVBJLVJXIiwiU0QtQVBJLVRELVIiLCJITVMtUC1STS1SVyIsIk1EQy1QLVRSQi1SVyIsIkhNUy1QLVNULVJXIiwiU1QtUC1OVEYtUlciLCJNREMtUC1HT1AtUiIsIlNELVAtTEJDLVJXIiwiSE1TLVAtR0FETS1SVyIsIkVSLVAtRVJHTkJOLVIiLCJNREMtQVBJLUFULVJXIiwiSE1TLVAtQ0NELVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiU0QtUC1MQk4tUiIsIk1EQy1QLVJFRy1SVyIsIk1EQy1BUEktTEJOLVIiLCJITVMtUC1CUk9PTS1SVyIsIk1EQy1QLVJFRy1SIiwiTURDLUFQSS1HQVMtUiIsIlNULVAtQ01ULVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsyLDUsNiwxMCwxNCwxNSwxNiwxNywyMSwyNiwyNywyOCwyOSwzMCw0NCw1MCw1MSw1Miw1NSw1OCw1OSwyMCwxMDJdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3ODAzODc0MCwiZXhwIjoxNzc4MTI1NzQwfQ.fVIcNq2dU_xhb03U965KeppnOZGWHjnl1HQajr7M2Jgb1DMTexUha-oc7av8H3J4Co9DSPY1wEed9IMebirXMnPiY7X2ShXxbzQtdzPxLHJc358flxn5w5cSdphD8TUstx3PFJxyhsBGdQjimwQDbI4sZrPQZWZL6hB3T005sI6DZvL5wpwBY3gKd4hl6BJ6e7ZIG7kLgQQ3CE-IuhDj39hR6AalJB7Oa9NONae0PXIymgjOLZ1szE1n069YJJgHW9kzeHNgZSo4q0BmSH7C5xKOqxq3n1y8tH9ciLsiBkAwLMc5oBzLiM7kWhKEMdEKTVmgKIsqI3vpemEomyNkWQ";
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
  const selectedOutlet = "OLET003";
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
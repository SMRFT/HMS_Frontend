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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIlNELVAtSE1TUEItUlciLCJITVMtUC1DQ01CUEItUlciLCJTRC1QLVNBLVJXIiwiU0QtUC1ITVNURC1SIiwiSE1TLVAtQ1NMTS1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1BUEktRExELVIiLCJTRC1QLU1CUEQtUiIsIlNELVAtSE1TU1AtUiIsIlNELUFQSS1HRC1SIiwiSE1TLVAtRERBU0giLCJTVC1SLUEiLCJITVMtUC1SQ0FURC1SVyIsIk1EQy1SLVBEQyIsIk1EQy1BUEktU0dQLVJXIiwiTURDLVAtQUQtUlciLCJNREMtUC1HUFAtUiIsIlNELUFQSS1UTS1SVyIsIk1EQy1QLVVBUy1SVyIsIkhNUy1QLU9QSC1SVyIsIkVSLVItRVJBIiwiTURDLUFQSS1MLVJXIiwiU0QtUC1ITVNVQy1SVyIsIkhNUy1QLVJNLVJXIiwiU0QtQVBJLUNOLVIiLCJITVMtUC1XUi1SVyIsIlNELUFQSS1UTS1SIiwiSE1TLVAtQ1RJQS1SVyIsIk1EQy1BUEktQVQtUiIsIlNELVAtSE1TQkQtUlciLCJHRC1QLUdQIiwiU0QtUC1SRC1SVyIsIlNELVAtSE1TQ1MtUiIsIlNELVAtSE1TR1AtUiIsIkhNUy1QLVZWUCIsIk1EQy1QLUdPQS1SVyIsIlNELUFQSS1NQlRELVJXIiwiSE1TLVAtT1RJUi1SIiwiSE1TLVAtUk9SLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUNDQy1SVyIsIkhNUy1QLUlCLVJXIiwiTURDLVAtQUFVLVJXIiwiSE1TLVAtTlNELVJXIiwiTURDLUFQSS1QREMtUlciLCJTRC1QLUhNU1NTLVJXIiwiU0QtUC1ITVNQUy1SVyIsIk1EQy1BUEktUEdQLVJXIiwiSE1TLVAtQURBU0giLCJITVMtUC1SQ0FULVJXIiwiTURDLUFQSS1BR1AtUlciLCJTRC1QLUhNU0dDLVIiLCJTRC1QLVNTVS1SVyIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLVBERFMtUlciLCJITVMtUC1EQiIsIlNELVAtTUlTLVIiLCJTRC1QLUhNU1NELVIiLCJITVMtUC1BU1ItUlciLCJNREMtUC1HQ1AtUiIsIlNELVAtU1NVLVIiLCJITVMtUC1STUQtUlciLCJNREMtQVBJLU9HUC1SVyIsIkhNUy1QLUNUSS1SVyIsIlNELVAtVEQtUlciLCJITVMtUC1WUy1SIiwiU0QtUC1SRy1SVyIsIlNELVAtUE9WLVIiLCJTRC1BUEktTUlTLVJXIiwiU0QtUC1TUy1SVyIsIlNELVAtTUJERi1SVyIsIk1EQy1QLVBOUFItUiIsIlNELVAtVEUtUlciLCJITVMtUC1DQ0dSQi1SVyIsIkhNUy1QLVZTLVJXIiwiSE1TLVItViIsIkVSLVAtRVJBUy1SVyIsIlNELUFQSS1SQi1SIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLUFJTi1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiSE1TLVAtQ1NJTC1SVyIsIk1EQy1BUEktQ0RSLVJXIiwiU0QtUC1ITVNMRC1SIiwiTURDLVAtR1NQLVIiLCJTRC1QLVRERS1SVyIsIkhNUy1QLVZTUlAiLCJTRC1QLVBELVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1ITVMiLCJTRC1QLVBPVi1SVyIsIkhNUy1QLVBFUi1SVyIsIlNELUFQSS1UVi1SIiwiTURDLVAtR0FQLVIiLCJITVMtQVBJLURBU0giLCJITVMtUC1DU0xELVJXIiwiU0QtUC1TUy1SIiwiSE1TLVAtRFItUlciLCJITVMtUC1CTEstUlciLCJTRC1QLU1CVFYtUiIsIlNELVAtREYtUlciLCJITVMtUC1QR1MtUlciLCJITVMtUC1EUk0tUlciLCJITVMtUC1QR1MiLCJNREMtUC1HT1AtUiIsIkhNUy1QLURMRC1SVyIsIlNELVItTFQiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxMjgsMSw1LDYsNyw5LDEwLDEzOSwxNDEsMjEsMjYsMjcsMjgsMzEsNTAsNTEsNTIsNTcsMTAwLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTE1LDExNywxMjQsMTI1LDEyNywxMTYsMTE4LDE0Nl0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg1Mjk5MzA3LCJleHAiOjE3ODUzODYzMDd9.ftp_zDMdJhSf1Q4QUZ1Po6-2K00_pNbdeNOyE_zSyIAJoX73VkdmY7XxnH74L72S9Wb5IwBFZuIsDiHycSKC6HpWRTRZMm2XdFG0lsrIFAPz0vDZlW_96EY_nh6nTBNJFzbeyB9ptGYEUJuuFj9f43dG1wWxU_S5al9Xzc8k0OaJHvAPzQenWCKpZ1Cz5ji9juIUgazhVibfIEv2Z037QK6CQlhb2ZLNHeVgCrvfZn3p95l7_ohErFKTwh1y9y2VHqKmfhzzwKlxjH9rfWCvYktt77dKS-wLzj34CABXwQ2y8HKhw5jo4t7u1yqD4kVloXpXPkg4vO1bdKBSbCqcQw"
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

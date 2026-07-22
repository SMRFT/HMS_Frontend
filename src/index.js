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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUNDUFJQLVJXIiwiSE1TLVAtUE9QVUFTLVJXIiwiSE1TLVAtQ0NHTVBCLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiSE1TLVAtU1VNRC1SVyIsIkhNUy1QLVBQRC1SVyIsIkhNUy1QLUNTTE0tUlciLCJITVMtUC1DQ1NQU0QtUlciLCJITVMtUC1DQ0dTUkRfUlciLCJITVMtUC1QU1JCRC1SVyIsIkhNUy1QLUdPUEJOLVIiLCJITVMtUC1QREItUlciLCJITVMtUC1QR1NSRC1SVyIsIkhNUy1QLVNPUEItUlciLCJITVMtUC1DT1BQLVJXIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtUC1TUkdQRC1SVyIsIkhNUy1QLVBHUEJULVIiLCJITVMtUC1QUEQtUiIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1PUy1SVyIsIkhNUy1QLVNVTUUtUlciLCJITVMtUC1CTEstUiIsIkhNUy1QLVBTT1BCLVJXIiwiSE1TLUFQSS1ETEQtUlciLCJITVMtUC1QQ09QUC1SVyIsIkhNUy1QLVBNQy1SVyIsIkhNUy1QLUNDTy1SVyIsIkhNUy1QLVBTTS1SVyIsIkhNUy1QLVJDQVQtUiIsIkhNUy1QLVBHQVMtUiIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1DQ0lQQUItUlciLCJITVMtUC1HQUUtUiIsIkhNUy1QLVBDQ1NEX1JXIiwiSE1TLVAtQ0NHQVMtUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtQUEtUlciLCJITVMtUC1EUk0tUiIsIkhNUy1QLVBJUEEtUlciLCJITVMtUC1OU0QtUlciLCJITVMtUC1TVU0tUlciLCJITVMtUC1DQ0dBSC1SIiwiSE1TLVAtQ1MtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1QRERTLVJXIiwiSE1TLVAtQ0NHUEItUlciLCJITVMtUC1QQVMtUlciLCJITVMtUC1QU0lQLVJXIiwiSE1TLVAtREIiLCJITVMtUC1JQi1SIiwiSE1TLVAtSFNOLVJXIiwiSE1TLVAtU1VNQS1SVyIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLVNUQS1SVyIsIkhNUy1SLVBIIiwiSE1TLVAtUEZCLVJXIiwiSE1TLVAtV1JRLVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1QLU9QUEItUiIsIkhNUy1QLVBPUFNSQkQtUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLVNVTS1SIiwiSE1TLVAtUE9QUERCLVJXIiwiSE1TLVAtR0xCVS1SIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1TUkJELVJXIiwiSE1TLVAtQ1NMUi1SVyIsIkhNUy1QLU9QSCIsIkhNUy1QLUNDR0FILVJXIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtUC1QU0ItUlciLCJITVMtUC1QR0xCVS1SIiwiSE1TLVAtUENCX1JXIiwiSE1TLVAtQ1NJTC1SVyIsIkhNUy1QLUdPUFMtUiIsIkhNUy1QLUdQQlQtUiIsIkhNUy1QLUNERFMtUlciLCJITVMtUC1EQlVEUi1SIiwiSE1TLVAtUENCLVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1ITVMiLCJITVMtUC1PUFNSQkQtUlciLCJITVMtUC1HTEJULVIiLCJITVMtUC1QR0VCLVJXIiwiSE1TLVAtR1dMLVIiLCJITVMtUC1QR0VCLVIiLCJITVMtUC1TT1BFLVJXIiwiSE1TLVAtUEdMQlUtUlciLCJITVMtUC1DU0xELVJXIiwiSE1TLVAtVkwtUlciLCJITVMtUC1BRE0tUlciLCJITVMtUC1QT1BTUi1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLVBIVlNCLVJXIiwiSE1TLVAtU1QtUlciLCJITVMtUC1QR1MtUlciLCJITVMtUC1DQ09QUEItUlciLCJITVMtUC1DRUItUlciLCJITVMtUC1DQ0NSQi1SVyIsIkhNUy1QLURMRC1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEyOCwxMjksMyw1LDEwLDE4LDE5LDE0NiwxNDcsMjgsNDMsNDQsNDUsNTAsNTUsMTAxLDEwMiwxMTMsMTE0LDEyN10sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3ODQ3MjAxNTIsImV4cCI6MTc4NDgwNzE1Mn0.W_MvzPGznMVOmEL9U9exiq7UiQv06qq10B6zIPAcNS_g95eUfLHAf9zbz1pRxlAFaYc3XV2jBssovgidqsYK1pb_EHnLRszIsksxM98DxK93aUVYd6ICf0QwF_beEjO4tUZCGhIl0S465JsENNa4sB9bcnduubqWmwbhexDBkK8QbL9amXLqNaeb9qvvjXBfG7ESzUht-nk8BO0f5ztxyn603L_hVDrrcoeN38ciKSCFKEjhbXYTciGhRUdVVV_kUEUS_4yRgZy_mISvVZztq39w7Lgb6wRQbYJPLrgvsIfjhuowbN648b7G4gbgZFzw1nwYa7K0bgyi7lb35nCWFw"
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

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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIlNELVAtR1BELVIiLCJTRC1QLUxSQy1SIiwiU1QtUC1OVEYtUiIsIlNELVAtVEQtUlciLCJTRC1BUEktVFYtUiIsIlNELVAtUEwtUiIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1JUC1SVyIsIlNELUFQSS1HT0MtUlciLCJTRC1BUEktTUlTLVJXIiwiU0QtUC1TU1UtUlciLCJTRC1QLVBGLVIiLCJITVMtUC1JQi1SVyIsIkhNUy1QLURPLVJXIiwiU0QtUC1TT1ItUlciLCJTRC1QLVBHLVIiLCJITVMtUC1ETEQtUlciLCJTRC1BUEktVE0tUlciLCJITVMtUC1PUEgtUlciLCJITVMtUC1JUEgiLCJTVC1SLUEiLCJITVMtUC1SQ0FURC1SVyIsIkhNUy1QLURSTS1SVyIsIlNELUFQSS1WQy1SVyIsIlNELUFQSS1NQlRELVJXIiwiU0QtUC1TUy1SIiwiSE1TLVAtVlYtUlciLCJITVMtUC1SU0QtUlciLCJTRC1QLUdQRC1SVyIsIkhNUy1QLVJNRC1SVyIsIlNELVAtUEYtUlciLCJTVC1QLURFUy1SIiwiSE1TLVAtVklOLVJXIiwiSE1TLUFQSS1EQVNILVJXIiwiU0QtQVBJLVBSLVIiLCJTRC1QLURGLVJXIiwiU0QtQVBJLVZQLVJXIiwiSE1TLVAtQURBU0giLCJTRC1QLVBCLVJXIiwiU0QtQVBJLVJCLVIiLCJTRC1QLUxQSS1SIiwiSE1TLVAtTlNELVJXIiwiSE1TLVAtQkxLRC1SVyIsIlNELVAtUkQtUlciLCJTVC1QLVRETC1SIiwiSE1TLVAtU0lERUJBUiIsIlNELVAtTUJQRC1SIiwiU1QtUC1CUkQtUiIsIlNELVAtU1AtUiIsIkhNUy1QLVJDQVQtUlciLCJTRC1QLVBELVIiLCJITVMtUC1CTEstUlciLCJTRC1QLURGLVIiLCJTRC1QLVVQQi1SVyIsIlNULUFQSS1BTUMtUlciLCJTRC1BUEktUkNMLVJXIiwiU0QtUC1TUy1SVyIsIlNELVAtU0NVLVJXIiwiU0QtUC1UUy1SVyIsIlNELVAtR1NQLVIiLCJTRC1QLUNIQy1SIiwiU0QtUC1MVEEtUlciLCJTRC1QLVBHLVJXIiwiU0QtUC1TSVItUlciLCJITVMtUC1JQkQtUlciLCJTVC1QLVNOTy1SVyIsIlNELVAtQkEtUiIsIkhNUy1QLURSLVJXIiwiU0QtUC1HUFQtUlciLCJITVMtUC1SRU5RLVJXIiwiSE1TLUFQSS1ETEQtUiIsIlNELVAtTUJUVi1SIiwiU0QtUC1QT1YtUlciLCJITVMtUC1XUi1SVyIsIlNULVItQ0RSIiwiSE1TLVAtTlMtUlciLCJTRC1BUEktSVZNLVIiLCJTRC1QLUJURC1SVyIsIlNELVAtTUlTLVIiLCJTRC1QLUJCQS1SVyIsIlNULVAtREVTLVJXIiwiU0QtUC1TR0FDLVIiLCJTRC1QLUxUUi1SVyIsIkhNUy1QLVJDTE4tUlciLCJTRC1BUEktQ04tUlciLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtSE1TIiwiU0QtQVBJLUdSLVJXIiwiSE1TLUFQSS1EQVNIIiwiU0QtUC1TU1UtUiIsIlNULVAtVERMLVJXIiwiU0QtUC1TVkYtUiIsIlNELVAtVEUtUlciLCJTRC1QLVRELVIiLCJTRC1QLUJURC1SIiwiR0QtUC1HUCIsIlNULVAtQ01ULVJXIiwiU0QtUC1HUEItUlciLCJTRC1QLUJBLVJXIiwiU0QtUC1TR0FDLVJXIiwiU0QtUC1NQkRGLVJXIiwiSE1TLUFQSS1VSElELVIiLCJTRC1BUEktSVZNLVJXIiwiU0QtUC1QQi1SIiwiU0QtUC1MRC1SVyIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1SS0lULVJXIiwiU0QtUC1TSEYtUlciLCJTRC1QLUxTTC1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLVZJLVJXIiwiSE1TLVAtUktJVEQtUlciLCJTRC1QLVNDLVIiLCJITVMtUi1WIiwiSE1TLVAtSUJFLVJXIiwiSE1TLVAtRERBU0giLCJTRC1QLUxUTS1SVyIsIlNELVAtTEdELVJXIiwiU0QtUi1HTSIsIlNELUFQSS1UTS1SIiwiU0QtUC1CRy1SIiwiU0QtUC1TVkQtUlciLCJTRC1BUEktR09SLVJXIiwiSE1TLVAtVklOUi1SVyIsIlNELVAtU1ZGLVJXIiwiU1QtQVBJLUVNUC1SIiwiU0QtQVBJLVRELVIiLCJTRC1QLUxTUi1SVyIsIkhNUy1QLVJNLVJXIiwiU0QtUC1TR0UtUiIsIlNELVAtVEUtUiIsIlNELVAtT0QtUiIsIlNELVAtVVBCLVIiLCJTVC1QLU5URi1SVyIsIlNELVAtQ0hDLVJXIiwiU0QtUC1DTC1SVyIsIlNELVAtTEJDLVJXIiwiU0QtQVBJLUdDLVJXIiwiU0QtUC1TSEYtUiIsIkhNUy1QLVJCSUxMIiwiU0QtUC1MQk4tUiIsIkhNUy1QLUJST09NLVJXIiwiU0QtQVBJLUdELVIiLCJTVC1QLUNNVC1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMSwyLDQsNSw2LDcsOCw5LDEwLDEyLDE4LDE5LDIwLDIxLDI2LDI3LDI4LDI5LDMxLDQwLDQxLDQyLDUwLDUxLDUyLDUzLDU0LDEwMF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc3ODg4NTY2LCJleHAiOjE3Nzc5NzU1NjZ9.OmjUW1CU2BKogw-S549LYcIyZGovN7Z2ZBiwwzQK06xYnlh7-KqqP0qrAU-2Lxwl5Gqa2ir7JnxYeyFENNllCOlG6Hx2EY7Xg6uH2s0Peak2bCcFJ18jYLtTHRlu-eCLWa1lRw-UhvqDOoDaZGN4EpwKhKgz_bwasi-kltFQF2ZlqhpOJIk0e3eaw0h9vnDfos8tUHcYd9vh3TelfR2e0zz2Ie87Q2L4MEjg6fqJwPBKIlZBJNc84N7ke8Uv-e7EJPhyvjaGJiXW-O76OW2kQ6MJyciM1G1OpwvY2GC6ObA4limQHKtXp552Qn9dYvvERFPhgzqwDnrQh87mdQIgPw";
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
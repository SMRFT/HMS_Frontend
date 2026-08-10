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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJITVMtUC1DQ1BSUC1SVyIsIkhNUy1QLUNDR01QQi1SVyIsIlNULVAtQ01ULVJXIiwiSE1TLVAtUFBELVJXIiwiSE1TLVAtVk5ELVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUC1SU0QtUlciLCJITVMtQVBJLVNBTVQtUlciLCJTVC1SLUhPRCIsIkhNUy1BUEktRExELVIiLCJFUi1BUEktRVJVQi1SVyIsIk1EQy1BUEktUEFUIiwiSE1TLVAtSUJELVJXIiwiSE1TLVAtUERCLVJXIiwiTURDLVAtR0RUUy1SVyIsIlNULVAtREVTLVJXIiwiSE1TLUFQSS1TUk0tUlciLCJNREMtUC1BRC1SVyIsIlNULVAtTlRGLVIiLCJTVC1QLVNOTy1SVyIsIkhNUy1QLUNDVVBCLVJXIiwiTURDLUFQSS1QQVQtUiIsIkhNUy1QLUFETUwtUlciLCJNREMtUC1VQVMtUlciLCJITVMtUC1TUk0tUlciLCJITVMtUC1TR0xBLVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVJNLVJXIiwiTURDLUFQSS1SREwtUlciLCJITVMtQVBJLURMRC1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiTURDLVAtUkVHLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1QTUMtUlciLCJNREMtQVBJLVJUUy1SIiwiSE1TLVAtUFNNLVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIkdMLVAtQU5ELVJXIiwiSE1TLUFQSS1VSElELVIiLCJITVMtUC1DVElBLVJXIiwiTURDLUFQSS1BVC1SIiwiU0hJLVAtVFJBSU4tUlciLCJITVMtUC1WTkRELVJXIiwiU1QtQVBJLUNSRC1SVyIsIkdMLVAtRUQtUlciLCJNREMtUC1UUkItUlciLCJFUi1QLUVSVkItUlciLCJITVMtUC1DQ0lQQUItUlciLCJHTC1QLUVBRC1SVyIsIk1EQy1QLUFTTS1SVyIsIkhNUy1QLUNDR0FTLVJXIiwiTURDLVItUkVDIiwiSE1TLVAtUk9SLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtSUItUlciLCJNREMtUC1FRi1SVyIsIkdMLVAtUC1SVyIsIkdMLVAtTkRDLVJXIiwiSE1TLVAtQlQtUlciLCJITVMtUC1SQ0FULVJXIiwiTURDLVAtQ0RFLVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtUEFTLVJXIiwiSE1TLVAtUFNJUC1SVyIsIkhNUy1QLURCIiwiTURDLVAtUkRFLVJXIiwiSE1TLVAtQVNSLVJXIiwiRVItUC1FUlJFUC1SVyIsIkhNUy1QLVJNRC1SVyIsIkhNUy1QLUNUSS1SVyIsIlNULVAtQ01ULVIiLCJTVC1QLURFUy1SIiwiSE1TLVAtUEZCLVJXIiwiTURDLUFQSS1HQVMtUiIsIkdQLVAtR0NOLVIiLCJNREMtQVBJLUNEUi1SIiwiR0wtUC1SU0UtUlciLCJFUi1QLUVSQi1SVyIsIk1EQy1QLVBOUFItUiIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIkhNUy1QLVNEVUktUlciLCJITVMtUC1DQ0dSUC1SVyIsIkdMLVAtRUJULVJXIiwiU0hJLVAtSU5DIiwiSE1TLUFQSS1JVC1SVyIsIkdMLVAtRVAtUlciLCJITVMtUC1PUEgiLCJNREMtQVBJLUFULVJXIiwiU1QtUC1UREwtUlciLCJITVMtUC1JQkUtUlciLCJNREMtUC1QTlAtUlciLCJITVMtUC1DQ0dBSC1SVyIsIkVSLVAtRVJHQVMtUlciLCJFUi1SLUVSU0EiLCJNREMtUC1HQUQtUlciLCJNREMtUC1PU0ItUlciLCJNREMtUC1SRUctUiIsIkhNUy1QLVBHUEJULVJXIiwiSE1TLVAtUFNCLVJXIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLVBDQl9SVyIsIkhNUy1QLUlDRC1SVyIsIk1EQy1BUEktTEJOLVIiLCJITVMtUC1EQlVEUi1SIiwiR0wtUC1FTC1SVyIsIkhNUy1QLU5TLVJXIiwiSE1TLVAtSE1TIiwiTURDLVAtUFRFLVJXIiwiSE1TLVAtUEdFQi1SVyIsIlNULUFQSS1BTUMtUlciLCJITVMtUC1QR0xCVS1SVyIsIk1EQy1QLUdBVC1SVyIsIk1EQy1BUEktVEhSLVIiLCJTVC1BUEktQlJELVJXIiwiSE1TLVAtU0dSTi1SVyIsIlNISS1QLUVYUC1SVyIsIkhNUy1QLUJMSy1SVyIsIk1EQy1QLVNPUi1SIiwiSE1TLVAtSVBIIiwiSE1TLUFQSS1TQU0tUlciLCJITVMtUC1QSFZTQi1SVyIsIkhNUy1QLVZJTlItUiIsIkhNUy1QLVBHUy1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIkhNUy1QLURSTS1SVyIsIlNULVAtQlJELVIiLCJTVC1QLVRETC1SIiwiU1QtUC1OVEYtUlciLCJNREMtUC1DQS1SVyIsIlNULUFQSS1FTVAtUiIsIkVSLVAtRVJHUFItUlciLCJFUi1QLUVSQVMtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxMjgsMSwyLDQsNSwxMCwxMSwxMiwxMywxOCwxOSwyMCwyMSwxNTMsMTU0LDI2LDI3LDI4LDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQzLDQ0LDQ1LDQ2LDUwLDUxLDUyLDU1LDU3LDEwMSwxMDMsMTA0LDEwNSwxMDYsMTA3LDEwOCwxMDksMTEwLDExMSwxMTIsMTI0LDEyNSwxMjcsMTU1XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDA0IiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg2MzQwNTQxLCJleHAiOjE3ODY0Mjc1NDF9.SZymA5eDZKU1zuscA6yYaA_pBHp4wwsrogk9Relnrtp77NbFhfP3rOe6HgUGEw49Etrszf1y25wNiurCkZcZpkIfXWBoeLdpk5n8NM7mF76C6av0nNnW2QX4ECR65PZQnNi58bQpOWXHWT4tcgG_aBJlF4nCe9P4fVo8hqOggBhIIgrUXXjueb6CXftCGQS9pjq1UCGV6XZw0VhHRjWpdPMFZ3eQQFNaUC6YvOUyLvizpu4g88uiC2BbaF41nks_nQdhH9dELS1oi9x16z92cIGNl74gIWewmi0CTbe4-rSX7BoQ7_Q2ElO51S0B2nvNJaqIlG0Y23BGJbwe3-cu4w";
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

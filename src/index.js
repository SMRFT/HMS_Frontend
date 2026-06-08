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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiRVItUi1FUk4iLCJITVMtUC1QSUQtUlciLCJITVMtUC1PUy1SVyIsIk1EQy1QLVJFRy1SVyIsIlNELVAtR1BELVIiLCJNREMtQVBJLUdBUy1SIiwiTURDLUFQSS1QR1AtUlciLCJITVMtUC1QQy1SVyIsIk1EQy1BUEktUERDLVJXIiwiU0QtUC1CVEQtUlciLCJITVMtUC1HUk5BLVJXIiwiU0QtQVBJLVJCLVIiLCJITVMtUC1DQy1SVyIsIkhNUy1BUEktUEFDSy1SIiwiU0QtUC1MVE0tUlciLCJTSU4tUC1PUC1SVyIsIkhNUy1QLVJTSEZULVJXIiwiR1AtUC1HQ04tUiIsIlNELVAtTEJOLVIiLCJNREMtUC1BU00tUlciLCJTVC1SLUhPRCIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1DQ0QtUlciLCJITVMtUC1EQiIsIlNULUFQSS1CUkQtUlciLCJTSU4tUi1TQSIsIk1EQy1QLVBOUC1SIiwiSE1TLVAtR1JOIiwiU0lOLVAtRkEtUlciLCJTRC1QLVNTLVIiLCJNREMtUC1HQ1AtUiIsIlNELVAtVVBCLVJXIiwiU0QtQVBJLVRELVIiLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVJLSVQtUlciLCJNREMtUC1QTlAtUlciLCJTRC1QLUJBLVJXIiwiU0QtUC1MUEktUiIsIk1EQy1BUEktQVQtUlciLCJTRC1QLUxSQy1SIiwiSE1TLVAtSVBIIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1QU0ctUlciLCJTSU4tQVBJLUlGLVJXIiwiSE1TLVAtUENELVJXIiwiRVItUC1FUlJFUC1SVyIsIk1EQy1QLUdBUC1SIiwiTURDLUFQSS1BRE0tUlciLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtUk1ELVJXIiwiSE1TLVAtR1JOLVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtQUEtUlciLCJTRC1QLVJCLVJXIiwiU0lOLUFQSS1PUlItUiIsIlNELVAtUEctUlciLCJTVC1QLVRETC1SIiwiU0QtUC1HUEItUiIsIk1EQy1BUEktUlRTLVIiLCJTVC1QLU5URi1SIiwiSE1TLVAtSE1TUFMiLCJTVC1BUEktQ1JELVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtUE9MLVIiLCJTSU4tUC1SQS1SVyIsIk1EQy1QLUFBVS1SVyIsIk1EQy1BUEktU0dQLVJXIiwiTURDLUFQSS1SREwtUlciLCJNREMtQVBJLVRIUi1SIiwiTURDLUFQSS1BVC1SIiwiSE1TLVAtSE1TUFMtUlciLCJITVMtUC1SU0RELVJXIiwiRVItUC1FUlBCLVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1MQkMtUlciLCJTSU4tQVBJLUZVLVJXIiwiSE1TLVAtUkNBVEQtUlciLCJNREMtUC1PU0ItUlciLCJFUi1QLUVSREwtUiIsIlNJTi1BUEktU0YtUiIsIlNELVAtQkctUlciLCJTRC1QLVBCLVJXIiwiSE1TLUFQSS1VSElELVIiLCJNREMtQVBJLUFHUC1SVyIsIk1EQy1QLVRSQi1SVyIsIlNELVAtU0MtUiIsIk1EQy1QLVJFRy1SIiwiU0lOLVAtUkFVLVJXIiwiSE1TLVAtUkVOUS1SVyIsIlNULUFQSS1BTUMtUlciLCJITVMtUC1QSS1SVyIsIk1EQy1QLUdPUC1SIiwiU1QtUC1TTk8tUlciLCJTRC1QLVBPVi1SVyIsIk1EQy1SLUFETSIsIkhNUy1QLU5TLVJXIiwiU1QtUC1ERVMtUlciLCJITVMtUC1STS1SVyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLVZORC1SVyIsIlNJTi1QLUdETC1SIiwiSE1TLVAtQkxLRC1SVyIsIk1EQy1BUEktUEFUIiwiU0lOLUFQSS1PUi1SVyIsIkhNUy1QLVNULVJXIiwiU1QtUC1DTVQtUiIsIlNULVAtVERMLVJXIiwiSE1TLVAtR1JOQSIsIk1EQy1BUEktUEFULVIiLCJNREMtQVBJLUxCTi1SIiwiU1QtUC1CUkQtUiIsIlNELUFQSS1DTi1SIiwiSE1TLVAtU1JNLVJXIiwiU0QtUC1QRi1SVyIsIlNULUFQSS1FTVAtUiIsIk1EQy1QLUdTUC1SIiwiSE1TLVAtUktJVEQtUlciLCJITVMtUC1SU0QtUlciLCJTRC1QLUdTUC1SIiwiTURDLUFQSS1DRFItUiIsIlNULVAtTlRGLVJXIiwiSE1TLUFQSS1EQVNIIiwiSE1TLUFQSS1WTSIsIkhNUy1QLUdBRE0tUlciLCJNREMtQVBJLU9HUC1SVyIsIlNULVAtQ01ULVJXIiwiU0QtUi1TTUMiLCJTVC1QLURFUy1SIiwiU0QtQVBJLVNTLVJXIiwiSE1TLVAtUE9MLVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLVZOREQtUlciLCJFUi1QLUVSUEwtUiIsIk1EQy1QLUdQUC1SIiwiRVItUC1FUkItUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1PUEgiLCJTRC1QLVNTVS1SVyIsIkhNUy1QLU5TRC1SVyIsIlNJTi1QLUdJQy1SIiwiU0QtUC1TUy1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiU0QtQVBJLVRNLVJXIiwiSE1TLVAtSE1TIiwiTURDLVAtU09SLVIiLCJITVMtQVBJLURMRC1SIiwiRVItUC1FUkdOQk4tUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzIsNSw2LDEwLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDI2LDI3LDI4LDI5LDMwLDQ0LDUwLDUxLDUyLDU1LDU4LDU5LDEwMiwxMjIsMTIzLDEyMCwxMjFdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDIiLCJPTEVUMDAxIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzgwNjMwOTEyLCJleHAiOjE3ODA3MTc5MTJ9.L3EScCVDvtiqy1d3kI_Udg5M9tvE-Jfp8ZU-RwtIpcnguSC7VSmNadK51DGMSemL6i2wp13fVOGv3evyvnOMnOuJb_iTQVWnAB75igctPsT1AdERfB-9rv_cl3llpAjsENCkoAJhq0AOcatvqC231C16ByN1Ey7_3L4OQTZYu-I8nsBEIazUIA-y7OEhToAMbJbSO4Ef9lnC6E7lyYIWGqMO95ZAMJzKE6CHz4qioAvDHN7hEMoBvgQHCiUqL8J0u26b5PdnK3xvueIQY0I6jSgqHxEXXRwaH9cM6hGp7ROTl7JQsXJwms2P_9JMlbzA7CBBqAjbD3cDGVRikl69-Q";
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

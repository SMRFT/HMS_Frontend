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
  const dev_token ="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkVSLVAtRVJWQi1SVyIsIkhNUy1QLUdMQlQtUiIsIkhNUy1QLUFBLVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUJMSy1SIiwiRkUtUC1GRy1SVyIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1PUEgiLCJGRS1QLUZTQi1SVyIsIkhNUy1QLVBDQ1NEX1JXIiwiSE1TLVAtRExELVJXIiwiRkUtUC1GUy1SVyIsIkhNUy1QLUlQSCIsIk1EQy1QLUdDUC1SIiwiU1QtUi1BIiwiSE1TLVAtUEdBUy1SIiwiRkUtUC1GR0YtUiIsIkhNUy1QLVBPUFVBUy1SVyIsIlNULVAtREVTLVIiLCJITVMtUC1QU09QQi1SVyIsIkhNUy1QLVBQRC1SIiwiRkUtUi1GQS1SVyIsIkhNUy1QLVBTTS1SVyIsIk1EQy1BUEktUERDLVJXIiwiTURDLVAtR0FQLVIiLCJITVMtUC1QR0xCVS1SIiwiTURDLVAtQUFVLVJXIiwiTURDLUFQSS1BVC1SIiwiSE1TLVAtUkNBVC1SIiwiSE1TLVAtUE9QUERCLVJXIiwiSE1TLVAtV1JRLVJXIiwiSE1TLVAtQURNLVJXIiwiR0wtUC1FTC1SVyIsIkdMLVAtRUJULVJXIiwiSE1TLVAtR1BCVC1SIiwiSE1TLVAtRFJNLVIiLCJITVMtUC1QR1BCVC1SIiwiSE1TLVAtUENCLVJXIiwiSE1TLVAtQ1MtUlciLCJITVMtUC1QTUMtUlciLCJITVMtUC1TT1BFLVJXIiwiU1QtUC1UREwtUiIsIlNULVAtQlJELVIiLCJGRS1SLUZBIiwiSE1TLVAtR0xCVS1SIiwiR0wtUC1BTkQtUlciLCJITVMtUC1DQ08tUlciLCJITVMtUC1HQUUtUiIsIlNULUFQSS1BTUMtUlciLCJFUi1QLUVSVVMtUlciLCJNREMtUi1QREMiLCJTVC1QLVNOTy1SVyIsIkhNUy1QLUdPUEJOLVIiLCJNREMtQVBJLVNHUC1SVyIsIkZFLVAtRlVTLVJXIiwiTURDLUFQSS1PR1AtUlciLCJHTC1QLVJTRS1SVyIsIlNULVItQ0RSIiwiSE1TLVAtUEdTLVJXIiwiU1QtUC1ERVMtUlciLCJTSEktUC1UUkFJTi1SVyIsIlNULVAtVERMLVJXIiwiTURDLVAtR1BQLVIiLCJHTC1QLU5EQy1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiSE1TLVAtVkwtUlciLCJTVC1QLUNNVC1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiRVItUC1FUlAtUiIsIkhNUy1QLUdXTC1SIiwiRkUtUC1GQUwtUiIsIlNULUFQSS1CUkQtUlciLCJNREMtUC1QTlBSLVIiLCJHTC1QLVAtUlciLCJITVMtUC1QRkItUlciLCJTSEktUC1FWFAtUlciLCJITVMtUC1DT1BQLVJXIiwiSE1TLVAtSFNOLVJXIiwiTURDLUFQSS1QR1AtUlciLCJFUi1QLUVSR0FTLVJXIiwiU0hJLVAtSU5DIiwiSE1TLVAtR09QUy1SIiwiSE1TLVAtT1BQQi1SIiwiSE1TLVAtSUItUiIsIkVSLVItRVJQIiwiRkUtUC1GUi1SVyIsIk1EQy1BUEktQUdQLVJXIiwiRkUtUC1GVUItUlciLCJFUi1QLUVSR1BSLVJXIiwiRkUtUC1GR0wtUiIsIkhNUy1QLVBJUEEtUlciLCJNREMtUC1HU1AtUiIsIkdQLVAtR0NOLVIiLCJITVMtUC1DRUItUlciLCJITVMtUi1QSCIsIkhNUy1QLVNPUEItUlciLCJTVC1BUEktRU1QLVIiLCJHTC1QLUVELVJXIiwiU1QtUC1OVEYtUlciLCJITVMtUC1QR0VCLVIiLCJNREMtUC1HT1AtUiIsIkdMLVAtRUFELVJXIiwiR0wtUC1FUC1SVyIsIkZFLVAtRkYtUlciLCJFUi1QLUVSU0QtUlciLCJTVC1QLUNNVC1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMTgsMTksNTVdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3NjQ5MzAyMiwiZXhwIjoxNzc2NTgwMDIyfQ.Z8VOPmO9ND-oweXV7U8x6h4Qg-Fu49gaSFNXjCjkon48W8rPxxk17gdEP-aDM8tn7WeHd5W5fUBdq5getO0jtzRICZ9e9vG8k6GXHGLf7X8YbcwsmIr3wCTGIBpwOfCbMtIjGImnaNCa3peAwP6Olv4ayJWns6OhwMnvL7q7vo8ifFkipm398upGswAMts5k6K9ff0OgYVgaPYstxh6VrxJRWerSD-CfStMNTk5EPCTf3DcgJnq6W9mDxAz3pqYYzrw1-Be3JBB2GsXToNgOqzq2nwS_KBcgnudYE9r62GEpqqUHyahdDE-OXRsbpKB7h0A0a1rYIm1l2FdzveZ6tQ"
  
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

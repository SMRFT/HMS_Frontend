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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLUFQSS1QQVQtUiIsIkhNUy1QLUdSTkEiLCJITVMtUC1QT0wtUlciLCJITVMtUC1QRVItUlciLCJTVC1BUEktQlJELVJXIiwiSE1TLVAtRFJNLVJXIiwiTURDLVAtUkVHLVJXIiwiTURDLVAtUE5QLVIiLCJNREMtQVBJLUNEUi1SIiwiSE1TLUFQSS1EQVNIIiwiU1QtUC1ERVMtUlciLCJITVMtUC1XUi1SVyIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtUEMtUlciLCJITVMtUC1DQ0QtUlciLCJNREMtUC1HT1AtUiIsIkhNUy1QLUJMS0QtUlciLCJITVMtUC1SS0lULVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLVAtT1MtUlciLCJNREMtUC1BQVUtUlciLCJITVMtUC1NUkEtUlciLCJNREMtUi1BRE0iLCJITVMtUC1TVC1SVyIsIkhNUy1QLUNUSUEtUlciLCJTVC1SLUhPRCIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtQURNRC1SVyIsIk1EQy1QLU9TQi1SVyIsIkhNUy1QLVJFTlEtUlciLCJITVMtUC1ITVNQUyIsIk1EQy1QLUdBUC1SIiwiSE1TLVAtUk1ELVJXIiwiSE1TLVAtR1JOIiwiSE1TLVAtRERBU0giLCJNREMtUC1UUkItUlciLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtUENELVJXIiwiSE1TLVAtQ0MtUlciLCJNREMtQVBJLUxCTi1SIiwiTURDLUFQSS1SREwtUlciLCJITVMtUC1SU0QtUlciLCJITVMtQVBJLVVISUQtUiIsIkhNUy1QLUhNUyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLVJTREQtUlciLCJITVMtUC1TUk0tUlciLCJNREMtQVBJLVNHUC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiTURDLUFQSS1DR1AtUlciLCJITVMtUC1QUkwtUlciLCJNREMtQVBJLUFULVJXIiwiSE1TLVAtR1JOQS1SVyIsIk1EQy1BUEktT0dQLVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtUlNIRlQtUlciLCJNREMtQVBJLVBEQy1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLU1ULVJXIiwiTURDLVAtU09SLVIiLCJNREMtQVBJLVBHUC1SVyIsIlNULVAtU05PLVJXIiwiTURDLVAtQVNNLVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1QLVJDTE4tUlciLCJTVC1QLVRETC1SVyIsIkhNUy1BUEktVk0iLCJTVC1QLUNNVC1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtTVItUlciLCJITVMtUC1HQURNLVJXIiwiTURDLUFQSS1HQVMtUiIsIk1EQy1QLUdQUC1SIiwiU1QtUC1ERVMtUiIsIkhNUy1QLVBTRy1SVyIsIlNULUFQSS1BTUMtUlciLCJTVC1QLVRETC1SIiwiSE1TLVAtTlNELVJXIiwiSE1TLVAtREIiLCJTVC1QLU5URi1SIiwiU1QtQVBJLUVNUC1SIiwiSE1TLVAtU0lERUJBUiIsIk1EQy1QLVBOUFItUiIsIk1EQy1BUEktQVQtUiIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLUhNU1BTLVJXIiwiSE1TLVAtUFItUlciLCJITVMtUC1STS1SVyIsIlNULVAtQlJELVIiLCJTVC1QLU5URi1SVyIsIkhNUy1QLVBPTC1SIiwiTURDLVAtUE5QLVJXIiwiTURDLVAtR1NQLVIiLCJITVMtUC1WTkQtUlciLCJITVMtUC1HUk4tUlciLCJITVMtUC1BRE1MLVJXIiwiU1QtQVBJLUNSRC1SVyIsIk1EQy1BUEktUEFUIiwiU1QtUC1DTVQtUiIsIkhNUy1QLU5TLVJXIiwiTURDLUFQSS1SVFMtUiIsIk1EQy1BUEktQURNLVJXIiwiSE1TLVAtUEktUlciLCJNREMtUC1HQ1AtUiIsIk1EQy1BUEktVEhSLVIiLCJITVMtUC1CUk9PTS1SVyIsIkhNUy1QLVJTSEZURC1SVyIsIk1EQy1QLVJFRy1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMTI4LDEsMiw1LDYsMTMzLDEzNCw5LDEwLDEzNSwxMzcsMTM2LDE0LDE1LDE2LDE3LDEzOCwyNiwyNywyOCwyOSwzMCwzMSw0NCw1MCw1MSw1Miw1NSw1OCw1OSwxMDIsMTE1LDExNiwxMTcsMTE4LDEyMCwxMjEsMTIyLDEyMywxMjddLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzgyMzg3MzE5LCJleHAiOjE3ODI0NzQzMTl9.WCQH3qZIbOINhcp2nz9vBEXwYVaxAQZOKq5cTUZEdE6WNtdpmEWJ_oXj5uQ9EERzOdYGpdbzzdy8WRig_3Dgr-kqHNnkKjosue1YEAEUNj-GE59C_P88cf3TjOl8Yvo4w50WsMMTNdE6l-mEdJXrqeR5DwUJr3v9ha9IVtvtKxqK0Eslo_6siGxwCR94UiZAWMGJWQ7RJoZADW3QCQi_LIUCg0McBhWvpAC0YE25ufKdW572CIEHgJgQU-ZdVLbn2xTaBcRARez3EnhPBmsXgxBKH9K1CtiMFWT8q9YYMxgWAgjNao7DDKsw2GZEvxzts6MJXAD0kiA5M5r8NZWJ0Q";
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
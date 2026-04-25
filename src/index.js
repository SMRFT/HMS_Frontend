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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1HUEQtUiIsIlNELVAtTFJDLVIiLCJITVMtUC1BQS1SVyIsIkhNUy1QLURCIiwiU1QtUC1OVEYtUiIsIlNULUFQSS1DUkQtUlciLCJTRC1QLVNTVS1SVyIsIkVSLVAtRVJCLVJXIiwiU0QtQVBJLVRNLVJXIiwiTURDLVAtU09SLVIiLCJNREMtUC1HQ1AtUiIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtR1JOQSIsIkVSLVAtRVJSRVAtUlciLCJITVMtUC1TUk0tUlciLCJTRC1QLVNTLVIiLCJITVMtUC1SU0QtUlciLCJITVMtUC1STUQtUlciLCJNREMtQVBJLVBBVCIsIlNELVAtUEYtUlciLCJTVC1QLURFUy1SIiwiTURDLVAtUE5QLVJXIiwiSE1TLVAtR1JOIiwiU0QtQVBJLVNTLVJXIiwiU0QtUC1SQi1SVyIsIk1EQy1BUEktUERDLVJXIiwiTURDLVAtR0FQLVIiLCJNREMtUC1BQVUtUlciLCJITVMtQVBJLVBBQ0stUiIsIk1EQy1BUEktQVQtUiIsIlNELVAtUEItUlciLCJTRC1BUEktUkItUiIsIlNELVAtTFBJLVIiLCJTRC1BUEktQ04tUiIsIk1EQy1BUEktUlRTLVIiLCJFUi1QLUVSUEItUlciLCJITVMtUC1OU0QtUlciLCJITVMtUC1CTEtELVJXIiwiU1QtUC1UREwtUiIsIkhNUy1QLVNJREVCQVIiLCJTVC1QLUJSRC1SIiwiU0QtUC1TUC1SIiwiSE1TLVAtUkNBVC1SVyIsIk1EQy1QLVBOUC1SIiwiSE1TLUFQSS1WTSIsIkhNUy1QLUJMSy1SVyIsIlNELVAtVVBCLVJXIiwiTURDLVAtQVNNLVJXIiwiU1QtQVBJLUFNQy1SVyIsIlNELVAtU1MtUlciLCJNREMtUi1BRE0iLCJTRC1QLUdTUC1SIiwiU0QtUC1QRy1SVyIsIkVSLVItRVJOIiwiU1QtUC1TTk8tUlciLCJNREMtQVBJLVNHUC1SVyIsIlNULVItSE9EIiwiTURDLUFQSS1PR1AtUlciLCJNREMtQVBJLVBBVC1SIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1BUEktRExELVIiLCJNREMtQVBJLVRIUi1SIiwiU0QtUC1QT1YtUlciLCJITVMtUC1OUy1SVyIsIkhNUy1QLVJTSEZULVJXIiwiU0QtUC1CVEQtUlciLCJNREMtQVBJLVJETC1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLUhNU1BTIiwiSE1TLVAtUlNERC1SVyIsIkhNUy1QLUhNUyIsIkhNUy1BUEktREFTSCIsIlNELVAtQkctUlciLCJTVC1QLVRETC1SVyIsIk1EQy1BUEktQURNLVJXIiwiTURDLVAtR1BQLVIiLCJITVMtUC1QQy1SVyIsIlNULVAtQ01ULVJXIiwiU0QtUC1CQS1SVyIsIkhNUy1BUEktVUhJRC1SIiwiTURDLUFQSS1DR1AtUlciLCJNREMtQVBJLUNEUi1SIiwiSE1TLVAtUENELVJXIiwiSE1TLVAtQURNTC1SVyIsIkhNUy1QLUNDLVJXIiwiU1QtQVBJLUJSRC1SVyIsIk1EQy1QLVBOUFItUiIsIkVSLVAtRVJQTC1SIiwiSE1TLVAtUktJVC1SVyIsIk1EQy1BUEktUEdQLVJXIiwiRVItUC1FUkRMLVIiLCJITVMtUC1ITVNQUy1SVyIsIkhNUy1QLVJLSVRELVJXIiwiU0QtUC1TQy1SIiwiU0QtUC1HUEItUiIsIlNELVAtTFRNLVJXIiwiU0QtUi1TTUMiLCJITVMtUC1BRE1ELVJXIiwiTURDLUFQSS1BR1AtUlciLCJNREMtUC1PU0ItUlciLCJNREMtUC1HU1AtUiIsIkdQLVAtR0NOLVIiLCJTVC1BUEktRU1QLVIiLCJTRC1BUEktVEQtUiIsIkhNUy1QLVJNLVJXIiwiTURDLVAtVFJCLVJXIiwiU1QtUC1OVEYtUlciLCJNREMtUC1HT1AtUiIsIlNELVAtTEJDLVJXIiwiSE1TLVAtR0FETS1SVyIsIkVSLVAtRVJHTkJOLVIiLCJNREMtQVBJLUFULVJXIiwiSE1TLVAtQ0NELVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiU0QtUC1MQk4tUiIsIk1EQy1QLVJFRy1SVyIsIk1EQy1BUEktTEJOLVIiLCJITVMtUC1CUk9PTS1SVyIsIk1EQy1QLVJFRy1SIiwiTURDLUFQSS1HQVMtUiIsIlNULVAtQ01ULVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsyLDUsNiwxMCwxNCwxNSwxNiwxNywyMCwyNiwyNywyOCwyOSwzMCw0NCw1MCw1MSw1Miw1NSwyMSw1OCw1OV0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc3MTAyOTgxLCJleHAiOjE3NzcxODk5ODF9.gAitRxClfQKD77C4hYYAmL8R7ipgrgDXNMPkdlDy7J9tVwtSrhu31R_s1uNhnKpQ0IMGRWKqwUiLieTNjsIUct5FfJDsQlaT0zoNYer_G45giZUtz8iP2Q1RjuE5TBM02w_L9-Ja-G80SDqTR_QgYPB4UwMMVcGkSmY-7HiUwLOsXPzy8qAnuJNfPJaAjH-gLFCQ-o6eP6QpIQwYqKU5EocedVVxXw9M6IXYuehjMmNnN_TMjnl2dsV5kMkg4WeXEvrGBXcOtjOi-UwiFzIlFdlBj5RRUZT-r8c4DKmvFZf53fIgHYH3gJ0MLa5DQUmOi1IcoCUa2Z7GMMuAp28U3A";
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
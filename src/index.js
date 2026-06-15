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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLUFQSS1QQVQtUiIsIkhNUy1QLUdSTkEiLCJITVMtUC1QT0wtUlciLCJTRC1QLUxQSS1SIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLURSTS1SVyIsIkhNUy1QLVBFUi1SVyIsIk1EQy1QLVJFRy1SVyIsIk1EQy1QLVBOUC1SIiwiTURDLUFQSS1DRFItUiIsIlNELVAtU1MtUlciLCJTRC1QLVNTLVIiLCJITVMtQVBJLURBU0giLCJTVC1QLURFUy1SVyIsIkVSLVAtRVJHTkJOLVIiLCJTSU4tQVBJLU9SLVJXIiwiSE1TLVAtV1ItUlciLCJITVMtUC1BQS1SVyIsIkhNUy1QLVBDLVJXIiwiSE1TLVAtQ0NELVJXIiwiTURDLVAtR09QLVIiLCJTSU4tUC1HREwtUiIsIlNELVAtU1AtUiIsIlNELVAtR1BCLVIiLCJITVMtUC1CTEtELVJXIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLU9TLVJXIiwiTURDLVAtQUFVLVJXIiwiSE1TLVAtTVJBLVJXIiwiTURDLVItQURNIiwiRVItUC1FUkRMLVIiLCJITVMtUC1TVC1SVyIsIlNULVItSE9EIiwiU0lOLVAtUkFVLVJXIiwiSE1TLVAtQ1RJQS1SVyIsIlNELVAtTEJDLVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtUE9BLVJXIiwiSE1TLVAtSUItUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1BSU4tUlciLCJITVMtUC1BRE1ELVJXIiwiTURDLVAtT1NCLVJXIiwiSE1TLVAtUkVOUS1SVyIsIlNELVItU01DIiwiSE1TLVAtSE1TUFMiLCJFUi1QLUVSQi1SVyIsIk1EQy1QLUdBUC1SIiwiSE1TLVAtUk1ELVJXIiwiSE1TLVAtR1JOIiwiU0QtUC1VUEItUlciLCJTSU4tUi1TQSIsIkhNUy1QLUREQVNIIiwiTURDLVAtVFJCLVJXIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLVBDRC1SVyIsIkhNUy1QLUNDLVJXIiwiTURDLUFQSS1MQk4tUiIsIlNELVAtUEctUlciLCJNREMtQVBJLVJETC1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1BUEktVUhJRC1SIiwiU0QtUC1TU1UtUlciLCJITVMtUC1ITVMiLCJITVMtUC1CTEstUlciLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtU1JNLVJXIiwiTURDLUFQSS1TR1AtUlciLCJNREMtQVBJLUFHUC1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiU0QtQVBJLVRNLVJXIiwiU0QtUC1QQi1SVyIsIk1EQy1BUEktQVQtUlciLCJTRC1BUEktU1MtUlciLCJITVMtUC1HUk5BLVJXIiwiTURDLUFQSS1PR1AtUlciLCJITVMtUC1TVEEtUlciLCJITVMtUC1SU0hGVC1SVyIsIk1EQy1BUEktUERDLVJXIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1WTkRELVJXIiwiTURDLVAtU09SLVIiLCJNREMtQVBJLVBHUC1SVyIsIlNJTi1BUEktU0YtUiIsIlNELVAtU0MtUiIsIlNULVAtU05PLVJXIiwiTURDLVAtQVNNLVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiU0lOLUFQSS1GVS1SVyIsIkdQLVAtR0NOLVIiLCJTSU4tUC1GQS1SVyIsIkhNUy1QLVJDTE4tUlciLCJFUi1QLUVSUkVQLVJXIiwiU1QtUC1UREwtUlciLCJITVMtQVBJLVZNIiwiU0lOLVAtUkEtUlciLCJTVC1QLUNNVC1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtTVItUlciLCJITVMtUC1HQURNLVJXIiwiU0QtQVBJLUNOLVIiLCJNREMtQVBJLUdBUy1SIiwiTURDLVAtR1BQLVIiLCJTRC1QLUJURC1SVyIsIlNELVAtUEYtUlciLCJTSU4tUC1PUC1SVyIsIlNULVAtREVTLVIiLCJFUi1QLUVSUEItUlciLCJTRC1QLUJBLVJXIiwiSE1TLVAtUFNHLVJXIiwiU1QtQVBJLUFNQy1SVyIsIlNULVAtVERMLVIiLCJTRC1QLUxCTi1SIiwiSE1TLVAtTlNELVJXIiwiU0lOLUFQSS1PUlItUiIsIkhNUy1QLURCIiwiU1QtUC1OVEYtUiIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLVNJREVCQVIiLCJNREMtUC1QTlBSLVIiLCJNREMtQVBJLUFULVIiLCJTRC1QLVJCLVJXIiwiSE1TLVAtQ1RJLVJXIiwiU0QtUC1HU1AtUiIsIkVSLVItRVJOIiwiU0lOLVAtR0lDLVIiLCJITVMtUC1ITVNQUy1SVyIsIkhNUy1QLVJNLVJXIiwiU1QtUC1CUkQtUiIsIlNULVAtTlRGLVJXIiwiRVItUC1FUlBMLVIiLCJITVMtUC1QT0wtUiIsIk1EQy1QLVBOUC1SVyIsIk1EQy1QLUdTUC1SIiwiU0lOLUFQSS1JRi1SVyIsIkhNUy1QLVZORC1SVyIsIlNELVAtUE9WLVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtQURNTC1SVyIsIlNULUFQSS1DUkQtUlciLCJNREMtQVBJLVBBVCIsIlNULVAtQ01ULVIiLCJTRC1BUEktVEQtUiIsIkhNUy1QLU5TLVJXIiwiTURDLUFQSS1SVFMtUiIsIlNELVAtTFJDLVIiLCJNREMtQVBJLUFETS1SVyIsIkhNUy1QLVBJLVJXIiwiTURDLVAtR0NQLVIiLCJNREMtQVBJLVRIUi1SIiwiU0QtUC1HUEQtUiIsIlNELUFQSS1SQi1SIiwiU0QtUC1MVE0tUlciLCJITVMtUC1CUk9PTS1SVyIsIlNELVAtQkctUlciLCJNREMtUC1SRUctUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEyOCwxLDIsNSw2LDksMTAsMTQsMTUsMTYsMTcsMjYsMjcsMjgsMjksMzAsNDQsNTAsNTEsNTIsNTUsNTgsNTksMTAyLDExNSwxMTYsMTE3LDExOCwxMjAsMTIxLDEyMiwxMjMsMTI3LDMxXSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4MTUwMTQzNCwiZXhwIjoxNzgxNTg4NDM0fQ.FVafNE0ypOgA0Do50lXvRO7E4Mu4zSyMvrnFP4FDsCn7jbrsq_oVxwxDYa7CFJvDwsp67sYDubPxJHDXMG7ZVVRh5KmAJVERDa4U4t0n9Q9tOLH-ozjfvpB-et3vpN0UH42IbhDMrwSHd2g8iRWu0qAPWTviHvXvea5pxCUgTe1Qe0oY6RzT2lkydqBcUeD3aLdMcl22OnHHbBrPYOkA2anZq-6wBWrwwuxaXDxzhtLCZ-nWP8Ww6RvgELD67Z2JTDV-JgbWl8vCcfCDS7zTdYNaW6HTnDAQusimq-CvJdWt1ypux-4eqp3Hx5LhPVlOvLJtxfzcfbhWSIeqCsX-tw";
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
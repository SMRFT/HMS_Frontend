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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1BUEktU0FNVC1SVyIsIkhNUy1QLU9UTS1SIiwiSE1TLVAtUElELVJXIiwiR0wtUC1FQlQtUlciLCJITVMtUC1JUEtHLVIiLCJITVMtUC1PUy1SVyIsIk1EQy1BUEktUEdQLVJXIiwiSE1TLVAtUEMtUlciLCJTVC1SLUEiLCJNREMtQVBJLVBEQy1SVyIsIkhNUy1QLUFEQVNIIiwiU1QtUi1DRFIiLCJITVMtUC1HUk5BLVJXIiwiSE1TLVAtU1VNRC1SVyIsIkhNUy1QLUFNRC1SVyIsIkhNUy1QLUNDLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1SU0hGVC1SVyIsIkdQLVAtR0NOLVIiLCJITVMtUC1WSU5BLVJXIiwiSE1TLVItViIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1DQ0QtUlciLCJITVMtUC1EQiIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1PVE1FLVJXIiwiSE1TLVAtVlYtUlciLCJITVMtUC1JUEtHRS1SVyIsIk1EQy1QLUdDUC1SIiwiSE1TLVAtSUNELVJXIiwiSE1TLVAtV1ItUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIkhNUy1QLUNDTUJQQi1SVyIsIkhNUy1QLUlCRC1SVyIsIkdMLVAtRUQtUlciLCJITVMtUC1CVEUtUlciLCJITVMtUC1BRE1ELVJXIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLVNVTUUtUlciLCJITVMtUC1CVC1SIiwiSE1TLVAtSVBIIiwiSE1TLVAtQlJPT00tUlciLCJHRC1QLUdQIiwiSE1TLVAtUFNHLVJXIiwiSE1TLVAtUENELVJXIiwiSE1TLUFQSS1SRC1SIiwiSE1TLUFQSS1SREQtUlciLCJITVMtUC1PVFNTLVIiLCJNREMtUC1HQVAtUiIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1STUQtUlciLCJITVMtUC1HUk4tUlciLCJNREMtUC1QTlBSLVIiLCJITVMtUC1CVEQtUlciLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLUFBLVJXIiwiU0lOLUFQSS1PUlItUiIsIlNULVAtVERMLVIiLCJTVC1QLU5URi1SIiwiSE1TLVAtU1RBLVJXIiwiU1QtQVBJLUNSRC1SVyIsIkhNUy1QLVZWRS1SVyIsIkhNUy1QLUFNRS1SVyIsIkhNUy1QLVZWLVIiLCJITVMtQVBJLVJELVJXIiwiSE1TLUFQSS1SREUtUlciLCJITVMtUC1TVU0tUlciLCJNREMtUC1BQVUtUlciLCJITVMtUC1CVC1SVyIsIk1EQy1BUEktU0dQLVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiTURDLUFQSS1BVC1SIiwiSE1TLVAtUEVSLVJXIiwiSE1TLVAtVklOLVIiLCJITVMtQVBJLUlULVJXIiwiSE1TLVAtUlNERC1SVyIsIkdMLVAtUC1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtT1RNQkUtUlciLCJTSU4tQVBJLVNGLVIiLCJITVMtQVBJLVVISUQtUiIsIkhNUy1QLUFNLVJXIiwiTURDLUFQSS1BR1AtUlciLCJITVMtUC1JUEQtUlciLCJITVMtUC1JQi1SVyIsIkhNUy1QLVNHUk4tUlciLCJITVMtUC1SRU5RLVJXIiwiU1QtQVBJLUFNQy1SVyIsIkhNUy1QLVBJLVJXIiwiSE1TLVAtT1RTU0EtUlciLCJTVC1QLVNOTy1SVyIsIk1EQy1QLUdPUC1SIiwiSE1TLVAtSVBLRy1SVyIsIkhNUy1QLUxORC1SVyIsIkhNUy1QLU5TLVJXIiwiR0wtUC1FUC1SVyIsIkhNUy1BUEktU0FNLVJXIiwiU1QtUC1ERVMtUlciLCJITVMtUC1DQ0dSQi1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtQkxLLVJXIiwiSE1TLVAtT1RNQi1SVyIsIkhNUy1QLVNVTS1SIiwiSE1TLVAtVk5ELVJXIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLVZJTkUtUlciLCJITVMtUC1PVFNTLVJXIiwiR0wtUC1OREMtUlciLCJITVMtUC1PVE1CRC1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiU1QtUC1DTVQtUiIsIlNULVAtVERMLVJXIiwiSE1TLVAtSVBLR0QtUlciLCJITVMtUC1JUEUtUlciLCJTVC1QLUJSRC1SIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtU1JNLVJXIiwiSE1TLVAtT1RTU0QtUlciLCJTSEktUC1UUkFJTi1SVyIsIlNISS1QLUlOQyIsIk1EQy1SLVBEQyIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLUlQLVJXIiwiR0wtUC1BTkQtUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1BTS1SIiwiR0wtUC1FTC1SVyIsIk1EQy1QLUdTUC1SIiwiSE1TLVAtUktJVEQtUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1EREFTSCIsIkhNUy1QLUlCRS1SVyIsIkhNUy1BUEktU1JNLVJXIiwiSE1TLVAtU1VNQS1SVyIsIlNULVAtTlRGLVJXIiwiSE1TLUFQSS1EQVNIIiwiSE1TLVAtVlZELVJXIiwiSE1TLVAtR0FETS1SVyIsIk1EQy1BUEktT0dQLVJXIiwiU1QtUC1DTVQtUlciLCJITVMtUC1EUk0tUlciLCJTVC1QLURFUy1SIiwiSE1TLVAtQVNSLVJXIiwiSE1TLUFQSS1SREEtUlciLCJITVMtUC1PVFNTVS1SVyIsIkhNUy1QLURPLVJXIiwiU0lOLUFQSS1JRi1SIiwiR0wtUC1FQUQtUlciLCJITVMtUC1PVE1ELVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLVZOREQtUlciLCJTSU4tUi1BQ0MiLCJITVMtUC1QU0gtUlciLCJNREMtUC1HUFAtUiIsIkhNUy1QLURMRC1SVyIsIkhNUy1QLVJTSEZURC1SVyIsIkhNUy1QLU9QSCIsIkhNUy1QLU9QSC1SVyIsIlNISS1QLUVYUC1SVyIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLUNDR0FTLVJXIiwiR0wtUC1SU0UtUlciLCJITVMtUC1PVE0tUlciLCJITVMtUC1WSS1SIiwiTURDLUFQSS1DR1AtUlciLCJITVMtUC1PVFNTRS1SVyIsIkhNUy1QLVZJTi1SVyIsIkhNUy1QLVZJRC1SVyIsIkhNUy1QLVZJLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtVklFLVJXIiwiSE1TLVAtSVAtUiIsIkhNUy1BUEktRExELVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxLDIsMyw0LDUsNiw3LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjYsMjcsMjgsMjksMzAsMzEsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDAsNDEsNDIsNDMsNDQsNDcsNDgsNDksNTAsNTEsNTIsNTMsNTQsNTUsNTcsNTgsNTksMTAxLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTExLDExMiwxMTMsMTE1LDExNiwxMTcsMTE4LDEyNl0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDA";
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

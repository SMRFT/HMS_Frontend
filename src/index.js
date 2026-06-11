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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUJURS1SVyIsIkhNUy1QLU9QU1JCRC1SVyIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLVNVTS1SVyIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1EUk0tUlciLCJITVMtUC1QRVItUlciLCJITVMtUC1QU0gtUlciLCJITVMtQVBJLURBU0giLCJITVMtUC1DQ0dSQi1SVyIsIlNULVAtREVTLVJXIiwiSE1TLUFQSS1SREQtUlciLCJITVMtUC1XUi1SVyIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtUEMtUlciLCJITVMtUC1DQ0QtUlciLCJITVMtUC1PVFNTRS1SVyIsIkhNUy1BUEktUEFDSyIsIkhNUy1QLUlQS0ctUlciLCJITVMtUC1PVFNTVS1SVyIsIkhNUy1BUEktUkRBLVJXIiwiSE1TLVAtQlQtUiIsIkhNUy1QLVZJLVJXIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1WVi1SVyIsIkhNUy1QLU9TLVJXIiwiSE1TLVAtT1RTU0QtUlciLCJITVMtUC1PVFNTQS1SVyIsIkhNUy1QLU1SQS1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtQ1RJQS1SVyIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLVBPQS1SVyIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLUFQSS1SRC1SVyIsIkhNUy1BUEktSVQtUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1BRE1ELVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLUxORC1SVyIsIkhNUy1QLU9UTS1SIiwiSE1TLVAtT1RNQkQtUlciLCJITVMtUC1STUQtUlciLCJTVC1SLUNEUiIsIkhNUy1QLVNVTUEtUlciLCJITVMtUC1EREFTSCIsIkhNUy1QLU9UU1MtUlciLCJITVMtUC1JQkQtUlciLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtSVBLR0QtUlciLCJITVMtUC1QQ0QtUlciLCJITVMtUC1TVU1ELVJXIiwiSE1TLVAtQ0MtUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1PVE1FLVJXIiwiSE1TLVAtQU1FLVJXIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtSVAtUlciLCJITVMtQVBJLVVISUQtUiIsIkhNUy1QLURMRC1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJITVMtUC1ITVMiLCJITVMtUC1CTEstUlciLCJITVMtUC1TVU1FLVJXIiwiSE1TLVAtUlNERC1SVyIsIkhNUy1QLVNSTS1SVyIsIkhNUy1QLUFNLVJXIiwiSE1TLUFQSS1SRC1SIiwiSE1TLVAtT1BHU1JELVJXIiwiSE1TLVAtVlYtUiIsIkhNUy1QLUdSTkEtUlciLCJITVMtUC1BU1ItUlciLCJITVMtUC1TVEEtUlciLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1QLVZJTkUtUlciLCJITVMtUC1SQ0FURC1SVyIsIkhNUy1QLVZOREQtUlciLCJITVMtUC1EUi1SVyIsIlNULVAtU05PLVJXIiwiSE1TLVAtQ0NHQVMtUlciLCJITVMtUC1PVFNTLVIiLCJITVMtUC1WSUUtUlciLCJITVMtUC1SQ0xOLVJXIiwiSE1TLUFQSS1TQU1ULVJXIiwiU1QtUC1UREwtUlciLCJITVMtUC1WSU5SLVIiLCJTVC1QLUNNVC1SVyIsIkhNUy1QLUlQRS1SVyIsIkhNUy1QLU1SLVJXIiwiSE1TLUFQSS1SREUtUlciLCJITVMtUC1SS0lURC1SVyIsIkhNUy1QLUdBRE0tUlciLCJITVMtUC1WVkUtUlciLCJITVMtUC1ETy1SVyIsIkhNUy1QLVZJRC1SVyIsIkhNUy1BUEktU0FNLVJXIiwiU1QtUC1ERVMtUiIsIkhNUy1QLUFNLVIiLCJITVMtUC1JUEtHRS1SVyIsIkhNUy1QLVZJTi1SVyIsIkhNUy1SLVYiLCJITVMtUC1TVU0tUiIsIkhNUy1QLVBTRy1SVyIsIlNULUFQSS1BTUMtUlciLCJITVMtUC1BTUQtUlciLCJTVC1QLVRETC1SIiwiSE1TLVAtQ0NPUFBCLVJXIiwiSE1TLVAtVklOQS1SVyIsIkhNUy1QLUNDR0FILVJXIiwiSE1TLVAtVlZELVJXIiwiSE1TLVAtTlNELVJXIiwiSE1TLVAtT1RNQi1SVyIsIkhNUy1QLURCIiwiSE1TLVAtT1RNRC1SVyIsIlNULVAtTlRGLVIiLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1PUEgiLCJITVMtUC1BREFTSCIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1DVEktUlciLCJITVMtUC1WSS1SIiwiR0QtUC1HUCIsIkhNUy1QLVNSQkQtUlciLCJITVMtUC1PVE0tUlciLCJITVMtUC1STS1SVyIsIlNULVAtQlJELVIiLCJTVC1QLU5URi1SVyIsIkhNUy1QLVBHUEJULVJXIiwiSE1TLVAtSUNELVJXIiwiSE1TLVAtT1RNQkUtUlciLCJITVMtUC1CVC1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLUlCRS1SVyIsIkhNUy1QLVNSR1BELVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtQURNTC1SVyIsIlNULUFQSS1DUkQtUlciLCJTVC1QLUNNVC1SIiwiU1QtUi1BIiwiSE1TLVAtTlMtUlciLCJITVMtQVBJLVNSTS1SVyIsIkhNUy1QLVZJTi1SIiwiSE1TLVAtSVBELVJXIiwiSE1TLVAtUEktUlciLCJITVMtUC1TR1JOLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiSE1TLVAtQlRELVJXIiwiSE1TLVAtSVAtUiIsIkhNUy1QLU9QSC1SVyIsIkhNUy1QLUJST09NLVJXIiwiSE1TLVAtREJVRFItUiIsIkhNUy1QLVJTSEZURC1SVyIsIkhNUy1QLVJPUi1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEsMiwzLDQsNSw2LDcsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyNiwyNywyOCwyOSwzMCwzMSwzMiwzMywzNCwzNSwzNiwzNywzOCwzOSw0MCw0MSw0Miw0Myw0NCw0Nyw0OCw0OSw1MCw1MSw1Miw1Myw1NCw1NSw1Nyw1OCw1OSwxMDEsMTAzLDEwNCwxMDUsMTA2LDEwNywxMDgsMTA5LDExMCwxMTEsMTEyLDExMywxMTUsMTE2LDExNywxMTgsMTI2LDEyOSwxMjAsMTIxLDEyMywxMjIsMTI3LDEyOCwxMjQsMTI1LDEwMCw0Niw0NV0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDIiLCJPTEVUMDAxIiwiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4MTA3OTUxOSwiZXhwIjoxNzgxMTY2NTE5fQ.GCq0sERJg8_-FS6G5UjJ1Zz1Iu8VPFU378GAain8ITsTXMUFv5gkpc2tmzhCFx5U6LQ81d32uT2MS3hX-Clu6oxfDzMtM7Xu";
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

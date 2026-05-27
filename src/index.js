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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1BUEktU0FNVC1SVyIsIkhNUy1QLU9UTS1SIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtSVBLRy1SIiwiSE1TLVAtT1MtUlciLCJITVMtUC1QQy1SVyIsIlNULVItQSIsIkhNUy1QLUFEQVNIIiwiU1QtUi1DRFIiLCJITVMtUC1HUk5BLVJXIiwiSE1TLVAtU1VNRC1SVyIsIkhNUy1QLUFNRC1SVyIsIkhNUy1QLUNDLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1QLVZJTkEtUlciLCJITVMtUi1WIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUNDRC1SVyIsIkhNUy1QLURCIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLU9UTUUtUlciLCJITVMtUC1WVi1SVyIsIkhNUy1QLUlQS0dFLVJXIiwiSE1TLVAtV1ItUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIkhNUy1QLUNDTUJQQi1SVyIsIkhNUy1QLUlCRC1SVyIsIkhNUy1QLUJURS1SVyIsIkhNUy1QLUFETUQtUlciLCJITVMtUC1SS0lULVJXIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLUJULVIiLCJITVMtUC1JUEgiLCJITVMtUC1CUk9PTS1SVyIsIkdELVAtR1AiLCJITVMtUC1QU0ctUlciLCJITVMtUC1QQ0QtUlciLCJITVMtQVBJLVJERC1SVyIsIkhNUy1BUEktUkQtUiIsIkhNUy1QLU9UU1MtUiIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1STUQtUlciLCJITVMtUC1HUk4tUlciLCJITVMtUC1CVEQtUlciLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLUFBLVJXIiwiU1QtUC1UREwtUiIsIlNULVAtTlRGLVIiLCJITVMtUC1TVEEtUlciLCJTVC1BUEktQ1JELVJXIiwiSE1TLVAtVlZFLVJXIiwiSE1TLVAtQU1FLVJXIiwiSE1TLVAtVlYtUiIsIkhNUy1BUEktUkQtUlciLCJITVMtQVBJLVJERS1SVyIsIkhNUy1QLVNVTS1SVyIsIkhNUy1QLUJULVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtUEVSLVJXIiwiSE1TLVAtVklOLVIiLCJITVMtQVBJLUlULVJXIiwiSE1TLVAtUlNERC1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtT1RNQkUtUlciLCJITVMtQVBJLVVISUQtUiIsIkhNUy1QLUFNLVJXIiwiSE1TLVAtSVBELVJXIiwiSE1TLVAtSUItUlciLCJITVMtUC1TR1JOLVJXIiwiSE1TLVAtUkVOUS1SVyIsIlNULUFQSS1BTUMtUlciLCJITVMtUC1QSS1SVyIsIkhNUy1QLU9UU1NBLVJXIiwiU1QtUC1TTk8tUlciLCJITVMtUC1JUEtHLVJXIiwiSE1TLVAtTlMtUlciLCJITVMtQVBJLVNBTS1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1STS1SVyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLU9UTUItUlciLCJITVMtUC1TVU0tUiIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLUJMS0QtUlciLCJITVMtUC1WSU5FLVJXIiwiSE1TLVAtT1RTUy1SVyIsIkhNUy1QLU9UTUJELVJXIiwiSE1TLVAtU1QtUlciLCJITVMtUC1DQ09QUEItUlciLCJTVC1QLUNNVC1SIiwiU1QtUC1UREwtUlciLCJITVMtUC1JUEtHRC1SVyIsIkhNUy1QLUlQRS1SVyIsIlNULVAtQlJELVIiLCJITVMtUC1DQ0MtUlciLCJITVMtUC1TUk0tUlciLCJITVMtUC1PVFNTRC1SVyIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLUlQLVJXIiwiSE1TLVAtQU0tUiIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtRERBU0giLCJITVMtUC1JQkUtUlciLCJITVMtQVBJLVNSTS1SVyIsIkhNUy1QLVNVTUEtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1BUEktREFTSCIsIkhNUy1QLVZWRC1SVyIsIkhNUy1QLUdBRE0tUlciLCJTVC1QLUNNVC1SVyIsIkhNUy1QLURSTS1SVyIsIlNULVAtREVTLVIiLCJITVMtUC1BU1ItUlciLCJITVMtQVBJLVJEQS1SVyIsIkhNUy1QLU9UU1NVLVJXIiwiSE1TLVAtRE8tUlciLCJITVMtUC1PVE1ELVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLVZOREQtUlciLCJITVMtUC1QU0gtUlciLCJITVMtUC1ETEQtUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1PUEgiLCJITVMtUC1PUEgtUlciLCJITVMtUC1OU0QtUlciLCJITVMtUC1DQ0dBUy1SVyIsIkhNUy1QLU9UTS1SVyIsIkhNUy1QLVZJLVIiLCJITVMtUC1PVFNTRS1SVyIsIkhNUy1QLVZJTi1SVyIsIkhNUy1QLVZJRC1SVyIsIkhNUy1QLVZJLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtVklFLVJXIiwiSE1TLVAtSVAtUiIsIkhNUy1BUEktRExELVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxLDIsMyw0LDUsNiw3LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjYsMjcsMjgsMjksMzAsMzEsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDAsNDEsNDIsNDMsNDQsNDcsNDgsNDksNTAsNTEsNTIsNTMsNTQsNTUsNTcsNTgsNTksMTAxLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTEyLDExMywxMTUsMTE2LDExNywxMThdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDQiLCJPTEVUMDAyIiwiT0xFVDAwMSIsIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3Nzk3NjcwNzQsImV4cCI6MTc3OTg1NDA3NH0.ADPSH2OmG1L51Wp2WM47bHxr33DLxhnMOlZVPYA8DfWfcFpnRPEmiokAUPwyX2J1Pwuo0fs7Br2W_Gi7rm7AypDwIqxLs0tRqks1RI9hIqKQatzD5DumUd0fII5W8xL3MIWT91ISnh5ChrJ1yz1MlWwY6SLJNmv1ZINFgKKOK-ts_qL5leWHd2AzasenRtqZ4NlwLaSWhJK0rui8bvuO6sctlhiWuL2TGUiZJLebGxde-J4W5J76BY03APeWbonf50HGtJKae4y34GrtLheynLu9Y6LfFtsd-HCAM-I8u1TgzEklFk1uMl7f61G4-TDIcQPQMHWhe8goHsSqrUumgA";
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

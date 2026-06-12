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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJHTC1QLUVELVJXIiwiTURDLUFQSS1QQVQtUiIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1EUk0tUlciLCJFUi1QLUVSQVMtUlciLCJNREMtUC1SRUctUlciLCJFUi1QLUVSVkItUlciLCJFUi1BUEktRVJVQi1SVyIsIk1EQy1QLVBOUC1SIiwiTURDLUFQSS1DRFItUiIsIlNISS1QLUZPUk0tUlciLCJTVC1QLURFUy1SVyIsIlNJTi1BUEktT1ItUlciLCJTSEktUC1DVC1SVyIsIk1EQy1QLVBURS1SVyIsIlNISS1QLUYyU1ItUlciLCJITVMtUC1BQS1SVyIsIkhNUy1QLUNDQy1SVyIsIkhNUy1QLVJLSVQtUlciLCJTSEktUC1YUkFZLVJXIiwiSE1TLVAtQ1RJQS1SVyIsIlNULVItSE9EIiwiU0hJLVAtVVBELVJXIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLUFQSS1JVC1SVyIsIlNISS1QLUYxLVJXIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtQURNRC1SVyIsIk1EQy1QLU9TQi1SVyIsIkdMLVAtRVAtUlciLCJTSEktUC1GMy1SVyIsIlNISS1QLU9QRC1SVyIsIlNISS1QLUNIRU1PLVJXIiwiRVItUC1FUkItUlciLCJITVMtUC1STUQtUlciLCJTSEktUC1IQU5EUi1SVyIsIlNISS1QLUhSLVJXIiwiU0hJLVAtVVBEUkFXLVJXIiwiU0hJLVAtQVZBSUwtUlciLCJNREMtUC1UUkItUlciLCJITVMtQVBJLURMRC1SIiwiU0hJLVAtTVJJLVJXIiwiU0hJLVAtQ0hFTU9SLVJXIiwiTURDLUFQSS1MQk4tUiIsIkVSLVAtRVJHUFItUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJFUi1QLUVSR0FTLVJXIiwiU0hJLVAtRU1SUi1SVyIsIk1EQy1BUEktUkRMLVJXIiwiU0hJLVAtVFJBSU5SLVJXIiwiSE1TLVAtUlNELVJXIiwiU0hJLVAtRlJOVC1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIlNISS1QLU1JQ1VSLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtQkxLLVJXIiwiU0ktUi1JTkRJTiIsIkhNUy1QLVNSTS1SVyIsIkdMLVAtUC1SVyIsIlNISS1QLU5JQ1VSLVJXIiwiR0wtUC1BTkQtUlciLCJTSEktUC1ERUwtUlciLCJNREMtQVBJLUFULVJXIiwiU0hJLVAtRjJSLVJXIiwiU0hJLVAtU0lDVVItUlciLCJITVMtUC1BU1ItUlciLCJTSEktUC1FTVItUlciLCJTSEktUC1GMVMtUlciLCJNREMtUC1TT1ItUiIsIkVSLVItRVJTQSIsIlNJTi1BUEktU0YtUiIsIlNULVAtU05PLVJXIiwiTURDLVAtQVNNLVJXIiwiSE1TLVAtQ0NHQVMtUlciLCJHTC1QLU5EQy1SVyIsIlNISS1QLUdFVFJBVy1SVyIsIlNJTi1BUEktRlUtUlciLCJHUC1QLUdDTi1SIiwiU0hJLVAtTUlDVS1SVyIsIlNISS1QLUhBTkQtUlciLCJFUi1QLUVSUkVQLVJXIiwiU1QtUC1UREwtUlciLCJITVMtQVBJLVNBTVQtUlciLCJNREMtUi1SRUMiLCJITVMtUC1WSU5SLVIiLCJTVC1QLUNNVC1SVyIsIlNISS1QLVBIWS1SVyIsIk1EQy1BUEktR0FTLVIiLCJTSEktUC1UUkFJTi1SVyIsIkhNUy1BUEktU0FNLVJXIiwiU1QtUC1ERVMtUiIsIlNISS1QLVJFQ1ItUlciLCJTSEktUC1GMVNSLVJXIiwiU1QtQVBJLUFNQy1SVyIsIlNULVAtVERMLVIiLCJITVMtUC1DQ09QUEItUlciLCJTSEktUC1FWFAtUlciLCJITVMtUC1DQ0dBSC1SVyIsIlNISS1QLVNJQ1UtUlciLCJTSEktUC1NT0NLLVJXIiwiU0hJLVAtRjFSLVJXIiwiU0lOLUFQSS1PUlItUiIsIkdMLVAtRUJULVJXIiwiU0hJLVAtUkVDLVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLU9QSCIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLVNJREVCQVIiLCJNREMtUC1QTlBSLVIiLCJNREMtQVBJLUFULVIiLCJTSEktUC1GM1ItUlciLCJHTC1QLUVMLVJXIiwiSE1TLVAtQ1RJLVJXIiwiU0lOLVAtR0lDLVIiLCJITVMtUC1STS1SVyIsIlNULVAtQlJELVIiLCJHTC1QLUVBRC1SVyIsIlNULVAtTlRGLVJXIiwiR0wtUC1SU0UtUlciLCJTSEktUC1ERUxSQVctUlciLCJITVMtUC1JQ0QtUlciLCJNREMtUC1QTlAtUlciLCJTSEktUC1MQUItUlciLCJTSU4tQVBJLUlGLVJXIiwiSE1TLVAtQlQtUlciLCJITVMtUC1JUEgiLCJTSEktUC1PVC1SVyIsIlNISS1QLUYyUy1SVyIsIk1EQy1QLVJERS1SVyIsIlNISS1QLU1SRC1SVyIsIkhNUy1QLUFETUwtUlciLCJTVC1BUEktQ1JELVJXIiwiTURDLUFQSS1QQVQiLCJTVC1QLUNNVC1SIiwiSE1TLVAtTlMtUlciLCJTSEktUC1QSEFSTS1SVyIsIk1EQy1BUEktUlRTLVIiLCJTSEktUC1JTkMiLCJTSEktUC1OSUNVLVJXIiwiSE1TLUFQSS1TUk0tUlciLCJITVMtUC1TR1JOLVJXIiwiU0hJLVAtRElBLVJXIiwiTURDLUFQSS1USFItUiIsIk1EQy1QLUNERS1SVyIsIlNISS1QLUYyLVJXIiwiSE1TLVAtREJVRFItUiIsIkhNUy1QLVJPUi1SVyIsIk1EQy1QLVJFRy1SIiwiU0lOLVItQURNIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMTI4LDEsMiw0LDUsMTAsMTEsMTIsMTMsMTgsMTksMjAsMjEsMjYsMjcsMjgsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDMsNDUsNDYsNTAsNTEsNTIsNTUsNTcsMTAxLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTExLDExMiwxMjQsMTI1LDEyN10sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDEiLCJPTEVUMDAyIiwiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4MTI2Mjk5MywiZXhwIjoxNzgxMzQ5OTkzfQ.IYv-ECLq4iZDsMg4c79rfzIrCVrqLPzeGgVVRmXRWiuZdrtJSpGOJqrrmYVUTfGQfQcLBgSFT602KtsVW_vLxY3TLsjAR9424Do2vgV9_z9ZOeA4TyABGNm8HKaRdv6R7xOk5ZNw6t_k4paN0IiNXtDkykGIUYj21Sfled5LkE2K8jQAUjA0BbaUh7CUBaaWB1AsDn9OiquxD8e5JU0IhhBSjZWQvQB2JdWv4_62sZAnmr2vJ_eP2jxHxIFclR1_v_N3_5N1D2_2FXMECfpUsoV6HaS8GONG4kojcAswHmBp2tsrO5EseQ84mm9Jt7MhguylZp9dIiUGYBsbtamE5g";
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
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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTSEktUC1GM1ItUlciLCJTSEktUC1PVC1SVyIsIk1EQy1QLUNERS1SVyIsIkVSLVAtRVJWQi1SVyIsIlNULVAtTlRGLVIiLCJITVMtUC1BU1ItUlciLCJTVC1BUEktQ1JELVJXIiwiU0hJLVAtTVJELVJXIiwiRVItUC1FUkItUlciLCJTSEktUC1SRUNSLVJXIiwiU0hJLVAtU0lDVVItUlciLCJTSS1SLUlORElOIiwiTURDLVAtUFRFLVJXIiwiTURDLVAtU09SLVIiLCJITVMtUC1JUEgiLCJFUi1QLUVSUkVQLVJXIiwiRVItQVBJLUVSVUItUlciLCJNREMtQVBJLVBBVCIsIlNULVAtREVTLVIiLCJNREMtUC1QTlAtUlciLCJTSEktUC1GMVNSLVJXIiwiU0hJLVAtRU1SUi1SVyIsIlNISS1QLVBIWS1SVyIsIk1EQy1BUEktQVQtUiIsIkdMLVAtRUwtUlciLCJTSEktUC1BVkFJTC1SVyIsIk1EQy1BUEktUlRTLVIiLCJTSEktUC1GMi1SVyIsIkdMLVAtRUJULVJXIiwiU0hJLVAtRjJTLVJXIiwiU0hJLVAtTUlDVVItUlciLCJFUi1QLUVSQVMtUlciLCJTSEktUC1NSUNVLVJXIiwiU1QtUC1UREwtUiIsIkhNUy1QLVNJREVCQVIiLCJTVC1QLUJSRC1SIiwiU0hJLVAtUkVDLVJXIiwiU0hJLVAtWFJBWS1SVyIsIk1EQy1QLVBOUC1SIiwiSE1TLVAtQlQtUlciLCJTVC1BUEktQU1DLVJXIiwiR0wtUC1BTkQtUlciLCJNREMtUC1BU00tUlciLCJTSEktUC1HRVRSQVctUlciLCJTSEktUC1GMlItUlciLCJITVMtUC1WSU5SLVIiLCJTSEktUC1GMy1SVyIsIlNULVAtU05PLVJXIiwiU0hJLVAtRjEtUlciLCJTSEktUC1GMVItUlciLCJTVC1SLUhPRCIsIk1EQy1BUEktUEFULVIiLCJNREMtQVBJLVRIUi1SIiwiR0wtUC1SU0UtUlciLCJTSEktUC1IQU5ELVJXIiwiTURDLUFQSS1SREwtUlciLCJTSEktUC1DVC1SVyIsIlNISS1QLU1SSS1SVyIsIlNISS1QLVVQRC1SVyIsIlNISS1QLU5JQ1UtUlciLCJTVC1QLURFUy1SVyIsIkhNUy1QLUhNUyIsIlNISS1QLUNIRU1PUi1SVyIsIlNISS1QLURFTC1SVyIsIlNISS1QLVRSQUlOLVJXIiwiU1QtUC1UREwtUlciLCJITVMtUC1EQlVEUi1SIiwiU0hJLVAtRk9STS1SVyIsIkdMLVAtTkRDLVJXIiwiRVItUi1FUlNBIiwiU0hJLVAtRjFTLVJXIiwiU1QtUC1DTVQtUlciLCJTSEktUC1ESUEtUlciLCJNREMtQVBJLUNEUi1SIiwiU0hJLVAtSFItUlciLCJTSEktUC1IQU5EUi1SVyIsIlNULUFQSS1CUkQtUlciLCJNREMtUC1QTlBSLVIiLCJHTC1QLVAtUlciLCJITVMtQVBJLVNSTS1SVyIsIlNISS1QLUVYUC1SVyIsIlNISS1QLVVQRFJBVy1SVyIsIkhNUy1BUEktU0FNVC1SVyIsIkVSLVAtRVJHQVMtUlciLCJTSEktUC1JTkMiLCJTSEktUC1MQUItUlciLCJNREMtUC1SREUtUlciLCJTSEktUC1GMlNSLVJXIiwiU0hJLVAtU0lDVS1SVyIsIk1EQy1QLU9TQi1SVyIsIlNISS1QLUVNUi1SVyIsIkhNUy1QLVNHUk4tUlciLCJFUi1QLUVSR1BSLVJXIiwiSE1TLUFQSS1TQU0tUlciLCJTSEktUC1UUkFJTlItUlciLCJITVMtUC1DQ0MtUlciLCJHUC1QLUdDTi1SIiwiU0hJLVAtREVMUkFXLVJXIiwiU1QtQVBJLUVNUC1SIiwiU0hJLVAtTU9DSy1SVyIsIlNISS1QLUNIRU1PLVJXIiwiTURDLVAtVFJCLVJXIiwiR0wtUC1FRC1SVyIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIlNULVAtTlRGLVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIlNISS1QLVBIQVJNLVJXIiwiR0wtUC1FQUQtUlciLCJNREMtQVBJLUFULVJXIiwiR0wtUC1FUC1SVyIsIlNISS1QLU9QRC1SVyIsIk1EQy1SLVJFQyIsIlNISS1QLUZSTlQtUlciLCJNREMtUC1SRUctUlciLCJNREMtQVBJLUxCTi1SIiwiTURDLVAtUkVHLVIiLCJITVMtQVBJLUlULVJXIiwiU0hJLVAtTklDVVItUlciLCJNREMtQVBJLUdBUy1SIiwiU1QtUC1DTVQtUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzUsMTAsMTEsMTIsMTMsMTgsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDMsNDUsNDYsNTcsMTAxLDEwM10sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAxIiwiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3ODA1NTU0OSwiZXhwIjoxNzc4MTQyNTQ5fQ.ZZTX0-72pBudkPZ86nlPx9syLNBqu9Ne7GljIU7Deec2rZAB6PbsE88I1Qr80mAMgru2EoQwDBKp5EmWR5W57o0B1g7qyY0mzzSZKzaLngR-_qZ9_nY6PWV-JLSebtjlnMHQtp30RQX8eFKxTUAMjZalRpofjJevSCLnYDS7Vtgiv9cekD_eJrF9YMCsMhaIJ50dG1Ezt_LPy9dqUndb0pQk_1rbAqhVzNcN6A_SPexcfIv-pJI8Sqxr_y4n_wkz3awK_zFCPGNrDOthyWhR5s_hzscxGNO21VR60QAl_3EJ1-CyRHK4OJMphwsmWf5BU-5BHeReuYvtjwpeGo74-Q";
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
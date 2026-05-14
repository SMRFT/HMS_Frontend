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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTSEktUC1GM1ItUlciLCJTSEktUC1PVC1SVyIsIk1EQy1QLUNERS1SVyIsIkVSLVAtRVJWQi1SVyIsIkhNUy1QLUFBLVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUFTUi1SVyIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1PUEgiLCJTSEktUC1NUkQtUlciLCJFUi1QLUVSQi1SVyIsIlNISS1QLVJFQ1ItUlciLCJTSEktUC1TSUNVUi1SVyIsIlNJLVItSU5ESU4iLCJNREMtUC1QVEUtUlciLCJNREMtUC1TT1ItUiIsIkhNUy1QLUlQSCIsIkhNUy1QLURSTS1SVyIsIkVSLVAtRVJSRVAtUlciLCJITVMtUC1TUk0tUlciLCJFUi1BUEktRVJVQi1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1QLVJNRC1SVyIsIk1EQy1BUEktUEFUIiwiSE1TLVAtQ0NNQlBCLVJXIiwiU1QtUC1ERVMtUiIsIk1EQy1QLVBOUC1SVyIsIlNISS1QLUYxU1ItUlciLCJITVMtUC1JQ0QtUlciLCJTSEktUC1FTVJSLVJXIiwiU0hJLVAtUEhZLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJNREMtQVBJLUFULVIiLCJHTC1QLUVMLVJXIiwiU0hJLVAtQVZBSUwtUlciLCJNREMtQVBJLVJUUy1SIiwiU0hJLVAtRjItUlciLCJHTC1QLUVCVC1SVyIsIlNISS1QLUYyUy1SVyIsIlNISS1QLU1JQ1VSLVJXIiwiRVItUC1FUkFTLVJXIiwiU0hJLVAtTUlDVS1SVyIsIlNULVAtVERMLVIiLCJITVMtUC1TSURFQkFSIiwiU1QtUC1CUkQtUiIsIlNISS1QLVJFQy1SVyIsIlNISS1QLVhSQVktUlciLCJITVMtUC1SQ0FULVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUC1CVC1SVyIsIkhNUy1QLUJMSy1SVyIsIlNULUFQSS1BTUMtUlciLCJHTC1QLUFORC1SVyIsIk1EQy1QLUFTTS1SVyIsIlNISS1QLUdFVFJBVy1SVyIsIlNISS1QLUYyUi1SVyIsIkhNUy1QLVZJTlItUiIsIlNISS1QLUYzLVJXIiwiU1QtUC1TTk8tUlciLCJTSEktUC1GMS1SVyIsIlNISS1QLUYxUi1SVyIsIlNULVItSE9EIiwiTURDLUFQSS1QQVQtUiIsIkhNUy1BUEktRExELVIiLCJNREMtQVBJLVRIUi1SIiwiR0wtUC1SU0UtUlciLCJITVMtUC1OUy1SVyIsIlNISS1QLUhBTkQtUlciLCJNREMtQVBJLVJETC1SVyIsIlNISS1QLUNULVJXIiwiU0hJLVAtTVJJLVJXIiwiU0hJLVAtVVBELVJXIiwiU0hJLVAtTklDVS1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtQ0NDIiwiSE1TLVAtSE1TIiwiU0hJLVAtQ0hFTU9SLVJXIiwiU0hJLVAtREVMLVJXIiwiU0hJLVAtVFJBSU4tUlciLCJTVC1QLVRETC1SVyIsIkhNUy1QLURCVURSLVIiLCJTSEktUC1GT1JNLVJXIiwiR0wtUC1OREMtUlciLCJFUi1SLUVSU0EiLCJTSEktUC1GMVMtUlciLCJTVC1QLUNNVC1SVyIsIlNISS1QLURJQS1SVyIsIkhNUy1BUEktVUhJRC1SIiwiTURDLUFQSS1DRFItUiIsIkhNUy1QLUFETUwtUlciLCJTSEktUC1IUi1SVyIsIlNISS1QLUhBTkRSLVJXIiwiU1QtQVBJLUJSRC1SVyIsIk1EQy1QLVBOUFItUiIsIkdMLVAtUC1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtQVBJLVNSTS1SVyIsIlNISS1QLUVYUC1SVyIsIlNISS1QLVVQRFJBVy1SVyIsIkhNUy1BUEktU0FNVC1SVyIsIkhNUy1QLUFJTi1SVyIsIkVSLVAtRVJHQVMtUlciLCJTSEktUC1JTkMiLCJTSEktUC1MQUItUlciLCJNREMtUC1SREUtUlciLCJITVMtUC1BRE1ELVJXIiwiU0hJLVAtRjJTUi1SVyIsIlNISS1QLVNJQ1UtUlciLCJNREMtUC1PU0ItUlciLCJTSEktUC1FTVItUlciLCJITVMtUC1TR1JOLVJXIiwiRVItUC1FUkdQUi1SVyIsIkhNUy1BUEktU0FNLVJXIiwiU0hJLVAtVFJBSU5SLVJXIiwiSE1TLVAtQ0NHQUgtUlciLCJITVMtUC1DQ0dBUy1SVyIsIkdQLVAtR0NOLVIiLCJTSEktUC1ERUxSQVctUlciLCJTVC1BUEktRU1QLVIiLCJTSEktUC1NT0NLLVJXIiwiU0hJLVAtQ0hFTU8tUlciLCJITVMtUC1STS1SVyIsIk1EQy1QLVRSQi1SVyIsIkdMLVAtRUQtUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJTSEktUC1QSEFSTS1SVyIsIkdMLVAtRUFELVJXIiwiTURDLUFQSS1BVC1SVyIsIkdMLVAtRVAtUlciLCJTSEktUC1PUEQtUlciLCJNREMtUi1SRUMiLCJTSEktUC1GUk5ULVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiTURDLVAtUkVHLVJXIiwiTURDLUFQSS1MQk4tUiIsIk1EQy1QLVJFRy1SIiwiSE1TLUFQSS1JVC1SVyIsIlNISS1QLU5JQ1VSLVJXIiwiTURDLUFQSS1HQVMtUiIsIlNULVAtQ01ULVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxLDIsNCw1LDEwLDExLDEyLDEzLDE4LDE5LDI4LDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQzLDQ1LDQ2LDU1LDU3LDEwMSwxMDMsMTA0LDEwNSwxMDYsMTA3LDEwOCwxMDksMTEwLDIwLDIxLDI2LDUwLDI3LDUyLDUxLDExMV0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc4NjUyMTI5LCJleHAiOjE3Nzg3MzkxMjl9.UKHn7AAX426b-rmsPZMv5aKn4zT7JzuliptLlGiJ0wEXnW_pJ8gPiKGb65PxwgFwQfJj3w37cWCsylvAKh5j_opYAVEnNVdimVhJMd8ei0XfLgl3JHuOr5LgeaQb4cr3qgryZMbCkB2qNRQEV4j0Idrp7fW_GuhIj8ao2Td-9or-t4aS_yiydUllycKdhYzuu8SlRvQb0MQxRRvyPmHsMNGQx2NqyeNmtTjs2uqlIEKDarLH7tTgtVsiKQHddOSVZTu8q8QynJlg2ByDASSXl78a_YxkG0mLqgf6SaHRTH3MS1Mzr4Pxgpm9CZBgu_efpAE-3X31eDqpnciYG9cxQg";
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

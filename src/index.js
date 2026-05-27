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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJITVMtQVBJLVNBTVQtUlciLCJTSEktUC1BVkFJTC1SVyIsIlNISS1QLVJFQy1SVyIsIlNISS1QLUNIRU1PLVJXIiwiR0wtUC1FQlQtUlciLCJTSEktUC1MQUItUlciLCJNREMtUC1SRUctUlciLCJNREMtQVBJLUdBUy1SIiwiU0hJLVAtTVJELVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJHUC1QLUdDTi1SIiwiU0hJLVAtRk9STS1SVyIsIlNISS1QLURFTC1SVyIsIk1EQy1QLUFTTS1SVyIsIlNULVItSE9EIiwiU0hJLVAtRjFSLVJXIiwiSE1TLVAtU0lERUJBUiIsIlNULUFQSS1CUkQtUlciLCJNREMtUC1QTlAtUiIsIlNISS1QLU5JQ1UtUlciLCJTSEktUC1GUk5ULVJXIiwiSE1TLVAtVklOUi1SIiwiSE1TLVAtSUNELVJXIiwiRVItUC1FUkFTLVJXIiwiU0hJLVAtRU1SLVJXIiwiU0hJLVAtSFItUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIk1EQy1QLUNERS1SVyIsIlNISS1QLU1SSS1SVyIsIkhNUy1QLURCVURSLVIiLCJHTC1QLUVELVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1ST1ItUlciLCJNREMtUC1QTlAtUlciLCJTSEktUC1GMVMtUlciLCJNREMtUi1SRUMiLCJNREMtQVBJLUFULVJXIiwiSE1TLVAtSVBIIiwiU0hJLVAtT1QtUlciLCJTSEktUC1OSUNVUi1SVyIsIkVSLVAtRVJSRVAtUlciLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtUk1ELVJXIiwiU0hJLVAtWFJBWS1SVyIsIk1EQy1QLVBOUFItUiIsIkhNUy1QLUNDR0FILVJXIiwiSE1TLVAtQUEtUlciLCJTSEktUC1VUERSQVctUlciLCJTVC1QLVRETC1SIiwiTURDLUFQSS1SVFMtUiIsIlNISS1QLU1JQ1VSLVJXIiwiU1QtUC1OVEYtUiIsIlNULUFQSS1DUkQtUlciLCJTSEktUC1GMlNSLVJXIiwiU0hJLVAtSEFORFItUlciLCJTSEktUC1DVC1SVyIsIkhNUy1QLUJULVJXIiwiTURDLUFQSS1SREwtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJNREMtQVBJLVRIUi1SIiwiTURDLUFQSS1BVC1SIiwiSE1TLUFQSS1JVC1SVyIsIkdMLVAtUC1SVyIsIk1EQy1QLU9TQi1SVyIsIk1EQy1QLVBURS1SVyIsIkhNUy1BUEktVUhJRC1SIiwiU0hJLVAtT1BELVJXIiwiU0hJLVAtQ0hFTU9SLVJXIiwiU0hJLVAtRjItUlciLCJTSEktUC1NT0NLLVJXIiwiU0hJLVAtTUlDVS1SVyIsIk1EQy1QLVRSQi1SVyIsIkVSLVItRVJTQSIsIlNISS1QLUYzUi1SVyIsIk1EQy1QLVJFRy1SIiwiSE1TLVAtU0dSTi1SVyIsIlNULUFQSS1BTUMtUlciLCJTVC1QLVNOTy1SVyIsIlNISS1QLVRSQUlOUi1SVyIsIkhNUy1QLU5TLVJXIiwiR0wtUC1FUC1SVyIsIkhNUy1BUEktU0FNLVJXIiwiU1QtUC1ERVMtUlciLCJFUi1BUEktRVJVQi1SVyIsIlNISS1QLUYxLVJXIiwiSE1TLVAtUk0tUlciLCJITVMtUC1CTEstUlciLCJNREMtUC1SREUtUlciLCJTSEktUC1VUEQtUlciLCJNREMtQVBJLVBBVCIsIkdMLVAtTkRDLVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiU1QtUC1DTVQtUiIsIlNULVAtVERMLVJXIiwiU0hJLVAtRjJTLVJXIiwiTURDLUFQSS1QQVQtUiIsIk1EQy1BUEktTEJOLVIiLCJTVC1QLUJSRC1SIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtU1JNLVJXIiwiU0hJLVAtVFJBSU4tUlciLCJTSEktUC1HRVRSQVctUlciLCJTSEktUC1JTkMiLCJTVC1BUEktRU1QLVIiLCJHTC1QLUFORC1SVyIsIkhNUy1QLUFJTi1SVyIsIlNISS1QLVNJQ1VSLVJXIiwiU0ktUi1JTkRJTiIsIkdMLVAtRUwtUlciLCJFUi1QLUVSVkItUlciLCJITVMtUC1SU0QtUlciLCJNREMtQVBJLUNEUi1SIiwiSE1TLUFQSS1TUk0tUlciLCJTVC1QLU5URi1SVyIsIlNULVAtQ01ULVJXIiwiSE1TLVAtRFJNLVJXIiwiU1QtUC1ERVMtUiIsIkVSLVAtRVJHQVMtUlciLCJTSEktUC1TSUNVLVJXIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLUFTUi1SVyIsIlNISS1QLUhBTkQtUlciLCJHTC1QLUVBRC1SVyIsIlNISS1QLVBIQVJNLVJXIiwiU0hJLVAtRU1SUi1SVyIsIkVSLVAtRVJHUFItUlciLCJTSEktUC1QSFktUlciLCJFUi1QLUVSQi1SVyIsIkhNUy1QLU9QSCIsIlNISS1QLUVYUC1SVyIsIlNISS1QLUYyUi1SVyIsIlNISS1QLUYzLVJXIiwiSE1TLVAtQ0NHQVMtUlciLCJHTC1QLVJTRS1SVyIsIlNISS1QLVJFQ1ItUlciLCJITVMtUC1ITVMiLCJTSEktUC1ERUxSQVctUlciLCJNREMtUC1TT1ItUiIsIlNISS1QLUYxU1ItUlciLCJTSEktUC1ESUEtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxLDIsNCw1LDEwLDExLDEyLDEzLDE4LDE5LDIwLDIxLDI2LDI3LDI4LDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQzLDQ1LDQ2LDUwLDUxLDUyLDU1LDU3LDEwMSwxMDMsMTA0LDEwNSwxMDYsMTA3LDEwOCwxMDksMTEwLDExMSwxMTIsMTI0LDEyNV0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDEiLCJPTEVUMDAyIiwiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3OTc5NjAyMiwiZXhwIjoxNzc5ODgzMDIyfQ.Rz7XSUVK4GakYBSiELkuAOoO_Kq_wEq6AmYbdmbioKe0eHpzAim6jXQlTTVr3XFcto1k_H1VJHQmF1KnQBsYKFiBxLFzGo8Gc5a-N18UfjC_n1xNqH0OiVHMbYGoO4-zhB9aSleIX-axjoznsgfNGIHSfgVfZD7HtZ3U1kfaoryg56SeshhNBMsdqLcdMBNthN-sqNWexrORYmXQh1Ld_98ModTjxU2nOc2ZAvk0uhhWXFb7dIj_ri7FUp880VXqNdoJ4sqKc6y3IUsU6zsG0UZ8LMgXN6KNqqOgCTQynx0Lzi_gRXBldOy8ek4KljGzElZCnuTYtI9c-OCyw3Cacg";
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

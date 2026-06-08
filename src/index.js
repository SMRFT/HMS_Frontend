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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJITVMtQVBJLVNBTVQtUlciLCJTSEktUC1BVkFJTC1SVyIsIlNISS1QLVJFQy1SVyIsIlNISS1QLUNIRU1PLVJXIiwiR0wtUC1FQlQtUlciLCJTSEktUC1MQUItUlciLCJNREMtUC1SRUctUlciLCJNREMtQVBJLUdBUy1SIiwiU0lOLVItQURNIiwiSE1TLVAtQ1RJQS1SVyIsIlNISS1QLU1SRC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiR1AtUC1HQ04tUiIsIlNISS1QLUZPUk0tUlciLCJTSEktUC1ERUwtUlciLCJNREMtUC1BU00tUlciLCJTVC1SLUhPRCIsIlNISS1QLUYxUi1SVyIsIkhNUy1QLVNJREVCQVIiLCJTVC1BUEktQlJELVJXIiwiTURDLVAtUE5QLVIiLCJTSEktUC1OSUNVLVJXIiwiU0hJLVAtRlJOVC1SVyIsIkhNUy1QLVZJTlItUiIsIkhNUy1QLUlDRC1SVyIsIkVSLVAtRVJBUy1SVyIsIlNISS1QLUVNUi1SVyIsIlNISS1QLUhSLVJXIiwiSE1TLUFQSS1TSU5URU5ULVJXIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJNREMtUC1DREUtUlciLCJTSEktUC1NUkktUlciLCJITVMtUC1EQlVEUi1SIiwiR0wtUC1FRC1SVyIsIkhNUy1QLUFETUQtUlciLCJITVMtUC1SS0lULVJXIiwiSE1TLVAtUk9SLVJXIiwiTURDLVAtUE5QLVJXIiwiU0hJLVAtRjFTLVJXIiwiTURDLVItUkVDIiwiTURDLUFQSS1BVC1SVyIsIkhNUy1QLUlQSCIsIlNISS1QLU9ULVJXIiwiU0hJLVAtTklDVVItUlciLCJTSU4tQVBJLUlGLVJXIiwiRVItUC1FUlJFUC1SVyIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1STUQtUlciLCJTSEktUC1YUkFZLVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtQ0NHQUgtUlciLCJITVMtUC1BQS1SVyIsIlNISS1QLVVQRFJBVy1SVyIsIlNJTi1BUEktT1JSLVIiLCJTVC1QLVRETC1SIiwiTURDLUFQSS1SVFMtUiIsIlNISS1QLU1JQ1VSLVJXIiwiU1QtUC1OVEYtUiIsIlNULUFQSS1DUkQtUlciLCJTSEktUC1GMlNSLVJXIiwiU0hJLVAtSEFORFItUlciLCJTSEktUC1DVC1SVyIsIkhNUy1QLUJULVJXIiwiTURDLUFQSS1SREwtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJNREMtQVBJLVRIUi1SIiwiTURDLUFQSS1BVC1SIiwiSE1TLUFQSS1JVC1SVyIsIkdMLVAtUC1SVyIsIlNJTi1BUEktRlUtUlciLCJNREMtUC1PU0ItUlciLCJNREMtUC1QVEUtUlciLCJTSU4tQVBJLVNGLVIiLCJITVMtQVBJLVVISUQtUiIsIlNISS1QLU9QRC1SVyIsIlNISS1QLUNIRU1PUi1SVyIsIlNISS1QLUYyLVJXIiwiU0hJLVAtTU9DSy1SVyIsIlNISS1QLU1JQ1UtUlciLCJNREMtUC1UUkItUlciLCJFUi1SLUVSU0EiLCJTSEktUC1GM1ItUlciLCJNREMtUC1SRUctUiIsIkhNUy1QLVNHUk4tUlciLCJTVC1BUEktQU1DLVJXIiwiU1QtUC1TTk8tUlciLCJTSEktUC1UUkFJTlItUlciLCJITVMtUC1OUy1SVyIsIkdMLVAtRVAtUlciLCJITVMtQVBJLVNBTS1SVyIsIlNULVAtREVTLVJXIiwiRVItQVBJLUVSVUItUlciLCJTSEktUC1GMS1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtQkxLLVJXIiwiTURDLVAtUkRFLVJXIiwiU0hJLVAtVVBELVJXIiwiTURDLUFQSS1QQVQiLCJTSU4tQVBJLU9SLVJXIiwiR0wtUC1OREMtUlciLCJITVMtUC1DQ09QUEItUlciLCJTVC1QLUNNVC1SIiwiU1QtUC1UREwtUlciLCJTSEktUC1GMlMtUlciLCJNREMtQVBJLVBBVC1SIiwiTURDLUFQSS1MQk4tUiIsIlNULVAtQlJELVIiLCJITVMtUC1DQ0MtUlciLCJITVMtUC1TUk0tUlciLCJTSEktUC1UUkFJTi1SVyIsIlNISS1QLUdFVFJBVy1SVyIsIlNISS1QLUlOQyIsIlNULUFQSS1FTVAtUiIsIkdMLVAtQU5ELVJXIiwiSE1TLVAtQUlOLVJXIiwiU0hJLVAtU0lDVVItUlciLCJTSS1SLUlORElOIiwiR0wtUC1FTC1SVyIsIkVSLVAtRVJWQi1SVyIsIkhNUy1QLVJTRC1SVyIsIk1EQy1BUEktQ0RSLVIiLCJITVMtQVBJLVNSTS1SVyIsIlNULVAtTlRGLVJXIiwiU1QtUC1DTVQtUlciLCJITVMtUC1EUk0tUlciLCJTVC1QLURFUy1SIiwiRVItUC1FUkdBUy1SVyIsIlNISS1QLVNJQ1UtUlciLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtQVNSLVJXIiwiSE1TLVAtQ1RJLVJXIiwiU0hJLVAtSEFORC1SVyIsIkdMLVAtRUFELVJXIiwiU0hJLVAtUEhBUk0tUlciLCJTSEktUC1FTVJSLVJXIiwiRVItUC1FUkdQUi1SVyIsIlNISS1QLVBIWS1SVyIsIkVSLVAtRVJCLVJXIiwiSE1TLVAtT1BIIiwiU0hJLVAtRVhQLVJXIiwiU0hJLVAtRjJSLVJXIiwiU0hJLVAtRjMtUlciLCJITVMtUC1DQ0dBUy1SVyIsIkdMLVAtUlNFLVJXIiwiU0lOLVAtR0lDLVIiLCJTSEktUC1SRUNSLVJXIiwiSE1TLVAtSE1TIiwiU0hJLVAtREVMUkFXLVJXIiwiTURDLVAtU09SLVIiLCJTSEktUC1GMVNSLVJXIiwiU0hJLVAtRElBLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMSwyLDQsNSwxMCwxMSwxMiwxMywxOCwxOSwyMCwyMSwyNiwyNywyOCwzMiwzMywzNCwzNSwzNiwzNywzOCwzOSw0Myw0NSw0Niw1MCw1MSw1Miw1NSw1NywxMDEsMTAzLDEwNCwxMDUsMTA2LDEwNywxMDgsMTA5LDExMCwxMTEsMTEyLDEyNCwxMjUsMTI3LDEyOF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDEiLCJPTEVUMDAyIiwiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4MDU2NjgzNSwiZXhwIjoxNzgwNjUzODM1fQ.Ds1CY7vZe4dY-LhMUv3XNKvvGabEc19btbEfWgy1DfIJw4xhUUWrp4Rd-nRmkEVgzrpM1lUdY5YQAHLObU9ioh7xO5zHxOlG1GW5YlkWSwORzQ_CJKBpJxC5-vpbKSxvSwhmPQX6yK-g6UJC278Hb6M4YCrwPqB63qpiA0FmQlSYH8CaUFDFft-ECOKzYpTbbwc8FBHsUmSzqtYI2VLgKm8OghFvTkMBhCqdna5kiKIqh7-3IIP1SW-AEyEUJK72FJAPuwshtIzoGRdQ5im5LscjcVWL3KvXRM5H-6YUxItjXIRQpYxvMpmhR_gEIKy4g-1l5TmVmaQCshr-37IZWw";
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

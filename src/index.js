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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLURSTS1SIiwiSE1TLVAtU1JHUEQtUlciLCJITVMtUC1PUFBCLVIiLCJHTC1QLUVCVC1SVyIsIkhNUy1QLVBDQ1NEX1JXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1ERFMtUlciLCJNREMtQVBJLVBHUC1SVyIsIkhNUy1QLVNPUEUtUlciLCJTVC1SLUEiLCJITVMtUC1QT1BQREItUlciLCJNREMtQVBJLVBEQy1SVyIsIkhNUy1QLUNDR0FILVIiLCJTVC1SLUNEUiIsIkhNUy1QLVZMLVJXIiwiSE1TLVAtU09QQi1SVyIsIkhNUy1QLVNVTUQtUlciLCJITVMtUC1QRkItUlciLCJITVMtUC1DQ1NQU0QtUlciLCJHUC1QLUdDTi1SIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtUC1TSURFQkFSIiwiU0lOLVItU1RBIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLU9QR1NSRC1SVyIsIk1EQy1QLUdDUC1SIiwiSE1TLVAtUEdFQi1SIiwiSE1TLVAtQkxLLVIiLCJITVMtUC1DQ01CUEItUlciLCJHTC1QLUVELVJXIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLVBTRy1SVyIsIlNJTi1BUEktSUYtUlciLCJITVMtUC1QT1BVQVMtUlciLCJITVMtUC1JQi1SIiwiRVItUC1FUlVTLVJXIiwiTURDLVAtR0FQLVIiLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtQ0NHQUgtUlciLCJNREMtUC1QTlBSLVIiLCJITVMtUC1HV0wtUiIsIkhNUy1QLVBJUEEtUlciLCJITVMtUC1BQS1SVyIsIlNJTi1BUEktT1JSLVIiLCJTVC1QLVRETC1SIiwiSE1TLVAtUEhWU0ItUlciLCJTVC1QLU5URi1SIiwiSE1TLVAtU1RBLVJXIiwiU1QtQVBJLUNSRC1SVyIsIkhNUy1QLUNDVVBCLVJXIiwiSE1TLVAtSFNOLVJXIiwiSE1TLVAtR0xCVS1SIiwiSE1TLVAtUENPUFAtUlciLCJITVMtUC1TVU0tUlciLCJITVMtUC1QU00tUlciLCJNREMtUC1BQVUtUlciLCJNREMtQVBJLVNHUC1SVyIsIkhNUy1QLVBTT1BCLVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVItUEgiLCJNREMtQVBJLUFULVIiLCJFUi1QLUVSUC1SIiwiSE1TLVAtUkNBVC1SIiwiSE1TLVAtUE9QU1ItUlciLCJHTC1QLVAtUlciLCJITVMtUC1HT1BTLVIiLCJFUi1QLUVSU0QtUlciLCJTSU4tQVBJLVNGLVIiLCJITVMtUC1DQ1BSUC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiSE1TLVAtT1BTUkJELVJXIiwiSE1TLVAtUEdQQlQtUiIsIlNULUFQSS1BTUMtUlciLCJTVC1QLVNOTy1SVyIsIkhNUy1QLUNFQi1SVyIsIk1EQy1QLUdPUC1SIiwiSE1TLVAtUE9QU1JCRC1SVyIsIkdMLVAtRVAtUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLUdPUEJOLVIiLCJTVC1QLURFUy1SVyIsIkhNUy1QLUNDR1JCLVJXIiwiSE1TLVAtQURNLVJXIiwiSE1TLVAtUEdTLVJXIiwiRVItUi1FUlAiLCJITVMtUC1TVU0tUiIsIkhNUy1QLVBHQVMtUiIsIlNJTi1QLUdETC1SIiwiSE1TLVAtUFBELVIiLCJITVMtUC1DT1BQLVJXIiwiU0lOLUFQSS1PUi1SVyIsIkdMLVAtTkRDLVJXIiwiSE1TLVAtUEdMQlUtUiIsIkhNUy1QLVNULVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiU1QtUC1DTVQtUiIsIlNULVAtVERMLVJXIiwiU1QtUC1CUkQtUiIsIkhNUy1QLUNDQy1SVyIsIlNISS1QLVRSQUlOLVJXIiwiSE1TLVAtUE1DLVJXIiwiU0hJLVAtSU5DIiwiTURDLVItUERDIiwiU1QtQVBJLUVNUC1SIiwiSE1TLVAtV1JRLVJXIiwiR0wtUC1BTkQtUlciLCJITVMtQVBJLURMRC1SVyIsIkdMLVAtRUwtUlciLCJNREMtUC1HU1AtUiIsIkVSLVAtRVJWQi1SVyIsIkhNUy1QLUdMQlQtUiIsIkhNUy1QLVNVTUEtUlciLCJTVC1QLU5URi1SVyIsIk1EQy1BUEktT0dQLVJXIiwiSE1TLVAtUFNSQkQtUlciLCJTVC1QLUNNVC1SVyIsIlNULVAtREVTLVIiLCJFUi1QLUVSR0FTLVJXIiwiSE1TLVAtQ1MtUlciLCJITVMtUC1HUEJULVIiLCJHTC1QLUVBRC1SVyIsIkVSLVAtRVJHUFItUlciLCJNREMtUC1HUFAtUiIsIkhNUy1QLURMRC1SVyIsIkhNUy1QLUdBRS1SIiwiSE1TLVAtQ0NPLVJXIiwiSE1TLVAtUENCLVJXIiwiSE1TLVAtT1BIIiwiSE1TLVAtQ0NHQVMtUlciLCJTSEktUC1FWFAtUlciLCJITVMtUC1DQ0dQQi1SVyIsIkdMLVAtUlNFLVJXIiwiU0lOLVAtR0lDLVIiLCJNREMtQVBJLUNHUC1SVyIsIkhNUy1QLVNSQkQtUlciLCJITVMtUC1ITVMiLCJITVMtUC1DQ0dTUkRfUlciLCJITVMtUC1DQ0NSQi1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzMsMTAxLDUsMTAsNDMsMTgsMTksMTE0LDU1LDEwMiwxMTMsMTI5XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4MDg5NjM5NCwiZXhwIjoxNzgwOTgzMzk0fQ.ZUEzf2ic335cQme_JE1t2tEDmNCWSzYRLenbDmh7BMru--CNg-nJa7ePE1S3tBjcGVjMnW9w78LGG6lWwH7DZHNP_-vqQdTJfKzGK8bXzX2GkyRqMQG5gzn9Ewn353_VeQWK4jk5EOZ21j9NZUjxokQH3-RNowN9czcHJXSgtoB_DaNwrhwA0XrcmgdzIIJcjwZccoyFyY7t2eBsTFu8RKzyPW2w76LE7NvgrE5tXYbLmdZae7f1-YZw5Ta5PaBtQkBYjr-4JIdZd4nv6n85osXiG5mDv-L5WVhGDcU85ltHFvAtHEjCSSr7Wp4JznijYi6ssqBqpf9lWxuNqRSSlA"
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

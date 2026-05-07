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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkVSLVAtRVJWQi1SVyIsIkhNUy1QLUdMQlQtUiIsIkhNUy1QLUFBLVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUJMSy1SIiwiRkUtUC1GRy1SVyIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1PUEgiLCJGRS1QLUZTQi1SVyIsIkhNUy1QLVBDQ1NEX1JXIiwiSE1TLVAtUE9QU1ItUlciLCJITVMtUC1ETEQtUlciLCJGRS1QLUZTLVJXIiwiSE1TLVAtSVBIIiwiTURDLVAtR0NQLVIiLCJTVC1SLUEiLCJITVMtUC1QR0FTLVIiLCJGRS1QLUZHRi1SIiwiSE1TLVAtUE9QVUFTLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiU1QtUC1ERVMtUiIsIkhNUy1QLVBTT1BCLVJXIiwiSE1TLVAtUFBELVIiLCJGRS1SLUZBLVJXIiwiSE1TLVAtUFNNLVJXIiwiTURDLUFQSS1QREMtUlciLCJNREMtUC1HQVAtUiIsIkhNUy1QLVBHTEJVLVIiLCJNREMtUC1BQVUtUlciLCJNREMtQVBJLUFULVIiLCJITVMtUC1SQ0FULVIiLCJITVMtUC1QT1BQREItUlciLCJITVMtUC1XUlEtUlciLCJITVMtUC1BRE0tUlciLCJHTC1QLUVMLVJXIiwiR0wtUC1FQlQtUlciLCJITVMtUC1HUEJULVIiLCJITVMtUC1EUk0tUiIsIkhNUy1QLVBHUEJULVIiLCJITVMtUC1QQ0ItUlciLCJITVMtUC1DUy1SVyIsIkhNUy1QLVBNQy1SVyIsIkhNUy1QLVNPUEUtUlciLCJTVC1QLVRETC1SIiwiSE1TLUFQSS1ETEQtUlciLCJITVMtUC1TSURFQkFSIiwiU1QtUC1CUkQtUiIsIkZFLVItRkEiLCJITVMtUC1HTEJVLVIiLCJHTC1QLUFORC1SVyIsIkhNUy1QLUNDTy1SVyIsIkhNUy1QLUdBRS1SIiwiU1QtQVBJLUFNQy1SVyIsIkVSLVAtRVJVUy1SVyIsIkhNUy1QLUNDU1BTRC1SVyIsIk1EQy1SLVBEQyIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLVAtR09QQk4tUiIsIlNULVAtU05PLVJXIiwiTURDLUFQSS1TR1AtUlciLCJGRS1QLUZVUy1SVyIsIk1EQy1BUEktT0dQLVJXIiwiR0wtUC1SU0UtUlciLCJTVC1SLUNEUiIsIkhNUy1QLVBHUy1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtSE1TIiwiU0hJLVAtVFJBSU4tUlciLCJTVC1QLVRETC1SVyIsIk1EQy1QLUdQUC1SIiwiR0wtUC1OREMtUlciLCJITVMtUC1DQ1BSUC1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiSE1TLVAtVkwtUlciLCJTVC1QLUNNVC1SVyIsIkhNUy1QLUNDR0FILVIiLCJNREMtQVBJLUNHUC1SVyIsIkVSLVAtRVJQLVIiLCJITVMtUC1HV0wtUiIsIkZFLVAtRkFMLVIiLCJTVC1BUEktQlJELVJXIiwiTURDLVAtUE5QUi1SIiwiR0wtUC1QLVJXIiwiSE1TLVAtUEZCLVJXIiwiU0hJLVAtRVhQLVJXIiwiSE1TLVAtQ09QUC1SVyIsIkhNUy1QLUhTTi1SVyIsIk1EQy1BUEktUEdQLVJXIiwiRVItUC1FUkdBUy1SVyIsIlNISS1QLUlOQyIsIkhNUy1QLUdPUFMtUiIsIkhNUy1QLU9QUEItUiIsIkhNUy1QLVBTUkJELVJXIiwiSE1TLVAtSUItUiIsIkVSLVItRVJQIiwiSE1TLVAtUE9QU1JCRC1SVyIsIkZFLVAtRlItUlciLCJNREMtQVBJLUFHUC1SVyIsIkhNUy1QLUNDVVBCLVJXIiwiRkUtUC1GVUItUlciLCJFUi1QLUVSR1BSLVJXIiwiRkUtUC1GR0wtUiIsIkhNUy1QLVBJUEEtUlciLCJNREMtUC1HU1AtUiIsIkhNUy1QLUNDR0FTLVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1QLUNFQi1SVyIsIkhNUy1SLVBIIiwiSE1TLVAtU09QQi1SVyIsIlNULUFQSS1FTVAtUiIsIkdMLVAtRUQtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVBHRUItUiIsIk1EQy1QLUdPUC1SIiwiR0wtUC1FQUQtUlciLCJHTC1QLUVQLVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtQ0NHUEItUlciLCJGRS1QLUZGLVJXIiwiRVItUC1FUlNELVJXIiwiU1QtUC1DTVQtUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzE4LDE5LDU1LDEwLDVdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc4MTI0MzE0LCJleHAiOjE3NzgyMTEzMTR9.e_SxwsXXrBo0v6QL2An33t5SoPUnx1Hq_762g1iJJujOxT0NGOhqCUy9__uoOiLXwmEsvY1qnXvS3D-9rJXh9oOrNxty9ctMGAa6YmnZfC8nUrv8iX6GrQQrpfX8-mIJOkmrj7EXQC83EG4i4Frb-eQrjkRJsn7n5YfqAofGKu4tzzPM40oiig-rNLHRQ5X-UMJaz5nHBFtbUswJZ7nDXQokrILDIafSC_2aVhu9yqSiz8e9F8l5pnfqTDOON__rDhzAkauaUNUxI20Ume_68tQE7XNfmNQpinIv8Kh109ZXaPitiuGe91C04XlbteH9jw11KzcOzbgE4a5Zgf-CDA"
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
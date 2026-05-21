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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiRVItUi1FUk4iLCJITVMtUC1QSUQtUlciLCJITVMtUC1PUy1SVyIsIk1EQy1QLVJFRy1SVyIsIlNELVAtR1BELVIiLCJNREMtQVBJLUdBUy1SIiwiTURDLUFQSS1QR1AtUlciLCJITVMtUC1QQy1SVyIsIk1EQy1BUEktUERDLVJXIiwiU0QtUC1CVEQtUlciLCJITVMtUC1HUk5BLVJXIiwiU0QtQVBJLVJCLVIiLCJITVMtUC1DQy1SVyIsIkhNUy1BUEktUEFDSy1SIiwiU0QtUC1MVE0tUlciLCJITVMtUC1SU0hGVC1SVyIsIkdQLVAtR0NOLVIiLCJTRC1QLUxCTi1SIiwiTURDLVAtQVNNLVJXIiwiU1QtUi1IT0QiLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtQ0NELVJXIiwiSE1TLVAtREIiLCJTVC1BUEktQlJELVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUC1HUk4iLCJTRC1QLVNTLVIiLCJNREMtUC1HQ1AtUiIsIlNELVAtVVBCLVJXIiwiU0QtQVBJLVRELVIiLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVJLSVQtUlciLCJNREMtUC1QTlAtUlciLCJTRC1QLUJBLVJXIiwiU0QtUC1MUEktUiIsIk1EQy1BUEktQVQtUlciLCJTRC1QLUxSQy1SIiwiSE1TLVAtSVBIIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1QQ0QtUlciLCJFUi1QLUVSUkVQLVJXIiwiTURDLVAtR0FQLVIiLCJNREMtQVBJLUFETS1SVyIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1STUQtUlciLCJITVMtUC1HUk4tUlciLCJNREMtUC1QTlBSLVIiLCJITVMtUC1BQS1SVyIsIlNELVAtUkItUlciLCJTRC1QLVBHLVJXIiwiU1QtUC1UREwtUiIsIlNELVAtR1BCLVIiLCJNREMtQVBJLVJUUy1SIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUhNU1BTIiwiU1QtQVBJLUNSRC1SVyIsIkhNUy1QLVNUQS1SVyIsIk1EQy1QLUFBVS1SVyIsIk1EQy1BUEktU0dQLVJXIiwiTURDLUFQSS1SREwtUlciLCJNREMtQVBJLVRIUi1SIiwiTURDLUFQSS1BVC1SIiwiSE1TLVAtSE1TUFMtUlciLCJITVMtUC1SU0RELVJXIiwiRVItUC1FUlBCLVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1MQkMtUlciLCJITVMtUC1SQ0FURC1SVyIsIk1EQy1QLU9TQi1SVyIsIkVSLVAtRVJETC1SIiwiU0QtUC1CRy1SVyIsIlNELVAtUEItUlciLCJITVMtQVBJLVVISUQtUiIsIk1EQy1BUEktQUdQLVJXIiwiTURDLVAtVFJCLVJXIiwiU0QtUC1TQy1SIiwiTURDLVAtUkVHLVIiLCJITVMtUC1SRU5RLVJXIiwiU1QtQVBJLUFNQy1SVyIsIkhNUy1QLVBJLVJXIiwiTURDLVAtR09QLVIiLCJTVC1QLVNOTy1SVyIsIlNELVAtUE9WLVJXIiwiTURDLVItQURNIiwiSE1TLVAtTlMtUlciLCJTVC1QLURFUy1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtQkxLLVJXIiwiSE1TLVAtVk5ELVJXIiwiSE1TLVAtQkxLRC1SVyIsIk1EQy1BUEktUEFUIiwiSE1TLVAtU1QtUlciLCJTVC1QLUNNVC1SIiwiU1QtUC1UREwtUlciLCJITVMtUC1HUk5BIiwiTURDLUFQSS1QQVQtUiIsIk1EQy1BUEktTEJOLVIiLCJTVC1QLUJSRC1SIiwiU0QtQVBJLUNOLVIiLCJITVMtUC1TUk0tUlciLCJTRC1QLVBGLVJXIiwiU1QtQVBJLUVNUC1SIiwiTURDLVAtR1NQLVIiLCJITVMtUC1SS0lURC1SVyIsIkhNUy1QLVJTRC1SVyIsIlNELVAtR1NQLVIiLCJNREMtQVBJLUNEUi1SIiwiU1QtUC1OVEYtUlciLCJITVMtQVBJLURBU0giLCJITVMtQVBJLVZNIiwiSE1TLVAtR0FETS1SVyIsIk1EQy1BUEktT0dQLVJXIiwiU1QtUC1DTVQtUlciLCJTRC1SLVNNQyIsIlNULVAtREVTLVIiLCJTRC1BUEktU1MtUlciLCJITVMtUC1SQ0xOLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkVSLVAtRVJQTC1SIiwiTURDLVAtR1BQLVIiLCJFUi1QLUVSQi1SVyIsIkhNUy1QLVJTSEZURC1SVyIsIkhNUy1QLU9QSCIsIlNELVAtU1NVLVJXIiwiSE1TLVAtTlNELVJXIiwiU0QtUC1TUy1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiU0QtQVBJLVRNLVJXIiwiSE1TLVAtSE1TIiwiTURDLVAtU09SLVIiLCJITVMtQVBJLURMRC1SIiwiRVItUC1FUkdOQk4tUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzIsNSw2LDEwLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDI2LDI3LDI4LDI5LDMwLDQ0LDUwLDUxLDUyLDU1LDU4LDU5LDEwMl0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzkzNDA5NDUsImV4cCI6MTc3OTQyNzk0NX0.Iz0k2BZkpxfFveeJtt5RS6lq7q8XGuOroOvw62GMG1hrxBedKQn7M_0CqLwPvHTE2U_oW7wxWJy9XiE_JQGo8ARsPqydIeAoiLPbJ7Jzqh_yp9OlK7N5Ut-Ywuuer9BKaxH7SXkbUPi-eJYgANdySafH40CBgIalVr_t2KURO2wfFdsqjuIA0Bz2py1N2v8A8Od-kgrNLZxtFcPKz_POCrsPr7kjdub-d23_JzFzvvIC9wY-n6YkoWc3gWZU8fiv1E5ns-5L7XnLW-QwiVCutJH1qo9JomISQ5bvW_Zli1bGtvRG-RMnjaZda5TNFbwmeTo6hVxTlkJyGrQKzd9Tag";
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
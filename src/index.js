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
  const dev_token =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1HUEQtUiIsIlNELVAtTFJDLVIiLCJITVMtUC1EQiIsIlNULVAtTlRGLVIiLCJTVC1BUEktQ1JELVJXIiwiU0QtUC1TU1UtUlciLCJTRC1BUEktVE0tUlciLCJNREMtUC1TT1ItUiIsIk1EQy1QLUdDUC1SIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1HUk5BIiwiSE1TLVAtU1JNLVJXIiwiU0QtUC1TUy1SIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtUk1ELVJXIiwiTURDLUFQSS1QQVQiLCJTRC1QLVBGLVJXIiwiU1QtUC1ERVMtUiIsIk1EQy1QLVBOUC1SVyIsIkhNUy1QLUdSTiIsIlNELUFQSS1TUy1SVyIsIlNELVAtUkItUlciLCJNREMtQVBJLVBEQy1SVyIsIk1EQy1QLUdBUC1SIiwiTURDLVAtQUFVLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJNREMtQVBJLUFULVIiLCJTRC1QLVBCLVJXIiwiU0QtQVBJLVJCLVIiLCJTRC1QLUxQSS1SIiwiU0QtQVBJLUNOLVIiLCJNREMtQVBJLVJUUy1SIiwiSE1TLVAtTlNELVJXIiwiSE1TLVAtQkxLRC1SVyIsIlNULVAtVERMLVIiLCJITVMtUC1TSURFQkFSIiwiU1QtUC1CUkQtUiIsIlNELVAtU1AtUiIsIkhNUy1QLVJDQVQtUlciLCJNREMtUC1QTlAtUiIsIkhNUy1BUEktVk0iLCJITVMtUC1CTEstUlciLCJTRC1QLVVQQi1SVyIsIk1EQy1QLUFTTS1SVyIsIlNULUFQSS1BTUMtUlciLCJTRC1QLVNTLVJXIiwiTURDLVItQURNIiwiU0QtUC1HU1AtUiIsIlNELVAtUEctUlciLCJTVC1QLVNOTy1SVyIsIk1EQy1BUEktU0dQLVJXIiwiU1QtUi1IT0QiLCJNREMtQVBJLU9HUC1SVyIsIk1EQy1BUEktUEFULVIiLCJITVMtUC1SRU5RLVJXIiwiSE1TLUFQSS1ETEQtUiIsIk1EQy1BUEktVEhSLVIiLCJTRC1QLVBPVi1SVyIsIkhNUy1QLU5TLVJXIiwiSE1TLVAtUlNIRlQtUlciLCJTRC1QLUJURC1SVyIsIk1EQy1BUEktUkRMLVJXIiwiU1QtUC1ERVMtUlciLCJITVMtUC1SQ0xOLVJXIiwiSE1TLVAtSE1TUFMiLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtSE1TIiwiSE1TLUFQSS1EQVNIIiwiU0QtUC1CRy1SVyIsIlNULVAtVERMLVJXIiwiTURDLUFQSS1BRE0tUlciLCJNREMtUC1HUFAtUiIsIlNULVAtQ01ULVJXIiwiU0QtUC1CQS1SVyIsIkhNUy1BUEktVUhJRC1SIiwiTURDLUFQSS1DR1AtUlciLCJNREMtQVBJLUNEUi1SIiwiSE1TLVAtQURNTC1SVyIsIlNULUFQSS1CUkQtUlciLCJNREMtUC1QTlBSLVIiLCJITVMtUC1SS0lULVJXIiwiTURDLUFQSS1QR1AtUlciLCJITVMtUC1ITVNQUy1SVyIsIkhNUy1QLVJLSVRELVJXIiwiU0QtUC1TQy1SIiwiU0QtUC1HUEItUiIsIlNELVAtTFRNLVJXIiwiU0QtUi1TTUMiLCJITVMtUC1BRE1ELVJXIiwiTURDLUFQSS1BR1AtUlciLCJNREMtUC1PU0ItUlciLCJNREMtUC1HU1AtUiIsIkdQLVAtR0NOLVIiLCJTVC1BUEktRU1QLVIiLCJTRC1BUEktVEQtUiIsIkhNUy1QLVJNLVJXIiwiTURDLVAtVFJCLVJXIiwiU1QtUC1OVEYtUlciLCJNREMtUC1HT1AtUiIsIlNELVAtTEJDLVJXIiwiSE1TLVAtR0FETS1SVyIsIk1EQy1BUEktQVQtUlciLCJITVMtUC1SU0hGVEQtUlciLCJTRC1QLUxCTi1SIiwiTURDLVAtUkVHLVJXIiwiTURDLUFQSS1MQk4tUiIsIkhNUy1QLUJST09NLVJXIiwiTURDLVAtUkVHLVIiLCJNREMtQVBJLUdBUy1SIiwiU1QtUC1DTVQtUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzIsNSw2LDEwLDQ0LDE0LDE1LDE2LDE3LDUwLDUxLDUyLDIwLDI2LDI3LDI4LDI5LDMwXSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzYyMjI0NzgsImV4cCI6MTc3NjMwOTQ3OH0.KfxDk5TfErbkDqIO4W9vBlH3sJybPR5Jpy5ICW33GW0HiXB_MDM9rYStVP0n3f-ZLWQoY8OgB5tj8sGvPutbrfMWy8NPDRs8y28unDWgoFIGZhY7h3vAsKkxi8cEouJLnr2t_eYnAxbn0u9IQaXXvUZYFikoeWIvvT0SKNV5XeiNZ7GUrWKYw75d9-zm7Dcbpa0mFLbP0Xx0xhMPPfkCno7UQTg8E0QI7nWtaK6-3EhJ6_w1jyHINY1ftxmGXO3GmH-R0zhOCOkJke8KLV53y3GH2ZhymZCoGlaxgIZRUp_xhXD0YzDMk9rDbG9d-Z56NXDR9wS8o96O6MTsdXuuKw";
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
  if (
    !token ||
    token.trim() ===
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiU0QtUC1HUEQtUiIsIlNELVAtTFJDLVIiLCJITVMtUC1EQiIsIlNULVAtTlRGLVIiLCJTVC1BUEktQ1JELVJXIiwiU0QtUC1TU1UtUlciLCJFUi1QLUVSQi1SVyIsIlNELUFQSS1UTS1SVyIsIk1EQy1QLVNPUi1SIiwiTURDLVAtR0NQLVIiLCJITVMtUC1SQ0FURC1SVyIsIkhNUy1QLUdSTkEiLCJFUi1QLUVSUkVQLVJXIiwiSE1TLVAtU1JNLVJXIiwiU0QtUC1TUy1SIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtUk1ELVJXIiwiTURDLUFQSS1QQVQiLCJTRC1QLVBGLVJXIiwiU1QtUC1ERVMtUiIsIk1EQy1QLVBOUC1SVyIsIkhNUy1QLUdSTiIsIlNELUFQSS1TUy1SVyIsIlNELVAtUkItUlciLCJNREMtQVBJLVBEQy1SVyIsIk1EQy1QLUdBUC1SIiwiTURDLVAtQUFVLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJNREMtQVBJLUFULVIiLCJTRC1QLVBCLVJXIiwiU0QtQVBJLVJCLVIiLCJTRC1QLUxQSS1SIiwiU0QtQVBJLUNOLVIiLCJNREMtQVBJLVJUUy1SIiwiRVItUC1FUlBCLVJXIiwiSE1TLVAtTlNELVJXIiwiSE1TLVAtQkxLRC1SVyIsIlNULVAtVERMLVIiLCJITVMtUC1TSURFQkFSIiwiU1QtUC1CUkQtUiIsIlNELVAtU1AtUiIsIkhNUy1QLVJDQVQtUlciLCJNREMtUC1QTlAtUiIsIkhNUy1BUEktVk0iLCJITVMtUC1CTEstUlciLCJTRC1QLVVQQi1SVyIsIk1EQy1QLUFTTS1SVyIsIlNULUFQSS1BTUMtUlciLCJTRC1QLVNTLVJXIiwiTURDLVItQURNIiwiU0QtUC1HU1AtUiIsIlNELVAtUEctUlciLCJFUi1SLUVSTiIsIlNULVAtU05PLVJXIiwiTURDLUFQSS1TR1AtUlciLCJTVC1SLUhPRCIsIk1EQy1BUEktT0dQLVJXIiwiTURDLUFQSS1QQVQtUiIsIkhNUy1QLVJFTlEtUlciLCJITVMtQVBJLURMRC1SIiwiTURDLUFQSS1USFItUiIsIlNELVAtUE9WLVJXIiwiSE1TLVAtTlMtUlciLCJTRC1QLUJURC1SVyIsIk1EQy1BUEktUkRMLVJXIiwiU1QtUC1ERVMtUlciLCJITVMtUC1SQ0xOLVJXIiwiSE1TLVAtSE1TUFMiLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtSE1TIiwiSE1TLUFQSS1EQVNIIiwiU0QtUC1CRy1SVyIsIlNULVAtVERMLVJXIiwiTURDLUFQSS1BRE0tUlciLCJNREMtUC1HUFAtUiIsIkhNUy1QLVJTSEZUIiwiU1QtUC1DTVQtUlciLCJTRC1QLUJBLVJXIiwiSE1TLUFQSS1VSElELVIiLCJNREMtQVBJLUNHUC1SVyIsIk1EQy1BUEktQ0RSLVIiLCJITVMtUC1BRE1MLVJXIiwiU1QtQVBJLUJSRC1SVyIsIk1EQy1QLVBOUFItUiIsIkVSLVAtRVJQTC1SIiwiSE1TLVAtUktJVC1SVyIsIk1EQy1BUEktUEdQLVJXIiwiRVItUC1FUkRMLVIiLCJITVMtUC1ITVNQUy1SVyIsIkhNUy1QLVJLSVRELVJXIiwiU0QtUC1TQy1SIiwiU0QtUC1HUEItUiIsIlNELVAtTFRNLVJXIiwiU0QtUi1TTUMiLCJITVMtUC1BRE1ELVJXIiwiTURDLUFQSS1BR1AtUlciLCJNREMtUC1PU0ItUlciLCJNREMtUC1HU1AtUiIsIkdQLVAtR0NOLVIiLCJTVC1BUEktRU1QLVIiLCJTRC1BUEktVEQtUiIsIkhNUy1QLVJNLVJXIiwiTURDLVAtVFJCLVJXIiwiU1QtUC1OVEYtUlciLCJNREMtUC1HT1AtUiIsIlNELVAtTEJDLVJXIiwiSE1TLVAtR0FETS1SVyIsIkVSLVAtRVJHTkJOLVIiLCJNREMtQVBJLUFULVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiU0QtUC1MQk4tUiIsIk1EQy1QLVJFRy1SVyIsIk1EQy1BUEktTEJOLVIiLCJITVMtUC1CUk9PTS1SVyIsIk1EQy1QLVJFRy1SIiwiTURDLUFQSS1HQVMtUiIsIlNULVAtQ01ULVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsyLDUsNiwxMCw0NCwxNCwxNSwxNiwxNyw1MCw1MSw1MiwyMCwyNiwyNywyOCwyOSwzMF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc2MDU5NTE1LCJleHAiOjE3NzYxNDY1MTV9.HxlVzaARy5eGGdxvCMaPVQbvqnNh0M06k9XdpSKhaqgn-bqXgk-c1IK2vIVsCrTejhrUS_9NoA0AZDk82SuI2DCKKm-WeXWWRV0JB_Hf4WKCSfsfjvvhIbQ9IICmvleDBL9bTlPToF60fYtpV0jJXlHWM2sHzvRXMc2WTcrOJ9S_nCetKJ2cDBNGUyrxq-8vnQj38hfaTcbSW2HHq0m8awEOm9Z5JUQvAuk_wBrfyrjRgusSFZAkO5Chw164xLQz7d-QnlkfNNvl2tFBz6-k9UrvdY-m4mXBoAK6oerfUM2JAyxrsCJdw7YFXfSbLsbhwwY_-QFMzIcZ9p3Ye2remg"
  ) {
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
    localStorage.setItem("allowed-outlets", userPayload["hms_outlets"]);
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
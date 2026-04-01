import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

console.log("=== HMS INDEX.JS DEBUG ===");
console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLUFQSS1DRFItUiIsIkhNUy1QLUhNUyIsIk1EQy1BUEktUkRMLVJXIiwiTURDLUFQSS1QQVQiLCJITVMtUC1ITVNQUy1SVyIsIkVSLVAtRVJQTC1SIiwiU1QtUC1DTVQtUiIsIlNELVItSFIiLCJFUi1QLUVSR05CTi1SIiwiU1QtUC1TTk8tUlciLCJITVMtUC1JTkEiLCJITVMtUC1DQ0MiLCJITVMtUC1JUEgiLCJITVMtUC1EQiIsIk1EQy1QLVJFRy1SIiwiU1QtQVBJLUVNUC1SIiwiTURDLVAtVFJCLVJXIiwiTURDLVAtT1NCLVJXIiwiSE1TLUFQSS1JWFJBWSIsIlNULVAtVERMLVJXIiwiU1QtUC1ERVMtUlciLCJITVMtQVBJLUlNUkktUlciLCJITVMtQVBJLUlNUkkiLCJITVMtUC1ITVNQUyIsIkhNUy1QLVJDQVQiLCJITVMtUC1HUk4iLCJFUi1QLUVSUkVQLVJXIiwiTURDLVAtQVNNLVJXIiwiTURDLUFQSS1BRE0tUlciLCJITVMtQVBJLVZNIiwiU1QtUC1CUkQtUiIsIlNULUFQSS1DUkQtUlciLCJTVC1SLUhPRCIsIkhNUy1BUEktRFNVTSIsIkhNUy1BUEktSUNULVJXIiwiSE1TLVAtUkJJTEwiLCJNREMtUC1HQVAtUiIsIkVSLVAtRVJQQi1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiU1QtUC1ERVMtUiIsIkhNUy1QLUdSTkEiLCJITVMtUC1PUEgiLCJITVMtUC1XUiIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1QSCIsIk1EQy1BUEktR0FTLVIiLCJITVMtUC1BREFTSCIsIkVSLVAtRVJCLVJXIiwiSE1TLVAtSVQiLCJTSU4tUi1FTVAiLCJITVMtUC1ITVNJTlMiLCJNREMtUC1QTlAtUiIsIkhNUy1QLUFETSIsIkVSLVAtRVJETC1SIiwiTURDLUFQSS1SVFMtUiIsIlNULVAtQ01ULVJXIiwiTURDLUFQSS1BR1AtUlciLCJITVMtQVBJLUlVU0ctUlciLCJFUi1SLUVSTiIsIkhNUy1QLUlOVlAiLCJITVMtUC1QQUNLIiwiSE1TLVAtUk0iLCJITVMtUC1SU0hGVCIsIk1EQy1QLVBOUFItUiIsIkhNUy1QLUlOVEVOVCIsIkhNUy1BUEktSVVTRyIsIk1EQy1BUEktQVQtUiIsIk1EQy1BUEktUERDLVJXIiwiSE1TLUFQSS1JQ1QiLCJITVMtUC1CVC1SVyIsIkhNUy1QLVZJVE0iLCJITVMtUC1WSU5SLVJXIiwiTURDLUFQSS1QQVQtUiIsIk1EQy1QLUdTUC1SIiwiSE1TLVAtU0lOVEVOVCIsIkhNUy1QLVNHUk4iLCJITVMtUC1EREFTSCIsIk1EQy1QLVNPUi1SIiwiSE1TLVAtVklORyIsIkhNUy1BUEktREFTSCIsIk1EQy1BUEktVEhSLVIiLCJITVMtQVBJLVNVTSIsIk1EQy1BUEktQVQtUlciLCJNREMtUC1QTlAtUlciLCJNREMtUC1BQVUtUlciLCJITVMtUC1TSURFQkFSIiwiU1QtUC1OVEYtUlciLCJNREMtUC1SRUctUlciLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtSU4iLCJNREMtQVBJLU9HUC1SVyIsIlNULVAtVERMLVIiLCJNREMtUC1HT1AtUiIsIkhNUy1BUEktSVhSQVktUlciLCJTVC1QLU5URi1SIiwiTURDLVItQURNIiwiSE1TLVAiLCJITVMtQVBJLUlCIiwiSE1TLVAtQlVEIiwiSE1TLVAtQkxLIiwiSE1TLVAtUkVHIiwiTURDLVAtR1BQLVIiLCJNREMtUC1HQ1AtUiIsIk1EQy1BUEktUEdQLVJXIiwiTURDLUFQSS1MQk4tUiIsIk1EQy1BUEktU0dQLVJXIiwiTURDLVItUERDIiwiSE1TLVAtVkVMIiwiR1AtUC1HQ04tUiIsIkhNUy1QLVJFTlEiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOm51bGwsImFsbG93ZWQtb3V0bGV0cyI6W10sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc1MDM4MjQ2LCJleHAiOjE3NzUxMjUyNDZ9.KKO8jYYoaoRMPPXkxFZ-Wbr-YP_RJzy9wTMAV45py3m7abIEH-5ROzyLzIDeAKc1UbsLHYTvqZcuICK9cqv0UlOGwPrmjSlL9nyhYel8UTvAQyRjDVYHJo4Z4jdbOAKoLd923exEQGp-U8nfmvwsPYlApNJ_n_UmwyJI_kGaDIbvPu_JT4RaSFmiheDekKxz6WT3TDiKKbr_EiXmFLCAEg2nNjHwZtk5o3jDCRbEwmgFx6wc5_gBMzLTvecPM45-4Nk7XBEAsH4kqqaY0yuKdXhCEG7A7CyMSMmq1DFlerh3tNKMvYDTfUZ31y_Uyblc56guH01JBWeJ1mnVO3QZaQ";
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
  const selectedOutlet = "OLET001";
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
    window.location.href = "https://shinova.in/login";
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
  console.log("Allowed actions:", allowedActions);
  if (allowedActions.includes("HMS-R-SA")) {
    return "Super Admin";
  }
  if (allowedActions.includes("HMS-R-PH")) {
    return "Pharmacist";
  }
  if (allowedActions.includes("HMS-R-NS")) {
    return "Nursing Station";
  }
  else {
    return "Receptionist"; // Default role if none of the specific roles are found
  }
}

// --- Main execution ---
(function main() {
  try {
    console.log("Starting token validation...");

    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");
    console.log("Access token from localStorage exists:", !!accessToken);

    // If no token found, try development token
    if (!accessToken) {
      console.log(
        "❌ No token found in localStorage, trying development token"
      );
      accessToken = setforlocaldev();
    }

    // If still no token (development token is empty), redirect to login
    if (!accessToken || accessToken.trim() === "") {
      console.log("❌ No valid token available, redirecting to login");
      localStorage.removeItem("access_token"); // Clean up
      redirectToLogin();
      return; // Stop execution here
    }

    // Validate the token
    const userPayload = validate(accessToken);
    console.log("✅ Token validated successfully");
    console.log("Decoded token payload:", userPayload);

    // Store the valid token and user information
    localStorage.setItem("access_token", accessToken);

    // Extract user information from token payload
    const employeeId = userPayload.aud; // Using 'aud' field as ID
    const name = userPayload.name;
    const userEmail = userPayload.email;

    const userRole = getUserRole(userPayload["allowed-actions"]);

    console.log("Employee ID:", employeeId);
    console.log("Name:", name);
    console.log("Email:", userEmail);
    console.log("User Role:", userRole);

    // Check if we have required data
    const isLoggedIn = !!(employeeId && name);
    console.log("Is logged in:", isLoggedIn);

    if (!isLoggedIn) {
      throw new Error(
        "Missing required user data (employeeId or employeeName)"
      );
    }

    // Store user payload and extracted information for app usage
    localStorage.setItem("user_payload", JSON.stringify(userPayload));
    localStorage.setItem("employeeId", employeeId);
    localStorage.setItem("name", name);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("allowed-outlets", userPayload["allowed-outlets"]);
    localStorage.setItem("role", userRole);

    localStorage.setItem(
      "allowedActions",
      JSON.stringify(userPayload["allowed-actions"] || []),
    );

    console.log("✅ User payload and extracted data stored in localStorage");
    console.log("Stored data:", {
      employeeId,
      name,
      userEmail,
      role: userRole,
    });

    // Token is valid, render app
    console.log("✅ Rendering lab app...");
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
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

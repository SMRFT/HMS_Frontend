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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTSEktUC1GMy1SVyIsIk1EQy1BUEktQ0RSLVIiLCJITVMtUC1ITVMiLCJNREMtQVBJLVJETC1SVyIsIk1EQy1BUEktUEFUIiwiU0hJLVAtR0VUUkFXLVJXIiwiTURDLVAtQ0RFLVJXIiwiRVItUC1FUkdQUi1SVyIsIlNULVAtQ01ULVIiLCJTSEktUC1YUkFZLVJXIiwiU0hJLVAtREVMUkFXLVJXIiwiU1QtUC1TTk8tUlciLCJTSEktUC1DSEVNT1ItUlciLCJNREMtUC1SRUctUiIsIlNULUFQSS1FTVAtUiIsIk1EQy1QLVRSQi1SVyIsIlNISS1QLUVNUi1SVyIsIkhNUy1BUEktSVQtUlciLCJNREMtUC1PU0ItUlciLCJTVC1QLVRETC1SVyIsIlNJLVItSU5ESU4iLCJTVC1QLURFUy1SVyIsIkVSLVAtRVJWQi1SVyIsIlNISS1QLUVYUC1SVyIsIlNISS1QLVRSQUlOLVJXIiwiRVItUC1FUkdBUy1SVyIsIk1EQy1QLVJERS1SVyIsIlNISS1QLVNJQ1VSLVJXIiwiRVItUC1FUlJFUC1SVyIsIkdMLVAtRUFELVJXIiwiTURDLVAtQVNNLVJXIiwiU0hJLVAtTUlDVS1SVyIsIlNISS1QLUYyU1ItUlciLCJTSEktUC1FTVJSLVJXIiwiR1AtUC1HQ04tUiIsIlNISS1QLU1JQ1VSLVJXIiwiU1QtUC1CUkQtUiIsIlNULUFQSS1DUkQtUlciLCJTSEktUC1JTkMiLCJTVC1SLUhPRCIsIkdMLVAtQU5ELVJXIiwiU0hJLVAtT1QtUlciLCJNREMtUi1SRUMiLCJHTC1QLU5EQy1SVyIsIlNULVAtREVTLVIiLCJFUi1SLUVSU0EiLCJTVC1BUEktQlJELVJXIiwiTURDLVAtUFRFLVJXIiwiU0hJLVAtRjFSLVJXIiwiTURDLUFQSS1HQVMtUiIsIkVSLVAtRVJCLVJXIiwiR0wtUC1SU0UtUlciLCJTSEktUC1SRUNSLVJXIiwiR0wtUC1FTC1SVyIsIlNISS1QLUFWQUlMLVJXIiwiU0hJLVAtRjFTUi1SVyIsIlNISS1QLU5JQ1UtUlciLCJTSEktUC1DVC1SVyIsIkVSLUFQSS1FUlVCLVJXIiwiU0hJLVAtRjNSLVJXIiwiR0wtUC1FRC1SVyIsIk1EQy1QLVBOUC1SIiwiSE1TLUFQSS1TUk0tUlciLCJTSEktUC1QSFktUlciLCJHTC1QLUVQLVJXIiwiU0hJLVAtVVBEUkFXLVJXIiwiU0hJLVAtRjFTLVJXIiwiTURDLUFQSS1SVFMtUiIsIlNISS1QLUhBTkRSLVJXIiwiU1QtUC1DTVQtUlciLCJHTC1QLVAtUlciLCJHTC1QLUVCVC1SVyIsIk1EQy1QLVBOUFItUiIsIlNISS1QLU9QRC1SVyIsIk1EQy1BUEktQVQtUiIsIk1EQy1BUEktUEFULVIiLCJFUi1QLUVSQVMtUlciLCJITVMtQVBJLVNBTVQtUlciLCJTSEktUC1IQU5ELVJXIiwiU0hJLVAtRjJSLVJXIiwiTURDLVAtU09SLVIiLCJITVMtQVBJLVNJTlRFTlQtUlciLCJNREMtQVBJLVRIUi1SIiwiU0hJLVAtRjItUlciLCJTSEktUC1OSUNVUi1SVyIsIk1EQy1BUEktQVQtUlciLCJTSEktUC1NUkQtUlciLCJNREMtUC1QTlAtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVNJREVCQVIiLCJNREMtUC1SRUctUlciLCJTVC1BUEktQU1DLVJXIiwiU0hJLVAtRjJTLVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIlNISS1QLURFTC1SVyIsIkhNUy1BUEktU0FNLVJXIiwiU1QtUC1UREwtUiIsIlNISS1QLUZSTlQtUlciLCJTSEktUC1DSEVNTy1SVyIsIlNULVAtTlRGLVIiLCJTSEktUC1VUEQtUlciLCJTSEktUC1SRUMtUlciLCJTSEktUC1NT0NLLVJXIiwiU0hJLVAtU0lDVS1SVyIsIlNISS1QLU1SSS1SVyIsIlNISS1QLVRSQUlOUi1SVyIsIlNISS1QLUxBQi1SVyIsIk1EQy1BUEktTEJOLVIiLCJITVMtUC1TR1JOLVJXIiwiU0hJLVAtSFItUlciLCJTSEktUC1ESUEtUlciLCJTSEktUC1QSEFSTS1SVyIsIlNISS1QLUYxLVJXIiwiU0hJLVAtRk9STS1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDA1Il0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzMyLDMzLDM0LDM1LDM2LDUsMTAsMzcsMzgsMzldLCJhbGxvd2VkLW91dGxldHMiOltdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3NTQ0NjA4OSwiZXhwIjoxNzc1NTMzMDg5fQ.OC4Sw9XzM-pAcrSTtF6qYMmv1Q5D87-CmlnlB19Fi3HOrwE5tDCP8hLDtKKfcJ5cCL3Dr3xD7e_7u34Fq-jngIQSahV-6nIBjWQPv8CU55TasLXp5ihroXZ67BAuqfpl3z6b5ajFmKjlFe67yVnp1fDIIRPZ4YV7LImofkG0A7_hWPLNm3muI1jZBM0PEgfG4Az5nAuSADUBnNsUba6WIVBFJtBVKUU845DU8HK-xqjMKcJiHMc7q8rfmJGb_EBDlRkonSgcDr11ptn2DIE1GgErDvTBO-8_iEKeJtiwbxdJc3NK831C7-ckAjPuH1sVBvOgNEbHhiSSsWvgsz7uHg"
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB005";
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
    localStorage.setItem("hms_pages", JSON.stringify(userPayload["hms_pages"] || []));
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

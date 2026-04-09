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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiTURDLUFQSS1BVC1SIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUhNU1BTIiwiSE1TLVAtU1JNLVJXIiwiU1QtUC1DTVQtUiIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLUhNUyIsIk1EQy1QLUdQUC1SIiwiR1AtUC1HQ04tUiIsIk1EQy1QLVNPUi1SIiwiTURDLVAtR1NQLVIiLCJITVMtUC1SU0hGVCIsIlNULUFQSS1CUkQtUlciLCJNREMtUC1HT1AtUiIsIk1EQy1BUEktQ0RSLVIiLCJITVMtUC1CTEstUlciLCJNREMtUC1UUkItUlciLCJITVMtQVBJLURMRC1SIiwiTURDLUFQSS1BRE0tUlciLCJITVMtUC1HQURNLVJXIiwiTURDLVAtQVNNLVJXIiwiTURDLUFQSS1USFItUiIsIkhNUy1QLUhNU1BTLVJXIiwiSE1TLVAtUkVOUS1SVyIsIk1EQy1BUEktTEJOLVIiLCJNREMtQVBJLUNHUC1SVyIsIk1EQy1QLVBOUC1SIiwiSE1TLVAtUlNIRlRELVJXIiwiU1QtUC1TTk8tUlciLCJNREMtQVBJLU9HUC1SVyIsIk1EQy1QLU9TQi1SVyIsIkhNUy1QLVJDQVQtUlciLCJITVMtUC1OUy1SVyIsIkhNUy1QLUJST09NLVJXIiwiSE1TLVAtUkNMTi1SVyIsIlNULUFQSS1FTVAtUiIsIk1EQy1BUEktUEFULVIiLCJITVMtUC1STS1SVyIsIk1EQy1BUEktQUdQLVJXIiwiSE1TLVAtR1JOIiwiTURDLUFQSS1SVFMtUiIsIk1EQy1BUEktU0dQLVJXIiwiRVItUC1FUlBCLVJXIiwiRVItUC1FUkItUlciLCJTVC1QLVRETC1SIiwiSE1TLVAtUkNBVEQtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVJLSVQtUlciLCJNREMtQVBJLUdBUy1SIiwiU1QtQVBJLUFNQy1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLUFQSS1VSElELVIiLCJITVMtUC1TSURFQkFSIiwiU1QtUC1ERVMtUlciLCJNREMtUi1BRE0iLCJNREMtQVBJLVBEQy1SVyIsIkhNUy1QLVJTREQtUlciLCJTVC1QLUJSRC1SIiwiTURDLVAtUkVHLVIiLCJTVC1SLUhPRCIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtR1JOQSIsIkVSLVAtRVJSRVAtUlciLCJTVC1QLUNNVC1SVyIsIk1EQy1QLVBOUFItUiIsIlNULUFQSS1DUkQtUlciLCJNREMtUC1BQVUtUlciLCJITVMtUC1BRE0tUlciLCJITVMtUC1EQiIsIk1EQy1BUEktUkRMLVJXIiwiTURDLVAtR0NQLVIiLCJNREMtQVBJLVBBVCIsIk1EQy1BUEktQVQtUlciLCJNREMtQVBJLVBHUC1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1QLVJNRC1SVyIsIkhNUy1QLUJMS0QtUlciLCJNREMtUC1QTlAtUlciLCJTVC1QLVRETC1SVyIsIkVSLVAtRVJQTC1SIiwiSE1TLUFQSS1WTSIsIkVSLVAtRVJHTkJOLVIiLCJFUi1SLUVSTiIsIkVSLVAtRVJETC1SIiwiTURDLVAtUkVHLVJXIiwiSE1TLUFQSS1EQVNIIiwiU1QtUC1ERVMtUiIsIk1EQy1QLUdBUC1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMiw1LDYsMTAsMTQsMTUsMTYsMTcsMjYsMjcsMjgsMjksMzAsNDQsNTAsNTEsNTJdLCJobXNfb3V0bGV0cyI6WyJPTEVUMDAzIl0sImFsbG93ZWQtb3V0bGV0cyI6W10sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc1NzI5MDgyLCJleHAiOjE3NzU4MTYwODJ9.XqmECW2XEq5OW24BlafGN4yIoEMoBtgF-vso2VsDuoNyTYo3g3pjxiOJavZjTYcd-6L1Qt0jumEsG_qejnqwN_isUU7OBvB87HB9Do_CKHSw2CLgoG7gCEms38qnoG7uggaCwHxrxy-rEKYaazGFjfKT6hCsTLSyeVu4Q6bWJnaEB7HeybGjGIotYA8_nTZpu7ANBJNDMbImehu9qLZPjFCF_V9lsBJE8NQiFeOsEeDKRROxwg68zcLzmb6rdZIkL_UAPWkfXqau4hm1ckAgcNMZejlqi0fXEaXF9jeFvJ_Xovw9gZOz25BNIEuKEIaOxTVsE6MoSIx_6cTaErcV8Q";
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
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDAwMiIsImVtYWlsIjoibmFqbWFzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiTmFqbWEgQi4sIE1TLiwgRE5CLiwiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtVklOUi1SIiwiU0QtUC1ERi1SIiwiU1RSLUFQSS1WTC1SIiwiSE1TLVAtSE1TIiwiSE1TLVAtSE1TUFMtUlciLCJTVC1QLUNNVC1SIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1STUQtUlciLCJTVC1QLVNOTy1SVyIsIlNELVAtSE1TVUMtUlciLCJITVMtUC1DQ0MiLCJITVMtUC1JUEgiLCJITVMtUC1EQiIsIlNELVAtUEwtUiIsIlNUUi1QLUlDUy1SIiwiSE1TLVAtVklOLVJXIiwiU1QtQVBJLUVNUC1SIiwiU1RSLVAtVElOUi1SIiwiSE1TLUFQSS1JVC1SVyIsIlNUUi1BUEktVkwtUlciLCJTVC1QLVRETC1SVyIsIlNELVAtQkEtUiIsIlNULVAtREVTLVJXIiwiSE1TLVAtUkVHLVJXIiwiU0QtQVBJLUNOLVIiLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtQkxLLVJXIiwiU0QtQVBJLVRELVIiLCJITVMtUC1CVUQtUiIsIlNELVAtU1NVLVJXIiwiU0QtUC1ITVNQQi1SIiwiU1RSLVAtVElOUi1SVyIsIkhNUy1QLUhNU1BTIiwiSE1TLVAtR1JOIiwiU0QtUC1DSEMtUiIsIlNELVAtSE1TVEQtUlciLCJTRC1QLUhNU1BCLVJXIiwiU0QtUC1MUEktUiIsIlNELVAtQlRELVJXIiwiU0QtUC1ITVNQUy1SVyIsIkhNUy1BUEktVk0iLCJITVMtUC1CTEtELVJXIiwiU1QtUC1CUkQtUiIsIlNUUi1BUEktVElOLVJXIiwiU1QtQVBJLUNSRC1SVyIsIlNELVAtVEUtUlciLCJITVMtUC1JWFJBWS1SVyIsIlNULVItSE9EIiwiU0QtUC1MR0xELVIiLCJITVMtUC1TVU0tUlciLCJTRC1QLVBPVi1SIiwiU0QtUC1HU1AtUiIsIkhNUy1QLVJCSUxMIiwiU0QtUC1TUy1SVyIsIlNELVAtU1MtUiIsIkhNUy1QLUlQLVJXIiwiU0QtQVBJLVRNLVJXIiwiU0QtUC1URC1SVyIsIlNULVAtREVTLVIiLCJTVFItQVBJLVRSTFItUiIsIkhNUy1QLURMRC1SVyIsIkhNUy1QLVNSTS1SVyIsIkhNUy1QLUdSTkEiLCJITVMtUC1PUEgiLCJITVMtUC1XUiIsIlNULUFQSS1CUkQtUlciLCJTRC1BUEktTUlTLVJXIiwiU0QtUC1DSEMtUlciLCJTRC1QLVNJUi1SVyIsIlNELVItQSIsIkhNUy1QLVZWLVJXIiwiU0QtUC1NSVMtUiIsIlNELUFQSS1HT1ItUlciLCJITVMtUC1BREFTSCIsIlNELVAtTUJUVi1SIiwiU0QtUC1QQi1SIiwiU0QtQVBJLUlWTS1SIiwiU0QtUC1VUEItUiIsIlNELVAtU0NVLVJXIiwiSE1TLVAtSE1TSU5TIiwiU0QtUC1MU0QtUlciLCJITVMtUC1JUEtHLVJXIiwiU0QtUC1MVVNDRC1SVyIsIlNELUFQSS1NQlRELVJXIiwiU0QtUC1URC1SIiwiU0QtQVBJLUdSLVJXIiwiSE1TLVAtQURNLVJXIiwiU1RSLVItQSIsIlNUUi1BUEktVElOLVIiLCJTRC1QLUhNU1NQLVIiLCJITVMtQVBJLVNSTS1SVyIsIlNELVAtUEYtUiIsIlNUUi1BUEktSUwtUiIsIlNELUFQSS1HQy1SVyIsIkhNUy1QLUFNLVJXIiwiU1QtUC1DTVQtUlciLCJTRC1QLVNTVS1SIiwiSE1TLVAtT1RNLVJXIiwiU0QtUC1ITVNDUy1SIiwiU0QtUC1ITVNMRC1SIiwiU0QtUC1ITVNTUy1SIiwiSE1TLVAtUlNIRlQiLCJTRC1QLVNHQUMtUiIsIlNELVAtUEctUlciLCJTRC1BUEktVkMtUlciLCJTVFItQVBJLVRSTC1SIiwiSE1TLVAtQlQtUlciLCJTRC1QLUhNU1RELVIiLCJTRC1QLUxHTFQtUiIsIlNELVAtVEUtUiIsIlNELUFQSS1HT0MtUlciLCJTVFItQVBJLUlMLVJXIiwiU0QtUC1TR0FDLVJXIiwiU0QtUC1HUEItUlciLCJTRC1BUEktSVZNLVJXIiwiU0QtUC1ERi1SVyIsIlNELVAtTEJOLVIiLCJITVMtUC1EREFTSCIsIkhNUy1QLVJFTlEtUlciLCJITVMtQVBJLVNBTVQtUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJTVFItQVBJLVRSTC1SVyIsIlNELVAtTEdTQy1SIiwiSE1TLUFQSS1EQVNIIiwiU0QtUC1NQlBELVIiLCJTRC1QLUhNU1NQLVJXIiwiU0QtUC1ITVNHQy1SIiwiU0QtQVBJLUdELVIiLCJTRC1BUEktUFItUiIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtSU1SSS1SVyIsIlNELVAtSE1TU0QtUlciLCJTVC1QLU5URi1SVyIsIkhNUy1QLVNJREVCQVIiLCJTRC1QLU1CREYtUlciLCJTVC1BUEktQU1DLVJXIiwiU0QtUC1TVkYtUiIsIlNELUFQSS1UTS1SIiwiU0QtUC1VUEItUlciLCJTRC1QLUxTQy1SVyIsIlNELVAtR1BELVIiLCJTRC1QLVNWRi1SVyIsIlNELVAtUEYtUlciLCJTRC1QLUxHRC1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJTRC1BUEktUkNMLVJXIiwiU0QtUC1CVEQtUiIsIlNULUFQSS1UUkxSLVJXIiwiU1QtUC1UREwtUiIsIkhNUy1BUEktU0FNLVJXIiwiU0QtUC1QT1YtUlciLCJTRC1QLVNIRi1SVyIsIlNULVAtTlRGLVIiLCJTRC1BUEktVFYtUiIsIlNELVAtQkEtUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1STS1SVyIsIlNELVAtU0hGLVIiLCJTRC1QLVBHLVIiLCJTRC1QLUhNU1NTLVJXIiwiSE1TLVAtSUNULVJXIiwiU0QtUC1TSVItUiIsIlNELVAtTFNDTC1SIiwiSE1TLVAtU0dSTi1SVyIsIlNELVAtU0MtUiIsIlNELUFQSS1WUC1SVyIsIlNELVAtQkctUiIsIlNELVAtUEQtUiIsIkhNUy1QLU9UU1MtUlciLCJITVMtUC1JVVNHLVJXIiwiU0QtQVBJLVJCLVIiLCJTRC1QLVBCLVJXIiwiU0QtUC1TUC1SIiwiU0QtUC1MUkMtUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIiwiU0hCMDAyIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQwLDQxLDQyLDQzLDQ0LDQ1LDQ2LDQ3LDQ4LDQ5LDEyXSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzU0NTIzNzIsImV4cCI6MTc3NTUzOTM3Mn0.fQOZsrGWpa_YkjB20XO9k2Mv0b55lLnah2gTZFzwf5QyxBH2RPlluo7MpMCcD7hLiDuxqDMLg-Z7bW5BuMyfNCfK0azreeOAg2KSS4NxGPv0xy8EyqAR0hUjZTPGFnARc65lfLS3qWi1o9O2TNAigdDwiplzs5E9HorVaK8yfD3nvYKGi5cu0WTl39_Zs_E"
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

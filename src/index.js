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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtUENELVJXIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLUJST09NLVJXIiwiTURDLUFQSS1TR1AtUlciLCJITVMtUC1XUi1SVyIsIk1EQy1BUEktUEFULVIiLCJNREMtQVBJLVBBVCIsIkhNUy1QLVBPTC1SIiwiSE1TLVAtUEktUlciLCJITVMtUC1QRVItUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtUkNMTi1SVyIsIk1EQy1QLVBOUFItUiIsIkhNUy1QLU1SQS1SVyIsIkhNUy1QLUNDRC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtUlNIRlQtUlciLCJNREMtUC1UUkItUlciLCJITVMtUC1QSUQtUlciLCJITVMtUC1EREFTSCIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLUhNU1BTLVJXIiwiSE1TLVAtSE1TUFMiLCJITVMtUC1QT0wtUlciLCJITVMtUC1HUk5BIiwiSE1TLVAtR1JOQS1SVyIsIkhNUy1QLVBSQS1SVyIsIkhNUy1QLU5TLVJXIiwiSE1TLVAtQUEtUlciLCJITVMtUC1JQi1SVyIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1DQy1SVyIsIk1EQy1BUEktQVQtUlciLCJNREMtUC1HUFAtUiIsIk1EQy1QLVJFRy1SIiwiSE1TLVAtTVItUlciLCJTVC1QLURFUy1SIiwiU1QtQVBJLUFNQy1SVyIsIkhNUy1QLVJTREQtUlciLCJITVMtUC1EQiIsIk1EQy1QLUdTUC1SIiwiSE1TLVAtR1JOIiwiSE1TLVAtTlNELVJXIiwiTURDLVAtUkVHLVJXIiwiSE1TLVAtSE1TIiwiTURDLVItQURNIiwiSE1TLVAtTVJMLVJXIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1BRE1ELVJXIiwiU1QtUC1CUkQtUiIsIlNULVAtVERMLVIiLCJNREMtQVBJLUdBUy1SIiwiTURDLVAtR0FQLVIiLCJNREMtQVBJLVRIUi1SIiwiSE1TLVAtQ1RJQS1SVyIsIkhNUy1QLUdBRE0tUlciLCJNREMtUC1QTlAtUlciLCJITVMtUC1QU0ctUlciLCJITVMtQVBJLVZNIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtUEMtUlciLCJITVMtUC1SS0lULVJXIiwiTURDLUFQSS1BVC1SIiwiTURDLUFQSS1QR1AtUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1NVC1SVyIsIkhNUy1QLVJFTlEtUlciLCJNREMtUC1HQ1AtUiIsIkhNUy1QLUdSTi1SVyIsIlNULVAtREVTLVJXIiwiU1QtUC1DTVQtUlciLCJNREMtUC1TT1ItUiIsIlNULVAtQ01ULVIiLCJITVMtUC1TVC1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtUkNBVC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiSE1TLVAtT1MtUlciLCJTVC1QLU5URi1SIiwiSE1TLVAtQ1RJLVJXIiwiU1QtUC1OVEYtUlciLCJITVMtQVBJLVVISUQtUiIsIk1EQy1BUEktUERDLVJXIiwiR1AtUC1HQ04tUiIsIk1EQy1QLU9TQi1SVyIsIlNULVAtVERMLVJXIiwiU1QtUC1TTk8tUlciLCJITVMtUC1BRE1MLVJXIiwiTURDLVAtQUFVLVJXIiwiTURDLVAtR09QLVIiLCJNREMtQVBJLUNHUC1SVyIsIkhNUy1QLVJNRC1SVyIsIkhNUy1BUEktREFTSCIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLUJMSy1SVyIsIk1EQy1BUEktT0dQLVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUC1TUk0tUlciLCJNREMtQVBJLUFETS1SVyIsIlNULVItSE9EIiwiSE1TLVAtUktJVEQtUlciLCJNREMtQVBJLVJUUy1SIiwiTURDLVAtQVNNLVJXIiwiSE1TLVAtVk5ERC1SVyIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1EUk0tUlciLCJITVMtUC1QUi1SVyIsIk1EQy1BUEktQ0RSLVIiLCJITVMtUC1CTEtELVJXIiwiSE1TLVAtUFJMLVJXIiwiTURDLUFQSS1SREwtUlciLCJNREMtQVBJLUxCTi1SIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMTI4LDEsMiw1LDYsMTMzLDEzNCw5LDEwLDEzNSwxMzcsMTM2LDE0LDE1LDE2LDE3LDEzOCwyNiwyNywyOCwyOSwzMCwzMSw0NCw1MCw1MSw1Miw1NSw1OCw1OSwxMDIsMTE1LDExNiwxMTcsMTE4LDEyMCwxMjEsMTIyLDEyMywxMjddLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzgyNTM2NzIwLCJleHAiOjE3ODI2MjM3MjB9.OfzKwabMzUiNcr1pJoNvLlAQwJrKAwxzcL4pae5mCx61utzMjfFCllxcOu6v62bAnG-smZQA89Mm_5F296lV5jXE5FI-8qDquE7fKNDG8ZalTPrP-RfTNFwPZktvGe50YrxzrDDM_EhSu6sQE9mqrM4dPEPPDZxDWkePdIbvpwWv0hdOKXqA7vfLYvkkG3UBf65QyQYtBxYcf-PItwi0c56JJEZCqOC2kwgeZYF-gCPujmcniJZgVtmJQM3jALnM_TVTp5jSZTEyvIlfBM4jrYbJOVChLFKxa2qyrVg_21nWXXQ74l6lIxjMdznVI-37Wim454f9qfKK1ZLT11Vcvg";
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
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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTSEktUC1UUkFJTi1SVyIsIkhNUy1QLVBNQy1SVyIsIkhNUy1QLURCVURSLVIiLCJITVMtUC1QU00tUlciLCJITVMtQVBJLURMRC1SIiwiRVItQVBJLUVSVUItUlciLCJHTC1QLVJTRS1SVyIsIk1EQy1BUEktUEFULVIiLCJNREMtQVBJLVBBVCIsIkhNUy1QLVBHUy1SVyIsIkhNUy1QLVBHTEJVLVJXIiwiSE1TLUFQSS1ETEQtUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtSUJELVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1DQ0dBSC1SVyIsIk1EQy1QLVRSQi1SVyIsIkdMLVAtRUJULVJXIiwiSE1TLVAtUEdFQi1SVyIsIkhNUy1QLVBQRC1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiTURDLVItUkVDIiwiSE1TLVAtTlMtUlciLCJHTC1QLUVELVJXIiwiSE1TLVAtQUEtUlciLCJITVMtUC1JQi1SVyIsIkhNUy1QLUNDVVBCLVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLUFQSS1TQU1ULVJXIiwiSE1TLVAtVklOUi1SIiwiR0wtUC1QLVJXIiwiTURDLUFQSS1BVC1SVyIsIk1EQy1QLVJFRy1SIiwiU1QtUC1ERVMtUiIsIkdMLVAtRVAtUlciLCJHTC1QLUVBRC1SVyIsIlNULUFQSS1BTUMtUlciLCJFUi1SLUVSU0EiLCJITVMtUC1DQ0dNUEItUlciLCJITVMtUC1PUEgiLCJITVMtUC1EQiIsIlNISS1QLUlOQyIsIkhNUy1BUEktSVQtUlciLCJFUi1QLUVSUkVQLVJXIiwiRVItUC1FUkdBUy1SVyIsIkhNUy1QLVBBUy1SVyIsIk1EQy1QLVBURS1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLVBTQi1SVyIsIk1EQy1QLVJFRy1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIkhNUy1QLVJPUi1SVyIsIkhNUy1QLVBHUEJULVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtQ0NQUlAtUlciLCJFUi1QLUVSQi1SVyIsIkhNUy1QLUFETUQtUlciLCJTVC1QLUJSRC1SIiwiTURDLUFQSS1HQVMtUiIsIlNULVAtVERMLVIiLCJITVMtUC1TR1JOLVJXIiwiRVItUC1FUlZCLVJXIiwiSE1TLUFQSS1TUk0tUlciLCJITVMtQVBJLVNJTlRFTlRBLVJXIiwiTURDLUFQSS1USFItUiIsIkhNUy1QLUNUSUEtUlciLCJNREMtUC1QTlAtUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1SS0lULVJXIiwiSE1TLVAtQlQtUlciLCJNREMtQVBJLUFULVIiLCJITVMtUC1SU0QtUlciLCJFUi1QLUVSR1BSLVJXIiwiU1QtUC1ERVMtUlciLCJTVC1QLUNNVC1SVyIsIkhNUy1QLVBIVlNCLVJXIiwiTURDLVAtU09SLVIiLCJTVC1QLUNNVC1SIiwiSE1TLVAtUk0tUlciLCJITVMtUC1QREItUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtQ0NHQVMtUlciLCJTVC1QLU5URi1SIiwiU0hJLVAtRVhQLVJXIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtQ1RJLVJXIiwiR0wtUC1BTkQtUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1DQ0lQQUItUlciLCJTVC1QLU5URi1SVyIsIkhNUy1BUEktVUhJRC1SIiwiR1AtUC1HQ04tUiIsIk1EQy1QLU9TQi1SVyIsIlNULVAtVERMLVJXIiwiSE1TLVAtUFNJUC1SVyIsIlNULVAtU05PLVJXIiwiR0wtUC1OREMtUlciLCJITVMtUC1JQ0QtUlciLCJHTC1QLUVMLVJXIiwiSE1TLVAtQURNTC1SVyIsIkhNUy1QLVBDQl9SVyIsIkhNUy1QLVJNRC1SVyIsIkhNUy1QLUJMSy1SVyIsIlNULUFQSS1FTVAtUiIsIkhNUy1QLVBGQi1SVyIsIk1EQy1QLVBOUC1SIiwiSE1TLVAtU1JNLVJXIiwiTURDLVAtUkRFLVJXIiwiU1QtUi1IT0QiLCJITVMtUC1BU1ItUlciLCJNREMtQVBJLVJUUy1SIiwiTURDLVAtQVNNLVJXIiwiSE1TLVAtVk5ERC1SVyIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1EUk0tUlciLCJNREMtQVBJLUNEUi1SIiwiRVItUC1FUkFTLVJXIiwiSE1TLUFQSS1TQU0tUlciLCJNREMtUC1DREUtUlciLCJITVMtUC1JQkUtUlciLCJNREMtQVBJLVJETC1SVyIsIk1EQy1BUEktTEJOLVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxMjgsMSwyLDQsNSwxMCwxMSwxMiwxMywxOCwxOSwyMCwyMSwyNiwyNywyOCwzMiwzMywzNCwzNSwzNiwzNywzOCwzOSw0Myw0NCw0NSw0Niw1MCw1MSw1Miw1NSw1NywxMDEsMTAzLDEwNCwxMDUsMTA2LDEwNywxMDgsMTA5LDExMCwxMTEsMTEyLDEyNCwxMjUsMTI3XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDA0IiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzgyNzA0MTk0LCJleHAiOjE3ODI3OTExOTR9.U8E9LKCgL9onY8C6gl1JnsZHENyn45kW7JZnkLTfDSDhvtNQbbVqvlkSgEacY4j_VuicBvZdPzkM8fONEcn4cwGvAujYweZgZzqsWKo5HD3vA8p5Gw2UciPquVtFPTSqGdlTNuV6isJMrwIqevQ6kxkCqCWJhbQ4ISfKtk_BTLwLjeuCgs5Fe2DA-xFAnZxd8warA13XEnvuCW3xKMHFSQs7SUhLa_q5LVKlyj_bxtOx9pZgknPBGna1BpGAZfvbXo9BcRWrZWxdp1oXwxKsGwnhWmthK0v1TgdjjPNp13tUNMXL2wV10v6uu2zyPL_q_F3_uSG29LEgg037D7KqFA";
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
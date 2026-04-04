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
  const dev_token ="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUNFQi1SVyIsIkhNUy1QLUlCLVIiLCJFUi1QLUVSVVMtUlciLCJFUi1QLUVSR1BSLVJXIiwiSE1TLVAtSFNOLVJXIiwiSE1TLVAtUE9QVUFTLVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtR1BCVC1SIiwiSE1TLVAtR0xCVC1SIiwiRVItUC1FUlZCLVJXIiwiRkUtUC1GR0YtUiIsIlNISS1QLUVYUC1SVyIsIkhNUy1QLUJMSy1SIiwiU0hJLVAtVFJBSU4tUlciLCJFUi1QLUVSR0FTLVJXIiwiSE1TLVAtUENPUFAtUlciLCJHTC1QLUVBRC1SVyIsIkVSLVAtRVJTRC1SVyIsIkZFLVItRkEtUlciLCJGRS1QLUZHLVJXIiwiU0hJLVAtSU5DIiwiR0wtUC1BTkQtUlciLCJNREMtUC1HQVAtUiIsIkdMLVAtTkRDLVJXIiwiTURDLUFQSS1DR1AtUlciLCJITVMtUC1ETEQtUlciLCJGRS1QLUZTLVJXIiwiSE1TLVAtT1BIIiwiSE1TLVAtUENDU0RfUlciLCJITVMtUC1PUFBCLVIiLCJITVMtUC1XUlEtUlciLCJHTC1QLVJTRS1SVyIsIkdMLVAtRUwtUlciLCJHTC1QLUVELVJXIiwiSE1TLVAtR09QUy1SIiwiSE1TLVAtQURNLVJXIiwiSE1TLVAtUFNPUEItUlciLCJGRS1QLUZVUy1SVyIsIkdMLVAtRVAtUlciLCJITVMtUC1QR0xCVS1SIiwiSE1TLVAtR0xCVS1SIiwiSE1TLVAtUEdTLVIiLCJNREMtQVBJLUFHUC1SVyIsIkhNUy1QLVBPUFBEQi1SVyIsIkdMLVAtUC1SVyIsIkdMLVAtRUJULVJXIiwiSE1TLVAtR0FFLVIiLCJGRS1QLUZGLVJXIiwiRVItUi1FUlAiLCJNREMtUC1QTlBSLVIiLCJITVMtUC1WTC1SVyIsIk1EQy1BUEktQVQtUiIsIkZFLVItRkEiLCJNREMtQVBJLVBEQy1SVyIsIkhNUy1QLUNPUFAtUlciLCJNREMtUC1HU1AtUiIsIkhNUy1QLURSTS1SIiwiSE1TLVAtUkNBVC1SIiwiRkUtUC1GR0wtUiIsIkZFLVAtRlVCLVJXIiwiSE1TLVAtQ1MtUlciLCJNREMtUC1BQVUtUlciLCJITVMtUC1QR1BCVC1SIiwiSE1TLVItUEgiLCJGRS1QLUZTQi1SVyIsIk1EQy1BUEktT0dQLVJXIiwiSE1TLVAtR1dMLVIiLCJGRS1QLUZBTC1SIiwiTURDLVAtR09QLVIiLCJGRS1QLUZSLVJXIiwiSE1TLVAtUEdBUy1SIiwiSE1TLVAtUEdFQi1SIiwiSE1TLVAtR09QQk4tUiIsIkhNUy1QLVNPUEUtUlciLCJFUi1QLUVSUC1SIiwiSE1TLVAtU09QQi1SVyIsIk1EQy1QLUdQUC1SIiwiTURDLVAtR0NQLVIiLCJNREMtQVBJLVBHUC1SVyIsIk1EQy1BUEktU0dQLVJXIiwiTURDLVItUERDIiwiR1AtUC1HQ04tUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzE4LDE5XSwiYWxsb3dlZC1vdXRsZXRzIjpbXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3NzUyODU0NzgsImV4cCI6MTc3NTM3MjQ3OH0.Ns0jk6H9IYY9pcNCzOJBnAA2iNN0vrF6W_n3fyaRdtTNz1_VdOYQ0gkFGYPnEAK0AAq_da6Xlc7vRsmiVL1z9MvfDzjIxG1bLiNhLIYXEkz8NRDWygA92fvtyBgiTPyEMRmjSYL-PCYnDXApCzI34wxg_KVi3z-vDgx90SK8anlBKP3tpDswgHfzitvgeNiA4Yg__PAzBZZCocj-zsZEYFtumNzVkFfXD3ucaFfSQk-4SmHiUbXEn7V2WplQPiRXh0BOHjX6bL2ogAhWFsi5C-Jrijw1-Bxm4MNP3HzdUSZonhDeWCLqXOUswWyCv83d4S6xHp3pV7-o-vqA3hMpYA"
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
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
    return "Employee"; // Default role
  }
  console.log("Allowed actions:", allowedActions);
  if (allowedActions.includes("HMS-R-SA")) {
    return "Super Admin";
  } else {
    return "Employee"; // Default role if none of the specific roles are found
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
        "❌ No token found in localStorage, trying development token",
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
        "Missing required user data (employeeId or employeeName)",
      );
    }

    // Store user payload and extracted information for app usage
    localStorage.setItem("user_payload", JSON.stringify(userPayload));
    localStorage.setItem("employeeId", employeeId);
    localStorage.setItem("name", name);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("role", userRole);

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

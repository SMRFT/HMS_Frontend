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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtSE1TUFMiLCJITVMtUC1NUkEtUlciLCJTVC1QLU5URi1SIiwiSE1TLVAtSE1TIiwiU1QtUC1ERVMtUiIsIlNULVAtQ01ULVJXIiwiSE1TLVAtQ1RJQS1SVyIsIlNULVItQ0RSIiwiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLUdSTi1SVyIsIkhNUy1QLURCIiwiSE1TLVAtTVJMLVJXIiwiU1QtQVBJLUJSRC1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1QLUNUSS1SVyIsIkdQLVAtR0NOLVIiLCJITVMtUC1QUkwtUlciLCJTVC1QLVNOTy1SVyIsIkhNUy1QLVBSQS1SVyIsIkhNUy1QLUdQUkEtUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtTVQtUlciLCJITVMtUC1TVEEtUlciLCJTVC1BUEktQU1DLVIiLCJITVMtUC1WTkRELVJXIiwiSE1TLVAtUEktUlciLCJITVMtUC1QQ0QtUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1TVC1SVyIsIkhNUy1QLVBPTC1SIiwiSE1TLVAtUEMtUlciLCJITVMtUC1PQ1ItUlciLCJITVMtUC1NUi1SVyIsIlNULVAtQ01ULVIiLCJITVMtUC1ITVNQUy1SVyIsIlNULVAtVERMLVIiLCJITVMtUC1QTy1SVyIsIlNULVAtQlJELVIiLCJITVMtUC1PUy1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLVBTSC1SVyIsIlNULVAtTlRGLVJXIiwiU1QtUi1FTVAiLCJTVC1BUEktQ1JELVIiLCJITVMtUC1DQy1SVyIsIkhNUy1QLUNDRC1SVyIsIkhNUy1BUEktVk0iXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxMjgsNTgsNSwxMzQsMTM1LDEzNiwxMCwxNCwxNSwxNiwxMTQsMTIxLDEyMiw1OSwxMjddLCJhbGxvd2VkLW91dGxldHMiOltdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4NDE4NDY5NywiZXhwIjoxNzg0MjcxNjk3fQ.BKqV9-9NRVuhI3ore55YkWNecYHqb4-KOiKrLwWyRjp-TNb61McaFiBOYtqGdtIe7FiiYoYU1ULd9wcrx9nnZu4_RCNCOBrCf6t_0roFgIcC4it45JIB55E-OpCCtoe3af0lG0lSAGkYssIqB2XULAC_rfvP0AlzqdN9xwBRPA2YYic0x-r8oM-ufWYWwtQXifoyhG_R8P-VLn8HeBK6kMqUhFA0-6MKjdF7JBm-H1FbB3_IEJmbp1lbASu6kSD7Snvqbj1ebNuTUKNqNb9hUy1FunYxWuVAlf-nlI5IMpIab9zFBMZ7ViSgsEOAflXk0bAYOLQOZFvT3z_U-zpX6g";
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

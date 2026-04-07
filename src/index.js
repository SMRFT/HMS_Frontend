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
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik0uUGFydGhpYmFuIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLURCVURSLVIiLCJITVMtUC1TVU0tUlciLCJITVMtUC1WSU5SLVIiLCJITVMtUC1ITVMiLCJTVC1QLUNNVC1SVyIsIkhNUy1BUEktREFTSC1SVyIsIkhNUy1QLUFNLVJXIiwiSE1TLVAtSE1TUFMtUlciLCJITVMtUC1JUC1SVyIsIlNULVAtQ01ULVIiLCJITVMtQVBJLVNJTlRFTlRBLVJXIiwiU1QtUC1ERVMtUiIsIkhNUy1QLVJDQVRELVJXIiwiU1QtUC1TTk8tUlciLCJITVMtUC1ETEQtUlciLCJITVMtUC1TUk0tUlciLCJITVMtUC1WSS1SVyIsIkhNUy1QLUdSTkEiLCJTVC1QLVRETC1SIiwiSE1TLVAtUlNIRlQiLCJITVMtQVBJLVNBTS1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLU9QSCIsIlNULUFQSS1CUkQtUlciLCJITVMtUC1XUiIsIkhNUy1QLVZJTi1SVyIsIkhNUy1QLURCIiwiU1QtQVBJLUVNUC1SIiwiU1QtUi1DRFIiLCJITVMtQVBJLUlULVJXIiwiSE1TLVAtVlYtUlciLCJTVC1QLU5URi1SIiwiU1QtUC1UREwtUlciLCJITVMtUC1CVC1SVyIsIkhNUy1QLVZJTlItUlciLCJTVC1QLURFUy1SVyIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtUkVHLVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLUREQVNIIiwiSE1TLVAtUkNBVC1SVyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLUhNU1BTIiwiSE1TLUFQSS1TQU1ULVJXIiwiSE1TLUFQSS1TSU5URU5ULVJXIiwiSE1TLVAtR1JOIiwiSE1TLVAtSUNULVJXIiwiSE1TLUFQSS1EQVNIIiwiSE1TLVAtSE1TSU5TIiwiSE1TLVAtSVBLRy1SVyIsIkhNUy1QLURSTS1SVyIsIkhNUy1BUEktVk0iLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLUFETS1SVyIsIkhNUy1QLVNHUk4tUlciLCJITVMtUC1JTVJJLVJXIiwiSE1TLVAtSUItUlciLCJTVC1QLUJSRC1SIiwiU1QtUi1BIiwiSE1TLVAtSVVTRy1SVyIsIlNULUFQSS1DUkQtUlciLCJITVMtQVBJLVNSTS1SVyIsIkhNUy1QLU9UU1MtUlciLCJITVMtUC1JWFJBWS1SVyIsIlNULVAtTlRGLVJXIiwiSE1TLVAtT1RNLVJXIiwiU1QtQVBJLUFNQy1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIiwiU0hCMDAyIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEsMiwzLDQsNSw2LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDAsNDEsNDIsNDQsNDUsNDYsNDcsNDgsNDldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc3NTUzMjA2MSwiZXhwIjoxNzc1NjE5MDYxfQ.EU2agxKK3_64KEm3CH5p5BtdVg6TkL_2EwErrWyyRJ_WJ-RLXraL42EgBZuz17edCPadkKE3AXDQ8vtT0pD3R0eom3Zb6U3uSwRJzz9QsBATVe-08I7wk4RoylOZb4LS41OEMg-qLTtf4cdyV24whLq_h-UZiEaoIt8WmOUIIm_3bkU5Qzw-BA9LC7tZvjbOK3PYU9aT5zhQwPTasTSi2PkRR-uDgQlC7hl5KmqLZZNup6hAg3sXqsp1upYf-QIu-uBw7ifDTwXgIOWiVsxmJCr1C-FHf_pxmK1qTWixauaYVl5FMos-EBM0CPj-2AH9ez7cz77rtnk-LJM6XeOmsA";
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

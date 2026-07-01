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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6InBhcnRoaWJhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJITVMtQVBJLVJERC1SVyIsIkhNUy1QLVBDRC1SVyIsIkhNUy1BUEktRExELVIiLCJITVMtUC1CUk9PTS1SVyIsIk1EQy1BUEktU0dQLVJXIiwiSE1TLVAtV1ItUlciLCJNREMtQVBJLVBBVC1SIiwiTURDLUFQSS1QQVQiLCJITVMtUC1QSS1SVyIsIkhNUy1QLVBFUi1SVyIsIkhNUy1QLVZJLVJXIiwiSE1TLVAtT1RNRC1SVyIsIkhNUy1QLVZWRS1SVyIsIkhNUy1QLURPLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUlCRC1SVyIsIkhNUy1QLVJDTE4tUlciLCJNREMtUC1QTlBSLVIiLCJITVMtUC1NUkEtUlciLCJITVMtUC1DQ0QtUlciLCJITVMtQVBJLVBBQ0stUiIsIkhNUy1QLVNVTS1SVyIsIkhNUy1QLVZWLVIiLCJITVMtUC1WSU5BLVJXIiwiSE1TLVAtT1RTU0QtUlciLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1QLU9UTUJFLVJXIiwiTURDLVAtVFJCLVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtRElTLVJXIiwiSE1TLVAtRERBU0giLCJITVMtUC1WTkQtUlciLCJITVMtUC1QT0wtUlciLCJITVMtUC1HUk5BLVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1BQS1SVyIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtQ0wtUlciLCJITVMtUC1DQy1SVyIsIkhNUy1BUEktUkRBLVJXIiwiTURDLUFQSS1BVC1SVyIsIk1EQy1QLUdQUC1SIiwiSE1TLVAtU1VNRC1SVyIsIk1EQy1QLVJFRy1SIiwiSE1TLVAtTVItUlciLCJITVMtUC1PVE0tUiIsIkhNUy1QLVNVTUUtUlciLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtT1RNRS1SVyIsIkhNUy1QLURCIiwiTURDLVAtR1NQLVIiLCJITVMtQVBJLUlULVJXIiwiSE1TLVAtVklELVJXIiwiSE1TLUFQSS1SRC1SVyIsIkhNUy1SLVYiLCJITVMtQVBJLVJERS1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLU9QSC1SVyIsIkhNUy1QLVZJTi1SIiwiSE1TLVAtVklORS1SVyIsIk1EQy1QLVJFRy1SVyIsIkhNUy1QLU9UU1MtUiIsIkhNUy1QLUxORC1SVyIsIkhNUy1QLUhNUyIsIkhNUy1QLVNBRE0tUlciLCJITVMtUC1WSS1SIiwiTURDLVItQURNIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1BRE1ELVJXIiwiSE1TLVAtU1VNQS1SVyIsIk1EQy1BUEktR0FTLVIiLCJITVMtUC1PVE1CLVJXIiwiSE1TLVAtU0dSTi1SVyIsIk1EQy1QLUdBUC1SIiwiSE1TLVAtQU1FLVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIk1EQy1BUEktVEhSLVIiLCJITVMtUC1PVFNTQS1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1HQURNLVJXIiwiTURDLVAtUE5QLVJXIiwiSE1TLVAtUFNHLVJXIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1TVEEtUlciLCJITVMtUC1ETEQtUlciLCJITVMtUC1QQy1SVyIsIkhNUy1QLVJLSVQtUlciLCJNREMtQVBJLUFULVIiLCJNREMtQVBJLVBHUC1SVyIsIkhNUy1QLU9UU1NVLVJXIiwiSE1TLVAtVlYtUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1NVC1SVyIsIkhNUy1QLVJFTlEtUlciLCJITVMtUC1TVU0tUiIsIk1EQy1QLUdDUC1SIiwiSE1TLVAtT1RJUkQtUlciLCJITVMtUC1HUk4tUlciLCJNREMtUC1TT1ItUiIsIkhNUy1QLVNULVJXIiwiSE1TLVAtUk0tUlciLCJITVMtUC1BTUQtUlciLCJITVMtUC1SQ0FULVJXIiwiTURDLUFQSS1BR1AtUlciLCJITVMtUC1PUy1SVyIsIkdELVAtR1AiLCJITVMtUC1DVEktUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1BTS1SVyIsIkhNUy1QLUFNLVIiLCJITVMtQVBJLVVISUQtUiIsIkhNUy1QLU9UU1MtUlciLCJNREMtQVBJLVBEQy1SVyIsIkdQLVAtR0NOLVIiLCJNREMtUC1PU0ItUlciLCJITVMtUC1JQ0QtUlciLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtT1RNQkQtUlciLCJITVMtUC1QU0gtUlciLCJNREMtUC1BQVUtUlciLCJNREMtUC1HT1AtUiIsIkhNUy1QLVZJTi1SVyIsIk1EQy1BUEktQ0dQLVJXIiwiSE1TLVAtUk1ELVJXIiwiSE1TLUFQSS1EQVNIIiwiSE1TLVAtQkxLLVJXIiwiTURDLUFQSS1PR1AtUlciLCJTVC1SLUEiLCJNREMtUC1QTlAtUiIsIkhNUy1QLVNSTS1SVyIsIk1EQy1BUEktQURNLVJXIiwiSE1TLVAtUktJVEQtUlciLCJNREMtQVBJLVJUUy1SIiwiTURDLVAtQVNNLVJXIiwiSE1TLVAtT1RJUkUtUlciLCJITVMtUC1WTkRELVJXIiwiSE1TLVAtT1RNLVJXIiwiSE1TLUFQSS1SRC1SIiwiSE1TLVAtT1RTU0UtUlciLCJITVMtUC1EUk0tUlciLCJITVMtUC1QUi1SVyIsIkhNUy1QLUNDTUJQQi1SVyIsIk1EQy1BUEktQ0RSLVIiLCJITVMtUC1PVElSLVJXIiwiSE1TLVAtVlZELVJXIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLVBSTC1SVyIsIkhNUy1QLUlCRS1SVyIsIkhNUy1QLVZJRS1SVyIsIk1EQy1BUEktUkRMLVJXIiwiTURDLUFQSS1MQk4tUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEyOCwxLDIsMyw0LDUsNiwxMzAsOSwxMCwxMzIsMTMzLDEzNCwxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyNiwyNywyOCwyOSwzMCwzMSwzMiwzMywzNCwzNSwzNiw0MCw0MSw0MiwxMzUsNDQsNDcsNDgsNDksNTAsNTEsNTIsNTMsNTQsNTUsNTcsNTgsNTksMTAzLDEwNCwxMDUsMTA2LDEwNywxMDgsMTA5LDExMSwxMTIsMTEzLDExNSwxMTYsMTE3LDExOCwxMjAsMTIxLDEyMiwxMjMsMTI2LDEyN10sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDIiLCJPTEVUMDAxIiwiT0xFVDAwNSJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4MjgxOTIxMSwiZXhwIjoxNzgyOTA2MjExfQ.GfcYdO-HjXs18AAIJ_4pxiGcBHbPm0lKPgOmF1_xPwzvlD45ryPcThUlSS2xhRq6o7mmAZ1dQ-NKVWp4QkYdzDpRBv35UBfINQqqPzwIfMAgYBNClAggQ-uZqlnPLfgZXikG7ZZzUgvrpdOGyYAC2ewqLvCDbh7MmodFLMp-ZAZlId0xvAYAJmnT6ybBnceb";
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
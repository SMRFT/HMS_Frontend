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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg2NyIsImVtYWlsIjoicGFydGhpYmFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6InBhcnRoaWJhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJITVMtQVBJLVJERC1SVyIsIlNISS1QLVRSQUlOLVJXIiwiSE1TLVAtUENELVJXIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLUJST09NLVJXIiwiSE1TLVAtV1ItUlciLCJHTC1QLVJTRS1SVyIsIkhNUy1QLVBJLVJXIiwiSE1TLVAtVkktUlciLCJITVMtUC1QRVItUlciLCJITVMtUC1PVE1ELVJXIiwiSE1TLVAtVlZFLVJXIiwiSE1TLVAtRE8tUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtSUJELVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLU1SQS1SVyIsIkhNUy1QLUNDRC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtU1VNLVJXIiwiSE1TLVAtVlYtUiIsIkhNUy1QLUNDR0FILVJXIiwiSE1TLVAtVklOQS1SVyIsIkhNUy1QLU9UU1NELVJXIiwiSE1TLVAtUlNIRlQtUlciLCJITVMtUC1PVE1CRS1SVyIsIkdMLVAtRUJULVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtRElTLVJXIiwiSE1TLVAtRERBU0giLCJITVMtUC1WTkQtUlciLCJITVMtUC1QQ09QUC1SVyIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLUdSTkEtUlciLCJITVMtUC1OUy1SVyIsIkhNUy1QLVBSQS1SVyIsIkdMLVAtRUQtUlciLCJITVMtUC1BQS1SVyIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtUC1DQ1NUU0QtUlciLCJITVMtUC1DTC1SVyIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLVAtQ0MtUlciLCJHTC1QLVAtUlciLCJITVMtQVBJLVJEQS1SVyIsIkhNUy1QLVNVTUQtUlciLCJITVMtUC1NUi1SVyIsIkdMLVAtRVAtUlciLCJHTC1QLUVBRC1SVyIsIkhNUy1QLU9UTS1SIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLVJTREQtUlciLCJITVMtUC1DQ0dNUEItUlciLCJITVMtUC1PVE1FLVJXIiwiSE1TLVAtREIiLCJTSEktUC1JTkMiLCJITVMtQVBJLUlULVJXIiwiSE1TLVAtVklELVJXIiwiSE1TLUFQSS1SRC1SVyIsIkhNUy1SLVYiLCJITVMtQVBJLVJERS1SVyIsIkhNUy1QLUlQSCIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLU9QSC1SVyIsIkhNUy1QLVZJTi1SIiwiSE1TLVAtVklORS1SVyIsIkhNUy1QLUNDT1BQQi1SVyIsIkhNUy1QLU9UU1MtUiIsIkhNUy1QLVJPUi1SVyIsIkhNUy1QLUxORC1SVyIsIkhNUy1QLUhNUyIsIkhNUy1QLVNBRE0tUlciLCJITVMtUC1BREFTSCIsIkhNUy1QLVZJLVIiLCJITVMtUC1DQ1BSUC1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVNVTUEtUlciLCJITVMtUC1PVE1CLVJXIiwiSE1TLVAtU0dSTi1SVyIsIkhNUy1QLUFNRS1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJITVMtUC1PVFNTQS1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1HQURNLVJXIiwiSE1TLVAtUFNHLVJXIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1TVEEtUlciLCJITVMtUC1ETEQtUlciLCJITVMtUC1QQy1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1PVFNTVS1SVyIsIkhNUy1QLVZWLVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtTVQtUlciLCJITVMtUC1SRU5RLVJXIiwiSE1TLVAtU1VNLVIiLCJITVMtUC1HUk4tUlciLCJITVMtUC1TVC1SVyIsIkhNUy1QLURSLVJXIiwiSE1TLVAtUk0tUlciLCJITVMtUC1BTUQtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1DQ0dBUy1SVyIsIlNISS1QLUVYUC1SVyIsIkhNUy1QLUNDQy1SVyIsIkdELVAtR1AiLCJITVMtUC1DVEktUlciLCJHTC1QLUFORC1SVyIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIkhNUy1QLUNDSVBBQi1SVyIsIkhNUy1QLUFNLVJXIiwiSE1TLVAtQU0tUiIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLVAtT1RTUy1SVyIsIkdQLVAtR0NOLVIiLCJHTC1QLU5EQy1SVyIsIkhNUy1QLUlDRC1SVyIsIkdMLVAtRUwtUlciLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtT1RNQkQtUlciLCJITVMtUC1QU0gtUlciLCJITVMtUC1WSU4tUlciLCJITVMtUC1STUQtUlciLCJITVMtQVBJLURBU0giLCJITVMtUC1CTEstUlciLCJTVC1SLUEiLCJITVMtUC1TUk0tUlciLCJITVMtUC1SS0lURC1SVyIsIkhNUy1QLUFTUi1SVyIsIkhNUy1QLVZOREQtUlciLCJITVMtUC1PVE0tUlciLCJITVMtQVBJLVJELVIiLCJITVMtUC1PVFNTRS1SVyIsIkhNUy1QLURSTS1SVyIsIkhNUy1QLVBSLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiSE1TLVAtVlZELVJXIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLVBSTC1SVyIsIkhNUy1QLUlCRS1SVyIsIkhNUy1QLVZJRS1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEyOCwxLDIsMyw0LDUsNiw3LDEzMCw5LDEwLDEzMiwxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyNiwyNywyOCwyOSwzMCwzMSwzMiwzMywzNCwzNSwzNiw0MCw0MSw0Miw0Myw0NCw0Nyw0OCw0OSw1MCw1MSw1Miw1Myw1NCw1NSw1Nyw1OCw1OSwxMDAsMTAxLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTExLDExMiwxMTMsMTE1LDExNiwxMTcsMTE4LDEyMCwxMjEsMTIyLDEyMywxMjQsMTI1LDEyNiwxMjcsMTMzLDEzNCwxMzUsMzcsMzgsMzldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDQiLCJPTEVUMDAyIiwiT0xFVDAwMSIsIk9MRVQwMDUiXSwiaXNzIjoiaHR0cHM6Ly9sYWIuc2hpbm92YS5pbi8iLCJpYXQiOjE3ODI1NDU0NjIsImV4cCI6MTc4MjYzMjQ2Mn0.HiB-oOdI7Z-STaZZTvgv7J92OO-XGI8d-dX81GoF4xwGSajYiQcr0CBhU8Qg8xldDeBPHS8sYQxIT_XFbsuXbZMLx11ZhxcoeCeZv62N5vBBgkC9i1sA6Xvs0uD0OpYI7bRJW5c1VrMyDLX0z3hXR6l-hnrAs-XT56GNI4wuakG6MmxLNCk89sPevW0u-nYI4PRGJBxsCGwqHvHIikq0z8M0aLKF8jxW9YEMPy4X8v2l4tskY1PSH72Dks-GRI673H_QHDRkfIByL98TZGDbjSLH2fScKBqIFmhiSea-R4zcLVLF9BojeqMfKI6aHIYQe5MTES5QGfKxD3ieuKtYOg";
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
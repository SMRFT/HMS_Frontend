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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtU1JNLVJXIiwiSE1TLVAtUFNILVJXIiwiSE1TLVAtT0NSLVJXIiwiSE1TLVAtUFJMLVJXIiwiSE1TLVAtR1BSLVJXIiwiSE1TLVAtTlNELVJXIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLVAtQ1RJQS1SVyIsIkhNUy1QLVJDQVQtUlciLCJITVMtUC1OUy1SVyIsIkhNUy1QLVJTSEZULVJXIiwiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLUlCRS1SVyIsIkhNUy1QLUhNUyIsIkhNUy1QLVJTREQtUlciLCJITVMtUC1QSUQtUlciLCJITVMtUC1ESVMtUlciLCJITVMtUC1WTkRELVJXIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1DQy1SVyIsIkhNUy1QLVBJLVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1QLUdBRE0tUlciLCJITVMtUC1BQS1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtQ0NELVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtTVQtUlciLCJITVMtUC1SS0lULVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtUEMtUlciLCJITVMtUC1QUkEtUlciLCJITVMtUC1JQi1SVyIsIkhNUy1QLUlCRC1SVyIsIkhNUy1QLUdQUkEtUlciLCJITVMtUC1TVC1SVyIsIkhNUy1QLU1SLVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtUk0tUlciLCJITVMtUC1SRU5RLVJXIiwiSE1TLVAtVk5ELVJXIiwiSE1TLVAtUFNHLVJXIiwiSE1TLVAtUk1ELVJXIiwiSE1TLVAtTVJMLVJXIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1QLVJDTE4tUlciLCJITVMtUC1QQ0QtUlciLCJITVMtUC1PUy1SVyIsIkhNUy1QLVNBRE0tUlciLCJITVMtUC1NUkEtUlciLCJITVMtUC1SQ0FURC1SVyIsIkhNUy1QLVBPLVJXIiwiSE1TLVAtUElOLVJXIiwiSE1TLVAtQkxLLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUFETUQtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsyLDU1LDMsNSwxMCwxMSwxNSw1OCw1OSwxNCwxMjIsMTYsMTcsMTIwLDEyMSwxMzMsMTM0LDEzNSwxMDIsMTEzLDExNCwxMzYsMjAsMjEsMjYsNTAsMjcsNTIsNTEsMjgsMjksMzEsMzAsNDQsMTU1LDMzLDQ5LDEyNywxMjgsMTcyXSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4ODI0NTY5MSwiZXhwIjoxNzg4MzMyNjkxfQ.X1sK4N5L2Tyj0l6ApzhUbEgAUvWs3zTvjgcKvbxXXIzcG0jMLQPa8RCiI9yc-d9jbYj5kG7ZLp4-A8E2XOBJ_esxGFROYXFpx09u2Qp1N7Txcpwe5k7qMcmPJODQjWi1_Gn8iDEVrYRxfDKjqITC538ZVPLSNCoUUQO8JkaehbJ5j6c13KiwbWRT3B3qFNDysTY0Zw0pk7AEoDmMrh_5-4BKiJTkJ3WADJrcCq7ZylyCsARjPL_Ag3eXZaVlNdFN3fXKWz_Mo9ySmZCyq3XcmXwsvP9V_nNfBm4WzdJRA8NLlXfGE0tRiiCvUwvXZl2-wdK379UF1JjnScfX5IFYsg";
  console.log("🔧 Development token is empty - will redirect to login");
  if (dev_token && dev_token.trim() !== "") {
    const selectedBranch = "SHB001";
    localStorage.setItem("selected_branch", selectedBranch);
    const selectedOutlet = "OLET002";
    localStorage.setItem("selected_outlet", selectedOutlet);
  }
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

// --- List of public routes that don't require login token ---
const PUBLIC_ROUTES = [
  "/MobileRegistration",
  "/InPatientFeedbackForm",
  "/OutPatientfeedForm",
  "/outpatientfeedform",
  "/OutPatientFeedbackForm",
  "/outpatientfeedbackform",
  "/InpatientQRScan",
  "/inpatientqrscan",
  "/OutPatientQRScan",
  "/outpatientqrscan",
  "/QRScan",
  "/qrscan",
];

function isPublicRoute() {
  const currentPath = window.location.pathname.toLowerCase().replace(/\/$/, "");
  const hash = window.location.hash.toLowerCase();

  return PUBLIC_ROUTES.some((route) => {
    const r = route.toLowerCase();
    return (
      currentPath === r ||
      currentPath.endsWith(r) ||
      hash.includes(r)
    );
  });
}



// --- Main execution ---
(function main() {
  const isPublic = isPublicRoute();

  try {
    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");

    // If no token found and not a public route, try development token
    if (!accessToken && !isPublic) {
      console.log(
        "❌ No token found in localStorage, trying development token",
      );
      accessToken = setforlocaldev();
    }

    // If still no token (development token is empty) and not a public route, redirect to login
    if ((!accessToken || accessToken.trim() === "") && !isPublic) {
      redirectToLogin();
      return; // Stop execution here
    }

    // If token exists, validate it
    if (accessToken && accessToken.trim() !== "") {
      try {
        const userPayload = validate(accessToken);

        localStorage.setItem("access_token", accessToken);

        const employeeId = userPayload.aud; // Using 'aud' field as ID
        const name = userPayload.name;
        const userEmail = userPayload.email;
        const userRole = getUserRole(userPayload["allowed-actions"]);

        if (employeeId && name) {
          localStorage.setItem("user_payload", JSON.stringify(userPayload));
          localStorage.setItem("employeeId", employeeId);
          localStorage.setItem("name", name);
          localStorage.setItem("userEmail", userEmail);
          localStorage.setItem(
            "allowed-outlets",
            userPayload["allowed-outlets"],
          );
          localStorage.setItem(
            "hms_pages",
            JSON.stringify(userPayload["hms_pages"] || []),
          );
          localStorage.setItem("role", userRole);
          localStorage.setItem(
            "allowedActions",
            JSON.stringify(userPayload["allowed-actions"] || []),
          );
        }
      } catch (tokenErr) {
        console.error("❌ Token validation failed:", tokenErr.message);
        if (!isPublic) {
          redirectToLogin();
          return;
        }
      }
    }

    // Render app
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    reportWebVitals();
  } catch (error) {
    console.error("❌ Token validation / main execution failed:", error.message);
    if (!isPublic) {
      redirectToLogin();
    }
  }
})();
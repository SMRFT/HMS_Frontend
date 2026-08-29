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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtSE1TUFMiLCJITVMtUC1EQiIsIkhNUy1QLVNSTS1SVyIsIkhNUy1QLVBTSC1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLVBSTC1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1QLUdSTlItUlciLCJITVMtUC1JQkUtUlciLCJITVMtUC1ITVMiLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtRElTLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLUJST09NLVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtQ0MtUlciLCJITVMtUC1QSS1SVyIsIkdQLVAtR0NOLVIiLCJITVMtUC1HQURNLVJXIiwiSE1TLVAtQUEtUlciLCJITVMtUC1SS0lURC1SVyIsIkhNUy1QLUNDRC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtQURNTC1SVyIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLU1ULVJXIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLUdSTi1SVyIsIkhNUy1QLVBDLVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLVAtSUItUlciLCJITVMtUC1JQkQtUlciLCJITVMtUC1HUFJBLVJXIiwiSE1TLVAtU1QtUlciLCJITVMtUC1NUi1SVyIsIkhNUy1QLVNUQS1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLVJNRC1SVyIsIkhNUy1QLU1STC1SVyIsIkhNUy1QLUJMS0QtUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1SQ0xOLVJXIiwiSE1TLVAtUENELVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1TQURNLVJXIiwiSE1TLUFQSS1WTSIsIkhNUy1QLU1SQS1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtUE8tUlciLCJITVMtUC1QT0wtUiIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLUhNU1BTLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLUFETUQtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxMjgsMiw1LDEzNCwxMzUsMTM2LDEwLDE0LDE1LDE2LDI2LDI3LDI4LDI5LDMwLDQ0LDUwLDUxLDUyLDU1LDU4LDU5LDExNCwxMjEsMTIyLDEyNywyMF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg3OTgxMDA5LCJleHAiOjE3ODgwNjgwMDl9.XrE2cpAQvE3Q991UWZodx7r7S_8DxV8dIQGicCLwUsBVfO9ZAm_L2wZ1igw2VGASWwnG03KrxvaZTIdvrT1-ZG-DNRUxhv22QlTOrzgAVAkAoGgjrlaXLzjun3WtEXIAQ9xgBQYNNgBclrw8JRE3zZxB3ACdsWIZ1C90BEnpYd5bkPCzbQ__HZ6xCHSpXAXDKPpr0C-ECIiQzCoUFg83ZnU9l0dAzMj0tjNGaZxEh-_JOGf0ucI5jlYZEnzLdkeNos7azpxeYkrjGOpTjPTzOogl4rxxfwAoKfu72FSu4quD4neBTjDQUq7CHqYc-8n0dSbwLDFO1o0o_u28CmBMKA";
  console.log("🔧 Development token is empty - will redirect to login");
  if (dev_token && dev_token.trim() !== "") {
    const selectedBranch = "SHB001";
    localStorage.setItem("selected_branch", selectedBranch);
    const selectedOutlet = "OLET005";
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
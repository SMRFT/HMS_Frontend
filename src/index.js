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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUNTTE0tUlciLCJITVMtUC1DQ0NSQi1SVyIsIlNELUFQSS1URC1SIiwiSE1TLVAtQ0VCLVJXIiwiSE1TLVAtU1VNRC1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1TUkJELVJXIiwiU0QtUC1ERi1SVyIsIkhNUy1QLU5TLVJXIiwiU0QtUC1MQkwtUlciLCJITVMtUC1XUlEtUlciLCJITVMtUC1BQS1SVyIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLU1IUENLLVJXIiwiU0QtUC1NSVMtUiIsIlNELVAtQ0hDLVJXIiwiSE1TLVAtUFNCLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiU0QtUC1NQlBELVIiLCJITVMtUC1TVEEtUlciLCJITVMtUC1PUFBCLVIiLCJITVMtUC1DU0xELVJXIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLURMRC1SVyIsIkhNUy1QLVBHUEJULVIiLCJITVMtUC1HTEJULVIiLCJITVMtUC1QR1NSRC1SVyIsIlNELUFQSS1SQi1SIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtUC1DT1BQLVJXIiwiU0QtUC1CRy1SIiwiSE1TLVAtUEhWU0ItUlciLCJTRC1QLVRTLVJXIiwiSE1TLVAtUENDU0RfUlciLCJITVMtUC1DQ0dNUEItUlciLCJITVMtUC1EQiIsIkhNUy1QLVBDQl9SVyIsIkhNUy1QLVBPUFNSLVJXIiwiSE1TLVAtR1dMLVIiLCJITVMtUC1QREItUlciLCJTRC1BUEktVFYtUiIsIkhNUy1QLVBTT1BCLVJXIiwiSE1TLVAtQ0REUy1SVyIsIkhNUy1QLUNDR0FILVIiLCJITVMtUC1QU0lQLVJXIiwiSE1TLVAtQ1NMUi1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiU0QtUC1TUy1SVyIsIkhNUy1QLUFETS1SVyIsIkhNUy1QLURCVURSLVIiLCJITVMtUC1QR0VCLVIiLCJITVMtUC1QU00tUlciLCJITVMtUC1EUk0tUiIsIkhNUy1QLU1IQ0QtUlciLCJITVMtUC1JQi1SIiwiSE1TLVAtQ0NHU1JEX1JXIiwiU0QtQVBJLU1CVEQtUlciLCJITVMtUC1QSVBBLVJXIiwiSE1TLVAtUEFTLVJXIiwiSE1TLVAtQ0NHQUgtUlciLCJITVMtUC1DQ1NQU0QtUlciLCJITVMtUC1DQ0dQQi1SVyIsIkhNUy1QLVNSR1BELVJXIiwiSE1TLVAtTEJSSS1SVyIsIkhNUy1QLUNDVVBCLVJXIiwiSE1TLVAtUE9QUERCLVJXIiwiSE1TLVAtUE9QVUFTLVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1JUEgiLCJITVMtUC1QQ0ItUlciLCJTRC1QLVNTVS1SVyIsIkhNUy1QLUhTTi1SVyIsIkhNUy1QLUNDR1JQLVJXIiwiSE1TLVAtUEdMQlUtUlciLCJTRC1QLVBMLVIiLCJITVMtQVBJLURMRC1SVyIsIkhNUy1QLUNTSUwtUlciLCJHUC1QLUdDTi1SIiwiSE1TLVAtQ0NQUlAtUlciLCJITVMtUC1QR0xCVS1SIiwiSE1TLVAtUFNSQkQtUlciLCJTRC1BUEktQ04tUiIsIkhNUy1QLUNTLVJXIiwiSE1TLVAtQ0NHUkItUlciLCJITVMtUC1HT1BTLVIiLCJTRC1QLU1CVFYtUiIsIkhNUy1QLUdQQlQtUiIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLVNVTS1SVyIsIlNELVItRE9DIiwiSE1TLVAtU09QQi1SVyIsIkhNUy1SLVBIIiwiSE1TLVAtUEdFQi1SVyIsIkhNUy1QLVNVTS1SIiwiSE1TLVAtTUhDUi1SVyIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1QT1BTUkJELVJXIiwiSE1TLVAtUFBELVIiLCJITVMtUC1HT1BCTi1SIiwiSE1TLVAtTlNELVJXIiwiSE1TLVAtU1VNQS1SVyIsIkhNUy1QLUNDR0FTLVJXIiwiU0QtUC1QRC1SIiwiSE1TLVAtSE1TIiwiSE1TLVAtR0FFLVIiLCJITVMtUC1QR1MtUlciLCJITVMtUC1DQ08tUlciLCJITVMtUC1MQkRJLVJXIiwiSE1TLVAtT1BTUkJELVJXIiwiSE1TLVAtQ0NJUEFCLVJXIiwiSE1TLVAtU09QRS1SVyIsIkhNUy1QLUFETUwtUlciLCJTRC1QLVBPVi1SVyIsIkhNUy1QLUdMQlUtUiIsIlNELUFQSS1UTS1SVyIsIkhNUy1QLVBGQi1SVyIsIkhNUy1QLVJDQVQtUiIsIkhNUy1QLVNULVJXIiwiSE1TLVAtTUhQU0QtUlciLCJITVMtUC1WTC1SVyIsIlNELUFQSS1NSVMtUlciLCJITVMtUC1PUEgiLCJTRC1QLUdQRC1SIiwiSE1TLVAtQ0NPUFBCLVJXIiwiSE1TLVAtUFBELVJXIiwiU0QtUC1NQkRGLVJXIiwiSE1TLVAtUEdBUy1SIiwiU0QtUC1CVEQtUlciLCJITVMtUC1CTEstUiIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLVBERFMtUlciLCJTRC1QLUxDQy1SVyIsIkhNUy1QLVBNQy1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEyOCwxMjksMyw1LDEwLDE4LDE5LDE0NiwxNDcsMTQ4LDE0OSwyOCwxNjAsMTYxLDE2MiwxNjMsNDMsNDQsNDUsNTAsNTUsMTAxLDEwMiwxMTMsMTE0LDEyNywxNjVdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg3NzE3MDQxLCJleHAiOjE3ODc4MDQwNDF9.KqHEf4djI0vGTzDKy2afC0Fn7fOQBiF9KJ755y9V6q2JO4Vf2O-YRVRhNrYdbWf7wHEtDU0xdbllNmp9doo-5_QOtc7XdSpizVha1UEuDuOP9fXhw3kY_8Jn-RIP-elSuUReEJMX6nY50MMmEh2cov15yfAels1-2sXUu8xK9o3D2ASUrtdmKgwv7nIMAgzJ9_hm6WClnqJygqvX-AOMMbFZAxQI8jbpKyo5LwQSPNIgcVVHp8XCCWtgMErDpGxIEbkwdfByeKUi30vqPKQiRLcQtGLdWOwj4RUznSwKSCz79KDa8GMLoqY1OWQXM-owbR89gyPuclHcVlkfgGhvyw";
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
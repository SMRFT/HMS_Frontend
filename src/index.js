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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUNTTE0tUlciLCJITVMtUC1DQ0NSQi1SVyIsIkhNUy1QLUNFQi1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1TUkJELVJXIiwiSE1TLVAtV1JRLVJXIiwiSE1TLVAtT1BFTVJHRC1SVyIsIkhNUy1QLUNUSS1SVyIsIkhNUy1QLU1IUENLLVJXIiwiSE1TLVAtUFNCLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiSE1TLVAtT1BFTVJEQy1SVyIsIkhNUy1QLU9QUEItUiIsIkhNUy1QLUNTTEQtUlciLCJITVMtUC1BSU4tUlciLCJITVMtUC1ETEQtUlciLCJITVMtUC1QR1BCVC1SIiwiSE1TLVAtR0xCVC1SIiwiSE1TLVAtUEdTUkQtUlciLCJITVMtUC1QR1BCVC1SVyIsIkhNUy1QLUNPUFAtUlciLCJITVMtUC1QSFZTQi1SVyIsIkhNUy1QLVBDQ1NEX1JXIiwiSE1TLVAtT1BFTVJHTS1SVyIsIkhNUy1QLUNDR01QQi1SVyIsIkhNUy1QLVBDQl9SVyIsIkhNUy1QLVBPUFNSLVJXIiwiSE1TLVAtR1dMLVIiLCJITVMtUC1QREItUlciLCJITVMtUC1QU09QQi1SVyIsIkhNUy1QLVBTSVAtUlciLCJITVMtUC1DQ0dBSC1SIiwiSE1TLVAtQ1NMUi1SVyIsIkhNUy1QLVBDT1BQLVJXIiwiSE1TLVAtQURNLVJXIiwiSE1TLVAtUEdFQi1SIiwiSE1TLVAtUFNNLVJXIiwiSE1TLVAtRFJNLVIiLCJITVMtUC1NSENELVJXIiwiSE1TLVAtSUItUiIsIkhNUy1QLUNDR1NSRF9SVyIsIkhNUy1QLVBJUEEtUlciLCJITVMtUC1QQVMtUlciLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLUNDU1BTRC1SVyIsIkhNUy1QLUNDR1BCLVJXIiwiSE1TLVAtU1JHUEQtUlciLCJITVMtUC1MQlJJLVJXIiwiSE1TLVAtQ0NVUEItUlciLCJITVMtUC1QT1BQREItUlciLCJITVMtUC1QT1BVQVMtUlciLCJITVMtUC1NSENFLVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtUENCLVJXIiwiSE1TLVAtT1BFTVJHUy1SVyIsIkhNUy1QLU1IQ0EtUlciLCJITVMtUC1IU04tUlciLCJITVMtUC1DQ0dSUC1SVyIsIkhNUy1QLU9QRU1SR1AtUlciLCJITVMtUC1NSENTLVJXIiwiSE1TLVAtUEdMQlUtUlciLCJITVMtQVBJLURMRC1SVyIsIkhNUy1QLUNTSUwtUlciLCJHUC1QLUdDTi1SIiwiSE1TLVAtQ0NQUlAtUlciLCJITVMtUC1QR0xCVS1SIiwiSE1TLVAtUFNSQkQtUlciLCJITVMtUC1DUy1SVyIsIkhNUy1QLUNDR1JCLVJXIiwiSE1TLVAtT1BFTVJWRS1SVyIsIkhNUy1QLUdPUFMtUiIsIkhNUy1QLUdQQlQtUiIsIkhNUy1QLVNPUEItUlciLCJITVMtUi1QSCIsIkhNUy1QLVBHRUItUlciLCJITVMtUC1NSENSLVJXIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLVBPUFNSQkQtUlciLCJITVMtUC1QUEQtUiIsIkhNUy1QLUdPUEJOLVIiLCJITVMtUC1DQ0dBUy1SVyIsIkhNUy1QLUNDQy1SVyIsIkhNUy1QLUhNUyIsIkhNUy1QLUdBRS1SIiwiSE1TLVAtUEdTLVJXIiwiSE1TLVAtQ0NPLVJXIiwiSE1TLVAtTEJESS1SVyIsIkhNUy1QLU9QU1JCRC1SVyIsIkhNUy1QLUNDSVBBQi1SVyIsIkhNUy1QLVNPUEUtUlciLCJITVMtUC1EUk0tUlciLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtQlQtUlciLCJITVMtUC1NSEMtUiIsIkhNUy1QLUdMQlUtUiIsIkhNUy1QLVBGQi1SVyIsIkhNUy1QLVJDQVQtUiIsIkhNUy1QLU1IUFNELVJXIiwiSE1TLVAtVkwtUlciLCJITVMtUC1PUEgiLCJITVMtUC1DQ09QUEItUlciLCJITVMtUC1NSEMtUlciLCJITVMtUC1QUEQtUlciLCJITVMtUC1QR0FTLVIiLCJITVMtUC1CTEstUiIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLVBNQy1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEsNSwxMCwxOCwxOSw0MywxMDEsMTI3LDEyOCwxMjksMTQ2LDE0NywxNDgsMTQ5LDE1OSwxNjAsMTYxLDE2MiwxNjMsMTY1LDE2NiwxNjldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzg4MzQ4MDM3LCJleHAiOjE3ODg0MzUwMzd9.AqTr9PbjuXH1P4pcTfxqNIstp_3U7qLTYwZ6VIv_UaD8EMAk6TVn8fvtPptHPzU16W37Vq8HRakzcWpCbCKOpmDUAvmPqDbDFQcHtqvaaZ5rL1arx4KrHXOGs0I6pGHmxU7k8_QQ9eewygPeLtwZZGZFjRAJnpXMqP47Cs4J3NAjbsFdJ1pb7P_Tf8VAqfKhr50q5Kf89AKkhVfShjjfwPXaWJVoOcriJTCfc5F01Qp7AiTdNqknAxtTsMe4U6joAkte6hvdLGkL5kWmF8WsKGepw502sYr8ss2_FZXB-nrt805tHTkbuebmhp0MLQ38fpGb_RkCyDzBbKnaHP1Vlw";
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

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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJITVMiLCJlbWFpbCI6IiIsIm5hbWUiOiJITVMgKEFsbCBQZXJtaXNzaW9ucykiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtQUlOLVJXIiwiSE1TLVAtU1VNLVIiLCJITVMtUC1DQy1SVyIsIkhNUy1QLVBNQy1SVyIsIkhNUy1BUEktSUNULVJXIiwiSE1TLVItQSIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1BU1ItUlciLCJITVMtUC1TRFAtUlciLCJITVMtUC1QQ0QtUlciLCJITVMtQVBJLUlYUkFZLVJXIiwiSE1TLVAtUFNNLVJXIiwiSE1TLVAtREJVRFItUiIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1BUEktREFTSCIsIkhNUy1BUEktU1VNLVIiLCJITVMtUC1PUy1SVyIsIkhNUy1QLURCLVJXIiwiSE1TLVAtUE9BLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1BUEktSVQiLCJITVMtUC1EUi1SVyIsIkhNUy1QLUJMS0QtUlciLCJITVMtQVBJLUlULVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLUFQSS1EUk0tUlciLCJITVMtUC1TVC1SVyIsIkhNUy1QLUlCLVIiLCJITVMtUC1JUERCLVJXIiwiSE1TLVAtQ1RJQS1SVyIsIkhNUy1QLVBQRC1SVyIsIkhNUy1QLUREQVNIIiwiSE1TLVAtSFZDQy1SIiwiSE1TLUFQSS1JQi1SVyIsIkhNUy1BUEktU1VNLVJXIiwiSE1TLVAtTVQtUlciLCJITVMtUC1STS1SVyIsIkhNUy1QLVJDQVQtUlciLCJITVMtUC1TR1JOLVJXIiwiSE1TLVAtQUEtUlciLCJITVMtUC1QR0xCVS1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtVk5ELVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLUFQSS1FTUwtUlciLCJITVMtUC1DU0xELVJXIiwiSE1TLVAtUFJMLVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtTVJBLVJXIiwiSE1TLVAtUk9SLVJXIiwiSE1TLVAtT1BIIiwiSE1TLVAtRFJNLVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1QLVJTREQtUlciLCJITVMtUC1JQkQtUlciLCJITVMtUC1QU0gtUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtQVBJLVVISUQtUiIsIkhNUy1QLVBIVlNCLVJXIiwiSE1TLVAtSFZDQy1SVyIsIkhNUy1QLVBSLVJXIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLVBBUy1SVyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJITVMtUC1JQi1SVyIsIkhNUy1BUEktSVVTRy1SIiwiSE1TLVAtSUJFLVJXIiwiSE1TLVAtR1BSQS1SVyIsIkhNUy1QLVBTQi1SVyIsIkhNUy1QLVBGQi1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1BUEktU0FNVC1SVyIsIkhNUy1QLU5TLVJXIiwiSE1TLUFQSS1JVVNHLVJXIiwiSE1TLUFQSS1JWFJBWS1SIiwiSE1TLVAtQlJPT00tUlciLCJITVMtQVBJLURMRC1SVyIsIkhNUy1QLVNSTS1SVyIsIkhNUy1QLVNEVUktUlciLCJITVMtUC1QSS1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLUdSTi1SVyIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLVJTSEZULVJXIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtUC1TR1JOIiwiSE1TLVAtQ1NMTS1SVyIsIkhNUy1QLUNTTFItUlciLCJITVMtUC1QR1MtUlciLCJITVMtUC1BREFTSCIsIkhNUy1BUEktU1JNLVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLVNVTUEtUlciLCJITVMtUC1JQ0QtUlciLCJITVMtUC1HUk5SLVJXIiwiSE1TLUFQSS1JQ1QtUiIsIkhNUy1QLVBFUi1SVyIsIkhNUy1QLVNVTS1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLUFQSS1JQi1SIiwiSE1TLVAtUE9MLVJXIiwiSE1TLVAtR1BSLVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLUFQSS1TSU5URU5ULVJXIiwiSE1TLVAtUFNJUC1SVyIsIkhNUy1QLVNHTEEtUlciLCJITVMtQVBJLUlNUkktUiIsIkhNUy1QLURJUy1SVyIsIkhNUy1QLUlQSCIsIkhNUy1BUEktRFJNLVIiLCJITVMtUC1ITVMiLCJITVMtUC1XUi1SVyIsIkhNUy1QLU1SLVJXIiwiSE1TLUFQSS1TQU0tUlciLCJITVMtUC1DQ0QtUlciLCJITVMtUC1TVU1ELVJXIiwiSE1TLVAtUE8tUlciLCJITVMtUC1QR0VCLVJXIiwiSE1TLVAtR0FETS1SVyIsIkhNUy1QLUNMLVJXIiwiSE1TLVAtUk1ELVJXIiwiSE1TLVAtUERCLVJXIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLVJCSUxMIiwiSE1TLVAtU0FETS1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1NUkwtUlciLCJITVMtQVBJLUlNUkktUlciLCJITVMtUC1SQ0xOLVJXIiwiSE1TLVAtSVBFTVItUlciLCJITVMtUC1QQ0JfUlciLCJITVMtUC1HUk5BLVJXIiwiSE1TLVAtQ1NJTC1SVyIsIkhNUy1QLVBDLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMSwyLDU1LDMsNCwxMTIsMTQ1LDE3Miw2LDcsOCw5LDUsMTUsNTgsNTksMTQsMTIyLDEyMywxNiwxNywxMjAsMTIxLDEzMywxMzQsMTM1LDEwMiwxMTMsMTE0LDEzNiwxMzcsMTM4LDExNSwxMTYsMTE3LDExOCwxOCwxOSwyMCwyMSwyNiw1MCwyNyw1Miw1MSwyOCwyOSwzMSwxMzAsMzAsNDQsMTUyLDE3MCwxNzEsMTkwLDMyLDE1NSwzMywzNCwzNiwzNSwxNjcsMTkzLDM3LDM4LDM5LDE1NiwxNTcsMTU4LDE3MywxODgsMTg5LDQ1LDEwMCwxMTAsMTI0LDEyNSw0OSwxMTEsMTk2LDE5NywxMjcsMTI4LDEyOSwxNDQsMTQ2LDE0NywxOTIsMTUzLDE1NCwxOTRdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDQiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc5MjQ2NjEzMiwiZXhwIjoxNzkyNTUzMTMyfQ.MMHlU4UA8IpdvenVsVUJiyB2Q5g01DCzrwdJJTm3YzrtE8n-I0FYt05RzyUxjKLQqPAr0gRZ7BUXF2MIFuhcez-W6PS8LhVXZ3j3ONQF7s_PkDMYPv4LQPO3_9NsCuPY1opmPrhNq0cN7F2a-07bdqHKtJPFgwXY7T000fGS6iswHrRqOYwXxko4gKSlNPp7ZthVGgnt1xILXQjoLz1WBkz0UVY1-8BFmjza_mCgv7zFKhzI0w6iKMBCyLT9qbS8injWcg-0C1hDALCTIZSyElJgDV6xsjxXmODmiVAtSsAuWeYf1DKj47SqpH2n2cZeSWRes1szpc5xPoIdg-Dciw";
  if (dev_token && dev_token.trim() !== "") {
    const selectedBranch = "SHB001";
    localStorage.setItem("selected_branch", selectedBranch);
    const selectedOutlet = "OLET002";
    localStorage.setItem("selected_outlet", selectedOutlet);
    const selectedHospital = "SH001";
    localStorage.setItem("selected_hospital", selectedHospital);
    localStorage.setItem("hospital_code", selectedHospital);
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
    // If development token is provided, prioritize it for local development
    const devToken = setforlocaldev();
    let accessToken = (devToken && devToken.trim() !== "") ? devToken : localStorage.getItem("access_token");

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
          const hospitalCode = userPayload.hospital_code || "SH001";
          localStorage.setItem("hospital_code", hospitalCode);
          localStorage.setItem("selected_hospital", hospitalCode);
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
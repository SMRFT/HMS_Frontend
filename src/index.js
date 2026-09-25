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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtU1JNLVJXIiwiSE1TLVAtUFNILVJXIiwiSE1TLVAtT0NSLVJXIiwiSE1TLVAtUFJMLVJXIiwiSE1TLVAtR1BSLVJXIiwiR0wtUC1FTC1SVyIsIkhNUy1QLU5TRC1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1QLUdSTlItUlciLCJITVMtUC1JQkUtUlciLCJITVMtUC1ITVMiLCJITVMtUC1SU0RELVJXIiwiSE1TLVAtUElELVJXIiwiSE1TLVAtRElTLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLUJST09NLVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtQ0MtUlciLCJTSEktUC1FWFAtUlciLCJITVMtUC1QSS1SVyIsIkdQLVAtR0NOLVIiLCJITVMtUC1HQURNLVJXIiwiR0wtUC1FQlQtUlciLCJITVMtUC1BQS1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtQ0NELVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1BRE1MLVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtTVQtUlciLCJITVMtUC1SS0lULVJXIiwiR0wtUC1SU0UtUlciLCJITVMtUC1HUk4tUlciLCJITVMtUC1QQy1SVyIsIkdMLVAtRUFELVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLVAtSUItUlciLCJTSEktUC1JTkMiLCJITVMtUC1HUFJBLVJXIiwiSE1TLVAtU1QtUlciLCJITVMtUC1JQkQtUlciLCJITVMtUC1NUi1SVyIsIkhNUy1QLVNUQS1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLVZORC1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLVJNRC1SVyIsIkhNUy1QLU1STC1SVyIsIkdMLVAtRUQtUlciLCJHTC1QLUFORC1SVyIsIlNISS1QLVRSQUlOLVJXIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1QLVJDTE4tUlciLCJHTC1QLVAtUlciLCJHTC1QLUVQLVJXIiwiSE1TLVAtUENELVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1TQURNLVJXIiwiSE1TLVAtTVJBLVJXIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1QTy1SVyIsIkhNUy1QLVBJTi1SVyIsIkhNUy1QLUJMSy1SVyIsIkdMLVAtTkRDLVJXIiwiSFItUi1IT0QiLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtQURNRC1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzIsNTUsMyw1LDEwLDExLDE1LDU4LDU5LDE0LDEyMiwxNiwxNywxMjAsMTIxLDEzMywxMzQsMTM1LDEwMiwxMTMsMTE0LDEzNiwyMCwyMSwyNiw1MCwyNyw1Miw1MSwyOCwyOSwzMSwzMCw0NCwxNTUsMzMsNDksMTI3LDEyOCwxNzJdLCJhbGxvd2VkLW91dGxldHMiOltdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc5MDEzNzcxNSwiZXhwIjoxNzkwMjI0NzE1fQ.aJOYaOW6fIKvL727ARY5l9zs7zg2XBFSxkJtLO87IHoNKaDrw7WT2YkpckwzG_m-fmLSbOp5AbW_wonV_wNc6AeedwQ9N8-u2CeI-uJxoW_-a0W8Y9_vQcpMBSeqYZ_ZVG8L_-zMS6jwm8rYSTvR2pnZSNmdeDV_mvpkFWsLo2m_5Tjze-3wRboeMWt49qQuUZ8U5OUsyWjSCb94f0LVk5no98g6nPAkfO7FNPnnvcU6EKe4BIde4GkSawt9BKbkCNEl_Yx3G_i23YdSJfoOuLVYdgJh_d9YtQ_v5m9aXZ6D8fPnCzeTCYltoNhKdu1UyP2iJtG9CqdSrZULFXZ61A";
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

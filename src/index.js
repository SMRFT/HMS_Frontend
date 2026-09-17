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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJITVMtUC1QUkwtUlciLCJITVMtQVBJLUFNUi1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLVAtU1VNRC1SVyIsIkhNUy1QLVNHUk4tUlciLCJITVMtUC1QSUQtUlciLCJITVMtUC1WTkRELVJXIiwiTURDLVAtT1NCLVJXIiwiSE1TLVAtQVNSLVJXIiwiSE1TLVAtT1BFTVJHRC1SVyIsIkhNUy1BUEktUEFDSy1SIiwiTURDLUFQSS1USFItUiIsIkhNUy1QLU1ULVJXIiwiSE1TLVAtU1RBLVJXIiwiTURDLUFQSS1SREwtUlciLCJITVMtUC1PUEVNUkRDLVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtUkJJTEwiLCJITVMtUC1BSU4tUlciLCJITVMtUC1TVU1FLVJXIiwiTURDLVAtUE5QLVJXIiwiSE1TLUFQSS1JVC1SVyIsIkhNUy1QLU9QRU1SR00tUlciLCJNREMtUC1DQS1SVyIsIkhNUy1QLVBTSC1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1BUEktRExELVIiLCJITVMtQVBJLUFJQS1SVyIsIkhNUy1QLVNEVUktUlciLCJITVMtUC1QSS1SVyIsIk1EQy1QLVJFRy1SIiwiTURDLVAtVFJCLVJXIiwiTURDLUFQSS1QQVQiLCJITVMtUC1HUk4tUlciLCJITVMtUC1JUEVNUi1SVyIsIkhNUy1QLUlCLVIiLCJITVMtUC1HUFJBLVJXIiwiTURDLVAtQUQtUlciLCJNREMtUC1SRUctUlciLCJITVMtUC1CVEQtUlciLCJNREMtUC1SREUtUlciLCJITVMtUC1CVEUtUlciLCJITVMtUC1PUy1SVyIsIkhNUy1QLU9QRU1SR1MtUlciLCJITVMtUC1BRE1ELVJXIiwiSE1TLVAtT0NSLVJXIiwiSE1TLVAtT1BFTVJHUC1SVyIsIkhNUy1BUEktU1JNLVJXIiwiSE1TLVAtSUJFLVJXIiwiTURDLVAtU09SLVIiLCJITVMtQVBJLVNJTlRFTlQtUlciLCJHUC1QLUdDTi1SIiwiTURDLUFQSS1MQk4tUiIsIkhNUy1QLU9QRU1SVkUtUlciLCJITVMtUC1JQkQtUlciLCJITVMtUC1TR0xBLVJXIiwiSE1TLVAtQlQtUiIsIk1EQy1BUEktUEFULVIiLCJITVMtUC1TR1JOIiwiSE1TLVAtUFNHLVJXIiwiTURDLVAtUFRFLVJXIiwiSE1TLVAtU1VNLVJXIiwiSE1TLUFQSS1TQU1ULVJXIiwiTURDLVAtQVNNLVJXIiwiSE1TLVAtUE8tUlciLCJITVMtUC1TVU0tUiIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1TUk0tUlciLCJNREMtUC1VQVMtUlciLCJITVMtUC1PUEVNUkQtUlciLCJITVMtUC1TVU1BLVJXIiwiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLUNDQy1SVyIsIkhNUy1QLUhNUyIsIkhNUy1BUEktREFTSCIsIkhNUy1QLURSTS1SVyIsIk1EQy1BUEktQVQtUlciLCJITVMtUC1BRE1MLVJXIiwiTURDLVAtR0FULVJXIiwiTURDLVItUkVDIiwiTURDLUFQSS1BVC1SIiwiSE1TLUFQSS1FTUwtUlciLCJITVMtUC1CVC1SVyIsIkhNUy1BUEktU0FNLVJXIiwiTURDLUFQSS1SVFMtUiIsIkhNUy1QLUlCLVJXIiwiTURDLVAtR0FELVJXIiwiSE1TLVAtU1QtUlciLCJNREMtUC1EUy1SVyIsIkhNUy1QLVZORC1SVyIsIk1EQy1BUEktQ0RSLVIiLCJITVMtQVBJLVNJTlRFTlRBLVJXIiwiSE1TLVAtR1JOQS1SVyIsIkhNUy1QLU9QRU1SREMiLCJNREMtQVBJLUdBUy1SIiwiSE1TLVAtUEVSLVJXIiwiTURDLVAtRUYtUlciLCJNREMtUC1DREUtUlciLCJNREMtUC1HRFRTLVJXIiwiSE1TLUFQSS1BTUEtUlciLCJNREMtUC1QTlAtUiIsIkhNUy1BUEktSVQiLCJITVMtUC1QUi1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzEsMiwzLDQsMTEyLDE3Miw2LDgsNSwxMCwxMywxNSwxNCwxMjIsMTYsMTcsMTMzLDEzNSwxMDIsMTEzLDExNCwxMzYsMTE1LDExNiwxMTcsMTE4LDIwLDIxLDE3MCwxNzEsMTkwLDMyLDE1NSwxOTIsMzMsMzQsMzYsMzUsMTUzLDE1NCwxNjcsMTkzLDE5NCwzNywzOCwzOSwxNTYsMTU3LDE1OCwxMDEsMTczLDE4OCwxODksMTEwLDE2NiwxNjldLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDQiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4OTYxNDc5NywiZXhwIjoxNzg5NzAxNzk3fQ.AX94kuTmzHb6ItR4uWLdaUmO4YO2ktVKw4fG0X_hspS33D5p7YT1DGCfSIHgkWFMDlZaiMfQbywE0nWMQtBRpdBgO4LzzmWQX8OHLQw6ihVYfT7lRkrcU2uoxO-Zal62oO4cOs8xK6j8DZctnV6A6ogO5C8Shp1D9730TO7ozOB1UxQncZcB3PpJ3dW6_MK2VQFQQioy2NOu4Vr27l9OGPFsAGxuywZeyNgDPf3d_e8NAYQ6SNpwUFCGuWaf0LHWhSVCdPmy2tmjmWc_2ANR2Pg-puHAEs0CZ1orIGar12zhIQCw_eHbUz18O59B41M32_lAZ_SOvBvX6e8H-_r2Tw";
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

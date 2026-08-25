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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJITVMtUC1DU0xNLVJXIiwiSE1TLVAtT1RJUi1SIiwiSE1TLUFQSS1VSElELVIiLCJITVMtUC1TR1JOLVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1WTkRELVJXIiwiTURDLVAtT1NCLVJXIiwiU0QtUC1MQkwtUlciLCJITVMtUC1BU1ItUlciLCJTVC1BUEktRU1QLVIiLCJTVC1SLUEiLCJTVC1QLU5URi1SIiwiSE1TLUFQSS1QQUNLLVIiLCJTVC1BUEktQU1DLVJXIiwiSE1TLVAtRERBU0giLCJITVMtUC1WUy1SVyIsIk1EQy1BUEktVEhSLVIiLCJTVC1QLURFUy1SIiwiRVItUC1FUlJFUC1SVyIsIkhNUy1QLVBHUyIsIkhNUy1QLUNMLVJXIiwiSE1TLVAtQ0NNQlBCLVJXIiwiSE1TLVAtTVItUlciLCJNREMtQVBJLVJETC1SVyIsIkhNUy1QLVJNRC1SVyIsIk1EQy1QLVBOUFItUiIsIkhNUy1QLUNTTEQtUlciLCJITVMtUC1BSU4tUlciLCJFUi1QLUVSR1BSLVJXIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtRExELVJXIiwiTURDLVAtUE5QLVJXIiwiSE1TLVAtTVJBLVJXIiwiSE1TLUFQSS1JVC1SVyIsIk1EQy1QLUNBLVJXIiwiSE1TLVAtREIiLCJITVMtUC1QU0gtUlciLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtUEktUlciLCJHRC1QLUdQIiwiU1QtUC1CUkQtUiIsIlNULUFQSS1DUkQtUlciLCJNREMtUC1SRUctUiIsIk1EQy1QLVRSQi1SVyIsIk1EQy1BUEktUEFUIiwiRVItUC1FUlZCLVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtR1BSQS1SVyIsIk1EQy1QLUFELVJXIiwiU1QtUC1UREwtUlciLCJNREMtUC1SRUctUlciLCJTVC1QLVRETC1SIiwiTURDLVAtUkRFLVJXIiwiSE1TLVAtQURBU0giLCJITVMtUC1PUy1SVyIsIkhNUy1QLUFETUQtUlciLCJITVMtUC1PQ1ItUlciLCJITVMtUC1WVlAiLCJITVMtUC1JQkUtUlciLCJNREMtUC1TT1ItUiIsIkVSLUFQSS1FUlVCLVJXIiwiSE1TLVAtQ1NJTC1SVyIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIkdQLVAtR0NOLVIiLCJITVMtUC1SS0lULVJXIiwiTURDLUFQSS1MQk4tUiIsIkhNUy1QLUNDR1JCLVJXIiwiSE1TLVAtVlMtUiIsIkhNUy1QLUlCRC1SVyIsIk1EQy1BUEktUEFULVIiLCJNREMtUC1QVEUtUlciLCJITVMtUC1NUkwtUlciLCJTVC1BUEktQlJELVJXIiwiSE1TLVAtVlNSUCIsIk1EQy1QLUFTTS1SVyIsIlNULVItSE9EIiwiSE1TLVAtUkNBVEQtUlciLCJFUi1SLUVSU0EiLCJTRC1BUEktQ04tUlciLCJITVMtUC1PUEgtUlciLCJITVMtUC1TSURFQkFSIiwiRVItUC1FUkItUlciLCJFUi1QLUVSQVMtUlciLCJITVMtUC1TUk0tUlciLCJITVMtUC1OU0QtUlciLCJNREMtUC1VQVMtUlciLCJTVC1QLVNOTy1SVyIsIkhNUy1QLVJDQVQtUlciLCJITVMtUC1DQ0MtUlciLCJITVMtUC1ITVMiLCJITVMtUC1QR1MtUlciLCJTVC1QLUNNVC1SVyIsIkhNUy1BUEktREFTSCIsIkhNUy1QLURSTS1SVyIsIk1EQy1BUEktQVQtUlciLCJITVMtUC1BRE1MLVJXIiwiTURDLVAtR0FULVJXIiwiTURDLVItUkVDIiwiTURDLUFQSS1BVC1SIiwiU0QtUi1UQyIsIk1EQy1BUEktUlRTLVIiLCJFUi1QLUVSR0FTLVJXIiwiSE1TLVAtSUItUlciLCJNREMtUC1HQUQtUlciLCJITVMtUC1STS1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtVk5ELVJXIiwiSE1TLVAtV1ItUlciLCJNREMtQVBJLUNEUi1SIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIkhNUy1QLUdSTkEtUlciLCJNREMtQVBJLUdBUy1SIiwiSE1TLVAtQ0NTVFNELVJXIiwiSE1TLVAtUEREUy1SVyIsIkhNUy1QLVBFUi1SVyIsIk1EQy1QLUVGLVJXIiwiTURDLVAtQ0RFLVJXIiwiTURDLVAtR0RUUy1SVyIsIlNELVAtTENDLVJXIiwiU1QtUC1DTVQtUiIsIlNULVAtTlRGLVJXIiwiSE1TLVAtQkxLLVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUi1WIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMSwxMzAsMiw1LDYsNywxMzUsOSwxMCwxMzksMTM2LDE0MSwxNCwxNSwxNiwxNywxNDYsMTQ3LDIwLDIxLDI2LDI3LDE1NSwyOCwzMSwzMiwzMywzNCwzNSwzNiwzNywzOCwzOSw1MCw1MSw1Miw1NywxMDMsMTA0LDEwNSwxMDYsMTA3LDEwOCwxMDksMTEwLDExNCwxMTUsMTE2LDExNywxMTgsMTIwLDEyMSwxMjJdLCJhbGxvd2VkLW91dGxldHMiOlsiT0xFVDAwMyIsIk9MRVQwMDUiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc4NzY1MjIzMywiZXhwIjoxNzg3NzM5MjMzfQ.NNgdY1j8xXI1fTdxr0MFjAUGrHInbmdeXP7MLn-dg0LucoEqatC3g_-Uji6aP2XKLqwqL_bc6W1M7omfcqaRg6EudGCNm7k0KIjughTauOJGNQAFShTTvB20945ME6iiD3v_70n5WKL-eQaS4x9w2RmiqjplI3YgZq2GfDcwNEjCleCAK55iztYOqKpIGeyD6O5gEo7gFDWPZQ5NXdhiwUJH6YPGMnX5aXQJSUsxAlbXXMNJRu12_wIIqj7EyqqBDaJ3HIQg32oxEwqYPf-yX3TzvH50qi-gJLVx2GsNDB3qxwXAzwApJmgeOcQ822sMZl8rcusHOrt5uU0TeGxbUQ";
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
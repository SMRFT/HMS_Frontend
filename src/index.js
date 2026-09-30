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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtUFJMLVJXIiwiR0wtUC1FTC1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLVAtU1VNRC1SVyIsIkhNUy1QLUNUSUEtUlciLCJITVMtUC1TR1JOLVJXIiwiSE1TLVAtTlMtUlciLCJITVMtUC1QSUQtUlciLCJITVMtUC1WTkRELVJXIiwiU0hJLVAtRVhQLVJXIiwiSE1TLVAtR0FETS1SVyIsIkdMLVAtRUJULVJXIiwiSE1TLVAtQUEtUlciLCJITVMtUC1DVEktUlciLCJITVMtQVBJLVBBQ0stUiIsIkhNUy1QLU1ULVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLVAtTVItUlciLCJITVMtUC1TVEEtUlciLCJITVMtUC1STUQtUlciLCJITVMtUC1TVU1FLVJXIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLVBDRC1SVyIsIkhNUy1QLU9UU1MtUiIsIkhNUy1QLU1SQS1SVyIsIkhNUy1BUEktSVQtUlciLCJHTC1QLUVQLVJXIiwiSE1TLVAtUFNILVJXIiwiSE1TLVAtR1BSLVJXIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1QLU9USVJFLVJXIiwiSE1TLVAtT1RTU0EtUlciLCJITVMtUC1PVE1CRC1SVyIsIkhNUy1QLVJTSEZURC1SVyIsIkhNUy1QLVBJLVJXIiwiSE1TLVAtT1RJUkQtUlciLCJITVMtUC1HUk4tUlciLCJITVMtUC1JUEVNUi1SVyIsIkhNUy1QLUlCLVIiLCJTSEktUC1JTkMiLCJITVMtUC1HUFJBLVJXIiwiSE1TLVAtT1RJUi1SVyIsIkdMLVAtQU5ELVJXIiwiSE1TLVAtQkxLRC1SVyIsIkhNUy1QLU9UU1NFLVJXIiwiSE1TLVAtT1MtUlciLCJHTC1QLU5EQy1SVyIsIkhNUy1QLUFETUQtUlciLCJITVMtUC1PQ1ItUlciLCJITVMtUC1PVFNTRC1SVyIsIkhNUy1QLUFNLVIiLCJITVMtUC1PVFNTVS1SVyIsIkhNUy1QLU9UTUJFLVJXIiwiSE1TLVAtSUJFLVJXIiwiSE1TLVAtUlNERC1SVyIsIkhNUy1QLURJUy1SVyIsIkhNUy1QLUNDLVJXIiwiR1AtUC1HQ04tUiIsIkhNUy1QLUNDRC1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1JUEtHLVJXIiwiSE1TLVAtUEMtUlciLCJHTC1QLUVBRC1SVyIsIkhNUy1QLUlCRC1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLU1STC1SVyIsIkdMLVAtRUQtUlciLCJITVMtUC1TVU0tUlciLCJITVMtUC1PVE1CLVJXIiwiR0wtUC1QLVJXIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1QTy1SVyIsIkhNUy1QLVBJTi1SVyIsIkhNUy1QLVNVTS1SIiwiSE1TLVAtSVBLR0UtUlciLCJITVMtUC1TSURFQkFSIiwiSE1TLVAtT1RTUy1SVyIsIkhNUy1QLVNSTS1SVyIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLVNVTUEtUlciLCJITVMtUC1SQ0FULVJXIiwiSE1TLVAtUlNIRlQtUlciLCJITVMtUC1HUk5SLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtUEdTLVJXIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1PVE0tUiIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtRFJNLVJXIiwiSE1TLVAtQURNTC1SVyIsIkdMLVAtUlNFLVJXIiwiSE1TLUFQSS1FTUwtUlciLCJITVMtUC1JQi1SVyIsIkhNUy1QLVNULVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLVJNLVJXIiwiSE1TLVAtVk5ELVJXIiwiSE1TLVAtV1ItUlciLCJITVMtUC1JUEtHRC1SVyIsIlNISS1QLVRSQUlOLVJXIiwiSE1TLVAtR1JOQS1SVyIsIkhNUy1QLVNBRE0tUlciLCJITVMtUC1CTEstUlciLCJIUi1SLUhPRCIsIkhNUy1QLVBSLVJXIl0sImFsbG93ZWQtZGF0YSI6WyJTSEIwMDEiXSwiaG9zcGl0YWxfY29kZSI6IlNIMDAxIiwiaG1zX3BhZ2VzIjpbMiw1NSwzLDUsMTAsMTEsMTUsNTgsNTksMTQsMTIyLDE2LDE3LDEyMCwxMjEsMTMzLDEzNCwxMzUsMTAyLDExMywxMTQsMTM2LDIwLDIxLDI2LDUwLDI3LDUyLDUxLDI4LDI5LDMxLDMwLDQ0LDE3MCwxNzEsMTkwLDE1NSwzMywxOTMsMTk0LDE3MywxODgsMTg5LDQ5LDEyNywxMjgsMTcyXSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc5MDc0NDI5MSwiZXhwIjoxNzkwODMxMjkxfQ.Z04qE_pX7_53XLSawLBX_Ti8S2z-ZjrJ746MUHxOoMkQHQ9N_888z9ZPqCSYbfH6H-3xJR2jeOeBL3CiLAQXLtNEc5n0hZqBXQ7BQgEiZxxZllK7JU2WgYNcf92cAzHYL8jnGUunyJm5XUgVRaqNKlZN5KoScvtW0ll7-MLInn5IFURhmZ1JBRdeFpwwmMvPJaVskLn4jb0wY5cZxk3OcAeEkiYuwc4AB4bOfAMT4ro0tVuTfkrdFqS6uH5xbRNeb7gpXQcDuGjmiC9QWWYLk3L1E6EQe8vF1R6Uy-ALaxQeqL0XSGpD48i-hIkUAQyJdm3LdcyflXrR5HfMk5fshA";
  console.log("🔧 Development token is empty - will redirect to login");
  if (dev_token && dev_token.trim() !== "") {
    const selectedBranch = "SHB001";
    localStorage.setItem("selected_branch", selectedBranch);
    const selectedOutlet = "OLET003";
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

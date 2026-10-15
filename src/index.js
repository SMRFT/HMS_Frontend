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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiR0wtUC1FRC1SVyIsIlNISS1QLUVYUC1SVyIsIk1EQy1QLUdQUC1SIiwiSE1TLVAtV1ItUlciLCJITVMtUC1HUk4tUlciLCJITVMtUC1BSU4tUlciLCJNREMtQVBJLVBHUC1SVyIsIkdMLVAtQU5ELVJXIiwiSE1TLVAtQ1RJQS1SVyIsIkhNUy1QLVNBRE0tUlciLCJITVMtQVBJLURMRC1SIiwiTURDLVAtVFMtUlciLCJNREMtUC1HQS1SVyIsIlNISS1QLUlOQyIsIkhNUy1QLUNDRC1SVyIsIkhNUy1QLVBPQS1SVyIsIkhNUy1QLVJTRC1SVyIsIkhNUy1QLVJDTE4tUlciLCJNREMtQVBJLUFULVIiLCJNREMtUC1QTlBSLVIiLCJHTC1QLUVMLVJXIiwiSE1TLVAtTVItUlciLCJHTC1QLVAtUlciLCJNREMtUi1QREMiLCJNREMtUC1HQ1AtUiIsIkhNUy1QLUFETUQtUlciLCJHTC1QLUVBRC1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLVAtT0NSLVJXIiwiSE1TLVAtT1MtUlciLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1QLUJMSy1SVyIsIkhNUy1QLUlQRU1SLVJXIiwiTURDLVAtR09BLVJXIiwiSE1TLVAtVk5ELVJXIiwiSE1TLVAtU1QtUlciLCJITVMtUC1EUk0tUlciLCJNREMtQVBJLUwtUlciLCJITVMtUC1NUkwtUlciLCJITVMtUC1QQ0QtUlciLCJITVMtUC1CTEtELVJXIiwiR0wtUC1FQlQtUlciLCJITVMtUC1QQy1SVyIsIkhNUy1QLVBSTC1SVyIsIkhNUy1QLVBSLVJXIiwiSE1TLVAtR1BSQS1SVyIsIk1EQy1QLUdPUC1SIiwiTURDLVAtR1NQLVIiLCJITVMtUC1QUkEtUlciLCJHTC1QLU5EQy1SVyIsIkhNUy1QLVBTSC1SVyIsIk1EQy1QLUNCQ0wtUlciLCJITVMtUC1DVEktUlciLCJNREMtQVBJLU9HUC1SVyIsIkhNUy1QLVBPLVJXIiwiSE1TLVAtU0RQLVJXIiwiTURDLUFQSS1DR1AtUlciLCJHUC1QLUdDTi1SIiwiSE1TLVAtSE1TIiwiSE1TLVAtU0lERUJBUiIsIkhNUy1QLVNHUk4iLCJNREMtQVBJLUNEUi1SVyIsIkhNUy1BUEktUEFDSy1SIiwiTURDLVAtQUFVLVJXIiwiSE1TLVAtTVJBLVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhNUy1QLVJLSVRELVJXIiwiSE1TLVAtQlJPT00tUlciLCJNREMtUC1HTUMtUlciLCJITVMtUC1SQ0FURC1SVyIsIkhNUy1QLU1ULVJXIiwiSE1TLVAtUEdTLVJXIiwiSE1TLVAtUktJVC1SVyIsIkhNUy1QLUdSTlItUlciLCJNREMtUC1VQVMtUlciLCJITVMtUC1SU0hGVEQtUlciLCJITVMtUC1QT0wtUlciLCJTSEktUC1UUkFJTi1SVyIsIkhNUy1QLVNUQS1SVyIsIkhNUy1QLVBJLVJXIiwiSE1TLVAtUk0tUlciLCJITVMtUC1EQi1SVyIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtR0FETS1SVyIsIkhNUy1QLVBJTi1SVyIsIkhNUy1QLVNSTS1SVyIsIkhNUy1QLURJUy1SVyIsIk1EQy1BUEktU0dQLVJXIiwiTURDLVAtR0FQLVIiLCJHTC1QLUVQLVJXIiwiSE1TLVAtSVBEQi1SVyIsIkhNUy1QLUdQUi1SVyIsIkhNUy1QLUdSTkEtUlciLCJITVMtUC1WTkRELVJXIiwiTURDLVAtU01DSC1SVyIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLVJTREQtUlciLCJNREMtUC1BRC1SVyIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLU5TLVJXIiwiSFItUi1IT0QiLCJITVMtUC1STUQtUlciLCJITVMtUC1DQy1SVyIsIkhNUy1QLVJDQVQtUlciLCJITVMtUC1BRE1MLVJXIiwiR0wtUC1SU0UtUlciLCJITVMtUC1JQi1SVyIsIk1EQy1BUEktUERDLVJXIiwiTURDLUFQSS1BR1AtUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxLDIsNTUsMyw0LDExMiw1LDEwLDE1LDU4LDU5LDE0LDEyMiwxMjMsMTYsMTcsMTIwLDEyMSwxMzMsMTM0LDEzNSwxMDIsMTEzLDExNCwxMzYsMTM3LDEzOCwxOSwyMCwyMSwyNiw1MCwyNyw1Miw1MSwyOCwyOSwzMSwzMCw0NCwxNzAsMTcxLDE5MCwxNTUsMzMsMTkzLDE5NCwxNzMsMTg4LDE4OSw0OSwxMjcsMTI4LDE3Ml0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzkyMDM1MTU5LCJleHAiOjE3OTIxMjIxNTl9.PPolbgbfKixiucyBg-WyfK3FQz0lqdFwIMT6JYG5YJVrHLL2mV1vu4evxhfGfYOMAk0kQeF8tYU-pGvOSeqkZqetVIglJtzHacCPLkBtvO_cofYIJU9SzqWwPbJPaneH0m7cY6SGDKA3lQcJDQ2JaLAOy-WsYMzoL1q0XETYId20Rxs7Z8GDRLmmOpY2AfGGun2hFk8PJOTKNW1R60-m3G-Wn84tLZmSPsxiHjO_dPNFrKl1mqm5DDwaOelnkppgG2LnaUrAGe8QLF8KPNEKVXIrG0V7mH6dxIv-eIWXmzy_vzRr6DD257cA0oIiQghjJ7-Q0jkMTO7qvtH9QXglPg";
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
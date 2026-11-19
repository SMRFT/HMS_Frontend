import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";


// Patch performance.measure to prevent DataCloneError / Out of memory crashes from React dev User Timing profiling
if (typeof performance !== 'undefined' && typeof performance.measure === 'function') {
  const _origMeasure = performance.measure.bind(performance);
  performance.measure = function (name, startOrOptions, endMark) {
    try {
      return _origMeasure(name, startOrOptions, endMark);
    } catch (err) {
      if (err && (err.name === 'DataCloneError' || (err.message && err.message.includes('cloned')))) {
        try {
          if (startOrOptions && typeof startOrOptions === 'object') {
            const { start, end } = startOrOptions;
            return _origMeasure(name, start !== undefined && end !== undefined ? { start, end } : undefined);
          }
        } catch (_) { }
        return;
      }
      throw err;
    }
  };
}

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

// console.log("=== HMS INDEX.JS DEBUG ===");
// console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtRFJNLVJXIiwiSE1TLVAtUERCLVJXIiwiSFItUC1QUk0tRU1QLVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1BUEktRExELVIiLCJITVMtUC1OUy1SVyIsIkhNUy1QLUNDVVBCIiwiSE1TLVAtUFNCLVJXIiwiSE1TLVAtQ0MtUlciLCJITVMtUC1CTEtELVJXIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtUFNILVJXIiwiSE1TLVAtQ0NDLVJXIiwiSE1TLVAtU0lERUJBUiIsIkdMLVAtQkQtUiIsIkhSLVAtUFJNLUVNUC1SIiwiSFItUC1ST1MtTUdULVJXIiwiSE1TLVAtQ0NELVJXIiwiSE1TLVAtVk5ELVJXIiwiSE1TLUFQSS1ETEQtUlciLCJITVMtQVBJLVBBQ0stUiIsIkhNUy1QLUFJTi1SVyIsIkhNUy1QLVNEUC1SVyIsIkhNUy1QLVBHUy1SVyIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLVJDQVRELVJXIiwiSE1TLVAtUkVOUS1SVyIsIkhSLVAtTEVWLUNGRy1SVyIsIkhNUy1QLVBNQy1SVyIsIkhSLVAtUFJNLUFQUi1SIiwiSE1TLVAtR1BSLVJXIiwiSE1TLVAtUFBELVJXIiwiSE1TLVAtUE9BLVJXIiwiSE1TLVAtQlJPT00tUlciLCJITVMtUC1SU0hGVC1SVyIsIkNOLUFQSS1DVC1SIiwiSE1TLVAtT1BIIiwiR1AtUC1HQ04tUiIsIkhNUy1QLUlQSCIsIkhNUy1QLVJTREQtUlciLCJIUi1QLUxFVi1BUFItUiIsIkhNUy1QLUJULVJXIiwiSE1TLVAtQUlOLVIiLCJITVMtUC1EQi1SVyIsIkdMLVAtRVAtUiIsIkhNUy1QLVBHRUItUlciLCJITVMtUC1QSS1SVyIsIkhSLVAtQVRULVJFUC1SIiwiSFItUC1MRVYtQVBSLVJXIiwiSE1TLVAtU1RBLVJXIiwiSFItUC1BVFQtQVBSLVIiLCJITVMtUC1STS1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLVAtQURNTC1SVyIsIkhNUy1QLVNULVJXIiwiSFItUC1QQVktU0xJUC1SIiwiSE1TLVAtUEMtUlciLCJITVMtUC1DVElBLVJXIiwiSE1TLVAtSE1TIiwiSFItUC1USy1NR1QtUiIsIkhNUy1QLVZOREQtUlciLCJITVMtUC1QR0xCVS1SVyIsIkhSLVAtTEVWLUVNUC1SIiwiSE1TLVAtQ0NHUkIiLCJITVMtUC1QU0lQLVJXIiwiSE1TLVAtQUEtUlciLCJITVMtUC1STUQtUlciLCJITVMtUC1QUi1SVyIsIkhNUy1QLUlCLVJXIiwiSFItUC1USy1NR1QtUlciLCJHTC1QLUVQLVJXIiwiSE1TLVAtQkxLLVJXIiwiSE1TLVAtUENFQi1SVyIsIkhNUy1QLVJLSVQtUlciLCJITVMtUC1ESVMtUlciLCJITVMtUC1GT1ItUiIsIkhNUy1QLVJDQVQtUlciLCJIUi1QLUFUVC1BUFItUlciLCJITVMtUC1QU00tUlciLCJITVMtUC1SU0QtUlciLCJITVMtUC1GT1ItUlciLCJITVMtUC1TQURNLVJXIiwiSE1TLVAtTVQtUlciLCJITVMtUC1SS0lURC1SVyIsIkhNUy1QLUdBRE0tUlciLCJITVMtUC1XUi1SVyIsIkhSLVAtTEVWLUVNUC1SVyIsIkhNUy1QLVBHUEJULVJXIiwiSE1TLVAtR1BSQS1SVyIsIkhNUy1QLVBSTC1SVyIsIkhNUy1QLVBDRC1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLVJDTE4tUlciLCJITVMtUC1QUkEtUlciLCJITVMtUC1QT0wtUlciLCJITVMtUC1QQ0JfUlciLCJIUi1QLVBSTS1BUFItUlciLCJITVMtUC1QTy1SVyIsIkhNUy1QLU9TLVJXIiwiSE1TLVAtR1JOQS1SVyIsIkhNUy1QLVBBUy1SVyIsIkhNUy1QLVBIVlNCLVJXIiwiSE1TLVAtQ0NDUkIiLCJITVMtUC1JUERCLVJXIiwiSE1TLVAtU1JNLVJXIiwiSE1TLVAtUElOLVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLVAtQ0NHUlAiLCJIUi1SLUhPRCIsIkhSLVAtUk9TLU1HVC1SIiwiSE1TLVAtR1JOUi1SVyIsIkhNUy1QLVBGQi1SVyIsIkhNUy1QLU5TRC1SVyIsIkhNUy1QLVBTRy1SVyIsIkhNUy1QLUlQQS1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzI5LDE3MiwxLDIsMTEyLDE0NSwyMTcsNCwyNiw1MCwyNyw1Miw1MSwyOCw1LDIwMywyMDUsMTAsMTUsNTgsNTksMTQsMTIyLDEyMywxNiwxNywxMzMsMTM0LDEzNSwxMDIsMTM2LDE4LDE5LDU1LDMxLDMwLDQ0LDIwMCwyMDEsMTI4XSwiYWxsb3dlZC1vdXRsZXRzIjpbIk9MRVQwMDMiLCJPTEVUMDA0IiwiT0xFVDAwNiIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzk1MDcxMTAyLCJleHAiOjE3OTUxNTgxMDJ9.IP7u_ePK99i8nLaxPr_L9YGRc8vS_Dxaxk0KYG1ZRQwYq5OkMfD8M3MYY0t3XyUi0LInn5ETyipAg5P8XIQZMIIYWPnIcgZqI0DExGP7m_BnukNYSS6dZ9k3stjg3eg-_89INDCBp-VJXfHkJOEMPKu1BSXl9lmEBioEn9Ngrb4jhbVMoV3xlFo-O8tOPQk8fKmxwz-mNb1w0Jq3s6xRMzhtGm0tfg_PwZdRr-seW1iqf6JFcnlfggWQ8qpVIJbOpiSdAh-fSVjP9uov2Ucow1U6z8jnu22Ojxq69N6eFaqRQhfRPzmHyz-XjTPbjwVVc4FbWjTauH7uZmQLsKQNSg";

  if (dev_token && dev_token.trim() !== "") {
    if (!localStorage.getItem("selected_branch")) {
      const selectedBranch = "SHB001";
      localStorage.setItem("selected_branch", selectedBranch);
    }
    // Only set default outlet if user has not yet selected one
    if (!localStorage.getItem("selected_outlet")) {
      const selectedOutlet = "OLET002";
      localStorage.setItem("selected_outlet", selectedOutlet);
      localStorage.setItem("outlet_code", selectedOutlet);
      localStorage.setItem("selected_outlet_name", "OP PHARMACY");
    }
    if (!localStorage.getItem("selected_hospital")) {
      const selectedHospital = "SH001";
      localStorage.setItem("selected_hospital", selectedHospital);
      localStorage.setItem("hospital_code", selectedHospital);
    }
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
  "/BreastCancerScreening",
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
            JSON.stringify(userPayload["allowed-outlets"] || []),
          );
          localStorage.setItem(
            "hms_pages",
            JSON.stringify(userPayload["hms_pages"] || []),
          );
          if (userPayload["page_outlets"]) {
            localStorage.setItem(
              "page_outlets",
              JSON.stringify(userPayload["page_outlets"] || {}),
            );
          }
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
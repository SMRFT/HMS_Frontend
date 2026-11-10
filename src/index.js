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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJITVMiLCJlbWFpbCI6IiIsIm5hbWUiOiJITVMgKEFsbCBQZXJtaXNzaW9ucykiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLUFQSS1JQi1SVyIsIkhNUy1BUEktU0lOVEVOVEEtUlciLCJITVMtQVBJLUFNQS1SVyIsIkhNUy1QLVBPQS1SVyIsIkhNUy1QLUNTTE0tUlciLCJITVMtUi1BIiwiSE1TLUFQSS1BSUEtUlciLCJITVMtUC1DVElBLVJXIiwiSE1TLVAtUFJBLVJXIiwiSE1TLUFQSS1JWFJBWS1SIiwiSE1TLUFQSS1SRC1SIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtSVBIIiwiSE1TLVAtUENPUFAtUlciLCJITVMtUC1XUi1SVyIsIkhNUy1QLVNHUk4iLCJITVMtUC1GT1ItUlciLCJITVMtUC1TUk0tUlciLCJITVMtUC1ST1ItUlciLCJITVMtUC1DQ1BSUC1SVyIsIkhNUy1QLUNDVVBCLVJXIiwiSE1TLVAtSE1TIiwiSE1TLVAtU1VNRS1SVyIsIkhNUy1QLUdSTkEtUlciLCJITVMtUC1QTy1SVyIsIkhNUy1BUEktUEFDSy1SIiwiSE1TLVAtRE8tUlciLCJITVMtUC1NUkwtUlciLCJITVMtUC1TR1JOLVJXIiwiSE1TLUFQSS1EQVNIIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtUkJJTEwiLCJITVMtUC1DU0xSLVJXIiwiSE1TLVAtRERBU0giLCJITVMtUC1QQy1SVyIsIkhNUy1QLUNDLVJXIiwiSE1TLVAtQ0NPUFBCLVJXIiwiSE1TLVAtQ0NHUlAiLCJITVMtUC1HQURNLVJXIiwiSE1TLVAtU1VNLVJXIiwiSE1TLUFQSS1JTVJJLVJXIiwiSE1TLVAtR1JOLVJXIiwiSE1TLUFQSS1TUk0tUlciLCJITVMtUC1NUkEtUlciLCJITVMtUC1TVU0tUiIsIkhNUy1QLVJTSEZULVJXIiwiSE1TLUFQSS1JQi1SIiwiSE1TLVAtQ1NJTC1SVyIsIkhNUy1QLUlQS0ctUiIsIkhNUy1QLUJULVJXIiwiSE1TLVAtUFJMLVJXIiwiSE1TLVAtVk5ERC1SVyIsIkhNUy1QLU9TLVJXIiwiSE1TLVAtQ0NHUlAtUlciLCJITVMtUC1QU0ctUlciLCJITVMtUC1TR0xBLVJXIiwiSE1TLUFQSS1ETEQtUiIsIkhNUy1BUEktSU1SSS1SIiwiSE1TLUFQSS1JVCIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLUNDU1RTRC1SVyIsIkhNUy1QLUNDVVBCIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtR1BSQS1SVyIsIkhNUy1BUEktSVhSQVktUlciLCJITVMtUC1DQ0dSQiIsIkhNUy1QLURCVURSLVIiLCJITVMtUC1WTkQtUlciLCJITVMtUC1EUi1SVyIsIkhNUy1QLVNVTUQtUlciLCJITVMtQVBJLUlVU0ctUlciLCJITVMtUC1QU0gtUlciLCJITVMtUC1DQ0lQQUItUlciLCJITVMtUC1QSUQtUlciLCJITVMtUC1DQ0dBSC1SVyIsIkhNUy1QLUlDRC1SVyIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1GT1ItUiIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1BUEktQU1SLVJXIiwiSE1TLVAtTVItUlciLCJITVMtUC1QRVItUlciLCJITVMtQVBJLVNBTS1SVyIsIkhNUy1QLU1ULVJXIiwiSE1TLUFQSS1TVU0tUiIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLUFQSS1JQ1QtUlciLCJITVMtUC1QSS1SVyIsIkhNUy1QLUNDRC1SVyIsIkhNUy1QLUNDQ1JCIiwiSE1TLVAtUFItUlciLCJITVMtQVBJLURSTS1SIiwiSE1TLVAtUENELVJXIiwiSE1TLUFQSS1FTUwtUlciLCJITVMtUC1BU1ItUlciLCJITVMtUC1TVU1BLVJXIiwiSE1TLUFQSS1JVVNHLVIiLCJITVMtUC1EUk0tUlciLCJITVMtUC1BREFTSCIsIkhNUy1QLUFETUwtUlciLCJITVMtUC1DU0xELVJXIiwiSE1TLVAtTVItUiIsIkhNUy1QLVMzNjAtUlciLCJITVMtQVBJLVNBTVQtUlciLCJITVMtQVBJLVNJTlRFTlQtUlciLCJITVMtUC1JUERCLVJXIiwiSE1TLUFQSS1TVU0tUlciLCJITVMtUC1JQi1SIiwiSE1TLUFQSS1JQ1QtUiIsIkhNUy1QLVNULVJXIiwiSE1TLVAtUEdQQlQtUlciLCJITVMtUC1DQ0dNUEItUlciLCJITVMtUC1HUFItUlciLCJITVMtQVBJLUlULVJXIiwiSE1TLVAtQlQtUiIsIkhNUy1QLUNDQy1SVyIsIkdQLVAtR0NOLVIiLCJITVMtQVBJLURSTS1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLUNDR0FTLVJXIiwiSE1TLVAtU0RVSS1SVyJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzYsNyw4LDksMSwyLDExMiwxNDUsNCw1LDIwMywyMDUsMTAsMTEsMTMsMTUsNTgsNTksMTQsMTIyLDEyMywxNiwxNywxMjAsMTIxLDEzMywxMzQsMTM1LDEwMiwxMzYsMTM3LDEzOCwxMTUsMTE2LDExNywxMTgsMTgsMTksMjAsMjEsMjIsMjA0LDMxLDMwLDQ0LDMsMzIsMTU1LDE5MiwzMywzNCwzNiwzNSwxNTMsMTU0LDE2NywxNzAsMTcxLDE5MywxOTQsMzcsMzgsMzksMTU2LDE1NywxNTgsNDMsMTAxLDQ1LDEwMCwxMTAsMTI0LDEyNSw0OSw1Myw1NCwxMTEsMTk2LDE5NywyMDEsMjAyLDEyNywxMjgsMTI5LDE0NCwxNDYsMTQ3LDE1OSwxMzIsMTkxLDIwNl0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDYiLCJPTEVUMDAxIiwiT0xFVDAwMiJdLCJpc3MiOiJodHRwczovL2xhYi5zaGlub3ZhLmluLyIsImlhdCI6MTc5NDI4MTU2NSwiZXhwIjoxNzk0MzY4NTY1fQ.Jw2YeXM6Um5x2KYQDy0KJQutwvmCR1TeJ0GL1sbOBMClH5ahmaQaAHGJW1sucz3JCqbn002HBwL8UopZ75Hr8gK032IFFHprWRdCZLQAaY9JaBdmc8ShbTyHzGOLsh1X8QW5C4esjiiF-yuKbiPJCjS2Ahl77lqVq-ppztKOnNunHq7r7fvLzyiFC2WCjEQv7RF16J6qDNLrsgPUWHfyqbHdDejzVPPf66NEj71qLvzaCUqt8IkIDLNALuEXhn38pm7_K3pjLwSttWJc2HUY36U3UROlJY6J0doWXRI7E9E4uK0GI8sZFGeR83bzsOCtBiQwg8LaoKNg7Qc22dDDwg";
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
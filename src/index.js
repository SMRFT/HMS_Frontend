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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NyIsImVtYWlsIjoic2l2YXN1bmRhcmlzbXJmdEBnbWFpbC5jb20iLCJuYW1lIjoiU2l2YXN1bmRhcmkiLCJhbGxvd2VkLWFjdGlvbnMiOlsiSE1TLVAtUFJMLVJXIiwiR0wtUC1FTC1SVyIsIkhNUy1BUEktVUhJRC1SIiwiSE1TLVAtQ1RJQS1SVyIsIk1EQy1QLUdTUC1SIiwiSE1TLVAtTlMtUlciLCJNREMtUC1HUFAtUiIsIkhNUy1QLVBJRC1SVyIsIkhNUy1QLVZOREQtUlciLCJNREMtUC1BQVUtUlciLCJNREMtUC1UUy1SVyIsIlNISS1QLUVYUC1SVyIsIkhNUy1QLUdBRE0tUlciLCJHTC1QLUVCVC1SVyIsIkhNUy1QLUFBLVJXIiwiSE1TLVAtQ1RJLVJXIiwiSE1TLUFQSS1QQUNLLVIiLCJITVMtUC1NVC1SVyIsIkhNUy1QLVBSQS1SVyIsIkhNUy1QLU1SLVJXIiwiSE1TLVAtU1RBLVJXIiwiSE1TLVAtUk1ELVJXIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtQUlOLVJXIiwiSE1TLVAtUlNELVJXIiwiSE1TLVAtUkNMTi1SVyIsIkhNUy1QLVBDRC1SVyIsIkhNUy1QLU1SQS1SVyIsIkdMLVAtRVAtUlciLCJITVMtUC1QU0gtUlciLCJITVMtUC1HUFItUlciLCJITVMtQVBJLURMRC1SIiwiSE1TLVAtUlNIRlRELVJXIiwiSE1TLVAtUEktUlciLCJNREMtQVBJLVBHUC1SVyIsIk1EQy1QLUNCQ0wtUlciLCJNREMtQVBJLUNHUC1SVyIsIkhNUy1QLUdSTi1SVyIsIkhNUy1QLUlQRU1SLVJXIiwiTURDLVAtR09QLVIiLCJTSEktUC1JTkMiLCJITVMtUC1HUFJBLVJXIiwiTURDLVAtQUQtUlciLCJHTC1QLUFORC1SVyIsIkhNUy1QLUJMS0QtUlciLCJITVMtUC1PUy1SVyIsIkdMLVAtTkRDLVJXIiwiSE1TLVAtQURNRC1SVyIsIkhNUy1QLU9DUi1SVyIsIkhNUy1QLVJTREQtUlciLCJITVMtUC1ESVMtUlciLCJNREMtUC1HTUMtUlciLCJITVMtUC1DQy1SVyIsIkdQLVAtR0NOLVIiLCJITVMtUC1DQ0QtUlciLCJNREMtQVBJLU9HUC1SVyIsIk1EQy1BUEktQUdQLVJXIiwiSE1TLVAtUktJVC1SVyIsIk1EQy1BUEktQ0RSLVJXIiwiSE1TLVAtUEMtUlciLCJHTC1QLUVBRC1SVyIsIkhNUy1QLVBPQS1SVyIsIkhNUy1QLVNHUk4iLCJITVMtUC1QU0ctUlciLCJITVMtUC1NUkwtUlciLCJHTC1QLUVELVJXIiwiR0wtUC1QLVJXIiwiSE1TLVAtUkNBVEQtUlciLCJITVMtUC1QTy1SVyIsIk1EQy1SLVBEQyIsIkhNUy1QLVBPTC1SVyIsIkhNUy1QLVNJREVCQVIiLCJITVMtUC1EQi1SVyIsIkhNUy1QLVNSTS1SVyIsIkhNUy1QLU5TRC1SVyIsIk1EQy1QLVVBUy1SVyIsIkhNUy1QLVNEUC1SVyIsIkhNUy1QLVJDQVQtUlciLCJITVMtUC1SU0hGVC1SVyIsIkhNUy1QLUdSTlItUlciLCJNREMtQVBJLUwtUlciLCJITVMtUC1JUERCLVJXIiwiSE1TLVAtSE1TIiwiTURDLVAtR0EtUlciLCJITVMtUC1QR1MtUlciLCJNREMtQVBJLVBEQy1SVyIsIkhNUy1QLUJST09NLVJXIiwiTURDLUFQSS1TR1AtUlciLCJITVMtUC1SS0lURC1SVyIsIkhNUy1QLURSTS1SVyIsIkhNUy1QLUFETUwtUlciLCJNREMtQVBJLUFULVIiLCJHTC1QLVJTRS1SVyIsIkhNUy1QLUlCLVJXIiwiSE1TLVAtU1QtUlciLCJITVMtUC1SRU5RLVJXIiwiSE1TLVAtUk0tUlciLCJITVMtUC1WTkQtUlciLCJNREMtUC1TTUNILVJXIiwiSE1TLVAtV1ItUlciLCJNREMtUC1HQ1AtUiIsIlNISS1QLVRSQUlOLVJXIiwiSE1TLVAtR1JOQS1SVyIsIk1EQy1QLUdBUC1SIiwiSE1TLVAtU0FETS1SVyIsIkhNUy1QLUJMSy1SVyIsIkhSLVItSE9EIiwiTURDLVAtR09BLVJXIiwiSE1TLVAtUFItUlciXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOlsxLDIsNTUsMyw0LDExMiwxNzIsNSwxMCwxNSw1OCw1OSwxNCwxMjIsMTIzLDE2LDE3LDEyMCwxMjEsMTMzLDEzNCwxMzUsMTAyLDExMywxMTQsMTM2LDEzNywxMzgsMTksMjAsMjEsMjYsNTAsMjcsNTIsNTEsMjgsMjksMzEsMzAsMTcwLDE3MSwxOTAsMTU1LDMzLDE5MywxOTQsMTczLDE4OCwxODksNDksMTI3LDEyOCw0NF0sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwNCIsIk9MRVQwMDEiLCJPTEVUMDAyIl0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzkxNDI5MTE3LCJleHAiOjE3OTE1MTYxMTd9.IuPZDPuPvrz7gcq3qcLG376Rtk-q84xWDdLmlE0590DGgiv3g7mMX7efNprpqzWlgCVfltIAd3DNK22ICA7QvP4cyW1zH_RbJcoc1KakqA9PfSploQfwJSFBJcuuHKBPBmmDxP80llKZ54LOGqpbFrFotdh0wbfom0XA8nfQP3RTayU9eBGMtBLFllpOn6Fnv3hPdgam_MaZJtAs0JIeqd5D765fj2VLjVBeoZgy8fXzQq1NieYLsj-An-Oo2yP4UpI7_STyBrY5pcvIE12sbwKKTvHSacTjhgO08nw5MsBLgnfiQsnAHh1UvDr3B2DoYEjbun4XUo2BgkOmp5_0DA";
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

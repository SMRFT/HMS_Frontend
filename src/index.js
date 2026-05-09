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
  const dev_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI2MDM4MCIsImVtYWlsIjoibWFuaWJhbGFuc21yZnRAZ21haWwuY29tIiwibmFtZSI6Ik1hbmliYWxhbiIsImFsbG93ZWQtYWN0aW9ucyI6WyJTSEktUC1GM1ItUlciLCJTSEktUC1PVC1SVyIsIk1EQy1QLUNERS1SVyIsIkVSLVAtRVJWQi1SVyIsIkhNUy1QLUFBLVJXIiwiU1QtUC1OVEYtUiIsIkhNUy1QLUFTUi1SVyIsIlNULUFQSS1DUkQtUlciLCJITVMtUC1PUEgiLCJTSEktUC1NUkQtUlciLCJFUi1QLUVSQi1SVyIsIlNISS1QLVJFQ1ItUlciLCJTSEktUC1TSUNVUi1SVyIsIlNJLVItSU5ESU4iLCJNREMtUC1QVEUtUlciLCJNREMtUC1TT1ItUiIsIkhNUy1QLUlQSCIsIkVSLVAtRVJSRVAtUlciLCJFUi1BUEktRVJVQi1SVyIsIk1EQy1BUEktUEFUIiwiSE1TLVAtQ0NNQlBCLVJXIiwiU1QtUC1ERVMtUiIsIk1EQy1QLVBOUC1SVyIsIlNISS1QLUYxU1ItUlciLCJTSEktUC1FTVJSLVJXIiwiU0hJLVAtUEhZLVJXIiwiTURDLUFQSS1BVC1SIiwiR0wtUC1FTC1SVyIsIlNISS1QLUFWQUlMLVJXIiwiTURDLUFQSS1SVFMtUiIsIlNISS1QLUYyLVJXIiwiR0wtUC1FQlQtUlciLCJTSEktUC1GMlMtUlciLCJTSEktUC1NSUNVUi1SVyIsIkVSLVAtRVJBUy1SVyIsIlNISS1QLU1JQ1UtUlciLCJTVC1QLVRETC1SIiwiSE1TLVAtU0lERUJBUiIsIlNULVAtQlJELVIiLCJTSEktUC1SRUMtUlciLCJTSEktUC1YUkFZLVJXIiwiTURDLVAtUE5QLVIiLCJITVMtUC1CVC1SVyIsIlNULUFQSS1BTUMtUlciLCJHTC1QLUFORC1SVyIsIk1EQy1QLUFTTS1SVyIsIlNISS1QLUdFVFJBVy1SVyIsIlNISS1QLUYyUi1SVyIsIkhNUy1QLVZJTlItUiIsIlNISS1QLUYzLVJXIiwiU1QtUC1TTk8tUlciLCJTSEktUC1GMS1SVyIsIlNISS1QLUYxUi1SVyIsIlNULVItSE9EIiwiTURDLUFQSS1QQVQtUiIsIk1EQy1BUEktVEhSLVIiLCJHTC1QLVJTRS1SVyIsIlNISS1QLUhBTkQtUlciLCJNREMtQVBJLVJETC1SVyIsIlNISS1QLUNULVJXIiwiU0hJLVAtTVJJLVJXIiwiU0hJLVAtVVBELVJXIiwiU0hJLVAtTklDVS1SVyIsIlNULVAtREVTLVJXIiwiSE1TLVAtSE1TIiwiU0hJLVAtQ0hFTU9SLVJXIiwiU0hJLVAtREVMLVJXIiwiU0hJLVAtVFJBSU4tUlciLCJTVC1QLVRETC1SVyIsIkhNUy1QLURCVURSLVIiLCJTSEktUC1GT1JNLVJXIiwiR0wtUC1OREMtUlciLCJFUi1SLUVSU0EiLCJTSEktUC1GMVMtUlciLCJTVC1QLUNNVC1SVyIsIlNISS1QLURJQS1SVyIsIk1EQy1BUEktQ0RSLVIiLCJTSEktUC1IUi1SVyIsIlNISS1QLUhBTkRSLVJXIiwiU1QtQVBJLUJSRC1SVyIsIk1EQy1QLVBOUFItUiIsIkdMLVAtUC1SVyIsIkhNUy1BUEktU1JNLVJXIiwiU0hJLVAtRVhQLVJXIiwiU0hJLVAtVVBEUkFXLVJXIiwiSE1TLUFQSS1TQU1ULVJXIiwiRVItUC1FUkdBUy1SVyIsIlNISS1QLUlOQyIsIlNISS1QLUxBQi1SVyIsIk1EQy1QLVJERS1SVyIsIlNISS1QLUYyU1ItUlciLCJTSEktUC1TSUNVLVJXIiwiTURDLVAtT1NCLVJXIiwiU0hJLVAtRU1SLVJXIiwiSE1TLVAtU0dSTi1SVyIsIkVSLVAtRVJHUFItUlciLCJITVMtQVBJLVNBTS1SVyIsIlNISS1QLVRSQUlOUi1SVyIsIkhNUy1QLUNDQy1SVyIsIkhNUy1QLUNDR0FILVJXIiwiSE1TLVAtQ0NHQVMtUlciLCJHUC1QLUdDTi1SIiwiU0hJLVAtREVMUkFXLVJXIiwiU1QtQVBJLUVNUC1SIiwiU0hJLVAtTU9DSy1SVyIsIlNISS1QLUNIRU1PLVJXIiwiTURDLVAtVFJCLVJXIiwiR0wtUC1FRC1SVyIsIkhNUy1BUEktU0lOVEVOVC1SVyIsIlNULVAtTlRGLVJXIiwiSE1TLUFQSS1TSU5URU5UQS1SVyIsIlNISS1QLVBIQVJNLVJXIiwiR0wtUC1FQUQtUlciLCJNREMtQVBJLUFULVJXIiwiR0wtUC1FUC1SVyIsIlNISS1QLU9QRC1SVyIsIk1EQy1SLVJFQyIsIlNISS1QLUZSTlQtUlciLCJITVMtUC1DQ1NUU0QtUlciLCJNREMtUC1SRUctUlciLCJNREMtQVBJLUxCTi1SIiwiTURDLVAtUkVHLVIiLCJITVMtQVBJLUlULVJXIiwiU0hJLVAtTklDVVItUlciLCJNREMtQVBJLUdBUy1SIiwiU1QtUC1DTVQtUiJdLCJhbGxvd2VkLWRhdGEiOlsiU0hCMDAxIl0sImhvc3BpdGFsX2NvZGUiOiJTSDAwMSIsImhtc19wYWdlcyI6WzUsMTAsMTEsMTIsMTMsMTgsMTksMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDMsNDUsNDYsNTUsNTcsMTAxLDEwM10sImFsbG93ZWQtb3V0bGV0cyI6WyJPTEVUMDAzIiwiT0xFVDAwMSIsIk9MRVQwMDIiLCJPTEVUMDA1Il0sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc4MjM5MjQwLCJleHAiOjE3NzgzMjYyNDB9.SGOPkzfAfe-P3DDdSNo-ZpewNqndPMJ2nq1XhHAWv7HgJwY0B6IWcrbFbAyveKJwdySK3FuG_QeldnV2l5Xwdjf_G7orE5YttVSsLAjThaY07MWm4R1Pw8IT-BAOZsspXCbDhgdxSyWxqYQgTz1HPX8WrRSHwPIuv2wm0ua-RcLoDhFXXe6aX9-WrLIb_JOC2jgxTaLEa04a4f66pzpNZtMjU5WoxbB4qQ_EtptHadUdQr_UfBgTvu-9r7MnL5x8YCoN_bASc1gsSr_YyqMJ63LFV7cVoG40zlRt5o8onCECqu-n4SWdQS8nF-TtpBlrlytDk_7KNdwnHvG5S2jbQQ";
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
  const selectedOutlet = "OLET003";
  localStorage.setItem("selected_outlet", selectedOutlet);
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

// --- Main execution ---
(function main() {
  try {
    // console.log("Starting token validation...");

    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");
    // console.log("Access token from localStorage exists:", !!accessToken);

    // If no token found, try development token
    if (!accessToken) {
      console.log(
        "❌ No token found in localStorage, trying development token",
      );
      accessToken = setforlocaldev();
    }

    // If still no token (development token is empty), redirect to login
    if (!accessToken || accessToken.trim() === "") {
      // console.log("❌ No valid token available, redirecting to login");
      localStorage.removeItem("access_token"); // Clean up
      redirectToLogin();
      return; // Stop execution here
    }

    // Validate the token
    const userPayload = validate(accessToken);
    // console.log("✅ Token validated successfully");
    // console.log("Decoded token payload:", userPayload);

    // Store the valid token and user information
    localStorage.setItem("access_token", accessToken);

    // Extract user information from token payload
    const employeeId = userPayload.aud; // Using 'aud' field as ID
    const name = userPayload.name;
    const userEmail = userPayload.email;

    const userRole = getUserRole(userPayload["allowed-actions"]);

    // console.log("Employee ID:", employeeId);
    // console.log("Name:", name);
    // console.log("Email:", userEmail);
    // console.log("User Role:", userRole);

    // Check if we have required data
    const isLoggedIn = !!(employeeId && name);
    // console.log("Is logged in:", isLoggedIn);

    if (!isLoggedIn) {
      throw new Error(
        "Missing required user data (employeeId or employeeName)",
      );
    }

    // Store user payload and extracted information for app usage
    localStorage.setItem("user_payload", JSON.stringify(userPayload));
    localStorage.setItem("employeeId", employeeId);
    localStorage.setItem("name", name);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("allowed-outlets", userPayload["allowed-outlets"]);
    localStorage.setItem(
      "hms_pages",
      JSON.stringify(userPayload["hms_pages"] || []),
    );
    localStorage.setItem("role", userRole);

    localStorage.setItem(
      "allowedActions",
      JSON.stringify(userPayload["allowed-actions"] || []),
    );

    // console.log("✅ User payload and extracted data stored in localStorage");
    // console.log("Stored data:", {
    //   employeeId,
    //   name,
    //   userEmail,
    //   role: userRole,
    // });

    // Token is valid, render app
    // console.log("✅ Rendering lab app...");
    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    reportWebVitals();
  } catch (error) {
    console.error("❌ Token validation failed:", error.message);

    // Clean up invalid token
    localStorage.removeItem("access_token");

    // If validation fails, redirect to login instead of showing debug page
    console.log("❌ Redirecting to login due to validation failure");
    redirectToLogin();
  }
})();
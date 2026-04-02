import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Access the redirect URL from environment variables
const REDIRECT_URL = process.env.REACT_APP_LOGIN_REDIRECT_URL;

console.log("=== HMS INDEX.JS DEBUG ===");
console.log("REDIRECT_URL:", REDIRECT_URL);

// --- Function to set token for local development ---
function setforlocaldev() {
  const dev_token ="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1MDg4NiIsImVtYWlsIjoiY2hhbmRyYXNtcmZ0QGdtYWlsLmNvbSIsIm5hbWUiOiJDaGFuZHJhIiwiYWxsb3dlZC1hY3Rpb25zIjpbIkhNUy1QLUNFQi1SVyIsIkhNUy1QLUlCLVIiLCJFUi1QLUVSVVMtUlciLCJFUi1QLUVSR1BSLVJXIiwiSE1TLVAtSFNOLVJXIiwiSE1TLVAtR1BCVC1SIiwiSE1TLVAtR0xCVC1SIiwiRVItUC1FUlZCLVJXIiwiRkUtUC1GR0YtUiIsIlNISS1QLUVYUC1SVyIsIkhNUy1QLUJMSy1SIiwiU0hJLVAtVFJBSU4tUlciLCJFUi1QLUVSR0FTLVJXIiwiSE1TLVAtUENPUFAtUlciLCJHTC1QLUVBRC1SVyIsIkVSLVAtRVJTRC1SVyIsIkZFLVItRkEtUlciLCJGRS1QLUZHLVJXIiwiU0hJLVAtSU5DIiwiSE1TLVAtUE9QVUFTLVIiLCJHTC1QLUFORC1SVyIsIk1EQy1QLUdBUC1SIiwiR0wtUC1OREMtUlciLCJNREMtQVBJLUNHUC1SVyIsIkhNUy1QLURMRC1SVyIsIkZFLVAtRlMtUlciLCJITVMtUC1QQ0NTRF9SVyIsIkhNUy1QLU9QUEItUiIsIkhNUy1QLVBPUFBEQi1SIiwiSE1TLVAtV1JRLVJXIiwiR0wtUC1SU0UtUlciLCJHTC1QLUVMLVJXIiwiR0wtUC1FRC1SVyIsIkhNUy1QLUdPUFMtUiIsIkhNUy1QLUFETS1SVyIsIkhNUy1QLVBTT1BCLVJXIiwiRkUtUC1GVVMtUlciLCJHTC1QLUVQLVJXIiwiSE1TLVAtUEdMQlUtUiIsIkhNUy1QLUdMQlUtUiIsIkhNUy1QLVBHUy1SIiwiTURDLUFQSS1BR1AtUlciLCJHTC1QLVAtUlciLCJHTC1QLUVCVC1SVyIsIkhNUy1QLUdBRS1SIiwiRkUtUC1GRi1SVyIsIkVSLVItRVJQIiwiTURDLVAtUE5QUi1SIiwiSE1TLVAtVkwtUlciLCJNREMtQVBJLUFULVIiLCJGRS1SLUZBIiwiTURDLUFQSS1QREMtUlciLCJITVMtUC1DT1BQLVJXIiwiTURDLVAtR1NQLVIiLCJITVMtUC1EUk0tUiIsIkhNUy1QLVJDQVQtUiIsIkZFLVAtRkdMLVIiLCJGRS1QLUZVQi1SVyIsIkhNUy1QLUNTLVJXIiwiTURDLVAtQUFVLVJXIiwiSE1TLVAtUEdQQlQtUiIsIkhNUy1SLVBIIiwiRkUtUC1GU0ItUlciLCJNREMtQVBJLU9HUC1SVyIsIkhNUy1QLUdXTC1SIiwiRkUtUC1GQUwtUiIsIk1EQy1QLUdPUC1SIiwiRkUtUC1GUi1SVyIsIkhNUy1QLVBHQVMtUiIsIkhNUy1QLVBHRUItUiIsIkhNUy1QLUdPUEJOLVIiLCJITVMtUC1TT1BFLVJXIiwiRVItUC1FUlAtUiIsIkhNUy1QLVNPUEItUlciLCJNREMtUC1HUFAtUiIsIk1EQy1QLUdDUC1SIiwiTURDLUFQSS1QR1AtUlciLCJNREMtQVBJLVNHUC1SVyIsIk1EQy1SLVBEQyIsIkdQLVAtR0NOLVIiXSwiYWxsb3dlZC1kYXRhIjpbIlNIQjAwMSJdLCJob3NwaXRhbF9jb2RlIjoiU0gwMDEiLCJobXNfcGFnZXMiOm51bGwsImFsbG93ZWQtb3V0bGV0cyI6W10sImlzcyI6Imh0dHBzOi8vbGFiLnNoaW5vdmEuaW4vIiwiaWF0IjoxNzc1MTAxMzQxLCJleHAiOjE3NzUxODgzNDF9.bw5Y78VetJp6vPE_ncH4hfQCBU-U93SG_J2bEqcvAD9bx7Y2SereH2mrEnriteY9jPpue64leAKwT7XUW1T3flEBRTFD_9yz5FGym1JcFESTfix1DwnMXzhUF353fIuseyTgcGmluMColmxp3_NNPQfB0p6D1H-eNBYP6BzhqFsOWxR8nEDEKUZVOnUn-Eq50pgMoj7f6Y6Hx9akYdg8zC0PQL6X1DBNJRR3s_HUN5Sfn7Yyzs5xkT13usKRYyjbs5J0_dPlfdQ7I1CC5cpvmqF1g6lbEs5nYvpbm7PDeJddHDwvOFBFU8TXflnP_xl7msZv54H4kVvrI_c8CSq-ag"
  console.log("🔧 Development token is empty - will redirect to login");
  const selectedBranch = "SHB001";
  localStorage.setItem("selected_branch", selectedBranch);
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
    return "Employee"; // Default role
  }
  console.log("Allowed actions:", allowedActions);
  if (allowedActions.includes("HMS-R-SA")) {
    return "Super Admin";
  } else {
    return "Employee"; // Default role if none of the specific roles are found
  }
}

// --- Main execution ---
(function main() {
  try {
    console.log("Starting token validation...");

    // Retrieve token from localStorage
    let accessToken = localStorage.getItem("access_token");
    console.log("Access token from localStorage exists:", !!accessToken);

    // If no token found, try development token
    if (!accessToken) {
      console.log(
        "❌ No token found in localStorage, trying development token",
      );
      accessToken = setforlocaldev();
    }

    // If still no token (development token is empty), redirect to login
    if (!accessToken || accessToken.trim() === "") {
      console.log("❌ No valid token available, redirecting to login");
      localStorage.removeItem("access_token"); // Clean up
      redirectToLogin();
      return; // Stop execution here
    }

    // Validate the token
    const userPayload = validate(accessToken);
    console.log("✅ Token validated successfully");
    console.log("Decoded token payload:", userPayload);

    // Store the valid token and user information
    localStorage.setItem("access_token", accessToken);

    // Extract user information from token payload
    const employeeId = userPayload.aud; // Using 'aud' field as ID
    const name = userPayload.name;
    const userEmail = userPayload.email;
    const userRole = getUserRole(userPayload["allowed-actions"]);

    console.log("Employee ID:", employeeId);
    console.log("Name:", name);
    console.log("Email:", userEmail);
    console.log("User Role:", userRole);

    // Check if we have required data
    const isLoggedIn = !!(employeeId && name);
    console.log("Is logged in:", isLoggedIn);

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
    localStorage.setItem("role", userRole);

    console.log("✅ User payload and extracted data stored in localStorage");
    console.log("Stored data:", {
      employeeId,
      name,
      userEmail,
      role: userRole,
    });

    // Token is valid, render app
    console.log("✅ Rendering lab app...");
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

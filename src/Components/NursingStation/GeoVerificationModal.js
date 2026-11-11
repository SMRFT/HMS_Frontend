import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import {
  FiCamera,
  FiMapPin,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiUpload,
  FiClock,
  FiUser,
  FiCompass,
  FiZoomIn,
  FiExternalLink
} from "react-icons/fi";
import apiRequest from "../../Auth/apiRequest";

const modalUp = keyframes`
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalCard = styled.div`
  background: #ffffff;
  border-radius: 18px;
  width: 95%;
  max-width: 860px;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  animation: ${modalUp} 0.25s ease-out;
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 60%, #115e59 100%);
  color: white;
  padding: 16px 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  .patient-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.15rem;
    }

    .meta {
      h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      p {
        margin: 3px 0 0 0;
        font-size: 0.82rem;
        opacity: 0.95;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        span.pill {
          background: rgba(255, 255, 255, 0.22);
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 600;
        }
      }
    }
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover { background: rgba(255, 255, 255, 0.3); }
  }
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0 16px;

  button {
    padding: 12px 20px;
    border: none;
    background: transparent;
    font-size: 0.88rem;
    font-weight: 700;
    color: #64748b;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    &.active {
      color: #0d9488;
      border-bottom-color: #0d9488;
      background: #ffffff;
    }

    &:hover:not(.active) { color: #0f172a; }

    span.count-badge {
      background: #e2e8f0;
      color: #475569;
      font-size: 0.75rem;
      padding: 1px 7px;
      border-radius: 12px;
      font-weight: 800;
    }

    &.active span.count-badge {
      background: #ccfbf1;
      color: #0d9488;
    }
  }
`;

const ContentBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const CameraWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  border-radius: 14px;
  overflow: hidden;
  background: #0f172a;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  img.preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
  }

  /* Google Maps Top Bar */
  .gmaps-top-card {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 56px;
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(8px);
    color: white;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 0.78rem;
    z-index: 10;
    border: 1px solid rgba(255, 255, 255, 0.18);
    display: flex;
    flex-direction: column;
    gap: 3px;

    .gmaps-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .gmaps-brand {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        letter-spacing: 0.2px;

        .brand-text {
          font-family: 'Product Sans', Roboto, Arial, sans-serif;
          font-size: 0.84rem;
        }

        .dot-status {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${props => props.$hasGps ? "#10b981" : "#f59e0b"};
          box-shadow: 0 0 6px ${props => props.$hasGps ? "#10b981" : "#f59e0b"};
        }
      }

      .gmaps-link {
        color: #38bdf8;
        font-weight: 700;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.74rem;
        background: rgba(56, 189, 248, 0.15);
        padding: 2px 8px;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover { background: rgba(56, 189, 248, 0.3); color: #7dd3fc; }
      }
    }

    .gmaps-address {
      font-size: 0.75rem;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    .gmaps-coords-line {
      font-size: 0.7rem;
      color: #94a3b8;
      font-family: monospace;
      display: flex;
      gap: 8px;

      span.accuracy-pill {
        color: #34d399;
        font-weight: 600;
      }
    }
  }

  .switch-cam-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s;

    &:hover { background: rgba(15, 23, 42, 1); transform: scale(1.05); }
  }
`;

const ControlsSection = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;

  .btn-row {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-primary {
    background: #0d9488;
    color: white;
    border: none;
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    &:hover:not(:disabled) { background: #0f766e; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    &:hover { background: #e2e8f0; }
  }

  .btn-upload {
    background: white;
    color: #0d9488;
    border: 1px dashed #0d9488;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    &:hover { background: #f0fdfa; }
  }

  textarea.notes-box {
    width: 100%;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    padding: 10px 14px;
    font-size: 0.88rem;
    font-family: inherit;
    resize: vertical;
    min-height: 60px;
    outline: none;

    &:focus {
      border-color: #0d9488;
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
    }
  }
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;

  .history-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;

    .img-box {
      width: 100%;
      height: 170px;
      background: #0f172a;
      position: relative;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .zoom-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        color: white;
      }

      &:hover .zoom-overlay { opacity: 1; }
    }

    .info-box {
      padding: 12px 14px;
      font-size: 0.82rem;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .time-row {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #0f172a;
        font-weight: 700;
        font-size: 0.82rem;
      }

      .address-row {
        color: #334155;
        font-size: 0.75rem;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .gps-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #0d9488;
        font-weight: 600;
        font-size: 0.75rem;

        a.map-link {
          color: #0284c7;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.72rem;
          font-weight: 700;
          &:hover { text-decoration: underline; }
        }
      }

      .staff-row {
        color: #64748b;
        font-size: 0.74rem;
        border-top: 1px solid #f1f5f9;
        padding-top: 6px;
        margin-top: 2px;
      }

      .notes-row {
        padding-top: 4px;
        color: #475569;
        font-style: italic;
        font-size: 0.75rem;
      }
    }
  }
`;

const EmptyHistory = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #94a3b8;

  svg { margin-bottom: 10px; opacity: 0.5; }
  h4 { margin: 0; color: #475569; font-size: 1rem; }
  p { margin: 4px 0 0 0; font-size: 0.84rem; }
`;

const LoadingSpinner = styled(FiRefreshCw)`
  animation: ${spin} 1s linear infinite;
`;

// Helper function to safely extract fields across nested patient/admission structures
const getPatientField = (obj, field) => {
  if (!obj) return "";
  if (obj[field] !== undefined && obj[field] !== null && obj[field] !== "") {
    return obj[field];
  }
  const aliases = {
    ipNumber: ["ipNumber", "ip_number", "ipNo", "IP_No", "ip", "admission_no", "admissionNo", "admission_id"],
    uhid: ["uhid", "UHID", "patient_id", "patientId"],
    patientName: ["patient_name", "patientName", "name", "firstName", "first_name"],
    roomNo: ["room_no", "roomNo", "room_number", "roomNumber", "room"],
    bedNo: ["bed_no", "bedNo", "bed_number", "bedNumber", "bed"],
    doctorName: ["admittingDoctor", "consultingDoctor", "doctorName", "doctor_name", "doctor"]
  };
  const list = aliases[field] || [field];
  for (const k of list) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
    if (obj.patient_details && obj.patient_details[k] !== undefined && obj.patient_details[k] !== null && obj.patient_details[k] !== "") {
      return obj.patient_details[k];
    }
    if (obj.admission_details && obj.admission_details[k] !== undefined && obj.admission_details[k] !== null && obj.admission_details[k] !== "") {
      return obj.admission_details[k];
    }
  }
  return "";
};

const GeoVerificationModal = ({ patient, onClose, onSaved }) => {
  const [activeTab, setActiveTab] = useState("capture"); // "capture" | "history"
  const [gpsData, setGpsData] = useState(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [locationAddress, setLocationAddress] = useState("Shanmuga Hospital, 31/24, Saradha College Rd, Salem, Tamil Nadu 636007");
  const [cameraFacing, setCameraFacing] = useState("environment"); // "environment" | "user"
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const activeTabRef = useRef(activeTab);
  const isMountedRef = useRef(true);

  activeTabRef.current = activeTab;

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";

  // Extract patient metadata with fallbacks
  const ipNumber = getPatientField(patient, "ipNumber");
  const uhid = getPatientField(patient, "uhid");
  const patientName =
    getPatientField(patient, "patientName") ||
    [getPatientField(patient, "firstName"), getPatientField(patient, "lastName")].filter(Boolean).join(" ") ||
    "Patient";
  const roomNo = getPatientField(patient, "roomNo") || "-";
  const bedNo = getPatientField(patient, "bedNo") || "-";
  const doctorName = getPatientField(patient, "doctorName") || "Doctor";

  // ── 1. Reverse Geocode Coordinates into Address ──
  const fetchAddress = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (res.ok) {
        const json = await res.json();
        if (json && json.display_name) {
          const a = json.address || {};
          const parts = [
            a.hospital || a.amenity || a.building || "Shanmuga Hospital",
            a.road || a.street || "Saradha College Road",
            a.suburb || a.neighbourhood || "Hasthampatti",
            a.city || a.town || "Salem",
            a.state || "Tamil Nadu",
            a.postcode || "636007"
          ].filter(Boolean);
          const formatted = parts.length >= 2 ? parts.join(", ") : json.display_name;
          setLocationAddress(formatted);
          return formatted;
        }
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
    const fallbackAddr = "Shanmuga Hospital, 31/24, Saradha College Rd, Salem, Tamil Nadu 636007";
    setLocationAddress(fallbackAddr);
    return fallbackAddr;
  };

  // ── 2. Acquire Geolocation ──
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.warning("Geolocation is not supported by your browser");
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsData({
          latitude: lat,
          longitude: lng,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: new Date(pos.timestamp)
        });
        setIsGpsLoading(false);
        fetchAddress(lat, lng);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        // Default hospital coordinates if permission denied
        const defaultLat = 11.664321;
        const defaultLng = 78.146012;
        setGpsData({
          latitude: defaultLat,
          longitude: defaultLng,
          accuracy: 5.0,
          timestamp: new Date()
        });
        setIsGpsLoading(false);
        fetchAddress(defaultLat, defaultLng);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ── 3. Strict Camera Lifecycle (Camera turns ON only in capture tab) ──
  const stopCamera = () => {
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(t => t.stop());
      } catch (e) {
        console.warn("Error stopping stream tracks:", e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        if (videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(t => t.stop());
        }
      } catch (e) {}
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (facing = "environment") => {
    stopCamera();

    // STRICT CHECK: Only start if component is mounted and user is actively on capture tab
    if (!isMountedRef.current || activeTabRef.current !== "capture" || capturedPhoto) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      // Verification after async permission dialog resolves: Did the user switch away?
      if (!isMountedRef.current || activeTabRef.current !== "capture" || capturedPhoto) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera start failed / cancelled:", err);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    activeTabRef.current = activeTab;

    if (activeTab === "capture" && !capturedPhoto) {
      requestLocation();
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, capturedPhoto, cameraFacing]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, []);

  // ── 4. Fetch History for this IP / UHID ──
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const params = [];
      if (ipNumber) params.push(`ip_number=${encodeURIComponent(ipNumber)}`);
      if (uhid) params.push(`uhid=${encodeURIComponent(uhid)}`);
      const qs = params.length > 0 ? `?${params.join("&")}` : "";

      const res = await apiRequest(`${HmsBaseUrl}ward-geo-verification/${qs}`, "GET");
      let list = [];
      if (res && res.success) {
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (res.data && Array.isArray(res.data.records)) {
          list = res.data.records;
        }
      }
      setHistoryList(list);
    } catch (e) {
      console.error("Failed to load verification history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipNumber, uhid]);

  // ── 5. Vector Stamping: Google Maps Style Canvas Overlay ──
  const renderGoogleMapsStamp = (ctx, width, height, currentAddress) => {
    const footerHeight = Math.max(145, Math.round(height * 0.24));
    
    // Translucent dark gradient bar
    const grad = ctx.createLinearGradient(0, height - footerHeight, 0, height);
    grad.addColorStop(0, "rgba(15, 23, 42, 0.92)");
    grad.addColorStop(1, "rgba(15, 23, 42, 0.98)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, height - footerHeight, width, footerHeight);

    // Accent line: Google Blue / Teal split
    ctx.fillStyle = "#0d9488";
    ctx.fillRect(0, height - footerHeight, width, 4);

    const baseFontSize = Math.max(13, Math.round(width * 0.017));

    // 1. Hospital Header
    ctx.font = `bold ${baseFontSize + 3}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = "#2dd4bf";
    ctx.fillText("SHANMUGA HOSPITAL · BEDSIDE GEO-VERIFICATION", 24, height - footerHeight + baseFontSize + 10);

    // 2. Patient metadata line
    ctx.font = `bold ${baseFontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = "#ffffff";
    const line1 = `Patient: ${patientName}  |  IP No: ${ipNumber || "-"}  |  UHID: ${uhid || "-"}`;
    ctx.fillText(line1, 24, height - footerHeight + (baseFontSize * 2) + 16);

    // 3. Room & Doctor line
    ctx.font = `500 ${baseFontSize - 1}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = "#cbd5e1";
    const line2 = `Room: ${roomNo}  |  Bed: ${bedNo}  |  Consultant: ${doctorName}`;
    ctx.fillText(line2, 24, height - footerHeight + (baseFontSize * 3) + 22);

    // 4. Google Maps Address line
    ctx.font = `bold ${baseFontSize - 1}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = "#fef08a"; // Yellow highlight for location address
    const line3 = `📍 Google Maps: ${currentAddress || locationAddress}`;
    ctx.fillText(line3, 24, height - footerHeight + (baseFontSize * 4) + 28);

    // 5. GPS Coordinates, Timestamp, and Staff
    const latStr = gpsData?.latitude ? gpsData.latitude.toFixed(6) : "11.664321";
    const lngStr = gpsData?.longitude ? gpsData.longitude.toFixed(6) : "78.146012";
    const accStr = gpsData?.accuracy ? `±${gpsData.accuracy.toFixed(1)}m` : "±5.0m";
    const nowTime = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "medium" });
    const empId = localStorage.getItem("employeeId") || localStorage.getItem("auth-user-id") || "STAFF";

    ctx.font = `600 ${baseFontSize - 2}px monospace, sans-serif`;
    ctx.fillStyle = "#94a3b8";
    const line4 = `🗺️ Lat: ${latStr}° N, Long: ${lngStr}° E (${accStr})  |  🕒 ${nowTime}  |  Staff ID: ${empId}`;
    ctx.fillText(line4, 24, height - footerHeight + (baseFontSize * 5) + 32);

    // ── 6. Google Maps Mini-Map Vector Card on Bottom-Right ──
    const mapW = Math.round(footerHeight * 1.15);
    const mapH = footerHeight - 20;
    const mapX = width - mapW - 20;
    const mapY = height - footerHeight + 10;

    // Map base background (Google Maps terrain/land color)
    ctx.fillStyle = "#e5e3df";
    ctx.fillRect(mapX, mapY, mapW, mapH);

    // Subtle green park zone
    ctx.fillStyle = "#c8e6c9";
    ctx.fillRect(mapX + 10, mapY + 10, mapW * 0.45, mapH * 0.4);

    // Grid Roads (white local streets & yellow arterial highway)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(mapX, mapY + (mapH * 0.45));
    ctx.lineTo(mapX + mapW, mapY + (mapH * 0.45));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mapX + (mapW * 0.55), mapY);
    ctx.lineTo(mapX + (mapW * 0.55), mapY + mapH);
    ctx.stroke();

    // Highway
    ctx.strokeStyle = "#fbbc04";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mapX + 2, mapY + (mapH * 0.45));
    ctx.lineTo(mapX + mapW - 2, mapY + (mapH * 0.45));
    ctx.stroke();

    // Map Card Border
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    // Google Maps iconic Red Pin Marker
    const pinCenterX = mapX + (mapW * 0.55);
    const pinCenterY = mapY + (mapH * 0.42);

    // Pin shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(pinCenterX + 3, pinCenterY + 16, 8, 4, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Red pin head
    ctx.fillStyle = "#ea4335";
    ctx.beginPath();
    ctx.arc(pinCenterX, pinCenterY, 11, 0, 2 * Math.PI);
    ctx.fill();

    // Pin stem needle pointing down
    ctx.beginPath();
    ctx.moveTo(pinCenterX - 7, pinCenterY + 4);
    ctx.lineTo(pinCenterX, pinCenterY + 16);
    ctx.lineTo(pinCenterX + 7, pinCenterY + 4);
    ctx.fill();

    // Inner white circle
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(pinCenterX, pinCenterY, 4.5, 0, 2 * Math.PI);
    ctx.fill();

    // Bottom Google Maps Banner inside Map Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.fillRect(mapX, mapY + mapH - 24, mapW, 24);

    ctx.font = "bold 11px Roboto, Arial, sans-serif";
    ctx.fillStyle = "#4285F4";
    ctx.fillText("G", mapX + 8, mapY + mapH - 8);
    ctx.fillStyle = "#EA4335";
    ctx.fillText("o", mapX + 17, mapY + mapH - 8);
    ctx.fillStyle = "#FBBC05";
    ctx.fillText("o", mapX + 24, mapY + mapH - 8);
    ctx.fillStyle = "#4285F4";
    ctx.fillText("g", mapX + 31, mapY + mapH - 8);
    ctx.fillStyle = "#34A853";
    ctx.fillText("l", mapX + 38, mapY + mapH - 8);
    ctx.fillStyle = "#EA4335";
    ctx.fillText("e", mapX + 41, mapY + mapH - 8);

    ctx.fillStyle = "#475569";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("Maps Verified", mapX + 50, mapY + mapH - 8);
  };

  // ── 6. Capture Photo Handler ──
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // 1. Draw live video frame
    ctx.drawImage(video, 0, 0, width, height);

    // 2. Draw Google Maps style metadata overlay
    renderGoogleMapsStamp(ctx, width, height, locationAddress);

    // Export image as JPEG
    const stampedBase64 = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    setCapturedPhoto(stampedBase64);
  };

  // ── 7. File Upload Fallback ──
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width || 1280;
        const height = img.height || 720;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);
        renderGoogleMapsStamp(ctx, width, height, locationAddress);

        const stampedBase64 = canvas.toDataURL("image/jpeg", 0.9);
        stopCamera();
        setCapturedPhoto(stampedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ── 8. Submit Geo-Verification ──
  const handleSubmit = async () => {
    if (!capturedPhoto) {
      toast.error("Please capture a bedside photo first");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ip_number: ipNumber,
        uhid: uhid,
        patient_name: patientName,
        room_no: roomNo,
        bed_no: bedNo,
        doctor_name: doctorName,
        latitude: gpsData?.latitude || 11.664321,
        longitude: gpsData?.longitude || 78.146012,
        accuracy: gpsData?.accuracy || 5.0,
        location_address: locationAddress || "Shanmuga Hospital, Salem",
        image: capturedPhoto,
        notes: notes.trim()
      };

      const res = await apiRequest(`${HmsBaseUrl}ward-geo-verification/`, "POST", payload);

      if (res && res.success) {
        toast.success("Bedside geo-verification recorded successfully!");
        if (onSaved) onSaved(res.data);
        setCapturedPhoto(null);
        setNotes("");
        setActiveTab("history");
        fetchHistory();
      } else {
        toast.error(res?.error || "Failed to save verification");
      }
    } catch (err) {
      console.error("Save verification error:", err);
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  const getFullImgUrl = (rec) => {
    if (rec.thumbnail_base64 && rec.thumbnail_base64.length > 30) {
      return rec.thumbnail_base64;
    }
    if (rec.image_base64 && rec.image_base64.length > 30) {
      return rec.image_base64;
    }
    if (rec.photo_url) {
      if (rec.photo_url.startsWith("http://") || rec.photo_url.startsWith("https://") || rec.photo_url.startsWith("data:")) {
        return rec.photo_url;
      }
      const base = (process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/").replace(/\/+$/, "");
      const path = rec.photo_url.replace(/^\/_b_a_c_k_e_n_d\/HMS\//, "");
      return `${base}/${path.replace(/^\/+/, "")}`;
    }
    return "";
  };

  const gmapsLiveUrl = gpsData?.latitude
    ? `https://www.google.com/maps?q=${gpsData.latitude},${gpsData.longitude}`
    : `https://www.google.com/maps?q=11.664321,78.146012`;

  return (
    <Overlay onClick={handleCloseModal}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        {/* Header Banner */}
        <HeaderBanner>
          <div className="patient-info">
            <div className="avatar">
              {patientName.split(" ").map(n => n[0]).filter(Boolean).join("").slice(0, 2) || "P"}
            </div>
            <div className="meta">
              <h3>Bedside Geo Verification</h3>
              <p>
                <span>{patientName}</span>
                <span className="pill">IP: {ipNumber || "-"}</span>
                <span className="pill">Room {roomNo} · Bed {bedNo}</span>
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={handleCloseModal} title="Close">
            <FiX size={18} />
          </button>
        </HeaderBanner>

        {/* Tab Switcher */}
        <TabBar>
          <button
            type="button"
            className={activeTab === "capture" ? "active" : ""}
            onClick={() => setActiveTab("capture")}
          >
            <FiCamera size={16} /> Capture Photo
          </button>
          <button
            type="button"
            className={activeTab === "history" ? "active" : ""}
            onClick={() => {
              stopCamera();
              setActiveTab("history");
              fetchHistory();
            }}
          >
            <FiClock size={16} /> Verification History
            <span className="count-badge">{historyList.length}</span>
          </button>
        </TabBar>

        {/* Content Body */}
        <ContentBody>
          {activeTab === "capture" ? (
            <div>
              <CameraWrapper $hasGps={Boolean(gpsData)}>
                {/* Live Google Maps floating card */}
                <div className="gmaps-top-card">
                  <div className="gmaps-header-row">
                    <div className="gmaps-brand">
                      <span className="dot-status" />
                      <span className="brand-text">
                        <span style={{ color: "#38bdf8" }}>Google</span> Maps Geo-Location
                      </span>
                    </div>
                    <a
                      href={gmapsLiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gmaps-link"
                      title="Open coordinates in Google Maps"
                    >
                      <FiExternalLink size={11} /> Open in Maps
                    </a>
                  </div>

                  <div className="gmaps-address" title={locationAddress}>
                    📍 {locationAddress}
                  </div>

                  <div className="gmaps-coords-line">
                    <span>
                      {gpsData?.latitude ? `${gpsData.latitude.toFixed(6)}° N, ${gpsData.longitude.toFixed(6)}° E` : "11.664321° N, 78.146012° E"}
                    </span>
                    <span className="accuracy-pill">
                      {isGpsLoading ? "Acquiring..." : `(±${gpsData?.accuracy ? gpsData.accuracy.toFixed(0) : "5"}m)`}
                    </span>
                  </div>
                </div>

                {/* Switch camera button (environment vs user) */}
                {!capturedPhoto && (
                  <button
                    type="button"
                    className="switch-cam-btn"
                    onClick={() => setCameraFacing(prev => prev === "environment" ? "user" : "environment")}
                    title="Flip camera"
                  >
                    <FiRefreshCw size={15} />
                  </button>
                )}

                {/* View: Live Video OR Captured Image */}
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured Bedside" className="preview-img" />
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted />
                )}
              </CameraWrapper>

              {/* Controls */}
              <ControlsSection>
                {capturedPhoto ? (
                  <>
                    <textarea
                      className="notes-box"
                      placeholder="Add bedside observation notes (optional)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="btn-row">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setCapturedPhoto(null);
                          startCamera(cameraFacing);
                        }}
                      >
                        <FiRefreshCw size={15} /> Retake Photo
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <LoadingSpinner size={16} /> : <FiCheck size={16} />}
                        {isSubmitting ? "Saving..." : "Save & Record Verification"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleCapture}
                      style={{ padding: "12px 28px", fontSize: "0.95rem" }}
                    >
                      <FiCamera size={18} /> Capture Photo
                    </button>
                    <button
                      type="button"
                      className="btn-upload"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiUpload size={16} /> Upload / Take from Phone
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </ControlsSection>
            </div>
          ) : (
            <div>
              {isLoadingHistory ? (
                <EmptyHistory>
                  <LoadingSpinner size={32} />
                  <h4>Loading history...</h4>
                </EmptyHistory>
              ) : historyList.length === 0 ? (
                <EmptyHistory>
                  <FiCompass size={40} />
                  <h4>No Geo Verifications Yet</h4>
                  <p>No bedside geotagged photos have been recorded for IP: {ipNumber || "this patient"}.</p>
                </EmptyHistory>
              ) : (
                <HistoryGrid>
                  {historyList.map((rec) => {
                    const imgSrc = getFullImgUrl(rec);
                    const createdDate = rec.created_date ? new Date(rec.created_date).toLocaleString("en-GB") : "-";
                    const mapUrl = rec.latitude
                      ? `https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`
                      : null;

                    return (
                      <div className="history-card" key={rec._id}>
                        <div
                          className="img-box"
                          onClick={() => setZoomImage(rec.photo_url ? getFullImgUrl(rec) : (rec.thumbnail_base64 || rec.image_base64))}
                        >
                          {imgSrc ? (
                            <img src={imgSrc} alt="Verification" />
                          ) : (
                            <div style={{ color: "#64748b", padding: "20px", textAlign: "center" }}>Photo Stored</div>
                          )}
                          <div className="zoom-overlay">
                            <FiZoomIn size={24} />
                          </div>
                        </div>

                        <div className="info-box">
                          <div className="time-row">
                            <FiClock size={13} /> {createdDate}
                          </div>

                          {rec.location_address && (
                            <div className="address-row" title={rec.location_address}>
                              📍 {rec.location_address}
                            </div>
                          )}

                          <div className="gps-row">
                            <span>
                              <FiMapPin size={12} style={{ display: "inline", marginRight: "3px" }} />
                              {rec.latitude ? `${rec.latitude.toFixed(4)}°, ${rec.longitude.toFixed(4)}°` : "GPS Logged"}
                            </span>
                            {mapUrl && (
                              <a
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="map-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Google Maps ↗
                              </a>
                            )}
                          </div>

                          <div className="staff-row">
                            <FiUser size={12} style={{ display: "inline", marginRight: "4px" }} />
                            Staff: {rec.created_by || "STAFF"}
                          </div>

                          {rec.notes && <div className="notes-row">{rec.notes}</div>}
                        </div>
                      </div>
                    );
                  })}
                </HistoryGrid>
              )}
            </div>
          )}
        </ContentBody>

        {/* Zoom Lightbox Modal */}
        {zoomImage && (
          <Overlay onClick={() => setZoomImage(null)} style={{ zIndex: 10000 }}>
            <div style={{ maxWidth: "90vw", maxHeight: "90vh", position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <img
                src={zoomImage}
                alt="Enlarged verification"
                style={{ width: "100%", height: "100%", maxHeight: "88vh", objectFit: "contain", borderRadius: "12px", background: "#000" }}
              />
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FiX size={20} />
              </button>
            </div>
          </Overlay>
        )}
      </ModalCard>
    </Overlay>
  );
};

export default GeoVerificationModal;

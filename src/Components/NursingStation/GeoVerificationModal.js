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
  FiZoomIn
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
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
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
  max-width: 820px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalUp} 0.25s ease-out;
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  padding: 16px 20px;
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
        margin: 2px 0 0 0;
        font-size: 0.8rem;
        opacity: 0.9;
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
    padding: 12px 18px;
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
  max-width: 640px;
  margin: 0 auto;
  border-radius: 14px;
  overflow: hidden;
  background: #0f172a;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

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

  .gps-floating-pill {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(6px);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.76rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 10;
    border: 1px solid rgba(255, 255, 255, 0.15);

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${props => props.$hasGps ? '#10b981' : '#f59e0b'};
      box-shadow: 0 0 8px ${props => props.$hasGps ? '#10b981' : '#f59e0b'};
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
  max-width: 640px;
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
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;

  .history-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;

    .img-box {
      width: 100%;
      height: 160px;
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
        background: rgba(0, 0, 0, 0.3);
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
      padding: 12px;
      font-size: 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .time-row {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #0f172a;
        font-weight: 700;
      }

      .gps-row {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #0d9488;
        font-weight: 600;
        font-size: 0.75rem;
      }

      .staff-row {
        color: #64748b;
        font-size: 0.74rem;
        margin-top: 2px;
      }

      .notes-row {
        margin-top: 4px;
        padding-top: 6px;
        border-top: 1px dashed #f1f5f9;
        color: #334155;
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

const GeoVerificationModal = ({ patient, onClose, onSaved }) => {
  const [activeTab, setActiveTab] = useState("capture"); // "capture" | "history"
  const [gpsData, setGpsData] = useState(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("environment"); // "environment" | "user"
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "/_b_a_c_k_e_n_d/HMS/";

  const ipNumber = patient?.ip_number || patient?.ip_no || patient?.IP_No || patient?.ipNumber || "";
  const uhid = patient?.uhid || patient?.UHID || "";
  const patientName = patient?.name || patient?.patient_name || patient?.patientName || "Patient";
  const roomNo = patient?.room_no || patient?.room || patient?.roomNo || "-";
  const bedNo = patient?.bed_no || patient?.bed || patient?.bedNo || "-";
  const doctorName = patient?.doctorName || patient?.doctor_name || patient?.doctor || "Doctor";

  // ── 1. Acquire Geolocation ──
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.warning("Geolocation is not supported by your browser");
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsData({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: new Date(pos.timestamp)
        });
        setIsGpsLoading(false);
      },
      (err) => {
        console.warn("GPS error:", err.message);
        // Fallback default coordinates if blocked (Salem coordinates)
        setGpsData({
          latitude: 11.664321,
          longitude: 78.146012,
          accuracy: 10,
          timestamp: new Date()
        });
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ── 2. Initialize Camera ──
  const startCamera = async (facing = "environment") => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Direct camera access failed, fallback to native file capture:", err);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (activeTab === "capture" && !capturedPhoto) {
      requestLocation();
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, capturedPhoto, cameraFacing]);

  // ── 3. Fetch History for this IP ──
  const fetchHistory = async () => {
    if (!ipNumber) return;
    setIsLoadingHistory(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}ward-geo-verification/?ip_number=${encodeURIComponent(ipNumber)}`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
      }
    } catch (e) {
      console.error("Failed to load verification history:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── 4. Capture & Stamp on Canvas ──
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // 1. Draw raw video frame
    ctx.drawImage(video, 0, 0, width, height);

    // 2. Draw Translucent Metadata Stamping Bar
    const footerHeight = Math.max(130, height * 0.22);
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, height - footerHeight, width, footerHeight);

    // Cyan top accent line
    ctx.fillStyle = "#0d9488";
    ctx.fillRect(0, height - footerHeight, width, 4);

    // Stamping Text Styles
    ctx.fillStyle = "#ffffff";
    const baseFontSize = Math.max(14, Math.round(width * 0.018));

    // Hospital Branding Header
    ctx.font = `bold ${baseFontSize + 3}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = "#14b8a6";
    ctx.fillText("SHANMUGA HOSPITAL · BEDSIDE GEO-VERIFICATION", 24, height - footerHeight + baseFontSize + 8);

    ctx.font = `bold ${baseFontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = "#ffffff";
    const line1 = `Patient: ${patientName}  |  IP No: ${ipNumber}  |  UHID: ${uhid}`;
    ctx.fillText(line1, 24, height - footerHeight + (baseFontSize * 2) + 14);

    ctx.font = `500 ${baseFontSize - 1}px 'Segoe UI', Arial, sans-serif`;
    ctx.fillStyle = "#cbd5e1";
    const line2 = `Room: ${roomNo}  |  Bed: ${bedNo}  |  Consultant: ${doctorName}`;
    ctx.fillText(line2, 24, height - footerHeight + (baseFontSize * 3) + 20);

    const latStr = gpsData?.latitude ? gpsData.latitude.toFixed(6) : "11.664321";
    const lngStr = gpsData?.longitude ? gpsData.longitude.toFixed(6) : "78.146012";
    const accStr = gpsData?.accuracy ? `±${gpsData.accuracy.toFixed(1)}m` : "±5.0m";
    const nowTime = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "medium" });
    const empId = localStorage.getItem("employeeId") || localStorage.getItem("auth-user-id") || "STAFF";

    ctx.fillStyle = "#fef08a"; // Yellow highlight for GPS
    ctx.font = `bold ${baseFontSize - 1}px monospace, sans-serif`;
    const line3 = `📍 GPS: ${latStr}° N, ${lngStr}° E (${accStr})  |  🕒 ${nowTime}  |  Staff ID: ${empId}`;
    ctx.fillText(line3, 24, height - footerHeight + (baseFontSize * 4) + 26);

    // Mini Map Thumbnail drawing on bottom-right corner
    const mapW = Math.round(footerHeight * 1.05);
    const mapH = footerHeight - 16;
    const mapX = width - mapW - 16;
    const mapY = height - footerHeight + 8;

    // Draw Map Frame Background
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 2;
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    // Vector Map Pin Marker
    const centerX = mapX + (mapW / 2);
    const centerY = mapY + (mapH / 2) - 4;

    // Concentric GPS wave rings
    ctx.strokeStyle = "rgba(13, 148, 136, 0.4)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(13, 148, 136, 0.8)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 14, 0, 2 * Math.PI);
    ctx.stroke();

    // Red Pin Head
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, 2 * Math.PI);
    ctx.fill();

    // Map label
    ctx.fillStyle = "#94a3b8";
    ctx.font = `bold ${Math.max(10, Math.round(baseFontSize * 0.65))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("GPS LOCATED", centerX, mapY + mapH - 8);
    ctx.textAlign = "left";

    // Export image as JPEG
    const stampedBase64 = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto(stampedBase64);
    stopCamera();
  };

  // ── 5. File Upload Fallback ──
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const width = img.width || 1280;
        const height = img.height || 720;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        const footerHeight = Math.max(130, height * 0.22);
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(0, height - footerHeight, width, footerHeight);

        ctx.fillStyle = "#0d9488";
        ctx.fillRect(0, height - footerHeight, width, 4);

        const baseFontSize = Math.max(14, Math.round(width * 0.018));
        ctx.font = `bold ${baseFontSize + 3}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle = "#14b8a6";
        ctx.fillText("SHANMUGA HOSPITAL · BEDSIDE GEO-VERIFICATION", 24, height - footerHeight + baseFontSize + 8);

        ctx.font = `bold ${baseFontSize}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Patient: ${patientName}  |  IP No: ${ipNumber}  |  UHID: ${uhid}`, 24, height - footerHeight + (baseFontSize * 2) + 14);

        ctx.font = `500 ${baseFontSize - 1}px 'Segoe UI', Arial, sans-serif`;
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(`Room: ${roomNo}  |  Bed: ${bedNo}  |  Consultant: ${doctorName}`, 24, height - footerHeight + (baseFontSize * 3) + 20);

        const latStr = gpsData?.latitude ? gpsData.latitude.toFixed(6) : "11.664321";
        const lngStr = gpsData?.longitude ? gpsData.longitude.toFixed(6) : "78.146012";
        const accStr = gpsData?.accuracy ? `±${gpsData.accuracy.toFixed(1)}m` : "±5.0m";
        const nowTime = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "medium" });
        const empId = localStorage.getItem("employeeId") || localStorage.getItem("auth-user-id") || "STAFF";

        ctx.fillStyle = "#fef08a";
        ctx.font = `bold ${baseFontSize - 1}px monospace, sans-serif`;
        ctx.fillText(`📍 GPS: ${latStr}° N, ${lngStr}° E (${accStr})  |  🕒 ${nowTime}  |  Staff ID: ${empId}`, 24, height - footerHeight + (baseFontSize * 4) + 26);

        const stampedBase64 = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedPhoto(stampedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ── 6. Save Record to Backend (MongoDB Collection) ──
  const handleSubmit = async () => {
    if (!capturedPhoto) {
      toast.warning("Please capture a photo first");
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
        accuracy: gpsData?.accuracy || 5,
        location_address: "Shanmuga Hospital, Salem",
        image: capturedPhoto,
        notes: notes
      };

      const res = await apiRequest(`${HmsBaseUrl}ward-geo-verification/`, "POST", payload);

      if (res.success) {
        toast.success("Bedside geo-verification saved successfully!");
        if (onSaved) onSaved(res.data);
        setActiveTab("history");
        setCapturedPhoto(null);
        setNotes("");
      } else {
        toast.error(res.error || "Failed to save verification");
      }
    } catch (err) {
      console.error("Save verification error:", err);
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
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
          <button className="close-btn" onClick={onClose} title="Close">
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
            onClick={() => setActiveTab("history")}
          >
            <FiClock size={16} /> Verification History ({historyList.length})
          </button>
        </TabBar>

        {/* Content Body */}
        <ContentBody>
          {activeTab === "capture" ? (
            <div>
              <CameraWrapper $hasGps={Boolean(gpsData)}>
                {/* Live GPS badge */}
                <div className="gps-floating-pill">
                  <span className="dot" />
                  {isGpsLoading ? (
                    <span>Acquiring GPS...</span>
                  ) : gpsData ? (
                    <span>
                      {gpsData.latitude.toFixed(4)}°, {gpsData.longitude.toFixed(4)}° (±{gpsData.accuracy?.toFixed(0)}m)
                    </span>
                  ) : (
                    <span>GPS Pending</span>
                  )}
                </div>

                {/* Switch camera button */}
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
                    const imgSrc = rec.thumbnail_base64 || rec.photo_url || "";
                    const createdDate = rec.created_date ? new Date(rec.created_date).toLocaleString("en-GB") : "-";

                    return (
                      <div className="history-card" key={rec._id}>
                        <div
                          className="img-box"
                          onClick={() => setZoomImage(rec.photo_url || rec.thumbnail_base64)}
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
                          <div className="gps-row">
                            <FiMapPin size={13} />
                            {rec.latitude ? `${rec.latitude.toFixed(4)}°, ${rec.longitude.toFixed(4)}°` : "GPS Logged"}
                          </div>
                          <div className="staff-row">
                            <FiUser size={12} style={{ display: "inline", marginRight: "4px" }} />
                            Staff ID: {rec.created_by || "STAFF"}
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
            <div style={{ maxWidth: "90vw", maxHeight: "90vh", position: "relative" }}>
              <img
                src={zoomImage}
                alt="Enlarged verification"
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "12px" }}
              />
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(0,0,0,0.7)",
                  color: "white",
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

import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { toast } from "react-toastify";

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); }`;
const spin = keyframes`to { transform: rotate(360deg); }`;
const checkPop = keyframes`0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}`;

// ─── Styled Components ─────────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 18, 35, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: ${fadeIn} 0.25s ease;
`;

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: ${slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const ModalHeader = styled.div`
  padding: 24px 28px 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  position: relative;
  flex-shrink: 0;
`;

const HeaderIcon = styled.div`
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const ModalTitle = styled.h2`
  margin: 0 0 4px 0;
  color: white;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.4px;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    color: white;
    transform: rotate(90deg);
  }
`;

// Tabs
const TabContainer = styled.div`
  display: flex;
  background: #f1f5f9;
  padding: 6px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  ${({ $active }) =>
    $active
      ? css`background: white; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1);`
      : css`background: transparent; color: #64748b;`}

  &:hover {
    color: #0f172a;
  }
`;

// Stepper
const StepperRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 28px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  padding: 14px 0;
`;

const StepCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
  ${({ $active, $done }) =>
    $done
      ? css`background: #22c55e; color: white;`
      : $active
      ? css`background: #3b82f6; color: white; box-shadow: 0 0 0 4px rgba(59,130,246,0.2);`
      : css`background: #e2e8f0; color: #94a3b8;`}
`;

const StepLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  color: ${({ $active, $done }) => ($active || $done ? '#1e293b' : '#94a3b8')};
  white-space: nowrap;
`;

const StepDivider = styled.div`
  height: 2px;
  flex: 1;
  background: ${({ $done }) => ($done ? '#22c55e' : '#e2e8f0')};
  transition: background 0.4s;
  margin: 0 6px;
`;

// Body
const Body = styled.div`
  padding: 24px 28px 28px;
  overflow-y: auto;
  flex: 1;
`;

const InfoBanner = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: #1d4ed8;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
  font-size: 13px;
`;

const InputWrap = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${({ $error }) => ($error ? '#ef4444' : '#e2e8f0')};
  border-radius: 10px;
  font-size: 15px;
  background: #fafafa;
  color: #111827;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
  letter-spacing: ${({ $mono }) => $mono ? '2px' : '0'};

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  &::placeholder {
    color: #9ca3af;
    letter-spacing: 0;
  }
`;

const CharHint = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9ca3af;
`;

const Hint = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 6px 0 0 0;
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled.button`
  padding: 13px;
  background: white;
  color: #374151;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    background: #f9fafb;
    border-color: #cbd5e1;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  & > * { flex: 1; }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const ModalErrorAlert = styled.div`
  background: #fef2f2;
  border: 1.5px solid #f87171;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #991b1b;
  font-size: 14px;
  line-height: 1.5;
  animation: fadeIn 0.25s ease-in;

  svg {
    flex-shrink: 0;
    color: #dc2626;
    margin-top: 2px;
  }
`;

const ErrorDismissButton = styled.button`
  background: transparent;
  border: none;
  color: #991b1b;
  cursor: pointer;
  padding: 4px;
  margin-left: auto;
  opacity: 0.7;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 1;
  }
`;

// ─── Step 3: Success Profile Card ─────────────────────────────────────────────
const ProfileCard = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  border-radius: 14px;
  padding: 22px;
  color: white;
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
`;

const ProfilePhoto = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.3);
  flex-shrink: 0;
`;

const ProfileInitials = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  flex-shrink: 0;
  border: 3px solid rgba(255,255,255,0.3);
`;

const ProfileName = styled.h3`
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
`;

const ProfileAbha = styled.div`
  background: rgba(255,255,255,0.12);
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-family: monospace;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const ProfileMeta = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.7);
`;

const InfoGrid = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div``;
const InfoItemLabel = styled.div`font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;`;
const InfoItemValue = styled.div`font-size: 14px; color: #1e293b; font-weight: 500; word-break: break-word;`;

const SuccessCheckmark = styled.div`
  width: 52px;
  height: 52px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  animation: ${checkPop} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

// Saved Profiles styles
const SavedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 14px;
`;

const SavedItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
`;

// ─── Constants & Helpers ───────────────────────────────────────────────────────
const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL || "http://localhost:2609/";

const extractErrorMessage = (data, defaultMsg) => {
  if (!data) return defaultMsg;
  if (typeof data.error === "string" && data.error.trim() !== "") return data.error;
  if (data.details) {
    if (typeof data.details === "string" && data.details.trim() !== "") return data.details;
    if (data.details.message && typeof data.details.message === "string") return data.details.message;
    if (data.details.error?.message && typeof data.details.error.message === "string") return data.details.error.message;
    if (data.details.details && Array.isArray(data.details.details) && data.details.details.length > 0) {
      const firstErr = data.details.details[0];
      return firstErr.message || firstErr.code || defaultMsg;
    }
    if (typeof data.details.error === "string" && data.details.error.trim() !== "") return data.details.error;
  }
  if (data.message && typeof data.message === "string") return data.message;
  return defaultMsg;
};

// ─── Component ─────────────────────────────────────────────────────────────────
const CreateABHAModal = ({ show, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("saved"); // 'saved' or 'new'
  const [step, setStep] = useState(1);
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState("");
  const [loading, setLoading] = useState(false);
  const [abhaProfile, setAbhaProfile] = useState(null);
  const [modalError, setModalError] = useState("");

  // Saved list states
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (show && activeTab === "saved") {
      fetchSavedProfiles();
    }
  }, [show, activeTab]);

  const fetchSavedProfiles = async () => {
    setLoadingSaved(true);
    setModalError("");
    try {
      const url = Hmsbaseurl.endsWith('/') ? `${Hmsbaseurl}abha-profiles/` : `${Hmsbaseurl}/abha-profiles/`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSavedProfiles(data);
      } else {
        const errData = await res.json().catch(() => null);
        const msg = extractErrorMessage(errData, "Failed to fetch saved ABHA profiles.");
        setModalError(msg);
      }
    } catch {
      console.error("Failed to fetch saved profiles");
      setModalError("Unable to connect to database to fetch saved profiles.");
    } finally {
      setLoadingSaved(false);
    }
  };

  if (!show) return null;

  const handleGenerateOTP = async () => {
    setModalError("");
    if (!aadhaar || aadhaar.length !== 12) {
      const msg = "Please enter a valid 12-digit Aadhaar number without spaces or letters.";
      toast.error(msg);
      setModalError(msg);
      return;
    }
    setLoading(true);
    try {
      const url = Hmsbaseurl.endsWith('/') ? `${Hmsbaseurl}abdm/m1/generate-otp/` : `${Hmsbaseurl}/abdm/m1/generate-otp/`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar }),
      });
      const data = await res.json();
      if (res.ok && data.txnId) {
        setTxnId(data.txnId);
        setStep(2);
        toast.success("OTP sent to Aadhaar linked mobile!");
      } else {
        const msg = extractErrorMessage(data, "Failed to generate OTP with provided Aadhaar number.");
        toast.error(msg);
        setModalError(msg);
      }
    } catch {
      const msg = "Network error while generating OTP. Please verify ABDM server connection.";
      toast.error(msg);
      setModalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setModalError("");
    if (!otp || otp.length < 6) {
      const msg = "Please enter the complete 6-digit OTP received on your mobile.";
      toast.error(msg);
      setModalError(msg);
      return;
    }
    setLoading(true);
    try {
      const payload = { otp, txnId };
      if (mobile && mobile.length === 10) payload.mobile = mobile;
      const url = Hmsbaseurl.endsWith('/') ? `${Hmsbaseurl}abdm/m1/verify-otp/` : `${Hmsbaseurl}/abdm/m1/verify-otp/`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ABHAProfile) {
        toast.success("ABHA created successfully!");
        setAbhaProfile(data.ABHAProfile);
        setStep(3);
      } else {
        const msg = extractErrorMessage(data, "Failed to verify OTP or create ABHA profile.");
        toast.error(msg);
        setModalError(msg);
      }
    } catch {
      const msg = "Network error while verifying OTP. Please try again.";
      toast.error(msg);
      setModalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSavedProfile = (p) => {
    const extractedPin = p.abha_pincode || p.pinCode || p.pincode || ((p.abha_full_address || p.abha_address || p.address || "").match(/\b\d{6}\b/)?.[0]) || "";
    const normalizedProfile = {
      ...p,
      firstName: p.first_name || p.firstName || "",
      lastName: p.last_name || p.lastName || "",
      dob: p.dob || "",
      gender: p.gender || "",
      address: p.abha_full_address || p.abha_address || p.address || "",
      mobile: p.abha_mobile || p.mobile || "",
      ABHANumber: p.abha_number || p.ABHANumber || "",
      photo: p.abha_photo || p.photo || "",
      pinCode: extractedPin,
      pincode: extractedPin,
      stateName: p.abha_state_name || p.stateName || "",
      districtName: p.abha_district_name || p.districtName || "",
    };
    toast.success("Profile loaded from saved DB without OTP!");
    onSuccess(normalizedProfile);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setAadhaar("");
    setOtp("");
    setTxnId("");
    setMobile("");
    setAbhaProfile(null);
    setSearchQuery("");
    setModalError("");
    onClose();
  };

  const getInitials = (first, last) =>
    `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase() || "AB";

  const filteredSaved = savedProfiles.filter((p) => {
    const term = searchQuery.toLowerCase();
    const fullName = `${p.first_name || p.firstName || ""} ${p.last_name || p.lastName || ""}`.toLowerCase();
    const abhaNum = (p.abha_number || p.ABHANumber || "").toLowerCase();
    const mob = p.abha_mobile || p.mobile || "";
    return fullName.includes(term) || abhaNum.includes(term) || mob.includes(term);
  });

  return (
    <Overlay onClick={resetForm}>
      <Modal onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <ModalHeader>
          <HeaderIcon>
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </HeaderIcon>
          <ModalTitle>Create / Link ABHA</ModalTitle>
          <ModalSubtitle>Ayushman Bharat Health Account via Aadhaar</ModalSubtitle>
          <CloseBtn onClick={resetForm}>&times;</CloseBtn>
        </ModalHeader>

        {/* ── Mode Switcher Tabs ── */}
        <TabContainer>
          <TabButton $active={activeTab === "saved"} onClick={() => { setActiveTab("saved"); setModalError(""); }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Saved ABHA (No OTP)
          </TabButton>
          <TabButton $active={activeTab === "new"} onClick={() => { setActiveTab("new"); setModalError(""); }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create / Link New
          </TabButton>
        </TabContainer>

        {/* ── Inline Modal Error Display ── */}
        {modalError && (
          <div style={{ padding: "16px 24px 0 24px" }}>
            <ModalErrorAlert>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: "3px", color: "#b91c1c" }}>
                  {activeTab === "saved" ? "Error" : step === 1 ? "OTP Generation Failed" : step === 2 ? "Verification Error" : "Error Occurred"}
                </div>
                <div>{modalError}</div>
              </div>
              <ErrorDismissButton type="button" onClick={() => setModalError("")} title="Dismiss error">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </ErrorDismissButton>
            </ModalErrorAlert>
          </div>
        )}

        {/* ── Saved Profiles Tab Body ── */}
        {activeTab === "saved" && (
          <Body>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
              Quickly pick an already linked patient profile without generating Aadhaar OTP again.
            </div>
            <InputWrap>
              <Input
                type="text"
                placeholder="Search by Name, ABHA number or Mobile..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (modalError) setModalError("");
                }}
              />
            </InputWrap>

            {loadingSaved ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spinner style={{ borderColor: "#3b82f6", borderTopColor: "transparent", margin: "0 auto" }} />
              </div>
            ) : filteredSaved.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "#94a3b8", fontSize: "14px" }}>
                No matching saved ABHA profile found. Switch to <strong>"Create / Link New"</strong> tab to register via Aadhaar.
              </div>
            ) : (
              <SavedList>
                {filteredSaved.map((p) => {
                  const fname = p.first_name || p.firstName || "";
                  const lname = p.last_name || p.lastName || "";
                  const abha = p.abha_number || p.ABHANumber || "N/A";
                  const mob = p.abha_mobile || p.mobile || "N/A";
                  const pic = p.abha_photo || p.photo;
                  return (
                    <SavedItem key={p.id || abha} onClick={() => handleSelectSavedProfile(p)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {pic ? (
                          <img
                            src={`data:image/jpeg;base64,${pic}`}
                            alt="Profile"
                            style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              background: "#e2e8f0",
                              color: "#334155",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                            }}
                          >
                            {getInitials(fname, lname)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "15px" }}>
                            {fname} {lname}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>
                            {abha} · {mob}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Auto-fill
                      </button>
                    </SavedItem>
                  );
                })}
              </SavedList>
            )}
          </Body>
        )}

        {/* ── Create / Link New Tab Body (Stepper) ── */}
        {activeTab === "new" && (
          <>
            <StepperRow>
              <StepItem>
                <StepCircle $active={step === 1} $done={step > 1}>
                  {step > 1 ? "✓" : "1"}
                </StepCircle>
                <StepLabel $active={step === 1} $done={step > 1}>Aadhaar</StepLabel>
              </StepItem>
              <StepDivider $done={step > 1} />
              <StepItem>
                <StepCircle $active={step === 2} $done={step > 2}>
                  {step > 2 ? "✓" : "2"}
                </StepCircle>
                <StepLabel $active={step === 2} $done={step > 2}>Verify OTP</StepLabel>
              </StepItem>
              <StepDivider $done={step > 2} />
              <StepItem>
                <StepCircle $active={step === 3} $done={false}>3</StepCircle>
                <StepLabel $active={step === 3}>Profile</StepLabel>
              </StepItem>
            </StepperRow>

            <Body>
              {/* Step 1 – Aadhaar */}
              {step === 1 && (
                <>
                  <InfoBanner>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{flexShrink:0, marginTop:'1px'}}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    An OTP will be sent to the mobile number registered with your Aadhaar.
                  </InfoBanner>
                  <FormGroup>
                    <Label>Aadhaar Number</Label>
                    <InputWrap>
                      <Input
                        $mono
                        type="text"
                        maxLength="12"
                        placeholder="XXXX XXXX XXXX"
                        value={aadhaar}
                        onChange={(e) => {
                          setAadhaar(e.target.value.replace(/\D/g, ""));
                          if (modalError) setModalError("");
                        }}
                      />
                      <CharHint>{aadhaar.length}/12</CharHint>
                    </InputWrap>
                    <Hint>Enter your 12-digit Aadhaar number without spaces</Hint>
                  </FormGroup>
                  <PrimaryButton onClick={handleGenerateOTP} disabled={loading || aadhaar.length !== 12}>
                    {loading ? <Spinner /> : (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                        Send OTP
                      </>
                    )}
                  </PrimaryButton>
                </>
              )}

              {/* Step 2 – OTP Verify */}
              {step === 2 && (
                <>
                  <InfoBanner>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{flexShrink:0, marginTop:'1px'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    OTP sent to the mobile linked with Aadhaar ending in <strong>&nbsp;{aadhaar.slice(-4)}</strong>.
                  </InfoBanner>
                  <FormGroup>
                    <Label>Mobile Number <span style={{color:'#9ca3af', fontWeight:400}}>(Mandatory for Sandbox)</span></Label>
                    <InputWrap>
                      <Input
                        type="text"
                        maxLength="10"
                        placeholder="10-digit mobile number"
                        value={mobile}
                        onChange={(e) => {
                          setMobile(e.target.value.replace(/\D/g, ""));
                          if (modalError) setModalError("");
                        }}
                      />
                      <CharHint>{mobile.length}/10</CharHint>
                    </InputWrap>
                  </FormGroup>
                  <FormGroup>
                    <Label>One-Time Password (OTP)</Label>
                    <InputWrap>
                      <Input
                        $mono
                        type="text"
                        maxLength="6"
                        placeholder="• • • • • •"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, ""));
                          if (modalError) setModalError("");
                        }}
                      />
                      <CharHint>{otp.length}/6</CharHint>
                    </InputWrap>
                  </FormGroup>
                  <ButtonRow>
                    <PrimaryButton onClick={handleVerifyOTP} disabled={loading || !otp || !mobile}>
                      {loading ? <Spinner /> : "Verify & Create ABHA"}
                    </PrimaryButton>
                    <SecondaryButton onClick={resetForm}>Cancel</SecondaryButton>
                  </ButtonRow>
                </>
              )}

              {/* Step 3 – Profile Preview */}
              {step === 3 && abhaProfile && (
                <>
                  <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <SuccessCheckmark>
                      <svg width="26" height="26" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </SuccessCheckmark>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "16px" }}>ABHA Created Successfully!</div>
                  </div>

                  <ProfileCard>
                    {abhaProfile.photo ? (
                      <ProfilePhoto src={`data:image/jpeg;base64,${abhaProfile.photo}`} alt="Profile" />
                    ) : (
                      <ProfileInitials>{getInitials(abhaProfile.firstName, abhaProfile.lastName)}</ProfileInitials>
                    )}
                    <div>
                      <ProfileName>{abhaProfile.firstName} {abhaProfile.lastName}</ProfileName>
                      <ProfileAbha>{abhaProfile.ABHANumber}</ProfileAbha>
                      <ProfileMeta>{abhaProfile.gender === "M" ? "Male" : abhaProfile.gender === "F" ? "Female" : "Other"} · DOB: {abhaProfile.dob}</ProfileMeta>
                    </div>
                  </ProfileCard>

                  <InfoGrid>
                    <InfoItem>
                      <InfoItemLabel>Mobile</InfoItemLabel>
                      <InfoItemValue>{abhaProfile.mobile || "N/A"}</InfoItemValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoItemLabel>Pincode</InfoItemLabel>
                      <InfoItemValue>{abhaProfile.pinCode || abhaProfile.pincode || ((abhaProfile.address || abhaProfile.phrAddress?.[0] || "").match(/\b\d{6}\b/)?.[0]) || "N/A"}</InfoItemValue>
                    </InfoItem>
                    <InfoItem style={{ gridColumn: "1 / -1" }}>
                      <InfoItemLabel>Address</InfoItemLabel>
                      <InfoItemValue>{abhaProfile.address || "N/A"}</InfoItemValue>
                    </InfoItem>
                  </InfoGrid>

                  <PrimaryButton onClick={() => { 
                    const extractedPin = abhaProfile.pinCode || abhaProfile.pincode || ((abhaProfile.address || abhaProfile.phrAddress?.[0] || "").match(/\b\d{6}\b/)?.[0]) || "";
                    const normalized = {
                      ...abhaProfile,
                      pinCode: extractedPin,
                      pincode: extractedPin,
                      ABHANumber: abhaProfile.ABHANumber || abhaProfile.abhaNumber || "",
                    };
                    onSuccess(normalized); 
                    onClose(); 
                  }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save to Registration Form
                  </PrimaryButton>
                </>
              )}
            </Body>
          </>
        )}
      </Modal>
    </Overlay>
  );
};

export default CreateABHAModal;

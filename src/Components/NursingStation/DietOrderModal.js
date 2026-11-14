import React, { useState, useEffect } from "react";
import styled, { keyframes, createGlobalStyle, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { FiX, FiSearch, FiChevronDown } from "react-icons/fi";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#10b981",    // Emerald 500
  primaryDark: "#059669", // Emerald 600
  primaryLight: "#ecfdf5", // Emerald 50
  accent: "#f59e0b",     // Amber 500
  accentLight: "#fffbeb",  // Amber 50
  danger: "#ef4444",      // Red 500
  textMain: "#1f2937",    // Gray 800
  textMuted: "#6b7280",   // Gray 500
  bgGlass: "rgba(255, 255, 255, 0.85)",
  border: "rgba(16, 185, 129, 0.15)",
  shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const ripple = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  100% { transform: scale(1.05); opacity: 0; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const GlobalModalStyle = createGlobalStyle`
  .diet-modal-open { overflow: hidden; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  width: 780px; max-width: 95vw;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    width: 100% !important;
    max-width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
`;

const Header = styled.div`
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
  z-index: 10;
`;

const Title = styled.h2`
  margin: 0; font-size: 1.2rem; font-weight: 800;
  color: ${C.primaryDark};
  display: flex; align-items: center; gap: 10px;

  .title-icon {
    font-size: 1.35rem;
    display: inline-flex;
    align-items: center;
    -webkit-text-fill-color: initial;
  }

  .title-text {
    background: linear-gradient(135deg, ${C.primaryDark}, #14b8a6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const CloseBtn = styled.button`
  background: #f1f5f9; border: none; width: 36px; height: 36px;
  border-radius: 50%; color: ${C.textMuted}; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover { background: #fee2e2; color: ${C.danger}; transform: rotate(90deg); }
`;

const Body = styled.div`
  padding: 20px 24px; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 20px;
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const PatientPanel = styled.div`
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  flex-shrink: 0;
  z-index: 5;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 4px;
    background: #10b981;
  }

  .patient-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .patient-divider {
    width: 1px;
    height: 28px;
    background: #cbd5e1;
    flex-shrink: 0;
  }

  @media (max-width: 680px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 10px 16px;
    .patient-divider { display: none; }
  }
`;

const PatientAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #10b981;
  font-weight: 800;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #a7f3d0;
  flex-shrink: 0;
`;

const PatientGrid = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 1;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 680px) {
    justify-content: flex-start;
    gap: 12px;
  }
`;

const PatientMeta = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  span.label {
    font-size: 0.62rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    line-height: 1.1;
  }
  span.val {
    font-size: 0.84rem;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
  }
`;

const Label = styled.span`
  font-size: 0.65rem; font-weight: 800; color: ${C.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
`;

const Value = styled.span`
  font-size: 0.95rem; font-weight: 700; color: ${C.textMain};
`;

const SectionHeader = styled.h3`
  font-size: 0.85rem; font-weight: 800; color: ${C.textMain};
  margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;
  text-transform: uppercase; letter-spacing: 0.5px;
  &::before { content: ''; width: 4px; height: 16px; background: ${C.primary}; border-radius: 2px; }
`;

const StyledSelect = styled.select`
  width: 100%;
  background: white; border: 1px solid ${C.border};
  padding: 12px 16px; border-radius: 12px;
  font-size: 0.95rem; font-weight: 700; color: ${C.textMain};
  outline: none; cursor: pointer;
  transition: all 0.2s;
  &:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px ${C.primary}20; }
`;

const MenuBox = styled.div`
  background: white; border: 1px solid ${C.border};
  border-radius: 16px; padding: 20px; margin-top: 16px;
  display: flex; flex-direction: column; gap: 12px;
`;

const SessionRow = styled.div`
  display: flex; align-items: center; gap: 12px; padding: 10px;
  border-radius: 10px; transition: background 0.2s;
  &:hover { background: #f8fafc; }
`;

const SessionIcon = styled.div`
  width: 32px; height: 32px; border-radius: 8px;
  background: ${C.primaryLight}; color: ${C.primary};
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
`;

const SessionContent = styled.div`
  flex: 1; display: flex; flex-direction: column;
`;

const SessionName = styled.span`
  font-size: 0.7rem; font-weight: 800; color: ${C.textMuted}; text-transform: uppercase;
`;

const SessionItems = styled.span`
  font-size: 0.9rem; font-weight: 600; color: ${C.textMain};
`;

const PillContainer = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap;
`;

const SessionPill = styled.button`
  padding: 10px 24px; border-radius: 14px; border: 2px solid transparent;
  background: ${({ active }) => (active ? C.primary : "#f1f5f9")};
  color: ${({ active }) => (active ? "white" : C.textMain)};
  font-weight: 700; font-size: 0.9rem; cursor: pointer;
  transition: all 0.2s;
  &:hover { transform: scale(1.05); }
`;

const ExtraCard = styled.div`
  background: ${({ active }) => (active ? "#ecfdf5" : "#ffffff")};
  border: 1.5px solid ${({ active }) => (active ? "#10b981" : "#e2e8f0")};
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: ${({ active }) => (active ? "0 3px 10px rgba(16, 185, 129, 0.12)" : "0 1px 3px rgba(0, 0, 0, 0.02)")};
  position: relative;

  &:hover {
    border-color: #10b981;
    background: ${({ active }) => (active ? "#ecfdf5" : "#f8fafc")};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  z-index: 10;
`;

const Button = styled.button`
  padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 0.95rem;
  border: none; cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; gap: 8px;
`;

const PrimaryBtn = styled(Button)`
  background: linear-gradient(135deg, ${C.primary}, ${C.primaryDark});
  color: white; box-shadow: 0 10px 20px -5px ${C.primary}50;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px -5px ${C.primary}70; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SecondaryBtn = styled(Button)`
  background: #f1f5f9; color: ${C.textMain};
  &:hover { background: #e2e8f0; }
`;

const SearchDropdown = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid ${C.border};
  border-radius: 12px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s;
  outline: none;
  &:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px ${C.primary}15;
  }
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid ${C.border};
  border-radius: 12px;
  margin-top: 8px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  max-height: 300px;
  overflow-y: auto;
  animation: ${slideUp} 0.2s ease-out;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  border-bottom: 1px solid #f8fafc;
  &:hover {
    background: ${C.primaryLight};
    color: ${C.primaryDark};
  }
  &:last-child { border-bottom: none; border-radius: 0 0 12px 12px; }
`;

// ─── Constants ───────────────────────────────────────────────────────────────
const MEAL_SESSIONS = [
  { id: "Breakfast", icon: "☀️", label: "Breakfast" },
  { id: "Lunch", icon: "🌤️", label: "Lunch" },
  { id: "Snacks", icon: "🥨", label: "Snacks" },
  { id: "Dinner", icon: "🌙", label: "Dinner" },
];

// ─── Component ────────────────────────────────────────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────
const DietOrderModal = ({ patient, HmsBaseUrl, onClose, onSaved, onBack }) => {
  const [dietMasters, setDietMasters] = useState([]);
  const [extraMasters, setExtraMasters] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState("");
  const [mealSession, setMealSession] = useState("Lunch");
  const [specialNote, setSpecialNote] = useState("");
  const [extras, setExtras] = useState({});
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [dietSearch, setDietSearch] = useState("");
  const [extraSearch, setExtraSearch] = useState("");
  const [showDietDropdown, setShowDietDropdown] = useState(false);
  const [showExtraDropdown, setShowExtraDropdown] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [extraRoomTab, setExtraRoomTab] = useState("AUTO");

  const loadOrderForEditing = (order) => {
    if (!order) return;
    setEditingOrderId(order.diet_id);
    setMealSession(order.meal_time);
    setSelectedDiet(order.diet_type);
    setInstructions(order.special_instructions || "");
    setSpecialNote(order.special_diet_note || "");
    
    // Map extras
    const newExtras = {};
    if (Array.isArray(order.extra_items)) {
        order.extra_items.forEach(ex => {
            const master = extraMasters.find(m => m.item_name === (ex.item || ex.item_name));
            if (master) {
                newExtras[master.extra_id] = { checked: true, qty: ex.qty || 1 };
            }
        });
    }
    setExtras(newExtras);
    setIsReadOnly(order.status !== "Ordered");
  };

  useEffect(() => {
    const closeDropdowns = () => {
      setShowDietDropdown(false);
      setShowExtraDropdown(false);
    };
    window.addEventListener("click", closeDropdowns);
    return () => window.removeEventListener("click", closeDropdowns);
  }, []);

  useEffect(() => {
    if (!history.length) return;
    
    const today = new Date();
    // Support both DD-MM-YYYY and YYYY-MM-DD
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const todayISO = today.toISOString().split("T")[0];
    
    const existing = history.find(h => 
        (h.order_date === todayStr || h.order_date.startsWith(todayISO)) && 
        h.meal_time === mealSession
    );
    
    if (existing) {
      loadOrderForEditing(existing);
    } else {
      setEditingOrderId(null);
      setSelectedDiet("");
      setExtras({});
      setInstructions("");
      setSpecialNote("");
      setIsReadOnly(false);
    }
  }, [history, mealSession, extraMasters]);

  // Resolve patient data properly
  const pd = patient?.patient_details || {};
  const rp = {
    uhid: patient?.uhid || pd.uhid || "-",
    ipNo: patient?.ipNumber || pd.ipNumber || "-",
    name: [
      patient?.salutation ?? pd.salutation,
      patient?.firstName ?? pd.firstName,
      patient?.lastName ?? pd.lastName,
    ].filter(Boolean).join(" ") || "Patient",
    room: patient?.roomNo || pd.roomNo || patient?.room_no || pd.room_no || patient?.room || pd.room || "",
    bed: patient?.bedNo || pd.bedNo || patient?.bed_no || pd.bed_no || patient?.bed || pd.bed || "",
    ward: patient?.wardName || pd.wardName || patient?.ward_name || pd.ward_name || (patient?.roomBed ? patient.roomBed.split("|")[0].trim() : ""),
    roomBed: `${patient?.roomNo || pd.roomNo || patient?.room_no || "-"} | ${patient?.bedNo || pd.bedNo || patient?.bed_no || "-"}`,
  };

  const roomCategoryUpper = String(patient?.room_category || patient?.roomCategory || pd.room_category || rp.ward || rp.room || "").toUpperCase();
  const isVipRoom = roomCategoryUpper.includes("SINGLE") || roomCategoryUpper.includes("PRIVATE") || roomCategoryUpper.includes("VIP") || roomCategoryUpper.includes("SUITE") || String(rp.room).toUpperCase().startsWith("SR-");
  const patientDefaultRoom = isVipRoom ? "VIP" : "NORMAL";
  const activeRoomFilter = extraRoomTab === "AUTO" ? patientDefaultRoom : extraRoomTab;

  useEffect(() => {
    setExtraRoomTab("AUTO");
  }, [patient]);

  useEffect(() => {
    document.body.classList.add("diet-modal-open");
    fetchMasters();
    fetchExtraMasters();
    fetchHistory();
    return () => document.body.classList.remove("diet-modal-open");
  }, [patient]);

  const fetchExtraMasters = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_diet_extra_master/`, "GET");
      if (res.success && res.data) {
        setExtraMasters(Array.isArray(res.data) ? res.data : (res.data.data || []));
      }
    } catch (e) { console.error(e); }
  };

  const fetchMasters = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_diet_master/`, "GET");
      if (res.success && res.data) {
        setDietMasters(Array.isArray(res.data) ? res.data : (res.data.data || []));
      }
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    if (!rp.uhid) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}get_diet_orders/?uhid=${rp.uhid}&ipNumber=${rp.ipNo}`, "GET");
      if (res.success && res.data) {
        setHistory(Array.isArray(res.data) ? res.data : (res.data.data || []));
      }
    } catch (e) { console.error(e); }
  };

  const currentDietData = dietMasters.find(d => d.diet_name === selectedDiet);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this diet order?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}update_diet_status/`, "POST", {
        diet_id: orderId,
        status: "Cancelled"
      });
      if (res.success || res.data?.success) {
        alert("Diet order cancelled successfully");
        if (editingOrderId === orderId) {
          setEditingOrderId(null);
          setSelectedDiet("");
          setExtras({});
          setInstructions("");
          setSpecialNote("");
        }
        fetchHistory();
        onSaved && onSaved();
      } else {
        alert(res.data?.error || res.error || "Failed to cancel diet order");
      }
    } catch (err) {
      console.error("Cancel Diet Order Error:", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedDiet) return alert("Please pick a Diet type.");
    setSaving(true);
    try {
      const sessionFood = 
        mealSession === "Breakfast" ? currentDietData?.morning_items :
        mealSession === "Lunch"     ? currentDietData?.afternoon_items :
        mealSession === "Snacks"    ? currentDietData?.evening_items :
        mealSession === "Dinner"    ? currentDietData?.dinner_items : "";

      const dietPrice = currentDietData?.price || 0;
      
      const extraItems = (Array.isArray(extraMasters) ? extraMasters : [])
        .filter(e => extras[e.extra_id]?.checked)
        .map(e => ({ 
          item_id: e.item_id,
          item: e.item_name,
          clean_name: e.clean_name || e.item_name,
          room_type: e.room_type,
          serving_size: e.serving_size,
          calories: e.calories,
          qty: extras[e.extra_id]?.qty || 1,
          price: e.price
        }));

      const extraItemsPrice = extraItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
      const totalPrice = dietPrice + extraItemsPrice;

      const payload = {
        uhid: rp.uhid,
        inpatient_number: rp.ipNo,
        patient_name: rp.name,
        ward_name: rp.ward || rp.roomBed.split("|")[0].trim(),
        room_no: rp.room,
        diet_type: selectedDiet,
        food_items: sessionFood,
        meal_time: mealSession,
        extra_items: extraItems,
        special_diet_note: specialNote,
        attender_count: 0, // Simplified for now or logic from extras if needed
        special_instructions: instructions,
        diet_price: dietPrice,
        extra_items_price: extraItemsPrice,
        total_price: totalPrice,
        diet_id: editingOrderId,
      };

      const res = await apiRequest(`${HmsBaseUrl}save_diet_order/`, "POST", payload);
      if (res.success) {
        onSaved && onSaved();
        if (onBack) {
          onBack();
        } else {
          onClose();
        }
      } else {
        alert(res.error || "Order failed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <GlobalModalStyle />
      <ModalContainer>
        <Header>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                ← Back to Actions
              </button>
            )}
            <Title>
              <span className="title-icon">🥗</span>
              <span className="title-text">
                {isReadOnly ? "View Diet Order" : editingOrderId ? "Update Diet Order" : "Premium Diet Concierge"}
              </span>
            </Title>
          </div>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        {isReadOnly && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 24px", fontSize: "0.85rem", fontWeight: 700, borderBottom: "1px solid #fecaca", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span>⚠️</span> This order has been received by the kitchen and can no longer be edited.
          </div>
        )}

        {/* Patient Profile - PINNED */}
        <PatientPanel>
          <div className="patient-left">
            <PatientAvatar>
              {rp.name.split(" ").map(n => n[0]).filter(Boolean).join("").slice(0, 2) || "P"}
            </PatientAvatar>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                {rp.name}
              </div>
              <div style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
                UHID: <span style={{ color: "#059669", fontWeight: 700 }}>{rp.uhid}</span> · IP: <span style={{ color: "#059669", fontWeight: 700 }}>{rp.ipNo}</span>
              </div>
            </div>
          </div>

          <div className="patient-divider" />

          <PatientGrid>
            <PatientMeta>
              <span className="label">Ward / Location</span>
              <span className="val">{rp.ward || "General"}</span>
            </PatientMeta>
            <PatientMeta>
              <span className="label">Room · Bed</span>
              <span className="val">Room {rp.room} · Bed {rp.bed}</span>
            </PatientMeta>
            <PatientMeta>
              <span className="label">Room Category</span>
              <span className="val">
                <span style={{ 
                  padding: "3px 9px", 
                  borderRadius: "12px", 
                  fontSize: "0.72rem", 
                  fontWeight: 800, 
                  background: isVipRoom ? "#fef3c7" : "#ecfdf5", 
                  color: isVipRoom ? "#92400e" : "#047857",
                  border: `1px solid ${isVipRoom ? "#fde68a" : "#a7f3d0"}`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {isVipRoom ? "⭐️ VIP Room" : "📋 Normal Ward"}
                </span>
              </span>
            </PatientMeta>
          </PatientGrid>
        </PatientPanel>

        <Body>

          {/* Session Selection */}
          <section>
            <SectionHeader>Meal Session</SectionHeader>
            <PillContainer>
              {MEAL_SESSIONS.map(s => (
                <SessionPill 
                  key={s.id} 
                  active={mealSession === s.id} 
                  onClick={() => !isReadOnly && setMealSession(s.id)}
                  style={{ opacity: isReadOnly && mealSession !== s.id ? 0.5 : 1, cursor: isReadOnly ? "default" : "pointer" }}
                >
                  {s.icon} {s.label}
                </SessionPill>
              ))}
            </PillContainer>
          </section>

          {/* Diet Type */}
          <section>
            <SectionHeader>Diet Type Selection</SectionHeader>
            <SearchDropdown onClick={(e) => e.stopPropagation()}>
              <SearchInputWrapper>
                <div style={{ position: "absolute", left: "14px", color: C.textMuted, display: "flex" }}>
                  <FiSearch size={18} />
                </div>
                <SearchInput 
                  placeholder={isReadOnly ? "Diet type" : "Search and select diet..."}
                  value={showDietDropdown ? dietSearch : selectedDiet}
                  onChange={(e) => { if(!isReadOnly) { setDietSearch(e.target.value); setShowDietDropdown(true); } }}
                  onFocus={() => { if(!isReadOnly) { setDietSearch(""); setShowDietDropdown(true); } }}
                  readOnly={isReadOnly}
                />
                <div style={{ position: "absolute", right: "14px", color: C.textMuted, cursor: "pointer" }}>
                  <FiChevronDown />
                </div>
              </SearchInputWrapper>

              {showDietDropdown && (
                <DropdownList>
                  {(Array.isArray(dietMasters) ? dietMasters : [])
                    .filter(d => d.diet_name.toLowerCase().includes(dietSearch.toLowerCase()))
                    .map(d => (
                      <DropdownItem key={d.diet_id} onClick={() => {
                        setSelectedDiet(d.diet_name);
                        setShowDietDropdown(false);
                        setDietSearch("");
                      }}>
                        <span style={{ fontWeight: 600 }}>{d.diet_name}</span>
                        <span style={{ fontSize: "0.8rem", color: C.primary, fontWeight: 700 }}>
                          {d.price > 0 ? `₹${d.price}` : "Free"}
                        </span>
                      </DropdownItem>
                    ))
                  }
                  {Array.isArray(dietMasters) && dietMasters.filter(d => d.diet_name.toLowerCase().includes(dietSearch.toLowerCase())).length === 0 && (
                    <div style={{ padding: "16px", textAlign: "center", color: C.textMuted }}>No matching diets found</div>
                  )}
                </DropdownList>
              )}
            </SearchDropdown>

            {currentDietData && (
              <MenuBox>
                <Label style={{ display: "block", marginBottom: "8px" }}>Menu Preview for {selectedDiet}</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { n: "Breakfast", i: "🌅", v: currentDietData.morning_items },
                    { n: "Lunch", i: "🍱", v: currentDietData.afternoon_items },
                    { n: "Snacks", i: "☕", v: currentDietData.evening_items },
                    { n: "Dinner", i: "🌙", v: currentDietData.dinner_items },
                  ].map(s => (
                    <SessionRow key={s.n} style={mealSession === s.n ? { background: C.primaryLight } : {}}>
                      <SessionIcon>{s.i}</SessionIcon>
                      <SessionContent>
                        <SessionName>{s.n}</SessionName>
                        <SessionItems>{s.v || "Not set"}</SessionItems>
                      </SessionContent>
                    </SessionRow>
                  ))}
                </div>
              </MenuBox>
            )}
          </section>

          {/* Extras */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <SectionHeader style={{ margin: 0 }}>A la Carte / Extras</SectionHeader>
              
              {/* Room Filter Pills */}
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setExtraRoomTab("VIP")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    border: "1.5px solid",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    borderColor: activeRoomFilter === "VIP" ? "#f59e0b" : "#e2e8f0",
                    background: activeRoomFilter === "VIP" ? "#fef3c7" : "white",
                    color: activeRoomFilter === "VIP" ? "#92400e" : "#64748b",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>⭐️ VIP</span>
                  <span style={{ fontSize: "0.7rem", padding: "1px 5px", borderRadius: "8px", background: activeRoomFilter === "VIP" ? "#fde68a" : "#f1f5f9" }}>
                    {extraMasters.filter(e => e.room_type === "VIP").length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtraRoomTab("NORMAL")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "16px",
                    border: "1.5px solid",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    borderColor: activeRoomFilter === "NORMAL" ? C.primary : "#e2e8f0",
                    background: activeRoomFilter === "NORMAL" ? "#f0fdfa" : "white",
                    color: activeRoomFilter === "NORMAL" ? C.primaryDark : "#64748b",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>📋 Normal</span>
                  <span style={{ fontSize: "0.7rem", padding: "1px 5px", borderRadius: "8px", background: activeRoomFilter === "NORMAL" ? "#ccfbf1" : "#f1f5f9" }}>
                    {extraMasters.filter(e => e.room_type === "NORMAL").length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtraRoomTab("ALL")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "16px",
                    border: "1.5px solid",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    borderColor: activeRoomFilter === "ALL" ? "#6366f1" : "#e2e8f0",
                    background: activeRoomFilter === "ALL" ? "#eef2ff" : "white",
                    color: activeRoomFilter === "ALL" ? "#4338ca" : "#64748b",
                    transition: "all 0.15s ease"
                  }}
                >
                  All ({extraMasters.length})
                </button>
              </div>
            </div>
            
            <SearchDropdown onClick={(e) => e.stopPropagation()} style={{ marginBottom: "16px" }}>
              <SearchInputWrapper>
                <div style={{ position: "absolute", left: "14px", color: C.textMuted, display: "flex" }}>
                  <FiSearch size={18} />
                </div>
                <SearchInput 
                  placeholder={isReadOnly ? "Extra items" : `Search ${activeRoomFilter === "ALL" ? "all" : activeRoomFilter.toLowerCase()} extra foods...`}
                  value={extraSearch}
                  onChange={(e) => { if(!isReadOnly) { setExtraSearch(e.target.value); setShowExtraDropdown(true); } }}
                  onFocus={() => { if(!isReadOnly) setShowExtraDropdown(true); }}
                  readOnly={isReadOnly}
                />
              </SearchInputWrapper>

              {showExtraDropdown && extraSearch && (
                <DropdownList>
                  {(Array.isArray(extraMasters) ? extraMasters : [])
                    .filter(e => {
                      if (activeRoomFilter !== "ALL" && e.room_type && e.room_type !== activeRoomFilter) return false;
                      const q = extraSearch.toLowerCase();
                      return (e.clean_name || e.item_name || "").toLowerCase().includes(q) ||
                             (e.category || "").toLowerCase().includes(q);
                    })
                    .map(e => (
                      <DropdownItem key={e.extra_id} onClick={() => {
                        setExtras(p => ({
                          ...p,
                          [e.extra_id]: { checked: true, qty: p[e.extra_id]?.qty || 1 }
                        }));
                        setExtraSearch("");
                        setShowExtraDropdown(false);
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "1.1rem" }}>{e.room_type === "VIP" ? "⭐️" : "✨"}</span>
                          <span style={{ fontWeight: 600 }}>{e.clean_name || e.item_name}</span>
                          {e.serving_size && (
                            <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px", color: "#64748b" }}>
                              {e.serving_size}
                            </span>
                          )}
                          {e.calories > 0 && (
                            <span style={{ fontSize: "0.72rem", color: "#0d9488", fontWeight: 700 }}>
                              {e.calories} kcal
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "0.8rem", color: C.primary, fontWeight: 700 }}>₹{e.price}</span>
                      </DropdownItem>
                    ))
                  }
                </DropdownList>
              )}
            </SearchDropdown>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {Array.isArray(extraMasters) && extraMasters
                .filter(e => {
                  if (extras[e.extra_id]?.checked) return true;
                  if (activeRoomFilter !== "ALL" && e.room_type && e.room_type !== activeRoomFilter) return false;
                  if (extraSearch) {
                    const q = extraSearch.toLowerCase();
                    return (e.clean_name || e.item_name || "").toLowerCase().includes(q) ||
                           (e.category || "").toLowerCase().includes(q);
                  }
                  return true;
                })
                .map(e => {
                  const isChecked = !!extras[e.extra_id]?.checked;
                  return (
                    <ExtraCard 
                      key={e.extra_id} 
                      active={isChecked} 
                      onClick={() => {
                        if (isReadOnly) return;
                        setExtras(p => ({
                          ...p,
                          [e.extra_id]: { checked: !isChecked, qty: p[e.extra_id]?.qty || 1 }
                        }));
                      }} 
                      style={{ cursor: isReadOnly ? "default" : "pointer" }}
                    >
                      <div style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", flexShrink: 0 }}>
                        {e.room_type === "VIP" ? "⭐️" : "✨"}
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: isChecked ? "#065f46" : "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {e.clean_name || e.item_name}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
                          {e.serving_size && (
                            <span style={{ fontSize: "0.68rem", color: "#64748b", background: isChecked ? "#d1fae5" : "#f1f5f9", padding: "1px 5px", borderRadius: "4px" }}>
                              {e.serving_size}
                            </span>
                          )}
                          {e.calories > 0 && (
                            <span style={{ fontSize: "0.68rem", color: "#0d9488", fontWeight: 700 }}>
                              {e.calories} kcal
                            </span>
                          )}
                          <span style={{ fontSize: "0.75rem", color: isChecked ? "#047857" : C.textMuted, marginLeft: "auto", fontWeight: 800 }}>
                            ₹{e.price}
                          </span>
                        </div>
                      </div>
                      {isChecked && (
                        <div 
                          onClick={ev => ev.stopPropagation()}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            background: "#ffffff",
                            border: "1.5px solid #10b981",
                            borderRadius: "8px",
                            overflow: "hidden",
                            flexShrink: 0
                          }}
                        >
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              const cur = extras[e.extra_id]?.qty || 1;
                              if (cur <= 1) {
                                setExtras(p => ({ ...p, [e.extra_id]: { checked: false, qty: 1 } }));
                              } else {
                                setExtras(p => ({ ...p, [e.extra_id]: { ...p[e.extra_id], qty: cur - 1 } }));
                              }
                            }}
                            style={{
                              background: "#f8fafc",
                              border: "none",
                              width: "22px",
                              height: "24px",
                              cursor: isReadOnly ? "default" : "pointer",
                              fontWeight: 800,
                              color: "#334155",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px"
                            }}
                          >
                            -
                          </button>
                          <span style={{ width: "24px", textAlign: "center", fontWeight: 800, fontSize: "0.8rem", color: "#065f46" }}>
                            {extras[e.extra_id]?.qty || 1}
                          </span>
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              const cur = extras[e.extra_id]?.qty || 1;
                              setExtras(p => ({ ...p, [e.extra_id]: { ...p[e.extra_id], qty: cur + 1 } }));
                            }}
                            style={{
                              background: "#f8fafc",
                              border: "none",
                              width: "22px",
                              height: "24px",
                              cursor: isReadOnly ? "default" : "pointer",
                              fontWeight: 800,
                              color: "#334155",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px"
                            }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </ExtraCard>
                  );
                })}
            </div>
          </section>

          {/* Instructions */}
          <section>
            <SectionHeader>Notes & Instructions</SectionHeader>
            <textarea 
              placeholder="Allergies, specific time, or kitchen instructions..."
              value={instructions}
              onChange={e => !isReadOnly && setInstructions(e.target.value)}
              readOnly={isReadOnly}
              style={{ width: "100%", height: "80px", border: `1px solid ${C.border}`, borderRadius: "16px", padding: "15px", fontFamily: "inherit", fontSize: "0.9rem", background: isReadOnly ? "rgba(0,0,0,0.02)" : "white" }}
            />
          </section>

          {/* Recent History */}
          {history.length > 0 && (
            <section>
                <SectionHeader>Recent History</SectionHeader>
                <div style={{ background: "#f8fafc", borderRadius: "16px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead style={{ background: "#f1f5f9" }}>
                      <tr>
                        <th style={{ padding: "12px 15px", textAlign: "left" }}>Time</th>
                        <th style={{ padding: "12px 15px", textAlign: "left" }}>Meal</th>
                        <th style={{ padding: "12px 15px", textAlign: "left" }}>Status</th>
                        <th style={{ padding: "12px 15px", textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 5).map((h, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px 15px" }}>{h.order_date.split("-").slice(0,2).join("-")} <small>{h.order_time}</small></td>
                          <td style={{ padding: "12px 15px", fontWeight: 700 }}>{h.diet_type}</td>
                          <td style={{ padding: "12px 15px" }}>
                            <span style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: h.status === "Delivered" ? "#dcfce7" : h.status === "Ordered" ? "#eff6ff" : h.status === "Cancelled" ? "#fee2e2" : "#f1f5f9",
                              color: h.status === "Delivered" ? "#166534" : h.status === "Ordered" ? "#2563eb" : h.status === "Cancelled" ? "#b91c1c" : "#475569",
                              fontWeight: 800,
                              border: h.status === "Cancelled" ? "1px solid #fca5a5" : "none"
                            }}>
                              {h.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 15px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                              {h.status === "Ordered" && (
                                <button 
                                  onClick={() => loadOrderForEditing(h)}
                                  style={{ background: C.primaryLight, color: C.primary, border: "none", padding: "4px 8px", borderRadius: "6px", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem" }}
                                >
                                  Edit
                                </button>
                              )}
                              {(h.status === "Ordered" || h.status === "Received") && (
                                <button 
                                  onClick={() => handleCancelOrder(h.diet_id)}
                                  style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "4px 8px", borderRadius: "6px", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem" }}
                                  title="Cancel this diet order"
                                >
                                  ✕ Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </section>
          )}
           {/* Order Summary */}
          {selectedDiet && (
            <section style={{ background: "#f0fdf4", padding: "20px", borderRadius: "20px", border: `1px dashed ${C.primary}` }}>
              <SectionHeader style={{ marginBottom: "12px" }}>Order Summary</SectionHeader>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                <span>Base Diet ({selectedDiet})</span>
                <span style={{ fontWeight: 700 }}>₹{currentDietData?.price || 0}</span>
              </div>
              {(Array.isArray(extraMasters) ? extraMasters : []).filter(e => extras[e.extra_id]?.checked).map(e => (
                <div key={e.extra_id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                  <span>{e.item_name} (x{extras[e.extra_id].qty})</span>
                  <span style={{ fontWeight: 700 }}>₹{e.price * extras[e.extra_id].qty}</span>
                </div>
              ))}
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${C.primary}30`, display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 900, color: C.primaryDark }}>
                <span>Grand Total</span>
                <span>₹{(currentDietData?.price || 0) + (Array.isArray(extraMasters) ? extraMasters : []).filter(e => extras[e.extra_id]?.checked).reduce((acc, curr) => acc + (curr.price * extras[curr.extra_id].qty), 0)}</span>
              </div>
            </section>
          )}
        </Body>

        <Footer>
          <SecondaryBtn onClick={onClose}>Discard</SecondaryBtn>
          <PrimaryBtn onClick={handlePlaceOrder} disabled={saving || !selectedDiet || isReadOnly}>
            {saving ? "Confirming..." : isReadOnly ? "🔒 Order Locked" : editingOrderId ? "✨ Update Order" : "🔥 Confirm Order"}
          </PrimaryBtn>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

export default DietOrderModal;

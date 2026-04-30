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
  background: ${C.bgGlass};
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  width: 720px; max-width: 100%;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: ${C.shadow};
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  position: relative;
`;

const Header = styled.div`
  padding: 24px 30px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid ${C.border};
  display: flex; justify-content: space-between; align-items: center;
`;

const Title = styled.h2`
  margin: 0; font-size: 1.25rem; font-weight: 800;
  background: linear-gradient(135deg, ${C.primaryDark}, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex; align-items: center; gap: 10px;
`;

const CloseBtn = styled.button`
  background: #f1f5f9; border: none; width: 36px; height: 36px;
  border-radius: 50%; color: ${C.textMuted}; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover { background: #fee2e2; color: ${C.danger}; transform: rotate(90deg); }
`;

const Body = styled.div`
  padding: 30px; overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 28px;
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
`;

const PatientCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f0fdf4);
  border: 1px solid ${C.border};
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.05);
`;

const PatientHeader = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px; border-bottom: 1px dashed ${C.border};
  padding-bottom: 15px;
`;

const InfoGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
`;

const InfoItem = styled.div`
  display: flex; flex-direction: column; gap: 4px;
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
  background: ${({ active }) => (active ? C.accentLight : "white")};
  border: 2px solid ${({ active }) => (active ? C.accent : "transparent")};
  padding: 16px 20px; border-radius: 16px; cursor: pointer;
  display: flex; align-items: center; gap: 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  &:hover { background: ${C.accentLight}50; }
`;

const Footer = styled.div`
  padding: 24px 30px; background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid ${C.border};
  display: flex; justify-content: flex-end; gap: 12px;
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
const DietOrderModal = ({ patient, HmsBaseUrl, onClose, onSaved }) => {
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
    room: patient?.roomNo || pd.roomNo || patient?.room_no || "-",
    bed: patient?.bedNo || pd.bedNo || "-",
    ward: patient?.ward_name || pd.ward_name || "-",
    roomBed: `${patient?.roomNo || "-"} | ${patient?.bedNo || "-"}`,
  };

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
          item: e.item_name, 
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
        onClose();
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
          <Title>🥗 {isReadOnly ? "View Diet Order" : editingOrderId ? "Update Diet Order" : "Premium Diet Concierge"}</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Body>
          {isReadOnly && (
            <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px 20px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 700, marginBottom: "20px", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: "10px" }}>
              <span>⚠️</span> This order has been received by the kitchen and can no longer be edited.
            </div>
          )}
          {/* Patient Profile */}
          <PatientCard>
            <PatientHeader>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Label>Patient Information</Label>
                <h2 style={{ margin: "4px 0 0 0", color: C.textMain, fontSize: "1.4rem", fontWeight: 900 }}>
                  {rp.name}
                </h2>
              </div>
              <div style={{ background: "#f0fdf4", color: "#166534", padding: "6px 12px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 800 }}>
                {rp.ipNo}
              </div>
            </PatientHeader>
            <InfoGrid>
              <InfoItem>
                <Label>UHID</Label>
                <Value>{rp.uhid}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Location</Label>
                <Value>{rp.ward || "General"}</Value>
              </InfoItem>
              <InfoItem>
                <Label>Room / Bed</Label>
                <Value>{rp.room} / {rp.bed}</Value>
              </InfoItem>
            </InfoGrid>
          </PatientCard>

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
            <SectionHeader>A la Carte / Extras</SectionHeader>
            
            <SearchDropdown onClick={(e) => e.stopPropagation()} style={{ marginBottom: "16px" }}>
              <SearchInputWrapper>
                <div style={{ position: "absolute", left: "14px", color: C.textMuted, display: "flex" }}>
                  <FiSearch size={18} />
                </div>
                <SearchInput 
                  placeholder={isReadOnly ? "Extra items" : "Quick add extras..."}
                  value={extraSearch}
                  onChange={(e) => { if(!isReadOnly) { setExtraSearch(e.target.value); setShowExtraDropdown(true); } }}
                  onFocus={() => { if(!isReadOnly) setShowExtraDropdown(true); }}
                  readOnly={isReadOnly}
                />
              </SearchInputWrapper>

              {showExtraDropdown && extraSearch && (
                <DropdownList>
                  {(Array.isArray(extraMasters) ? extraMasters : [])
                    .filter(e => e.item_name.toLowerCase().includes(extraSearch.toLowerCase()))
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
                          <span style={{ fontSize: "1.1rem" }}>✨</span>
                          <span style={{ fontWeight: 600 }}>{e.item_name}</span>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: C.primary, fontWeight: 700 }}>₹{e.price}</span>
                      </DropdownItem>
                    ))
                  }
                </DropdownList>
              )}
            </SearchDropdown>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {Array.isArray(extraMasters) && extraMasters
                .filter(e => (extras[e.extra_id]?.checked || e.item_name.toLowerCase().includes(extraSearch.toLowerCase())))
                .map(e => (
                <ExtraCard key={e.extra_id} active={!!extras[e.extra_id]?.checked} onClick={() => {
                  if(isReadOnly) return;
                  setExtras(p => ({
                    ...p,
                    [e.extra_id]: { checked: !p[e.extra_id]?.checked, qty: p[e.extra_id]?.qty || 1 }
                  }));
                }} style={{ cursor: isReadOnly ? "default" : "pointer" }}>
                  <div style={{ fontSize: "1.3rem" }}>✨</div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 700 }}>{e.item_name}</span>
                    <span style={{ fontSize: "0.75rem", color: C.textMuted }}>₹{e.price}</span>
                  </div>
                  {extras[e.extra_id]?.checked && (
                    <input 
                      type="number" min="1" value={extras[e.extra_id].qty} 
                      onClick={ev => ev.stopPropagation()}
                      onChange={ev => !isReadOnly && setExtras(p => ({ ...p, [e.extra_id]: { ...p[e.extra_id], qty: parseInt(ev.target.value) || 1 } }))}
                      readOnly={isReadOnly}
                      style={{ width: "45px", padding: "4px", border: "none", borderRadius: "6px", textAlign: "center", fontWeight: 800, background: isReadOnly ? "transparent" : "white" }}
                    />
                  )}
                </ExtraCard>
              ))}
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
                            <span style={{ padding: "3px 8px", borderRadius: "6px", background: h.status === "Delivered" ? "#dcfce7" : h.status === "Ordered" ? "#eff6ff" : "#f1f5f9", color: h.status === "Delivered" ? "#166534" : h.status === "Ordered" ? "#2563eb" : "#475569", fontWeight: 800 }}>
                              {h.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px 15px", textAlign: "center" }}>
                            {h.status === "Ordered" && (
                                <button 
                                    onClick={() => loadOrderForEditing(h)}
                                    style={{ background: C.primaryLight, color: C.primary, border: "none", padding: "4px 8px", borderRadius: "6px", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem" }}
                                >
                                    Edit
                                </button>
                            )}
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

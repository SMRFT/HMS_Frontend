import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper, colors } from "../GlobalStyles";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiSunrise, FiSun, FiSunset, FiMoon, FiActivity, FiSearch } from "react-icons/fi";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
    primary: "#10b981",    // Emerald
    primaryDark: "#059669",
    secondary: "#6366f1",  // Indigo
    accent: "#f59e0b",     // Amber
    bgGlass: "rgba(255, 255, 255, 0.75)",
    border: "rgba(226, 232, 240, 0.8)",
    shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const GlassContainer = styled.div`
    background: ${T.bgGlass};
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid ${T.border};
    border-radius: 28px;
    padding: 35px;
    box-shadow: ${T.shadow};
    animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderSection = styled.div`
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 35px;
`;

const Title = styled.h2`
    margin: 0; font-size: 1.8rem; font-weight: 900;
    background: linear-gradient(135deg, ${T.primaryDark}, ${T.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex; align-items: center; gap: 14px;
`;

const NewBtn = styled.button`
    background: linear-gradient(135deg, ${T.primary}, ${T.primaryDark});
    color: white; border: none; padding: 12px 24px; border-radius: 14px;
    font-weight: 800; font-size: 0.95rem; cursor: pointer;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3);
    transition: all 0.3s;
    &:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.4); }
`;

const TableWrapper = styled.div`
    overflow-x: auto;
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const SmartTable = styled.table`
    width: 100%; border-collapse: separate; border-spacing: 0 12px;
`;

const Th = styled.th`
    padding: 15px 20px; text-align: left;
    font-size: 0.75rem; font-weight: 800; color: #64748b;
    text-transform: uppercase; letter-spacing: 1.2px;
`;

const Tr = styled.tr`
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover td { transform: scale(1.002); background: rgba(255, 255, 255, 0.95); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
`;

const Td = styled.td`
    padding: 22px 20px; background: rgba(255, 255, 255, 0.6);
    border-top: 1px solid rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    &:first-child { border-left: 1px solid rgba(255, 255, 255, 0.5); border-radius: 18px 0 0 18px; }
    &:last-child { border-right: 1px solid rgba(255, 255, 255, 0.5); border-radius: 0 18px 18px 0; }
`;

const DietName = styled.div`
    font-size: 1.05rem; font-weight: 900; color: ${T.primaryDark};
`;

const MenuText = styled.div`
    font-size: 0.85rem; font-weight: 600; color: #475569;
    max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const ActionBtn = styled.button`
    background: #f1f5f9; border: none; width: 38px; height: 38px;
    border-radius: 12px; color: ${T.primary}; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    &:hover { background: ${T.primaryLight}; transform: scale(1.1); }
`;

// ─── Modal Styles ────────────────────────────────────────────────────────────
const Overlay = styled.div`
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.3);
    backdrop-filter: blur(8px); z-index: 5000;
    display: flex; align-items: center; justify-content: center; padding: 20px;
`;

const Modal = styled.div`
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 24px;
    width: 650px; max-width: 100%; box-shadow: ${T.shadow};
    animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
`;

const MHeader = styled.div`
    padding: 24px 30px; border-bottom: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center;
`;

const MBody = styled.div`
    padding: 30px; display: flex; flex-direction: column; gap: 24px;
`;

const SessionGrid = styled.div`
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
`;

const SessionBox = styled.div`
    display: flex; flex-direction: column; gap: 8px;
`;

const SessionLabel = styled.label`
    display: flex; align-items: center; gap: 8px;
    font-size: 0.75rem; font-weight: 800; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.5px;
`;

const Textarea = styled.textarea`
    width: 100%; padding: 12px; border: 1px solid #e2e8f0;
    border-radius: 12px; font-size: 0.9rem; font-weight: 600;
    min-height: 70px; resize: vertical; outline: none; transition: border 0.2s;
    &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
`;

const Input = styled.input`
    width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0;
    border-radius: 12px; font-size: 0.95rem; font-weight: 700; outline: none;
    &:focus { border-color: ${T.primary}; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
const DietMaster = () => {
    const [diets, setDiets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingDiet, setEditingDiet] = useState(null);
    const [formData, setFormData] = useState({ 
        diet_name: "", 
        morning_items: "", 
        afternoon_items: "", 
        evening_items: "", 
        dinner_items: "",
        is_active: true 
    });

    useEffect(() => { fetchDiets(); }, []);

    const fetchDiets = async () => {
        setLoading(true);
        try {
            const res = await apiRequest(`${HmsBaseUrl}get_diet_master/?active_only=false`, "GET");
            if (res.success && res.data) {
                const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setDiets(dataArray);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!formData.diet_name) return alert("Diet name is required.");
        try {
            const res = await apiRequest(`${HmsBaseUrl}save_diet_master/`, "POST", {
                ...formData,
                diet_id: editingDiet?.diet_id || null
            });
            if (res.success) { setShowModal(false); fetchDiets(); }
            else { alert(res.error || "Save failed"); }
        } catch (e) { console.error(e); }
    };

    const openModal = (diet = null) => {
        setEditingDiet(diet);
        setFormData({ 
            diet_name: diet?.diet_name || "", 
            morning_items: diet?.morning_items || "", 
            afternoon_items: diet?.afternoon_items || "", 
            evening_items: diet?.evening_items || "", 
            dinner_items: diet?.dinner_items || "",
            is_active: diet ? diet.is_active : true 
        });
        setShowModal(true);
    };

    return (
        <PageWrapper style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eef2ff 100%)", minHeight: "100vh" }}>
            <GlassContainer>
                <HeaderSection>
                    <Title>🥗 Daily Menu Configuration</Title>
                    <NewBtn onClick={() => openModal()}>
                        <FiPlus size={20} /> New Diet Category
                    </NewBtn>
                </HeaderSection>

                <TableWrapper>
                    <SmartTable>
                        <thead>
                            <tr>
                                <Th>Diet Category</Th>
                                <Th>Breakfast</Th>
                                <Th>Afternoon</Th>
                                <Th>Dinner</Th>
                                <Th>Status</Th>
                                <Th style={{ textAlign: "right" }}>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><Td colSpan="6" style={{ textAlign: "center", padding: "80px", color: T.textMuted }}>Loading configurations...</Td></tr>
                            ) : diets.length === 0 ? (
                                <tr><Td colSpan="6" style={{ textAlign: "center", padding: "80px", color: T.textMuted }}>No diet categories defined.</Td></tr>
                            ) : (
                                diets.map((d) => (
                                    <Tr key={d.diet_id}>
                                        <Td><DietName>{d.diet_name}</DietName></Td>
                                        <Td><MenuText>{d.morning_items || "—"}</MenuText></Td>
                                        <Td><MenuText>{d.afternoon_items || "—"}</MenuText></Td>
                                        <Td><MenuText>{d.dinner_items || "—"}</MenuText></Td>
                                        <Td>
                                            <span style={{ 
                                                padding: "6px 14px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 800,
                                                background: d.is_active ? "#dcfce7" : "#fee2e2",
                                                color: d.is_active ? "#166534" : "#991b1b"
                                            }}>
                                                {d.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                <ActionBtn onClick={() => openModal(d)}><FiEdit2 /></ActionBtn>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </SmartTable>
                </TableWrapper>
            </GlassContainer>

            {showModal && (
                <Overlay onClick={() => setShowModal(false)}>
                    <Modal onClick={e => e.stopPropagation()}>
                        <MHeader>
                            <h3 style={{ margin: 0, fontWeight: 900, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                                <FiActivity color={T.primary} /> {editingDiet ? "Optimize Diet Schedule" : "Create New Configuration"}
                            </h3>
                            <ActionBtn style={{ background: "#f1f5f9", color: "#64748b" }} onClick={() => setShowModal(false)}><FiX /></ActionBtn>
                        </MHeader>
                        <MBody>
                            <div>
                                <SessionLabel style={{ marginBottom: "8px" }}>Dietary Category Name</SessionLabel>
                                <Input placeholder="e.g. Therapeutic Diabetics" value={formData.diet_name} onChange={e => setFormData({...formData, diet_name: e.target.value})} />
                            </div>

                            <SessionGrid>
                                <SessionBox>
                                    <SessionLabel><FiSunrise color="#f59e0b" /> Breakfast Session</SessionLabel>
                                    <Textarea placeholder="Morning items..." value={formData.morning_items} onChange={e => setFormData({...formData, morning_items: e.target.value})} />
                                </SessionBox>
                                <SessionBox>
                                    <SessionLabel><FiSun color="#ef4444" /> Afternoon Session</SessionLabel>
                                    <Textarea placeholder="Lunch items..." value={formData.afternoon_items} onChange={e => setFormData({...formData, afternoon_items: e.target.value})} />
                                </SessionBox>
                                <SessionBox>
                                    <SessionLabel><FiSunset color="#6366f1" /> Evening / Snacks</SessionLabel>
                                    <Textarea placeholder="Snack items..." value={formData.evening_items} onChange={e => setFormData({...formData, evening_items: e.target.value})} />
                                </SessionBox>
                                <SessionBox>
                                    <SessionLabel><FiMoon color="#334155" /> Dinner Session</SessionLabel>
                                    <Textarea placeholder="Dinner items..." value={formData.dinner_items} onChange={e => setFormData({...formData, dinner_items: e.target.value})} />
                                </SessionBox>
                            </SessionGrid>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px", background: "#f8fafc", borderRadius: "14px" }}>
                                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} style={{ width: "18px", height: "18px" }} />
                                <label htmlFor="is_active" style={{ fontWeight: 700, fontSize: "0.9rem", color: "#475569" }}>Enable this category for nursing station orders</label>
                            </div>

                            <NewBtn onClick={handleSave} style={{ width: "100%", justifyContent: "center", padding: "16px" }}>
                                {editingDiet ? "🚀 Update Configuration" : "✨ Save Master Settings"}
                            </NewBtn>
                        </MBody>
                    </Modal>
                </Overlay>
            )}
        </PageWrapper>
    );
};

export default DietMaster;

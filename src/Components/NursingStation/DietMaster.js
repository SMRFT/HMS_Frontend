import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes, css, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { PageWrapper, colors } from "../GlobalStyles";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiSunrise, FiSun, FiSunset, FiMoon, FiActivity, FiSearch } from "react-icons/fi";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
    primary: "#10b981",    // Emerald
    primaryDark: "#059669",
    primaryLight: "#ecfdf5",
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

// ─── Global Scroll Lock ───────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  body.diet-master-active {
    overflow: hidden !important;
  }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const ContentWrapper = styled.div`
    height: calc(100vh - 110px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    gap: 20px;
`;

const GlassContainer = styled.div`
    background: ${T.bgGlass};
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid ${T.border};
    border-radius: 28px;
    padding: 30px;
    box-shadow: ${T.shadow};
    animation: ${fadeIn} 0.5s ease-out;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;
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
    color: white; border: none; padding: 10px 20px; border-radius: 12px;
    font-weight: 800; font-size: 0.9rem; cursor: pointer;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3);
    transition: all 0.3s;
    white-space: nowrap;
    &:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.4); }
`;

const SearchBox = styled.div`
    position: relative;
    flex: 1;
    max-width: 400px;
    
    input {
        width: 100%;
        padding: 10px 16px 10px 42px;
        background: white;
        border: 1px solid ${T.border};
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 600;
        outline: none;
        transition: all 0.2s;
        &:focus { border-color: ${T.primary}; box-shadow: 0 0 0 4px ${T.primaryLight}; }
    }
    
    svg {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
    }
`;

const TableWrapper = styled.div`
    overflow-y: auto;
    overflow-x: auto;
    flex: 1;
    &::-webkit-scrollbar { width: 6px; height: 6px; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const SmartTable = styled.table`
    width: 100%; border-collapse: separate; border-spacing: 0 12px;
`;

const Th = styled.th`
    padding: 15px 20px; text-align: left;
    font-size: 0.75rem; font-weight: 800; color: #64748b;
    text-transform: uppercase; letter-spacing: 1.2px;
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
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

const TabContainer = styled.div`
    display: flex; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0;
`;

const Tab = styled.button`
    padding: 12px 20px; background: none; border: none; font-weight: 800; font-size: 0.9rem;
    color: ${props => props.active ? T.primary : "#64748b"};
    border-bottom: 3px solid ${props => props.active ? T.primary : "transparent"};
    cursor: pointer; transition: all 0.2s;
    &:hover { color: ${T.primary}; }
`;
const DietMaster = () => {
    const [diets, setDiets] = useState([]);
    const [extras, setExtras] = useState([]);
    const [activeTab, setActiveTab] = useState("categories");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showExtraModal, setShowExtraModal] = useState(false);
    const [editingDiet, setEditingDiet] = useState(null);
    const [editingExtra, setEditingExtra] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [formData, setFormData] = useState({ 
        diet_name: "", 
        morning_items: "", 
        afternoon_items: "", 
        evening_items: "", 
        dinner_items: "",
        price: 0,
        is_active: true 
    });

    const [extraFormData, setExtraFormData] = useState({
        item_name: "",
        price: 0,
        is_active: true
    });

    useEffect(() => { 
        document.body.classList.add("diet-master-active");
        fetchDiets(); 
        fetchExtras();
        return () => document.body.classList.remove("diet-master-active");
    }, []);

    const filteredDiets = useMemo(() => {
        if (!searchTerm) return diets;
        const s = searchTerm.toLowerCase();
        return diets.filter(d => 
            (d.diet_name || "").toLowerCase().includes(s) ||
            (d.morning_items || "").toLowerCase().includes(s) ||
            (d.afternoon_items || "").toLowerCase().includes(s) ||
            (d.evening_items || "").toLowerCase().includes(s) ||
            (d.dinner_items || "").toLowerCase().includes(s)
        );
    }, [diets, searchTerm]);

    const filteredExtras = useMemo(() => {
        if (!searchTerm) return extras;
        const s = searchTerm.toLowerCase();
        return extras.filter(e => (e.item_name || "").toLowerCase().includes(s));
    }, [extras, searchTerm]);

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

    const fetchExtras = async () => {
        try {
            const res = await apiRequest(`${HmsBaseUrl}get_diet_extra_master/?active_only=false`, "GET");
            if (res.success && res.data) {
                const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setExtras(dataArray);
            }
        } catch (e) { console.error(e); }
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

    const handleSaveExtra = async () => {
        if (!extraFormData.item_name) return alert("Item name is required.");
        try {
            const res = await apiRequest(`${HmsBaseUrl}save_diet_extra_master/`, "POST", {
                ...extraFormData,
                extra_id: editingExtra?.extra_id || null
            });
            if (res.success) { setShowExtraModal(false); fetchExtras(); }
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
            price: diet?.price || 0,
            is_active: diet ? diet.is_active : true 
        });
        setShowModal(true);
    };

    const openExtraModal = (extra = null) => {
        setEditingExtra(extra);
        setExtraFormData({
            item_name: extra?.item_name || "",
            price: extra?.price || 0,
            is_active: extra ? extra.is_active : true
        });
        setShowExtraModal(true);
    };

    return (
        <PageWrapper style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eef2ff 100%)", minHeight: "100vh" }}>
            <GlobalStyle />
            <ContentWrapper>
                <GlassContainer>
                    <HeaderSection>
                        <Title>🥗 Diet Master</Title>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1, justifyContent: "flex-end" }}>
                            <SearchBox>
                                <FiSearch size={18} />
                                <input 
                                    type="text" 
                                    placeholder={`Search ${activeTab === "categories" ? "diets" : "items"}...`} 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </SearchBox>
                            <NewBtn onClick={() => activeTab === "categories" ? openModal() : openExtraModal()}>
                                <FiPlus size={20} /> New {activeTab === "categories" ? "Diet" : "Extra"}
                            </NewBtn>
                        </div>
                    </HeaderSection>
                    <TabContainer>
                        <Tab active={activeTab === "categories"} onClick={() => { setActiveTab("categories"); setSearchTerm(""); }}>Diet Categories</Tab>
                        <Tab active={activeTab === "extras"} onClick={() => { setActiveTab("extras"); setSearchTerm(""); }}>Extra Food Items</Tab>
                    </TabContainer>

                <TableWrapper>
                    <SmartTable>
                        <thead>
                            <tr>
                                <Th>{activeTab === "categories" ? "Diet Type" : "Item Name"}</Th>
                                {activeTab === "categories" && (
                                    <>
                                        <Th>Morning</Th>
                                        <Th>Afternoon</Th>
                                        <Th>Evening</Th>
                                        <Th>Dinner</Th>
                                    </>
                                )}
                                <Th>Price (₹)</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === "categories" ? (
                                filteredDiets.map((diet, i) => (
                                    <Tr key={i}>
                                        <Td><DietName>{diet.diet_name}</DietName></Td>
                                        <Td><MenuText title={diet.morning_items}>{diet.morning_items || "—"}</MenuText></Td>
                                        <Td><MenuText title={diet.afternoon_items}>{diet.afternoon_items || "—"}</MenuText></Td>
                                        <Td><MenuText title={diet.evening_items}>{diet.evening_items || "—"}</MenuText></Td>
                                        <Td><MenuText title={diet.dinner_items}>{diet.dinner_items || "—"}</MenuText></Td>
                                        <Td><div style={{ fontWeight: 800, color: T.secondary }}>{diet.price.toFixed(2)}</div></Td>
                                        <Td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: diet.is_active ? T.primary : "#94a3b8", fontWeight: 800, fontSize: "0.8rem" }}>
                                                {diet.is_active ? <FiCheck /> : <FiX />} {diet.is_active ? "ACTIVE" : "INACTIVE"}
                                            </div>
                                        </Td>
                                        <Td>
                                            <ActionBtn onClick={() => openModal(diet)}><FiEdit2 /></ActionBtn>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                filteredExtras.map((item, i) => (
                                    <Tr key={i}>
                                        <Td><DietName>{item.item_name}</DietName></Td>
                                        <Td><div style={{ fontWeight: 800, color: T.secondary }}>{item.price.toFixed(2)}</div></Td>
                                        <Td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: item.is_active ? T.primary : "#94a3b8", fontWeight: 800, fontSize: "0.8rem" }}>
                                                {item.is_active ? <FiCheck /> : <FiX />} {item.is_active ? "ACTIVE" : "INACTIVE"}
                                            </div>
                                        </Td>
                                        <Td>
                                            <ActionBtn onClick={() => openExtraModal(item)}><FiEdit2 /></ActionBtn>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                            {((activeTab === "categories" && filteredDiets.length === 0) || (activeTab === "extras" && filteredExtras.length === 0)) && !loading && (
                                <Tr>
                                    <Td colSpan={activeTab === "categories" ? 8 : 4} style={{ textAlign: "center", padding: "40px", color: "#64748b", fontWeight: 600 }}>
                                        No items found. Click 'New' to add one.
                                    </Td>
                                </Tr>
                            )}
                        </tbody>
                    </SmartTable>
                </TableWrapper>
            </GlassContainer>
            </ContentWrapper>

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

                            <div>
                                <SessionLabel style={{ marginBottom: "8px" }}>Base Price (₹)</SessionLabel>
                                <Input type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
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

            {showExtraModal && (
                <Overlay onClick={() => setShowExtraModal(false)}>
                    <Modal style={{ width: "450px" }} onClick={e => e.stopPropagation()}>
                        <MHeader>
                            <h3 style={{ margin: 0, fontWeight: 900, color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                                <FiActivity color={T.primary} /> {editingExtra ? "Edit Extra Item" : "New Extra Food Item"}
                            </h3>
                            <ActionBtn style={{ background: "#f1f5f9", color: "#64748b" }} onClick={() => setShowExtraModal(false)}><FiX /></ActionBtn>
                        </MHeader>
                        <MBody>
                            <div>
                                <SessionLabel style={{ marginBottom: "8px" }}>Item Name</SessionLabel>
                                <Input placeholder="e.g. Health Soup" value={extraFormData.item_name} onChange={e => setExtraFormData({...extraFormData, item_name: e.target.value})} />
                            </div>
                            <div>
                                <SessionLabel style={{ marginBottom: "8px" }}>Price (₹)</SessionLabel>
                                <Input type="number" placeholder="0.00" value={extraFormData.price} onChange={e => setExtraFormData({...extraFormData, price: e.target.value})} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px", background: "#f8fafc", borderRadius: "14px" }}>
                                <input type="checkbox" id="extra_active" checked={extraFormData.is_active} onChange={e => setExtraFormData({...extraFormData, is_active: e.target.checked})} style={{ width: "18px", height: "18px" }} />
                                <label htmlFor="extra_active" style={{ fontWeight: 700, fontSize: "0.9rem", color: "#475569" }}>Active</label>
                            </div>
                            <NewBtn onClick={handleSaveExtra} style={{ width: "100%", justifyContent: "center", padding: "16px" }}>
                                {editingExtra ? "🚀 Update Item" : "✨ Save Extra Item"}
                            </NewBtn>
                        </MBody>
                    </Modal>
                </Overlay>
            )}
        </PageWrapper>
    );
};

export default DietMaster;

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { Search, Plus, X, ChevronDown } from "lucide-react";

// --- Color Palette matching the screenshot ---
// ─── Color palette (mirrors Radiology/Lab pattern) ──────────────────────
const colors = {
  primary: "#0d9488", // IPEMR Teal
  primaryDark: "#0f766e",
  orange: "#F88C22",
  orangeHover: "#E67D1E",
  yellow: "#FFA000",
  dark: "#37474F",
  border: "#CFD8DC",
  background: "#F5F7F8",
  textMain: "#263238",
  textMuted: "#78909C",
  white: "#FFFFFF",
  rowHighlight: "#E0F2F1",
  headerBg: "#546E7A",
  // Legend Colors (Refined for better UI)
  legPending: "#F59E0B",     // Rich amber
  legSubstituted: "#8B5CF6", // Vibrant purple
  legBilled: "#10B981",      // Emerald green
  legCancelled: "#6B7280",   // Cool gray
  legStopped: "#EF4444",     // Red
  legEmergency: "#DC2626",   // Deeper Red
  legInsurance: "#3B82F6",   // Blue
  legDischarge: "#06B6D4",   // Cyan
  legRegular: "#0D9488",     // Teal
};

// ─── Styled Components ────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContainer = styled.div`
  background: ${colors.background};
  width: 96%;
  max-width: 1500px;
  height: 94vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
  @media (max-width: 768px) {
    width: 100% !important;
    max-width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
`;


const ModalHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 2px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${(props) => props.$bg || "#546E7A"};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.3rem;
  color: ${colors.textMuted};
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${colors.border};
    color: ${colors.textMain};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  button {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    &:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px;
`;

const PatientPanel = styled.div`
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: #0d8a7a;
  }

  .patient-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .patient-divider {
    width: 1px;
    height: 30px;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 8px 12px;

    .patient-divider {
      display: none;
    }
  }
`;

const PatientAvatar = styled.div`
  width: 34px;
  height: 34px;
  background: #e6f9f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0d8a7a;
  font-size: 0.9rem;
  font-weight: 800;
  flex-shrink: 0;
`;

const PatientIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;

  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.2px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .sub-text {
    font-size: 0.72rem;
    color: #0d8a7a;
    font-weight: 600;
    white-space: nowrap;
  }
`;

const PatientGrid = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  @media (max-width: 900px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px 10px;
  }
`;

const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const FieldLabel = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const FieldValue = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
`;

const TopActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const RequestBtn = styled.button`
  background: linear-gradient(135deg, ${colors.orange}, ${colors.orangeHover});
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-weight: 700;
  font-size: 0.82rem;
  height: 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(248, 140, 34, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(248, 140, 34, 0.35);
  }
  &:active {
    transform: translateY(0);
  }
`;

const RequestFormWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
  background: ${colors.white};
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const FormPanel = styled.div`
  flex: 1;
  padding: 12px 16px;
  border-right: 1px solid #e2e8f0;
  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const SidePanel = styled.div`
  width: 290px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const SidePanelHeader = styled.div`
  background: #f1f5f9;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
`;

const SidePanelContent = styled.div`
  flex: 1;
  padding: 8px 10px;
  max-height: 190px;
  overflow-y: auto;
`;

const SidePanelFooter = styled.div`
  padding: 8px 12px;
  border-top: 1px solid #e2e8f0;
  background: white;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px 20px;
  margin-bottom: 20px;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
`;

const FormLabel = styled.label`
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StyledInput = styled.input`
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.84rem;
  width: 100%;
  height: 34px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #fff;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(19, 106, 99, 0.15);
  }
`;

const StyledSelect = styled.select`
  border: 1px solid #cbd5e1;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.84rem;
  width: 100%;
  height: 34px;
  background-color: white;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(19, 106, 99, 0.15);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 0.85rem;
  color: ${colors.textMain};
  margin-bottom: 5px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  user-select: none;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const AddBtn = styled.button`
  background: linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark});
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 700;
  font-size: 0.82rem;
  height: 34px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(19, 106, 99, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(19, 106, 99, 0.25);
  }
`;

const CancelBtn = styled.button`
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 14px;
  font-weight: 700;
  font-size: 0.82rem;
  height: 34px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  &:hover {
    background: #e2e8f0;
    color: ${colors.dark};
  }
`;

const TabsBar = styled.div`
  display: flex;
  gap: 8px;
  margin: 30px 0 20px 0;
  padding: 6px;
  background: ${colors.border}30;
  border-radius: 12px;
  width: fit-content;
`;

const Tab = styled.div`
  padding: 10px 24px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  color: ${(props) => (props.active ? colors.primary : colors.textMuted)};
  background: ${(props) => (props.active ? "white" : "transparent")};
  border-radius: 8px;
  box-shadow: ${(props) => (props.active ? "0 4px 12px rgba(0,0,0,0.05)" : "none")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    color: ${colors.primary};
    background: ${(props) => (props.active ? "white" : "white")};
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  th {
    background: ${colors.headerBg};
    color: white;
    padding: 12px 15px;
    text-align: left;
    font-size: 0.8rem;
    font-weight: 600;
  }
  td {
    padding: 12px 15px;
    font-size: 0.88rem;
    border-bottom: 1px solid #edf2f4;
    color: ${colors.textMain};
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover {
    background: #f8fafb;
  }
`;

const SubTableWrapper = styled.div`
  padding: 12px 18px 16px 18px;
  background: #f8fafc;
`;

const SubTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  th {
    background: #f1f5f9;
    color: #475569;
    padding: 8px 12px;
    text-align: left;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border-bottom: 1px solid #cbd5e1;
  }

  td {
    padding: 8px 12px;
    font-size: 0.82rem;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: #f8fafc;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
`;

const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 20px;
  background: ${(props) => props.color};
  color: white;
  width: fit-content;
  box-shadow: 0 2px 4px ${(props) => props.color}35;
`;

// ─── Searchable Dropdown Helper ───────────────────────────────────────────────

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1.5px solid #0d8a7a;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  max-height: 280px;
  overflow-y: auto;
  z-index: 9999;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  border-radius: 8px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const DropdownItem = styled.li`
  padding: 8px 12px;
  font-size: 0.84rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  transition: all 0.15s ease;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #f0fdfa;
    color: #0d8a7a;
  }
`;

const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  displayKey = "name",
  valueKey = "id",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsTyping(false);
        setHighlightedIndex(-1);
        if (value) {
          const selected = options.find((opt) =>
            typeof opt === "string" ? opt === value : String(opt[valueKey]) === String(value)
          );
          if (selected) {
            setSearchTerm(typeof selected === "string" ? selected : selected[displayKey]);
          }
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options, displayKey, valueKey]);

  useEffect(() => {
    if (value) {
      const selected = options.find((opt) =>
        typeof opt === "string" ? opt === value : String(opt[valueKey]) === String(value)
      );
      if (selected) {
        setSearchTerm(
          typeof selected === "string" ? selected : selected[displayKey]
        );
      }
    } else {
      setSearchTerm("");
    }
  }, [value, options, displayKey, valueKey]);

  // When user is typing, search across displayKey, badge, outlet_code, outlet_name
  const filtered = isTyping && searchTerm.trim() !== ""
    ? options.filter((opt) => {
        const q = searchTerm.toLowerCase();
        if (typeof opt === "string") return opt.toLowerCase().includes(q);
        const name = (opt[displayKey] || "").toLowerCase();
        const badge = (opt.badge || "").toLowerCase();
        const oc = (opt.outlet_code || "").toLowerCase();
        const on = (opt.outlet_name || "").toLowerCase();
        return name.includes(q) || badge.includes(q) || oc.includes(q) || on.includes(q);
      })
    : options;

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const itemEl = listRef.current.children[highlightedIndex];
      if (itemEl && typeof itemEl.scrollIntoView === "function") {
        itemEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <SearchWrapper ref={wrapperRef}>
      <div style={{ position: "relative", width: "100%" }}>
        <StyledInput
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsTyping(true);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onClick={() => {
            setIsOpen((prev) => !prev);
            setIsTyping(false);
            setHighlightedIndex(-1);
          }}
          onBlur={(e) => {
            if (!wrapperRef.current || !wrapperRef.current.contains(e.relatedTarget)) {
              setIsOpen(false);
              setIsTyping(false);
              setHighlightedIndex(-1);
              if (value) {
                const selected = options.find((opt) =>
                  typeof opt === "string" ? opt === value : String(opt[valueKey]) === String(value)
                );
                if (selected) {
                  setSearchTerm(typeof selected === "string" ? selected : selected[displayKey]);
                }
              }
            }
          }}
          onKeyDown={(e) => {
            if (!isOpen) {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                setIsOpen(true);
                setIsTyping(false);
                setHighlightedIndex(0);
                return;
              }
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (filtered.length === 0) return;
              setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              if (filtered.length === 0) return;
              setHighlightedIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1));
            } else if (e.key === "Enter") {
              if (isOpen && filtered.length > 0) {
                e.preventDefault();
                const opt = (highlightedIndex >= 0 && highlightedIndex < filtered.length)
                  ? filtered[highlightedIndex]
                  : filtered[0];
                const val = typeof opt === "string" ? opt : opt[valueKey];
                const txt = typeof opt === "string" ? opt : opt[displayKey];
                onChange(val);
                setSearchTerm(txt);
                setIsTyping(false);
                setIsOpen(false);
                setHighlightedIndex(-1);
              }
            } else if (e.key === "Escape") {
              setIsOpen(false);
              setIsTyping(false);
              setHighlightedIndex(-1);
            }
          }}
          placeholder={placeholder}
          style={{ paddingRight: "30px", cursor: "pointer" }}
        />
        <div
          onClick={() => {
            setIsOpen((prev) => !prev);
            setIsTyping(false);
            setHighlightedIndex(-1);
          }}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "#6b7280",
            display: "flex",
            alignItems: "center"
          }}
        >
          <ChevronDown size={16} />
        </div>
      </div>
      {isOpen && (
        <DropdownList ref={listRef}>
          {filtered.length > 0 ? (
            filtered.map((opt, idx) => {
              const isSelected = typeof opt === "string" ? opt === value : String(opt[valueKey]) === String(value);
              const isHighlighted = idx === highlightedIndex;
              const txt = typeof opt === "string" ? opt : opt[displayKey];
              const badge = typeof opt === "object" ? opt.badge : null;
              return (
                <DropdownItem
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur before select
                    const val = typeof opt === "string" ? opt : opt[valueKey];
                    onChange(val);
                    setSearchTerm(txt);
                    setIsTyping(false);
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    background: isHighlighted ? "#e6f9f3" : (isSelected ? "#f0fdf4" : "transparent"),
                    color: isHighlighted || isSelected ? "#0d8a7a" : "#1e293b",
                    outline: isHighlighted ? "1px solid #0d8a7a" : "none",
                  }}
                >
                  <span style={{ fontWeight: isHighlighted || isSelected ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {txt}
                  </span>
                  {badge && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "10px",
                        background: isHighlighted || isSelected ? "#dcfce7" : "#e2e8f0",
                        color: isHighlighted || isSelected ? "#15803d" : "#475569",
                        whiteSpace: "nowrap",
                        flexShrink: 0
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </DropdownItem>
              );
            })
          ) : (
            <DropdownItem style={{ color: "#9ca3af", cursor: "default", justifyContent: "center" }}>
              No options found
            </DropdownItem>
          )}
        </DropdownList>
      )}
    </SearchWrapper>
  );
};

const MedicineWardRequest = ({ patient, onClose }) => {
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Map incoming patient prop to display fields
  const pd = patient?.patient_details || {};
  const resolvedPatient = {
    ipNo: patient?.ipNumber || patient?.ip_number || patient?.ipNo || pd.ipNumber || "-",
    ipBadge: patient?.ipserial_number || pd.ipserial_number || "",
    uhid: patient?.uhid || patient?.patient_id || pd.uhid || "-",
    name:
      patient?.patient_name ||
      patient?.patientName ||
      [
        patient?.salutation ?? pd.salutation,
        patient?.firstName ?? pd.firstName,
        patient?.middleName ?? pd.middleName,
        patient?.lastName ?? pd.lastName,
      ]
        .filter(Boolean)
        .join(" ") || "Unknown Patient",
    address: patient?.address || pd.permanent_address || "-",
    admittingDate: patient?.admissionDateTime
      ? new Date(patient.admissionDateTime).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
      : "-",
    admittingTime: patient?.admissionDateTime
      ? new Date(patient.admissionDateTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "-",
    admittingDr: patient?.admittingDoctor || patient?.doctor_name || patient?.doctorName || pd?.admittingDoctor || "-",
    roomBed: `${patient?.roomNo || patient?.room_no || "-"} | ${patient?.bedNo || patient?.bed_no || "-"}`,
    customerType: patient?.customerType || patient?.customer_type || pd.customer_type || "-",
    companyName: patient?.companyName || pd.company_code || "-",
  };

  // Data Arrays
  const [requests, setRequests] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highlightedMedicineIndex, setHighlightedMedicineIndex] = useState(-1);
  const medicineTableBodyRef = useRef(null);
  const [billTypeOptions, setBillTypeOptions] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // UI States
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleRow = (id) => setExpandedRow((prev) => (prev === id ? null : id));

  // Form Fields
  const [pharmacyDept, setPharmacyDept] = useState("OLET001");
  const [outletMap, setOutletMap] = useState({
    OLET001: "IP PHARMACY",
    OLET002: "OP PHARMACY",
    OLET003: "MAIN BLOCK",
    OLET004: "CANCER BLOCK",
    OLET005: "VELAVAN",
  });
  const [billTypeNo, setBillTypeNo] = useState("PH01");
  const [billtype, setBilltype] = useState(18);
  const [billTypeName, setBillTypeName] = useState("PHARMACY IP BILL");
  const [drugType, setDrugType] = useState("Drug");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [doctor, setDoctor] = useState(""); // Stores employeeId
  const [doctorName, setDoctorName] = useState(""); // Stores display name
  const [dosage, setDosage] = useState("");
  const [noOfDays, setNoOfDays] = useState("");
  const [qty, setQty] = useState("");
  const [dose, setDose] = useState("");
  const [doseUnit, setDoseUnit] = useState("");
  const [route, setRoute] = useState("");
  const [remark, setRemark] = useState("");
  const [isRegular, setIsRegular] = useState(true);
  const [isDischarge, setIsDischarge] = useState(false);
  const [dosageOptions, setDosageOptions] = useState([]);
  const [showDosageModal, setShowDosageModal] = useState(false);
  const [newDosageName, setNewDosageName] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Return Modal State ──────────────────────────────────────────────
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnReq, setSelectedReturnReq] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [returnSaving, setReturnSaving] = useState(false);

  // ── Medicine Packages State ──────────────────────────────────────────
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [packageLoading, setPackageLoading] = useState(false);
  const [packageSearch, setPackageSearch] = useState("");

  useEffect(() => {
    // Note: Patient object might have doctor name OR ID under different fields.
    // If it's the admitting doctor, it's usually an ID but maybe a name after backend formatting.
    if (patient?.admittingDoctor) {
      const docObj = doctors.find(
        (d) =>
          d.employeeId === patient.admittingDoctor ||
          d.employeeName === patient.admittingDoctor,
      );
      if (docObj) {
        setDoctor(docObj.employeeId);
        setDoctorName(docObj.employeeName);
      } else {
        setDoctor(patient.admittingDoctor);
      }
    } else if (patient?.doctor_name) {
      setDoctor(patient.doctor_name);
    } else if (pd.doctorName) {
      setDoctor(pd.doctorName);
    }
  }, [patient, pd, doctors]);

  useEffect(() => {
    fetchRequests();
  }, [pharmacyDept]);

  useEffect(() => {
    fetchDoctors();
    fetchBillTypes();
    fetchDosages();
  }, []);

  const fetchDosages = async () => {
    try {
      const res = await apiRequest(`${HmsBaseUrl}dosage_master/`, "GET");
      if (res.success) setDosageOptions(res.data?.data || []);
    } catch (e) {
      console.error("Error fetching dosages:", e);
    }
  };

  const handleSaveDosage = async () => {
    if (!newDosageName) return alert("Enter dosage name");
    try {
      const res = await apiRequest(`${HmsBaseUrl}dosage_master/`, "POST", {
        dosage_name: newDosageName,
      });
      if (res.success) {
        setNewDosageName("");
        setShowDosageModal(false);
        fetchDosages();
      }
    } catch (e) {
      console.error("Error saving dosage:", e);
    }
  };

  const handleBillTypeChange = (val) => {
    const opt = billTypeOptions.find(
      (o) => String(o.bill_type) === String(val),
    );
    if (opt) {
      setBillTypeNo(opt.billTypeNo);
      setBilltype(val);
      setBillTypeName(opt.bill_name);
      const newOutlet = opt.outlet_code || "OLET001";
      setPharmacyDept(newOutlet);
      setSearchResults([]);
      setSelectedDrug(null);
      setSearchQuery("");
      if (isSearchModalOpen) {
        handleMedicineSearch("", newOutlet);
      }
    }
  };

  const fetchBillTypes = async () => {
    try {
      let currentOutletMap = {
        OLET001: "IP PHARMACY",
        OLET002: "OP PHARMACY",
        OLET003: "MAIN BLOCK",
        OLET004: "CANCER BLOCK",
        OLET005: "VELAVAN",
      };
      try {
        const outletRes = await apiRequest(`${HmsBaseUrl}get-all-outlets/`, "GET");
        const outletList = Array.isArray(outletRes)
          ? outletRes
          : (Array.isArray(outletRes?.data) ? outletRes.data : []);
        if (outletList && outletList.length > 0) {
          const map = { ...currentOutletMap };
          outletList.forEach((o) => {
            if (o.outlet_code) {
              map[o.outlet_code] = o.outlet_name || o.outlet_code;
            }
          });
          currentOutletMap = map;
          setOutletMap(map);
        }
      } catch (oe) {
        console.warn("Using fallback outlet map:", oe);
      }

      const res = await apiRequest(`${HmsBaseUrl}bill-types/?ignore_outlet=true`, "GET");
      if (res.success || res.records) {
        const list =
          res.records ||
          res.data?.billTypes ||
          (Array.isArray(res.data) ? res.data : []);

        const enriched = list.map((b) => {
          const oc = b.outlet_code || "";
          const on = currentOutletMap[oc] || (oc ? oc : "General");
          return {
            ...b,
            outlet_name: on,
            outlet_badge: oc ? `${on} • ${oc}` : "General",
          };
        });

        const isPharmacy = (b) => {
          const name = (b.bill_name || "").toUpperCase();
          const billNo = (b.billTypeNo || "").toUpperCase();
          const outlet = (b.outlet_code || "").toUpperCase();
          return (
            billNo === "PH01" ||
            name.includes("PHARMACY") ||
            name.includes("MEDICINE") ||
            outlet === "OLET001" ||
            outlet === "OLET002"
          );
        };

        const pharmList = enriched
          .filter(isPharmacy)
          .sort((a, b) => {
            if (a.bill_name?.includes("IP")) return -1;
            if (b.bill_name?.includes("IP")) return 1;
            return (a.bill_name || "").localeCompare(b.bill_name || "");
          });
        const otherList = enriched
          .filter((b) => !isPharmacy(b))
          .sort((a, b) => {
            const outCmp = (a.outlet_name || "").localeCompare(b.outlet_name || "");
            if (outCmp !== 0) return outCmp;
            return (a.bill_name || "").localeCompare(b.bill_name || "");
          });

        const allBillTypes = [...pharmList, ...otherList];
        setBillTypeOptions(allBillTypes);

        if (allBillTypes.length > 0) {
          const defaultOpt =
            allBillTypes.find(
              (b) =>
                b.bill_name?.toUpperCase().includes("PHARMACY IP") ||
                (b.outlet_code === "OLET001" && b.billTypeNo === "PH01") ||
                b.outlet_code === "OLET001"
            ) || allBillTypes[0];

          if (defaultOpt) {
            setBillTypeNo(defaultOpt.billTypeNo);
            setBilltype(defaultOpt.bill_type);
            setBillTypeName(defaultOpt.bill_name);
            const outlet = defaultOpt.outlet_code || "OLET001";
            setPharmacyDept(outlet);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching bill types:", e);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_medicine_ward_requests/?uhid=${resolvedPatient.uhid}&ipNumber=${resolvedPatient.ipNo}`,
        "GET",
      );
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setRequests(list);
      }
    } catch (e) {
      console.error("Error fetching requests:", e);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}doctor_list_diagnostics/`,
        "GET",
      );
      if (res.success) {
        const list =
          res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setDoctors(list);
      }
    } catch (e) {
      console.error("Error fetching doctors:", e);
    }
  };

  const handleMedicineSearch = async (val = "", outletOverride) => {
    const targetOutlet = outletOverride || pharmacyDept || "OLET001";
    setSearchLoading(true);
    try {
      const queryTerm = (val || "").trim();
      const url = queryTerm
        ? `${HmsBaseUrl}get_pharmacy_stock/?outlet_code=${targetOutlet}&search=${encodeURIComponent(queryTerm)}`
        : `${HmsBaseUrl}get_pharmacy_stock/?outlet_code=${targetOutlet}`;
      const res = await apiRequest(url, "GET");
      const list = res.success
        ? Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []
        : [];

      const filtered = list.map((item) => ({
        id: item.item_id + "_" + item.batch_number,
        item_id: item.item_id,
        batch_number: item.batch_number,
        name: item.item_name,
        price: item.mrp || item.Selling_Price || item.price || 0,
        total_stock: item.available_stock != null ? item.available_stock : (item.total_stock || 0),
        expiry_date: item.expiry_date || "-",
      }));
      setSearchResults(filtered);
    } catch (e) {
      console.error("Search error", e);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setHighlightedMedicineIndex(0);
    } else {
      setHighlightedMedicineIndex(-1);
    }
  }, [searchResults]);

  useEffect(() => {
    if (isSearchModalOpen && medicineTableBodyRef.current && highlightedMedicineIndex >= 0) {
      const rowEl = medicineTableBodyRef.current.children[highlightedMedicineIndex];
      if (rowEl && typeof rowEl.scrollIntoView === "function") {
        rowEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedMedicineIndex, isSearchModalOpen]);

  // Auto-calculate quantity based on dosage & days
  useEffect(() => {
    if (dosage && noOfDays) {
      let timesPerDay = 0;
      if (dosage.includes("-")) {
        const parts = dosage.split("-").map((p) => Number(p) || 0);
        timesPerDay = parts.reduce((acc, curr) => acc + curr, 0);
      } else {
        timesPerDay = Number(dosage) || 0;
      }
      const days = Number(noOfDays) || 0;
      if (timesPerDay > 0 && days > 0) {
        setQty(timesPerDay * days);
      }
    }
  }, [dosage, noOfDays]);

  const handleAddMedicine = () => {
    if (!selectedDrug) return alert("Select a drug from search.");
    if (!billtype) return alert("Select Medicine Bill Type.");
    if (!dosage) return alert("Enter Dosage.");
    if (!noOfDays) return alert("Enter No.of days.");
    if (!qty) return alert("Enter Quantity.");

    const newMed = {
      item_id: selectedDrug.item_id,
      name: selectedDrug.name || "",
      batch_number: selectedDrug.batch_number || "",
      qty: Number(qty),
      price: selectedDrug.price,
      noOfDays: noOfDays,
      dosage: dosage,
      dose: dose,
      doseunit: doseUnit,
    };

    setSelectedMedicines([...selectedMedicines, newMed]);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDrug(null);
    setSearchQuery("");
    setSearchResults([]);
    setNoOfDays("");
    setQty("");
    setDosage("");
    setDose("");
    setDoseUnit("");
    setRoute("");
    setRemark("");
  };

  const handleOpenPackageList = async () => {
    setIsPackageModalOpen(true);
    setPackageSearch("");
    setPackageLoading(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_medicine_packages/?outlet_code=${pharmacyDept}`,
        "GET"
      );
      if (res.success) {
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setPackages(list.filter((p) => p.is_active !== false));
      }
    } catch (e) {
      console.error("Error fetching packages:", e);
    } finally {
      setPackageLoading(false);
    }
  };

  const handleSelectPackage = async (pkg) => {
    setPackageLoading(true);
    try {
      const res = await apiRequest(
        `${HmsBaseUrl}get_pharmacy_stock/?outlet_code=${pharmacyDept}`,
        "GET"
      );
      const stockList = res.success
        ? Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []
        : [];

      const items = pkg.items || [];
      const mapped = items.map((it) => {
        const match = stockList.find((s) => String(s.item_id) === String(it.item_id));
        return {
          item_id: it.item_id,
          name: it.item_name || `Item ${it.item_id}`,
          batch_number: match ? match.batch_number : "",
          qty: Number(it.qty || 1),
          price: match ? Number(match.mrp) || 0 : 0,
          noOfDays: "1",
          dosage: "1-0-0",
          dose: "1",
          doseunit: "Nos",
        };
      });

      setSelectedMedicines((prev) => [...prev, ...mapped]);
      setIsPackageModalOpen(false);
    } catch (err) {
      console.error("Error selecting package:", err);
      alert("Error loading package items.");
    } finally {
      setPackageLoading(false);
    }
  };

  // Load a selected medicine back into the form for editing
  const handleEditSelectedMed = (idx) => {
    const med = selectedMedicines[idx];
    // Restore the drug selector state
    setSelectedDrug({
      item_id: med.item_id,
      name: med.name || `Item ${med.item_id}`,
      batch_number: med.batch_number,
      price: med.price,
    });
    setDosage(med.dosage || "");
    setNoOfDays(med.noOfDays || "");
    setQty(String(med.qty || ""));
    setDose(med.dose || "");
    setDoseUnit(med.doseunit || "");
    // Remove from list (it will be re-added on handleAddMedicine)
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    if (selectedMedicines.length === 0) return alert("No medicines added.");

    const payload = {
      uhid: resolvedPatient.uhid,
      ipNumber: resolvedPatient.ipNo,
      patient_name: resolvedPatient.name,
      bill_type: billtype,
      billTypeNo,
      billTypeName,
      wardName: resolvedPatient.roomBed?.split("|")[0].trim() || "-",
      roomNo: resolvedPatient.roomBed || "-",
      medicine_particulars: selectedMedicines,
      total_amount: selectedMedicines.reduce(
        (acc, m) => acc + (m.price || 0) * (m.qty || 0),
        0,
      ),
      doctor: doctorName,
      doctor_id: doctor,
      billing_status: "Ward Request",
      billing_mode: "WARD REQUEST",
      outlet_code: pharmacyDept,
      is_discharge: isDischarge,
    };

    try {
      const res = await apiRequest(
        `${HmsBaseUrl}save_medicine_ward_request/`,
        "POST",
        payload,
      );
      if (res.success) {
        alert("Ward Request saved successfully");
        setSelectedMedicines([]);
        setIsDischarge(false);
        fetchRequests();
      }
    } catch (e) {
      console.error("Save error", e);
    }
  };

  const removeSelectedMed = (index) => {
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Reset Edit ────────────────────────────────────────────────────────────
  const resetEdit = () => {
    setShowForm(false);
    setEditingRequest(null);
    setSelectedMedicines([]);
  };

  // ─── Return Handlers ───────────────────────────────────────────────────────
  const handleOpenReturn = (req) => {
    setSelectedReturnReq(req);
    const initialItems = {};
    req.medicines?.forEach((m) => {
      const key = `${m.item_id}_${m.batch_number}`;
      initialItems[key] = {
        qty: "",
        reason: ""
      };
    });
    setReturnItems(initialItems);
    setIsReturnModalOpen(true);
  };

  const handleReturnChange = (key, field, value) => {
    setReturnItems(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleReturnSubmit = async () => {
    const itemsToReturn = [];
    selectedReturnReq.medicines?.forEach(m => {
      const key = `${m.item_id}_${m.batch_number}`;
      const r = returnItems[key];
      const returnQty = parseInt(r.qty) || 0;
      if (returnQty > 0) {
        if (returnQty > m.quantity) {
          alert(`Return quantity for ${m.item_name || m.name} cannot exceed billed quantity (${m.quantity}).`);
          throw new Error("Invalid return quantity");
        }
        itemsToReturn.push({
          item_id: m.item_id,
          item_name: m.item_name || m.name || "",
          batch_number: m.batch_number,
          qty: m.quantity,
          returned_qty: returnQty,
          reason: r.reason || ""
        });
      }
    });

    if (itemsToReturn.length === 0) {
      alert("Please enter a return quantity for at least one item.");
      return;
    }

    setReturnSaving(true);
    try {
      const empId =
        localStorage.getItem("employeeId") ||
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        localStorage.getItem("name") ||
        "system";

      const payload = {
        Bill_id: selectedReturnReq.Bill_id,
        medicine_particulars: itemsToReturn,
        "auth-user-id": empId,
        requested_by: empId,
      };

      const res = await apiRequest(`${HmsBaseUrl}return_medicine_ward_request/`, "POST", payload);
      if (res.success || res.status === "success" || res.status === 200) {
        setIsReturnModalOpen(false);
        fetchRequests();
        alert("Return processed successfully");
      } else {
        alert(res.error || res.message || "Failed to process return");
      }
    } catch (e) {
      if (e.message !== "Invalid return quantity") {
        console.error(e);
        alert("Error processing return");
      }
    } finally {
      setReturnSaving(false);
    }
  };

  // ─── Open Edit (loads history medicines into the right side panel) ─────────
  const handleOpenEdit = (req) => {
    setEditingRequest(req);
    // Map history medicine format → side panel format
    const mapped = (req.medicines || [])
      .filter((m) => !m.is_deleted)
      .map((m) => ({
        item_id: m.item_id,
        name: m.item_name || m.name || `Item ${m.item_id}`,
        batch_number: m.batch_number || "",
        qty: m.quantity || 0,
        price: m.price || 0,
        noOfDays: m.noOfDays || "",
        dosage: m.dosage || "",
        dose: m.dose || "",
        doseunit: m.doseunit || "",
      }));
    setSelectedMedicines(mapped);
    setShowForm(true);   // open the form panel to show the loaded medicines
    // Scroll to top so the panel is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Cancel editing ────────────────────────────────────────────────────────
  const handleCancelEdit = () => {
    setEditingRequest(null);
    setSelectedMedicines([]);
    setShowForm(false);
  };

  // ─── Save edits back to server ────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editingRequest) return;
    setEditSaving(true);
    try {
      // Build the full list: non-deleted items from selectedMedicines,
      // plus mark items originally present but now removed as is_deleted
      const originalIds = new Set(
        (editingRequest.medicines || []).map(
          (m) => `${m.item_id}__${m.batch_number}`
        )
      );
      const keptIds = new Set(
        selectedMedicines.map((m) => `${m.item_id}__${m.batch_number}`)
      );

      // Kept / edited items
      const updated = selectedMedicines.map((m) => ({
        item_id: m.item_id,
        batch_number: m.batch_number,
        quantity: m.qty,
        dosage: m.dosage,
        is_deleted: false,
      }));

      // Items that were in the original but removed in the panel → soft-delete
      const deleted = (editingRequest.medicines || [])
        .filter((m) => !keptIds.has(`${m.item_id}__${m.batch_number}`))
        .map((m) => ({
          item_id: m.item_id,
          batch_number: m.batch_number || "",
          quantity: m.quantity,
          dosage: m.dosage,
          is_deleted: true,
        }));

      const res = await apiRequest(
        `${HmsBaseUrl}update_medicine_ward_request/`,
        "PATCH",
        {
          Bill_id: editingRequest.Bill_id,
          medicine_particulars: [...updated, ...deleted],
        },
      );
      if (res.success) {
        setEditingRequest(null);
        setSelectedMedicines([]);
        setShowForm(false);
        fetchRequests();
      } else {
        alert(res.error || "Failed to save changes.");
      }
    } catch (e) {
      console.error("Edit save error", e);
    } finally {
      setEditSaving(false);
    }
  };

  const handleCancelRequest = async (billId) => {
    if (!window.confirm("Are you sure you want to cancel this medicine ward request?")) return;
    try {
      const res = await apiRequest(`${HmsBaseUrl}cancel_medicine_ward_request/`, "POST", { id: billId });
      if (res.success) {
        alert("Medicine ward request cancelled successfully!");
        fetchRequests();
      } else {
        alert("Failed to cancel: " + (res.data?.error || res.error || res.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Cancel medicine error:", err);
      alert("An error occurred while cancelling.");
    }
  };

  const handleRemoveIndividualMedicine = async (billId, med) => {
    if (!window.confirm(`Are you sure you want to remove "${med.item_name || med.name}" from this request?`)) return;
    try {
      const payload = {
        id: billId,
        item_id: med.item_id,
        item_name: med.item_name || med.name,
        batch_number: med.batch_number || ""
      };
      const res = await apiRequest(`${HmsBaseUrl}remove_individual_medicine/`, "POST", payload);
      if (res.success) {
        alert("Medicine removed successfully!");
        fetchRequests();
      } else {
        alert("Failed to remove medicine: " + (res.data?.error || res.error || res.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Remove medicine error:", err);
      alert("An error occurred while removing medicine.");
    }
  };

  const getStatusColor = (status, isDischarge) => {
    if (isDischarge) return colors.legDischarge;
    if (status === "Pending") return colors.legPending;
    if (status === "Cancelled") return colors.legCancelled;
    if (status === "Billed") return colors.legBilled;
    return colors.legRegular;
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.medPackage_name?.toLowerCase().includes(packageSearch.toLowerCase())
  );

  return (
    <>
      <div style={{ padding: "10px 16px" }}>
        <PatientPanel>
          <div className="patient-left">
            <PatientAvatar>
              {resolvedPatient.name ? resolvedPatient.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "P"}
            </PatientAvatar>
            <PatientIdentity>
              <h3>{resolvedPatient.name || "Unknown Patient"}</h3>
              <div className="sub-text">
                UHID: {resolvedPatient.uhid || "-"} · IP: {resolvedPatient.ipNo || "-"} {resolvedPatient.ipBadge && `(${resolvedPatient.ipBadge})`}
              </div>
            </PatientIdentity>
          </div>
          <div className="patient-divider" />
          <PatientGrid>
            <FieldBox>
              <FieldLabel>Admitting Dr</FieldLabel>
              <FieldValue title={resolvedPatient.admittingDr}>{resolvedPatient.admittingDr || "-"}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Room | Bed</FieldLabel>
              <FieldValue>{resolvedPatient.roomBed || "-"}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Customer Type</FieldLabel>
              <FieldValue>{resolvedPatient.customerType || "-"}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Admitting Date</FieldLabel>
              <FieldValue>{resolvedPatient.admittingDate} {resolvedPatient.admittingTime}</FieldValue>
            </FieldBox>
            <FieldBox>
              <FieldLabel>Company Name</FieldLabel>
              <FieldValue title={resolvedPatient.companyName}>{resolvedPatient.companyName || "-"}</FieldValue>
            </FieldBox>
          </PatientGrid>
        </PatientPanel>

        <TopActionBar>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#64748b" }}>
            {showForm ? "📝 Fill in medicine details below" : `💊 Pharmacy Medicine Requests (${requests.length} record${requests.length === 1 ? "" : "s"})`}
          </div>
          <RequestBtn onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Close Form" : "＋ New Medicine Request"}
          </RequestBtn>
        </TopActionBar>

        {showForm && (
          <RequestFormWrapper>
            <FormPanel>
              {/* Row 1: Bill Type (with Active Outlet badge) & Doctor */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "14px",
                  marginBottom: "12px",
                  background: "#f8fafc",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <FormItem>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "3px",
                    }}
                  >
                    <FormLabel style={{ margin: 0 }}>Medicine Bill Type</FormLabel>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "#0d8a7a",
                        background: "#e6f9f3",
                        padding: "1px 8px",
                        borderRadius: "10px",
                        letterSpacing: "0.2px",
                      }}
                    >
                      Outlet: {pharmacyDept} {outletMap[pharmacyDept] ? `• ${outletMap[pharmacyDept]}` : ""}
                    </span>
                  </div>
                  <SearchableDropdown
                    value={billtype}
                    onChange={handleBillTypeChange}
                    options={billTypeOptions.map((o) => ({
                      id: o.bill_type,
                      name: o.bill_name,
                      badge: o.outlet_badge,
                      outlet_code: o.outlet_code,
                      outlet_name: o.outlet_name,
                    }))}
                    placeholder="Search bill type or outlet..."
                  />
                </FormItem>

                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <SearchableDropdown
                    value={doctor}
                    onChange={(val) => {
                      setDoctor(val);
                      const docObj = doctors.find((d) => d.employeeId === val);
                      if (docObj) setDoctorName(docObj.employeeName);
                    }}
                    options={doctors.map((d) => ({
                      id: d.employeeId,
                      name: d.employeeName,
                    }))}
                    placeholder="Search doctor..."
                  />
                </FormItem>
              </div>

              {/* Row 2: Medicine Name with Search & Package */}
              <div style={{ marginBottom: "10px" }}>
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <StyledInput
                      style={{ flex: 1 }}
                      placeholder="Search medicine (min 3 chars)..."
                      value={selectedDrug ? selectedDrug.name : searchQuery}
                      onChange={(e) => {
                        if (selectedDrug) setSelectedDrug(null);
                        setSearchQuery(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setIsSearchModalOpen(true);
                          handleMedicineSearch(searchQuery);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchModalOpen(true);
                        handleMedicineSearch(searchQuery);
                      }}
                      style={{
                        background: colors.primary,
                        color: "white",
                        padding: "0 14px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        height: "34px",
                      }}
                    >
                      <Search size={14} /> Search
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenPackageList}
                      style={{
                        background: colors.secondary || "#f59e0b",
                        color: "white",
                        padding: "0 14px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        height: "34px",
                      }}
                    >
                      🎁 Package
                    </button>
                  </div>
                </FormItem>
              </div>

              {/* Row 2: Dosage | No. of Days | Quantity | Dose | Dose Unit | Route */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.8fr 0.8fr 0.9fr 0.9fr", gap: "8px", marginBottom: "8px" }}>
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <StyledSelect
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select Dosage</option>
                      <option value="1-0-0">1-0-0 (Morning)</option>
                      <option value="0-1-0">0-1-0 (Noon)</option>
                      <option value="0-0-1">0-0-1 (Night)</option>
                      <option value="1-0-1">1-0-1 (Morn-Night)</option>
                      <option value="1-1-1">1-1-1 (Thrice)</option>
                      {dosageOptions.map((opt, idx) => (
                        <option key={idx} value={opt.dosage_name}>
                          {opt.dosage_name}
                        </option>
                      ))}
                    </StyledSelect>
                    <button
                      type="button"
                      onClick={() => setShowDosageModal(true)}
                      style={{
                        background: colors.primary,
                        color: "white",
                        width: "34px",
                        height: "34px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                      title="Add Custom Dosage"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </FormItem>

                <FormItem>
                  <FormLabel>No. of Days</FormLabel>
                  <StyledInput
                    type="number"
                    value={noOfDays}
                    onChange={(e) => setNoOfDays(e.target.value)}
                  />
                </FormItem>

                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <StyledInput
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                </FormItem>

                <FormItem>
                  <FormLabel>Dose</FormLabel>
                  <StyledInput
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                  />
                </FormItem>

                <FormItem>
                  <FormLabel>Dose Unit</FormLabel>
                  <StyledSelect
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                  >
                    <option value="">Select Unit</option>
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="tab">Tablet</option>
                    <option value="cap">Capsule</option>
                  </StyledSelect>
                </FormItem>

                <FormItem>
                  <FormLabel>Route</FormLabel>
                  <StyledInput
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                  />
                </FormItem>
              </div>

              {/* Row 3: Remark | Checkboxes | Action Buttons */}
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <FormItem style={{ flex: 1.8, minWidth: "180px" }}>
                  <FormLabel>Remark</FormLabel>
                  <StyledInput
                    placeholder="Instructions or remark..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </FormItem>

                <div style={{ display: "flex", gap: "16px", paddingBottom: "6px", whiteSpace: "nowrap" }}>
                  <CheckboxGroup onClick={() => setIsRegular(!isRegular)}>
                    <input type="checkbox" checked={isRegular} readOnly /> Regular Medicine
                  </CheckboxGroup>
                  <CheckboxGroup onClick={() => setIsDischarge(!isDischarge)}>
                    <input type="checkbox" checked={isDischarge} readOnly /> Discharge Medicine
                  </CheckboxGroup>
                </div>

                <div style={{ display: "flex", gap: "8px", marginLeft: "auto", paddingBottom: "2px" }}>
                  <CancelBtn onClick={resetForm}>✕ Reset</CancelBtn>
                  <AddBtn onClick={handleAddMedicine}>＋ Add Medicine</AddBtn>
                </div>
              </div>
            </FormPanel>

            <SidePanel>
              <SidePanelHeader>
                <span>Selected Items ({selectedMedicines.length})</span>
                {selectedMedicines.length > 0 && <span style={{ color: "#0d8a7a", fontSize: "0.75rem" }}>Ready</span>}
              </SidePanelHeader>
              <SidePanelContent>
                {selectedMedicines.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: colors.textMuted,
                      marginTop: "40px",
                      fontSize: "0.85rem",
                    }}
                  >
                    No medicines added yet.
                  </div>
                ) : (
                  selectedMedicines.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px 10px",
                        borderBottom: "1px solid #F0F0F0",
                        position: "relative",
                        borderRadius: "6px",
                        background: "#f7fcfb",
                        marginBottom: "4px",
                        cursor: "default",
                      }}
                    >
                      {/* Medicine Name – click to load back into form */}
                      <div
                        onClick={() => handleEditSelectedMed(idx)}
                        title="Click to edit this medicine"
                        style={{
                          fontWeight: "700",
                          fontSize: "0.82rem",
                          color: colors.primary,
                          cursor: "pointer",
                          paddingRight: "36px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        ✎ {m.name || `Item ID: ${m.item_id}`}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: colors.textMuted,
                          marginTop: "2px",
                          paddingRight: "36px",
                        }}
                      >
                        {m.dosage} | {m.noOfDays}d | Qty: {m.qty}
                        {m.batch_number ? ` | B: ${m.batch_number}` : ""}
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => removeSelectedMed(idx)}
                        title="Remove"
                        style={{
                          position: "absolute",
                          right: "6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "#ffe8e8",
                          border: "none",
                          color: "#e53935",
                          cursor: "pointer",
                          borderRadius: "4px",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </SidePanelContent>
              <SidePanelFooter>
                {editingRequest ? (
                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "6px",
                        border: `1px solid ${colors.border}`,
                        background: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      Cancel
                    </button>
                    <AddBtn
                      style={{ flex: 2, padding: "8px", height: "34px" }}
                      onClick={handleEditSave}
                      disabled={editSaving}
                    >
                      {editSaving ? "Saving..." : "💾 Save Edit"}
                    </AddBtn>
                  </div>
                ) : (
                  <AddBtn
                    style={{ width: "100%", padding: "8px", height: "34px" }}
                    onClick={handleConfirm}
                  >
                    Confirm Request
                  </AddBtn>
                )}
              </SidePanelFooter>
            </SidePanel>
          </RequestFormWrapper>
        )}

        <TabsBar>
          <Tab active={true}>💊 Medicine Request History</Tab>
        </TabsBar>

        {/* ── Medicine History Table (Collapsible Accordion Design) ── */}
        <div style={{ overflowX: "auto", borderRadius: "8px", border: `1px solid ${colors.border}` }}>
          <StyledTable>
            <thead>
              <tr>
                <th style={{ width: "35px", textAlign: "center" }}></th>
                <th>Req Date & Time</th>
                <th>Req / Bill No</th>
                <th>Doctor</th>
                <th>Bill Type</th>
                <th style={{ textAlign: "center" }}>Medicines</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: colors.textMuted,
                    }}
                  >
                    No request history found.
                  </td>
                </tr>
              ) : (
                Array.isArray(requests) && requests.map((req, i) => {
                  const rowId = req.Bill_id || req.id || req.reqId || i;
                  const isExpanded = expandedRow === rowId;
                  const activeMeds = (req.medicines || []).filter((m) => !m.is_deleted);
                  const hasPendingReturn = Array.isArray(req.pending_returns) && req.pending_returns.some((pr) => pr.status === "Pending");
                  const canReturn = ["Billed", "Paid"].includes(req.status) && !hasPendingReturn;
                  const canCancel = (req.status === "Pending" || !req.status);

                  return (
                    <React.Fragment key={rowId}>
                      <tr
                        style={{
                          cursor: "pointer",
                          background: isExpanded ? "#f0fdfa" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onClick={() => toggleRow(rowId)}
                      >
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(rowId);
                            }}
                            style={{
                              background: isExpanded ? colors.primary : "#e2e8f0",
                              color: isExpanded ? "white" : "#475569",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              width: "24px",
                              height: "24px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                            title={isExpanded ? "Collapse items" : "Expand items"}
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        </td>
                        <td style={{ fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap" }}>
                          {req.reqDate} {req.reqTime}
                        </td>
                        <td style={{ fontWeight: 600, color: "#0d8a7a" }}>
                          {req.bill_no || req.Bill_id || req.reqId || "-"}
                        </td>
                        <td style={{ color: "#334155" }}>
                          {req.doctorName || req.doctor || "-"}
                        </td>
                        <td>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: "#e0f2fe",
                            color: "#0369a1",
                            fontSize: "0.78rem",
                            fontWeight: 600
                          }}>
                            {req.billName || "PHARMACY IP BILL"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              background: isExpanded ? colors.primary : "#f1f5f9",
                              color: isExpanded ? "white" : "#334155",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              border: "1px solid #cbd5e1"
                            }}
                          >
                            💊 {activeMeds.length} Items {isExpanded ? "▲" : "▼"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <LegendItem
                            color={getStatusColor(req.status || "Pending", req.isDischarge)}
                          >
                            {req.isDischarge ? "Discharge Medicine" : (req.status || "Pending")}
                          </LegendItem>
                        </td>
                        <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button
                              onClick={() => handleOpenEdit(req)}
                              disabled={req.status === "Billed" || req.status === "Cancelled"}
                              style={{
                                background: req.status === "Billed" || req.status === "Cancelled" ? "#ccc" : "#136A63",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                                cursor: req.status === "Billed" || req.status === "Cancelled" ? "not-allowed" : "pointer",
                                fontSize: "0.78rem",
                                fontWeight: "600",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                              title="Edit Request"
                            >
                              ✎ Edit
                            </button>
                            <button
                              onClick={() => handleOpenReturn(req)}
                              disabled={!canReturn}
                              style={{
                                background: !canReturn ? "#ccc" : colors.orange,
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                padding: "5px 10px",
                                cursor: !canReturn ? "not-allowed" : "pointer",
                                fontSize: "0.78rem",
                                fontWeight: "600",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                              title="Return Medicines"
                            >
                              {hasPendingReturn ? "⌛ Return Pending" : "↺ Return"}
                            </button>
                            {canCancel && (
                              <button
                                onClick={() => handleCancelRequest(req.Bill_id || req.id)}
                                style={{
                                  background: "#fee2e2",
                                  color: "#dc2626",
                                  border: "none",
                                  borderRadius: "5px",
                                  padding: "5px 10px",
                                  cursor: "pointer",
                                  fontSize: "0.78rem",
                                  fontWeight: "600",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                                title="Cancel Request"
                              >
                                ✕ Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Accordion Subtable */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="8" style={{ padding: 0, background: "#f8fafc", borderBottom: `2px solid ${colors.primary}` }}>
                            <SubTableWrapper>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: colors.primary, display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span>📋 Medicine Particulars ({activeMeds.length} items)</span>
                                  {req.total_amount > 0 && (
                                    <span style={{ color: "#64748b", fontWeight: 500 }}>
                                      · Total: ₹{Number(req.total_amount).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleRow(rowId)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  ▲ Collapse
                                </button>
                              </div>

                              <SubTable>
                                <thead>
                                  <tr>
                                    <th style={{ width: "35px", textAlign: "center" }}>#</th>
                                    <th>Medicine Name</th>
                                    <th>Dosage</th>
                                    <th style={{ textAlign: "center" }}>Days</th>
                                    <th style={{ textAlign: "center" }}>Qty</th>
                                    <th>Route</th>
                                    <th>Batch No</th>
                                    {canCancel && <th style={{ textAlign: "center", width: "70px" }}>Action</th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  {activeMeds.length === 0 ? (
                                    <tr>
                                      <td colSpan={canCancel ? 8 : 7} style={{ textAlign: "center", color: "#94a3b8", padding: "16px" }}>
                                        No medicines found in this request.
                                      </td>
                                    </tr>
                                  ) : (
                                    activeMeds.map((m, mIdx) => (
                                      <tr key={mIdx}>
                                        <td style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.78rem" }}>
                                          {mIdx + 1}
                                        </td>
                                        <td style={{ fontWeight: 600, color: "#0f172a" }}>
                                          {m.item_name || m.name || `Item ${m.item_id}`}
                                        </td>
                                        <td style={{ color: "#475569" }}>{m.dosage || "-"}</td>
                                        <td style={{ textAlign: "center", color: "#475569" }}>{m.noOfDays || "-"}</td>
                                        <td style={{ textAlign: "center", fontWeight: 700, color: "#0d8a7a" }}>
                                          {m.quantity || m.qty || 0}
                                        </td>
                                        <td style={{ color: "#475569" }}>{m.route || "-"}</td>
                                        <td style={{ color: "#64748b", fontSize: "0.8rem" }}>{m.batch_number || "-"}</td>
                                        {canCancel && (
                                          <td style={{ textAlign: "center" }}>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveIndividualMedicine(req.Bill_id || req.id, m)}
                                              style={{
                                                background: "#fee2e2",
                                                border: "none",
                                                color: "#dc2626",
                                                cursor: "pointer",
                                                borderRadius: "4px",
                                                padding: "2px 8px",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                              }}
                                              title="Remove this medicine"
                                            >
                                              ✕ Remove
                                            </button>
                                          </td>
                                        )}
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </SubTable>
                            </SubTableWrapper>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </StyledTable>
        </div>
        <LegendContainer>
          <LegendItem color={colors.legPending}>Pending</LegendItem>
          <LegendItem color={colors.legSubstituted}>Substituted</LegendItem>
          <LegendItem color={colors.legBilled}>Billed</LegendItem>
          <LegendItem color={colors.legCancelled}>Cancelled</LegendItem>
          <LegendItem color={colors.legStopped}>Stopped</LegendItem>
          <LegendItem color={colors.legEmergency}>Emergency</LegendItem>
          <LegendItem color={colors.legInsurance}>Insurance Item</LegendItem>
          <LegendItem color={colors.legDischarge}>Discharge Med</LegendItem>
          <LegendItem color={colors.legRegular}>Regular Med</LegendItem>
        </LegendContainer>
      </div>



      {/* ─── Medicine Search Modal ────────────────────────────────────── */}
      {isSearchModalOpen && (
        <ModalOverlay style={{ zIndex: 2000 }}>
          <ModalContainer
            style={{ width: "80%", height: "80%", maxWidth: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>Select Medicine ({billTypeName || pharmacyDept})</Title>
              <button onClick={() => setIsSearchModalOpen(false)}>×</button>
            </Header>
            <ContentBody>
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "16px" }}
              >
                <StyledInput
                  style={{ flex: 1 }}
                  placeholder="Search medicine name (use ↑/↓ to navigate, Enter to select)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (searchResults.length > 0) {
                        setHighlightedMedicineIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
                      }
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (searchResults.length > 0) {
                        setHighlightedMedicineIndex((prev) => (prev <= 0 ? searchResults.length - 1 : prev - 1));
                      }
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (searchResults.length > 0 && highlightedMedicineIndex >= 0 && searchResults[highlightedMedicineIndex]) {
                        setSelectedDrug(searchResults[highlightedMedicineIndex]);
                        setIsSearchModalOpen(false);
                      } else {
                        handleMedicineSearch(searchQuery);
                      }
                    } else if (e.key === "Escape") {
                      setIsSearchModalOpen(false);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    handleMedicineSearch(searchQuery);
                  }}
                  style={{
                    background: colors.primary,
                    color: "white",
                    padding: "0 16px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "14px",
                  }}
                >
                  <Search size={16} /> Search
                </button>
              </div>

              {searchLoading ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: colors.primary,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: "8px" }}>⏳</span>
                  Searching medicines in {billTypeName || pharmacyDept}...
                </div>
              ) : searchResults.length > 0 ? (
                <div
                  style={{
                    overflowX: "auto",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.9rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{ background: colors.headerBg, color: "#fff" }}
                      >
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Item Name
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Batch No
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Expiry
                        </th>
                        <th style={{ padding: "10px", textAlign: "right" }}>
                          MRP (₹)
                        </th>
                        <th style={{ padding: "10px", textAlign: "right" }}>
                          Stock
                        </th>
                        <th style={{ padding: "10px", textAlign: "center" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody ref={medicineTableBodyRef}>
                      {Array.isArray(searchResults) && searchResults.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: `1px solid ${colors.border}`,
                            background: idx === highlightedMedicineIndex ? "#e6f9f3" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={() => setHighlightedMedicineIndex(idx)}
                          onClick={() => {
                            setSelectedDrug(item);
                            setIsSearchModalOpen(false);
                          }}
                        >
                          <td style={{ padding: "10px", fontWeight: idx === highlightedMedicineIndex ? 700 : 500, color: idx === highlightedMedicineIndex ? "#0d8a7a" : "inherit" }}>
                            {item.name}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {item.batch_number}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {item.expiry_date && item.expiry_date !== "-"
                              ? new Date(item.expiry_date).toLocaleDateString()
                              : "-"}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            {Number(item.price).toFixed(2)}
                          </td>
                          <td style={{ padding: "10px", textAlign: "right" }}>
                            {item.total_stock}
                          </td>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <button
                              style={{
                                background: idx === highlightedMedicineIndex ? "#0d8a7a" : colors.primary,
                                color: "white",
                                border: "none",
                                padding: "6px 14px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: 700,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDrug(item);
                                setIsSearchModalOpen(false);
                              }}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: colors.textMuted,
                  }}
                >
                  No stock found matching your search in {billTypeName || pharmacyDept}.
                </div>
              )}
            </ContentBody>
          </ModalContainer>
        </ModalOverlay>
      )}
      {showDosageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ margin: 0 }}>Add New Dosage</h3>
              <X
                size={20}
                style={{ cursor: "pointer" }}
                onClick={() => setShowDosageModal(false)}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Dosage Name (e.g. 1-1-1)
              </label>
              <input
                value={newDosageName}
                onChange={(e) => setNewDosageName(e.target.value)}
                placeholder="Enter dosage..."
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowDosageModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDosage}
                style={{
                  background: colors.primary,
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Dosage
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Return Medicine Modal ────────────────────────────────────── */}
      {isReturnModalOpen && selectedReturnReq && (
        <ModalOverlay style={{ zIndex: 2000 }}>
          <ModalContainer
            style={{ width: "80%", height: "80%", maxWidth: "1000px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header style={{ background: `linear-gradient(135deg, ${colors.orange}, ${colors.orangeHover})` }}>
              <Title>Return Medicine</Title>
              <button onClick={() => setIsReturnModalOpen(false)}>×</button>
            </Header>
            <ContentBody style={{ overflowY: "auto" }}>
              <div style={{ marginBottom: "16px", background: "#fff8e1", padding: "12px", borderRadius: "8px", borderLeft: `4px solid ${colors.orange}` }}>
                <strong>Request Date:</strong> {selectedReturnReq.reqDate} {selectedReturnReq.reqTime} <br />
                <strong>Bill ID:</strong> {selectedReturnReq.Bill_id} <br />
                <strong>Doctor:</strong> {selectedReturnReq.doctorName || selectedReturnReq.doctor}
              </div>
              <div style={{ overflowX: "auto" }}>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Batch</th>
                      <th>Billed Qty</th>
                      <th>Return Qty</th>
                      <th>Reason for Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReturnReq.medicines?.filter(m => !m.is_deleted).map((m, idx) => {
                      const key = `${m.item_id}_${m.batch_number}`;
                      const returnState = returnItems[key] || {};
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{m.item_name || m.name || `(ID: ${m.item_id})`}</td>
                          <td>{m.batch_number || "-"}</td>
                          <td>{m.quantity}</td>
                          <td>
                            <StyledInput
                              type="number"
                              min="0"
                              max={m.quantity}
                              value={returnState.qty || ""}
                              onChange={(e) => handleReturnChange(key, "qty", e.target.value)}
                              placeholder="0"
                              style={{ width: "80px", textAlign: "center" }}
                            />
                          </td>
                          <td>
                            <StyledInput
                              type="text"
                              value={returnState.reason || ""}
                              onChange={(e) => handleReturnChange(key, "reason", e.target.value)}
                              placeholder="Reason..."
                              style={{ width: "100%" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </StyledTable>
              </div>
            </ContentBody>
            <div style={{ padding: "16px", borderTop: "1px solid #CFD8DC", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#f5f7f8" }}>
              <CancelBtn onClick={() => setIsReturnModalOpen(false)}>Cancel</CancelBtn>
              <RequestBtn
                onClick={handleReturnSubmit}
                disabled={returnSaving}
                style={{ background: returnSaving ? "#ccc" : colors.orange }}
              >
                {returnSaving ? "Processing..." : "Submit Return"}
              </RequestBtn>
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* Package Selection Modal */}
      {isPackageModalOpen && (
        <ModalOverlay style={{ zIndex: 2000 }}>
          <ModalContainer
            style={{ width: "90%", maxWidth: "700px", height: "70vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader $bg="#136A63">
              <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>🎁</span>
                <h3 style={{ color: "#fff", margin: 0 }}>Select Medicine Package</h3>
              </div>
              <CloseButton onClick={() => setIsPackageModalOpen(false)} style={{ color: "rgba(255,255,255,0.8)", background: 'transparent' }}>
                ✕
              </CloseButton>
            </ModalHeader>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: colors.background }}>
              {/* Package Search Input */}
              <div style={{ marginBottom: "16px", position: "relative" }}>
                <StyledInput
                  type="text"
                  placeholder="Search package by name..."
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  style={{
                    paddingLeft: "36px",
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    background: "white",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                />
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.textMuted
                  }}
                />
              </div>

              {packageLoading ? (
                <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                  Loading packages...
                </div>
              ) : filteredPackages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted }}>
                  No medicine packages found.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {filteredPackages.map((pkg) => (
                    <div
                      key={pkg.medPackage_id}
                      onClick={() => handleSelectPackage(pkg)}
                      style={{
                        padding: "16px",
                        background: "white",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = colors.primary;
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(13, 148, 136, 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: colors.textMain, fontSize: "0.95rem" }}>
                          {pkg.medPackage_name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: colors.textMuted, marginTop: "4px" }}>
                          {(pkg.items || []).map(it => `${it.item_name} (x${it.qty})`).join(", ")}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: colors.primary, fontWeight: 700 }}>
                        Select →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}
    </>
  );
};

export default MedicineWardRequest;

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import JsBarcode from "jsbarcode";
import { format } from "date-fns";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import headerImage from "../Images/SummaryHead.png";
import FooterImage from "../Images/Footer.png";
import {
  PageWrapper,
  Container,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  Label,
  TextArea,
  ButtonContainer,
  colors,
} from "../GlobalStyles";

// ─── Bill Type Options ────────────────────────────────────────────────────────

const BILL_TYPES = [
  { label: "CT", value: "CT01" },
  { label: "MRI", value: "MRI01" },
  { label: "USG", value: "USG01" },
  { label: "X-RAY", value: "XRAY01" },
];

// ─── Animations ───────────────────────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

// ─── Page Layout ──────────────────────────────────────────────────────────────

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.9rem;
  border-bottom: 2px solid #f0f0f0;
`;

const PageTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before {
    content: "🔬";
    font-size: 1.3rem;
  }
`;

// ─── Stat Cards ───────────────────────────────────────────────────────────────

const StatsRow = styled.div`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 1.1rem;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 90px;
  background: ${(p) => p.bg || "#f8f8f8"};
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border-left: 3px solid ${(p) => p.accent || "#ccc"};
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
`;

const StatIcon = styled.span`
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatCount = styled.span`
  font-size: 1.25rem;
  font-weight: 800;
  color: ${(p) => p.color || "#333"};
  line-height: 1.1;
`;

const StatLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

// ─── Date + Bill Type Filter Bar ──────────────────────────────────────────────

const FilterContainer = styled.div`
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  color: #00897b;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const DateInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #555;
  transition: all 0.2s ease;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.1);
  }
`;

// ─── Bill Type Dropdown ───────────────────────────────────────────────────────

const BillTypeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const BillTypeSelect = styled.select`
  padding: 0.4rem 2rem 0.4rem 0.75rem;
  border: 2px solid #00897b;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #00695c;
  background: linear-gradient(135deg, #f0faf8 0%, #e8f5e9 100%);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2300897b' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  min-width: 100px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 137, 123, 0.15);
  &:focus {
    outline: none;
    border-color: #00695c;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.2);
  }
  &:hover {
    background: linear-gradient(135deg, #e0f2f1 0%, #e8f5e9 100%);
    border-color: #00695c;
  }
  option {
    font-weight: 700;
    color: #333;
    background: white;
  }
`;

const ResetButton = styled(Button)`
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  padding: 0.4rem 1rem;
  font-size: 0.78rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  &:hover {
    background: linear-gradient(135deg, #616161 0%, #424242 100%);
    transform: translateY(-1px);
  }
`;

// ─── Column Search Row ────────────────────────────────────────────────────────

const SearchInput = styled.input`
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #444;
  background: #fafafa;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.12);
    background: #fff;
  }
  &::placeholder {
    color: #bbb;
    font-style: italic;
  }
`;

const SearchSelect = styled.select`
  width: 100%;
  padding: 0.4rem 0.5rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #444;
  background: #fafafa;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 2px rgba(0, 137, 123, 0.12);
    background: #fff;
  }
`;

const SearchTh = styled.th`
  padding: 0.4rem 0.5rem 0.6rem;
  background: #f8fffe;
  border-bottom: 2px solid #e0f2f1;
`;

// ─── Icon Action Buttons ──────────────────────────────────────────────────────

const IconBtn = styled.button`
  position: relative;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    filter 0.15s;
  flex-shrink: 0;
  background: ${(p) => p.bg || "#eee"};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
    filter: brightness(1.1);
  }
  &:active:not(:disabled) {
    transform: translateY(0) scale(1);
  }
  &:disabled {
    opacity: 0.28;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    filter: none;
  }
  &::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(20, 20, 20, 0.9);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
    padding: 4px 9px;
    border-radius: 6px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 9999;
    letter-spacing: 0.3px;
  }
  &::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 1px);
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(20, 20, 20, 0.9);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 9999;
  }
  &:hover:not(:disabled)::after,
  &:hover:not(:disabled)::before {
    opacity: 1;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.3rem;
  align-items: center;
  flex-wrap: nowrap;
`;

// ─── Print Dropdown (portal pattern) ─────────────────────────────────────────

const PrintDropdownWrapper = styled.div`
  position: relative;
`;

const PortalDropdownMenu = styled.div`
  position: fixed;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  min-width: 200px;
  z-index: 9999;
  overflow: hidden;
  border: 1px solid #e9ecef;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background-color: white;
  color: black;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #e9ecef;
  }
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = styled.span`
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  text-transform: uppercase;
  white-space: nowrap;
  ${(props) => {
    if (!props.hasReport)
      return `background: linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%); color:#1565c0;`;
    if (props.approved)
      return `background: linear-gradient(135deg,#c8e6c9 0%,#a5d6a7 100%); color:#2e7d32;`;
    return `background: linear-gradient(135deg,#fff9c4 0%,#fff59d 100%); color:#f57f17;`;
  }}
`;

const SlotBadge = styled.span`
  padding: 0.22rem 0.55rem;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  background: linear-gradient(135deg, #ede7f6 0%, #d1c4e9 100%);
  color: #4527a0;
  white-space: nowrap;
`;

const ReferredByBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0277bd;
  background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  &::before {
    content: "📭";
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }
  p {
    font-size: 1.125rem;
    font-weight: 500;
    color: #666;
  }
`;

// ─── Shared Modal Base ────────────────────────────────────────────────────────

const StyledModalOverlay = styled(ModalOverlay)`
  background: linear-gradient(
    135deg,
    rgba(0, 137, 123, 0.9) 0%,
    rgba(0, 105, 92, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
`;

const StyledModalContent = styled(ModalContainer)`
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 820px;
  width: 100%;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  max-height: 92vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: auto;
  position: relative;
  animation: ${slideUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const StyledModalHeader = styled(ModalHeader)`
  border-bottom: 2px solid #f0f0f0;
  background: transparent;
  padding: 0 0 1rem 0;
  margin-bottom: 1.5rem;
`;

const ModalIcon = styled.span`
  font-size: 2rem;
`;

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  border: 1.5px solid #b2dfdb;
  border-left: 5px solid #00897b;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem 1rem;
`;

const InfoChip = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const InfoChipLabel = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  color: #00897b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoChipValue = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
`;

const SectionCard = styled.div`
  border: 2px solid ${(p) => (p.expanded ? "#b2dfdb" : "#f0f0f0")};
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s;
  margin-bottom: 0.6rem;
`;

const SectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  background: ${(p) =>
    p.expanded ? "linear-gradient(135deg,#e8f5e9,#f1f8f4)" : "#fafafa"};
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(135deg, #e0f2f1, #e8f5e9);
  }
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const SectionNumber = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00897b, #00695c);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SectionName = styled.span`
  font-weight: 700;
  font-size: 0.82rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const ChevronIcon = styled.span`
  font-size: 0.8rem;
  color: #00897b;
  transition: transform 0.2s;
  transform: ${(p) => (p.expanded ? "rotate(180deg)" : "rotate(0deg)")};
`;

const SectionCardBody = styled.div`
  padding: ${(p) => (p.expanded ? "0.875rem 1rem" : "0")};
  max-height: ${(p) => (p.expanded ? "600px" : "0")};
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    padding 0.3s ease;
  background: white;
`;

const PreviewContent = styled.div`
  font-size: 0.875rem;
  color: #444;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  b,
  strong {
    color: #00695c;
    font-weight: 800;
  }
`;

const SECTION_TITLES = {
  "01": "Liver",
  "02": "Gall Bladder",
  "03": "Pancreas",
  "04": "Spleen",
  "05": "Kidneys",
  "06": "Urinary Bladder",
  "07": "Uterus & Ovaries",
  "08": "Aorta / Others",
};
const getSectionTitle = (title_id) =>
  SECTION_TITLES[title_id] || `Section ${title_id}`;

const RichEditor = styled.div`
  width: 100%;
  min-height: 90px;
  padding: 0.75rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #444;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.8;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: text;
  background: white;
  &:focus {
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
  b,
  strong {
    color: #00695c;
    font-weight: 800;
  }
  &:empty::before {
    content: attr(data-placeholder);
    color: #bbb;
    font-style: italic;
    pointer-events: none;
  }
`;

const FinalRichEditor = styled.div`
  width: 100%;
  min-height: 160px;
  padding: 0.875rem 1rem;
  border: 2px solid #ce93d8;
  border-radius: 12px;
  font-size: 0.938rem;
  color: #333;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.7;
  overflow-y: auto;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: text;
  background: white;
  &:focus {
    border-color: #8e24aa;
    box-shadow: 0 0 0 3px rgba(142, 36, 170, 0.12);
  }
  b,
  strong {
    color: #6a1b9a;
    font-weight: 800;
  }
  &:empty::before {
    content: attr(data-placeholder);
    color: #bbb;
    font-style: italic;
    pointer-events: none;
  }
`;

const ImpressionBox = styled.div`
  background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
  border: 2px solid #ce93d8;
  border-radius: 14px;
  padding: 1.1rem 1.4rem;
  margin-top: 1.25rem;
`;

const ImpressionTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 800;
  color: #6a1b9a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &::before {
    content: "📝";
  }
`;

const ImpressionText = styled.div`
  font-size: 0.938rem;
  color: #333;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  b,
  strong {
    color: #6a1b9a;
    font-weight: 800;
  }
`;

const EditImpressionSection = styled.div`
  background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
  border: 2px solid #ce93d8;
  border-radius: 14px;
  padding: 1.1rem 1.4rem;
  margin-top: 1.25rem;
`;

const EditImpressionTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 800;
  color: #6a1b9a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &::before {
    content: "📝";
  }
`;

const SectionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const SectionsTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 800;
  color: #00695c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before {
    content: "🏥";
  }
`;

const SmallBtn = styled.button`
  padding: 0.28rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: all 0.15s;
  background: ${(p) => p.bg || "#eee"};
  color: ${(p) => p.color || "#333"};
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 2px solid #f0f0f0;
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
`;

const ModalActionButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  background: ${(p) => p.bg || "#eee"};
  color: ${(p) => p.color || "#333"};
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    filter: brightness(1.08);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ApprovalBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  ${(p) =>
    p.approved
      ? `background: linear-gradient(135deg,#c8e6c9,#a5d6a7); color:#2e7d32;`
      : `background: linear-gradient(135deg,#fff9c4,#fff59d); color:#f57f17;`}
  margin-bottom: 1rem;
`;

const SlotModalContent = styled(StyledModalContent)`
  max-width: 580px;
`;
const SlotModalOverlay = styled(StyledModalOverlay)`
  background: linear-gradient(
    135deg,
    rgba(124, 77, 255, 0.88) 0%,
    rgba(101, 31, 255, 0.88) 100%
  );
`;

const SlotFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SlotLabel = styled.label`
  color: #4527a0;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const SlotInput = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #d1c4e9;
  border-radius: 12px;
  font-size: 1rem;
  color: #333;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #7c4dff;
    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.15);
  }
`;

const SlotDivider = styled.div`
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 1rem 0 1.5rem 0;
`;

const SlotSectionTitle = styled.h3`
  font-size: 0.938rem;
  font-weight: 700;
  color: #7c4dff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ImpressionOptionalNote = styled.p`
  font-size: 0.8rem;
  color: #888;
  margin: -0.75rem 0 1rem 0;
  font-style: italic;
`;

const SlotInfoRow = styled.div`
  display: flex;
  padding: 0.875rem 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
`;

const SlotInfoLabel = styled.span`
  color: #00897b;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 130px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SlotInfoValue = styled.span`
  color: #555;
  font-size: 0.938rem;
  flex: 1;
`;

const StyledTextArea = styled(TextArea)`
  width: 100%;
  min-height: 120px;
  border: 2px solid #d1c4e9;
  border-radius: 12px;
  box-sizing: border-box;
  &:focus {
    border-color: #7c4dff;
    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.15);
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") return date.split("T")[0];
  if (date instanceof Date) return date.toISOString().split("T")[0];
  return "";
};

const getToday = () => new Date().toISOString().split("T")[0];

const formatSlotDisplay = (slotDateTime) => {
  if (!slotDateTime) return null;
  try {
    const d = new Date(slotDateTime);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return slotDateTime;
  }
};

const stripHTML = (html) => (html || "").replace(/<[^>]*>/g, "").trim();

// ─── Rich Editor Components ───────────────────────────────────────────────────

const SectionRichEditor = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);
  const lastRef = useRef("");
  const suppressRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = value || "";
    lastRef.current = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    if (value !== lastRef.current) {
      ref.current.innerHTML = value || "";
      lastRef.current = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastRef.current = html;
    suppressRef.current = true;
    onChange(html);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <RichEditor
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      onPaste={handlePaste}
      spellCheck={false}
    />
  );
};

const ImpressionRichEditor = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);
  const lastRef = useRef("");
  const suppressRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = value || "";
    lastRef.current = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    if (value !== lastRef.current) {
      ref.current.innerHTML = value || "";
      lastRef.current = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastRef.current = html;
    suppressRef.current = true;
    onChange(html);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <FinalRichEditor
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      onPaste={handlePaste}
      spellCheck={false}
    />
  );
};

// ─── Section Items ────────────────────────────────────────────────────────────

const PreviewSectionItem = ({ section, index }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <SectionCard expanded={expanded}>
      <SectionCardHeader
        expanded={expanded}
        onClick={() => setExpanded((p) => !p)}
      >
        <SectionTitleRow>
          <SectionNumber>{index + 1}</SectionNumber>
          <SectionName>{section.title}</SectionName>
        </SectionTitleRow>
        <ChevronIcon expanded={expanded}>▼</ChevronIcon>
      </SectionCardHeader>
      <SectionCardBody expanded={expanded}>
        <PreviewContent
          dangerouslySetInnerHTML={{
            __html:
              section.value ||
              "<em style='color:#bbb'>No findings entered.</em>",
          }}
        />
      </SectionCardBody>
    </SectionCard>
  );
};

const EditSectionItem = ({ section, index, onChange }) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <SectionCard expanded={expanded}>
      <SectionCardHeader
        expanded={expanded}
        onClick={() => setExpanded((p) => !p)}
      >
        <SectionTitleRow>
          <SectionNumber>{index + 1}</SectionNumber>
          <SectionName>{section.title}</SectionName>
        </SectionTitleRow>
        <ChevronIcon expanded={expanded}>▼</ChevronIcon>
      </SectionCardHeader>
      <SectionCardBody expanded={expanded}>
        <SectionRichEditor
          value={section.value}
          onChange={(html) => onChange(index, html)}
          placeholder={`Enter findings for ${section.title}…`}
        />
      </SectionCardBody>
    </SectionCard>
  );
};

const buildSectionsFromValueDetails = (valuedetails) => {
  if (!valuedetails || !Array.isArray(valuedetails.value)) return [];
  return valuedetails.value.map((v) => ({
    title_id: v.title_id,
    title: getSectionTitle(v.title_id),
    value: v.title_value || "",
  }));
};

// ─── PDF Print Helper ─────────────────────────────────────────────────────────

/**
 * Generates and opens a PDF report for a radiology investigation row.
 * Uses only the data already present in `row` — no extra API call needed.
 *
 * @param {object} row          - The row object from RDList state
 * @param {boolean} withLetterpad - Whether to include header/footer images
 */
const handlePrintReport = async (row, withLetterpad = true) => {
  try {
    const report = row.report;
    if (!report) {
      toast.error("No report available to print.");
      return;
    }

    const sections = buildSectionsFromValueDetails(report.valuedetails);
    const impression = report.impression || "";

    // ── Layout constants (mirrors PatientOverview) ────────────────────────
    const leftMargin = 10;
    const rightMargin = leftMargin + 190;
    const contentWidth = rightMargin - leftMargin;
    const headerHeight = 25;
    const footerHeight = 20;
    const contentYStart = headerHeight + 15;
    const signatureHeight = 35;

    // ── Patient info rows ─────────────────────────────────────────────────
    const billDateFormatted = row.investBillDate
      ? format(new Date(row.investBillDate), "dd MMM yy / HH:mm")
      : "N/A";
    const slotFormatted = report.slot_DateTime
      ? format(new Date(report.slot_DateTime), "dd MMM yy / HH:mm")
      : null;
    const approvedFormatted = report.approved_date
      ? format(new Date(report.approved_date), "dd MMM yy / HH:mm")
      : null;

    const leftDetails = [
      { label: "Bill No", value: row.investBillNo || "N/A" },
      { label: "UHID", value: row.uhid || "N/A" },
      { label: "Patient Name", value: row.patientName || "N/A" },
      {
        label: "Age / Gender",
        value: `${row.age || "N/A"} / ${row.gender || "N/A"}`,
      },
      { label: "Referred By", value: row.referredBy || "SELF" },
    ];

    const rightDetails = [
      { label: "Billed On", value: billDateFormatted },
      ...(slotFormatted ? [{ label: "Slot Date", value: slotFormatted }] : []),
      ...(approvedFormatted
        ? [{ label: "Approved On", value: approvedFormatted }]
        : []),
      { label: "Printed On", value: format(new Date(), "dd MMM yy / HH:mm") },
      ...(row.ipNumber
        ? [{ label: "IP Number", value: row.ipNumber || "N/A" }]
        : []),
    ];

    // ── jsPDF setup ───────────────────────────────────────────────────────
    const doc = new jsPDF();
    let pageCount = 1;

    const wrapText = (text, maxWidth) => {
      if (!text) return [];
      return doc.splitTextToSize(text, maxWidth);
    };
    const justifyText = (text, maxWidth, x, y, lineHeight = 5) => {
      if (!text) return 0;
      const lines = wrapText(text, maxWidth);
      lines.forEach((line, i) => {
        const isLast = i === lines.length - 1;
        if (isLast || line.trim() === "") {
          doc.text(line, x, y + i * lineHeight); // last line left-aligned
          return;
        }
        const words = line.split(" ");
        if (words.length === 1) {
          doc.text(line, x, y + i * lineHeight);
          return;
        }
        const totalWordW = words.reduce((s, w) => s + doc.getTextWidth(w), 0);
        const gap = (maxWidth - totalWordW) / (words.length - 1);
        let cx = x;
        words.forEach((word) => {
          doc.text(word, cx, y + i * lineHeight);
          cx += doc.getTextWidth(word) + gap;
        });
      });
      return lines.length * lineHeight;
    };
    const renderWrapped = (text, maxWidth, x, y, lineHeight = 4) => {
      if (!text) return 0;
      const lines = wrapText(text, maxWidth);
      lines.forEach((line, i) => doc.text(line, x, y + i * lineHeight));
      return lines.length * lineHeight;
    };

    const calculateMaxLabelWidth = (details) => {
      const tempDoc = new jsPDF();
      return Math.max(...details.map((d) => tempDoc.getTextWidth(d.label)));
    };

    // ── Header / Footer ───────────────────────────────────────────────────
    const addHeaderFooter = () => {
      if (withLetterpad) {
        doc.addImage(
          headerImage,
          "PNG",
          0,
          10,
          doc.internal.pageSize.width,
          headerHeight,
        );
        doc.addImage(
          FooterImage,
          "PNG",
          0,
          doc.internal.pageSize.height - footerHeight,
          doc.internal.pageSize.width,
          footerHeight,
        );
      }
    };

    // ── Patient Info block ────────────────────────────────────────────────
    const addPatientInfo = (yPos) => {
      const leftMaxW = calculateMaxLabelWidth(leftDetails);
      const rightMaxW = calculateMaxLabelWidth(rightDetails);
      const centerPoint = (leftMargin + rightMargin) / 2;

      const leftLabelX = leftMargin;
      const leftColonX = leftLabelX + leftMaxW + 2;
      const leftValueX = leftColonX + 3;
      const rightLabelX = centerPoint + 28;
      const rightColonX = rightLabelX + rightMaxW + 2;
      const rightValueX = rightColonX + 1;

      doc.setFontSize(10);
      let infoY = yPos;
      const maxLen = Math.max(leftDetails.length, rightDetails.length);

      for (let i = 0; i < maxLen; i++) {
        const left = leftDetails[i];
        const right = rightDetails[i];
        let leftRowH = 5;

        if (left) {
          doc.setFont("helvetica", "bold");
          doc.text(left.label, leftLabelX, infoY);
          doc.text(":", leftColonX, infoY);
          doc.setFont("helvetica", "normal");
          const maxLeftW = centerPoint + 25 - leftValueX;
          const leftLines = wrapText(left.value, maxLeftW);
          leftLines.forEach((line, li) =>
            doc.text(line, leftValueX, infoY + li * 4),
          );
          leftRowH = leftLines.length * 4;
        }

        if (right) {
          doc.setFont("helvetica", "bold");
          doc.text(right.label, rightLabelX, infoY);
          doc.text(":", rightColonX, infoY);
          doc.setFont("helvetica", "normal");
          doc.text(right.value, rightValueX, infoY);
        }

        infoY += Math.max(leftRowH, 5);
      }
      return infoY;
    };

    // ── Signatures placeholder (no signature data in RD response) ─────────
    // If signatures are available in future, they can be added here.
    const addSignatures = () => {
      // No signature data provided in scan report response — space reserved.
    };

    // ── Page overflow check ───────────────────────────────────────────────
    const checkNewPage = (yPos, needed) => {
      const pageH = doc.internal.pageSize.height;
      const footerStart = pageH - (footerHeight + signatureHeight + 5);
      if (yPos + needed >= footerStart) {
        doc.addPage();
        pageCount++;
        addHeaderFooter();
        let ny = contentYStart;
        ny = addPatientInfo(ny);
        ny += 10;
        // draw a thin separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, ny - 4, rightMargin, ny - 4);
        doc.setDrawColor(0, 0, 0);
        return ny;
      }
      return yPos;
    };

    // ── Strip HTML for plain-text PDF rendering ───────────────────────────
    const htmlToPlainText = (html) => {
      if (!html) return "";
      // Preserve line breaks from <br> and block tags before stripping
      return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&#39;/g, "'")
        .trim();
    };

    // ─────────────────────────────────────────────────────────────────────
    // BUILD THE PDF
    // ─────────────────────────────────────────────────────────────────────

    addHeaderFooter();
    let yPos = addPatientInfo(contentYStart);
    // ── Separator line after patient info ─────────────────────────────────
    doc.setDrawColor(180, 180, 180);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    doc.setDrawColor(0, 0, 0);
    yPos += 8;

    // ── Report title ──────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const billTypeLabel =
      BILL_TYPES.find((b) => b.value === (row.billTypeNo || "USG01"))?.label ||
      "RADIOLOGY";
    const reportTitle = `${billTypeLabel} REPORT — ${(row.itemName || "").toUpperCase()}`;
    doc.text(reportTitle, leftMargin + contentWidth / 2, yPos, {
      align: "center",
    });
    const titleW = doc.getTextWidth(reportTitle);
    doc.line(
      leftMargin + contentWidth / 2 - titleW / 2,
      yPos + 2,
      leftMargin + contentWidth / 2 + titleW / 2,
      yPos + 2,
    );
    yPos += 10;

    // ── Scan Findings sections ────────────────────────────────────────────
    if (sections.length > 0) {
      sections.forEach((section, idx) => {
        const plainValue = htmlToPlainText(section.value);
        if (!plainValue) return; // skip empty sections

        const valueLines = wrapText(plainValue, contentWidth - 4);
        const sectionHeight = 7 + valueLines.length * 4.8 + 4;

        yPos = checkNewPage(yPos, sectionHeight);

        // Section title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(0, 105, 92);
        doc.text(
          `${idx + 1}. ${section.title.toUpperCase()}`,
          leftMargin,
          yPos,
        );
        doc.setTextColor(0, 0, 0);
        yPos += 6;

        // Section value
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        yPos += justifyText(
          plainValue,
          contentWidth - 6,
          leftMargin + 3,
          yPos,
          4.8,
        );
        yPos += 3;
      });
    } // closes if (sections.length > 0)

    // ── Impression / Findings ─────────────────────────────────────────────
    if (impression) {
      const plainImpression = htmlToPlainText(impression);
      const impressionLines = wrapText(plainImpression, contentWidth - 4);
      const impressionHeight = 10 + impressionLines.length * 5.2 + 8;

      yPos = checkNewPage(yPos, impressionHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 105, 92);
      doc.text("IMPRESSION", leftMargin + 3, yPos + 3);
      doc.setTextColor(0, 0, 0);
      yPos += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      impressionLines.forEach((line) => {
        doc.text(line, leftMargin + 3, yPos);

        yPos += 5;
      });

      yPos += 8;
    }

    // ── End of report ─────────────────────────────────────────────────────
    yPos = checkNewPage(yPos, 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("**End of the Report**", leftMargin + contentWidth / 2, yPos, {
      align: "center",
    });

    addSignatures();

    // ── Page numbers ──────────────────────────────────────────────────────
    const finalPageCount = pageCount;
    for (let i = 1; i <= finalPageCount; i++) {
      doc.setPage(i);
      const pageH = doc.internal.pageSize.height;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${finalPageCount}`,
        leftMargin + contentWidth / 2,
        pageH - footerHeight - 2,
        { align: "center" },
      );
    }

    // ── Open PDF ──────────────────────────────────────────────────────────
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (err) {
    console.error("Print error:", err);
    toast.error("An unexpected error occurred while generating the PDF.");
  }
};

// ─── Preview Modal ────────────────────────────────────────────────────────────

const Modal = ({ row, onClose }) => {
  const report = row.report;
  const sections = useMemo(
    () => buildSectionsFromValueDetails(report?.valuedetails),
    [report],
  );

  return (
    <StyledModalOverlay onClick={onClose}>
      <StyledModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>🏥</ModalIcon>
          <ModalTitle>USG Report Preview</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <ApprovalBadge approved={report?.is_approved}>
            {report?.is_approved ? "✓ Approved" : "⏱ Pending Approval"}
          </ApprovalBadge>
          <InfoBanner>
            <InfoChip>
              <InfoChipLabel>Bill No</InfoChipLabel>
              <InfoChipValue>{row.investBillNo}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Patient</InfoChipLabel>
              <InfoChipValue>{row.patientName}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>UHID</InfoChipLabel>
              <InfoChipValue>{row.uhid}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>IP Number</InfoChipLabel>
              <InfoChipValue>{row.ipNumber || "—"}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Age / Gender</InfoChipLabel>
              <InfoChipValue>
                {row.age || "N/A"} / {row.gender || "N/A"}
              </InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Referred By</InfoChipLabel>
              <InfoChipValue>{row.referredBy || "—"}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Report Date</InfoChipLabel>
              <InfoChipValue>
                {report?.date ? formatDate(report.date) : "N/A"}
              </InfoChipValue>
            </InfoChip>
            {report?.slot_DateTime && (
              <InfoChip>
                <InfoChipLabel>Slot</InfoChipLabel>
                <InfoChipValue>
                  {formatSlotDisplay(report.slot_DateTime)}
                </InfoChipValue>
              </InfoChip>
            )}
            {report?.valuedetails?.device_id?.length > 0 && (
              <InfoChip>
                <InfoChipLabel>Device</InfoChipLabel>
                <InfoChipValue>
                  {report.valuedetails.device_id.join(", ")}
                </InfoChipValue>
              </InfoChip>
            )}
          </InfoBanner>
          {sections.length > 0 && (
            <>
              <SectionsHeader>
                <SectionsTitle>Scan Findings</SectionsTitle>
              </SectionsHeader>
              {sections.map((section, idx) => (
                <PreviewSectionItem
                  key={section.title_id}
                  section={section}
                  index={idx}
                />
              ))}
            </>
          )}
          <ImpressionBox>
            <ImpressionTitle>Final Impression / Findings</ImpressionTitle>
            <ImpressionText
              dangerouslySetInnerHTML={{
                __html:
                  report?.impression ||
                  "<em style='color:#bbb'>No impression recorded.</em>",
              }}
            />
          </ImpressionBox>
        </ModalBody>
        <ModalFooter>
          <ModalActionButton
            bg="linear-gradient(135deg,#00897b,#00695c)"
            color="white"
            onClick={onClose}
          >
            Close
          </ModalActionButton>
        </ModalFooter>
      </StyledModalContent>
    </StyledModalOverlay>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditModal = ({ row, onClose, onSave }) => {
  const report = row.report;
  const [sections, setSections] = useState(() =>
    buildSectionsFromValueDetails(report?.valuedetails),
  );
  const [impression, setImpression] = useState(report?.impression || "");
  const [saving, setSaving] = useState(false);

  const handleSectionChange = (index, htmlValue) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: htmlValue };
      return updated;
    });
  };

  const handleCompileImpression = () => {
    const compiled = sections
      .filter((s) => stripHTML(s.value))
      .map((s) => `<b>${s.title}:</b>\n${s.value.trim()}`)
      .join("\n\n");
    if (compiled) setImpression(compiled);
    toast.info("Sections compiled into impression ✓");
  };

  const handleSave = async () => {
    if (!stripHTML(impression)) {
      toast.error("Impression cannot be empty.");
      return;
    }
    setSaving(true);
    await onSave(impression, sections);
    setSaving(false);
  };

  return (
    <StyledModalOverlay onClick={onClose}>
      <StyledModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>✏️</ModalIcon>
          <ModalTitle>Edit Report</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <InfoBanner>
            <InfoChip>
              <InfoChipLabel>Bill No</InfoChipLabel>
              <InfoChipValue>{row.investBillNo}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Patient</InfoChipLabel>
              <InfoChipValue>{row.patientName}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>UHID</InfoChipLabel>
              <InfoChipValue>{row.uhid}</InfoChipValue>
            </InfoChip>
            <InfoChip>
              <InfoChipLabel>Age / Gender</InfoChipLabel>
              <InfoChipValue>
                {row.age || "N/A"} / {row.gender || "N/A"}
              </InfoChipValue>
            </InfoChip>
          </InfoBanner>
          {sections.length > 0 && (
            <>
              <SectionsHeader>
                <SectionsTitle>Scan Findings</SectionsTitle>
                <SmallBtn
                  type="button"
                  bg="linear-gradient(135deg,#00897b,#00695c)"
                  color="white"
                  onClick={handleCompileImpression}
                >
                  ↓ Compile to Impression
                </SmallBtn>
              </SectionsHeader>
              {sections.map((section, idx) => (
                <EditSectionItem
                  key={section.title_id}
                  section={section}
                  index={idx}
                  onChange={handleSectionChange}
                />
              ))}
            </>
          )}
          <EditImpressionSection>
            <EditImpressionTitle>
              Final Impression / Findings
            </EditImpressionTitle>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              {sections.length > 0 && (
                <SmallBtn
                  type="button"
                  bg="linear-gradient(135deg,#00897b,#00695c)"
                  color="white"
                  onClick={handleCompileImpression}
                >
                  ↓ Compile from Sections
                </SmallBtn>
              )}
              <SmallBtn
                type="button"
                bg="#f5f5f5"
                color="#888"
                onClick={() => setImpression("")}
              >
                ✕ Clear
              </SmallBtn>
            </div>
            <ImpressionRichEditor
              value={impression}
              onChange={setImpression}
              placeholder="Enter impression / findings…"
            />
          </EditImpressionSection>
        </ModalBody>
        <ModalFooter>
          <ModalActionButton
            bg="linear-gradient(135deg,#66bb6a,#43a047)"
            color="white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "✓ Save Changes"}
          </ModalActionButton>
          <ModalActionButton
            bg="linear-gradient(135deg,#757575,#616161)"
            color="white"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </ModalActionButton>
        </ModalFooter>
      </StyledModalContent>
    </StyledModalOverlay>
  );
};

// ─── Slot Modal ───────────────────────────────────────────────────────────────

const SlotModal = ({ row, onClose, onSaved, HMSURL, activeBillTypeNo }) => {
  const hasReport = row.hasReport;

  const initSlotDate = () => {
    if (row.report?.slot_DateTime) {
      try {
        return new Date(row.report.slot_DateTime).toISOString().slice(0, 10);
      } catch {}
    }
    return getToday();
  };
  const initSlotTime = () => {
    if (row.report?.slot_DateTime) {
      try {
        return new Date(row.report.slot_DateTime).toTimeString().slice(0, 5);
      } catch {}
    }
    return new Date().toTimeString().slice(0, 5);
  };

  const [slotDate, setSlotDate] = useState(initSlotDate);
  const [slotTime, setSlotTime] = useState(initSlotTime);
  const [impression, setImpression] = useState(row.report?.impression || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!slotDate || !slotTime) {
      toast.error("Please select both slot date and time.");
      return;
    }
    const slotDateTime = `${slotDate}T${slotTime}:00`;
    setSaving(true);
    try {
      const encodedBill = encodeURIComponent(row.investBillNo);
      const encodedItem = encodeURIComponent(row.itemName);
      let result;
      if (!hasReport) {
        result = await apiRequest(`${HMSURL}scan-reports/`, "POST", {
          investBillNo: row.investBillNo,
          investBillDate: row.investBillDate,
          billTypeNo: activeBillTypeNo,
          itemName: row.itemName,
          slot_DateTime: slotDateTime,
          impression: impression || "",
        });
        if (!result.success) {
          toast.error(result.error || "Failed to create report");
          return;
        }
        toast.success("Slot scheduled and report created! ✓");
      } else {
        const patchData = { slot_DateTime: slotDateTime };
        if (impression && impression !== row.report?.impression)
          patchData.impression = impression;
        result = await apiRequest(
          `${HMSURL}scan-reports/slot/${encodedBill}/${encodedItem}/`,
          "PATCH",
          patchData,
        );
        if (!result.success) {
          toast.error(result.error || "Failed to update slot");
          return;
        }
        toast.success("Slot updated successfully! ✓");
      }
      onSaved({
        investBillNo: row.investBillNo,
        itemName: row.itemName,
        slot_DateTime: slotDateTime,
        impression: impression || row.report?.impression || "",
        is_approved: row.report?.is_approved || false,
        wasCreated: !hasReport,
      });
      onClose();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlotModalOverlay onClick={onClose}>
      <SlotModalContent onClick={(e) => e.stopPropagation()}>
        <StyledModalHeader>
          <ModalIcon>🕐</ModalIcon>
          <ModalTitle>{hasReport ? "Update Slot" : "Schedule Slot"}</ModalTitle>
        </StyledModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <SlotInfoRow>
            <SlotInfoLabel>Patient</SlotInfoLabel>
            <SlotInfoValue>{row.patientName}</SlotInfoValue>
          </SlotInfoRow>
          <SlotInfoRow>
            <SlotInfoLabel>Bill No</SlotInfoLabel>
            <SlotInfoValue>{row.investBillNo}</SlotInfoValue>
          </SlotInfoRow>
          <SlotInfoRow>
            <SlotInfoLabel>IP Number</SlotInfoLabel>
            <SlotInfoValue>{row.ipNumber || "—"}</SlotInfoValue>
          </SlotInfoRow>
          <SlotInfoRow>
            <SlotInfoLabel>Item</SlotInfoLabel>
            <SlotInfoValue>{row.itemName || "—"}</SlotInfoValue>
          </SlotInfoRow>
          <div style={{ marginTop: "1.75rem" }}>
            <SlotSectionTitle>📅 Slot Date &amp; Time</SlotSectionTitle>
            <SlotFormGroup>
              <SlotLabel>📅 Slot Date</SlotLabel>
              <SlotInput
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </SlotFormGroup>
            <SlotFormGroup>
              <SlotLabel>⏰ Slot Time</SlotLabel>
              <SlotInput
                type="time"
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
              />
            </SlotFormGroup>
            <SlotDivider />
            <SlotSectionTitle>📝 Impression</SlotSectionTitle>
            <ImpressionOptionalNote>
              {hasReport
                ? "Update impression (leave unchanged to keep existing)."
                : "Optional — can be added now or later."}
            </ImpressionOptionalNote>
            <StyledTextArea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Enter impression / findings (optional)…"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalActionButton
            bg="linear-gradient(135deg,#7c4dff,#651fff)"
            color="white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : hasReport
                ? "Update Slot"
                : "Schedule & Create"}
          </ModalActionButton>
          <ModalActionButton
            bg="linear-gradient(135deg,#757575,#616161)"
            color="white"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </ModalActionButton>
        </ModalFooter>
      </SlotModalContent>
    </SlotModalOverlay>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RDList = ({ investBillNo: investBillNoFilter }) => {
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotRow, setSlotRow] = useState(null);
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Print dropdown portal state ────────────────────────────────────────
  const [activePrintRowId, setActivePrintRowId] = useState(null);
  const [printDropdownPos, setPrintDropdownPos] = useState({ top: 0, left: 0 });

  // ── Date filters ───────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState(getToday);
  const [toDate, setToDate] = useState(getToday);

  // ── Bill Type state ────────────────────────────────────────────────────
  const [selectedBillType, setSelectedBillType] = useState("USG01");

  // ── Column search ──────────────────────────────────────────────────────
  const [searchBillNo, setSearchBillNo] = useState("");
  const [searchUhid, setSearchUhid] = useState("");
  const [searchIpNumber, setSearchIpNumber] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchReferredBy, setSearchReferredBy] = useState("");

  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canEdit = allowedActions.includes("HMS-API-RDE-RW");
  const canApprove = allowedActions.includes("HMS-API-RDA-RW");
  const canDelete = allowedActions.includes("HMS-API-RDD-RW");

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        billTypeNo: selectedBillType,
        from_date: fromDate,
        to_date: toDate,
      });
      if (investBillNoFilter) params.append("investBillNo", investBillNoFilter);

      const result = await apiRequest(
        `${HMSURL}investigations/?${params.toString()}`,
        "GET",
      );
      if (!result.success) {
        toast.error(result.error || "Failed to fetch data");
        return;
      }

      const merged = (result.data || []).map((row) => ({
        investBillNo: row.investBillNo,
        uhid: row.uhid,
        ipNumber: row.ipNumber,
        investBillDate: row.investBillDate,
        item: row.item,
        item_id: Array.isArray(row.item)
          ? (row.item.find((i) => i.billTypeNo === selectedBillType)?.item_id ??
            "")
          : "",
        itemName: row.itemName || "",
        billTypeNo: row.billTypeNo || selectedBillType,
        patientName:
          `${row.salutation || ""} ${row.firstName || ""} ${row.lastName || ""}`.trim(),
        age: row.age,
        gender: row.gender,
        referredBy: row.referredBy || "",
        report: row.report || null,
        hasReport: !!row.hasReport,
      }));
      setRows(merged);
    } catch {
      toast.error("An unexpected error occurred");
    }
  }, [HMSURL, selectedBillType, investBillNoFilter, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Reset ──────────────────────────────────────────────────────────────
  const handleResetFilter = () => {
    setFromDate(getToday());
    setToDate(getToday());
    setSelectedBillType("USG01");
    setSearchBillNo("");
    setSearchUhid("");
    setSearchIpNumber("");
    setSearchPatient("");
    setSearchStatus("");
    setSearchReferredBy("");
  };

  const referredByOptions = useMemo(() => {
    const names = rows.map((r) => r.referredBy).filter(Boolean);
    return [...new Set(names)].sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusLabel = !row.hasReport
        ? "pending"
        : row.report?.is_approved
          ? "approved"
          : "reported";
      return (
        (!searchBillNo ||
          (row.investBillNo || "")
            .toLowerCase()
            .includes(searchBillNo.toLowerCase())) &&
        (!searchUhid ||
          (row.uhid || "").toLowerCase().includes(searchUhid.toLowerCase())) &&
        (!searchIpNumber ||
          (row.ipNumber || "")
            .toLowerCase()
            .includes(searchIpNumber.toLowerCase())) &&
        (!searchPatient ||
          (row.patientName || "")
            .toLowerCase()
            .includes(searchPatient.toLowerCase())) &&
        (!searchStatus || statusLabel === searchStatus) &&
        (!searchReferredBy || row.referredBy === searchReferredBy)
      );
    });
  }, [
    rows,
    searchBillNo,
    searchUhid,
    searchIpNumber,
    searchPatient,
    searchStatus,
    searchReferredBy,
  ]);

  // ── Print dropdown handlers ────────────────────────────────────────────
  const showPrintDropdown = (investBillNo, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPrintDropdownPos({
      top: rect.bottom + 4,
      left: rect.right - 200,
    });
    setActivePrintRowId(investBillNo);
  };

  const hidePrintDropdown = () => {
    setActivePrintRowId(null);
  };

  const activePrintRow = useMemo(
    () => rows.find((r) => r.investBillNo === activePrintRowId) || null,
    [rows, activePrintRowId],
  );

  // ── Other handlers ─────────────────────────────────────────────────────
  const handleGoToReport = (row) => {
    const parts = (row.uhid || "").split("/");
    const uhidBase = parts[0] || "";
    const subUhid = parts[1] || "";
    navigate(`/RDReportForm/${uhidBase}/${subUhid}`, {
      state: {
        uhid: uhidBase,
        subUhid,
        itemName: row.itemName,
        ipNumber: row.ipNumber,
        investBillNo: row.investBillNo,
        salutation: "",
        firstName: row.patientName,
        middleName: "",
        lastName: "",
        age: row.age,
        gender: row.gender,
        investBillDate: row.investBillDate,
        billTypeNo: selectedBillType,
        item_id: row.item_id,
        referredBy: row.referredBy,
      },
    });
  };

  const handleOpenSlot = (row) => {
    setSlotRow(row);
    setIsSlotModalOpen(true);
  };

  const handleSlotSaved = ({
    investBillNo,
    itemName,
    slot_DateTime,
    impression,
    wasCreated,
  }) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.investBillNo !== investBillNo || r.itemName !== itemName)
          return r;
        const updatedReport = wasCreated
          ? { slot_DateTime, impression, is_approved: false, is_active: true }
          : {
              ...r.report,
              slot_DateTime,
              ...(impression ? { impression } : {}),
            };
        return { ...r, report: updatedReport, hasReport: true };
      }),
    );
  };

  const handlePreview = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };
  const handleEdit = (row) => {
    setEditingRow(row);
    setIsEditModalOpen(true);
  };

  const handleApprove = async (row) => {
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/approve/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.itemName)}/`,
        "PATCH",
        {},
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report approved successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.itemName === row.itemName
            ? { ...r, report: { ...r.report, is_approved: true } }
            : r,
        ),
      );
    } catch {
      toast.error("An error occurred while approving. Please try again.");
    }
  };

  const handleSaveEdit = async (newImpression, newSections) => {
    try {
      const patchPayload = {
        impression: newImpression,
        ...(newSections?.length > 0
          ? {
              sections: newSections.map((s) => ({
                title_id: s.title_id,
                value: s.value,
              })),
            }
          : {}),
      };
      const result = await apiRequest(
        `${HMSURL}scan-reports/edit/${encodeURIComponent(editingRow.investBillNo)}/${encodeURIComponent(editingRow.itemName)}/`,
        "PATCH",
        patchPayload,
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report updated successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === editingRow.investBillNo &&
          r.itemName === editingRow.itemName
            ? {
                ...r,
                report: {
                  ...r.report,
                  impression: newImpression,
                  ...(newSections?.length > 0
                    ? {
                        valuedetails: {
                          ...r.report?.valuedetails,
                          value: newSections.map((s) => ({
                            title_id: s.title_id,
                            title_value: s.value,
                          })),
                        },
                      }
                    : {}),
                },
              }
            : r,
        ),
      );
      setIsEditModalOpen(false);
      setEditingRow(null);
    } catch {
      toast.error("An error occurred while updating. Please try again.");
    }
  };

  const handleDelete = async (row) => {
    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/delete/${encodeURIComponent(row.investBillNo)}/${encodeURIComponent(row.itemName)}/`,
        "PATCH",
        {},
      );
      if (!result.success) throw new Error(result.error);
      toast.success("Report deleted successfully!");
      setRows((prev) =>
        prev.map((r) =>
          r.investBillNo === row.investBillNo && r.itemName === row.itemName
            ? { ...r, report: null, hasReport: false }
            : r,
        ),
      );
    } catch {
      toast.error("An error occurred while deleting. Please try again.");
    }
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => !r.hasReport).length;
    const reported = rows.filter(
      (r) => r.hasReport && !r.report?.is_approved,
    ).length;
    const approved = rows.filter((r) => r.report?.is_approved).length;
    const itemMap = {};
    rows.forEach((r) => {
      const name = r.itemName || "Unknown";
      itemMap[name] = (itemMap[name] || 0) + 1;
    });
    return { total, pending, reported, approved, itemMap };
  }, [rows]);

  const pageLabel =
    BILL_TYPES.find((b) => b.value === selectedBillType)?.label || "Radiology";

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        <ContentCard>
          {/* ── Top bar ── */}
          <TopBar>
            <PageTitle>{pageLabel} Investigations</PageTitle>

            <FilterContainer>
              <BillTypeWrapper>
                <FilterLabel>Bill Type</FilterLabel>
                <BillTypeSelect
                  value={selectedBillType}
                  onChange={(e) => {
                    setSelectedBillType(e.target.value);
                    setRows([]);
                    setSearchBillNo("");
                    setSearchStatus("");
                    setSearchReferredBy("");
                  }}
                >
                  {BILL_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </BillTypeSelect>
              </BillTypeWrapper>

              <FilterGroup>
                <FilterLabel>From</FilterLabel>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>To</FilterLabel>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </FilterGroup>
              <ResetButton onClick={handleResetFilter}>↺ Reset</ResetButton>
            </FilterContainer>
          </TopBar>

          {/* ── Stat Cards ── */}
          <StatsRow>
            <StatCard bg="#f0faf8" accent="#00897b">
              <StatIcon>📋</StatIcon>
              <StatInfo>
                <StatCount color="#00695c">{stats.total}</StatCount>
                <StatLabel>Total</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#e3f2fd" accent="#1e88e5">
              <StatIcon>⏳</StatIcon>
              <StatInfo>
                <StatCount color="#1565c0">{stats.pending}</StatCount>
                <StatLabel>Pending</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#fffde7" accent="#f9a825">
              <StatIcon>⏱</StatIcon>
              <StatInfo>
                <StatCount color="#f57f17">{stats.reported}</StatCount>
                <StatLabel>Reported</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard bg="#e8f5e9" accent="#43a047">
              <StatIcon>✅</StatIcon>
              <StatInfo>
                <StatCount color="#2e7d32">{stats.approved}</StatCount>
                <StatLabel>Approved</StatLabel>
              </StatInfo>
            </StatCard>
            {Object.entries(stats.itemMap).map(([itemName, count]) => (
              <StatCard key={itemName} bg="#f3e5f5" accent="#8e24aa">
                <StatIcon>🔬</StatIcon>
                <StatInfo>
                  <StatCount color="#6a1b9a">{count}</StatCount>
                  <StatLabel title={itemName}>
                    {itemName.length > 14
                      ? itemName.slice(0, 13) + "…"
                      : itemName}
                  </StatLabel>
                </StatInfo>
              </StatCard>
            ))}
          </StatsRow>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Bill No</Th>
                  <Th>UHID</Th>
                  <Th>IP Number</Th>
                  <Th>Patient Name</Th>
                  <Th>Age</Th>
                  <Th>Gender</Th>
                  <Th>Item</Th>
                  <Th>Bill Date</Th>
                  <Th>Referred By</Th>
                  <Th>Slot</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
                <tr>
                  <SearchTh>
                    <SearchInput
                      placeholder="🔍 Bill No"
                      value={searchBillNo}
                      onChange={(e) => setSearchBillNo(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      placeholder="🔍 UHID"
                      value={searchUhid}
                      onChange={(e) => setSearchUhid(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      placeholder="🔍 IP No"
                      value={searchIpNumber}
                      onChange={(e) => setSearchIpNumber(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh>
                    <SearchInput
                      placeholder="🔍 Patient"
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                    />
                  </SearchTh>
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  <SearchTh />
                  <SearchTh>
                    <SearchSelect
                      value={searchReferredBy}
                      onChange={(e) => setSearchReferredBy(e.target.value)}
                    >
                      <option value="">All Doctors</option>
                      {referredByOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh />
                  <SearchTh>
                    <SearchSelect
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="reported">⏱ Reported</option>
                      <option value="approved">✓ Approved</option>
                    </SearchSelect>
                  </SearchTh>
                  <SearchTh />
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <Tr
                      key={`${row.investBillNo}-${row.itemName}-${index}`}
                      style={{
                        background: row.hasReport
                          ? "linear-gradient(135deg,#f1f8f4 0%,#e8f5e9 100%)"
                          : "white",
                      }}
                    >
                      <Td>{row.investBillNo}</Td>
                      <Td>{row.uhid}</Td>
                      <Td>{row.ipNumber || "—"}</Td>
                      <Td>{row.patientName}</Td>
                      <Td>{row.age || "N/A"}</Td>
                      <Td>{row.gender || "N/A"}</Td>
                      <Td>{row.itemName || "—"}</Td>
                      <Td>{formatDate(row.investBillDate)}</Td>
                      <Td>
                        {row.referredBy ? (
                          <ReferredByBadge>👨‍⚕️ {row.referredBy}</ReferredByBadge>
                        ) : (
                          <span style={{ color: "#bbb", fontSize: "0.8rem" }}>
                            —
                          </span>
                        )}
                      </Td>
                      <Td>
                        {row.report?.slot_DateTime ? (
                          <SlotBadge>
                            🕐 {formatSlotDisplay(row.report.slot_DateTime)}
                          </SlotBadge>
                        ) : (
                          <span style={{ color: "#bbb", fontSize: "0.8rem" }}>
                            —
                          </span>
                        )}
                      </Td>
                      <Td>
                        {!row.hasReport ? (
                          <StatusBadge hasReport={false}>
                            ⏳ Pending
                          </StatusBadge>
                        ) : row.report?.is_approved ? (
                          <StatusBadge hasReport approved>
                            ✓ Approved
                          </StatusBadge>
                        ) : (
                          <StatusBadge hasReport>⏱ Reported</StatusBadge>
                        )}
                      </Td>
                      <Td>
                        <ActionRow>
                          {row.ipNumber && (
                            <IconBtn
                              bg="linear-gradient(135deg,#7c4dff,#651fff)"
                              onClick={() => handleOpenSlot(row)}
                              disabled={row.report?.is_approved}
                              data-tip={
                                row.report?.is_approved
                                  ? "Slot locked (approved)"
                                  : row.hasReport
                                    ? "Update Slot"
                                    : "Set Slot"
                              }
                            >
                              🕐
                            </IconBtn>
                          )}
                          <IconBtn
                            bg="linear-gradient(135deg,#00897b,#00695c)"
                            onClick={() => handleGoToReport(row)}
                            disabled={row.hasReport}
                            data-tip={
                              row.hasReport
                                ? "Already Submitted"
                                : "Go to Report"
                            }
                          >
                            📋
                          </IconBtn>
                          <IconBtn
                            bg="linear-gradient(135deg,#26a69a,#00897b)"
                            onClick={() => handlePreview(row)}
                            disabled={!row.hasReport}
                            data-tip="Preview Report"
                          >
                            👁
                          </IconBtn>
                          {canApprove && (
                            <IconBtn
                              bg="linear-gradient(135deg,#66bb6a,#43a047)"
                              onClick={() => handleApprove(row)}
                              disabled={
                                !row.hasReport || row.report?.is_approved
                              }
                              data-tip={
                                row.report?.is_approved
                                  ? "Already Approved"
                                  : "Approve Report"
                              }
                            >
                              ✅
                            </IconBtn>
                          )}
                          {canEdit && (
                            <IconBtn
                              bg="linear-gradient(135deg,#42a5f5,#1e88e5)"
                              onClick={() => handleEdit(row)}
                              disabled={
                                !row.hasReport || row.report?.is_approved
                              }
                              data-tip="Edit Report"
                            >
                              ✏️
                            </IconBtn>
                          )}

                          {/* ── PRINT icon — portal dropdown, same pattern as PatientOverview ── */}
                          <PrintDropdownWrapper
                            onMouseEnter={(e) =>
                              row.hasReport &&
                              showPrintDropdown(row.investBillNo, e)
                            }
                            onMouseLeave={hidePrintDropdown}
                          >
                            <IconBtn
                              bg="linear-gradient(135deg,#ff7043,#e64a19)"
                              disabled={!row.hasReport}
                              data-tip={
                                row.hasReport ? "Print Options" : "No Report"
                              }
                            >
                              🖨️
                            </IconBtn>
                          </PrintDropdownWrapper>

                          {canDelete && (
                            <IconBtn
                              bg="linear-gradient(135deg,#ef5350,#e53935)"
                              onClick={() => handleDelete(row)}
                              disabled={
                                !row.hasReport || row.report?.is_approved
                              }
                              data-tip="Delete Report"
                            >
                              🗑️
                            </IconBtn>
                          )}
                        </ActionRow>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <tr>
                    <Td colSpan="12">
                      <EmptyState>
                        <p>
                          {rows.length > 0
                            ? "No results match your search criteria"
                            : "No investigations found for selected date range"}
                        </p>
                      </EmptyState>
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </ContentCard>
      </Container>

      {/* ── PORTAL PRINT DROPDOWN — renders at <body> level ── */}
      {activePrintRowId &&
        activePrintRow &&
        createPortal(
          <PortalDropdownMenu
            style={{ top: printDropdownPos.top, left: printDropdownPos.left }}
            onMouseEnter={() => setActivePrintRowId(activePrintRowId)}
            onMouseLeave={hidePrintDropdown}
          >
            <DropdownItem
              onClick={() => {
                handlePrintReport(activePrintRow, true);
                hidePrintDropdown();
              }}
            >
              🖨️ Print with Letterpad
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                handlePrintReport(activePrintRow, false);
                hidePrintDropdown();
              }}
            >
              📄 Print without Letterpad
            </DropdownItem>
          </PortalDropdownMenu>,
          document.body,
        )}

      {isModalOpen && selectedRow && (
        <Modal
          row={selectedRow}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRow(null);
          }}
        />
      )}
      {isEditModalOpen && editingRow && (
        <EditModal
          row={editingRow}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRow(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
      {isSlotModalOpen && slotRow && (
        <SlotModal
          row={slotRow}
          HMSURL={HMSURL}
          activeBillTypeNo={selectedBillType}
          onClose={() => {
            setIsSlotModalOpen(false);
            setSlotRow(null);
          }}
          onSaved={handleSlotSaved}
        />
      )}
    </PageWrapper>
  );
};

export default RDList;

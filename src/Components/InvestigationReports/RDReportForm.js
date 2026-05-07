import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  PageWrapper,
  Container,
  Button,
  Label,
  Input,
  TextArea,
  ButtonContainer,
  colors,
} from "../GlobalStyles";

// ─── Animations ───────────────────────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────

const FormCard = styled.div`
  max-width: 960px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  padding: 2.5rem 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  animation: ${slideUp} 0.5s ease;
`;

const PageTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.4rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  &::before {
    content: "📋";
    font-size: 2rem;
    -webkit-text-fill-color: initial;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const DateTimeBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  border-radius: 14px;
  padding: 0.9rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(0, 137, 123, 0.3);
  flex-wrap: wrap;
`;

const DateTimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  .icon {
    font-size: 1.2rem;
  }
  .value {
    font-family: "Courier New", monospace;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.2rem 0.7rem;
    border-radius: 8px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${(p) => p.columns || "1fr"};
  gap: 1.25rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const IconLabel = styled(Label)`
  color: #2c3e50;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &::before {
    content: "${(p) => p.icon || "📝"}";
    font-size: 1rem;
  }
`;

const StyledInput = styled(Input)`
  padding: 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 0.938rem;
  background: ${(p) => (p.disabled ? "#f5f5f5" : "white")};
  color: ${(p) => (p.disabled ? "#888" : "#333")};
  &:hover:not(:disabled) {
    border-color: #00897b;
  }
  &:focus {
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
    outline: none;
  }
`;

// ─── Patient Info Section ─────────────────────────────────────────────────────

const InfoSection = styled.div`
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  border-left: 5px solid #00897b;
`;

const InfoTitle = styled.h3`
  color: #00695c;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.4rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before {
    content: "ℹ️";
    font-size: 1.1rem;
  }
`;

const InfoText = styled.p`
  color: #555;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.6;
`;

// ─── Format Loading States ────────────────────────────────────────────────────

const FormatLoadingBox = styled.div`
  background: #f8fffe;
  border: 2px dashed #b2dfdb;
  border-radius: 14px;
  padding: 1.5rem;
  text-align: center;
  color: #00897b;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: ${pulse} 1.5s ease infinite;
`;

const FormatErrorBox = styled.div`
  background: #fff3e0;
  border: 2px dashed #ffb74d;
  border-radius: 14px;
  padding: 1rem 1.5rem;
  color: #e65100;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// ─── Format Sections ──────────────────────────────────────────────────────────

const FormatSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormatSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const FormatSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 800;
  color: #00695c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &::before {
    content: "🏥";
    font-size: 1rem;
  }
`;

const FormatSubtitle = styled.span`
  font-size: 0.72rem;
  color: #999;
  font-weight: 500;
  background: #f5f5f5;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
`;

const SectionCard = styled.div`
  border: 2px solid ${(p) => (p.expanded ? "#b2dfdb" : "#f0f0f0")};
  border-radius: 14px;
  overflow: visible;
  transition: border-color 0.2s;
`;

const SectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: ${(p) =>
    p.expanded ? "linear-gradient(135deg, #e8f5e9, #f1f8f4)" : "#fafafa"};
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  border-radius: ${(p) => (p.expanded ? "12px 12px 0 0" : "12px")};
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
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00897b, #00695c);
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SectionName = styled.span`
  font-weight: 700;
  font-size: 0.875rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const ChevronIcon = styled.span`
  font-size: 0.85rem;
  color: #00897b;
  transition: transform 0.2s;
  transform: ${(p) => (p.expanded ? "rotate(180deg)" : "rotate(0deg)")};
`;

const SectionCardBody = styled.div`
  padding: ${(p) => (p.expanded ? "0.875rem 1rem" : "0")};
  max-height: ${(p) => (p.expanded ? "500px" : "0")};
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    padding 0.3s ease;
  background: white;
  border-radius: 0 0 14px 14px;
`;

const RichEditorWrapper = styled.div`
  position: relative;
  overflow: visible;
`;

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

const ShortcutHint = styled.div`
  position: fixed;
  background: rgba(20, 20, 20, 0.88);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  span.key {
    background: rgba(255, 255, 255, 0.2);
    padding: 1px 5px;
    border-radius: 4px;
    font-family: monospace;
  }
  span.arrow {
    color: #80cbc4;
  }
  span.val {
    color: #a5d6a7;
    font-weight: 700;
  }
`;

// ─── Summary / Final Impression ───────────────────────────────────────────────

const SummarySection = styled.div`
  background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
  border: 2px solid #ce93d8;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
`;

const SummaryTitle = styled.h3`
  font-size: 0.938rem;
  font-weight: 800;
  color: #6a1b9a;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  &::before {
    content: "📝";
    font-size: 1rem;
  }
`;

const SummaryActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const SmallBtn = styled.button`
  padding: 0.3rem 0.8rem;
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

// ─── Final Impression Rich Editor ─────────────────────────────────────────────

const FinalRichEditor = styled.div`
  width: 100%;
  min-height: 180px;
  padding: 0.875rem 1rem;
  border: 2px solid #ce93d8;
  border-radius: 12px;
  font-size: 0.938rem;
  color: #333;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.7;
  resize: vertical;
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

  mark.ph {
    background: #fff3e0;
    color: #e65100;
    font-weight: 700;
    border-radius: 3px;
    padding: 0 2px;
    cursor: text;
  }

  &:empty::before {
    content: attr(data-placeholder);
    color: #bbb;
    font-style: italic;
    pointer-events: none;
  }
`;

// ─── Shortcut chips ───────────────────────────────────────────────────────────

const ShortcutSection = styled.div`
  background: #fffde7;
  border: 1.5px solid #fff59d;
  border-radius: 12px;
  padding: 0.875rem 1rem;
`;

const ShortcutTitle = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: #f57f17;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  &::before {
    content: "⚡";
  }
`;

const ShortcutChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`;

const Chip = styled.button`
  padding: 0.25rem 0.6rem;
  background: white;
  border: 1.5px solid #ffe082;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #e65100;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  &:hover {
    background: #fff8e1;
    border-color: #ffca28;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

// ─── Device / Approval Info bar ───────────────────────────────────────────────

const MetaBar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  background: #f8fffe;
  border: 1.5px solid #b2dfdb;
  border-radius: 12px;
  padding: 0.65rem 1rem;
`;

const MetaBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00695c;
  background: #e0f2f1;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
`;

// ─── Buttons ──────────────────────────────────────────────────────────────────

const StyledButtonContainer = styled(ButtonContainer)`
  border-top: 2px solid #f0f0f0;
  padding-top: 1.5rem;
  margin-top: 0.5rem;
  gap: 1rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BaseActionButton = styled(Button)`
  padding: 0.875rem 2.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubmitButton = styled(BaseActionButton)`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 137, 123, 0.35);
  }
`;

const CancelButton = styled(BaseActionButton)`
  background: linear-gradient(135deg, #78909c 0%, #546e7a 100%);
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #607d8b 0%, #455a64 100%);
    transform: translateY(-2px);
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  border-left: 5px solid #ef5350;
  text-align: center;
`;

const ErrorTitle = styled.h3`
  color: #c62828;
  font-size: 1.063rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  &::before {
    content: "⚠️ ";
  }
`;

const ErrorText = styled.p`
  color: #d32f2f;
  font-size: 0.875rem;
  margin: 0;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDisplayDate = (d) =>
  d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDisplayTime = (d) =>
  d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

// ─── Decode HTML entities (e.g. &amp; → &) ───────────────────────────────────
// Uses a textarea so the browser does the decoding natively — safe & accurate.
const decodeHTMLEntities = (text) => {
  if (!text) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
};

// ─── Convert plain text with /// into HTML ────────────────────────────────────
// 1. Decode any pre-existing HTML entities (&amp; → &)
// 2. Escape the decoded plain text properly via textContent trick
// 3. Replace /// with styled <mark> placeholders
const buildInitialHTML = (text) => {
  if (!text) return "";

  // If text already contains HTML tags (previously saved HTML), return as-is
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  // Step 1: Decode any HTML entities in the raw string first
  const decoded = decodeHTMLEntities(text);

  // Step 2: Safely escape for innerHTML using a temp DOM element
  // (browser handles & → &amp;, < → &lt; etc. correctly)
  const tmp = document.createElement("div");
  tmp.textContent = decoded;
  const safeHTML = tmp.innerHTML;

  // Step 3: Replace /// with orange placeholder marks
  return safeHTML.replace(
    /\/\/\//g,
    `<mark class="ph" style="background:#fff3e0;color:#e65100;font-weight:700;border-radius:3px;padding:0 2px;cursor:text;">///</mark>`,
  );
};

// ─── Build final impression HTML by concatenating non-empty section HTML ──────
const buildImpressionHTMLFromSections = (sections) =>
  sections
    .filter((s) => s.value.trim())
    .map((s) => `<b>${s.title}:</b>\n${s.value.trim()}`)
    .join("\n\n");

// ─── Track whether caret is inside a placeholder mark ────────────────────────
const getCaretInsideMark = () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const node = sel.getRangeAt(0).startContainer;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  if (el && el.classList && el.classList.contains("ph")) return el;
  return null;
};

// ─── Section Accordion Item ───────────────────────────────────────────────────

const SectionItem = ({ section, index, onChange, shortcuts }) => {
  const [expanded, setExpanded] = useState(true);
  const [hint, setHint] = useState(null);
  const [hintPos, setHintPos] = useState({ top: 0, left: 0 });
  const editorRef = useRef(null);
  const suppressRef = useRef(false);
  const lastHTMLRef = useRef("");

  // ── Initial render: section.value is already built HTML from parent ───────
  // Do NOT call buildInitialHTML again here — it would double-encode entities.
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = section.value;
    lastHTMLRef.current = section.value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── External reset: re-render only when parent pushed a new value ─────────
  useEffect(() => {
    if (!editorRef.current) return;
    // Only reset if parent changed the value (e.g. Reset button) and we're
    // not in the middle of a user keystroke.
    if (section.value !== lastHTMLRef.current && !suppressRef.current) {
      // section.value is already HTML — set directly
      editorRef.current.innerHTML = section.value;
      lastHTMLRef.current = section.value;
    }
  }, [section.value]);

  // ── Core: handle every keypress ───────────────────────────────────────────
  const handleKeyDown = (e) => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;

    // ── CASE 1: Typing while caret is inside a <mark class="ph"> ─────────
    const markEl = getCaretInsideMark();
    if (markEl && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();

      const boldNode = document.createElement("b");
      boldNode.textContent = e.key;
      markEl.replaceWith(boldNode);

      const range = document.createRange();
      range.setStartAfter(boldNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);

      suppressRef.current = true;
      const html = el.innerHTML;
      lastHTMLRef.current = html;
      onChange(index, html);
      setHint(null);
      return;
    }

    // ── CASE 2: Backspace on a mark → delete the whole mark ──────────────
    if (markEl && e.key === "Backspace") {
      e.preventDefault();
      const range = document.createRange();
      range.setStartBefore(markEl);
      range.collapse(true);
      markEl.remove();
      sel.removeAllRanges();
      sel.addRange(range);

      suppressRef.current = true;
      const html = el.innerHTML;
      lastHTMLRef.current = html;
      onChange(index, html);
      return;
    }

    // ── CASE 3: Space after a shortcut key → expand to bold ──────────────
    if (e.key === " ") {
      const caretRange = sel.getRangeAt(0).cloneRange();
      const beforeRange = caretRange.cloneRange();
      beforeRange.selectNodeContents(el);
      beforeRange.setEnd(caretRange.endContainer, caretRange.endOffset);
      const textBefore = beforeRange.toString();
      const lastWord = textBefore.split(/\s+/).pop();

      if (lastWord && shortcuts && shortcuts[lastWord]) {
        e.preventDefault();
        const expandedValue = shortcuts[lastWord];
        setHint(null);

        const delRange = caretRange.cloneRange();
        delRange.setStart(
          caretRange.endContainer,
          caretRange.endOffset - lastWord.length,
        );
        delRange.deleteContents();

        const boldNode = document.createElement("b");
        boldNode.textContent = expandedValue;
        delRange.insertNode(boldNode);

        const space = document.createTextNode(" ");
        boldNode.after(space);

        const newRange = document.createRange();
        newRange.setStartAfter(space);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        suppressRef.current = true;
        const html = el.innerHTML;
        lastHTMLRef.current = html;
        onChange(index, html);
        return;
      }
      setHint(null);
    }
  };

  // ── After each input: save innerHTML ─────────────────────────────────────
  const handleInput = () => {
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }

    const el = editorRef.current;
    if (!el) return;

    const html = el.innerHTML;
    lastHTMLRef.current = html;
    onChange(index, html);

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setHint(null);
      return;
    }
    const range = sel.getRangeAt(0).cloneRange();
    range.selectNodeContents(el);
    range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
    const textBefore = range.toString();
    const lastWord = textBefore.split(/\s+/).pop();

    if (lastWord && shortcuts && shortcuts[lastWord]) {
      const rect = editorRef.current.getBoundingClientRect();
      setHintPos({ top: rect.bottom + 6, left: rect.left + 12 });
      setHint({ key: lastWord, value: shortcuts[lastWord] });
    } else {
      setHint(null);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const target = e.target;
    if (target.classList && target.classList.contains("ph")) {
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

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
        <RichEditorWrapper>
          {hint &&
            createPortal(
              <ShortcutHint style={{ top: hintPos.top, left: hintPos.left }}>
                <span className="key">{hint.key}</span>
                <span className="arrow">→</span>
                <span className="val">
                  {hint.value.length > 40
                    ? hint.value.slice(0, 38) + "…"
                    : hint.value}
                </span>
                &nbsp;· press <span className="key">Space</span>
              </ShortcutHint>,
              document.body,
            )}
          <RichEditor
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={`Enter findings for ${section.title}…`}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onPaste={handlePaste}
            onClick={handleClick}
            spellCheck={false}
          />
        </RichEditorWrapper>
      </SectionCardBody>
    </SectionCard>
  );
};

// ─── Final Impression Rich Editor Component ───────────────────────────────────

const ImpressionEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const suppressRef = useRef(false);
  const lastHTMLRef = useRef("");

  // ── Initial render ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = value || "";
    lastHTMLRef.current = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync external value changes (compile / clear) ─────────────────────────
  useEffect(() => {
    if (!editorRef.current) return;
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    if (value !== lastHTMLRef.current) {
      editorRef.current.innerHTML = value || "";
      lastHTMLRef.current = value || "";
    }
  }, [value]);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastHTMLRef.current = html;
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
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      onPaste={handlePaste}
      spellCheck={false}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const RDReportForm = () => {
  const { uhid, subUhid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Live clock ────────────────────────────────────────────────────────────
  const [now, setNow] = useState(new Date());
  const timerRef = useRef(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ── Patient state ─────────────────────────────────────────────────────────
  const [investBillNo, setInvestBillNo] = useState("");
  const [investBillDate, setInvestBillDate] = useState("");
  const [billTypeNo, setBillTypeNo] = useState("");
  const [patientName, setPatientName] = useState("");
  const [ipNumber, setIpNumber] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemId, setItemId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);

  // ── Format state ──────────────────────────────────────────────────────────
  const [formatLoading, setFormatLoading] = useState(false);
  const [formatError, setFormatError] = useState("");
  const [formatMeta, setFormatMeta] = useState(null);
  const [sections, setSections] = useState([]);
  const [shortcuts, setShortcuts] = useState({});

  // ── Final impression ──────────────────────────────────────────────────────
  const [impression, setImpression] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Load patient data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!location.state) {
      toast.error(
        "No patient data found. Please navigate from the investigations list.",
      );
      navigate(-1);
      return;
    }

    const {
      itemName: stateItemName,
      item_id: stateItemId,
      ipNumber: stateIpNumber,
      referredBy: stateReferredBy,
      investBillNo: stateInvestBillNo,
      billTypeNo: stateBillTypeNo,
      salutation,
      firstName,
      middleName,
      lastName,
      age: stateAge,
      gender: stateGender,
      investBillDate: stateInvestBillDate,
    } = location.state;

    const fullName =
      `${salutation || ""} ${firstName || ""} ${middleName ? middleName + " " : ""}${lastName || ""}`
        .replace(/\s+/g, " ")
        .trim();

    setPatientName(fullName);
    setIpNumber(stateIpNumber || "");
    setReferredBy(stateReferredBy || "");
    setInvestBillNo(stateInvestBillNo || "");
    setBillTypeNo(stateBillTypeNo || "");
    setInvestBillDate(stateInvestBillDate || "");
    setAge(stateAge || "");
    setGender(stateGender || "");
    setItemName(stateItemName || "");
    setItemId(stateItemId || "");
    setDataLoaded(true);
  }, [location.state, navigate]);

  // ── Fetch radiology format once patient data is ready ────────────────────
  useEffect(() => {
    if (!dataLoaded || !billTypeNo || !itemId || !gender) return;

    const fetchFormat = async () => {
      setFormatLoading(true);
      setFormatError("");
      try {
        const result = await apiRequest(
          `${HMSURL}scan-reports/format/?billTypeNo=${encodeURIComponent(billTypeNo)}&test_id=${encodeURIComponent(itemId)}&gender=${encodeURIComponent(gender)}`,
          "GET",
        );

        if (!result.success) {
          setFormatError(result.error || "Could not load report template.");
          return;
        }

        const data = result.data;

        setFormatMeta({
          department: data.department,
          device_id: data.device_id,
          TAT_Time: data.TAT_Time,
          doctor_id: data.doctor_id,
          impression: data.impression,
        });

        setShortcuts(data.shorcuts || {});

        const formatArr = data.format || [];
        const built = formatArr.map((f) => ({
          title_id: f.title_id,
          title: f.title,
          // ✅ Build HTML once here — SectionItem will set innerHTML directly
          value: buildInitialHTML(f.title_value || ""),
          // Keep original plain text for reset
          title_value: f.title_value || "",
        }));
        setSections(built);

        // ✅ Impression HTML built once here
        setImpression(buildInitialHTML(data.impression || ""));
      } catch {
        setFormatError("Unexpected error loading report template.");
      } finally {
        setFormatLoading(false);
      }
    };

    fetchFormat();
  }, [dataLoaded, billTypeNo, itemId, gender, HMSURL]);

  // ── Section value change: receives HTML from SectionItem ─────────────────
  const handleSectionChange = (index, htmlValue) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: htmlValue };
      return updated;
    });
  };

  // ── Merge all section HTML into final impression ──────────────────────────
  const handleCompileImpression = () => {
    const compiled = buildImpressionHTMLFromSections(sections);
    setImpression(compiled || impression);
    toast.info("Sections compiled into impression field ✓");
  };

  // ── Reset sections to original template values ────────────────────────────
  const handleResetSections = () => {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        // ✅ Rebuild HTML from original plain text (buildInitialHTML handles decoding)
        value: buildInitialHTML(s.title_value || ""),
      })),
    );
    toast.info("Sections reset to template defaults.");
  };

  // ── Insert shortcut text (as bold HTML) into final impression ────────────
  const handleShortcutClick = (value) => {
    const boldHTML = `<b>${value}</b> `;
    setImpression((prev) => (prev ? prev + " " + boldHTML : boldHTML));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (event) => {
    event.preventDefault();

    const plainCheck = impression.replace(/<[^>]*>/g, "").trim();
    if (!plainCheck) {
      toast.error("Impression / Findings is required.");
      return;
    }

    setSubmitting(true);
    const reportData = {
      investBillDate,
      investBillNo,
      impression: impression.trim(),
      billTypeNo,
      itemName,
      item_id: itemId,
      device_id: formatMeta?.device_id || [],
      sections: sections.map((s) => ({
        title_id: s.title_id,
        value: s.value,
      })),
    };

    try {
      const result = await apiRequest(
        `${HMSURL}scan-reports/`,
        "POST",
        reportData,
      );
      if (result.success) {
        toast.success("Report submitted successfully! ✓");
        navigate(-1);
      } else {
        toast.error(result.error || "Error submitting report");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  // ─── Not loaded yet ───────────────────────────────────────────────────────
  if (!dataLoaded) {
    return (
      <PageWrapper>
        <Container>
          <FormCard>
            <PageTitle>Report Form</PageTitle>
            <ErrorMessage>
              <ErrorTitle>Error Loading Data</ErrorTitle>
              <ErrorText>
                Unable to load patient information. Please navigate from the
                investigations list.
              </ErrorText>
            </ErrorMessage>
            <StyledButtonContainer>
              <CancelButton type="button" onClick={handleCancel}>
                ← Go Back
              </CancelButton>
            </StyledButtonContainer>
          </FormCard>
        </Container>
      </PageWrapper>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <Container>
        <FormCard>
          {/* ✅ FIX 1: Show department from API, fallback to "RD REPORT" while loading */}
          <PageTitle>{formatMeta?.department || "RD REPORT"}</PageTitle>
          <Subtitle>
            Complete the form below to submit a{" "}
            {formatMeta?.department
              ? formatMeta.department.toLowerCase()
              : "radiology"}{" "}
            investigation report
          </Subtitle>

          {/* Live date/time */}
          <DateTimeBanner>
            <DateTimeItem>
              <span className="icon">📅</span>
              <span className="value">{formatDisplayDate(now)}</span>
            </DateTimeItem>
            <DateTimeItem>
              <span className="icon">⏱</span>
              <span className="value">{formatDisplayTime(now)}</span>
            </DateTimeItem>
          </DateTimeBanner>

          {/* Patient info */}
          <InfoSection>
            <InfoTitle>Patient Information</InfoTitle>
            <InfoText>
              Filling report for <strong>{patientName}</strong> — UHID:{" "}
              <strong>
                {uhid}/{subUhid}
              </strong>{" "}
              | IP Number: <strong>{ipNumber}</strong> | Age:{" "}
              <strong>{age}</strong> | Gender: <strong>{gender}</strong> | Bill
              No: <strong>{investBillNo}</strong>
              {itemName && (
                <>
                  {" "}
                  | Item: <strong>{itemName}</strong>
                </>
              )}{" "}
              | Bill Date:{" "}
              <strong>
                {investBillDate ? investBillDate.split("T")[0] : ""}
              </strong>{" "}
              | Referred By: <strong>{referredBy}</strong>
            </InfoText>
          </InfoSection>

          {/* Format meta bar */}
          {formatMeta && (
            <MetaBar>
              {formatMeta.department && (
                <MetaBadge>🏥 {formatMeta.department}</MetaBadge>
              )}
              {formatMeta.device_id?.length > 0 && (
                <MetaBadge>🖥 {formatMeta.device_id.join(", ")}</MetaBadge>
              )}
              {formatMeta.TAT_Time && (
                <MetaBadge>⏱ TAT: {formatMeta.TAT_Time}</MetaBadge>
              )}
              {gender && (
                <MetaBadge>
                  {gender === "Female" ? "♀" : "♂"} {gender} Format
                </MetaBadge>
              )}
            </MetaBar>
          )}

          <Form onSubmit={handleSubmit}>
            {/* ── Format sections ── */}
            {formatLoading && (
              <FormatLoadingBox>
                ⏳ Loading report template for {gender}…
              </FormatLoadingBox>
            )}

            {!formatLoading && formatError && (
              <FormatErrorBox>
                ⚠️ {formatError} — You can still type the impression manually
                below.
              </FormatErrorBox>
            )}

            {!formatLoading && sections.length > 0 && (
              <div>
                <FormatSectionHeader>
                  <FormatSectionTitle>
                    Structured Report Sections
                  </FormatSectionTitle>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <SmallBtn
                      type="button"
                      bg="linear-gradient(135deg,#00897b,#00695c)"
                      color="white"
                      onClick={handleCompileImpression}
                    >
                      ↓ Compile to Impression
                    </SmallBtn>
                    <SmallBtn
                      type="button"
                      bg="#f5f5f5"
                      color="#555"
                      onClick={handleResetSections}
                    >
                      ↺ Reset
                    </SmallBtn>
                  </div>
                </FormatSectionHeader>
                <FormatSectionWrapper>
                  {sections.map((section, idx) => (
                    <SectionItem
                      key={section.title_id}
                      section={section}
                      index={idx}
                      onChange={handleSectionChange}
                      shortcuts={shortcuts}
                    />
                  ))}
                </FormatSectionWrapper>
              </div>
            )}

            {/* ── Shortcuts ── */}
            {Object.keys(shortcuts).length > 0 && (
              <ShortcutSection>
                <ShortcutTitle>
                  Quick Shortcuts — click to insert into impression
                </ShortcutTitle>
                <ShortcutChips>
                  {Object.entries(shortcuts).map(([key, value]) => (
                    <Chip
                      key={key}
                      type="button"
                      title={value}
                      onClick={() => handleShortcutClick(value)}
                    >
                      <span style={{ color: "#999", fontSize: "0.65rem" }}>
                        {key}
                      </span>
                      {value.length > 30 ? value.slice(0, 28) + "…" : value}
                    </Chip>
                  ))}
                </ShortcutChips>
              </ShortcutSection>
            )}

            {/* ── Final impression ── */}
            <SummarySection>
              <SummaryTitle>Final Impression / Findings</SummaryTitle>
              <SummaryActions>
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
              </SummaryActions>

              <ImpressionEditor
                value={impression}
                onChange={setImpression}
                placeholder={
                  sections.length > 0
                    ? 'Fill sections above and click "Compile to Impression", or type directly here…'
                    : "Enter detailed impression and findings…"
                }
              />
            </SummarySection>

            {/* ── Action buttons ── */}
            <StyledButtonContainer>
              <CancelButton
                type="button"
                onClick={handleCancel}
                disabled={submitting}
              >
                ← Cancel
              </CancelButton>
              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "✓ Submit Report"}
              </SubmitButton>
            </StyledButtonContainer>
          </Form>
        </FormCard>
      </Container>
    </PageWrapper>
  );
};

export default RDReportForm;

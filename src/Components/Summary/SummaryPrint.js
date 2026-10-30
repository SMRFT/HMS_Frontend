import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SummaryHead from "../Images/SummaryHead.png";
import Shanmuga360QR from "../Images/Shanmuga360QR.png";
import apiRequest from "../../Auth/apiRequest";

/* ─────────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sp-shell { min-height: 100vh; background: #d6dce5; font-family: 'Source Sans 3', Arial, sans-serif; overflow-x: hidden; }

  .sp-bar {
    position: sticky; top: 0; z-index: 999; background: #fff;
    border-bottom: 2px solid #2563a8; padding: 10px 24px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  }
  .sp-bar-left { display: flex; align-items: center; gap: 14px; }
  .sp-bar-title { font-size: 20px; font-weight: 700; color: #1a3a6e; }
  .sp-bar-sub   { font-size: 14px; color: #6b7a99; margin-top: 2px; }
  .sp-bar-actions { display: flex; align-items: center; gap: 10px; }

  .sp-zoom-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1.5px solid #cbd5e1;
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    margin: 14px auto 6px;
    position: sticky;
    top: 68px;
    z-index: 990;
    width: fit-content;
  }
  .sp-zoom-btn {
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #1e293b;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 12px;
    cursor: pointer;
    transition: all .15s ease;
    font-family: inherit;
  }
  .sp-zoom-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
  .sp-zoom-btn.active {
    background: #2563a8;
    color: #ffffff;
    border-color: #2563a8;
  }
  .sp-zoom-text {
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    min-width: 44px;
    text-align: center;
    user-select: none;
  }

  .sp-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 22px; border: none; border-radius: 5px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'Source Sans 3', Arial, sans-serif;
    transition: background .15s, box-shadow .15s, transform .15s; letter-spacing: .2px;
  }
  .sp-btn-primary { background: #2563a8; color: #fff; box-shadow: 0 2px 8px rgba(37,99,168,.28); }
  .sp-btn-primary:hover:not(:disabled) { background: #1a4d8a; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,168,.38); }
  .sp-btn-whatsapp { background: #25d366; color: #fff; box-shadow: 0 2px 8px rgba(37,211,102,.28); }
  .sp-btn-whatsapp:hover:not(:disabled) { background: #128c7e; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,211,102,.38); }
  .sp-btn-email { background: #ea4335; color: #fff; box-shadow: 0 2px 8px rgba(234,67,53,.28); }
  .sp-btn-email:hover:not(:disabled) { background: #c53023; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(234,67,53,.38); }
  .sp-btn-back { background: #f8fafc; color: #334155; border: 1.5px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .sp-btn-back:hover:not(:disabled) { background: #e2e8f0; color: #0f172a; transform: translateY(-1px); }
  .sp-btn:disabled { opacity: .5; cursor: not-allowed; }
  .sp-btn-spinner {
    display: inline-block; width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
    border-radius: 50%; animation: sp-spin .7s linear infinite;
  }
  @keyframes sp-spin { to { transform: rotate(360deg); } }

  .sp-pages {
    padding: 16px 8px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .sp-page-scaler {
    position: relative;
    overflow: visible;
    flex-shrink: 0;
    transition: width 0.15s ease, height 0.15s ease;
  }

  .preview-page {
    width: 794px; background: #fff;
    box-shadow: 0 4px 28px rgba(0,0,0,.20); border-radius: 2px;
  }

  @media (max-width: 768px) {
    .sp-bar {
      padding: 10px 14px;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
    .sp-bar-left {
      width: 100%;
      gap: 10px;
    }
    .sp-bar-title {
      font-size: 16px;
    }
    .sp-bar-sub {
      font-size: 12px;
    }
    .sp-bar-actions {
      display: flex;
      gap: 8px;
      width: 100%;
    }
    .sp-bar-actions .sp-btn {
      flex: 1;
      justify-content: center;
      padding: 8px 10px;
      font-size: 13px;
    }
    .sp-bar-actions .sp-dropdown-container {
      flex: 1;
    }
    .sp-bar-actions .sp-dropdown-container > .sp-btn {
      width: 100%;
      justify-content: center;
    }
    .sp-zoom-toolbar {
      top: 106px;
      margin: 8px auto 4px;
      padding: 4px 10px;
    }
  }
  .sp-outer-border {
    margin: 19px; border: 1px solid #aab4c6; display: flex; flex-direction: column;
  }
  .sp-header-img {
    width: 100%; display: block; height: 106px;
    object-fit: contain; object-position: center;
    border-bottom: 1px solid #aab4c6; padding: 6px 12px; background: #fff;
  }
  .sp-doc-title {
    text-align: center; font-size: 15px; font-weight: 700; color: #1a3a6e;
    letter-spacing: 2px; padding: 5px 0; text-transform: uppercase;
    border-bottom: 1px solid #c8d0de; background: #f4f6fb; text-decoration: underline;
  }
  .sp-info-grid { display: grid; grid-template-columns: 1fr 1fr; font-size: 15px; border-bottom: 1px solid #aab4c6; }
  .sp-info-row  { display: flex; align-items: baseline; padding: 4px 10px; border-bottom: 1px solid #e2e8f2; }
  .sp-info-row:nth-child(odd) { border-right: 1px solid #e2e8f2; }
  .sp-info-label { color: #444; min-width: 80px; flex-shrink: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; }
  .sp-info-colon { margin: 0 6px; color: #999; flex-shrink: 0; }
  .sp-info-value { color: #111; flex: 1; }
  .sp-icd { font-size: 12px; padding: 4px 10px; background: #f4f6fb; border-bottom: 1px solid #c8d0de; display: flex; gap: 5px; color: #111; align-items: baseline; }
  .sp-icd-label { font-weight: 700; color: #444; text-transform: uppercase; }

  .sp-page-no-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 22px;
    line-height: 22px;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    background: #f8fafc;
    border-bottom: 1px solid #c8d0de;
    letter-spacing: 0.3px;
    box-sizing: border-box;
  }

  .sp-body { padding: 7px 10px 16px; font-size: 12px; color: #111; line-height: 1.5; }
  .sp-section { margin-bottom: 5px; }
  .sp-section-title {
    font-size: 12px; font-weight: 700; color: #1a3a6e; text-transform: uppercase;
    letter-spacing: .5px; padding: 2px 7px; border-left: 3px solid #2563a8;
    margin: 7px 0 3px; background: #f4f6fb; text-decoration: underline;
  }
  .sp-section-content { font-size: 12px; line-height: 1.55; padding-left: 10px; white-space: pre-wrap; color: #222; text-align: justify; }
  .sp-section-content strong, .sp-section-content b { font-weight: 700; color: #000; }

  .sp-lab-title {
    text-align: center; font-size: 15px; font-weight: 700; color: #1a3a6e;
    letter-spacing: .8px; text-transform: uppercase; margin: 8px 0 4px;
    padding-bottom: 3px; border-bottom: 1.5px solid #2563a8; text-decoration: underline;
  }
  .sp-dept-header {
    font-size: 12px; font-weight: 700; color: #1a3a6e; background: #e8eef8;
    text-align: center; letter-spacing: 1px; text-transform: uppercase;
    padding: 4px 10px; margin: 6px 0 0;
    border-top: 1.5px solid #2563a8; border-bottom: 1px solid #b8c6de;
  }
  .sp-lab-table { width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #b8c6de; }
  .sp-lab-table thead tr { background: #f0f4fb; border-bottom: 1px solid #b8c6de; }
  .sp-lab-table th { padding: 3.5px 6px; text-align: left; font-weight: 700; color: #1a3a6e; font-size: 12px; text-transform: uppercase; letter-spacing: .2px; }
  .sp-lab-table td { padding: 3px 6px; border-bottom: 1px dashed #cdd8ec; vertical-align: top; color: #111; font-size: 12px; }
  .sp-lab-table tbody tr:last-child td { border-bottom: none; }
  .sp-test-name-row td { font-weight: 700; color: #1a3a6e; padding: 4px 6px 2px; font-size: 12px; background: #f4f7fc; border-bottom: 1px solid #b8c6de; }
  .sp-subtitle-row td { font-weight: 700; font-style: italic; color: #2c4a72; padding: 2px 6px 2px 16px; font-size: 12px; border-bottom: 1px dashed #cdd8ec; }
  .sp-high { color: #c0392b; font-weight: 700; }
  .sp-low  { color: #1558a8; font-weight: 700; }
  .sp-note-row td { font-style: italic; color: #777; font-size: 10px; padding: 1px 6px 2px 16px; border-bottom: 1px dashed #cdd8ec; }
  .sp-verified-text { font-size: 10px; font-style: italic; color: #666; padding: 2px 6px; }
  .sp-outsourced    { font-size: 10px; font-style: italic; color: #888; margin-left: 5px; }

  .sp-micro-test-name { font-weight: 700; font-size: 12px; padding: 3px 6px; color: #1a3a6e; border-left: 3px solid #2563a8; margin-bottom: 2px; background: #f4f7fc; }
  .sp-micro-info { font-size: 12px; padding-left: 3px; margin-bottom: 3px; }
  .sp-micro-info-row { display: flex; align-items: baseline; margin-bottom: 2px; }
  .sp-micro-info-label { font-weight: 700; min-width: 120px; flex-shrink: 0; color: #333; }
  .sp-micro-info-colon { margin: 0 5px; color: #999; }
  .sp-micro-info-value { color: #111; }
  .sp-micro-table { width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #b8c6de; margin-bottom: 4px; }
  .sp-micro-table thead tr { background: #f0f4fb; border-bottom: 1px solid #b8c6de; }
  .sp-micro-table th { padding: 3.5px 6px; font-weight: 700; color: #1a3a6e; font-size: 12px; text-transform: uppercase; letter-spacing: .2px; text-align: left; }
  .sp-micro-table th.center { text-align: center; }
  .sp-micro-table td { padding: 3px 6px; border-bottom: 1px dashed #cdd8ec; vertical-align: top; color: #111; font-size: 12px; }
  .sp-micro-table td.center { text-align: center; }
  .sp-micro-table tbody tr:last-child td { border-bottom: none; }

  .sp-sig-block { display: flex; justify-content: flex-end; gap: 40px; padding: 5px 10px 3px; margin-top: 4px; border-top: 1px dashed #aab4c6; }
  .sp-sig-item  { text-align: center; min-width: 100px; }
  .sp-sig-img   { height: 34px; max-width: 110px; object-fit: contain; display: block; margin: 0 auto 4px; }
  .sp-sig-name  { font-size: 10px; font-weight: 700; color: #111; }
  .sp-sig-title { font-size: 9px; color: #555; }

  .sp-end-marker { text-align: center; font-size: 12px; font-weight: 700; color: #444; margin: 8px 0 5px; letter-spacing: 1px; }

  .sp-explained { display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; padding: 0 10px 16px; }
  .sp-explained-col { width: 46%; }
  .sp-explained-title { font-weight: 700; margin-bottom: 30px; color: #1a3a6e; text-transform: uppercase; font-size: 12px; letter-spacing: .5px; }
  .sp-explained-field { margin-bottom: 40px; color: #333; }

  .sp-home-services {
    margin-top: 20px;
    border: 1px solid #93c5fd;
    border-radius: 8px;
    background: #f8fafc;
    overflow: hidden;
  }
  .sp-hs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .sp-hs-col {
    padding: 10px 14px;
    font-size: 11px;
    line-height: 1.45;
  }
  .sp-hs-col:first-child {
    border-right: 1px solid #cbd5e1;
    background: #ffffff;
  }
  .sp-hs-title {
    font-size: 11.5px;
    font-weight: 700;
    color: #1a3a6e;
    margin-bottom: 7px;
    padding-bottom: 3px;
    border-bottom: 1.5px solid #2563a8;
    text-transform: uppercase;
    letter-spacing: .3px;
  }
  .sp-hs-item {
    margin-bottom: 6px;
  }
  .sp-hs-item-title {
    font-size: 11px;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .sp-hs-phone {
    font-size: 11px;
    font-weight: 700;
    color: #0f766e;
    margin-left: 20px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .sp-hs-app-bar {
    border-top: 1px solid #93c5fd;
    background: #f0f7ff;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }
  .sp-hs-app-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  .sp-hs-qr-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }
  .sp-hs-qr {
    width: 62px;
    height: 62px;
    object-fit: contain;
    background: #ffffff;
    border: 1px solid #94a3b8;
    border-radius: 4px;
    padding: 2px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .sp-hs-qr-sub {
    font-size: 8px;
    font-weight: 700;
    color: #1e3a8a;
    letter-spacing: .4px;
    margin-top: 2px;
    text-transform: uppercase;
  }
  .sp-hs-app-text-block {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .sp-hs-app-en {
    font-size: 11.5px;
    font-weight: 700;
    color: #1a3a6e;
    display: flex;
    align-items: center;
    gap: 6px;
    letter-spacing: .2px;
  }
  .sp-hs-app-ta {
    font-size: 10px;
    font-weight: 600;
    color: #334155;
    margin-left: 22px;
  }
  .sp-hs-scan-badge {
    background: #ffffff;
    border: 1.5px dashed #2563a8;
    border-radius: 6px;
    padding: 5px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(37,99,168,0.06);
  }
  .sp-hs-scan-badge-title {
    font-size: 9.5px;
    font-weight: 800;
    color: #1a3a6e;
    letter-spacing: .5px;
    text-transform: uppercase;
  }
  .sp-hs-scan-badge-sub {
    font-size: 9px;
    font-weight: 600;
    color: #0f766e;
    margin-top: 1px;
  }

  .sp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0f4fb; color: #1a3a6e; gap: 14px; font-family: 'Source Sans 3', Arial, sans-serif; }
  .sp-spinner  { width: 36px; height: 36px; border: 3px solid rgba(37,99,168,.15); border-top-color: #2563a8; border-radius: 50%; animation: sp-spin .8s linear infinite; }

  .sp-not-approved {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 5px;
    background: #fef3cd; border: 1px solid #f5c842;
    font-size: 13px; font-weight: 600; color: #856404;
    font-family: 'Source Sans 3', Arial, sans-serif;
  }
  .sp-dropdown-container {
    position: relative;
    display: inline-block;
  }
  .sp-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 5px;
    background: #fff;
    border: 1px solid #cdd8ec;
    border-radius: 6px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.15);
    z-index: 1000;
    min-width: 170px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .sp-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background .15s, color .15s;
    font-family: 'Source Sans 3', Arial, sans-serif;
  }
  .sp-dropdown-item:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

/* ─── fieldsData array helpers ───────────────────────────────────────────
   fieldsData is stored/returned as an array of { key, value } objects
   instead of a plain { key: value } object. normalizeFieldsData() also
   tolerates the older object shape (and a JSON string of either), so
   summaries saved before this change still print correctly.
──────────────────────────────────────────────────────────────────────── */
const normalizeFieldsData = (fd) => {
  let parsed = fd;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = [];
    }
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed).map(([key, value]) => ({ key, value }));
  }
  return [];
};

const safeStr = (v) => (v != null ? String(v) : "");
const safeUpper = (v) => (v != null ? String(v).toUpperCase() : "");
const fmtDate = (d) => {
  if (!d) return "—";
  if (typeof d === "string") {
    const s = d.trim();
    if (!s) return "—";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s.replace(/-/g, "/");
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const [y, m, day] = s.slice(0, 10).split("-");
      return `${day}/${m}/${y}`;
    }
  }
  try {
    const dt = new Date(d);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } catch { }
  return safeStr(d);
};
const fmtTime = (t) => {
  if (!t) return "";
  if (typeof t === "string") {
    const s = t.trim();
    if (/^\d{1,2}:\d{2}(\s*(AM|PM))?$/i.test(s)) {
      return s;
    }
  }
  try {
    const dt = new Date(t);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  } catch { }
  return safeStr(t);
};

const buildDoaDodText = (doa, doaTime, dod, dodTime) => {
  const dStr = doa ? fmtDate(doa) : "—";
  const tStr = fmtTime(doaTime) || "";
  const dodStr = dod ? fmtDate(dod) : "—";
  const dodTStr = fmtTime(dodTime) || "";
  const doaLine = `DOA : ${dStr} ${tStr}`.trim();
  const dodLine = `DOD : ${dodStr} ${dodTStr}`.trim();
  return `${doaLine}\n${dodLine}`;
};

const formatDoaDodWithExtras = (existingVal, doa, doaTime, dod, dodTime) => {
  const autoText = buildDoaDodText(doa, doaTime, dod, dodTime);
  const text = (existingVal || "").trim();
  if (!text) return autoText;
  let strVal = text;
  if (!strVal.includes("\n") && /DOA\s*:.*DOD\s*:/i.test(strVal)) {
    strVal = strVal.replace(/(DOA\s*:[^D\n]*?)(DOD\s*:)/i, "$1\n$2");
  }
  const lines = strVal.split("\n");
  const extraLines = lines.filter(
    (l) => !/^DOA\s*:/i.test(l.trim()) && !/^DOD\s*:/i.test(l.trim())
  );
  if (extraLines.length > 0) {
    return `${autoText}\n${extraLines.join("\n")}`.trim();
  }
  return autoText;
};

const getFieldValue = (fieldsDataArr, key, summaryData = null) => {
  const entry = fieldsDataArr.find((f) => f.key === key);
  let val = entry ? entry.value : undefined;

  if (key === "DOA AND DOD") {
    let strVal = val != null ? String(val) : "";
    if (strVal && !strVal.includes("\n") && /DOA\s*:.*DOD\s*:/i.test(strVal)) {
      strVal = strVal.replace(/(DOA\s*:[^D\n]*?)(DOD\s*:)/i, "$1\n$2");
    }

    if (summaryData && (summaryData.doa || summaryData.dod)) {
      return formatDoaDodWithExtras(
        strVal,
        summaryData.doa,
        summaryData.doaTime,
        summaryData.dod,
        summaryData.dodTime
      );
    }

    const hasDoaInVal = /^DOA\s*:/im.test(strVal);
    const hasDodInVal = /^DOD\s*:/im.test(strVal);
    if (!hasDoaInVal && !hasDodInVal) {
      return formatDoaDodWithExtras(
        strVal,
        summaryData?.doa,
        summaryData?.doaTime,
        summaryData?.dod,
        summaryData?.dodTime
      );
    }

    return strVal || undefined;
  }

  return val;
};

/* ─── Render Formatted/Bold Text Helper ──────────────────────────────────── */
const renderFormattedText = (text) => {
  if (text == null || text === "" || !String(text).trim()) return "\u00A0";
  const regex = /(\*\*[\s\S]+?\*\*|<b>[\s\S]*?<\/b>|<strong>[\s\S]*?<\/strong>)/gi;
  const parts = String(text).split(regex);

  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    const bMatch = part.match(/^<b>([\s\S]*?)<\/b>$/i);
    if (bMatch) {
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {bMatch[1]}
        </strong>
      );
    }
    const strongMatch = part.match(/^<strong>([\s\S]*?)<\/strong>$/i);
    if (strongMatch) {
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {strongMatch[1]}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

/* ═══════════════════════════════════════════════════════════ */
const SummaryPrint = () => {
  const { ipNo, ip_no } = useParams();
  const targetIpNo = ipNo || ip_no;
  const navigate = useNavigate();
  const location = useLocation();
  const bodyRef = useRef(null);
  const pageRef = useRef(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSendDropdown, setShowSendDropdown] = useState(false);
  const [previewTotalPages, setPreviewTotalPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [pageHeight, setPageHeight] = useState(1123);
  const previewScaleRef = useRef(1);
  previewScaleRef.current = zoomScale;

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const computeFitScale = () => {
    if (typeof window === "undefined") return 1;
    const screenW = window.innerWidth;
    if (screenW >= 840) return 1;
    const availW = Math.max(280, screenW - 16);
    return Math.min(1, Math.max(0.3, +(availW / 794).toFixed(3)));
  };

  useEffect(() => {
    const handleResize = () => {
      if (isAutoFit) {
        setZoomScale(computeFitScale());
      }
    };
    setZoomScale(computeFitScale());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isAutoFit]);

  useEffect(() => {
    if (!pageRef.current) return;
    const updateH = () => {
      if (pageRef.current) {
        setPageHeight(pageRef.current.offsetHeight || pageRef.current.scrollHeight || 1123);
      }
    };
    updateH();
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateH());
      ro.observe(pageRef.current);
    }
    const t = setTimeout(updateH, 500);
    return () => {
      clearTimeout(t);
      if (ro) ro.disconnect();
    };
  }, [summaryData]);

  const getFilterDate = (val) => {
    if (!val) return "";
    if (typeof val === "string") {
      const isoMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
      const dmyMatch = val.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
      if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
      const dt = new Date(val);
      if (!isNaN(dt.getTime())) {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    } else if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, "0");
      const d = String(val.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return "";
  };

  const handleBack = () => {
    const ip = targetIpNo || summaryData?.ipNo || location.state?.ipNo || "";
    const rawDate =
      summaryData?.date ||
      location.state?.date ||
      summaryData?.created_date ||
      summaryData?.dod ||
      summaryData?.doa ||
      "";
    const dateStr = getFilterDate(rawDate);

    navigate("/Summary", {
      state: {
        archiveFilter: {
          ipNo: ip,
          date: dateStr,
        },
      },
    });
  };

  useEffect(() => {
    if (!summaryData) return;
    const calculatePages = () => {
      if (!bodyRef.current) return;
      const bodyRect = bodyRef.current.getBoundingClientRect();
      const curScale = previewScaleRef.current || 1;
      const allBlocks = Array.from(
        bodyRef.current.querySelectorAll("[data-block-top]")
      );
      let contentH = 0;
      for (const el of [...allBlocks, ...Array.from(bodyRef.current.children)]) {
        const r = el.getBoundingClientRect();
        if (r.height > 0) {
          const bot = (r.bottom - bodyRect.top) / curScale;
          if (bot > contentH) contentH = bot;
        }
      }
      const actualH = contentH > 0 ? contentH : bodyRef.current.scrollHeight;
      const p1Avail = 740;
      const contAvail = 940;
      if (actualH <= p1Avail) {
        setPreviewTotalPages(1);
      } else {
        const remaining = actualH - p1Avail;
        setPreviewTotalPages(1 + Math.max(1, Math.ceil((remaining - 10) / contAvail)));
      }
    };

    calculatePages();
    const timer = setTimeout(calculatePages, 400);
    return () => clearTimeout(timer);
  }, [summaryData]);

  useEffect(() => {
    const id = "summary-print-css";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
    return () => document.getElementById("summary-print-css")?.remove();
  }, []);

  useEffect(() => {
    (async () => {
      if (!targetIpNo) return;
      const r = await apiRequest(`${HMSURL}get-printsummary/${encodeURIComponent(targetIpNo)}/`, "GET");
      if (r.success) setSummaryData(r.data);
      else {
        alert("Summary not found");
        console.error(r.error);
      }
    })();
  }, [targetIpNo, HMSURL]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".sp-dropdown-container")) {
        setShowSendDropdown(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  /* ══════════════════════════════════════════════════════════
     PDF GENERATION
  ══════════════════════════════════════════════════════════ */
  const handlePrint = async (returnBlob = false) => {
    if (!summaryData || !bodyRef.current) return;
    setLoading(true);
    try {
      const SCALE = 2;
      const PX_W = 794;
      const PX_H = 1123;
      const MARGIN = 19;
      const BORDER = 1;
      const INNER_W = PX_W - MARGIN * 2 - BORDER * 2; // 756px
      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;

      const A4W = PX_W * SCALE;
      const A4H = PX_H * SCALE;
      const innerW = INNER_W * SCALE;
      const mg = MARGIN * SCALE;
      const bd = BORDER * SCALE;

      /* ── generic capture helper ── */
      const captureEl = async (el, fixedWidth) => {
        const clone = el.cloneNode(true);
        Object.assign(clone.style, {
          position: "fixed",
          top: "-99999px",
          left: "-99999px",
          width: fixedWidth + "px",
          background: "#ffffff",
          zIndex: "-1",
          minHeight: "unset",
        });
        document.body.appendChild(clone);
        const c = await html2canvas(clone, {
          scale: SCALE,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: fixedWidth,
          height: clone.scrollHeight,
          scrollX: 0,
          scrollY: 0,
        });
        document.body.removeChild(clone);
        return c;
      };

      /* ── STEP A: capture body + fixed strips ── */
      const bodyCanvas = await captureEl(bodyRef.current, INNER_W);
      const hdr1Canvas = await captureEl(
        document.getElementById("sp-cap-hdr1"),
        INNER_W,
      );
      const hdrCCanvas = await captureEl(
        document.getElementById("sp-cap-hdrc"),
        INNER_W,
      );
      const ftrCanvas = await captureEl(
        document.getElementById("sp-cap-ftr"),
        INNER_W,
      );

      const hdr1H = hdr1Canvas.height;
      const hdrCH = hdrCCanvas.height;
      const ftrH = ftrCanvas.height;

      /* ── STEP B: collect repeatable thead metadata ── */
      const bodyRect = bodyRef.current.getBoundingClientRect();
      const curScale = previewScaleRef.current || 1;
      const getRelTop = (r) => ((r.top - bodyRect.top) / curScale) * SCALE;
      const getRelBot = (r) => ((r.bottom - bodyRect.top) / curScale) * SCALE;

      const theadNodes = bodyRef.current.querySelectorAll(
        "thead[data-thead-id]",
      );
      const theadInfos = [];

      for (const thead of theadNodes) {
        const tbl = thead.closest("table");
        if (!tbl) continue;

        const thRect = thead.getBoundingClientRect();
        const tbRect = tbl.getBoundingClientRect();

        const theadTop = getRelTop(thRect);
        const theadBot = getRelBot(thRect);
        const tableBottom = getRelBot(tbRect);
        const theadH = Math.round(theadBot - theadTop);

        const blockEl = tbl.closest("[data-block-top]");
        const blockTop = blockEl
          ? getRelTop(blockEl.getBoundingClientRect())
          : theadTop;

        // Crop thead strip directly from bodyCanvas
        const strip = document.createElement("canvas");
        strip.width = bodyCanvas.width;
        strip.height = theadH;
        const sCtx = strip.getContext("2d");
        sCtx.drawImage(
          bodyCanvas,
          0,
          Math.round(theadTop),
          bodyCanvas.width,
          theadH,
          0,
          0,
          bodyCanvas.width,
          theadH,
        );

        theadInfos.push({
          blockTop,
          theadTop,
          theadBot,
          tableBottom,
          canvas: strip,
          height: theadH,
        });
      }

      /* ── STEP B2: collect row boundaries for row-snap ── */
      const allTables = Array.from(bodyRef.current.querySelectorAll("table"));
      const tableBoundaries = allTables.map((tbl) => {
        const tbRect = tbl.getBoundingClientRect();
        const tableTop = getRelTop(tbRect);
        const tableBottom = getRelBot(tbRect);

        const theadEl = tbl.querySelector("thead");
        const theadBot = theadEl
          ? getRelBot(theadEl.getBoundingClientRect())
          : tableTop;

        const blockEl = tbl.closest("[data-block-top]");
        const blockTop = blockEl
          ? getRelTop(blockEl.getBoundingClientRect())
          : tableTop;

        const tbodyRows = Array.from(tbl.querySelectorAll("tbody tr"));
        const rowBounds = tbodyRows
          .map((tr) => getRelBot(tr.getBoundingClientRect()))
          .filter((b) => b > theadBot && b <= tableBottom + 1);

        return { blockTop, tableTop, theadBot, tableBottom, rowBounds };
      });

      // Non-table block boundaries (signatures, dept headers, etc.)
      const nonTableBlockBounds = Array.from(
        bodyRef.current.querySelectorAll("[data-block-top]"),
      )
        .filter((el) => !el.querySelector("table") && !el.closest("table"))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            elTop: getRelTop(r),
            elBot: getRelBot(r),
          };
        });

      // Determine the true bottom coordinate of actual visual content inside bodyRef.current
      const allBlocks = Array.from(
        bodyRef.current.querySelectorAll("[data-block-top]"),
      );
      let contentBottom = 0;
      for (const el of [...allBlocks, ...Array.from(bodyRef.current.children)]) {
        const r = el.getBoundingClientRect();
        if (r.height > 0) {
          const bot = Math.round(getRelBot(r));
          if (bot > contentBottom) contentBottom = bot;
        }
      }
      if (contentBottom <= 0) contentBottom = bodyCanvas.height;

      const SNAP_TOL = 2;

      /*
       * snapCut(proposedCut)
       *
       * FIX: When the cut lands inside a table and no tbody rows fit,
       * we now snap to `theadBot` (NOT `blockTop`).
       *
       * Snapping to blockTop was the bug: it set yOffset back to before
       * the thead, so on the next page theadBot <= yOffset was false and
       * the thead overlay never fired. The result was that the organism
       * info text re-appeared instead of the column header row.
       *
       * Snapping to theadBot means yOffset === theadBot on the next page,
       * the overlay condition fires, and the header row is drawn correctly
       * above the first data row.
       */
      const snapCut = (proposedCut, yOffset) => {
        // Level 1: table row boundaries
        for (const {
          tableTop,
          theadBot,
          tableBottom,
          rowBounds,
        } of tableBoundaries) {
          if (proposedCut > tableTop && proposedCut <= tableBottom + SNAP_TOL) {
            const safe = rowBounds.filter((b) => b <= proposedCut);
            if (safe.length > 0) {
              const lastSafe = safe[safe.length - 1];
              // Whole table fits — no snap needed
              if (Math.abs(lastSafe - tableBottom) < SNAP_TOL)
                return proposedCut;
              return lastSafe;
            }
            // ✅ FIX: snap to theadBot so next page starts at first data row
            // and the thead overlay draws correctly above it.
            return theadBot;
          }
        }

        // Level 2: non-table blocks (signatures, dept headers, etc.)
        for (const { elTop, elBot } of nonTableBlockBounds) {
          if (proposedCut > elTop && proposedCut < elBot) {
            const blockHeight = elBot - elTop;
            const availPageHeight = proposedCut - yOffset;
            if (blockHeight <= availPageHeight) {
              return elTop;
            }
          }
        }

        return proposedCut;
      };

      /* ── STEP C: paginate ── */
      const bodySliceH_p1 = A4H - mg * 2 - bd * 2 - hdr1H - ftrH;
      const bodySliceH_cont = A4H - mg * 2 - bd * 2 - hdrCH - ftrH;

      /* ── Pre-calculate pagination slices ── */
      const slices = [];
      let yOffset = 0;
      let pIdx = 0;
      while (yOffset < contentBottom - 5) {
        // Stop if remaining height is only trailing whitespace padding (<= 20px)
        if (bodyCanvas.height - yOffset <= 20) break;

        const isFirst = pIdx === 0;
        const hdrH = isFirst ? hdr1H : hdrCH;
        const sliceMax = isFirst ? bodySliceH_p1 : bodySliceH_cont;

        const activeTheads = theadInfos.filter(
          (t) => t.theadBot <= yOffset + SNAP_TOL && yOffset < t.tableBottom,
        );

        const overlayTotalH = activeTheads.reduce((s, t) => s + t.height, 0);
        const availH = sliceMax - overlayTotalH;

        const rawEnd = yOffset + availH;
        let sliceEnd;

        // If the slice reaches or nearly reaches all visual content,
        // absorb all remaining padding so it finishes cleanly without spilling over
        if (rawEnd >= contentBottom - 20) {
          sliceEnd = bodyCanvas.height;
        } else {
          sliceEnd = snapCut(rawEnd, yOffset);
        }

        const sliceH = Math.max(sliceEnd - yOffset, 0);
        // If remaining slice height is insignificant (empty margin/padding), do not create a page
        if (sliceH <= 15) break;

        slices.push({ yOffset, sliceH, activeTheads, isFirst, hdrH });
        yOffset += sliceH;
        pIdx++;

        if (pIdx > 50) break; // safety cap
      }

      const totalPages = Math.max(1, slices.length);
      setPreviewTotalPages(totalPages);

      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const barH = 22 * SCALE;

      for (let pageIdx = 0; pageIdx < slices.length; pageIdx++) {
        const { yOffset: sliceY, sliceH, activeTheads, isFirst, hdrH } = slices[pageIdx];
        const hdrCanvas = isFirst ? hdr1Canvas : hdrCCanvas;

        /* ── Build output A4 canvas ── */
        const out = document.createElement("canvas");
        out.width = A4W;
        out.height = A4H;
        const ctx = out.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, A4W, A4H);

        ctx.strokeStyle = "#aab4c6";
        ctx.lineWidth = bd;
        ctx.strokeRect(
          mg + bd / 2,
          mg + bd / 2,
          A4W - mg * 2 - bd,
          A4H - mg * 2 - bd,
        );

        // Page header
        ctx.drawImage(
          hdrCanvas,
          0,
          0,
          hdrCanvas.width,
          hdrH,
          mg + bd,
          mg + bd,
          innerW,
          hdrH,
        );

        // Repaint dynamic Page No bar at bottom of header (under patient info)
        const barY = mg + bd + hdrH - barH;
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(mg + bd, barY, innerW, barH);

        ctx.strokeStyle = isFirst ? "#c8d0de" : "#aab4c6";
        ctx.lineWidth = 1 * SCALE;
        ctx.beginPath();
        ctx.moveTo(mg + bd, barY + barH);
        ctx.lineTo(mg + bd + innerW, barY + barH);
        ctx.stroke();

        ctx.font = `bold ${11 * SCALE}px 'Source Sans 3', Arial, sans-serif`;
        ctx.fillStyle = "#475569";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `Page ${pageIdx + 1} of ${totalPages}`,
          mg + bd + innerW - 10 * SCALE,
          barY + barH / 2,
        );

        let drawY = mg + bd + hdrH;

        // Draw thead overlays at top of body zone
        for (const t of activeTheads) {
          ctx.drawImage(
            t.canvas,
            0,
            0,
            t.canvas.width,
            t.height,
            mg + bd,
            drawY,
            innerW,
            t.height,
          );
          drawY += t.height;
        }

        // Draw body slice
        ctx.drawImage(
          bodyCanvas,
          0,
          sliceY,
          bodyCanvas.width,
          sliceH,
          mg + bd,
          drawY,
          innerW,
          sliceH,
        );

        // Footer pinned to bottom
        const ftrY = A4H - mg - bd - ftrH;
        ctx.drawImage(
          ftrCanvas,
          0,
          0,
          ftrCanvas.width,
          ftrH,
          mg + bd,
          ftrY,
          innerW,
          ftrH,
        );

        if (pageIdx > 0) doc.addPage();
        doc.addImage(
          out.toDataURL("image/jpeg", 0.88),
          "JPEG",
          0,
          0,
          PAGE_W_MM,
          PAGE_H_MM,
        );
      }

      const pdfBlob = doc.output("blob");
      if (returnBlob) {
        return pdfBlob;
      } else {
        window.open(URL.createObjectURL(pdfBlob), "_blank");
      }
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF error: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!summaryData) return;

    let phone = summaryData.mobilePhone || "";
    const userPhone = window.prompt(
      "Enter WhatsApp phone number (with or without country code):",
      phone
    );
    if (userPhone === null) return; // User cancelled

    const cleanPhone = userPhone.trim();
    if (!cleanPhone) {
      alert("Phone number is required to send WhatsApp message.");
      return;
    }

    setLoading(true);
    try {
      // 1. Generate PDF blob
      const pdfBlob = await handlePrint(true);
      if (!pdfBlob) {
        alert("Failed to generate PDF summary.");
        return;
      }

      // 2. Prepare FormData & Send WhatsApp directly
      const pdfFile = new File(
        [pdfBlob],
        `${summaryData.patient || "Patient"}_Discharge_Summary.pdf`,
        { type: "application/pdf" }
      );
      const waForm = new FormData();
      waForm.append("file", pdfFile);
      waForm.append("patient_name", summaryData.patient || "Valued Patient");
      waForm.append("phone", cleanPhone);
      waForm.append("pdf_name", `${summaryData.patient || "Patient"}_Discharge_Summary.pdf`);
      waForm.append("patient_id", summaryData.uhid || "");
      waForm.append("template_name", "sh_discharge_summary_final");

      const waRes = await apiRequest(`${HMSURL}send-whatsapp/`, "POST", waForm);

      if (waRes.success) {
        alert("Discharge summary sent successfully on WhatsApp!");
      } else {
        alert("Failed to send WhatsApp: " + (waRes.error || "Unknown error"));
      }
    } catch (err) {
      console.error("WhatsApp sending error:", err);
      alert("Error sending WhatsApp: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailShare = async () => {
    if (!summaryData) return;

    let email = summaryData.email || "";
    const userEmail = window.prompt(
      "Enter recipient email address (comma-separated for multiple):",
      email
    );
    if (userEmail === null) return; // User cancelled

    const cleanEmail = userEmail.trim();
    if (!cleanEmail) {
      alert("Email address is required to send the summary.");
      return;
    }

    setLoading(true);
    try {
      // 1. Generate PDF blob
      const pdfBlob = await handlePrint(true);
      if (!pdfBlob) {
        alert("Failed to generate PDF summary.");
        return;
      }

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append("subject", `Discharge Summary for ${summaryData.patient || "Patient"}`);
      formData.append(
        "message",
        `Dear ${summaryData.patient || "Recipient"},\n\nPlease find attached the discharge summary for ${summaryData.patient || "the patient"}.\n\nThank you.`
      );

      // Parse comma-separated emails and append each
      const emails = cleanEmail.split(",").map(e => e.trim()).filter(Boolean);
      emails.forEach(emailAddr => {
        formData.append("recipients", emailAddr);
      });

      formData.append("patient_id", summaryData.uhid || "");
      formData.append("patient_name", summaryData.patient || "");
      formData.append(
        "attachments",
        new File([pdfBlob], `${summaryData.patient || "Patient"}_Discharge_Summary.pdf`, {
          type: "application/pdf",
        })
      );

      // 3. Send Email
      const emailResponse = await apiRequest(`${HMSURL}send-email/`, "POST", formData);

      if (emailResponse.success) {
        alert("Discharge summary sent successfully via Email!");
      } else {
        alert("Failed to send email: " + (emailResponse.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Email sending error:", err);
      alert("Error sending email: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  const renderPreview = () => {
    if (!summaryData) return null;

    const isApproved = summaryData.approve === true;

    // fieldsData now arrives as an array of { key, value } objects.
    // normalizeFieldsData() also accepts the older object shape (or either
    // wrapped in a JSON string), so summaries saved before this change
    // still render correctly.
    const fieldsData = normalizeFieldsData(summaryData.fieldsData);

    const signaturesData = summaryData.signatures || [];
    const microSignaturesData = summaryData.micro_signatures || [];

    const DESIG = {
      DESIG101: { title: "Consultant Microbiologist" },
      DESIG100: { title: "Consultant Pathologist" },
      DESIG099: { title: "Consultant Biochemist" },
    };

    const getDeptConsultants = (deptTests, isMicro) => {
      const pool = isMicro ? microSignaturesData : signaturesData;
      const ids = [
        ...new Set(
          deptTests.map((t) => (t.approve_by || "").trim()).filter(Boolean),
        ),
      ];
      const matched = ids
        .map((id) => pool.find((s) => s.employeeId === id))
        .filter(Boolean);
      const src = matched.length > 0 ? matched : pool;
      return src
        .map((sig) => {
          const m = DESIG[sig.designation];
          return {
            name: sig.employeeName,
            title: m ? m.title : sig.designation || "",
            imgSrc: sig.signatureBase64
              ? `data:image/png;base64,${sig.signatureBase64}`
              : null,
          };
        })
        .filter((c) => c.name);
    };

    const DEPT_ORDER = [
      "Haematology",
      "Coagulation",
      "Biochemistry",
      "Immunology",
      "Immunoassay",
      "Serology",
      "Clinical Pathology",
      "Clinical Chemistry",
      "Cytology",
      "Genetics",
      "Histopathology",
      "Immunohistochemistry",
      "Microbiology",
      "Molecular Biology",
    ];

    const getHL = (val, ref) => {
      if (!val || !ref) return null;
      const n = parseFloat(val);
      if (isNaN(n)) return null;
      if (ref.includes("-")) {
        const [mn, mx] = ref.split("-").map((v) => parseFloat(v.trim()));
        if (!isNaN(mn) && !isNaN(mx)) {
          if (n < mn) return "L";
          if (n > mx) return "H";
        }
      } else if (ref.includes("<")) {
        const mx = parseFloat(ref.replace("<", "").trim());
        if (!isNaN(mx) && n > mx) return "H";
      } else if (ref.includes(">")) {
        const mn = parseFloat(ref.replace(">", "").trim());
        if (!isNaN(mn) && n < mn) return "L";
      }
      return null;
    };

    const InfoRow = ({ label, value }) => (
      <div className="sp-info-row">
        <span className="sp-info-label">{label}</span>
        <span className="sp-info-colon">:</span>
        <span className="sp-info-value">{value}</span>
      </div>
    );

    const SigBlock = ({ consultants }) => {
      if (!consultants?.length) return null;
      return (
        <div className="sp-sig-block" data-block-top="1">
          {consultants.map((c, i) => (
            <div key={i} className="sp-sig-item">
              {c.imgSrc && (
                <img src={c.imgSrc} alt="sig" className="sp-sig-img" />
              )}
              <div className="sp-sig-name">{c.name}</div>
              <div className="sp-sig-title">{c.title}</div>
            </div>
          ))}
        </div>
      );
    };

    const MicroTest = ({ test, theadId }) => {
      const valid = (test.parameters || []).filter((p) => p.result !== "Nil");
      return (
        <div style={{ marginBottom: 6 }}>
          {/*
           * KEY FIX: test name + specimen/organism info are wrapped in their
           * OWN data-block-top div that contains NO <table>.
           *
           * This means nonTableBlockBounds picks it up, and if the page cut
           * lands anywhere inside this info block the cut snaps to the TOP of
           * this div — keeping test name, specimen type and "Organism Isolated"
           * together on the same page as the first row of the table below.
           *
           * The <table> itself sits OUTSIDE this wrapper so tableBoundaries
           * handles its own row-level snapping independently, and the thead
           * overlay fires correctly on continuation pages.
           */}
          <div data-block-top="1">
            <div className="sp-micro-test-name">{safeStr(test.testname)}</div>
            <div className="sp-micro-info">
              <div className="sp-micro-info-row">
                <span className="sp-micro-info-label">Specimen Type</span>
                <span className="sp-micro-info-colon">:</span>
                <span className="sp-micro-info-value">
                  {safeStr(test.specimen_type) || "N/A"}
                </span>
              </div>
              {safeStr(test.colony_count).trim() && (
                <div className="sp-micro-info-row">
                  <span className="sp-micro-info-label">Colony Count</span>
                  <span className="sp-micro-info-colon">:</span>
                  <span className="sp-micro-info-value">
                    {safeStr(test.colony_count)}
                  </span>
                </div>
              )}
              {safeStr(test.remarks).trim() && (
                <div className="sp-micro-info-row">
                  <span className="sp-micro-info-label">
                    {test.is_AG_title ? "Sputum for AFB" : "Organism Isolated"}
                  </span>
                  <span className="sp-micro-info-colon">:</span>
                  <span className="sp-micro-info-value">
                    {safeStr(test.remarks)}
                  </span>
                </div>
              )}
            </div>
          </div>
          {valid.length > 0 && (
            <table className="sp-micro-table">
              <thead data-thead-id={theadId}>
                <tr>
                  <th style={{ width: "50%" }}>Antimicrobial</th>
                  <th style={{ width: "25%" }}>Result</th>
                  <th className="center" style={{ width: "25%" }}>
                    Zone of Inhibition (mm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {valid.map((p, pi) => (
                  <React.Fragment key={pi}>
                    <tr>
                      <td>{safeStr(p.test_name)}</td>
                      <td
                        style={{
                          fontWeight: safeStr(p.value).trim() ? 700 : 400,
                        }}
                      >
                        {safeStr(p.result)}
                      </td>
                      <td className="center">{safeStr(p.value)}</td>
                    </tr>
                    {safeStr(p.comment).trim() && (
                      <tr>
                        <td
                          colSpan="3"
                          style={{
                            fontStyle: "italic",
                            color: "#777",
                            fontSize: "8.5px",
                            borderBottom: "none",
                          }}
                        >
                          Note: {p.comment}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
          {!valid.length && safeStr(test.comment).trim() && (
            <div
              style={{
                fontStyle: "italic",
                color: "#777",
                fontSize: "8.5px",
                paddingLeft: 5,
              }}
            >
              Note: {test.comment}
            </div>
          )}
          {safeStr(test.verified_by).trim() && (
            <div className="sp-verified-text" data-block-top="1">
              Verified by: {test.verified_by}
            </div>
          )}
        </div>
      );
    };

    const StdRows = ({ test, multi }) => {
      const hasP = test.parameters?.length > 0;
      const bySub = {};
      if (hasP)
        test.parameters.forEach((p) => {
          const st = p.sub_title || "";
          if (!bySub[st]) bySub[st] = [];
          bySub[st].push(p);
        });
      const hl = hasP ? null : getHL(test.value, test.reference_range);
      return (
        <React.Fragment>
          {hasP ? (
            <tr className="sp-test-name-row">
              <td colSpan="6">
                {safeStr(test.testname)}
                {test.outsourced && (
                  <span className="sp-outsourced">(Outsourced)</span>
                )}
              </td>
            </tr>
          ) : (
            <tr>
              <td style={{ fontWeight: 700 }}>
                {safeStr(test.testname)}
                {test.outsourced && (
                  <span className="sp-outsourced">(Outsourced)</span>
                )}
              </td>
              <td>{safeStr(test.specimen_type)}</td>
              <td
                className={hl === "H" ? "sp-high" : hl === "L" ? "sp-low" : ""}
              >
                {safeStr(test.value)}
                {hl ? ` (${hl})` : ""}
              </td>
              <td>{safeStr(test.unit)}</td>
              <td>{safeStr(test.reference_range)}</td>
              <td>
                {safeStr(test.method)
                  .replace(/\bMethod\b/i, "")
                  .trim()}
              </td>
            </tr>
          )}
          {!hasP && safeStr(test.comment).trim() && (
            <tr className="sp-note-row">
              <td colSpan="6">Note: {test.comment}</td>
            </tr>
          )}
          {hasP &&
            Object.keys(bySub).map((sub) => (
              <React.Fragment key={sub}>
                {sub.trim() && (
                  <tr className="sp-subtitle-row">
                    <td colSpan="6">{sub}</td>
                  </tr>
                )}
                {bySub[sub].map((p, pi) => {
                  const ps = getHL(p.value, p.reference_range);
                  return (
                    <React.Fragment key={pi}>
                      <tr>
                        <td style={{ paddingLeft: 14 }}>{safeStr(p.name)}</td>
                        <td>{safeStr(p.specimen_type)}</td>
                        <td
                          className={
                            ps === "H" ? "sp-high" : ps === "L" ? "sp-low" : ""
                          }
                        >
                          {safeStr(p.value)}
                          {ps ? ` (${ps})` : ""}
                        </td>
                        <td>{safeStr(p.unit)}</td>
                        <td>{safeStr(p.reference_range)}</td>
                        <td>
                          {safeStr(p.method)
                            .replace(/\bMethod\b/i, "")
                            .trim()}
                        </td>
                      </tr>
                      {safeStr(p.comment).trim() && (
                        <tr className="sp-note-row">
                          <td colSpan="6">Note: {p.comment}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          {multi && safeStr(test.verified_by).trim() && (
            <tr>
              <td colSpan="6" className="sp-verified-text">
                Verified by: {test.verified_by}
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    };

    const LabReport = () => {
      const tests = summaryData.testdetails || [];
      if (!tests.length) return null;

      const microTests = tests.filter((t) => t.is_microbiology);
      const stdTests = tests.filter((t) => !t.is_microbiology);

      const byDept = stdTests.reduce((a, t) => {
        const d = t.department || "LABORATORY";
        if (!a[d]) a[d] = [];
        a[d].push(t);
        return a;
      }, {});

      const stdDepts = Object.keys(byDept).sort((a, b) => {
        const ia = DEPT_ORDER.indexOf(a),
          ib = DEPT_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });

      const stdSigs = getDeptConsultants(stdTests, false);
      const microSigs = getDeptConsultants(microTests, true);

      return (
        <div>
          <div className="sp-lab-title">Laboratory Investigation Report</div>

          {stdDepts.length > 0 && (
            <div>
              {stdDepts.map((dept, di) => {
                const dt = byDept[dept];
                const vSet = new Set(
                  dt.map((t) => (t.verified_by || "").trim()).filter(Boolean),
                );
                const multi = vSet.size > 1;
                return (
                  <div key={dept}>
                    {/*
                     * KEY FIX: dept header is in its own data-block-top div
                     * that contains NO <table>.
                     * nonTableBlockBounds picks it up → if the cut lands between
                     * the header and the table it snaps back to header top,
                     * keeping the dept label on the same page as its first row.
                     *
                     * The <table> sits OUTSIDE so tableBoundaries handles
                     * row-level snapping independently, and the thead overlay
                     * (Test/Specimen/Result/Units/Reference Value/Method) fires
                     * correctly on continuation pages.
                     */}
                    <div data-block-top="1">
                      <div className="sp-dept-header">{dept.toUpperCase()}</div>
                    </div>
                    <table className="sp-lab-table">
                      <thead data-thead-id={`lab-${di}-${dept}`}>
                        <tr>
                          <th style={{ width: "28%" }}>Test</th>
                          <th style={{ width: "11%" }}>Specimen</th>
                          <th style={{ width: "12%" }}>Result</th>
                          <th style={{ width: "9%" }}>Units</th>
                          <th style={{ width: "20%" }}>Reference Value</th>
                          <th style={{ width: "20%" }}>Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dt.map((t, ti) => (
                          <StdRows key={ti} test={t} multi={multi} />
                        ))}
                        {!multi && vSet.size > 0 && (
                          <tr>
                            <td colSpan="6" className="sp-verified-text">
                              Verified by: {Array.from(vSet).join(", ")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })}
              <SigBlock consultants={stdSigs} />
            </div>
          )}

          {microTests.length > 0 && (
            <div>
              <div data-block-top="1">
                <div className="sp-dept-header">MICROBIOLOGY</div>
              </div>
              {microTests.map((t, ti) => (
                <MicroTest key={ti} test={t} theadId={`micro-${ti}`} />
              ))}
              <SigBlock consultants={microSigs} />
            </div>
          )}

          <div className="sp-end-marker" data-block-top="1">
            — End of Laboratory Report —
          </div>
        </div>
      );
    };

    const contRows = [
      ["Name", safeStr(summaryData.patient)],
      ["IP No", safeStr(summaryData.ipNo)],
      ["UHID", safeStr(summaryData.uhid)],
      [
        "Age / Gender",
        `${safeStr(summaryData.age)} Yrs / ${safeUpper(summaryData.gender)}`,
      ],
      ...(summaryData.mobilePhone
        ? [["Mobile", safeStr(summaryData.mobilePhone)]]
        : []),
      ...(summaryData.address
        ? [["Address", safeStr(summaryData.address)]]
        : []),
    ];

    const inlineRow = (i) => ({
      display: "flex",
      alignItems: "baseline",
      padding: "3px 10px",
      ...(i % 2 === 0 ? { borderRight: "1px solid #e2e8f2" } : {}),
    });

    const getDocTitle = () => {
      const sType = safeStr(summaryData.summaryType).trim();
      const sHeading = safeStr(summaryData.heading).trim();
      if (sType && sHeading) return `${sType} - ${sHeading}`;
      return sType || sHeading || "DISCHARGE SUMMARY";
    };

    return (
      <div className="sp-shell">
        {/* ── Action bar ── */}
        <div className="sp-bar">
          <div className="sp-bar-left">
            <button
              className="sp-btn sp-btn-back"
              onClick={handleBack}
              title="Go Back to Discharge Summaries Archive"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
            <div>
              <div className="sp-bar-title">Discharge Summary Preview</div>
              <div className="sp-bar-sub">
                {safeStr(summaryData.patient)}&nbsp;&nbsp;·&nbsp;&nbsp;IP No:{" "}
                {safeStr(summaryData.ipNo)}
              </div>
            </div>
          </div>
          {isApproved ? (
            <div className="sp-bar-actions">
              <button
                className="sp-btn sp-btn-primary"
                onClick={() => handlePrint(false)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="sp-btn-spinner" /> Generating…
                  </>
                ) : (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <polyline points="9 15 12 18 15 15" />
                    </svg>
                    Open PDF
                  </>
                )}
              </button>
              <div className="sp-dropdown-container">
                <button
                  className="sp-btn sp-btn-primary"
                  onClick={() => setShowSendDropdown((prev) => !prev)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="sp-btn-spinner" /> Sharing…
                    </>
                  ) : (
                    <>
                      Send
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{
                          marginLeft: "2px",
                          transform: showSendDropdown ? "rotate(180deg)" : "none",
                          transition: "transform 0.15s",
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </>
                  )}
                </button>
                {showSendDropdown && !loading && (
                  <div className="sp-dropdown-menu">
                    <button
                      className="sp-dropdown-item"
                      onClick={() => {
                        setShowSendDropdown(false);
                        handleWhatsAppShare();
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#25d366"
                        style={{ marginRight: "4px" }}
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.452 5.43 0 9.851-4.378 9.854-9.76.002-2.607-1.012-5.059-2.859-6.908C16.575 2.088 14.12 1.072 11.5 1.072c-5.436 0-9.858 4.38-9.86 9.762-.001 1.777.478 3.515 1.387 5.061l-.921 3.36 3.451-.905zm12.39-4.86c-.33-.165-1.953-.964-2.253-1.074-.3-.109-.519-.165-.738.165-.219.329-.848 1.074-1.039 1.293-.191.219-.382.247-.712.082-.33-.165-1.393-.513-2.653-1.637-.98-.874-1.643-1.953-1.835-2.282-.19-.33-.02-.508.145-.671.148-.147.33-.384.495-.576.165-.191.22-.329.33-.548.11-.219.055-.411-.028-.576-.082-.165-.738-1.779-1.011-2.438-.266-.641-.532-.553-.73-.564-.19-.01-.41-.01-.628-.01-.219 0-.576.082-.876.411-.3.33-1.147 1.123-1.147 2.739 0 1.616 1.177 3.178 1.341 3.397.165.219 2.316 3.537 5.612 4.96.783.338 1.396.54 1.873.691.787.25 1.5.214 2.065.13.63-.094 1.953-.799 2.226-1.572.273-.773.273-1.438.191-1.572-.082-.134-.3-.213-.63-.378z" />
                      </svg>
                      WhatsApp
                    </button>
                    <button
                      className="sp-dropdown-item"
                      onClick={() => {
                        setShowSendDropdown(false);
                        handleEmailShare();
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ea4335"
                        strokeWidth="2.5"
                        style={{ marginRight: "4px" }}
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="sp-not-approved">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              PDF unavailable — Summary not yet approved
            </div>
          )}
        </div>

        {/* ── Zoom Controls for Mobile & Desktop ── */}
        <div className="sp-zoom-toolbar">
          <button
            type="button"
            className="sp-zoom-btn"
            onClick={() => {
              setIsAutoFit(false);
              setZoomScale((s) => Math.max(0.3, +(s - 0.1).toFixed(2)));
            }}
            title="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            className={`sp-zoom-btn ${isAutoFit ? "active" : ""}`}
            onClick={() => {
              setIsAutoFit(true);
              setZoomScale(computeFitScale());
            }}
            title="Fit to Screen width"
          >
            Fit Screen
          </button>
          <span className="sp-zoom-text">{Math.round(zoomScale * 100)}%</span>
          <button
            type="button"
            className={`sp-zoom-btn ${zoomScale === 1 && !isAutoFit ? "active" : ""}`}
            onClick={() => {
              setIsAutoFit(false);
              setZoomScale(1);
            }}
            title="Actual 100% size"
          >
            100%
          </button>
          <button
            type="button"
            className="sp-zoom-btn"
            onClick={() => {
              setIsAutoFit(false);
              setZoomScale((s) => Math.min(2.0, +(s + 0.1).toFixed(2)));
            }}
            title="Zoom in"
          >
            +
          </button>
        </div>

        <div className="sp-pages">
          <div
            className="sp-page-scaler"
            style={{
              width: Math.round(794 * zoomScale),
              height: pageHeight ? Math.round(pageHeight * zoomScale) : "auto",
            }}
          >
            <div
              ref={pageRef}
              className="preview-page"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: "top left",
              }}
            >
            <div className="sp-outer-border">
              <img src={SummaryHead} alt="Header" className="sp-header-img" />
              <div className="sp-doc-title">
                {getDocTitle()}
              </div>
              <div className="sp-info-grid">
                <InfoRow label="Name" value={safeStr(summaryData.patient)} />
                <InfoRow
                  label="Age / Gender"
                  value={`${safeStr(summaryData.age)} Yrs / ${safeUpper(summaryData.gender)}`}
                />
                <InfoRow label="UHID" value={safeStr(summaryData.uhid)} />
                <InfoRow
                  label="Consultant"
                  value={safeStr(summaryData.doctor)}
                />
                <InfoRow label="IP No" value={safeStr(summaryData.ipNo)} />
                <InfoRow
                  label="DOA & Time"
                  value={`${fmtDate(summaryData.doa)} ${fmtTime(summaryData.doaTime)}`}
                />
                <InfoRow label="Address" value={safeStr(summaryData.address)} />
                <InfoRow
                  label="DOD & Time"
                  value={`${fmtDate(summaryData.dod)} ${fmtTime(summaryData.dodTime)}`}
                />
                <InfoRow label="Room" value={safeStr(summaryData.roomNo)} />
                {summaryData.mobilePhone && (
                  <InfoRow
                    label="Mobile"
                    value={safeStr(summaryData.mobilePhone)}
                  />
                )}
              </div>
              {summaryData.diseaseCode && summaryData.disease && (
                <div className="sp-icd">
                  <span className="sp-icd-label">ICD :</span>
                  <span>
                    {safeStr(summaryData.diseaseCode)} —{" "}
                    {safeStr(summaryData.disease)}
                  </span>
                </div>
              )}

              <div className="sp-page-no-bar">
                <span>Page 1 of {previewTotalPages}</span>
              </div>

              <div className="sp-body" ref={bodyRef}>
                {fieldsData.map((item, idx) => {
                  const key = item.key;
                  if (!key) return null;
                  const content = getFieldValue(fieldsData, key, summaryData) ?? item.value;
                  const hasContent = content && String(content).trim();
                  const hasLab =
                    key === "INVESTIGATIONS" &&
                    summaryData.testdetails?.length > 0;
                  if (!hasContent && !hasLab) return null;
                  return (
                    <div key={key || idx} className="sp-section" data-block-top="true">
                      <div className="sp-section-title">{key}</div>
                      {hasContent && (
                        <div className="sp-section-content">
                          {String(content)
                            .split("\n")
                            .map((line, lIdx) => (
                              <div key={lIdx} style={{ minHeight: "1.4em" }}>
                                {renderFormattedText(line)}
                              </div>
                            ))}
                        </div>
                      )}
                      {key === "INVESTIGATIONS" && <LabReport />}
                    </div>
                  );
                })}
                <div className="sp-explained" data-block-top="true">
                  <div className="sp-explained-col">
                    <div className="sp-explained-title">Explained By</div>
                    <div className="sp-explained-field">
                      Doctor Name :{" "}
                      <strong style={{ fontWeight: 700, color: "#0f172a" }}>
                        {safeStr(
                          summaryData.explainedBy ||
                            (summaryData.doctor
                              ? summaryData.doctor.toUpperCase().startsWith("DR.")
                                ? summaryData.doctor
                                : `Dr. ${summaryData.doctor}`
                              : "")
                        )}
                      </strong>
                    </div>
                    <div className="sp-explained-field">Signature :</div>
                  </div>
                  <div className="sp-explained-col">
                    <div className="sp-explained-title">
                      Explained To Patient / Attender
                    </div>
                    <div className="sp-explained-field">
                      Name :{" "}
                      <strong style={{ fontWeight: 700, color: "#0f172a" }}>
                        {safeStr(summaryData.explainedTo || summaryData.patient)}
                      </strong>
                    </div>
                    <div className="sp-explained-field">Signature :</div>
                  </div>
                </div>

                <div className="sp-home-services" data-block-top="true">
                  <div className="sp-hs-grid">
                    {/* Tamil Section */}
                    <div className="sp-hs-col">
                      <div className="sp-hs-title">
                        வீட்டிலிருந்தபடியே சேவைகளைப் பெறலாம்!
                      </div>
                      <div className="sp-hs-item">
                        <div className="sp-hs-item-title">
                          <span>🩸</span> இரத்தப் பரிசோதனை &amp; மருந்து சேவை பெற
                        </div>
                        <div className="sp-hs-phone">
                          <span>📞</span> அழைக்கவும்: 89258 11781
                        </div>
                      </div>
                      <div className="sp-hs-item">
                        <div className="sp-hs-item-title">
                          <span>👨‍⚕️</span> மருத்துவர் ஆலோசனை &amp; நர்சிங் சேவை பெற
                        </div>
                        <div className="sp-hs-phone">
                          <span>📞</span> அழைக்கவும்: 89258 11781
                        </div>
                      </div>
                    </div>

                    {/* English Section */}
                    <div className="sp-hs-col">
                      <div className="sp-hs-title">
                        HOME SERVICES
                      </div>
                      <div className="sp-hs-item">
                        <div className="sp-hs-item-title">
                          <span>🩸</span> Home Blood Collection &amp; Medicine Delivery
                        </div>
                        <div className="sp-hs-phone">
                          <span>📞</span> Call: 89258 11781
                        </div>
                      </div>
                      <div className="sp-hs-item">
                        <div className="sp-hs-item-title">
                          <span>👨‍⚕️</span> Home Doctor Visit &amp; Nursing Services
                        </div>
                        <div className="sp-hs-phone">
                          <span>📞</span> Call: 89258 11781
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shanmuga360 App Download Bar with QR Code */}
                  <div className="sp-hs-app-bar">
                    <div className="sp-hs-app-left">
                      <div className="sp-hs-qr-box">
                        <img
                          src={Shanmuga360QR}
                          alt="Shanmuga360 App QR"
                          className="sp-hs-qr"
                        />
                        <span className="sp-hs-qr-sub">Scan QR</span>
                      </div>
                      <div className="sp-hs-app-text-block">
                        <div className="sp-hs-app-en">
                          <span>📲</span> Easy Access to Our Services Download the Shanmuga360 App
                        </div>
                        <div className="sp-hs-app-ta">
                          எங்கள் சேவைகளை எளிதாகப் பெற Shanmuga360 App-ஐ பதிவிறக்கம் செய்யுங்கள்
                        </div>
                      </div>
                    </div>
                    <div className="sp-hs-scan-badge">
                      <div className="sp-hs-scan-badge-title">SCAN TO DOWNLOAD</div>
                      <div className="sp-hs-scan-badge-sub">Shanmuga360 App</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* ══ HIDDEN STRIPS — PDF capture only ══ */}

        {/* Page-1 header */}
        <div
          id="sp-cap-hdr1"
          style={{
            position: "fixed",
            top: "-99999px",
            left: "-99999px",
            zIndex: -1,
            width: "756px",
            background: "#fff",
            fontFamily: "'Source Sans 3', Arial, sans-serif",
          }}
        >
          <img
            src={SummaryHead}
            alt=""
            style={{
              width: "100%",
              display: "block",
              height: 106,
              objectFit: "contain",
              objectPosition: "center",
              borderBottom: "1px solid #aab4c6",
              padding: "6px 12px",
              background: "#fff",
            }}
          />
          <div
            style={{
              textAlign: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "#1a3a6e",
              letterSpacing: 2,
              padding: "5px 0",
              textTransform: "uppercase",
              borderBottom: "1px solid #c8d0de",
              background: "#f4f6fb",
              textDecoration: "underline",
            }}
          >
            {getDocTitle()}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              fontSize: 15,
              borderBottom: "1px solid #aab4c6",
            }}
          >
            {[
              ["Name", safeStr(summaryData.patient)],
              [
                "Age / Gender",
                `${safeStr(summaryData.age)} Yrs / ${safeUpper(summaryData.gender)}`,
              ],
              ["UHID", safeStr(summaryData.uhid)],
              ["Consultant", safeStr(summaryData.doctor)],
              ["IP No", safeStr(summaryData.ipNo)],
              [
                "DOA & Time",
                `${fmtDate(summaryData.doa)} ${fmtTime(summaryData.doaTime)}`,
              ],
              ["Address", safeStr(summaryData.address)],
              [
                "DOD & Time",
                `${fmtDate(summaryData.dod)} ${fmtTime(summaryData.dodTime)}`,
              ],
              ["Room", safeStr(summaryData.roomNo)],
              ...(summaryData.mobilePhone
                ? [["Mobile", safeStr(summaryData.mobilePhone)]]
                : []),
            ].map(([lbl, val], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  padding: "4px 10px",
                  borderBottom: "1px solid #e2e8f2",
                  ...(i % 2 === 0 ? { borderRight: "1px solid #e2e8f2" } : {}),
                }}
              >
                <span
                  style={{
                    color: "#444",
                    minWidth: 80,
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {lbl}
                </span>
                <span style={{ margin: "0 6px", color: "#999", flexShrink: 0 }}>
                  :
                </span>
                <span style={{ color: "#111", flex: 1 }}>{val}</span>
              </div>
            ))}
          </div>
          {summaryData.diseaseCode && summaryData.disease && (
            <div
              style={{
                fontSize: 12,
                padding: "4px 10px",
                background: "#f4f6fb",
                borderBottom: "1px solid #c8d0de",
                display: "flex",
                gap: 5,
                color: "#111",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: "#444",
                  textTransform: "uppercase",
                }}
              >
                ICD :
              </span>
              <span>
                {safeStr(summaryData.diseaseCode)} —{" "}
                {safeStr(summaryData.disease)}
              </span>
            </div>
          )}
          <div
            id="sp-cap-p1-page"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              height: 22,
              lineHeight: "22px",
              padding: "0 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#475569",
              background: "#f8fafc",
              borderBottom: "1px solid #c8d0de",
              letterSpacing: "0.3px",
              boxSizing: "border-box",
            }}
          >
            <span>Page 1 of {previewTotalPages}</span>
          </div>
        </div>

        {/* Continuation header */}
        <div
          id="sp-cap-hdrc"
          style={{
            position: "fixed",
            top: "-99999px",
            left: "-99999px",
            zIndex: -1,
            width: "756px",
            background: "#f4f6fb",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            fontSize: 12,
            borderBottom: "1px solid #aab4c6",
            fontFamily: "'Source Sans 3', Arial, sans-serif",
          }}
        >
          {contRows.map(([lbl, val], i) => (
            <div key={i} style={inlineRow(i)}>
              <span
                style={{
                  color: "#444",
                  minWidth: 80,
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {lbl}
              </span>
              <span style={{ margin: "0 6px", color: "#999" }}>:</span>
              <span style={{ color: "#111", fontSize: 12 }}>{val}</span>
            </div>
          ))}
          <div
            id="sp-cap-hdrc-page"
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              height: 22,
              lineHeight: "22px",
              padding: "0 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#475569",
              background: "#f8fafc",
              borderTop: "1px solid #e2e8f2",
              letterSpacing: "0.3px",
              boxSizing: "border-box",
            }}
          >
            <span>Page 2 of {previewTotalPages}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          id="sp-cap-ftr"
          style={{
            position: "fixed",
            top: "-99999px",
            left: "-99999px",
            zIndex: -1,
            width: "756px",
            background: "#fff",
            fontSize: 10,
            textAlign: "center",
            color: "#777",
            lineHeight: 1.7,
            borderTop: "1px solid #dde3ec",
            padding: "3px 0 6px",
            fontFamily: "'Source Sans 3', Arial, sans-serif",
          }}
        >
          <div>In case of Emergency contact 0427 - 2706666 in Casualty OP</div>
          <div>அவசர உதவிக்கு அழைக்கவும் : 0427 - 2706666</div>
        </div>
      </div>
    );
  };

  if (!summaryData) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner" />
        <div style={{ fontSize: 13, color: "#2563a8" }}>Loading Summary…</div>
      </div>
    );
  }

  return renderPreview();
};

export default SummaryPrint;

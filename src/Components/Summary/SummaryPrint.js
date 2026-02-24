import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SummaryHead from "../Images/SummaryHead.png";
import apiRequest from "../../Auth/apiRequest";

/* ─────────────────────────────────────────────────────────────
   Styles — light, print-safe, readable
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sp-shell {
    min-height: 100vh;
    background: #d6dce5;
    font-family: 'Source Sans 3', Arial, sans-serif;
  }

  /* ── Action bar ── */
  .sp-bar {
    position: sticky; top: 0; z-index: 999;
    background: #ffffff;
    border-bottom: 2px solid #2563a8;
    padding: 10px 28px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  }
  .sp-bar-title { font-size: 20px; font-weight: 700; color: #1a3a6e; }
  .sp-bar-sub   { font-size: 15px; color: #6b7a99; margin-top: 2px; }

  .sp-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 22px; border: none; border-radius: 5px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'Source Sans 3', Arial, sans-serif;
    transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
    letter-spacing: 0.2px;
  }
  .sp-btn-primary { background: #2563a8; color: #fff; box-shadow: 0 2px 8px rgba(37,99,168,0.28); }
  .sp-btn-primary:hover:not(:disabled) { background: #1a4d8a; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,168,0.38); }
  .sp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .sp-btn-spinner {
    display: inline-block; width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
    border-radius: 50%; animation: sp-spin 0.7s linear infinite;
  }
  @keyframes sp-spin { to { transform: rotate(360deg); } }

  /* ── Pages wrapper ── */
  .sp-pages { padding: 28px; display: flex; flex-direction: column; align-items: center; gap: 24px; }

  /* ── A4 page — NO overflow:hidden, NO mm sizing issues ── */
  .preview-page {
    width: 794px;          /* 210mm at 96dpi */
    min-height: 1123px;    /* 297mm at 96dpi */
    background: #fff;
    position: relative;
    box-shadow: 0 4px 28px rgba(0,0,0,0.20);
    border-radius: 2px;
  }

  /* ── Content border ── */
  .sp-content {
    margin: 19px;          /* ~5mm at 96dpi */
    border: 1px solid #aab4c6;
    min-height: 1085px;
    position: relative;
    display: flex; flex-direction: column;
  }

  /* ── Header image ── */
  .sp-header-img {
    width: 100%; display: block;
    height: 106px;         /* ~28mm */
    object-fit: contain; object-position: center;
    border-bottom: 1px solid #aab4c6;
    padding: 6px 12px; background: #fff;
  }

  /* ── Document title ── */
  .sp-doc-title {
    text-align: center; font-size: 15px; font-weight: 700;
    color: #1a3a6e; letter-spacing: 2px;
    padding: 5px 0; text-transform: uppercase;
    border-bottom: 1px solid #c8d0de;
    background: #f4f6fb; text-decoration: underline;
  }

  /* ── Patient info grid ── */
  .sp-info-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    font-size: 15px; border-bottom: 1px solid #aab4c6;
  }
  .sp-info-row {
    display: flex; align-items: baseline;
    padding: 4px 10px; border-bottom: 1px solid #e2e8f2;
  }
  .sp-info-row:nth-child(odd) { border-right: 1px solid #e2e8f2; }
  .sp-info-label  { color: #444; min-width: 80px; flex-shrink: 0; font-size: 12px; font-weight: 700; text-transform: uppercase; }
  .sp-info-colon  { margin: 0 6px; color: #999; flex-shrink: 0; }
  .sp-info-value  { color: #111; flex: 1; }

  /* ── ICD box ── */
  .sp-icd {
    font-size: 12px; padding: 4px 10px;
    background: #f4f6fb; border-bottom: 1px solid #c8d0de;
    display: flex; gap: 5px; color: #111; align-items: baseline;
  }
  .sp-icd-label { font-weight: 700; color: #444; text-transform: uppercase; }

  /* ── Continuation header ── */
  .sp-cont-header {
    display: grid; grid-template-columns: 1fr 1fr;
    font-size: 12px; border-bottom: 1px solid #aab4c6; background: #f4f6fb;
  }
  .sp-cont-row { display: flex; align-items: baseline; padding: 3px 10px; }
  .sp-cont-row:nth-child(odd) { border-right: 1px solid #e2e8f2; }

  /* ── Body ── */
  .sp-body { flex: 1; padding: 7px 10px 80px; font-size: 12px; color: #111; line-height: 1.5; }

  /* ── Section ── */
  .sp-section { margin-bottom: 5px; }
  .sp-section-title {
    font-size: 12px; font-weight: 700; color: #1a3a6e;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 2px 7px; border-left: 3px solid #2563a8;
    margin: 7px 0 3px; background: #f4f6fb; text-decoration: underline;
  }
  .sp-section-content {
    font-size: 12px; line-height: 1.55; padding-left: 10px;
    white-space: pre-wrap; color: #222; text-align: justify;
  }

  /* ── Lab report title ── */
  .sp-lab-title {
    text-align: center; font-size: 15px; font-weight: 700;
    color: #1a3a6e; letter-spacing: 0.8px; text-transform: uppercase;
    margin: 8px 0 4px; padding-bottom: 3px;
    border-bottom: 1.5px solid #2563a8; text-decoration: underline;
  }

  /* ── Department header ── */
  .sp-dept-header {
    font-size: 12px; font-weight: 700; color: #1a3a6e;
    background: #e8eef8; text-align: center;
    letter-spacing: 1px; text-transform: uppercase;
    padding: 4px 10px; margin: 6px 0 0;
    border-top: 1.5px solid #2563a8; border-bottom: 1px solid #b8c6de;
  }

  /* ── Standard lab table — bordered + dashed rows like microbiology ── */
  .sp-lab-table {
    width: 100%; border-collapse: collapse; font-size: 12px;
    border: 1px solid #b8c6de;        /* outer border same as micro table */
  }
  .sp-lab-table thead tr { background: #f0f4fb; border-bottom: 1px solid #b8c6de; }
  .sp-lab-table th {
    padding: 3.5px 6px; text-align: left; font-weight: 700;
    color: #1a3a6e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2px;
  }
  .sp-lab-table td {
    padding: 3px 6px;
    border-bottom: 1px dashed #cdd8ec;  /* dashed — same as microbiology */
    vertical-align: top; color: #111; font-size: 12px;
  }
  .sp-lab-table tbody tr:last-child td { border-bottom: none; }

  .sp-test-name-row td {
    font-weight: 700; color: #1a3a6e;
    padding: 4px 6px 2px; font-size: 12px; background: #f4f7fc;
    border-bottom: 1px solid #b8c6de;  /* solid separator under test group header */
  }
  .sp-subtitle-row td {
    font-weight: 700; font-style: italic; color: #2c4a72;
    padding: 2px 6px 2px 16px; font-size: 12px;
    border-bottom: 1px dashed #cdd8ec;
  }
  .sp-high { color: #c0392b; font-weight: 700; }
  .sp-low  { color: #1558a8; font-weight: 700; }
  .sp-note-row td {
    font-style: italic; color: #777; font-size: 10px;
    padding: 1px 6px 2px 16px; border-bottom: 1px dashed #cdd8ec;
  }
  .sp-verified-text { font-size: 10px; font-style: italic; color: #666; padding: 2px 6px; }
  .sp-outsourced    { font-size: 10px; font-style: italic; color: #888; margin-left: 5px; }

  /* ── Microbiology ── */
  .sp-micro-test-name {
    font-weight: 700; font-size: 12px; padding: 3px 6px;
    color: #1a3a6e; border-left: 3px solid #2563a8;
    margin-bottom: 2px; background: #f4f7fc;
  }
  .sp-micro-info { font-size: 12px; padding-left: 3px; margin-bottom: 3px; }
  .sp-micro-info-row { display: flex; align-items: baseline; margin-bottom: 2px; }
  .sp-micro-info-label { font-weight: 700; min-width: 120px; flex-shrink: 0; color: #333; }
  .sp-micro-info-colon { margin: 0 5px; color: #999; }
  .sp-micro-info-value { color: #111; }

  .sp-micro-table {
    width: 100%; border-collapse: collapse; font-size: 12px;
    border: 1px solid #b8c6de; margin-bottom: 4px;
  }
  .sp-micro-table thead tr { background: #f0f4fb; border-bottom: 1px solid #b8c6de; }
  .sp-micro-table th {
    padding: 3.5px 6px; font-weight: 700; color: #1a3a6e;
    font-size: 12px; text-transform: uppercase; letter-spacing: 0.2px; text-align: left;
  }
  .sp-micro-table th.center { text-align: center; }
  .sp-micro-table td {
    padding: 3px 6px; border-bottom: 1px dashed #cdd8ec;
    vertical-align: top; color: #111; font-size: 12px;
  }
  .sp-micro-table td.center { text-align: center; }
  .sp-micro-table tbody tr:last-child td { border-bottom: none; }

  /* ── Signature block ── */
  .sp-sig-block {
    display: flex; justify-content: flex-end; gap: 40px;
    padding: 5px 10px 3px; margin-top: 4px;
    border-top: 1px dashed #aab4c6;
  }
  .sp-sig-item { text-align: center; min-width: 100px; }
  .sp-sig-img  { height: 34px; max-width: 110px; object-fit: contain; display: block; margin: 0 auto 4px; }
  .sp-sig-name { font-size: 10px; font-weight: 700; color: #111; }
  .sp-sig-title{ font-size: 9px; color: #555; }

  /* ── Footer ── */
  .sp-footer {
    position: absolute; bottom: 8px; left: 0; right: 0;
    font-size: 10px; text-align: center; color: #777;
    line-height: 1.7; border-top: 1px solid #dde3ec; padding-top: 3px;
  }

  /* ── Explained section ── */
  .sp-explained { display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; padding: 0 10px; }
  .sp-explained-col { width: 46%; }
  .sp-explained-title { font-weight: 700; margin-bottom: 30px; color: #1a3a6e; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
  .sp-explained-field { margin-bottom: 40px; color: #333; }

  /* ── End marker ── */
  .sp-end-marker { text-align: center; font-size: 12px; font-weight: 700; color: #444; margin: 8px 0 5px; letter-spacing: 1px; }

  /* ── Loading ── */
  .sp-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100vh;
    background: #f0f4fb; color: #1a3a6e; gap: 14px;
    font-family: 'Source Sans 3', Arial, sans-serif;
  }
  .sp-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(37,99,168,0.15); border-top-color: #2563a8;
    border-radius: 50%; animation: sp-spin 0.8s linear infinite;
  }
`;

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */
const SummaryPrint = () => {
  const { ipNo } = useParams();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  /* Inject CSS */
  useEffect(() => {
    const id = "summary-print-css";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
    return () => {
      document.getElementById("summary-print-css")?.remove();
    };
  }, []);

  /* Fetch data */
  useEffect(() => {
    (async () => {
      const r = await apiRequest(`${HMSURL}get-printsummary/${ipNo}/`, "GET");
      if (r.success) setSummaryData(r.data);
      else {
        alert("Summary not found");
        console.error(r.error);
      }
    })();
  }, [ipNo, HMSURL]);

  const safeStr = (v) => (v != null ? String(v) : "");
  const safeUpper = (v) => (v != null ? String(v).toUpperCase() : "");
  const fmtDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return safeStr(d);
    }
  };
  const fmtTime = (t) => {
    if (!t) return "";
    try {
      return new Date(t).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return safeStr(t);
    }
  };

  /* ── PDF: clone each page to body at fixed px size, capture, remove ── */
  const handlePrint = async () => {
    if (!summaryData) return;
    setLoading(true);
    try {
      const pages = document.querySelectorAll(".preview-page");
      if (!pages.length) {
        alert("No pages found.");
        setLoading(false);
        return;
      }

      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const PAGE_W_MM = 210;
      const PAGE_H_MM = 297;
      const PX_W = 794; /* exactly 210mm @ 96dpi */

      for (let i = 0; i < pages.length; i++) {
        /* Clone into body at fixed position — avoids scrolling / mm-unit issues */
        const original = pages[i];
        const clone = original.cloneNode(true);
        Object.assign(clone.style, {
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: PX_W + "px",
          background: "#ffffff",
          zIndex: "-1",
        });
        document.body.appendChild(clone);

        const canvas = await html2canvas(clone, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: PX_W,
          height: clone.scrollHeight,
          scrollX: 0,
          scrollY: 0,
        });
        document.body.removeChild(clone);

        if (i > 0) doc.addPage();
        const imgData = canvas.toDataURL("image/jpeg", 0.82);
        const imgH_mm = (canvas.height / canvas.width) * PAGE_W_MM;
        doc.addImage(
          imgData,
          "JPEG",
          0,
          0,
          PAGE_W_MM,
          Math.min(imgH_mm, PAGE_H_MM),
        );
      }

      const blob = doc.output("blob");
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (err) {
      console.error("PDF error:", err);
      alert("Error generating PDF: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  const renderPreview = () => {
    if (!summaryData) return null;

    let fieldsData = {};
    try {
      fieldsData =
        typeof summaryData.fieldsData === "string"
          ? JSON.parse(summaryData.fieldsData)
          : summaryData.fieldsData || {};
    } catch {}

    /* ── Signatures ── */
    const signaturesData = summaryData.signatures || [];
    const microSignaturesData = summaryData.micro_signatures || [];

    const DESIG = {
      DESIG101: { position: 0, title: "Consultant Microbiologist" },
      DESIG100: { position: 1, title: "Consultant Pathologist" },
      DESIG099: { position: 2, title: "Consultant Biochemist" },
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

    /* ── Signature block ── */
    const SigBlock = ({ consultants }) => {
      if (!consultants?.length) return null;
      return (
        <div className="sp-sig-block">
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

    /* ── Microbiology test ── */
    const MicroTest = ({ test }) => {
      const valid = (test.parameters || []).filter((p) => p.result !== "Nil");
      return (
        <div style={{ marginBottom: 6 }}>
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
          {valid.length > 0 && (
            <table className="sp-micro-table">
              <thead>
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
            <div className="sp-verified-text">
              Verified by: {test.verified_by}
            </div>
          )}
        </div>
      );
    };

    /* ── Standard test rows ── */
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

    /* ── Lab report ── */
    const LabReport = () => {
      const tests = summaryData.testdetails || [];
      if (!tests.length) return null;
      const micro = tests.filter((t) => t.is_microbiology);
      const std = tests.filter((t) => !t.is_microbiology);
      const byDept = std.reduce((a, t) => {
        const d = t.department || "LABORATORY";
        if (!a[d]) a[d] = [];
        a[d].push(t);
        return a;
      }, {});
      if (micro.length)
        byDept["Microbiology"] = [...(byDept["Microbiology"] || []), ...micro];
      const depts = Object.keys(byDept).sort((a, b) => {
        const ia = DEPT_ORDER.indexOf(a),
          ib = DEPT_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });
      return (
        <div>
          <div className="sp-lab-title">Laboratory Investigation Report</div>
          {depts.map((dept) => {
            const dt = byDept[dept];
            const isMicro = dt.some((t) => t.is_microbiology);
            const vSet = new Set(
              dt.map((t) => (t.verified_by || "").trim()).filter(Boolean),
            );
            const multi = vSet.size > 1;
            const sigs = getDeptConsultants(dt, isMicro);
            return (
              <div key={dept}>
                <div className="sp-dept-header">{dept.toUpperCase()}</div>
                {isMicro ? (
                  <div>
                    {dt.map((t, ti) =>
                      t.is_microbiology ? (
                        <MicroTest key={ti} test={t} />
                      ) : (
                        <table key={ti} className="sp-lab-table">
                          <tbody>
                            <StdRows test={t} multi={multi} />
                          </tbody>
                        </table>
                      ),
                    )}
                    <SigBlock consultants={sigs} />
                  </div>
                ) : (
                  <div>
                    <table className="sp-lab-table">
                      <thead>
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
                      </tbody>
                    </table>
                    {!multi && vSet.size > 0 && (
                      <div
                        className="sp-verified-text"
                        style={{ paddingLeft: 5 }}
                      >
                        Verified by: {Array.from(vSet).join(", ")}
                      </div>
                    )}
                    <SigBlock consultants={sigs} />
                  </div>
                )}
              </div>
            );
          })}
          <div className="sp-end-marker">— End of Laboratory Report —</div>
        </div>
      );
    };

    /* ── Section renderer ── */
    const renderSection = (title, content) => {
      if (!content) return null;
      const isInvest =
        title === "INVESTIGATIONS" && summaryData.testdetails?.length > 0;
      return (
        <div key={title} className="sp-section">
          <div className="sp-section-title">{title}</div>
          <div className="sp-section-content">{content}</div>
          {isInvest && <LabReport />}
        </div>
      );
    };

    /* ── Page distribution ── */
    const SECTION_ORDER = [
      "DOA AND DOD",
      "DISCHARGE TYPE",
      "DISCHARGE DIAGNOSIS",
      "CONSULTANT",
      "BRIEF HISTORY",
      "SIGNIFICANT PAST MEDICAL AND SURGICAL HISTORY",
      "GENERAL EXAMINATION",
      "VITALS",
      "COURSE IN THE HOSPITAL",
      "ONCOLOGY NOTES",
      "VACCINATION HISTORY",
      "SURGERIES / PROCEDURES PERFORMED",
      "SPECIFIC MEDICATION GIVEN DURING HOSPITAL STAY",
      "SURGICAL NOTES",
      "INVESTIGATIONS",
      "CONDITION ON DISCHARGE",
      "ADMISSION DIAGNOSIS",
      "ADVICE ON DISCHARGE",
    ];
    const allSections = SECTION_ORDER.map((k) =>
      renderSection(k, fieldsData[k]),
    ).filter(Boolean);

    const distribute = () => {
      const pages = [];
      let cur = [],
        h = 0;
      allSections.forEach((s) => {
        const c = s.props?.children?.[1]?.props?.children || "";
        const lns = typeof c === "string" ? c.split("\n").length : 1;
        const lab =
          s.key === "INVESTIGATIONS" && summaryData.testdetails?.length > 0;
        const est = 8 + lns * 5.5 + (lab ? 140 : 0);
        const max = pages.length === 0 ? 210 : 250;
        if (h + est > max && cur.length) {
          pages.push([...cur]);
          cur = [s];
          h = est;
        } else {
          cur.push(s);
          h += est;
        }
      });
      if (cur.length) pages.push(cur);
      return pages;
    };

    const dist = distribute();
    const p1 = dist[0] || [];
    const p2 = dist[1] || [];
    const p3 = dist[2] || [];
    const p4 = dist.slice(3).flat();

    /* ── Sub-components ── */
    const Footer = () => (
      <div className="sp-footer">
        <div>In case of Emergency contact 0427 - 2706666 in Casualty OP</div>
        <div>அவசர உதவிக்கு அழைக்கவும் : 0427 - 2706666</div>
      </div>
    );

    const InfoRow = ({ label, value }) => (
      <div className="sp-info-row">
        <span className="sp-info-label">{label}</span>
        <span className="sp-info-colon">:</span>
        <span className="sp-info-value">{value}</span>
      </div>
    );

    const PatientGrid = () => (
      <>
        <div className="sp-doc-title">
          {safeStr(summaryData.summaryType) || "DISCHARGE SUMMARY"}
        </div>
        <div className="sp-info-grid">
          <InfoRow label="Name" value={safeStr(summaryData.patient)} />
          <InfoRow
            label="Age / Gender"
            value={`${safeStr(summaryData.age)} Yrs / ${safeUpper(summaryData.gender)}`}
          />
          <InfoRow label="UHID" value={safeStr(summaryData.uhid)} />
          <InfoRow label="Consultant" value={safeStr(summaryData.doctor)} />
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
            <InfoRow label="Mobile" value={safeStr(summaryData.mobilePhone)} />
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
      </>
    );

    const ContHeader = () => (
      <div className="sp-cont-header">
        {[
          ["Name", safeStr(summaryData.patient)],
          ["IP No", safeStr(summaryData.ipNo)],
          ["UHID", safeStr(summaryData.uhid)],
          [
            "Age / Gender",
            `${safeStr(summaryData.age)} Yrs / ${safeUpper(summaryData.gender)}`,
          ],
          summaryData.mobilePhone
            ? ["Mobile", safeStr(summaryData.mobilePhone)]
            : null,
          summaryData.address
            ? ["Address", safeStr(summaryData.address)]
            : null,
        ]
          .filter(Boolean)
          .map(([lbl, val]) => (
            <div key={lbl} className="sp-cont-row">
              <span className="sp-info-label">{lbl}</span>
              <span className="sp-info-colon">:</span>
              <span>{val}</span>
            </div>
          ))}
      </div>
    );

    /* Page wrapper — no docSig prop needed anymore */
    const Page = ({ children }) => (
      <div className="preview-page">
        <div className="sp-content">
          {children}
          <Footer />
        </div>
      </div>
    );

    return (
      <div className="sp-shell">
        {/* Action bar */}
        <div className="sp-bar">
          <div>
            <div className="sp-bar-title">Discharge Summary Preview</div>
            <div className="sp-bar-sub">
              {safeStr(summaryData.patient)}&nbsp;&nbsp;·&nbsp;&nbsp;IP No:{" "}
              {safeStr(summaryData.ipNo)}
            </div>
          </div>
          <button
            className="sp-btn sp-btn-primary"
            onClick={handlePrint}
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
        </div>

        <div className="sp-pages">
          {/* PAGE 1 */}
          <Page>
            <img src={SummaryHead} alt="Header" className="sp-header-img" />
            <PatientGrid />
            <div className="sp-body" style={{ paddingBottom: 70 }}>
              {p1}
            </div>
          </Page>

          {/* PAGE 2 */}
          {p2.length > 0 && (
            <Page>
              <ContHeader />
              <div className="sp-body" style={{ paddingBottom: 70 }}>
                {p2}
              </div>
            </Page>
          )}

          {/* PAGE 3 */}
          {p3.length > 0 && (
            <Page>
              <ContHeader />
              <div className="sp-body" style={{ paddingBottom: 70 }}>
                {p3}
              </div>
            </Page>
          )}

          {/* EXTRA PAGES */}
          {p4.length > 0 && (
            <Page>
              <ContHeader />
              <div className="sp-body" style={{ paddingBottom: 70 }}>
                {p4}
              </div>
            </Page>
          )}

          {/* SIGNATURE PAGE */}
          <Page>
            <ContHeader />
            <div className="sp-body">
              <div className="sp-explained">
                <div className="sp-explained-col">
                  <div className="sp-explained-title">Explained By</div>
                  <div className="sp-explained-field">Doctor Name :</div>
                  <div className="sp-explained-field">Signature :</div>
                </div>
                <div className="sp-explained-col">
                  <div className="sp-explained-title">
                    Explained To Patient / Attender
                  </div>
                  <div className="sp-explained-field">Name :</div>
                  <div className="sp-explained-field">Signature :</div>
                </div>
              </div>
            </div>
          </Page>
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

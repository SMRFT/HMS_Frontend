import React, { useEffect, useState, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const spin = keyframes`to{transform:rotate(360deg)}`;
const slideIn = keyframes`from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: #f4f6f9;
  padding: 1.5rem 2rem;
  font-family: "Segoe UI", sans-serif;
`;
const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.2rem;
`;
const Title = styled.h1`
  font-size: 1.3rem;
  font-weight: 800;
  color: #00695c;
  margin: 0;
`;
const Row = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: flex-end;
`;
const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
`;
const Lbl = styled.label`
  font-size: 0.67rem;
  font-weight: 700;
  color: #00897b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const DateInput = styled.input`
  padding: 0.38rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #444;
  background: white;
  &:focus {
    outline: none;
    border-color: #00897b;
  }
`;
const Select = styled.select`
  padding: 0.38rem 0.6rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #444;
  background: white;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #00897b;
  }
`;
const Btn = styled.button`
  padding: 0.4rem 1.1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  background: ${(p) => p.bg || "#00897b"};
  color: ${(p) => p.color || "white"};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.15s;
  &:hover:not(:disabled) {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
`;
const StatsRow = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;
const Stat = styled.div`
  flex: 1;
  min-width: 80px;
  background: white;
  border-left: 3px solid ${(p) => p.accent || "#ccc"};
  border-radius: 10px;
  padding: 0.5rem 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
`;
const StatNum = styled.span`
  font-size: 1.2rem;
  font-weight: 800;
  color: ${(p) => p.color || "#333"};
`;
const StatLbl = styled.span`
  font-size: 0.62rem;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  overflow: hidden;
  animation: ${fadeIn} 0.35s ease;
`;
const TWrap = styled.div`
  overflow-x: auto;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.77rem;
  min-width: 1100px;
`;
const THead = styled.thead`
  background: linear-gradient(135deg, #00897b, #00695c);
  color: white;
  position: sticky;
  top: 0;
  z-index: 2;
`;
const Th = styled.th`
  padding: 0.65rem 0.6rem;
  text-align: center;
  font-size: 0.69rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  white-space: nowrap;
  &:last-child {
    border-right: none;
  }
`;
const Tr = styled.tr`
  border-bottom: 1px solid #f0f4f3;
  transition: background 0.1s;
  &:hover {
    background: #f0faf8;
  }
  &:nth-child(even) {
    background: #fafffe;
    &:hover {
      background: #f0faf8;
    }
  }
`;
const Td = styled.td`
  padding: 0.5rem 0.6rem;
  vertical-align: middle;
  text-align: center;
  color: #333;
  font-size: 0.75rem;
  border-right: 1px solid #f0f0f0;
  &:last-child {
    border-right: none;
  }
`;
const AddrTd = styled(Td)`
  text-align: left;
  max-width: 170px;
  font-size: 0.71rem;
  line-height: 1.45;
  word-break: break-word;
`;

const Input = styled.input`
  width: 100%;
  min-width: 58px;
  padding: 0.28rem 0.42rem;
  border: 1.5px solid
    ${(p) => (p.$dirty ? "#ff9800" : p.$saved ? "#00897b" : "#e0e0e0")};
  border-radius: 6px;
  font-size: 0.73rem;
  background: ${(p) => (p.$dirty ? "#fffde7" : p.$saved ? "#f0faf8" : "white")};
  text-align: center;
  box-sizing: border-box;
  transition: border-color 0.15s;
  &:focus {
    outline: none;
    border-color: #00897b;
    background: white;
  }
  &:disabled {
    opacity: 0.5;
  }
`;
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${(p) =>
    p.$s === "saved"
      ? "linear-gradient(135deg,#00897b,#00695c)"
      : p.$s === "pending"
        ? "linear-gradient(135deg,#ff9800,#e65100)"
        : "#ccc"};
  color: white;
  font-size: 0.64rem;
  font-weight: 800;
  padding: 0.17rem 0.48rem;
  border-radius: 20px;
  min-width: 34px;
`;
const IconBtn = styled.button`
  width: 27px;
  height: 27px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  background: ${(p) => p.bg || "#e8f5e9"};
  color: ${(p) => p.color || "#2e7d32"};
  transition: all 0.12s;
  &:hover:not(:disabled) {
    filter: brightness(0.88);
    transform: scale(1.08);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;
const Spn = styled.span`
  width: 11px;
  height: 11px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: ${spin} 0.7s linear infinite;
`;
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;
const Dialog = styled.div`
  background: white;
  border-radius: 14px;
  padding: 1.5rem 2rem;
  max-width: 340px;
  width: 90%;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  animation: ${slideIn} 0.18s ease;
  text-align: center;
`;
const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #00897b;
  font-weight: 700;
  animation: ${pulse} 1.4s ease infinite;
`;
const Empty = styled.div`
  text-align: center;
  padding: 3rem;
  color: #aaa;
  font-size: 0.9rem;
`;
const Hint = styled.div`
  font-size: 0.69rem;
  color: #bbb;
  text-align: right;
  margin-top: 0.7rem;
  @media print {
    display: none;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split("T")[0];
const thisMonth = () => new Date().toISOString().slice(0, 7);

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fmt = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return v;
  }
};

const fmtMonthYear = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
};

// Accent color per type
const TYPE_ACCENT = {
  ANC: "#00897b",
  GENERAL: "#1565c0",
  CARDIAC: "#c62828",
  DOPPLER: "#6a1b9a",
  OBSTETRIC: "#2e7d32",
};
const typeAccent = (t) => TYPE_ACCENT[t] || "#607d8b";

// ─── Lookup helper for type counts (case-insensitive, multi-key) ──────────────
const getCount = (typeCounts, ...keys) => {
  for (const k of keys) {
    const found = Object.entries(typeCounts).find(
      ([t]) => t.toUpperCase() === k.toUpperCase(),
    );
    if (found && found[1]) return found[1];
  }
  return "";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function JRDReport() {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterMode, setFilterMode] = useState("date"); // "date" | "month"
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [month, setMonth] = useState(thisMonth);

  // ── Data state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [typeCounts, setTypeCounts] = useState({});
  const [generalGenderCounts, setGeneralGenderCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  // ── JRD field state ───────────────────────────────────────────────────────
  const [fields, setFields] = useState({});
  const [meta, setMeta] = useState({});
  const [saving, setSaving] = useState(new Set());
  const [deleting, setDeleting] = useState(new Set());
  const [confirm, setConfirm] = useState(null);

  const fieldsRef = useRef(fields);
  const metaRef = useRef(meta);
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);
  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  // ── Build query params based on filter mode ───────────────────────────────
  const buildParams = useCallback(() => {
    if (filterMode === "month") {
      return `filter_mode=month&month=${month}`;
    }
    return `filter_mode=date&from_date=${fromDate}&to_date=${toDate}`;
  }, [filterMode, fromDate, toDate, month]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setRows([]);
    setFields({});
    setMeta({});
    setTypeCounts({});
    setTotalCount(0);
    try {
      const params = buildParams();
      const anc = await apiRequest(`${HMSURL}anc-register/?${params}`, "GET");

      if (!anc.success) {
        toast.error(anc.error || "Failed to fetch ANC");
        return;
      }

      const ancData = anc.data?.data ?? anc.data ?? [];
      const typeCnts = anc.data?.type_counts ?? {};
      const genGender = anc.data?.general_gender_counts ?? {};
      const total = anc.data?.total ?? ancData.length;

      setRows(ancData);
      setTypeCounts(typeCnts);
      setGeneralGenderCounts(genGender);
      setTotalCount(total);

      const jrd = await apiRequest(`${HMSURL}jrd-reports/?${params}`, "GET");
      if (jrd.success && Array.isArray(jrd.data)) {
        const m = {},
          f = {};
        jrd.data.forEach((j) => {
          const k = `${j.investBillNo}_${j.item_id}`;
          m[k] = {
            jrd_id: j.jrd_id,
            saved: true,
            savedFormNo: j.form_no || "",
            savedMtpAdvice: j.mtp_advice || "",
          };
          f[k] = { formNo: j.form_no || "", mtpAdvice: j.mtp_advice || "" };
        });
        setMeta(m);
        setFields(f);
      }
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [HMSURL, buildParams]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const get = (key, f) => fields[key]?.[f] ?? "";

  const isDirty = (key) => {
    const m = metaRef.current[key];
    const fn = (fieldsRef.current[key]?.formNo ?? "").trim();
    const ma = (fieldsRef.current[key]?.mtpAdvice ?? "").trim();
    if (!m?.saved) return !!(fn || ma);
    return fn !== (m.savedFormNo ?? "") || ma !== (m.savedMtpAdvice ?? "");
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = useCallback(
    async (row) => {
      const key = row.key;
      const formNo = (fieldsRef.current[key]?.formNo ?? "").trim();
      const mtpAdvice = (fieldsRef.current[key]?.mtpAdvice ?? "").trim();

      if (!formNo && !mtpAdvice) {
        toast.warn("Enter Form No. or MTP Advice before saving.");
        return;
      }

      const m = metaRef.current[key];
      setSaving((p) => new Set(p).add(key));
      try {
        if (m?.saved && m?.jrd_id) {
          const r = await apiRequest(
            `${HMSURL}jrd-reports/update/${m.jrd_id}/`,
            "PATCH",
            { form_no: formNo, mtp_advice: mtpAdvice },
          );
          if (!r.success) {
            toast.error(r.error || "Update failed");
            return;
          }
          setMeta((p) => ({
            ...p,
            [key]: {
              ...p[key],
              savedFormNo: formNo,
              savedMtpAdvice: mtpAdvice,
            },
          }));
          toast.success(`✅ JRD-${m.jrd_id} updated`);
        } else {
          const r = await apiRequest(`${HMSURL}jrd-reports/create/`, "POST", {
            investBillNo: row.investBillNo,
            item_id: parseInt(row.item_id, 10),
            form_no: formNo,
            mtp_advice: mtpAdvice,
          });
          if (!r.success) {
            if (r.status === 409 && r.data?.jrd_id) {
              const id = r.data.jrd_id;
              const p2 = await apiRequest(
                `${HMSURL}jrd-reports/update/${id}/`,
                "PATCH",
                { form_no: formNo, mtp_advice: mtpAdvice },
              );
              if (p2.success) {
                setMeta((p) => ({
                  ...p,
                  [key]: {
                    jrd_id: id,
                    saved: true,
                    savedFormNo: formNo,
                    savedMtpAdvice: mtpAdvice,
                  },
                }));
                toast.success(`✅ JRD-${id} updated`);
              } else {
                toast.error("Update failed");
              }
              return;
            }
            toast.error(r.error || "Create failed");
            return;
          }
          const newId = r.data?.jrd_id;
          setMeta((p) => ({
            ...p,
            [key]: {
              jrd_id: newId,
              saved: true,
              savedFormNo: formNo,
              savedMtpAdvice: mtpAdvice,
            },
          }));
          toast.success(`✅ JRD-${newId} created`);
        }
      } catch (e) {
        console.error("save error", e);
        toast.error("Unexpected error");
      } finally {
        setSaving((p) => {
          const s = new Set(p);
          s.delete(key);
          return s;
        });
      }
    },
    [HMSURL],
  );

  const onChange = (key, field, val) => {
    setFields((p) => ({ ...p, [key]: { ...(p[key] || {}), [field]: val } }));
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const askDelete = (row) => {
    const m = metaRef.current[row.key];
    if (!m?.saved) {
      setFields((p) => {
        const n = { ...p };
        delete n[row.key];
        return n;
      });
      setMeta((p) => {
        const n = { ...p };
        delete n[row.key];
        return n;
      });
      return;
    }
    setConfirm({ key: row.key, jrd_id: m.jrd_id });
  };

  const doDelete = async () => {
    const { key, jrd_id } = confirm;
    setConfirm(null);
    setDeleting((p) => new Set(p).add(key));
    try {
      const r = await apiRequest(
        `${HMSURL}jrd-reports/delete/${jrd_id}/`,
        "DELETE",
      );
      if (!r.success) {
        toast.error(r.error || "Delete failed");
        return;
      }
      setFields((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      setMeta((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      toast.success(`🗑️ JRD-${jrd_id} deleted`);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting((p) => {
        const s = new Set(p);
        s.delete(key);
        return s;
      });
    }
  };

  // ── Counts ────────────────────────────────────────────────────────────────
  const savedCount = Object.values(meta).filter((m) => m.saved).length;
  const pendingCount = rows.length - savedCount;

  // ── Print label ───────────────────────────────────────────────────────────
  const printLabel =
    filterMode === "month"
      ? fmtMonthYear(month).toUpperCase()
      : `${fmt(fromDate)} – ${fmt(toDate)}`;

  // ── Print: open a new window and write HTML directly ─────────────────────
  const handlePrint = () => {
    // ── MTP count: rows that have a non-NIL, non-empty MTP advice ──────────
    const mtpCount = rows.filter((r) => {
      const ma = (fields[r.key]?.mtpAdvice || meta[r.key]?.savedMtpAdvice || "")
        .trim()
        .toUpperCase();
      return ma && ma !== "NIL" && ma !== "—" && ma !== "\u2014";
    }).length;

    // ── Form-F count = all ANC rows (rows array = ANC-only from API) ────────
    const formFCount = rows.length;

    // ── Form-G count = total scans minus ANC ───────────────────────────────
    const ancCount = getCount(typeCounts, "ANC") || 0;
    const formGCount = (totalCount || 0) - Number(ancCount);

    // ── Individual type counts for Form-A table ────────────────────────────
    // MALE columns (2)
    // Male > Abdomen  → general_gender_counts.Male  (General scans done on males)
    // Male > Cardiac  → typeCounts["CARDIAC"]
    const cMaleAbdomen = generalGenderCounts.Male || "—";
    const cCardiac = getCount(typeCounts, "CARDIAC") || "—";

    // FEMALE columns (4)
    // Female > Abdomen          → general_gender_counts.Female (General scans done on females)
    // Female > Ante-natal       → typeCounts["ANC"] (and variants)
    // Female > Pre-conseption ie.,follicular studies uterus studies → FOLLICULAR STUDY
    // Female > Trans vaginal studies → TRANSVAGINAL STUDIES
    const cFemaleAbdomen = generalGenderCounts.Female || "—";
    const cAnteNatal =
      getCount(
        typeCounts,
        "ANC",
        "ANTE-NATAL",
        "OBSTETRIC",
        "EARLY OBSTETRIC ULTRASOUND",
      ) || "—";
    const cPreConseption =
      getCount(
        typeCounts,
        "FOLLICULAR STUDY",
        "FOLLICULAR",
        "PRE-CONSEPTION",
      ) || "—";
    const cTransvag =
      getCount(typeCounts, "TRANSVAGINAL STUDIES", "TRANSVAGINAL") || "—";

    // COMMON columns (3)
    // Doppler Study | Other ultrasound studies | Small parts
    const cDoppler = getCount(typeCounts, "DOPPLER") || "—";
    const cSmallPart = getCount(typeCounts, "SMALL PART", "SMALL PARTS") || "—";
    // "Other" = everything not in any named column
    const knownTypes = new Set([
      "ANC",
      "ANTE-NATAL",
      "OBSTETRIC",
      "EARLY OBSTETRIC ULTRASOUND",
      "GENERAL",
      "ABDOMEN",
      "CARDIAC",
      "FOLLICULAR STUDY",
      "FOLLICULAR",
      "PRE-CONSEPTION",
      "TRANSVAGINAL STUDIES",
      "TRANSVAGINAL",
      "DOPPLER",
      "SMALL PART",
      "SMALL PARTS",
    ]);
    const cOther =
      Object.entries(typeCounts)
        .filter(([t]) => !knownTypes.has(t.toUpperCase()))
        .reduce((s, [, v]) => s + v, 0) || "—";

    // ── Page 2 rows HTML ───────────────────────────────────────────────────
    // Sort rows by scanDate ascending for the proforma table
    const sortedRows = [...rows].sort(
      (a, b) => new Date(a.scanDate) - new Date(b.scanDate),
    );

    const proformaRowsHtml = sortedRows
      .map((row, idx) => {
        const key = row.key;
        const m = meta[key];

        // Form No: prefer saved JRD form_no, then unsaved field entry
        const formNo =
          (fields[key]?.formNo || m?.savedFormNo || "").trim() || "—";

        // MTP advice: prefer saved, then unsaved, then default NIL
        const mtpAdv =
          (fields[key]?.mtpAdvice || m?.savedMtpAdvice || "NIL").trim() ||
          "NIL";

        // Address block
        const nameLine = row.patientName || "";
        const spouseLine = row.spouseName?.trim()
          ? `W/O ${row.spouseName.trim()}`
          : "";
        const addrLine = row.address || "";
        const phoneLine = row.phone ? `PH: ${row.phone}` : "";

        const addrHtml = [nameLine, spouseLine, addrLine, phoneLine]
          .filter(Boolean)
          .join("<br/>");

        return `<tr>
          <td>${idx + 1}</td>
          <td>${fmt(row.scanDate)}</td>
          <td>${formNo}</td>
          <td class="addr">${addrHtml}</td>
          <td>${(row.maritalStatus || "—").toUpperCase()}</td>
          <td>${row.guh || "—"}</td>
          <td>${row.referredByDr || "—"}</td>
          <td>${row.receivedByDr || "—"}</td>
          <td>${row.lmp || "—"}</td>
          <td>${row.gestAge || "—"}</td>
          <td>${mtpAdv}</td>
        </tr>`;
      })
      .join("");

    // ── Full HTML ──────────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>JRD Print — ${printLabel}</title>
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
    body { font-family: "Times New Roman", serif; font-size: 10pt; margin: 0; padding: 0; }

    /* ══════════════════ PAGE 1 : FORM-A ══════════════════ */
    .form-a { padding: 1.2cm 1.5cm; page-break-after: always; }

    .form-a .main-title {
      text-align: center; font-size: 14pt; font-weight: bold;
      text-decoration: underline; margin: 0 0 4pt;
    }
    .form-a .sub-title {
      text-align: center; font-size: 10pt; font-weight: bold; margin: 0 0 3pt;
    }
    .form-a .monthly-line {
      text-align: center; font-size: 10pt; color: #c00;
      text-decoration: underline; margin: 0 0 10pt;
    }
    .form-a .monthly-line .month-val { font-weight: bold; }

    /* centre info block */
    .centre-block {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin: 0 0 8pt;
    }
    .centre-block .centre-left { font-size: 10pt; }
    .centre-block .centre-left .centre-name {
      font-weight: bold; font-size: 10.5pt;
    }
    .centre-block .regd { font-size: 10pt; font-weight: bold; }

    /* form counts row */
    .form-counts-row {
      display: flex; justify-content: space-between;
      font-weight: bold; font-size: 10pt; margin-bottom: 6pt;
    }
    .form-counts-row .val { color: #c00; }

    /* ── FORM-A scan table ── */
    .form-a table {
      width: 100%; border-collapse: collapse; font-size: 8.5pt;
    }
    .form-a th, .form-a td {
      border: 1px solid #000; padding: 3pt 4pt;
      text-align: center; vertical-align: middle;
    }
    .sec-hdr { background: #000; color: #fff; font-weight: bold; }

    /* vertical text for column headers */
    .rot {
      writing-mode: vertical-lr;
      transform: rotate(180deg);
      font-size: 7.5pt;
      white-space: nowrap;
      display: inline-block;
      min-height: 60pt;
    }

    .bold-red { color: #c00; font-weight: bold; }

    /* procedure label cell */
    .proc-label { font-weight: bold; text-align: left; padding-left: 4pt; }

    /* other procedure section */
    .other-hdr {
      font-weight: bold; text-align: center; font-size: 9pt;
      margin: 8pt 0 4pt;
    }

    /* sign / note */
    .sign-row { display: flex; justify-content: space-between; margin-top: 18pt; }
    .note { font-size: 8.5pt; margin-top: 18pt; }
    .note u { text-decoration: underline; }

    /* ══════════════════ PAGE 2 : PROFORMA ══════════════════ */
    .proforma { padding: 0.8cm 1cm; }

    .proforma .p-title {
      text-align: center; font-size: 11.5pt; font-weight: bold;
      text-decoration: underline; text-transform: uppercase; margin: 0 0 2pt;
    }
    .proforma .p-subtitle {
      text-align: center; font-size: 11pt; font-weight: bold; margin: 0 0 2pt;
    }
    .proforma .p-month {
      text-align: center; font-size: 11pt; font-weight: bold;
      color: #c00; margin: 0 0 2pt;
    }
    .proforma .p-info {
      text-align: center; font-size: 10pt; margin: 0 0 1pt;
    }

    .proforma table {
      width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-top: 8pt;
    }
    .proforma th {
      border: 1px solid #000; padding: 3pt 3pt;
      text-align: center; background: #e8e8e8;
      font-weight: bold; font-size: 7pt;
      vertical-align: middle;
    }
    .proforma td {
      border: 1px solid #000; padding: 3pt 3pt;
      text-align: center; vertical-align: middle;
    }
    .proforma td.addr {
      text-align: left; font-size: 7pt; line-height: 1.45;
    }

    @media print {
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>

<!-- ═══════════════════ PAGE 1: FORM-A ═══════════════════ -->
<div class="form-a">

  <p class="main-title">FORM – A</p>
  <p class="sub-title">Pre – Natal Diagnostic Techniques (Regulation and prevention of misuse Act 1994)</p>
  <p class="monthly-line">
    Monthly report to be submitted to the appropriate authority, Salem District for the month of
    <span class="month-val">${printLabel}.</span>
  </p>

  <div class="centre-block">
    <div class="centre-left">
      <strong>Name of the scan centre:</strong>
      <span class="centre-name"> Shanmuga Hospital</span><br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;24, Saradha college road,<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Salem – 636 007,
    </div>
    <div class="regd">Regd.No: PNA / 381 / 99</div>
  </div>

  <div class="form-counts-row">
    <span>NO OF FORM – F – OBTAINED: &nbsp;<span class="val">${formFCount}</span></span>
    <span>NO OF FORM – G – OBTAINED: &nbsp;<span class="val">${formGCount || "—"}</span></span>
  </div>

  <!-- ── Ultrasound Procedure Table ── -->
  <!--
    Column layout (matches image exactly):
    Label | Male×2 | Female×4 | Common×3  = 10 data cols + 1 label = 11 total
    Male:   Abdomen | Cardiac
    Female: Abdomen | Ante-natal | Pre-conseption ie.,follicular studies uterus studies | Trans vaginal studies
    Common: Doppler Study | Other ultrasound studies | Small parts
  -->
  <table>
    <colgroup>
      <col style="width:13%"/>
      <!-- Male (2) -->
      <col style="width:7%"/><col style="width:7%"/>
      <!-- Female (4) -->
      <col style="width:7%"/><col style="width:7%"/><col style="width:12%"/><col style="width:8%"/>
      <!-- Common (3) -->
      <col style="width:10%"/><col style="width:11%"/><col style="width:7%"/>
    </colgroup>
    <tbody>

      <!-- ── Row 1: section labels ── -->
      <tr>
        <td rowspan="2" style="font-weight:bold;text-align:center;vertical-align:middle;font-size:9pt;border:1px solid #000;">
          ULTRA SOUND<br/>PROCEDURE
        </td>
        <td colspan="2" style="border:1px solid #000;text-align:center;font-weight:bold;font-size:9pt;vertical-align:middle;">Male</td>
        <td colspan="4" style="border:1px solid #000;text-align:center;font-weight:bold;font-size:9pt;vertical-align:middle;">Female</td>
        <td colspan="3" style="border:1px solid #000;"></td>
      </tr>

      <!-- ── Row 2: column headers (vertical text) ── -->
      <tr>
        <!-- Male cols -->
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Abdomen</span>
        </td>
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Cardiac</span>
        </td>
        <!-- Female cols -->
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Abdomen</span>
        </td>
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Ante - natal</span>
        </td>
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Pre-conseption ie.,follicular studies uterus studies</span>
        </td>
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Trans vaginal studies</span>
        </td>
        <!-- Common cols -->
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Doppler Study</span>
        </td>
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Other ultrasound studies</span>
        </td>
        <td style="border:1px solid #000;vertical-align:bottom;text-align:center;">
          <span class="rot">Small parts</span>
        </td>
      </tr>

      <!-- ── Row 3: No. of Cases data ── -->
      <tr>
        <td class="proc-label" style="border:1px solid #000;">No. of Cases</td>
        <!-- Male -->
        <td class="bold-red" style="border:1px solid #000;">${cMaleAbdomen}</td>
        <td class="bold-red" style="border:1px solid #000;">${cCardiac}</td>
        <!-- Female -->
        <td class="bold-red" style="border:1px solid #000;">${cFemaleAbdomen}</td>
        <td class="bold-red" style="border:1px solid #000;">${cAnteNatal}</td>
        <td class="bold-red" style="border:1px solid #000;">${cPreConseption}</td>
        <td class="bold-red" style="border:1px solid #000;">${cTransvag}</td>
        <!-- Common -->
        <td class="bold-red" style="border:1px solid #000;">${cDoppler}</td>
        <td class="bold-red" style="border:1px solid #000;">${cOther}</td>
        <td class="bold-red" style="border:1px solid #000;">${cSmallPart}</td>
      </tr>

    </tbody>
  </table>

  <!-- ── Other Procedure Advised ── -->
  <p class="other-hdr">OTHER PROCEDURE ADVISED</p>
  <table>
    <tbody>
      <tr>
        <td><span class="rot">Aminocen tesis</span></td>
        <td><span class="rot">Cholionic villi biopsy</span></td>
        <td><span class="rot">Foetal skin biopsy</span></td>
        <td><span class="rot">Cordentes is</span></td>
        <td><span class="rot">Any other</span></td>
        <td><span class="rot">ChrSomosomal Studies</span></td>
        <td><span class="rot">Biochemical studies</span></td>
        <td><span class="rot">Molecular studies</span></td>
        <td><span class="rot">No. Of MTP advised</span></td>
      </tr>
      <tr>
        <td>—</td><td>—</td><td>—</td><td>—</td><td>—</td>
        <td>—</td><td>—</td><td>—</td>
        <td class="bold-red">${mtpCount || "NIL"}</td>
      </tr>
    </tbody>
  </table>

  <div class="sign-row">
    <div><strong>Date and Seal of Genetic Clinic / Hospital:</strong></div>
    <div><strong>Doctor's Signature</strong></div>
  </div>

  <div class="note">
    <u><strong>Note:</strong></u> Report should be submitted within 5<sup>th</sup> day of the following to the concerned appropriate Authority.
  </div>
</div>


<!-- ═══════════════════ PAGE 2: ANTE-NATAL PROFORMA ═══════════════════ -->
<div class="proforma">

  <p class="p-title">Ante – Natal Proforma to be submitted to the Appropriate Authority</p>
  <p class="p-subtitle">Salem District for the Month of</p>
  <p class="p-month">${printLabel}</p>
  <p class="p-info"><strong>REGD.NO: PNA / 381 / 99</strong></p>
  <p class="p-info"><strong>SHANMUGA HOSPITAL</strong></p>
  <p class="p-info">24, SARADHA COLLEGE ROAD, SALEM – 636 007,</p>

  <table>
    <thead>
      <tr>
        <th style="width:3%">S.NO</th>
        <th style="width:7%">DATE OF<br/>SCANNING</th>
        <th style="width:6%">S. NO OF<br/>FORM - F</th>
        <th style="width:22%">NAME &amp; ADDRESS</th>
        <th style="width:7%">MARITAL<br/>STATUS</th>
        <th style="width:5%">NO OF<br/>CHILDREN<br/>(GUH)</th>
        <th style="width:11%">REFERRED BY<br/>DR. NAME</th>
        <th style="width:11%">RECEIVED BY<br/>DR. NAME</th>
        <th style="width:7%">LMP</th>
        <th style="width:6%">GESTATIONAL<br/>AGE</th>
        <th style="width:8%">MTP ADVICE<br/>IF ANY</th>
      </tr>
    </thead>
    <tbody>
      ${proformaRowsHtml}
    </tbody>
  </table>

</div>

</body>
</html>`;

    const pw = window.open("", "_blank", "width=1100,height=750");
    if (!pw) {
      alert(
        "Pop-up blocked! Please allow pop-ups for this site and try again.",
      );
      return;
    }
    pw.document.write(html);
    pw.document.close();
    pw.focus();
    pw.onload = () => {
      pw.print();
    };
    setTimeout(() => {
      try {
        pw.print();
      } catch (e) {}
    }, 600);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Page>
      {/* ─── Confirm Delete ─────────────────────────────────────────────────── */}
      {confirm && (
        <Overlay onClick={() => setConfirm(null)}>
          <Dialog onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "1.8rem", marginBottom: ".4rem" }}>🗑️</div>
            <h3 style={{ margin: "0 0 .4rem", color: "#b71c1c" }}>
              Delete JRD-{confirm.jrd_id}?
            </h3>
            <p
              style={{
                fontSize: ".8rem",
                color: "#666",
                margin: "0 0 1.2rem",
                lineHeight: 1.5,
              }}
            >
              Record will be soft-deleted and preserved for audit.
            </p>
            <div
              style={{
                display: "flex",
                gap: ".6rem",
                justifyContent: "center",
              }}
            >
              <Btn
                bg="linear-gradient(135deg,#ef5350,#b71c1c)"
                onClick={doDelete}
              >
                Yes, Delete
              </Btn>
              <Btn bg="#e0e0e0" color="#333" onClick={() => setConfirm(null)}>
                Cancel
              </Btn>
            </div>
          </Dialog>
        </Overlay>
      )}

      {/* ─── Top bar ────────────────────────────────────────────────────────── */}
      <TopBar className="no-print">
        <Title>🤰 ANC Register</Title>
        <Row>
          <Group>
            <Lbl>Filter By</Lbl>
            <Select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
            >
              <option value="date">Date Range</option>
              <option value="month">Month</option>
            </Select>
          </Group>

          {filterMode === "date" ? (
            <>
              <Group>
                <Lbl>From</Lbl>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Group>
              <Group>
                <Lbl>To</Lbl>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Group>
            </>
          ) : (
            <Group>
              <Lbl>Month</Lbl>
              <DateInput
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </Group>
          )}

          <Btn onClick={fetchAll} disabled={loading}>
            {loading ? "Loading…" : "🔍 Fetch"}
          </Btn>
          <Btn
            bg="linear-gradient(135deg,#ff7043,#e64a19)"
            onClick={handlePrint}
            disabled={!rows.length}
          >
            🖨️ Print
          </Btn>
        </Row>
      </TopBar>

      {/* ─── Stats ──────────────────────────────────────────────────────────── */}
      {totalCount > 0 && (
        <StatsRow className="no-print">
          <Stat accent="#607d8b">
            <span>📊</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <StatNum color="#455a64">{totalCount}</StatNum>
              <StatLbl>Total Scans</StatLbl>
            </div>
          </Stat>
          {Object.entries(typeCounts)
            .sort()
            .map(([type, count]) => (
              <Stat key={type} accent={typeAccent(type)}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <StatNum color={typeAccent(type)}>{count}</StatNum>
                  <StatLbl>{type}</StatLbl>
                  {type === "GENERAL" &&
                    (generalGenderCounts.Male > 0 ||
                      generalGenderCounts.Female > 0) && (
                      <span
                        style={{
                          fontSize: ".6rem",
                          color: "#888",
                          marginTop: "1px",
                        }}
                      >
                        ♂{generalGenderCounts.Male || 0} ♀
                        {generalGenderCounts.Female || 0}
                      </span>
                    )}
                </div>
              </Stat>
            ))}
          <Stat accent="#2e7d32">
            <span>✅</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <StatNum color="#2e7d32">{savedCount}</StatNum>
              <StatLbl>JRD Saved</StatLbl>
            </div>
          </Stat>
          <Stat accent="#ff9800">
            <span>⏳</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <StatNum color="#e65100">{pendingCount}</StatNum>
              <StatLbl>Pending</StatLbl>
            </div>
          </Stat>
        </StatsRow>
      )}

      {/* ─── Screen Table ───────────────────────────────────────────────────── */}
      <Card className="no-print">
        {loading ? (
          <Loading>⏳ Fetching ANC reports…</Loading>
        ) : rows.length === 0 ? (
          <Empty>
            <div style={{ fontSize: "2.2rem", marginBottom: ".4rem" }}>📭</div>
            No ANC reports found for selected{" "}
            {filterMode === "month" ? "month" : "date range"}.
          </Empty>
        ) : (
          <TWrap>
            <Table>
              <THead>
                <tr>
                  <Th style={{ minWidth: 36 }}>S.No</Th>
                  <Th style={{ minWidth: 74 }}>JRD ID</Th>
                  <Th style={{ minWidth: 74 }}>Scan Date</Th>
                  <Th style={{ minWidth: 90 }}>S. No of Form-F</Th>
                  <Th style={{ minWidth: 160 }}>Name &amp; Address</Th>
                  <Th style={{ minWidth: 70 }}>Marital Status</Th>
                  <Th style={{ minWidth: 70 }}>GUH</Th>
                  <Th style={{ minWidth: 108 }}>Referred By</Th>
                  <Th style={{ minWidth: 108 }}>Received By</Th>
                  <Th style={{ minWidth: 78 }}>LMP</Th>
                  <Th style={{ minWidth: 78 }}>Gest. Age</Th>
                  <Th style={{ minWidth: 95 }}>MTP Advice</Th>
                  <Th style={{ minWidth: 72 }}>Actions</Th>
                </tr>
              </THead>
              <tbody>
                {rows.map((row, idx) => {
                  const key = row.key;
                  const m = meta[key];
                  const isSav = saving.has(key);
                  const isDel = deleting.has(key);
                  const dirty = isDirty(key);
                  const saved = !!m?.saved;

                  return (
                    <Tr key={key} style={{ opacity: isDel ? 0.4 : 1 }}>
                      <Td style={{ fontWeight: 700, color: "#00897b" }}>
                        {idx + 1}
                      </Td>

                      <Td>
                        {saved ? (
                          <Badge $s="saved">JRD-{m.jrd_id}</Badge>
                        ) : dirty ? (
                          <Badge $s="pending">Unsaved</Badge>
                        ) : (
                          <span style={{ color: "#ccc", fontSize: ".7rem" }}>
                            —
                          </span>
                        )}
                      </Td>

                      <Td>{fmt(row.scanDate)}</Td>

                      <Td>
                        <Input
                          type="text"
                          placeholder="Form No."
                          $dirty={dirty && !saved ? 1 : 0}
                          $saved={saved ? 1 : 0}
                          value={get(key, "formNo")}
                          disabled={isDel}
                          onChange={(e) =>
                            onChange(key, "formNo", e.target.value)
                          }
                        />
                      </Td>

                      <AddrTd>
                        <strong>{row.patientName}</strong>
                        {row.spouseName?.trim() && (
                          <div style={{ color: "#555" }}>
                            W/O {row.spouseName.trim()}
                          </div>
                        )}
                        {row.address && (
                          <div style={{ color: "#777", fontSize: ".7rem" }}>
                            {row.address}
                          </div>
                        )}
                        {row.phone && (
                          <div style={{ color: "#888", fontSize: ".69rem" }}>
                            📞 {row.phone}
                          </div>
                        )}
                      </AddrTd>

                      <Td style={{ textTransform: "capitalize" }}>
                        {row.maritalStatus || "—"}
                      </Td>
                      <Td>{row.guh || "—"}</Td>
                      <Td>{row.referredByDr || "—"}</Td>
                      <Td>{row.receivedByDr || "—"}</Td>
                      <Td>{row.lmp || "—"}</Td>
                      <Td>{row.gestAge || "—"}</Td>

                      <Td>
                        <Input
                          type="text"
                          placeholder="NIL / advice"
                          $dirty={dirty && !saved ? 1 : 0}
                          $saved={saved ? 1 : 0}
                          value={get(key, "mtpAdvice")}
                          disabled={isDel}
                          onChange={(e) =>
                            onChange(key, "mtpAdvice", e.target.value)
                          }
                        />
                      </Td>

                      <Td>
                        <div
                          style={{
                            display: "flex",
                            gap: ".28rem",
                            justifyContent: "center",
                          }}
                        >
                          <IconBtn
                            bg="#e8f5e9"
                            color="#2e7d32"
                            title={saved ? "Update" : "Save"}
                            disabled={isSav || isDel || (!dirty && saved)}
                            onClick={() => save(row)}
                          >
                            {isSav ? <Spn /> : saved ? "✏️" : "💾"}
                          </IconBtn>
                          <IconBtn
                            bg="#fce4ec"
                            color="#c62828"
                            title="Delete"
                            disabled={
                              isDel ||
                              isSav ||
                              (!saved &&
                                !get(key, "formNo") &&
                                !get(key, "mtpAdvice"))
                            }
                            onClick={() => askDelete(row)}
                          >
                            {isDel ? <Spn /> : "🗑️"}
                          </IconBtn>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </TWrap>
        )}
      </Card>

      {rows.length > 0 && (
        <Hint className="no-print">
          💡 Type in Form-F or MTP Advice then click 💾 to save · ✏️ to update ·
          Green = saved · Orange = unsaved
        </Hint>
      )}
    </Page>
  );
}

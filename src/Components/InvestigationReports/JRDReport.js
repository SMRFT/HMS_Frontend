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

// ─── Component ────────────────────────────────────────────────────────────────

export default function JRDReport() {
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  // { [key]: { formNo, mtpAdvice } }
  const [fields, setFields] = useState({});
  // { [key]: { jrd_id, saved, savedFormNo, savedMtpAdvice } }
  const [meta, setMeta] = useState({});

  const [saving, setSaving] = useState(new Set());
  const [deleting, setDeleting] = useState(new Set());
  const [confirm, setConfirm] = useState(null);

  // ── Keep refs in sync so save() always reads latest state ────────────────
  const fieldsRef = useRef(fields);
  const metaRef = useRef(meta);
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);
  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setRows([]);
    setFields({});
    setMeta({});
    try {
      const anc = await apiRequest(
        `${HMSURL}anc-register/?from_date=${fromDate}&to_date=${toDate}`,
        "GET",
      );
      if (!anc.success) {
        toast.error(anc.error || "Failed to fetch ANC");
        return;
      }
      setRows(anc.data || []);

      const jrd = await apiRequest(
        `${HMSURL}jrd-reports/?from_date=${fromDate}&to_date=${toDate}`,
        "GET",
      );
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
  }, [HMSURL, fromDate, toDate]);

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

  // ── Save — reads from refs so it always has the latest meta/fields ────────

  const save = useCallback(
    async (row) => {
      const key = row.key;
      const formNo = (fieldsRef.current[key]?.formNo ?? "").trim();
      const mtpAdvice = (fieldsRef.current[key]?.mtpAdvice ?? "").trim();

      if (!formNo && !mtpAdvice) {
        toast.warn("Enter Form No. or MTP Advice before saving.");
        return;
      }

      // Read meta from ref — guaranteed fresh, no stale closure
      const m = metaRef.current[key];

      setSaving((p) => new Set(p).add(key));
      try {
        if (m?.saved && m?.jrd_id) {
          // ── PATCH existing record ─────────────────────────────────────────
          console.log(`PATCH jrd_id=${m.jrd_id}`, {
            form_no: formNo,
            mtp_advice: mtpAdvice,
          });
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
          // ── POST create ───────────────────────────────────────────────────
          console.log(`POST create`, {
            investBillNo: row.investBillNo,
            item_id: row.item_id,
          });
          const r = await apiRequest(`${HMSURL}jrd-reports/create/`, "POST", {
            investBillNo: row.investBillNo,
            item_id: parseInt(row.item_id, 10),
            form_no: formNo,
            mtp_advice: mtpAdvice,
          });

          if (!r.success) {
            // 409 → already exists, patch it
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
  ); // ← no fields/meta in deps; read from refs instead

  // ── onChange — local state only, no API ───────────────────────────────────

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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Page>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #jrd-print, #jrd-print * { visibility: visible; }
          #jrd-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          table { font-size: 9pt; }
          th, td { padding: 4px 5px !important; }
        }
      `}</style>

      {/* Confirm delete */}
      {confirm && (
        <Overlay onClick={() => setConfirm(null)}>
          <Dialog onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>🗑️</div>
            <h3 style={{ margin: "0 0 0.4rem", color: "#b71c1c" }}>
              Delete JRD-{confirm.jrd_id}?
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
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
                gap: "0.6rem",
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

      {/* Top bar */}
      <TopBar className="no-print">
        <Title>🤰 ANC Register</Title>
        <Row>
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
          <Btn onClick={fetchAll} disabled={loading}>
            {loading ? "Loading…" : "🔍 Fetch"}
          </Btn>
          <Btn
            bg="linear-gradient(135deg,#ff7043,#e64a19)"
            onClick={() => window.print()}
            disabled={!rows.length}
          >
            🖨️ Print
          </Btn>
        </Row>
      </TopBar>

      {/* Stats */}
      {rows.length > 0 && (
        <StatsRow className="no-print">
          <Stat accent="#00897b">
            <span>🤰</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <StatNum color="#00695c">{rows.length}</StatNum>
              <StatLbl>Total ANC</StatLbl>
            </div>
          </Stat>
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

      {/* Table */}
      <Card id="jrd-print">
        {loading ? (
          <Loading>⏳ Fetching ANC reports…</Loading>
        ) : rows.length === 0 ? (
          <Empty>
            <div style={{ fontSize: "2.2rem", marginBottom: "0.4rem" }}>📭</div>
            No ANC reports found for selected date range.
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
                  <Th style={{ minWidth: 72 }} className="no-print">
                    Actions
                  </Th>
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

                      {/* JRD ID */}
                      <Td>
                        {saved ? (
                          <Badge $s="saved">JRD-{m.jrd_id}</Badge>
                        ) : dirty ? (
                          <Badge $s="pending">Unsaved</Badge>
                        ) : (
                          <span style={{ color: "#ccc", fontSize: "0.7rem" }}>
                            —
                          </span>
                        )}
                      </Td>

                      <Td>{fmt(row.scanDate)}</Td>

                      {/* Form-F */}
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

                      {/* Name & Address */}
                      <AddrTd>
                        <strong>{row.patientName}</strong>
                        {row.spouseName?.trim() && (
                          <div style={{ color: "#555" }}>
                            W/O {row.spouseName.trim()}
                          </div>
                        )}
                        {row.address && (
                          <div style={{ color: "#777", fontSize: "0.7rem" }}>
                            {row.address}
                          </div>
                        )}
                        {row.phone && (
                          <div style={{ color: "#888", fontSize: "0.69rem" }}>
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

                      {/* MTP Advice */}
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

                      {/* Actions */}
                      <Td className="no-print">
                        <div
                          style={{
                            display: "flex",
                            gap: "0.28rem",
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

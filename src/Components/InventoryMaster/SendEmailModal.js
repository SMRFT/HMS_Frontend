import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const BASE = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

const fadeSlide = keyframes`from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}`;
const spin      = keyframes`to{transform:rotate(360deg)}`;

const MOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const MBox = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px;
  max-width: 540px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid #e2e8f0;
  ${css`animation: ${fadeSlide} 0.18s ease forwards;`}
`;

const MTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
`;

const MLbl = styled.label`
  display: block;
  font-size: .72rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: .04em;
  margin-bottom: 5px;
`;

const Inp = styled.input`
  padding: 9px 12px;
  border: 1.5px solid ${p => p.$err ? '#dc2626' : '#cbd5e1'};
  border-radius: 7px;
  font-size: .85rem;
  color: #0f172a;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  transition: all .15s ease;
  &:focus {
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }
`;

const Err = styled.div`
  font-size: .72rem;
  color: #dc2626;
  margin-top: 4px;
  font-weight: 600;
`;

const MBtnRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const SecBtn = styled.button`
  background: #fff;
  color: #374151;
  border: 1.5px solid #cbd5e1;
  padding: 8px 18px;
  border-radius: 7px;
  font-size: .8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s ease;
  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #94a3b8;
  }
  &:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
`;

const SendBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #7c3aed;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 7px;
  font-size: .8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all .15s ease;
  &:hover:not(:disabled) {
    background: #6d28d9;
  }
  &:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
`;

const SpinEl = styled.span`
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: .68rem;
  font-weight: 800;
  background: ${p => p.$s === "Approved" ? "#dcfce7" : p.$s === "Rejected" ? "#fee2e2" : p.$s === "Verified" ? "#dbeafe" : "#fef9c3"};
  color: ${p => p.$s === "Approved" ? "#166534" : p.$s === "Rejected" ? "#991b1b" : p.$s === "Verified" ? "#1d4ed8" : "#92400e"};
  border: 1px solid ${p => p.$s === "Approved" ? "#86efac" : p.$s === "Rejected" ? "#fca5a5" : p.$s === "Verified" ? "#93c5fd" : "#fde68a"};
  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${p => p.$s === "Approved" ? "#16a34a" : p.$s === "Rejected" ? "#dc2626" : p.$s === "Verified" ? "#2563eb" : "#d97706"};
  }
`;

const OptionCard = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid ${p => p.$active ? '#0d9488' : '#e2e8f0'};
  background: ${p => p.$active ? '#f0fdf4' : '#ffffff'};
  cursor: pointer;
  transition: all .15s ease;
  &:hover {
    border-color: ${p => p.$active ? '#0d9488' : '#cbd5e1'};
    background: ${p => p.$active ? '#f0fdf4' : '#f8fafc'};
  }
`;

const ITable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: .78rem;
`;

const ITh = styled.th`
  background: #f8fafc;
  color: #64748b;
  padding: 8px 10px;
  font-size: .69rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
`;

const ITd = styled.td`
  padding: 7px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
`;

const safeItems = raw => (Array.isArray(raw) ? raw : []);

const SendEmailModal = ({ po, vendors = [], onConfirm, onClose, loading }) => {
  const matchedVendor = vendors?.find(v => String(v.vendor_id) === String(po.vendor_id));
  const initialVendorEmail = (po.vendor_email || matchedVendor?.email || "").trim();

  const [vendorEmail, setVendorEmail] = useState(initialVendorEmail);
  const [useVendorEmail, setUseVendorEmail] = useState(Boolean(initialVendorEmail));
  const [manualEmail, setManualEmail] = useState(initialVendorEmail ? "" : (po.vendor_email || ""));
  const [touched, setTouched] = useState(false);
  const [fetchingVendor, setFetchingVendor] = useState(false);

  // If vendorEmail is not yet present, check vendor master collection
  useEffect(() => {
    if (!initialVendorEmail && po?.vendor_id) {
      setFetchingVendor(true);
      apiRequest(`${BASE}vendors/`, "GET")
        .then(r => {
          const list = r?.data?.data ?? (Array.isArray(r?.data) ? r.data : []);
          const found = list.find(v => String(v.vendor_id) === String(po.vendor_id));
          if (found?.email && found.email.trim()) {
            const em = found.email.trim();
            setVendorEmail(em);
            setUseVendorEmail(true);
          }
        })
        .catch(() => {})
        .finally(() => setFetchingVendor(false));
    }
  }, [po?.vendor_id, initialVendorEmail]);

  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const activeEmail = useVendorEmail && vendorEmail ? vendorEmail : manualEmail.trim();

  const handleSend = () => {
    setTouched(true);
    if (!activeEmail || !isValidEmail(activeEmail)) return;
    onConfirm(activeEmail);
  };

  const items = safeItems(po.items);
  const totalQty = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);

  return (
    <MOverlay onClick={onClose}>
      <MBox onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            background: "#ede9fe",
            color: "#7c3aed",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            flexShrink: 0
          }}>
            ✉️
          </div>
          <div>
            <MTitle>Send Purchase Order to Vendor</MTitle>
            <div style={{ fontSize: ".76rem", color: "#64748b", marginTop: 2 }}>
              Dispatch formatted HTML purchase order via email
            </div>
          </div>
        </div>

        {/* PO Summary Card */}
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 14,
          fontSize: ".82rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 800, color: "#0d9488", fontFamily: "monospace", fontSize: ".85rem" }}>
              {po.po_number}
            </span>
            <Badge $s={po.status}>{po.status}</Badge>
          </div>
          <div style={{ color: "#64748b", fontSize: ".76rem", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <strong style={{ color: "#0f172a", textTransform: "uppercase" }}>{po.vendor_name || po.vendor_id}</strong>
            <span>·</span>
            <span>{items.length} item{items.length !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>Total Qty: <strong style={{ color: "#0f172a" }}>{totalQty}</strong></span>
          </div>
        </div>

        {/* Medicine items preview */}
        {items.length > 0 && (
          <div style={{
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 14,
            maxHeight: 140,
            overflowY: "auto"
          }}>
            <ITable>
              <thead>
                <tr>
                  <ITh style={{ position: "sticky", top: 0, zIndex: 1, width: 35 }}>#</ITh>
                  <ITh style={{ position: "sticky", top: 0, zIndex: 1 }}>Medicine Name</ITh>
                  <ITh style={{ position: "sticky", top: 0, zIndex: 1, textAlign: "right", width: 60 }}>Qty</ITh>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <ITd style={{ color: "#94a3b8", fontSize: ".7rem", fontWeight: 700 }}>{i + 1}</ITd>
                    <ITd style={{ fontWeight: 600 }}>{it.medicine_name || "—"}</ITd>
                    <ITd style={{ fontWeight: 700, color: "#0d9488", textAlign: "right" }}>{it.quantity}</ITd>
                  </tr>
                ))}
              </tbody>
            </ITable>
          </div>
        )}

        {/* Vendor Email Options / Prompt */}
        {vendorEmail ? (
          <div style={{
            background: "#f0fdfa",
            border: "1.5px solid #a7f3d0",
            borderRadius: 9,
            padding: "14px",
            marginBottom: 14
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: "1.1rem" }}>🏢</span>
              <span style={{ fontSize: ".82rem", fontWeight: 800, color: "#0f766e" }}>
                Registered Vendor Email: <span style={{ color: "#0f172a", textDecoration: "underline" }}>{vendorEmail}</span>
              </span>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: ".76rem", color: "#475569", lineHeight: 1.45 }}>
              This is the vendor email. Would you like to send through this or enter another email manually?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <OptionCard $active={useVendorEmail}>
                <input
                  type="radio"
                  name="poEmailOption"
                  checked={useVendorEmail}
                  onChange={() => setUseVendorEmail(true)}
                  style={{ marginTop: 2, accentColor: "#0d9488", cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: ".8rem", fontWeight: 700, color: useVendorEmail ? "#065f46" : "#1e293b" }}>
                    Send through vendor email
                  </div>
                  <div style={{ fontSize: ".74rem", color: useVendorEmail ? "#0f766e" : "#64748b", marginTop: 2 }}>
                    {vendorEmail}
                  </div>
                </div>
              </OptionCard>

              <OptionCard $active={!useVendorEmail}>
                <input
                  type="radio"
                  name="poEmailOption"
                  checked={!useVendorEmail}
                  onChange={() => setUseVendorEmail(false)}
                  style={{ marginTop: 2, accentColor: "#0d9488", cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: ".8rem", fontWeight: 700, color: !useVendorEmail ? "#065f46" : "#1e293b" }}>
                    Enter another email manually
                  </div>
                  <div style={{ fontSize: ".74rem", color: !useVendorEmail ? "#0f766e" : "#64748b", marginTop: 2 }}>
                    Specify a custom or alternative recipient email address
                  </div>
                </div>
              </OptionCard>
            </div>
          </div>
        ) : (
          <div style={{
            background: "#fefce8",
            border: "1px solid #fde047",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 14,
            fontSize: ".76rem",
            color: "#854d0e",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <span style={{ fontSize: "1rem" }}>{fetchingVendor ? "⏳" : "ℹ️"}</span>
            <span>
              {fetchingVendor
                ? "Checking vendor email from vendor collection…"
                : "No email registered in vendor collection. Please enter recipient email manually below."}
            </span>
          </div>
        )}

        {/* Manual Email Input (shown if user chose manual option OR if vendor has no registered email) */}
        {(!vendorEmail || !useVendorEmail) && (
          <div style={{ marginBottom: 12 }}>
            <MLbl>
              Recipient Email <span style={{ color: "#dc2626" }}>*</span>
            </MLbl>
            <Inp
              type="email"
              autoFocus
              $err={touched && (!manualEmail.trim() || !isValidEmail(manualEmail.trim()))}
              value={manualEmail}
              onChange={e => setManualEmail(e.target.value)}
              placeholder="vendor@example.com"
            />
            {touched && !manualEmail.trim() && <Err>Recipient email is required.</Err>}
            {touched && manualEmail.trim() && !isValidEmail(manualEmail.trim()) && (
              <Err>Enter a valid email address.</Err>
            )}
          </div>
        )}

        <div style={{ fontSize: ".72rem", color: "#64748b", marginTop: 4 }}>
          A formatted HTML purchase order will be dispatched to <strong>{activeEmail || "the recipient"}</strong>.
        </div>

        <MBtnRow>
          <SecBtn onClick={onClose} disabled={loading}>Cancel</SecBtn>
          <SendBtn onClick={handleSend} disabled={loading}>
            {loading ? (
              <><SpinEl /> Sending…</>
            ) : (
              <><span>✉️</span> Send PO</>
            )}
          </SendBtn>
        </MBtnRow>
      </MBox>
    </MOverlay>
  );
};

export default SendEmailModal;

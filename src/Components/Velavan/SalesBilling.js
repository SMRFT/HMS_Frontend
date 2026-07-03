"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Receipt, ArrowLeft, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import { AddCustomerMiniModal } from "./AddVelavanCustomers";
import {
  PageWrapper,
  Container,
  Input,
  Button,
  Table,
  Th,
  Td,
  Tr,
  TableWrapper,
  colors,
  TextArea,
  Label,
  InputWrapper,
} from "../GlobalStyles";

const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// unitSellingCost already includes GST per unit — split it back into
// taxable base + CGST + SGST for the quantity actually being billed.
const computeLine = (line) => {
  const unitSellingCost = parseFloat(line.unitSellingCost) || 0;
  const cgstP = parseFloat(line.sellingCgstPercent) || 0;
  const sgstP = parseFloat(line.sellingsgstPercent) || 0;
  const gstRate = cgstP + sgstP;
  const qty = parseFloat(line.quantity) || 0;

  const lineTotal = unitSellingCost * qty;
  const lineBeforeGst =
    gstRate > 0 ? lineTotal / (1 + gstRate / 100) : lineTotal;
  const lineCgst = lineBeforeGst * (cgstP / 100);
  const lineSgst = lineBeforeGst * (sgstP / 100);

  return {
    lineBeforeGst: lineBeforeGst.toFixed(2),
    lineCgst: lineCgst.toFixed(2),
    lineSgst: lineSgst.toFixed(2),
    lineTotal: lineTotal.toFixed(2),
  };
};

// ── Item + batch search dropdown ──────────────────────────────────────────
const ItemBatchSearch = ({ onSelect }) => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const runSearch = (q) => {
    clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await apiRequest(
          `${HMSURL}velavan/stock/search/?q=${encodeURIComponent(q.trim())}`,
          "GET",
        );
        if (r.success && r.data?.status === "success")
          setResults(r.data.data || []);
        else setResults([]);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const pick = (row) => {
    onSelect(row);
    setTerm("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <Input
        placeholder="Search item name to add…"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
          runSearch(e.target.value);
        }}
        onFocus={() => term && setOpen(true)}
      />
      {open && (loading || results.length > 0) && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "white",
            border: `1px solid ${colors.border}`,
            borderRadius: "0 0 6px 6px",
            maxHeight: 260,
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: 10,
                fontSize: "0.8rem",
                color: colors.textMuted,
              }}
            >
              Searching…
            </div>
          ) : (
            results.map((row) => (
              <div
                key={row.stock_id}
                onMouseDown={() => pick(row)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: `1px solid #f1f5f9`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = colors.tabBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                    {row.itemName}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: colors.textMuted }}>
                    Batch: {row.batch_no || "—"} &nbsp;|&nbsp; Exp:{" "}
                    {row.expiry || "—"} &nbsp;|&nbsp; HSN: {row.hsn}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      color: "#166534",
                    }}
                  >
                    Avail: {row.available_quantity}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: colors.textMuted }}>
                    ₹{parseFloat(row.unitSellingCost || 0).toFixed(2)}/unit
                  </div>
                </div>
              </div>
            ))
          )}
          {!loading && results.length === 0 && (
            <div
              style={{
                padding: 10,
                fontSize: "0.8rem",
                color: colors.textMuted,
              }}
            >
              No matching stock found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EMPTY_PATIENT = {
  ipNumber: "",
  patientName: "",
  surgeonName: "",
  surgeon_id: "",
  customerType: "",
  companyName: "",
};

const CustomerDropdown = ({
  customers,
  loading,
  value,
  onSelect,
  onAddNew,
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const selected = customers.find((c) => c.customer_id === value);
    if (selected) setSearch(selected.name);
  }, [value, customers]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const select = (c) => {
    setSearch(c.name);
    setOpen(false);
    onSelect(c);
  };

  return (
    <InputWrapper style={{ margin: 0 }}>
      <Label style={{ display: "flex", alignItems: "center", gap: 4 }}>
        Customer
        <button
          onClick={onAddNew}
          style={{
            background: "none",
            border: "1px solid #cbd5e1",
            borderRadius: 4,
            padding: "1px 6px",
            marginLeft: 6,
            cursor: "pointer",
            fontSize: "0.75rem",
            color: colors.primary,
          }}
        >
          +
        </button>
      </Label>
      <div ref={ref} style={{ position: "relative" }}>
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? "Loading…" : "Select customer"}
        />
        {open && filtered.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 60,
              background: "white",
              border: `1px solid ${colors.border}`,
              borderRadius: "0 0 6px 6px",
              maxHeight: 200,
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {filtered.map((c) => (
              <div
                key={c.customer_id}
                onMouseDown={() => select(c)}
                style={{
                  padding: "7px 10px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #f1f5f9",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = colors.tabBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                {(c.phone || c.company_name) && (
                  <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>
                    {[c.phone, c.company_name].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </InputWrapper>
  );
};

const SalesBilling = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const record = location.state?.record || null; // optional: arrived via "Bill this invoice"

  const [billDate] = useState(new Date().toISOString().split("T")[0]);
  const [patient, setPatient] = useState(
    record
      ? {
          ipNumber: record.ip_number || "",
          patientName: record.patient_name || "",
          surgeonName: record.surgeon_name || "",
          surgeon_id: record.surgeon_id || "",
          customerType: record.customer_type || "",
          companyName: record.company_name || "",
        }
      : EMPTY_PATIENT,
  );
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState([]);
  const userId = localStorage.getItem("employeeId");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    record?.customer_id || "",
  );

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const r = await apiRequest(`${HMSURL}velavan_customers/list/`, "GET");
      if (r.success) {
        const sorted = [...(r.data?.data || [])].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        );
        setCustomers(sorted);
      } else {
        toast.error("Failed to load customers");
        setCustomers([]);
      }
    } catch {
      toast.error("Error loading customers");
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!record?.grn_number) return;

    const prefillFromGrn = async () => {
      setPrefillLoading(true);
      try {
        const r = await apiRequest(
          `${HMSURL}velavan/stock/by-grn/?grn_number=${encodeURIComponent(record.grn_number)}`,
          "GET",
        );
        if (r.success && r.data?.status === "success") {
          const stockRows = r.data.data || [];
          if (stockRows.length === 0) {
            toast.info(
              "No available stock found for this GRN — it may already be fully billed.",
            );
            return;
          }
          setLines(
            stockRows.map((row) => ({
              lineId: row.stock_id,
              stock_id: row.stock_id,
              item_id: row.item_id,
              name: row.itemName,
              hsn: row.hsn,
              batch_no: row.batch_no,
              expiry: row.expiry,
              maxQuantity: row.available_quantity,
              quantity: row.available_quantity, // default to full available qty
              mrp: row.mrp,
              sellingTax: row.sellingTax,
              sellingCgstPercent: row.sellingCgstPercent,
              sellingsgstPercent: row.sellingsgstPercent,
              unitSellingCost: row.unitSellingCost,
            })),
          );
        } else {
          toast.error("Failed to load items for this invoice");
        }
      } catch {
        toast.error("Error loading items for this invoice");
      } finally {
        setPrefillLoading(false);
      }
    };

    prefillFromGrn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.grn_number]);

  // ── IP number lookup (works standalone, same endpoint Invoice.jsx uses) ──
  const fetchIpPatient = async () => {
    if (!patient.ipNumber) {
      toast.error("Please enter IP Number");
      return;
    }
    const result = await apiRequest(
      `${HMSURL}vel-ip-patient/${encodeURIComponent(patient.ipNumber)}/`,
      "GET",
    );
    if (result.success) {
      const data = result.data?.data || result.data;
      const fullName = [data.salutation, data.firstName, data.lastName]
        .filter(Boolean)
        .join(" ");
      setPatient((prev) => ({
        ...prev,
        patientName: fullName,
        customerType: data.customer_type || "",
        companyName: data.company_name || "",
        surgeonName: data.surgeon_name || "",
        surgeon_id: data.surgeon_id || "",
      }));
    } else {
      toast.error(result.error || "Patient not found");
    }
  };

  const handleAddStockRow = (row) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.stock_id === row.stock_id);
      if (existing) {
        toast.info(`${row.itemName} (Batch ${row.batch_no}) is already added`);
        return prev;
      }
      return [
        ...prev,
        {
          lineId: row.stock_id,
          stock_id: row.stock_id,
          item_id: row.item_id,
          name: row.itemName,
          hsn: row.hsn,
          batch_no: row.batch_no,
          expiry: row.expiry,
          maxQuantity: row.available_quantity,
          quantity: 1,
          mrp: row.mrp,
          sellingTax: row.sellingTax,
          sellingCgstPercent: row.sellingCgstPercent,
          sellingsgstPercent: row.sellingsgstPercent,
          unitSellingCost: row.unitSellingCost,
        },
      ];
    });
  };

  const handleQtyChange = (lineId, value) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.lineId !== lineId) return l;
        let q = parseFloat(value) || 0;
        if (q < 0) q = 0;
        if (q > l.maxQuantity) {
          toast.error(
            `Only ${l.maxQuantity} units available for ${l.name} (Batch ${l.batch_no})`,
          );
          q = l.maxQuantity;
        }
        return { ...l, quantity: q };
      }),
    );
  };

  const removeLine = (lineId) =>
    setLines((prev) => prev.filter((l) => l.lineId !== lineId));

  const computedLines = useMemo(
    () => lines.map((l) => ({ ...l, calc: computeLine(l) })),
    [lines],
  );

  const summary = useMemo(() => {
    const taxableAmount = computedLines.reduce(
      (s, l) => s + parseFloat(l.calc.lineBeforeGst),
      0,
    );
    const cgst = computedLines.reduce(
      (s, l) => s + parseFloat(l.calc.lineCgst),
      0,
    );
    const sgst = computedLines.reduce(
      (s, l) => s + parseFloat(l.calc.lineSgst),
      0,
    );
    const rawTotal = computedLines.reduce(
      (s, l) => s + parseFloat(l.calc.lineTotal),
      0,
    );
    const decimal = rawTotal - Math.floor(rawTotal);
    const roundAmount = decimal >= 0.5 ? 1 - decimal : -decimal;
    return {
      taxableAmount,
      cgst,
      sgst,
      roundAmount,
      totalAmount: rawTotal + roundAmount,
    };
  }, [computedLines]);

  const handleSubmit = async () => {
    const billedLines = computedLines.filter((l) => l.quantity > 0);
    if (billedLines.length === 0) {
      toast.error("Add at least one item with quantity > 0");
      return;
    }
    if (!selectedCustomerId) {
      toast.error("Select a customer before billing");
      return;
    }

    const payload = {
      source_grn_number: record?.grn_number || "",
      customer_id: selectedCustomerId || "",
      billDate,
      ipNumber: patient.ipNumber,
      patientName: patient.patientName,
      surgeon_id: patient.surgeon_id,
      surgeonName: patient.surgeonName,
      customerType: patient.customerType,
      companyName: patient.companyName,
      paymentMode,
      paymentStatus,
      items: billedLines.map(({ name, ...l }) => ({
        stock_id: l.stock_id,
        item_id: l.item_id,
        hsn: l.hsn,
        batch_no: l.batch_no,
        expiry: l.expiry,
        quantity: l.quantity,
        mrp: l.mrp,
        sellingTax: l.sellingTax,
        sellingCgstPercent: l.sellingCgstPercent,
        sellingCgstAmt: l.calc.lineCgst,
        sellingsgstPercent: l.sellingsgstPercent,
        sellingSgstAmt: l.calc.lineSgst,
        unitSellingCost: l.unitSellingCost,
        sellingCostBeforeGst: l.calc.lineBeforeGst,
        sellingCost: l.calc.lineTotal,
      })),
      summary: { ...summary, remarks },
      "auth-user-id": userId,
    };

    setLoading(true);
    try {
      const result = await apiRequest(
        `${HMSURL}velavan/sales/`,
        "POST",
        payload,
      );
      if (result.success) {
        toast.success(`Bill ${result.data?.bill_number} created`);
        navigate("/SalesReport");
      } else {
        toast.error(result.error || "Failed to create bill");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Container>
        <ToastContainer position="top-right" autoClose={1000} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 18px",
            background: colors.tabBg,
            borderRadius: "8px 8px 0 0",
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.05rem",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Receipt size={18} /> Sales Billing
            {record ? ` — GRN ${record.grn_number}` : ""}
          </h2>
          <Button secondary onClick={() => navigate("/SalesReport")}>
            <ArrowLeft size={14} /> Sales Report
          </Button>
        </div>

        <div
          style={{
            padding: 16,
            border: `1px solid ${colors.border}`,
            borderTop: "none",
          }}
        >
          {/* ── Patient section — always editable, IP search works standalone ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <CustomerDropdown
              customers={customers}
              loading={loadingCustomers}
              value={selectedCustomerId}
              onSelect={(c) => setSelectedCustomerId(c.customer_id)}
              onAddNew={() => setShowAddCustomerModal(true)}
            />
            <InputWrapper style={{ margin: 0 }}>
              <Label>IP Number</Label>
              <div style={{ display: "flex", gap: 4 }}>
                <Input
                  value={patient.ipNumber}
                  onChange={(e) =>
                    setPatient((p) => ({ ...p, ipNumber: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && fetchIpPatient()}
                  placeholder="XXXX/000001"
                />
                <button
                  onClick={fetchIpPatient}
                  style={{
                    padding: "0 10px",
                    background: colors.primary,
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  🔍
                </button>
              </div>
            </InputWrapper>
            <InputWrapper style={{ margin: 0 }}>
              <Label>Patient Name</Label>
              <Input
                value={patient.patientName}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, patientName: e.target.value }))
                }
                placeholder="Auto-fill or type"
              />
            </InputWrapper>
            <InputWrapper style={{ margin: 0 }}>
              <Label>Surgeon</Label>
              <Input
                value={patient.surgeonName}
                onChange={(e) =>
                  setPatient((p) => ({
                    ...p,
                    surgeonName: e.target.value,
                    surgeon_id: "",
                  }))
                }
                placeholder="Auto-fill or type"
              />
            </InputWrapper>
            <InputWrapper style={{ margin: 0 }}>
              <Label>Customer Type</Label>
              <Input
                value={patient.customerType}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, customerType: e.target.value }))
                }
              />
            </InputWrapper>
            <InputWrapper style={{ margin: 0 }}>
              <Label>Company Name</Label>
              <Input
                value={patient.companyName}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, companyName: e.target.value }))
                }
              />
            </InputWrapper>
          </div>

          {/* ── Item + batch picker ── */}
          <div style={{ marginBottom: 10 }}>
            <Label>Add Item (near-expiry batches appear first)</Label>
            <ItemBatchSearch onSelect={handleAddStockRow} />
          </div>

          <TableWrapper>
            <Table>
              <thead>
                <Tr>
                  {[
                    "Item",
                    "HSN",
                    "Batch",
                    "Expiry",
                    "Available",
                    "Bill Qty",
                    "Unit Sel. Cost",
                    "Line Total",
                    "",
                  ].map((h) => (
                    <Th key={h}>{h}</Th>
                  ))}
                </Tr>
              </thead>
              <tbody>
                {prefillLoading ? (
                  <Tr>
                    <Td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: colors.textMuted,
                      }}
                    >
                      Loading items from GRN {record?.grn_number}…
                    </Td>
                  </Tr>
                ) : computedLines.length === 0 ? (
                  <Tr>
                    <Td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: colors.textMuted,
                      }}
                    >
                      No items added yet. Search above to add a batch.
                    </Td>
                  </Tr>
                ) : (
                  computedLines.map((l) => (
                    <Tr key={l.lineId}>
                      <Td style={{ fontWeight: 600 }}>{l.name}</Td>
                      <Td>{l.hsn}</Td>
                      <Td>{l.batch_no || "—"}</Td>
                      <Td>{l.expiry || "—"}</Td>
                      <Td>{l.maxQuantity}</Td>
                      <Td>
                        <Input
                          type="number"
                          min="0"
                          max={l.maxQuantity}
                          value={l.quantity}
                          onChange={(e) =>
                            handleQtyChange(l.lineId, e.target.value)
                          }
                          style={{ width: 90 }}
                        />
                      </Td>
                      <Td>₹{parseFloat(l.unitSellingCost || 0).toFixed(2)}</Td>
                      <Td style={{ fontWeight: 700, color: "#166534" }}>
                        ₹{l.calc.lineTotal}
                      </Td>
                      <Td>
                        <button
                          onClick={() => removeLine(l.lineId)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: colors.danger,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
              marginTop: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <Label>Taxable Amount</Label>
              <Input readOnly value={`₹${summary.taxableAmount.toFixed(2)}`} />
            </div>
            <div>
              <Label>CGST</Label>
              <Input readOnly value={`₹${summary.cgst.toFixed(2)}`} />
            </div>
            <div>
              <Label>SGST</Label>
              <Input readOnly value={`₹${summary.sgst.toFixed(2)}`} />
            </div>
            <div>
              <Label>
                Net Total (Round Off ₹{summary.roundAmount.toFixed(2)})
              </Label>
              <Input
                readOnly
                value={`₹${summary.totalAmount.toFixed(2)}`}
                style={{ fontWeight: 700 }}
              />
            </div>
          </div>

          <Label>Remarks</Label>
          <TextArea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={{ width: "100%", marginBottom: 16 }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <InputWrapper style={{ margin: 0 }}>
              <Label>Payment Mode</Label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                style={{
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: `1px solid ${colors.border}`,
                  fontSize: "0.85rem",
                }}
              >
                <option value="CASH">CASH</option>
                <option value="CARD">CARD</option>
                <option value="UPI">UPI</option>
                <option value="NEFT">NEFT</option>
                <option value="INSURANCE">INSURANCE</option>
              </select>
            </InputWrapper>
            <InputWrapper style={{ margin: 0 }}>
              <Label>Payment Status</Label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                style={{
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: `1px solid ${colors.border}`,
                  fontSize: "0.85rem",
                }}
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="PARTIAL">PARTIAL</option>
              </select>
            </InputWrapper>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button secondary onClick={() => navigate("/SalesReport")}>
              <X size={14} /> Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving…" : "Generate Bill"}
            </Button>
          </div>
        </div>
        {showAddCustomerModal && (
          <AddCustomerMiniModal
            onClose={() => setShowAddCustomerModal(false)}
            onSuccess={(newCustomer) => {
              fetchCustomers();
              if (newCustomer?.customer_id)
                setSelectedCustomerId(newCustomer.customer_id);
              setShowAddCustomerModal(false);
            }}
          />
        )}
      </Container>
    </PageWrapper>
  );
};

export default SalesBilling;

import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ─── Global ─────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #f4f6f9; color: #333; }
`;

// ─── Animations ──────────────────────────────────────────────────────────────
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Page Layout ─────────────────────────────────────────────────────────────
const PageWrapper = styled.div`
  padding: 0;
  min-height: 100vh;
  background: #f4f6f9;
`;

const Breadcrumb = styled.div`
  background: #fff;
  padding: 10px 20px;
  font-size: 13px;
  color: #555;
  border-bottom: 1px solid #e0e0e0;
  span { color: #999; margin: 0 5px; }
  a { color: #007bff; text-decoration: none; }
`;

const ContentArea = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  flex-wrap: wrap;
`;

const DateGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
`;

const FieldWrap = styled.div``;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #555;
  display: block;
  margin-bottom: 4px;
`;

const DateInput = styled.input`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  color: #333;
  outline: none;
  &:focus { border-color: #2e7d32; }
`;

const SearchBtn = styled.button`
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  transition: background 0.2s;
  &:hover { background: #1b5e20; }
`;

// Donut
const DonutWrapper = styled.div`
  width: 90px;
  height: 90px;
  flex-shrink: 0;
`;

const DonutSvg = styled.svg`
  transform: rotate(-90deg);
`;

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

const Dot = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: ${p => p.color};
  flex-shrink: 0;
`;

const LegendLabel = styled.span`
  flex: 1;
  color: #444;
`;

const LegendCount = styled.span`
  font-weight: 700;
  color: #222;
  min-width: 18px;
  text-align: right;
`;

// New Return Button
const NewReturnBtn = styled.button`
  margin-left: auto;
  background: ${p => p.$open ? '#bf360c' : '#f57c00'};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  &:hover { background: ${p => p.$open ? '#9a1e05' : '#e65100'}; }
`;

// ─── Inline Form Card ─────────────────────────────────────────────────────────
const FormCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  animation: ${slideDown} 0.25s ease;
`;

const FormBody = styled.div`
  padding: 20px 24px 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px 20px;
  margin-bottom: 18px;
`;

const FormGroup = styled.div``;

const InputRow = styled.div`
  display: flex;
  gap: 4px;
`;

const FormInput = styled.input`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  background: ${p => p.readOnly ? '#f5f5f5' : '#fff'};
  color: #333;
  &:focus { border-color: #00796b; }
`;

const IconBtn = styled.button`
  padding: 0 9px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background: #f5f5f5;
  font-size: 13px;
  flex-shrink: 0;
  &:hover { background: #e0e0e0; }
`;

const FormSelect = styled.select`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
  background: #fff;
  color: #333;
  &:focus { border-color: #00796b; }
`;

const AgeRow = styled.div`
  display: flex;
  gap: 5px;
  input { width: 52px; text-align: center; }
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 6px;
  label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    cursor: pointer;
  }
  input[type="radio"] { accent-color: #00796b; cursor: pointer; }
`;

const FormActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
`;

const ResetBtn = styled.button`
  background: #616161;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover { background: #424242; }
`;

const FormSearchBtn = styled.button`
  background: #00796b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 18px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  &:hover { background: #004d40; }
`;

// ─── Table Card ───────────────────────────────────────────────────────────────
const TableCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const TableToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 14px 16px 10px;
  gap: 10px;
  flex-wrap: wrap;
`;

const ModeBtn = styled.button`
  border: 2px solid ${p => p.color};
  background: ${p => p.$active ? p.color : '#fff'};
  color: ${p => p.$active ? '#fff' : p.color};
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${p => p.color}; color: #fff; }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  input {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 13px;
    outline: none;
    min-width: 160px;
    &:focus { border-color: #007bff; }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  background: #fafafa;
  border-top: 1px solid #ebebeb;
  border-bottom: 1px solid #ebebeb;
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: #444;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px 14px;
  border-bottom: 1px solid #f2f2f2;
  color: #333;
  vertical-align: middle;
`;

const CashBadge = styled.span`
  background: #00796b;
  color: #fff;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
`;

const NoRecords = styled.div`
  text-align: center;
  padding: 32px;
  color: #999;
  font-size: 13px;
`;

const ShowingText = styled.div`
  padding: 10px 16px;
  font-size: 12px;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 16px 14px;
  gap: 4px;
`;

const PageBtn = styled.button`
  border: 1px solid #ddd;
  background: ${p => p.$active ? '#007bff' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#333'};
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 13px;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  opacity: ${p => p.disabled ? 0.5 : 1};
`;

// ─── Donut Component ──────────────────────────────────────────────────────────
function DonutChart({ cashCount, ipCount, otherCount }) {
  const r = 36, cx = 45, cy = 45;
  const circumference = 2 * Math.PI * r;
  const total = cashCount + ipCount + otherCount;

  if (!total) {
    return (
      <DonutWrapper>
        <DonutSvg width="90" height="90" viewBox="0 0 90 90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth="10" />
        </DonutSvg>
      </DonutWrapper>
    );
  }

  const segments = [
    { count: cashCount,  color: "#00796b" },
    { count: ipCount,    color: "#f9a825" },
    { count: otherCount, color: "#4dd0e1" },
  ];

  let accumulated = 0;
  return (
    <DonutWrapper>
      <DonutSvg width="90" height="90" viewBox="0 0 90 90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth="10" />
        {segments.map((seg, i) => {
          if (!seg.count) return null;
          const len = (seg.count / total) * circumference;
          const offset = -accumulated;
          accumulated += len;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </DonutSvg>
    </DonutWrapper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const SalesReturn = () => {
  const today        = new Date().toISOString().split("T")[0];
  const todayDisplay = today.split("-").reverse().join("-");

  const [fromDate, setFromDate]         = useState(today);
  const [toDate, setToDate]             = useState(today);
  const [returnList, setReturnList]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const formRef = useRef(null);

  const [fetchingPatient, setFetchingPatient] = useState(false);

  const [form, setForm] = useState({
    uhidNo: "", ipNumber: "", name: "",
    ageY: "", ageM: "", ageD: "",
    gender: "", requestNo: "", paymentType: "Cash",
  });

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(
        `${HmsBaseUrl}sales_return_medicine/?from_date=${fromDate}&to_date=${toDate}`,
        "GET"
      );
      const data = res.data;
      setReturnList(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Sales return fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (uhid) => {
  if (!uhid) {
    alert("Enter UHID");
    return;
  }

  console.log("Fetching patient for UHID:", uhid);

  try {
    setFetchingPatient(true);
    const res = await apiRequest(
      `${HmsBaseUrl}salesreturn_get_patientdetails/?uhid=${encodeURIComponent(uhid)}`,
      "GET"
    );

    const data = res.data;

    if (data?.status === "success") {
      const d = data.data;

      setForm(prev => ({
        ...prev,
        uhidNo: d.uhid || "",
        ipNumber: d.ip_number || "",
        name: d.name || "",
        gender: d.gender || "",
        ageY: d.age?.years || "",
        ageM: d.age?.months || "",
        ageD: d.age?.days || "",
      }));

    } else {
      
    }

  } catch (err) {
    console.error("Fetch patient error:", err);
    alert("Server error");
  } finally {
    setFetchingPatient(false);
  }
};

  useEffect(() => { handleSearch(); }, []);

  // Smooth scroll to form on open
  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 60);
    }
  }, [showForm]);

  const cashCount  = returnList.filter(r => r.mode === "Cash Return").length;
  const ipCount    = returnList.filter(r => r.mode === "IP Credit").length;
  const otherCount = returnList.filter(r => r.mode === "Other Mode").length;

  const filtered = returnList.filter(r =>
    !searchFilter ||
    (r.patient || "").toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleFormChange = (field, val) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleFormReset = () =>
    setForm({
      uhidNo: "", ipNumber: "", name: "",
      ageY: "", ageM: "", ageD: "",
      gender: "", requestNo: "", paymentType: "Cash",
    });

  const handleFormSearch = async () => {
    try {
      const params = new URLSearchParams({
        uhid_no:      form.uhidNo,
        ip_number:    form.ipNumber,
        name:         form.name,
        age_y:        form.ageY,
        age_m:        form.ageM,
        age_d:        form.ageD,
        gender:       form.gender,
        request_no:   form.requestNo,
        payment_type: form.paymentType,
      });
      const data = await apiRequest(
        `${HmsBaseUrl}sales_return_medicine/new_return/?${params}`,
        "GET"
      );
      console.log("New return search result:", data);
    } catch (err) {
      console.error("New return search error:", err);
    }
  };

  const formatDate = iso =>
    iso ? iso.split("-").reverse().join("/") : "";

  return (
    <>
      <GlobalStyle />
      <PageWrapper>

        {/* Breadcrumb */}
        <Breadcrumb>
          <a href="/">Home</a>
          <span>/</span>
          Sales Return
        </Breadcrumb>

        <ContentArea>

          {/* ── Summary Card ── */}
          <SummaryCard>
            <DateGroup>
              <FieldWrap>
                <Label>From Date</Label>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </FieldWrap>
              <FieldWrap>
                <Label>To Date</Label>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </FieldWrap>
              <SearchBtn onClick={handleSearch}>
                🔍 Search
              </SearchBtn>
            </DateGroup>

            <DonutChart
              cashCount={cashCount}
              ipCount={ipCount}
              otherCount={otherCount}
            />

            <LegendList>
              <LegendItem>
                <Dot color="#00796b" />
                <LegendLabel>Cash Return</LegendLabel>
                <LegendCount>{cashCount}</LegendCount>
              </LegendItem>
              <LegendItem>
                <Dot color="#f9a825" />
                <LegendLabel>IP Credit</LegendLabel>
                <LegendCount>{ipCount}</LegendCount>
              </LegendItem>
              <LegendItem>
                <Dot color="#4dd0e1" />
                <LegendLabel>Other Mode</LegendLabel>
                <LegendCount>{otherCount}</LegendCount>
              </LegendItem>
            </LegendList>

            {/* + New Return toggles form open/close */}
            <NewReturnBtn
              $open={showForm}
              onClick={() => setShowForm(prev => !prev)}
            >
              {showForm ? "− New Return" : "+ New Return"}
            </NewReturnBtn>
          </SummaryCard>

          {/* ── Inline New Return Form — renders between summary and table ── */}
          {showForm && (
            <FormCard ref={formRef}>
              <FormBody>
                <FormGrid>

                  <FormGroup>
                        <Label>UHID No</Label>
                        <InputRow>
                            <FormInput
                            value={form.uhidNo}
                            onChange={e => handleFormChange("uhidNo", e.target.value)}
                            onKeyDown={async (e) => {
                                if (e.key === "Enter") {
                                e.preventDefault();
                                fetchPatientDetails(form.uhidNo);
                                }
                            }}
                            onBlur={() => {
                                if (form.uhidNo.trim()) {
                                fetchPatientDetails(form.uhidNo);
                                }
                            }}
                            placeholder="Enter UHID & press Enter"
                            />

                            <IconBtn
                            type="button"
                            onClick={() => fetchPatientDetails(form.uhidNo)}
                            disabled={fetchingPatient}
                            title="Fetch patient details"
                            >
                            {fetchingPatient ? "⏳" : "🔍"}
                            </IconBtn>
                        </InputRow>
                        </FormGroup>
                  <FormGroup>
                    <Label>IP Number</Label>
                    <InputRow>
                      <FormInput
                        value={form.ipNumber}
                        onChange={e => handleFormChange("ipNumber", e.target.value)}
                      />
                      <IconBtn type="button">🔍</IconBtn>
                      <IconBtn
                        type="button"
                        style={{ background: "#bdbdbd", color: "#fff" }}
                      >
                        ⊞
                      </IconBtn>
                    </InputRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>Name</Label>
                    <FormInput
                      value={form.name}
                      onChange={e => handleFormChange("name", e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Age</Label>
                    <AgeRow>
                      <FormInput
                        value={form.ageY}
                        placeholder="Y"
                        onChange={e => handleFormChange("ageY", e.target.value)}
                      />
                      <FormInput
                        value={form.ageM}
                        placeholder="M"
                        onChange={e => handleFormChange("ageM", e.target.value)}
                      />
                      <FormInput
                        value={form.ageD}
                        placeholder="D"
                        onChange={e => handleFormChange("ageD", e.target.value)}
                      />
                    </AgeRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>Gender</Label>
                    <FormSelect
                      value={form.gender}
                      onChange={e => handleFormChange("gender", e.target.value)}
                    >
                      <option value=""></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </FormSelect>
                  </FormGroup>

                  <FormGroup>
                    <Label>Date</Label>
                    <FormInput value={todayDisplay} readOnly />
                  </FormGroup>

                  <FormGroup>
                    <Label>Request No</Label>
                    <InputRow>
                      <FormInput
                        value={form.requestNo}
                        onChange={e => handleFormChange("requestNo", e.target.value)}
                      />
                      <IconBtn type="button">🔍</IconBtn>
                    </InputRow>
                  </FormGroup>

                  <FormGroup>
                    <Label>Payment Type</Label>
                    <RadioGroup>
                      <label>
                        <input
                          type="radio"
                          name="paymentType"
                          value="Cash"
                          checked={form.paymentType === "Cash"}
                          onChange={() => handleFormChange("paymentType", "Cash")}
                        />
                        Cash
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="paymentType"
                          value="Other"
                          checked={form.paymentType === "Other"}
                          onChange={() => handleFormChange("paymentType", "Other")}
                        />
                        Other
                      </label>
                    </RadioGroup>
                  </FormGroup>

                </FormGrid>

                <FormActions>
                  <ResetBtn type="button" onClick={handleFormReset}>
                    ↺ Reset
                  </ResetBtn>
                  <FormSearchBtn type="button" onClick={handleFormSearch}>
                    🔍 Search
                  </FormSearchBtn>
                </FormActions>
              </FormBody>
            </FormCard>
          )}

          {/* ── Table Card ── */}
          <TableCard>
            <TableToolbar>
              <ModeBtn color="#00796b" $active>■ Cash Return</ModeBtn>
              <ModeBtn color="#f9a825">■ IP Credit</ModeBtn>
              <ModeBtn color="#4dd0e1">■ Other Mode</ModeBtn>
              <SearchBox>
                Search:
                <input
                  placeholder="Search By Patient"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                />
              </SearchBox>
            </TableToolbar>

            <Table>
              <thead>
                <tr>
                  <Th>Mode</Th>
                  <Th>Return Date</Th>
                  <Th>Return NO</Th>
                  <Th>Patient</Th>
                  <Th>UHID</Th>
                  <Th>IP No/SL No</Th>
                  <Th>Return Amount</Th>
                  <Th>User</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <Td colSpan={9}><NoRecords>Loading…</NoRecords></Td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <Td colSpan={9}><NoRecords>No records found</NoRecords></Td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr key={i}>
                      <Td><CashBadge>{row.mode || "Cash Return"}</CashBadge></Td>
                      <Td>{formatDate(row.return_date)}</Td>
                      <Td>{row.return_no}</Td>
                      <Td>{row.patient}</Td>
                      <Td>{row.uhid}</Td>
                      <Td>{row.ip_sl_no}</Td>
                      <Td>₹ {parseFloat(row.return_amount || 0).toFixed(2)}</Td>
                      <Td>{row.user}</Td>
                      <Td>
                        <button
                          style={{
                            background: "none", border: "none",
                            cursor: "pointer", fontSize: 15, color: "#555",
                          }}
                        >
                          🖨
                        </button>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <ShowingText>
              Showing 1 to {filtered.length} of {filtered.length} entries
            </ShowingText>
            <Pagination>
              <PageBtn disabled>Previous</PageBtn>
              <PageBtn $active>1</PageBtn>
              <PageBtn disabled>Next</PageBtn>
            </Pagination>
          </TableCard>

        </ContentArea>
      </PageWrapper>
    </>
  );
};

export default SalesReturn;
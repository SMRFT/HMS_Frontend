import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { format } from "date-fns";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  PageWrapper,
  Container,
  Button,
  TextArea,
  colors,
} from "../GlobalStyles";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDisplayDate = (d) => {
  if (!d) return "";
  try {
    return format(new Date(d), "dd/MM/yyyy");
  } catch {
    return d;
  }
};

const formatDisplayTime = (d) => {
  if (!d) return "";
  try {
    return format(new Date(d), "hh:mm:ss a");
  } catch {
    return "";
  }
};

// ─── Styled Components ────────────────────────────────────────────────────────
const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.3s ease;
  font-family: "Segoe UI", Arial, sans-serif;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid #0f766e;
`;

const PageTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f766e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PatientBanner = styled.div`
  background: #f0fdfa;
  border: 1.5px solid #99f6e4;
  border-radius: 10px;
  padding: 0.9rem 1.25rem;
  margin-bottom: 1.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.6rem 1.25rem;
  font-size: 0.83rem;
`;

const BannerItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  .label {
    font-size: 0.72rem;
    font-weight: 700;
    color: #0f766e;
    text-transform: uppercase;
  }
  .value {
    font-weight: 700;
    color: #1e293b;
  }
`;

const SectionNav = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1.5px solid #e2e8f0;
`;

const SectionTab = styled.button`
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1.5px solid ${(p) => (p.active ? "#0f766e" : "#cbd5e1")};
  background: ${(p) => (p.active ? "#0f766e" : "#ffffff")};
  color: ${(p) => (p.active ? "#ffffff" : "#475569")};
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    filter: brightness(0.95);
  }
`;

// ── Medical Section Block ─────────────────────────────────────────────────────
const SectionBlock = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e3a8a;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SubSectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 1rem 0 0.5rem 0;
`;

const SectionSubNote = styled.div`
  font-size: 0.83rem;
  color: #475569;
  font-style: italic;
  margin: -0.35rem 0 1rem 0;
  line-height: 1.45;
`;

// ── Medical Tables (matching user template styling) ───────────────────────────
const MedTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-size: 0.84rem;
  border: 1px solid #cbd5e1;
`;

const MedTh = styled.th`
  background: ${(p) => p.bg || "#1e3a8a"};
  color: ${(p) => p.color || "#ffffff"};
  padding: 0.45rem 0.75rem;
  text-align: left;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  font-size: 0.82rem;
`;

const MedLabelCell = styled.td`
  background: #e8f0fe;
  color: #1e293b;
  font-weight: 700;
  padding: 0.45rem 0.75rem;
  border: 1px solid #cbd5e1;
  width: ${(p) => p.width || "25%"};
  vertical-align: middle;
`;

const MedInputCell = styled.td`
  background: #ffffff;
  padding: 0.35rem 0.6rem;
  border: 1px solid #cbd5e1;
  width: ${(p) => p.width || "25%"};
  vertical-align: middle;
`;

const TableInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.35rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.83rem;
  outline: none;
  background: white;
  transition: border-color 0.2s;
  &:focus {
    border-color: #1e3a8a;
    box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.15);
  }
`;

const TableSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 0.35rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.83rem;
  background: white;
  outline: none;
  cursor: pointer;
  &:focus {
    border-color: #1e3a8a;
  }
`;

const UnderlineInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #94a3b8;
  padding: 0.35rem 0.2rem;
  font-size: 0.85rem;
  outline: none;
  background: transparent;
  margin-top: 0.2rem;
  &:focus {
    border-bottom: 2px solid #1e3a8a;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1.25rem;
  margin: 0.5rem 0 1rem 0;
`;

const CheckboxItem = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.83rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  user-select: none;
  input[type="checkbox"],
  input[type="radio"] {
    accent-color: #1e3a8a;
    cursor: pointer;
    width: 15px;
    height: 15px;
  }
`;

const HistoryFieldRow = styled.div`
  margin-bottom: 1rem;
  label {
    display: block;
    font-size: 0.83rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.2rem;
  }
`;

const PersonalHistoryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.75rem;
  padding: 0.6rem 0.8rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  align-items: center;
  font-size: 0.83rem;
  margin-top: 0.5rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 2px solid #e2e8f0;
`;

// ─── Main Component ───────────────────────────────────────────────────────────
const MHCReportForm = () => {
  const { package_id, investBillNo, uhid, subUhid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // ── Live Time ────────────────────────────────────────────────────────────────
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Patient Info ─────────────────────────────────────────────────────────────
  const patientState = location.state || {};
  const resolvedPackageId =
    patientState.package_id ||
    (package_id && !package_id.startsWith("S0") ? package_id : null) ||
    patientState.Package_id ||
    (patientState.items && patientState.items[0]?.package_id) ||
    (patientState.item && patientState.item[0]?.package_id) ||
    package_id ||
    "";

  const resolvedBillNo =
    patientState.investBillNo ||
    (investBillNo ? investBillNo.replace(/-/g, "/") : "") ||
    (subUhid ? subUhid.replace(/-/g, "/") : "") ||
    "";

  const [patientInfo, setPatientInfo] = useState({
    investBillNo: resolvedBillNo,
    uhid: patientState.uhid || (uhid ? uhid.replace(/-/g, "/") : ""),
    patientName: patientState.patientName || "",
    age: patientState.age || "",
    age_type: patientState.age_type || "Y",
    gender: patientState.gender || "Male",
    package_id: resolvedPackageId,
    packageName: patientState.packageName || "",
    doctor: patientState.doctor || "",
    doctorName: patientState.doctorName || "",
    referredBy: patientState.referredBy || "",
    referredByName: patientState.referredByName || "",
    investBillDate: patientState.investBillDate || "",
  });

  // ── Form & Format State ──────────────────────────────────────────────────────
  const [loadingFormat, setLoadingFormat] = useState(true);
  const [formatSections, setFormatSections] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [formValues, setFormValues] = useState({});
  const [impression, setImpression] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Load Format & Existing Report ───────────────────────────────────────────
  const fetchFormatAndReport = useCallback(async () => {
    setLoadingFormat(true);
    try {
      const pkgId = patientInfo.package_id || resolvedPackageId || "579";
      const gender = (patientInfo.gender || "Male").toLowerCase();

      // 1. Fetch Template using package_id
      const formatRes = await apiRequest(
        `${HMSURL}mhc-reports/format/?package_id=${encodeURIComponent(pkgId)}&gender=${encodeURIComponent(gender)}`,
        "GET",
      );

      let sectionsData = {};
      const resPayload = formatRes.data || formatRes;
      if (resPayload.success && resPayload.sections) {
        sectionsData = resPayload.sections;
        setFormatSections(sectionsData);
      } else {
        const errMsg =
          resPayload.error ||
          formatRes.error ||
          "There is no format for this package";
        toast.error(errMsg);
      }

      // 2. Fetch Existing Report if any
      if (patientInfo.investBillNo) {
        const reportRes = await apiRequest(
          `${HMSURL}mhc-reports/${encodeURIComponent(patientInfo.investBillNo)}/`,
          "GET",
        );

        const repObj =
          reportRes.data?.data ||
          (reportRes.data && reportRes.data.valuedetails ? reportRes.data : null) ||
          (reportRes.valuedetails ? reportRes : null) ||
          reportRes.data ||
          null;

        const loadedValuedetails = repObj?.valuedetails;

        if (loadedValuedetails && typeof loadedValuedetails === "object") {
          const parsedFormValues = {};

          Object.keys(loadedValuedetails).forEach((secKey) => {
            const secData = loadedValuedetails[secKey];
            parsedFormValues[secKey] = {};

            if (Array.isArray(secData)) {
              secData.forEach((item) => {
                if (item.test_code) {
                  if (Array.isArray(item.parameter)) {
                    const paramMap = {};
                    item.parameter.forEach((p) => {
                      if (p.pm_code) {
                        paramMap[p.pm_code] = p.value || "";
                        if (p.result) {
                          paramMap[`${p.pm_code}_result`] = p.result;
                        }
                      }
                    });
                    parsedFormValues[secKey][item.test_code] = paramMap;
                  } else if (typeof item.parameter === "object" && item.parameter !== null) {
                    parsedFormValues[secKey][item.test_code] = item.parameter;
                  } else {
                    parsedFormValues[secKey][item.test_code] =
                      item.value !== undefined ? item.value : "";
                  }
                }
              });
            } else if (typeof secData === "object" && secData !== null) {
              parsedFormValues[secKey] = secData;
            }
          });

          // 3. Restore Next Due Date into NMHCD02 if available
          const existingDueDate =
            repObj.next_due_date ||
            repObj.next_review_date ||
            patientState.next_due_date ||
            "";

          if (existingDueDate) {
            if (!parsedFormValues["next_master_health_check-up_due"]) {
              parsedFormValues["next_master_health_check-up_due"] = {};
            }
            if (!parsedFormValues["next_master_health_check-up_due"]["NMHCD02"]) {
              parsedFormValues["next_master_health_check-up_due"]["NMHCD02"] = existingDueDate;
            }
          }

          setFormValues(parsedFormValues);
          if (repObj.impression) {
            setImpression(repObj.impression);
          }
        } else {
          // Initialize empty structure from format
          const initialValues = {};
          Object.keys(sectionsData).forEach((secKey) => {
            initialValues[secKey] = {};
          });

          if (patientState.next_due_date) {
            if (!initialValues["next_master_health_check-up_due"]) {
              initialValues["next_master_health_check-up_due"] = {};
            }
            initialValues["next_master_health_check-up_due"]["NMHCD02"] = patientState.next_due_date;
          }

          setFormValues(initialValues);
        }
      }
    } catch {
      toast.error("Failed to load MHC format template");
    } finally {
      setLoadingFormat(false);
    }
  }, [HMSURL, patientInfo.package_id, resolvedPackageId, patientInfo.gender, patientInfo.investBillNo]);

  useEffect(() => {
    fetchFormatAndReport();
  }, [fetchFormatAndReport]);

  // ── Value Mutator ────────────────────────────────────────────────────────────
  const getValue = (secKey, testCode, paramCode = null) => {
    const sec = formValues[secKey] || {};
    if (paramCode) {
      const item = sec[testCode] || {};
      return typeof item === "object" ? item[paramCode] || "" : "";
    }
    return sec[testCode] || "";
  };

  const setValue = (secKey, testCode, val, paramCode = null) => {
    setFormValues((prev) => {
      const secData = { ...(prev[secKey] || {}) };
      if (paramCode) {
        const itemObj = { ...(typeof secData[testCode] === "object" ? secData[testCode] : {}) };
        itemObj[paramCode] = val;
        secData[testCode] = itemObj;
      } else {
        secData[testCode] = val;
      }

      // Dynamic Auto compute BMI in vitals_check from available height/weight/bmi fields
      if (secKey === "vitals_check") {
        const vList = formatSections["vitals_check"] || [];
        const heightItem = vList.find(
          (i) => i.test_name && i.test_name.toLowerCase().includes("height"),
        );
        const weightItem = vList.find(
          (i) => i.test_name && i.test_name.toLowerCase().includes("weight"),
        );
        const bmiItem = vList.find(
          (i) => i.test_name && i.test_name.toLowerCase().includes("bmi"),
        );

        if (heightItem && weightItem && bmiItem) {
          const hCode = heightItem.test_code;
          const wCode = weightItem.test_code;
          const bCode = bmiItem.test_code;

          const hVal = parseFloat(testCode === hCode ? val : secData[hCode]);
          const wVal = parseFloat(testCode === wCode ? val : secData[wCode]);
          if (hVal > 0 && wVal > 0) {
            const bmi = (wVal / ((hVal / 100) * (hVal / 100))).toFixed(1);
            secData[bCode] = bmi;
          }
        }
      }

      return {
        ...prev,
        [secKey]: secData,
      };
    });
  };

  const toggleArrayOption = (secKey, testCode, option) => {
    setFormValues((prev) => {
      const secData = { ...(prev[secKey] || {}) };
      const current = secData[testCode];
      const cleanOpt = (option || "").replace(/[\u2610]/g, "").trim();
      let updatedArr = [];

      if (Array.isArray(current)) {
        const exists = current.some(
          (o) =>
            (o || "").replace(/[\u2610]/g, "").trim() === cleanOpt ||
            o === option,
        );
        if (exists) {
          updatedArr = current.filter(
            (o) =>
              (o || "").replace(/[\u2610]/g, "").trim() !== cleanOpt &&
              o !== option,
          );
        } else {
          updatedArr = [...current, cleanOpt];
        }
      } else if (typeof current === "string" && current) {
        const split = current.split(", ").map((s) => s.trim());
        if (split.includes(cleanOpt) || split.includes(option)) {
          updatedArr = split.filter((o) => o !== cleanOpt && o !== option);
        } else {
          updatedArr = [...split, cleanOpt];
        }
      } else {
        updatedArr = [cleanOpt];
      }

      secData[testCode] = updatedArr;
      return {
        ...prev,
        [secKey]: secData,
      };
    });
  };

  const isOptionSelected = (secKey, testCode, option) => {
    const val = getValue(secKey, testCode);
    const cleanOpt = (option || "").replace(/[\u2610]/g, "").trim();
    if (Array.isArray(val)) {
      return val.some(
        (v) =>
          (v || "").replace(/[\u2610]/g, "").trim() === cleanOpt ||
          v === option,
      );
    }
    if (typeof val === "string" && val) {
      return val.includes(cleanOpt) || val.includes(option);
    }
    return false;
  };

  // ── Auto-Compile Impression ──────────────────────────────────────────────────
  const handleCompileSummary = () => {
    let summaryParts = [];

    // Vitals
    const vitals = formValues["vitals_check"] || {};
    const vitalsList = formatSections["vitals_check"] || [];
    const vitalParts = [];
    vitalsList.forEach((item) => {
      const val = vitals[item.test_code];
      if (val && typeof val === "string" && val.trim()) {
        vitalParts.push(`${item.test_name}: ${val.trim()}`);
      }
    });
    if (vitalParts.length > 0) {
      summaryParts.push(`<b>Vitals:</b> ${vitalParts.join(", ")}.`);
    }

    // Previous History
    const history = formValues["previous_medical_history"] || {};
    const prevHistoryList = formatSections["previous_medical_history"] || [];
    prevHistoryList.forEach((item) => {
      const val = history[item.test_code];
      if (Array.isArray(val) && val.length > 0) {
        summaryParts.push(`<b>${item.test_name}:</b> Known case of ${val.join(", ")}.`);
      } else if (typeof val === "object" && val !== null) {
        const paramParts = [];
        (item.parameter || []).forEach((p) => {
          if (val[p.pm_code]) {
            paramParts.push(`${p.pm_name}: ${val[p.pm_code]}`);
          }
        });
        if (paramParts.length > 0) {
          summaryParts.push(`<b>${item.test_name}:</b> ${paramParts.join(", ")}.`);
        }
      } else if (typeof val === "string" && val.trim()) {
        summaryParts.push(`<b>${item.test_name}:</b> ${val.trim()}.`);
      }
    });

    // Summary of Review
    const review = formValues["summary_of_review"] || {};
    const reviewList = formatSections["summary_of_review"] || [];
    reviewList.forEach((item) => {
      const val = review[item.test_code];
      if (val && typeof val === "string" && val.trim()) {
        summaryParts.push(`<b>${item.test_name}:</b> ${val.trim()}.`);
      }
    });

    // Consultant Opinion
    const consult = formValues["consultant_opinion"] || {};
    const consultList = formatSections["consultant_opinion"] || [];
    consultList.forEach((item) => {
      const val = consult[item.test_code];
      if (val && typeof val === "string" && val.trim()) {
        summaryParts.push(`<b>${item.test_name}:</b> ${val.trim()}.`);
      }
    });

    // Next Due
    const due = formValues["next_master_health_check-up_due"] || {};
    const nextDueList = formatSections["next_master_health_check-up_due"] || [];
    nextDueList.forEach((item) => {
      const val = due[item.test_code];
      if (val && typeof val === "string" && val.trim()) {
        const dueDateStr = due["NMHCD02"] ? ` on ${formatDisplayDate(due["NMHCD02"])}` : "";
        summaryParts.push(`<b>${item.test_name}:</b> ${val.trim()}${dueDateStr}.`);
      }
    });

    const compiled = summaryParts.join("<br/>");
    if (compiled) {
      setImpression((prev) => (prev ? prev + "<br/>" + compiled : compiled));
      toast.info("Sections compiled into overall impression! ✓");
    } else {
      toast.info("Please fill in some findings first.");
    }
  };

  // ── Submit Report ────────────────────────────────────────────────────────────
  const handleSubmit = async (isApproval = false) => {
    if (!impression.trim()) {
      toast.error("Please provide Overall Impression & Advice.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedValuedetails = {};

      Object.keys(formatSections).forEach((secKey) => {
        const items = formatSections[secKey] || [];
        const secValues = formValues[secKey] || {};

        formattedValuedetails[secKey] = items.map((item) => {
          const rawVal = secValues[item.test_code];
          const hasParams = Array.isArray(item.parameter) && item.parameter.length > 0;

          if (hasParams) {
            const paramList = item.parameter.map((p) => {
              let pVal = "";
              let pResult = "";
              if (typeof rawVal === "object" && rawVal !== null && !Array.isArray(rawVal)) {
                pVal = rawVal[p.pm_code] || "";
                pResult = rawVal[`${p.pm_code}_result`] || "";
              } else if (typeof rawVal === "string") {
                pVal = rawVal;
              }
              const pItem = {
                pm_code: p.pm_code,
                value: pVal,
              };
              if (pResult) {
                pItem.result = pResult;
              }
              return pItem;
            });
            return {
              test_code: item.test_code,
              parameter: paramList,
            };
          }

          return {
            test_code: item.test_code,
            value: rawVal !== undefined && rawVal !== null ? rawVal : "",
          };
        });
      });

      // Extract calculated next due date (from NMHCD02 or SRR03)
      let nextDueDate = "";
      const nmhcdVals = formValues["next_master_health_check-up_due"] || {};
      if (nmhcdVals["NMHCD02"]) {
        nextDueDate = nmhcdVals["NMHCD02"];
      }

      if (!nextDueDate) {
        const srrVals = formValues["summary_of_review_and_recommendations"] || {};
        const srr03 = srrVals["SRR03"] || {};
        if (typeof srr03 === "object" && srr03 !== null) {
          nextDueDate = srr03["SRR03P02"] || "";
        }
      }

      // Ensure NMHCD02 is preserved in formattedValuedetails
      if (nextDueDate) {
        if (!formattedValuedetails["next_master_health_check-up_due"]) {
          formattedValuedetails["next_master_health_check-up_due"] = [];
        }
        const hasDateItem = formattedValuedetails["next_master_health_check-up_due"].some(
          (i) => i.test_code === "NMHCD02",
        );
        if (!hasDateItem) {
          formattedValuedetails["next_master_health_check-up_due"].push({
            test_code: "NMHCD02",
            test_name: "Next Review Date",
            value: nextDueDate,
          });
        }
      }

      const payload = {
        investBillNo: patientInfo.investBillNo,
        uhid: patientInfo.uhid,
        package_id: patientInfo.package_id,
        packageName: patientInfo.packageName,
        valuedetails: formattedValuedetails,
        impression: impression.trim(),
        next_due_date: nextDueDate,
        investBillDate: patientInfo.investBillDate,
      };

      const result = await apiRequest(`${HMSURL}mhc-reports/`, "POST", payload);

      if (result.success) {
        if (isApproval) {
          await apiRequest(
            `${HMSURL}mhc-reports/approve/${encodeURIComponent(patientInfo.investBillNo)}/`,
            "PATCH",
          );
        }
        toast.success(
          isApproval
            ? "MHC Report approved & saved successfully! ✓"
            : "MHC Report saved successfully! ✓",
        );
        navigate("/MHCList");
      } else {
        toast.error(result.error || "Failed to save MHC report");
      }
    } catch {
      toast.error("An error occurred while saving report.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Due Interval Change with Auto Date Calculation ─────────────────────────
  const handleDueIntervalChange = (testCode, opt) => {
    const trimmedOpt = opt.trim();
    setValue("next_master_health_check-up_due", testCode, trimmedOpt);

    const now = new Date();
    let targetDate = new Date(now.getTime());

    if (trimmedOpt === "6 Months") {
      targetDate.setMonth(targetDate.getMonth() + 6);
    } else if (trimmedOpt === "1 Year") {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    } else if (trimmedOpt === "2 Years") {
      targetDate.setFullYear(targetDate.getFullYear() + 2);
    } else {
      return;
    }

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dd = String(targetDate.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    setValue("next_master_health_check-up_due", "NMHCD02", formattedDate);
  };

  // ── Section Helpers & Dynamic Titles ─────────────────────────────────────────
  const SECTION_TITLES = useMemo(
    () => ({
      vitals_check: "Vitals Check",
      previous_medical_history: "Previous Medical History",
      physical_examination: "Physical Examination",
      vaccination_status: "Vaccination Status",
      investigations: "Investigations",
      consultant_opinion: "Consultant Opinion",
      summary_of_review: "Summary of Review",
      procedure_or_suregery_advised: "Procedure / Surgery Advised",
      "pediatric_master_health_check-up": "Pediatric Health Check-up",
      "next_master_health_check-up_due": "Next Health Check-up Due",
    }),
    [],
  );

  const getSectionTitle = useCallback(
    (key, index = null) => {
      const base =
        SECTION_TITLES[key] ||
        key
          .replace(/_/g, " ")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      return index ? `${index}. ${base}` : base;
    },
    [SECTION_TITLES],
  );

  const vitalsItems = formatSections["vitals_check"] || [];
  const prevHistoryItems = formatSections["previous_medical_history"] || [];
  const physExamItems = formatSections["physical_examination"] || [];
  const vaccineItems = formatSections["vaccination_status"] || [];
  const investItems = formatSections["investigations"] || [];
  const consultItems = formatSections["consultant_opinion"] || [];
  const reviewItems = formatSections["summary_of_review"] || [];
  const procedureItems = formatSections["procedure_or_suregery_advised"] || [];
  const pediatricItems = formatSections["pediatric_master_health_check-up"] || [];
  const nextDueItems = formatSections["next_master_health_check-up_due"] || [];

  // Group vitals into pairs of 2 for grid table layout
  const vitalsRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < vitalsItems.length; i += 2) {
      rows.push([vitalsItems[i], vitalsItems[i + 1] || null]);
    }
    return rows;
  }, [vitalsItems]);

  const renderVitalCell = (item) => {
    if (!item) return null;
    const testNameLower = (item.test_name || "").toLowerCase();
    const isBMI = testNameLower.includes("bmi");
    const isNumber =
      testNameLower.includes("height") || testNameLower.includes("weight");
    const currentVal = getValue("vitals_check", item.test_code);

    return (
      <React.Fragment key={item.test_code}>
        <MedLabelCell width="25%">{item.test_name}</MedLabelCell>
        <MedInputCell width="25%">
          {item.value_options && item.value_options.length > 0 ? (
            <TableSelect
              value={currentVal || ""}
              onChange={(e) => setValue("vitals_check", item.test_code, e.target.value)}
            >
              <option value="">Select...</option>
              {item.value_options.map((opt, oIdx) => (
                <option key={oIdx} value={opt}>
                  {opt}
                </option>
              ))}
            </TableSelect>
          ) : (
            <TableInput
              type={isNumber ? "number" : "text"}
              placeholder={isBMI ? "Auto-calculated BMI..." : `Enter ${item.test_name}...`}
              value={typeof currentVal === "string" || typeof currentVal === "number" ? currentVal : ""}
              onChange={(e) => setValue("vitals_check", item.test_code, e.target.value)}
            />
          )}
        </MedInputCell>
      </React.Fragment>
    );
  };

  return (
    <PageWrapper>
      <Container>
        <FormCard>
          <HeaderRow>
            <div>
              <PageTitle>🩺 Master Health Check-up (MHC) Report</PageTitle>
              <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.2rem" }}>
                {patientInfo.packageName || `Package #${patientInfo.package_id}`} •{" "}
                {patientInfo.gender} Check-up Format
              </div>
            </div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f766e" }}>
              📅 {formatDisplayDate(now)} • ⏱ {formatDisplayTime(now)}
            </div>
          </HeaderRow>

          {/* Patient Banner */}
          <PatientBanner>
            <BannerItem>
              <span className="label">Patient Name</span>
              <span className="value">{patientInfo.patientName || "Walk-in Patient"}</span>
            </BannerItem>
            <BannerItem>
              <span className="label">UHID</span>
              <span className="value">{patientInfo.uhid || "-"}</span>
            </BannerItem>
            <BannerItem>
              <span className="label">Age / Gender</span>
              <span className="value">
                {patientInfo.age} {patientInfo.age_type || "Y"} / {patientInfo.gender}
              </span>
            </BannerItem>
            <BannerItem>
              <span className="label">Bill No</span>
              <span className="value">{patientInfo.investBillNo}</span>
            </BannerItem>
            <BannerItem>
              <span className="label">Doctor</span>
              <span className="value">{patientInfo.doctorName || patientInfo.doctor || "SELF"}</span>
            </BannerItem>
            <BannerItem>
              <span className="label">Referred By</span>
              <span className="value">{patientInfo.referredByName || patientInfo.referredBy || "SELF"}</span>
            </BannerItem>
          </PatientBanner>

          {/* Section Navigation Tabs */}
          <SectionNav>
            <SectionTab
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            >
              All Sections
            </SectionTab>
            {vitalsItems.length > 0 && (
              <SectionTab
                active={activeTab === "vitals"}
                onClick={() => setActiveTab("vitals")}
              >
                1. {getSectionTitle("vitals_check")}
              </SectionTab>
            )}
            {prevHistoryItems.length > 0 && (
              <SectionTab
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
              >
                2. {getSectionTitle("previous_medical_history")}
              </SectionTab>
            )}
            {physExamItems.length > 0 && (
              <SectionTab
                active={activeTab === "physical"}
                onClick={() => setActiveTab("physical")}
              >
                3. {getSectionTitle("physical_examination")}
              </SectionTab>
            )}
            {vaccineItems.length > 0 && (
              <SectionTab
                active={activeTab === "vaccine"}
                onClick={() => setActiveTab("vaccine")}
              >
                4. {getSectionTitle("vaccination_status")}
              </SectionTab>
            )}
            {investItems.length > 0 && (
              <SectionTab
                active={activeTab === "investigations"}
                onClick={() => setActiveTab("investigations")}
              >
                5. {getSectionTitle("investigations")}
              </SectionTab>
            )}
            {(reviewItems.length > 0 ||
              procedureItems.length > 0 ||
              consultItems.length > 0 ||
              nextDueItems.length > 0 ||
              pediatricItems.length > 0) && (
                <SectionTab
                  active={activeTab === "review"}
                  onClick={() => setActiveTab("review")}
                >
                  6. Summary & Opinion
                </SectionTab>
              )}
          </SectionNav>

          {loadingFormat ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
              Loading MHC Form Template...
            </div>
          ) : (
            <div>
              {/* ─────────────────────────────────────────────────────────────
                  1. VITALS CHECK (Dynamic Grid Table)
                 ───────────────────────────────────────────────────────────── */}
              {(activeTab === "all" || activeTab === "vitals") && vitalsItems.length > 0 && (
                <SectionBlock>
                  <SectionTitle>{getSectionTitle("vitals_check", 1)}</SectionTitle>
                  <MedTable>
                    <tbody>
                      {vitalsRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {renderVitalCell(row[0])}
                          {row[1] ? (
                            renderVitalCell(row[1])
                          ) : (
                            <>
                              <MedLabelCell width="25%" style={{ background: "#f8fafc" }} />
                              <MedInputCell width="25%" style={{ background: "#f8fafc" }} />
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </MedTable>
                </SectionBlock>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  2. PREVIOUS MEDICAL HISTORY (Dynamic Rendering)
                 ───────────────────────────────────────────────────────────── */}
              {(activeTab === "all" || activeTab === "history") && prevHistoryItems.length > 0 && (
                <SectionBlock>
                  <SectionTitle>{getSectionTitle("previous_medical_history", 2)}</SectionTitle>

                  {prevHistoryItems.map((item, idx) => {
                    const hasOptions = Array.isArray(item.value_options) && item.value_options.length > 0;
                    const hasParams = Array.isArray(item.parameter) && item.parameter.length > 0;

                    // Group with parameters (e.g. Personal History: Smoking, Alcohol, Diet...)
                    if (hasParams) {
                      return (
                        <PersonalHistoryRow key={item.test_code || idx}>
                          <strong style={{ color: "#1e3a8a" }}>{item.test_name}:</strong>
                          {item.parameter.map((param, pIdx) => {
                            const currentPVal = getValue(
                              "previous_medical_history",
                              item.test_code,
                              param.pm_code,
                            );
                            const pOptions =
                              Array.isArray(param.value_options) && param.value_options.length > 0
                                ? param.value_options
                                : ["Yes", "No"];

                            return (
                              <div
                                key={pIdx}
                                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                              >
                                <span style={{ fontWeight: 600 }}>{param.pm_name}:</span>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  {pOptions.map((opt, oIdx) => (
                                    <CheckboxItem key={oIdx}>
                                      <input
                                        type="radio"
                                        name={`pm_${item.test_code}_${param.pm_code}`}
                                        checked={currentPVal === opt.trim()}
                                        onChange={() =>
                                          setValue(
                                            "previous_medical_history",
                                            item.test_code,
                                            opt.trim(),
                                            param.pm_code,
                                          )
                                        }
                                      />
                                      <span>{opt.trim()}</span>
                                    </CheckboxItem>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </PersonalHistoryRow>
                      );
                    }

                    // Checkbox Group (e.g. Conditions Checklist)
                    if (hasOptions) {
                      return (
                        <div key={item.test_code || idx} style={{ marginBottom: "1rem" }}>
                          {item.test_name && (
                            <label
                              style={{
                                display: "block",
                                fontSize: "0.83rem",
                                fontWeight: 700,
                                color: "#1e293b",
                                marginBottom: "0.2rem",
                              }}
                            >
                              {item.test_name}:
                            </label>
                          )}
                          <CheckboxGroup>
                            {item.value_options.map((opt, oIdx) => (
                              <CheckboxItem key={oIdx}>
                                <input
                                  type="checkbox"
                                  checked={isOptionSelected(
                                    "previous_medical_history",
                                    item.test_code,
                                    opt,
                                  )}
                                  onChange={() =>
                                    toggleArrayOption(
                                      "previous_medical_history",
                                      item.test_code,
                                      opt,
                                    )
                                  }
                                />
                                <span>{opt.replace(/[\u2610]/g, "").trim()}</span>
                              </CheckboxItem>
                            ))}
                          </CheckboxGroup>
                        </div>
                      );
                    }

                    // Single input field (e.g. Details / Duration, Past Surgical History, Family History, Allergies)
                    return (
                      <HistoryFieldRow key={item.test_code || idx}>
                        <label>{item.test_name}:</label>
                        <UnderlineInput
                          placeholder={`Enter ${item.test_name}...`}
                          value={getValue("previous_medical_history", item.test_code)}
                          onChange={(e) =>
                            setValue(
                              "previous_medical_history",
                              item.test_code,
                              e.target.value,
                            )
                          }
                        />
                      </HistoryFieldRow>
                    );
                  })}
                </SectionBlock>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  3. PHYSICAL EXAMINATION (Dynamic Table Layout)
                 ───────────────────────────────────────────────────────────── */}
              {(activeTab === "all" || activeTab === "physical") && physExamItems.length > 0 && (
                <SectionBlock>
                  <SectionTitle>{getSectionTitle("physical_examination", 3)}</SectionTitle>
                  <MedTable>
                    <tbody>
                      {physExamItems.map((item, idx) => {
                        const hasOptions =
                          Array.isArray(item.value_options) &&
                          item.value_options.length > 0;
                        const currentVal = getValue(
                          "physical_examination",
                          item.test_code,
                        );

                        return (
                          <tr key={idx}>
                            <MedLabelCell width="30%">
                              {item.test_name}
                            </MedLabelCell>
                            <MedInputCell width="70%">
                              {hasOptions ? (
                                <div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: "0.5rem 1rem",
                                      marginBottom: "0.4rem",
                                    }}
                                  >
                                    {item.value_options.map((opt, oIdx) => (
                                      <CheckboxItem key={oIdx}>
                                        <input
                                          type="checkbox"
                                          checked={isOptionSelected(
                                            "physical_examination",
                                            item.test_code,
                                            opt,
                                          )}
                                          onChange={() =>
                                            toggleArrayOption(
                                              "physical_examination",
                                              item.test_code,
                                              opt,
                                            )
                                          }
                                        />
                                        <span>{opt.trim()}</span>
                                      </CheckboxItem>
                                    ))}
                                  </div>
                                  <TableInput
                                    placeholder="Additional findings..."
                                    value={
                                      typeof currentVal === "string"
                                        ? currentVal
                                        : ""
                                    }
                                    onChange={(e) =>
                                      setValue(
                                        "physical_examination",
                                        item.test_code,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              ) : (
                                <TableInput
                                  placeholder={`Enter ${item.test_name} findings...`}
                                  value={
                                    typeof currentVal === "string" ? currentVal : ""
                                  }
                                  onChange={(e) =>
                                    setValue(
                                      "physical_examination",
                                      item.test_code,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </MedInputCell>
                          </tr>
                        );
                      })}
                    </tbody>
                  </MedTable>
                </SectionBlock>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  4. VACCINATION STATUS (Dynamic Rendering)
                 ───────────────────────────────────────────────────────────── */}
              {(activeTab === "all" || activeTab === "vaccine") && vaccineItems.length > 0 && (
                <SectionBlock>
                  <SectionTitle>{getSectionTitle("vaccination_status", 4)}</SectionTitle>
                  <MedTable>
                    <thead>
                      <tr>
                        <MedTh width="40%">Vaccine / Parameter</MedTh>
                        <MedTh width="60%">Doses & Date / Status</MedTh>
                      </tr>
                    </thead>
                    <tbody>
                      {vaccineItems.map((vGroup, gIdx) => {
                        const hasParams = Array.isArray(vGroup.parameter) && vGroup.parameter.length > 0;
                        if (hasParams) {
                          return vGroup.parameter.map((vac, vIdx) => (
                            <tr key={`${gIdx}-${vIdx}`}>
                              <MedLabelCell>{vac.pm_name}</MedLabelCell>
                              <MedInputCell>
                                <TableInput
                                  placeholder={`Enter ${vac.pm_name} doses & date / status...`}
                                  value={getValue(
                                    "vaccination_status",
                                    vGroup.test_code,
                                    vac.pm_code,
                                  )}
                                  onChange={(e) =>
                                    setValue(
                                      "vaccination_status",
                                      vGroup.test_code,
                                      e.target.value,
                                      vac.pm_code,
                                    )
                                  }
                                />
                              </MedInputCell>
                            </tr>
                          ));
                        }
                        return (
                          <tr key={gIdx}>
                            <MedLabelCell>{vGroup.test_name}</MedLabelCell>
                            <MedInputCell>
                              <TableInput
                                placeholder={`Enter ${vGroup.test_name}...`}
                                value={getValue("vaccination_status", vGroup.test_code)}
                                onChange={(e) =>
                                  setValue("vaccination_status", vGroup.test_code, e.target.value)
                                }
                              />
                            </MedInputCell>
                          </tr>
                        );
                      })}
                    </tbody>
                  </MedTable>
                </SectionBlock>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  5. INVESTIGATIONS (Dynamic per Test from Response)
                 ───────────────────────────────────────────────────────────── */}
              {(activeTab === "all" || activeTab === "investigations") && investItems.length > 0 && (
                <SectionBlock>
                  <SectionTitle>{getSectionTitle("investigations", 5)}</SectionTitle>
                  <SectionSubNote>
                    Laboratory panel to be attached separately as lab report. Special investigations below to be recorded here.
                  </SectionSubNote>

                  {investItems.map((inv, iIdx) => {
                    const hasParams = Array.isArray(inv.parameter) && inv.parameter.length > 0;

                    return (
                      <div key={iIdx} style={{ marginBottom: "1.5rem" }}>
                        <SubSectionTitle>
                          5.{iIdx + 1} {inv.test_name}
                        </SubSectionTitle>

                        {hasParams ? (
                          <MedTable>
                            <thead>
                              <tr>
                                <MedTh width="40%">Parameter</MedTh>
                                <MedTh width="35%">Finding / Value</MedTh>
                                <MedTh width="25%">Normal / Abnormal</MedTh>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.parameter.map((p, pIdx) => {
                                const pVal = getValue(
                                  "investigations",
                                  inv.test_code,
                                  p.pm_code,
                                );
                                const pResult = getValue(
                                  "investigations",
                                  inv.test_code,
                                  `${p.pm_code}_result`,
                                );

                                const assessmentOptions =
                                  Array.isArray(p.value_options) && p.value_options.length > 0
                                    ? p.value_options
                                    : ["Normal", "Abnormal"];

                                return (
                                  <tr key={pIdx}>
                                    <MedLabelCell width="40%">{p.pm_name}</MedLabelCell>
                                    <MedInputCell width="35%">
                                      <TableInput
                                        placeholder="Enter finding / value..."
                                        value={typeof pVal === "string" ? pVal : ""}
                                        onChange={(e) =>
                                          setValue(
                                            "investigations",
                                            inv.test_code,
                                            e.target.value,
                                            p.pm_code,
                                          )
                                        }
                                      />
                                    </MedInputCell>
                                    <MedInputCell width="25%">
                                      <TableSelect
                                        value={pResult || ""}
                                        onChange={(e) =>
                                          setValue(
                                            "investigations",
                                            inv.test_code,
                                            e.target.value,
                                            `${p.pm_code}_result`,
                                          )
                                        }
                                      >
                                        <option value="">Select...</option>
                                        {assessmentOptions.map((opt, oIdx) => (
                                          <option key={oIdx} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </TableSelect>
                                    </MedInputCell>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </MedTable>
                        ) : (
                          <TableInput
                            placeholder={`Enter ${inv.test_name} report / findings...`}
                            value={getValue("investigations", inv.test_code)}
                            onChange={(e) =>
                              setValue("investigations", inv.test_code, e.target.value)
                            }
                            style={{ marginBottom: "0.5rem" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </SectionBlock>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  6. SUMMARY OF REVIEW & RECOMMENDATIONS (Dynamic from Response)
                 ───────────────────────────────────────────────────────────── */}
              {(activeTab === "all" || activeTab === "review") && (
                <SectionBlock>
                  <SectionTitle>6. Summary of Review & Recommendations</SectionTitle>

                  {/* Summary of Review */}
                  {reviewItems.length > 0 && (
                    <MedTable>
                      <tbody>
                        {reviewItems.map((item, idx) => {
                          const hasOptions =
                            Array.isArray(item.value_options) &&
                            item.value_options.length > 0;
                          const currentVal = getValue("summary_of_review", item.test_code);

                          return (
                            <tr key={idx}>
                              <MedLabelCell width="30%">{item.test_name}</MedLabelCell>
                              <MedInputCell width="70%">
                                {hasOptions ? (
                                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                    {item.value_options.map((opt, oIdx) => (
                                      <CheckboxItem key={oIdx}>
                                        <input
                                          type="radio"
                                          name={`review_${item.test_code}`}
                                          checked={currentVal === opt.trim()}
                                          onChange={() =>
                                            setValue(
                                              "summary_of_review",
                                              item.test_code,
                                              opt.trim(),
                                            )
                                          }
                                        />
                                        <span>{opt.trim()}</span>
                                      </CheckboxItem>
                                    ))}
                                  </div>
                                ) : (
                                  <TableInput
                                    placeholder={`Enter ${item.test_name}...`}
                                    value={typeof currentVal === "string" ? currentVal : ""}
                                    onChange={(e) =>
                                      setValue("summary_of_review", item.test_code, e.target.value)
                                    }
                                  />
                                )}
                              </MedInputCell>
                            </tr>
                          );
                        })}
                      </tbody>
                    </MedTable>
                  )}

                  {/* Procedure / Surgery Advised */}
                  {procedureItems.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <SubSectionTitle>{getSectionTitle("procedure_or_suregery_advised")}</SubSectionTitle>
                      <MedTable>
                        <tbody>
                          {procedureItems.map((item, idx) => {
                            const hasOptions =
                              Array.isArray(item.value_options) &&
                              item.value_options.length > 0;
                            const currentVal = getValue(
                              "procedure_or_suregery_advised",
                              item.test_code,
                            );

                            return (
                              <tr key={idx}>
                                <MedLabelCell width="35%">{item.test_name}</MedLabelCell>
                                <MedInputCell width="65%">
                                  {hasOptions ? (
                                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                      {item.value_options.map((opt, oIdx) => (
                                        <CheckboxItem key={oIdx}>
                                          <input
                                            type="radio"
                                            name={`proc_${item.test_code}`}
                                            checked={currentVal === opt.trim()}
                                            onChange={() =>
                                              setValue(
                                                "procedure_or_suregery_advised",
                                                item.test_code,
                                                opt.trim(),
                                              )
                                            }
                                          />
                                          <span>{opt.trim()}</span>
                                        </CheckboxItem>
                                      ))}
                                    </div>
                                  ) : (
                                    <TableInput
                                      placeholder={`Enter ${item.test_name}...`}
                                      value={typeof currentVal === "string" ? currentVal : ""}
                                      onChange={(e) =>
                                        setValue(
                                          "procedure_or_suregery_advised",
                                          item.test_code,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  )}
                                </MedInputCell>
                              </tr>
                            );
                          })}
                        </tbody>
                      </MedTable>
                    </div>
                  )}

                  {/* Pediatric Check-up (if included in package) */}
                  {pediatricItems.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <SubSectionTitle>{getSectionTitle("pediatric_master_health_check-up")}</SubSectionTitle>
                      <MedTable>
                        <tbody>
                          {pediatricItems.map((item, idx) => (
                            <tr key={idx}>
                              <MedLabelCell width="30%">{item.test_name}</MedLabelCell>
                              <MedInputCell width="70%">
                                <TableInput
                                  placeholder={`Enter ${item.test_name}...`}
                                  value={getValue("pediatric_master_health_check-up", item.test_code)}
                                  onChange={(e) =>
                                    setValue("pediatric_master_health_check-up", item.test_code, e.target.value)
                                  }
                                />
                              </MedInputCell>
                            </tr>
                          ))}
                        </tbody>
                      </MedTable>
                    </div>
                  )}

                  {/* Next MHC Due */}
                  {nextDueItems.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <SubSectionTitle>{getSectionTitle("next_master_health_check-up_due")}</SubSectionTitle>
                      <MedTable>
                        <tbody>
                          {nextDueItems.map((item, idx) => {
                            const currentVal = getValue(
                              "next_master_health_check-up_due",
                              item.test_code,
                            );

                            return (
                              <tr key={idx}>
                                <MedLabelCell width="30%">{item.test_name}</MedLabelCell>
                                <MedInputCell width="70%">
                                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                                    {(item.value_options || []).map((opt, oIdx) => (
                                      <CheckboxItem key={oIdx}>
                                        <input
                                          type="radio"
                                          name={`due_${item.test_code}`}
                                          checked={currentVal === opt.trim()}
                                          onChange={() =>
                                            handleDueIntervalChange(
                                              item.test_code,
                                              opt.trim(),
                                            )
                                          }
                                        />
                                        <span>{opt.trim()}</span>
                                      </CheckboxItem>
                                    ))}
                                  </div>
                                </MedInputCell>
                              </tr>
                            );
                          })}
                          <tr>
                            <MedLabelCell width="30%">Next Review Date</MedLabelCell>
                            <MedInputCell width="70%">
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <TableInput
                                  type="date"
                                  style={{ maxWidth: "200px", fontWeight: 700, color: "#0f766e" }}
                                  value={getValue("next_master_health_check-up_due", "NMHCD02")}
                                  onChange={(e) =>
                                    setValue(
                                      "next_master_health_check-up_due",
                                      "NMHCD02",
                                      e.target.value,
                                    )
                                  }
                                />
                                {getValue("next_master_health_check-up_due", "NMHCD02") && (
                                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f766e" }}>
                                    📅 Due on: {formatDisplayDate(getValue("next_master_health_check-up_due", "NMHCD02"))}
                                  </span>
                                )}
                              </div>
                            </MedInputCell>
                          </tr>
                        </tbody>
                      </MedTable>
                    </div>
                  )}

                  {/* Consultant Opinion */}
                  {consultItems.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <SubSectionTitle>{getSectionTitle("consultant_opinion")}</SubSectionTitle>
                      <MedTable>
                        <tbody>
                          {consultItems.map((item, idx) => (
                            <tr key={idx}>
                              <MedLabelCell width="30%">{item.test_name}</MedLabelCell>
                              <MedInputCell width="70%">
                                <TableInput
                                  placeholder={`Enter ${item.test_name}...`}
                                  value={getValue("consultant_opinion", item.test_code)}
                                  onChange={(e) =>
                                    setValue("consultant_opinion", item.test_code, e.target.value)
                                  }
                                />
                              </MedInputCell>
                            </tr>
                          ))}
                        </tbody>
                      </MedTable>
                    </div>
                  )}
                </SectionBlock>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  OVERALL IMPRESSION & CLINICAL ADVICE
                 ───────────────────────────────────────────────────────────── */}
              <SectionBlock>
                <SectionTitle>
                  <span>📝 7. OVERALL IMPRESSION, CLINICAL ASSESSMENT & ADVICE</span>
                  <button
                    type="button"
                    onClick={handleCompileSummary}
                    style={{
                      padding: "0.3rem 0.85rem",
                      borderRadius: "6px",
                      border: "1.5px solid #0f766e",
                      background: "#f0fdfa",
                      color: "#0f766e",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    ✨ Auto-Compile from Form
                  </button>
                </SectionTitle>
                <TextArea
                  rows={5}
                  placeholder="Enter overall medical impressions, clinical assessment, dietary and lifestyle advice..."
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  style={{ width: "100%", fontSize: "0.88rem", padding: "0.75rem" }}
                />
              </SectionBlock>

              {/* Action Buttons */}
              <ActionRow>
                <Button
                  type="button"
                  style={{ background: "#94a3b8" }}
                  onClick={() => navigate("/MHCList")}
                >
                  ← Cancel
                </Button>
                <Button
                  type="button"
                  disabled={submitting}
                  style={{ background: "#0f766e" }}
                  onClick={() => handleSubmit(false)}
                >
                  {submitting ? "Saving..." : "💾 Save Report"}
                </Button>
              </ActionRow>
            </div>
          )}
        </FormCard>
      </Container>
    </PageWrapper>
  );
};

export default MHCReportForm;

import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { FaPills, FaFileInvoiceDollar, FaListAlt, FaChartBar, FaUndo, FaPrescription, FaChartLine } from "react-icons/fa";

import PharmacyViewBills from "../Pharmacy/PharmacyViewBills";
import OPPharmacy from "../Pharmacy/Pharmacy";
import ViewEstimate from "../Pharmacy/Viewestimate";
import MedicineChart from "./Medicinechart";
import apiRequest from "../../Auth/apiRequest";
import WardReturnApprovals from "./WardReturnApprovals";
import PrescriptionDetails from "./PrescriptionDetails";
import PharmacyBillAnalysis from "./PharmacyBillAnalysis";

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "pharmacy_bill",        label: "Pharmacy Bill",        Icon: FaPills            },
  { key: "view_estimate",        label: "View Estimate",        Icon: FaFileInvoiceDollar },
  { key: "view_bills",           label: "View Bills",           Icon: FaListAlt           },
  { key: "medichart",            label: "Medicine Chart",       Icon: FaChartBar          },
  { key: "ward_returns",         label: "Ward Returns",         Icon: FaUndo              },
  { key: "prescription_details", label: "Prescription Details", Icon: FaPrescription      },
  { key: "bill_analysis",        label: "Bill Analysis",        Icon: FaChartLine         },
];

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulseRingOrange = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 138, 0, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 7px rgba(230, 138, 0, 0.25);
  }
  70% {
    transform: scale(1.08);
    box-shadow: 0 0 0 11px rgba(230, 138, 0, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(230, 138, 0, 0);
  }
`;

const softGlowHalo = keyframes`
  0%, 100% {
    opacity: 0.45;
    transform: scale(0.92);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.3);
  }
`;

const BlinkBadgeWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 2px;

  &::before {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(245, 158, 11, 0) 70%);
    animation: ${softGlowHalo} 1.8s ease-in-out infinite;
    pointer-events: none;
  }
`;

const BlinkBadge = styled.span`
  min-width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e68a00;
  color: #1a1a1a;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(230, 138, 0, 0.5);
  animation: ${pulseRingOrange} 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  position: relative;
  z-index: 2;
  padding: 0 4px;
  line-height: 1;
`;


// ─── Styled Components ────────────────────────────────────────────────────────
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f0f4f8;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const TabBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 14px 24px 0;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%);
  box-shadow: 0 2px 12px rgba(15, 118, 110, 0.25);
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  position: relative;
  letter-spacing: 0.01em;
  white-space: nowrap;
  background: ${({ $active }) => ($active ? "#ffffff" : "rgba(255,255,255,0.12)")};
  color: ${({ $active }) => ($active ? "#0f766e" : "rgba(255,255,255,0.88)")};
  box-shadow: ${({ $active }) =>
    $active ? "0 -2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(15,118,110,0.10)" : "none"};

  &:hover {
    background: ${({ $active }) => ($active ? "#ffffff" : "rgba(255,255,255,0.22)")};
    color: ${({ $active }) => ($active ? "#0f766e" : "#ffffff")};
  }

  svg {
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  ${({ $active }) =>
    $active &&
    `&::before {
      content: '';
      position: absolute;
      top: 0; left: 12px; right: 12px;
      height: 3px;
      background: linear-gradient(90deg, #0f766e, #14b8a6);
      border-radius: 0 0 4px 4px;
    }`}
`;

const TabPanel = styled.div`
  display: ${({ $visible }) => ($visible ? "block" : "none")};
  animation: ${({ $visible }) => ($visible ? fadeSlide : "none")} 0.28s
    cubic-bezier(0.22, 1, 0.36, 1);
  flex: 1;
`;

// ─── Main Component ───────────────────────────────────────────────────────────
const OPPharmacyTabs = () => {
  const [activeTab, setActiveTab] = useState("pharmacy_bill");
  const [estimateToLoad, setEstimateToLoad] = useState(null);
  const [billToEdit, setBillToEdit] = useState(null);
  const [estimateRefreshKey, setEstimateRefreshKey] = useState(0);

  // ── Ward request state (used for MedicineChart → Convert to Bill flow) ──
  const [wardRequestToLoad, setWardRequestToLoad] = useState(null);

  // ── Doctor Prescription state (used for PrescriptionDetails → Convert to Bill flow) ──
  const [prescriptionToLoad, setPrescriptionToLoad] = useState(null);
  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const handleConvertPrescription = (prescription) => {
    setPrescriptionToLoad(prescription);
    setActiveTab("pharmacy_bill");
  };

  const handlePrescriptionLoaded = () => {
    setPrescriptionToLoad(null);
  };

  const handleConvertEstimate = (estimate) => {
    setEstimateToLoad(estimate);
    setActiveTab("pharmacy_bill");
  };

  // Called by OPPharmacy after a successful Save Estimate — signals ViewEstimate to re-fetch once
  const handleEstimateSaved = () => {
    setEstimateRefreshKey(prev => prev + 1);
  };

  const handleEstimateLoaded = () => {
    setEstimateToLoad(null);
  };

  const handleEditBill = (billWithReason) => {
    // Normalize: API returns bill_type_name but loadBillForEdit reads bill_name/bill_type_name.
    // Carry both keys so OPPharmacy can resolve whichever is present.
    const normalized = {
      ...billWithReason,
      bill_type_name: billWithReason.bill_type_name || billWithReason.bill_name || "",
      bill_name:      billWithReason.bill_name      || billWithReason.bill_type_name || "",
    };
    setBillToEdit(normalized);
  };

  const handleSwitchToPharmacy = () => {
    setActiveTab("pharmacy_bill");
  };

  const handleBillEditLoaded = () => {
    setBillToEdit(null);
  };

  // ── Called from MedicineChart when user clicks "Convert to Bill" ──────────
  // patient = enriched record from MedicineChart with:
  //   • patient_details  { patient_name, address, mobile }  (nested, from fetchPatientDetails)
  //   • patient_name / address / mobile                     (flat, also from fetchPatientDetails)
  //   • inpatient_number / ward_name / room_no              (from fetchAdmissionDetails)
  //   • medicine_items []
  const handleConvertMedicineChart = (patient) => {
    // Safety guard — ensure medicine_items is a non-empty array
    const items = Array.isArray(patient?.medicine_items)
      ? patient.medicine_items.filter(Boolean)
      : [];

    if (items.length === 0) {
      alert(
        `No medicine items found for patient ${
          patient?.patient_details?.patient_name || patient?.patient_name || patient?.uhid || ""
        }. Cannot convert to bill.`
      );
      return;
    }

    // Resolve patient name, address, mobile from BOTH nested and flat fields
    // (MedicineChart enriches both; take whichever is populated)
    const resolvedName   = patient.patient_details?.patient_name || patient.patient_name   || "";
    const resolvedAddr   = patient.patient_details?.address      || patient.address         || "";
    const resolvedMobile = patient.patient_details?.mobile       || patient.mobile          || "";
    const resolvedRoom   = patient.ward_name || patient.room_no  || "";
    const resolvedIP     = patient.inpatient_number || patient.ip_number || patient.ipNumber || "";
    const resolvedDoctor = patient.doctor_id || patient.admittingDoctor || patient.consultingDoctor || "";

    // Build the wardRequest payload.
    // All patient fields are provided in BOTH flat and nested forms so
    // OPPharmacy.convertWardRequest() can find them regardless of how it reads them.
    const wardPayload = {
      // ── Identifiers ──
      Bill_id:          patient.Bill_id          || patient.bill_id   || null,
      uhid:             patient.uhid              || "",
      inpatient_number: resolvedIP,
      ip_number:        resolvedIP,                // alias — some code reads ip_number

      // ── Billing meta ──
      bill_date:        patient.bill_date         || null,
      bill_type:        patient.bill_type         || "",
      bill_name:        patient.bill_name         || "",
      bill_type_name:   patient.bill_type_name    || patient.bill_name || "",

      // ── Doctor / ward ──
      doctor_id:        resolvedDoctor,
      doctor_name:      patient.doctor_name || patient.patient_details?.doctor_name || "",
      room_no:          resolvedRoom,
      ward_name:        resolvedRoom,              // alias

      // ── Discount ──
      overall_discount_type:  patient.overall_discount_type  || "percent",
      overall_discount_value: patient.overall_discount_value ?? 0,

      // ── Customer & Insurance / IP Advance info ──
      customer_type:     patient.customer_type     || "General",
      is_insurance:      patient.is_insurance      ?? (String(patient.customer_type || '').toLowerCase() === 'insurance'),
      insurance_company: patient.insurance_company || "",
      total_ip_advance:  patient.total_ip_advance  ?? 0,

      // ── Patient fields — FLAT (used by many forms that read top-level keys) ──
      patient_name: resolvedName,
      address:      resolvedAddr,
      mobile:       resolvedMobile,

      // ── Patient fields — NESTED (used by components that read patient_details.*) ──
      patient_details: {
        patient_name: resolvedName,
        address:      resolvedAddr,
        mobile:       resolvedMobile,
      },

      // ── Medicine items — map ALL fields from the enriched API response ──
      medicine_items: items.map((item) => {
        const rate = (() => {
          const sp = item.Selling_Price !== undefined ? item.Selling_Price : item.selling_price;
          if (sp !== undefined && sp !== null && sp !== "" && !isNaN(Number(sp)) && Number(sp) > 0) return Number(sp);
          if (item.price !== undefined && item.price !== null && item.price !== "" && !isNaN(Number(item.price)) && Number(item.price) > 0) return Number(item.price);
          if (item.mrp !== undefined && item.mrp !== null && item.mrp !== "" && !isNaN(Number(item.mrp)) && Number(item.mrp) > 0) return Number(item.mrp);
          return Number(sp || item.price || item.mrp || 0);
        })();

        return {
          ...item,
          item_id:             item.item_id,
          item_name:           (item.item_name && !String(item.item_name).startsWith("Item #") ? item.item_name : null) ||
                               (item.medicine_name && !String(item.medicine_name).startsWith("Item #") ? item.medicine_name : null) ||
                               (item.name && !String(item.name).startsWith("Item #") ? item.name : null) ||
                               item.item_name || item.medicine_name || item.name || "",
          batch_number:        item.batch_number    || "",
          qty:                 item.qty             ?? item.quantity ?? 0,
          quantity:            item.qty             ?? item.quantity ?? 0,
          dosage:              item.dosage          || "",
          noOfDays:            item.noOfDays        || "",
          available_stock:     item.available_stock ?? 0,
          CGST_Percentage:     item.CGST_Percentage ?? 0,
          SGST_Percentage:     item.SGST_Percentage ?? 0,
          CGST_Amt:            item.CGST_Amt        ?? 0,
          SGST_Amt:            item.SGST_Amt        ?? 0,
          price:               rate,
          mrp:                 rate,
          selling_price:       rate,
          Selling_Price:       rate,
          is_consumable_items: Boolean(item.is_consumable_items),
        };
      }),
    };

    setWardRequestToLoad(wardPayload);
    setActiveTab("pharmacy_bill");
  };

  const handleWardRequestLoaded = () => {
    setWardRequestToLoad(null);
  };

  const [visitedTabs, setVisitedTabs] = useState(new Set(["pharmacy_bill"]));
  const [medichartCount, setMedichartCount] = useState(0);

  const fetchMedichartCount = useCallback(async () => {
    try {
      let userPayload = {};
      try {
        userPayload = JSON.parse(localStorage.getItem("user_payload") || "{}");
      } catch (e) {}

      const activeHospital =
        localStorage.getItem("selected_hospital") ||
        localStorage.getItem("hospital_code") ||
        userPayload.hospital_code ||
        "SH001";

      const activeBranch =
        localStorage.getItem("selected_branch") ||
        localStorage.getItem("branch_code") ||
        (Array.isArray(userPayload["allowed-data"]) ? userPayload["allowed-data"][0] : "") ||
        "SHB001";

      const activeOutlet =
        localStorage.getItem("selected_outlet") ||
        localStorage.getItem("outlet_code") ||
        "OLET002";

      const res = await apiRequest(`${Hmsbaseurl}pharmacy_medicinechart/`, "POST", {
        outlet_code: activeOutlet,
        branch_code: activeBranch,
        hospital_code: activeHospital,
      });

      if (res.success && res.data) {
        const list = res.data.data || [];
        setMedichartCount(list.length);
      }
    } catch {
      // silent fallback
    }
  }, [Hmsbaseurl]);

  useEffect(() => {
    fetchMedichartCount();
  }, [fetchMedichartCount]);

  // Support Alt+M keyboard shortcut to switch to Medicine Chart tab
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        handleTabClick("medichart");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTabClick = (key) => {
    setActiveTab(key);
    setVisitedTabs((prev) => new Set(prev).add(key));
  };

  return (
    <Wrapper>
      {/* ── Tab Bar ── */}
      <TabBar>
        {TABS.map(({ key, label, Icon }) => {
          const isMedichart = key === "medichart";
          return (
            <TabButton
              key={key}
              $active={activeTab === key}
              onClick={() => handleTabClick(key)}
            >
              {isMedichart && medichartCount > 0 ? (
                <BlinkBadgeWrapper title={`${medichartCount} active ward prescriptions`}>
                  <BlinkBadge>{medichartCount}</BlinkBadge>
                </BlinkBadgeWrapper>
              ) : (
                <Icon />
              )}
              <span>{label}</span>
            </TabButton>
          );
        })}
      </TabBar>

      {/* ── OP Pharmacy Bill tab ── */}
      <TabPanel $visible={activeTab === "pharmacy_bill"}>
        <OPPharmacy
          estimateToLoad={estimateToLoad}
          onEstimateLoaded={handleEstimateLoaded}
          billToEdit={billToEdit}
          onBillEditLoaded={handleBillEditLoaded}
          wardRequestToLoad={wardRequestToLoad}
          onWardRequestLoaded={handleWardRequestLoaded}
          prescriptionToLoad={prescriptionToLoad}
          onPrescriptionLoaded={handlePrescriptionLoaded}
          onEstimateSaved={handleEstimateSaved}
        />
      </TabPanel>

      {/* ── View Estimate tab ── */}
      {visitedTabs.has("view_estimate") && (
        <TabPanel $visible={activeTab === "view_estimate"}>
          <ViewEstimate
            onConvertEstimate={handleConvertEstimate}
            refreshTrigger={estimateRefreshKey}
            activeTab={activeTab}
          />
        </TabPanel>
      )}

      {/* ── View Bills tab ── */}
      {visitedTabs.has("view_bills") && (
        <TabPanel $visible={activeTab === "view_bills"}>
          <PharmacyViewBills
            onEditBill={handleEditBill}
            onSwitchToPharmacy={handleSwitchToPharmacy}
          />
        </TabPanel>
      )}

      {/* ── Medicine Chart tab ── */}
      {visitedTabs.has("medichart") && (
        <TabPanel $visible={activeTab === "medichart"}>
          <MedicineChart
            onConvertToBill={handleConvertMedicineChart}
            onCountChange={setMedichartCount}
          />
        </TabPanel>
      )}

      {/* ── Ward Returns tab ── */}
      {visitedTabs.has("ward_returns") && (
        <TabPanel $visible={activeTab === "ward_returns"}>
          <WardReturnApprovals />
        </TabPanel>
      )}

      {/* ── Prescription Details tab ── */}
      {visitedTabs.has("prescription_details") && (
        <TabPanel $visible={activeTab === "prescription_details"}>
          <PrescriptionDetails onConvertToBill={handleConvertPrescription} />
        </TabPanel>
      )}

      {/* ── Bill Analysis tab ── */}
      {visitedTabs.has("bill_analysis") && (
        <TabPanel $visible={activeTab === "bill_analysis"}>
          <PharmacyBillAnalysis />
        </TabPanel>
      )}
    </Wrapper>
  );
};

export default OPPharmacyTabs;
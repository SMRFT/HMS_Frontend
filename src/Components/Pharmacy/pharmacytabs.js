import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { FaPills, FaFileInvoiceDollar, FaListAlt, FaChartBar } from "react-icons/fa";

import PharmacyViewBills from "../Pharmacy/PharmacyViewBills";
import OPPharmacy from "../Pharmacy/Pharmacy";
import ViewEstimate from "../Pharmacy/Viewestimate";
import MedicineChart from "./Medicinechart";
import apiRequest from "../../Auth/apiRequest";

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "pharmacy_bill", label: "Pharmacy Bill", Icon: FaPills            },
  { key: "view_estimate", label: "View Estimate",    Icon: FaFileInvoiceDollar },
  { key: "view_bills",    label: "View Bills",       Icon: FaListAlt           },
  { key: "medichart",     label: "Medichart",        Icon: FaChartBar          },
];

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
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
  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

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
      room_no:          resolvedRoom,
      ward_name:        resolvedRoom,              // alias

      // ── Discount ──
      overall_discount_type:  patient.overall_discount_type  || "percent",
      overall_discount_value: patient.overall_discount_value ?? 0,

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
      medicine_items: items.map((item) => ({
        item_id:         item.item_id,
        item_name:       item.item_name       || item.medicine_name || "",
        batch_number:    item.batch_number    || "",
        qty:             item.qty             ?? item.quantity ?? 0,
        quantity:        item.qty             ?? item.quantity ?? 0,
        dosage:          item.dosage          || "",
        noOfDays:        item.noOfDays        || "",
        available_stock: item.available_stock ?? 9999,
        CGST_Percentage: item.CGST_Percentage ?? 0,
        SGST_Percentage: item.SGST_Percentage ?? 0,
        CGST_Amt:        item.CGST_Amt        ?? 0,
        SGST_Amt:        item.SGST_Amt        ?? 0,
        price:           item.price           ?? item.mrp ?? 0,
        mrp:             item.mrp             ?? item.price ?? 0,
      })),
    };

    setWardRequestToLoad(wardPayload);
    setActiveTab("pharmacy_bill");
  };

  const handleWardRequestLoaded = () => {
    setWardRequestToLoad(null);
  };

  return (
    <Wrapper>
      {/* ── Tab Bar ── */}
      <TabBar>
        {TABS.map(({ key, label, Icon }) => (
          <TabButton
            key={key}
            $active={activeTab === key}
            onClick={() => setActiveTab(key)}
          >
            <Icon />
            {label}
          </TabButton>
        ))}
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
          onEstimateSaved={handleEstimateSaved}
        />
      </TabPanel>

      {/* ── View Estimate tab ── */}
      <TabPanel $visible={activeTab === "view_estimate"}>
        <ViewEstimate onConvertEstimate={handleConvertEstimate} refreshTrigger={estimateRefreshKey} />
      </TabPanel>

      {/* ── View Bills tab ── */}
      <TabPanel $visible={activeTab === "view_bills"}>
        <PharmacyViewBills
          onEditBill={handleEditBill}
          onSwitchToPharmacy={handleSwitchToPharmacy}
        />
      </TabPanel>

      {/* ── Medicine Chart tab ── */}
      <TabPanel $visible={activeTab === "medichart"}>
        <MedicineChart onConvertToBill={handleConvertMedicineChart} />
      </TabPanel>
    </Wrapper>
  );
};

export default OPPharmacyTabs;
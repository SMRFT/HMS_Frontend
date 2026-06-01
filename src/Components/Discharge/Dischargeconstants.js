// ─────────────────────────────────────────────
//  Dialysis Discharge Summary — Constants
// ─────────────────────────────────────────────

export const COMPLICATIONS_LIST = [
  "Rigors",
  "Fever",
  "Headache",
  "Vomiting",
  "Abdominal pain",
  "Accelerated Hypertension",
  "Acute Pulmonary Edema",
  "Seizures",
  "Poor Thrill in AVF",
  "Others",
];

export const HD_SESSION_LABELS = [
  "I", "II", "III", "IV", "V", "VI",
  "VII", "VIII", "IX", "X", "XI", "XII",
];

export const BLOOD_TESTS = [
  "CBC",
  "HB",
  "UREA/CREATININE",
  "HIV",
  "HBsAg",
  "ANTI HCV",
  "OTHERS",
];

// ── Helpers ──────────────────────────────────

/** Returns today as a yyyy-mm-dd string (local time) */
export const TODAY = new Date().toISOString().split("T")[0];

/** Build the default blood-investigations array from BLOOD_TESTS */
export const buildDefaultBloodInvestigations = () =>
  BLOOD_TESTS.map((t) => ({ test_name: t, result: "" }));

/** Build the default HD-sessions array from HD_SESSION_LABELS */
export const buildDefaultHdSessions = () =>
  HD_SESSION_LABELS.map((label) => ({
    session_no: label,
    date: TODAY,
    bp_pre_hd: "",
    bp_post_hd: "",
    weight_gain: "",
    uf_removed: "",
    complications: "",
  }));

/** Build the default complications array from COMPLICATIONS_LIST */
export const buildDefaultComplications = () =>
  COMPLICATIONS_LIST.map((type) => ({
    type,
    date: TODAY,
    medication_type: "",
    medications: "",
  }));

/** Build the default advice array (5 blank slots) */
export const buildDefaultAdvice = () =>
  Array(5).fill(null).map(() => ({ text: "" }));
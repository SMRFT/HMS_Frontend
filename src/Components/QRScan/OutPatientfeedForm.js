import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";

const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// Styled Components for Google Forms style design
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f0f4f1;
  padding: 24px 16px 60px 16px;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 730px;
`;

const HeaderCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 28px 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-top: 10px solid #1e6038;
`;

const Title = styled.h1`
  color: #1e6038;
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const Subtitle = styled.p`
  color: #4a5568;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 22px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }
`;

const QuestionLabel = styled.label`
  display: block;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 12px;
  font-size: 15px;
  line-height: 1.4;
`;

const TextInput = styled.input`
  width: 100%;
  border: none;
  border-bottom: 1px solid #cbd5e0;
  padding: 8px 0;
  font-size: 14px;
  outline: none;
  color: #2d3748;
  background: transparent;
  transition: border-color 0.2s ease;

  &:focus {
    border-bottom: 2px solid #1e6038;
  }
`;

const TextAreaInput = styled.textarea`
  width: 100%;
  border: none;
  border-bottom: 1px solid #cbd5e0;
  padding: 8px 0;
  font-size: 14px;
  outline: none;
  color: #2d3748;
  background: transparent;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    border-bottom: 2px solid #1e6038;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14.5px;
  color: #2d3748;
  cursor: pointer;
  user-select: none;

  input[type="radio"], input[type="checkbox"] {
    accent-color: #1e6038;
    width: 17px;
    height: 17px;
    cursor: pointer;
  }

  &:hover {
    color: #1e6038;
  }
`;

const CategoryBox = styled.div`
  background: #1e6038;
  color: #ffffff;
  padding: 16px 20px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 15px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
`;

const RatingScaleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
`;

const ScaleOption = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  min-width: 28px;

  input[type="radio"] {
    accent-color: #1e6038;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const NoticeCard = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 18px;
  margin-top: 10px;
  font-size: 13.5px;
  color: #4a5568;
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;

const SubmitButton = styled.button`
  background-color: #1e6038;
  color: white;
  border: none;
  padding: 11px 28px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #154628;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  background-color: transparent;
  color: #1e6038;
  border: none;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ReviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #edf2f7;
  font-size: 14px;

  .label {
    color: #718096;
    font-weight: 500;
  }

  .val {
    color: #1a202c;
    font-weight: 600;
    text-align: right;
    max-width: 60%;
  }
`;

const DOCTORS_LIST = [
    "DR. S. SHANMUGASUNDARAM / DR. S. சண்முகசுந்தரம்",
    "DR. S. MURALI / DR. S. முரளி",
    "DR. D. PRIYADHARSHINI / DR. D. பிரியதர்ஷினி",
    "DR. A. JAYALAKSHMI / DR. A. ஜெயலட்சுமி",
    "DR. M. GOWTHAMAN / DR. M. கெளதமன்",
    "DR. M. SHANMUGAVEL / DR. M. சண்முகவேல்",
    "DR. R. SURESH KUMAR / DR. R. சுரேஷ் குமார்",
    "DR. B. KARTHIK / DR. B. கார்த்திக்",
    "DR. C. KALYANA SUNDARAM / DR. C. கல்யாண சுந்தரம்",
    "DR. T. KANAGARAJ / DR. T. கனகராஜ்",
    "DR. M. SARAVANAN / DR. M. சரவணன்",
    "DR. S. PRAVEEN KUMAR / DR. S. பிரவீன் குமார்",
    "DR. V. RAMANATHAN / DR. V. ராமநாதன்",
    "DR. N. ARUNKUMAR / DR. N. அருண்குமார்",
    "DR. K. VELAVAN / DR. K. வேலவன்",
    "DR. S. KAVITHA / DR. S. கவிதா",
    "DR. M. SANGEETHA / DR. M. சங்கீதா",
    "DR. G. BALASUBRAMANIAN / DR. G. பாலசுப்ரமணியன்",
    "DR. P. ANAND / DR. P. ஆனந்த்",
    "DR. R. DEEPA / DR. R. தீபா",
    "DR. K. VIGNESH / DR. K. விக்னேஷ்",
    "DR. S. SENTHILKUMAR / DR. S. செந்தில்குமார்",
    "DR. M. PRABAKARAN / DR. M. பிரபாகரன்",
    "DR. R. DINESH / DR. R. தினேஷ்",
];

const CATEGORY_OPTIONS = ["Railway", "ECHS", "Pay", "ESI"];

const REASON_OPTIONS = [
    "Regular Hospital / வழக்கமான  மருத்துவமனை",
    "Lives near the hospital / மருத்துவமனைக்கு அருகில் வசிக்கிறேன்",
    "My doctor practices here / என் மருத்துவர் இங்கே பணியாற்றுகிறார்",
    "Advertisement / விளம்பரம்",
    "Recommendation from friends or family / நண்பர்கள் மற்றும் குடும்பத்தினர் பரிந்துரைத்தனர்",
    "Medical Camp / மருத்துவ முகாம்",
    "My doctor referred me / என் மருத்துவர் என்னை இங்கே அனுப்பினார்",
];

const RATING_OPTIONS = [
    "Very Poor / மிகவும் மோசம்",
    "Poor / மோசம்",
    "Average / சராசரி",
    "Good / நன்று",
    "Very Good / மிகவும் நன்று",
];

const initialFormState = {
    patient_name: "",
    mobile_number: "",
    op_number: "",
    selected_doctors: [],
    has_other_doctor: false,
    other_doctor: "",
    doctor_name: "",
    category: "",
    other_category: "",
    overall_experience: "",
    recommend_rating: "",
    chose_reason: "",
    other_chose_reason: "",
    refer: "",
    referral_doctor_name: "",


    registration_experience: "",
    doctor_consultation_experience: "",
    nursing_care: "",
    diagnostic_experience: "",
    housekeeping_experience: "",
    pharmacy_experience: "",
    canteen_experience: "",
    op_insurance_experience: "",
    op_billing_experience: "",
    cleanliness_experience: "",

    suggestion_or_observation: "",
    special_mention_staff: "",
};


const OutPatientfeedForm = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [viewMode, setViewMode] = useState("form"); // "form" | "review"

    // Parse URL params for auto-fill on QR scan
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const op = searchParams.get("op_number") || searchParams.get("op") || "";
        const name = searchParams.get("patient_name") || searchParams.get("name") || "";

        if (op || name) {
            setFormData((prev) => ({
                ...prev,
                op_number: op || prev.op_number,
                patient_name: name || prev.patient_name,
            }));
        }
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleClear = () => {
        setFormData(initialFormState);
        toast.info("Form cleared");
    };

    const handleDoctorToggle = (docName) => {
        setFormData((prev) => {
            const exists = prev.selected_doctors.includes(docName);
            const updated = exists
                ? prev.selected_doctors.filter((d) => d !== docName)
                : [...prev.selected_doctors, docName];
            return { ...prev, selected_doctors: updated };
        });
    };

    const handleOpenReview = (e) => {
        e.preventDefault();
        setViewMode("review");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFinalSubmit = async () => {
        const finalDoctors = [
            ...formData.selected_doctors,
            formData.has_other_doctor && formData.other_doctor ? `Other: ${formData.other_doctor}` : formData.has_other_doctor ? "Other" : ""
        ].filter(Boolean).join(", ");

        const finalCategory = formData.category === "Other" && formData.other_category
            ? `Other: ${formData.other_category}`
            : formData.category;

        const finalChoseReason = formData.chose_reason === "Other" && formData.other_chose_reason
            ? `Other: ${formData.other_chose_reason}`
            : formData.chose_reason;

        const postData = {
            ...formData,
            doctor_name: finalDoctors,
            category: finalCategory,
            chose_hospital_reason: finalChoseReason,
        };

        setLoading(true);
        try {
            const primaryEndpoint = `${HMSURL}outpatient-feedback/`;
            const altEndpoint = `${HMSURL}hospital/outpatient-feedback/`;

            let response = await apiRequest(primaryEndpoint, "POST", postData);
            if (!response || !response.status || response.status >= 400) {
                response = await apiRequest(altEndpoint, "POST", postData);
            }

            if (response && (response.status === 201 || response.status === 200 || response.data?.message)) {
                toast.success("OutPatient Feedback submitted successfully! Thank you.");
                setSubmitted(true);
            } else {
                let rawRes = await fetch(primaryEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postData),
                });
                if (!rawRes.ok) {
                    rawRes = await fetch(altEndpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(postData),
                    });
                }
                if (rawRes.ok) {
                    toast.success("OutPatient Feedback submitted successfully! Thank you.");
                    setSubmitted(true);
                } else {
                    toast.error("Failed to submit feedback. Please try again.");
                }
            }
        } catch (err) {
            console.error("Submission error:", err);
            toast.error("An error occurred while submitting feedback.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <PageContainer>
                <FormWrapper>
                    <HeaderCard style={{ textAlign: "center", paddingTop: "40px", paddingBottom: "40px" }}>
                        <Title>Thank You!</Title>
                        <Subtitle style={{ fontSize: "17px", marginTop: "12px", marginBottom: "24px" }}>
                            Your feedback has been submitted successfully.
                        </Subtitle>
                        <NoticeCard style={{ textAlign: "left", marginBottom: "24px" }}>
                            Thank you for your valuable feedback. Providing quality outpatient services has always been Shanmuga's primary Aim.{" "}
                            <em>"A legacy of caring"</em>
                        </NoticeCard>
                        <SubmitButton
                            onClick={() => {
                                setFormData(initialFormState);
                                setSubmitted(false);
                                setViewMode("form");
                            }}
                        >
                            Submit Another Response
                        </SubmitButton>
                    </HeaderCard>
                </FormWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {viewMode === "review" ? (
                <FormWrapper>
                    <HeaderCard style={{ borderTop: "8px solid #1e6038" }}>
                        <Title>SHANMUGA HOSPITAL</Title>
                        <h3 style={{ margin: "0 0 10px 0", color: "#1e6038", fontWeight: 700 }}>
                            📋 REVIEW YOUR FEEDBACK / உங்கள் கருத்துகளைச் சரிபார்க்கவும்
                        </h3>
                        <Subtitle>
                            Please review all the information you filled in before final submission to Shanmuga Hospital:
                        </Subtitle>
                    </HeaderCard>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <Card>
                            <h4 style={{ margin: "0 0 12px 0", color: "#1e6038", fontSize: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
                                Patient Details / நோயாளி விவரங்கள்
                            </h4>
                            <ReviewItem><span className="label">Patient Name:</span><span className="val">{formData.patient_name || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Contact Number:</span><span className="val">{formData.mobile_number || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">OP Number:</span><span className="val">{formData.op_number || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Consulting Doctor(s):</span><span className="val">
                                {[
                                    ...formData.selected_doctors,
                                    formData.has_other_doctor && formData.other_doctor ? `Other: ${formData.other_doctor}` : formData.has_other_doctor ? "Other" : ""
                                ].filter(Boolean).join(", ") || "-"}
                            </span></ReviewItem>
                            <ReviewItem><span className="label">Category:</span><span className="val">
                                {formData.category === "Other" && formData.other_category ? `Other: ${formData.other_category}` : formData.category || "-"}
                            </span></ReviewItem>
                        </Card>

                        <Card>
                            <h4 style={{ margin: "0 0 12px 0", color: "#1e6038", fontSize: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
                                Overall Rating / ஒட்டுமொத்த மதிப்பீடு
                            </h4>
                            <ReviewItem><span className="label">Overall Experience:</span><span className="val">{formData.overall_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Recommend Score (1-10):</span><span className="val">{formData.recommend_rating ? `${formData.recommend_rating} / 10` : "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Reason for Choosing:</span><span className="val">
                                {formData.chose_reason === "Other" && formData.other_chose_reason ? `Other: ${formData.other_chose_reason}` : formData.chose_reason || "-"}
                            </span></ReviewItem>
                            <ReviewItem><span className="label">Refer:</span><span className="val">{formData.refer || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Referral Doctor:</span><span className="val">{formData.referral_doctor_name || "-"}</span></ReviewItem>
                        </Card>


                        <Card>
                            <h4 style={{ margin: "0 0 12px 0", color: "#1e6038", fontSize: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
                                Service Ratings Breakdown / சேவைகளின் மதிப்பீடு
                            </h4>
                            <ReviewItem><span className="label">Front Office Registration:</span><span className="val">{formData.registration_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Doctor Consultation:</span><span className="val">{formData.doctor_consultation_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Nursing Care:</span><span className="val">{formData.nursing_care || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Diagnostic Services:</span><span className="val">{formData.diagnostic_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Housekeeping Cleanliness:</span><span className="val">{formData.housekeeping_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Pharmacy Experience:</span><span className="val">{formData.pharmacy_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Canteen Experience:</span><span className="val">{formData.canteen_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">OP Insurance:</span><span className="val">{formData.op_insurance_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">OP Billing:</span><span className="val">{formData.op_billing_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Premises Cleanliness:</span><span className="val">{formData.cleanliness_experience || "-"}</span></ReviewItem>
                        </Card>


                        <Card>
                            <h4 style={{ margin: "0 0 12px 0", color: "#1e6038", fontSize: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
                                Suggestions & Mentions / கருத்துகள் & பாராட்டுக்கள்
                            </h4>
                            <ReviewItem><span className="label">Suggestions / Observations:</span><span className="val">{formData.suggestion_or_observation || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Special Staff Mention:</span><span className="val">{formData.special_mention_staff || "-"}</span></ReviewItem>
                        </Card>

                        <NoticeCard>
                            Thank you for reviewing your responses. Click Confirm & Submit below to finalize your submission.
                        </NoticeCard>

                        <ButtonRow>
                            <ClearButton type="button" onClick={() => setViewMode("form")}>
                                ✏️ Edit Form / திருத்தவும்
                            </ClearButton>
                            <SubmitButton type="button" onClick={handleFinalSubmit} disabled={loading}>
                                {loading ? "Submitting..." : "✅ Confirm & Submit / சமர்ப்பிக்கவும்"}
                            </SubmitButton>
                        </ButtonRow>
                    </div>
                </FormWrapper>
            ) : (
                <FormWrapper>
                    <HeaderCard>
                        <Title>SHANMUGA HOSPITAL</Title>
                        <h3 style={{ margin: "0 0 10px 0", color: "#2d3748", fontWeight: 600 }}>
                            OUT PATIENT FEEDBACK FORM / அவுட்பேஷண்ட் கருத்துப் படிவம்
                        </h3>
                        <Subtitle>
                            Dear Patient / Attender, please share your valuable feedback to help us continuously improve our services.
                        </Subtitle>
                    </HeaderCard>

                    <form onSubmit={handleOpenReview}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            
                            {/* 1. Patient Name */}
                            <Card>
                                <QuestionLabel>
                                    PATIENT NAME <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <TextInput
                                    type="text"
                                    placeholder="Your answer"
                                    required
                                    value={formData.patient_name}
                                    onChange={(e) => handleChange("patient_name", e.target.value)}
                                />
                            </Card>

                            {/* 2. Contact Number */}
                            <Card>
                                <QuestionLabel>
                                    CONTACT NUMBER <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <TextInput
                                    type="text"
                                    placeholder="Your answer"
                                    required
                                    value={formData.mobile_number}
                                    onChange={(e) => handleChange("mobile_number", e.target.value)}
                                />
                            </Card>

                            {/* 3. OP Number */}
                            <Card>
                                <QuestionLabel>
                                    OP Number / அவுட்பேஷண்ட் எண் <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <TextInput
                                    type="text"
                                    placeholder="Your answer"
                                    required
                                    value={formData.op_number}
                                    onChange={(e) => handleChange("op_number", e.target.value)}
                                />
                            </Card>

                            {/* 4. Doctor Name Selection (Copied from InPatientFeedbackForm.js) */}
                            <Card>
                                <QuestionLabel>
                                    Doctor / மருத்துவர் <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <OptionsContainer>
                                    {DOCTORS_LIST.map((doc) => (
                                        <OptionLabel key={doc}>
                                            <input
                                                type="checkbox"
                                                checked={formData.selected_doctors.includes(doc)}
                                                onChange={() => handleDoctorToggle(doc)}
                                            />
                                            {doc}
                                        </OptionLabel>
                                    ))}

                                    <OptionLabel>
                                        <input
                                            type="checkbox"
                                            checked={formData.has_other_doctor}
                                            onChange={(e) => handleChange("has_other_doctor", e.target.checked)}
                                        />
                                        Other:
                                    </OptionLabel>

                                    {formData.has_other_doctor && (
                                        <TextInput
                                            type="text"
                                            placeholder="Specify doctor name"
                                            value={formData.other_doctor}
                                            onChange={(e) => handleChange("other_doctor", e.target.value)}
                                            style={{ marginTop: "4px", width: "90%" }}
                                        />
                                    )}
                                </OptionsContainer>
                            </Card>

                            {/* 5. Category Selection (Copied from InPatientFeedbackForm.js) */}
                            <Card>
                                <QuestionLabel>
                                    category / வகை <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <OptionsContainer>
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <OptionLabel key={cat}>
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={formData.category === cat}
                                                onChange={() => handleChange("category", cat)}
                                            />
                                            {cat}
                                        </OptionLabel>
                                    ))}

                                    <OptionLabel>
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Other"
                                            checked={formData.category === "Other"}
                                            onChange={() => handleChange("category", "Other")}
                                        />
                                        Other:
                                    </OptionLabel>

                                    {formData.category === "Other" && (
                                        <TextInput
                                            type="text"
                                            placeholder="Specify category"
                                            value={formData.other_category}
                                            onChange={(e) => handleChange("other_category", e.target.value)}
                                            style={{ marginTop: "4px", width: "90%" }}
                                        />
                                    )}
                                </OptionsContainer>
                            </Card>

                            {/* 6. Overall Experience Rating (From Screenshot 2) */}
                            <Card>
                                <QuestionLabel>
                                    How would you rate your overall experience with Shanmuga Hospital? / சண்முகா மருத்துவமனையில் உங்கள் ஒட்டுமொத்த அனுபவத்தை எவ்வாறு மதிப்பீடு செய்வீர்கள்? <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="overall_experience"
                                                value={opt}
                                                checked={formData.overall_experience === opt}
                                                onChange={() => handleChange("overall_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 7. Recommend Rating Scale 1-10 (From Screenshot 2) */}
                            <Card>
                                <QuestionLabel>
                                    How likely are you to recommend shanmuga hospital to your friends and family? / உங்கள் நண்பர்கள் மற்றும் குடும்பத்தினருக்கு சண்முகா மருத்துவமனையை பரிந்துரை செய்ய நீங்கள் எவ்வளவு சாத்தியமாக இருக்கிறீர்கள்? <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <RatingScaleContainer>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <ScaleOption key={num}>
                                            <span>{num}</span>
                                            <input
                                                type="radio"
                                                name="recommend_rating"
                                                value={num.toString()}
                                                checked={formData.recommend_rating === num.toString()}
                                                onChange={() => handleChange("recommend_rating", num.toString())}
                                            />
                                        </ScaleOption>
                                    ))}
                                </RatingScaleContainer>
                            </Card>

                            {/* 8. Reason for Choosing Hospital */}
                            <Card>
                                <QuestionLabel>
                                    I chose Shanmuga Hospital Because / சண்முகா மருத்துவமனையை தேர்வு செய்த காரணம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {REASON_OPTIONS.map((reason) => (
                                        <OptionLabel key={reason}>
                                            <input
                                                type="radio"
                                                name="chose_reason"
                                                value={reason}
                                                checked={formData.chose_reason === reason}
                                                onChange={() => handleChange("chose_reason", reason)}
                                            />
                                            {reason}
                                        </OptionLabel>
                                    ))}
                                    <OptionLabel>
                                        <input
                                            type="radio"
                                            name="chose_reason"
                                            value="Other"
                                            checked={formData.chose_reason === "Other"}
                                            onChange={() => handleChange("chose_reason", "Other")}
                                        />
                                        Other:
                                    </OptionLabel>
                                    {formData.chose_reason === "Other" && (
                                        <TextInput
                                            type="text"
                                            placeholder="Specify reason"
                                            value={formData.other_chose_reason}
                                            onChange={(e) => handleChange("other_chose_reason", e.target.value)}
                                            style={{ marginTop: "4px", width: "90%" }}
                                        />
                                    )}
                                </OptionsContainer>
                            </Card>

                            {/* 9. Refer */}
                            <Card>
                                <QuestionLabel>
                                    Refer
                                </QuestionLabel>
                                <TextInput
                                    type="text"
                                    placeholder="Your answer"
                                    value={formData.refer}
                                    onChange={(e) => handleChange("refer", e.target.value)}
                                />
                            </Card>

                            {/* 10. Referral Doctor Name */}
                            <Card>
                                <QuestionLabel>
                                    Mention the name of the doctor who referred you to this hospital (If Applicable) / இந்த மருத்துவமனைக்கு உங்களைப் பரிந்துரைத்த மருத்துவரின் பெயரைக் குறிப்பிடவும் ( தேவைப்பட்டால்)
                                </QuestionLabel>
                                <TextInput
                                    type="text"
                                    placeholder="Your answer"
                                    value={formData.referral_doctor_name}
                                    onChange={(e) => handleChange("referral_doctor_name", e.target.value)}
                                />
                            </Card>

                            {/* 11. OutPatient Service Category Ratings Header Box */}
                            <CategoryBox>
                                Kindly give your valuable feedback to the below mentioned categories / கீழே உள்ள சேவைகளுக்கு உங்கள் அனுபவத்தை மதிப்பீடு செய்யுங்கள்:
                            </CategoryBox>

                            {/* Registration Experience */}
                            <Card>
                                <QuestionLabel>
                                    Front office - Registration Experience / முன்பகுதி -பதிவு அனுபவம்
                                </QuestionLabel>

                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="registration_experience"
                                                value={opt}
                                                checked={formData.registration_experience === opt}
                                                onChange={() => handleChange("registration_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Doctor Consultation Experience */}
                            <Card>
                                <QuestionLabel>
                                    Doctor Consultation Experience / மருத்துவர் கலந்தாய்வு அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="doctor_consultation_experience"
                                                value={opt}
                                                checked={formData.doctor_consultation_experience === opt}
                                                onChange={() => handleChange("doctor_consultation_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Nursing Care */}
                            <Card>
                                <QuestionLabel>
                                    Nursing Care & Support / செவிலியர் பராமரிப்பு
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="nursing_care"
                                                value={opt}
                                                checked={formData.nursing_care === opt}
                                                onChange={() => handleChange("nursing_care", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Diagnostic & Ancillary Services */}
                            <Card>
                                <QuestionLabel>
                                    Diagnostic & Ancillary Services (If applicable) / நோயறிதல் மற்றும் துணைச் சேவை (தேவைப்பட்டால்)
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="diagnostic_experience"
                                                value={opt}
                                                checked={formData.diagnostic_experience === opt}
                                                onChange={() => handleChange("diagnostic_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Cleanliness (Housekeeping) Experience */}
                            <Card>
                                <QuestionLabel>
                                    Cleanliness (Housekeeping) Experience / சுத்தம் (பராமரிப்பு) அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="housekeeping_experience"
                                                value={opt}
                                                checked={formData.housekeeping_experience === opt}
                                                onChange={() => handleChange("housekeeping_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Pharmacy Experience */}
                            <Card>
                                <QuestionLabel>
                                    Pharmacy Experience / மருந்தக அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="pharmacy_experience"
                                                value={opt}
                                                checked={formData.pharmacy_experience === opt}
                                                onChange={() => handleChange("pharmacy_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Canteen Experience */}
                            <Card>
                                <QuestionLabel>
                                    Canteen Experience / உணவக அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="canteen_experience"
                                                value={opt}
                                                checked={formData.canteen_experience === opt}
                                                onChange={() => handleChange("canteen_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* OP Insurance Experience */}
                            <Card>
                                <QuestionLabel>
                                    OP insurance Experience (If applicable) / காப்பீடு/TPA சேவை (தேவைப்பட்டால்)
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="op_insurance_experience"
                                                value={opt}
                                                checked={formData.op_insurance_experience === opt}
                                                onChange={() => handleChange("op_insurance_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* OP Billing Experience */}
                            <Card>
                                <QuestionLabel>
                                    OP Billing Experience / பில்லிங் அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="op_billing_experience"
                                                value={opt}
                                                checked={formData.op_billing_experience === opt}
                                                onChange={() => handleChange("op_billing_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>


                            {/* Premises Cleanliness Experience */}
                            <Card>
                                <QuestionLabel>
                                    Overall Hospital Premises Cleanliness / மருத்துவமனையின் மொத்த தூய்மை அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="cleanliness_experience"
                                                value={opt}
                                                checked={formData.cleanliness_experience === opt}
                                                onChange={() => handleChange("cleanliness_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Suggestion Text Card */}
                            <Card>
                                <QuestionLabel>
                                    Kindly Mention your Suggestion or Observation / சேவையை மேம்படுத்த எங்களுக்குத் துணை புரிய உங்கள் கருத்துகள் அல்லது பரிந்துரைகளை பகிரவும்:
                                </QuestionLabel>
                                <TextAreaInput
                                    rows={2}
                                    placeholder="Your answer"
                                    value={formData.suggestion_or_observation}
                                    onChange={(e) => handleChange("suggestion_or_observation", e.target.value)}
                                />
                            </Card>

                            {/* Special Mention Staff Card */}
                            <Card>
                                <QuestionLabel>
                                    If you would likely to make a special mention of any staff or care-team please do so here / சிறந்த சேவை அளித்த ஒரு பணியாளர் அல்லது குழுவினரை நீங்கள் பாராட்ட விரும்புகிறீர்களா? அவர்களின் பெயர் மற்றும் காரணத்தைக் குறிப்பிடவும்:
                                </QuestionLabel>
                                <TextAreaInput
                                    rows={2}
                                    placeholder="Your answer"
                                    value={formData.special_mention_staff}
                                    onChange={(e) => handleChange("special_mention_staff", e.target.value)}
                                />
                            </Card>

                            {/* Notice Card */}
                            <NoticeCard>
                                Thank you for your valuable feedback. Providing quality outpatient services has always been Shanmuga's primary Aim.{" "}
                                <span style={{ fontWeight: 700, fontStyle: "italic", textDecoration: "underline" }}>"A legacy of caring"</span>
                            </NoticeCard>

                            {/* Submit & Clear buttons */}
                            <ButtonRow>
                                <SubmitButton type="submit" disabled={loading}>
                                    {loading ? "Submitting..." : "📋 Preview & Submit / சரிபார்க்கவும்"}
                                </SubmitButton>
                                <ClearButton type="button" onClick={handleClear}>
                                    Clear form
                                </ClearButton>
                            </ButtonRow>
                        </div>
                    </form>
                </FormWrapper>
            )}
        </PageContainer>
    );
};

export default OutPatientfeedForm;

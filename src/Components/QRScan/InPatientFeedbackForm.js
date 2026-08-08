import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest"

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
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HeaderCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border-top: 10px solid #1e6038;
  padding: 28px 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  color: #1e6038;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.3px;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #4a5568;
  font-size: 15px;
  line-height: 1.5;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: #1e6038;
  }
`;

const QuestionLabel = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
  line-height: 1.5;

  span.tamil {
    font-weight: 500;
    color: #2d3748;
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
  gap: 12px;
  font-size: 14.5px;
  color: #2d3748;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 6px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f7fafc;
  }

  input[type="radio"] {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #a0aec0;
    border-radius: 50%;
    outline: none;
    cursor: pointer;
    display: grid;
    place-content: center;
    margin: 0;
    transition: all 0.2s ease;

    &:checked {
      border-color: #1e6038;

      &::before {
        content: "";
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #1e6038;
      }
    }
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px 0;
  border: none;
  border-bottom: 1px solid #cbd5e0;
  font-size: 15px;
  color: #2d3748;
  outline: none;
  background: transparent;
  transition: border-color 0.2s ease;

  &:focus {
    border-bottom: 2px solid #1e6038;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const TextAreaInput = styled.textarea`
  width: 100%;
  padding: 10px 0;
  border: none;
  border-bottom: 1px solid #cbd5e0;
  font-size: 15px;
  color: #2d3748;
  outline: none;
  background: transparent;
  resize: vertical;
  min-height: 50px;
  font-family: inherit;

  &:focus {
    border-bottom: 2px solid #1e6038;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const NoticeCard = styled(Card)`
  background: #fcfcfc;
  border-left: 5px solid #1e6038;
  color: #2d3748;
  font-size: 15px;
  line-height: 1.6;

  strong {
    color: #1e6038;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const SubmitButton = styled.button`
  background-color: #1e6038;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: #164729;
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #1e6038;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;

  &:hover {
    background-color: #edf2f7;
  }
`;

const AdminToggleBar = styled.div`
  width: 100%;
  max-width: 730px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const ToggleButton = styled.button`
  background-color: #2b6cb0;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #2c5282;
  }
`;

const TableCard = styled.div`
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;

  th, td {
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    text-align: left;
    font-size: 14px;
  }

  th {
    background-color: #f7fafc;
    font-weight: 600;
    color: #2d3748;
  }
`;

const RatingBadge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) =>
        props.val === "Very Good / மிகவும் நன்று" || props.val === "Good / நன்று"
            ? "#c6f6d5"
            : props.val === "Average / சராசரி"
                ? "#feebc8"
                : props.val
                    ? "#fed7d7"
                    : "#edf2f7"};
  color: ${(props) =>
        props.val === "Very Good / மிகவும் நன்று" || props.val === "Good / நன்று"
            ? "#22543d"
            : props.val === "Average / சராசரி"
                ? "#744210"
                : props.val
                    ? "#742a2a"
                    : "#4a5568"};
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 16px;
`;

const ModalCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    max-width: 650px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    padding: 24px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
`;

const ReviewItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px dashed #e2e8f0;
    font-size: 14px;
    .label {
        font-weight: 600;
        color: #4a5568;
    }
    .val {
        color: #1a202c;
        font-weight: 700;
        text-align: right;
        max-width: 60%;
    }
`;


const RATING_OPTIONS = [
    "Very Poor / மிகவும் மோசம்",
    "Poor / மோசம்",
    "Average / சராசரி",
    "Good / நன்று",
    "Very Good / மிகவும் நன்று",
];

const DOCTOR_OPTIONS = [
    "DR. P. S. PANNEER SELVAM / DR பன்னீர்செல்வம்",
    "DR. R. MURUGAVEL / DR முருகவேல்",
    "DR. P. PRABUSANKAR / DR பிரபுசங்கர்",
    "DR. D. PRIYADHARSHINI / DR பிரியதர்ஷினி",
    "DR. B. ARUNKUMAR / DR அருண்குமார்",
    "DR. R. VIDHYA / DR வித்யா",
    "DR. G. PRASANNA / DR பிரசன்னா",
    "DR. P. ARUNRAJ / DR அருண்ராஜ்",
    "DR. SRIKANT SHANKAR / DR ஸ்ரீகாந்த் ஷங்கர்",
    "DR. SATHIAN RAGHAVAN / DR சதியன் ராகவன்",
    "DR. S. VIJAYKANNAN / DR விஜயகண்ணன்",
    "DR. J. JEGAPRIYA / DR ஜெகபிரியா",
    "DR. S. SHIVA KUMAR / DR சிவகுமார்",
    "DR. R. KARTHIKEYAN / DR கார்த்திகேயன்",
    "DR. SHIKHA KC / DR ஷிகா",
    "DR. S. SANGEETHA / DR சங்கீதா",
    "DR. VIGNESHWARAN / DR விக்னேஸ்வரன்",
    "DR. Geethanjali / DR கீதாஞ்சலி",
    "DR. D. VIGNESH / DR விக்னேஷ்",
    "DR. PAVITHRA / DR பவித்ரா",
    "Dr. VELRAJ / DR. வேல்ராஜ்",
    "DR. RAMESH ETHIRAJ / Dr. ரமேஷ் எத்திராஜ்",
    "DR. SIDDHARTH / Dr. சித்தார்த்",
    "Dr. Nerthiha / Dr. நேர்த்திகா",
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

const initialFormState = {
    feedback_type: "In-Hospital Feedback",
    patient_name: "",
    discharge_date: "",
    mobile_number: "",
    ip_number: "",
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
    referral_doctor_name: "",

    admission_experience: "",

    in_room_experience: "",
    in_room_cleanliness_experience: "",
    doctor_care: "",
    nursing_care: "",
    diagnostic_experience: "",
    cleanliness_experience: "",

    pharmacy_experience: "",
    canteen_experience: "",
    food_quality: "",
    ip_billing_experience: "",
    ip_insurance_experience: "",
    discharge_experience: "",
    suggestion_or_observation: "",
    special_mention_staff: "",
};

const InPatientFeedbackForm = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // View mode: "form" | "review"
    const [viewMode, setViewMode] = useState("form");


    const token = localStorage.getItem("access_token");

    // Read URL query parameters for QR scan auto-fill (e.g. ?ip_number=565&patient_name=John)
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const ip = searchParams.get("ip_number") || searchParams.get("ip") || "";
        const name = searchParams.get("patient_name") || searchParams.get("name") || "";
        const type = searchParams.get("feedback_type") || searchParams.get("type") || "";

        if (ip || name || type) {
            setFormData((prev) => ({
                ...prev,
                ip_number: ip || prev.ip_number,
                patient_name: name || prev.patient_name,
                feedback_type: type === "PDC" ? "Post Discharge Call (PDC)" : prev.feedback_type,
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

    const [showReviewModal, setShowReviewModal] = useState(false);

    const handleOpenReview = (e) => {
        e.preventDefault();
        setViewMode("review");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    const handleFinalSubmit = async () => {
        setShowReviewModal(false);

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
            const primaryEndpoint = `${HMSURL}inpatient-feedback/`;
            const altEndpoint = `${HMSURL}hospital/inpatient-feedback/`;

            let response = await apiRequest(primaryEndpoint, "POST", postData);
            if (!response || !response.status || response.status >= 400) {
                response = await apiRequest(altEndpoint, "POST", postData);
            }

            if (response && (response.status === 201 || response.status === 200 || response.data?.message)) {
                toast.success("Feedback submitted successfully! Thank you.");
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
                    toast.success("Feedback submitted successfully! Thank you.");
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
                            Thank you for your valuable feedback. Providing quality services has always been Shanmuga's primary Aim.{" "}
                            <em>"A legacy of caring"</em>
                        </NoticeCard>
                        <SubmitButton
                            onClick={() => {
                                setFormData(initialFormState);
                                setSubmitted(false);
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
            {/* Navigation Toggle Bar */}
            <AdminToggleBar style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <ToggleButton onClick={() => setViewMode(viewMode === "form" ? "review" : "form")}>
                    {viewMode === "form" ? "📋 Review Filled Data / விவரங்களைச் சரிபார்க்கவும்" : "📝 Back to Edit Form / படிவத்தை மாற்றியமைக்க"}
                </ToggleButton>
            </AdminToggleBar>


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
                            <ReviewItem><span className="label">Feedback Type:</span><span className="val">{formData.feedback_type || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Patient Name:</span><span className="val">{formData.patient_name || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Discharge Date:</span><span className="val">{formData.discharge_date || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Contact Number:</span><span className="val">{formData.mobile_number || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">IP Number:</span><span className="val">{formData.ip_number || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Attending Doctor(s):</span><span className="val">
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
                            <ReviewItem><span className="label">Referral Doctor:</span><span className="val">{formData.referral_doctor_name || "-"}</span></ReviewItem>
                        </Card>

                        <Card>
                            <h4 style={{ margin: "0 0 12px 0", color: "#1e6038", fontSize: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
                                Service Ratings Breakdown / சேவைகளின் மதிப்பீடு
                            </h4>
                            <ReviewItem><span className="label">Admission Process Experience:</span><span className="val">{formData.admission_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">In Room Experience:</span><span className="val">{formData.in_room_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Room Cleanliness (Housekeeping):</span><span className="val">{formData.in_room_cleanliness_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Doctor Consultation Experience:</span><span className="val">{formData.doctor_care || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Nursing Experience:</span><span className="val">{formData.nursing_care || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Diagnostic & Ancillary Services:</span><span className="val">{formData.diagnostic_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Pharmacy Experience:</span><span className="val">{formData.pharmacy_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Canteen Experience:</span><span className="val">{formData.canteen_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Food Quality:</span><span className="val">{formData.food_quality || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">IP Insurance Experience:</span><span className="val">{formData.ip_insurance_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">IP Billing Experience:</span><span className="val">{formData.ip_billing_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Discharge Experience:</span><span className="val">{formData.discharge_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Overall Hospital Premises Cleanliness:</span><span className="val">{formData.cleanliness_experience || "-"}</span></ReviewItem>
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
                            IN PATIENT FEEDBACK FORM / உள் நோயாளி கருத்துப் படிவம்
                        </h3>
                        <Subtitle>
                            Dear Patient / Attender, please share your valuable feedback to help us continuously improve our services.
                        </Subtitle>
                    </HeaderCard>

                    <form onSubmit={handleOpenReview}>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Feedback Type Card */}
                            <Card style={{ borderLeft: "5px solid #1e6038" }}>
                                <QuestionLabel>
                                    Feedback Type <span style={{ color: "#e53e3e" }}>*</span> / கருத்து வகை
                                </QuestionLabel>
                                <OptionsContainer style={{ flexDirection: "row", flexWrap: "wrap", gap: "24px" }}>
                                    {["In-Hospital Feedback", "Post Discharge Call (PDC)"].map((typeOpt) => (
                                        <OptionLabel key={typeOpt}>
                                            <input
                                                type="radio"
                                                name="feedback_type"
                                                value={typeOpt}
                                                checked={formData.feedback_type === typeOpt}
                                                onChange={() => handleChange("feedback_type", typeOpt)}
                                                required
                                            />
                                            {typeOpt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Patient Name Card */}
                            <Card>
                                <QuestionLabel>
                                    Patient Name / பெயர் <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <TextInput
                                    type="text"
                                    placeholder="Your answer"
                                    value={formData.patient_name}
                                    onChange={(e) => handleChange("patient_name", e.target.value)}
                                    required
                                />
                            </Card>

                            {/* Discharge Date Card */}
                            <Card>
                                <QuestionLabel style={{ marginBottom: "4px" }}>
                                    Discharge Date
                                </QuestionLabel>
                                <div style={{ fontSize: "13px", color: "#718096", marginBottom: "12px" }}>
                                    Date
                                </div>
                                <TextInput
                                    type="date"
                                    value={formData.discharge_date}
                                    onChange={(e) => handleChange("discharge_date", e.target.value)}
                                    style={{ maxWidth: "240px" }}
                                />
                            </Card>

                            {/* Contact Number Card */}
                            <Card>
                                <QuestionLabel>
                                    Contact Number / தொடர்பு எண் <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <TextInput
                                    type="text"
                                    placeholder="Your answer"
                                    value={formData.mobile_number}
                                    onChange={(e) => handleChange("mobile_number", e.target.value)}
                                    required
                                />
                            </Card>

                            {/* IP Number Card */}
                            <Card>
                                <QuestionLabel>
                                    IP Number / உள் நோயாளி எண் <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <TextInput
                                    type="text"
                                    placeholder="Your answer"
                                    value={formData.ip_number}
                                    onChange={(e) => handleChange("ip_number", e.target.value)}
                                    required
                                />
                            </Card>

                            {/* Doctor Selection Card */}
                            <Card>
                                <QuestionLabel>
                                    Doctor / மருத்துவர் <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <OptionsContainer>
                                    {DOCTOR_OPTIONS.map((docOpt) => (
                                        <OptionLabel key={docOpt}>
                                            <input
                                                type="checkbox"
                                                checked={formData.selected_doctors.includes(docOpt)}
                                                onChange={() => handleDoctorToggle(docOpt)}
                                                style={{ width: "18px", height: "18px", accentColor: "#1e6038", cursor: "pointer" }}
                                            />
                                            {docOpt}
                                        </OptionLabel>
                                    ))}
                                    <OptionLabel style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.has_other_doctor}
                                            onChange={(e) => handleChange("has_other_doctor", e.target.checked)}
                                            style={{ width: "18px", height: "18px", accentColor: "#1e6038", cursor: "pointer" }}
                                        />
                                        <span>Other:</span>
                                        {formData.has_other_doctor && (
                                            <TextInput
                                                type="text"
                                                placeholder="Type doctor name..."
                                                value={formData.other_doctor}
                                                onChange={(e) => handleChange("other_doctor", e.target.value)}
                                                style={{ flex: 1, marginLeft: "8px" }}
                                            />
                                        )}
                                    </OptionLabel>
                                </OptionsContainer>
                            </Card>

                            {/* Category Card */}
                            <Card>
                                <QuestionLabel>
                                    category / வகை <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <OptionsContainer>
                                    {CATEGORY_OPTIONS.map((catOpt) => (
                                        <OptionLabel key={catOpt}>
                                            <input
                                                type="radio"
                                                name="category"
                                                value={catOpt}
                                                checked={formData.category === catOpt}
                                                onChange={() => handleChange("category", catOpt)}
                                                required
                                            />
                                            {catOpt}
                                        </OptionLabel>
                                    ))}
                                    <OptionLabel style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Other"
                                            checked={formData.category === "Other"}
                                            onChange={() => handleChange("category", "Other")}
                                            required
                                        />
                                        <span>Other:</span>
                                        {formData.category === "Other" && (
                                            <TextInput
                                                type="text"
                                                placeholder=""
                                                value={formData.other_category}
                                                onChange={(e) => handleChange("other_category", e.target.value)}
                                                style={{ flex: 1, marginLeft: "8px" }}
                                            />
                                        )}
                                    </OptionLabel>
                                </OptionsContainer>
                            </Card>

                            {/* Overall Experience Card */}
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
                                                required
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* Recommend Rating 1-10 Scale Card */}
                            <Card>
                                <QuestionLabel>
                                    How likely are you to recommend shanmuga hospital to your friends and family? / உங்கள் நண்பர்கள் மற்றும் குடும்பத்தினருக்கு சண்முகா மருத்துவமனையை பரிந்துரை செய்ய நீங்கள் எவ்வளவு சாத்தியமாக இருக்கிறீர்கள்? <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", overflowX: "auto", padding: "16px 0 8px 0" }}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <div key={num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", flex: 1, minWidth: "36px" }}>
                                            <span style={{ fontSize: "14.5px", fontWeight: 600, color: "#2d3748" }}>{num}</span>
                                            <input
                                                type="radio"
                                                name="recommend_rating"
                                                value={String(num)}
                                                checked={formData.recommend_rating === String(num)}
                                                onChange={() => handleChange("recommend_rating", String(num))}
                                                required
                                                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#1e6038" }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Reason for choosing Shanmuga Hospital Card */}
                            <Card>
                                <QuestionLabel>
                                    I chose Shanmuga Hospital Because / சண்முகா மருத்துவமனையை தேர்வு செய்த காரணம் <span style={{ color: "#e53e3e" }}>*</span>
                                </QuestionLabel>
                                <OptionsContainer>
                                    {REASON_OPTIONS.map((reasonOpt) => (
                                        <OptionLabel key={reasonOpt}>
                                            <input
                                                type="radio"
                                                name="chose_reason"
                                                value={reasonOpt}
                                                checked={formData.chose_reason === reasonOpt}
                                                onChange={() => handleChange("chose_reason", reasonOpt)}
                                                required
                                            />
                                            {reasonOpt}
                                        </OptionLabel>
                                    ))}
                                    <OptionLabel style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <input
                                            type="radio"
                                            name="chose_reason"
                                            value="Other"
                                            checked={formData.chose_reason === "Other"}
                                            onChange={() => handleChange("chose_reason", "Other")}
                                            required
                                        />
                                        <span>Other:</span>
                                        {formData.chose_reason === "Other" && (
                                            <TextInput
                                                type="text"
                                                placeholder=""
                                                value={formData.other_chose_reason}
                                                onChange={(e) => handleChange("other_chose_reason", e.target.value)}
                                                style={{ flex: 1, marginLeft: "8px" }}
                                            />
                                        )}
                                    </OptionLabel>
                                </OptionsContainer>
                            </Card>

                            {/* Referral Doctor Name Card */}
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






                            {/* Header Card for Category Ratings */}
                            <HeaderCard style={{ borderTop: "6px solid #1e6038", background: "#f7fafc", padding: "18px 24px" }}>
                                <h4 style={{ margin: 0, color: "#1e6038", fontSize: "16px", fontWeight: 700, lineHeight: 1.5 }}>
                                    Kindly give your valuable feedback to the below mentioned categories / கீழே உள்ள சேவைகளுக்கு உங்கள் அனுபவத்தை மதிப்பீடு செய்யுங்கள்:
                                </h4>
                            </HeaderCard>

                            {/* 1. Admission Process Experience */}
                            <Card>
                                <QuestionLabel>
                                    Admission Process Experience / சேர்க்கை அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="admission_experience"
                                                value={opt}
                                                checked={formData.admission_experience === opt}
                                                onChange={() => handleChange("admission_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 2. In Room Experience */}
                            <Card>
                                <QuestionLabel>
                                    In Room Experience / உள் நோயாளி அறை அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="in_room_experience"
                                                value={opt}
                                                checked={formData.in_room_experience === opt}
                                                onChange={() => handleChange("in_room_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 3. In Room Cleanliness (Housekeeping) Experience */}
                            <Card>
                                <QuestionLabel>
                                    In Room Cleanliness (Housekeeping) Experience / உள் நோயாளி அறை தூய்மை அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="in_room_cleanliness_experience"
                                                value={opt}
                                                checked={formData.in_room_cleanliness_experience === opt}
                                                onChange={() => handleChange("in_room_cleanliness_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 4. Doctor Consultation Experience */}
                            <Card>
                                <QuestionLabel>
                                    Doctor Consultation Experience / மருத்துவர் ஆலோசனை அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="doctor_care"
                                                value={opt}
                                                checked={formData.doctor_care === opt}
                                                onChange={() => handleChange("doctor_care", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 5. Nursing Experience */}
                            <Card>
                                <QuestionLabel>
                                    Nursing Experience / செவிலியர் அனுபவம்
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

                            {/* 6. Diagnostic & Ancillary Services */}
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

                            {/* 7. Pharmacy Experience */}
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

                            {/* 8. Canteen Experience */}
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

                            {/* 9. Food Quality */}
                            <Card>
                                <QuestionLabel>
                                    Food Quality / உணவின் தரம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="food_quality"
                                                value={opt}
                                                checked={formData.food_quality === opt}
                                                onChange={() => handleChange("food_quality", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 10. IP insurance Experience */}
                            <Card>
                                <QuestionLabel>
                                    IP insurance Experience (If applicable) / உள் நோயாளி காப்பீடு/TPA சேவை (தேவைப்பட்டால்)
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="ip_insurance_experience"
                                                value={opt}
                                                checked={formData.ip_insurance_experience === opt}
                                                onChange={() => handleChange("ip_insurance_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 11. IP Billing Experience */}
                            <Card>
                                <QuestionLabel>
                                    IP Billing Experience / உள் நோயாளி பில்லிங் அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="ip_billing_experience"
                                                value={opt}
                                                checked={formData.ip_billing_experience === opt}
                                                onChange={() => handleChange("ip_billing_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 12. Discharge Experience */}
                            <Card>
                                <QuestionLabel>
                                    Discharge Experience / டிஸ்சார்ஜ் அனுபவம்
                                </QuestionLabel>
                                <OptionsContainer>
                                    {RATING_OPTIONS.map((opt) => (
                                        <OptionLabel key={opt}>
                                            <input
                                                type="radio"
                                                name="discharge_experience"
                                                value={opt}
                                                checked={formData.discharge_experience === opt}
                                                onChange={() => handleChange("discharge_experience", opt)}
                                            />
                                            {opt}
                                        </OptionLabel>
                                    ))}
                                </OptionsContainer>
                            </Card>

                            {/* 13. Overall Hospital Premises Cleanliness Experience */}
                            <Card>
                                <QuestionLabel>
                                    Overall Hospital Premises Cleanliness Experience / மருத்துவமனையின் மொத்த தூய்மை அனுபவம்
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

                            {/* Suggestion / Observation Text Card */}

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

                            {/* Special Mention Staff Text Card */}
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
                                Thank you for your valuable feedback. Providing quality services has always been Shanmuga's primary Aim.{" "}
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

            {/* Pre-submission Review Modal Overlay */}
            {showReviewModal && (
                <ModalOverlay onClick={() => setShowReviewModal(false)}>
                    <ModalCard onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ margin: "0 0 6px 0", color: "#1e6038" }}>
                            📋 Review Your Feedback / விவரங்களைச் சரிபார்க்கவும்
                        </h3>
                        <p style={{ margin: "0 0 16px 0", color: "#718096", fontSize: "13px" }}>
                            Please review all the responses you have selected before final submission to Shanmuga Hospital:
                        </p>

                        <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                            <ReviewItem>
                                <span className="label">Feedback Type:</span>
                                <span className="val">{formData.feedback_type || "-"}</span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Patient Name:</span>
                                <span className="val">{formData.patient_name || "-"}</span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Discharge Date:</span>
                                <span className="val">{formData.discharge_date || "-"}</span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Contact Number:</span>
                                <span className="val">{formData.mobile_number || "-"}</span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">IP Number:</span>
                                <span className="val">{formData.ip_number || "-"}</span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Attending Doctor(s):</span>
                                <span className="val">
                                    {[
                                        ...formData.selected_doctors,
                                        formData.has_other_doctor && formData.other_doctor ? `Other: ${formData.other_doctor}` : formData.has_other_doctor ? "Other" : ""
                                    ].filter(Boolean).join(", ") || "-"}
                                </span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Category:</span>
                                <span className="val">
                                    {formData.category === "Other" && formData.other_category ? `Other: ${formData.other_category}` : formData.category || "-"}
                                </span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Overall Experience:</span>
                                <span className="val">{formData.overall_experience || "-"}</span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Recommend Score (1-10):</span>
                                <span className="val">{formData.recommend_rating ? `${formData.recommend_rating} / 10` : "-"}</span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Reason for Choosing:</span>
                                <span className="val">
                                    {formData.chose_reason === "Other" && formData.other_chose_reason ? `Other: ${formData.other_chose_reason}` : formData.chose_reason || "-"}
                                </span>
                            </ReviewItem>
                            <ReviewItem>
                                <span className="label">Referral Doctor:</span>
                                <span className="val">{formData.referral_doctor_name || "-"}</span>
                            </ReviewItem>

                            <div style={{ margin: "14px 0 6px 0", fontWeight: 700, color: "#1e6038", fontSize: "13px" }}>
                                Ratings Summary:
                            </div>
                            <ReviewItem><span className="label">Admission Process:</span><span className="val">{formData.admission_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">In Room Experience:</span><span className="val">{formData.in_room_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Room Cleanliness:</span><span className="val">{formData.in_room_cleanliness_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Doctor Consultation:</span><span className="val">{formData.doctor_care || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Nursing Experience:</span><span className="val">{formData.nursing_care || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Diagnostic Services:</span><span className="val">{formData.diagnostic_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Pharmacy Experience:</span><span className="val">{formData.pharmacy_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Canteen Experience:</span><span className="val">{formData.canteen_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Food Quality:</span><span className="val">{formData.food_quality || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">IP Insurance:</span><span className="val">{formData.ip_insurance_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">IP Billing:</span><span className="val">{formData.ip_billing_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Discharge Experience:</span><span className="val">{formData.discharge_experience || "-"}</span></ReviewItem>
                            <ReviewItem><span className="label">Premises Cleanliness:</span><span className="val">{formData.cleanliness_experience || "-"}</span></ReviewItem>

                            {formData.suggestion_or_observation && (
                                <ReviewItem><span className="label">Suggestions:</span><span className="val">{formData.suggestion_or_observation}</span></ReviewItem>
                            )}
                            {formData.special_mention_staff && (
                                <ReviewItem><span className="label">Staff Mention:</span><span className="val">{formData.special_mention_staff}</span></ReviewItem>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <ClearButton type="button" onClick={() => setShowReviewModal(false)} style={{ padding: "9px 16px", fontSize: "13px" }}>
                                ✏️ Edit Responses / திருத்தவும்
                            </ClearButton>
                            <SubmitButton type="button" onClick={handleFinalSubmit} disabled={loading} style={{ padding: "9px 18px", fontSize: "13px" }}>
                                {loading ? "Submitting..." : "✅ Confirm & Submit / சமர்ப்பிக்கவும்"}
                            </SubmitButton>
                        </div>
                    </ModalCard>
                </ModalOverlay>
            )}
        </PageContainer>

    );
};

export default InPatientFeedbackForm;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import apiRequest from "../../Auth/apiRequest";
import { colors, PageWrapper } from "../GlobalStyles";
import { Calendar, User, BookOpen, GraduationCap, Home, Clock, Mail, Phone } from "lucide-react";

const FormCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 30px;
  max-width: 900px;
  margin: 20px auto;
  border-top: 5px solid ${colors.primary};
`;

const Title = styled.h2`
  color: ${colors.textMain};
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  color: ${colors.primaryDark};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  margin-top: 24px;
  border-bottom: 2px solid #e0f2f1;
  padding-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textMain};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconLeft = styled.div`
  position: absolute;
  left: 10px;
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
`;

const IconLeftINR = styled.span`
  position: absolute;
  left: 12px;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.textMuted};
  user-select: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 10px 10px 34px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${colors.textMain};
  background-color: #ffffff;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  }
  &:disabled {
    background-color: #f1f5f9;
    color: ${colors.textMuted};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 10px 10px 34px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${colors.textMain};
  background-color: #ffffff;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 5px;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: ${colors.textMain};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  &:checked + span {
    background-color: ${colors.primary};
  }
  &:focus + span {
    box-shadow: 0 0 1px ${colors.primary};
  }
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const SubmitButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  width: 100%;
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  &:hover:not(:disabled) {
    background: ${colors.primaryDark};
  }
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const RecalculateButton = styled.button`
  background: #f1f5f9;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: ${colors.textMain};
  cursor: pointer;
  margin-top: 4px;
  &:hover {
    background: #e2e8f0;
  }
`;

export default function Internship() {
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [degree, setDegree] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [isHosteller, setIsHosteller] = useState(false);

  const [feePerMonth, setFeePerMonth] = useState("3500");
  const [hostelFeePerMonth, setHostelFeePerMonth] = useState("3000");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [discountRemarks, setDiscountRemarks] = useState("");
  const [totalFee, setTotalFee] = useState("0");
  const [isManualTotal, setIsManualTotal] = useState(false);

  // Initial Payment states
  const [initialAmount, setInitialAmount] = useState("");
  const [initialMethod, setInitialMethod] = useState("CASH");
  const [initialDate, setInitialDate] = useState(new Date().toISOString().split("T")[0]);

  // Autocomplete data
  const [autocomplete, setAutocomplete] = useState({ colleges: [], departments: [], degrees: [] });
  const [submitting, setSubmitting] = useState(false);

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  // Load Autocomplete
  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest(`${HMSURL}hr/internships/autocomplete/`, "GET");
        if (res.success && res.data) {
          setAutocomplete({
            colleges: res.data.colleges || [],
            departments: res.data.departments || [],
            degrees: res.data.degrees || []
          });
        }
      } catch (err) {
        console.error("Error loading autocomplete options:", err);
      }
    })();
  }, [HMSURL]);

  // Auto calculate duration & total fee
  useEffect(() => {
    if (!startDate || !endDate) {
      setDuration("");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end < start) {
      setDuration("Invalid dates");
      return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calendar months difference
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) {
      months -= 1;
    }

    let desc = "";
    if (diffDays < 30) {
      desc = `${diffDays} days`;
    } else {
      const remainingDays = diffDays - (months * 30);
      if (months > 0) {
        desc = `${months} month${months > 1 ? 's' : ''}`;
        if (remainingDays > 0 && remainingDays < 30) {
          desc += ` and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        }
      } else {
        desc = `${diffDays} days`;
      }
    }
    setDuration(desc);

    // Auto-calculate fee if not overridden manually
    if (!isManualTotal) {
      const fee = parseFloat(feePerMonth) || 0;
      const hFee = isHosteller ? (parseFloat(hostelFeePerMonth) || 0) : 0;
      const discount = parseFloat(discountAmount) || 0;

      if (diffDays < 30) {
        // Below 1 month, baseline to 1 month or editable input
        setTotalFee(Math.max(0, (fee + hFee) - discount).toString());
      } else {
        // Round to nearest month for billing
        const calculatedMonths = Math.max(1, Math.round(diffDays / 30));
        const total = ((fee + hFee) * calculatedMonths) - discount;
        setTotalFee(Math.max(0, total).toString());
      }
    }
  }, [startDate, endDate, feePerMonth, hostelFeePerMonth, isHosteller, isManualTotal, discountAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !college.trim() || !startDate || !endDate) {
      Swal.fire("Validation Error", "Please fill in all required fields (Student Name, College, Start Date, End Date).", "error");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      Swal.fire("Validation Error", "End Date must be greater than or equal to Start Date (at least 1 day must be selected).", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        student_name: studentName,
        email: email,
        mobile_number: mobileNumber,
        college,
        department,
        degree,
        start_date: startDate,
        end_date: endDate,
        duration,
        is_hosteller: isHosteller,
        fee_per_month: parseFloat(feePerMonth) || 0,
        hostel_fee_per_month: isHosteller ? (parseFloat(hostelFeePerMonth) || 0) : 0,
        discount_amount: parseFloat(discountAmount) || 0,
        discount_remarks: discountRemarks,
        total_fee: parseFloat(totalFee) || 0,
        initial_amount: initialAmount,
        initial_method: initialMethod,
        initial_date: initialDate
      };

      const res = await apiRequest(`${HMSURL}hr/internships/`, "POST", payload);
      if (res.success) {
        Swal.fire({
          title: "Registration Success",
          text: "Intern student details registered successfully!",
          icon: "success",
          confirmButtonColor: colors.primary
        }).then(() => {
          // Reset form
          setStudentName("");
          setEmail("");
          setMobileNumber("");
          setCollege("");
          setDepartment("");
          setDegree("");
          setStartDate("");
          setEndDate("");
          setDuration("");
          setIsHosteller(false);
          setFeePerMonth("3500");
          setHostelFeePerMonth("3000");
          setTotalFee("0");
          setIsManualTotal(false);
          setInitialAmount("");
          setInitialMethod("CASH");
        });
      } else {
        Swal.fire("Registration Failed", res.error || "Something went wrong", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error while registering intern student.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <FormCard>
        <Title>
          <GraduationCap size={28} color={colors.primary} />
          Register Intern Student Details
        </Title>
        <form onSubmit={handleSubmit}>

          <SectionTitle>Student Information</SectionTitle>
          <Grid>
            <FormGroup>
              <Label><User size={14} /> Student Name *</Label>
              <InputWrapper>
                <IconLeft><User size={16} /></IconLeft>
                <Input
                  type="text"
                  placeholder="Enter Student Full Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><Mail size={14} /> Email Address</Label>
              <InputWrapper>
                <IconLeft><Mail size={16} /></IconLeft>
                <Input
                  type="email"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><Phone size={14} /> Mobile Number</Label>
              <InputWrapper>
                <IconLeft><Phone size={16} /></IconLeft>
                <Input
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><BookOpen size={14} /> College *</Label>
              <InputWrapper>
                <IconLeft><BookOpen size={16} /></IconLeft>
                <Input
                  type="text"
                  list="colleges-list"
                  placeholder="Type or Select College"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                />
                <datalist id="colleges-list">
                  {autocomplete.colleges.map((c) => <option key={c} value={c} />)}
                </datalist>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><BookOpen size={14} /> Department</Label>
              <InputWrapper>
                <IconLeft><BookOpen size={16} /></IconLeft>
                <Input
                  type="text"
                  list="departments-list"
                  placeholder="Type or Select Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
                <datalist id="departments-list">
                  {autocomplete.departments.map((d) => <option key={d} value={d} />)}
                </datalist>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><GraduationCap size={14} /> Degree</Label>
              <InputWrapper>
                <IconLeft><GraduationCap size={16} /></IconLeft>
                <Input
                  type="text"
                  list="degrees-list"
                  placeholder="Type or Select Degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
                <datalist id="degrees-list">
                  {autocomplete.degrees.map((d) => <option key={d} value={d} />)}
                </datalist>
              </InputWrapper>
            </FormGroup>
          </Grid>

          <SectionTitle>Internship & Hostel details</SectionTitle>
          <Grid>
            <FormGroup>
              <Label><Calendar size={14} /> Start Date *</Label>
              <InputWrapper>
                <IconLeft><Calendar size={16} /></IconLeft>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><Calendar size={14} /> End Date *</Label>
              <InputWrapper>
                <IconLeft><Calendar size={16} /></IconLeft>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><Clock size={14} /> Duration</Label>
              <InputWrapper>
                <IconLeft><Clock size={16} /></IconLeft>
                <Input
                  type="text"
                  value={duration}
                  placeholder="Automatically calculated"
                  disabled
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><Home size={14} /> Hostel Accommodation</Label>
              <ToggleContainer>
                <ToggleLabel>Hosteller Status:</ToggleLabel>
                <ToggleSwitch>
                  <ToggleInput
                    type="checkbox"
                    checked={isHosteller}
                    onChange={(e) => setIsHosteller(e.target.checked)}
                  />
                  <ToggleSlider />
                </ToggleSwitch>
                <ToggleLabel style={{ fontWeight: 600, color: isHosteller ? colors.primary : colors.textMuted }}>
                  {isHosteller ? "YES" : "NO"}
                </ToggleLabel>
              </ToggleContainer>
            </FormGroup>
          </Grid>

          <SectionTitle>Fee Calculations</SectionTitle>
          <Grid>
            <FormGroup>
              <Label>Fee Per Month</Label>
              <InputWrapper>
                <IconLeftINR>₹</IconLeftINR>
                <Input
                  type="number"
                  value={feePerMonth}
                  onChange={(e) => setFeePerMonth(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Hostel Fee Per Month</Label>
              <InputWrapper>
                <IconLeftINR>₹</IconLeftINR>
                <Input
                  type="number"
                  value={isHosteller ? hostelFeePerMonth : 0}
                  disabled={!isHosteller}
                  onChange={(e) => setHostelFeePerMonth(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Discount Amount</Label>
              <InputWrapper>
                <IconLeftINR>₹</IconLeftINR>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Discount Remarks</Label>
              <InputWrapper>
                <Input
                  type="text"
                  placeholder="Enter reason for discount"
                  value={discountRemarks}
                  onChange={(e) => setDiscountRemarks(e.target.value)}
                  style={{ paddingLeft: "10px" }}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Total Fee</Label>
              <InputWrapper>
                <IconLeftINR>₹</IconLeftINR>
                <Input
                  type="number"
                  value={totalFee}
                  onChange={(e) => {
                    setTotalFee(e.target.value);
                    setIsManualTotal(true);
                  }}
                />
              </InputWrapper>
              {isManualTotal && (
                <RecalculateButton type="button" onClick={() => setIsManualTotal(false)}>
                  Reset to Auto-Calculate
                </RecalculateButton>
              )}
            </FormGroup>
          </Grid>

          <SectionTitle>Initial Payment (Optional)</SectionTitle>
          <Grid>
            <FormGroup>
              <Label>Amount Paid</Label>
              <InputWrapper>
                <IconLeftINR>₹</IconLeftINR>
                <Input
                  type="number"
                  placeholder="Enter initial amount"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Payment Method</Label>
              <InputWrapper>
                <IconLeftINR>₹</IconLeftINR>
                <Select
                  value={initialMethod}
                  onChange={(e) => setInitialMethod(e.target.value)}
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="NEFT">NEFT</option>
                </Select>
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label><Calendar size={14} /> Payment Date</Label>
              <InputWrapper>
                <IconLeft><Calendar size={16} /></IconLeft>
                <Input
                  type="date"
                  value={initialDate}
                  onChange={(e) => setInitialDate(e.target.value)}
                />
              </InputWrapper>
            </FormGroup>
          </Grid>

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? "Registering Intern..." : "Register Intern Details"}
          </SubmitButton>
        </form>
      </FormCard>
    </PageWrapper>
  );
}

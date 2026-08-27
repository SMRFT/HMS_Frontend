import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import { ArrowLeft, Check } from "lucide-react";
import styled from "styled-components";

// Styling to match Screenshot 2
const PageWrapper = styled.div`
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 24px 32px 100px 32px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const TopNavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const LeftNavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
  }
`;

const DoctorTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DoctorNameHeader = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const DoctorMetaSubtext = styled.span`
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
`;

const DoctorSwitcherGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DoctorSwitchPill = styled.button`
  padding: 6px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const SectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SectionNumberTitle = styled.h2`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #334155;
  text-transform: uppercase;
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 600;
  background-color: ${props => props.active ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.active ? '#166534' : '#b45309'};
`;

const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const QuickActionButton = styled.button`
  padding: 5px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
`;

const DayCard = styled.div`
  border: 1px solid ${props => props.selected ? '#133d34' : '#e2e8f0'};
  background-color: ${props => props.selected ? '#f0fdf4' : '#ffffff'};
  border-radius: 8px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: flex-start;
  gap: 10px;

  &:hover {
    border-color: ${props => props.selected ? '#133d34' : '#cbd5e1'};
  }
`;

const CheckboxInput = styled.input`
  margin-top: 3px;
  accent-color: #133d34;
  cursor: pointer;
`;

const DayLabelGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const DayAbbrText = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
`;

const DayFullText = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const TimeCategorySection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TimeCategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 12px;
`;

const TimeCategoryTitle = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #64748b;
  text-transform: uppercase;
`;

const SelectAllLink = styled.button`
  background: none;
  border: none;
  color: #133d34;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const SlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
`;

const SlotCard = styled.div`
  border: 1px solid ${props => props.selected ? '#133d34' : '#e2e8f0'};
  background-color: ${props => props.selected ? '#f0fdf4' : '#ffffff'};
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    border-color: ${props => props.selected ? '#133d34' : '#cbd5e1'};
  }
`;

const SlotText = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
`;

// Dark Fee Card Styling
const DarkFeeCard = styled.div`
  background: #17231e;
  color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DarkCardHeader = styled.h3`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #94a3b8;
  text-transform: uppercase;
  margin: 0 0 16px 0;
`;

const FeeFormGroup = styled.div`
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 20px;
  }
`;

const FeeLabel = styled.label`
  display: block;
  font-size: 12.5px;
  color: #cbd5e1;
  margin-bottom: 6px;
`;

const DarkInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: #23322b;
  border: 1px solid #2d4037;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: #34d399;
  }
`;

const DarkFeeFooter = styled.div`
  border-top: 1px solid #2d4037;
  padding-top: 14px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const TotalLabel = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

const TotalAmountText = styled.span`
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
`;

// Summary & Info Cards
const SummaryCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 18px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SummaryKey = styled.span`
  color: #64748b;
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: #0f172a;
  text-align: right;
`;

// Sticky Footer Bar
const StickyFooterBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
`;

const FooterValidationText = styled.span`
  font-size: 13px;
  color: #64748b;
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RevertButton = styled.button`
  padding: 9px 20px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
`;

const SaveScheduleButton = styled.button`
  padding: 9px 24px;
  background: ${props => props.disabled ? '#cbd5e1' : '#133d34'};
  border: none;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 600;
  color: #ffffff;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.disabled ? '#cbd5e1' : '#0f312a'};
  }
`;

const DAYS_LIST = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" }
];

const MORNING_SLOTS = [
  { value: "09:00-10:00", label: "09:00 – 10:00" },
  { value: "10:00-11:00", label: "10:00 – 11:00" },
  { value: "11:00-12:00", label: "11:00 – 12:00" }
];

const AFTERNOON_SLOTS = [
  { value: "12:00-13:00", label: "12:00 – 13:00" },
  { value: "13:00-14:00", label: "13:00 – 14:00" },
  { value: "14:00-15:00", label: "14:00 – 15:00" }
];

const EVENING_SLOTS = [
  { value: "15:00-16:00", label: "15:00 – 16:00" },
  { value: "16:00-17:00", label: "16:00 – 17:00" },
  { value: "17:00-18:00", label: "17:00 – 18:00" }
];

function DoctorSchedule() {
  const { employee_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [scheduleExists, setScheduleExists] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    email: "",
    mobileNumber: "",
    department: "",
    designation: "",
    consulting_fee: "",
    renewal_fee: "",
    day_schedule: [],
    time_schedule: []
  });

  const [initialData, setInitialData] = useState(null);

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    fetchAllDoctorsList();
  }, [HMSURL]);

  useEffect(() => {
    if (employee_id) {
      fetchDoctorSchedule();
    }
  }, [employee_id]);

  const fetchAllDoctorsList = async () => {
    const res = await apiRequest(`${HMSURL}doctor_schedule/`, 'GET');
    if (res.success) {
      setAllDoctors(res.data || []);
    }
  };

  const fetchDoctorSchedule = async () => {
    setLoading(true);
    const result = await apiRequest(`${HMSURL}doctor_schedule/${employee_id}/`, 'GET');

    if (result.success) {
      const data = result.data;
      setScheduleExists(data.schedule_exists);
      
      const loadedForm = {
        employeeId: data.employeeId || "",
        employeeName: data.employeeName || "N/A",
        email: data.email || "",
        mobileNumber: data.mobileNumber || "",
        department: data.department || "",
        designation: data.designation || "",
        consulting_fee: data.consulting_fee || "",
        renewal_fee: data.renewal_fee || "",
        day_schedule: data.day_schedule || [],
        time_schedule: data.time_schedule || []
      };

      setFormData(loadedForm);
      setInitialData(loadedForm);
    } else {
      toast.error(result.error || 'Failed to fetch doctor schedule');
    }
    setLoading(false);
  };

  // Day Schedule Handlers
  const toggleDay = (fullDay) => {
    const currentDays = [...formData.day_schedule];
    const index = currentDays.indexOf(fullDay);
    if (index > -1) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(fullDay);
    }
    setFormData({ ...formData, day_schedule: currentDays });
  };

  const setDaysPreset = (preset) => {
    if (preset === 'all') {
      setFormData({ ...formData, day_schedule: DAYS_LIST.map(d => d.full) });
    } else if (preset === 'mon-fri') {
      setFormData({ ...formData, day_schedule: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] });
    } else if (preset === 'mon-sat') {
      setFormData({ ...formData, day_schedule: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] });
    } else if (preset === 'clear') {
      setFormData({ ...formData, day_schedule: [] });
    }
  };

  // Time Schedule Handlers
  const toggleTimeSlot = (slotVal) => {
    const currentSlots = [...formData.time_schedule];
    const index = currentSlots.indexOf(slotVal);
    if (index > -1) {
      currentSlots.splice(index, 1);
    } else {
      currentSlots.push(slotVal);
    }
    setFormData({ ...formData, time_schedule: currentSlots });
  };

  const toggleCategorySlots = (categorySlots) => {
    const currentSlots = new Set(formData.time_schedule);
    const categorySlotVals = categorySlots.map(s => s.value);
    const allSelected = categorySlotVals.every(v => currentSlots.has(v));

    if (allSelected) {
      categorySlotVals.forEach(v => currentSlots.delete(v));
    } else {
      categorySlotVals.forEach(v => currentSlots.add(v));
    }
    setFormData({ ...formData, time_schedule: Array.from(currentSlots) });
  };

  const setTimePreset = (preset) => {
    const morningVals = MORNING_SLOTS.map(s => s.value);
    const afternoonVals = AFTERNOON_SLOTS.map(s => s.value);
    const eveningVals = EVENING_SLOTS.map(s => s.value);

    if (preset === 'full') {
      setFormData({ ...formData, time_schedule: [...morningVals, ...afternoonVals, ...eveningVals] });
    } else if (preset === 'morning') {
      setFormData({ ...formData, time_schedule: morningVals });
    } else if (preset === 'evening') {
      setFormData({ ...formData, time_schedule: eveningVals });
    } else if (preset === 'clear') {
      setFormData({ ...formData, time_schedule: [] });
    }
  };

  const handleRevert = () => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  };

  const handleSubmit = async () => {
    if (!formData.consulting_fee || !formData.renewal_fee) {
      toast.error("Please fill in consulting fee and renewal fee");
      return;
    }
    if (formData.day_schedule.length === 0) {
      toast.error("Please select at least one working day");
      return;
    }
    if (formData.time_schedule.length === 0) {
      toast.error("Please select at least one time slot");
      return;
    }

    const method = scheduleExists ? 'PATCH' : 'POST';
    const result = await apiRequest(
      `${HMSURL}doctor_schedule_upsert/${employee_id}/`,
      method,
      formData
    );

    if (result.success) {
      toast.success(result.data.message || "Doctor schedule saved successfully!");
      setScheduleExists(true);
      setInitialData({ ...formData });
    } else {
      toast.error(result.error || 'Failed to save doctor schedule');
    }
  };

  if (loading) {
    return (
      <PageWrapper style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
          <div>Loading doctor schedule details...</div>
        </div>
      </PageWrapper>
    );
  }

  // Calculate totals for sidebar summary
  const consultingFeeNum = parseFloat(formData.consulting_fee) || 0;
  const renewalFeeNum = parseFloat(formData.renewal_fee) || 0;
  const totalFirstVisit = consultingFeeNum + renewalFeeNum;
  const totalDaysCount = formData.day_schedule.length;
  const totalSlotsCount = formData.time_schedule.length;
  const totalWeeklyCapacity = totalDaysCount * totalSlotsCount;

  const otherDoctors = allDoctors.filter(d => d.employeeId !== formData.employeeId).slice(0, 3);
  const isValidToSubmit = totalDaysCount > 0 && totalSlotsCount > 0 && formData.consulting_fee !== "" && formData.renewal_fee !== "";

  return (
    <PageWrapper>
      {/* Top Nav Row */}
      <TopNavRow>
        <LeftNavGroup>
          <BackButton onClick={() => navigate('/DoctorList')}>
            <ArrowLeft size={16} /> All doctors
          </BackButton>

          <DoctorTitleGroup>
            <DoctorNameHeader>{formData.employeeName}</DoctorNameHeader>
            <DoctorMetaSubtext>
              {formData.employeeId} · {formData.department || 'General'} · {formData.designation || 'Doctor'}
            </DoctorMetaSubtext>
          </DoctorTitleGroup>
        </LeftNavGroup>

        <DoctorSwitcherGroup>
          {otherDoctors.map(doc => (
            <DoctorSwitchPill key={doc.employeeId} onClick={() => navigate(`/DoctorSchedule/${doc.employeeId}`)}>
              {doc.employeeName.split(' ')[0]}
            </DoctorSwitchPill>
          ))}
        </DoctorSwitcherGroup>
      </TopNavRow>

      <MainGrid>
        {/* Left Column */}
        <LeftColumn>
          {/* 01 · WORKING DAYS */}
          <SectionCard>
            <SectionCardHeader>
              <SectionTitleWrapper>
                <SectionNumberTitle>01 · WORKING DAYS</SectionNumberTitle>
                <StatusBadge active={totalDaysCount > 0}>
                  {totalDaysCount > 0 ? `${totalDaysCount} selected` : 'none selected'}
                </StatusBadge>
              </SectionTitleWrapper>

              <ActionButtonGroup>
                <QuickActionButton onClick={() => setDaysPreset('all')}>All 7</QuickActionButton>
                <QuickActionButton onClick={() => setDaysPreset('mon-fri')}>Mon–Fri</QuickActionButton>
                <QuickActionButton onClick={() => setDaysPreset('mon-sat')}>Mon–Sat</QuickActionButton>
                <QuickActionButton onClick={() => setDaysPreset('clear')}>Clear</QuickActionButton>
              </ActionButtonGroup>
            </SectionCardHeader>

            <DaysGrid>
              {DAYS_LIST.map((day) => {
                const isSelected = formData.day_schedule.includes(day.full);
                return (
                  <DayCard key={day.full} selected={isSelected} onClick={() => toggleDay(day.full)}>
                    <CheckboxInput
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <DayLabelGroup>
                      <DayAbbrText>{day.short}</DayAbbrText>
                      <DayFullText>{day.full}</DayFullText>
                    </DayLabelGroup>
                  </DayCard>
                );
              })}
            </DaysGrid>
          </SectionCard>

          {/* 02 · TIME SLOTS */}
          <SectionCard>
            <SectionCardHeader>
              <SectionTitleWrapper>
                <SectionNumberTitle>02 · TIME SLOTS</SectionNumberTitle>
                <StatusBadge active={totalSlotsCount > 0}>
                  {totalSlotsCount > 0 ? `${totalSlotsCount} selected` : 'none selected'}
                </StatusBadge>
              </SectionTitleWrapper>

              <ActionButtonGroup>
                <QuickActionButton onClick={() => setTimePreset('full')}>Full day</QuickActionButton>
                <QuickActionButton onClick={() => setTimePreset('morning')}>Morning only</QuickActionButton>
                <QuickActionButton onClick={() => setTimePreset('evening')}>Evening only</QuickActionButton>
                <QuickActionButton onClick={() => setTimePreset('clear')}>Clear</QuickActionButton>
              </ActionButtonGroup>
            </SectionCardHeader>

            {/* MORNING */}
            <TimeCategorySection>
              <TimeCategoryHeader>
                <TimeCategoryTitle>MORNING</TimeCategoryTitle>
                <SelectAllLink onClick={() => toggleCategorySlots(MORNING_SLOTS)}>Select all</SelectAllLink>
              </TimeCategoryHeader>
              <SlotsGrid>
                {MORNING_SLOTS.map((slot) => {
                  const isSelected = formData.time_schedule.includes(slot.value);
                  return (
                    <SlotCard key={slot.value} selected={isSelected} onClick={() => toggleTimeSlot(slot.value)}>
                      <CheckboxInput type="checkbox" checked={isSelected} onChange={() => {}} />
                      <SlotText>{slot.label}</SlotText>
                    </SlotCard>
                  );
                })}
              </SlotsGrid>
            </TimeCategorySection>

            {/* AFTERNOON */}
            <TimeCategorySection>
              <TimeCategoryHeader>
                <TimeCategoryTitle>AFTERNOON</TimeCategoryTitle>
                <SelectAllLink onClick={() => toggleCategorySlots(AFTERNOON_SLOTS)}>Select all</SelectAllLink>
              </TimeCategoryHeader>
              <SlotsGrid>
                {AFTERNOON_SLOTS.map((slot) => {
                  const isSelected = formData.time_schedule.includes(slot.value);
                  return (
                    <SlotCard key={slot.value} selected={isSelected} onClick={() => toggleTimeSlot(slot.value)}>
                      <CheckboxInput type="checkbox" checked={isSelected} onChange={() => {}} />
                      <SlotText>{slot.label}</SlotText>
                    </SlotCard>
                  );
                })}
              </SlotsGrid>
            </TimeCategorySection>

            {/* EVENING */}
            <TimeCategorySection>
              <TimeCategoryHeader>
                <TimeCategoryTitle>EVENING</TimeCategoryTitle>
                <SelectAllLink onClick={() => toggleCategorySlots(EVENING_SLOTS)}>Select all</SelectAllLink>
              </TimeCategoryHeader>
              <SlotsGrid>
                {EVENING_SLOTS.map((slot) => {
                  const isSelected = formData.time_schedule.includes(slot.value);
                  return (
                    <SlotCard key={slot.value} selected={isSelected} onClick={() => toggleTimeSlot(slot.value)}>
                      <CheckboxInput type="checkbox" checked={isSelected} onChange={() => {}} />
                      <SlotText>{slot.label}</SlotText>
                    </SlotCard>
                  );
                })}
              </SlotsGrid>
            </TimeCategorySection>
          </SectionCard>
        </LeftColumn>

        {/* Right Sidebar */}
        <RightSidebar>
          {/* FEE DETAILS */}
          <DarkFeeCard>
            <DarkCardHeader>FEE DETAILS</DarkCardHeader>

            <FeeFormGroup>
              <FeeLabel>Consulting fee ₹ *</FeeLabel>
              <DarkInput
                type="number"
                name="consulting_fee"
                value={formData.consulting_fee}
                onChange={(e) => setFormData({ ...formData, consulting_fee: e.target.value })}
                placeholder="0"
              />
            </FeeFormGroup>

            <FeeFormGroup>
              <FeeLabel>Renewal fee ₹ *</FeeLabel>
              <DarkInput
                type="number"
                name="renewal_fee"
                value={formData.renewal_fee}
                onChange={(e) => setFormData({ ...formData, renewal_fee: e.target.value })}
                placeholder="0"
              />
            </FeeFormGroup>

            <DarkFeeFooter>
              <TotalLabel>First visit total</TotalLabel>
              <TotalAmountText>₹{totalFirstVisit}</TotalAmountText>
            </DarkFeeFooter>
          </DarkFeeCard>

          {/* THIS SCHEDULE Summary */}
          <SummaryCard>
            <DarkCardHeader style={{ color: '#64748b' }}>THIS SCHEDULE</DarkCardHeader>
            <SummaryRow>
              <SummaryKey>Working days</SummaryKey>
              <SummaryValue>{totalDaysCount > 0 ? `${totalDaysCount} days` : 'Not set'}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryKey>Consulting hours</SummaryKey>
              <SummaryValue>{totalSlotsCount > 0 ? `${totalSlotsCount} slots` : '–'}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryKey>Slots per day</SummaryKey>
              <SummaryValue>{totalSlotsCount} × 1 hour</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryKey>Appointment capacity / week</SummaryKey>
              <SummaryValue>{totalWeeklyCapacity}</SummaryValue>
            </SummaryRow>
          </SummaryCard>

          {/* DOCTOR INFORMATION */}
          <SummaryCard>
            <DarkCardHeader style={{ color: '#64748b' }}>DOCTOR INFORMATION</DarkCardHeader>
            <SummaryRow>
              <SummaryKey>Employee ID</SummaryKey>
              <SummaryValue>{formData.employeeId}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryKey>Department</SummaryKey>
              <SummaryValue>{formData.department || 'N/A'}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryKey>Designation</SummaryKey>
              <SummaryValue>{formData.designation || 'Doctor'}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryKey>Email</SummaryKey>
              <SummaryValue style={{ fontSize: '12px' }}>{formData.email || 'N/A'}</SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryKey>Mobile</SummaryKey>
              <SummaryValue>{formData.mobileNumber || 'N/A'}</SummaryValue>
            </SummaryRow>
          </SummaryCard>
        </RightSidebar>
      </MainGrid>

      {/* Sticky Bottom Bar */}
      <StickyFooterBar>
        <FooterValidationText>
          {isValidToSubmit
            ? `${totalDaysCount} days × ${totalSlotsCount} slots · ₹${totalFirstVisit} first visit`
            : "Days, slots and both fees are required"}
        </FooterValidationText>

        <FooterActions>
          <RevertButton onClick={handleRevert}>Revert</RevertButton>
          <SaveScheduleButton onClick={handleSubmit} disabled={!isValidToSubmit}>
            {scheduleExists ? "Update schedule" : "Create schedule"}
          </SaveScheduleButton>
        </FooterActions>
      </StickyFooterBar>
    </PageWrapper>
  );
}

export default DoctorSchedule;
import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

// Animations
import {
  PageWrapper,
  Container,
  FormContent,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Select,
  ButtonContainer,
  Button,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  colors,
  CheckboxWrapper,
  Checkbox
} from "../GlobalStyles";
import apiRequest from "../../Auth/apiRequest";

const Header = ({ children }) => (
  <div style={{
    background: colors.surface,
    padding: '12px 24px',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: '0.85rem',
    color: colors.textMuted,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    {children}
  </div>
);

const HospitalBadge = ({ children }) => (
  <div style={{
    background: "#ff8c42", // headerOrange
    color: 'white',
    padding: '6px 16px',
    fontWeight: 600,
    fontSize: '0.85rem',
    letterSpacing: '0.5px'
  }}>
    {children}
  </div>
);

const SearchButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      position: 'absolute',
      right: '4px',
      top: '28px',
      padding: '6px 12px',
      background: colors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      fontSize: '0.8rem',
      cursor: 'pointer'
    }}
  >
    🔍
  </button>
);

const ToggleLabel = ({ active, onClick, children }) => (
  <span
    onClick={onClick}
    style={{
      padding: '6px 16px',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: 600,
      background: active ? colors.success : '#e2e8f0',
      color: active ? 'white' : colors.textMuted,
      cursor: 'pointer',
      userSelect: 'none'
    }}
  >
    {children}
  </span>
);

// Styled components for the missing elements
const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const ResetButton = styled(Button)`
  background-color: #64748b;
  &:hover { background-color: #475569; }
`;

const SaveButton = styled(Button)`
  background-color: ${colors.primary};
`;

const FilterSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const FilterRow = styled(FormRow)`
  align-items: flex-end;
`;

const SearchButtonLarge = styled(Button)`
  height: 38px;
  padding: 0 20px;
`;

const TableSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const TableControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ShowEntries = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: ${colors.textMuted};
`;

const EntriesSelect = styled(Select)`
  width: 70px;
  height: 32px;
  padding: 0 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: ${colors.textMuted};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  &:hover { background: #f1f5f9; }
`;

const RoomShifting = () => {
  const [formData, setFormData] = useState({
    uhid: "",
    ipNo: "",
    slNo: "",
    name: "",
    age: "",
    gender: "",
    admittedOn: "",
    admittedTime: "",
    newRoom: "",
    newBedNumber: "",
    vacateOldRoom: true,
    patientAt: "",
    address: "",
    dateOfShifting: new Date().toISOString().split('T')[0],
    timeOfShifting: new Date().toTimeString().slice(0, 8),
    currentRoomNumber: "",
    currentBedNumber: "",
    currentDues: "",
    lastSettlementOn: ""
  });

  const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    filterUhid: "",
    filterIpNumber: "",
    filterSlNo: "",
    currentRoomOnly: false
  });

  const [roomShiftings, setRoomShiftings] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(15);

  useEffect(() => {
    fetchRoomShiftings();
  }, []);

  const fetchRoomShiftings = async () => {
    try {
      const response = await apiRequest(`${Hmsbaseurl}room-shifting/`, "GET");
      if (response.success) {
        setRoomShiftings(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching room shiftings:", error);
    }
  };

  const fetchPatientByUHID = async () => {
    if (!formData.uhid) {
      alert("Please enter UHID");
      return;
    }

    try {
      const response = await apiRequest(`${Hmsbaseurl}admission-by-uhid/${encodeURIComponent(formData.uhid)}/`, "GET");
      if (response.success) {
        const data = response.data;
        setFormData(prev => ({
          ...prev,
          ipNo: data.ipNumber || "",
          name: `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim(),
          age: data.age || "",
          gender: data.gender || "",
          admittedOn: data.admissionDate || "",
          admittedTime: data.time || "",
          currentRoomNumber: data.roomNo || "",
          currentBedNumber: data.bedNo || "",
          address: data.address || "",
        }));
      } else {
        alert("Patient not found");
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      alert("Error fetching patient details");
    }
  };

  const fetchPatientByIP = async () => {
    if (!formData.ipNo) {
      alert("Please enter IP Number");
      return;
    }

    try {
      const response = await apiRequest(`${Hmsbaseurl}admission-by-ip/${encodeURIComponent(formData.ipNo)}/`, "GET");
      if (response.success) {
        const data = response.data;
        setFormData(prev => ({
          ...prev,
          uhid: data.uhid || "",
          name: `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim(),
          age: data.age || "",
          gender: data.gender || "",
          admittedOn: data.admissionDate || "",
          admittedTime: data.time || "",
          currentRoomNumber: data.roomNo || "",
          currentBedNumber: data.bedNo || "",
          address: data.address || "",
        }));
      } else {
        alert("Patient not found");
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      alert("Error fetching patient details");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleReset = () => {
    setFormData({
      uhid: "",
      ipNo: "",
      slNo: "",
      name: "",
      age: "",
      gender: "",
      admittedOn: "",
      admittedTime: "",
      newRoom: "",
      newBedNumber: "",
      vacateOldRoom: true,
      patientAt: "",
      address: "",
      dateOfShifting: new Date().toISOString().split('T')[0],
      timeOfShifting: new Date().toTimeString().slice(0, 8),
      currentRoomNumber: "",
      currentBedNumber: "",
      currentDues: "",
      lastSettlementOn: ""
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Update admission with new room details
    const admissionUpdate = {
      roomNo: formData.newRoom,
      bedNo: formData.newBedNumber
    };

    try {
      // Update admission record
      const admissionResponse = await apiRequest(
        `${Hmsbaseurl}admission/${encodeURIComponent(formData.uhid)}/`,
        "PATCH",
        admissionUpdate
      );

      // Create room shifting record
      const shiftingResponse = await apiRequest(`${Hmsbaseurl}room-shifting/`, "POST", formData);

      if (admissionResponse.success && shiftingResponse.success) {
        alert("Room shifting completed successfully!");
        handleReset();
        fetchRoomShiftings();
      } else {
        alert("Failed to complete room shifting");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while shifting room!");
    }
  };

  const handleSearch = () => {
    fetchRoomShiftings();
  };

  return (
    <PageWrapper>
      <Header>
        <span>Home / Room Shifting</span>
        <HospitalBadge>SHANMUGA HOSPITAL LTD</HospitalBadge>
      </Header>

      <Container>
        <FormContent>
          <div>
            {/* Row 1 */}
            <FormRow>
              <InputWrapper>
                <Label>UHID</Label>
                <Input
                  type="text"
                  name="uhid"
                  value={formData.uhid}
                  onChange={handleInputChange}
                />
                <SearchButton type="button" onClick={fetchPatientByUHID}>
                  🔍
                </SearchButton>
              </InputWrapper>

              <InputWrapper>
                <Label>IP No</Label>
                <Input
                  type="text"
                  name="ipNo"
                  value={formData.ipNo}
                  onChange={handleInputChange}
                />
                <SearchButton type="button" onClick={fetchPatientByIP}>
                  🔍
                </SearchButton>
              </InputWrapper>

              <InputWrapper>
                <Label>SL No</Label>
                <Input
                  type="text"
                  name="slNo"
                  value={formData.slNo}
                  onChange={handleInputChange}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly
                />
              </InputWrapper>
            </FormRow>

            {/* Row 2 */}
            <FormRow>
              <InputWrapper>
                <Label>Age</Label>
                <Input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  readOnly
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Gender</Label>
                <Input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  readOnly
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Admitted On</Label>
                <Input
                  type="date"
                  name="admittedOn"
                  value={formData.admittedOn}
                  onChange={handleInputChange}
                  readOnly
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Admitted Time</Label>
                <Input
                  type="time"
                  name="admittedTime"
                  value={formData.admittedTime}
                  onChange={handleInputChange}
                  readOnly
                />
              </InputWrapper>
            </FormRow>

            {/* Row 3 */}
            <FormRow>
              <InputWrapper>
                <Label>New Room</Label>
                <Input
                  type="text"
                  name="newRoom"
                  value={formData.newRoom}
                  onChange={handleInputChange}
                />
                <SearchButton type="button">🔍</SearchButton>
              </InputWrapper>

              <InputWrapper>
                <Label>New Bed Number</Label>
                <Input
                  type="text"
                  name="newBedNumber"
                  value={formData.newBedNumber}
                  onChange={handleInputChange}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Vacate Old Room</Label>
                <ToggleWrapper>
                  <ToggleLabel
                    active={formData.vacateOldRoom}
                    onClick={() => setFormData(prev => ({ ...prev, vacateOldRoom: !prev.vacateOldRoom }))}
                  >
                    {formData.vacateOldRoom ? "YES" : "NO"}
                  </ToggleLabel>
                </ToggleWrapper>
              </InputWrapper>

              <InputWrapper>
                <Label>Patient At</Label>
                <Select
                  name="patientAt"
                  value={formData.patientAt}
                  onChange={handleInputChange}
                >
                  <option value="">Select</option>
                  <option value="Ward">Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="OT">OT</option>
                </Select>
              </InputWrapper>
            </FormRow>

            {/* Row 4 */}
            <FormRow>
              <InputWrapper span={2}>
                <Label>Address</Label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  readOnly
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Date Of Shifting</Label>
                <Input
                  type="date"
                  name="dateOfShifting"
                  value={formData.dateOfShifting}
                  onChange={handleInputChange}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Time Of Shifting</Label>
                <Input
                  type="time"
                  name="timeOfShifting"
                  value={formData.timeOfShifting}
                  onChange={handleInputChange}
                  step="1"
                />
              </InputWrapper>
            </FormRow>

            {/* Row 5 */}
            <FormRow>
              <InputWrapper>
                <Label>Current Room Number</Label>
                <Input
                  type="text"
                  name="currentRoomNumber"
                  value={formData.currentRoomNumber}
                  onChange={handleInputChange}
                  readOnly
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Current Bed Number</Label>
                <Input
                  type="text"
                  name="currentBedNumber"
                  value={formData.currentBedNumber}
                  onChange={handleInputChange}
                  readOnly
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Current Dues</Label>
                <Input
                  type="text"
                  name="currentDues"
                  value={formData.currentDues}
                  onChange={handleInputChange}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Last Settlement On</Label>
                <Input
                  type="date"
                  name="lastSettlementOn"
                  value={formData.lastSettlementOn}
                  onChange={handleInputChange}
                />
              </InputWrapper>
            </FormRow>

            <ButtonContainer>
              <ResetButton type="button" onClick={handleReset}>
                🔄 Reset
              </ResetButton>
              <SaveButton type="button" onClick={handleSubmit}>
                💾 Save
              </SaveButton>
            </ButtonContainer>
          </div>
        </FormContent>

        {/* Filter Section */}
        <FilterSection>
          <FilterRow>
            <InputWrapper>
              <Label>From Date</Label>
              <Input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>To Date</Label>
              <Input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>UHID</Label>
              <Input
                type="text"
                name="filterUhid"
                value={filters.filterUhid}
                onChange={handleFilterChange}
              />
              <SearchButton type="button">🔍</SearchButton>
            </InputWrapper>

            <InputWrapper>
              <Label>IP Number</Label>
              <Input
                type="text"
                name="filterIpNumber"
                value={filters.filterIpNumber}
                onChange={handleFilterChange}
              />
              <SearchButton type="button">🔍</SearchButton>
            </InputWrapper>

            <InputWrapper>
              <Label>SL No</Label>
              <Input
                type="text"
                name="filterSlNo"
                value={filters.filterSlNo}
                onChange={handleFilterChange}
              />
            </InputWrapper>

            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                name="currentRoomOnly"
                checked={filters.currentRoomOnly}
                onChange={handleFilterChange}
              />
              <Label style={{ margin: 0 }}>Current Room Only</Label>
            </CheckboxWrapper>

            <SearchButtonLarge type="button" onClick={handleSearch}>
              🔍 Search
            </SearchButtonLarge>
          </FilterRow>
        </FilterSection>

        {/* Table Section */}
        <TableSection>
          <TableControls>
            <ShowEntries>
              <span>Show up to</span>
              <EntriesSelect
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </EntriesSelect>
            </ShowEntries>
          </TableControls>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Actions</Th>
                  <Th>Admission Date</Th>
                  <Th>Room From Date</Th>
                  <Th>Room To Date</Th>
                  <Th>UHID</Th>
                  <Th>Patient Name</Th>
                  <Th>IP No / SL No</Th>
                  <Th>Room No</Th>
                  <Th>Bed No</Th>
                  <Th>Room Occupant</Th>
                </tr>
              </thead>
              <tbody>
                {roomShiftings.length === 0 ? (
                  <Tr>
                    <Td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                      No room shifting records found
                    </Td>
                  </Tr>
                ) : (
                  roomShiftings.slice(0, entriesPerPage).map((shifting, idx) => (
                    <Tr key={idx}>
                      <Td>
                        <ActionButton title="More actions">⋮</ActionButton>
                      </Td>
                      <Td>{shifting.admittedOn || '-'}</Td>
                      <Td>{shifting.dateOfShifting ? `${shifting.dateOfShifting} ${shifting.timeOfShifting || ''}` : '-'}</Td>
                      <Td>-</Td>
                      <Td>{shifting.uhid || '-'}</Td>
                      <Td>{shifting.name || '-'}</Td>
                      <Td>{`${shifting.ipNo || '-'} / ${shifting.slNo || '-'}`}</Td>
                      <Td>{shifting.newRoom || shifting.currentRoomNumber || '-'}</Td>
                      <Td>{shifting.newBedNumber || shifting.currentBedNumber || '-'}</Td>
                      <Td>PATIENT</Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableSection>
      </Container>
    </PageWrapper>
  );
};

export default RoomShifting;
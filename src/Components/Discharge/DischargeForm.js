import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import DischargeReport from './DischargeReport';
import apiRequest from '../../Auth/apiRequest';
import {
  Container,
  SectionTitle,
  TableWrapper,
  Table,
  Th,
  Td,
  Tr,
  FormRow,
  InputWrapper,
  Label,
  Input,
  Select,
  ButtonContainer,
  Button,
  colors,
  PageWrapper,
  FormContent
} from '../GlobalStyles';
import styled from 'styled-components';

// Local styled-components removed in favor of GlobalStyles and standard HTML/inline styles.
const SearchIconWrapper = ({ onClick, children }) => (
  <div onClick={onClick} style={{
    position: 'absolute',
    right: '10px',
    cursor: 'pointer',
    color: '#0b6e75',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    {children}
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ opacity: 0, width: 0, height: 0 }}
    />
    <span style={{
      position: 'absolute',
      cursor: 'pointer',
      backgroundColor: checked ? '#0b6e75' : '#ccc',
      borderRadius: '20px',
      top: 0, left: 0, right: 0, bottom: 0,
      transition: '0.4s'
    }}>
      <span style={{
        position: 'absolute',
        height: '14px',
        width: '14px',
        left: '3px',
        bottom: '3px',
        backgroundColor: 'white',
        borderRadius: '50%',
        transition: '0.4s',
        transform: checked ? 'translateX(20px)' : 'none'
      }} />
    </span>
  </label>
);



export default function DischargeForm() {
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    uhid_no: '',
    ip_number: '',
    discharge_date: '',
    discharge_time: '',
    free_visits: '',
    other_consultants: '',
    status: '',
    patient_expired: false,
    date_of_death: '',
    time_of_death: '',
    discharge_reason: '',
    doa: null,
    dot: null,
    salutation: null,
    first_name: null,
    middle_name: null,
    last_name: null,
    age: null,
    gender: null,
    doctor: null,
    referred_by: null,
    discount_percent: null,
    discount: null,
    discount_remarks: null,
    total: null,
    final_price: null,
    item: null,
  });

  const [patientInfo, setPatientInfo] = useState({
    patientName: '',
    address: '',
    guardian: '',
    admissionDate: '',
    currentRoom: '',
    doctor: '',
    currentDues: '',
  });

  const [filters, setFilters] = useState({
    uhidFilter: '',
    ipFilter: '',
    dateFilter: '',
  });

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().substring(0, 5);
    return { date, time };
  };

  useEffect(() => {
    const { date, time } = getCurrentDateTime();
    setFormData(prev => ({
      ...prev,
      discharge_date: date,
      discharge_time: time
    }));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearchClick = (type) => {
    setSearchType(type);
    setIsLoading(true);

    const searchEndpoint = `${process.env.REACT_APP_BACKEND_HMS_BASE_URL}search-admissions/?${type === 'uhid' ? 'uhid=' + formData.uhid_no : 'ipNumber=' + formData.ip_number}`;

    apiRequest(searchEndpoint, "GET")
      .then(response => {
        if (response.success) {
          setSearchResults(Array.isArray(response.data) ? response.data : []);
          setShowSearchModal(true);
        } else {
          console.error('Error searching for patients:', response.error);
          alert('Error searching for patients. Please try again.');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error searching for patients:', err);
        alert('Error searching for patients. Please try again.');
        setIsLoading(false);
      });
  };

  const handleSelectPatient = (patient) => {
    setFormData(prev => ({
      ...prev,
      uhid_no: patient.uhid,
      ip_number: patient.ipNumber,
      doa: patient.admissionDate || null,
      dot: null,
      salutation: patient.salutation || null,
      first_name: patient.firstName || null,
      middle_name: patient.middleName || null,
      last_name: patient.lastName || null,
      age: patient.age || null,
      gender: patient.gender || null,
      doctor: patient.admittingDoctor || null,
      referred_by: patient.referredBy || null,
      discount_percent: patient.discountPercent || null,
      discount: patient.discount || null,
      discount_remarks: patient.discountRemarks || null,
      total: patient.total || null,
      final_price: patient.finalPrice || null,
      item: patient.item || null,
    }));

    setPatientInfo({
      patientName: `${patient.salutation || ''} ${patient.firstName} ${patient.middleName || ''} ${patient.lastName}`.trim(),
      address: patient.permanentAddress || '',
      guardian: patient.guardian || '',
      admissionDate: patient.admissionDate || '',
      currentRoom: `${patient.roomNo || ''} / ${patient.bedNo || ''}`,
      doctor: patient.admittingDoctor || '',
      currentDues: patient.currentDues || '',
    });

    setShowSearchModal(false);
  };

  const handleCancelClick = () => {
    setShowConfirmationModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.uhid_no || !formData.ip_number || !formData.status || !formData.discharge_reason) {
        alert('Please fill in all required fields marked with *');
        return;
      }

      const cleanedData = {
        ...formData,
        date_of_death: formData.patient_expired && formData.date_of_death ? formData.date_of_death : null,
        time_of_death: formData.patient_expired && formData.time_of_death ? formData.time_of_death : null,
        dot: new Date().toISOString(),
      };

      const response = await apiRequest(`${process.env.REACT_APP_BACKEND_HMS_BASE_URL}discharge/`, "POST", cleanedData);

      if (response.success) {
        alert('Discharge details saved successfully!');
      } else {
        alert('Error saving data: ' + response.error);
      }
    } catch (err) {
      alert('Error saving data: ' + (err.message));
      console.error(err);
    }
  };

  const confirmReset = () => {
    resetForm();
    setShowConfirmationModal(false);
  };

  const resetForm = () => {
    const { date, time } = getCurrentDateTime();
    setFormData({
      uhid_no: '',
      ip_number: '',
      discharge_date: date,
      discharge_time: time,
      free_visits: '',
      other_consultants: '',
      status: '',
      patient_expired: false,
      date_of_death: '',
      time_of_death: '',
      discharge_reason: '',
      doa: null,
      dot: null,
      salutation: null,
      first_name: null,
      middle_name: null,
      last_name: null,
      age: null,
      gender: null,
      doctor: null,
      referred_by: null,
      discount_percent: null,
      discount: null,
      discount_remarks: null,
      total: null,
      final_price: null,
      item: null,
    });

    setPatientInfo({
      patientName: '',
      address: '',
      guardian: '',
      admissionDate: '',
      currentRoom: '',
      doctor: '',
      currentDues: '',
    });
  };

  return (
    <PageWrapper>
      <Container>
        <FormContent>
          <SectionTitle><h3>Discharge Form</h3></SectionTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Input
                name="uhidFilter"
                placeholder="Filter by UHID"
                value={filters.uhidFilter}
                onChange={handleFilterChange}
                style={{ width: '150px' }}
              />
              <Input
                name="ipFilter"
                placeholder="Filter by IP"
                value={filters.ipFilter}
                onChange={handleFilterChange}
                style={{ width: '150px' }}
              />
              <Input
                name="dateFilter"
                type="date"
                value={filters.dateFilter}
                onChange={handleFilterChange}
                style={{ width: '150px' }}
              />
            </div>
            <Button secondary onClick={() => setFormVisible(!formVisible)}>
              {formVisible ? '-DischargeForm' : '+DischargeForm'}
            </Button>
          </div>

          {formVisible && (
            <>
              <FormRow>
                <InputWrapper>
                  <Label required>UHID No</Label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Input
                      name="uhid_no"
                      onChange={handleChange}
                      value={formData.uhid_no}
                    />
                    <SearchIconWrapper onClick={() => handleSearchClick('uhid')}>
                      <Search size={16} />
                    </SearchIconWrapper>
                  </div>
                </InputWrapper>
                <InputWrapper>
                  <Label required>IP number</Label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Input
                      name="ip_number"
                      onChange={handleChange}
                      value={formData.ip_number}
                    />
                    <SearchIconWrapper onClick={() => handleSearchClick('ip')}>
                      <Search size={16} />
                    </SearchIconWrapper>
                  </div>
                </InputWrapper>
                <InputWrapper>
                  <Label>Patient Name</Label>
                  <Input type="text" value={patientInfo.patientName} disabled />
                </InputWrapper>
                <InputWrapper>
                  <Label>Address</Label>
                  <Input type="text" value={patientInfo.address} disabled />
                </InputWrapper>
                <InputWrapper>
                  <Label>Guardian</Label>
                  <Input type="text" value={patientInfo.guardian} disabled />
                </InputWrapper>

                <InputWrapper>
                  <Label>Discharge Date</Label>
                  <Input name="discharge_date" type="date" onChange={handleChange} value={formData.discharge_date} />
                </InputWrapper>
                <InputWrapper>
                  <Label>Time</Label>
                  <Input name="discharge_time" type="time" onChange={handleChange} value={formData.discharge_time} />
                </InputWrapper>
                <InputWrapper>
                  <Label>Admn. Date</Label>
                  <Input type="text" value={patientInfo.admissionDate} disabled />
                </InputWrapper>
                <InputWrapper>
                  <Label>Current Room</Label>
                  <Input type="text" value={patientInfo.currentRoom} disabled />
                </InputWrapper>
                <InputWrapper>
                  <Label>Doctor</Label>
                  <Input type="text" value={patientInfo.doctor} disabled />
                </InputWrapper>

                <InputWrapper>
                  <Label>Free Visits</Label>
                  <Input name="free_visits" onChange={handleChange} value={formData.free_visits} />
                </InputWrapper>
                <InputWrapper>
                  <Label>Other Consultants</Label>
                  <Input name="other_consultants" onChange={handleChange} value={formData.other_consultants} />
                </InputWrapper>
                <InputWrapper>
                  <Label>Status *</Label>
                  <Select name="status" onChange={handleChange} value={formData.status}>
                    <option value="">Select</option>
                    <option value="Discharged">Discharged</option>
                    <option value="Transferred">Transferred</option>
                  </Select>
                </InputWrapper>
                <InputWrapper>
                  <Label>Current Dues</Label>
                  <Input type="text" value={patientInfo.currentDues} disabled />
                </InputWrapper>
                <InputWrapper>
                  <Label>Patient Expired</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ToggleSwitch
                      checked={formData.patient_expired}
                      onChange={(e) => handleChange({ target: { name: 'patient_expired', type: 'checkbox', checked: !formData.patient_expired } })}
                    />
                    <span>{formData.patient_expired ? 'YES' : 'NO'}</span>
                  </div>
                </InputWrapper>

                <InputWrapper>
                  <Label>Date of Death</Label>
                  <Input
                    name="date_of_death"
                    type="date"
                    onChange={handleChange}
                    value={formData.date_of_death}
                    disabled={!formData.patient_expired}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>Time</Label>
                  <Input
                    name="time_of_death"
                    type="time"
                    onChange={handleChange}
                    value={formData.time_of_death}
                    disabled={!formData.patient_expired}
                  />
                </InputWrapper>
                <InputWrapper style={{ gridColumn: 'span 3' }}>
                  <Label>Discharge Reason *</Label>
                  <Input name="discharge_reason" onChange={handleChange} value={formData.discharge_reason} />
                  <ButtonContainer style={{ justifyContent: 'flex-end', marginTop: 0, paddingTop: 0, border: 'none' }}>
                    <Button secondary onClick={handleCancelClick}>X Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                  </ButtonContainer>
                </InputWrapper>
              </FormRow>
            </>
          )}

          {showSearchModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, color: '#0b6e75' }}>Search Results</h3>
                  <button onClick={() => setShowSearchModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' }}>×</button>
                </div>

                {isLoading ? (
                  <div>Loading...</div>
                ) : searchResults.length > 0 ? (
                  <div style={{ marginTop: '10px' }}>
                    {searchResults.map((patient, index) => (
                      <div key={index} onClick={() => handleSelectPatient(patient)} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '8px', cursor: 'pointer' }}>
                        <div><strong>UHID:</strong> {patient.uhid}</div>
                        <div><strong>IP:</strong> {patient.ipNumber}</div>
                        <div><strong>Name:</strong> {patient.firstName} {patient.lastName}</div>
                        <div><strong>Admission Date:</strong> {patient.admissionDate}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>No patients found matching your search criteria.</div>
                )}
              </div>
            </div>
          )}

          {showConfirmationModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, color: '#0b6e75' }}>Confirm Reset</h3>
                  <button onClick={() => setShowConfirmationModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#666' }}>×</button>
                </div>
                <p style={{ margin: '20px 0', fontSize: '16px', fontWeight: 'bold' }}>Are you sure you want to reset?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                  <Button onClick={confirmReset}>Yes</Button>
                  <Button secondary onClick={() => setShowConfirmationModal(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}

          <DischargeReport filters={filters} />
        </FormContent>
      </Container>
    </PageWrapper>
  );
}
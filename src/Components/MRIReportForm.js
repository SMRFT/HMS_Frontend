import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { TextField, Button, MenuItem, Typography, Grid } from '@mui/material';

const Container = styled.div`
  margin-left: 250px; /* Account for sidebar width */
  padding: 20px;
  margin-top: 50px; /* Account for header height */
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 10px;
    margin-top: 70px; /* Adjust for smaller screens */
  }
`;

const FormWrapper = styled.form`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Title = styled(Typography)`
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
  text-align: center;
  color: #15616d;
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #15616d !important;
  color: white !important;
  font-size: 14px;
  &:hover {
    background: linear-gradient(90deg, #15616d, #1d7686) !important;
  }
`;

const MRIReportForm = () => {
  const { uhid, subUhid } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [date, setDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [investigation, setInvestigation] = useState('');
  const [impression, setImpression] = useState('');

  useEffect(() => {
    fetch(`https://hms.shinovadatabase.in/investigations/${uhid}/${subUhid}/`)
      .then((response) => response.json())
      .then((data) => {
        setPatientData(data);
        setDate(data.date.split('T')[0]);
        setPatientName(data["Patient name"]);
        setAge(data["Age"]);
        setGender(data["gender"]);
        setInvestigation(data["Investigation"]);
      })
      .catch((error) => console.error('Error fetching patient data:', error));
  }, [uhid, subUhid]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const patientId = `${uhid}/${subUhid}`;

    const reportData = {
      date,
      patientId,
      patientName,
      age,
      gender,
      investigation,
      impression,
      approve: false,
      approve_time: null,
    };

    fetch('https://hms.shinovadatabase.in/mri-reports/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('MRI report submitted successfully');
        setDate('');
        setPatientName('');
        setAge('');
        setGender('');
        setInvestigation('');
        setImpression('');
      })
      .catch((error) => {
        alert('Error submitting MRI report');
        console.error('Error:', error);
      });
  };

  return (
    <Container>
      <Title variant="h4">MRI Report Form</Title>
      {patientData ? (
        <FormWrapper onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UHID"
                value={`${uhid}/${subUhid}`}
                variant="outlined"
                required
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Patient Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                variant="outlined"
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Type of Investigation"
                value={investigation}
                onChange={(e) => setInvestigation(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Impression"
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                variant="outlined"
                multiline
                rows={4}
                required
              />
            </Grid>
          </Grid>
          <br/>
          <SubmitButton variant="contained" color="primary" type="submit">
            Submit
          </SubmitButton>
        </FormWrapper>
      ) : (
        <Typography variant="h6" align="center">
          Loading patient details...
        </Typography>
      )}
    </Container>
  );
};

export default MRIReportForm;

import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, TextField, Button, MenuItem } from '@mui/material';
import { useParams } from 'react-router-dom';

const CTReportForm = () => {
  const { uhid, subUhid } = useParams();  // Capture both UHID and subUhid from URL
  const [patientData, setPatientData] = useState(null);
  const [date, setDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [investigation, setInvestigation] = useState('');
  const [impression, setImpression] = useState('');

  // Fetch patient report data based on UHID and subUhid
  useEffect(() => {
    fetch(`http://localhost:8000/investigations/${uhid}/${subUhid}/`)  // Send both UHID and subUhid to the backend
      .then((response) => response.json())
      .then((data) => {
        setPatientData(data);
        // Pre-fill form fields with fetched data
        setDate(data.date.split('T')[0]);  // Extract the date part only
        setPatientName(data["Patient name"]);
        setAge(data["Age"]);
        setGender(data["gender"]);
        setInvestigation(data["Investigation"]);
      })
      .catch((error) => console.error('Error fetching patient data:', error));
  }, [uhid, subUhid]);

  const handleSubmit = (event) => {
    event.preventDefault();
  
    // Concatenate uhid and subUhid to form patient_id
    const patientId = `${uhid}/${subUhid}`;
  
    const reportData = {
      date,
      patientId,  // Send the concatenated patient_id
      patientName,
      age,
      gender,
      investigation,
      impression,
      approve: false,  // Set approve as false
      approve_time: null,  // Set approve_time as null
    };
  
    fetch('http://localhost:8000/ct-reports/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('CT report submitted successfully');
        // Clear form after submission
        setDate('');
        setPatientName('');
        setAge('');
        setGender('');
        setInvestigation('');
        setImpression('');
      })
      .catch((error) => {
        alert('Error submitting CT report');
        console.error('Error:', error);
      });
  };
  
  

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        CT Report Form
      </Typography>
      {patientData ? (
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            mt: 3,
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 3,
          }}
          onSubmit={handleSubmit}
        >
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
                value={`${uhid}/${subUhid}`}  // Concatenate UHID and subUhid with a slash in between
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
          <Box mt={3} textAlign="center">
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="h6" align="center">
          Loading patient details...
        </Typography>
      )}
    </Container>
  );
};

export default CTReportForm;

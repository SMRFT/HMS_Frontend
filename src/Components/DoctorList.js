import React, { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DoctorList() {
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/doctor_list/')
            .then(response => setDoctors(response.data))
            .catch(error => console.error('Error fetching doctors:', error));
    }, []);

    const handleShowDetails = (first_name) => {
        navigate(`/DoctorList/${first_name}`);
    };
    

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Doctor List
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>S.No</TableCell>
                        <TableCell>Doctor Name</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {doctors.map((doctor, index) => (
                        <TableRow key={doctor.first_name}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{`${doctor.first_name} ${doctor.middle_name || ''} ${doctor.last_name}`.trim()}</TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleShowDetails(doctor.first_name)}
                                >
                                    Show Details
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
}

export default DoctorList;

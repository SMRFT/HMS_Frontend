import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import { FaUserMd, FaCalendarAlt } from 'react-icons/fa';
import {
    PageWrapper,
    Header,
    Title,
    Table,
    Th,
    Td,
    Tr,
    PrimaryButton,
    LoadingIndicator,
    TableWrapper
} from '../GlobalStyledComponents';

function DoctorList() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            console.log('Fetching from:', `${HMSURL}doctor_list_diagnostics/`);

            const result = await apiRequest(`${HMSURL}doctor_list_diagnostics/`, 'GET');

            console.log('API Result:', result);

            if (result.success) {
                console.log('Doctors data:', result.data);
                setDoctors(result.data);
            } else {
                console.error('Error fetching doctors:', result.error);
                toast.error(result.error || 'Failed to fetch doctors');
            }
            setLoading(false);
        };

        fetchDoctors();
    }, [HMSURL]);

    const handleShowDetails = (employeeId) => {
        navigate(`/DoctorSchedule/${employeeId}`);
    };

    if (loading) {
        return (
            <PageWrapper>
                <LoadingIndicator>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    Loading doctors...
                </LoadingIndicator>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <Header>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaUserMd size={24} />
                    <span>Doctor Schedule Management</span>
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    Designation: DESIG094
                </div>
            </Header>

            <TableWrapper>
                <Table>
                    <thead>
                        <tr>
                            <Th style={{ width: '80px', textAlign: 'center' }}>S.No</Th>
                            <Th style={{ width: '150px' }}>Employee ID</Th>
                            <Th>Doctor Name</Th>
                            <Th style={{ width: '200px', textAlign: 'center' }}>Action</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.length === 0 ? (
                            <Tr>
                                <Td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ color: '#666', fontSize: '16px' }}>
                                        <FaUserMd size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                        <div>No doctors found with designation DESIG094</div>
                                    </div>
                                </Td>
                            </Tr>
                        ) : (
                            doctors.map((doctor, index) => (
                                <Tr key={doctor.employeeId}>
                                    <Td style={{ textAlign: 'center', fontWeight: '600' }}>
                                        {index + 1}
                                    </Td>
                                    <Td style={{ fontWeight: '500', color: '#008080' }}>
                                        {doctor.employeeId}
                                    </Td>
                                    <Td style={{ fontWeight: '500' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FaUserMd style={{ color: '#15616d' }} />
                                            {doctor.employeeName}
                                        </div>
                                    </Td>
                                    <Td style={{ textAlign: 'center' }}>
                                        <PrimaryButton
                                            onClick={() => handleShowDetails(doctor.employeeId)}
                                            style={{ margin: '0 auto' }}
                                        >
                                            <FaCalendarAlt style={{ marginRight: '8px' }} />
                                            Manage Schedule
                                        </PrimaryButton>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </TableWrapper>
        </PageWrapper>
    );
}

export default DoctorList;
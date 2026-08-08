import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";
const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;


const PageContainer = styled.div`
    padding: 24px;
    background-color: #f4f6f9;
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const HeaderTitle = styled.h2`
    color: #1e6038;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
`;

const FilterCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
`;

const Label = styled.label`
    font-weight: 600;
    color: #2d3748;
    font-size: 14px;
`;

const DateInput = styled.input`
    padding: 8px 14px;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    color: #2d3748;
    &:focus {
        border-color: #1e6038;
        box-shadow: 0 0 0 3px rgba(30, 96, 56, 0.15);
    }
`;

const TextInput = styled.input`
    padding: 8px 14px;
    border: 1px solid #cbd5e0;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    width: 260px;
    color: #2d3748;
    &:focus {
        border-color: #1e6038;
        box-shadow: 0 0 0 3px rgba(30, 96, 56, 0.15);
    }
`;

const Button = styled.button`
    background: #1e6038;
    color: #ffffff;
    border: none;
    padding: 9px 18px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    &:hover {
        background: #154628;
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
`;

const MetricCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-left: 5px solid ${(props) => props.borderColor || "#1e6038"};
`;

const MetricValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: #1a202c;
    margin-top: 4px;
`;

const MetricLabel = styled.div`
    font-size: 13px;
    color: #718096;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TableCard = styled.div`
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    th, td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
    }

    th {
        background-color: #f7fafc;
        color: #2d3748;
        font-weight: 700;
        position: sticky;
        top: 0;
    }

    tbody tr:hover {
        background-color: #f8fafc;
    }
`;

const RatingBadge = styled.span`
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    background-color: ${(props) => {
        if (!props.val) return "#edf2f7";
        if (props.val.includes("Very Good")) return "#c6f6d5";
        if (props.val.includes("Good")) return "#e6fffa";
        if (props.val.includes("Average")) return "#feebc8";
        if (props.val.includes("Poor")) return "#fed7d7";
        return "#edf2f7";
    }};
    color: ${(props) => {
        if (!props.val) return "#4a5568";
        if (props.val.includes("Very Good")) return "#22543d";
        if (props.val.includes("Good")) return "#234e52";
        if (props.val.includes("Average")) return "#744210";
        if (props.val.includes("Poor")) return "#742a2a";
        return "#4a5568";
    }};
`;

const Feedbackreports = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [searchQuery, setSearchQuery] = useState("");
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReports = async (dateVal) => {
        setLoading(true);
        try {
            const primaryEndpoint = `${HMSURL}inpatient-feedback/?date=${dateVal}`;
            const res = await axios.get(primaryEndpoint);
            setRecords(res.data || []);
        } catch (error) {
            console.error("Error fetching feedback reports:", error);
            toast.error("Failed to load feedback reports for the selected date.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(selectedDate);
    }, [selectedDate]);

    const filteredRecords = records.filter((rec) => {
        const query = searchQuery.toLowerCase();
        return (
            (rec.patient_name || "").toLowerCase().includes(query) ||
            (rec.ip_number || "").toLowerCase().includes(query) ||
            (rec.doctor_name || "").toLowerCase().includes(query) ||
            (rec.mobile_number || "").toLowerCase().includes(query)
        );
    });

    // Metrics calculations
    const totalSubmissions = filteredRecords.length;
    const recommendScores = filteredRecords
        .map((r) => parseFloat(r.recommend_rating))
        .filter((n) => !isNaN(n));
    const avgRecommend = recommendScores.length
        ? (recommendScores.reduce((a, b) => a + b, 0) / recommendScores.length).toFixed(1)
        : "N/A";

    const positiveCount = filteredRecords.filter(
        (r) => r.overall_experience && (r.overall_experience.includes("Good") || r.overall_experience.includes("Very Good"))
    ).length;
    const satisfactionRate = totalSubmissions ? `${Math.round((positiveCount / totalSubmissions) * 100)}%` : "0%";

    return (
        <PageContainer>
            <HeaderTitle>
                <span>📊</span> Shanmuga Hospital - InPatient Feedback Reports
            </HeaderTitle>

            <FilterCard>
                <FilterGroup>
                    <Label htmlFor="reportDate">Select Date:</Label>
                    <DateInput
                        id="reportDate"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <Button onClick={() => fetchReports(selectedDate)}>
                        🔄 Refresh Data
                    </Button>
                </FilterGroup>

                <FilterGroup>
                    <TextInput
                        type="text"
                        placeholder="Search patient, IP No, doctor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </FilterGroup>
            </FilterCard>




            <MetricsGrid>
                <MetricCard borderColor="#1e6038">
                    <MetricLabel>Total Submissions ({selectedDate})</MetricLabel>
                    <MetricValue>{totalSubmissions}</MetricValue>
                </MetricCard>

                <MetricCard borderColor="#3182ce">
                    <MetricLabel>Avg Recommend Score (1-10)</MetricLabel>
                    <MetricValue>{avgRecommend} {avgRecommend !== "N/A" && "/ 10"}</MetricValue>
                </MetricCard>

                <MetricCard borderColor="#38a169">
                    <MetricLabel>Satisfaction Rate (Good/Very Good)</MetricLabel>
                    <MetricValue>{satisfactionRate}</MetricValue>
                </MetricCard>
            </MetricsGrid>

            <TableCard>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, color: "#2d3748", fontSize: "16px" }}>
                        Feedback Entries ({selectedDate})
                    </h3>
                    <span style={{ fontSize: "13px", color: "#718096" }}>
                        Showing {filteredRecords.length} records
                    </span>
                </div>

                {loading ? (
                    <p style={{ textAlign: "center", padding: "20px", color: "#718096" }}>Loading reports...</p>
                ) : filteredRecords.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "24px", color: "#a0aec0" }}>
                        No feedback records found for {selectedDate}.
                    </p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Submission Time</th>
                                    <th>Type</th>
                                    <th>Patient Name</th>
                                    <th>Discharge Date</th>
                                    <th>Contact No</th>
                                    <th>IP No</th>
                                    <th>Doctor Name</th>
                                    <th>Category</th>
                                    <th>Reason for Choosing</th>
                                    <th>Referral Doctor</th>
                                    <th>Overall Exp</th>
                                    <th>Recommend (1-10)</th>
                                    <th>Admission</th>
                                    <th>In Room</th>
                                    <th>Room Cleanliness</th>
                                    <th>Doctor Care</th>
                                    <th>Nursing Care</th>
                                    <th>Diagnostic</th>
                                    <th>Pharmacy</th>
                                    <th>Canteen</th>
                                    <th>Food Quality</th>
                                    <th>IP Insurance</th>
                                    <th>IP Billing</th>
                                    <th>Discharge</th>
                                    <th>Premises Cleanliness</th>
                                    <th>Suggestions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((rec, idx) => (
                                    <tr key={rec.id || idx}>
                                        <td>{rec.created_date ? new Date(rec.created_date).toLocaleString() : "-"}</td>
                                        <td>
                                            <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 6px", borderRadius: "8px", backgroundColor: "#e2e8f0", color: "#2d3748" }}>
                                                {rec.feedback_type || "In-Hospital"}
                                            </span>
                                        </td>
                                        <td><strong>{rec.patient_name || "Anonymous"}</strong></td>
                                        <td>{rec.discharge_date || "-"}</td>
                                        <td>{rec.mobile_number || "-"}</td>
                                        <td>{rec.ip_number || "-"}</td>
                                        <td style={{ maxWidth: "160px" }}>{rec.doctor_name || "-"}</td>
                                        <td>{rec.category || "-"}</td>
                                        <td style={{ maxWidth: "180px" }}>{rec.chose_hospital_reason || "-"}</td>
                                        <td>{rec.referral_doctor_name || "-"}</td>
                                        <td><RatingBadge val={rec.overall_experience}>{rec.overall_experience || "-"}</RatingBadge></td>
                                        <td><span style={{ fontWeight: "700", color: "#1e6038" }}>{rec.recommend_rating ? `${rec.recommend_rating} / 10` : "-"}</span></td>
                                        <td><RatingBadge val={rec.admission_experience}>{rec.admission_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.in_room_experience}>{rec.in_room_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.in_room_cleanliness_experience}>{rec.in_room_cleanliness_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.doctor_care}>{rec.doctor_care || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.nursing_care}>{rec.nursing_care || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.diagnostic_experience}>{rec.diagnostic_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.pharmacy_experience}>{rec.pharmacy_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.canteen_experience}>{rec.canteen_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.food_quality}>{rec.food_quality || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.ip_insurance_experience}>{rec.ip_insurance_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.ip_billing_experience}>{rec.ip_billing_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.discharge_experience}>{rec.discharge_experience || "-"}</RatingBadge></td>
                                        <td><RatingBadge val={rec.cleanliness_experience}>{rec.cleanliness_experience || "-"}</RatingBadge></td>
                                        <td style={{ maxWidth: "200px" }}>{rec.suggestion_or_observation || rec.special_mention_staff || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </TableCard>
        </PageContainer>
    );
};

export default Feedbackreports;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SummaryPrint.css";
import SummaryHead from './Images/SummaryHead.png';

const SummaryPrint = () => {
    const { ipNo } = useParams();
    const [summaryData, setSummaryData] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/edit-editsummary/${ipNo}/`
                );
                if (response.ok) {
                    const data = await response.json();
                    setSummaryData(data);
                } else {
                    alert("Summary not found");
                }
            } catch (error) {
                console.error("Error fetching summary:", error);
            }
        };

        fetchSummary();
    }, [ipNo]);

    const handlePrint = () => {
        window.print();
    };

    if (!summaryData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="print-container1">
            <div className="print-container">
            <div className="header">
                <img
                    src={SummaryHead}
                    alt="Shanmuga Hospital Logo"
                    className="hospital-logo"
                    style={{ width: '1000px', height: '150px' }}
                />

                <h2 className="title">{summaryData.summaryType}</h2>

                <div className="patient-info">
                    <div className="left-side">
                        <p><strong>Name:</strong> {summaryData.patient}</p>
                        <p><strong>UHID:</strong> {summaryData.uhid}</p>
                        <p><strong>IP No:</strong> {summaryData.ipNo}</p>
                        <p><strong>Address:</strong> {summaryData.address}</p>
                    </div>

                    <div className="right-side">
                        <p><strong>Consultant:</strong> {summaryData.doctor}</p>
                        <p><strong>DOA:</strong> {summaryData.doa}</p>
                        <p><strong>DOD:</strong> {summaryData.dod}</p>
                        <p><strong>Room:</strong> {summaryData.roomNo}</p>
                    </div>
                </div>

                <hr />
            </div>


            <div className="main-content1">

                <div className="section diagnosis">
                    <h3>Diagnosis</h3>
                    <p>{summaryData.disease}</p>
                </div>

                <div className="section history">
                    <h3>History</h3>
                    <p>{summaryData.fieldsData["BRIEF HISTORY"]}</p>
                </div>

                <div className="section investigations">
                    <h3>Investigations</h3>
                    {Object.entries(summaryData.fieldsData).map(([key, value]) => (
                        <p key={key}>
                            <strong>{key}:</strong> {value}
                        </p>
                    ))}
                </div>
            </div>

            <div className="footer">
                <hr />
                <p>For Emergency Contact: 0427-2706666</p>
        
            </div>
            </div>
            <button onClick={handlePrint} className="print-button">Print</button>
        </div>
    );
};

export default SummaryPrint;

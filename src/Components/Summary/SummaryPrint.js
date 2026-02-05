import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SummaryHead from '../Images/SummaryHead.png';
import apiRequest from "../../Auth/apiRequest";
import { format } from "date-fns";

const SummaryPrint = () => {
    const { ipNo } = useParams();
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        const fetchSummary = async () => {
            const result = await apiRequest(
                `${HMSURL}get-printsummary/${ipNo}/`,
                'GET'
            );

            if (result.success) {
                setSummaryData(result.data);
            } else {
                alert("Summary not found");
                console.error("Error fetching summary:", result.error);
            }
        };

        fetchSummary();
    }, [ipNo, HMSURL]);

    const handlePrint = async () => {
        if (!summaryData) return;

        try {
            setLoading(true);

            const previewPages = document.querySelectorAll('.preview-page');

            if (previewPages.length === 0) {
                alert("No preview pages found. Please try again.");
                setLoading(false);
                return;
            }

            const doc = new jsPDF();

            for (let i = 0; i < previewPages.length; i++) {
                if (i > 0) {
                    doc.addPage();
                }

                const canvas = await html2canvas(previewPages[i], {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (imgHeight > pageHeight) {
                    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight);
                } else {
                    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                }
            }

            const fileName = `DischargeSummary_${summaryData.patient.replace(/\s+/g, "_")}_${summaryData.ipNo}.pdf`;
            doc.save(fileName);

            setLoading(false);
            alert("Discharge summary generated successfully!");

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error generating PDF. Please try again.");
            setLoading(false);
        }
    };

    const renderPreview = () => {
        if (!summaryData) return null;

        const fieldsData = typeof summaryData.fieldsData === 'string'
            ? JSON.parse(summaryData.fieldsData)
            : summaryData.fieldsData;

        const styles = {
            page: {
                backgroundColor: 'white',
                width: '210mm',
                minHeight: '297mm',
                padding: '5mm',
                marginBottom: '10mm',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                fontFamily: 'Arial, sans-serif',
                position: 'relative',
                pageBreakAfter: 'always'
            },
            contentWrapper: {
                padding: '8mm',
                border: '1px solid #000',
                minHeight: 'calc(297mm - 10mm - 16mm)',
                position: 'relative'
            },
            header: {
                textAlign: 'center',
                marginBottom: '3mm'
            },
            logo: {
                maxWidth: '100%',
                height: 'auto',
                display: 'block'
            },
            title: {
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                margin: '3mm 0',
                textDecoration: 'underline'
            },
            infoGrid: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1mm 5mm',
                fontSize: '9px',
                marginBottom: '3mm',
                lineHeight: '1.4',
                paddingBottom: '3mm',
                borderBottom: '1px solid #000'
            },
            infoRow: {
                display: 'flex',
                alignItems: 'baseline'
            },
            infoLabel: {
                fontWeight: 'normal',
                minWidth: '75px',
                flexShrink: 0
            },
            infoColon: {
                margin: '0 3px',
                flexShrink: 0
            },
            infoValue: {
                flex: 1
            },
            icdBox: {
                fontSize: '9px',
                marginBottom: '3mm',
                lineHeight: '1.6',
                display: 'flex',
                alignItems: 'baseline'
            },
            sectionTitle: {
                fontSize: '9px',
                fontWeight: 'bold',
                marginTop: '3mm',
                marginBottom: '1mm',
                textTransform: 'uppercase',
                textDecoration: 'underline'
            },
            sectionContent: {
                fontSize: '9px',
                lineHeight: '1.5',
                marginLeft: '8mm',
                textAlign: 'justify',
                whiteSpace: 'pre-wrap',
                marginBottom: '2mm'
            },
            // Lab report styles
            labReportSection: {
                marginTop: '5mm',
                marginBottom: '3mm'
            },
            labReportTitle: {
                fontSize: '10px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '3mm',
                textTransform: 'uppercase',
                textDecoration: 'underline'
            },
            labTable: {
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '8px',
                marginTop: '2mm'
            },
            labTableHeader: {
                backgroundColor: '#f0f0f0',
                fontWeight: 'bold',
                borderTop: '1px solid #000',
                borderBottom: '1px solid #000'
            },
            labTableCell: {
                padding: '2mm 1mm',
                borderBottom: '1px solid #ddd',
                verticalAlign: 'top'
            },
            labDepartmentHeader: {
                fontSize: '9px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: '3mm',
                marginBottom: '2mm',
                textTransform: 'uppercase',
                borderBottom: '1px solid #000',
                paddingBottom: '1mm'
            },
            labTestName: {
                fontWeight: 'bold'
            },
            labHighValue: {
                color: '#ff0000',
                fontWeight: 'bold'
            },
            labLowValue: {
                color: '#0000ff',
                fontWeight: 'bold'
            },
            labVerifiedBy: {
                fontSize: '8px',
                fontStyle: 'italic',
                marginTop: '1mm',
                marginBottom: '2mm'
            },
            simpleHeader: {
                fontSize: '9px',
                marginBottom: '3mm',
                lineHeight: '1.4',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1mm 5mm',
                paddingBottom: '3mm',
                borderBottom: '1px solid #000'
            },
            simpleHeaderRow: {
                display: 'flex',
                alignItems: 'baseline'
            },
            signatures: {
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: '15mm',
                fontSize: '9px',
                lineHeight: '1.6'
            },
            signatureBlock: {
                textAlign: 'center'
            },
            footer: {
                position: 'absolute',
                bottom: '8mm',
                left: '8mm',
                right: '8mm',
                fontSize: '8px',
                textAlign: 'center',
                lineHeight: '1.5'
            },
            explainedSection: {
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '20mm',
                fontSize: '9px'
            },
            explainedColumn: {
                width: '45%'
            },
            explainedTitle: {
                fontWeight: 'bold',
                marginBottom: '8mm',
                textAlign: 'left'
            },
            explainedField: {
                marginBottom: '15mm'
            }
        };

        // Helper function to determine if value is high or low
        const getHighLowStatus = (value, reference) => {
            if (!value || !reference) return null;
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return null;

            if (reference.includes("-")) {
                const [min, max] = reference.split("-").map(v => parseFloat(v.trim()));
                if (!isNaN(min) && !isNaN(max)) {
                    if (numValue < min) return "L";
                    if (numValue > max) return "H";
                }
            } else if (reference.includes("<")) {
                const max = parseFloat(reference.replace("<", "").trim());
                if (!isNaN(max) && numValue > max) return "H";
            } else if (reference.includes(">")) {
                const min = parseFloat(reference.replace(">", "").trim());
                if (!isNaN(min) && numValue < min) return "L";
            }
            return null;
        };

        // Render laboratory reports
        const renderLabReports = () => {
            if (!summaryData.testdetails || summaryData.testdetails.length === 0) {
                return null;
            }

            // Group tests by department
            const testsByDepartment = summaryData.testdetails.reduce((acc, test) => {
                const dept = test.department || "LABORATORY";
                if (!acc[dept]) acc[dept] = [];
                acc[dept].push(test);
                return acc;
            }, {});

            return (
                <div style={styles.labReportSection}>
                    <div style={styles.labReportTitle}>Laboratory Investigation Report</div>

                    {Object.keys(testsByDepartment).map((department) => (
                        <div key={department} style={{ marginBottom: '4mm' }}>
                            <div style={styles.labDepartmentHeader}>{department}</div>

                            <table style={styles.labTable}>
                                <thead>
                                    <tr style={styles.labTableHeader}>
                                        <th style={{ ...styles.labTableCell, width: '25%' }}>Test</th>
                                        <th style={{ ...styles.labTableCell, width: '12%' }}>Specimen</th>
                                        <th style={{ ...styles.labTableCell, width: '12%' }}>Result</th>
                                        <th style={{ ...styles.labTableCell, width: '10%' }}>Units</th>
                                        <th style={{ ...styles.labTableCell, width: '18%' }}>Reference Value</th>
                                        <th style={{ ...styles.labTableCell, width: '18%' }}>Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testsByDepartment[department].map((test, idx) => {
                                        const status = getHighLowStatus(test.value, test.reference_range);
                                        const valueStyle = status === "H" ? styles.labHighValue :
                                            status === "L" ? styles.labLowValue : {};

                                        // If test has parameters, render them
                                        if (test.parameters && test.parameters.length > 0) {
                                            return (
                                                <React.Fragment key={idx}>
                                                    <tr>
                                                        <td colSpan="6" style={{ ...styles.labTableCell, ...styles.labTestName }}>
                                                            {test.testname}
                                                        </td>
                                                    </tr>
                                                    {test.parameters.map((param, paramIdx) => {
                                                        const paramStatus = getHighLowStatus(param.value, param.reference_range);
                                                        const paramValueStyle = paramStatus === "H" ? styles.labHighValue :
                                                            paramStatus === "L" ? styles.labLowValue : {};

                                                        return (
                                                            <tr key={`${idx}-${paramIdx}`}>
                                                                <td style={{ ...styles.labTableCell, paddingLeft: '4mm' }}>
                                                                    {param.name}
                                                                </td>
                                                                <td style={styles.labTableCell}>{param.specimen_type || ''}</td>
                                                                <td style={{ ...styles.labTableCell, ...paramValueStyle }}>
                                                                    {param.value || ''} {paramStatus && `(${paramStatus})`}
                                                                </td>
                                                                <td style={styles.labTableCell}>{param.unit || ''}</td>
                                                                <td style={styles.labTableCell}>{param.reference_range || ''}</td>
                                                                <td style={styles.labTableCell}>{param.method || ''}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                    <tr>
                                                        <td colSpan="6" style={styles.labVerifiedBy}>
                                                            Verified by: {test.verified_by || 'N/A'} |
                                                            Approved by: {test.approve_by || 'N/A'}
                                                            {test.approve_time && ` | ${test.approve_time}`}
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        } else {
                                            // Test without parameters
                                            return (
                                                <React.Fragment key={idx}>
                                                    <tr>
                                                        <td style={{ ...styles.labTableCell, ...styles.labTestName }}>
                                                            {test.testname}
                                                        </td>
                                                        <td style={styles.labTableCell}>{test.specimen_type || ''}</td>
                                                        <td style={{ ...styles.labTableCell, ...valueStyle }}>
                                                            {test.value || ''} {status && `(${status})`}
                                                        </td>
                                                        <td style={styles.labTableCell}>{test.unit || ''}</td>
                                                        <td style={styles.labTableCell}>{test.reference_range || ''}</td>
                                                        <td style={styles.labTableCell}>{test.method || ''}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="6" style={styles.labVerifiedBy}>
                                                            Verified by: {test.verified_by || 'N/A'} |
                                                            Approved by: {test.approve_by || 'N/A'}
                                                            {test.approve_time && ` | ${test.approve_time}`}
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        }
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}

                    <div style={{ textAlign: 'center', fontSize: '9px', fontWeight: 'bold', marginTop: '3mm' }}>
                        **End of Laboratory Report**
                    </div>
                </div>
            );
        };

        const renderSection = (title, content) => {
            if (!content) return null;

            // If this is the INVESTIGATIONS section and we have lab reports, add them after
            if (title === "INVESTIGATIONS" && summaryData.testdetails && summaryData.testdetails.length > 0) {
                return (
                    <div key={title}>
                        <div style={styles.sectionTitle}>{title} :</div>
                        <div style={styles.sectionContent}>{content}</div>
                        {renderLabReports()}
                    </div>
                );
            }

            return (
                <div key={title}>
                    <div style={styles.sectionTitle}>{title} :</div>
                    <div style={styles.sectionContent}>{content}</div>
                </div>
            );
        };

        // Simple header for continuation pages
        const ContinuationHeader = () => (
            <div style={styles.simpleHeader}>
                <div style={styles.simpleHeaderRow}>
                    <span style={styles.infoLabel}>Name</span>
                    <span style={styles.infoColon}>:</span>
                    <span>{summaryData.patient}</span>
                </div>
                <div style={styles.simpleHeaderRow}>
                    <span style={styles.infoLabel}>IP No</span>
                    <span style={styles.infoColon}>:</span>
                    <span>{summaryData.ipNo}</span>
                </div>
                <div style={styles.simpleHeaderRow}>
                    <span style={styles.infoLabel}>UHID</span>
                    <span style={styles.infoColon}>:</span>
                    <span>{summaryData.uhid}</span>
                </div>
                <div style={styles.simpleHeaderRow}>
                    <span style={styles.infoLabel}>Age/Gender</span>
                    <span style={styles.infoColon}>:</span>
                    <span>{summaryData.age} YEARS / {summaryData.gender.toUpperCase()}</span>
                </div>
            </div>
        );

        // Section order
        const sectionOrder = [
            "DOA AND DOD",
            "DISCHARGE TYPE",
            "DISCHARGE DIAGNOSIS",
            "CONSULTANT",
            "BRIEF HISTORY",
            "SIGNIFICANT PAST MEDICAL AND SURGICAL HISTORY",
            "GENERAL EXAMINATION",
            "VITALS",
            "COURSE IN THE HOSPITAL",
            "ONCOLOGY NOTES",
            "VACCINATION HISTORY",
            "SURGERIES / PROCEDURES PERFORMED",
            "SPECIFIC MEDICATION GIVEN DURING HOSPITAL STAY",
            "SURGICAL NOTES",
            "INVESTIGATIONS",
            "CONDITION ON DISCHARGE",
            "ADMISSION DIAGNOSIS",
            "ADVICE ON DISCHARGE"
        ];

        const allSections = [];
        sectionOrder.forEach(key => {
            const section = renderSection(key, fieldsData[key]);
            if (section) {
                allSections.push(section);
            }
        });

        // Dynamic section distribution based on content
        const distributeSections = () => {
            const pages = [];
            let currentPage = [];
            let currentHeight = 0;

            // Estimate heights (in mm)
            const headerHeight = 60; // First page header with logo
            const simpleHeaderHeight = 25; // Continuation page header
            const footerHeight = 15;
            const signatureHeight = 25;
            const pageHeight = 297;
            const availableFirstPage = pageHeight - headerHeight - footerHeight - 20;
            const availableContinuationPage = pageHeight - simpleHeaderHeight - footerHeight - 20;

            allSections.forEach((section, index) => {
                // Estimate section height based on content
                const sectionTitle = 5;
                const content = section.props.children[1]?.props?.children || '';
                const contentLines = typeof content === 'string' ? content.split('\n').length : 1;
                const contentHeight = contentLines * 4; // ~4mm per line

                // Check if this is the INVESTIGATIONS section with lab reports
                const hasLabReports = section.key === 'INVESTIGATIONS' &&
                    summaryData.testdetails &&
                    summaryData.testdetails.length > 0;
                const labReportsHeight = hasLabReports ? 80 : 0; // Estimate lab reports height

                const estimatedSectionHeight = sectionTitle + contentHeight + labReportsHeight + 5;

                const availableHeight = pages.length === 0 ? availableFirstPage : availableContinuationPage;

                if (currentHeight + estimatedSectionHeight > availableHeight && currentPage.length > 0) {
                    pages.push([...currentPage]);
                    currentPage = [section];
                    currentHeight = estimatedSectionHeight;
                } else {
                    currentPage.push(section);
                    currentHeight += estimatedSectionHeight;
                }
            });

            if (currentPage.length > 0) {
                pages.push(currentPage);
            }

            return pages;
        };

        const distributedPages = distributeSections();
        const page1Sections = distributedPages[0] || [];
        const page2Sections = distributedPages[1] || [];
        const page3Sections = distributedPages[2] || [];
        const page4Sections = distributedPages.slice(3).flat() || [];

        return (
            <div style={{ backgroundColor: '#f5f5f5', padding: '20px' }}>
                {/* Sticky action buttons */}
                <div style={{
                    position: 'sticky',
                    top: '0',
                    backgroundColor: 'white',
                    padding: '15px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    zIndex: 1000
                }}>
                    <button
                        onClick={handlePrint}
                        disabled={loading}
                        style={{
                            padding: '10px 25px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundColor: loading ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                </div>

                {/* Page 1 - First Page with Full Header */}
                <div className="preview-page" style={styles.page}>
                    <div style={styles.contentWrapper}>
                        <div style={styles.header}>
                            <img src={SummaryHead} alt="Hospital Header" style={styles.logo} />
                        </div>

                        <div style={styles.title}>DISCHARGE SUMMARY</div>

                        <div style={styles.infoGrid}>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Name</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.patient}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Age/Gender</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.age} YEARS / {summaryData.gender.toUpperCase()}</span>
                            </div>

                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>UHID</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.uhid}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Consultant</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.doctor}</span>
                            </div>

                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>IP No</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.ipNo}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>DOA & Time</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.doa}</span>
                            </div>

                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Address</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.address}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>DOD & Time</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.dod}</span>
                            </div>

                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>Room</span>
                                <span style={styles.infoColon}>:</span>
                                <span style={styles.infoValue}>{summaryData.roomNo}</span>
                            </div>
                        </div>

                        {summaryData.diseaseCode && summaryData.disease && (
                            <div style={styles.icdBox}>
                                <span style={styles.infoLabel}>ICD</span>
                                <span style={styles.infoColon}>:</span>
                                <span>{summaryData.diseaseCode} - {summaryData.disease}</span>
                            </div>
                        )}

                        <div style={{ paddingBottom: '10mm', minHeight: '220mm' }}>
                            {page1Sections}
                        </div>

                        <div style={styles.footer}>
                            <div>In case of Emergency to contact 0427 - 2706666 in Casualty OP</div>
                            <div>அவசர உதவிக்கு அழைக்கவும் : 0427 - 2706666</div>
                        </div>
                    </div>
                </div>

                {/* Page 2 - Continuation */}
                {page2Sections.length > 0 && (
                    <div className="preview-page" style={styles.page}>
                        <div style={styles.contentWrapper}>
                            <ContinuationHeader />
                            <div style={{ paddingBottom: '15mm', minHeight: '240mm' }}>
                                {page2Sections}
                            </div>

                            <div style={styles.footer}>
                                <div>In case of Emergency to contact 0427 - 2706666 in Casualty OP</div>
                                <div>அவசர உதவிக்கு அழைக்கவும் : 0427 - 2706666</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page 3 - Final Content with Signatures */}
                {page3Sections.length > 0 && (
                    <div className="preview-page" style={styles.page}>
                        <div style={styles.contentWrapper}>
                            <ContinuationHeader />

                            <div style={{ paddingBottom: '15mm', minHeight: '210mm' }}>
                                {page3Sections}
                            </div>

                            <div style={styles.signatures}>
                                <div style={styles.signatureBlock}>
                                    <div>Dr.Nandana</div>
                                    <div>DNB Resident</div>
                                </div>
                                <div style={styles.signatureBlock}>
                                    <div>{summaryData.doctor}</div>
                                    <div>Consultant</div>
                                </div>
                            </div>

                            <div style={styles.footer}>
                                <div>In case of Emergency to contact 0427 - 2706666 in Casualty OP</div>
                                <div>அவசர உதவிக்கு அழைக்கவும் : 0427 - 2706666</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional pages if needed */}
                {page4Sections.length > 0 && (
                    <div className="preview-page" style={styles.page}>
                        <div style={styles.contentWrapper}>
                            <ContinuationHeader />

                            <div style={{ paddingBottom: '15mm', minHeight: '210mm' }}>
                                {page4Sections}
                            </div>

                            <div style={styles.signatures}>
                                <div style={styles.signatureBlock}>
                                    <div>Dr.Nandana</div>
                                    <div>DNB Resident</div>
                                </div>
                                <div style={styles.signatureBlock}>
                                    <div>{summaryData.doctor}</div>
                                    <div>Consultant</div>
                                </div>
                            </div>

                            <div style={styles.footer}>
                                <div>In case of Emergency to contact 0427 - 2706666 in Casualty OP</div>
                                <div>அவசர உதவிக்கு அழைக்கவும் : 0427 - 2706666</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page 4 - Signature Page */}
                <div className="preview-page" style={styles.page}>
                    <div style={styles.contentWrapper}>
                        <ContinuationHeader />

                        <div style={styles.explainedSection}>
                            <div style={styles.explainedColumn}>
                                <div style={styles.explainedTitle}>Explained By</div>
                                <div style={styles.explainedField}>
                                    <div>Doctor Name :</div>
                                </div>
                                <div style={styles.explainedField}>
                                    <div>Signature :</div>
                                </div>
                            </div>
                            <div style={styles.explainedColumn}>
                                <div style={styles.explainedTitle}>Explained To Patient / Attender</div>
                                <div style={styles.explainedField}>
                                    <div>Name :</div>
                                </div>
                                <div style={styles.explainedField}>
                                    <div>Signature :</div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.footer}>
                            <div>In case of Emergency to contact 0427 - 2706666 in Casualty OP</div>
                            <div>அவசர உதவிக்கு அழைக்கவும் : 0427 - 2706666</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!summaryData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Arial, sans-serif'
            }}>
                Loading...
            </div>
        );
    }

    return renderPreview();
};

export default SummaryPrint;
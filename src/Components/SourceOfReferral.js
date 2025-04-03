import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/CloudDownload"; // Import the download icon
import PrintIcon from "@mui/icons-material/Print"; // Import the print icon
import * as XLSX from "xlsx"; // Import the xlsx library

const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    color: '#FC3B93',
    marginBottom: '20px',
  },
  filterSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  dateInput: {
    padding: '8px',
    fontSize: '16px',
    marginRight: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  countsSection: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  countTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  countItem: {
    fontSize: '16px',
    color: '#555',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: '#4CAF50',
    color: 'white',
    textAlign: 'left',
    padding: '10px',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    padding: '10px',
  },
  tableRowHover: {
    backgroundColor: '#f1f1f1',
  },
  
};

const SourceOfReferral = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    mediaAdd: 0,
    friendsNeighbours: 0,
    doctorReferral: {},
    others: {},
  });

  // Get the current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [fromDate, setFromDate] = useState(getCurrentDate());
  const [toDate, setToDate] = useState(getCurrentDate());

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const fetchData = () => {
    let url = `http://127.0.0.1:8000/referrals/`;

    if (fromDate || toDate) {
      url += `?fromDate=${fromDate}&toDate=${toDate}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setRegistrations(data);
        countReferralSources(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const countReferralSources = (data) => {
    let mediaAdd = 0;
    let friendsNeighbours = 0;
    let doctorReferral = {};
    let others = {};

    data.forEach((reg) => {
      if (reg.source_of_referral) {
        try {
          // Check if the source_of_referral is a string, if so, parse it, otherwise use it as is
          const parsedSourceOfReferral =
            typeof reg.source_of_referral === 'string'
              ? JSON.parse(reg.source_of_referral)
              : reg.source_of_referral;

          if (parsedSourceOfReferral.ThroughMediaAdd === true) {
            mediaAdd += 1;
          }

          if (parsedSourceOfReferral.ThroughFriendsNeighbours === true) {
            friendsNeighbours += 1;
          }

          if (
            parsedSourceOfReferral.ThroughDoctorwithName &&
            parsedSourceOfReferral.ThroughDoctorwithName !== "null" &&
            parsedSourceOfReferral.ThroughDoctorwithName !== ""
          ) {
            const doctorName = parsedSourceOfReferral.ThroughDoctorwithName;
            doctorReferral[doctorName] = (doctorReferral[doctorName] || 0) + 1;
          }

          if (
            parsedSourceOfReferral.Others &&
            parsedSourceOfReferral.Others !== "null" &&
            parsedSourceOfReferral.Others !== ""
          ) {
            const otherName = parsedSourceOfReferral.Others;
            others[otherName] = (others[otherName] || 0) + 1;
          }
        } catch (error) {
          console.error("Error parsing source_of_referral:", error);
        }
      }
    });

    setCounts({ mediaAdd, friendsNeighbours, doctorReferral, others });
  };

  const renderSourceOfReferral = (sourceOfReferral) => {
    // Check if sourceOfReferral is already an object or a string
    if (!sourceOfReferral) {
      return <p>No referral source available</p>;
    }

    let parsedSourceOfReferral;

    // If sourceOfReferral is a string, parse it
    if (typeof sourceOfReferral === "string") {
      try {
        parsedSourceOfReferral = JSON.parse(sourceOfReferral);
        console.log("Parsed Source of Referral:", parsedSourceOfReferral); // Debugging line
      } catch (error) {
        console.error("Error parsing source_of_referral:", error);
        return <p>No referral source available</p>;
      }
    } else {
      // If it's already an object, use it directly
      parsedSourceOfReferral = sourceOfReferral;
    }

    const referralTexts = [];

    // Add conditions for referral data
    if (parsedSourceOfReferral.ThroughMediaAdd === true) {
      referralTexts.push("Through Media Add");
    }

    if (
      parsedSourceOfReferral.ThroughDoctorwithName &&
      parsedSourceOfReferral.ThroughDoctorwithName !== "" &&
      parsedSourceOfReferral.ThroughDoctorwithName !== "null"
    ) {
      referralTexts.push(`Referral: ${parsedSourceOfReferral.ThroughDoctorwithName}`);
    }

    if (parsedSourceOfReferral.ThroughFriendsNeighbours === true) {
      referralTexts.push("Through Friends/Neighbours");
    }

    if (
      parsedSourceOfReferral.Others &&
      parsedSourceOfReferral.Others !== "" &&
      parsedSourceOfReferral.Others !== "null"
    ) {
      referralTexts.push(`Others: ${parsedSourceOfReferral.Others}`);
    }

    // Return the referral sources if any, otherwise show a fallback message
    if (referralTexts.length > 0) {
      return referralTexts.join(", ");
    } else {
      return "No referral source available";
    }
  };


  const handleExportToExcel = () => {
    const dataToExport = registrations.map((reg, index) => ({
      "Sl.No": index + 1,
      "Registration Number": reg.registration_number,
      "Name of Child": reg.name_of_child,
      Age: reg.age
      ? `${reg.age.year || 0} years, ${reg.age.months || 0} months, ${reg.age.days || 0} days`
      : "N/A", // Format the age field
      Sex: reg.sex,
      "Reason for Visit": reg.reason_for_visit,
      "Source of Referral": renderSourceOfReferral(reg.source_of_referral),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SourceOfReferral");
    XLSX.writeFile(wb, "SourceOfReferral.xlsx");
  };

  // Handler to update the from date
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  // Handler to update the to date
  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handlePrint = (fromDate, toDate) => {
    // Convert to Date objects if they are strings
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    // Debugging to ensure values are correct
    console.log("fromDate:", fromDateObj);
    console.log("toDate:", toDateObj);

    const printData = registrations.map((reg, index) => ({
      "Sl.No": index + 1,
      "Date": reg.date,
      "Registration Number": reg.registration_number,
      "Name of Child": reg.name_of_child,
      Age: reg.age
      ? `${reg.age.year || 0} years, ${reg.age.months || 0} months, ${reg.age.days || 0} days`
      : "N/A", // Format the age field
      Sex: reg.sex,
      "Reason for Visit": reg.reason_for_visit,
      "Source of Referral": renderSourceOfReferral(reg.source_of_referral),
    }));

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Print</title>");

    // Add some styling for better UI
    printWindow.document.write(`
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          color: #333;
          margin: 0;
          padding: 0;
        }
        h2 {
          text-align: center;
          color: #2c3e50;
          margin-top: 20px;
        }
        .print-container {
          margin: 20px;
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .section-title {
          font-size: 18px;
          color: #34495e;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        p {
          font-size: 14px;
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border: 1px solid #ecf0f1;
        }
        th {
          background-color: #3498db;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f1f1f1;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #7f8c8d;
        }
      </style>
    `);

    printWindow.document.write("</head><body>");

    // Heading Section with "From" and "To" Dates
    printWindow.document.write("<h2>Referral Details</h2>");

    // Ensure the dates are displayed properly
    if (fromDate && toDate) {
      printWindow.document.write(`
        <p style="text-align: center; font-size: 16px; color: #34495e;">
          From: ${fromDateObj.toLocaleDateString()} 
          &nbsp;&nbsp;&nbsp; To: ${toDateObj.toLocaleDateString()}
        </p>
      `);
    }

    // Referral Counts Section
    printWindow.document.write("<div class='print-container'>");
    if (noReferrals) {
      printWindow.document.write("<p>No referrals available</p>");
    } else {
      printWindow.document.write(`<div class="section-title">Referral Counts</div>`);
      printWindow.document.write(`<p>Through Media Add: ${counts.mediaAdd}</p>`);
      printWindow.document.write(`<p>Through Friends/Neighbours: ${counts.friendsNeighbours}</p>`);

      if (Object.keys(counts.doctorReferral).length > 0) {
        printWindow.document.write("<div class='section-title'>Doctor Referrals:</div>");
        Object.entries(counts.doctorReferral).forEach(([doctor, count]) => {
          printWindow.document.write(`<p>${doctor}: ${count}</p>`);
        });
      }

      if (Object.keys(counts.others).length > 0) {
        printWindow.document.write("<div class='section-title'>Other Referrals:</div>");
        Object.entries(counts.others).forEach(([other, count]) => {
          printWindow.document.write(`<p>${other}: ${count}</p>`);
        });
      }
    }
    printWindow.document.write("</div>");

    // Table Section
    printWindow.document.write("<div class='print-container'>");
    printWindow.document.write("<table>");
    printWindow.document.write("<thead><tr><th>Sl.No</th><th>Date</th><th>Registration Number</th><th>Name of Child</th><th>Age</th><th>Sex</th><th>Reason for Visit</th><th>Source of Referral</th></tr></thead>");
    printWindow.document.write("<tbody>");

    printData.forEach((reg) => {
      const formattedDate = new Date(reg["Date"]);
      const day = String(formattedDate.getDate()).padStart(2, '0');
      const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
      const year = formattedDate.getFullYear();
      const formattedDateString = `${day}.${month}.${year}`;
    
      printWindow.document.write(`<tr>
        <td>${reg["Sl.No"]}</td>
        <td>${formattedDateString}</td> <!-- Display the formatted date -->
        <td>${reg["Registration Number"]}</td>
        <td>${reg["Name of Child"]}</td>
        <td>${reg["Age"]}</td>
        <td>${reg["Sex"]}</td>
        <td>${reg["Reason for Visit"]}</td>
        <td>${reg["Source of Referral"]}</td>
      </tr>`);
    });

    printWindow.document.write("</tbody></table>");
    printWindow.document.write("</div>");

    // Footer Section
    printWindow.document.write("<div class='footer'>Printed on " + new Date().toLocaleString() + "</div>");

    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Delay the print to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };






  const noReferrals =
    counts.mediaAdd === 0 &&
    counts.friendsNeighbours === 0 &&
    Object.keys(counts.doctorReferral).length === 0 &&
    Object.keys(counts.others).length === 0;

  return (
    <div style={styles.container}>
      <h2>Referral Details</h2>

      <div style={styles.filterSection}>
        <div>
          <label>From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <div>
          <label>To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      <div style={styles.countsSection}>
        {noReferrals ? (
          <p style={styles.countItem}>No referrals available</p>
        ) : (
          <>
            <p style={styles.countItem}>Through Media Add: {counts.mediaAdd}</p>
            <p style={styles.countItem}>
              Through Friends/Neighbours: {counts.friendsNeighbours}
            </p>
            {Object.keys(counts.doctorReferral).length > 0 && (
              <>
                <h4 style={styles.countTitle}>Doctor Referrals:</h4>
                {Object.entries(counts.doctorReferral).map(
                  ([doctor, count]) => (
                    <p key={doctor} style={styles.countItem}>
                      {doctor}: {count}
                    </p>
                  )
                )}
              </>
            )}
            {Object.keys(counts.others).length > 0 && (
              <>
                <h4 style={styles.countTitle}>Other Referrals:</h4>
                {Object.entries(counts.others).map(([other, count]) => (
                  <p key={other} style={styles.countItem}>
                    {other}: {count}
                  </p>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {registrations.length > 0 && (
        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <button
            onClick={handleExportToExcel}
            variant="contained"
            color="success"
            style={{
              backgroundColor: "#406147",
              color: "white",
              padding: "10px 20px",
              fontSize: "16px",
              marginRight: "10px",
            }}
          >
            <DownloadIcon style={{ marginRight: "5px" }} />
          </button>
          <button
            onClick={handlePrint}
            variant="contained"
            color="primary"
            style={{
              backgroundColor: "#406147",
              color: "white",
              padding: "10px 20px",
              fontSize: "16px",
            }}
          >
            <PrintIcon style={{ marginRight: "5px" }} />
          </button>
        </div>
      )}

      {registrations.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th>Sl.No</th>
              <th>Date</th>
              <th>Registration Number</th>
              <th>Name of Child</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Reason for Visit</th>
              <th>Source of Referral</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg, index) => (
              <tr
                key={reg.registration_number}
                style={styles.tableRow}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f1f1')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                <td style={styles.tableCell}>{index + 1}</td>
                <td style={styles.tableCell}>
                  {new Date(reg.date).toLocaleDateString('en-GB')}
                </td>
                <td style={styles.tableCell}>{reg.registration_number}</td>
                <td style={styles.tableCell}>{reg.name_of_child}</td>
                <td style={styles.tableCell}>{reg.age
                ? `${reg.age.year} years, ${reg.age.months} months, ${reg.age.days} days`
                : 'N/A'}</td>
                <td style={styles.tableCell}>{reg.sex}</td>
                <td style={styles.tableCell}>{reg.reason_for_visit}</td>
                <td style={styles.tableCell}>
                  {renderSourceOfReferral(reg.source_of_referral)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SourceOfReferral;
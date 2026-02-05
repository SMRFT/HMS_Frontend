import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";
import { toast } from "react-toastify";
import {
  Table as GlobalTable,
  Th,
  Td,
  Tr,
  TableWrapper as GlobalTableWrapper,
} from "../GlobalStyledComponents";

// Modern styled components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #b2dfdb 100%);
  padding: 2rem;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &::before {
    content: '📄';
    font-size: 2.5rem;
  }
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.938rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 137, 123, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: linear-gradient(135deg, #00796b 0%, #004d40 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 137, 123, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::before {
    content: '←';
    font-size: 1.25rem;
  }
`;

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: #00897b;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.938rem;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.938rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00897b;
    box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.938rem;
  color: #555;
  
  input {
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: #00897b;
  }
`;

const TableWrapper = styled(GlobalTableWrapper)`
  margin-top: 1.5rem;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #00897b;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #00695c;
  }
`;

const ModernTable = styled(GlobalTable)`
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  min-width: 1400px; /* Prevents table from shrinking too much */
`;

const TableHead = styled.thead`
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
  
  th {
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 1rem;
    font-size: 0.875rem;
    text-align: left;
    white-space: nowrap;
  }
`;

const TableRow = styled(Tr)`
  background: white;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
  
  &:hover {
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(0, 137, 123, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled(Td)`
  padding: 1rem;
  color: #555;
  font-size: 0.938rem;
  vertical-align: middle;
  white-space: nowrap;
`;

const ActionIcon = styled.span`
  cursor: pointer;
  margin: 0 0.5rem;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  display: inline-block;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const PrintIcon = styled(ActionIcon)`
  color: #00897b;
  
  &:hover {
    color: #00695c;
  }
`;

const EditIcon = styled(ActionIcon)`
  color: #ff9800;
  
  &:hover {
    color: #f57c00;
  }
`;

const DeleteIcon = styled(ActionIcon)`
  color: #ef5350;
  
  &:hover {
    color: #d32f2f;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  
  &::before {
    content: '📭';
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.125rem;
    font-weight: 500;
    color: #666;
  }
`;

const ItemsList = styled.div`
  max-width: 300px;
`;

const ItemRow = styled.div`
  padding: 0.25rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  
  .ant-picker-input input {
    padding: 0.75rem 1rem;
    font-size: 0.938rem;
  }
  
  &.ant-picker {
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    padding: 0;
    
    &:hover, &.ant-picker-focused {
      border-color: #00897b;
      box-shadow: 0 0 0 3px rgba(0, 137, 123, 0.1);
    }
  }
`;

const BillsReport = () => {
  const [estimateBills, setEstimateBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [filters, setFilters] = useState({
    billType: "",
    doctor: "",
    patientType: "ALL",
    uhid: "",
  });
  const [billTypes, setBillTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    const today = dayjs().format("YYYY-MM-DD");
    setFromDate(today);
    setToDate(today);
  }, []);

  useEffect(() => {
    const fetchEstimateBills = async () => {
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const result = await apiRequest(
          `${HMSURL}investBillingGet/?${queryParams.toString()}`,
          "GET"
        );

        if (result.success) {
          setEstimateBills(result.data);
        } else {
          console.error("Failed to fetch estimate bills:", result.error);
          toast.error(result.error || "Failed to fetch estimate bills");
        }
      } catch (error) {
        console.error("Error fetching estimate bills:", error);
        toast.error("An unexpected error occurred");
      }
    };

    fetchEstimateBills();
  }, [filters, HMSURL]);

  useEffect(() => {
    const fetchBillTypesAndDoctors = async () => {
      try {
        const billTypesResult = await apiRequest(`${HMSURL}bill-types/`, "GET");
        if (billTypesResult.success) {
          setBillTypes(billTypesResult.data.items || []);
        }

        const doctorsResult = await apiRequest(`${HMSURL}doctor_list/`, "GET");
        if (doctorsResult.success) {
          setDoctors(doctorsResult.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An unexpected error occurred");
      }
    };

    fetchBillTypesAndDoctors();
  }, [HMSURL]);

  useEffect(() => {
    const filtered = estimateBills.filter((bill) => {
      if (fromDate && toDate) {
        const billDate = new Date(bill.investBillDate);
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (billDate < startDate || billDate > endDate) {
          return false;
        }
      }

      if (filters.patientType === "IP" && !(bill.uhid && bill.ipNumber)) {
        return false;
      }
      if (filters.patientType === "OP" && !(bill.uhid && !bill.ipNumber)) {
        return false;
      }

      if (filters.billType && bill.billType !== filters.billType) {
        return false;
      }

      if (filters.doctor && bill.doctor !== filters.doctor) {
        return false;
      }

      if (filters.uhid && !bill.uhid.includes(filters.uhid)) {
        return false;
      }

      return true;
    });

    setFilteredBills(filtered);
  }, [estimateBills, filters, fromDate, toDate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date, dateType) => {
    if (dateType === "from") {
      setFromDate(date ? date.format("YYYY-MM-DD") : "");
    } else {
      setToDate(date ? date.format("YYYY-MM-DD") : "");
    }
  };

  const handlePrint = (bill) => {
    const printWindow = window.open("", "_blank", "height=600,width=800");

    const formatDateTime = (dateStr, timeStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
      return timeStr ? `${formattedDate} ${timeStr}` : formattedDate;
    };

    const formatPatientName = (salutation, firstName, middleName, lastName) => {
      return `${salutation || ""} ${firstName || ""} ${middleName ? middleName + " " : ""
        }${lastName || ""}`.trim();
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Print</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 10px; }
          .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
          .hospital-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
          .address { margin-bottom: 3px; }
          .bill-title { font-weight: bold; display: inline-block; margin-right: 10px; }
          .bill-subtitle { font-weight: bold; display: inline-block; margin-left: 10px; }
          .bill-details { display: flex; justify-content: space-between; margin-bottom: 15px; }
          .bill-details-left, .bill-details-right { width: 48%; }
          .bill-row { display: flex; margin-bottom: 5px; }
          .bill-label { font-weight: bold; width: 100px; }
          .bill-value { flex-grow: 1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; }
          th { background-color: #f2f2f2; }
          .text-right { text-align: right; }
          .signature { display: flex; justify-content: space-between; margin-top: 30px; }
          .total-section { margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total-label { font-weight: bold; }
          .net-amount { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">SHANMUGA HOSPITAL LIMITED</div>
          <div class="address">51/24.Saradha College Road, Salem - 636007</div>
          <div class="registration">CIN: U85110TZ20PLC033974</div>
        </div>
        
        <div>
          <span class="bill-title">"${bill.paymentMethod || "NIL"}"</span>
          <span class="bill-subtitle">${bill.billType || "NIL"}</span>
        </div>
        
        <div class="bill-details">
          <div class="bill-details-left">
            <div class="bill-row">
              <div class="bill-label">Bill Number</div>
              <div class="bill-value">: ${bill.investBillNo || ""}</div>
            </div>
            <div class="bill-row">
              <div class="bill-label">OP Number</div>
              <div class="bill-value">: ${bill.uhid || ""}</div>
            </div>
            <div class="bill-row">
              <div class="bill-label">Bill Date</div>
              <div class="bill-value">: ${formatDateTime(bill.investBillDate, bill.time)}</div>
            </div>
            <div class="bill-row">
              <div class="bill-label">Name</div>
              <div class="bill-value">: ${formatPatientName(
      bill.salutation,
      bill.firstName,
      bill.middleName,
      bill.lastName
    )}</div>
            </div>
            <div class="bill-row">
              <div class="bill-label">Doctor</div>
              <div class="bill-value">: ${bill.doctor || ""}</div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>SlNo</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Cost</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${Array.isArray(bill.item)
        ? bill.item
          .map(
            (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.itemName || ""}</td>
                  <td>${item.quantity || 1}</td>
                  <td>${parseFloat(item.price).toFixed(2)}</td>
                  <td>${(parseFloat(item.price) * parseInt(item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `
          )
          .join("")
        : '<tr><td colspan="5">No Items</td></tr>'
      }
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <div class="total-label">Total</div>
            <div class="total-value">${parseFloat(bill.total || 0).toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">Discount</div>
            <div class="total-value">${bill.discount || "0.00"}</div>
          </div>
          <div class="total-row net-amount">
            <div class="total-label">Net Amount</div>
            <div class="total-value">${bill.finalPrice || "0.00"}</div>
          </div>
        </div>
        
        <div class="signature">
          <div>${bill.uhid || ""}</div>
          <div>(Signature)</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleEdit = (bill) => {
    navigate("/InvestigationBilling", { state: { patientData: bill } });
  };

  const handleDelete = async (bill) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete bill: ${bill.investBillNo}?`
    );
    if (!confirmDelete) return;

    try {
      const result = await apiRequest(`${HMSURL}delete-bill/`, "DELETE", {
        billId: bill._id,
        billType: bill.billType,
      });

      if (result.success) {
        toast.success("Bill deleted and moved to Recycle Bin.");
        setEstimateBills((prev) => prev.filter((b) => b._id !== bill._id));
      } else {
        console.error("Delete failed:", result.error);
        toast.error(result.error || "Failed to delete bill");
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      toast.error("An error occurred while deleting the bill.");
    }
  };

  const formatPatientName = (salutation, firstName, middleName, lastName) => {
    return `${salutation} ${firstName} ${middleName ? middleName + " " : ""
      }${lastName}`;
  };

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>Bills Report</PageTitle>
        <BackButton onClick={() => navigate("/InvestigationBilling")}>
          Back to Billing
        </BackButton>
      </HeaderContainer>

      <ContentCard>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>From Date</FilterLabel>
            <StyledDatePicker
              value={fromDate ? dayjs(fromDate) : null}
              onChange={(date) => handleDateChange(date, "from")}
              format="YYYY-MM-DD"
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>To Date</FilterLabel>
            <StyledDatePicker
              value={toDate ? dayjs(toDate) : null}
              onChange={(date) => handleDateChange(date, "to")}
              format="YYYY-MM-DD"
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Bill Type</FilterLabel>
            <Select
              name="billType"
              value={filters.billType}
              onChange={handleFilterChange}
            >
              <option value="">Select Bill Type</option>
              {[...new Set(billTypes.map((bill) => bill.billType))].map(
                (billType, index) => (
                  <option key={index} value={billType}>
                    {billType}
                  </option>
                )
              )}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Doctor</FilterLabel>
            <Select
              name="doctor"
              value={filters.doctor}
              onChange={handleFilterChange}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={`${doctor.first_name} ${doctor.middle_name || ""} ${doctor.last_name
                    }`.trim()}
                >
                  {`${doctor.first_name} ${doctor.middle_name || ""} ${doctor.last_name
                    }`.trim()}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>UHID</FilterLabel>
            <Input
              type="text"
              name="uhid"
              value={filters.uhid}
              onChange={handleFilterChange}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Patient Type</FilterLabel>
            <RadioGroup>
              <RadioLabel>
                <input
                  type="radio"
                  name="patientType"
                  value="OP"
                  checked={filters.patientType === "OP"}
                  onChange={handleFilterChange}
                />
                OP
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  name="patientType"
                  value="IP"
                  checked={filters.patientType === "IP"}
                  onChange={handleFilterChange}
                />
                IP
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  name="patientType"
                  value="ALL"
                  checked={filters.patientType === "ALL"}
                  onChange={handleFilterChange}
                />
                ALL
              </RadioLabel>
            </RadioGroup>
          </FilterGroup>
        </FilterContainer>

        {filteredBills.length > 0 ? (
          <TableWrapper>
            <ModernTable>
              <TableHead>
                <tr>
                  <th>Sl.No</th>
                  <th>Bill Date</th>
                  <th>Time</th>
                  <th>Bill No</th>
                  <th>UHID No</th>
                  <th>IP No</th>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Room No</th>
                  <th>Bill Type</th>
                  <th>Items</th>
                  <th>Bill Amount</th>
                  <th>Payment Method</th>
                  <th>Doctor</th>
                  <th>Actions</th>
                </tr>
              </TableHead>
              <tbody>
                {filteredBills.map((bill, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{bill.investBillDate}</TableCell>
                    <TableCell>{bill.time}</TableCell>
                    <TableCell>{bill.investBillNo}</TableCell>
                    <TableCell>{bill.uhid}</TableCell>
                    <TableCell>{bill.ipNumber}</TableCell>
                    <TableCell>
                      {formatPatientName(
                        bill.salutation,
                        bill.firstName,
                        bill.middleName,
                        bill.lastName
                      )}
                    </TableCell>
                    <TableCell>{bill.age}</TableCell>
                    <TableCell>{bill.roomNo}</TableCell>
                    <TableCell>{bill.billType}</TableCell>
                    <TableCell>
                      <ItemsList>
                        {Array.isArray(bill.item)
                          ? bill.item.map((item, idx) => (
                            <ItemRow key={idx}>
                              {item.itemName} - ₹{item.price} (Qty: {item.quantity})
                            </ItemRow>
                          ))
                          : "No Items"}
                      </ItemsList>
                    </TableCell>
                    <TableCell>₹ {bill.finalPrice}</TableCell>
                    <TableCell>{bill.paymentMethod}</TableCell>
                    <TableCell>{bill.doctor}</TableCell>
                    <TableCell>
                      <PrintIcon
                        onClick={() => handlePrint(bill)}
                        title="Print"
                      >
                        🖨
                      </PrintIcon>
                      <EditIcon
                        onClick={() => handleEdit(bill)}
                        title="Edit"
                      >
                        ✏️
                      </EditIcon>
                      <DeleteIcon
                        onClick={() => handleDelete(bill)}
                        title="Delete"
                      >
                        🗑️
                      </DeleteIcon>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ModernTable>
          </TableWrapper>
        ) : (
          <EmptyState>
            <p>No matching records found</p>
          </EmptyState>
        )}
      </ContentCard>
    </PageContainer>
  );
};

export default BillsReport;
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Search, Calendar, Filter, Download, RefreshCw, X, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import {
    PageWrapper,
    Container,
    SectionHeader,
    Button,
    Input,
    Select,
    TableWrapper,
    Table,
    Th,
    Td,
    Tr,
    colors,
    ModalOverlay,
    ModalContainer,
    ModalHeader,
    ModalTitle,
    CloseButton,
    ModalBody,
    ControlsContainer,
    SearchContainer,
    ButtonContainer,
    FormRow,
    InputWrapper,
    Label
} from "../GlobalStyles";

// --- Local Styled Components ---

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${colors.textMain};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
  max-width: 800px;

  @media (max-width: 1024px) {
    max-width: 100%;
    justify-content: stretch;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatCard = styled.div`
  background: ${props => props.bgColor || colors.surface};
  padding: 16px 20px;
  border-radius: 10px;
  border: 1px solid ${props => props.borderColor || colors.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  flex: 1;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: ${props => props.iconBg || 'rgba(0,0,0,0.03)'};
    border-radius: 50%;
    transform: translate(30%, -30%);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    border-color: ${props => props.hoverBorder || colors.primary};

    &::before {
      transform: translate(25%, -25%) scale(1.1);
    }
  }

  @media (max-width: 1024px) {
    min-width: 120px;
  }

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatIconWrapper = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${props => props.bg || 'rgba(255,255,255,0.2)'};
  color: ${props => props.color || colors.textMain};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.color || colors.textMuted};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || colors.textMain};
  line-height: 1.2;
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: ${props => props.color || colors.textMuted};
  font-weight: 500;
  opacity: 0.8;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  ${props => {
        if (props.status === "Paid") {
            return `
        background: rgba(34, 197, 94, 0.1);
        color: #15803d;
        border: 1px solid rgba(34, 197, 94, 0.3);
        
        &:hover {
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
        }
      `;
        } else if (props.status === "Pending") {
            return `
        background: rgba(245, 158, 11, 0.1); 
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.3);
        
        &:hover {
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
        }
      `;
        } else {
            return `
        background: rgba(239, 68, 68, 0.1);
        color: #b91c1c;
        border: 1px solid rgba(239, 68, 68, 0.3);
        
        &:hover {
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
        }
      `;
        }
    }}
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.disabled
        ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`};
  color: ${props => props.disabled ? '#64748b' : 'white'};
  border: none;
  border-radius: 8px;
  font-size: 0.813rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.disabled ? 'none' : `0 2px 8px ${colors.primary}4D`};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : `0 4px 12px ${colors.primary}66`};
    background: ${props => props.disabled
        ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
        : `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

const LoadingState = styled.div`
  padding: 60px 40px;
  text-align: center;
  color: ${colors.textMuted};
  font-size: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${colors.border};
  border-top: 4px solid ${colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${colors.textMuted};
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.3;
    color: ${colors.textMuted};
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: ${colors.textMain};
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 0.938rem;
    color: ${colors.textMuted};
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const DateRangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;

  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const StyledTable = styled(Table)`
  th {
    background: ${colors.surface};
    color: ${colors.textMain};
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    border-bottom: 2px solid ${colors.border};
  }

  tbody tr {
    transition: all 0.2s ease;
    border-bottom: 1px solid ${colors.border};

    &:hover {
      background-color: ${colors.surface};
      transform: scale(1.001);
    }
  }
`;

const RegistrationBills = () => {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");

    // Date Filter States
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [status, setStatus] = useState("Pending");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [transactionId, setTransactionId] = useState("");

    // Statistics
    const [stats, setStats] = useState({
        totalBills: 0,
        totalAmount: 0,
        paidAmount: 0,
        paidCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
        todayPaidAmount: 0,
        unpaidCount: 0
    });

    const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

    useEffect(() => {
        fetchBills();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, fromDate, toDate, bills, statusFilter]);

    const fetchBills = async () => {
        try {
            const response = await axios.get(`${Hmsbaseurl}registration-bills/`);
            setBills(response.data);
            setFilteredBills(response.data);
            calculateStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bills:", error);
            setLoading(false);
        }
    };

    const calculateStats = (billsData) => {
        const totalBills = billsData.length;
        const totalAmount = billsData.reduce((sum, bill) => sum + parseFloat(bill.total_fees || 0), 0);

        const paidBills = billsData.filter(bill => bill.payment_status === "Paid");
        const paidAmount = paidBills.reduce((sum, bill) => sum + parseFloat(bill.total_fees || 0), 0);
        const paidCount = paidBills.length;

        const pendingBills = billsData.filter(bill => bill.payment_status === "Pending");
        const pendingAmount = pendingBills.reduce((sum, bill) => sum + parseFloat(bill.total_fees || 0), 0);
        const pendingCount = pendingBills.length;

        const unpaidCount = billsData.filter(bill => bill.payment_status === "Unpaid").length;

        // Calculate Today's Paid Amount
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const todayPaidAmount = billsData
            .filter(bill => {
                const paymentDate = bill.paid_date ? new Date(bill.paid_date) : new Date(bill.billed_date);
                return bill.payment_status === "Paid" && paymentDate >= startOfDay && paymentDate <= endOfDay;
            })
            .reduce((sum, bill) => sum + parseFloat(bill.total_fees || 0), 0);

        setStats({
            totalBills,
            totalAmount,
            paidAmount,
            paidCount,
            pendingAmount,
            pendingCount,
            todayPaidAmount,
            unpaidCount
        });
    };

    const applyFilters = () => {
        let filtered = [...bills];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(bill =>
                bill.bill_number?.toLowerCase().includes(term) ||
                bill.patient_name?.toLowerCase().includes(term) ||
                bill.patient_uhid?.toLowerCase().includes(term)
            );
        }

        // Status Filter
        if (statusFilter !== "All") {
            filtered = filtered.filter(bill => bill.payment_status === statusFilter);
        }

        // Date range filter
        if (fromDate || toDate) {
            filtered = filtered.filter(bill => {
                if (!bill.billed_date) return false;

                const billDate = new Date(bill.billed_date);
                const from = fromDate ? new Date(fromDate) : null;
                const to = toDate ? new Date(toDate) : null;

                if (from) from.setHours(0, 0, 0, 0);
                if (to) to.setHours(23, 59, 59, 999);

                if (from && to) {
                    return billDate >= from && billDate <= to;
                } else if (from) {
                    return billDate >= from;
                } else if (to) {
                    return billDate <= to;
                }
                return true;
            });
        }

        setFilteredBills(filtered);
        calculateStats(filtered);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setFromDate("");
        setToDate("");
        setStatusFilter("All");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) + " " + date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleExport = () => {
        const csvContent = [
            ['Bill No', 'Date', 'Patient Name', 'UHID', 'Amount', 'Mode', 'Transaction ID', 'Status'],
            ...filteredBills.map(bill => [
                bill.bill_number,
                formatDate(bill.billed_date),
                bill.patient_name || '-',
                bill.patient_uhid || '-',
                parseFloat(bill.total_fees || 0).toFixed(2),
                bill.payment_method || '-',
                bill.transaction_id || '-',
                bill.payment_status || 'Pending'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registration_bills_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const openUpdateModal = (bill) => {
        setSelectedBill(bill);
        setStatus(bill.payment_status || "Pending");
        setPaymentMethod(bill.payment_method || "");
        setTransactionId(bill.transaction_id || "");
        setIsModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedBill) return;

        try {
            const payload = {
                payment_status: status,
                payment_method: status === 'Paid' ? paymentMethod : null,
                transaction_id: transactionId
            };

            await axios.patch(`${Hmsbaseurl}update-bill-status/${selectedBill.bill_number}/`, payload);

            fetchBills();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error updating bill:", error);
            alert("Failed to update bill status");
        }
    };

    const getStatusIcon = (status) => {
        if (status === "Paid") return <CheckCircle size={14} />;
        if (status === "Pending") return <Clock size={14} />;
        return <AlertCircle size={14} />;
    };

    return (
        <PageWrapper>
            <Container>
                <div style={{ padding: '20px' }}>
                    {/* Header Row with Title and Stats */}
                    <HeaderRow>
                        <TitleSection>
                            <PageTitle>
                                <DollarSign size={32} color={colors.primary} />
                                Registration Bills
                            </PageTitle>
                        </TitleSection>

                        <StatsRow>
                            {/* Pending Bills Card */}
                            <StatCard
                                bgColor={colors.surface}
                                borderColor={colors.secondary}
                                hoverBorder={colors.secondary}
                                iconBg={`${colors.secondary}15`}
                            >
                                <StatContent>
                                    <StatHeader>
                                        <StatIconWrapper bg={`${colors.secondary}20`} color={colors.secondary}>
                                            <Clock size={18} />
                                        </StatIconWrapper>
                                        <StatLabel color={colors.textMuted}>Pending</StatLabel>
                                    </StatHeader>
                                    <StatValue color={colors.secondary}>
                                        {stats.pendingCount}
                                    </StatValue>
                                    <StatSubtext color={colors.textMuted}>
                                        ₹{stats.pendingAmount.toFixed(2)}
                                    </StatSubtext>
                                </StatContent>
                            </StatCard>

                            {/* Paid Bills Card */}
                            <StatCard
                                bgColor={colors.surface}
                                borderColor={colors.success}
                                hoverBorder={colors.success}
                                iconBg={`${colors.success}15`}
                            >
                                <StatContent>
                                    <StatHeader>
                                        <StatIconWrapper bg={`${colors.success}20`} color={colors.success}>
                                            <CheckCircle size={18} />
                                        </StatIconWrapper>
                                        <StatLabel color={colors.textMuted}>Paid</StatLabel>
                                    </StatHeader>
                                    <StatValue color={colors.success}>
                                        {stats.paidCount}
                                    </StatValue>
                                    <StatSubtext color={colors.textMuted}>
                                        ₹{stats.paidAmount.toFixed(2)}
                                    </StatSubtext>
                                </StatContent>
                            </StatCard>

                            {/* Total Bills Card */}
                            <StatCard
                                bgColor={colors.surface}
                                borderColor={colors.primary}
                                hoverBorder={colors.primary}
                                iconBg={`${colors.primary}15`}
                            >
                                <StatContent>
                                    <StatHeader>
                                        <StatIconWrapper bg={`${colors.primary}20`} color={colors.primary}>
                                            <TrendingUp size={18} />
                                        </StatIconWrapper>
                                        <StatLabel color={colors.textMuted}>Total</StatLabel>
                                    </StatHeader>
                                    <StatValue color={colors.primary}>
                                        {stats.totalBills}
                                    </StatValue>
                                    <StatSubtext color={colors.textMuted}>
                                        ₹{stats.totalAmount.toFixed(2)}
                                    </StatSubtext>
                                </StatContent>
                            </StatCard>

                            {/* Refresh Button */}
                            <Button onClick={fetchBills} style={{ height: 'fit-content', alignSelf: 'center' }}>
                                <RefreshCw size={16} />
                            </Button>
                        </StatsRow>
                    </HeaderRow>

                    {/* Filters Section */}
                    <ControlsContainer style={{ marginBottom: '20px' }}>
                        <SearchContainer>
                            <Input
                                placeholder="Search by Bill No, Name, UHID..."
                                value={searchTerm}
                                onChange={handleSearch}
                                style={{ width: '250px' }}
                            />
                        </SearchContainer>

                        <FilterRow>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ width: '150px' }}
                            >
                                <option value="All">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Unpaid">Unpaid</option>
                            </Select>

                            <DateRangeWrapper>
                                <Calendar size={18} color={colors.textMuted} />
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    style={{ width: '140px' }}
                                />
                                <span style={{ color: colors.textMuted, fontWeight: 600 }}>to</span>
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    style={{ width: '140px' }}
                                />
                            </DateRangeWrapper>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Button secondary onClick={handleClearFilters}>
                                    <Filter size={16} /> Clear
                                </Button>
                                <Button onClick={handleExport}>
                                    <Download size={16} /> Export
                                </Button>
                            </div>
                        </FilterRow>
                    </ControlsContainer>

                    {/* Table Section */}
                    {loading ? (
                        <LoadingState>
                            <Spinner />
                            <div>Loading bills data...</div>
                        </LoadingState>
                    ) : (
                        <TableWrapper>
                            <StyledTable>
                                <thead>
                                    <Tr>
                                        <Th>Bill No</Th>
                                        <Th>Date & Time</Th>
                                        <Th>Patient Name</Th>
                                        <Th>UHID</Th>
                                        <Th>Amount</Th>
                                        <Th>Mode</Th>
                                        <Th>Tran. ID</Th>
                                        <Th>Status</Th>
                                        <Th>Action</Th>
                                    </Tr>
                                </thead>
                                <tbody>
                                    {filteredBills.length > 0 ? (
                                        filteredBills.map((bill) => (
                                            <Tr key={bill.id || bill.bill_number}>
                                                <Td style={{ fontWeight: 600, color: colors.primary }}>{bill.bill_number}</Td>
                                                <Td style={{ color: colors.textMuted }}>{formatDate(bill.billed_date)}</Td>
                                                <Td style={{ fontWeight: 500, color: colors.textMain }}>{bill.patient_name || "-"}</Td>
                                                <Td style={{ color: colors.textMuted }}>{bill.patient_uhid || "-"}</Td>
                                                <Td style={{ fontWeight: 600, color: colors.textMain }}>₹{parseFloat(bill.total_fees || 0).toFixed(2)}</Td>
                                                <Td style={{ color: colors.textMuted }}>{bill.payment_method || "-"}</Td>
                                                <Td style={{ fontFamily: 'monospace', fontSize: '0.813rem', color: colors.textMuted }}>{bill.transaction_id || "-"}</Td>
                                                <Td>
                                                    <StatusBadge status={bill.payment_status || "Pending"}>
                                                        {getStatusIcon(bill.payment_status || "Pending")}
                                                        {bill.payment_status || "Pending"}
                                                    </StatusBadge>
                                                </Td>
                                                <Td>
                                                    <ActionButton
                                                        onClick={() => bill.payment_status !== "Paid" && openUpdateModal(bill)}
                                                        disabled={bill.payment_status === "Paid"}
                                                    >
                                                        {bill.payment_status === "Paid" ? "✓ Completed" : "Update"}
                                                    </ActionButton>
                                                </Td>
                                            </Tr>
                                        ))
                                    ) : (
                                        <Tr>
                                            <Td colSpan="9">
                                                <EmptyState>
                                                    <Search />
                                                    <h3>No Bills Found</h3>
                                                    <p>Try adjusting your search or filter criteria</p>
                                                </EmptyState>
                                            </Td>
                                        </Tr>
                                    )}
                                </tbody>
                            </StyledTable>
                        </TableWrapper>
                    )}
                </div>
            </Container>

            {/* Update Modal */}
            {isModalOpen && (
                <ModalOverlay onClick={() => setIsModalOpen(false)}>
                    <ModalContainer onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <ModalHeader>
                            <ModalTitle>Update Payment Status</ModalTitle>
                            <CloseButton onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <FormRow>
                                <InputWrapper>
                                    <Label>Payment Status</Label>
                                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </Select>
                                </InputWrapper>
                            </FormRow>

                            {status === "Paid" && (
                                <>
                                    <FormRow>
                                        <InputWrapper>
                                            <Label>Payment Mode</Label>
                                            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                                <option value="">Select Mode</option>
                                                <option value="Cash">Cash</option>
                                                <option value="Card">Card</option>
                                                <option value="UPI">UPI</option>
                                                <option value="Net Banking">Net Banking</option>
                                            </Select>
                                        </InputWrapper>
                                    </FormRow>

                                    {(paymentMethod === "Card" || paymentMethod === "UPI" || paymentMethod === "Net Banking") && (
                                        <FormRow>
                                            <InputWrapper>
                                                <Label>Transaction ID</Label>
                                                <Input
                                                    type="text"
                                                    value={transactionId}
                                                    onChange={(e) => setTransactionId(e.target.value)}
                                                    placeholder="Enter transaction reference"
                                                />
                                            </InputWrapper>
                                        </FormRow>
                                    )}
                                </>
                            )}

                            <ButtonContainer>
                                <Button secondary onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdate}>Save Changes</Button>
                            </ButtonContainer>
                        </ModalBody>
                    </ModalContainer>
                </ModalOverlay>
            )}
        </PageWrapper>
    );
};

export default RegistrationBills;

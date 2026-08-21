import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

// ---------- styled ----------
const fadeInOut = keyframes`
  0% { opacity: 0; transform: translateY(-8px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-8px); }
`;

const Container = styled.div`
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-weight: 600;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#219C9C" : "#666")};
  border-bottom: 3px solid ${(props) => (props.$active ? "#219C9C" : "transparent")};
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: #219C9C;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;

  @media (max-width: 480px) {
    padding: 14px;
    overflow-x: hidden;
    min-width: 0;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Field = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #256565;
  margin-bottom: 6px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #219C9C;
  }
`;

const Input = styled.textarea`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: #219C9C;
  }
`;

const StockInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #219C9C;
  }
`;

const AddButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #b673c9;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  white-space: nowrap;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: #219C9C;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  margin-top: 12px;

  &:hover {
    background: #256565;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;

  th, td {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
  }

  th {
    background: #f4f9f9;
    color: #256565;
  }

  @media (max-width: 480px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;

const RemoveLink = styled.span`
  color: #c0392b;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => (props.$status === "Raised" ? "#219C9C22" : "#eee")};
  color: ${(props) => (props.$status === "Raised" ? "#256565" : "#666")};
`;

const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${(props) => (props.$type === "error" ? "#c0392b" : "#219C9C")};
  color: #fff;
  padding: 12px 20px;
  border-radius: 6px;
  animation: ${fadeInOut} 4s ease forwards;
  z-index: 1000;
`;

// ---------- component ----------
const RaiseIndentPage = () => {
  const [activeTab, setActiveTab] = useState("raise");

  const [dealers, setDealers] = useState([]);
  const [selectedDealerId, setSelectedDealerId] = useState("");
  const [selectedDealerName, setSelectedDealerName] = useState("");
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [dealerItems, setDealerItems] = useState([]); // items added for this indent

  const [requirements, setRequirements] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [indentList, setIndentList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // fetch dealer dropdown on mount
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const res = await apiRequest(`${HmsBaseUrl}dealer_items/`, "GET");
        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (Array.isArray(res?.results)) {
          list = res.results;
        } else if (Array.isArray(res?.data?.results)) {
          list = res.data.results;
        } else if (res && typeof res === "object") {
          console.warn("dealer_items/ GET returned an unexpected shape:", res);
        }
        setDealers(list);
      } catch (err) {
        showToast("Failed to load dealers", "error");
      }
    };
    fetchDealers();
  }, []);

  // derive items for the selected dealer from the already-fetched dealer list
  // (dealer_items/ GET always returns all dealers with their items in one call,
  // there is no separate dealer-scoped endpoint that returns { items: [...] })
  useEffect(() => {
    if (!selectedDealerId) {
      setAvailableItems([]);
      return;
    }
    const dealer = dealers.find(
      (d) => String(d.dealer_id) === String(selectedDealerId)
    );
    setAvailableItems(dealer?.items || []);
  }, [selectedDealerId, dealers]);

  const fetchIndentList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await apiRequest(`${HmsBaseUrl}raise_indent/`, "GET");
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.results)) {
        list = res.results;
      } else if (Array.isArray(res?.data?.results)) {
        list = res.data.results;
      } else if (res && typeof res === "object") {
        console.warn("raise_indent/ GET returned an unexpected shape:", res);
      }
      setIndentList(list);
    } catch (err) {
      showToast("Failed to load indent list", "error");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "list") {
      fetchIndentList();
    }
  }, [activeTab, fetchIndentList]);

  const handleDealerChange = (e) => {
    const id = e.target.value;
    const dealer = dealers.find((d) => String(d.dealer_id) === String(id));
    setSelectedDealerId(id);
    setSelectedDealerName(dealer ? dealer.dealer_name : "");
    setSelectedItem("");
  };

  const handleAddItem = () => {
    if (!selectedItem) return;
    const alreadyAdded = dealerItems.some(
      (di) => di.dealer_id === Number(selectedDealerId) && di.item === selectedItem
    );
    if (alreadyAdded) {
      showToast("Item already added", "error");
      return;
    }
    setDealerItems((prev) => [
      ...prev,
      {
        dealer_id: Number(selectedDealerId),
        dealer_name: selectedDealerName,
        item: selectedItem,
      },
    ]);
    setSelectedItem("");
  };

  const handleRemoveItem = (index) => {
    setDealerItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedDealerId("");
    setSelectedDealerName("");
    setAvailableItems([]);
    setSelectedItem("");
    setDealerItems([]);
    setRequirements("");
    setStock("");
  };

  const handleSubmit = async () => {
    if (dealerItems.length === 0) {
      showToast("Add at least one dealer item", "error");
      return;
    }
    if (!requirements.trim() || !stock.trim()) {
      showToast("Requirements and stock are required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        dealer_items: dealerItems,
        requirements,
        stock,
        status: "Raised", // ✅ set from frontend, not the model
      };
      await apiRequest(`${HmsBaseUrl}raise_indent/`, "POST", payload);
      showToast("Indent raised successfully");
      resetForm();
      fetchIndentList();
    } catch (err) {
      showToast("Failed to raise indent", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      {toast && <Toast $type={toast.type}>{toast.message}</Toast>}

      <TabBar>
        <TabButton $active={activeTab === "raise"} onClick={() => setActiveTab("raise")}>
          Raise Indent
        </TabButton>
        <TabButton $active={activeTab === "list"} onClick={() => setActiveTab("list")}>
          Indent List
        </TabButton>
      </TabBar>

      {activeTab === "raise" && (
        <Card>
          <Row>
            <Field>
              <Label>Dealer</Label>
              <Select value={selectedDealerId} onChange={handleDealerChange}>
                <option value="">Select dealer</option>
                {dealers.map((d) => (
                  <option key={d.dealer_id} value={d.dealer_id}>
                    {d.dealer_name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field>
              <Label>Item</Label>
              <Select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                disabled={!selectedDealerId}
              >
                <option value="">Select item</option>
                {availableItems.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>

            <AddButton onClick={handleAddItem} disabled={!selectedItem}>
              + Add
            </AddButton>
          </Row>

          {dealerItems.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <th>Dealer</th>
                  <th>Item</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dealerItems.map((di, idx) => (
                  <tr key={`${di.dealer_id}-${di.item}`}>
                    <td>{di.dealer_name}</td>
                    <td>{di.item}</td>
                    <td>
                      <RemoveLink onClick={() => handleRemoveItem(idx)}>Remove</RemoveLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Row style={{ marginTop: 20 }}>
            <Field>
              <Label>Requirements</Label>
              <Input
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe requirements"
              />
            </Field>
            <Field>
              <Label>Stock</Label>
              <StockInput
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock details"
              />
            </Field>
          </Row>

          <SubmitButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Raising..." : "Raise Indent"}
          </SubmitButton>
        </Card>
      )}

      {activeTab === "list" && (
        <Card>
          {loadingList ? (
            <p>Loading...</p>
          ) : indentList.length === 0 ? (
            <p>No indents raised yet.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Indent No</th>
                  <th>Dealer Items</th>
                  <th>Requirements</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {indentList.map((indent) => (
                  <tr key={indent.indent_no}>
                    <td>{indent.indent_no}</td>
                    <td>
                      {(indent.dealer_items || [])
                        .map((di) => `${di.dealer_name}: ${di.item}`)
                        .join(", ")}
                    </td>
                    <td>{indent.requirements}</td>
                    <td>{indent.stock}</td>
                    <td>
                      <StatusBadge $status={indent.status}>{indent.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </Container>
  );
};

export default RaiseIndentPage;
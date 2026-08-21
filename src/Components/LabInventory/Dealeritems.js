import React, { useState, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  Title,
  Label,
  Input,
  FormRow, FieldGroup, FieldSpacer, ButtonGroup,
  DealerBlock,
  ItemRow,
  IconButton,
  SubmitButton,
  Toast,
  ListSection,
  TableWrapper,
  Table,
  Thead,
  Th,
  Tr,
  Td,
  DealerNameCell,
  ItemPill,
  EmptyRow,
  ActionTd,
  RowButton,
}  from "./Dealeritemsstyles";

const Hmsbaseurl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;
 
// backend may return items as a real array, or (legacy rows) as a JSON string
const parseItems = (items) => {
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
 
const DealerItems = () => {
  const [dealerName, setDealerName] = useState("");
  const [items, setItems] = useState([""]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
 
  const showToast = (message, error = false) => {
    setToast({ message, error });
    setTimeout(() => setToast(null), 4000);
  };
 
  const fetchDealers = async () => {
    try {
      const res = await apiRequest(`${Hmsbaseurl}dealer_items/`, "GET");
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
        // Unexpected shape — log it once so the real API contract is visible,
        // but never let a non-array reach state/render.
        console.warn("dealer_items/ GET returned an unexpected shape:", res);
      }
      setDealers(list);
    } catch (err) {
      showToast("Failed to load dealer items", true);
    }
  };
 
  useEffect(() => {
    fetchDealers();
  }, []);
 
  const handleItemChange = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };
 
  const addItemField = (index) => {
    const updated = [...items];
    updated.splice(index + 1, 0, "");
    setItems(updated);
  };
 
  const removeItemField = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };
 
  const addItemsToDealer = (dealer) => {
    setDealerName(dealer.dealer_name);
    setItems([""]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
  const resetForm = () => {
    setDealerName("");
    setItems([""]);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const trimmedDealer = dealerName.trim();
    const cleanedItems = items.map((it) => it.trim()).filter((it) => it !== "");
 
    if (!trimmedDealer) {
      showToast("Dealer name is required", true);
      return;
    }
    if (cleanedItems.length === 0) {
      showToast("Add at least one item", true);
      return;
    }
 
    setLoading(true);
    try {
      await apiRequest(`${Hmsbaseurl}dealer_items/`, "POST", {
        dealer_name: trimmedDealer,
        items: cleanedItems,
      });
      showToast("Dealer items saved successfully");
      resetForm();
      fetchDealers();
    } catch (err) {
      showToast(err?.error || "Failed to save dealer items", true);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <Container>
      <Title>Dealer Items</Title>
 
      {toast && <Toast $error={toast.error}>{toast.message}</Toast>}
 
      <form onSubmit={handleSubmit}>
        {items.map((item, index) => (
          <FormRow key={index}>
            {index === 0 ? (
              <FieldGroup>
                <Label>Dealer Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Freedom Diagnostics"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                />
              </FieldGroup>
            ) : (
              <FieldSpacer />
            )}
 
            <FieldGroup>
              {index === 0 && <Label>Items</Label>}
              <Input
                type="text"
                placeholder={`Item ${index + 1}`}
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
            </FieldGroup>
 
            <ButtonGroup>
              <IconButton
                type="button"
                onClick={() => addItemField(index)}
                title="Add item"
              >
                <FaPlus size={12} />
              </IconButton>
              <IconButton
                type="button"
                $remove
                onClick={() => removeItemField(index)}
                title="Remove item"
                disabled={items.length === 1}
              >
                <FaTimes size={12} />
              </IconButton>
            </ButtonGroup>
          </FormRow>
        ))}
 
        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Dealer Items"}
        </SubmitButton>
      </form>
 
      <ListSection>
        <Title as="h3">Existing Dealers</Title>
        <TableWrapper>
          <Table>
            <Thead>
              <Tr>
                <Th>Dealer Name</Th>
                <Th>Items</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <tbody>
              {dealers.length === 0 ? (
                <Tr>
                  <EmptyRow colSpan={3}>No dealer items found.</EmptyRow>
                </Tr>
              ) : (
                dealers.map((dealer) => {
                  const dealerItems = parseItems(dealer.items);
                  return (
                    <Tr key={dealer.dealer_id}>
                      <DealerNameCell>{dealer.dealer_name}</DealerNameCell>
                      <Td>
                        {dealerItems.length === 0
                          ? "—"
                          : dealerItems.map((it, i) => (
                              <ItemPill key={i}>{it}</ItemPill>
                            ))}
                      </Td>
                      <ActionTd>
                        <RowButton
                          type="button"
                          onClick={() => addItemsToDealer(dealer)}
                        >
                          + Add Items
                        </RowButton>
                      </ActionTd>
                    </Tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </ListSection>
    </Container>
  );
};
 
export default DealerItems;
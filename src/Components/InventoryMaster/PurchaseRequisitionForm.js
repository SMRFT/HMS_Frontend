import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const FullWidthLabel = styled.label`
  grid-column: 1 / -1;
`;

const ItemsSection = styled.div`
  margin-top: 24px;
`;

const ItemContainer = styled.div`
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
`;

const RemarksLabel = styled.label`
  display: block;
  margin-top: 12px;
`;

const RemoveButton = styled.button`
  margin-top: 12px;
`;

const AddButton = styled.button`
  margin-bottom: 24px;
`;

const SubmitButton = styled.button`
  padding: 10px 18px;
`;

const SuccessMessage = styled.div`
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #4caf50;
  border-radius: 4px;
`;

const FormSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const FullWidthFormSection = styled(FormSection)`
  grid-template-columns: 1fr;
`;

const MedicineItemsSection = styled.div`
  margin-top: 24px;
`;

const MedicineItemsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
`;

const RemarksInput = styled.label`
  display: block;
  margin-top: 12px;
`;

const RemoveItemButton = styled.button`
  margin-top: 12px;
`;

const AddMedicineButton = styled.button`
  margin-bottom: 24px;
`;

const SubmitRequisitionButton = styled.button`
  padding: 10px 18px;
`;

const initialItem = {
  medicineName: '',
  strength: '',
  quantity: '',
  unit: 'Tablet',
  remarks: '',
};

const PurchaseRequisitionForm = () => {
  const [form, setForm] = useState({
    requisitionNumber: '',
    requestedDate: '',
    department: '',
    requestedBy: '',
    purpose: '',
    items: [{ ...initialItem }],
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index] = {
      ...items[index],
      [field]: value,
    };
    setForm((prev) => ({
      ...prev,
      items,
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...initialItem }],
    }));
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    const items = form.items.filter((_, idx) => idx !== index);
    setForm((prev) => ({
      ...prev,
      items,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    console.log('Purchase Requisition Submitted', form);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h2>Purchase Requisition</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label>
            Requisition Number
            <input
              type="text"
              value={form.requisitionNumber}
              onChange={(e) => handleChange('requisitionNumber', e.target.value)}
              required
            />
          </label>
          <label>
            Requested Date
            <input
              type="date"
              value={form.requestedDate}
              onChange={(e) => handleChange('requestedDate', e.target.value)}
              required
            />
          </label>
          <label>
            Department
            <input
              type="text"
              value={form.department}
              onChange={(e) => handleChange('department', e.target.value)}
              required
            />
          </label>
          <label>
            Requested By
            <input
              type="text"
              value={form.requestedBy}
              onChange={(e) => handleChange('requestedBy', e.target.value)}
              required
            />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Purpose / Notes
            <textarea
              value={form.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              rows={3}
            />
          </label>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>Medicine Items</h3>
          {form.items.map((item, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ccc',
                padding: 16,
                borderRadius: 4,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                <label>
                  Medicine Name
                  <input
                    type="text"
                    value={item.medicineName}
                    onChange={(e) => handleItemChange(index, 'medicineName', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Strength
                  <input
                    type="text"
                    value={item.strength}
                    onChange={(e) => handleItemChange(index, 'strength', e.target.value)}
                  />
                </label>
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Unit
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                  >
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Bottle</option>
                    <option>Vial</option>
                    <option>Pack</option>
                  </select>
                </label>
              </div>
              <label style={{ display: 'block', marginTop: 12 }}>
                Remarks
                <input
                  type="text"
                  value={item.remarks}
                  onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{ marginTop: 12 }}
              >
                Remove Item
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem} style={{ marginBottom: 24 }}>
            Add Medicine Item
          </button>
        </div>

        <button type="submit" style={{ padding: '10px 18px' }}>
          Submit Requisition
        </button>
      </form>

      {submitted && (
        <div style={{ marginTop: 24, padding: 16, border: '1px solid #4caf50', borderRadius: 4 }}>
          <h3>Requisition Submitted</h3>
          <p>The purchase requisition has been captured successfully.</p>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequisitionForm;

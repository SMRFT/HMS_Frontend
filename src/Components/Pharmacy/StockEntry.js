import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const FormContainer = styled.div`
  margin-top: 60px;
  max-width: 1150px;
  padding: 20px;
  background: #d9e6e8; /* Custom background color */
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif; /* Custom font */
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #15616d;
  font-size: 24px;
`;

const Section = styled.div`
  margin-bottom: 30px; /* Space between sections */
  border-bottom: 1px solid #ccc; /* Divider */
  padding-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 15px;
  color: #15616d;
  font-size: 18px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columns */
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Single column for small screens */
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px; /* Smaller font size */
  font-family: 'Arial', sans-serif;
  transition: border-color 0.3s;

  &:focus {
    border-color: #15616d; /* Custom focus color */
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  text-align: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #15616d; /* Button color */
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #15616d, #1d7686); /* Gradient effect */
  }
`;

const StockEntry = () => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: '',
    supplier_name: '',
    phone_number: '',
    gst_number: '',
    address: '',
    medicine_name: '',
    hsn_code: '',
    batch_number: '',
    expiry_date: '',
    quantity: '',
    pack: '',
    free: '',
    purchase_rate: '',
    purchase_cost: '',
    mrp: '',
    discount: '',
    taxable_amount: '',
    cgst_rate: '',
    cgst_amount: '',
    sgst_rate: '',
    sgst_amount: '',
    total_amount: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://hms.shinovadatabase.in/create-stock/', formData);
      alert('Stock entry created successfully!');

      // Clear the form data
      setFormData({
        invoice_number: '',
        invoice_date: '',
        supplier_name: '',
        phone_number: '',
        gst_number: '',
        address: '',
        medicine_name: '',
        hsn_code: '',
        batch_number: '',
        expiry_date: '',
        quantity: '',
        pack: '',
        free: '',
        purchase_rate: '',
        purchase_cost: '',
        mrp: '',
        discount: '',
        taxable_amount: '',
        cgst_rate: '',
        cgst_amount: '',
        sgst_rate: '',
        sgst_amount: '',
        total_amount: '',
      });
    } catch (error) {
      console.error('Error creating stock entry:', error);
      alert('Failed to create stock entry.');
    }
  };

  return (
    <FormContainer>
      <Title>Pharmacy Stock Entry</Title>
      <form onSubmit={handleSubmit}>
        {/* Section 1 */}
        <Section>
          <SectionTitle>Invoice Details</SectionTitle>
          <FormGrid>
            <InputWrapper>
              <Label>Invoice Number</Label>
              <Input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                required
              />
            </InputWrapper>
            <InputWrapper>
              <Label>Invoice Date</Label>
              <Input
                type="date"
                name="invoice_date"
                value={formData.invoice_date}
                onChange={handleChange}
                required
              />
            </InputWrapper>
            <InputWrapper>
              <Label>Supplier Name</Label>
              <Input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                required
              />
            </InputWrapper>
            <InputWrapper>
              <Label>Phone Number</Label>
              <Input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </InputWrapper>
            <InputWrapper>
              <Label>GST Number</Label>
              <Input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                required
              />
            </InputWrapper>
            <InputWrapper>
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </FormGrid>
        </Section>

        {/* Section 2 */}
        <Section>
          <SectionTitle>Medicine Details</SectionTitle>
          <FormGrid>
            {Object.entries(formData)
              .filter(
                ([key]) =>
                  ![
                    'invoice_number',
                    'invoice_date',
                    'supplier_name',
                    'phone_number',
                    'gst_number',
                    'address',
                  ].includes(key)
              )
              .map(([key, value]) => (
                <InputWrapper key={key}>
                  <Label>{key.replace(/_/g, ' ').toUpperCase()}</Label>
                  <Input
                    type={key.includes('date') ? 'date' : 'text'}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    required={key !== 'free'}
                  />
                </InputWrapper>
              ))}
          </FormGrid>
        </Section>

        {/* Submit Button */}
        <ButtonContainer>
          <Button type="submit">Submit</Button>
        </ButtonContainer>
      </form>
    </FormContainer>
  );
};

export default StockEntry;

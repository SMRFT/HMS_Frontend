import styled from "styled-components";

export const Container = styled.div`
  max-width: 700px;
  margin: 30px auto;
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    margin: 15px;
    padding: 16px;
  }
`;

export const Title = styled.h2`
  color: #256565;
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #256565;
  margin-bottom: 6px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cfd8d8;
  border-radius: 6px;
  font-size: 14px;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: #219c9c;
  }
`;

export const DealerBlock = styled.div`
  margin-bottom: 20px;
`;



export const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    overflow-x: hidden;
  }
`;

export const IconButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #fff;
  background: ${(props) => (props.$remove ? "#c9576b" : "#219c9c")};

  &:hover {
    opacity: 0.85;
  }
`;

export const SubmitButton = styled.button`
  margin-top: 10px;
  padding: 10px 22px;
  background: #219c9c;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #256565;
  }

  &:disabled {
    background: #a9c9c9;
    cursor: not-allowed;
  }
`;

export const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 18px;
  border-radius: 6px;
  color: #fff;
  background: ${(props) => (props.$error ? "#c9576b" : "#219c9c")};
  z-index: 1000;
  animation: fadein 0.3s ease-in;
`;

export const ListSection = styled.div`
  margin-top: 30px;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid #e0e6e6;
  border-radius: 8px;

  @media (max-width: 480px) {
    overflow-x: auto;
    min-width: 0;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

export const Thead = styled.thead`
  background: #eaf6f6;
`;

export const Th = styled.th`
  text-align: left;
  padding: 10px 14px;
  color: #256565;
  font-weight: 600;
  white-space: nowrap;
`;

export const Tr = styled.tr`
  border-top: 1px solid #e0e6e6;

  &:hover {
    background: #f7fbfb;
  }
`;

export const Td = styled.td`
  padding: 10px 14px;
  color: #333;
  vertical-align: top;
`;

export const DealerNameCell = styled(Td)`
  font-weight: 600;
  color: #256565;
  white-space: nowrap;
`;

export const ItemPill = styled.span`
  display: inline-block;
  background: #eaf6f6;
  color: #256565;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 13px;
  margin: 3px 6px 3px 0;
`;

export const EmptyRow = styled.td`
  padding: 16px;
  text-align: center;
  color: #888;
`;

export const ActionTd = styled(Td)`
  text-align: right;
  white-space: nowrap;
`;

export const RowButton = styled.button`
  padding: 6px 12px;
  background: #219c9c;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #256565;
  }
`;

export const FormRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

export const FieldGroup = styled.div`
  flex: 1;
  min-width: 0;
`;

export const FieldSpacer = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 480px) {
    display: none;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-shrink: 0;
`;
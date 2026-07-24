import styled from "styled-components";

export const Wrapper = styled.div`
  padding: 24px;
  font-family: Arial, sans-serif;
`;

export const HeaderBox = styled.div`
  border: 1px solid #000;
  text-align: center;
  padding: 8px;
  margin-bottom: 0;
`;

export const HospitalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
`;

export const SubTitle = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
`;

export const Th = styled.th`
  border: 1px solid #000;
  background: #d9ead3;
  padding: 8px;
  font-size: 13px;
  text-align: ${(props) => (props.align ? props.align : "left")};
  white-space: nowrap;
`;

export const Td = styled.td`
  border: 1px solid #000;
  padding: 6px 8px;
  font-size: 13px;
  background: ${(props) =>
    props.highlight === "expiring"
      ? "#fff2cc"
      : props.highlight === "new"
      ? "#f4cccc"
      : "transparent"};
`;

export const ActionsBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 16px 0;
`;

export const PrimaryButton = styled.button`
  background: #38761d;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #274e13;
  }
`;

export const SecondaryButton = styled.button`
  background: #999;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #666;
  }
`;

/* --- Modal / Form --- */

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalBox = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 480px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: relative;
`;

export const ModalTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: #666;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #000;
  }
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 16px;

  & > * {
    flex: 1;
    min-width: 0;
  }
`;

export const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  position: relative;
`;

export const Label = styled.label`
  font-size: 13px;
  margin-bottom: 4px;
  color: #333;
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #38761d;
  }
`;

export const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #38761d;
  }
`;

export const ErrorText = styled.span`
  color: #c00;
  font-size: 12px;
  margin-top: 4px;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
`;

/* --- Custom autocomplete dropdown (replaces native <datalist>) --- */

export const AutocompleteWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const SuggestionsList = styled.ul`
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
`;

export const SuggestionItem = styled.li`
  padding: 8px 10px;
  font-size: 13px;
  color: #222;
  cursor: pointer;
  background: ${(props) => (props.active ? "#d9ead3" : "transparent")};

  &:hover {
    background: #edf7e8;
  }
`;


/* --- Tabs (replaces modal trigger) --- */

export const TabBar = styled.div`
  display: flex;
  gap: 12px;
  margin: 16px 0;
`;

export const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #219C9C;
  background: ${(props) => (props.$active ? "#219C9C" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#219C9C")};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#256565" : "#e6f5f5")};
  }
`;

export const FormCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
`;
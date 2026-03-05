import styled, { keyframes } from "styled-components";

// Animations
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Theme Colors
export const colors = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  secondary: "#f59e0b",
  background: "#f8fafc",
  surface: "#ffffff",
  textMain: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  danger: "#ef4444",
  success: "#22c55e",
  tabBg: "#e0f2f1",
};

// Layout Components
export const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${colors.background};
  padding: 20px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
`;

export const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.4s ease-out;
`;

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${colors.border};
  background: ${colors.background};
`;

export const Tab = styled.div`
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: ${(props) => (props.active ? "600" : "500")};
  color: ${(props) => (props.active ? colors.primary : colors.textMuted)};
  background: ${(props) => (props.active ? colors.tabBg : "transparent")};
  border-bottom: 3px solid
    ${(props) => (props.active ? colors.primary : "transparent")};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  top: 2px;

  &:hover {
    color: ${colors.primary};
    background: ${colors.tabBg};
  }
`;

export const FormContent = styled.div`
  padding: 30px;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

// Form Elements
export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${colors.textMain};
  margin-bottom: 6px;
  display: flex;
  align-items: center;

  ${(props) =>
    props.required &&
    `
    &::after {
      content: "*";
      color: ${colors.danger};
      margin-left: 4px;
    }
  `}
`;

export const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: ${colors.surface};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  padding: 10px 14px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background-color: ${colors.surface};
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`;

export const TextArea = styled.textarea`
  padding: 10px 14px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`;

export const Button = styled.button`
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
  border: none;
  color: white;

  ${(props) =>
    props.secondary
      ? `
    background: ${colors.textMuted};
    &:hover { background: #475569; }
  `
      : props.danger
        ? `
    background: ${colors.danger};
    &:hover { background: #dc2626; }
  `
        : props.success
          ? `
    background: ${colors.success};
    &:hover { background: #16a34a; }
  `
          : `
    background: ${colors.primary};
    &:hover { background: ${colors.primaryDark}; }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Section Header
export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${colors.border};

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: ${colors.primary};
    font-weight: 600;
  }
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${colors.border};

  h3 {
    margin: 0;
    font-size: 1.1rem;
    color: ${colors.primary};
    font-weight: 600;
  }
`;

// Controls & Search Containers
export const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Table Components
export const TableWrapper = styled.div`
  margin-top: 20px;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid ${colors.border};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  background: ${colors.tabBg};
  padding: 12px;
  text-align: left;
  color: ${colors.textMain};
  border-bottom: 2px solid ${colors.border};
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
`;

export const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${colors.border};
  color: ${colors.textMain};
  font-size: 0.9rem;
`;

export const Tr = styled.tr`
  transition: background-color 0.2s;

  &:hover {
    background-color: #f1f5f9;
  }
`;

// Search Button (Small)
export const SearchButton = styled.button`
  display: inline-block;
  width: 24px;
  height: 24px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 50%; /* Make it perfectly circular */
  text-align: center;
  line-height: 24px; /* Center icon vertically */
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  margin-left: 8px; /* Add spacing from input */
  transition: all 0.2s;

  /* Flexbox centering for strict alignment */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Absolute positioning within InputWrapper */
  position: absolute;
  right: 12px; /* Position inside the right edge of input */
  top: 50%;
  transform: translateY(20%); /* Center vertically */
  z-index: 2; /* Ensure it stays above input */

  &:hover {
    background: ${colors.primaryDark};
    transform: translateY(20%) scale(1.1); /* Keep vertical centering on hover */
  }
`;

// Modal Components
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

export const ModalContainer = styled.div`
  background: ${colors.surface};
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 2px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${colors.tabBg};
`;

export const ModalTitle = styled.h2`
  margin: 0;
  color: ${colors.textMain};
  font-size: 1.3rem;
  font-weight: 600;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${colors.textMuted};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${colors.border};
    color: ${colors.textMain};
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

export const SearchRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }
`;

export const NoResults = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.textMuted};
  font-size: 1rem;
`;

// Additional Form Components
export const CollapsibleSection = styled.div`
  margin-bottom: 16px;
  border: 1px solid ${colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

export const SectionContent = styled.div`
  padding: 16px;
  background: white;
  display: ${(props) => (props.visible ? "block" : "none")};
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 12px 0;
`;

export const Checkbox = styled.input`
  margin-right: 8px;
  cursor: pointer;
`;

export const FileInput = styled.input`
  padding: 6px 0;
  font-size: 0.85rem;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${colors.border};
`;

export const InfoIcon = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${colors.primary};
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 16px;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: help;
  margin-left: 6px;
`;

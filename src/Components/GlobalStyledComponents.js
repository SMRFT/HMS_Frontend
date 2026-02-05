import styled from "styled-components";
import {
  PageWrapper as GPageWrapper,
  Table as GTable,
  Th as GTh,
  Td as GTd,
  Tr as GTr,
  TableWrapper as GTableWrapper,
  Button as GButton,
  Input as GInput,
  Label as GLabel,
  InputWrapper as GInputWrapper,
  colors
} from "./GlobalStyles";

// Re-export existing
export const PageWrapper = GPageWrapper;
export const Table = GTable;
export const Th = GTh;
export const Td = GTd;
export const Tr = GTr;
export const TableWrapper = GTableWrapper;
export const Input = GInput;
export const Label = GLabel;
export const InputWrapper = GInputWrapper;

// Define aliases and missing components matching usage in DoctorList/Schedule
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${colors.border};
`;

export const Title = styled.h2`
  color: ${colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

export const Section = styled.div`
  margin-bottom: 2rem;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

export const PrimaryButton = styled(GButton)`
  /* Inherits primary style from GButton by default or we enforce it */
  background: ${colors.primary};
  color: white;
  &:hover {
    background: ${colors.primaryDark};
  }
`;

export const SecondaryButton = styled(GButton)`
  background: white;
  color: ${colors.textMain};
  border: 1px solid ${colors.border};
  &:hover {
    background: ${colors.background};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export const LoadingIndicator = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${colors.textMuted};
`;

export const CheckboxGroup = styled.div`
  margin-top: 10px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: ${colors.textMain};
  cursor: pointer;
  user-select: none;
`;
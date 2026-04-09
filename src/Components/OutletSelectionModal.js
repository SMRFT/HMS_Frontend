import React from 'react';
import styled, { keyframes } from 'styled-components';
import { MapPin, Check, ArrowRight } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(8px); }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.4s ease-out;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  width: 100%;
  max-width: 600px;
  border-radius: 28px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  padding: 40px;
  animation: ${slideUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #0d9488, #0f766e);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 35px;
`;

const Title = styled.h2`
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1.05rem;
  line-height: 1.5;
`;

const OutletGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-height: 450px;
  overflow-y: auto;
  padding: 4px;

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
`;

const OutletCard = styled.div`
  background: white;
  border: 2px solid ${props => props.$selected ? '#0d9488' : '#f1f5f9'};
  border-radius: 20px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    border-color: ${props => props.$selected ? '#0d9488' : '#cbd5e1'};
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
    background: #fbfdfd;
  }

  ${props => props.$selected && `
    background: rgba(13, 148, 136, 0.03);
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.08);
  `}
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${props => props.$selected ? '#0d9488' : '#f8fafc'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$selected ? 'white' : '#64748b'};
  transition: all 0.3s ease;
`;

const Info = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.$selected ? '#0d9488' : '#334155'};
  margin-bottom: 4px;
`;

const Code = styled.div`
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.05em;
`;

const SelectionIndicator = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${props => props.$selected ? '#0d9488' : 'transparent'};
  border: 2px solid ${props => props.$selected ? '#0d9488' : '#e2e8f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
`;

const OutletSelectionModal = ({ outlets, onSelect, currentOutletCode }) => {
  if (!outlets || outlets.length === 0) return null;

  return (
    <Overlay>
      <ModalContainer>
        <Header>
          <Title>Select Your Outlet</Title>
          <Subtitle>Welcome back! Please select the facility you'll be working in today.</Subtitle>
        </Header>

        <OutletGrid>
          {outlets.map((outlet) => {
            const isSelected = currentOutletCode === outlet.outlet_code;
            return (
              <OutletCard 
                key={outlet.outlet_code} 
                $selected={isSelected}
                onClick={() => onSelect(outlet)}
              >
                <IconWrapper $selected={isSelected}>
                  <MapPin size={24} />
                </IconWrapper>
                <Info>
                  <Name $selected={isSelected}>{outlet.outlet_name}</Name>
                  <Code>{outlet.outlet_code}</Code>
                </Info>
                <SelectionIndicator $selected={isSelected}>
                  {isSelected ? <Check size={16} strokeWidth={3} /> : <ArrowRight size={16} color="#94a3b8" />}
                </SelectionIndicator>
              </OutletCard>
            );
          })}
        </OutletGrid>
      </ModalContainer>
    </Overlay>
  );
};

export default OutletSelectionModal;

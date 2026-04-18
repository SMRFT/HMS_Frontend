import React from 'react';
import styled, { keyframes } from 'styled-components';
import { MapPin, Check, ArrowRight, X } from 'lucide-react';

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
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 24px;
`;

const ModalContainer = styled.div`
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  width: 100%;
  max-width: 520px;
  border-radius: 32px;
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  padding: 48px 40px;
  animation: ${slideUp} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  /* Subtle top glowing accent */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.5), transparent);
  }

  @media (max-width: 640px) {
    padding: 40px 24px;
    border-radius: 28px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #f8fafc;
    color: #ef4444;
    border-color: #ef4444;
    transform: rotate(90deg) scale(1.05);
  }

  @media (max-width: 640px) {
    top: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  letter-spacing: -0.03em;

  @media (max-width: 640px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 400;
  line-height: 1.5;
  max-width: 85%;
  margin: 0 auto;

  @media (max-width: 640px) {
    font-size: 1rem;
    max-width: 100%;
  }
`;

const OutletGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  max-height: 50vh;
  overflow-y: auto;
  padding: 4px;
  margin: 0 -4px;

  /* Premium Scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
  }
`;

const OutletCard = styled.div`
  background: ${props => props.$selected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)'};
  border: 1px solid ${props => props.$selected ? 'rgba(13, 148, 136, 0.3)' : 'rgba(226, 232, 240, 0.8)'};
  border-radius: 24px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 1);
    border-color: ${props => props.$selected ? 'rgba(13, 148, 136, 0.4)' : 'rgba(203, 213, 225, 1)'};
    transform: translateY(-2px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.06);
  }

  ${props => props.$selected && `
    box-shadow: 0 8px 20px -6px rgba(13, 148, 136, 0.15);
  `}

  @media (max-width: 640px) {
    padding: 14px 16px;
    border-radius: 20px;
  }
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: ${props => props.$selected ? 'linear-gradient(135deg, #0d9488, #0f766e)' : '#f1f5f9'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$selected ? 'white' : '#64748b'};
  transition: all 0.3s ease;
  flex-shrink: 0;

  ${props => props.$selected && `
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
  `}
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.div`
  font-size: 1.15rem;
  font-weight: 600;
  color: ${props => props.$selected ? '#0f172a' : '#334155'};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    font-size: 1.05rem;
  }
`;

const Code = styled.div`
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
  letter-spacing: 0.02em;
`;

const SelectionIndicator = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$selected ? '#0d9488' : 'transparent'};
  border: 1.5px solid ${props => props.$selected ? '#0d9488' : '#cbd5e1'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: ${props => props.$selected ? '#0d9488' : '#94a3b8'};
  }
`;

const OutletSelectionModal = ({ outlets, onSelect, onClose, currentOutletCode }) => {
  if (!outlets || outlets.length === 0) return null;

  return (
    <Overlay>
      <ModalContainer>
        {onClose && (
          <CloseButton onClick={onClose} aria-label="Close">
            <X size={20} />
          </CloseButton>
        )}

        <Header>
          <Title>Select Facility</Title>
          <Subtitle>Choose your active workspace for this session.</Subtitle>
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
                  <MapPin size={22} strokeWidth={isSelected ? 2.5 : 2} />
                </IconWrapper>
                <Info>
                  <Name $selected={isSelected}>{outlet.outlet_name}</Name>
                  <Code>{outlet.outlet_code}</Code>
                </Info>
                <SelectionIndicator $selected={isSelected}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
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

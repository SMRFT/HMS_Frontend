import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, X, Search } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(4px); }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 20px;
`;

const ModalCard = styled.div`
  background: #ffffff;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
  padding: 24px 28px;
  animation: ${slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

const HeaderArea = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 400;
  margin: 0;
`;

const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px 10px 38px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.85rem;
  color: #0f172a;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0d9488;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OutletList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 2px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
`;

const OutletCard = styled.div`
  background: ${props => props.$selected ? '#ffffff' : '#ffffff'};
  border: ${props => props.$selected ? '2px solid #0d9488' : '1px solid #e2e8f0'};
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #0d9488;
    background: #f0fdf4;
  }
`;

const LeftDotIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .inner-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$selected ? '#0d9488' : '#94a3b8'};
  }
`;

const InfoBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const OutletName = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OutletSubtext = styled.div`
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
`;

const RadioCheckIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$selected ? '#0d9488' : 'transparent'};
  border: ${props => props.$selected ? 'none' : '2px solid #cbd5e1'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

// Default Facilities List (from screenshot design)
const DEFAULT_FACILITIES = [
  { outlet_code: "OLETO01", outlet_name: "IP PHARMACY" },
  { outlet_code: "OLETO02", outlet_name: "OP PHARMACY" },
  { outlet_code: "OLETO03", outlet_name: "MAIN BLOCK" },
  { outlet_code: "OLETO04", outlet_name: "B BLOCK" },
  { outlet_code: "OLETO05", outlet_name: "VELAVAN" }
];

const OutletSelectionModal = ({ outlets, onSelect, onClose, currentOutletCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const facilityList = (outlets && outlets.length > 0) ? outlets.map((o, idx) => ({
    outlet_code: o.outlet_code || o.code || `OLETO0${idx + 1}`,
    outlet_name: o.outlet_name || o.name || "Facility",
    note: o.note || o.description || o.address || (DEFAULT_FACILITIES[idx]?.note || "Active facility")
  })) : DEFAULT_FACILITIES;

  const activeCode = currentOutletCode || localStorage.getItem("outlet_code") || "OLETO01";

  const filteredFacilities = facilityList.filter(f =>
    f.outlet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.outlet_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.note && f.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <CloseButton onClick={onClose} aria-label="Close">
            <X size={16} />
          </CloseButton>
        )}

        <HeaderArea style={{ marginBottom: "16px" }}>
          <Title>Switch outlet</Title>
        </HeaderArea>

        <SearchWrapper>
          <SearchIconWrapper>
            <Search size={16} />
          </SearchIconWrapper>
          <SearchInput
            ref={inputRef}
            placeholder="Search by name or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchWrapper>

        <OutletList>
          {filteredFacilities.map((facility) => {
            const isSelected = activeCode === facility.outlet_code ||
              (localStorage.getItem("selected_outlet_name") || "").toLowerCase() === facility.outlet_name.toLowerCase();

            return (
              <OutletCard
                key={facility.outlet_code}
                $selected={isSelected}
                onClick={() => onSelect && onSelect(facility)}
              >
                <LeftDotIcon $selected={isSelected}>
                  <div className="inner-dot" />
                </LeftDotIcon>

                <InfoBlock>
                  <OutletName>{facility.outlet_name}</OutletName>
                  <OutletSubtext>
                    {facility.outlet_code} · {facility.note}
                  </OutletSubtext>
                </InfoBlock>

                <RadioCheckIcon $selected={isSelected}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </RadioCheckIcon>
              </OutletCard>
            );
          })}
        </OutletList>
      </ModalCard>
    </Overlay>
  );
};

export default OutletSelectionModal;
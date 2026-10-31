import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { Printer, X, FileText, Minimize2, Check } from "lucide-react";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalBox = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  width: 95vw;
  max-width: 960px;
  height: 92vh;
  overflow: hidden;
  animation: scaleUp 0.2s ease-out;

  @keyframes scaleUp {
    from { transform: scale(0.97); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, #136A63 0%, #0B4C47 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SizeButtonGroup = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
`;

const SizeButton = styled.button`
  background: ${(p) => (p.$active ? "#ffffff" : "transparent")};
  color: ${(p) => (p.$active ? "#0B4C47" : "#e2e8f0")};
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${(p) => (p.$active ? "#ffffff" : "rgba(255, 255, 255, 0.25)")};
    color: ${(p) => (p.$active ? "#0B4C47" : "#ffffff")};
  }
`;

const PrintActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F88C22;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(248, 140, 34, 0.35);
  transition: all 0.15s;

  &:hover {
    background: #E67D1E;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(248, 140, 34, 0.45);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #ffffff;
  border-radius: 6px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const IframeContainer = styled.div`
  flex: 1;
  background: #e2e8f0;
  padding: 16px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const StyledIframe = styled.iframe`
  background: #ffffff;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  width: ${(p) => (p.$size === "thermal" ? "82mm" : p.$size === "a4-landscape" ? "297mm" : "210mm")};
  max-width: 100%;
  min-height: 100%;
  height: 100%;
`;

const OTPrintModal = ({ title, htmlGenerator, data, onClose }) => {
  const [size, setSize] = useState("a4");
  const iframeRef = useRef(null);

  const html = htmlGenerator ? htmlGenerator({ ...data, size }) : "";

  useEffect(() => {
    if (iframeRef.current && html) {
      iframeRef.current.srcdoc = html;
    }
  }, [html, size]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <TitleArea>
            <FileText size={20} color="#F88C22" />
            <ModalTitle>{title || "Print Preview"}</ModalTitle>
          </TitleArea>
          <ControlsArea>
            <SizeButtonGroup>
              <SizeButton
                $active={size === "a4"}
                onClick={() => setSize("a4")}
                title="A4 Portrait"
              >
                A4
              </SizeButton>
              <SizeButton
                $active={size === "a4-landscape"}
                onClick={() => setSize("a4-landscape")}
                title="A4 Landscape"
              >
                A4 Wide
              </SizeButton>
              <SizeButton
                $active={size === "thermal"}
                onClick={() => setSize("thermal")}
                title="Thermal (80mm)"
              >
                Receipt
              </SizeButton>
            </SizeButtonGroup>

            <PrintActionBtn onClick={handlePrint}>
              <Printer size={16} /> Print Document
            </PrintActionBtn>

            <CloseButton onClick={onClose} title="Close (Esc)">
              <X size={18} />
            </CloseButton>
          </ControlsArea>
        </ModalHeader>

        <IframeContainer>
          <StyledIframe
            ref={iframeRef}
            $size={size}
            title="Print Preview Window"
          />
        </IframeContainer>
      </ModalBox>
    </Overlay>
  );
};

export default OTPrintModal;

import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import styled from "styled-components";
import apiRequest from "../../Auth/apiRequest";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Box = styled.div`
  background: white;
  border-radius: 12px;
  width: 92%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconWrap = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: auto;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Body = styled.div`
  padding: 22px 20px;
  text-align: center;
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #1e293b;
  line-height: 1.5;
`;

const CountBadge = styled.span`
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  font-weight: 800;
  font-size: 1.6rem;
  padding: 4px 16px;
  border-radius: 8px;
  margin: 10px 0;
`;

const Footer = styled.div`
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
`;

const AckBtn = styled.button`
  background: #d97706;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 9px 28px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  &:hover {
    background: #b45309;
  }
`;

const PendingImplantRequestNotifier = () => {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  const allowedActions = JSON.parse(
    localStorage.getItem("allowedActions") || "[]",
  );
  const canView = allowedActions.includes("HMS-P-OTIRV-R");

  useEffect(() => {
    if (!canView) return;

    const checkPending = async () => {
      try {
        const res = await apiRequest(
          `${HMSURL}implant/requests/pending-count/`,
          "GET",
        );
        if (res.success && res.data?.success && res.data.count > 0) {
          setCount(res.data.count);
          setShow(true);
        }
      } catch {
        // silent — notification is best-effort, shouldn't break the page
      }
    };

    checkPending();
  }, [canView, HMSURL]);

  if (!canView || !show) return null;

  return (
    <Overlay>
      <Box>
        <Header>
          <IconWrap>
            <AlertCircle size={18} />
          </IconWrap>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            Pending Implant Request
          </span>
          <CloseBtn onClick={() => setShow(false)}>
            <X size={18} />
          </CloseBtn>
        </Header>
        <Body>
          <CountBadge>{count}</CountBadge>
          <Message>
            You have{" "}
            <strong>
              {count} pending implant request{count !== 1 ? "s" : ""}
            </strong>{" "}
            awaiting review.
          </Message>
        </Body>
        <Footer>
          <AckBtn onClick={() => setShow(false)}>OK, Got it</AckBtn>
        </Footer>
      </Box>
    </Overlay>
  );
};

export default PendingImplantRequestNotifier;

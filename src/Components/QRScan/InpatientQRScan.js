import React from "react";
import styled from "styled-components";

const PageContainer = styled.div`
    min-height: 100vh;
    background-color: #f0f4f1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const QRCard = styled.div`
    background: #ffffff;
    border-radius: 20px;
    padding: 40px 32px;
    max-width: 380px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    text-align: center;
    border-top: 8px solid #1e6038;
`;

const Title = styled.h2`
    color: #1e6038;
    margin: 0 0 6px 0;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 0.5px;
`;

const Subtitle = styled.h3`
    color: #2d3748;
    margin: 0 0 20px 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
`;

const ScanTag = styled.div`
    background-color: #e6fffa;
    color: #234e52;
    font-weight: 700;
    font-size: 12px;
    padding: 8px 16px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 24px;
    border: 1px solid #b2f5ea;
`;

const QRImageWrapper = styled.div`
    background: #ffffff;
    padding: 16px;
    border-radius: 16px;
    display: inline-block;
    border: 2px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    margin-bottom: 20px;
`;

const FooterText = styled.p`
    color: #718096;
    font-size: 13px;
    margin: 0;
    font-style: italic;
    font-weight: 500;
`;

const InpatientQRScan = () => {
    const baseUrl = window.location.origin + (process.env.PUBLIC_URL || "") + "/InPatientFeedbackForm";
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(baseUrl)}`;

    return (
        <PageContainer>
            <QRCard>
                <Title>SHANMUGA HOSPITAL</Title>
                <Subtitle>
                    IN PATIENT FEEDBACK FORM<br/>
                    உள் நோயாளி கருத்துப் படிவம்
                </Subtitle>

                <ScanTag>
                    📷 SCAN QR CODE WITH MOBILE CAMERA
                </ScanTag>

                <div>
                    <QRImageWrapper>
                        <img
                            src={qrImageUrl}
                            alt="Shanmuga Hospital InPatient Feedback QR Code"
                            width="240"
                            height="240"
                            style={{ display: "block" }}
                        />
                    </QRImageWrapper>
                </div>

                <FooterText>
                    "A legacy of caring"
                </FooterText>
            </QRCard>
        </PageContainer>
    );
};

export default InpatientQRScan;

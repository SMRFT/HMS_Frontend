import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Container } from "react-bootstrap";

const QRScan = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <QRCodeCanvas
        value="https://hms.shinova.in/QrScanForm"
        size={200} // Fixed size
      />
    </Container>
  );
};

export default QRScan;

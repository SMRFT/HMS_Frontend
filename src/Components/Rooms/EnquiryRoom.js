import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import apiRequest from "../../Auth/apiRequest";
import {
  Container,
  PageWrapper,
  SectionHeader,
} from "../GlobalStyles";

const BlockSection = styled.div`
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const BlockTitle = styled.h3`
  color: #1e3a8a; // Dark blue
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
  margin-bottom: 16px;
`;

const FloorSection = styled.div`
  margin-bottom: 16px;
`;

const FloorTitle = styled.h4`
    color: #4b5563;
    font-size: 1rem;
    margin-bottom: 8px;
    font-weight: 600;
`;

const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const RoomCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  background: #f9fafb;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 4px;
`;

const RoomNumber = styled.span`
  font-weight: bold;
  color: #374151;
`;

const RoomType = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
`;

const BedList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const BedItem = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: white;
  background-color: ${props =>
    props.status === 'Available' ? '#10b981' : // Green
      props.status === 'Occupied' ? '#ef4444' : // Red
        '#f59e0b' // Orange (Maintenance)
  };
  cursor: default;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  flex: 1 1 auto;
  text-align: center;
  min-width: 60px;

  &:hover {
      opacity: 0.9;
  }
`;

const Legend = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    justify-content: flex-end;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
`;

const ColorBox = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background-color: ${props => props.color};
`;


const EnquiryRoom = () => {
  const [data, setData] = useState([]);
  const HmsBaseUrl = process.env.REACT_APP_BACKEND_HMS_BASE_URL;

  useEffect(() => {
    fetchEnquiryData();
  }, []);

  const fetchEnquiryData = async () => {
    try {
      const response = await apiRequest(`${HmsBaseUrl}room-enquiry/`, "GET");
      if (response && !response.error) {
        setData(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      toast.error("Failed to fetch room enquiry data");
    }
  };

  return (
    <PageWrapper>
      <Container>
        <SectionHeader>
          <h3>Room Enquiry</h3>
        </SectionHeader>

        <Legend>
          <LegendItem><ColorBox color="#10b981" /> Available</LegendItem>
          <LegendItem><ColorBox color="#ef4444" /> Occupied</LegendItem>
          <LegendItem><ColorBox color="#f59e0b" /> Maintenance</LegendItem>
        </Legend>

        {data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            No rooms configured or active.
          </div>
        ) : (
          data.map((blockData, index) => (
            <BlockSection key={index}>
              <BlockTitle>Block: {blockData.block.block_name}</BlockTitle>
              {Object.keys(blockData.floors).length === 0 ? (
                <div style={{ padding: "10px", color: "#9ca3af" }}>No rooms in this block</div>
              ) : (
                Object.entries(blockData.floors).map(([floor, rooms]) => (
                  <FloorSection key={floor}>
                    <FloorTitle>Floor: {floor}</FloorTitle>
                    <RoomGrid>
                      {rooms.map(room => (
                        <RoomCard key={room.id}>
                          <RoomHeader>
                            <RoomNumber>{room.room_number}</RoomNumber>
                            <RoomType>{room.room_type}</RoomType>
                          </RoomHeader>
                          <BedList>
                            {room.beds.length === 0 ? (
                              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>No Beds</span>
                            ) : (
                              room.beds.map(bed => (
                                <BedItem key={bed.id} status={bed.status} title={`${bed.status} - ${bed.bed_type}`}>
                                  {bed.bed_number}
                                </BedItem>
                              ))
                            )}
                          </BedList>
                        </RoomCard>
                      ))}
                    </RoomGrid>
                  </FloorSection>
                ))
              )}
            </BlockSection>
          ))
        )}
      </Container>
    </PageWrapper>
  );
};

export default EnquiryRoom;
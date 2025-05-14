import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Calendar, User } from 'lucide-react';
import axios from 'axios';

// Styled Components
const Container = styled.div`
  font-family: 'Arial', sans-serif;
  max-width: 100%;
  margin: 0 auto;
`;

const Header = styled.header`
  background-color: #00796b;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
`;

const LogoImage = styled.div`
  background-color: #fff;
  border-radius: 4px;
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderTitle = styled.div`
  flex-grow: 1;
  margin-left: 10px;
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Breadcrumb = styled.div`
  background-color: #f5f5f5;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
`;

const BreadcrumbLink = styled.a`
  color: #0277bd;
  text-decoration: none;
  margin-right: 0.5rem;
`;

const BreadcrumbText = styled.span`
  color: #666;
  margin-left: 0.5rem;
`;

const NavTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  background-color: #fff;
`;

const Tab = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  border-bottom: ${props => props.active ? '2px solid #0277bd' : 'none'};
  color: ${props => props.active ? '#0277bd' : '#666'};
`;

const BlockSection = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
`;

const Block = styled.div`
  flex: 1;
  background-color: ${props => props.type === 'MAIN' ? '#5f9ea0' : '#708090'};
  color: white;
  border-radius: 4px;
  overflow: hidden;
`;

const BlockHeader = styled.div`
  padding: 0.75rem;
  text-align: center;
`;

const BlockTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
`;

const BlockSubtitle = styled.div`
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const BlockContent = styled.div`
  display: flex;
  background-color: white;
  padding: 0.75rem;
`;

const BlockStats = styled.div`
  flex: 1;
`;

const StatsHeader = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const StatsContent = styled.div`
  display: flex;
  gap: 0.25rem;
  justify-content: center;
`;

const StatBox = styled.div`
  background-color: ${props => {
    switch (props.color) {
      case 'blue': return '#2196f3';
      case 'green': return '#4caf50';
      case 'red': return '#f44336';
      case 'orange': return '#ff9800';
      case 'gray': return '#9e9e9e';
      default: return '#e0e0e0';
    }
  }};
  color: ${props => props.color !== 'gray' ? 'white' : 'black'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TotalStat = styled.div`
  background-color: #2196f3;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-right: 0.5rem;
`;

const SearchSection = styled.div`
  background-color: #e0f2f1;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 150px;
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #0277bd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-end;

  &:hover {
    background-color: #01579b;
  }
`;

const RoomsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
`;

const RoomCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background-color: ${props => {
    switch (props.status) {
      case 'available': return '#4caf50';
      case 'partial': return '#ff9800';
      case 'full': return '#f44336';
      case 'repair': return '#9e9e9e';
      case 'consulting': return '#9e9e9e';
      default: return '#e0e0e0';
    }
  }};
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  color: white;
  font-weight: bold;
`;

const RoomNumber = styled.div`
  font-size: 1.1rem;
`;

const RoomOccupancy = styled.div`
  font-size: 0.8rem;
`;

const RoomType = styled.div`
  padding: 0.25rem 0.5rem;
  background-color: rgba(0, 0, 0, 0.1);
  color: white;
  font-size: 0.7rem;
  text-align: center;
`;

const StatusLegend = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  justify-content: center;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'available': return '#4caf50';
      case 'partial': return '#ff9800';
      case 'full': return '#f44336';
      case 'repair': return '#9e9e9e';
      default: return '#e0e0e0';
    }
  }};
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: #666;
  font-size: 1.1rem;
`;

const EnquiryRoom = () => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [currentDate, setCurrentDate] = useState('29-04-2025');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomCategories, setRoomCategories] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [nursingStations, setNursingStations] = useState([]);
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState('2025-04-29');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedNursingStation, setSelectedNursingStation] = useState('ALL');
  const [roomNumber, setRoomNumber] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    mainBlock: {
      totalRooms: 0,
      available: 0,
      partial: 0,
      full: 0,
      repair: 0,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      underRepairBeds: 0,
    },
    cancerBlock: {
      totalRooms: 0,
      available: 0,
      partial: 0,
      full: 0,
      repair: 0,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      underRepairBeds: 0,
    }
  });

  // Fetch rooms data
  useEffect(() => {
    setLoading(true);
    axios.get("http://127.0.0.1:8000/rooms/")
      .then(response => {
        // Process the rooms data
        const fetchedRooms = response.data.map(room => {
          // Determine room status based on capacity and other factors
          // This is a simplified version - you'll need to adjust based on your actual data
          let status = 'available';
          
          // In a real system, you would likely have a separate endpoint for bed occupancy
          // Here we're simulating occupancy with a random number between 0 and capacity
          const occupied = Math.floor(Math.random() * (room.capacity || 1));
          const occupancy = `${occupied}/${room.capacity || 1}`;
          
          if (occupied === 0) status = 'available';
          else if (occupied < room.capacity) status = 'partial';
          else if (occupied >= room.capacity) status = 'full';
          
          return {
            id: room.id,
            number: room.room_number,
            type: room.room_type,
            category: room.room_category,
            block: room.block,
            floor: room.floor,
            nursingStation: room.nursing_station,
            status: status,
            occupancy: occupancy,
            capacity: room.capacity || 1,
            occupied: occupied
          };
        });
        
        setRooms(fetchedRooms);
        
        // Extract unique values for filters
        setRoomCategories(['ALL', ...new Set(fetchedRooms.map(room => room.category).filter(Boolean))]);
        setBlocks(['ALL', ...new Set(fetchedRooms.map(room => room.block).filter(Boolean))]);
        setFloors(['ALL', ...new Set(fetchedRooms.map(room => room.floor).filter(Boolean))]);
        setNursingStations(['ALL', ...new Set(fetchedRooms.map(room => room.nursingStation).filter(Boolean))]);
        
        // Calculate statistics
        calculateRoomStats(fetchedRooms);
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching rooms:", error);
        setLoading(false);
      });
  }, []);

  // Calculate room statistics
  const calculateRoomStats = (roomsData) => {
    const newStats = {
      mainBlock: {
        totalRooms: 0,
        available: 0,
        partial: 0,
        full: 0,
        repair: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        underRepairBeds: 0,
      },
      cancerBlock: {
        totalRooms: 0,
        available: 0,
        partial: 0,
        full: 0,
        repair: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        availableBeds: 0,
        underRepairBeds: 0,
      }
    };

    roomsData.forEach(room => {
      const blockKey = room.block === 'CANCER BLOCK' ? 'cancerBlock' : 'mainBlock';
      
      // Increment room counts
      newStats[blockKey].totalRooms++;
      
      if (room.status === 'available') newStats[blockKey].available++;
      else if (room.status === 'partial') newStats[blockKey].partial++;
      else if (room.status === 'full') newStats[blockKey].full++;
      else if (room.status === 'repair') newStats[blockKey].repair++;
      
      // Increment bed counts
      const capacity = parseInt(room.capacity) || 1;
      const occupied = parseInt(room.occupied) || 0;
      
      newStats[blockKey].totalBeds += capacity;
      newStats[blockKey].occupiedBeds += occupied;
      newStats[blockKey].availableBeds += (capacity - occupied);
      
      if (room.status === 'repair') {
        newStats[blockKey].underRepairBeds += capacity;
        newStats[blockKey].availableBeds -= capacity;
      }
    });
    
    setStats(newStats);
  };

  // Filter rooms based on search criteria
  const filteredRooms = rooms.filter(room => {
    if (selectedCategory !== 'ALL' && room.category !== selectedCategory) return false;
    if (selectedBlock !== 'ALL' && room.block !== selectedBlock) return false;
    if (selectedFloor !== 'ALL' && room.floor !== selectedFloor) return false;
    if (selectedNursingStation !== 'ALL' && room.nursingStation !== selectedNursingStation) return false;
    if (roomNumber && !room.number.toLowerCase().includes(roomNumber.toLowerCase())) return false;
    return true;
  });

  // Handle search
  const handleSearch = () => {
    // In a real application, you might want to refetch data with the selected filters
    // For this example, we're just using client-side filtering
    console.log("Searching with filters:", {
      date: selectedDate,
      category: selectedCategory,
      block: selectedBlock,
      floor: selectedFloor,
      nursingStation: selectedNursingStation,
      roomNumber: roomNumber
    });
  };

  return (
    <Container>
      <NavTabs>
        <Tab active={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill={activeTab === 'patients' ? '#0277bd' : '#666'} />
          </svg>
          Patients
        </Tab>
        <Tab active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM18 18H6V17C6 15 10 13.9 12 13.9C14 13.9 18 15 18 17V18Z" fill={activeTab === 'doctors' ? '#0277bd' : '#666'} />
          </svg>
          Doctors
        </Tab>
        <Tab active={activeTab === 'services'} onClick={() => setActiveTab('services')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill={activeTab === 'services' ? '#0277bd' : '#666'} />
          </svg>
          Services
        </Tab>
        <Tab active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill={activeTab === 'rooms' ? '#0277bd' : '#666'} />
          </svg>
          Rooms
        </Tab>
      </NavTabs>

      <BlockSection>
        <Block type="MAIN">
          <BlockHeader>
            <BlockTitle>MAIN BLOCK</BlockTitle>
            <BlockSubtitle>NURSES' STATION: 8</BlockSubtitle>
          </BlockHeader>
          <BlockContent>
            <BlockStats>
              <StatsHeader>ROOMS</StatsHeader>
              <StatsContent>
                <TotalStat>Total: {stats.mainBlock.totalRooms}</TotalStat>
                <StatBox color="green">{stats.mainBlock.available}</StatBox>
                <StatBox color="orange">{stats.mainBlock.partial}</StatBox>
                <StatBox color="red">{stats.mainBlock.full}</StatBox>
                <StatBox color="gray">{stats.mainBlock.repair}</StatBox>
              </StatsContent>
            </BlockStats>
            <BlockStats>
              <StatsHeader>BEDS</StatsHeader>
              <StatsContent>
                <TotalStat>Total: {stats.mainBlock.totalBeds}</TotalStat>
                <StatBox color="green">{stats.mainBlock.availableBeds}</StatBox>
                <StatBox color="red">{stats.mainBlock.occupiedBeds}</StatBox>
                <StatBox color="gray">{stats.mainBlock.underRepairBeds}</StatBox>
              </StatsContent>
            </BlockStats>
          </BlockContent>
        </Block>
        
        <Block type="CANCER">
          <BlockHeader>
            <BlockTitle>CANCER BLOCK</BlockTitle>
            <BlockSubtitle>NURSES' STATION: 1</BlockSubtitle>
          </BlockHeader>
          <BlockContent>
            <BlockStats>
              <StatsHeader>ROOMS</StatsHeader>
              <StatsContent>
                <TotalStat>Total: {stats.cancerBlock.totalRooms}</TotalStat>
                <StatBox color="green">{stats.cancerBlock.available}</StatBox>
                <StatBox color="orange">{stats.cancerBlock.partial}</StatBox>
                <StatBox color="red">{stats.cancerBlock.full}</StatBox>
                <StatBox color="gray">{stats.cancerBlock.repair}</StatBox>
              </StatsContent>
            </BlockStats>
            <BlockStats>
              <StatsHeader>BEDS</StatsHeader>
              <StatsContent>
                <TotalStat>Total: {stats.cancerBlock.totalBeds}</TotalStat>
                <StatBox color="green">{stats.cancerBlock.availableBeds}</StatBox>
                <StatBox color="red">{stats.cancerBlock.occupiedBeds}</StatBox>
                <StatBox color="gray">{stats.cancerBlock.underRepairBeds}</StatBox>
              </StatsContent>
            </BlockStats>
          </BlockContent>
        </Block>
      </BlockSection>

      <SearchSection>
        <FormGroup>
          <Label>Date</Label>
          <Input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Room Category</Label>
          <Select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {roomCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Block</Label>
          <Select 
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
          >
            {blocks.map(block => (
              <option key={block} value={block}>{block}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Floor</Label>
          <Select 
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
          >
            {floors.map(floor => (
              <option key={floor} value={floor}>{floor}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Nursing Station</Label>
          <Select 
            value={selectedNursingStation}
            onChange={(e) => setSelectedNursingStation(e.target.value)}
          >
            {nursingStations.map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Room No</Label>
          <Input 
            type="text" 
            placeholder="Room No" 
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          />
        </FormGroup>

        <Button onClick={handleSearch}>
          <Search size={16} />
          Search
        </Button>
      </SearchSection>

      <StatusLegend>
        <StatusItem>
          <StatusDot status="available" />
          Available
        </StatusItem>
        <StatusItem>
          <StatusDot status="partial" />
          Partial
        </StatusItem>
        <StatusItem>
          <StatusDot status="full" />
          Full
        </StatusItem>
        <StatusItem>
          <StatusDot status="repair" />
          Under Repair
        </StatusItem>
      </StatusLegend>

      {loading ? (
        <LoadingIndicator>Loading rooms data...</LoadingIndicator>
      ) : (
        <RoomsGrid>
          {filteredRooms.map(room => (
            <RoomCard key={room.id} status={room.status}>
              <RoomHeader>
                <RoomNumber>{room.number}</RoomNumber>
                <RoomOccupancy>{room.occupancy}</RoomOccupancy>
              </RoomHeader>
              <RoomType>{room.type}</RoomType>
            </RoomCard>
          ))}
        </RoomsGrid>
      )}
    </Container>
  );
};

export default EnquiryRoom;
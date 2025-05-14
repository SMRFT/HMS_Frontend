import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Login from "./Components/Login"; // Import Login component
import Register from "./Components/Register";
import PharmacyBilling from "./Components/Pharmacy/pharmacy";
import StockEntry from "./Components//Pharmacy/StockEntry";
import PatientRegistrationForm from "./Components/PatientRegistrationForm";
import HSNCodeForm from "./Components//Pharmacy/HSNCode";
import VentorForm from "./Components/Pharmacy/VentorForm";
import StockDisplay from "./Components//Pharmacy/StockDisplay";
import Doctor from "./Components/Doctor";
import DoctorList from "./Components/DoctorList";
import DoctorReport from "./Components/DoctorReport";
import "./App.css";
import CTReportForm from "./Components/CTReportForm";
import CTList from "./Components/CTList";
import MRIList from "./Components/MRIList";
import MRIReportForm from "./Components/MRIReportForm";
import Admission from "./Components/Admission";
import Enquiry from "./Components/Enquiry";
import Summary from "./Components/Summary";
import EditSummary from "./Components/EditSummary";
import SummaryPrint from "./Components/SummaryPrint";
import InvestigationBilling from "./Components/InvestigationBilling";
import ViewEstimate from "./Components/ViewEstimate";
import ViewBills from "./Components/ViewBills";
import USGList from "./Components/USGList";
import USGReportForm from "./Components/USGReportForm";
import XRayList from "./Components/XRayList";
import XRayReportForm from "./Components/XRayRportForm";
import ReferenceDoctorForm from "./Components/ReferenceDoctorForm";
import Block from "./Components/Rooms/Block";
import RoomForm from "./Components/Rooms/Room";
import EnquiryRoom from "./Components/Rooms/EnquiryRoom";
import DischargeForm from "./Components/Discharge/DischargeForm";
import DischargeReport from "./Components/Discharge/DischargeReport";
import "./App.css";
import RoomShifting from "./Components/Rooms/RoomShifting";

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/"; // Check if the current route is the login page
  return (
    <div className="App">
      {!isLoginPage && <Sidebar />}
      <div className="content">{children}</div>
    </div>
  );
};
function App() {
  return (
    <Router>
      <Routes>
        {/* Default route for the login page */}
        <Route path="/" element={<Login />} />
        {/* All other routes wrapped in the Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/Register" element={<Register />} />
                <Route
                  path="/PatientRegistrationForm"
                  element={<PatientRegistrationForm />}
                />
                <Route
                  path="/ReferenceDoctorForm"
                  element={<ReferenceDoctorForm />}
                />
                <Route path="/Enquiry" element={<Enquiry />} />
                <Route path="/PharmacyBilling" element={<PharmacyBilling />} />
                <Route path="/StockEntry" element={<StockEntry />} />
                <Route path="/StockDisplay" element={<StockDisplay />} />
                <Route path="/HSNCodeForm" element={<HSNCodeForm />} />
                <Route path="/VentorForm" element={<VentorForm />} />
                <Route path="/Doctor" element={<Doctor />} />
                <Route path="/DoctorList" element={<DoctorList />} />
                <Route
                  path="/DoctorList/:first_name"
                  element={<DoctorReport />}
                />
                <Route path="/CTList" element={<CTList />} />
                <Route
                  path="/CTList/:uhid/:subUhid"
                  element={<CTReportForm />}
                />
                <Route path="/MRIList" element={<MRIList />} />
                <Route
                  path="/MRIList/:uhid/:subUhid"
                  element={<MRIReportForm />}
                />
                <Route path="/Admission" element={<Admission />} />
                <Route path="/Summary" element={<Summary />} />
                <Route path="/EditSummary/:ipNo" element={<EditSummary />} />
                <Route path="/SummaryPrint/:ipNo" element={<SummaryPrint />} />
                <Route
                  path="/InvestigationBilling"
                  element={<InvestigationBilling />}
                />
                <Route path="/ViewEstimate" element={<ViewEstimate />} />
                <Route path="/ViewBills" element={<ViewBills />} />

                <Route path="/USGList" element={<USGList />} />
                <Route
                  path="/USGList/:uhid/:subUhid"
                  element={<USGReportForm />}
                />

                <Route path="/XRayList" element={<XRayList />} />
                <Route
                  path="/XRayList/:uhid/:subUhid"
                  element={<XRayReportForm />}
                />
                <Route path="/Block" element={<Block />} />
                <Route path="/Room" element={<RoomForm />} />
                <Route path="/EnquiryRoom" element={<EnquiryRoom />} />
                <Route path="/RoomShifting" element={<RoomShifting />} />
                <Route path="/DischargeForm" element={<DischargeForm />} />
                <Route path="/DischargeReport" element={<DischargeReport />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from "react";
import axios from "axios";
import { createIcons } from "lucide-react";

const PatientEnquiry = () => {
  const [uhid, setUhid] = useState("");
  const [ipNumber, setIpNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [guardian, setGuardian] = useState("");
  const [age, setAge] = useState({ years: "", months: "", days: "" });
  const [gender, setGender] = useState("");
  const [area, setArea] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [patients, setPatients] = useState([]);

  // Function to fetch patients based on search filters
  const fetchPatients = async () => {
    try {
      let query = "";
      if (uhid) {
        query = `uhid=${uhid}`;
      } else if (ipNumber) {
        query = `ip_number=${ipNumber}`;
      } else if (mobile) {
        query = `mobile=${mobile}`;
      }

      const response = await axios.get(`https://hms.shinovadatabase.in/create/?${query}`);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleReset = () => {
    setUhid("");
    setIpNumber("");
    setMobile("");
    setName("");
    setGuardian("");
    setAge({ years: "", months: "", days: "" });
    setGender("");
    setArea("");
    setCustomerType("");
    setInsuranceCompany("");
    setPatients([]);
  };

  const SearchButton = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-r-lg border border-gray-300 border-l-0 flex items-center justify-center"
    >
      <createIcons size={18} />
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-sm mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Patient Enquiry</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* UHID */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">UHID No</label>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter UHID No"
              value={uhid}
              onChange={(e) => setUhid(e.target.value)}
              className="flex-1 rounded-l-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <SearchButton onClick={fetchPatients} />
          </div>
        </div>

        {/* IP Number */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">IP Number</label>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter IP Number"
              value={ipNumber}
              onChange={(e) => setIpNumber(e.target.value)}
              className="flex-1 rounded-l-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <SearchButton onClick={fetchPatients} />
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter Mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 rounded-l-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <SearchButton onClick={fetchPatients} />
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Guardian */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Guardian</label>
          <input
            type="text"
            placeholder="Guardian Name"
            value={guardian}
            onChange={(e) => setGuardian(e.target.value)}
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <div className="grid grid-cols-3 gap-1">
            <input
              type="text"
              placeholder="Years"
              value={age.years}
              onChange={(e) => setAge({ ...age, years: e.target.value })}
              className="rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Months"
              value={age.months}
              onChange={(e) => setAge({ ...age, months: e.target.value })}
              className="rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Days"
              value={age.days}
              onChange={(e) => setAge({ ...age, days: e.target.value })}
              className="rounded-lg px-2 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Area */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Area</label>
          <input
            type="text"
            placeholder="Enter Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Customer Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Customer Type</label>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Customer Type</option>
            <option value="GENERAL">GENERAL</option>
            <option value="INSURANCE">INSURANCE</option>
            <option value="CORPORATE">CORPORATE</option>
            <option value="CARD HOLDER">CARD HOLDER</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
        </div>

        {/* Insurance Company */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Insurance Company</label>
          <select
            value={insuranceCompany}
            onChange={(e) => setInsuranceCompany(e.target.value)}
            className="w-full rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Insurance Company</option>
            <option value="Company A">Company A</option>
            <option value="Company B">Company B</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
        >
          Reset
        </button>
        <button
          onClick={fetchPatients}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Search
        </button>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UHID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.length > 0 ? (
              patients.map((patient, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.uhid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.mobilePhone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.area}, {patient.city}, {patient.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.customerType}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientEnquiry;
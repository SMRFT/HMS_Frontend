import React, { useState } from 'react';

const Admission = () => {
    const [formData, setFormData] = useState({
        uhid: '',
        ipNumber: '',
        salutation: '',
        firstName: '',
        middleName: '',
        lastName: '',
        admissionDate: '',
        time: '',
        customerType: 'General',
        admittingDoctor: '',
        consultingDoctor: '',
        roomNo: '',
        bedNo: '',
        extensionNumber: '',
        callRelease: 'Local',
        nursingStation: '',
        presentComplaints: '',
        reasonForAdmission: '',
        admissionFee: '',
        creditLimit: '',
        mlcType: '',
        mlcRemarks: '',
        uploadMLCDoc: '',
        passAlertToAuthority: false,
        birthTime: '',
        weight: '',
        mothersUHIDNo: '',
        pediatricianResponsible: ''
    });

    const [mlcVisible, setMlcVisible] = useState(false);
    const [newBornVisible, setNewBornVisible] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === "file") {
            setFormData({
                ...formData,
                [name]: files[0]
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : value
            });
        }
    };

    const handleToggleSection = (section) => {
        if (section === 'mlc') {
            setMlcVisible(!mlcVisible);
        } else if (section === 'newBorn') {
            setNewBornVisible(!newBornVisible);
        }
    };

    const handleReset = () => {
        setFormData({
            uhid: '',
            ipNumber: '',
            salutation: '',
            firstName: '',
            middleName: '',
            lastName: '',
            admissionDate: '',
            time: '',
            customerType: 'General',
            admittingDoctor: '',
            consultingDoctor: '',
            roomNo: '',
            bedNo: '',
            extensionNumber: '',
            callRelease: 'Local',
            nursingStation: '',
            presentComplaints: '',
            reasonForAdmission: '',
            admissionFee: '',
            creditLimit: '',
            mlcType: '',
            mlcRemarks: '',
            uploadMLCDoc: '',
            passAlertToAuthority: false,
            birthTime: '',
            weight: '',
            mothersUHIDNo: '',
            pediatricianResponsible: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formPayload = new FormData();
    
        Object.keys(formData).forEach((key) => {
            formPayload.append(key, formData[key]);
        });
    
        try {
            const response = await fetch('http://127.0.0.1:8000/admission/', {
                method: 'POST',
                body: formPayload,
            });
    
            if (response.ok) {
                alert('Form data saved successfully!');
                handleReset();
            } else {
                const errorData = await response.json();
                alert(`Failed to save form data: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving form data!');
        }
    };

    return (
        <div className="flex justify-center min-h-screen bg-gray-50 py-8 px-4">
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-center mb-8 text-blue-800">Patient Admission Form</h2>
                
                <form onSubmit={handleSubmit}>
                    {/* Patient Information Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Patient Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">UHID</label>
                                <input 
                                    type="text" 
                                    name="uhid" 
                                    value={formData.uhid} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IP Number</label>
                                <input 
                                    type="text" 
                                    name="ipNumber" 
                                    value={formData.ipNumber} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salutation</label>
                                <select 
                                    name="salutation" 
                                    value={formData.salutation} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    <option value="Mr.">Mr.</option>
                                    <option value="Mrs.">Mrs.</option>
                                    <option value="Ms.">Ms.</option>
                                    <option value="Dr.">Dr.</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    value={formData.firstName} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    value={formData.lastName} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admission Details Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Admission Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                                <input 
                                    type="date" 
                                    name="admissionDate" 
                                    value={formData.admissionDate} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input 
                                    type="time" 
                                    name="time" 
                                    value={formData.time} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                                <select 
                                    name="customerType" 
                                    value={formData.customerType} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="General">General</option>
                                    <option value="Insurance">Insurance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admitting Doctor</label>
                                <input 
                                    type="text" 
                                    name="admittingDoctor" 
                                    value={formData.admittingDoctor} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Consulting Doctor</label>
                                <input 
                                    type="text" 
                                    name="consultingDoctor" 
                                    value={formData.consultingDoctor} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Room Details Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Room Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room No</label>
                                <input 
                                    type="text" 
                                    name="roomNo" 
                                    value={formData.roomNo} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bed No</label>
                                <input 
                                    type="text" 
                                    name="bedNo" 
                                    value={formData.bedNo} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Extension Number</label>
                                <input 
                                    type="text" 
                                    name="extensionNumber" 
                                    value={formData.extensionNumber} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Call Release</label>
                                <select 
                                    name="callRelease" 
                                    value={formData.callRelease} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Local">Local</option>
                                    <option value="STD">STD</option>
                                    <option value="ISD">ISD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nursing Station</label>
                                <input 
                                    type="text" 
                                    name="nursingStation" 
                                    value={formData.nursingStation} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admission Info Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">Admission Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Present Complaints</label>
                                <textarea 
                                    name="presentComplaints" 
                                    value={formData.presentComplaints} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Admission</label>
                                <textarea 
                                    name="reasonForAdmission" 
                                    value={formData.reasonForAdmission} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Fee</label>
                                <input 
                                    type="number" 
                                    name="admissionFee" 
                                    value={formData.admissionFee} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                                <input 
                                    type="number" 
                                    name="creditLimit" 
                                    value={formData.creditLimit} 
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Collapsible Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* MLC Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center p-4">
                                <h3 className="text-lg font-semibold text-blue-600">MLC Details</h3>
                                <button 
                                    type="button" 
                                    onClick={() => handleToggleSection('mlc')}
                                    className="text-blue-500 hover:bg-blue-50 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                                >
                                    <svg 
                                        className={`w-5 h-5 transform transition-transform duration-200 ${mlcVisible ? 'rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className={`px-4 pb-4 space-y-3 ${mlcVisible ? 'block' : 'hidden'}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">MLC Type</label>
                                    <select 
                                        name="mlcType" 
                                        value={formData.mlcType} 
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select</option>
                                        <option value="Accident">Accident</option>
                                        <option value="Assault">Assault</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload MLC Doc</label>
                                    <input 
                                        type="file" 
                                        name="uploadMLCDoc" 
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="passAlertToAuthority"
                                        name="passAlertToAuthority" 
                                        checked={formData.passAlertToAuthority} 
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="passAlertToAuthority" className="ml-2 block text-sm text-gray-700">
                                        Pass alert to authority
                                    </label>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">MLC Remarks</label>
                                    <textarea 
                                        name="mlcRemarks" 
                                        value={formData.mlcRemarks} 
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        
                        {/* New Born Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center p-4">
                                <h3 className="text-lg font-semibold text-blue-600">New Born Details</h3>
                                <button 
                                    type="button" 
                                    onClick={() => handleToggleSection('newBorn')}
                                    className="text-blue-500 hover:bg-blue-50 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                                >
                                    <svg 
                                        className={`w-5 h-5 transform transition-transform duration-200 ${newBornVisible ? 'rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className={`px-4 pb-4 space-y-3 ${newBornVisible ? 'block' : 'hidden'}`}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Birth Time</label>
                                    <input 
                                        type="time" 
                                        name="birthTime" 
                                        value={formData.birthTime} 
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                                    <input 
                                        type="text" 
                                        name="weight" 
                                        value={formData.weight} 
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's UHID No</label>
                                    <input 
                                        type="text" 
                                        name="mothersUHIDNo" 
                                        value={formData.mothersUHIDNo} 
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pediatrician Responsible</label>
                                    <select 
                                        name="pediatricianResponsible" 
                                        value={formData.pediatricianResponsible} 
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select</option>
                                        <option value="Dr. Smith">Dr. Smith</option>
                                        <option value="Dr. Johnson">Dr. Johnson</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Form Buttons */}
                    <div className="flex justify-end space-x-4 mt-8">
                        <button 
                            type="button" 
                            onClick={handleReset}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Reset
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Admission;
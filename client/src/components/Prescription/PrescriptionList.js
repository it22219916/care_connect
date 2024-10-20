import React, { useEffect, useState, useContext } from 'react';
import Header from '../Layout/Header/Header';
import Sidebar from '../Layout/Sidebar/Sidebar';
import { Link } from "react-router-dom";
import axios from "axios";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import PrescriptionTable from '../MUITable/PrescriptionTable';
import { UserContext } from '../../Context/UserContext';
import moment from 'moment';
import QrScanner from 'react-qr-scanner'; // Import the QR scanner library

function PrescriptionList() {
    const { currentUser } = useContext(UserContext);
    const params = new URLSearchParams(window.location.search);

    const [prescriptions, setPrescription] = useState([]);
    const [patientList, setPatientList] = useState([]);
    const [doctorList, setDoctorList] = useState([]);
    const [patientSelected, setPatientSelected] = useState("");
    const [doctorSelected, setDoctorSelected] = useState("");
    const [scannedUserId, setScannedUserId] = useState(""); // State for scanned user ID
    const [showScanner, setShowScanner] = useState(false); // State to control scanner visibility
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);

    const handleDialogueOpen = () => {
        setErrorDialogueBoxOpen(true);
    };

    const handleDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
    };

    const getPatients = async () => {
        const response = await axios.get("http://localhost:3001/patients");
        setPatientList(response.data);
    };

    const getDoctors = async () => {
        const response = await axios.get("http://localhost:3001/doctors");
        setDoctorList(response.data);
    };

    const getPrescription = async (patientId = patientSelected, doctorId = doctorSelected) => {
        let reqObj = {};
    
        if (patientId) {
            setPatientSelected(patientId);
        }
    
        if (doctorId) {
            setDoctorSelected(doctorId);
        }
    
        reqObj = {
            "patientId": patientId,
            "doctorId": doctorId
        };
    
        try {
            let response = await axios.post(`http://localhost:3001/prescriptions`, reqObj, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
    
            if (response.data.message === "success") {
                let respPrescription = response.data.prescriptions;
                let newResp = respPrescription.sort((a, b) => {
                    const timeA = new Date(`${moment(new Date(a.appointmentId.appointmentDate.slice(0, -1))).format('MM/DD/YYYY')} ${a.appointmentId.appointmentTime}`);
                    const timeB = new Date(`${moment(new Date(b.appointmentId.appointmentDate.slice(0, -1))).format('MM/DD/YYYY')} ${b.appointmentId.appointmentTime}`);
                    return timeB - timeA;
                });
                setPrescription(newResp);
            } else {
                // Handle error scenario
                console.error("Error fetching prescriptions:", response.data);
            }
        } catch (error) {
            console.error("Axios error:", error.response ? error.response.data : error.message);
        }
    };
    
    // Function to handle QR code scan
    const handleScan = (data) => {
        if (data && data.text) { // Ensure data and data.text exist
            console.log(data.text); // Log the scanned text
            setScannedUserId(data.text); // Set the scanned user ID
            getPrescription(data.text); // Fetch prescriptions based on the scanned user ID
            setShowScanner(false); // Hide the scanner after a successful scan
        }
    };
    

    const handleError = (err) => {
        console.error(err); // Handle error while scanning
    };

    useEffect(() => {
        getPatients();
        getDoctors();
    }, []);

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div className="page-wrapper">
                <div className="content">
                    <h4 className="page-title">Prescription</h4>
                    <form
                        action="/prescriptions"
                        name="prescriptionFilter"
                        className={currentUser.userType === "Patient" ? "hide" : ""}
                        onSubmit={(e) => {
                            e.preventDefault();
                            getPrescription(patientSelected, doctorSelected);
                        }}
                    >
                        <div className="row filter-row">
                            <div className="col-sm-4 col-md-4 mt-2">
                                <select
                                    name="patientId"
                                    id="patientId"
                                    className="form-select"
                                    value={patientSelected}
                                    onChange={(e) => setPatientSelected(e.target.value)}
                                >
                                    <option value=''>Choose Patient</option>
                                    {
                                        patientList.map(patient => (
                                            <option key={patient._id} value={patient._id}>
                                                {patient.userId.firstName} {patient.userId.lastName}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            {currentUser.userType === 'Admin' &&
                                <div className="col-sm-4 col-md-4 mt-2">
                                    <select
                                        name="doctorId"
                                        id="doctorId"
                                        className="form-select"
                                        value={doctorSelected}
                                        onChange={(e) => setDoctorSelected(e.target.value)}
                                    >
                                        <option value=''>Choose Doctor</option>
                                        {
                                            doctorList.map(doctor => (
                                                <option key={doctor._id} value={doctor._id}>
                                                    {doctor.userId.firstName} {doctor.userId.lastName}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            }
                            <div className="col-sm-4 col-md-4">
                                <button type="submit" className="btn btn-primary btn-block"> Search </button>
                            </div>
                        </div>
                    </form>

                    {/* QR Code Scanner: Only visible if the user is not a patient */}
                    {currentUser.userType !== 'Patient' && (
                        <>
                            {/* Button to Toggle QR Code Scanner */}
                            <div className="qr-scanner">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowScanner(prev => !prev)}
                                >
                                    {showScanner ? 'Close Scanner' : 'Scan QR Code'}
                                </button>
                            </div>

                            {/* QR Code Scanner */}
                            {showScanner && (
                                <div className="qr-scanner" style={{ width: '200px', margin: '20px auto' }}>
                                    <QrScanner
                                        delay={300}
                                        onError={handleError}
                                        onScan={handleScan}
                                        style={{ width: '100%' }} // Set to 100% of the parent width
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Prescription Table */}
                    <PrescriptionTable prescriptionList={prescriptions} />
                </div>
            </div>
        </Box>
    )
}

export default PrescriptionList;

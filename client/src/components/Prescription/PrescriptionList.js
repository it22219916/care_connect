import React, { useEffect, useState, useContext } from "react";
import Header from "../Layout/Header/Header";
import Sidebar from "../Layout/Sidebar/Sidebar";
import { Link } from "react-router-dom";
import axios from "axios";
import ErrorDialogueBox from "../MUIDialogueBox/ErrorDialogueBox";
import Box from "@mui/material/Box";
import PrescriptionTable from "../MUITable/PrescriptionTable";
import { UserContext } from "../../Context/UserContext";
import moment from "moment";
import QrReader from "react-qr-scanner";
import Config from "../config";

function PrescriptionList() {
  const { currentUser } = useContext(UserContext);

  const [prescriptions, setPrescription] = useState([]);
  const [patientList, setPatientList] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [patientSelected, setPatientSelected] = useState("");
  const [doctorSelected, setDoctorSelected] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const handleDialogueOpen = () => setErrorDialogueBoxOpen(true);
  const handleDialogueClose = () => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false);
  };

  const getPatients = async () => {
    const response = await axios.get(Config.get("getPatients"));
    setPatientList(response.data);
  };

  const getDoctors = async () => {
    const response = await axios.get(Config.get("getDoctors"));
    setDoctorList(response.data);
  };

  const getPrescription = async (
    patientId = patientSelected,
    doctorId = doctorSelected
  ) => {
    let reqObj = {
      patientId: patientId || undefined,
      doctorId: doctorId || undefined,
    };

    try {
      const response = await axios.post(
        Config.get("getPrescriptions"),
        reqObj,
        {
          headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.message === "success") {
        const respPrescription = response.data.prescriptions;
        const sortedPrescriptions = respPrescription.sort((a, b) => {
          const timeA = new Date(
            `${moment(
              new Date(a.appointmentId.appointmentDate.slice(0, -1))
            ).format("MM/DD/YYYY")} ${a.appointmentId.appointmentTime}`
          );
          const timeB = new Date(
            `${moment(
              new Date(b.appointmentId.appointmentDate.slice(0, -1))
            ).format("MM/DD/YYYY")} ${b.appointmentId.appointmentTime}`
          );
          return timeB - timeA;
        });
        setPrescription(sortedPrescriptions);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  const fetchPatientByUserId = async (userId) => {
    try {
      // Fetch all patients and find the one with the matching userId
      const response = await axios.get(Config.get("getPatients"));
      const patients = response.data;

      // Find the patient whose userId matches the scanned QR code
      const patient = patients.find((patient) => patient.userId._id === userId);

      if (patient) {
        // Now we have the patient ID
        const patientId = patient._id;
        setPatientSelected(patientId); // Set the selected patientId in state

        // Fetch the prescriptions for the found patient
        getPrescription(patientId);
        console.log("Patient found with ID:", patientId);
      } else {
        setErrorList(["Patient not found!"]);
        handleDialogueOpen();
        console.error("Patient not found!");
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setErrorList([error.message]);
      handleDialogueOpen();
    }
  };

  const handleScan = (data) => {
    if (data?.text) {
      setScannerOpen(false); // Close scanner after successful scan
      fetchPatientByUserId(data.text); // Fetch patient data using scanned userId
    }
  };

  const handleError = (error) => {
    console.error("QR Code Scan Error:", error);
    setErrorList([error.message]);
    handleDialogueOpen();
  };

  useEffect(() => {
    getPrescription();
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
          >
            <div className="row filter-row">
              <div className="col-sm-4 col-md-4 mt-2">
                <select name="patientId" id="patientId" className="form-select">
                  <option value="">Choose Patient</option>
                  {patientList.map((patient) => (
                    <option
                      value={patient._id}
                      selected={patientSelected === patient._id}
                    >
                      {patient.userId.firstName} {patient.userId.lastName}
                    </option>
                  ))}
                </select>
              </div>
              {currentUser.userType === "Admin" && (
                <div className="col-sm-4 col-md-4 mt-2">
                  <select name="doctorId" id="doctorId" className="form-select">
                    <option value="">Choose Doctor</option>
                    {doctorList.map((doctor) => (
                      <option
                        value={doctor._id}
                        selected={doctorSelected === doctor._id}
                      >
                        {doctor.userId.firstName} {doctor.userId.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="col-sm-4 col-md-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{ padding: "12px 20px" }}
                >
                  Search
                </button>
                {currentUser.userType !== "Patient" && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-block mt-2"
                    style={{ padding: "12px 20px" }}
                    onClick={() => setScannerOpen(!scannerOpen)}
                  >
                    {scannerOpen ? "Close Scanner" : "Open Scanner"}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* QR Code Scanner */}
          {scannerOpen && (
            <div
              className="qr-scanner mt-3"
              style={{
                maxWidth: "300px",
                margin: "0 auto",
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <QrReader
                onScan={handleScan}
                onError={handleError}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}

          <PrescriptionTable prescriptionList={prescriptions} />
        </div>
      </div>
    </Box>
  );
}

export default PrescriptionList;

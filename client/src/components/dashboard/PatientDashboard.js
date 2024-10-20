import styles from "./Dashboard.module.css";
import { React, useState, useEffect, useContext } from "react";
import Box from "@mui/material/Box";
import { UserContext } from "../../Context/UserContext";
import { NavLink } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import Button from "@mui/material/Button";
import { QRCodeCanvas } from "qrcode.react";

export default function PatientDashboard() {
  const { currentUser } = useContext(UserContext); // Use currentUser._id as the user identifier
  const [qrValue, setQrValue] = useState({currentUser}); // QR Code value
  const [firstAppointmentInFuture, setFirstAppointmentInFuture] = useState({});
  const [prescriptions, setPrescription] = useState([]);

  const getAppMonth = (dateOfJoining) => {
    if (!dateOfJoining) {
      return;
    }
    let month = new Date(dateOfJoining.slice(0, -1)).getMonth();
    let monthList = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthList[month];
  };

  const getAppDate = (dateOfJoining) => {
    if (!dateOfJoining) {
      return;
    }
    let date = new Date(dateOfJoining.slice(0, -1)).getDate();
    return date;
  };

  const getAppYear = (dateOfJoining) => {
    if (!dateOfJoining) {
      return;
    }
    let year = new Date(dateOfJoining.slice(0, -1)).getFullYear();
    return year;
  };

  const getBookedSlots = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/appointments`,
        { isTimeSlotAvailable: false },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.message === "success") {
        const aptms = response.data.appointments;
        const futureAppointments = aptms.filter((appointment) => {
          const appointmentDate = new Date(
            appointment.appointmentDate.slice(0, -1)
          );
          const now = new Date();
          return appointmentDate > now;
        });

        if (futureAppointments && futureAppointments.length > 0) {
          const sortedAppointments = futureAppointments.sort((a, b) => {
            const aDate = new Date(a.appointmentDate.slice(0, -1));
            const bDate = new Date(b.appointmentDate.slice(0, -1));
            return aDate - bDate;
          });

          let firstApp = sortedAppointments.find((appointment) => {
            const appointmentDate = new Date(
              appointment.appointmentDate.slice(0, -1)
            );
            const now = new Date();
            return appointmentDate > now;
          });
          setFirstAppointmentInFuture(firstApp);
        }
      }
    } catch (error) {
      console.error("Error fetching booked slots", error);
    }
  };

  const getPrescription = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3001/prescriptions`,
        {},
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.message === "success") {
        const respPrescription = response.data.prescriptions;
        const newResp = respPrescription.sort((a, b) => {
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
        setPrescription(newResp);
      }
    } catch (error) {
      console.error("Error fetching prescriptions", error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.userId) {
      setQrValue(currentUser.userId); // Set the current user's ID as the QR code value
    }
    getBookedSlots();
    getPrescription();
  }, [currentUser]);

  return (
    <Box className={styles.dashboardBody} component="main" sx={{ flexGrow: 1, p: 3 }}>
      <div id={styles.welcomeBanner}>
        <div className="text-white">
          <h3>Welcome!</h3>
          <h4>{currentUser.firstName} {currentUser.lastName}</h4>
          <div className={styles.horizontalLine}></div>
          At Care Connect, we believe that every patient deserves the highest quality care possible.
          Our commitment to excellence in healthcare is matched only by our compassion for those we serve.
        </div>
      </div>

      {/* QR code section */}
      <div className="mt-5 justify-content-center">
        <div className="col-md-6 col-sm-12">
          <div className="customPatientApt mx-auto">
            <div className="topicHeader">
              <h3 className="text-center">Your QR Code</h3>
            </div>
            <div className="text-center">
              {qrValue ? (
                <>
                  <QRCodeCanvas value={qrValue} size={150} /> {/* Shows patient ID */}
                  <p className="mt-3">Scan this code for your details</p>
                </>
              ) : (
                <p>Loading your QR code...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming appointment and patient history sections */}
      <div className="row mt-5 justify-content-center">
        {/* Upcoming appointment section */}
        <div className="col-md-6 col-sm-12">
          <div className="customPatientApt mx-auto">
            <div className="topicHeader">
              <h3 className="text-center">Upcoming Appointment</h3>
            </div>
            <div className="topicContent">
              {firstAppointmentInFuture.appointmentDate && (
                <div className="contentCard">
                  <div className="apDate">
                    <p className="date">
                      {getAppDate(firstAppointmentInFuture.appointmentDate)}
                    </p>
                    <p>
                      {getAppMonth(firstAppointmentInFuture.appointmentDate)}
                    </p>
                    <p>
                      {getAppYear(firstAppointmentInFuture.appointmentDate)}
                    </p>
                  </div>
                  <div className="apDetails">
                    <p className="py-2">
                      <span className="fw-bold">Doctor Name </span>:{" "}
                      {firstAppointmentInFuture?.doctorId?.userId.firstName}{" "}
                      {firstAppointmentInFuture?.doctorId?.userId.lastName}
                    </p>
                    <p className="py-2">
                      <span className="fw-bold">Department </span>:{" "}
                      {firstAppointmentInFuture?.doctorId?.department}
                    </p>
                    <p className="py-2">
                      <span className="fw-bold">Time</span>:{" "}
                      {firstAppointmentInFuture?.appointmentTime}
                    </p>
                  </div>
                </div>
              )}
              {!firstAppointmentInFuture.appointmentDate && (
                <div className="contentCard-empty">
                  <p className="fw-bolder">You have no upcoming Appointments</p>
                  <p className="mt-5">
                    Would you like to book a new Appointment?
                  </p>
                  <Button
                    variant="contained"
                    color="success"
                    className="my-3"
                    startIcon={<BookOnlineIcon />}
                    component={NavLink}
                    to="/appointments"
                  >
                    Book Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient History */}
        <div className="col-md-6 col-sm-12">
          <div className="customPatientApt mx-auto">
            <div className="topicHeader">
              <h3 className="text-center">Patient History</h3>
            </div>
            <div className="topicContent">
              {prescriptions[0]?.appointmentId && (
                <div className="contentCard">
                  <div className="apDate">
                    <p className="date">
                      {getAppDate(
                        prescriptions[0]?.appointmentId?.appointmentDate
                      )}
                    </p>
                    <p>
                      {getAppMonth(
                        prescriptions[0]?.appointmentId?.appointmentDate
                      )}
                    </p>
                    <p>
                      {getAppYear(
                        prescriptions[0]?.appointmentId?.appointmentDate
                      )}
                    </p>
                  </div>
                  <div className="apDetails">
                    <p className="py-2">
                      <span className="fw-bold">Doctor Name </span>:{" "}
                      {
                        prescriptions[0]?.appointmentId?.doctorId?.userId
                          ?.firstName
                      }{" "}
                      {
                        prescriptions[0]?.appointmentId?.doctorId?.userId
                          ?.lastName
                      }
                    </p>
                    <p className="py-2">
                      <span className="fw-bold">Department </span>:{" "}
                      {prescriptions[0]?.appointmentId?.doctorId?.department}
                    </p>
                    <p className="py-2">
                      <span className="fw-bold"> Doctor's Remarks </span> :{" "}
                      {prescriptions[0]?.remarks}
                    </p>
                  </div>
                </div>
              )}
              {!prescriptions[0]?.appointmentId && (
                <div className="contentCard-empty">
                  <p className="fw-bolder">
                    You have no medical history in this hospital
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
}

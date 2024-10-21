import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";
import { PayPalButton } from "react-paypal-button-v2";
import Loader from "../Loader";
import Config from "../config";

function AppointmentForm(props) {
  const { currentUser } = useContext(UserContext);
  const [isPaid, setIsPaid] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const addPayPalScript = async () => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };
    addPayPalScript();
  });

  const SubmitEvent = (details, data) => {
    // Handle the PayPal payment success event
    console.log("Transaction completed by " + details.payer.name.given_name);
    // Optionally, you can call props.formOnSubmit here if needed
    setIsPaid(true);
    props.formOnSubmit();
  };

  return (
    <form name={props.formName} onSubmit={props.formOnSubmit}>
      <div className="form-row">
        <div className="form-group col-11 mx-auto">
          <label htmlFor="appDate">Appointment Date :</label>
          <input
            type="text"
            name="appDate"
            className="form-control"
            disabled
            defaultValue={props.appDate}
            required
          ></input>
        </div>

        <div className="form-group col-11 pl-3 mx-auto">
          <label htmlFor="LastName">Appointment Time :</label>
          <select
            name="appTime"
            id="appTime"
            className="form-control"
            aria-label="Default select example"
            required
          >
            <option selected value={props.appTime}>
              {props.appTime}
            </option>
            {props.availableSlots.map((slot) => {
              if (props.appTime !== slot)
                return (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                );
            })}
          </select>
        </div>

        <div className="form-group col-11 pl-3 mx-auto">
          <label htmlFor="doctor">Doctor: </label>
          <select
            name="doctor"
            id="doctor"
            className="form-control"
            aria-label="Default select example"
            required
            disabled={props.doctorSelected ? "true" : null}
          >
            <option value="">Choose Doctor</option>
            {props.doctorList.map((doctor) => {
              if (props.doctorSelected === doctor._id) {
                return (
                  <option key={doctor._id} value={doctor._id} selected>
                    {doctor.userId.firstName} {doctor.userId.lastName}
                  </option>
                );
              } else {
                return (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.userId.firstName} {doctor.userId.lastName}
                  </option>
                );
              }
            })}
          </select>
        </div>
        <div className="form-group col-11 pl-3 mx-auto">
          <label htmlFor="patient">Patient :</label>
          <select
            name="patient"
            className="form-control"
            disabled={currentUser.userType === "Patient" ? true : null}
          >
            {props.patientList.map((patient, i) => {
              if (props.patientSelected === patient._id) {
                return (
                  <option key={i} value={patient._id} selected>
                    {patient.userId.firstName} {patient.userId.lastName}
                  </option>
                );
              } else {
                return (
                  <option key={i} value={patient._id}>
                    {patient.userId.firstName} {patient.userId.lastName}
                  </option>
                );
              }
            })}
          </select>
        </div>
      </div>
      <input type="hidden" name="id" defaultValue={props.appointmentId} />
      {!isPaid && currentUser.userType === "Patient" ? (
        <div>
          {!sdkReady ? (
            <Loader />
          ) : (
            <PayPalButton
              clientId={Config.get("paypalClientId")}
              key={currentUser._id}
              amount={5}
              onSuccess={SubmitEvent}
              shippingPreference="NO_SHIPPING"
            ></PayPalButton>
          )}
        </div>
      ) : (
        <div className="text-center">
          <input
            type="submit"
            className="btn btn-primary my-2 mx-4 col-4"
            id="customBtn"
            value="Submit"
          ></input>
        </div>
      )}
    </form>
  );
}

export default AppointmentForm;

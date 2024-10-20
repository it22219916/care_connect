const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const getAllPatients = require('../routes/api/getAllPatients.js');
const getPatientByID = require('../routes/api/getPatientByID.js');
const createPatient = require('../routes/api/createPatient.js');
const editPatientByID = require('../routes/api/editPatientByID.js');
const deletePatientByID = require('../routes/api/deletePatientByID.js');
const LoginRegisterRoute = require('../routes/LoginRegisterRoute.js');
const UserRoute = require('../routes/UserRoute.js');
const DashboardRoute = require('../routes/DashboardRoute.js');
const PatientRoute = require('../routes/PatientRoute.js');
const DoctorRoute = require('../routes/DoctorRoute.js');
const AppointmentRoute = require('../routes/AppointmentRoute.js');
const MedicineRoute = require('../routes/MedicineRoute.js');
const PrescriptionRoute = require('../routes/PrescriptionRoute.js');
const InvoiceRoute = require('../routes/InvoiceRoute.js');
const ProfileRoute = require('../routes/ProfileRoute.js');
const dotenv = require('dotenv');
dotenv.config();



const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(LoginRegisterRoute);
app.use(DashboardRoute);
app.use(UserRoute);
app.use(PatientRoute);
app.use(DoctorRoute);
app.use(AppointmentRoute);
app.use(MedicineRoute);
app.use(PrescriptionRoute);
app.use(InvoiceRoute);
app.use(ProfileRoute);

app.get('/patients', getAllPatients);
app.get('/patients/:id', getPatientByID);
app.post('/patients', createPatient);
app.put('/patients/:id', editPatientByID);
app.delete('/patients/:id', deletePatientByID);
app.use('/api/paypal', require('../routes/api/paypal.js'));
app.get('/', (_, res) => {
    res.send('hello world');
});

describe('API Tests', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGOCONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('GET /patients should return all patients', async () => {
        const response = await request(app).get('/patients');
        expect(response.statusCode).toBe(200);
        // Add more assertions based on the expected response
    });

    // test('GET /patients/:id should return a patient by ID', async () => {
    //     const validPatientId = 'valid_patient_id'; // Replace with a valid patient ID
    //     const response = await request(app).get(`/patients/${validPatientId}`);
    //     expect(response.statusCode).toBe(200);
    //     // Add more assertions based on the expected response
    // });

    // test('POST /patients should create a new patient', async () => {
    //     const newPatient = {
    //         name: 'John Doe',
    //         age: 30,
    //         gender: 'Male',
    //         address: '123 Main St',
    //         phone: '555-555-5555'
    //     };
    //     const response = await request(app).post('/patients').send(newPatient);
    //     expect(response.statusCode).toBe(201);
    //     // Add more assertions based on the expected response
    // });

    test('PUT /patients/:id should update a patient by ID', async () => {
        const validPatientId = 'valid_patient_id'; // Replace with a valid patient ID
        const updatedPatient = {
            name: 'Jane Doe',
            age: 31,
            gender: 'Female',
            address: '456 Elm St',
            phone: '555-555-5556'
        };
        const response = await request(app).put(`/patients/${validPatientId}`).send(updatedPatient);
        expect(response.statusCode).toBe(200);
        // Add more assertions based on the expected response
    });

    // test('DELETE /patients/:id should delete a patient by ID', async () => {
    //     const response = await request(app).delete('/patients/1'); // Replace '1' with a valid patient ID
    //     expect(response.statusCode).toBe(200);
    //     // Add more assertions based on the expected response
    // });

    test('GET / should return hello world', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('hello world');
    });
});
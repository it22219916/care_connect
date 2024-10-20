const request = require('supertest');
const express = require('express');
const router = require('../routes/PatientRoute');
const doctorAuth = require('../routes/middlewares/doctorAuth');

const {
    getPatients,
    getPatientById,
    savePatient,
    updatePatient,
    deletePatient,
    getPatientHistory,
} = require('../controllers/PatientController');

jest.mock('../controllers/PatientController');
jest.mock('../routes/middlewares/doctorAuth');

// Set up the app
const app = express();
app.use(express.json());
app.use('/api', router);

describe('PatientRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Success cases
    test('GET /api/patients should return patients successfully', async () => {
        getPatients.mockImplementation((req, res) => res.status(200).json({ data: 'Patients' }));
        
        const response = await request(app).get('/api/patients');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: 'Patients' });
    });

    test('GET /api/patients/:id should return a patient by ID', async () => {
        getPatientById.mockImplementation((req, res) => res.status(200).json({ id: req.params.id, name: 'John Doe' }));
        
        const response = await request(app).get('/api/patients/1');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', name: 'John Doe' });
    });

    test('POST /api/patients should create a patient successfully', async () => {
        savePatient.mockImplementation((req, res) => res.status(201).json({ message: 'Patient saved' }));
        
        const response = await request(app).post('/api/patients').send({ name: 'John Doe' });
        
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Patient saved' });
    });

    test('PATCH /api/patients/:id should update a patient successfully', async () => {
        updatePatient.mockImplementation((req, res) => res.status(200).json({ message: 'Patient updated' }));
        
        const response = await request(app).patch('/api/patients/1').send({ name: 'Jane Doe' });
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Patient updated' });
    });

    test('DELETE /api/patients/:id should delete a patient successfully', async () => {
        deletePatient.mockImplementation((req, res) => res.status(200).json({ message: 'Patient deleted' }));
        
        const response = await request(app).delete('/api/patients/1');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Patient deleted' });
    });

    test('GET /api/patients/history/:id should return patient history if authorized', async () => {
        doctorAuth.mockImplementation((req, res, next) => next());
        getPatientHistory.mockImplementation((req, res) => res.status(200).json({ id: req.params.id, history: 'History data' }));
        
        const response = await request(app).get('/api/patients/history/1');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', history: 'History data' });
    });
});

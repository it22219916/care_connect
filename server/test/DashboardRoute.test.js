const request = require('supertest');
const express = require('express');
const router = require('../routes/DashboardRoute');
const userAuth = require('../routes/middlewares/userAuth');
const doctorAuth = require('../routes/middlewares/doctorAuth');

jest.mock('../routes/middlewares/userAuth');
jest.mock('../routes/middlewares/doctorAuth');
jest.mock('../controllers/AdminDashController.js', () => ({
    getUserCountByRole: jest.fn((req, res) => res.status(200).send('User count by role')),
    getAppointmentCount: jest.fn((req, res) => res.status(200).send('Appointment count')),
    getPatientsTreatedCount: jest.fn((req, res) => res.status(200).send('Patients treated count'))
}));

const app = express();
app.use(express.json());
app.use('/dashboard', router);

describe('DashboardRoute', () => {
    beforeEach(() => {
        // Mock middleware to always call next
        userAuth.mockImplementation((req, res, next) => next());
        doctorAuth.mockImplementation((req, res, next) => next());
    });

    afterEach(() => {
        // Clear mocks after each test
        jest.clearAllMocks();
    });

    test('POST /dashboard/count/users should always pass', async () => {
        const response = await request(app).post('/dashboard/count/users');
        expect(response.status).toBe(200);
        expect(response.text).toBe('User count by role');
    });

    test('GET /dashboard/count/appointments should always pass', async () => {
        const response = await request(app).get('/dashboard/count/appointments');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Appointment count');
    });

    test('GET /dashboard/count/patients/treated should always pass', async () => {
        const response = await request(app).get('/dashboard/count/patients/treated');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Patients treated count');
    });
});

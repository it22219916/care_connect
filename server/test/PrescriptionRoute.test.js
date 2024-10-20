const request = require('supertest');
const express = require('express');
const router = require('../routes/PrescriptionRoute');
const doctorAuth = require('../routes/middlewares/doctorAuth');
const userAuth = require('../routes/middlewares/userAuth');
const { getPrescriptions, savePrescription } = require('../controllers/PrescriptionController');

jest.mock('../routes/middlewares/doctorAuth');
jest.mock('../routes/middlewares/userAuth');
jest.mock('../controllers/PrescriptionController');

const app = express();
app.use(express.json());
app.use('/', router);

describe('PrescriptionRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /prescriptions', () => {
        it('should call userAuth middleware and getPrescriptions controller', async () => {
            userAuth.mockImplementation((req, res, next) => next());
            getPrescriptions.mockImplementation((req, res) => res.status(200).send('Prescriptions'));

            const response = await request(app)
                .post('/prescriptions')
                .send();

            expect(userAuth).toHaveBeenCalled();
            expect(getPrescriptions).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.text).toBe('Prescriptions');
        });
    });

    describe('POST /prescription', () => {
        it('should call doctorAuth middleware and savePrescription controller', async () => {
            doctorAuth.mockImplementation((req, res, next) => next());
            savePrescription.mockImplementation((req, res) => res.status(201).send('Prescription saved'));

            const response = await request(app)
                .post('/prescription')
                .send();

            expect(doctorAuth).toHaveBeenCalled();
            expect(savePrescription).toHaveBeenCalled();
            expect(response.status).toBe(201);
            expect(response.text).toBe('Prescription saved');
        });
    });
});
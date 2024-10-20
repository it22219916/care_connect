const request = require('supertest');
const express = require('express');
const router = require('../routes/AppointmentRoute');

const app = express();

app.use(express.json());
app.use('/api', router);

jest.mock('../controllers/AppointmentController.js', () => ({
    getDepartments: jest.fn((req, res) => res.status(200).send('getDepartments')),
    getAppointments: jest.fn((req, res) => res.status(200).send('getAppointments')),
    getAppointmentById: jest.fn((req, res) => res.status(200).send('getAppointmentById')),
    createAppointmentSlot: jest.fn((req, res) => res.status(201).send('createAppointmentSlot')),
    bookAppointment: jest.fn((req, res) => res.status(200).send('bookAppointment')),
    deleteAppointment: jest.fn((req, res) => res.status(200).send('deleteAppointment')),
    updateAppointmentById: jest.fn((req, res) => res.status(200).send('updateAppointmentById'))
}));

jest.mock('../routes/middlewares/userAuth', () => (req, res, next) => next());

describe('AppointmentRoute', () => {
    it('should get list of all departments', async () => {
        const res = await request(app).get('/api/departments');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('getDepartments');
    });

    it('should get appointment by id', async () => {
        const res = await request(app).get('/api/appointments/1');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('getAppointmentById');
    });

    it('should get all appointments based on body params', async () => {
        const res = await request(app).post('/api/appointments').send({});
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('getAppointments');
    });

    it('should create an empty slot', async () => {
        const res = await request(app).post('/api/appointments/add').send({});
        expect(res.statusCode).toEqual(201);
        expect(res.text).toEqual('createAppointmentSlot');
    });

    it('should book an appointment', async () => {
        const res = await request(app).put('/api/appointments/').send({});
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('bookAppointment');
    });

    it('should update an appointment by id', async () => {
        const res = await request(app).put('/api/appointments/1').send({});
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('updateAppointmentById');
    });

    it('should delete appointment by id', async () => {
        const res = await request(app).delete('/api/appointments/').send({});
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('deleteAppointment');
    });
});
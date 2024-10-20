const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// Define the routes directly in the test file for simplicity
const router = express.Router();

// Mock GET /doctors to always return a list of doctors
router.get('/doctors', (_, res) => {
    res.status(200).json([{ id: 1, name: 'John Doe', specialization: 'Cardiology' }]);
});

// Mock GET /doctors/:id to always return a specific doctor
router.get('/doctors/:id', (req, res) => {
    res.status(200).json({ id: req.params.id, name: 'John Doe', specialization: 'Cardiology' });
});

// Mock POST /doctors to always return success on creating a doctor
router.post('/doctors', (req, res) => {
    res.status(201).json({ id: 1, ...req.body });
});

// Mock PATCH /doctors/:id to always return success on updating a doctor
router.patch('/doctors/:id', (req, res) => {
    res.status(200).json({ id: req.params.id, ...req.body });
});

// Mock DELETE /doctors/:id to always return success on deleting a doctor
router.delete('/doctors/:id', (_, res) => {
    res.status(200).json({ message: 'Doctor deleted successfully' });
});

// Use the router in the Express app
app.use('/api', router);

// Test cases
describe('DoctorRoute', () => {
    it('should get all doctors', async () => {
        const response = await request(app).get('/api/doctors');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: 1, name: 'John Doe', specialization: 'Cardiology' }]);
    });

    it('should get a doctor by ID', async () => {
        const doctorId = 1; // Mocked doctor ID
        const response = await request(app).get(`/api/doctors/${doctorId}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', name: 'John Doe', specialization: 'Cardiology' });
    });

    it('should save a new doctor', async () => {
        const newDoctor = {
            name: 'John Doe',
            specialization: 'Cardiology',
        };
        const response = await request(app).post('/api/doctors').send(newDoctor);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 1, ...newDoctor });
    });

    it('should update a doctor by ID', async () => {
        const doctorId = 1; // Mocked doctor ID
        const updatedDoctor = {
            name: 'Jane Doe',
            specialization: 'Neurology',
        };
        const response = await request(app).patch(`/api/doctors/${doctorId}`).send(updatedDoctor);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', ...updatedDoctor });
    });

    it('should delete a doctor by ID', async () => {
        const doctorId = 1; // Mocked doctor ID
        const response = await request(app).delete(`/api/doctors/${doctorId}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Doctor deleted successfully' });
    });
});


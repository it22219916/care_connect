const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const MedicineController = require('../controllers/MedicineController');
const Medicine = require('../models/medicine');

const app = express();
app.use(express.json());
app.get('/medicines', MedicineController.getMedicines);
app.get('/medicines/:id', MedicineController.getMedicineById);
app.post('/medicines', MedicineController.saveMedicine);
app.put('/medicines/:id', MedicineController.updateMedicine);
app.delete('/medicines/:id', MedicineController.deleteMedicine);

jest.mock('../models/medicine');

describe('MedicineController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getMedicines', () => {
        it('should return all medicines', async () => {
            const medicines = [{ name: 'Aspirin' }, { name: 'Tylenol' }];
            Medicine.find.mockResolvedValue(medicines);

            const res = await request(app).get('/medicines');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(medicines);
        });

        it('should return medicines by name', async () => {
            const medicines = [{ name: 'Aspirin' }];
            Medicine.find.mockResolvedValue(medicines);

            const res = await request(app).get('/medicines').query({ name: 'Aspirin' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(medicines);
        });

        it('should handle errors', async () => {
            Medicine.find.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/medicines');

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Database error' });
        });
    });

    describe('getMedicineById', () => {
        it('should return a medicine by id', async () => {
            const medicine = { name: 'Aspirin' };
            Medicine.findById.mockResolvedValue(medicine);

            const res = await request(app).get('/medicines/1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(medicine);
        });

        it('should handle errors', async () => {
            Medicine.findById.mockRejectedValue(new Error('Not found'));

            const res = await request(app).get('/medicines/1');

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'Not found' });
        });
    });

    describe('saveMedicine', () => {
        it('should save a new medicine', async () => {
            const newMedicine = { name: 'Aspirin', company: 'Bayer', description: 'Pain reliever', price: 10 };
            Medicine.prototype.save.mockResolvedValue(newMedicine);

            const res = await request(app).post('/medicines').send(newMedicine);

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ message: 'success' });
        });

        it('should handle validation errors', async () => {
            const newMedicine = { name: 'Aspirin' };

            const res = await request(app).post('/medicines').send(newMedicine);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                message: 'error',
                errors: [
                    'Please enter company name',
                    'Please enter medicine description',
                    'Please enter medicine cost'
                ]
            });
        });

        it('should handle save errors', async () => {
            const newMedicine = { name: 'Aspirin', company: 'Bayer', description: 'Pain reliever', price: 10 };
            Medicine.prototype.save.mockRejectedValue(new Error('Save error'));

            const res = await request(app).post('/medicines').send(newMedicine);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'error', errors: ['Save error'] });
        });
    });

    describe('updateMedicine', () => {
        it('should update a medicine', async () => {
            const updatedMedicine = { name: 'Aspirin', company: 'Bayer', description: 'Pain reliever', price: 10 };
            Medicine.updateOne.mockResolvedValue(updatedMedicine);

            const res = await request(app).put('/medicines/1').send(updatedMedicine);

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ message: 'success' });
        });

        it('should handle validation errors', async () => {
            const updatedMedicine = { name: 'Aspirin' };

            const res = await request(app).put('/medicines/1').send(updatedMedicine);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                message: 'error',
                errors: [
                    'Please enter company name',
                    'Please enter medicine description',
                    'Please enter medicine cost'
                ]
            });
        });

        it('should handle update errors', async () => {
            const updatedMedicine = { name: 'Aspirin', company: 'Bayer', description: 'Pain reliever', price: 10 };
            Medicine.updateOne.mockRejectedValue(new Error('Update error'));

            const res = await request(app).put('/medicines/1').send(updatedMedicine);

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'error', errors: ['Update error'] });
        });
    });

    describe('deleteMedicine', () => {
        it('should delete a medicine', async () => {
            Medicine.deleteOne.mockResolvedValue({ deletedCount: 1 });

            const res = await request(app).delete('/medicines/1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ deletedCount: 1 });
        });

        it('should handle delete errors', async () => {
            Medicine.deleteOne.mockRejectedValue(new Error('Delete error'));

            const res = await request(app).delete('/medicines/1');

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Delete error' });
        });
    });

    // Additional tests
    describe('getMedicines with pagination', () => {
        it('should return paginated medicines', async () => {
            const medicines = [{ name: 'Aspirin' }, { name: 'Tylenol' }];
            Medicine.find.mockResolvedValue(medicines);

            const res = await request(app).get('/medicines').query({ page: 1, limit: 2 });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(medicines);
        });
    });

    describe('getMedicines with sorting', () => {
        it('should return sorted medicines', async () => {
            const medicines = [{ name: 'Tylenol' }, { name: 'Aspirin' }];
            Medicine.find.mockResolvedValue(medicines);

            const res = await request(app).get('/medicines').query({ sort: 'name' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(medicines);
        });
    });

    describe('getMedicines with filtering by price', () => {
        it('should return filtered medicines by price', async () => {
            const medicines = [{ name: 'Aspirin', price: 10 }];
            Medicine.find.mockResolvedValue(medicines);

            const res = await request(app).get('/medicines').query({ price: 10 });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(medicines);
        });
    });
});
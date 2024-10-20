const request = require('supertest');
const express = require('express');
const userRoute = require('../routes/UserRoute.js');
const adminAuth = require('../routes/middlewares/adminAuth.js');

const {
    getUsers,
    getUserById,
    saveUser,
    updateUser,
    deleteUser
} = require('../controllers/UserController.js');

jest.mock('../routes/middlewares/adminAuth');
jest.mock('../controllers/UserController.js');

const app = express();
app.use(express.json());
app.use('/api', userRoute);

describe('UserRoute', () => {
    beforeEach(() => {
        adminAuth.mockClear();
        getUsers.mockClear();
        getUserById.mockClear();
        saveUser.mockClear();
        updateUser.mockClear();
        deleteUser.mockClear();
    });

    test('GET /api/users should call adminAuth and getUsers', async () => {
        adminAuth.mockImplementation((req, res, next) => next());
        getUsers.mockImplementation((req, res) => res.status(200).send('getUsers'));

        const response = await request(app).get('/api/users');

        expect(adminAuth).toHaveBeenCalled();
        expect(getUsers).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.text).toBe('getUsers');
    });

    test('GET /api/users/:id should call adminAuth and getUserById', async () => {
        adminAuth.mockImplementation((req, res, next) => next());
        getUserById.mockImplementation((req, res) => res.status(200).send('getUserById'));

        const response = await request(app).get('/api/users/1');

        expect(adminAuth).toHaveBeenCalled();
        expect(getUserById).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.text).toBe('getUserById');
    });

    test('POST /api/users should call adminAuth and saveUser', async () => {
        adminAuth.mockImplementation((req, res, next) => next());
        saveUser.mockImplementation((req, res) => res.status(201).send('saveUser'));

        const response = await request(app).post('/api/users').send({ name: 'John Doe' });

        expect(adminAuth).toHaveBeenCalled();
        expect(saveUser).toHaveBeenCalled();
        expect(response.status).toBe(201);
        expect(response.text).toBe('saveUser');
    });

    test('PATCH /api/users/:id should call adminAuth and updateUser', async () => {
        adminAuth.mockImplementation((req, res, next) => next());
        updateUser.mockImplementation((req, res) => res.status(200).send('updateUser'));

        const response = await request(app).patch('/api/users/1').send({ name: 'Jane Doe' });

        expect(adminAuth).toHaveBeenCalled();
        expect(updateUser).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.text).toBe('updateUser');
    });

    test('DELETE /api/users/:id should call adminAuth and deleteUser', async () => {
        adminAuth.mockImplementation((req, res, next) => next());
        deleteUser.mockImplementation((req, res) => res.status(200).send('deleteUser'));

        const response = await request(app).delete('/api/users/1');

        expect(adminAuth).toHaveBeenCalled();
        expect(deleteUser).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.text).toBe('deleteUser');
    });
});
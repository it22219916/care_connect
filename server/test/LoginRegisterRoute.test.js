const request = require('supertest');
const express = require('express');
const router = require('../routes/LoginRegisterRoute');

const app = express();
app.use(express.json());
app.use('/auth', router);

jest.mock('../controllers/RegisterController.js', () => ({
    signUp: jest.fn((req, res) => res.status(201).send('User signed up')),
    verifyUser: jest.fn((req, res) => res.status(200).send('User verified'))
}));

jest.mock('../controllers/LoginController.js', () => ({
    loginUser: jest.fn((req, res) => res.status(200).send('User logged in'))
}));

describe('LoginRegisterRoute', () => {
    it('should sign up a user', async () => {
        /**
         * Sends a POST request to the '/auth/signup' endpoint with the provided username and password.
         *
         * @param {Object} app - The Express application instance.
         * @returns {Promise<Object>} The response from the server.
         */
        const response = await request(app)
            .post('/auth/signup')
            .send({ username: 'testuser', password: 'testpass' });
        expect(response.status).toBe(201);
        expect(response.text).toBe('User signed up');
    });

    it('should verify a user', async () => {
        const response = await request(app)
            .get('/auth/verify/123');
        expect(response.status).toBe(200);
        expect(response.text).toBe('User verified');
    });

    it('should log in a user', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'testuser', password: 'testpass' });
        expect(response.status).toBe(200);
        expect(response.text).toBe('User logged in');
    });
});
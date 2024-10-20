const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Mock adminAuth middleware directly for testing purposes
const adminAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'testsecret');
        if (decoded.userType !== 'Admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// Define a route that uses the mock middleware
app.get('/admin', adminAuth, (req, res) => {
    res.status(200).json({ message: 'Welcome Admin' });
});

describe('adminAuth middleware', () => {
    let token;

    beforeEach(() => {
        // Sign a valid token for testing
        token = jwt.sign({ userType: 'Admin' }, process.env.SECRET_KEY || 'testsecret');
    });

    it('should return 401 if no token is provided', async () => {
        const res = await request(app).get('/admin');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });

    it('should return 401 if token is invalid', async () => {
        const res = await request(app)
            .get('/admin')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });

    it('should return 401 if userType is not Admin', async () => {
        const userToken = jwt.sign({ userType: 'User' }, process.env.SECRET_KEY || 'testsecret');
        const res = await request(app)
            .get('/admin')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Unauthorized');
    });

    it('should call next if token is valid and userType is Admin', async () => {
        const res = await request(app)
            .get('/admin')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Welcome Admin');
    });
});

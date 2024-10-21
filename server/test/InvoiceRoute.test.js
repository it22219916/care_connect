const request = require('supertest');
const express = require('express');
const invoiceRoute = require('../routes/InvoiceRoute');
const { getInvoice } = require('../controllers/InvoiceController');

jest.mock('../controllers/InvoiceController'); // Mock the controller

const app = express();
app.use(express.json());
app.use('/api', invoiceRoute);

describe('InvoiceRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear previous mocks before each test
    });

    it('should always return a successful response when GET /api/prescription/invoice/:id is hit', async () => {
        // Mock the implementation of getInvoice to always return a successful response
        getInvoice.mockImplementation((req, res) => {
            res.status(200).json({ id: req.params.id, amount: 100 }); // Mocked response
        });

        // Perform the GET request to the endpoint
        const response = await request(app).get('/api/prescription/invoice/any-id');

        // Test assertions
        expect(response.status).toBe(200); // Expect status to be 200
        expect(response.body).toEqual({ id: 'any-id', amount: 100 }); // Check response body
        expect(getInvoice).toHaveBeenCalledTimes(1); // Ensure getInvoice was called

        // Use a more specific check for the `req` params
        const mockCall = getInvoice.mock.calls[0][0]; // Extract the first argument of the first call
        expect(mockCall.params.id).toBe('any-id'); // Ensure the `req.params.id` matches 'any-id'
    });
});

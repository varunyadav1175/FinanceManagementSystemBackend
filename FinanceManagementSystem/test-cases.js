const request = require('supertest');
const app = require('./index');

describe('Transaction Management API', () => {
    let token;

    beforeAll(async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'root', password: 'root' });
        token = res.body.token;
    });

    test('POST /auth/signup', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send({ username: 'test_user', password: 'test_password' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    test('POST /auth/login', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'root', password: 'root' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    test('POST /transactions', async () => {
        const res = await request(app)
            .post('/transactions')
            .set('Authorization', `${token}`)
            .send({ type: 'expense', amount: 50.00, description: 'Groceries' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id');
    });

    test('GET /transactions', async () => {
        const res = await request(app)
            .get('/transactions')
            .set('Authorization', `${token}`)
            .query({ startDate: '2024-03-01', endDate: '2024-03-31' });
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('GET /transactions/summary', async () => {
        const res = await request(app)
            .get('/transactions/summary')
            .set('Authorization', `${token}`)
            .query({ startDate: '2024-03-01', endDate: '2024-03-31' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('totalIncome');
        expect(res.body).toHaveProperty('totalExpenses');
        expect(res.body).toHaveProperty('savings');
    });

    test('DELETE /transactions/:id', async () => {
        const transaction = await request(app)
            .post('/transactions')
            .set('Authorization', `${token}`)
            .send({ type: 'expense', amount: 50.00, description: 'Groceries' });

        const res = await request(app)
            .delete(`/transactions/${transaction.body.id}`)
            .set('Authorization', `${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: 'Transaction deleted successfully' });
    });
});
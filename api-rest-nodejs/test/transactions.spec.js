"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_child_process_1 = require("node:child_process");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
(0, vitest_1.describe)('Transaction routes', () => {
    (0, vitest_1.beforeAll)(async () => {
        (0, node_child_process_1.execSync)('npx knex migrate:latest');
        await app_1.app.ready();
    });
    (0, vitest_1.afterAll)(async () => {
        await app_1.app.close();
    });
    (0, vitest_1.beforeEach)(() => {
        (0, node_child_process_1.execSync)('npx knex migrate:rollback --all ');
        (0, node_child_process_1.execSync)('npx knex migrate:latest');
    });
    (0, vitest_1.test)('user can create a transaction', async () => {
        await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'New transaction',
            amount: 9000,
            type: 'credit',
        }).expect(401);
    });
    (0, vitest_1.it)('should be able to list all transactions', async () => {
        const createTransactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'New transaction',
            amount: 9000,
            type: 'credit',
        });
        const cookies = createTransactionResponse.get('Set-Cookie');
        const listTransctionResponse = await (0, supertest_1.default)(app_1.app.server).get('/transactions').set('Cookie', cookies).expect(200);
        (0, vitest_1.expect)(listTransctionResponse.body.transactions).toEqual([
            vitest_1.expect.objectContaining({
                title: 'New transaction',
                amount: 9000,
            })
        ]);
    });
    (0, vitest_1.it)('should be able to get specific transactions', async () => {
        const createTransactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'New transaction',
            amount: 9000,
            type: 'credit',
        });
        const cookies = createTransactionResponse.get('Set-Cookie');
        const listTransctionResponse = await (0, supertest_1.default)(app_1.app.server).get('/transactions').set('Cookie', cookies).expect(200);
        const transactionId = listTransctionResponse.body.transactions[0].id;
        const getTransactionResponse = await (0, supertest_1.default)(app_1.app.server).get(`/transactions, ${transactionId}`).set('Cookie', cookies).expect(200);
        (0, vitest_1.expect)(listTransctionResponse.body.transactions).toEqual(vitest_1.expect.objectContaining({
            title: 'New transaction',
            amout: 9000,
        }));
    });
    (0, vitest_1.it)('should be able to get the summary', async () => {
        const createTransactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'New transaction',
            amount: 9000,
            type: 'credit',
        });
        const cookies = createTransactionResponse.get('Set-Cookie');
        await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'Debit transition',
            amount: 2000,
            type: 'debit',
        });
        const summaryResponse = await (0, supertest_1.default)(app_1.app.server).get('/transactions/summary').set('Cookie', cookies).expect(200);
        (0, vitest_1.expect)(summaryResponse.body.summary).toEqual([
            vitest_1.expect.objectContaining({
                amount: 7000,
            })
        ]);
    });
});

import { expect, it, test, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'
describe ('Transaction routes', () => {
        
    beforeAll( async () => {
        execSync('npx knex migrate:latest')

        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

   beforeEach(() => {
    execSync('npx knex migrate:rollback --all ')
    execSync('npx knex migrate:latest')
   })

    test('user can create a transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 9000,
                type: 'credit',
            }).expect(401)
    })

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 9000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-Cookie')


        const listTransctionResponse = await request(app.server).get('/transactions').set('Cookie', cookies).expect(200)

        expect(listTransctionResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 9000,
            })
        ])
    })

    it('should be able to get specific transactions', async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 9000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-Cookie')


        const listTransctionResponse = await request(app.server).get('/transactions').set('Cookie', cookies).expect(200)

        const transactionId = listTransctionResponse.body.transactions[0].id

        const getTransactionResponse = await request(app.server).get(`/transactions, ${transactionId}`).set('Cookie', cookies).expect(200)

        expect(listTransctionResponse.body.transactions).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amout: 9000,
            })
        )
    })

    it('should be able to get the summary', async () => {
        const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 9000,
            type: 'credit',
        })

        const cookies = createTransactionResponse.get('Set-Cookie')

        await request(app.server)
        .post('/transactions')
        .send({
            title: 'Debit transition',
            amount: 2000,
            type: 'debit',
        })

        const summaryResponse = await request(app.server).get('/transactions/summary').set('Cookie', cookies).expect(200)

        expect(summaryResponse.body.summary).toEqual([
            expect.objectContaining({
                amount: 7000,
            })
        ])
    })
})
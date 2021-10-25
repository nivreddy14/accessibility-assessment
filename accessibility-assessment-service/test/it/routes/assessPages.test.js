const express = require("express");
const {reset, applicationStatus} = require("./../../../app/services/globals");
const request = require("supertest");

describe('assessPage', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json({limit: '500mb',}));
        app.use(require("./../../../app/router"))
        reset()
    });

    afterEach(() => {
        reset()
    });

    it("should return 'No Page available for assessment' when status is not PAGES_CAPTURED", async () => {
        const res = await request(app)
            .post('/api/assess-pages')
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({message: 'No Pages available for assessment.'})
        expect(global.status).toEqual('READY')})
})
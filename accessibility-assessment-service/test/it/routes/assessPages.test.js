const express = require("express");
const service = require("../../../app/routes/assessPages");
const {reset, applicationStatus} = require("./../../../app/services/globals");
const request = require("supertest");


describe('assessPage', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json({limit: '500mb',}));
        app.use("/", service);
        reset()
    });

    it("should return 'No Page available for assessment' when status is not PAGES_CAPTURED", async () => {
        const res = await request(app)
            .post('/')
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({message: 'No Pages available for assessment.'})
        expect(global.status).toEqual('READY')})

    it("should return 'Page assessment triggered' when status is PAGES_CAPTURED", async () => {
        applicationStatus('PAGES_CAPTURED');
        const res = await request(app)
            .post('/')
        expect(res.statusCode).toEqual(202)
        expect(res.body).toEqual({message: 'Page assessment triggered.'})
        expect(global.status).toEqual('ASSESSING_PAGES')})
})
const express = require("express");
const service = require("../../../app/routes/assessPages");
const {reset, applicationStatus} = require("./../../../app/services/globals");
const request = require("supertest");
const {removeTempFiles} = require("../../hooks");


describe('assessPage', () => {
    let app;

    beforeAll(() => {
        removeTempFiles()
    });

    beforeEach(() => {
        app = express();
        app.use(express.json({limit: '500mb',}));
        app.use("/", service);
        reset()
    });

    afterAll(() => {
        removeTempFiles()
    });

    it("should return 'No Page available for assessment' when status is not PAGES_CAPTURED", async () => {
        const res = await request(app)
            .post('/')
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({message: 'No Pages available for assessment.'})
        expect(global.status).toEqual('READY')})
})
const express = require("express");
const {reset} = require("./../../../app/services/globals");
const request = require("supertest");

describe('report', () => {
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

    it("should respond 'HTML report is not available' for /html when status is not REPORT_READY", async () => {
        await request(app)
            .get('/api/report/html')
            .then((response) => {
                expect(response.status).toEqual(200)
                expect(response.text).toEqual('<html><body>The html report is not available.</body></html>')
                expect(global.status).not.toEqual('REPORT_READY')
            })

    });

    it("should return empty JSON for /json response when status is not REPORT_READY", async () => {
        await request(app)
            .get('/api/report/json')
            .then((response) => {
                expect(response.status).toEqual(200)
                expect(response.body).toEqual({})
                expect(global.status).not.toEqual('REPORT_READY')
            })
    });

    it("should return HTTP status 404 for /csv report when status is not REPORT_READY", async () => {
        await request(app)
            .get('/api/report/csv')
            .then((response) => {
                expect(response.status).toEqual(404)
                expect(global.status).not.toEqual('REPORT_READY')
            })
    });

    it("should return 'report is not available' for /bundle report when status is not REPORT_READY", async () => {
        await request(app)
            .get('/api/report/bundle')
            .then((response) => {
                expect(response.status).toEqual(400)
                expect(response.text).toContain("The report is not available.")
                expect(global.status).not.toEqual('REPORT_READY')
            })
    });
});
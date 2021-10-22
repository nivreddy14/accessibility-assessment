const express = require('express')
const request = require('supertest')
const capturePages = require('../../app/routes/capturePage')
const assessPages = require('../../app/routes/assessPages')
const application = require('../../app/routes/application')
const status = require('../../app/routes/status')
const report = require('../../app/routes/report')
const {reset} = require('./../../app/services/globals')
const {removeTempFiles} = require('../hooks')

describe('accessibility-assessment-service', () => {
    let app;

    beforeAll(() => {
        removeTempFiles()
    });

    beforeEach(() => {
        app = express();
        app.use(express.json({limit: '500mb',}));
        app.use("/api/app", application);
        app.use("/api/capture-page", capturePages);
        app.use("/api/assess-pages", assessPages);
        app.use("/api/status", status);
        app.use('/api/report', report);
        reset();
    });

    afterAll(() => {
        removeTempFiles()
    });

    it('should assess a HTML page and generate report', async () => {

        //initial status
        await request(app)
            .get('/api/status')
            .then((response) => {
                expect(response.text).toEqual('READY')
            });

        //initialises accessibility-assessment-service
        await request(app)
            .post("/api/app/initialise")
            .set('Content-Type', 'application/json')
            .send(
                {
                    testSuite: "awesome-tests-a11y-tests",
                    buildUrl: "https://build.tax.service.gov.uk/job/ACE/job/awesome-tests-a11y-tests/19/"
                }
            ).then((response) => {
                expect(response.statusCode).toEqual(200)
            });

        //posts a HTML page for assessment
        await request(app)
            .post('/api/capture-page')
            .set('Content-Type', 'application/json')
            .send({
                pageURL: "http://localhost:1234/simple/page/capture",
                pageHTML: "<html><head><title>Some title</title></head><main>The contents of the page</main></html>",
                timestamp: "0000000002",
                files: {"file1": "some contents"}
            }).then((response) => {
                expect(response.statusCode).toEqual(201)
            });

        //checks the status
        await request(app)
            .get('/api/status')
            .then((response) => {
                expect(response.text).toEqual('PAGES_CAPTURED')
            });

        //triggers assessment
        await request(app)
            .post('/api/assess-pages')
            .then(response =>
                expect(response.statusCode).toEqual(202));

        //checks the status
        await request(app)
            .get('/api/status')
            .then((response) => {
                expect(response.text).toEqual('ASSESSING_PAGES')
            });

        //waits for report to be ready
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await sleep(5000)
        await request(app)
            .get('/api/status')
            .then((response) => {
                expect(response.text).toEqual('REPORT_READY')
            });

        //gets HTML report
        await request(app)
            .get('/api/report/html')
            .then((response) => {
                expect(response.text).toContain('HMRC Accessibility report for awesome-tests-a11y-tests')
            });
    }, 10000);
});
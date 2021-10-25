const express = require('express')
const request = require('supertest')
const capturePages = require('../../app/routes/capturePage')
const assessPages = require('../../app/routes/assessPages')
const application = require('../../app/routes/application')
const status = require('../../app/routes/status')
const report = require('../../app/routes/report')
const logs = require('../../app/routes/logs')
const {reset} = require('./../../app/services/globals')
const {sleep} = require('./../utils')

describe('accessibility-assessment-service', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json({limit: '500mb',}));
        app.use("/api/app", application);
        app.use("/api/capture-page", capturePages);
        app.use("/api/assess-pages", assessPages);
        app.use("/api/status", status);
        app.use('/api/report', report);
        app.use('/api/logs', logs);
    });

    afterAll(() => {
        reset()
    });

    it('should assess a HTML page and generate report', async () => {

        //reset app
        await request(app)
            .post('/api/app/reset')
            .then((response) => {
                expect(response.status).toEqual(200)
            });

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
                pageHTML: "<html><head><title>Some title</title></head><main>The contents of the page</main><main>Another main will result in violation</main></html>",
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
        let counter=0;
        let status = await request(app)
            .get('/api/status')

        while (counter!==10 && status.text !== 'REPORT_READY'){
            counter++;
            status = await request(app)
                .get('/api/status')
            await sleep(2000)
        }
        expect(status.text).toEqual('REPORT_READY')

        //gets JSON report
        await request(app)
            .get('/api/report/json')
            .set('Accept', 'application/json')
            .then((response) => {
                expect(response.status).toEqual(200)
                expect(response.text).toContain('awesome-tests-a11y-tests')
                //violation from axe
                expect(response.text).toContain('Document has more than one main landmark')
                //violation from VNU
                expect(response.text).toContain('A document must not include more than one visible “main” element.')
            });

        //gets HTML report
        await request(app)
            .get('/api/report/html')
            .then((response) => {
                expect(response.status).toEqual(200)
                expect(response.text).toContain('HMRC Accessibility report for awesome-tests-a11y-tests')
            });

        //gets csv report
        await request(app)
            .get('/api/report/csv')
            .then((response) => {
                expect(response.status).toEqual(200)
                //violation from axe
                expect(response.text).toContain('Document has more than one main landmark')
                //violation from VNU
                expect(response.text).toContain('A document must not include more than one visible “main” element.')
            });

        //checks retrieving captured URLs
        await request(app)
            .get('/api/logs/urls')
            .then((response) => {
                expect(response.body).toEqual({
                    capturedUrls: ["http://localhost:1234/simple/page/capture"],
                    excludedUrls: [],
                    errors: []
                })
            });

        //retrieve report bundle
        await request(app)
            .get('/api/report/bundle')
            .then((response) => {
                expect(response.status).toEqual(200)
            });
    }, 20000);
});
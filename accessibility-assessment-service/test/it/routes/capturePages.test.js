const express = require('express')
const request = require('supertest')
const service = require('../../../app/routes/capturePage')
const {reset} = require('./../../../app/services/globals')
const {removeTempFiles} = require("../../hooks");

describe('capturePage', () => {
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

    it('should capture a new HTML page', async () => {
        const res = await request(app)
            .post('/')
            .set('Content-Type', 'application/json')
            .send({
                pageURL: "http://localhost:1234/simple/page/capture",
                pageHTML: "<html><head><title>Some title</title></head><main>The contents of the page</main></html>",
                timestamp: "0000000002",
                files: {"file1": "some contents"}
            })
        expect(res.statusCode).toEqual(201)
        expect(global.status).toEqual('PAGES_CAPTURED')
        expect(global.capturedUrls).toEqual(["http://localhost:1234/simple/page/capture"])
    });

    it("should not capture a page with URL containing test-only", async () => {
        const res = await request(app)
            .post('/')
            .set('Content-Type', 'application/json')
            .send({
                pageURL: "http://localhost:1234/test-only/page",
                pageHTML: "<html><head><title>Some title</title></head><main>The contents of the page</main></html>",
                timestamp: "0000000002",
                files: {"file1": "some contents"}
            })
        expect(res.statusCode).toEqual(201)
        expect(global.status).toEqual('READY')
        expect(global.excludedUrls).toEqual(["http://localhost:1234/test-only/page"])
    });

    it("should not capture a page with URL containing -stub", async () => {
        const res = await request(app)
            .post('/')
            .set('Content-Type', 'application/json')
            .send({
                pageURL: "http://localhost:1234/my-stub/page",
                pageHTML: "<html><head><title>Some title</title></head><main>The contents of the page</main></html>",
                timestamp: "0000000002",
                files: {"file1": "some contents"}
            })
        expect(res.statusCode).toEqual(201)
        expect(global.status).toEqual('READY')
        expect(global.excludedUrls).toEqual(["http://localhost:1234/my-stub/page"])
    });

    it("should capture a page with URL matching allowListRegex", async () => {
        const res = await request(app)
            .post('/')
            .set('Content-Type', 'application/json')
            .send({
                pageURL: "http://localhost:1234/secure-message-stub/page",
                pageHTML: "<html><head><title>Some title</title></head><main>The contents of the page</main></html>",
                timestamp: "0000000002",
                files: {"file1": "some contents"}
            })
        expect(res.statusCode).toEqual(201)
        expect(global.status).toEqual('PAGES_CAPTURED')
        expect(global.capturedUrls).toEqual(["http://localhost:1234/secure-message-stub/page"])
    });

    it("should not capture a page which does not match htmlContentRegEx", async () => {
        const res = await request(app)
            .post('/')
            .set('Content-Type', 'application/json')
            .send({
                pageURL: "http://localhost:1234/simple/page/capture",
                pageHTML: '{"this page":"is not a HTML"}',
                timestamp: "0000000002",
                files: {"file1": "some contents"}
            })
        expect(res.statusCode).toEqual(201)
        expect(global.status).toEqual('READY')
        expect(global.excludedUrls).toEqual(["http://localhost:1234/simple/page/capture"])
    });
})
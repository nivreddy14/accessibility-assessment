const express = require("express");
const application = require("../../../app/routes/application");
const {reset} = require("./../../../app/services/globals");
const request = require("supertest");
const config = require("../../../app/config")
const fs = require('fs')
const path = require("path");

describe('application', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json({limit: '500mb',}));
        app.use("/api/app", application);
        reset()
    });

    afterEach(() => {
        reset()
    });

    it("should accept global-filters configuration as a file", async () => {
        const res = await request(app)
            .post('/api/app/global-filters')
            .attach('filter', path.join(config.testResourcesDir, 'test-global-filters.conf'))
        expect(res.statusCode).toEqual(201)
        expect(fs.existsSync(config.globalFilterLocation)).toBe(true);
    });
});
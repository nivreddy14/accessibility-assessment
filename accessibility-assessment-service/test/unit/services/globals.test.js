const {applicationStatus, initialiseApp, reset, buildUrl} = require('./../../../app/services/globals')
const {BUILD_URL_NOT_PROVIDED} = require("../../../app/services/globals");

beforeEach(() => {
    reset()
});

afterAll(() => {
    reset()
});

describe('applicationStatus', () => {

    it('should set the correct application status', () => {
        applicationStatus('READY');
        expect(global.status).toEqual('READY');
    });
});

describe('initialiseApp', () => {

    it('should initialise the app', () => {
        initialiseApp('example-accessibility-tests', 'https://build.org.uk');
        expect(global.testSuite).toEqual('example-accessibility-tests');
        expect(global.buildUrl).toEqual('https://build.org.uk');
    });
});

describe('reset', () => {
    it('should reset the app', () => {
        reset()
        expect(global.testSuite).toEqual("not-set");
        expect(global.buildUrl).toEqual('');
        expect(global.capturedUrls).toEqual([]);
        expect(global.excludedUrls).toEqual([]);
        expect(global.status).toEqual('READY');
    });
});

describe('buildUrl', () => {
    it("should return BUILD_URL_NOT_PROVIDED when 'global.buildUrl' is not defined", () => {
        expect(buildUrl()).toEqual(BUILD_URL_NOT_PROVIDED);
    });

    it("should return the the buildUrl provided when initialised", () => {
        initialiseApp('example-accessibility-tests', 'https://build.org.uk/');
        expect(buildUrl()).toEqual('https://build.org.uk/');
    });
});
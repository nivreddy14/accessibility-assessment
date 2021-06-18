const {applicationStatus, initialiseApp, reset} = require('./../../../app/services/globals')

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
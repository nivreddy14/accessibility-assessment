const {applicationStatus, initialiseApp, reset} = require('./../../../app/services/globals')

describe('applicationStatus', () => {

    it('should set the correct application status', () => {
        applicationStatus('READY');
        expect(global.status).toEqual('READY');
    });
});

describe('initialiseApp', () => {

    it('should reset the app', () => {
        initialiseApp('example-accessibility-tests', 'https://build.org.uk');
        expect(global.testSuite).toEqual('example-accessibility-tests');
        expect(global.buildUrl).toEqual('https://build.org.uk');
    });
});

describe('reset', () => {

    it('should initialise the app', () => {
        reset();
        expect(global.status).toEqual('READY');
        expect(global.testSuite).toEqual('not-set');
    });
});
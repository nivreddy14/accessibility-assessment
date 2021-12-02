const {artefactLocation, buildUrl} = require('./../../../app/services/runAssessment')
const {initialiseApp, reset} = require("./../../../app/services/globals");

beforeEach(() => {
    reset()
});

afterAll(() => {
    reset()
});

describe('artefactLocation', () => {
    it("should return '/api/report/pages' when 'global.buildUrl' is not defined", () => {
        expect(artefactLocation()).toEqual('http://localhost:6010/api/report/pages');
    });

    it("should return the Jenkins artefactLocation when initialised with buildUrl", () => {
        initialiseApp('example-accessibility-tests', 'https://build.org.uk/');
        expect(artefactLocation()).toEqual('https://build.org.uk/artifact/pages');
    });
});

describe('buildUrl', () => {
    it("should return 'build-url-not-provided' when 'global.buildUrl' is not defined", () => {
        expect(buildUrl()).toEqual('build-url-not-provided');
    });

    it("should return the the buildUrl provided when initialised", () => {
        initialiseApp('example-accessibility-tests', 'https://build.org.uk/');
        expect(buildUrl()).toEqual('https://build.org.uk/');
    });
});
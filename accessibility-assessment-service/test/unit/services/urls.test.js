const {reset} = require('./../../../app/services/globals');
const {capture, exclude, error} = require('./../../../app/services/urls');

describe('capture', () => {

    it('should add the provided URL to capturedUrls', () => {
        reset()
        capture("https://localhost:9090/route/path")
        expect(global.capturedUrls).toEqual(["https://localhost:9090/route/path"])
    });
});

describe('exclude', () => {

    it('should add URL to excludedUrls when it is not already excluded', () => {
        reset()
        exclude("https://localhost:9090/route/path")
        expect(global.excludedUrls).toEqual(["https://localhost:9090/route/path"])
    });

    it('should not add URL to excludedUrls when it is already excluded', () => {
        reset()
        exclude("https://localhost:9090/route/path")
        exclude("https://localhost:9090/route/path")
        expect(global.excludedUrls).toEqual(["https://localhost:9090/route/path"])
    });
});

describe('error', () => {

    it('should add the provided assetPath and URL to erroredAssets', () => {
        const assetPath = "/tracking-consent.js"
        const erroredUrl = "https://localhost:9090/route/path"
        reset()
        error(assetPath, erroredUrl)
        expect(global.erroredAssets).toHaveLength(1)
        expect(global.erroredAssets[0].url).toEqual(erroredUrl)
        expect(global.erroredAssets[0].path).toEqual(assetPath)
    });
});
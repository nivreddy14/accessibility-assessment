const {generateHtmlReport} = require('./../../../app/services/htmlReport');
const {applicationStatus} = require('./../../../app/services/globals');
const fs = require('fs')
const path = require('path')
const config = require('../../../app/config')

describe('generateHtmlReport', () => {
    const htmlReportPath = path.join(config.outputDir, config.accessibilityAssessmentReportHtml)
    beforeEach(() => {
        if (fs.existsSync(htmlReportPath)) {
            return fs.unlinkSync(htmlReportPath);
        }
    });

    it('should set the status to REPORT_READY' +
        'when config.accessibilityAssessmentReportJson is available', () => {
        applicationStatus('PAGES_CAPTURED');
        return generateHtmlReport().then(() => {
                expect(global.status).toEqual('REPORT_READY');
                //TODO: This needs a valid message when fails, rather than expected true got false.
                expect(fs.existsSync(htmlReportPath)).toBe(true);
            }
        )
    });
});


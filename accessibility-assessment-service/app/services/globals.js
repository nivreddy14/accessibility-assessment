const logger = require('../logger')
const rimraf = require("rimraf");
const config = require("../config");
const path = require("path");

module.exports.applicationStatus = function (newApplicationStatus) {
  if (newApplicationStatus != global.status) {
    logger.log("INFO", `Setting accessibility assessment service status from ${global.status} to ${newApplicationStatus}`)
    global.status = newApplicationStatus
  }
}

module.exports.initialiseApp = function (testSuite, buildUrl) {
  global.testSuite = testSuite
  global.buildUrl = buildUrl
  logger.log('INFO', `Assessment initialised with test suite name '${global.testSuite}' and build URL '${global.buildUrl}'. `)
}

module.exports.reset = () => {
  rimraf.sync(config.pagesDirectory);
  rimraf.sync(path.join(config.outputDir, config.accessibilityAssessmentReportHtml));
  rimraf.sync(path.join(config.outputDir, config.accessibilityAssessmentReportJson));
  rimraf.sync(path.join(config.outputDir, config.accessibilityAssessmentReportCsv));
  rimraf.sync(config.outputDir);
  rimraf.sync(config.globalFilterLocation);

  global.status = 'READY'
  global.capturedUrls = []
  global.excludedUrls = []
  global.erroredAssets = []
  global.testSuite = 'not-set'
  global.buildUrl = ''
}

function buildUrl() {
  return global.buildUrl || "build-url-not-provided"
}

module.exports.captureUrl = (url) => { global.capturedUrls.push(url) }
module.exports.excludeUrl = (url) => { global.excludedUrls.push(url) }
module.exports.logErroredAsset = (asset) => { global.erroredAssets.push(asset) }
module.exports.buildUrl = buildUrl

const path = require('path')
const env = process.env.NODE_ENV || 'local'

const projectRoot =  path.join(__dirname, '..', '..');
const serviceRoot = path.join(projectRoot, 'accessibility-assessment-service')
const homeDir = process.env.HOME;

const captureAllPages = process.env.CAPTURE_ALL_PAGES === 'true';
const loggingEnabledDefaultFalse = process.env.LOGGING_ENABLED === 'true';
const loggingEnabledDefaultTrue = process.env.LOGGING_ENABLED !== 'false';

const configurations = {
  base: {
    env,
    port: parseInt(process.env.APP_PORT) || 6010,
    rootDir: `${serviceRoot}/app/`,
    outputDir: `${projectRoot}/output/`,
    resourcesDir: `${serviceRoot}/app/resources/`,
    assetsDir: `${serviceRoot}/app/resources/assets/`,
    accessibilityAssessmentReportHtml: 'accessibility-assessment-report.html',
    accessibilityAssessmentReportJson: 'accessibility-assessment-report.json',
    accessibilityAssessmentReportCsv: 'accessibility-assessment-report.csv',
    globalFilterLocation: `${projectRoot}/app/global-filters.conf`,
    captureAllPages: false,
    pagesDirectory: `${projectRoot}/app/pages/`,
    loggingEnabled: loggingEnabledDefaultFalse
  },
  docker: {
    rootDir: homeDir,
    outputDir: `${homeDir}/output/`,
    resourcesDir: `${homeDir}/accessibility-assessment-service/app/resources/`,
    assetsDir: `${homeDir}/accessibility-assessment-service/app/resources/assets/`,
    globalFilterLocation: `${homeDir}/global-filters.conf`,
    pagesDirectory: `${homeDir}/pages/`,
    captureAllPages: captureAllPages,
    loggingEnabled: loggingEnabledDefaultTrue
  },
  local: {},
  test: {
    rootDir: `${projectRoot}/app/`,
    outputDir: `${projectRoot}/app/output`
  }
}

const config = Object.assign(configurations.base, configurations[env]);

module.exports = config;

console.log(JSON.stringify(config, null, 2))

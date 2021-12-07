const util = require('util');
const exec = util.promisify(require('child_process').exec)
const logger = require('../logger')
const config = require('../config')
const { generateHtmlReport } = require('./htmlReport')
const { applicationStatus, buildUrl, BUILD_URL_NOT_PROVIDED} = require('./globals');

async function runScript(command) {
  let stderr = ''
  try {
    logger.log("INFO", `Running command \'${command}\'`)
    let { stdout, stderr } = await exec(command, {maxBuffer: 1024 * 4096})
  } catch(error) {
    logger.log('ERROR', `Failed to run script: ${error}`)
    applicationStatus('PAGE_ASSESSMENT_FAILED')
    return
  }
  if(stderr) {
    logger.log("ERROR", `Command \'${command}\' ran with the following errors: ${stderr}`);
    applicationStatus('PAGE_ASSESSMENT_FAILED')
    return
  }
}

function artefactLocation() {
  if (buildUrl() === BUILD_URL_NOT_PROVIDED) {
    return `http://localhost:${config.port}/api/report/pages`
  }
  const JENKINS_ARTIFACT_LOCATION = "artifact/pages"
  return `${buildUrl()}${JENKINS_ARTIFACT_LOCATION}`
}

module.exports.runAssessment = async () => {
  applicationStatus("ASSESSING_PAGES");
  await runScript(`cd ${config.resourcesDir} && ./run_assessment.sh ${config.rootDir} ${global.testSuite} ${buildUrl()} ${artefactLocation()}`);
  if(global.status === 'PAGE_ASSESSMENT_FAILED') {return}
  generateHtmlReport();
}

module.exports.artefactLocation = artefactLocation
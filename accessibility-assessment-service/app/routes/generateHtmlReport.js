const router = require('express').Router();
const logger = require('../logger')
const { applicationStatus } = require('../services/globals');
const { generateHtmlReport } = require('../services/htmlReport');

router.post('/', (req, res) => {
    if(global.status !== 'PAGE_ASSESSMENT_COMPLETED') {
        logger.log('ERROR', "Assessment failed. Cannot generate report")
        return res.status(200).json({message: "Assessment failed. Cannot generate report."}).send()
    }

    generateHtmlReport();

    res.status(200).json({message: "Report Ready"}).send();
})

module.exports = router;

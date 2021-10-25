const express = require("express");
const config = require("./config");
const logger = require("./logger");
const router = require('express').Router();

//Define Routes
router.use('/api/logs', require('./routes/logs.js'));
router.use('/api/app', require('./routes/application.js'));
router.use('/api/capture-page', require('./routes/capturePage.js'));
router.use('/api/assess-pages', require('./routes/assessPages.js'));
router.use('/api/report', require('./routes/report.js'));
router.use('/api/status', require('./routes/status.js'));
router.use('/api/report/pages', express.static(config.pagesDirectory));

//Add error handling
router.use('/api', errorHandler);

function errorHandler(err, req, res, next) {
    logger.log("ERROR", err.message);
    var httpStatus = err.status || 500
    return res.status(httpStatus).json({message:err.message}).send()
};

module.exports = router;
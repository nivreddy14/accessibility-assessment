const express = require('express')
const config = require('./config')
const logger = require('./logger')
const { reset } = require('./services/globals')

let app = express();
app.use(express.json({limit: '500mb',}));
app.use(require('./router'))

//Start the application
var server = app.listen(config.port, function() {
  reset()
  logger.log("INFO",`Accessibility assessment service running on port ${config.port}`)
});

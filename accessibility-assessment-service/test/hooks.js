const config = require("../app/config")
const fs = require('fs')

module.exports.removeTempFiles = function () {
    fs.rmdirSync(`${config.outputDir}`, {recursive: true, force: true});
    fs.rmdirSync(`${config.pagesDirectory}`, {recursive: true, force: true});
}
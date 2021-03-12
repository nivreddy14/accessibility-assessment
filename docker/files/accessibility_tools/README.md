# accessibility_tools

This folder contains two files, `.npmrc` and `package.json` which are required in order to
control the versions of chromedriver, axe and vnu which are used within the accessibility assessment.
 

## .npmrc
This file specifies an npm config property which detects compatibility of the currently installed chromedriver
version before installing a new version. 

Further information on this npm config property can be found here https://www.npmjs.com/package/chromedriver

### Updating chromedriver
To update the chromedriver version used, modify the node-chrome version specified at the 
top of the [DockerFile](../../Dockerfile). 

For example changing from chromedriver 87:
`FROM ${DOCKERHUB}/selenium/node-chrome:3.141.59-20201119`

To chromedriver 88:
`FROM ${DOCKERHUB}/selenium/node-chrome:3.141.59-20210128`

New chromedriver releases can be found within [SeleniumHQ](https://github.com/SeleniumHQ/docker-selenium/releases).

## package.json
The contents within this file is used to specify specific versions of axe and vnu to be used within the 
accessibility-assessment image.

### Updating versions
To update the versions of axe (axe-core, axe-core/cli) and/or vnu (vnu-jar), update the version number specified within the [package.json](package.json) file and then follow the steps
as outlined in this repositories main [README.md](../../../README.md) to build and run the new image.

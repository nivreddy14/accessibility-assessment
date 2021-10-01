#!/usr/bin/env bash

# Set the axe-core version for the report
cd ${HOME}/accessibility-assessment-service
# `npm ls --depth=0 | grep axe-core@` returns `├── axe-core@x.x.x`.
# `awk -F@ '{print $2}'` returns x.x.x as version number
export NPM_AXE_VERSION=$(npm ls --depth=0 | grep axe-core@ | awk -F@ '{print $2}') \
export NPM_VNU_VERSION=$(vnu --version)

# Start the application
cd ${HOME}/accessibility-assessment-service/app
export NODE_ENV=docker && node app.js

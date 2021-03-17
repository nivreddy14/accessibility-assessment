#!/usr/bin/env bash

# Set the axe-core version for the report
cd ${HOME}/accessibility_tools
export NPM_AXE_VERSION=$(npm ls | grep axe-core | head -1 | awk -F@ '{print $3}') \
export NPM_VNU_VERSION=$(vnu --version)

# Start the application
cd ${HOME}/app
export NODE_ENV=docker && node app.js

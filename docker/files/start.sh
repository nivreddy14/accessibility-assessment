#!/usr/bin/env bash

# Set the axe-core version for the report
cd ${HOME}/tools
export NPM_AXE_VERSION=$(npm ls | grep axe-core | head -1 | awk -F@ '{print $2}') \

# Start the application
cd ${HOME}/app
export NODE_ENV=docker && node app.js

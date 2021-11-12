#!/usr/bin/env bash

# Start the application
cd ${HOME}/accessibility-assessment-service/app
export NODE_ENV=docker && node app.js

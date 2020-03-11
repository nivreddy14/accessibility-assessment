#!/bin/bash

################################################################################
# Use this script to run the accessibility-assessment image locally
################################################################################

PROJECT_DIR=${WORKSPACE}/accessibility-assessment
rm -rf ${PROJECT_DIR}/output/*
docker rm a11y

docker run --cpus 3  \
    --name a11y \
    -v ${PROJECT_DIR}/output:/home/seluser/output \
    -p 6010:6010 \
    accessibility-assessment:SNAPSHOT

# You can use the below volumen mount option in the above docker commands for testing
# within the image.
# -v ${PROJECT_DIR}/app:/home/seluser/app \

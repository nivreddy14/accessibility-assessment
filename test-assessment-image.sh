#!/bin/bash

# Be sure to export valid build.tax.service.gov.uk API credentials
# (JENKINS_USERNAME and JENKINS_API_KEY) in your local environment.

rm -rf $(pwd)/docker/files/output/*
docker rm a11y

################################################################################
# Use the following command for testing entry_point, load-alert-data.sh and
# assessAllPages script changes locally.
################################################################################
docker run --cpus 3  \
    --name a11y \
    -v $(pwd)/docker/files/output:/home/seluser/output \
    -e TEST_SUITE_NAME=${1} \
    -e JENKINS_USERNAME=${JENKINS_USERNAME} \
    -e JENKINS_API_KEY=${JENKINS_API_KEY} \
    -p 6001:16001 \
    accessibility-assessment:SNAPSHOT
    #artefacts.tax.service.gov.uk/accessibility-assessment:0.5.0

#-v $(pwd)/docker/files/accessibility-assessment-report-parser.jar:/home/seluser/accessibility-assessment-report-parser.jar \
#-v $(pwd)/docker/files/entry_point.sh:/home/seluser/entry_point.sh \
#-v $(pwd)/docker/files/assessAllPages.sh:/home/seluser/assessAllPages.sh \
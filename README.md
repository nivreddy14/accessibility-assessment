# Accessibility Assessment Service
The accessibility assessment service is published as a docker image, and runs as a sidecar container to our jenkins slaves.  It exposes a REST API for capturing complete web pages (HTML, js, css) which are then assessed with [axe](https://www.deque.com/axe/) and [Nu HTML Checker](https://validator.github.io/validator/).  The service then creates a basic HTML report of the violations found which is archived in Jenkins, and in our Management instance of Kibana.

At present the image is made up of the following components:
- **accessibility-assessment-service**: a [node express](https://expressjs.com/) service that exposes a REST API which is consumed by the jenkins slave and the page-capture-chrome-extension.  The API exposes a single endpoint to the page-capture-chrome-extension for capturing pages, and various other endpoints for orchestrating the page assessment (initialisation, trigger the page assessments, generate reports, surfaces logging information...etc).
- **page-accessibility-check**: a jar published by [this Scala project](https://github.com/hmrc/page-accessibility-check) which wraps execution of axe and vnu assessments against a collection of pages.  This application is triggered by the accessibility-assessment-service once pages have been captured for assessment.

# Building the Image in CI
The [Makefile](Makefile) at the root of this project is used by Jenkins to build and publish new versions of this image to artefactory for use in CI.

# Development
*Note that to date this project has only been developed on Mac OSX.*

## Pre-requisites
For local development you will need to satisfy the following pre-reqs:
- Install [docker](https://docs.docker.com/install), v19.x or above;
- set your `WORKSPACE` environment variable, and ensure that this project is cloned in the root of the workspace.  I.e. ${WORKSPACE}/accessibility-assessment

## Building the image
To build the **accessibility-assessment:SNAPSHOT** docker image for local use execute the `. scripts/build-local-image.sh` script.

## Running the image
To run the image as a docker container in your local dev environment, execute `. scripts/run-local.sh`.

## Updating the image
Most updates can be tested easily by starting the service in your local development environment by executing `node app.js` from the [app](app/) directory.  However, triggering page assessments requires that you have specific versions of axe-cli and the vnu jar installed and configured appropriately.

As the [Dockerfile](docker/Dockerfile) contains all of the setup/configuration required to get the service running as it would in CI, the most reliable way to develop and test the service is by mounting appropriate files/folders in the [app](app/) directory to the running docker container.

Review the comments in the [run-local.sh](scripts/run-local.sh) script for examples.

# Testing
## Postman Collection
There is a [Postman](https://www.postman.com/downloads/) collection in the [test](test/postman-collections) directory which contains a list of basic requests for each of the endpoints implemented in the service.

## Acceptance tests
The [accessibility-assessment-tests](https://github.com/hmrc/accessibility-assessment-tests) project contains captured pages from approximately 5 sample builds taken from CI which make a valueable regression test, and can be used to identify the addition/removal of rules when upgrading axe and vnu.

There is also a performance test available which ensures that builds of ~350 pages can be assessed successfully.

## Kibana Integration
### Running up an ELK stack locally
You will need to have ~6GB of memory allocated to your local docker engine to run the ELK stack.  If you're running Docker Desktop, you can configure this in **Docker -> Preferences**

You will also need to have docker-compose installed (tested on Mac OSX with v1.25.2).

Simply navigate to the [elk](test/elk) directory and execute the command: `docker-compose up -d`

ElasticSearch and Kibana will start on the default ports of 9600 and 5601 respectively.  You will be able to see Kibana in your browser if you navigate to http://localhost:5601.  Note that it may take a minute to initialise.

To kill the stack, execute `docker-compose kill` from the [elk](test/elk) directory.  If you wish to delete all of the data ingested by elk, then delete the esdata directory `rm -r test/elk/esdata/*`

### Visualising Violations in Kibana
Visualisations for the local Kibana instance can be loaded manually using Kibana's Saved Object import UI.  If this is
 the first time you've run the `docker-compose` command in the previous section, then please follow the below instructions
  to generate the visualisations you'll need to review the results of the assessment:

1. When the log ingestion is successful, Kibana will show the option to create an Index at **Management -> Index Patterns**.
The index pattern could be set to `logstash-*` and set the *time filter* field to `testRun` when prompted.
2. The exported accessibility dashboards from Management Kibana environment is available [here](https://github.com/hmrc/management-kibana-dashboards/tree/master/saved-objects/management). The current
local ELK stack setup does not support `.raw` type used in Kibana Management. It supports only type `.keyword`. Hence,
  before importing these objects replace all references to `.raw` type in the exported saved object with `.keyword`
3. Import the modified saved objects by navigating to **Management -> Saved Ojbects** and click **Import**.
4. When prompted to choose an index pattern, select the index pattern created above in step 1
5. Upon successful import, the dashboards can be found under **Dashboard** section


# License
This code is open source software licensed under the [Apache 2.0 License]("http://www.apache.org/licenses/LICENSE-2.0.html").

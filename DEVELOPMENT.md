# Development
*Note that to date this project has only been developed on Mac OSX.*

## Pre-requisites
For local development you will need to satisfy the following pre-reqs:
- Install [docker](https://docs.docker.com/install), v19.x or above;
- set your `WORKSPACE` environment variable, and ensure that this project is cloned in the root of the workspace.  i.e. ${WORKSPACE}/accessibility-assessment

## Updating axe and vnu versions
To update the versions of axe (axe-core, axe-core/cli) and/or vnu (vnu-jar), update the version number specified within
the [package.json](package.json) file and then follow the steps [here](#building-and-running-the-image-locally-during-development)

`axe-core` requires chromedriver. The [.npmrc](.npmrc) file specifies a npm config property which detects compatibility
of the currently installed chromedriver version before installing a new version. Further information on this npm config
property can be found here https://www.npmjs.com/package/chromedriver

## Building and running the image locally during development
The repository uses a [Makefile](Makefile) to build and run the accessibility-assessment image. To build and run
the accessibility-assessment container locally, use command:
```makefile
make run_local
```
To list all the available options, run:

```makefile
make
```

## Running accessibility-assessment-service tests locally during development
Unit and integration tests have been implemented for accessibility-assessment-service using [Jest](https://jestjs.io/).

To run the tests locally:

```
npm install
npm test
```

## Updating the image
Most updates can be tested easily by starting the service in your local development environment by executing `node app.js` from the [accessibility-assessment-service/app](accessibility-assessment-service/app/) directory.  However, triggering page assessments requires that you have specific versions of axe-cli and the vnu jar installed and configured appropriately.

As the [Dockerfile](docker/Dockerfile) contains all of the setup/configuration required to get the service running as it would in CI, the most reliable way to develop and test the service is by mounting appropriate files/folders in the [accessibility-assessment-service/app](accessibility-assessment-service/app) directory to the running docker container.

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
2. The exported accessibility dashboards from Management Kibana environment is available [here](https://github.com/hmrc/management-kibana-dashboards/tree/main/saved-objects/management). The current
   local ELK stack setup does not support `.raw` type used in Kibana Management. It supports only type `.keyword`. Hence,
   before importing these objects replace all references to `.raw` type in the exported saved object with `.keyword`
3. Import the modified saved objects by navigating to **Management -> Saved Ojbects** and click **Import**.
4. When prompted to choose an index pattern, select the index pattern created above in step 1
5. Upon successful import, the dashboards can be found under **Dashboard** section
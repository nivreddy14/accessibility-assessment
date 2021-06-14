# Accessibility Assessment Service
The accessibility assessment service is published as a docker image, and runs as a sidecar container to our jenkins agents.  It exposes a REST API for capturing complete web pages (HTML, js, css) which are then assessed with [axe](https://www.deque.com/axe/) and [Nu HTML Checker](https://validator.github.io/validator/).  The service then creates a basic HTML report of the violations found which is archived in Jenkins, and in our Management instance of Kibana.

At present the image is made up of the following components:
- **accessibility-assessment-service**
- **page-accessibility-check**

## accessibility-assessment service
A [node express](https://expressjs.com/) service exposing endpoints for orchestrating page assessment. The service 
is available at http://localhost:6010.

### Endpoints
Below is the list of endpoints exposed by the accessibility-assessment-service. The example request and responses are 
generated using Postman. See [Postman collection](#Postman Collection) section for testing the service with Postman.   

#### GET /api/status
Returns the status of the accessibility-assessment container. The status can be one of: 
- READY 
- PAGES_CAPTURED 
- REPORT_READY 
- PAGE_ASSESSMENT_FAILED 
- ASSESSING_PAGES

**Request:**
```
GET /api/status HTTP/1.1
Host: localhost:6010
```
**RESPONSE:**
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 5
ETag: W/"5-/FVNArjFa9Xm5QWjlKISD/c6L7A"
Date: Wed, 25 Nov 2020 11:27:48 GMT
Connection: keep-alive

READY
```

#### POST /api/app/initialise
Initialises the assessment with the test suite name and Build Url. The generated report uses this information to link 
back to the captured HTML page.

**Request:**
```
POST /api/app/initialise HTTP/1.1
Host: localhost:6010
Content-Type: application/json

{
    "testSuite": "awesome-tests-a11y-tests",
    "buildUrl": "https://build.tax.service.gov.uk/job/ACE/job/awesome-tests-a11y-tests/19/"
}
```
**Response:**
```
HTTP/1.1 200 OK
X-Powered-By →Express
Content-Type →application/json; charset=utf-8
Content-Length →155
ETag →W/"9b-Zi4QVQl7/I0LAEH2xvGQWqLdMWE"
Date →Wed, 25 Nov 2020 11:37:30 GMT
Connection →keep-alive

{
    "applicationStatus": "READY",
    "testSuite": "awesome-tests-a11y-tests",
    "buildUrl": "https://build.tax.service.gov.uk/job/ACE/job/awesome-tests-a11y-tests/19/"
}
```

#### POST /api/app/global-filters
Accepts a config file containing filters which is used by the page-accessibility-check.
 The config should adhere to the [lightbend/config](https://github.com/lightbend/config) format. Refer to 
 [page-accessibility-check](https://github.com/hmrc/page-accessibility-check#global-filters) for more details on this config.     

**Request:**
```
POST /api/app/global-filters HTTP/1.1
Host: localhost:6010
Content-Type: multipart/form-data;
Content-Disposition: form-data; 
name="filter"; 
filename="application.conf
```

**Response:**
```
HTTP/1.1 201 Created
X-Powered-By →Express
Date →Wed, 25 Nov 2020 11:49:39 GMT
Connection →keep-alive
Content-Length →0
```

#### POST /api/capture-page
Used by the [page-capture-chrome-extension](https://github.com/hmrc/remote-webdriver-proxy-scripts/blob/master/page-capture-chrome-extension/content.js)
 to post the HTML page and assets (excluding images) for assessment.
 
##### Criteria for capturing pages:
Capture the page for assessment if:
  - the page hasn't already been captured (Duplicate pages are captured only if `captureAllPages` [config](app/config.js) is true)
  - the page URL does not contain the text `stub` in the path
  - the page URL does not contain the text `test-only` in the path
  - the page contains valid HTML tags (This is to avoid capturing any non-html pages accessed during the test)
See [capturePage.js](app/routes/capturePage.js) for more details.

**Request:**
**Request without Errors:**
```
POST /api/capture-page HTTP/1.1
Host: localhost:6010
Content-Type: application/json

{
    "pageURL": "http://localhost:1234/simple/page/capture",
    "pageHTML": "<html><head><title>Some title</title></head><main>The contents of the page</main></html>",
    "timestamp": "0000000002",
    "files": { "file1": "some contents" } 
}
```
_pageURl_: The actual URL of the page under assessment. This is written into a file called `data` which is used in the report.   
_pageHTML_: The captured page's HTML which is saved as `index.html`  
_timestamp_: The time when the page was captured. Used as folder name for each captured paged under which the relevant files are saved.  
_files_: Assets for the page. No images are captured by the page-capture-chrome-extension.   

**Response:**
```
HTTP/1.1 201 Created
X-Powered-By →Express
Date →Wed, 25 Nov 2020 15:54:05 GMT
Connection →keep-alive
Content-Length →0
```
When the page-capture-chrome-extension failed to download the assets for a captured page, the extension passes this information 
to the service using the `errors` field. The service then surfaces this information in `/api/logs/urls` for teams to investigate failed jobs.

**Request with Error Information:**
```
POST /api/capture-page HTTP/1.1
Host: localhost:6010
Content-Type: application/json

{
    "pageURL": "http://localhost:1234/path/to/page/with/lots/of/errors",
    "pageHTML": "<html><head><title>Some title</title></head><main>The contents of the page</main></html>",
    "timestamp": "0000000002",
    "files": {"file1":"some contents"},
    "errors":  [ { "failedUrl": "/pay/assets/js/monitoring.ga-events.js",
    				"message": "Request to the URL failed to return a 2XX response",
    				"statusReceived": 404 },
    				{ "failedUrl": "/pay/assets/js/another.js",
    				"message": "Request to the URL failed to return a 2XX response",
    				"statusReceived": 404 }]
}
```
**Response:**
```
HTTP/1.1 201 Created
X-Powered-By →Express
Date →Wed, 25 Nov 2020 15:54:05 GMT
Connection →keep-alive
Content-Length →0
```
#### POST /api/assess-pages
Triggers the assessment on the pages captured using `/api/capture-page`. This POST request does not take a body.  
If the assessment is completed, an HTML report is generated which then sets the status to `REPORT_READY`.  
If the assessment failed to complete for any reason, the status is set to `PAGE_ASSESSMENT_FAILED`.   

**Request**
```
POST /api/assess-pages HTTP/1.1
Host: localhost:6010
```
**Response:**
```
HTTP/1.1 202 Accepted
X-Powered-By →Express
Content-Type →application/json; charset=utf-8
Content-Length →40
ETag →W/"28-7mB1WmtoHr1duk7uGpg2HLtp1nw"
Date →Wed, 25 Nov 2020 16:01:40 GMT
Connection →keep-alive
{
    "message": "Page assessment triggered."
}
```

#### GET /api/logs/urls
Returns URLs captured for assessment, URLs excluded from the assessment and any URLs listed in the `errors` field of the
`/api/capture-page` endpoint.

**Request**
```
GET /api/logs/urls HTTP/1.1
Host: localhost:6010
cache-control: no-cache
```
**Response:**
```
HTTP/1.1 200 OK
X-Powered-By →Express
Content-Type →application/json; charset=utf-8
Content-Length →366
ETag →W/"16e-CX7a1vkmgCs6t1IxPHE/SzKg3gU"
Date →Wed, 25 Nov 2020 16:05:37 GMT
Connection →keep-alive

{
    "capturedUrls": [
        "http://localhost:1234/path/to/page/with/lots/of/errors",
        "http://localhost:1234/simple/page/capture",
        null
    ],
    "excludedUrls": [],
    "errors": [
        {
            "url": "http://localhost:1234/path/to/page/with/lots/of/errors",
            "path": "/pay/assets/js/monitoring.ga-events.js"
        },
        {
            "url": "http://localhost:1234/path/to/page/with/lots/of/errors",
            "path": "/pay/assets/js/another.js"
        }
    ]
}
```

#### GET api/logs/app
Provides the service logs of the accessibility-assessment-service. This does not include logs from page-accessibility-check.

**Request:**
```
GET /api/logs/app HTTP/1.1
Host: localhost:6010
```

**Response:**
```
HTTP/1.1 200 OK
X-Powered-By →Express
Date →Wed, 25 Nov 2020 16:31:28 GMT
Connection →keep-alive
Transfer-Encoding →chunked

{"level": "INFO", "message": "Accessibility assessment service running on port 6010", "type": "accessibility_logs", "app": "accessibility-assessment-service", "testSuite": "not-set"}
{"level": "INFO", "message": "Returning Accessibility assessment service status:READY", "type": "accessibility_logs", "app": "accessibility-assessment-service", "testSuite": "not-set"}
```
 
#### GET api/report/<type>
Provides the accessibility assessment report. The valid types are:
- `json` - Returns a JSON report which is used by the [htmlReport.js](app/services/htmlReport.js) to generate a HTML report 
- `html` - Returns an HTML report
- `csv`  - Returns the report in CSV format
- `bundle` - Returns a zipped file which contains all the captured pages, and the HTML report

#### GET api/app/reset
An endpoint to reset the app by removing the captured pages and any previously generated reports. Used in 
[accessibility-assessment-tests](https://github.com/hmrc/accessibility-assessment-tests) for resetting the service 
in between tests.  

**Request:**
```
POST /api/app/reset HTTP/1.1
Host: localhost:6010
Content-Type: application/json
```

**Response:**
```
HTTP/1.1 200 OK
X-Powered-By →Express
Date →Wed, 25 Nov 2020 16:41:27 GMT
Connection →keep-alive
Content-Length →0
```

## page-accessibility-check
A jar published by [page-accessibility-check](https://github.com/hmrc/page-accessibility-check) which wraps execution of axe
 and vnu assessments against a collection of pages. accessibility-assessment-service triggers this jar to run the assessment
  once pages have been captured.


## Running accessibility-assessment tests locally
To run accessibility-assessment tests locally, you can use the latest available version of the accessibility-assessment Docker image from Artifactory. 
This is also the version used in Build Jenkins.

> ### Prerequisite:
>In order to run the accessibility-assessment tests locally you will need to ensure:
>1. webdriver-factory 0.20.0 or later is used within your UI journey test repository dependencies
>2. You have started the services that should be tested

### Running the tests:
1. Run locally the latest available version of the accessibility-assessment Docker image from Artifactory:
```
   A11Y='artefacts.tax.service.gov.uk/accessibility-assessment:latest'
   docker pull ${A11Y} && docker run --rm --name 'a11y' -p 6010:6010 -e TARGET_IP='host.docker.internal' ${A11Y}
```

2. In order to configure the accessibility tests to run you will need to pass a 
   system property `accessibility-test=true`.

e.g. `sbt -Dbrowser='chrome' -Denvironment='local' -Daccessibility-test=true 'testOnly uk.gov.hmrc.test.ui.specs.*'`

3. Next, [trigger the assessment endpoint](#post-apiassess-pages).
   This will assess the pages which have been captured. 
   
   Depending on the number of pages being assessed this can take a little while.
   You can find out the status of the accessibility-assessment at anytime by [querying the status endpoint](#get-apistatus).


4. Finally, [get the report](#get-apireport) to see any violations which have been found.


# Building the Image in CI
The [Makefile](Makefile) at the root of this project is used by Jenkins to build and publish new versions of this image to artefactory for use in CI.

# Development
*Note that to date this project has only been developed on Mac OSX.*

## Pre-requisites
For local development you will need to satisfy the following pre-reqs:
- Install [docker](https://docs.docker.com/install), v19.x or above;
- set your `WORKSPACE` environment variable, and ensure that this project is cloned in the root of the workspace.  I.e. ${WORKSPACE}/accessibility-assessment

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

## Running tests locally during development
Unit and integration tests have been implemented using [Jest](https://jestjs.io/).

### Pre-requisites
Before running the tests locally you will need ensure the required dependencies are installed:

```
cd accessibility-assessment-service
npm install
```

### Running the tests
To run the tests locally:

```
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
2. The exported accessibility dashboards from Management Kibana environment is available [here](https://github.com/hmrc/management-kibana-dashboards/tree/master/saved-objects/management). The current
local ELK stack setup does not support `.raw` type used in Kibana Management. It supports only type `.keyword`. Hence,
  before importing these objects replace all references to `.raw` type in the exported saved object with `.keyword`
3. Import the modified saved objects by navigating to **Management -> Saved Ojbects** and click **Import**.
4. When prompted to choose an index pattern, select the index pattern created above in step 1
5. Upon successful import, the dashboards can be found under **Dashboard** section


# License
This code is open source software licensed under the [Apache 2.0 License]("http://www.apache.org/licenses/LICENSE-2.0.html").

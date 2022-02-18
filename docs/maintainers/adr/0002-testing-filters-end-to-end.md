# Testing filters end to end

* Status: accepted
* Deciders: platui
* Date: 2022-02-11

Technical Story: [PLATUI-1544](https://jira.tools.tax.service.gov.uk/browse/PLATUI-1544)

## Context and Problem Statement

Currently, how do we test adding new filters? 
* We implement a [filter spec test](https://github.com/hmrc/page-accessibility-check/blob/main/src/test/scala/uk/gov/hmrc/a11y/FiltersSpec.scala) in page-accessibility-check for the filter to be added. This is done by mocking the violation reported by the tools and then applying filters based on the violation.

* We implement the new filter within the [application.conf](https://github.com/hmrc/page-accessibility-check/blob/main/src/main/resources/application.conf) in page-accessibility-check.

* The filter spec tests are run to ensure they pass.

* Once merged into the page-accessibility-check we can test this in build. As this is a config change, we do not need to create a new image with the latest page-accessibility check.

### Limitations with the current approach

Because we mock the violation, there is a risk of incorrectly implementing the mock. This means even though the unit test might pass, the filter wouldn't be applied as expected when running end-to-end in build.

## Decision Drivers
###  What would give us confidence that filters have been applied correctly?
Testing without mocking the violation i.e. using the actual violation from the tool as an input.

## Considered Options

### Option 1: Run page-accessibility-check on the captured page and check the JSON report.

Pros:
* No docker knowledge is required
* Testing in isolation without the accessibility-assessment service

Cons:
* This relies on axe & vnu being installed locally on an engineers machine. This means that if this version does not match the version in build, then there may be differences in the violations reported
* This is a manual approach to check that the filters have been applied as expected

### Option 2: Mounting the captured pages using Docker while running the accessibility-assessment container

Pros:
* No need to install axe and vnu locally
* This is an end-to-end approach

Cons:
* Requires manually copying the page-accessibility-check jar file
* Familiarity with docker mounting is required
* Requires implementing an additional endpoint
* This is a manual approach to check that filters have been applied as expected

### Option 3: Creating a test endpoint within the accessibility-assessment-service to upload pages zip file

Pros:
* No need to install axe and vnu
* This is an end-to-end approach

Cons:
* Requires manually copying the page-accessibility-check jar file
* Requires implementing a new API test endpoint to receive a file containing the captured page
* This is a manual approach to check that filters have been applied as expected

### Option 4: Using the report output from axe and vnu as an input

Pros:
* The checking of applied filters is automated, so we can quickly get feedback if there is a regression.
* This does not rely on axe and vnu installation
* Does not rely on accessibility-assessment, isolated to just the page-accessibility-check component
* Does not require a full end-to-end test to check filters

Cons: 
* None that were identified

## Decision Outcome

Chosen option: Option 4. Using the report output from axe and vnu as an input 
SHELL := /usr/bin/env bash
PYTHON_VERSION := $(shell cat .python-version)

.PHONY: check_docker build_local build authenticate_to_artifactory push_image prep_version_incrementor clean help compose
.DEFAULT_GOAL := help

build_local: copy_files ## Build a local docker image
	@echo '********** Building docker image for local use ************'
	@docker rmi -f accessibility-assessment:SNAPSHOT
	@docker build --no-cache --tag accessibility-assessment:SNAPSHOT docker

build: copy_files prep_version_incrementor ## Build the docker image
	@echo '********** Building docker image ************'
	@pipenv run prepare-release
	@umask 0022
	@docker build --no-cache --tag artefacts.tax.service.gov.uk/accessibility-assessment:$$(cat .version) docker

authenticate_to_artifactory:
	@docker login --username ${ARTIFACTORY_USERNAME} --password "${ARTIFACTORY_PASSWORD}"  artefacts.tax.service.gov.uk

push_image: ## Push the docker image to artifactory
	@docker push artefacts.tax.service.gov.uk/accessibility-assessment:$$(cat .version)
	@pipenv run cut-release

push_labs: ## Push latest tag to artifactory
	@docker tag artefacts.tax.service.gov.uk/accessibility-assessment:$$(cat .version) artefacts.tax.service.gov.uk/accessibility-assessment:labs
	@docker push artefacts.tax.service.gov.uk/accessibility-assessment:labs

prep_version_incrementor:
	@echo "Renaming requirements to prevent pipenv trying to convert it"
	@echo "Installing version-incrementor with pipenv"
	@pip install pipenv --upgrade
	@pipenv --python $(PYTHON_VERSION)
	@pipenv run pip install -i https://artefacts.tax.service.gov.uk/artifactory/api/pypi/pips/simple 'version-incrementor<2'

copy_files: ## Copy files required for building image
	@rm -rf docker/files/accessibility-assessment-service || true
	@mkdir -p docker/files/accessibility-assessment-service/
	@cp -r accessibility-assessment-service/app docker/files/accessibility-assessment-service/app
	@cp -r accessibility-assessment-service/package.json docker/files/accessibility-assessment-service/package.json
	@cp -r accessibility-assessment-service/package-lock.json docker/files/accessibility-assessment-service/package-lock.json

clean: ## Remove the docker image
	@echo '********** Cleaning up ************'
	@docker rmi -f $$(docker images artefacts.tax.service.gov.uk/accessibility-assessment:$$(cat .version) -q)

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

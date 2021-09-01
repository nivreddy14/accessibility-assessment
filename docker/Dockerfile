ARG DOCKERHUB=dockerhub.tax.service.gov.uk
FROM ${DOCKERHUB}/selenium/node-chrome:3.141.59-20201119

ENV CAPTURE_ALL_PAGES false
ENV APP_PORT 6010
ENV NVM_VERSION 0.35.3
ENV NODE_VERSION 12.16.1
ENV SCALA_VERSION 2.12.12
ENV NVM_DIR $HOME/.nvm
ENV PATH="${NVM_DIR}/versions/node/v${NODE_VERSION}/bin:${HOME}/bin:${PATH}"

USER root

WORKDIR ${HOME}

COPY --chown=seluser:seluser files/start.sh ${HOME}/start.sh
COPY --chown=seluser:seluser files/accessibility-assessment-service ${HOME}/accessibility-assessment-service

RUN sudo chmod 755 ${HOME}/start.sh \
      && sudo chmod -R 755 ${HOME}/accessibility-assessment-service \
      && sudo mkdir ${HOME}/output \
      && sudo chmod 755 ${HOME}/output \
      && sudo chown -R seluser:seluser ${HOME}/output \
      && sudo mkdir $NVM_DIR \
      && sudo chown seluser:seluser $NVM_DIR \
      && sudo mkdir ${HOME}/bin \
      && sudo chown seluser:seluser ${HOME}/bin

USER seluser

RUN   cd ${HOME} \
      && echo "${NODE_VERSION}" > .nvmrc \
      && mv .nvmrc .nvmrc.bk \
      && curl -o- https://raw.githubusercontent.com/creationix/nvm/v${NVM_VERSION}/install.sh | bash \
      && . "${NVM_DIR}/nvm.sh" \
      && mv .nvmrc.bk .nvmrc \
      && nvm install \
      && npm upgrade \
      && cd ${HOME}/accessibility-assessment-service \
      # installs axe, vnu and dependencies required for accessibility-assessment-service defined in package.json
      && npm install \
      # creates a shell script in ${HOME}/bin to make axe and vnu accessible from command line
      && sudo echo -e '#!/bin/bash\njava -jar ${HOME}/accessibility-assessment-service/node_modules/vnu-jar/build/dist/vnu.jar "$@"' > ${HOME}/bin/vnu \
      && sudo echo -e '#!/bin/bash\n cd ${HOME}/accessibility-assessment-service;npx axe "$@"' > ${HOME}/bin/axe \
      # makes axe and vnu shell scripts executable
      && chmod +x ${HOME}/bin/vnu \
      && chmod +x ${HOME}/bin/axe

EXPOSE 6010

CMD ["/bin/bash", "/home/seluser/start.sh"]

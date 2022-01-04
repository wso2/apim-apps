# WSO2 API Manager Portals
        

---


[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![stackoverflow](https://img.shields.io/badge/stackoverflow-wso2am-orange)](https://stackoverflow.com/tags/wso2-am/)
[![slack](https://img.shields.io/badge/slack-wso2--apim-blueviolet)](https://join.slack.com/t/wso2-apim/shared_invite/enQtNzEzMzk5Njc5MzM0LTgwODI3NmQ1MjI0ZDQyMGNmZGI4ZjdkZmI1ZWZmMjNkY2E0NmY3ZmExYjkxYThjNzNkOTU2NWJmYzM4YzZiOWU?src=sidebar)

---

|  Branch / Status | Azure | Jenkins |
| :------------ |:------------- |:-------------
| master      | [![Build Status](https://dev.azure.com/apim-apps/apim-apps/_apis/build/status/wso2.apim-apps?branchName=main)](https://dev.azure.com/apim-apps/apim-apps/_build/latest?definitionId=2&branchName=main) | [![Build Status](https://wso2.org/jenkins/view/platform/job/platform-builds/job/apim-apps/badge/icon)](https://wso2.org/jenkins/view/platform/job/platform-builds/job/apim-apps/) |


WSO2 API Manager apps consists of several loosely coupled modules.

        * API Publisher portal
        * API Developer portal
        * API Admin portal
        * Portals integration tests
Setup build environment
==================================

1. Install NodeJS 16.x or later LTS version from [https://nodejs.org/en/download/](https://nodejs.org/en/download/).
 > **_Note :-_** 
   >  
   > You may use [nvm](https://github.com/nvm-sh/nvm) tool to manage NodeJS on your development environment
   >

> **_Note :-_** 
   >  
   > You can skip following steps if you don not want to build [product-apim](https://github.com/wso2/product-apim) binaries
   >

2. Install Maven from [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi). * For Maven 3.8 and up, please check the Troubleshoot section.
3. Install JDK 1.8 [https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html).

Building & Running
==================================
### Build
 1. Download or clone the project source code from https://github.com/wso2/apim-apps

2. Open the `portals/` directory (where the lerna.json is located)

3. Run following commands from the `portals/` directory :

    i.  Run `npm run bootstrap` to install the dependencies for all 3 portals

    ii. Run `npm run build:prod` to build all 3 portal apps

4. If you are building the [product-apim](https://github.com/wso2/product-apim),

5. Run `mvn clean install` from the command line in the project root directory (where the root pom.xml is located).

6. Then you just need to build [WSO2 API Manager Server](https://github.com/wso2/product-apim) after. (Follow the guide there)

### Run

7. Extract the wso2am-4.0.0.zip and go to the 'bin' directory

8. Run the api-manager.sh or api-manager.bat script based on you operating system.

3. Access the respective WSO2 API-M interfaces
    * API Publisher web application is running at - https://localhost:9443/publisher \
  You may sign in to the Publisher using the default administrator credentials (username: admin, password: admin).
    * Developer Portal web application is running at - https://localhost:9443/devportal \
  You may sign in to the Developer Portal using the default administrator credentials (username: admin, password: admin).

Run in dev mode
==================================
1. If you do not build a WSO2 API Manager server from the above steps, Download the built distribution of WSO2 API Manager Server from http://wso2.com/api-manager. 

2. Execute api-manager.sh (For unix environment) or api-manager.bat (For windows environment) file from the bin directory to run WSO2 API Manager Server.

3. Goto `portals/` directory in the `apim-apps` repository

4. Run `npm start` to start all three portals in development mode.
> **_Note :-_** 
   >  
   > If you haven't bootstrap the dependencies you have to run `npm run bootstrap` before starting the development build
   >
Running Tests
==================================
## Unit Tests

Product Unit tests have been implemented using [Jest](https://jestjs.io/) along with [enzyme](https://enzymejs.github.io/enzyme/)

### Run Tests for individual module

- Go to the respective individual portals directory

  i:e `/portals/publisher/`
- and run

  ```
  npm run test
  ```
  For more information regarding the test module, checkout the [README](./portals/publisher/source/Tests/README.md) in the publisher `Tests` module.
### Integration Tests

Product integration tests have been written using [Cypress Testing Framework](https://www.cypress.io/) and you can run the test suites using the following command.

- Goto `/tests/cypress/`

#### Headless mode

- Run

  ```
  npm run test
  ```
#### Interactive mode (with GUI)

- Run

  ```
  npm run test:gui
  ```
Support
==================================

WSO2 Inc. offers a variety of development and production support
programs, ranging from Web-based support up through normal business
hours, to premium 24x7 phone support.

For additional support information please refer to http://wso2.com/support

For more information on WSO2 API Manager please visit https://wso2.com/api-management/

Known Issues of WSO2 API Manager
==================================

All known issues of WSO2 API Manager are filed at:
   
* https://github.com/wso2/product-apim/issues


--------------------------------------------------------------------------------
(c) Copyright 2021 WSO2 Inc.

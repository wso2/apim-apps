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
   > You can skip following steps if you do not want to build [product-apim](https://github.com/wso2/product-apim) binaries
   >

2. Install Maven from [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi). * For Maven 3.8 and up, please check the Troubleshoot section.
3. Install JDK 1.8 [https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html).

Fixing an issue in a web application
==================================
If you are planning to fix an issue in a specific web application, you don't need to build the whole repository. You only need to build that specific application from the portals folder. We will take fixing an issue in publisher web application as an example.

1. If you do not build a WSO2 API Manager server, Download the built distribution of WSO2 API Manager Server from http://wso2.com/api-manager. 

2. Execute api-manager.sh (For unix environment) or api-manager.bat (For windows environment) file from the bin directory to run WSO2 API Manager Server.

3. Goto `portals/publisher` directory in the `apim-apps` repository.

4. You can either run `mvn clean install` from root directory or `npm ci` from `src/main/webapp` directory. Note that the `npm ci` will be faster since `mvn clean install` command is executing production build and UI tests.

5. Run `npm start` from `src/main/webapp` to start publisher portal in development mode.

Now you can update the code to view the changes in the development server. Once you are done with the fixes,
you can run `npm run build:prod` to check for errors before committing. Also refer to 'Running Tests' section and run test if the tests are effected. At the moment these tests are valid for only publisher app.

### Adding or updating a new dependency
1. Setup the development environment by following the steps given above.

2. Run the npm command from the web application root folder. ( Ex: For publisher web app, it's `portals/publisher/src/main/webapp` ).
   - Adding a dependency `npm i <package-name>`. (Ex: `npm i base64url`)
   - Removing a dependency `npm uninstall <package-name>`. (Ex: `npm uninstall base64url`)
   - Updating a version or specifying version when installing `npm i <package-name>@<version>`. (Ex: `npm i base64url@3.0.1`).

3. Once you successfully run the above commands the package.json and package-lock.json files will be updated. You need to commit both of them. 

>
> Never run `npm i` since it will update the package lock for all the dependencies with there minor updated versions.
>

Building & Running
==================================
### Build
 1. Download or clone the project source code from https://github.com/wso2/apim-apps

 2. If you want to build all web apps, run `mvn clean install` from the command line in the project root directory (where the root pom.xml is located). 

 3. Then you just need to build [WSO2 API Manager Server](https://github.com/wso2/product-apim) after. (Follow the guide there)

### Run

4. Extract the wso2am-4.0.0.zip and go to the 'bin' directory

5. Run the api-manager.sh or api-manager.bat script based on you operating system.

6. Access the respective WSO2 API-M interfaces
    * API Publisher web application is running at - https://localhost:9443/publisher \
  You may sign in to the Publisher using the default administrator credentials (username: admin, password: admin).
    * Developer Portal web application is running at - https://localhost:9443/devportal \
  You may sign in to the Developer Portal using the default administrator credentials (username: admin, password: admin).
Running Tests
==================================
## Unit Tests

Product Unit tests have been implemented using [Jest](https://jestjs.io/) along with [enzyme](https://enzymejs.github.io/enzyme/)

### Run Tests for individual module

- Go to the webapp directory in the respective individual portals directory

  i:e `/portals/publisher/src/main/webapp`
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

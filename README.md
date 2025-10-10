# WSO2 API Manager Portals

A comprehensive web application suite for WSO2 API Manager, providing intuitive interfaces for API management, development, and administration.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![stackoverflow](https://img.shields.io/badge/stackoverflow-wso2am-orange)](https://stackoverflow.com/tags/wso2-am/)
[![slack](https://img.shields.io/badge/slack-wso2--apim-blueviolet)](https://join.slack.com/t/wso2-apim/shared_invite/enQtNzEzMzk5Njc5MzM0LTgwODI3NmQ1MjI0ZDQyMGNmZGI4ZjdkZmI1ZWZmMjNkY2E0NmY3ZmExYjkxYThjNzNkOTU2NWJmYzM4YzZiOWU?src=sidebar)

---

|  Branch / Status | Azure | Jenkins |
| :------------ |:------------- |:-------------
| master      | [![Build Status](https://dev.azure.com/apim-apps/apim-apps/_apis/build/status/wso2.apim-apps?branchName=main)](https://dev.azure.com/apim-apps/apim-apps/_build/latest?definitionId=2&branchName=main) | [![Build Status](https://wso2.org/jenkins/view/platform/job/platform-builds/job/apim-apps/badge/icon)](https://wso2.org/jenkins/view/platform/job/platform-builds/job/apim-apps/) |

## Overview

The WSO2 API Manager Apps consist of several modular web applications designed to provide comprehensive API management capabilities:

- **API Publisher Portal** - Create, design, implement, and manage APIs
- **API Developer Portal** - Discover, explore, and consume APIs
- **API Admin Portal** - Administrative functions and portal management  
- **Integration Tests** - Test suites for all portals

## Prerequisites

1. **Node.js** - Install version 22.x or later LTS from [nodejs.org](https://nodejs.org/en/download/)
   - Alternatively, use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions

#### Optional Dependencies
The following dependencies are only required if you plan to build the complete [WSO2 API Manager](https://github.com/wso2/product-apim) distribution:

2. **Apache Maven** - Download from [maven.apache.org](https://maven.apache.org/download.cgi)
3. **JDK 1.8** - Download from [Oracle](https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html) or use OpenJDK

## Quick Start

### Development Workflow
When developing and fixing issues in specific web applications, you don't need to build the entire repository. Here's how to work on a specific portal (using the Publisher as an example):

#### Step 1: Set Up WSO2 API Manager Server
- **Option A**: Download the pre-built distribution from [wso2.com/api-manager](http://wso2.com/api-manager)
- **Option B**: Build the server yourself by following the [product-apim guide](https://github.com/wso2/product-apim)

#### Step 2: Start the API Manager Server
```bash
# Navigate to the server's bin directory
cd path/to/wso2am-4.x.x/bin

# Start the server (Unix/Linux/macOS)
./api-manager.sh
# Or for Windows
api-manager.bat
```

#### Step 3: Clone the apim-apps Repository
```bash
git clone https://github.com/wso2/apim-apps
cd apim-apps
```

#### Step 4: Set Up the Portal for Development
```bash
# Navigate to the specific portal directory
cd portals/publisher/src/main/webapp
npm ci
```

#### Step 5: Start the Development Server
```bash
# From the src/main/webapp directory
npm start
```

The development server will start with hot-reload capabilities, allowing you to see changes immediately. The development servers will run on the following default ports:

- **Publisher Portal**: http://localhost:8081/publisher
- **Developer Portal**: http://localhost:8084/devportal  
- **Admin Portal**: http://localhost:8083/admin

> **Default Credentials**: Use `admin` / `admin` for username and password to log into all portals.

#### Step 6: Validate Changes
Before committing your changes:
```bash
# Run production build to check for errors
npm run build:prod
```

**Note:** You can use `mvn clean install` at the root level to build all 3 portals, or navigate to a specific portal's directory and run it there to build only that component. If you use this method, you will need to copy the built `.war` files manually to the `<API-M_HOME>/repository/deployment/server/webapps` directory.

## Testing

### Integration Tests

The project uses the [Cypress Testing Framework](https://www.cypress.io/) for comprehensive end-to-end testing.

#### Setup
```bash
cd tests
npm install
```

#### Test Execution Modes

##### Headless Mode (CI/CD)
Execute tests in the command line without a GUI - ideal for continuous integration:
```bash
npm run test
```

##### Headed Mode (Visual Debugging)
Run tests with a visible browser interface for debugging:
```bash
npm run test:gui
```

##### Interactive Mode (Development)
Open the Cypress Test Runner for selective test execution and debugging:
```bash
npm run test:dev
```

Support
==================================

WSO2 LLC. offers a variety of development and production support
programs, ranging from Web-based support up through normal business
hours, to premium 24x7 phone support.

For additional support information please refer to http://wso2.com/support

For more information on WSO2 API Manager please visit https://wso2.com/api-management/

Known Issues of WSO2 API Manager
==================================

All known issues of WSO2 API Manager are filed at:
   
* https://github.com/wso2/api-manager/issues


--------------------------------------------------------------------------------
(c) Copyright 2021 - 2025 WSO2 LLC.

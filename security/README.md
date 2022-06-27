# Security Vulnerability Analyzer

Security Vulnerability Analyzer is a web application which allows developers to analyze security vulnerabilities of each portal of any branch in APIM.

# Setup build environment

1. Require Linux OS

2. Install Maven 3.6.x or later version from [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi).

3. Install JDK 11 or later version

# Building & Running

### Build

1.  Clone the project source code from https://github.com/wso2/apim-apps

2.  Open the terminal,checkout to security/security-backend folder, run `mvn clean install -Dmaven.test.skip=true`

# Running the Shell Script to get JSON Files

If you are not running the application for the first time or have the JSON files related to the portal and branch you are going to analyze.Skip this step

You need to run the shell script to get the relavant JSON file.Before running the shell script,make sure you are in the main branch of the local repository.

For example,

1. Checkout to security folder

2. If we need to analyze publisher portal of main branch need to run `./scan.sh publisher`(Second argument is the branch.By default it will be main).

3. If we want to analyze publisher portal of branch 3.2.0,need to run `./scan.sh publisher 3.2.0`.

Now you can analyze the portal of the branch you want if you have the required JSON file.(After running the shell script,before running the application make sure you are in the main branch of the local repository.)

### Run

1. Checkout to security/security-backend/resources folder,run the command `java -jar ../target/security-backend-0.0.1-SNAPSHOT/security-backend-0.0.1-SNAPSHOT.jar`(make sure you are in the main branch of the local repository)

# Support

For additional support information please refer to https://docs.google.com/document/d/1abXZ1ULNcQS1GqiERYR3S_PqW6ZHq8UN-jgLN7i2cj4/edit#heading=h.1caiqbxry708

(c) Copyright 2021 WSO2 Inc.

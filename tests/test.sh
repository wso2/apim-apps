#!/bin/bash

sudo apt-get update -y
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install cypress
npm install --save-dev cypress-file-upload
npm install --save  nodemailer
npm install --save require-text
npm install styliner
npm i --save-dev cypress-mochawesome-reporter
VAR=`grep "PublisherUrl" ../../../../data-bucket/deployment.properties |cut -d'=' -f2`
VAR2=${VAR//[\\]}
export CYPRESS_BASE_URL=${VAR2//\/publisher}

VAR3=`grep "s3secretKey" ../../../../data-bucket/deployment.properties |cut -d'=' -f2`
export S3_SECRET_KEY=${VAR3}
VAR4=`grep "s3accessKey" ../../../../data-bucket/deployment.properties |cut -d'=' -f2`
export S3_ACCESS_KEY=${VAR4}

VAR5=`grep "TEST_PLAN_ID" ../../../../data-bucket/deployment.properties |cut -d'=' -f2`
export TEST_PLAN_ID=${VAR5}

npm install --save-dev cypress-multi-reporters mocha-junit-reporter
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
npm install --save-dev mocha
npm install junit-report-merger --save-dev
npm i --save aws-sdk
npm run delete:reportFolderHTML
npm run delete:reportFolderJUnit
npm run delete:reportFolderReport
npm run pre-test
npm run test
npm run report:merge
npm run report:generate
node ./upload_email
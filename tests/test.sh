#!/bin/bash
echo "tesh.sh executing started..."

set -o xtrace

HOME=`pwd`
TEST_SCRIPT=test.sh

function usage()
{
    echo "
    Usage bash test.sh --input-dir /workspace/data-bucket.....
    Following are the expected input parameters. all of these are optional
    --input-dir       | -i    : input directory for test.sh
    --output-dir      | -o    : output directory for test.sh
    "
}

optspec=":hiom-:"
while getopts "$optspec" optchar; do
    case "${optchar}" in
        -)
            case "${OPTARG}" in
                input-dir)
                    val="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                    INPUT_DIR=$val
                    ;;
                output-dir)
                    val="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                    OUTPUT_DIR=$val
                    ;;
                mvn-opts)
                    val="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                    MAVEN_OPTS=$val
                    ;;
                *)
                    usage
                    if [ "$OPTERR" = 1 ] && [ "${optspec:0:1}" != ":" ]; then
                        echo "Unknown option --${OPTARG}" >&2
                    fi
                    ;;
            esac;;
        h)
            usage
            exit 2
            ;;
        o)
            OUTPUT_DIR=$val
            ;;
        m)
            MVN_OPTS=   $val
            ;;
        i)
            INPUT_DIR=$val
            ;;
        *)
            usage
            if [ "$OPTERR" != 1 ] || [ "${optspec:0:1}" = ":" ]; then
                echo "Non-option argument: '-${OPTARG}'" >&2
            fi
            ;;
    esac
done

echo "working Directory : ${HOME}"
echo "input directory : ${INPUT_DIR}"
echo "output directory : ${OUTPUT_DIR}"
export DATA_BUCKET_LOCATION=${INPUT_DIR}

# Retrieve specific property from deployment.properties file
function get_prop {
    local prop=$(grep -w "${1}" "${INPUT_DIR}/deployment.properties" | cut -d'=' -f2)
    echo $prop
}

PRODUCT_VERSION=$(get_prop 'ProductVersion')

if [[ -z "$PRODUCT_VERSION" ]]
then
    echo "\$ProductVersion not found in property list."
#    After merging changes to wso2/testgrid-job-configs this need to be enabled
#    exit 1
else
    PRODUCT_VERSION="-$PRODUCT_VERSION"
fi

######
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sleep 300
sudo killall apt apt-get dpkg
sudo dpkg --configure -a
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
npm -v
if [[$$? -ne 0 ]]
then
    echo "NPM exists and removing existing version."
    sudo apt-get remove nodejs npm
else
    echo "NPM Deos NOT exists and installing existing version."
    sudo apt install -y npm
fi
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

VAR6=`grep "TESTGRID_EMAIL_PASSWORD" ../../../../data-bucket/deployment.properties |cut -d'=' -f2`
export TESTGRID_EMAIL_PASSWORD=${VAR6}

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
mv  ./cypress/reports/html/mochawesome-bundle.html  ./cypress/reports/html/mochawesome-bundle-${TEST_PLAN_ID}.html
node ./upload_email

######

mvn clean install

echo `pwd`
#=============== Copy Surefire Reports ===========================================

echo "Copying surefire-reports to ${OUTPUT_DIR}/scenarios"
mkdir -p ${OUTPUT_DIR}/scenarios
mv ${OUTPUT_DIR}/scenarios/target/* ${OUTPUT_DIR}/scenarios/
find . -name "surefire-reports" -exec cp --parents -r {} ${OUTPUT_DIR}/scenarios \;
find . -name "aggregate-surefire-report" -exec cp --parents -r {} ${OUTPUT_DIR}/scenarios \;

#=============== Code Coverage Report Generation ===========================================

echo "Generating Scenario Code Coverage Reports"
source ${HOME}/code-coverage/code-coverage.sh

sleep 1500

generate_code_coverage ${INPUT_DIR} ${OUTPUT_DIR}

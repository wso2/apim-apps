#!/bin/bash
echo "tesh.sh executing started..."

set -o xtrace

HOME=`pwd`
TEST_SCRIPT=test.sh
MVNSTATE=1

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

cat ${INPUT_DIR}/deployment.properties

PRODUCT_VERSION=$(get_prop 'ProductVersion')

if [[ -z "$PRODUCT_VERSION" ]]
then
    echo "\$ProductVersion not found in property list."
#    After merging changes to wso2/testgrid-job-configs this need to be enabled
#    exit 1
else
    PRODUCT_VERSION="-$PRODUCT_VERSION"
fi
BASE_URL=$(get_prop 'GatewayHttpsUrl')
echo $BASE_URL

export CYPRESS_BASE_URL=${BASE_URL}
echo $CYPRESS_BASE_URL;

######
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sleep 300
sudo killall apt apt-get dpkg
sudo dpkg --configure -a
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
chmod 644 /usr/share/keyrings/nodesource.gpg
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
npm -v
if [[ $? -ne 0 ]]
then
    echo "NPM exists and removing existing version."
    sudo apt-get purge nodejs -y
    sudo apt-get purge npm -y
else
    echo "NPM Deos NOT exists and installing existing version."
fi

wget https://nodejs.org/dist/v12.22.3/node-v12.22.3-linux-x64.tar.xz
tar -xvf node-v12.22.3-linux-x64.tar.xz
sudo ln -s $HOME/node-v12.22.3-linux-x64/bin/node /usr/bin/node
sudo ln -s $HOME/node-v12.22.3-linux-x64/bin/npm /usr/bin/npm
sudo ln -s $HOME/node-v12.22.3-linux-x64/bin/npx /usr/bin/npx
sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb -y
export LC_CTYPE="en_US.UTF-8"
cd $HOME
npm install cypress
npm install --save-dev cypress-file-upload
npm install --save  nodemailer
npm install --save require-text
npm install styliner
npm i --save-dev cypress-mochawesome-reporter
npm i --save-dev mocha-junit-reporter
npm i --save-dev cypress-multi-reporters
npm i babel-plugin-module-resolver


export S3_SECRET_KEY=$(get_prop 's3secretKey')
export S3_ACCESS_KEY=$(get_prop 's3accessKey')
export TESTGRID_EMAIL_PASSWORD=$(get_prop 'testgridEmailPassword')

npm install --save-dev cypress-multi-reporters mocha-junit-reporter
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator
npm install --save-dev mocha
npm install --save-dev @cypress/browserify-preprocessor
npm install archiver
npm install yamljs
npm install junit-report-merger --save-dev
npm i --save aws-sdk
npm run delete:reportFolderHTML
npm run delete:reportFolderJUnit
npm run delete:reportFolderReport
npm run pre-test
nohup Xvfb :99 > /dev/null 2>&1 &
export DISPLAY=:99
npm run test
MVNSTATE=$?
pkill Xvfb
npm run report:merge
npm run report:generate
node ./upload_email
######

exit $MVNSTATE

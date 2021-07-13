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

cd ../scenarios
mvn clean install

echo `pwd`
#=============== Copy Surefire Reports ===========================================

echo "Copying surefire-reports to ${OUTPUT_DIR}/scenarios"
mkdir -p ${OUTPUT_DIR}/scenarios
find . -name "surefire-reports" -exec cp --parents -r {} ${OUTPUT_DIR}/scenarios \;
find . -name "aggregate-surefire-report" -exec cp --parents -r {} ${OUTPUT_DIR}/scenarios \;

#=============== Code Coverage Report Generation ===========================================

echo "Generating Scenario Code Coverage Reports"
source ${HOME}/../scenarios/code-coverage/code-coverage.sh
generate_code_coverage ${INPUT_DIR} ${OUTPUT_DIR}

#!/bin/bash
echo "tesh.sh executing started..."

set -o xtrace

HOME=`pwd`
TEST_SCRIPT=test.sh
MVNSTATE=1
TEST_SPECS=""

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
                test-specs)
                    val="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                    TEST_SPECS=$val
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

export CYPRESS_BASE_URL=`echo $CYPRESS_BASE_URL | sed "s|8243|9443|g"`
echo $CYPRESS_BASE_URL;

######
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sleep 300
sudo killall apt apt-get dpkg
sudo dpkg --configure -a
NODE_VERSION=v22.22.0
wget https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz
tar -xf node-${NODE_VERSION}-linux-x64.tar.xz
# A stale node in /usr/local/bin sits earlier in PATH than /usr/bin, so symlink
# both, prepend the tarball bin to PATH, and re-hash so the new node wins.
sudo rm -f /usr/bin/node /usr/bin/npm /usr/bin/npx
sudo rm -f /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx
sudo ln -s $HOME/node-${NODE_VERSION}-linux-x64/bin/node /usr/bin/node
sudo ln -s $HOME/node-${NODE_VERSION}-linux-x64/bin/npm /usr/bin/npm
sudo ln -s $HOME/node-${NODE_VERSION}-linux-x64/bin/npx /usr/bin/npx
sudo ln -s $HOME/node-${NODE_VERSION}-linux-x64/bin/node /usr/local/bin/node
sudo ln -s $HOME/node-${NODE_VERSION}-linux-x64/bin/npm /usr/local/bin/npm
sudo ln -s $HOME/node-${NODE_VERSION}-linux-x64/bin/npx /usr/local/bin/npx
export PATH=$HOME/node-${NODE_VERSION}-linux-x64/bin:$PATH
hash -r
node -v
npm -v
# Fail fast if the resolved node is not the version we just installed.
if [ "$(node -v)" != "${NODE_VERSION}" ]; then
    echo "ERROR: node version mismatch — expected ${NODE_VERSION}, got $(node -v)"
    echo "       which node: $(which node)"
    echo "       PATH: $PATH"
    exit 1
fi
sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb -y
export LC_CTYPE="en_US.UTF-8"
cd $HOME
npm ci

export S3_SECRET_KEY=$(get_prop 's3secretKey')
export S3_ACCESS_KEY=$(get_prop 's3accessKey')
export TESTGRID_EMAIL_PASSWORD=$(get_prop 'testgridEmailPassword')
npm run delete:reportFolderHTML
npm run delete:reportFolderJUnit
npm run delete:reportFolderReport
npm run pre-test
# Drop any stale failed-specs list from a prior build on a reused CI agent,
# so a first pass that crashes before after:run can't rerun old failures.
rm -f cypress/failed-specs.txt
nohup Xvfb :99 > /dev/null 2>&1 &
export DISPLAY=:99
if [ -n "$TEST_SPECS" ]; then
    echo "===== test_specs set — running user-selected specs only ====="
    echo "$TEST_SPECS" | tr ',' '\n'
    NO_COLOR=1 npx cypress run --e2e --spec "$TEST_SPECS"
else
    NO_COLOR=1 npm run test
fi
MVNSTATE_FIRST=$?
pkill Xvfb || true

# The cypress after:run callback in cypress.config.js wrote the list of failing
# specs to cypress/failed-specs.txt. Empty output here => no failures, no rerun.
FAILED_SPECS=$(node ./scripts/extract-failed-specs.js)

FLAKY_SPECS=""
MVNSTATE=$MVNSTATE_FIRST

if [ -n "$FAILED_SPECS" ]; then
    echo "===== First pass failures detected ====="
    echo "$FAILED_SPECS" | tr ',' '\n'
    echo "===== Starting rerun pass ====="

    nohup Xvfb :99 > /dev/null 2>&1 &
    export DISPLAY=:99
    NO_COLOR=1 npx cypress run --e2e --spec "$FAILED_SPECS"
    MVNSTATE_SECOND=$?
    pkill Xvfb || true

    FLAKY_SPECS="$FAILED_SPECS"
    MVNSTATE=$MVNSTATE_SECOND
fi

# Record which specs needed a rerun; post-actions.sh ships this to S3/email.
if [ -n "$FLAKY_SPECS" ]; then
    {
        echo "Flaky specs (failed on first pass, passed on rerun or still failing):"
        echo "$FLAKY_SPECS" | tr ',' '\n'
        echo ""
        echo "Final verdict: exit ${MVNSTATE}"
    } > "${OUTPUT_DIR}/flaky-specs.txt"
    echo "===== Flaky-specs marker written to ${OUTPUT_DIR}/flaky-specs.txt ====="
fi

# Report merge and email upload happen elsewhere; no extra step
# is needed here.

# On failure, fetch remote server logs via S3 since the agent has
# no direct SSH access to the target host.
fetch_remote_carbon_logs() {
    local s3_out instance_id trigger_path result_path tmpdir
    s3_out=$(get_prop 'S3OutputBucketLocation')
    instance_id=$(get_prop 'WSO2InstanceId')
    if [ -z "$s3_out" ] || [ -z "$instance_id" ]; then
        echo "[carbon-logs] S3OutputBucketLocation or WSO2InstanceId missing — skipping"
        return 0
    fi
    trigger_path="s3://${s3_out}/dump-now"
    result_path="s3://${s3_out}/carbon-logs/${instance_id}-carbon-logs.tar.gz"

    set +o xtrace
    set +e

    echo ""
    echo "===== Begin remote carbon log dump ====="
    echo "[carbon-logs] cleaning any stale tarball at ${result_path}"
    aws s3 rm "${result_path}" --quiet >/dev/null 2>&1

    echo "[carbon-logs] writing trigger to ${trigger_path}"
    if ! echo "$(date -u +%FT%TZ)" | aws s3 cp - "${trigger_path}" --quiet; then
        echo "[carbon-logs] failed to write trigger flag — skipping"
        echo "===== End remote carbon log dump ====="
        set -o xtrace
        set -e
        return 0
    fi

    # Poll for the result tarball. Watcher checks every 5s, dump itself takes
    # ~10-30s for a healthy log set; 18 iterations × 5s = 90s ceiling.
    echo "[carbon-logs] polling ${result_path} (90s ceiling)"
    local found=false i
    for i in $(seq 1 18); do
        sleep 5
        if aws s3 ls "${result_path}" >/dev/null 2>&1; then
            found=true
            break
        fi
    done

    if [ "$found" != "true" ]; then
        echo "[carbon-logs] tarball did not appear in 90s — watcher may not be running on the EC2."
        echo "[carbon-logs] check that aws-apim CFN template includes dump-carbon-logs-watcher.service."
        echo "===== End remote carbon log dump ====="
        set -o xtrace
        set -e
        return 0
    fi

    echo "[carbon-logs] downloading tarball"
    tmpdir=$(mktemp -d)
    if ! aws s3 cp "${result_path}" "${tmpdir}/carbon-logs.tar.gz" --quiet; then
        echo "[carbon-logs] s3 cp failed"
        rm -rf "${tmpdir}"
        echo "===== End remote carbon log dump ====="
        set -o xtrace
        set -e
        return 0
    fi
    if ! tar -xzf "${tmpdir}/carbon-logs.tar.gz" -C "${tmpdir}"; then
        echo "[carbon-logs] tar extract failed"
        rm -rf "${tmpdir}"
        echo "===== End remote carbon log dump ====="
        set -o xtrace
        set -e
        return 0
    fi

    local f
    # Filter the Solr autocomplete-syntax-error noise (it can flood the tail
    # window) and tail 20000 so the real failure survives.
    if [ -e "${tmpdir}/logs/wso2carbon.log" ]; then
        echo ""
        echo "----- wso2carbon.log (Solr-noise filtered, tail 20000) -----"
        grep -v -E 'newapi.*Lexical error|registry\.indexing\.solr|SolrQueryParserBase|QueryParserTokenManager|org\.apache\.solr\.parser|org\.apache\.solr\.search\.LuceneQParser|org\.apache\.solr\.search\.QParser|org\.apache\.solr\.handler\.RequestHandlerBase' \
            "${tmpdir}/logs/wso2carbon.log" | tail -n 20000
    fi
    for f in "${tmpdir}"/logs/http_access_*.log \
             "${tmpdir}"/logs/wso2carbon-trace-messages.log \
             "${tmpdir}"/logs/audit.log; do
        [ -e "$f" ] || continue
        echo ""
        echo "----- $(basename "$f") (tail 5000) -----"
        tail -n 5000 "$f"
    done
    for f in "${tmpdir}"/logs/tenants/*/wso2carbon.log; do
        [ -e "$f" ] || continue
        echo ""
        echo "----- $f (tail 500) -----"
        tail -n 500 "$f"
    done

    rm -rf "${tmpdir}"
    aws s3 rm "${result_path}" --quiet >/dev/null 2>&1
    echo "===== End remote carbon log dump ====="
    set -o xtrace
    set -e
}

if [ "${MVNSTATE}" -ne 0 ]; then
    fetch_remote_carbon_logs || true
fi

# Ship Cypress screenshots + mochawesome HTML to S3 via ${OUTPUT_DIR} (uploaded
# recursively by post-actions.sh) so failed runs have UI-side evidence.
if [ -n "${OUTPUT_DIR}" ]; then
    if [ -d "${HOME}/cypress/screenshots" ]; then
        cp -r "${HOME}/cypress/screenshots" "${OUTPUT_DIR}/cypress-screenshots" 2>/dev/null || true
    fi
    if [ -d "${HOME}/cypress/reports/html" ]; then
        cp -r "${HOME}/cypress/reports/html" "${OUTPUT_DIR}/cypress-report" 2>/dev/null || true
    fi
fi
######

exit $MVNSTATE

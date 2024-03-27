/*
 *  Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied. See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

import React, {
    lazy,
    Suspense,
    useContext,
    useState,
} from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Typography, Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';

const PREFIX = 'MockScriptOperation';

const classes = {
    scriptResetButton: `${PREFIX}-scriptResetButton`
};

const StyledGrid = styled(Grid)(() => {
    return {
        [`& .${classes.scriptResetButton}`]: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
        },
    };
});

const MonacoEditor = lazy(() => import('react-monaco-editor' /* webpackChunkName: "GenResourceMonaco" */));

const xMediationScriptProperty = 'x-mediation-script';
const defaultScript = '/* mc.setProperty(\'CONTENT_TYPE\', \'application/json\');\n\t'
    + 'mc.setPayloadJSON(\'{ "data" : "sample JSON"}\');*/\n'
    + '/*Uncomment the above comment block to send a sample response.*/';

/**
 * Retrieve mock script for the method of the resource.
 * @param {*} mockScripts mock scripts array
 * @param {*} path path/target
 * @param {*} method method/verb
 * @returns {any} js mock script
 */
function getGeneratedMockScriptOfAPI(mockScripts, path, method) {
    if (mockScripts) {
        const matchedResource = mockScripts.find(
            mockScript => (mockScript.verb.toLowerCase() === method.toLowerCase() && mockScript.path === path));
        if (matchedResource) {
            return matchedResource.content;
        }
    }
    return null;
}

/**
 * Script mock impl for operation.
 *
 * @param {any} props The input props
 * @return {any} The JSX representation of the component.
 * */
function MockScriptOperation(props) {
    const {
        resourcePath, resourceMethod, operation, updatePaths, paths, mockScripts
    } = props;
    const { api } = useContext(APIContext);
    const [showReset, setShowReset] = useState(false);


    /**
     * Handles the onChange event of the script editor.
     *
     * @param {string} value The editor content
     * @param {string} path The path value of the resource.
     * @param {string} method The resource method.
     * */
    const onScriptChange = (value, path, method) => {
        const tmpPaths = JSON.parse(JSON.stringify(paths));
        tmpPaths[path][method][xMediationScriptProperty] = value;
        updatePaths(tmpPaths);
    };

    const mediationScript = operation[xMediationScriptProperty];
    const script = mediationScript === undefined ? defaultScript : mediationScript;
    const originalScript = getGeneratedMockScriptOfAPI(mockScripts, resourcePath, resourceMethod);

    return (
        <StyledGrid container direction='column'>
            <Grid item className={classes.scriptResetButton}>
                <Typography variant='subtitle2'>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.script'
                        defaultMessage='Script'
                    />
                </Typography>
                {showReset
                    && (
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                setShowReset(false);
                                onScriptChange(originalScript, resourcePath, resourceMethod);
                            }}
                        >
                            <FormattedMessage
                                id='Apis.Details.Endpoints.Prototype.MockImplEndpoints.script.reset'
                                defaultMessage='Reset'
                            />
                        </Button>
                    )}
            </Grid>
            <Grid item>
                <Suspense fallback={<CircularProgress />}>
                    <MonacoEditor
                        height='50vh'
                        width='calc(100% - 250px)'
                        theme='vs-dark'
                        value={script}
                        options={{
                            selectOnLineNumbers: true,
                            readOnly: `${isRestricted(['apim:api_create'], api)}`,
                        }}
                        language='javascript'
                        onChange={(content) => {
                            setShowReset(true);
                            onScriptChange(content, resourcePath, resourceMethod);
                        }}
                    />
                </Suspense>
            </Grid>
        </StyledGrid>
    );
}

MockScriptOperation.propTypes = {
    resourcePath: PropTypes.string.isRequired,
    resourceMethod: PropTypes.string.isRequired,
    paths: PropTypes.shape({}).isRequired,
    updatePaths: PropTypes.func.isRequired,
    operation: PropTypes.shape({}).isRequired,
    mockScripts: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])).isRequired,
};

export default React.memo(MockScriptOperation);

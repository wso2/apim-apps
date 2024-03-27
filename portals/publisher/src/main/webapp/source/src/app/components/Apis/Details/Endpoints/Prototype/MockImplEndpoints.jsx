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

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Paper } from '@mui/material';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import MockScriptOperation from 'AppComponents/Apis/Details/Endpoints/Prototype/MockScriptOperation';
import GenericOperation from 'AppComponents/Apis/Details/Resources/components/GenericOperation';
import GroupOfOperations from 'AppComponents/Apis/Details/Resources/components/GroupOfOperations';
import CONSTS from 'AppData/Constants';
import { Progress, Alert } from 'AppComponents/Shared';

/**
 * Fetches example mock impl scripts
 * @return {{ mockScripts: Array | null, error : Error | null, progress: boolean }} status of the api call
 */
const useFetchScripts = () => {
    const { api } = useContext(APIContext);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(true);
    const [mockScripts, setMockScripts] = useState(null);

    useEffect(() => {
        api.getGeneratedMockScriptsOfAPI(api.id)
            .then((response) => {
                setMockScripts(response.obj.list);
            })
            .catch((e) => {
                console.error(error);
                Alert.error(`Something went wrong while fetching example mock scripts!!`);
                setError(e);
            }).finally(() => {
                setProgress(false);
            });
    }, []);
    return { mockScripts, error, progress };
};

/**
 * The mock impl endpoints base component.
 * This component lists the api resources to add custom mediation scripts.
 *
 * @param {any} props The input props.
 * @return {any} The JSX representation of the component.
 * */
function MockImplEndpoints(props) {
    const {
        paths, swagger, updatePaths,
    } = props;
    const { mockScripts, progress } = useFetchScripts();

    if (progress) {
        return <Progress />
    }

    return <>
        <Grid container direction='row' justifyContent='flex-start' spacing={2} alignItems='stretch'>
            <Grid item md={12}>
                <Paper>
                    {Object.keys(paths).map((path) => {
                        return (
                            <Grid key={path} item md={12}>
                                <GroupOfOperations openAPI={swagger} tag={path}>
                                    <Grid
                                        container
                                        direction='column'
                                        justifyContent='flex-start'
                                        spacing={1}
                                        alignItems='stretch'
                                    >
                                        {Object.keys(paths[path]).map((method) => {
                                            return CONSTS.HTTP_METHODS.includes(method) ? (
                                                <Grid key={`${path}/${method}`} item>
                                                    <GenericOperation
                                                        target={path}
                                                        verb={method}>
                                                        <MockScriptOperation
                                                            resourcePath={path}
                                                            resourceMethod={method}
                                                            operation={paths[path][method]}
                                                            updatePaths={updatePaths}
                                                            paths={paths}
                                                            mockScripts={mockScripts}
                                                        />
                                                    </GenericOperation>
                                                </Grid>
                                            ) : null;
                                        })}
                                    </Grid>
                                </GroupOfOperations>
                            </Grid>
                        );
                    })}
                </Paper>
            </Grid>
        </Grid>
    </>;
}

MockImplEndpoints.propTypes = {
    paths: PropTypes.shape({}).isRequired,
    updatePaths: PropTypes.func.isRequired,
    endpointConfig: PropTypes.shape({}).isRequired,
    swagger: PropTypes.shape({}).isRequired,
};

export default React.memo(MockImplEndpoints);

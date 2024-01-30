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
    useContext,
    useEffect,
    useState,
} from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    Icon,
    Paper,
    Radio,
    RadioGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import MockedOASOperation from 'AppComponents/Apis/Details/Endpoints/Prototype/MockedOASOperation';
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
        paths, swagger, updatePaths, endpointType, endpointConfig, endpointsDispatcher
    } = props;
    const scriptType = ['INLINE', 'MOCKED_OAS'].includes(endpointType) ? endpointType : 'INLINE';
    const [changedToType, setChangedToType] = useState(scriptType);
    const [typeChangeConfirmation, setTypeChangeConfirmation] = useState(false);

    const { mockScripts, progress } = useFetchScripts();

    /**
     * Handles the endpoint type change event. 
     * @param {any} type The endpoint type to change in to.
     * */
    const handleEndpointTypeChange = (type) => {
        setTypeChangeConfirmation(false)
        endpointsDispatcher({
            action: 'set_inline_or_mocked_oas',
            value: {
                endpointConfig,
                endpointImplementationType: type,
            },
        });
    };

    /**
     * Handles the endpoint type select event. If endpoint scripts has existing values, show confirmation dialog.
     * @param {any} event The select event.
     * */
    const handleEndpointTypeSelect = (event) => {
        // endpoint type changed from inline to mocked_oas need the confirmation dialog.
        // also the selected type should be temperarily keep till the change has confirmed.
        if (event.target.value === 'MOCKED_OAS') {
            setTypeChangeConfirmation(true);
            setChangedToType(event.target.value);
        } else {
            handleEndpointTypeChange(event.target.value)
        }
    };

    if (progress) {
        return <Progress />
    }

    return (
        <>
            <Grid item>
                <Typography>
                    <FormattedMessage
                        id='Apis.Details.Endpoints.EndpointOverview.MockImpl.Options'
                        defaultMessage='Select the gateway type'
                    />
                </Typography>
                <RadioGroup
                    aria-label='accessMethod'
                    name='accessMethod'
                    value={scriptType}
                    onChange={handleEndpointTypeSelect}
                >
                    <div>
                        <FormControlLabel
                            value='INLINE'
                            control={<Radio color='primary' />}
                            label={
                                (
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.EndpointOverview.MockImpl.Option.Inline'
                                        defaultMessage='Regular gateway (Synapse gateway)'
                                    />
                                )
                            }
                        />
                    </div>
                    <div>
                        <FormControlLabel
                            value='MOCKED_OAS'
                            control={<Radio color='primary' />}
                            label={
                                (
                                    <FormattedMessage
                                        id='Apis.Details.Endpoints.EndpointOverview.MockImpl.Option.MockedOAS'
                                        defaultMessage='Choreo Connect'
                                    />
                                )
                            }
                        />
                        <Tooltip
                            title={
                                (
                                    <FormattedMessage
                                        id={'Apis.Details.Endpoints.EndpointOverview.MockImpl.Option.MockedOAS'
                                            + '.description'}
                                        defaultMessage='If you want to add/update examples, update the API Definition'
                                    />
                                )
                            }
                        >
                            <Icon>help_outline</Icon>
                        </Tooltip>
                    </div>
                </RadioGroup>
            </Grid>
            <Grid container direction='row' justify='flex-start' spacing={2} alignItems='stretch'>
                <Grid item md={12}>
                    <Paper>
                        {Object.keys(paths).map((path) => {
                            return (
                                <Grid key={path} item md={12}>
                                    <GroupOfOperations openAPI={swagger} tag={path}>
                                        <Grid
                                            container
                                            direction='column'
                                            justify='flex-start'
                                            spacing={1}
                                            alignItems='stretch'
                                        >
                                            {Object.keys(paths[path]).map((method) => {
                                                return CONSTS.HTTP_METHODS.includes(method) ? (
                                                    <Grid key={`${path}/${method}`} item>
                                                        <GenericOperation
                                                            target={path}
                                                            verb={method}>
                                                            {scriptType === 'MOCKED_OAS' ?
                                                                <MockedOASOperation
                                                                    operation={paths[path][method]}
                                                                />
                                                                :
                                                                <MockScriptOperation
                                                                    resourcePath={path}
                                                                    resourceMethod={method}
                                                                    operation={paths[path][method]}
                                                                    updatePaths={updatePaths}
                                                                    paths={paths}
                                                                    mockScripts={mockScripts}
                                                                />
                                                            }
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

            <Dialog open={typeChangeConfirmation}>
                <DialogTitle>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.EndpointOverview.MockImpl.type.change.confirmation'
                            defaultMessage='Change Mock implementation'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.EndpointOverview.MockImpl.type.change.confirmation.message'
                            defaultMessage='Your current mock endpoint implementation scripts will be lost.'
                        />
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => { setTypeChangeConfirmation(false) }}
                        color='primary'
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints.EndpointOverview.MockImpl.type.change.cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        onClick={() => { handleEndpointTypeChange(changedToType) }}
                        color='primary'
                    >
                        <FormattedMessage
                            id='Apis.Details.Endpoints..EndpointOverview.MockImpl.type.change.proceed'
                            defaultMessage='Proceed'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

MockImplEndpoints.propTypes = {
    paths: PropTypes.shape({}).isRequired,
    updatePaths: PropTypes.func.isRequired,
    endpointsDispatcher: PropTypes.func.isRequired,
    endpointConfig: PropTypes.shape({}).isRequired,
    swagger: PropTypes.shape({}).isRequired,
    endpointType: PropTypes.string.isRequired,
};

export default React.memo(MockImplEndpoints);

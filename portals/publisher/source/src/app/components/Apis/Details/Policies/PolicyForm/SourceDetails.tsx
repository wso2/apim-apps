/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { FC, useContext } from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage,  } from 'react-intl';
import FormControl from '@material-ui/core/FormControl';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Button from '@material-ui/core/Button';
import Utils from 'AppData/Utils';
import API from 'AppData/api.js';
import { Alert } from 'AppComponents/Shared';
import { ACTIONS } from './PolicyCreateForm';
import UploadPolicyDropzone from './UploadPolicyDropzone';
import ApiContext from '../../components/ApiContext';

const useStyles = makeStyles((theme: Theme) => ({
    mandatoryStar: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'row',
    },
    downloadPolicyLabel: {
        marginTop: theme.spacing(1),
    },
}));

const SUPPORTED_GATEWAYS = {
    SYNAPSE: 'Synapse',
    CC: 'ChoreoConnect'
}

interface SourceDetailsProps {
    supportedGateways: string[];
    policyDefinitionFile?: any[];
    setPolicyDefinitionFile?: React.Dispatch<React.SetStateAction<any[]>>;
    dispatch?: React.Dispatch<any>;
    isViewMode?: boolean;
    policyId?: string;
}

/**
 * Renders the general details section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} General details of the policy.
 */
const SourceDetails: FC<SourceDetailsProps> = ({
    supportedGateways, policyDefinitionFile, setPolicyDefinitionFile, dispatch, isViewMode, policyId
}) => {
    const classes = useStyles();
    const { api } = useContext<any>(ApiContext);

    // Validates whether atleast one gateway type (i.e. synapse, or CC ) is selected
    // True if none of the available gateways are selected.
    const supportedGatewaysError = supportedGateways.length === 0;

    /**
     * Function to handle supported gateways related checkbox changes
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>)  => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_SUPPORTED_GATEWAYS,
                name: (event.target.name === 'regularGateway' ? SUPPORTED_GATEWAYS.SYNAPSE : SUPPORTED_GATEWAYS.CC) ,
                checked: event.target.checked,
            })
        }
    }

    /**
     * Hanlde policy download
     */
    const handlePolicyDownload = () => {
        if (policyId) {
            const commonPolicyContentPromise = API.getCommonOperationPolicyContent(policyId);
            commonPolicyContentPromise
                .then((commonPolicyResponse) => {
                    Utils.forceDownload(commonPolicyResponse);
                })
                .catch(() => {
                    const apiPolicyContentPromise = API.getOperationPolicyContent(policyId, api.id);
                    apiPolicyContentPromise
                        .then((apiPolicyResponse) => {
                            Utils.forceDownload(apiPolicyResponse);
                        })
                        .catch((error) => {
                            if (process.env.NODE_ENV !== 'production') {
                                console.log(error);
                                Alert.error(
                                    <FormattedMessage
                                        id='Policies.ViewPolicy.download.error'
                                        defaultMessage='Something went wrong while downloading the policy'
                                    />
                                );
                            }
                        });
                });
        }
    }

    const renderPolicyFileDetails = () => {
        if (!isViewMode && policyDefinitionFile && setPolicyDefinitionFile) {
            return (
                <UploadPolicyDropzone
                    policyDefinitionFile={policyDefinitionFile}
                    setPolicyDefinitionFile={setPolicyDefinitionFile}
                />
            );
        } else {
            return (
                <>
                    <Box display='flex' flexDirection='row' alignItems='center'>
                        <Typography color='inherit' variant='subtitle2' component='div'>
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.SourceDetails.download.policy'
                                defaultMessage='Policy File'
                            />
                            <sup className={classes.mandatoryStar}>*</sup>
                        </Typography>
                    </Box>
                    <Typography color='inherit' variant='caption' component='p'>
                        <FormattedMessage
                            id='Policies.PolicyCreateForm.UploadPolicyDropzone.description'
                            defaultMessage='Policy file contains the business logic of the policy'
                        />
                    </Typography>
                    <Box flex='1' display='flex' flexDirection='row' justifyContent='left' mt={3} mb={3}>
                        <Button
                            aria-label='download-policy'
                            variant='contained'
                            size='large'
                            color='primary'
                            onClick={handlePolicyDownload}
                            endIcon={<CloudDownloadIcon />}
                        >
                            <FormattedMessage
                                id='Policies.PolicyForm.SourceDetails.download.button'
                                defaultMessage='Download Policy'
                            />
                        </Button>
                    </Box>
                </>
            )
        }
    }

    return (
        <Box display='flex' flexDirection='row' mt={1}>
            <Box width='40%' pt={3} mb={2}>
                <Box width='90%'>
                    <Typography color='inherit' variant='subtitle2' component='div'>
                        <FormattedMessage
                            id='Policies.PolicyPolicyForm.add.policy.gateway.specific.details.title'
                            defaultMessage='Gateway Specific Details'
                        />
                    </Typography>
                    <Typography color='inherit' variant='caption' component='p'>
                        <FormattedMessage
                            id='Policies.PolicyPolicyForm.add.policy.gateway.specific.details.description'
                            defaultMessage={'Define the Gateway (s) that will be supporting this policy. '
                            + 'Based off of this selection, you can upload the relevant business '
                            + 'logic inclusive policy file.'}
                        />
                    </Typography>
                </Box>
            </Box>
            <Box width='60%'>
                <Box display='flex' flexDirection='row' alignItems='center'>
                    <Typography color='inherit' variant='body1' component='div'>
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyPolicyForm.field.supported.gateways'
                            defaultMessage='Supported Gateways'
                        />
                        <sup className={classes.mandatoryStar}>*</sup>
                    </Typography>
                    <Box flex='1'  display='flex' flexDirection='row-reverse' justifyContent='space-around'>
                        <FormControl
                            required
                            component='fieldset'
                            variant='standard'
                            margin='normal'
                            error={supportedGatewaysError}
                        >
                            <FormGroup className={classes.formGroup}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name='regularGateway'
                                            color='primary'
                                            checked={supportedGateways.includes(SUPPORTED_GATEWAYS.SYNAPSE)}
                                            onChange={handleChange}
                                        />
                                    }
                                    label='Regular Gateway'
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name='choreoConnect'
                                            color='primary'
                                            checked={supportedGateways.includes(SUPPORTED_GATEWAYS.CC)}
                                            onChange={handleChange}
                                            disabled
                                        />
                                    }
                                    label='Choreo Connect'
                                />
                            </FormGroup>
                            <FormHelperText>
                                {supportedGatewaysError ? 'Please select one or more Gateways' : ''}
                            </FormHelperText>
                        </FormControl>
                    </Box>
                </Box>
                {supportedGateways.includes(SUPPORTED_GATEWAYS.SYNAPSE) && (
                    renderPolicyFileDetails()
                )}
            </Box>
        </Box>
    )
}

export default SourceDetails;

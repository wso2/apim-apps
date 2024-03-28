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
import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import FormControl from '@mui/material/FormControl';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Button from '@mui/material/Button';
import Utils from 'AppData/Utils';
import API from 'AppData/api.js';
import { Alert } from 'AppComponents/Shared';
import CONSTS from 'AppData/Constants';
import { ACTIONS } from './PolicyCreateForm';
import UploadPolicyDropzone from './UploadPolicyDropzone';
import ApiContext from '../../components/ApiContext';
import { Link } from 'react-router-dom';

const PREFIX = 'SourceDetails';

const classes = {
    mandatoryStar: `${PREFIX}-mandatoryStar`,
    formGroup: `${PREFIX}-formGroup`
};

const StyledBox = styled(Box)(({ theme }: { theme: Theme }) => ({
    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },

    [`& .${classes.formGroup}`]: {
        display: 'flex',
        flexDirection: 'row',
    }
}));

interface SourceDetailsProps {
    supportedGateways: string[];
    synapsePolicyDefinitionFile?: any[];
    setSynapsePolicyDefinitionFile?: React.Dispatch<React.SetStateAction<any[]>>;
    ccPolicyDefinitionFile?: any[];
    setCcPolicyDefinitionFile?: React.Dispatch<React.SetStateAction<any[]>>;
    dispatch?: React.Dispatch<any>;
    isViewMode?: boolean;
    policyId?: string;
    isAPISpecific?: boolean;
}

/**
 * Renders the general details section.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} General details of the policy.
 */
const SourceDetails: FC<SourceDetailsProps> = ({
    supportedGateways,
    synapsePolicyDefinitionFile,
    setSynapsePolicyDefinitionFile,
    ccPolicyDefinitionFile,
    setCcPolicyDefinitionFile,
    dispatch,
    isViewMode,
    policyId,
    isAPISpecific,
}) => {

    const { api } = useContext<any>(ApiContext);

    // Validates whether atleast one gateway type (i.e. synapse, or CC ) is selected
    // True if none of the available gateways are selected.
    const supportedGatewaysError = supportedGateways.length === 0;

    /**
     * Function to handle supported gateways related checkbox changes
     * @param {React.ChangeEvent<HTMLInputElement>} event event
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_SUPPORTED_GATEWAYS,
                name:
                    event.target.name === 'regularGateway'
                        ? CONSTS.GATEWAY_TYPE.synapse
                        : CONSTS.GATEWAY_TYPE.choreoConnect,
                checked: event.target.checked,
            });
        }
    };

    /**
     * Hanlde policy download
     */
    const handlePolicyDownload = () => {
        if (policyId) {
            if (isAPISpecific) {
                const apiPolicyContentPromise = API.getOperationPolicyContent(
                    policyId,
                    api.id,
                );
                apiPolicyContentPromise
                    .then((apiPolicyResponse) => {
                        Utils.forceDownload(apiPolicyResponse);
                    })
                    .catch((error) => {
                        console.error(error);
                        Alert.error(
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.SourceDetails.apiSpecificPolicy.download.error'
                                defaultMessage='Something went wrong while downloading the policy'
                            />,
                        );
                    });
            } else {
                const commonPolicyContentPromise =
                    API.getCommonOperationPolicyContent(policyId);
                commonPolicyContentPromise
                    .then((commonPolicyResponse) => {
                        Utils.forceDownload(commonPolicyResponse);
                    })
                    .catch((error) => {
                        console.error(error);
                        Alert.error(
                            <FormattedMessage
                                id='Apis.Details.Policies.PolicyForm.SourceDetails.commonPolicy.download.error'
                                defaultMessage='Something went wrong while downloading the policy'
                            />,
                        );
                    });
            }
        }
    };

    /**
     * Renders the policy file upload related section
     * @param {any[]} policyFile Policy file
     * @param {React.Dispatch<React.SetStateAction<any[]>>} setPolicyFile Policy file setter
     * @param {string} gateway Gateway type
     * @returns {TSX} Policy upload section
     */
    const renderPolicyFileUpload = (
        policyFile: any[],
        setPolicyFile: React.Dispatch<React.SetStateAction<any[]>>,
    ) => {
        return (
            <UploadPolicyDropzone
                policyDefinitionFile={policyFile}
                setPolicyDefinitionFile={setPolicyFile}
            />
        );
    };

    /**
     *
     * @returns {TSX} Policy download section
     */
    const renderPolicyDownload = () => {
        return <>
            <StyledBox display='flex' flexDirection='row' alignItems='center'>
                <Typography
                    color='inherit'
                    variant='subtitle2'
                    component='div'
                >
                    <FormattedMessage
                        id='Apis.Details.Policies.PolicyForm.SourceDetails.form.policy.file.title'
                        defaultMessage='Policy File(s)'
                    />
                    <sup className={classes.mandatoryStar}>*</sup>
                </Typography>
            </StyledBox>
            <Typography color='inherit' variant='caption' component='p'>
                <FormattedMessage
                    id='Apis.Details.Policies.PolicyForm.SourceDetails.form.policy.file.description'
                    defaultMessage='Policy file contains the business logic of the policy'
                />
            </Typography>
            <Box
                flex='1'
                display='flex'
                flexDirection='row'
                justifyContent='left'
                mt={3}
                mb={3}
            >
                <Button
                    aria-label='download-policy'
                    variant='contained'
                    data-testid='download-policy-file'
                    size='large'
                    color='primary'
                    onClick={handlePolicyDownload}
                    endIcon={<CloudDownloadIcon />}
                >
                    <FormattedMessage
                        id='Apis.Details.Policies.PolicyForm.SourceDetails.form.policy.file.download'
                        defaultMessage='Download Policy'
                    />
                </Button>
            </Box>
        </>;
    }

    return (
        <Box display='flex' flexDirection='row' mt={1} data-testid='gateway-details-panel'>
            <Box width='40%' pt={3} mb={2}>
                <Box width='90%'>
                    <Typography
                        color='inherit'
                        variant='subtitle2'
                        component='div'
                    >
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.SourceDetails.title'
                            defaultMessage='Gateway Specific Details'
                        />
                    </Typography>
                    <Typography color='inherit' variant='caption' component='p'>
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.SourceDetails.description'
                            defaultMessage={
                                'Define the Gateway (s) that will be supporting this policy. ' +
                                'Based off of this selection, you can upload the relevant business ' +
                                'logic inclusive policy file.'
                            }
                        />
                    </Typography>
                </Box>
            </Box>
            <Box width='60%'>
                {/* Render dropzones for policy file uploads */}
                {supportedGateways.includes(CONSTS.GATEWAY_TYPE.synapse) &&
                    !isViewMode &&
                    synapsePolicyDefinitionFile &&
                    setSynapsePolicyDefinitionFile &&
                    renderPolicyFileUpload(
                        synapsePolicyDefinitionFile,
                        setSynapsePolicyDefinitionFile,
                    )}

                {/* Render policy file download option in view mode */}
                {isViewMode && renderPolicyDownload()}
            </Box>
        </Box>
    );
};

export default React.memo(SourceDetails);

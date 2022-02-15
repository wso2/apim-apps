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
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Button from '@material-ui/core/Button';
import { Alert } from 'AppComponents/Shared';
import API from 'AppData/api.js';
import Utils from 'AppData/Utils';
import ApiContext from '../components/ApiContext';
import type { PolicySpec } from './Types';
import PolicySpecificationEditor from './PolicySpecificationEditor';

const useStyles = makeStyles((theme: Theme) => ({
    downloadPolicyLabel: {
        marginTop: theme.spacing(1),
    },
    editorDiv: {
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5),
    },
}));

interface ViewAndDownloadPolicyProps {
    policySpec: PolicySpec;
    onDone: () => void; 
}

/**
 * Tab panel component to render content of a particular tab.
 * Renders the available policy list under the relevant flow related tab (i.e. request, response or fault).
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Tab panel.
 */
const ViewAndDownloadPolicy: FC<ViewAndDownloadPolicyProps> = ({ policySpec, onDone }) => {
    const classes = useStyles();
    const { api } = useContext<any>(ApiContext);

    const handlePolicyDownload = () => {
        if (policySpec.id) {
            const policyId = policySpec.id;
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

    return (
        <>
            <Box display='flex' flexDirection='column' p={2}>
                <Box display='flex' alignItems='center'>
                    <Button
                        aria-label='download-policy'
                        variant='contained'
                        size='large'
                        color='primary'
                        onClick={handlePolicyDownload}
                        endIcon={<CloudDownloadIcon />}
                    >
                        Download Policy
                    </Button>
                </Box>
                <Box display='flex' alignItems='center'>
                    <Typography
                        variant='body2'
                        display='block'
                        gutterBottom
                        color='textSecondary'
                        className={classes.downloadPolicyLabel}
                    >
                        <FormattedMessage
                            id='Policies.policy.ViewAndDownloadPolicy.button.descriptor.text'
                            defaultMessage='Policy Definition & Specification of {policyName} Policy'
                            values={{ policyName: policySpec.displayName }}
                        />
                    </Typography>
                </Box>
            </Box>
            <div className={classes.editorDiv}>
                <PolicySpecificationEditor
                    isReadOnly
                    policySpec={policySpec}
                />
            </div>
            <Box
                display='flex'
                flexDirection='row'
                alignItems='center'
                justifyContent='left'
                pl={2}
                pb={2}
            >
                <Button
                    variant='contained'
                    color='primary'
                    onClick={onDone}
                >
                    Done
                </Button>
            </Box>
        </>
    );
}

export default ViewAndDownloadPolicy;

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

import React, { useContext, useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Alert from 'AppComponents/Shared/Alert';
import { Progress } from 'AppComponents/Shared';
import API from 'AppData/api';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import type { Policy, PolicySpec } from './Types';
import PolicyViewForm from './PolicyForm/PolicyViewForm';

interface ViewPolicyProps {
    handleDialogClose: () => void;
    dialogOpen: boolean;
    policyObj: Policy;
    isLocalToAPI: boolean;
}

/**
 * Renders the UI to view a policy selected from the policy list.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy view UI.
 */
const ViewPolicy: React.FC<ViewPolicyProps> = ({
    handleDialogClose,
    dialogOpen,
    policyObj,
    isLocalToAPI,
}) => {
    const { api } = useContext<any>(ApiContext);
    const [policySpec, setPolicySpec] = useState<PolicySpec | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dialogOpen && isLocalToAPI) {
            setLoading(true);
            const promisedPolicyGet = API.getOperationPolicy(
                policyObj.id,
                api.id,
            );
            promisedPolicyGet
                .then((response) => {
                    setPolicySpec(response.body);
                })
                .catch((error) => {
                    console.error(error);
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while retrieving policy details');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (dialogOpen && !isLocalToAPI) {
            const promisedCommonPolicyGet = API.getCommonOperationPolicy(
                policyObj.id,
            );
            promisedCommonPolicyGet
                .then((response) => {
                    setPolicySpec(response.body);
                })
                .catch((error) => {
                    console.error(error);
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while retrieving policy details');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [dialogOpen]);

    const stopPropagation = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        e.stopPropagation();
    };

    const toggleOpen = () => {
        handleDialogClose();
    };

    if (loading) {
        return <Progress />;
    }

    if (!policySpec) {
        return <></>;
    }

    return (
        <>
            <Dialog
                maxWidth='md'
                open={dialogOpen}
                aria-labelledby='form-dialog-title'
                onClose={handleDialogClose}
                onClick={stopPropagation}
                fullWidth
            >
                <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    flexDirection='row'
                    px={3}
                    pt={3}
                >
                    <Box display='flex'>
                        <Typography variant='h4' component='h2'>
                            {policyObj.displayName}
                        </Typography>
                    </Box>
                    <Box display='flex'>
                        <IconButton
                            color='inherit'
                            onClick={toggleOpen}
                            aria-label='Close'
                        >
                            <Icon>close</Icon>
                        </IconButton>
                    </Box>
                </Box>
                <DialogContent>
                    <Box my={2}>
                        <DialogContentText>
                            <PolicyViewForm
                                policySpec={policySpec}
                                onDone={toggleOpen}
                            />
                        </DialogContentText>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ViewPolicy;

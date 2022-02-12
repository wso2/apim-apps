/* eslint-disable */
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

import React, { FC, useEffect, useContext, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Drawer, makeStyles, ListItemIcon, Theme, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { Settings, Close } from '@material-ui/icons';
import Divider from '@material-ui/core/Divider';
import API from 'AppData/api';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import { Alert } from 'AppComponents/Shared';
import General from './PolicyForm/General';
import { PolicySpec, ApiPolicy, AttachedPolicy } from './Types';
import ApiOperationContext, { useApiOperationContext } from "./ApiOperationContext";

const useStyles = makeStyles((theme: Theme) => ({
    drawerPaper: {
        backgroundColor: 'white',
        width: '60vh',
    },
    actionsBox: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1em',
    },
    iconSize: {
        height: '1.2em',
        width: '1.2em',
        color: theme.palette.grey[700],
    },
}));

interface PolicyConfiguringDrawerProps {
    policyObj: AttachedPolicy;
    drawerOpen: boolean;
    currentFlow: string;
    target: string;
    verb: string;
    handleDrawerClose: () => void;
}

/**
 * Renders the policy configuring drawer.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyConfiguringDrawer: FC<PolicyConfiguringDrawerProps> = ({
    policyObj, drawerOpen, currentFlow, target, verb, handleDrawerClose
}) => {
    const classes = useStyles();
    const { apiOperations } = useContext<any>(ApiOperationContext);
    const [policySpec, setPolcySpec] = useState<PolicySpec>();
    const [errorCount, setErrorCount] = useState<number>(0);
    const { api } = useContext<any>(ApiContext);
    const intl = useIntl();

    useEffect(() => {
        setErrorCount(0);
        const commonPolicyContentPromise = API.getCommonOperationPolicy(policyObj.id);
        commonPolicyContentPromise
            .then((commonPolicyResponse) => {
                // need to remove it when be is fixed
                const tmp = {...commonPolicyResponse.body};
                tmp.policyAttributes = [
                    {
                        name: 'fooheaderName',
                        displayName: 'Header Name',
                        description : 'Name of the header to be added',
                        validationRegex: '/^\S+$/',
                        type : 'String',
                        required: true
                   
                    }, 
                    {
                        name: 'fooheaderValue',
                        displayName: 'Header Value',
                        description : 'Value of the header to be added',
                        validationRegex: '/^\S+$/',
                        type : 'String',
                        required: true
                   
                    }, 
                ]
                setPolcySpec(tmp);
                // setPolcySpec(commonPolicyResponse.body);
            })
            .catch((error) => {
                if (errorCount === 1) {
                    console.log(error);
                    Alert.error(
                        intl.formatMessage({
                            id: 'Policies.ViewPolicy.edit.error',
                            defaultMessage: 'Something went wrong while getting the policy'
                        })
                    );
                }
                setErrorCount(errorCount + 1);
            });

        const apiPolicyContentPromise = API.getOperationPolicy(policyObj.id, api.id);
        apiPolicyContentPromise
            .then((apiPolicyResponse) => {
                // need to remove it when the BE is fixed
                const tmp = {...apiPolicyResponse.body};
                tmp.policyAttributes = [
                    {
                        name: 'fooheaderName',
                        displayName: 'Header Name',
                        description : 'Name of the header to be added',
                        validationRegex: '^([a-zA-Z_$][a-zA-Z\\d_$]*)$',
                        type : 'String',
                        required: true
                   
                    }, 
                    {
                        name: 'fooheaderValue',
                        displayName: 'Header Value',
                        description : 'Value of the header to be added',
                        validationRegex: '^([a-zA-Z_$][a-zA-Z\\d_$]*)$',
                        type : 'String',
                        required: true
                   
                    }, 
                ]
                setPolcySpec(tmp);
                // setPolcySpec(apiPolicyResponse.body);
            })
            .catch((error) => {
                if (errorCount === 1) {
                    console.log(error);
                    Alert.error(
                        intl.formatMessage({
                            id: 'Policies.ViewPolicy.edit.error',
                            defaultMessage: 'Something went wrong while getting the policy'
                        })
                    );
                }
                setErrorCount(errorCount + 1);
            });

    }, [policyObj]);

    if (!policySpec) {
        return <></>;
    }

    const operationInAction = apiOperations.find((op: any) =>
        op.target === target && op.verb.toLowerCase() === verb.toLowerCase());
    const operationFlowPolicy =
        operationInAction.operationPolicies[currentFlow].find((p: any) => p.policyId === policyObj.id);
    // const policy = 
    const apiPolicy: ApiPolicy = operationFlowPolicy || {
        policyName: policyObj.name,
        policyId: policyObj.id,
        parameters: {}
    };

    // Fill parameters from policySpec
    // policySpec.policyAttributes.forEach((attr) => {
    //     apiPolicy.parameters[attr.name] = null;
    // });

    // // Need to remove this
    // apiPolicy.parameters['fooHeaderName'] = '';
    // apiPolicy.parameters['fooheaderValue'] = '';

    return (
        <Drawer
            anchor='right'
            open={drawerOpen}
            onClose={handleDrawerClose} // Need to use handleDrawerClose only on onDrop. When in editing mode use handleDrawerCloseOnEditMode
            classes={{ paper: classes.drawerPaper }}
        >
            <Box role='presentation'>
                <List>
                    <ListItem key='policy-config'>
                        <ListItemIcon>
                            <Settings className={classes.iconSize} />
                        </ListItemIcon>
                        <ListItemText primary={(
                            <Typography variant='subtitle2'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.PolicyConfiguringDrawer.title'
                                    defaultMessage='Configure {policy} Policy'
                                    values={{ policy: policyObj.displayName }}
                                />
                            </Typography>
                        )}
                        />
                        <ListItemIcon>
                            <IconButton onClick={handleDrawerClose}>
                                <Close className={classes.iconSize} />
                            </IconButton>
                        </ListItemIcon>
                    </ListItem>
                </List>
                <Divider light />
                <General
                    policyObj={policyObj}
                    currentFlow={currentFlow}
                    target={target}
                    verb={verb}
                    policySpec={policySpec}
                    apiPolicy={apiPolicy}
                    handleDrawerClose={handleDrawerClose}
                />
            </Box>
        </Drawer>
    );
}

export default PolicyConfiguringDrawer;

/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
* 
* WSO2 LLC. licenses this file to you under the Apache License,
* Version 2.0 (the "License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
* 
* http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { FC } from 'react';
import { CircularProgress, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },
    cancelBtn: {
        marginLeft: theme.spacing(1),
    },
}));

interface PolicyCreateFormSharedProps {
    synapsePolicyDefinitionFile: any[];
    setSynapsePolicyDefinitionFile: React.Dispatch<React.SetStateAction<any[]>>;
    ccPolicyDefinitionFile: any[];
    setCcPolicyDefinitionFile: React.Dispatch<React.SetStateAction<any[]>>;
    onCancel: () => void;
    saving: boolean;
    state: any;
    dispatch: any;
    onPolicySave: () => void;
    isFormDisabled: boolean;
    PolicyAttributes: any;
    GeneralDetails: any;
    SourceDetails: any;
    isRestricted: any;
}

const PolicyCreateFormShared: FC<PolicyCreateFormSharedProps> = ({
    synapsePolicyDefinitionFile,
    setSynapsePolicyDefinitionFile,
    ccPolicyDefinitionFile,
    setCcPolicyDefinitionFile,
    onCancel,
    saving,
    state,
    dispatch,
    onPolicySave,
    isFormDisabled,
    PolicyAttributes,
    GeneralDetails,
    SourceDetails,
    isRestricted
}) => {
    const classes = useStyles();

    return (
        <Paper elevation={0} className={classes.root} data-testid='create-policy-form'>
            {/* General details of policy */}
            <GeneralDetails
                displayName={state.displayName}
                version={state.version}
                description={state.description}
                applicableFlows={state.applicableFlows}
                supportedApiTypes={state.supportedApiTypes}
                dispatch={dispatch}
                isViewMode={false}
            />
            <Divider light />
            {/* Gateway specific details of policy */}
            <SourceDetails
                supportedGateways={state.supportedGateways}
                synapsePolicyDefinitionFile={synapsePolicyDefinitionFile}
                setSynapsePolicyDefinitionFile={setSynapsePolicyDefinitionFile}
                ccPolicyDefinitionFile={ccPolicyDefinitionFile}
                setCcPolicyDefinitionFile={setCcPolicyDefinitionFile}
                dispatch={dispatch}
            />
            <Divider light />
            {/* Attributes of policy */}
            <PolicyAttributes
                policyAttributes={state.policyAttributes}
                dispatch={dispatch}
                isViewMode={false}
            />
            <Box data-testid='policy-add-btn-panel'>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={onPolicySave}
                    data-testid='policy-create-save-btn'
                    disabled={
                        isRestricted([
                            'apim:api_create',
                            'apim:api_manage',
                            'apim:mediation_policy_create',
                            'apim:mediation_policy_manage',
                            'apim:api_mediation_policy_manage',
                        ]) || isFormDisabled
                    }
                >
                    {saving ? (
                        <CircularProgress size={16} />
                    ) : (
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyForm.PolicyCreateForm.policy.save'
                            defaultMessage='Save'
                        />
                    )}
                </Button>
                <Button className={classes.cancelBtn} onClick={onCancel}>
                    <FormattedMessage
                        id='Apis.Details.Policies.PolicyForm.PolicyCreateForm.policy.cancel'
                        defaultMessage='Cancel'
                    />
                </Button>
            </Box>
        </Paper> 
    );
}

export default PolicyCreateFormShared;
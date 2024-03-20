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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { FC } from 'react';
import Box from '@mui/material/Box';
import CONSTS from 'AppData/Constants';
import { isRestricted } from 'AppData/AuthManager';
import Alert from '@mui/lab/Alert';
import { FormattedMessage } from 'react-intl';
import OperationPolicy from './OperationPolicy';
import OperationsGroup from './OperationsGroup';
import type { Policy, PolicySpec } from './Types';
import PoliciesExpansion from './PoliciesExpansion';

const PREFIX = 'PoliciesSection';

const classes = {
    gridItem: `${PREFIX}-gridItem`,
    alert: `${PREFIX}-alert`
};

const StyledBox = styled(Box)(() => ({
    [`& .${classes.gridItem}`]: {
        display: 'flex',
        width: '100%',
    },

    [`& .${classes.alert}`]: {
        backgroundColor: 'transparent',
        marginTop: '-25px',
        marginBottom: '-15px',
    }
}));

interface PolicySectionProps {
    openAPISpec: any;
    isChoreoConnectEnabled: boolean;
    isAPILevelTabSelected: boolean;
    allPolicies: PolicySpec[] | null;
    policyList: Policy[];
    api: any;
    expandedResource: string | null;
    setExpandedResource: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Renders the policy management page.
 * @returns {TSX} Policy management page to render.
 */
const PoliciesSection: FC<PolicySectionProps> = ({
    openAPISpec,
    isChoreoConnectEnabled,
    isAPILevelTabSelected,
    allPolicies,
    policyList,
    api,
    expandedResource,
    setExpandedResource,
}) => {

    const borderColor = '';

    return (
        <StyledBox>
            {isAPILevelTabSelected ? (
                <Box m={1} p={0.1} mt={1.5} sx={{ boxShadow: 0.5, bgcolor: borderColor, borderRadius: 1}}>
                    <Grid item xs={12}>
                        <Grid
                            container direction='column' justifyContent='flex-start'
                            spacing={1} alignItems='stretch'
                        >
                            <PoliciesExpansion
                                target={null}
                                verb='None'
                                allPolicies={allPolicies}
                                isChoreoConnectEnabled={isChoreoConnectEnabled}
                                policyList={policyList}
                                isAPILevelPolicy
                            />
                        </Grid>
                    </Grid>
                </Box>
            ) : (
                <Box m={1} p={0.1} mt={1.5} sx={{ boxShadow: 0.5, bgcolor: borderColor, borderRadius: 1 }}>
                    <Alert severity='info' className={classes.alert} >
                        <FormattedMessage
                            id='Apis.Details.Policies.PoliciesSection.info'
                            defaultMessage='API level policies will execute before operation level policies'
                        />
                        
                    </Alert>
                    {Object.entries(openAPISpec.paths).map(([target, verbObject]: [string, any]) => (
                        <Grid key={target} item xs={12}>
                            <OperationsGroup openAPI={openAPISpec} tag={target} >
                                <Grid
                                    container
                                    direction='column'
                                    justifyContent='flex-start'
                                    spacing={1}
                                    alignItems='stretch'
                                >
                                    {Object.entries(verbObject).map(([verb, operation]) => {
                                        return CONSTS.HTTP_METHODS.includes(verb) ? (
                                            <Grid key={`${target}/${verb}`} item className={classes.gridItem}>
                                                <OperationPolicy
                                                    target={target}
                                                    verb={verb}
                                                    highlight
                                                    operation={operation}
                                                    api={api}
                                                    disableUpdate={isRestricted(['apim:api_create'], api)}
                                                    expandedResource={expandedResource}
                                                    setExpandedResource={setExpandedResource}
                                                    policyList={policyList}
                                                    allPolicies={allPolicies}
                                                    isChoreoConnectEnabled={isChoreoConnectEnabled}
                                                />
                                            </Grid>
                                        ) : null;
                                    })}
                                </Grid>
                            </OperationsGroup>
                        </Grid>
                    ))}
                </Box>
            )}
        </StyledBox>
    );
};

export default PoliciesSection;

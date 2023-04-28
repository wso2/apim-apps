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

import {
    Grid, makeStyles, Typography,
} from '@material-ui/core';
import React, { FC } from 'react';
import Box from '@material-ui/core/Box';
import CONSTS from 'AppData/Constants';
import { isRestricted } from 'AppData/AuthManager';
import OperationPolicy from './OperationPolicy';
import OperationsGroup from './OperationsGroup';
import type {Policy, PolicySpec } from './Types';
import PoliciesExpansion from './PoliciesExpansion';

const useStyles = makeStyles((theme) => ({
    gridItem: {
        display: 'flex',
        width: '100%',
    },
    operationListingBox: {
        overflowY: 'scroll',
    },
    paper: {
        padding:'2px'
    },
    ccTypography: {
        paddingLeft:'10px', 
        marginTop:'20px'
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop:'20px'
    },
    tagClass: {
        maxWidth: 1000,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        [theme.breakpoints.down('md')]: {
            maxWidth: 800,
        },
    },
    flowTabs: {
        '& button': {
            minWidth: 50,
        },
    },
}));

interface PolicySectionProps {
    openAPISpec: any;
    isChoreoConnectEnabled: boolean;
    isAPILevelGranularitySelected: boolean;
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
    isAPILevelGranularitySelected,
    allPolicies,
    policyList,
    api,
    expandedResource,
    setExpandedResource,
}) => {
    const classes = useStyles();
    let borderColor = "";

    return (
        <Box>
            {isAPILevelGranularitySelected ? (
                <Box m={1} p={0.1} mt={1.5}
                    sx={{ boxShadow: 0.5, bgcolor: borderColor, borderRadius: 1 }}
                >

                    <Grid item xs={12}>
                        <Grid
                            container
                            direction="column"
                            justify="flex-start"
                            spacing={1}
                            alignItems="stretch"
                        >
                            <PoliciesExpansion
                                target={null}
                                verb={"None"}
                                allPolicies={allPolicies}
                                isChoreoConnectEnabled={isChoreoConnectEnabled}
                                policyList={policyList}
                                isAPILevelPolicy={true}
                            />
                        </Grid>
                    </Grid>
                </Box>
            ) : (
                <Box>
                    {Object.entries(openAPISpec.paths).map(
                        ([target, verbObject]: [string, any]) => (
                            <Grid key={target} item xs={12}>
                                <OperationsGroup openAPI={openAPISpec} tag={target}>
                                    <Grid
                                        container
                                        direction="column"
                                        justify="flex-start"
                                        spacing={1}
                                        alignItems="stretch"
                                    >
                                        {Object.entries(verbObject).map(([verb, operation]) => {
                                            return CONSTS.HTTP_METHODS.includes(verb) ? (
                                                <Grid
                                                    key={`${target}/${verb}`}
                                                    item className={classes.gridItem}
                                                >
                                                    <OperationPolicy
                                                        target={target}
                                                        verb={verb}
                                                        highlight
                                                        operation={operation}
                                                        api={api}
                                                        disableUpdate={isRestricted(["apim:api_create"], api)}
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
                        )
                    )}
                </Box>
            )}
        </Box>
    );
};



export default PoliciesSection;

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
import { styled } from '@mui/material/styles';
import { Grid, Theme, Typography } from '@mui/material';
import green from '@mui/material/colors/green';
import red from '@mui/material/colors/red';
import clsx from 'clsx';
import type { AttachedPolicy, Policy, PolicySpec } from './Types';
import { FormattedMessage } from 'react-intl';

const PREFIX = 'PolicyDropzoneShared';

const classes = {
    dropzoneDiv: `${PREFIX}-dropzoneDiv`,
    acceptDrop: `${PREFIX}-acceptDrop`,
    rejectDrop: `${PREFIX}-rejectDrop`,
    alignLeft: `${PREFIX}-alignLeft`,
    alignRight: `${PREFIX}-alignRight`,
    alignCenter: `${PREFIX}-alignCenter`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }: { theme: Theme }) => ({
    [`& .${classes.dropzoneDiv}`]: {
        border: '1px dashed',
        borderColor: theme.palette.primary.main,
        height: '8rem',
        padding: '0.8rem',
        width: '100%',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        textAlign: 'center',
        borderRadius: '0.3em',
        display: 'flex',
        alignItems: 'center',
        overflowX: 'scroll',
    },

    [`& .${classes.acceptDrop}`]: {
        backgroundColor: green[50],
        borderColor: 'green',
    },

    [`& .${classes.rejectDrop}`]: {
        backgroundColor: red[50],
        borderColor: 'red',
    },

    [`& .${classes.alignLeft}`]: {
        justifyContent: 'left',
    },

    [`& .${classes.alignRight}`]: {
        justifyContent: 'right',
    },

    [`& .${classes.alignCenter}`]: {
        justifyContent: 'center',
    }
}));

interface PolicyDropzoneSharedBaseProps {
    policyDisplayStartDirection: string;
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<AttachedPolicy[]>>;
    currentFlow: string;
    target: string;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
    drop: any;
    canDrop: any;
    droppedPolicy: Policy | null;
    setDroppedPolicy: any;
    AttachedPolicyList: any;
    PolicyConfiguringDrawer: any;
}

// Option 1: `listOriginatedFromCommonPolicies` and `isApiRevision` are provided
interface PolicyDropzoneWithCommonProps extends PolicyDropzoneSharedBaseProps {
    listOriginatedFromCommonPolicies: string[];
    isApiRevision: boolean;
}

// Option 2: Neither `listOriginatedFromCommonPolicies` nor `isApiRevision` are provided
interface PolicyDropzoneWithoutCommonProps extends PolicyDropzoneSharedBaseProps {
    listOriginatedFromCommonPolicies?: undefined;
    isApiRevision?: undefined;
}

// Combine the two using a union type
type PolicyDropzoneSharedProps = PolicyDropzoneWithCommonProps | PolicyDropzoneWithoutCommonProps;

const PolicyDropzoneShared: FC<PolicyDropzoneSharedProps> = (props) => {
    if ('listOriginatedFromCommonPolicies' in props) {
        // Props were passed, use `listOriginatedFromCommonPolicies` and `isApiRevision`
        return (
            (<Root>
                <Grid container>
                    <div
                        ref={props.drop}
                        className={clsx({
                            [classes.dropzoneDiv]: true,
                            [classes.acceptDrop]: props.canDrop,
                            [classes.alignCenter]: props.currentPolicyList.length === 0,
                            [classes.alignLeft]:
                                props.currentPolicyList.length !== 0 &&
                                props.policyDisplayStartDirection === 'left',
                            [classes.alignRight]:
                                props.currentPolicyList.length !== 0 &&
                                props.policyDisplayStartDirection === 'right',
                        })}
                    >
                        {props.currentPolicyList.length === 0 ? (
                            <Typography>
                                <FormattedMessage
                                    id='App.Components.Policies.Drop.Zone.text.label'
                                    defaultMessage='Drag and drop policies here'
                                />
                            </Typography>
                        ) : (
                            <props.AttachedPolicyList
                                currentPolicyList={props.currentPolicyList}
                                setCurrentPolicyList={props.setCurrentPolicyList}
                                policyDisplayStartDirection={
                                    props.policyDisplayStartDirection
                                }
                                currentFlow={props.currentFlow}
                                target={props.target}
                                verb={props.verb}
                                allPolicies={props.allPolicies}
                                isAPILevelPolicy={props.isAPILevelPolicy}
                                listOriginatedFromCommonPolicies={props.listOriginatedFromCommonPolicies}
                                isApiRevision={props.isApiRevision}
                            />
                        )}
                    </div>
                </Grid>
                {props.droppedPolicy && (
                    <props.PolicyConfiguringDrawer
                        policyObj={props.droppedPolicy}
                        setDroppedPolicy={props.setDroppedPolicy}
                        currentFlow={props.currentFlow}
                        target={props.target}
                        verb={props.verb}
                        allPolicies={props.allPolicies}
                        isAPILevelPolicy={props.isAPILevelPolicy}
                    />
                )}
            </Root>)
        );
    } else {
        return (
            (<Root>
                <Grid container>
                    <div
                        ref={props.drop}
                        className={clsx({
                            [classes.dropzoneDiv]: true,
                            [classes.acceptDrop]: props.canDrop,
                            [classes.alignCenter]: props.currentPolicyList.length === 0,
                            [classes.alignLeft]:
                                props.currentPolicyList.length !== 0 &&
                                props.policyDisplayStartDirection === 'left',
                            [classes.alignRight]:
                                props.currentPolicyList.length !== 0 &&
                                props.policyDisplayStartDirection === 'right',
                        })}
                    >
                        {props.currentPolicyList.length === 0 ? (
                            <Typography>
                                <FormattedMessage
                                    id='App.Components.Policies.Drop.Zone.text.label'
                                    defaultMessage='Drag and drop policies here'
                                />
                            </Typography>
                        ) : (
                            <props.AttachedPolicyList
                                currentPolicyList={props.currentPolicyList}
                                setCurrentPolicyList={props.setCurrentPolicyList}
                                policyDisplayStartDirection={
                                    props.policyDisplayStartDirection
                                }
                                currentFlow={props.currentFlow}
                                target={props.target}
                                verb={props.verb}
                                allPolicies={props.allPolicies}
                                isAPILevelPolicy={props.isAPILevelPolicy}
                            />
                        )}
                    </div>
                </Grid>
                {props.droppedPolicy && (
                    <props.PolicyConfiguringDrawer
                        policyObj={props.droppedPolicy}
                        setDroppedPolicy={props.setDroppedPolicy}
                        currentFlow={props.currentFlow}
                        target={props.target}
                        verb={props.verb}
                        allPolicies={props.allPolicies}
                        isAPILevelPolicy={props.isAPILevelPolicy}
                    />
                )}
            </Root>)
        );
    }
}

export default PolicyDropzoneShared;

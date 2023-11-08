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
import { Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import clsx from 'clsx';
import type { AttachedPolicy, Policy, PolicySpec } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
    dropzoneDiv: {
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
    acceptDrop: {
        backgroundColor: green[50],
        borderColor: 'green',
    },
    rejectDrop: {
        backgroundColor: red[50],
        borderColor: 'red',
    },
    alignLeft: {
        justifyContent: 'left',
    },
    alignRight: {
        justifyContent: 'right',
    },
    alignCenter: {
        justifyContent: 'center',
    },
}));

interface PolicyDropzoneSharedProps {
    policyDisplayStartDirection: string;
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<
        React.SetStateAction<AttachedPolicy[]>
    >;
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

const PolicyDropzoneShared: FC<PolicyDropzoneSharedProps> = ({
    policyDisplayStartDirection,
    currentPolicyList,
    setCurrentPolicyList,
    currentFlow,
    target,
    verb,
    allPolicies,
    isAPILevelPolicy,
    drop,
    canDrop,
    droppedPolicy,
    setDroppedPolicy,
    AttachedPolicyList,
    PolicyConfiguringDrawer
}) => {
    const classes = useStyles();
    return (
        <>
            <Grid container>
                <div
                    ref={drop}
                    className={clsx({
                        [classes.dropzoneDiv]: true,
                        [classes.acceptDrop]: canDrop,
                        [classes.alignCenter]: currentPolicyList.length === 0,
                        [classes.alignLeft]:
                            currentPolicyList.length !== 0 &&
                            policyDisplayStartDirection === 'left',
                        [classes.alignRight]:
                            currentPolicyList.length !== 0 &&
                            policyDisplayStartDirection === 'right',
                    })}
                >
                    {currentPolicyList.length === 0 ? (
                        <Typography>Drag and drop policies here</Typography>
                    ) : (
                        <AttachedPolicyList
                            currentPolicyList={currentPolicyList}
                            setCurrentPolicyList={setCurrentPolicyList}
                            policyDisplayStartDirection={
                                policyDisplayStartDirection
                            }
                            currentFlow={currentFlow}
                            target={target}
                            verb={verb}
                            allPolicies={allPolicies}
                            isAPILevelPolicy={isAPILevelPolicy}
                        />
                    )}
                </div>
            </Grid>
            {droppedPolicy && (
                <PolicyConfiguringDrawer
                    policyObj={droppedPolicy}
                    setDroppedPolicy={setDroppedPolicy}
                    currentFlow={currentFlow}
                    target={target}
                    verb={verb}
                    allPolicies={allPolicies}
                    isAPILevelPolicy={isAPILevelPolicy}
                />
            )}
        </>
    );
}

export default PolicyDropzoneShared;

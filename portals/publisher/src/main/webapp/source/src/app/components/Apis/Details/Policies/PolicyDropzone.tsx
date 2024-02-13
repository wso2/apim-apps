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

import React, { FC, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Typography , Theme } from '@mui/material';
import { useDrop } from 'react-dnd';
import clsx from 'clsx';
import { green, red } from '@mui/material/colors';
import type { AttachedPolicy, Policy, PolicySpec } from './Types';
import AttachedPolicyList from './AttachedPolicyList';
import PolicyConfiguringDrawer from './PolicyConfiguringDrawer';


const PREFIX = 'PolicyDropzone';

const classes = {
    dropzoneDiv: `${PREFIX}-dropzoneDiv`,
    acceptDrop: `${PREFIX}-acceptDrop`,
    rejectDrop: `${PREFIX}-rejectDrop`,
    alignLeft: `${PREFIX}-alignLeft`,
    alignRight: `${PREFIX}-alignRight`,
    alignCenter: `${PREFIX}-alignCenter`
};


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

interface PolicyDropzoneProps {
    policyDisplayStartDirection: string;
    currentPolicyList: AttachedPolicy[];
    setCurrentPolicyList: React.Dispatch<
        React.SetStateAction<AttachedPolicy[]>
    >;
    droppablePolicyList: string[];
    currentFlow: string;
    target: string;
    verb: string;
    allPolicies: PolicySpec[] | null;
    isAPILevelPolicy: boolean;
}

/**
 * Renders the dropzone which accepts policy cards that are dragged and dropped.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of policies local to the API segment.
 */
const PolicyDropzone: FC<PolicyDropzoneProps> = ({
    policyDisplayStartDirection,
    currentPolicyList,
    setCurrentPolicyList,
    droppablePolicyList,
    currentFlow,
    target,
    verb,
    allPolicies,
    isAPILevelPolicy,
}) => {

    const [droppedPolicy, setDroppedPolicy] = useState<Policy | null>(null);

    const [{ canDrop }, drop] = useDrop({
        accept: droppablePolicyList,
        drop: (item: any) => setDroppedPolicy(item.droppedPolicy),
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        (<Root>
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
        </Root>)
    );
};

export default PolicyDropzone;

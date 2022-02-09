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

import React, { FC } from 'react';
import { Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import { useDrop } from 'react-dnd'
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Box from '@material-ui/core/Box';
import classNames from 'classnames';
import type { Policy } from './Types';
import AttachedPolicyList from './AttachedPolicyList';

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
        justifyContent: 'right'
    },
    alignCenter: {
        justifyContent: 'center',
    },
    arrowColor: {
        backgroundColor: 'black',
    },
    iconSize: {
        fontSize: '3em',
    }
}));

interface PolicyDropzoneProps {
    policyDisplayStartDirection: string;
    currentPolicyList: Policy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<Policy[]>>;
    droppablePolicyList: string[];
    currentFlow: string;
}

/**
 * Renders the dropzone which accepts policy cards that are dragged and dropped.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of policies local to the API segment.
 */
const PolicyDropzone: FC<PolicyDropzoneProps> = ({
    policyDisplayStartDirection, currentPolicyList, setCurrentPolicyList, droppablePolicyList, currentFlow
}) => {
    const classes = useStyles();

    const addDroppedPolicyToList = (policy: Policy) => {
        setCurrentPolicyList(prevPolicyList => [...prevPolicyList, {
            id: policy.id,
            name: policy.name,
            displayName: policy.displayName,
            applicableFlows: policy.applicableFlows,
            timestamp: Date.now(),
        }]);
    }

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: droppablePolicyList,
        drop: (item: any) => addDroppedPolicyToList(item.droppedPolicy),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }))

    const isActive = canDrop && isOver;
    
    return (
        <>
            {policyDisplayStartDirection === 'left'
                ?  (
                    <Box display='flex' flexDirection='row' alignItems='center' pl={2}>
                        <Box width='90%' mb={0.5} height={5} className={classes.arrowColor} />
                        <Box width='10%'>
                            <ArrowForwardIosIcon className={classes.iconSize} />
                        </Box>
                    </Box>
                ) : (
                    <Box display='flex' flexDirection='row' alignItems='center' pr={2} pl={3}>
                        <Box width='5%'>
                            <ArrowBackIosIcon className={classes.iconSize} />
                        </Box>
                        <Box width='90%' mb={0.5} height={5} className={classes.arrowColor} />
                    </Box>
                )
            }
            <Grid container>
                <div ref={drop} className={classNames({
                    [classes.dropzoneDiv]: true,
                    [classes.acceptDrop]: isActive,
                    [classes.alignCenter]: currentPolicyList.length === 0,
                    [classes.alignLeft]: currentPolicyList.length !== 0 && policyDisplayStartDirection === 'left',
                    [classes.alignRight]: currentPolicyList.length !== 0 && policyDisplayStartDirection === 'right',
                })}>
                    {currentPolicyList.length === 0
                        ? <Typography>Drag and drop policies here</Typography>
                        : (
                            <AttachedPolicyList
                                currentPolicyList={currentPolicyList}
                                setCurrentPolicyList={setCurrentPolicyList}
                                policyDisplayStartDirection={policyDisplayStartDirection}
                                currentFlow={currentFlow}
                            />
                        )
                    }
                </div>
            </Grid>
        </>
    );
}

export default PolicyDropzone;

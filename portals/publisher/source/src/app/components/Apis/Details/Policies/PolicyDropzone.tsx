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
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useDrop } from 'react-dnd'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import classNames from 'classnames';
import update from 'immutability-helper';
import AttachedPolicyCard from './AttachedPolicyCard';

const useStyles = makeStyles((theme: any) => ({
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
    }
}));

interface Policy {
    id: number;
    name: string;
    flows: string[];
}

interface PolicyDropzoneProps {
    policyDisplayStartDirection: string;
    currentPolicyList: Policy[];
    setCurrentPolicyList: React.Dispatch<React.SetStateAction<Policy[]>>;
    droppablePolicyList: string[];
}

/**
 * Renders the dropzone which can.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of policies local to the API segment.
 */
const PolicyDropzone: FC<PolicyDropzoneProps> = ({
    policyDisplayStartDirection, currentPolicyList, setCurrentPolicyList, droppablePolicyList
}) => {
    const classes = useStyles();

    const addDroppedPolicyToList = (policy: Policy) => {
        setCurrentPolicyList(currentPolicyList => [...currentPolicyList, policy]);
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

    const sortPolicyList = (dragIndex: number, hoverIndex: number) => {
        const dragCard = currentPolicyList[dragIndex]
        setCurrentPolicyList(
            update(currentPolicyList, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragCard],
                ],
            }),
        )
    }

    const renderAttachedPolicyList = () => {
        const reversedPolicyList = [...currentPolicyList].reverse()
        return (
            policyDisplayStartDirection === 'left'  
                ? currentPolicyList.map((policy: Policy) => (
                    <AttachedPolicyCard
                        policyObj={policy}
                        sortPolicyList={sortPolicyList}
                    />
                ))
                : reversedPolicyList.map((policy: Policy) => (
                    <AttachedPolicyCard
                        policyObj={policy}
                        sortPolicyList={sortPolicyList}
                    />
                ))
        )
    }
    
    return (
        <Grid container>
            {policyDisplayStartDirection === 'left'
                ? <ArrowForwardIcon/>
                : <ArrowBackIcon/>
            }
            <div ref={drop} className={classNames(
                classes.dropzoneDiv,
                isActive ? classes.acceptDrop : null,
                // eslint-disable-next-line no-nested-ternary
                currentPolicyList.length !== 0 && policyDisplayStartDirection === 'left'
                    ? classes.alignLeft 
                    : currentPolicyList.length !== 0 && policyDisplayStartDirection === 'right'
                        ? classes.alignRight
                        : classes.alignCenter
            )}>
                {currentPolicyList.length === 0
                    ? <Typography>Drag and drop policies here</Typography>
                    : renderAttachedPolicyList()
                }
            </div>
        </Grid>
    );
}

export default PolicyDropzone;

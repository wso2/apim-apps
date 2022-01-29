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

import React, { useState, useEffect, FC } from 'react';
import { Box, Grid, Icon, makeStyles, Typography } from '@material-ui/core';
import { useDrop } from 'react-dnd'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import classNames from 'classnames';
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
        justifyContent: 'center',
    },
    acceptDrop: {
        backgroundColor: green[50],
        borderColor: 'green',
    },
    rejectDrop: {
        backgroundColor: red[50],
        borderColor: 'red',
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
}

/**
 * Renders the dropzone which can.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of policies local to the API segment.
 */
const PolicyDropzone: FC<PolicyDropzoneProps> = ({
    policyDisplayStartDirection, currentPolicyList
}) => {
    const classes = useStyles();
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'policyCard',
        drop: () => ({ name: 'Dropzone' }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }))

    const isActive = canDrop && isOver
    // let backgroundColor = '#222'
    // if (isActive) {
    //     backgroundColor = 'darkgreen'
    // } else if (canDrop) {
    //     backgroundColor = 'darkkhaki'
    // }
    
    return (
        <Grid container>
            {policyDisplayStartDirection === 'left'
                ? <ArrowForwardIcon/>
                : <ArrowBackIcon/>
            }
            <div ref={drop} role='Dropzone' className={classNames(
                classes.dropzoneDiv,
                isActive ? classes.acceptDrop : null,
                canDrop ? null: null,
            )}>
                {currentPolicyList.length === 0
                    ? <Typography>Drag and drop policies here</Typography>
                    : currentPolicyList.map((policy: Policy) => (
                        <AttachedPolicyCard policyObj={policy} />
                    ))
                }
                {/* {!isActive 
                    ? <Typography>Drag and drop policies here</Typography>
                    : (
                        <AttachedPolicyCard policyObj={tempPolicy}/>
                    )} */}
            </div>
        </Grid>
    );
}

export default PolicyDropzone;

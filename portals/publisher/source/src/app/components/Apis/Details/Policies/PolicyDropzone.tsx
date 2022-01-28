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
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useDrop } from 'react-dnd'

const useStyles = makeStyles((theme: any) => ({
    dropzoneDiv: {
        border: '1px dashed',
        borderColor: theme.palette.primary.main,
        height: '6rem',
        padding: '2rem',
        width: '100%',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        textAlign: 'center',
        borderRadius: '0.3em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

interface PolicyDropzoneProps {
    policyDisplayStartDirection: string;
}

/**
 * Renders the dropzone which can.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} List of policies local to the API segment.
 */
const PolicyDropzone: FC<PolicyDropzoneProps> = ({
    policyDisplayStartDirection
}) => {
    const classes = useStyles();
    const [{ isActive }, drop] = useDrop(() => ({
        accept: 'policy',
        collect: (monitor) => ({
            isActive: monitor.canDrop() && monitor.isOver(),
        }),
    }))

    return (
        <Grid container>
            <div ref={drop} className={classes.dropzoneDiv}>
                {!isActive 
                    ? <Typography>Drag and drop policies here</Typography>
                    : ''}
            </div>
        </Grid>
    );
}

export default PolicyDropzone;

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
import { makeStyles } from '@material-ui/core';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(() => ({
    arrowColor: {
        backgroundColor: 'black',
        opacity: 0.4,
    },
    iconSize: {
        fontSize: '2em',
        color: 'black',
        opacity: 0.4,
    }
}));

interface FlowArrowSharedProps {
    arrowDirection: string;
}

const FlowArrowShared: FC<FlowArrowSharedProps> = ({ arrowDirection }) => {
    const classes = useStyles();

    return (
        <>
            {arrowDirection === 'left'
                ?  (
                    <Box display='flex' flexDirection='row' alignItems='center' pl={2} pt={1}>
                        <Box width='90%' mb={0.5} height={4} className={classes.arrowColor} />
                        <Box width='10%'>
                            <ArrowForwardIosIcon className={classes.iconSize} />
                        </Box>
                    </Box>
                ) : (
                    <Box display='flex' flexDirection='row' alignItems='center' pr={2} pl={3} pt={1}>
                        <Box width='5%'>
                            <ArrowBackIosIcon className={classes.iconSize} />
                        </Box>
                        <Box width='90%' mb={0.5} height={4} className={classes.arrowColor} />
                    </Box>
                )
            }
        </>
    );
}

export default FlowArrowShared;